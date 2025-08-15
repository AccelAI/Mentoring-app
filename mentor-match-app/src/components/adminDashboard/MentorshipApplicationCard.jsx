import React from 'react'
import {
  Card,
  Typography,
  Stack,
  Box,
  Button,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  CheckCircleOutline as CheckIcon,
  CancelOutlined as CancelIcon
} from '@mui/icons-material'
import ProfilePicture from '../ProfilePicture'

const MentorshipApplicationCard = () => {
  return (
    <Card
      variant="outlined"
      sx={{
        transition: 'box-shadow 0.3s',
        '&:hover': {
          boxShadow: 2,
          cursor: 'pointer'
        }
      }}
    >
      <Box p={2}>
        <Stack direction={'row'} spacing={2} alignItems={'center'}>
          <ProfilePicture size={40} borderRadius={100} />
          <Stack spacing={1}>
            <Typography variant={'h6'} fontWeight={'light'}>
              Name Lastname
            </Typography>
            <Typography variant={'body2'}>(Type) Application</Typography>
            <Typography variant={'body2'}>Submitted on: 12/12/2025</Typography>
          </Stack>
          <Box flexGrow={1} />
          <Stack spacing={1} direction={'row'} alignItems={'center'}>
            <Button variant="contained" size="small">
              View Application
            </Button>
            <Tooltip title="Accept Application">
              <IconButton color="success">
                <CheckIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reject Application">
              <IconButton color="error">
                <CancelIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>
    </Card>
  )
}

export default MentorshipApplicationCard
