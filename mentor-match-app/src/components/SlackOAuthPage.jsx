import React, { useEffect, useState } from 'react'
import { Box, Card, Typography, CircularProgress } from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { getUserById } from '../api/users'
import { useUser } from '../hooks/useUser'

const SlackOAuthSuccess = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [installed, setInstalled] = useState(false)
  const [info, setInfo] = useState(null)
  const { user, refreshUser } = useUser()

  useEffect(() => {
    if (!user) return
    const params = new URLSearchParams(location.search)
    const installedFlag = params.get('installed') === 'true'
    console.log('Slack OAuth installed:', installedFlag)
    const state = params.get('state')
    setInstalled(installedFlag)

    const fetchStatus = async () => {
      try {
        const userId = user?.uid
        // If we have a state param, only query that user; otherwise query the logged-in user
        const lookupId = state || userId
        const doc = await getUserById(lookupId)
        if (doc && doc.slack) {
          // Only non-sensitive info
          setInfo({ userSlackId: doc.slack.userId, teamId: doc.slack.teamId })
          // Refresh app user (so UI updates immediately)
          try {
            await refreshUser(state || undefined)
          } catch (e) {
            console.warn('Failed to refresh user after OAuth:', e)
          }

          // If opened as a popup, notify the opener so it can refresh and close this window
          try {
            if (window.opener && window.opener !== window) {
              const targetOrigin = window.location.origin
              window.opener.postMessage(
                { type: 'SLACK_OAUTH_SUCCESS', state },
                targetOrigin
              )
              setTimeout(() => window.close(), 900)
              return
            }
          } catch (e) {
            console.warn('Could not postMessage to opener', e)
          }

          // Otherwise, navigate back to the dashboard
          setTimeout(() => {
            navigate('/dashboard')
          }, 900)
          setLoading(false)
        } else {
          setInfo({ message: 'No Slack token saved for this account yet.' })
          setLoading(false)
        }
      } catch (e) {
        setInfo({ message: 'Failed to fetch user info' })
        setLoading(false)
      }
    }

    fetchStatus()
  }, [location.search, user])

  return (
    <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
      <Card sx={{ p: 3, width: '100%', maxWidth: 720 }}>
        <Typography variant="h6">Slack Authentication</Typography>
        <Box sx={{ mt: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {installed ? (
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Slack synchronization was successful! Returning to
                  dashboard...
                </Typography>
              ) : (
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Slack installation did not complete (missing success query).
                  You can close this tab and try again.
                </Typography>
              )}
              {info && info.userSlackId && (
                <Typography variant="body2">
                  Linked Slack user ID: {info.userSlackId} (team {info.teamId})
                </Typography>
              )}
              {info && info.message && (
                <Typography variant="body2">{info.message}</Typography>
              )}
            </>
          )}
        </Box>
      </Card>
    </Box>
  )
}

export default SlackOAuthSuccess
