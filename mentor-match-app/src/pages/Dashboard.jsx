import { Container, Stack } from '@mui/material'
import { useState, useEffect } from 'react'
import ProfileWidget from '../components/dashboard/ProfileWidget'
import { getUsers } from '../api/users'
import Header from '../components/Header'
import UserListView from '../components/dashboard/UserListView'

const Dashboard = () => {
  const [users, setUsers] = useState([])

  useEffect(() => {
    const fetchUsers = async () => {
      const usersList = await getUsers()
      console.log('usersList', usersList)
      setUsers(usersList)
    }
    fetchUsers()
  }, [])

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
          <UserListView usersList={users} />
        </Stack>
      </Container>
    </>
  )
}

export default Dashboard
