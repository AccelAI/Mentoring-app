import React from 'react'
import {
  AppBar,
  Box,
  Container,
  IconButton,
  Toolbar,
  Tooltip
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

const Header = () => {
  const { user } = useUser()
  const { mode, toggleColorMode } = useThemeContext()
  return (
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
            {user && (
              <Tooltip title="Log out">
                <IconButton
                  color="primary"
                  aria-label="logout"
                  onClick={signOut}
                >
                  <Logout />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default Header
