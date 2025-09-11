import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Button
} from '@mui/material'

const MentorshipFormDialog = ({
  onFillFormLater,
  openDialog,
  setOpenDialog
}) => {
  const navigate = useNavigate()
  const [selectedValue, setSelectedValue] = useState('mentee')
  const handleValueChange = (event) => {
    setSelectedValue(event.target.value)
  }

  const handleDialogClose = () => {
    setOpenDialog(false)
  }

  const goToApplicationForm = () => {
    handleDialogClose()
    if (selectedValue === 'mentee') {
      navigate('/mentee-form')
    } else if (selectedValue === 'mentor') {
      navigate('/mentor-form')
    } else {
      navigate('/combined-form')
    }
  }

  return (
    <Dialog open={openDialog} onClose={handleDialogClose}>
      <DialogTitle textAlign="center">
        {'Which role best matches your interest in our Mentorship Program?'}
      </DialogTitle>
      <DialogContent sx={{ alignSelf: 'center' }}>
        <FormControl>
          <RadioGroup
            row
            name="form-radio-options"
            value={selectedValue}
            onChange={handleValueChange}
          >
            <FormControlLabel
              value="mentee"
              control={<Radio />}
              label="Mentee"
            />
            <FormControlLabel
              value="mentor"
              control={<Radio />}
              label="Mentor"
            />
            <FormControlLabel value="both" control={<Radio />} label="Both" />
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', m: 1 }}>
        {onFillFormLater ? (
          <Button onClick={onFillFormLater}>Fill Application Form Later</Button>
        ) : (
          <Button onClick={handleDialogClose}>Cancel</Button>
        )}
        <Button variant="contained" onClick={goToApplicationForm} autoFocus>
          Go to Application Form
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default MentorshipFormDialog
