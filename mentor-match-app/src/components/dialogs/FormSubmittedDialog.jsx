import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Stack,
  Box
} from '@mui/material'
import Lottie from 'lottie-react'
import successAnimation from '../../assets/success_animation_2.json'

const FormSubmittedDialog = ({ openDialog, setOpenDialog }) => {
  const navigate = useNavigate()

  const handleNav = () => {
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
          <Box width={'50%'}>
            <Lottie loop={true} animationData={successAnimation} />
          </Box>
          <Stack spacing={1}>
            <Typography variant="h4" fontWeight={'light'}>
              Application Submitted Successfully!
            </Typography>
            <Typography variant="body1" fontWeight={'light'}>
              We'll inform you once your application has been reviewed.
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'flex-end', m: 1 }}>
        <Button autoFocus onClick={handleNav}>
          Go to Dashboard
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default FormSubmittedDialog
