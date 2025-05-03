import React, { useState } from 'react'
import {
  Box,
  Card,
  Grid2 as Grid,
  Stack,
  Button,
  Typography
} from '@mui/material'
import { SchoolRounded as SchoolIcon } from '@mui/icons-material'
import SearchBar from './SearchBar'
import MentorshipFormDialog from '../MentorshipFormDialog'
import UserGrid from './UserGrid'
import { filterUsers } from '../../api/users'
import { useUser } from '../../hooks/useUser'

const UserListView = ({
  usersList,
  title = 'All Mentors & Mentees',
  showMentorshipButton = true,
  showSearchBar = true,
  enableSelect = false
}) => {
  const [openDialog, setOpenDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const filteredUsers = filterUsers(searchQuery, usersList)
  const { user } = useUser()

  return (
    <Card
      sx={{
        width: '100%',
        maxHeight: '75vh'
      }}
    >
      <Box px={3} py={2}>
        <Stack spacing={1.5}>
          <Stack
            direction={'row'}
            justifyContent={'flex-end'}
            spacing={2}
            alignContent={'center'}
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
            <MentorshipFormDialog
              openDialog={openDialog}
              setOpenDialog={setOpenDialog}
            />
          </Stack>

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
                    enableSelect={enableSelect}
                  />
                ))}
            </Grid>
          </Box>
        </Stack>
      </Box>
    </Card>
  )
}

export default UserListView
