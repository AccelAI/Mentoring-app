import React, { useState } from 'react'
import {
  Box,
  Card,
  Grid2 as Grid,
  Stack,
  Button,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  SchoolRounded as SchoolIcon,
  Edit as EditIcon
} from '@mui/icons-material'
import SearchBar from './SearchBar'
import MentorshipFormDialog from '../MentorshipFormDialog'
import UserGrid from './UserGrid'
import { filterUsers } from '../../api/users'
import { useUser } from '../../hooks/useUser'

const UserListView = ({
  usersList,
  title = 'All Mentors & Mentees',
  subtitle,
  showMentorshipButton = true,
  showSearchBar = true,
  showSelectAsMentorButton = false,
  showChatButton = false,
  showViewProfileButton = false,
  showManageMenteesButton = false
}) => {
  const [openDialog, setOpenDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const filteredUsers = filterUsers(searchQuery, usersList)
  const { user, loading } = useUser()

  return (
    <Card
      sx={{
        width: loading ? '-webkit-fill-available' : '100%',
        maxHeight: '75vh'
      }}
    >
      <Box px={3} py={2}>
        {loading ? (
          <Box display={'flex'} justifyContent="center" alignItems="center">
            <CircularProgress />
          </Box>
        ) : usersList.length === 0 ? (
          <Box display={'flex'} justifyContent="center" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              No users found.
            </Typography>
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
              {showSearchBar && <SearchBar setSearchQuery={setSearchQuery} />}
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
              {showManageMenteesButton && (
                <Tooltip title="Manage Mentees">
                  <IconButton
                    color="secondary"
                    sx={{ height: 'min-content' }}
                    onClick={() => setOpenDialog(true)}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
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

            <Box flexGrow={1} sx={{ overflowY: 'auto' }}>
              <Grid container spacing={2}>
                {usersList &&
                  filteredUsers.map((user, i) => (
                    <UserGrid
                      key={i}
                      id={user.id}
                      name={user.displayName}
                      affiliation={user.affiliation}
                      role={user.role}
                      location={user.location}
                      image={user.profilePicture}
                      showSelectAsMentorButton={showSelectAsMentorButton}
                      showChatButton={showChatButton}
                      showViewProfileButton={showViewProfileButton}
                    />
                  ))}
              </Grid>
            </Box>
          </Stack>
        )}
      </Box>
    </Card>
  )
}

export default UserListView
