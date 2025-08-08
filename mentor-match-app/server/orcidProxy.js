require('dotenv').config({ path: './server/.env' })
const express = require('express')
const fetch = require('node-fetch')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors()) // Allow requests from your frontend

app.post('/api/orcid/token', async (req, res) => {
  const { code } = req.body
  const client_id = process.env.ORCID_CLIENT_ID
  const client_secret = process.env.ORCID_CLIENT_SECRET
  const redirect_uri = process.env.ORCID_REDIRECT_URI

  console.log('Received token exchange request:')
  console.log('- Code:', code ? 'present' : 'missing')
  console.log('- Client ID:', client_id ? 'present' : 'missing')
  console.log('- Client Secret:', client_secret ? 'present' : 'missing')
  console.log('- Redirect URI:', redirect_uri)

  if (!code || !client_id || !client_secret || !redirect_uri) {
    console.error('Missing required environment variables or code')
    return res.status(400).json({
      error: 'Missing required parameters',
      missing: {
        code: !code,
        client_id: !client_id,
        client_secret: !client_secret,
        redirect_uri: !redirect_uri
      }
    })
  }

  try {
    console.log('Making request to ORCID API...')
    const response = await fetch('https://sandbox.orcid.org/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id,
        client_secret,
        grant_type: 'authorization_code',
        code,
        redirect_uri
      })
    })

    console.log('ORCID API response status:', response.status)
    const data = await response.json()
    console.log('ORCID API response:', data)

    if (!response.ok) {
      console.error('ORCID API error:', data)
      return res.status(response.status).json(data)
    }

    res.json(data)
  } catch (err) {
    console.error('Token exchange error:', err)
    res
      .status(500)
      .json({ error: 'Token exchange failed', details: err.message })
  }
})

// New endpoint to read ORCID record
app.get('/api/orcid/record/:orcidId', async (req, res) => {
  const { orcidId } = req.params
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: 'Missing or invalid authorization header' })
  }

  const accessToken = authHeader.split(' ')[1]

  try {
    console.log(`Fetching ORCID record for: ${orcidId}`)
    console.log(`Using access token: ${accessToken ? 'present' : 'missing'}`)

    const response = await fetch(
      `https://api.sandbox.orcid.org/v3.0/${orcidId}/record`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json' // This gets JSON instead of XML!
        }
      }
    )

    console.log('ORCID record response status:', response.status)
    console.log('ORCID record response headers:', response.headers.raw())

    const recordData = await response.json()
    console.log('ORCID record response data:', recordData)

    if (!response.ok) {
      console.error('ORCID record fetch error:', recordData)
      return res.status(response.status).json(recordData)
    }

    res.json(recordData)
  } catch (err) {
    console.error('ORCID record fetch error:', err)
    res
      .status(500)
      .json({ error: 'Failed to fetch ORCID record', details: err.message })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`))
