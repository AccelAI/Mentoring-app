import React from 'react'
import { Box, Container, Typography, Card, Button, Stack } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import Lottie from 'lottie-react'
import errorAnimation from '../assets/404_error_animation.json'

const ErrorPage = ({ children }) => {
  const navigate = useNavigate()
  return (
    <Box>
      <Container maxWidth="md" sx={{ p: 3 }}>
        <Card
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 3,
            borderRadius: 2
          }}
        >
          <Box sx={{ width: '60%' }}>
            <Lottie loop={true} animationData={errorAnimation} />
          </Box>
          <Stack spacing={2} alignItems="center">
            <Typography align="center" variant="h6">
              {children}
            </Typography>
            <Button onClick={() => navigate('/dashboard')} variant="outlined">
              Go to dashboard
            </Button>
          </Stack>
        </Card>
      </Container>
    </Box>
  )
}

export default ErrorPage
