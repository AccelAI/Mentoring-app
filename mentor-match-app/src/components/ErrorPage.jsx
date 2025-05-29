import React from 'react'
import { Box, Container, Typography, Card, Button, Stack } from '@mui/material'
import { useNavigate } from 'react-router-dom'

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
            p: 2,
            borderRadius: 2
          }}
        >
          <Stack spacing={2} alignItems="center">
            <Box sx={{ width: '40vmin' }}>Animation goes here</Box>
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
