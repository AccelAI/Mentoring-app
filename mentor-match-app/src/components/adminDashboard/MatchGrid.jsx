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
import { DeleteForever as DeleteIcon } from '@mui/icons-material'
import ProfilePicture from '../ProfilePicture'
import { useTheme } from '@mui/material/styles'
import { getUserById } from '../../api/users'
import EndMentorshipDialog from '../dialogs/EndMentorshipDialog'

const MatchGrid = ({ menteeId, mentorId, gridSize = 4, setReloadList }) => {
  const [mentee, setMentee] = useState(null)
  const [mentor, setMentor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [endMentorshipDialogOpen, setEndMentorshipDialogOpen] = useState(false)
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
          height: '100%',
          transition: 'box-shadow 0.3s',
          '&:hover': {
            boxShadow: 2,
            cursor: 'pointer'
          }
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
                  <Typography variant="body2">{mentor?.displayName}</Typography>
                </Stack>
                <Stack spacing={0.1}>
                  <Typography variant="caption">Mentee</Typography>
                  <Typography variant="body2">{mentee?.displayName}</Typography>
                </Stack>
              </Stack>
            </Stack>
            <Box alignSelf={'flex-end'} maxHeight={'min-content'}>
              <Tooltip title="End Mentorship">
                <IconButton onClick={() => setEndMentorshipDialogOpen(true)}>
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </Tooltip>
            </Box>
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
