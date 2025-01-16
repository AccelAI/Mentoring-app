import {
  Container,
  Box,
  AppBar,
  Toolbar,
  Tooltip,
  IconButton,
  Stack,
  Card,
  Button,
  Grid2 as Grid
} from '@mui/material'
import {
  Logout,
  DarkModeOutlined as DarkMode,
  LightModeOutlined as LightMode,
  SchoolRounded as SchoolIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { signOut } from '../api/auth'
import logo from '../assets/logo.png'
import { useThemeContext } from '../hooks/useTheme'
import MentorshipFormDialog from '../components/MentorshipFormDialog'
import SearchBar from '../components/SearchBar'
import UserGrid from '../components/UserGrid'
import ProfileWidget from '../components/ProfileWidget'
import { getUsers } from '../api/userProfile'

const Dashboard = () => {
  const { mode, toggleColorMode } = useThemeContext()
  const navigate = useNavigate()
  const [openDialog, setOpenDialog] = useState(false)
  const [users, setUsers] = useState([])

  useEffect(() => {
    const fetchUsers = async () => {
      const users = await getUsers()
      setUsers(users)
    }
    fetchUsers()
  }, [])

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: 'background.paper' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Box
              component="img"
              src={logo}
              alt="logo"
              sx={{ height: '50px', width: '50px' }}
            />
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Toggle Theme">
                <IconButton
                  color="primary"
                  aria-label="toggle theme"
                  onClick={toggleColorMode}
                >
                  {mode === 'light' ? <DarkMode /> : <LightMode />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Log out">
                <IconButton
                  color="primary"
                  aria-label="logout"
                  onClick={signOut}
                >
                  <Logout />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
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
                <Button
                  variant={'contained'}
                  onClick={() => setOpenDialog(true)}
                  startIcon={<SchoolIcon />}
                >
                  Mentorship Program
                </Button>
                <MentorshipFormDialog
                  openDialog={openDialog}
                  setOpenDialog={setOpenDialog}
                />
              </Stack>
              <Box flexGrow={1} pt={2}>
                <Grid container spacing={2}>
                  {users.map((user, i) => (
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
