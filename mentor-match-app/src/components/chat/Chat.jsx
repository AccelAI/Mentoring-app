import React, { useMemo, useCallback, useEffect, useState } from "react"
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
  MessageInput,
  TypingIndicator
} from "@chatscope/chat-ui-kit-react"
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css"
import "./Chat.css"
import { useUser } from "../../hooks/useUser"
import { useThemeContext } from "../../hooks/useTheme"
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  Stack
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import {
  getUserChatRooms,
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
  getOrCreateChatRoom,
  deleteChatRoom,
  setTypingStatus,
  listenToTypingStatus
} from "../../api/chat"
import { getUserById } from "../../api/users"

const Chat = ({ selectedChatRoomId }) => {
  const { user } = useUser()
  const { theme, mode } = useThemeContext()
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
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false)
  let typingTimeout = null

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false)
      return
    }
    const timeoutId = setTimeout(() => setLoading(false), 5000)
    const unsubscribe = getUserChatRooms(user.uid, async (error, rooms) => {
      clearTimeout(timeoutId)
      if (error) {
        setChatRooms([])
        setLoading(false)
        return
      }
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
    const unsubscribe = getChatMessages(selectedChatRoom.id, (error, msgs) => {
      if (error) {
        setMessages([])
        return
      }
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
    if (!selectedChatRoom?.id || !user?.uid) return
    const unsubscribe = listenToTypingStatus(
      selectedChatRoom.id,
      (error, typing) => {
        if (error) {
          setIsOtherUserTyping(false)
          return
        }
        const otherUserId = selectedChatRoom.participants.find(
          (id) => id !== user.uid
        )
        setIsOtherUserTyping(!!typing[otherUserId])
      }
    )
    return () => unsubscribe && unsubscribe()
  }, [selectedChatRoom?.id, user?.uid])

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
        console.error("Failed to send message:", result.error)
      }
    },
    [selectedChatRoom?.id, user?.uid]
  )

  const handleTyping = useCallback(() => {
    if (!selectedChatRoom?.id || !user?.uid) return
    setTypingStatus(selectedChatRoom.id, user.uid, true)
    if (typingTimeout) clearTimeout(typingTimeout)
    typingTimeout = setTimeout(() => {
      setTypingStatus(selectedChatRoom.id, user.uid, false)
    }, 2000)
  }, [selectedChatRoom?.id, user?.uid])

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
        name: otherUserData?.displayName || otherUserId || "Loading...",
        avatar: otherUserData?.profilePicture || "",
        lastMessage: room.lastMessage || "No messages yet",
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

  if (loading || (selectedChatRoom && !otherUser)) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        sx={{ backgroundColor: "transparent" }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <MainContainer
      responsive
      style={{
        backgroundColor: "transparent",
        color: theme.palette.text.primary
      }}
      data-mui-color-scheme={mode}
    >
      {selectedChatRoom ? (
        <ChatContainer
          style={{
            backgroundColor: "transparent",
            borderColor: "transparent"
          }}
        >
          <ConversationHeader
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              borderBottom: `1px solid ${theme.palette.divider}`
            }}
          >
            <ConversationHeader.Back />
            <Avatar
              src={otherUser?.profilePicture}
              name={otherUser?.displayName || ""}
            />
            <ConversationHeader.Content>
              <Stack direction="row" spacing={1} alignItems="center">
                <Stack spacing={0.3}>
                  <Typography
                    fontSize={16}
                    fontWeight={"medium"}
                    sx={{ color: theme.palette.text.primary }}
                  >
                    {otherUser?.displayName || ""}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    {otherUser?.role || ""}
                  </Typography>
                </Stack>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteClick(selectedChatRoom.id)}
                  style={{ marginLeft: "auto" }}
                  sx={{ color: theme.palette.text.secondary }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            </ConversationHeader.Content>
          </ConversationHeader>
          <MessageList
            style={{
              backgroundColor: "transparent"
            }}
            typingIndicator={
              isOtherUserTyping && otherUser ? (
                <TypingIndicator
                  content={`${otherUser.displayName} is typing`}
                />
              ) : null
            }
          >
            {messages.length === 0
              ? [
                  <MessageGroup key="empty" direction="incoming">
                    <MessageGroup.Messages>
                      <Message
                        model={{
                          message: "No messages yet. Say hello!",
                          direction: "incoming",
                          position: "single",
                          sender: "system"
                        }}
                        style={{
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "rgba(45, 55, 72, 0.8)"
                              : "rgba(247, 250, 252, 0.8)",
                          color: theme.palette.text.primary,
                          backdropFilter: "blur(10px)"
                        }}
                      />
                    </MessageGroup.Messages>
                  </MessageGroup>
                ]
              : messages.map((msg) => (
                  <MessageGroup
                    key={msg.id}
                    direction={
                      msg.senderId === user?.uid ? "outgoing" : "incoming"
                    }
                  >
                    <MessageGroup.Messages>
                      <Message
                        model={{
                          message: msg.text,
                          sentTime: (
                            msg.timestamp?.toDate?.() || new Date()
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          }),
                          sender: msg.senderId === user?.uid ? "me" : "them",
                          direction:
                            msg.senderId === user?.uid
                              ? "outgoing"
                              : "incoming",
                          position: "last"
                        }}
                        style={{
                          backgroundColor:
                            msg.senderId === user?.uid
                              ? theme.palette.primary.main
                              : theme.palette.mode === "dark"
                              ? "rgba(45, 55, 72, 0.8)"
                              : "rgba(247, 250, 252, 0.8)",
                          color:
                            msg.senderId === user?.uid
                              ? theme.palette.primary.contrastText
                              : theme.palette.text.primary,
                          backdropFilter:
                            msg.senderId !== user?.uid ? "blur(10px)" : "none"
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
            onChange={handleTyping}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              borderTop: `1px solid ${theme.palette.divider}`
            }}
          />
        </ChatContainer>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            padding: "24px",
            backgroundColor: "transparent"
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: theme.palette.text.secondary }}
            gutterBottom
          >
            Select a conversation
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.secondary }}
            textAlign="center"
          >
            Choose a conversation from the sidebar to start chatting
          </Typography>
        </div>
      )}
      <Sidebar
        position="right"
        scrollable={false}
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          borderLeft: `1px solid ${theme.palette.divider}`
        }}
      >
        <ConversationList>
          {conversations.map((conversation) => (
            <Conversation
              key={conversation.id}
              name={conversation.name}
              info={conversation.lastMessage}
              unreadCnt={conversation.unread ? 1 : 0}
              onClick={() => handleConversationSelect(conversation.id)}
              active={selectedChatRoom?.id === conversation.id}
              style={{
                position: "relative",
                backgroundColor:
                  selectedChatRoom?.id === conversation.id
                    ? theme.palette.mode === "dark"
                      ? "rgba(45, 55, 72, 0.8)"
                      : "rgba(227, 242, 253, 0.8)"
                    : "transparent",
                color: theme.palette.text.primary,
                backdropFilter:
                  selectedChatRoom?.id === conversation.id
                    ? "blur(10px)"
                    : "none"
              }}
            >
              <Avatar
                src={conversation.avatar}
                name={conversation.name}
                size="md"
              />
            </Conversation>
          ))}
          {conversations.length === 0 && (
            <div style={{ padding: "16px", textAlign: "center" }}>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary }}
              >
                No conversations yet
              </Typography>
            </div>
          )}
        </ConversationList>
        <Dialog
          open={deleteDialogOpen}
          onClose={handleCancelDelete}
          PaperProps={{
            style: {
              padding: 2,
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary
            }
          }}
        >
          <DialogTitle sx={{ color: theme.palette.text.primary }}>
            Delete this conversation?
          </DialogTitle>
          <DialogActions>
            <Button
              onClick={handleCancelDelete}
              sx={{ color: theme.palette.text.secondary }}
            >
              Cancel
            </Button>
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
    </MainContainer>
  )
}

export default Chat
