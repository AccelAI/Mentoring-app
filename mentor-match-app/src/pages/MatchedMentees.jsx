import { Container, Stack, LinearProgress } from '@mui/material'
import ProfileWidget from '../components/dashboard/ProfileWidget'
import Header from '../components/Header'
import UserListView from '../components/dashboard/UserListView'
import { useUser } from '../hooks/useUser'
import SideMenu from '../components/dashboard/SideMenu'

const MatchedMentees = () => {
  const { userList, loading } = useUser()

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
            <Stack spacing={2} width={'30%'}>
              <ProfileWidget />
              <SideMenu />
            </Stack>
            <UserListView
              usersList={userList}
              title={'Current Mentees'}
              showMentorshipButton={false}
              showSearchBar={true}
              showChatButton={true}
              showManageMenteesButton={true}
              subtitle="Here are your current mentee matches. Select a mentee to view their profile and start a conversation."
            />
          </Stack>
        </Container>
      )}
    </>
  )
}

export default MatchedMentees
