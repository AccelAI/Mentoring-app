import { useNavigate } from 'react-router-dom'
import { useCallback } from 'react'

import { Stack, Button, Typography, Link } from '@mui/material'
import { LoadingButton } from '@mui/lab'
// eslint-disable-next-line
import { Google as GoogleIcon, GitHub as GitHubIcon } from '@mui/icons-material'

import MainCard from '../components/MainCard'
import PasswordField from '../components/inputFields/PasswordField'
import TextField from '../components/inputFields/TextField'

import { Form, Formik } from 'formik'
import * as yup from 'yup'
import { useSnackbar } from 'notistack'
import { signUp, signInWithGoogle, signInWithGithub } from '../api/auth'
import { useAuthHandlers } from '../utils/authUtils'

const initialValues = {
  name: '',
  email: '',
  username: '',
  password: '',
  repeatPassword: ''
}

const schema = yup.object().shape({
  name: yup.string().required('Please enter your name'),
  email: yup
    .string()
    .required('Please enter your email')
    .email('Invalid email'),
  username: yup
    .string()
    .required('Please enter a username')
    .min(5, 'Username must be at least 5 characters'),
  password: yup
    .string()
    .required('Please enter a password')
    .min(6, 'Password must be at least 6 characters'),
  repeatPassword: yup
    .string()
    .required('Please re-enter your password')
    .oneOf([yup.ref('password'), null], 'Passwords must match')
})

const Signup = () => {
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const { orcidLogin } = useAuthHandlers()
  const handleLogIn = () => {
    navigate('/login')
  }
  const onSubmit = useCallback(
    async (user, { setSubmitting }) => {
      setSubmitting(true)
      const res = await signUp(user)
      if (!res.ok) {
        setSubmitting(false)
        return enqueueSnackbar(res.error, { variant: 'error' })
      }
      enqueueSnackbar('Account created succesfully', { variant: 'success' })
      navigate('/get-started')
    },
    [enqueueSnackbar, navigate]
  )

  const googleSignUp = useCallback(async () => {
    const res = await signInWithGoogle()
    if (!res.ok) {
      return enqueueSnackbar(
        'Failed to sign in with Google. Please try again.',
        { variant: 'error' }
      )
    }
    enqueueSnackbar('Account created succesfully', { variant: 'success' })
    navigate('/get-started')
  }, [enqueueSnackbar, navigate])

  // eslint-disable-next-line
  const githubSignUp = useCallback(async () => {
    const res = await signInWithGithub()
    console.log(res)
    if (!res.ok) {
      return enqueueSnackbar(
        'Failed to sign in with Github. Please try again.',
        { variant: 'error' }
      )
    }
    enqueueSnackbar('Account created succesfully', { variant: 'success' })
    navigate('/get-started')
  }, [enqueueSnackbar, navigate])

  return (
    <MainCard
      title={'Sign Up'}
      titleSize={'h4'}
      props={{ py: 3 }}
      enableContainer={true}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={schema}
        onSubmit={onSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <Stack spacing={2.5} sx={{ alignItems: 'center', width: '100%' }}>
              <Typography variant="body1">
                Let's create your account by filling out the form below.
              </Typography>
              <TextField
                label="Full Name"
                name="name"
                variant="outlined"
                required
                sx={{ width: '100%' }}
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                required
                variant="outlined"
                sx={{ width: '100%' }}
              />
              <TextField
                label="Username"
                name="username"
                variant="outlined"
                required
                sx={{ width: '100%' }}
              />
              <PasswordField
                label="Password"
                name="password"
                required
                variant="outlined"
              />
              <PasswordField
                label="Confirm Password"
                name="repeatPassword"
                required
                variant="outlined"
              />
              <LoadingButton
                variant="contained"
                type="submit"
                sx={{ width: '100%' }}
                loading={isSubmitting}
              >
                Sign Up
              </LoadingButton>
              {/* Socials sign up buttons */}
              <Typography variant="body2">Or</Typography>
              <Stack spacing={1} sx={{ width: 1 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<GoogleIcon />}
                  sx={{ width: '100%' }}
                  onClick={googleSignUp}
                >
                  Sign Up with Google
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<GitHubIcon />}
                  sx={{ width: '100%' }}
                  onClick={githubSignUp}
                >
                  Sign Up with Github
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
                  Sign up with ORCID
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
                  Already have an account?{' '}
                  <Link onClick={handleLogIn}>Log in here</Link>
                </Typography>
              </Stack>
            </Stack>
          </Form>
        )}
      </Formik>
    </MainCard>
  )
}

export default Signup
