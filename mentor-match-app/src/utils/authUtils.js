import {
  logIn,
  signInWithGoogle,
  signInWithGithub,
  resetPassword
} from '../api/auth'
import { useSnackbar } from 'notistack'
import { useNavigate } from 'react-router-dom'
import * as yup from 'yup'

export const useAuthHandlers = () => {
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
    if (!res.ok) {
      return enqueueSnackbar(
        'Failed to log in with Github. Please try again.',
        { variant: 'error' }
      )
    }
    enqueueSnackbar('Welcome Back', { variant: 'success' })
    navigate('/dashboard')
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
    handleResetPassword
  }
}
