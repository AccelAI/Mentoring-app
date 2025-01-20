import {
  Container,
  Box,
  Stack,
  Card,
  Button,
  Grid2 as Grid
} from '@mui/material'
import { SchoolRounded as SchoolIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import MentorshipFormDialog from '../components/MentorshipFormDialog'
import SearchBar from '../components/SearchBar'
import UserGrid from '../components/UserGrid'
import ProfileWidget from '../components/ProfileWidget'
import { getUsers } from '../api/userProfile'
import Header from '../components/Header'
import { useUser } from '../hooks/useUser'

const Dashboard = () => {
  const navigate = useNavigate()
  const [openDialog, setOpenDialog] = useState(false)
  const [users, setUsers] = useState([])
  const { user } = useUser()

  useEffect(() => {
    const fetchUsers = async () => {
      const usersList = await getUsers()
      setUsers(usersList)
    }
    fetchUsers()
  }, [])

  return (
    <>
      <Header />
      <Container sx={{ mt: 8 }}>
        <Stack
          direction={{ md: 'row', xs: 'column' }}
          spacing={6}
          sx={{
            alignItems: 'flex-start'
          }}
        >
          <ProfileWidget />
          <Card
            sx={{
              width: '100%',
              height: '75vh',
              overflow: 'auto'
            }}
          >
            <Box px={3} py={2}>
              <Stack
                direction={'row'}
                justifyContent={'space-between'}
                alignContent={'center'}
              >
                <SearchBar />
                {user && (
                  <Button
                    variant={'contained'}
                    onClick={() => setOpenDialog(true)}
                    startIcon={<SchoolIcon />}
                  >
                    Mentorship Program
                  </Button>
                )}
                <MentorshipFormDialog
                  openDialog={openDialog}
                  setOpenDialog={setOpenDialog}
                />
              </Stack>
              <Box flexGrow={1} pt={2}>
                <Grid container spacing={2}>
                  {users &&
                    users.map((user, i) => (
                      <UserGrid
                        key={i}
                        name={user.display_name}
                        affiliation={user.affiliation}
                        role={'Mentor'}
                        location={user.location}
                        image={user.profilePicture}
                      />
                    ))}
                </Grid>
              </Box>
            </Box>
          </Card>
        </Stack>
      </Container>
    </>
  )
}

export default Dashboard
