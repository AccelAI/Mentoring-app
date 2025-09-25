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
import { getOrCreateChatRoom } from '../../api/chat'

// Components
import UserGrid from './UserGrid'
import EndMentorshipDialog from '../dialogs/EndMentorshipDialog'

const CurrentMentor = ({ mentorData, loadingMentor, onStartChat }) => {
  const { user, loading } = useUser()

  const [openEndMentorshipDialog, setOpenEndMentorshipDialog] = useState(false)
  const [loadingChat, setLoadingChat] = useState(false)

  const handleStartChat = async () => {
    if (!user?.uid || !mentorData?.uid) return

    setLoadingChat(true)
    try {
      const result = await getOrCreateChatRoom(user.uid, mentorData.uid)
      if (result.ok && onStartChat) {
        onStartChat(result.chatRoomId)
      }
    } catch (error) {
      console.error('Error starting chat:', error)
    } finally {
      setLoadingChat(false)
    }
  }

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
            <Grid
              container
              sx={{ justifyContent: 'space-between' }}
              spacing={1}
            >
              {mentorData && (
                <>
                  <Grid
                    sx={{ width: { md: '-webkit-fill-available', lg: '60%' } }}
                  >
                    <Stack
                      justifyContent={{
                        lg: 'space-around',
                        md: 'space-between',
                        sx: 'space-around'
                      }}
                      height="100%"
                      spacing={2}
                      direction={{ md: 'row', sx: 'column', lg: 'column' }}
                    >
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
                        direction={{ lg: 'row', xs: 'column' }}
                        alignItems={{ lg: 'center', xs: 'flex-start' }}
                        justifyContent="space-between"
                        spacing={{ lg: 2, xs: 0.5 }}
                        pt={{ lg: 0, xs: 1 }}
                      >
                        <Button
                          variant="contained"
                          color="primary"
                          width="-webkit-fill-available"
                          size="small"
                          startIcon={<ChatIcon />}
                          onClick={handleStartChat}
                          disabled={loadingChat}
                        >
                          {loadingChat ? 'Starting...' : 'Chat with Mentor'}
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
                    gridSize={4}
                    showViewProfileButton={true}
                    cardProps={{
                      width: { lg: 'auto', xs: '-webkit-fill-available' }
                    }}
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
