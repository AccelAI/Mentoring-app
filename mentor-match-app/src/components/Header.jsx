import React from 'react'
import {
  AppBar,
  Box,
  Container,
  IconButton,
  Toolbar,
  Tooltip,
  Button,
  Stack
} from '@mui/material'
import {
  Logout,
  DarkModeOutlined as DarkMode,
  LightModeOutlined as LightMode
} from '@mui/icons-material'
import logo from '../assets/logo.png'
import { signOut } from '../api/auth'
import { useThemeContext } from '../hooks/useTheme'
import { useUser } from '../hooks/useUser'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSnackbar } from 'notistack'

const Header = () => {
  const { user } = useUser()
  const navigate = useNavigate()
  const location = useLocation()
  const { mode, toggleColorMode } = useThemeContext()
  const { enqueueSnackbar } = useSnackbar()

  const handleLogoClick = () => {
    navigate('/')
  }

  const handleSignOut = () => {
    try {
      signOut()
      enqueueSnackbar('Logged out successfully', { variant: 'success' })
      navigate('/')
    } catch (error) {
      enqueueSnackbar('Failed to log out', { variant: 'error' })
    }
  }

  return (
    <AppBar position="sticky" sx={{ backgroundColor: 'background.paper' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box
            component="img"
            src={logo}
            alt="logo"
            sx={{ height: '50px', width: '50px', cursor: 'pointer' }}
            onClick={handleLogoClick}
          />
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" spacing={2}>
            {user?.isAdmin && (
              <Button
                color="accent"
                variant="outlined"
                onClick={() =>
                  navigate(
                    location.pathname === '/admin' ? '/dashboard' : '/admin'
                  )
                }
              >
                {location.pathname === '/admin'
                  ? 'User Dashboard'
                  : 'Admin Dashboard'}
              </Button>
            )}

            <Box>
              <Tooltip title="Toggle Theme">
                <IconButton
                  color="primary"
                  aria-label="toggle theme"
                  onClick={toggleColorMode}
                >
                  {mode === 'light' ? <DarkMode /> : <LightMode />}
                </IconButton>
              </Tooltip>
              {user && (
                <Tooltip title="Log out">
                  <IconButton
                    color="primary"
                    aria-label="logout"
                    onClick={handleSignOut}
                  >
                    <Logout />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default Header
