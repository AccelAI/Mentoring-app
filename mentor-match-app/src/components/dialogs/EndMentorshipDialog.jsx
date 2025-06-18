import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Button,
  TextField
} from '@mui/material'
import { useSnackbar } from 'notistack'
import { endMentorship } from '../../api/match'
import { useUser } from '../../hooks/useUser'

const EndMentorshipDialog = ({
  openDialog,
  setOpenDialog,
  userId,
  setOpenProfileDialog
}) => {
  const [selectedValue, setSelectedValue] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const { enqueueSnackbar } = useSnackbar()
  const { user: loggedUser, refreshUser } = useUser()

  const handleValueChange = (event) => {
    setSelectedValue(event.target.value)
  }

  const handleAdditionalInfoChange = (event) => {
    setAdditionalInfo(event.target.value)
  }

  const handleSubmit = async () => {
    try {
      console.log(
        'logged user role:' +
          loggedUser.role +
          ', userId: ' +
          userId +
          ', loggedUser uid: ' +
          loggedUser.uid
      )
      let res
      if (
        (loggedUser.role === 'Mentor' || loggedUser.role === 'Mentor/Mentee') &&
        loggedUser.mentees.includes(userId)
      ) {
        // Mentor is ending mentorship with a mentee
        console.log('Mentor is ending mentorship with a mentee')
        res = await endMentorship(
          userId,
          loggedUser.uid,
          selectedValue,
          additionalInfo
        )
      } else {
        console.log('Mentee is ending mentorship with a mentor')
        // Mentee is ending mentorship with a mentor
        res = await endMentorship(
          loggedUser.uid,
          userId,
          selectedValue,
          additionalInfo
        )
      }
      console.log('End mentorship response:', res)
      if (res.ok) {
        enqueueSnackbar('Mentorship ended successfully', { variant: 'success' })
      }
      await refreshUser()
    } catch (err) {
      console.error('Error ending mentorship:', err)
      enqueueSnackbar('Error ending mentorship: ' + err.message, {
        variant: 'error'
      })
      return
    }
    setOpenDialog(false)
    if (setOpenProfileDialog) {
      setOpenProfileDialog(false)
    }
  }

  const handleDialogClose = () => {
    setOpenDialog(false)
    setSelectedValue('')
  }

  return (
    <Dialog open={openDialog} onClose={handleDialogClose}>
      <DialogTitle textAlign="center">
        Select a reason for ending the mentorship
      </DialogTitle>
      <DialogContent>
        <FormControl sx={{ width: '100%' }}>
          <RadioGroup
            name="form-radio-options"
            value={selectedValue}
            onChange={handleValueChange}
          >
            <FormControlLabel
              value="completed"
              control={<Radio />}
              label="Mentorship term completed"
            />
            <FormControlLabel
              value="unableToReach"
              control={<Radio />}
              label="Unable to reach mentor/mentee"
            />
            <FormControlLabel value="other" control={<Radio />} label="Other" />
            <TextField
              margin="dense"
              id="reason"
              label="Additional Information (optional)"
              type="text"
              fullWidth
              variant="outlined"
              multiline
              rows={2}
              value={additionalInfo}
              onChange={handleAdditionalInfoChange}
            />
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', m: 1 }}>
        <Button onClick={handleDialogClose}>Cancel</Button>
        <Button
          variant="contained"
          autoFocus
          disabled={!selectedValue}
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EndMentorshipDialog
