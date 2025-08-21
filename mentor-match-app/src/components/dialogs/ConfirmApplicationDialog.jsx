import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography
} from '@mui/material'

const ConfirmApplicationDialog = ({ open, onClose, onConfirm, action }) => {
  const [reason, setReason] = useState('')
  const isAccept = action === 'accept'
  const isReasonRequired = !isAccept

  const handleConfirm = () => {
    if (isReasonRequired && !reason.trim()) {
      return // Don't proceed if reason is required but empty
    }
    onConfirm(reason)
    handleClose()
  }

  const handleClose = () => {
    setReason('') // Reset reason when closing
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Confirm Application</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to {action} this application?
        </Typography>
        <TextField
          label={isAccept ? 'Reason (optional)' : 'Reason'}
          multiline
          rows={4}
          fullWidth
          margin="normal"
          variant="outlined"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required={isReasonRequired}
          error={isReasonRequired && !reason.trim()}
          helperText={
            isReasonRequired && !reason.trim()
              ? 'Reason is required for rejection'
              : ''
          }
        />
      </DialogContent>
      <DialogActions sx={{ mb: 1, mr: 1 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          color={isAccept ? 'success' : 'error'}
          onClick={handleConfirm}
          disabled={isReasonRequired && !reason.trim()}
        >
          {action} Application
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmApplicationDialog
