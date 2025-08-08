// React hooks
import { useState } from 'react'

// MUI components
import {
  Stack,
  Typography,
  Box,
  Card,
  Divider,
  IconButton,
  Button,
  Link,
  Tooltip
} from '@mui/material'
import {
  Settings as SettingsIcon,
  Google as GoogleIcon,
  GitHub as GitHubIcon
} from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'

// Hooks and services
import { Form, Formik } from 'formik'
import { useAuthHandlers } from '../../utils/authUtils'
import { useUser } from '../../hooks/useUser'

// Components
import ResetPasswordDialog from '../dialogs/ResetPasswordDialog'
import ProfilePicture from '../ProfilePicture'
import LoggedUserProfile from '../profile/LoggedUserProfile'
import TextField from '../questions/text/TextField'
import PasswordField from '../PasswordField'

// Assets
import logo from '../../assets/logo.png'

const ProfileWidget = () => {
  const { user } = useUser()
  const {
    initialValues,
    schema,
    onSubmit,
    googleLogin,
    githubLogin,
    orcidLogin
  } = useAuthHandlers()

  const [openPasswordDialog, setOpenPasswordDialog] = useState(false)
  const handleDialogClose = () => {
    setOpenPasswordDialog(false)
  }

  const [openSettingsDialog, setOpenSettingsDialog] = useState(false)
  return (
    <Card
      sx={{
        height: 'max-content',
        minWidth: 'max-content'
      }}
    >
      {user ? (
        /* Logged in user */
        <Stack spacing={0.5} px={2} pb={2} pt={1}>
          <IconButton
            sx={{ alignSelf: 'end' }}
            onClick={() => setOpenSettingsDialog(true)}
          >
            <Tooltip title="Account Settings">
              <SettingsIcon color="primary" />
            </Tooltip>
          </IconButton>

          <LoggedUserProfile
            openDialog={openSettingsDialog}
            setOpenDialog={setOpenSettingsDialog}
          />

          <ProfilePicture
            img={user.profilePicture}
            size={120}
            borderRadius={100}
            props={{ alignSelf: 'center' }}
          />

          <Typography
            fontSize={18}
            fontWeight={'regular'}
            lineHeight={1.2}
            sx={{ pt: 1 }}
          >
            {user.displayName}
          </Typography>
          <Typography fontSize={14} color="secondary">
            @{user.username}
          </Typography>
          <Stack
            direction={'row'}
            spacing={1}
            alignItems={'center'}
            divider={<Divider orientation="vertical" flexItem />}
          >
            <Typography variant="body2" color="text.secondary">
              {user.affiliation}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.title}
            </Typography>
          </Stack>

          <Typography
            variant="subtitle2"
            fontWeight={'regular'}
            color="text.secondary"
          >
            {user.profileDescription}
          </Typography>
        </Stack>
      ) : (
        /* Not logged in */

        <Formik
          initialValues={initialValues}
          validationSchema={schema}
          onSubmit={onSubmit}
        >
          {({ isSubmitting, values, setSubmitting, resetForm }) => (
            <Form>
              <Stack spacing={1} alignItems={'center'} p={2}>
                <Box
                  component="img"
                  src={logo}
                  alt="accel-ai-logo"
                  sx={{
                    height: 60,
                    width: 'auto',
                    objectFit: 'cover'
                  }}
                />
                <Typography variant="h6">Log In</Typography>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  variant="standard"
                  size="small"
                  fullWidth
                />
                <PasswordField
                  label="Password"
                  name="password"
                  variant="standard"
                  size="small"
                  required
                  fullWidth
                />

                <Link
                  onClick={() => setOpenPasswordDialog(true)}
                  sx={{ alignSelf: 'start', cursor: 'pointer' }}
                >
                  <Typography variant="body2">Forgot password?</Typography>
                </Link>
                <ResetPasswordDialog
                  {...{
                    values,
                    isSubmitting,
                    setSubmitting,
                    resetForm,
                    openPasswordDialog,
                    handleDialogClose
                  }}
                />
                <LoadingButton
                  variant="contained"
                  type="submit"
                  size="small"
                  loading={isSubmitting}
                >
                  Log in
                </LoadingButton>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ py: 1 }}
                >
                  Or log in with
                </Typography>
                <Stack spacing={1} sx={{ width: 1 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={<GoogleIcon />}
                    sx={{ width: '100%' }}
                    onClick={googleLogin}
                  >
                    Continue with Google
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={<GitHubIcon />}
                    sx={{ width: '100%' }}
                    onClick={githubLogin}
                  >
                    Continue with Github
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        width={20}
                        height={20}
                        style={{ display: 'block' }}
                      >
                        <path
                          fill="currentColor"
                          d="M294.7 188.2l-45.9 0 0 153.8 47.5 0c67.6 0 83.1-51.3 83.1-76.9 0-41.6-26.5-76.9-84.7-76.9zM256 8a248 248 0 1 0 0 496 248 248 0 1 0 0-496zM175.2 368.8l-29.8 0 0-207.5 29.8 0 0 207.5zM160.3 98.5a19.6 19.6 0 1 1 0 39.2 19.6 19.6 0 1 1 0-39.2zM300 369l-81 0 0-207.7 80.6 0c76.7 0 110.4 54.8 110.4 103.9 0 53.3-41.7 103.9-110 103.9z"
                        />
                      </svg>
                    }
                    sx={{ width: '100%' }}
                    onClick={orcidLogin}
                  >
                    Continue with ORCID
                  </Button>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign={'center'}
                    sx={{ pt: 1 }}
                  >
                    Don't have an account?{' '}
                    <Link href="/signup">Sign up here</Link>
                  </Typography>
                </Stack>
              </Stack>
            </Form>
          )}
        </Formik>
      )}
    </Card>
  )
}

export default ProfileWidget
