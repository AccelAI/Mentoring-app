
const { onRequest } = require('firebase-functions/v2/https')
const { setGlobalOptions } = require('firebase-functions/v2')
const express = require('express')

// Global defaults
setGlobalOptions({ region: 'us-central1' })

const app = express()
app.use(express.json())

// Health (both /health and /api/health)
app.get(['/health', '/api/health'], (_req, res) => {
  res.json({ ok: true, ts: Date.now(), via: 'express' })
})

// POST /api/orcid/token
app.post('/api/orcid/token', async (req, res) => {
  const { code } = req.body
  const clientId = process.env.ORCID_CLIENT_ID
  const clientSecret = process.env.ORCID_CLIENT_SECRET
  const redirectUri = process.env.ORCID_REDIRECT_URI
  if (!code || !clientId || !clientSecret || !redirectUri) {
    return res.status(400).json({ error: 'Missing required parameters' })
  }
  try {
    const response = await fetch('https://orcid.org/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri
      })
    })
    const data = await response.json()
    if (!response.ok) return res.status(response.status).json(data)
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: 'Token exchange failed', details: e.message })
  }
})

// GET /api/orcid/record/:orcidId
app.get('/api/orcid/record/:orcidId', async (req, res) => {
  const { orcidId } = req.params
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' })
  }
  const accessToken = auth.split(' ')[1]
  try {
    const r = await fetch(`https://api.orcid.org/v3.0/${orcidId}/record`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    })
    const record = await r.json()
    if (!r.ok) return res.status(r.status).json(record)
    res.json(record)
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch ORCID record', details: e.message })
  }
})

// Add Slack OAuth start + callback on the Express app
const admin = require('firebase-admin')

// Lazily load slack function module for lightweight cold starts
let _slackModule = null
function ensureSlackModule () {
  if (!_slackModule) {
    _slackModule = require('./slack')
  }
}

app.get('/api/auth/slack/start', (req, res) => {
  const clientId = process.env.SLACK_CLIENT_ID
  if (!clientId) return res.status(500).send('SLACK_CLIENT_ID not configured')

  const scope = encodeURIComponent('chat:write,channels:read,groups:write,im:write')
  const userScope = encodeURIComponent('users:read')
  const redirectUri = 'https://mentor.accel.ai/api/auth/slack/callback'
  const state = encodeURIComponent(req.query.state || '')

  const url = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scope}&user_scope=${userScope}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`
  return res.redirect(url)
})

app.get('/api/auth/slack/callback', async (req, res) => {
  const code = req.query.code
  const state = req.query.state // expected to be your app user id (passed from client)
  if (!code) return res.status(400).send('Missing code')
  if (!state) return res.status(400).send('Missing state (app user id)')

  const clientId = process.env.SLACK_CLIENT_ID
  const clientSecret = process.env.SLACK_CLIENT_SECRET
  const redirectUri = 'https://mentor.accel.ai/api/auth/slack/callback'
  if (!clientId || !clientSecret) return res.status(500).send('Slack client config missing')

  try {
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri
    })

    const tokenRes = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    })
    const tokenData = await tokenRes.json()
    if (!tokenData.ok) {
      console.error('[slack oauth] token exchange failed', tokenData)
      return res.status(500).json({ error: 'oauth_failed', details: tokenData })
    }

    // Init Firestore via Admin SDK
    if (!admin.apps.length) admin.initializeApp()
    const db = admin.firestore()

    // Save team/install info
    const team = tokenData.team || {}
    const authedUser = tokenData.authed_user || null
    if (team && team.id) {
      try {
        await db.collection('slack-installations').doc(team.id).set({
          team,
          bot: tokenData.bot,
          installedAt: admin.firestore.FieldValue.serverTimestamp(),
          raw: tokenData
        }, { merge: true })
      } catch (e) {
        console.warn('[slack oauth] persist installation failed', e.message)
      }
    }

    // Persist Slack token on your app user document identified by state (app user id)
    if (authedUser && authedUser.id && authedUser.access_token) {
      try {
        const userDocRef = db.collection('users').doc(state)
        await userDocRef.set({
          slack: {
            userId: authedUser.id,
            accessToken: authedUser.access_token,
            scope: authedUser.scope || null,
            teamId: team.id || null,
            obtainedAt: admin.firestore.FieldValue.serverTimestamp(),
            raw: tokenData
          }
        }, { merge: true })
      } catch (e) {
        console.warn('[slack oauth] persist user token failed', e.message)
      }
    } else {
      console.warn('[slack oauth] authed_user missing in token response; user token not stored')
    }

    const frontend = process.env.FRONTEND_ORIGIN || 'http://localhost:3000'
    const redirectBack = `${frontend}/slack/oauth/success?installed=true&state=${encodeURIComponent(state || '')}`
    return res.redirect(redirectBack)
  } catch (err) {
    console.error('[slack oauth] unexpected error', err)
    return res.status(500).json({ error: err.message || 'internal' })
  }
})

// POST /api/messages (App -> Slack bridge)
// This is routed via Firebase Hosting rewrite (/api/** -> exports.api).
app.post('/api/messages', async (req, res) => {
  ensureSlackModule()
  return _slackModule.slackBridgeMessages(req, res)
})

// POST /api/admin/channels (Admin creates Slack channel)
// Requires Firebase ID token and membership in Firestore `admins/{uid}`.
app.post('/api/admin/channels', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || ''
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null
    if (!idToken) return res.status(401).json({ error: 'missing_auth' })

    if (!admin.apps.length) admin.initializeApp()
    const decoded = await admin.auth().verifyIdToken(idToken)
    const uid = decoded?.uid
    if (!uid) return res.status(401).json({ error: 'invalid_auth' })

    const db = admin.firestore()
    const adminSnap = await db.collection('admins').doc(uid).get()
    if (!adminSnap.exists) return res.status(403).json({ error: 'not_admin' })

    const token = process.env.SLACK_BOT_TOKEN
    if (!token) return res.status(500).json({ error: 'Missing SLACK_BOT_TOKEN' })

    const { name, purpose = '', appConversationId = null } = req.body || {}
    if (!name) return res.status(400).json({ error: 'missing_name' })

    // Slack channel names: lowercase, no spaces, <= 80 chars.
    const normalized = String(name)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80)

    const createRes = await fetch('https://slack.com/api/conversations.create', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: normalized, is_private: true })
    })
    const createData = await createRes.json()
    if (!createData.ok) {
      if (createData.error === 'missing_scope') {
        return res.status(403).json({ error: 'missing_scope', details: createData })
      }
      return res.status(500).json({ error: 'create_failed', details: createData })
    }

    const slackChannelId = createData.channel?.id

    // Optional: map created channel to a conversation
    if (appConversationId && slackChannelId) {
      await db.collection('chat-rooms').doc(appConversationId).set({
        slackChannelId,
        slackLinkedAt: admin.firestore.FieldValue.serverTimestamp(),
        slackLinkType: 'channel'
      }, { merge: true })
      await db.collection('slack-conversations').doc(appConversationId).set({
        slackChannelId,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true })
      await db.collection('slack-channel-map').doc(slackChannelId).set({
        appConversationId,
        type: 'channel',
        slackChannelId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true })
    }

    // Set purpose if provided (best-effort)
    if (purpose && slackChannelId) {
      try {
        await fetch('https://slack.com/api/conversations.setPurpose', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ channel: slackChannelId, purpose: String(purpose).slice(0, 250) })
        })
      } catch (e) {
        // ignore
      }
    }

    return res.json({ ok: true, slackChannelId, name: normalized })
  } catch (e) {
    console.error('[admin/channels] error', e)
    return res.status(500).json({ error: e.message || 'internal' })
  }
})

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.path })
})

exports.api = onRequest({ timeoutSeconds: 60, memory: '256MiB' }, (req, res) => app(req, res))

// Remove eager require of functions/slack which can delay initialization.
// Instead expose lightweight onRequest wrappers that lazy-require the real handlers.

// keep exports.slackEvents + exports.slackBridgeMessages for direct function URLs if needed

// Export wrapped v2 HTTPS functions that defer loading the implementation until invoked.
// This keeps the backend specification (onRequest) at module-load time but avoids expensive initialization.
exports.slackEvents = onRequest({ timeoutSeconds: 30, memory: '256MiB' }, async (req, res) => {
  ensureSlackModule()
  return _slackModule.slackEvents(req, res)
})

exports.slackBridgeMessages = onRequest({ timeoutSeconds: 30, memory: '256MiB' }, async (req, res) => {
  ensureSlackModule()
  return _slackModule.slackBridgeMessages(req, res)
})
