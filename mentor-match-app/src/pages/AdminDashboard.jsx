import { useMemo, useState, useCallback } from 'react'
import { Box, Card, Stack, Typography, Tab } from '@mui/material'
import { TabList, TabPanel, TabContext } from '@mui/lab'
import Header from '../components/Header'
import { useUser } from '../hooks/useUser'
import UserListView from '../components/dashboard/UserListView'
import ChatDrawer from '../components/chat/ChatDrawer'
import MentorshipApplicationCard from '../components/adminDashboard/MentorshipApplicationCard'

const AdminDashboard = () => {
  const { userList } = useUser()
  const [toggleChat, setToggleChat] = useState(false)
  const [selectedChatRoomId, setSelectedChatRoomId] = useState(null)
  const [value, setValue] = useState('0')

  const handleStartChat = useCallback((chatRoomId) => {
    setSelectedChatRoomId(chatRoomId)
    setToggleChat(true)
  }, [])

  return (
    <>
      <Header />
      <Box p={3}>
        <Stack spacing={2}>
          <Typography variant="h5" color="white" fontWeight={'light'}>
            Admin Dashboard
          </Typography>
          <Card>
            <Box p={2}>
              <TabContext value={value}>
                <TabList
                  value={value}
                  onChange={(event, newValue) => setValue(newValue)}
                >
                  <Tab label="Users" value="0" />
                  <Tab label="Mentorship Applications" value="1" />
                  <Tab label="Manage Matches" value="2" />
                </TabList>

                <TabPanel value="0">
                  <UserListView
                    usersList={userList}
                    title="User List"
                    subtitle={
                      'List of all users, including those without public profiles. You can start a chat with any user by clicking the chat button in their profile.'
                    }
                    listType="admin"
                    onStartChat={handleStartChat}
                    gridSize={3}
                  />
                </TabPanel>
                <TabPanel value="1">
                  <MentorshipApplicationCard />
                </TabPanel>
                <TabPanel value="2">Item Three</TabPanel>
              </TabContext>
            </Box>
          </Card>
          <ChatDrawer
            open={toggleChat}
            onOpen={() => setToggleChat(true)}
            onClose={() => setToggleChat(false)}
            selectedChatRoomId={selectedChatRoomId}
            setSelectedChatRoomId={setSelectedChatRoomId}
          />
        </Stack>
      </Box>
    </>
  )
}

export default AdminDashboard
