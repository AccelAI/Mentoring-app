import { useState, useEffect, useRef } from 'react'
import {
  Grid2 as Grid,
  Stack,
  Typography,
  Box,
  Card,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  DeleteForever as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material'
import ProfilePicture from '../ProfilePicture'
import { useTheme } from '@mui/material/styles'
import { getUserById } from '../../api/users'
import EndMentorshipDialog from '../dialogs/EndMentorshipDialog'
import UserProfileDialog from '../profile/UserProfileDialog'
import CreateNewMatchDialog from '../dialogs/CreateNewMatchDialog'

const MatchGrid = ({ menteeId, mentorId, gridSize = 4, setReloadList }) => {
  const [mentee, setMentee] = useState(null)
  const [mentor, setMentor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [endMentorshipDialogOpen, setEndMentorshipDialogOpen] = useState(false)
  const [menteeProfileOpen, setMenteeProfileOpen] = useState(false)
  const [mentorProfileOpen, setMentorProfileOpen] = useState(false)
  const [openCreateMatchDialog, setOpenCreateMatchDialog] = useState(false)
  const wasDialogOpen = useRef(false) // track previous state

  useEffect(() => {
    const fetchUserData = async () => {
      const menteeData = await getUserById(menteeId)
      const mentorData = await getUserById(mentorId)
      setMentee(menteeData)
      setMentor(mentorData)
      console.log('Setting loading to false, fetched data:', {
        menteeData,
        mentorData
      })
      setLoading(false)
    }
    fetchUserData()
  }, [menteeId, mentorId])

  useEffect(() => {
    if (wasDialogOpen.current && !endMentorshipDialogOpen) {
      console.log('EndMentorshipDialog closed, refreshing list')
      setReloadList(true)
    }
    wasDialogOpen.current = endMentorshipDialogOpen
  }, [endMentorshipDialogOpen, setReloadList])

  const theme = useTheme()
  const borderColor = theme.palette.background.paper
  return (
    <Grid size={gridSize}>
      <Card
        sx={{
          height: '100%'
        }}
        variant="outlined"
      >
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={1} p={2} sx={{ height: '100%' }}>
            <Stack spacing={2} sx={{ height: '100%' }}>
              <Box alignSelf="center" display="flex">
                <ProfilePicture
                  img={mentor?.profilePicture}
                  size={60}
                  borderRadius={100}
                />
                <ProfilePicture
                  img={mentee?.profilePicture}
                  size={60}
                  borderRadius={100}
                  props={{
                    mt: 3,
                    ml: -2,
                    border: `3px solid ${borderColor}`
                  }}
                />
              </Box>
              <Stack spacing={1}>
                <Stack spacing={0.1}>
                  <Typography variant="caption">Mentor</Typography>
                  <Tooltip title="View Profile">
                    <Typography
                      variant="body2"
                      sx={{
                        '&:hover': {
                          cursor: 'pointer',
                          color: 'primary.main',
                          fontWeight: 'medium'
                        }
                      }}
                      onClick={() => setMentorProfileOpen(true)}
                    >
                      {mentor?.displayName}
                    </Typography>
                  </Tooltip>
                </Stack>
                <UserProfileDialog
                  openDialog={mentorProfileOpen}
                  setOpenDialog={setMentorProfileOpen}
                  userId={mentor.uid}
                  showChatButton={false}
                  showEndMentorshipButton={false}
                  showSelectAsMentorButton={false}
                />
                <Stack spacing={0.1}>
                  <Typography variant="caption">Mentee</Typography>
                  <Tooltip title="View Profile">
                    <Typography
                      variant="body2"
                      sx={{
                        '&:hover': {
                          cursor: 'pointer',
                          color: 'primary.main',
                          fontWeight: 'medium'
                        }
                      }}
                      onClick={() => setMenteeProfileOpen(true)}
                    >
                      {mentee?.displayName}
                    </Typography>
                  </Tooltip>
                </Stack>
                <UserProfileDialog
                  openDialog={menteeProfileOpen}
                  setOpenDialog={setMenteeProfileOpen}
                  userId={mentee.uid}
                  showChatButton={false}
                  showEndMentorshipButton={false}
                  showSelectAsMentorButton={false}
                />
              </Stack>
            </Stack>
            <Box alignSelf={'flex-end'} maxHeight={'min-content'}>
              <Tooltip title="Reassign Mentorship">
                <IconButton onClick={() => setOpenCreateMatchDialog(true)}>
                  <EditIcon fontSize="small" color="primary" />
                </IconButton>
              </Tooltip>
              <Tooltip title="End Mentorship">
                <IconButton onClick={() => setEndMentorshipDialogOpen(true)}>
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </Tooltip>
            </Box>
            <CreateNewMatchDialog
              open={openCreateMatchDialog}
              onClose={() => setOpenCreateMatchDialog(false)}
              setReloadList={setReloadList}
              mentor={mentor}
              mentee={mentee}
            />
            <EndMentorshipDialog
              openDialog={endMentorshipDialogOpen}
              setOpenDialog={setEndMentorshipDialogOpen}
              menteeId={menteeId}
              mentorId={mentorId}
            />
          </Stack>
        )}
      </Card>
    </Grid>
  )
}

export default MatchGrid
