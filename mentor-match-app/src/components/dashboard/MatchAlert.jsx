import React, { useState } from 'react'
import { Box, Card, Stack, Button, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { CheckCircleOutlined as CheckCircleIcon } from '@mui/icons-material'

const MatchAlert = () => {
  const navigate = useNavigate()
  return (
    <Card sx={{ width: '100%', height: 'auto' }}>
      <Box p={2}>
        <Stack
          direction={'row'}
          spacing={2}
          alignItems={'center'}
          justifyContent={'space-between'}
        >
          <Stack direction={'row'} spacing={1} alignItems={'center'}>
            <CheckCircleIcon color="primary" />
            <Typography>Your mentor match results are ready!</Typography>
          </Stack>
          <Button
            size="small"
            variant={'contained'}
            onClick={() => navigate('/match')}
          >
            View Matches
          </Button>
        </Stack>
      </Box>
    </Card>
  )
}

export default MatchAlert
