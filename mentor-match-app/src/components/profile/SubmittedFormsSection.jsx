import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Stack,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  SchoolRounded as SchoolIcon
} from '@mui/icons-material'

import { useUser } from '../../hooks/useUser'
import { getFormAnswers, deleteFormAnswers } from '../../api/forms'
import MentorshipFormDialog from '../dialogs/MentorshipFormDialog'

const SubmittedFormsSection = () => {
  const { user, refreshUser } = useUser()
  const navigate = useNavigate()
  const [formType, setFormType] = useState('')
  const [warningDialogOpen, setWarningDialogOpen] = useState(false)
  const [mentorshipFormDialogOpen, setMentorshipFormDialogOpen] =
    useState(false)
  const [loading, setLoading] = useState(false)

  const fetchForms = async () => {
    try {
      setLoading(true)
      const formAnswers = await getFormAnswers(user.uid)
      setLoading(false)

      if (!formAnswers) {
        setFormType(null) // No forms available
        return
      }

      const { mentorData, menteeData } = formAnswers

      const determineFormType = () => {
        if (mentorData && menteeData) return 'Combined'
        if (mentorData) return 'Mentor'
        if (menteeData) return 'Mentee'
        return null
      }
      setFormType(determineFormType())
    } catch (error) {
      console.error('Error fetching forms:', error)
      setFormType(null) // Handle error gracefully
    }
  }

  useEffect(() => {
    fetchForms()
  }, [])

  const renderFormSection = (formLabel) => (
    <Stack direction={'row'} spacing={1} alignItems={'center'}>
      <Typography pr={1}>{formLabel}</Typography>
      <Button
        variant="outlined"
        size="small"
        endIcon={<EditIcon />}
        onClick={() => editForm(formLabel)}
      >
        Edit
      </Button>
      <Button
        variant="outlined"
        size="small"
        color="error"
        endIcon={<DeleteIcon />}
        onClick={() => setWarningDialogOpen(true)}
      >
        Delete
      </Button>
    </Stack>
  )

  const editForm = (formLabel) => {
    if (formLabel === 'Mentee Form') {
      navigate('/mentee-form/' + user.uid)
    } else if (formLabel === 'Mentor Form') {
      navigate('/mentor-form/' + user.uid)
    } else if (formLabel === 'Combined Form (Mentor and Mentee)') {
      navigate('/mentor-mentee-form/' + user.uid)
    }
  }

  const deleteForm = (formLabel) => {
    deleteFormAnswers(user.uid, formLabel).then((res) => {
      if (res.ok) {
        console.log('Form deleted successfully')
        setFormType(null) // Reset form type after deletion
        fetchForms() // Refetch forms to update the UI
        refreshUser() // Refresh the user data
        setWarningDialogOpen(false) // Close the warning dialog
      } else {
        console.error('Error deleting form:', res.error)
      }
    })
  }

  return (
    <Stack pt={4} pl={2} spacing={2}>
      <Typography variant={'h6'} fontWeight={'light'}>
        Mentorship Program Application
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {formType === 'Mentee' && renderFormSection('Mentee Form')}
          {formType === 'Mentor' && renderFormSection('Mentor Form')}
          {formType === 'Combined' &&
            renderFormSection('Combined Form (Mentor and Mentee)')}
          {formType === null && (
            <Stack spacing={2}>
              <Typography>No form submitted yet</Typography>
              <Button
                variant={'contained'}
                onClick={() => setMentorshipFormDialogOpen(true)}
                startIcon={<SchoolIcon />}
                size="small"
                sx={{ width: 'fit-content' }}
              >
                Apply
              </Button>
              <MentorshipFormDialog
                openDialog={mentorshipFormDialogOpen}
                setOpenDialog={setMentorshipFormDialogOpen}
              />
            </Stack>
          )}

          <Dialog
            open={warningDialogOpen}
            onClose={() => setWarningDialogOpen(false)}
          >
            <DialogTitle>Warning</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete this form?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setWarningDialogOpen(false)}>
                Cancel
              </Button>
              <Button color="error" onClick={() => deleteForm(formType)}>
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Stack>
  )
}

export default SubmittedFormsSection
