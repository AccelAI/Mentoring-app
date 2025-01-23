import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Stack,
  Typography
} from '@mui/material'
import TextField from './questions/text/TextField'
import { LoadingButton } from '@mui/lab'
import { useAuthHandlers } from '../utils/authUtils'

const ResetPasswordDialog = ({
  values,
  isSubmitting,
  setSubmitting,
  resetForm,
  openDialog,
  handleDialogClose
}) => {
  const { handleResetPassword } = useAuthHandlers()
  return (
    <Dialog open={openDialog} onClose={handleDialogClose}>
      <DialogTitle>{'Password Reset'}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography>
            Please enter your email address below and we will send you a link to
            reset your password.
          </Typography>
          <TextField
            label="Email"
            name="emailPassReset"
            type="email"
            sx={{ width: '100%' }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <LoadingButton
          variant="contained"
          onClick={() =>
            handleResetPassword(values, {
              setSubmitting,
              resetForm,
              handleDialogClose
            })
          }
          loading={isSubmitting}
        >
          Reset password
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}

export default ResetPasswordDialog
