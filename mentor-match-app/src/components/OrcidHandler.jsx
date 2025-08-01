import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const OrcidHandler = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')

    if (!code) {
      navigate('/login')
      return
    }

    const exchangeCodeForToken = async () => {
      const clientId = process.env.REACT_APP_ORCID_CLIENT_ID
      const clientSecret = process.env.REACT_APP_ORCID_CLIENT_SECRET
      const redirectUri = process.env.REACT_APP_ORCID_REDIRECT_URI

      // In OrcidHandler.jsx
      const response = await fetch('http://localhost:5000/api/orcid/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      const data = await response.json()

      if (data.access_token) {
        localStorage.setItem('orcid_access_token', data.access_token)
        localStorage.setItem('orcid_id', data.orcid)
        navigate('/dashboard')
      } else {
        alert('ORCID authentication failed')
        navigate('/login')
      }
    }

    exchangeCodeForToken()
  }, [navigate])

  return <div>Signing in with ORCID...</div>
}

export default OrcidHandler
