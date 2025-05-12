import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button, Typography, Stack, Divider, Link, Box } from '@mui/material'
import { Google as GoogleIcon, GitHub as GitHubIcon } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'

import MainCard from '../components/MainCard'
import PasswordField from '../components/PasswordField'
import TextField from '../components/questions/text/TextField'
import ResetPasswordDialog from '../components/ResetPasswordDialog'

import { Form, Formik } from 'formik'
import { useAuthHandlers } from '../utils/authUtils'

const Login = () => {
  const navigate = useNavigate()
  const handleSignUp = () => {
    navigate('/signup')
  }
  const { initialValues, schema, onSubmit, googleLogin, githubLogin } =
    useAuthHandlers()

  const [openDialog, setOpenDialog] = useState(false)

  const handleDialogClose = () => {
    setOpenDialog(false)
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
                <Link onClick={() => setOpenDialog(true)}>
                  <Typography variant="body2">Forgot password?</Typography>
                </Link>
              </Box>
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
                <Typography>
                  Don't have an account?{' '}
                  <Link onClick={handleSignUp}>Sign up here</Link>
                </Typography>
              </Stack>
            </Stack>
          </Form>
        )}
      </Formik>
    </MainCard>
  )
}

export default Login
