import { LinearProgress } from '@mui/material'
import { useUser } from '../hooks/useUser'
import ErrorPage from '../components/ErrorPage'

const AdminRoute = ({ children }) => {
  const { user, loading } = useUser()
  if (loading) return <LinearProgress />
  if (!user?.isAdmin) return <ErrorPage>Nothing to see here!</ErrorPage>
  return children
}

export default AdminRoute
