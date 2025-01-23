import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { useUser } from '../../hooks/useUser'
import logo from '../../assets/logo.png'
import PasswordField from '../PasswordField'
import TextField from '../questions/text/TextField'
import { Form, Formik } from 'formik'
import { useAuthHandlers } from '../../utils/authUtils'
import { LoadingButton } from '@mui/lab'
import ResetPasswordDialog from '../ResetPasswordDialog'

const ProfileWidget = () => {
  const { user } = useUser()
  const navigate = useNavigate()
  const { initialValues, schema, onSubmit, googleLogin, githubLogin } =
    useAuthHandlers()

  const [openDialog, setOpenDialog] = useState(false)

  const handleDialogClose = () => {
    setOpenDialog(false)
  }
  return (
    <Card
      sx={{
        width: { md: user ? '28%' : '36%', xs: '100%' },
        height: 'max-content'
      }}
    >
      {user ? (
        /* Logged in user */
        <Stack spacing={0.5} px={2} pb={2} pt={1}>
          <IconButton
            sx={{ alignSelf: 'end' }}
            onClick={() => navigate('/profile-settings')}
          >
            <Tooltip title="Profile Settings">
              <SettingsIcon color="primary" />
            </Tooltip>
          </IconButton>

          <Box
            component="img"
            src={
              user.profilePicture
                ? user.profilePicture
                : 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'
            }
            alt="profile-picture"
            sx={{
              height: '120px',
              width: '120px',
              borderRadius: '100%',
              objectFit: 'cover',
              alignSelf: 'center'
            }}
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
                  onClick={() => setOpenDialog(true)}
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
                    openDialog,
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
