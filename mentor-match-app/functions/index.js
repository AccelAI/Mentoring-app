const { onRequest } = require('firebase-functions/v2/https')
const { setGlobalOptions } = require('firebase-functions/v2')
const express = require('express')
const fetch = require('node-fetch')

setGlobalOptions({ region: 'us-central1' })

const app = express()
app.use(express.json())

// POST /api/orcid/token
app.post('/api/orcid/token', async (req, res) => {
  const { code } = req.body
  const clientId = process.env.ORCID_CLIENT_ID
  const clientSecret = process.env.ORCID_CLIENT_SECRET
  const redirectUri = process.env.ORCID_REDIRECT_URI

  if (!code || !clientId || !clientSecret || !redirectUri) {
    return res.status(400).json({
      error:
        'Missing required parameters (server ORCID_* secrets or request code)'
    })
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
  if (!auth || !auth.startsWith('Bearer '))
    return res.status(401).json({ error: 'Missing or invalid authorization header' })
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

// Export function (v2)
exports.api = onRequest(app)
