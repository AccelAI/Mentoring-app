import React, { useEffect, useState, useCallback } from 'react'
import {
  Container,
  Stack,
  LinearProgress,
  SwipeableDrawer,
  Button,
  Typography,
  Box,
  Fab
} from '@mui/material'
import { Chat as ChatIcon } from '@mui/icons-material'
import ProfileWidget from '../components/dashboard/ProfileWidget'
import Header from '../components/Header'
import UserListView from '../components/dashboard/UserListView'
import { useUser } from '../hooks/useUser'
import MatchAlert from '../components/dashboard/MatchAlert'
import SideMenu from '../components/dashboard/SideMenu'
import CurrentMentor from '../components/dashboard/CurrentMentor'
import { getUserById } from '../api/users'
import { getMentorshipStartDate } from '../api/match'
import Chat from '../components/chat/Chat'

const Dashboard = () => {
  const { userList, user, loading, mentees } = useUser()
  const [listWithoutLoggedUser, setListWithoutLoggedUser] = useState([])
  const [viewType, setViewType] = useState('dashboard')
  const [mentorData, setMentorData] = useState(null)
  const [loadingMentor, setLoadingMentor] = useState(false)
  const [toggleChat, setToggleChat] = useState(false)
  const [selectedChatRoomId, setSelectedChatRoomId] = useState(null)

  useEffect(() => {
    if (user) {
      setListWithoutLoggedUser(userList.filter((u) => u.uid !== user.uid))
    }
  }, [user, userList])

  useEffect(() => {
    if (!user) return
    // Fetch mentor data when user is available
    setLoadingMentor(true)
    console.log('Fetching mentor data for user:', user)
    if (user.mentorId) {
      const fetchMentorData = async () => {
        try {
          const mentor = await getUserById(user.mentorId)
          const mentorshipStartDate = await getMentorshipStartDate(
            user.uid,
            user.mentorId
          )
          setMentorData({ ...mentor, mentorshipStartDate })
        } catch (error) {
          console.error('Error fetching mentor data:', error)
        }
      }
      fetchMentorData()
      console.log('Mentor data fetched')
    } else {
      setMentorData(null)
    }
    setLoadingMentor(false)
  }, [user])

  const handleStartChat = useCallback((chatRoomId) => {
    console.log('Dashboard handleStartChat called with chatRoomId:', chatRoomId)
    setSelectedChatRoomId(chatRoomId)
    setToggleChat(true)
    console.log('Dashboard - setSelectedChatRoomId to:', chatRoomId)
    console.log('Dashboard - setToggleChat to true')
  }, [])

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
                {false && <MatchAlert setView={setViewType} />}

                {user && viewType === 'dashboard' && (
                  <UserListView
                    listType={viewType}
                    usersList={listWithoutLoggedUser}
                    onStartChat={handleStartChat}
                  />
                )}
                {!user && viewType === 'dashboard' && (
                  <UserListView
                    listType={'dashboard'}
                    usersList={userList}
                    onStartChat={handleStartChat}
                  />
                )}
                {user && viewType === 'currentMentees' && (
                  <UserListView
                    usersList={mentees}
                    title={'Matched Mentees'}
                    gridSize={6}
                    listType={viewType}
                    subtitle="Here are your current mentee matches. Select a mentee to view their profile and start a conversation."
                    onStartChat={handleStartChat}
                  />
                )}
                {user && viewType === 'currentMentor' && (
                  <CurrentMentor
                    mentorData={mentorData}
                    loadingMentor={loadingMentor}
                    onStartChat={handleStartChat}
                  />
                )}
              </Stack>
            </Stack>

            {/* Floating Action Button for Chat - visible when drawer is closed */}
            {!toggleChat && (
              <Fab
                color="primary"
                aria-label="chat"
                onClick={() => setToggleChat(true)}
                sx={{
                  position: 'fixed',
                  bottom: 16,
                  right: 16,
                  zIndex: 1000,
                  pointerEvents: 'auto'
                }}
              >
                <ChatIcon />
              </Fab>
            )}

            <SwipeableDrawer
              anchor="right"
              onClose={() => setToggleChat(false)}
              onOpen={() => setToggleChat(true)}
              open={toggleChat}
              keepMounted
              disableSwipeToOpen={true}
              PaperProps={{
                sx: {
                  width: { xs: '100%', sm: '400px', md: '40%' },
                  height: '100vh',
                  borderTopLeftRadius: 8,
                  borderBottomLeftRadius: 8,
                  overflow: 'visible'
                }
              }}
            >
              {/* Chat Content */}
              <Box
                sx={{
                  height: '100%',
                  pt: 3,
                  px: 2,
                  pb: 2
                }}
              >
                <Chat selectedChatRoomId={selectedChatRoomId} />
              </Box>
            </SwipeableDrawer>
          </Container>
        </>
      )}
    </>
  )
}

export default Dashboard
