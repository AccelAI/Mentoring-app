import React, { useEffect, useState } from 'react'
import { Container, Stack } from '@mui/material'
import ProfileWidget from '../components/dashboard/ProfileWidget'
import Header from '../components/Header'
import UserListView from '../components/dashboard/UserListView'
import { useUser } from '../hooks/useUser'

const Dashboard = () => {
  const { userList, user } = useUser()
  const [listWithoutLoggedUser, setListWithoutLoggedUser] = useState([])

  useEffect(() => {
    if (user) {
      setListWithoutLoggedUser(userList.filter((u) => u.id !== user.uid))
    }
  }, [user, userList])

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
          {user ? (
            <UserListView usersList={listWithoutLoggedUser} />
          ) : (
            <UserListView usersList={userList} />
          )}
        </Stack>
      </Container>
    </>
  )
}

export default Dashboard
