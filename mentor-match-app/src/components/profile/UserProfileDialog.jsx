// React hooks
import { useState, useEffect } from 'react'

// MUI components
import {
  Dialog,
  DialogContent,
  Button,
  Typography,
  CircularProgress,
  Box,
  Stack,
  Divider,
  Link,
  IconButton
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import {
  Business as BusinessIcon,
  Language as LanguageIcon,
  LocationOn as LocationIcon,
  Link as LinkIcon,
  SchoolRounded as SchoolIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  ChatOutlined as ChatIcon,
  Email as EmailIcon,
  Cancel as CancelIcon
} from '@mui/icons-material'

// Hooks and services
import { useUser } from '../../hooks/useUser'
import { getFormAnswers } from '../../api/forms'
import { asignMatch } from '../../api/match'
import { useSnackbar } from 'notistack'
import { getOrCreateChatRoom } from '../../api/chat'

// Components
import ProfilePicture from '../ProfilePicture'
import EndMentorshipDialog from '../dialogs/EndMentorshipDialog'

const UserProfileDialog = ({
  openDialog,
  setOpenDialog,
  setOpenMatchDialog,
  userId,
  showSelectAsMentorButton,
  showChatButton,
  showEndMentorshipButton,
  onStartChat
}) => {
  const [user, setUser] = useState({})
  const [loading, setLoading] = useState(true)
  const [loadingMatch, setLoadingMatch] = useState(false)
  const [loadingChat, setLoadingChat] = useState(false)
  const { userList, user: loggedUser, refreshUser } = useUser()
  const [formAnswers, setFormAnswers] = useState({})
  const { enqueueSnackbar } = useSnackbar()

  const [openEndMentorshipDialog, setOpenEndMentorshipDialog] = useState(false)

  useEffect(() => {
    if (openDialog) {
      const fetchUser = async () => {
        const res = userList.find((user) => user.uid === userId)
        console.log('user', res)
        setUser(res)

        if (loggedUser) {
          const ans = await getFormAnswers(userId)
          console.log('formAnswers', ans)
          setFormAnswers(ans)
        }
        setLoading(false)
      }
      fetchUser()
    }
  }, [openDialog, userId, userList, loggedUser])

  const handleMatch = async () => {
    setLoadingMatch(true)
    const res = await asignMatch(loggedUser.uid, userId)
    if (res.ok) {
      refreshUser() // Refresh the logged-in user's data
      setOpenDialog(false)
      setTimeout(() => {
        setOpenMatchDialog(true) // Open the match dialog after a delay
      }, 600)
    } else {
      console.error('Error assigning match:', res.error)
      enqueueSnackbar('Error assigning match', {
        variant: 'error'
      })
    }
  }

  const handleStartChat = async () => {
    if (!loggedUser?.uid || !userId) return

    setLoadingChat(true)
    try {
      const result = await getOrCreateChatRoom(loggedUser.uid, userId)
      if (result.ok) {
        setOpenDialog(false)
        // Call the callback to open chat drawer
        if (onStartChat) {
          onStartChat(result.chatRoomId)
        }
        enqueueSnackbar('Chat started successfully!', { variant: 'success' })
      } else {
        enqueueSnackbar('Failed to start chat: ' + result.error, {
          variant: 'error'
        })
      }
    } catch (error) {
      console.error('Error starting chat:', error)
      enqueueSnackbar('Error starting chat', { variant: 'error' })
    } finally {
      setLoadingChat(false)
    }
  }

  return (
    <>
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth={'md'}
        fullWidth
      >
        <DialogContent>
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              pt={2}
            >
              <CircularProgress />
            </Box>
          ) : (
            <Stack
              //alignItems={'center'}
              sx={{ width: '100%' }}
              spacing={1}
              pb={5}
            >
              <IconButton
                onClick={() => {
                  setOpenDialog(false)
                }}
                color="text.secondary"
                sx={{ alignSelf: 'flex-end' }}
              >
                <CloseIcon />
              </IconButton>
              <Stack direction="row" spacing={2} width={'100%'} pr={6} pl={2}>
                <Stack
                  width={'35%'}
                  alignItems={'center'}
                  justifyContent={'space-between'}
                  pl={1}
                >
                  <ProfilePicture
                    img={user.profilePicture}
                    size={200}
                    borderRadius={100}
                    props={{ alignSelf: 'center' }}
                  />
                  {showEndMentorshipButton && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<CancelIcon />}
                      onClick={() => {
                        setOpenEndMentorshipDialog(true)
                      }}
                      sx={{ width: 'fit-content', alignSelf: 'start' }}
                    >
                      End Mentorship
                    </Button>
                  )}
                </Stack>

                <Stack spacing={1} width={'65%'}>
                  <Stack
                    direction="row"
                    justifyContent={'space-between'}
                    alignItems={'center'}
                  >
                    <Typography variant={'h6'} fontWeight={'regular'}>
                      {user.displayName}
                    </Typography>

                    {user.role && (
                      <Stack direction="row" spacing={0.5}>
                        <Typography variant={'body2'} color="text.secondary">
                          {user.role}
                        </Typography>
                        <SchoolIcon fontSize="small" color="secondary" />
                      </Stack>
                    )}
                  </Stack>
                  <Divider orientation="horizontal" />

                  {user.profileDescription && (
                    <Typography
                      variant={'body2'}
                      color="text.secondary"
                      py={1.5}
                    >
                      {user.profileDescription}
                    </Typography>
                  )}

                  <Typography variant={'body2'} lineHeight={2}>
                    {user.title && (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <PersonIcon fontSize="small" color="primary" />
                        <span>{user.title}</span>
                      </Stack>
                    )}
                    {user.affiliation && (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <BusinessIcon fontSize="small" color="primary" />
                        <span>Affiliation: {user.affiliation}</span>
                      </Stack>
                    )}
                    {user.location && (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <LocationIcon fontSize="small" color="primary" />
                        <span>Location: {user.location}</span>
                      </Stack>
                    )}

                    {formAnswers.ok && (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <LanguageIcon fontSize="small" color="primary" />
                        <span>
                          Languages:{' '}
                          {formAnswers.mentorData
                            ? formAnswers.mentorData.languages?.join(', ')
                            : formAnswers.menteeData?.languages?.join(', ')}
                        </span>
                      </Stack>
                    )}
                    {user.websiteUrl && (
                      <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems={'center'}
                      >
                        <LinkIcon fontSize="small" color="primary" />
                        <Link
                          color="inherit"
                          target="_blank"
                          rel="noopener"
                          href={user.websiteUrl}
                        >
                          {user.websiteUrl}
                        </Link>
                      </Stack>
                    )}
                    {/* Display the user's email only if the profile is from the match list (if the chat button is enabled) */}
                    {user.email && showChatButton && (
                      <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems={'center'}
                      >
                        <EmailIcon fontSize="small" color="primary" />
                        <span>Email: {user.email}</span>
                      </Stack>
                    )}
                  </Typography>

                  {showChatButton && (
                    <Button
                      variant="contained"
                      size="small"
                      sx={{ width: 'fit-content', alignSelf: 'end' }}
                      startIcon={<ChatIcon />}
                      onClick={handleStartChat}
                      disabled={loadingChat}
                    >
                      {loadingChat ? 'Starting...' : 'Start Chat'}
                    </Button>
                  )}
                  {showSelectAsMentorButton && (
                    <LoadingButton
                      variant="contained"
                      sx={{
                        width: 'fit-content',
                        alignSelf: 'center'
                      }}
                      onClick={handleMatch}
                      loading={loadingMatch}
                    >
                      Choose as mentor
                    </LoadingButton>
                  )}
                </Stack>
              </Stack>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
      <EndMentorshipDialog
        openDialog={openEndMentorshipDialog}
        setOpenDialog={setOpenEndMentorshipDialog}
        userId={userId}
        setOpenProfileDialog={setOpenDialog}
      />
    </>
  )
}

export default UserProfileDialog
