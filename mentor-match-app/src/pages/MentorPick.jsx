import { Container, Stack, LinearProgress, Typography } from '@mui/material'
import Header from '../components/Header'
import UserListView from '../components/dashboard/UserListView'
import { useUser } from '../hooks/useUser'
import ErrorPage from '../components/ErrorPage'

const MentorPick = () => {
  const { user, userList, loading } = useUser()

  // Show loading while user context resolves or if user is not yet available
  if (loading || !user) {
    return (
      <>
        <Header />
        <LinearProgress />
      </>
    )
  }

  /*   if (!user.mentorMatchResults && user.role.includes('Mentee')) {
    return (
      <ErrorPage>
        <Typography variant="h6">
          You don't have matches assigned to you yet. Please come back later!
        </Typography>
      </ErrorPage>
    )
  } */

  if (user?.role === 'Mentor') {
    return (
      <ErrorPage>
        <Typography variant="h6">
          Mentors can't view mentor picks. Please check your mentees or wait for
          new matches.
        </Typography>
      </ErrorPage>
    )
  }

  return (
    <>
      <Header />
      {loading ? (
        <LinearProgress />
      ) : (
        <Container sx={{ mt: 8 }}>
          <Stack
            direction={{ md: 'row', xs: 'column' }}
            spacing={6}
            sx={{
              alignItems: 'flex-start'
            }}
          >
            <UserListView
              usersList={userList}
              title={
                'Based on your application, here are our top mentor picks for you:'
              }
              listType={'mentor-pick'}
            />
          </Stack>
        </Container>
      )}
    </>
  )
}

export default MentorPick
