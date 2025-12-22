
const { onRequest } = require('firebase-functions/v2/https')
const crypto = require('crypto')
const admin = require('firebase-admin')

try {
  if (!admin.apps.length) {
    admin.initializeApp()
  }
} catch (e) {
  // already initialized or running in environment with default credentials
}

const db = admin.firestore()

async function getSlackUserIdForAppUser (appUserId) {
  if (!appUserId) return null
  try {
    const snap = await db.collection('users').doc(appUserId).get()
    if (!snap.exists) return null
    const data = snap.data() || {}
    return data?.slack?.userId || null
  } catch (e) {
    console.warn('[slack] getSlackUserIdForAppUser failed', e.message)
    return null
  }
}

async function putReverseChannelMapping (slackChannelId, mapping) {
  if (!slackChannelId) return
  try {
    await db.collection('slack-channel-map').doc(slackChannelId).set({
      ...mapping,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true })
  } catch (e) {
    console.warn('[slack] putReverseChannelMapping failed', e.message)
  }
}

async function findMappingBySlackChannelId (channelId) {
  if (!channelId) return null
  // Fast path: reverse-map collection
  try {
    const snap = await db.collection('slack-channel-map').doc(channelId).get()
    if (snap.exists) return snap.data()
  } catch (e) {
    console.warn('[slack] reverse map lookup failed', e.message)
  }
  // Backward-compatible fallback: look up chat-room by slackChannelId
  const appConversationId = await findAppConversationIdBySlackChannel(channelId)
  if (!appConversationId) return null
  return { appConversationId, type: 'channel', slackChannelId: channelId }
}

// Helper: verify Slack signature (req.rawBody required)
function verifySlackSignature (req, rawBody) {
  const ts = req.headers['x-slack-request-timestamp']
  const sig = req.headers['x-slack-signature']
  const secret = process.env.SLACK_SIGNING_SECRET
  if (!ts || !sig || !secret) return false
  const fiveMinutes = 60 * 5
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - Number(ts)) > fiveMinutes) return false
  const base = `v0:${ts}:${rawBody}`
  const hmac = crypto.createHmac('sha256', secret).update(base).digest('hex')
  const expected = `v0=${hmac}`
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
  } catch {
    return false
  }
}

// Find appConversationId by slackChannelId in Firestore (assumes slackChannelId stored on chat-rooms docs)
async function findAppConversationIdBySlackChannel (channelId) {
  try {
    const q = await db.collection('chat-rooms').where('slackChannelId', '==', channelId).limit(1).get()
    if (!q.empty) return q.docs[0].id
  } catch (e) {
    console.warn('[slack] inverse lookup failed', e.message)
  }
  return null
}

// Post message to Slack using bot token (uses global fetch available on Node 18+)
async function postMessageToSlack (channel, text) {
  const token = process.env.SLACK_BOT_TOKEN
  if (!token) throw new Error('Missing SLACK_BOT_TOKEN')
  const res = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ channel, text })
  })
  const data = await res.json()
  if (!data.ok) {
    const err = new Error('Slack API error')
    err.data = data
    throw err
  }
  return data
}

// Helper: persist message to Firestore (avoids code duplication)
async function persistMessageToRoom (appConversationId, text, senderId, source) {
  try {
    const messagesCol = db.collection('chat-rooms').doc(appConversationId).collection('messages')
    await messagesCol.add({
      senderId,
      text,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
      source
    })
    await db.collection('chat-rooms').doc(appConversationId).set({
      lastMessage: text,
      lastMessageTime: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true })
  } catch (e) {
    console.warn('[slack] persist message failed', e.message)
  }
}

// Slack Events function (for Event Subscriptions)
const slackEvents = onRequest({ timeoutSeconds: 30, memory: '256MiB' }, async (req, res) => {
  // Try rawBody first, fall back to parsed req.body if available
  const rawBody = req.rawBody ? req.rawBody.toString('utf8') : (Buffer.isBuffer(req.body) ? req.body.toString('utf8') : null)

  let payload = null
  if (rawBody) {
    try {
      payload = JSON.parse(rawBody)
    } catch (err) {
      console.warn('[slack] rawBody JSON parse failed, will try req.body', err.message)
    }
  }

  // fallback to parsed body (some proxies/platforms pre-parse JSON)
  if (!payload && req.body && typeof req.body === 'object') {
    payload = req.body
  }

  if (!payload) {
    console.warn('[slack] No payload found (rawBody and req.body empty)')
    return res.status(400).json({ error: 'challenge_failed' })
  }

  // Handle URL verification first: always return the challenge as plain text
  if (payload.type === 'url_verification') {
    const challenge = payload.challenge || (payload?.body && payload.body.challenge) || null
    if (!challenge) {
      console.warn('[slack] url_verification payload missing challenge', payload)
      return res.status(400).json({ error: 'challenge_failed' })
    }
    console.log('[slack] url_verification success, returning challenge')
    return res.status(200).type('text/plain').send(challenge)
  }

  if (!process.env.SLACK_SIGNING_SECRET) {
    console.error('[slack] SLACK_SIGNING_SECRET not configured')
    return res.status(500).send('Signing secret not configured')
  }

  const rawForSig = rawBody || JSON.stringify(payload)
  if (!verifySlackSignature(req, rawForSig)) {
    console.warn('[slack] Signature verification failed')
    return res.status(401).send('Invalid signature')
  }

  // Ack immediately
  res.sendStatus(200)

  // Process asynchronously
  try {
    const { event } = payload || {}
    if (!event) return
    if (event.bot_id || event.subtype) return
    if (event.type !== 'message') return

    const channelId = event.channel
    const text = event.text || ''
    const ts = event.ts

    // Resolve mapping via reverse-map (supports DM + channel)
    const mapping = await findMappingBySlackChannelId(channelId)
    const appConversationId = mapping?.appConversationId || null
    if (!appConversationId) {
      console.warn('[slack] No mapping found for channel', channelId)
      return
    }

    // Persist Slack message to Firestore (using helper)
    await persistMessageToRoom(appConversationId, text, `slack:${event.user}`, 'slack')

    console.log('[slack] inbound message forwarded', { appConversationId, channelId, type: mapping?.type || 'unknown', user: event.user, ts })
  } catch (e) {
    console.warn('[slack] Event processing error', e.message || e)
  }
})

// App -> Slack bridge: create/find channel and post message

// Helper: create a private channel and invite users
async function createPrivateChannelWithUsers (roomName, slackUserIds) {
  const token = process.env.SLACK_BOT_TOKEN
  if (!token) throw new Error('Missing SLACK_BOT_TOKEN')

  // 1. Create Channel
  // Slack channel names must be lowercase, no spaces, max 80 chars
  const normalizedName = roomName.toLowerCase().replace(/[^a-z0-9-_]+/g, '-').slice(0, 80)

  const createRes = await fetch('https://slack.com/api/conversations.create', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name: normalizedName, is_private: true })
  })
  const createData = await createRes.json()

  if (!createData.ok && createData.error !== 'name_taken') {
    const err = new Error('Slack conversations.create failed')
    err.data = createData
    throw err
  }

  // If name taken, we might need to handle it or reuse, but for now let's assume unique IDs in name or error out
  // Actually if name_taken, we need to find that channel?
  // For mentorships, we should probably append a random ID if we want to be safe, or assume the ID in name is unique.
  // If it failed with name_taken, createData.channel might be missing.

  const channelId = createData.channel?.id

  // 2. Invite users
  if (channelId && slackUserIds && slackUserIds.length > 0) {
    const inviteRes = await fetch('https://slack.com/api/conversations.invite', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ channel: channelId, users: slackUserIds.join(',') })
    })
    const inviteData = await inviteRes.json()
    if (!inviteData.ok) {
      console.warn('[slack] warning: failed to invite users', inviteData)
      // We continue anyway, as the channel was created
    }
  }

  return channelId
}

// App -> Slack bridge: create/find channel and post message
const slackBridgeMessages = onRequest({ timeoutSeconds: 30, memory: '256MiB' }, async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')
  const { appConversationId, text, userId } = req.body || {}
  if (!appConversationId || !text) return res.status(400).json({ error: 'Missing appConversationId or text' })

  try {
    // Load room to decide between Channel-link vs DM-link
    const roomSnap = await db.collection('chat-rooms').doc(appConversationId).get()
    const room = roomSnap.exists ? (roomSnap.data() || {}) : {}

    // 1) If room has an explicit slackChannelId, treat it as a group/channel integration
    let targetSlackChannelId = room.slackChannelId || null
    let linkType = targetSlackChannelId ? 'channel' : null

    // 2) If NOT linked, create a PRIVATE CHANNEL for this pair (Mentorship style)
    if (!targetSlackChannelId) {
      const participants = Array.isArray(room.participants) ? room.participants : []
      // We want to invite ALL participants who have Slack linked
      const slackUserIds = []
      const missingSlackUsers = []

      for (const uid of participants) {
        const sid = await getSlackUserIdForAppUser(uid)
        if (sid) slackUserIds.push(sid)
        else missingSlackUsers.push(uid)
      }

      if (slackUserIds.length === 0) {
        // No one is on Slack, can't bridge.
        return res.json({ ok: true, forwarded: false, reason: 'no_linked_slack_users' })
      }

      // Create a unique name: mentorship-<shortId>
      // Using last 6 chars of appConversationId for brevity? Or full ID?
      // Full ID is safer for uniqueness.
      const validRoomId = appConversationId.replace(/[^a-z0-9-_]/gi, '').toLowerCase()
      // room names max 80 chars. `mentorship-` is 11 chars.
      // If validRoomId is long (UUID), it fits.
      const roomName = `mentor-${validRoomId}`

      try {
        targetSlackChannelId = await createPrivateChannelWithUsers(roomName, slackUserIds)
      } catch (err) {
        // If name taken, maybe we can try to find it?
        // For now, let's just log and fail if we can't create.
        console.error('[slackBridge] createPrivateChannel failed', err)
        return res.status(500).json({ error: 'create_channel_failed', details: err.data || err.message })
      }

      if (!targetSlackChannelId) {
        return res.status(500).json({ error: 'channel_creation_returned_no_id' })
      }

      linkType = 'channel' // It is a channel now, just private

      // Persist the link
      await db.collection('chat-rooms').doc(appConversationId).set({
        slackChannelId: targetSlackChannelId,
        slackLinkType: 'private_group',
        slackLinkedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true })

      // Reverse mapping
      await putReverseChannelMapping(targetSlackChannelId, {
        appConversationId,
        type: 'channel', // treat as channel for inbound events
        slackChannelId: targetSlackChannelId
      })
    } else {
      // Ensure reverse mapping exists (idempotent-ish)
      await putReverseChannelMapping(targetSlackChannelId, {
        appConversationId,
        type: 'channel',
        slackChannelId: targetSlackChannelId
      })
    }

    // Post message
    await postMessageToSlack(targetSlackChannelId, text)

    // Persist message (using helper)
    await persistMessageToRoom(appConversationId, text, `app:${userId || 'unknown'}`, 'app')

    return res.json({ ok: true, slackChannelId: targetSlackChannelId, type: linkType })
  } catch (err) {
    const details = err?.data || err
    console.error('[slackBridge] Error posting message', details)
    if (details?.error === 'missing_scope') {
      return res.status(403).json({ error: 'missing_scope', details })
    }
    return res.status(500).json({ error: err.message || 'internal', slackError: details || null })
  }
})

module.exports = { slackEvents, slackBridgeMessages }
