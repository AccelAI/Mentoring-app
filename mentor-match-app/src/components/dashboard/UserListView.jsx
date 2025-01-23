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

const UserListView = ({ usersList }) => {
  const [openDialog, setOpenDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const filteredUsers = filterUsers(searchQuery, usersList)
  const { user } = useUser()

  return (
    <Card
      sx={{
        width: '100%',
        height: '75vh',
        overflow: 'auto'
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
              All Mentors & Mentees
            </Typography>
            <Box flexGrow={1} />
            <SearchBar setSearchQuery={setSearchQuery} />
            {user && (
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

          <Box flexGrow={1}>
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
