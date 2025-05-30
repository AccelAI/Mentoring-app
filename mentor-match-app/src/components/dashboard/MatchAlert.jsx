import { useNavigate } from 'react-router-dom'
import { Box, Card, Stack, Button, Typography } from '@mui/material'
import { CheckCircleOutlined as CheckCircleIcon } from '@mui/icons-material'
import { useUser } from '../../hooks/useUser'

const MatchAlert = () => {
  const navigate = useNavigate()
  const { user } = useUser()

  const handleNavigate = () => {
    if (user.mentorMatchResults) {
      navigate('/mentor-pick')
    }
    if (user.newMenteeMatch) {
      navigate('/matches')
    }
  }

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

            {user.mentorMatchResults && (
              <Typography>Your mentor match results are ready!</Typography>
            )}
            {user.newMenteeMatch && (
              <Typography>You have a new match!</Typography>
            )}
          </Stack>
          <Button size="small" variant={'contained'} onClick={handleNavigate}>
            View Matches
          </Button>
        </Stack>
      </Box>
    </Card>
  )
}

export default MatchAlert
