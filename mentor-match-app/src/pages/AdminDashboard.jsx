import { useMemo, useState, useCallback } from 'react'
import { Box, Card, Stack, Typography } from '@mui/material'
import Header from '../components/Header'
import { useUser } from '../hooks/useUser'
import UserListView from '../components/dashboard/UserListView'
import ChatDrawer from '../components/chat/ChatDrawer'

const AdminDashboard = () => {
  const { userList } = useUser()
  const [toggleChat, setToggleChat] = useState(false)
  const [selectedChatRoomId, setSelectedChatRoomId] = useState(null)

  const subtitle = useMemo(
    () =>
      'Admin view. You can see all users, including those without public profiles.',
    []
  )

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
              <UserListView
                usersList={userList}
                title="All Users"
                subtitle={subtitle}
                listType="admin"
                onStartChat={handleStartChat}
              />
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
