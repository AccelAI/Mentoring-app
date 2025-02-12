import { Container, Stack } from '@mui/material'
import ProfileWidget from '../components/dashboard/ProfileWidget'
import Header from '../components/Header'
import UserListView from '../components/dashboard/UserListView'
import { useUser } from '../hooks/useUser'

const Dashboard = () => {
  const { userList } = useUser()

  return (
    <>
      <Header />
      <Container sx={{ mt: 8 }}>
        <Stack
          direction={{ md: 'row', xs: 'column' }}
          spacing={6}
          sx={{
            alignItems: 'flex-start'
          }}
        >
          <ProfileWidget />
          <UserListView usersList={userList} />
        </Stack>
      </Container>
    </>
  )
}

export default Dashboard
