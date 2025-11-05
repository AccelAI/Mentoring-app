import {
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Button,
  Typography,
  Stack,
  Switch
} from '@mui/material'
import { updateSurveyMeta, getSurveyById } from '../../api/surveys'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { serverTimestamp } from 'firebase/firestore'

const SurveySettingsDialog = ({ open, onClose }) => {
  const { id } = useParams()
  const { enqueueSnackbar } = useSnackbar()

  const [enableSettings, setEnableSettings] = useState({
    mentors: true,
    mentees: true
  })

  const fetchSettings = useCallback(async () => {
    // Prevent Firestore doc() from receiving undefined
    if (!id) {
      console.warn('SurveySettingsDialog: missing surveyId; skipping fetch')
      return
    }
    try {
      const survey = await getSurveyById(id)
      //console.log('Fetched survey for settings:', survey)
      setEnableSettings({
        mentees: survey.enabledFor.mentees,
        mentors: survey.enabledFor.mentors
      })
    } catch (err) {
      console.error('Error fetching survey by ID:', err)
    }
  }, [id]) // include surveyId dep

  useEffect(() => {
    // Only fetch when dialog is open and we have a valid id
    if (!open || !id) return
    fetchSettings()
  }, [open, id, fetchSettings])

  const handleToggle = (role) => {
    setEnableSettings((prev) => ({
      ...prev,
      [role]: !prev[role]
    }))
  }

  const handleSave = async () => {
    try {
      const res = await updateSurveyMeta(id, {
        enabledFor: enableSettings,
        status: 'published',
        publishedAt: serverTimestamp()
      })
      //console.log('Survey settings updated:', res)
      if (res.ok) {
        enqueueSnackbar('Survey posted successfully', {
          variant: 'success'
        })
      }
      onClose()
    } catch (error) {
      enqueueSnackbar('Failed to post survey', { variant: 'error' })
      console.error('Error saving survey settings:', error)
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Survey Settings</DialogTitle>
      <DialogContent>
        <Stack spacing={1} sx={{ mt: 1 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={4}
          >
            <Typography variant="body1" color="text.secondary">
              Enable for Mentees
            </Typography>
            <Switch
              checked={enableSettings.mentees}
              onChange={() => handleToggle('mentees')}
              color="secondary"
            />
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={4}
          >
            <Typography variant="body1" color="text.secondary">
              Enable for Mentors
            </Typography>
            <Switch
              checked={enableSettings.mentors}
              onChange={() => handleToggle('mentors')}
              color="secondary"
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="success" onClick={handleSave}>
          Save and Post
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SurveySettingsDialog
