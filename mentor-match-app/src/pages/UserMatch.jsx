import React, { useEffect, useState } from 'react'
import { Container, Stack, LinearProgress } from '@mui/material'
import ProfileWidget from '../components/dashboard/ProfileWidget'
import Header from '../components/Header'
import UserListView from '../components/dashboard/UserListView'
import { useUser } from '../hooks/useUser'

const UserMatch = () => {
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
            <UserListView
              usersList={userList}
              title={
                'Based on your application, here are our top mentor picks for you:'
              }
              showMentorshipButton={false}
              showSearchBar={false}
              enableSelect={true}
            />
          </Stack>
        </Container>
      )}
    </>
  )
}

export default UserMatch
