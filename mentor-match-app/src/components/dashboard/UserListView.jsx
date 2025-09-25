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
import SearchBar from '../SearchBar'
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
  showEndMentorshipButton,
  showApplicationButton,
  onStartChat
}) => {
  const [openDialog, setOpenDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const filteredUsers = Array.isArray(usersList)
    ? filterUsers(searchQuery, usersList)
        .slice()
        .sort((a, b) => {
          const nameA = a.displayName.toLowerCase()
          const nameB = b.displayName.toLowerCase()
          return nameA.localeCompare(nameB)
        })
    : []
  const { user, loading } = useUser()
  const isDashboard = listType === 'dashboard'
  const isMentorPick = listType === 'mentorPick'
  const isCurrentMentees = listType === 'currentMentees'
  const isAdmin = listType === 'admin'

  const showSearch = isDashboard || isCurrentMentees || isAdmin || showSearchBar
  const showProfile = isMentorPick || showViewProfileButton
  const showSelectMentor = isMentorPick || showSelectAsMentorButton
  const showChat = isCurrentMentees || isAdmin || showChatButton
  const showEndMentorship = isCurrentMentees || showEndMentorshipButton
  const showApplication = isCurrentMentees || showApplicationButton

  return (
    <Card
      sx={{
        width: loading ? '-webkit-fill-available' : '100%',
        maxWidth:
          isMentorPick || isAdmin ? 'none' : { lg: 'min-content', sm: '100%' },
        maxHeight: isAdmin ? 'max-content' : '75vh',
        minWidth: isMentorPick || isAdmin ? undefined : { lg: '835px' },
        overflowY: isAdmin ? 'hidden' : 'auto'
      }}
      elevation={isAdmin ? 0 : 1}
    >
      <Box px={isAdmin ? 0 : 3} py={isAdmin ? 0 : 2}>
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
              {user && showMentorshipButton && (
                <Button
                  variant={'contained'}
                  onClick={() => setOpenDialog(true)}
                  startIcon={<SchoolIcon />}
                  size="small"
                >
                  Mentorship Program
                </Button>
              )}
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
                      showApplicationButton={showApplication}
                      onStartChat={onStartChat}
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
