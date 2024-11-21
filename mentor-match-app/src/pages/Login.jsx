import {
  Button,
  Typography,
  Stack,
  Divider,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Link,
  Box
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Google as GoogleIcon, GitHub as GitHubIcon } from '@mui/icons-material'
//import { useThemeContext } from '../hooks/useTheme'
import MainCard from '../components/MainCard'
import PasswordField from '../components/PasswordField'
import TextField from '../components/TextField'
import { Form, Formik } from 'formik'
import * as yup from 'yup'
import { LoadingButton } from '@mui/lab'
import {
  logIn,
  signInWithGoogle,
  signInWithGithub,
  resetPassword
} from '../api/auth'
import { useSnackbar } from 'notistack'

const initialValues = {
  email: '',
  password: '',
  emailPassReset: '' // Add emailPassReset to initialValues
}

const schema = yup.object().shape({
  email: yup
    .string()
    .required('Please enter your email')
    .email('Invalid email'),
  password: yup.string().required('Please enter a password'),
  emailPassReset: yup.string().email('Invalid email') // Add validation for emailPassReset
})

const Login = () => {
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()
  const handleSignUp = () => {
    navigate('/signup')
  }

  const onSubmit = async (user, { setSubmitting }) => {
    setSubmitting(true)

    const res = await logIn(user)

    if (!res.ok) {
      setSubmitting(false)
      return enqueueSnackbar(res.error, { variant: 'error' })
    }

    enqueueSnackbar('Welcome Back', { variant: 'success' })
    navigate('/dashboard')
  }

  const googleLogin = async () => {
    const res = await signInWithGoogle()
    if (!res.ok) {
      return enqueueSnackbar(
        'Failed to log in with Google. Please try again.',
        { variant: 'error' }
      )
    }
    enqueueSnackbar('Welcome Back', { variant: 'success' })
    navigate('/dashboard')
  }

  const githubLogin = async () => {
    const res = await signInWithGithub()
    console.log(res)
    if (!res.ok) {
      return enqueueSnackbar(
        'Failed to log in with Github. Please try again.',
        { variant: 'error' }
      )
    }
    enqueueSnackbar('Welcome Back', { variant: 'success' })
    navigate('/dashboard')
  }

  const [openDialog, setOpenDialog] = useState(false)
  const handleDialogOpen = () => {
    setOpenDialog(true)
  }

  const handleDialogClose = () => {
    setOpenDialog(false)
  }

  const handleResetPassword = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true)
    try {
      const email = values.emailPassReset
      if (!email) {
        enqueueSnackbar('Please enter your email', { variant: 'error' })
        setSubmitting(false)
        return
      }
      await resetPassword(email)
      enqueueSnackbar('Password reset email sent', { variant: 'success' })
      handleDialogClose()
      resetForm({ values: { ...values, emailPassReset: '' } })
    } catch (error) {
      enqueueSnackbar('Failed to reset password', { variant: 'error' })
      console.error(error)
    }
    setSubmitting(false)
  }

  return (
    <MainCard
      title={'Welcome Back!'}
      titleSize={'h4'}
      props={{ height: '100vh' }}
      enableContainer={true}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={schema}
        onSubmit={onSubmit}
      >
        {({ isSubmitting, values, setSubmitting, resetForm }) => (
          <Form>
            <Stack spacing={2.5} sx={{ alignItems: 'center', width: '100%' }}>
              <Typography variant="body1">Log in to your account</Typography>
              <TextField
                label="Email"
                name="email"
                type="email"
                variant="outlined"
                required
                sx={{ width: '100%' }}
              />
              <Box width={'100%'}>
                <PasswordField
                  label="Password"
                  name="password"
                  variant="outlined"
                  required
                  sx={{ width: '100%', pb: 1 }}
                />
                <Link onClick={handleDialogOpen}>
                  <Typography variant="body2">Forgot password?</Typography>
                </Link>
              </Box>
              <Dialog open={openDialog} onClose={handleDialogClose}>
                <DialogTitle>{'Password Reset'}</DialogTitle>
                <DialogContent dividers>
                  <Stack spacing={2}>
                    <Typography>
                      Please enter your email address below and we will send you
                      a link to reset your password.
                    </Typography>
                    <TextField
                      label="Email"
                      name="emailPassReset"
                      type="email"
                      sx={{ width: '100%' }}
                    />
                  </Stack>
                </DialogContent>
                <DialogActions>
                  <LoadingButton
                    variant="contained"
                    onClick={() =>
                      handleResetPassword(values, { setSubmitting, resetForm })
                    }
                    loading={isSubmitting}
                  >
                    Reset password
                  </LoadingButton>
                </DialogActions>
              </Dialog>
              <LoadingButton
                variant="contained"
                type="submit"
                sx={{ width: '100%' }}
                loading={isSubmitting}
              >
                Log in
              </LoadingButton>

              <Divider>Or</Divider>
              <Stack spacing={1} sx={{ width: 1 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<GoogleIcon />}
                  sx={{ width: '100%' }}
                  onClick={googleLogin}
                >
                  Continue with Google
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<GitHubIcon />}
                  sx={{ width: '100%' }}
                  onClick={githubLogin}
                >
                  Continue with Github
                </Button>
              </Stack>

              <Stack
                direction="row"
                spacing={1}
                sx={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                <Typography>Don't have an account?</Typography>
                <Button onClick={handleSignUp} variant="text" color="primary">
                  Sign up here
                </Button>
              </Stack>
            </Stack>
          </Form>
        )}
      </Formik>
    </MainCard>
  )
}

export default Login
