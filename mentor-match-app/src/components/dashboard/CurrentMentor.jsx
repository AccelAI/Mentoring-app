// React hooks
import { useState } from 'react'

// MUI components
import {
  Box,
  Card,
  Grid2 as Grid,
  Stack,
  Button,
  Typography,
  CircularProgress
} from '@mui/material'
import {
  ErrorOutline as ErrorIcon,
  ChatOutlined as ChatIcon,
  Cancel as CancelIcon,
  Today as DateIcon,
  Email as EmailIcon,
  AccountCircle as MentorIcon
} from '@mui/icons-material'

// Hooks and services
import { useUser } from '../../hooks/useUser'

// Components
import UserGrid from './UserGrid'
import EndMentorshipDialog from '../dialogs/EndMentorshipDialog'

const CurrentMentor = ({ mentorData, loadingMentor }) => {
  const { user, loading } = useUser()

  const [openEndMentorshipDialog, setOpenEndMentorshipDialog] = useState(false)

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
          <Stack
            direction={'row'}
            spacing={2}
            alignItems={'center'}
            sx={{ pb: 2 }}
          >
            <Typography variant="h6" fontWeight={'light'}>
              Mentorship Information
            </Typography>
          </Stack>
          {!loadingMentor ? (
            <Grid container spacing={4}>
              {mentorData && (
                <>
                  <Grid size={6}>
                    <Stack justifyContent={'space-around'} height="100%">
                      <Typography
                        variant={'body2'}
                        fontWeight={'regular'}
                        lineHeight={2}
                      >
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          <MentorIcon fontSize="small" color="primary" />
                          <span>Mentor: {mentorData.displayName} </span>
                        </Stack>
                        {mentorData.email && (
                          <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                          >
                            <EmailIcon fontSize="small" color="primary" />
                            <span>Email: {mentorData.email}</span>
                          </Stack>
                        )}
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          <DateIcon fontSize="small" color="primary" />
                          <span>
                            Mentorship Start: {mentorData.mentorshipStartDate}{' '}
                          </span>
                        </Stack>
                      </Typography>
                      <Stack
                        direction={'row'}
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Button
                          variant="contained"
                          color="primary"
                          width="-webkit-fill-available"
                          size="small"
                          startIcon={<ChatIcon />}
                          onClick={() => {
                            // Handle chat with mentor
                          }}
                        >
                          Chat with Mentor
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<CancelIcon />}
                          width="-webkit-fill-available"
                          onClick={() => {
                            setOpenEndMentorshipDialog(true)
                          }}
                        >
                          End Mentorship
                        </Button>
                      </Stack>
                    </Stack>
                  </Grid>
                  <UserGrid
                    user={mentorData}
                    gridSize={6}
                    showViewProfileButton={true}
                  />
                </>
              )}
            </Grid>
          ) : (
            <CircularProgress />
          )}
        </Box>
        {mentorData === null && !loadingMentor && (
          <Grid size={12} display="flex" justifyContent="center" py={5}>
            <Stack direction={'row'} spacing={1} alignItems="center">
              <ErrorIcon color="error" />
              <Typography variant="h6" fontWeight={'regular'}>
                No mentor assigned yet
              </Typography>
            </Stack>
          </Grid>
        )}
      </Box>
      <EndMentorshipDialog
        openDialog={openEndMentorshipDialog}
        setOpenDialog={setOpenEndMentorshipDialog}
        userId={user.mentorId}
      />
    </Card>
  )
}

export default CurrentMentor
