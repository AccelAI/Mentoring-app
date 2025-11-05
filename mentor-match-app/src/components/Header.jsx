import { useState } from 'react'
import {
  AppBar,
  Box,
  Container,
  IconButton,
  Toolbar,
  Tooltip,
  Stack,
  Button,
  Divider
} from '@mui/material'
import {
  Logout,
  DarkModeOutlined as DarkMode,
  LightModeOutlined as LightMode,
  Dashboard as DashboardIcon,
  Preview as PreviewIcon
} from '@mui/icons-material'
import logo from '../assets/logo.png'
import { signOut } from '../api/auth'
import { useThemeContext } from '../hooks/useTheme'
import { useUser } from '../hooks/useUser'
import { useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import SurveySettingsDialog from './dialogs/SurveySettingsDialog'

const Header = ({ props }) => {
  const { user } = useUser()
  const navigate = useNavigate()
  const { mode, toggleColorMode } = useThemeContext()
  const { enqueueSnackbar } = useSnackbar()
  const [openSurveyDialog, setOpenSurveyDialog] = useState(false)

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
    <>
      <AppBar
        position="sticky"
        sx={{ backgroundColor: 'background.paper', ...props }}
      >
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
            <Stack direction="row" spacing={0.5}>
              {user?.isAdmin && location.pathname === '/admin' && (
                <Tooltip title="Return to User Dashboard">
                  <IconButton
                    color="primary"
                    onClick={() => navigate('/dashboard')}
                  >
                    <DashboardIcon />
                  </IconButton>
                </Tooltip>
              )}
              {user?.isAdmin && location.pathname.includes('/survey/edit/') && (
                <Stack direction="row" spacing={1} pr={1} alignItems="center">
                  <Button onClick={() => setOpenSurveyDialog(true)}>
                    Post Survey
                  </Button>
                  <Divider orientation="vertical" flexItem />
                  <Tooltip title="See Live Survey">
                    <IconButton
                      color="primary"
                      onClick={() => {
                        const id = location.pathname.split('/').pop()
                        window.open(
                          `${window.location.origin}/survey/${id}`,
                          '_blank',
                          'noopener,noreferrer'
                        )
                      }}
                    >
                      <PreviewIcon />
                    </IconButton>
                  </Tooltip>
                  <Divider orientation="vertical" flexItem />
                </Stack>
              )}
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
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>
      <SurveySettingsDialog
        open={openSurveyDialog}
        onClose={() => setOpenSurveyDialog(false)}
      />
    </>
  )
}

export default Header
