import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Box
} from '@mui/material'
import Lottie from 'lottie-react'
import successAnimation from '../../assets/success_animation.json'

const MatchDialog = ({ openDialog, setOpenDialog }) => {
  const navigate = useNavigate()

  const handleChatWithMentor = () => {
    setOpenDialog(false)
    navigate('/')
  }

  return (
    <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
      <DialogContent sx={{ alignSelf: 'center' }}>
        <Stack
          direction={'row'}
          spacing={2}
          justifyContent={'start'}
          alignItems={'center'}
        >
          <Box width={'40%'}>
            <Lottie loop={false} animationData={successAnimation} />
          </Box>
          <Stack>
            <Typography variant="h4" fontWeight={'light'}>
              Succesful Match
            </Typography>
            <Typography variant="body1" fontWeight={'light'}>
              Best of luck on your learning journey!
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'flex-end', m: 1 }}>
        <Button autoFocus onClick={handleChatWithMentor}>
          Chat with Mentor
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default MatchDialog
