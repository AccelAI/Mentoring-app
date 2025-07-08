import React, { useMemo, useCallback, useEffect, useState } from 'react'
import {
  MainContainer,
  Sidebar,
  ConversationList,
  Conversation,
  Avatar,
  ChatContainer,
  ConversationHeader,
  MessageGroup,
  Message,
  MessageList,
  MessageInput
} from '@chatscope/chat-ui-kit-react'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css'
import { useUser } from '../../hooks/useUser'
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogActions,
  Button
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import {
  getUserChatRooms,
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
  getOrCreateChatRoom,
  deleteChatRoom
} from '../../api/chat'
import { getUserById } from '../../api/users'

const Chat = ({ selectedChatRoomId }) => {
  const { user } = useUser()
  const [chatRooms, setChatRooms] = useState([])
  const [selectedChatRoom, setSelectedChatRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [otherUser, setOtherUser] = useState(null)
  const [unsubscribeChatRooms, setUnsubscribeChatRooms] = useState(null)
  const [unsubscribeMessages, setUnsubscribeMessages] = useState(null)
  const [conversationUsers, setConversationUsers] = useState({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [chatRoomToDelete, setChatRoomToDelete] = useState(null)

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false)
      return
    }
    const timeoutId = setTimeout(() => setLoading(false), 5000)
    const unsubscribe = getUserChatRooms(user.uid, async (rooms) => {
      clearTimeout(timeoutId)
      setChatRooms(rooms)
      setLoading(false)
      // Fetch other users' info for conversation list
      const userMap = {}
      for (const room of rooms) {
        const otherUserId = room.participants.find((id) => id !== user.uid)
        if (otherUserId && !userMap[otherUserId]) {
          const userData = await getUserById(otherUserId)
          if (userData && userData.uid) {
            userMap[otherUserId] = userData
          }
        }
      }
      setConversationUsers(userMap)
    })
    setUnsubscribeChatRooms(() => unsubscribe)
    return () => {
      clearTimeout(timeoutId)
      if (unsubscribe) unsubscribe()
    }
  }, [user?.uid])

  useEffect(() => {
    if (!selectedChatRoom?.id) return
    const unsubscribe = getChatMessages(selectedChatRoom.id, (msgs) => {
      setMessages(msgs)
    })
    setUnsubscribeMessages(() => unsubscribe)
    if (user?.uid) {
      markMessagesAsRead(selectedChatRoom.id, user.uid)
    }
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [selectedChatRoom?.id, user?.uid])

  useEffect(() => {
    if (!selectedChatRoom || !user?.uid) return
    const otherUserId = selectedChatRoom.participants.find(
      (id) => id !== user.uid
    )
    if (otherUserId) {
      getUserById(otherUserId).then((userData) => {
        if (userData && userData.uid) {
          setOtherUser(userData)
        }
      })
    }
  }, [selectedChatRoom, user?.uid])

  useEffect(() => {
    if (selectedChatRoomId && chatRooms.length > 0) {
      const chatRoom = chatRooms.find((room) => room.id === selectedChatRoomId)
      if (chatRoom) {
        setSelectedChatRoom(chatRoom)
      }
    }
  }, [selectedChatRoomId, chatRooms])

  useEffect(() => {
    return () => {
      if (unsubscribeChatRooms) unsubscribeChatRooms()
      if (unsubscribeMessages) unsubscribeMessages()
    }
  }, [unsubscribeChatRooms, unsubscribeMessages])

  const handleSendMessage = useCallback(
    async (message) => {
      if (!selectedChatRoom?.id || !user?.uid || !message.trim()) return
      const result = await sendMessage(selectedChatRoom.id, user.uid, message)
      if (!result.ok) {
        console.error('Failed to send message:', result.error)
      }
    },
    [selectedChatRoom?.id, user?.uid]
  )

  const handleConversationSelect = useCallback(
    (chatRoomId) => {
      const found = chatRooms.find((r) => r.id === chatRoomId)
      if (found) setSelectedChatRoom(found)
    },
    [chatRooms]
  )

  const conversations = useMemo(() => {
    return chatRooms.map((room) => {
      const otherUserId = room.participants.find((id) => id !== user?.uid)
      const otherUserData = otherUserId
        ? conversationUsers[otherUserId]
        : undefined
      return {
        id: room.id,
        name: otherUserData?.displayName || otherUserId || 'Loading...',
        avatar: otherUserData?.profilePicture || '',
        lastMessage: room.lastMessage || 'No messages yet',
        timestamp: room.lastMessageTime?.toDate?.() || new Date(),
        unread: false
      }
    })
  }, [chatRooms, user?.uid, conversationUsers])

  const handleDeleteClick = (chatRoomId) => {
    setChatRoomToDelete(chatRoomId)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (chatRoomToDelete) {
      await deleteChatRoom(chatRoomToDelete)
      setChatRoomToDelete(null)
      setDeleteDialogOpen(false)
      if (selectedChatRoom?.id === chatRoomToDelete) {
        setSelectedChatRoom(null)
      }
    }
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false)
    setChatRoomToDelete(null)
  }

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <MainContainer responsive>
      <Sidebar position="left" scrollable={false}>
        <ConversationList>
          {conversations.map((conversation) => (
            <Conversation
              key={conversation.id}
              name={conversation.name}
              info={conversation.lastMessage}
              unreadCnt={conversation.unread ? 1 : 0}
              onClick={() => handleConversationSelect(conversation.id)}
              active={selectedChatRoom?.id === conversation.id}
              style={{ position: 'relative' }}
            >
              <Avatar
                src={conversation.avatar}
                name={conversation.name}
                size="md"
              />
            </Conversation>
          ))}
          {conversations.length === 0 && (
            <div style={{ padding: '16px', textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No conversations yet
              </Typography>
            </div>
          )}
        </ConversationList>
        <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
          <DialogTitle>Delete this conversation?</DialogTitle>
          <DialogActions>
            <Button onClick={handleCancelDelete}>Cancel</Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Sidebar>
      {selectedChatRoom ? (
        <ChatContainer>
          <ConversationHeader>
            <ConversationHeader.Back />
            <Avatar
              src={otherUser?.profilePicture}
              name={otherUser?.displayName || 'User'}
            />
            <ConversationHeader.Content>
              <div>
                <div style={{ fontWeight: 'bold' }}>
                  {otherUser?.displayName || 'User'}
                </div>
                <div style={{ fontSize: '0.8em', color: '#666' }}>
                  {otherUser?.role || 'User'}
                </div>
              </div>
            </ConversationHeader.Content>
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(selectedChatRoom.id)}
              style={{ marginLeft: 'auto' }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </ConversationHeader>
          <MessageList>
            {messages.length === 0
              ? [
                  <MessageGroup key="empty" direction="incoming">
                    <MessageGroup.Messages>
                      <Message
                        model={{
                          message: 'No messages yet. Say hello!',
                          direction: 'incoming',
                          position: 'single',
                          sender: 'system'
                        }}
                      />
                    </MessageGroup.Messages>
                  </MessageGroup>
                ]
              : messages.map((msg) => (
                  <MessageGroup
                    key={msg.id}
                    direction={
                      msg.senderId === user?.uid ? 'outgoing' : 'incoming'
                    }
                  >
                    <MessageGroup.Messages>
                      <Message
                        model={{
                          message: msg.text,
                          sentTime: (
                            msg.timestamp?.toDate?.() || new Date()
                          ).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          }),
                          sender: msg.senderId === user?.uid ? 'me' : 'them',
                          direction:
                            msg.senderId === user?.uid
                              ? 'outgoing'
                              : 'incoming',
                          position: 'last'
                        }}
                      />
                    </MessageGroup.Messages>
                  </MessageGroup>
                ))}
          </MessageList>
          <MessageInput
            attachButton={false}
            placeholder="Type here..."
            onSend={handleSendMessage}
          />
        </ChatContainer>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            padding: '24px',
            backgroundColor: '#f5f5f5'
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Select a conversation
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Choose a conversation from the sidebar to start chatting
          </Typography>
        </div>
      )}
    </MainContainer>
  )
}

export default Chat
