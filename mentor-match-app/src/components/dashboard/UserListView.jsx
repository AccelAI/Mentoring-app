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
  SchoolRounded as SchoolIcon,
  ErrorOutline as ErrorIcon
} from '@mui/icons-material'

// Components
import SearchBar from './SearchBar'
import MentorshipFormDialog from '../dialogs/MentorshipFormDialog'
import UserGrid from './UserGrid'

// Hooks and services
import { filterUsers } from '../../api/users'
import { useUser } from '../../hooks/useUser'

const UserListView = ({
  usersList,
  title = 'All Mentors & Mentees',
  subtitle,
  gridSize,
  listType,
  showMentorshipButton,
  showSearchBar,
  showSelectAsMentorButton,
  showChatButton,
  showViewProfileButton,
  showEndMentorshipButton
}) => {
  const [openDialog, setOpenDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const filteredUsers = Array.isArray(usersList)
    ? filterUsers(searchQuery, usersList)
    : []
  const { user, loading } = useUser()

  const isDashboard = listType === 'dashboard'
  const isMentorPick = listType === 'mentor-pick'
  const isCurrentMentees = listType === 'currentMentees'

  const showMentorship = isDashboard || showMentorshipButton
  const showSearch = isDashboard || isCurrentMentees || showSearchBar
  const showProfile = isMentorPick || showViewProfileButton
  const showSelectMentor = isMentorPick || showSelectAsMentorButton
  const showChat = isCurrentMentees || showChatButton
  const showEndMentorship = isCurrentMentees || showEndMentorshipButton

  return (
    <Card
      sx={{
        width: loading ? '-webkit-fill-available' : '100%',
        maxHeight: '75vh',
        minWidth: { lg: '835px' },
        overflowY: 'auto'
      }}
    >
      <Box px={3} py={2}>
        {loading ? (
          <Box display={'flex'} justifyContent="center" alignItems="center">
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={subtitle ? 0 : 1.5}>
            <Stack
              direction={'row'}
              justifyContent={'flex-end'}
              spacing={2}
              alignItems={'center'}
              sx={{ pb: 1 }}
            >
              <Typography variant={'h6'} fontWeight={'light'}>
                {title}
              </Typography>
              <Box flexGrow={1} />
              {showSearch && <SearchBar setSearchQuery={setSearchQuery} />}
              {user && showMentorship && (
                <Button
                  variant={'contained'}
                  onClick={() => setOpenDialog(true)}
                  startIcon={<SchoolIcon />}
                  size="small"
                >
                  Mentorship Program
                </Button>
              )}
              {/*               {showManageMenteesButton && (
                <Tooltip title="Manage Mentees">
                  <IconButton
                    color="secondary"
                    sx={{ height: 'min-content' }}
                    onClick={() => setOpenDialog(true)}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              )} */}
              <MentorshipFormDialog
                openDialog={openDialog}
                setOpenDialog={setOpenDialog}
              />
            </Stack>
            {subtitle && (
              <Typography
                variant={'body2'}
                color="text.secondary"
                sx={{ pb: 1.5 }}
              >
                {subtitle}
              </Typography>
            )}

            <Box flexGrow={1}>
              <Grid container spacing={2}>
                {usersList &&
                  filteredUsers.map((user, i) => (
                    <UserGrid
                      key={i}
                      user={user}
                      gridSize={gridSize}
                      showSelectAsMentorButton={showSelectMentor}
                      showChatButton={showChat}
                      showViewProfileButton={showProfile}
                      showEndMentorshipButton={showEndMentorship}
                    />
                  ))}
                {(!usersList || usersList.length === 0) && (
                  <Grid size={12} display="flex" justifyContent="center" py={5}>
                    <Stack direction={'row'} spacing={1} alignItems="center">
                      <ErrorIcon color="error" />
                      <Typography variant="h6" fontWeight={'regular'}>
                        No users found
                      </Typography>
                    </Stack>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Stack>
        )}
      </Box>
    </Card>
  )
}

export default UserListView
