// React hooks
import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

// MUI components
import {
  Container,
  Stack,
  LinearProgress,
  Card,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import { ManageAccounts as AdminIcon } from '@mui/icons-material'

// Components
import ProfileWidget from '../components/dashboard/ProfileWidget'
import Header from '../components/Header'
import UserListView from '../components/dashboard/UserListView'
import MatchAlert from '../components/dashboard/MatchAlert'
import SideMenu from '../components/dashboard/SideMenu'
import CurrentMentor from '../components/dashboard/CurrentMentor'
import ApplicationStatus from '../components/dashboard/ApplicationStatus'

// Hooks and services
import { getUserById } from '../api/users'
import { getMentorshipStartDate } from '../api/match'
import { useUser } from '../hooks/useUser'
import ChatDrawer from '../components/chat/ChatDrawer'

const Dashboard = () => {
  const { userList, user, loading, mentees, isAdmin } = useUser()
  const [listWithoutLoggedUser, setListWithoutLoggedUser] = useState([])
  const [viewType, setViewType] = useState('dashboard')
  const [mentorData, setMentorData] = useState(null)
  const [loadingMentor, setLoadingMentor] = useState(false)
  const [toggleChat, setToggleChat] = useState(false)
  const [selectedChatRoomId, setSelectedChatRoomId] = useState(null)
  const navigate = useNavigate()
  useEffect(() => {
    if (user) {
      // Filter out the logged-in user and ensure only public profiles are shown for non-admin users
      const filteredList = userList.filter((u) => {
        // Always remove the logged-in user
        if (u.uid === user.uid) return false

        // For non-admin users, only show public profiles
        if (!isAdmin && u.publicProfile !== true) return false

        return true
      })
      setListWithoutLoggedUser(filteredList)
    } else {
      // For non-logged-in users, only show public profiles
      const publicOnlyList = userList.filter((u) => u.publicProfile === true)
      setListWithoutLoggedUser(publicOnlyList)
    }
  }, [user, userList, isAdmin])

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
                {isAdmin && (
                  <Card>
                    <MenuList>
                      <MenuItem onClick={() => navigate('/admin')}>
                        <ListItemIcon>
                          <AdminIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText>Admin Dashboard</ListItemText>
                      </MenuItem>
                    </MenuList>
                  </Card>
                )}
                <ProfileWidget />
                {user && <SideMenu setView={setViewType} />}
              </Stack>
              <Stack spacing={2}>
                {/* TODO: Show match alert when theres a new mentee match or when mentor match results are ready */}
                {user.newMenteeMatch && <MatchAlert setView={setViewType} />}

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
                    usersList={listWithoutLoggedUser}
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
                {user && viewType === 'applicationStatus' && (
                  <ApplicationStatus />
                )}
              </Stack>
            </Stack>

            <ChatDrawer
              open={toggleChat}
              onOpen={() => setToggleChat(true)}
              onClose={() => setToggleChat(false)}
              selectedChatRoomId={selectedChatRoomId}
              setSelectedChatRoomId={setSelectedChatRoomId}
            />
          </Container>
        </>
      )}
    </>
  )
}

export default Dashboard
