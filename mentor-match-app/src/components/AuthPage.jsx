import { Navigate, useLocation } from 'react-router-dom'
import { useUser } from '../hooks/useUser'
import { LinearProgress } from '@mui/material'
import { auth } from '../api/firebaseConfig'

const AuthPage = ({ children }) => {
  const location = useLocation()
  const { user, loading } = useUser()
  if (loading) {
    return <LinearProgress /> // Show a loading indicator while checking authentication
  }
  // Allow if either the app user is loaded OR Firebase Auth reports a signed-in user
  if (!user || !auth.currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

export default AuthPage
