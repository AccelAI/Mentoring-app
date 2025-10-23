const { onRequest } = require('firebase-functions/v2/https')
const { setGlobalOptions } = require('firebase-functions/v2')
const express = require('express')
const { onInit } = require('firebase-functions/v2/core')

// Fast-fail log for runtime mismatch (v2 requires Node 18+)
const nodeMajor = parseInt(process.versions.node.split('.')[0], 10)
if (nodeMajor < 18) {
  console.error('firebase-functions v2 requires Node 18+. Current:', process.version)
}

// Global defaults
setGlobalOptions({ region: 'us-central1' })

// Helpers for consistent response parsing and redaction
function redact(value) {
  if (!value) return 'missing'
  const s = String(value)
  if (s.length <= 6) return '***'
  return `${s.slice(0, 4)}***${s.slice(-2)}`
}
async function parseResponseSafe(response) {
  const contentType = response.headers.get('content-type') || ''
  try {
    if (contentType.includes('application/json')) {
      return await response.json()
    }
    return await response.text()
  } catch {
    try {
      return await response.text()
    } catch {
      return null
    }
  }
}

// Lazily initialize Express app and routes during instance startup
let app
onInit(() => {
  app = express()
  app.use(express.json())

  // Health (both /health and /api/health)
  app.get(['/health', '/api/health'], (_req, res) => {
    res.json({ ok: true, ts: Date.now(), via: 'express' })
  })

  // Diagnostics to verify env and common pitfalls
  app.get('/api/orcid/diagnostics', (req, res) => {
    const { ORCID_CLIENT_ID, ORCID_CLIENT_SECRET, ORCID_REDIRECT_URI, NODE_ENV } = process.env
    res.json({
      ok: true,
      env: {
        ORCID_CLIENT_ID: !!ORCID_CLIENT_ID,
        ORCID_CLIENT_SECRET: !!ORCID_CLIENT_SECRET,
        ORCID_REDIRECT_URI: !!ORCID_REDIRECT_URI,
        NODE_ENV: NODE_ENV || 'development'
      },
      values: {
        ORCID_REDIRECT_URI
      },
      hints: [
        'redirect_uri must EXACTLY match what was used to obtain the authorization code.',
        'Authorization codes are single-use and expire quickly.',
        'Use sandbox credentials with sandbox auth and prod with prod.'
      ]
    })
  })

  // POST /api/orcid/token
  app.post('/api/orcid/token', async (req, res) => {
    const { code } = req.body
    const clientId = process.env.ORCID_CLIENT_ID
    const clientSecret = process.env.ORCID_CLIENT_SECRET
    const redirectUri = process.env.ORCID_REDIRECT_URI

    console.log('Token exchange request:', {
      code_present: !!code,
      clientId: redact(clientId),
      clientSecret: redact(clientSecret),
      redirectUri
    })

    if (!code || !clientId || !clientSecret || !redirectUri) {
      return res.status(400).json({
        error: 'Missing required parameters',
        missing: {
          code: !code,
          ORCID_CLIENT_ID: !clientId,
          ORCID_CLIENT_SECRET: !clientSecret,
          ORCID_REDIRECT_URI: !redirectUri
        },
        hint: 'Ensure server env has ORCID_* set and request body contains the one-time "code".'
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
      const data = await parseResponseSafe(response)

      if (!response.ok) {
        return res.status(response.status).json({
          error: 'ORCID token exchange failed',
          status: response.status,
          statusText: response.statusText,
          details: data
        })
      }

      return res.json(typeof data === 'string' ? { raw: data } : data)
    } catch (e) {
      return res.status(500).json({ error: 'Token exchange failed', details: e.message })
    }
  })

  // GET /api/orcid/record/:orcidId
  app.get('/api/orcid/record/:orcidId', async (req, res) => {
    const { orcidId } = req.params
    const auth = req.headers.authorization
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Missing or invalid authorization header',
        hint: 'Send header: Authorization: Bearer <access_token>'
      })
    }

    // Basic ORCID iD format: 0000-0000-0000-0000 (last char can be X)
    const isValidOrcid = /^(\d{4}-){3}\d{3}[\dX]$/.test(orcidId)
    if (!isValidOrcid) {
      return res.status(400).json({
        error: 'Invalid ORCID iD format',
        expected: '0000-0000-0000-0000 (last char can be X)'
      })
    }

    const accessToken = auth.split(' ')[1]
    try {
      const r = await fetch(`https://pub.orcid.org/v3.0/${orcidId}/record`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        }
      })
      const record = await parseResponseSafe(r)
      if (!r.ok) {
        return res.status(r.status).json({
          error: 'Failed to fetch ORCID record',
          status: r.status,
          statusText: r.statusText,
          details: record
        })
      }
      return res.json(typeof record === 'string' ? { raw: record } : record)
    } catch (e) {
      return res.status(500).json({ error: 'Failed to fetch ORCID record', details: e.message })
    }
  })

  // 404 fallback
  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', path: req.path })
  })
})

// Export proxy handler that waits for init
exports.api = onRequest({ timeoutSeconds: 60, memory: '256MiB' }, (req, res) => {
  if (!app) {
    return res.status(503).json({ error: 'Service initializing' })
  }
  return app(req, res)
})
