import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  Stack,
  Button,
  Typography,
  CircularProgress
} from '@mui/material'
import SlackIcon from '../../assets/slackIcon.svg'
import { useUser } from '../../hooks/useUser'

const SlackPage = () => {
  const [loading, setLoading] = useState(false)
  const [linked, setLinked] = useState(false)
  const [slackInfo, setSlackInfo] = useState(null)
  const [checking, setChecking] = useState(true)

  const { user } = useUser()

  const handleLogin = async () => {
    try {
      setLoading(true)
      const state = encodeURIComponent(user?.uid || '')
      const bridge =
        process.env.REACT_APP_SLACK_BRIDGE_URL || window.location.origin
      window.location.href = `${bridge}/api/auth/slack/start?state=${state}`
    } catch (e) {
      console.error('Slack OAuth start failed', e)
      setLoading(false)
    }
  }

  useEffect(() => {
    const checkLinked = async () => {
      setChecking(true)
      try {
        if (!user) {
          setLinked(false)
          setSlackInfo(null)
          setChecking(false)
          return
        }
        if (user.slack && user.slack.userId) {
          setLinked(true)
          setSlackInfo({ userId: user.slack.userId, teamId: user.slack.teamId })
        } else {
          setLinked(false)
          setSlackInfo(null)
        }
      } catch (e) {
        console.error('Failed to check slack link:', e)
        setLinked(false)
        setSlackInfo(null)
      } finally {
        setChecking(false)
      }
    }

    checkLinked()
  }, [user])

  return (
    <Card
      sx={{
        width: '100%',
        maxHeight: '75vh',
        minWidth: { lg: '835px' },
        overflowY: 'auto',
        padding: 1
      }}
    >
      <Box px={3} py={2}>
        <Box flexGrow={1}>
          <Stack
            direction={'row'}
            spacing={2}
            alignItems={'center'}
            sx={{ pb: 2 }}
          >
            <Typography variant="h6" fontWeight={'light'}>
              Connect to Slack
            </Typography>
          </Stack>
          <Stack spacing={2}>
            <Typography variant="body2" color="textSecondary">
              Have a Slack account? Connect it to Mentor Match to receive
              notifications and messages from our Slack channels directly within
              the app.
            </Typography>
            <Box>
              {checking ? (
                <CircularProgress size={18} />
              ) : linked ? (
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Box
                    component="img"
                    src={SlackIcon}
                    sx={{ height: '20px', width: '20px' }}
                  />
                  <Typography variant="body2">
                    Connected: {slackInfo?.userId}
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={handleLogin}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={18} /> : 'Re-link'}
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="contained"
                  color="white"
                  onClick={handleLogin}
                  startIcon={
                    <Box
                      component="img"
                      src={SlackIcon}
                      sx={{ height: '20px', width: '20px' }}
                    />
                  }
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={18} /> : 'Log in'}
                </Button>
              )}
            </Box>
          </Stack>
        </Box>
      </Box>
    </Card>
  )
}

export default SlackPage
