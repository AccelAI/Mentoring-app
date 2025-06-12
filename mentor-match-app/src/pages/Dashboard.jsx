import React, { useEffect, useState } from 'react'
import { Container, Stack, LinearProgress } from '@mui/material'
import ProfileWidget from '../components/dashboard/ProfileWidget'
import Header from '../components/Header'
import UserListView from '../components/dashboard/UserListView'
import { useUser } from '../hooks/useUser'
import MatchAlert from '../components/dashboard/MatchAlert'
import SideMenu from '../components/dashboard/SideMenu'

const Dashboard = () => {
  const { userList, user, loading, mentees } = useUser()
  const [listWithoutLoggedUser, setListWithoutLoggedUser] = useState([])
  const [viewType, setViewType] = useState('dashboard')

  useEffect(() => {
    if (user) {
      setListWithoutLoggedUser(userList.filter((u) => u.uid !== user.uid))
    }
  }, [user, userList])

  return (
    <>
      <Header />
      {loading ? (
        <LinearProgress />
      ) : (
        <>
          <Container sx={{ mt: 8 }}>
            <Stack
              direction={{ md: 'row', xs: 'column' }}
              spacing={6}
              sx={{
                alignItems: 'flex-start'
              }}
            >
              <Stack spacing={2} width={user ? '30%' : '45%'}>
                <ProfileWidget />
                {user && <SideMenu setView={setViewType} />}
              </Stack>
              <Stack spacing={2}>
                {/* TODO: Show match alert when theres a new mentee match or when mentor match results are ready */}
                {false && <MatchAlert />}

                {user && viewType === 'dashboard' && (
                  <UserListView
                    listType={viewType}
                    usersList={listWithoutLoggedUser}
                  />
                )}
                {!user && viewType === 'dashboard' && (
                  <UserListView listType={'dashboard'} usersList={userList} />
                )}
                {user && viewType === 'currentMentees' && (
                  <UserListView
                    usersList={mentees}
                    title={'Matched Mentees'}
                    gridSize={6}
                    listType={viewType}
                    subtitle="Here are your current mentee matches. Select a mentee to view their profile and start a conversation."
                  />
                )}
              </Stack>
            </Stack>
          </Container>
        </>
      )}
    </>
  )
}

export default Dashboard
