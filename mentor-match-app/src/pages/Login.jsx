import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button, Typography, Stack, Divider, Link, Box } from '@mui/material'
import { Google as GoogleIcon, GitHub as GitHubIcon } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'

import MainCard from '../components/MainCard'
import PasswordField from '../components/inputFields/PasswordField'
import TextField from '../components/inputFields/TextField'
import ResetPasswordDialog from '../components/dialogs/ResetPasswordDialog'

import { Form, Formik } from 'formik'
import { useAuthHandlers } from '../utils/authUtils'

const Login = () => {
  const navigate = useNavigate()
  const handleSignUp = () => {
    navigate('/signup')
  }
  const {
    initialValues,
    schema,
    onSubmit,
    googleLogin,
    githubLogin,
    orcidLogin
  } = useAuthHandlers()

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
                {/* <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<GitHubIcon />}
                  sx={{ width: '100%' }}
                  onClick={githubLogin}
                >
                  Continue with Github
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
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
                </Button> */}
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
