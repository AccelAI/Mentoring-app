import {
  logIn,
  signInWithGoogle,
  signInWithGithub,
  resetPassword
} from '../api/auth'
import { useSnackbar } from 'notistack'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useUser'
import * as yup from 'yup'

export const useAuthHandlers = () => {
  const { refreshUser } = useUser()
  const initialValues = {
    email: '',
    password: '',
    emailPassReset: ''
  }

  const schema = yup.object().shape({
    email: yup
      .string()
      .required('Please enter your email')
      .email('Invalid email'),
    password: yup.string().required('Please enter a password'),
    emailPassReset: yup.string().email('Invalid email')
  })

  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()

  const handleRedirect = async (path = '/dashboard', uid) => {
    try {
      await refreshUser(uid)
    } catch (e) {
      console.warn('refreshUser failed (continuing):', e)
    }
    navigate(path)
  }

  // Regular email/password login
  const onSubmit = async (formValues, { setSubmitting }) => {
    setSubmitting(true)
    const res = await logIn(formValues)
    if (!res.ok) {
      setSubmitting(false)
      return enqueueSnackbar(res.error, { variant: 'error' })
    }
    enqueueSnackbar('Welcome Back', { variant: 'success' })
    await handleRedirect()
  }

  const googleLogin = async () => {
    const res = await signInWithGoogle()
    if (!res.ok) {
      return enqueueSnackbar(
        'Failed to log in with Google. Please try again.',
        { variant: 'error' }
      )
    }
    enqueueSnackbar(
      res.isNewUser ? 'Account created successfully' : 'Welcome Back',
      { variant: 'success' }
    )
    await handleRedirect(res.isNewUser ? '/get-started' : '/dashboard', res.uid)
  }

  const githubLogin = async () => {
    const res = await signInWithGithub()
    if (!res.ok) {
      return enqueueSnackbar(
        'Failed to log in with Github. Please try again.',
        { variant: 'error' }
      )
    }
    enqueueSnackbar('Welcome Back', { variant: 'success' })
    await handleRedirect('/dashboard')
  }

  const orcidLogin = () => {
    const clientId = process.env.REACT_APP_ORCID_CLIENT_ID
    const redirectUri = process.env.REACT_APP_ORCID_REDIRECT_URI
    const url = `https://sandbox.orcid.org/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=/authenticate`
    window.location.href = url
  }

  const handleResetPassword = async (
    values,
    { setSubmitting, resetForm, handleDialogClose }
  ) => {
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

  return {
    initialValues,
    schema,
    onSubmit,
    googleLogin,
    githubLogin,
    orcidLogin,
    handleResetPassword
  }
}
