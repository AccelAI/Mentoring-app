import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { fetchOrcidProfile } from '../utils/orcidUtils'
import { signInWithOrcid } from '../api/auth'
import { Card, CardContent, Typography, CircularProgress } from '@mui/material'
import { useUser } from '../hooks/useUser'

const OrcidHandler = () => {
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const hasRun = useRef(false)
  const { refreshUser } = useUser()

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')

    if (!code) {
      navigate('/login')
      return
    }

    const exchangeCodeForToken = async () => {
      // Exchange authorization code for access token
      const response = await fetch('http://localhost:5000/api/orcid/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      const data = await response.json()

      if (data.access_token) {
        try {
          // Fetch detailed profile information
          console.log('Fetching ORCID profile...')
          const profileData = await fetchOrcidProfile(
            data.orcid,
            data.access_token
          )

          console.log('ORCID Profile Data:', profileData)

          // Create or update user in Firebase
          const authResult = await signInWithOrcid(
            profileData,
            data.access_token
          )

          if (authResult.ok) {
            // Check if profile has enough information for account creation
            if (!authResult.isNewUser) {
              await refreshUser(profileData.orcidId.replace(/-/g, ''))
              console.log('User refreshed, navigating to dashboard')
              navigate('/dashboard')
            } else {
              // Navigate to a profile completion page if needed
              navigate('/get-started')
            }
            enqueueSnackbar(
              authResult.isNewUser
                ? 'Welcome to the platform!'
                : 'Welcome back!',
              { variant: 'success' }
            )
          } else {
            enqueueSnackbar(authResult.error || 'Failed to create account', {
              variant: 'error'
            })
            navigate('/login')
          }
        } catch (profileError) {
          console.error('Failed to fetch ORCID profile:', profileError)
          enqueueSnackbar('Failed to fetch profile information', {
            variant: 'error'
          })
          navigate('/login')
        }
      } else {
        enqueueSnackbar('ORCID authentication failed', { variant: 'error' })
        navigate('/login')
      }
    }

    exchangeCodeForToken()
  }, [navigate, enqueueSnackbar, refreshUser])

  return (
    <Card sx={{ maxWidth: 345, margin: 'auto', mt: 5, textAlign: 'center' }}>
      <CardContent>
        <Typography variant="h6" fontWeight="light">
          Signing in with ORCID...
        </Typography>
        <CircularProgress sx={{ mt: 2 }} />
      </CardContent>
    </Card>
  )
}

export default OrcidHandler
