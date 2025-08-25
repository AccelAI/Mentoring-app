import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  Box,
  Stack,
  Typography,
  CircularProgress,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material'
import {
  Today as DateIcon,
  EditCalendar as UpdateIcon,
  AssignmentLateOutlined as PendingIcon,
  AssignmentTurnedInOutlined as ApprovedIcon,
  HighlightOffOutlined as RejectedIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SchoolRounded as SchoolIcon
} from '@mui/icons-material'
import { useUser } from '../../hooks/useUser'
import {
  getCurrentApplicationStatus,
  getFormType,
  deleteFormAnswers
} from '../../api/forms'
import { formatDate } from '../../utils/date'
import MentorshipFormDialog from '../dialogs/MentorshipFormDialog'

const ApplicationStatus = () => {
  const { user, loading, refreshUser } = useUser()
  const [applicationInfo, setApplicationInfo] = useState(null)
  const [formType, setFormType] = useState(null)
  const [loadingFormType, setLoadingFormType] = useState(true)
  const [warningDialogOpen, setWarningDialogOpen] = useState(false)
  const [mentorshipFormDialogOpen, setMentorshipFormDialogOpen] =
    useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchFormData = async () => {
      if (!user?.uid) return
      setLoadingFormType(true)
      try {
        const type = await getFormType(user.uid)
        if (!type) {
          setFormType(null)
          setApplicationInfo(null)
          return
        }
        setFormType(type)

        const data = await getCurrentApplicationStatus(user.uid, type)
        console.log('Application data:', data)
        if (!data) {
          setApplicationInfo(null)
          return
        }
        setApplicationInfo(data)
      } catch (err) {
        console.error('Error fetching form data:', err)
        setFormType(null)
        setApplicationInfo(null)
      } finally {
        setLoadingFormType(false)
      }
    }

    fetchFormData()
  }, [user])

  const capitalizeFirst = (s) =>
    typeof s === 'string' && s.length
      ? s.charAt(0).toUpperCase() + s.slice(1)
      : s

  const editForm = () => {
    if (formType === 'Mentee') {
      navigate('/mentee-form/' + user.uid)
    } else if (formType === 'Mentor') {
      navigate('/mentor-form/' + user.uid)
    } else if (formType === 'Combined') {
      navigate('/mentor-mentee-form/' + user.uid)
    }
  }

  const deleteForm = async (type) => {
    try {
      const res = await deleteFormAnswers(user.uid, type)
      if (res.ok) {
        setFormType(null)
        setApplicationInfo(null)
        refreshUser()
      } else {
        console.error('Error deleting form:', res.error)
      }
    } catch (err) {
      console.error('Error deleting form:', err)
    } finally {
      setWarningDialogOpen(false)
    }
  }

  const renderFormSection = (formLabel) => (
    <Stack direction={'row'} spacing={1} alignItems={'center'}>
      <Typography fontWeight={'medium'} pr={1}>
        {formLabel}
      </Typography>
      <Box flexGrow={1} />
      <Button
        variant="outlined"
        size="small"
        endIcon={<EditIcon />}
        onClick={editForm}
      >
        Edit Form
      </Button>
      <Button
        variant="outlined"
        size="small"
        color="error"
        endIcon={<DeleteIcon />}
        onClick={() => setWarningDialogOpen(true)}
      >
        Delete Form
      </Button>
    </Stack>
  )

  return (
    <Card
      sx={{
        width: loading ? '-webkit-fill-available' : '100%',
        maxHeight: '75vh',
        minWidth: { lg: '835px' },
        overflowY: 'auto',
        padding: 1
      }}
    >
      <Box px={3} py={2}>
        <Box flexGrow={1}>
          <Stack spacing={2} sx={{ pb: 2 }}>
            <Typography variant="h6" fontWeight={'light'}>
              Mentorship Program Application
            </Typography>
            {loadingFormType ? (
              <CircularProgress />
            ) : (
              <Stack spacing={1}>
                {/*  SubmittedFormsSection start */}
                {formType === 'Mentee' &&
                  renderFormSection('Mentee Application Submission')}
                {formType === 'Mentor' &&
                  renderFormSection('Mentor Application Submission')}
                {formType === 'Combined' &&
                  renderFormSection('Combined Application Submission')}
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
                {/* SubmittedFormsSection end */}

                {applicationInfo && (
                  <Stack spacing={1}>
                    <Stack
                      direction={'row'}
                      spacing={0.5}
                      alignItems={'center'}
                    >
                      {applicationInfo.status === 'pending' && (
                        <PendingIcon fontSize="small" color="warning" />
                      )}
                      {applicationInfo.status === 'approved' && (
                        <ApprovedIcon fontSize="small" color="success" />
                      )}
                      {applicationInfo.status === 'rejected' && (
                        <RejectedIcon fontSize="small" color="error" />
                      )}
                      <Typography variant={'body2'}>
                        Status: {capitalizeFirst(applicationInfo.status)}
                      </Typography>
                    </Stack>
                    <Stack
                      direction={'row'}
                      spacing={0.5}
                      alignItems={'center'}
                    >
                      <DateIcon fontSize="small" color="primary" />
                      <Typography variant={'body2'}>
                        Submitted on: {formatDate(applicationInfo.submittedAt)}
                      </Typography>
                    </Stack>
                    <Stack
                      direction={'row'}
                      spacing={0.5}
                      alignItems={'center'}
                    >
                      <UpdateIcon fontSize="small" color="primary" />
                      <Typography variant={'body2'}>
                        Last updated: {formatDate(applicationInfo.lastUpdated)}
                      </Typography>
                    </Stack>
                  </Stack>
                )}
              </Stack>
            )}
          </Stack>
          {/*  <Divider
            variant="middle"
            sx={{ width: '40%', justifySelf: 'center' }}
          /> */}
        </Box>
      </Box>
    </Card>
  )
}

export default ApplicationStatus
