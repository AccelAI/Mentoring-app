/* eslint-disable @typescript-eslint/no-var-requires */
const { onRequest } = require('firebase-functions/v2/https');
const crypto = require('crypto');
const admin = require('firebase-admin');

try {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
} catch (e) {
  // already initialized or running in environment with default credentials
}

const db = admin.firestore();

// Helper: verify Slack signature (req.rawBody required)
function verifySlackSignature(req, rawBody) {
  const ts = req.headers['x-slack-request-timestamp'];
  const sig = req.headers['x-slack-signature'];
  const secret = process.env.SLACK_SIGNING_SECRET;
  if (!ts || !sig || !secret) return false;
  const fiveMinutes = 60 * 5;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(ts)) > fiveMinutes) return false;
  const base = `v0:${ts}:${rawBody}`;
  const hmac = crypto.createHmac('sha256', secret).update(base).digest('hex');
  const expected = `v0=${hmac}`;
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  } catch {
    return false;
  }
}

// Find appConversationId by slackChannelId in Firestore (assumes slackChannelId stored on chat-rooms docs)
async function findAppConversationIdBySlackChannel(channelId) {
  try {
    const q = await db.collection('chat-rooms').where('slackChannelId', '==', channelId).limit(1).get();
    if (!q.empty) return q.docs[0].id;
  } catch (e) {
    console.warn('[slack] inverse lookup failed', e.message);
  }
  return null;
}

// Post message to Slack using bot token (uses global fetch available on Node 18+)
async function postMessageToSlack(channel, text) {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) throw new Error('Missing SLACK_BOT_TOKEN');
  const res = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ channel, text })
  });
  const data = await res.json();
  if (!data.ok) {
    const err = new Error('Slack API error');
    err.data = data;
    throw err;
  }
  return data;
}

// Slack Events function (for Event Subscriptions)
const slackEvents = onRequest({ timeoutSeconds: 30, memory: '256MiB' }, async (req, res) => {
  // Try rawBody first, fall back to parsed req.body if available
  const rawBody = req.rawBody ? req.rawBody.toString('utf8') : (Buffer.isBuffer(req.body) ? req.body.toString('utf8') : null);

  let payload = null;
  if (rawBody) {
    try {
      payload = JSON.parse(rawBody);
    } catch (err) {
      console.warn('[slack] rawBody JSON parse failed, will try req.body', err.message);
    }
  }

  // fallback to parsed body (some proxies/platforms pre-parse JSON)
  if (!payload && req.body && typeof req.body === 'object') {
    payload = req.body;
  }

  if (!payload) {
    console.warn('[slack] No payload found (rawBody and req.body empty)');
    return res.status(400).json({ error: 'challenge_failed' });
  }

  // Handle URL verification first: always return the challenge as plain text
  if (payload.type === 'url_verification') {
    const challenge = payload.challenge || (payload?.body && payload.body.challenge) || null;
    if (!challenge) {
      console.warn('[slack] url_verification payload missing challenge', payload);
      return res.status(400).json({ error: 'challenge_failed' });
    }
    console.log('[slack] url_verification success, returning challenge');
    return res.status(200).type('text/plain').send(challenge);
  }

  if (!process.env.SLACK_SIGNING_SECRET) {
    console.error('[slack] SLACK_SIGNING_SECRET not configured');
    return res.status(500).send('Signing secret not configured');
  }

  const rawForSig = rawBody || JSON.stringify(payload);
  if (!verifySlackSignature(req, rawForSig)) {
    console.warn('[slack] Signature verification failed');
    return res.status(401).send('Invalid signature');
  }

  // Ack immediately
  res.sendStatus(200);

  // Process asynchronously
  try {
    const { event } = payload || {};
    if (!event) return;
    if (event.bot_id || event.subtype) return;
    if (event.type !== 'message') return;

    const channelId = event.channel;
    const text = event.text || '';
    const ts = event.ts;

    // Resolve appConversationId via Firestore inverse lookup
    const appConversationId = await findAppConversationIdBySlackChannel(channelId);
    if (!appConversationId) {
      console.warn('[slack] No mapping found for channel', channelId);
      return;
    }

    // Persist Slack message to Firestore (optional)
    try {
      const messagesCol = db.collection('chat-rooms').doc(appConversationId).collection('messages');
      await messagesCol.add({
        senderId: `slack:${event.user}`,
        text,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        read: false,
        source: 'slack'
      });
      await db.collection('chat-rooms').doc(appConversationId).set({
        lastMessage: text,
        lastMessageTime: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn('[slack] persist message failed', e.message);
    }

    console.log('[slack] inbound message forwarded', { appConversationId, channelId, user: event.user, ts });
  } catch (e) {
    console.warn('[slack] Event processing error', e.message || e);
  }
});

// App -> Slack bridge: create/find channel and post message
const slackBridgeMessages = onRequest({ timeoutSeconds: 30, memory: '256MiB' }, async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { appConversationId, text, userId } = req.body || {};
  if (!appConversationId || !text) return res.status(400).json({ error: 'Missing appConversationId or text' });

  try {
    // Try to find existing mapping document first
    let slackChannelId = null;
    try {
      const doc = await db.collection('chat-rooms').doc(appConversationId).get();
      if (doc.exists) slackChannelId = doc.data().slackChannelId || null;
    } catch (e) {
      console.warn('[slack] Firestore read failed', e.message);
    }

    // Create a private channel if none found
    if (!slackChannelId) {
      // Create channel via Slack API
      // Note: to create a private channel you need the proper scopes (conversations.create or groups:write depending)
      const name = `conv-${appConversationId}`.slice(0, 60);
      // Use Slack API to create a private channel (conversations.create with is_private: true)
      const token = process.env.SLACK_BOT_TOKEN;
      if (!token) return res.status(500).json({ error: 'Missing SLACK_BOT_TOKEN' });
      const createRes = await fetch('https://slack.com/api/conversations.create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, is_private: true })
      });
      const createData = await createRes.json();
      if (!createData.ok) {
        const details = createData;
        console.error('[slack] create channel failed', details);
        if (details.error === 'missing_scope') {
          return res.status(403).json({ error: 'missing_scope', details });
        }
        return res.status(500).json({ error: 'create_failed', details });
      }
      slackChannelId = createData.channel.id;
      // Persist mapping in Firestore
      await db.collection('chat-rooms').doc(appConversationId).set({
        slackChannelId,
        slackLinkedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      // Also keep a lightweight mapping doc
      await db.collection('slack-conversations').doc(appConversationId).set({
        slackChannelId,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    }

    // Post message
    await postMessageToSlack(slackChannelId, text);

    // Persist message
    try {
      const messagesCol = db.collection('chat-rooms').doc(appConversationId).collection('messages');
      await messagesCol.add({
        senderId: `app:${userId || 'unknown'}`,
        text,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        read: false,
        source: 'app'
      });
      await db.collection('chat-rooms').doc(appConversationId).set({
        lastMessage: text,
        lastMessageTime: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn('[slack] persist outgoing message failed', e.message);
    }

    return res.json({ ok: true, slackChannelId });
  } catch (err) {
    const details = err?.data || err;
    console.error('[slackBridge] Error posting message', details);
    if (details?.error === 'missing_scope') {
      return res.status(403).json({ error: 'missing_scope', details });
    }
    return res.status(500).json({ error: err.message || 'internal', slackError: details || null });
  }
});

module.exports = { slackEvents, slackBridgeMessages };
