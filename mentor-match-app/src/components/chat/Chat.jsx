/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMemo, useCallback, useEffect, useState, useRef } from 'react'
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
} from '@chatscope/chat-ui-kit-react'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css'
import './Chat.css'
import { useUser } from '../../hooks/useUser'
import { useThemeContext } from '../../hooks/useTheme'
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
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import {
  getUserChatRooms,
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
  deleteChatRoom,
  setTypingStatus,
  listenToTypingStatus
} from '../../api/chat'
import { getUserById } from '../../api/users'
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit
} from 'firebase/firestore'
import { db } from '../../api/firebaseConfig'

const Chat = ({
  selectedChatRoomId,
  setSelectedChatRoomId,
  setHasUnread,
  drawerOpen,
  drawerClose
}) => {
  const { user } = useUser()
  const { theme, mode } = useThemeContext()
  const [chatRooms, setChatRooms] = useState([])
  const selectedChatRoom = useMemo(
    () => chatRooms.find((r) => r.id === selectedChatRoomId) || null,
    [chatRooms, selectedChatRoomId]
  )
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [otherUser, setOtherUser] = useState(null)
  // eslint-disable-next-line
  const [unsubscribeChatRooms, setUnsubscribeChatRooms] = useState(null)
  // eslint-disable-next-line
  const [unsubscribeMessages, setUnsubscribeMessages] = useState(null)
  // Keep latest unsubs in refs so we can clean up on unmount only
  const unsubChatRoomsRef = useRef(null)
  const unsubMessagesRef = useRef(null)
  const [conversationUsers, setConversationUsers] = useState({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [chatRoomToDelete, setChatRoomToDelete] = useState(null)
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false)
  const typingTimeoutRef = useRef(null)
  // const [roomUnread, setRoomUnread] = useState({})
  const [roomUnreadCount, setRoomUnreadCount] = useState({})
  const unreadUnsubsRef = useRef({})
  // Track latest message per room to keep sidebar info fresh
  const [lastMessageByRoom, setLastMessageByRoom] = useState({})
  const lastMsgUnsubsRef = useRef({})

  // Audio: context + last played message per room
  const audioCtxRef = useRef(null)
  const lastPlayedMessageIdRef = useRef({})

  // Init AudioContext and resume on first user interaction
  useEffect(() => {
    const Ctx = window.AudioContext || window.webkitAudioContext
    try {
      audioCtxRef.current = new Ctx()
    } catch {
      audioCtxRef.current = null
    }
    const resume = () => {
      if (audioCtxRef.current?.state === 'suspended') {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        audioCtxRef.current.resume().catch(() => {})
      }
    }
    window.addEventListener('click', resume)
    return () => {
      window.removeEventListener('click', resume)
      try {
        audioCtxRef.current?.close()
      } catch {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
      }
    }
  }, [])

  const playPing = useCallback(() => {
    const ctx = audioCtxRef.current
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.3)
  }, [])

  // Keep latest drawerOpen and selectedChatRoomId inside listeners
  const drawerOpenRef = useRef(drawerOpen)
  useEffect(() => {
    drawerOpenRef.current = drawerOpen
  }, [drawerOpen])
  const selectedChatRoomIdRef = useRef(selectedChatRoomId)
  useEffect(() => {
    selectedChatRoomIdRef.current = selectedChatRoomId
  }, [selectedChatRoomId])

  // If a selected chat is deleted from the list, clear selection
  useEffect(() => {
    if (!selectedChatRoomId) return
    const exists = chatRooms.some((r) => r.id === selectedChatRoomId)
    if (!exists && setSelectedChatRoomId) setSelectedChatRoomId(null)
  }, [chatRooms, selectedChatRoomId, setSelectedChatRoomId])

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
    unsubChatRoomsRef.current = unsubscribe
    return () => {
      clearTimeout(timeoutId)
      if (unsubscribe) unsubscribe()
    }
  }, [user?.uid])

  // If a chat id is provided (e.g., created from Admin), don't block UI on loading spinner
  useEffect(() => {
    if (selectedChatRoomId) setLoading(false)
  }, [selectedChatRoomId])

  useEffect(() => {
    if (!selectedChatRoomId) return
    const unsubscribe = getChatMessages(selectedChatRoomId, (error, msgs) => {
      if (error) {
        setMessages([])
        return
      }
      setMessages(msgs)
    })
    setUnsubscribeMessages(() => unsubscribe)
    unsubMessagesRef.current = unsubscribe
    if (user?.uid) {
      markMessagesAsRead(selectedChatRoomId, user.uid)
    }
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [selectedChatRoomId, user?.uid])

  // Actively viewing a chat: mark new incoming messages as read
  useEffect(() => {
    if (!drawerOpen || !selectedChatRoomId || !user?.uid) return
    if (messages.length === 0) return
    markMessagesAsRead(selectedChatRoomId, user.uid)
  }, [messages, drawerOpen, selectedChatRoomId, user?.uid])

  useEffect(() => {
    if (!selectedChatRoom || !user?.uid || !selectedChatRoom?.participants)
      return
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

  // No longer need to sync selectedChatRoom via state; it's derived from chatRooms

  useEffect(() => {
    if (!selectedChatRoomId || !user?.uid) return
    const unsubscribe = listenToTypingStatus(
      selectedChatRoomId,
      (error, typing) => {
        if (error) {
          setIsOtherUserTyping(false)
          return
        }
        const otherUserId = selectedChatRoom?.participants?.find(
          (id) => id !== user.uid
        )
        setIsOtherUserTyping(!!typing[otherUserId])
      }
    )
    return () => unsubscribe && unsubscribe()
  }, [selectedChatRoomId, selectedChatRoom?.participants, user?.uid])

  // Listen for unread messages per room and notify parent
  useEffect(() => {
    if (!user?.uid) return
    // Unsubscribe removed rooms
    const currentIds = new Set(chatRooms.map((r) => r.id))
    Object.keys(unreadUnsubsRef.current).forEach((roomId) => {
      if (!currentIds.has(roomId)) {
        unreadUnsubsRef.current[roomId]?.()
        delete unreadUnsubsRef.current[roomId]
        setRoomUnreadCount((prev) => {
          const { [roomId]: _, ...rest } = prev
          return rest
        })
      }
    })
    // Add listeners for new rooms
    chatRooms.forEach((room) => {
      if (unreadUnsubsRef.current[room.id]) return
      const q = query(
        collection(db, 'chat-rooms', room.id, 'messages'),
        where('read', '==', false)
      )
      const unsub = onSnapshot(q, (snap) => {
        let count = 0
        snap.forEach((d) => {
          const data = d.data()
          if (data.senderId !== user.uid) count += 1
        })
        setRoomUnreadCount((prev) => ({ ...prev, [room.id]: count }))
      })
      unreadUnsubsRef.current[room.id] = unsub
    })
  }, [chatRooms, user?.uid])

  // Keep conversation lastMessage up to date by watching the latest message in each room
  useEffect(() => {
    if (!user?.uid) return
    const currentIds = new Set(chatRooms.map((r) => r.id))
    // Unsubscribe removed
    Object.keys(lastMsgUnsubsRef.current).forEach((roomId) => {
      if (!currentIds.has(roomId)) {
        lastMsgUnsubsRef.current[roomId]?.()
        delete lastMsgUnsubsRef.current[roomId]
        setLastMessageByRoom((prev) => {
          const { [roomId]: _, ...rest } = prev
          return rest
        })
        // Clean last played id as well
        delete lastPlayedMessageIdRef.current[roomId]
      }
    })
    // Subscribe new rooms
    chatRooms.forEach((room) => {
      if (lastMsgUnsubsRef.current[room.id]) return
      const q = query(
        collection(db, 'chat-rooms', room.id, 'messages'),
        orderBy('timestamp', 'desc'),
        limit(1)
      )
      const unsub = onSnapshot(q, (snap) => {
        const docSnap = snap.docs[0]
        if (docSnap) {
          const data = docSnap.data()
          const tsMs = data.timestamp?.toDate?.()
            ? data.timestamp.toDate().getTime()
            : Date.now() // fallback so UI updates instantly
          setLastMessageByRoom((prev) => ({
            ...prev,
            [room.id]: {
              text: data.text || '',
              tsMs
            }
          }))

          // Play sound only for new incoming messages (not initial)
          const prevId = lastPlayedMessageIdRef.current[room.id]
          if (prevId === undefined) {
            // first snapshot, just set baseline
            lastPlayedMessageIdRef.current[room.id] = docSnap.id
          } else if (prevId !== docSnap.id) {
            if (data.senderId && data.senderId !== user.uid) {
              playPing()
            }
            lastPlayedMessageIdRef.current[room.id] = docSnap.id
          }

          // Trigger FAB badge immediately for incoming messages not being viewed
          if (data.senderId && data.senderId !== user.uid) {
            const isViewing =
              drawerOpenRef.current && selectedChatRoomIdRef.current === room.id
            if (!isViewing && typeof setHasUnread === 'function') {
              setHasUnread(true)
            }
          }
        } else {
          setLastMessageByRoom((prev) => ({ ...prev, [room.id]: null }))
        }
      })
      lastMsgUnsubsRef.current[room.id] = unsub
    })
    // eslint-disable-next-line
  }, [chatRooms, user?.uid, playPing]) // uses refs for drawerOpen/selectedChatRoomId inside

  useEffect(() => {
    const anyUnread = Object.values(roomUnreadCount).some((c) => (c || 0) > 0)
    if (typeof setHasUnread === 'function') setHasUnread(anyUnread)
  }, [roomUnreadCount, setHasUnread])

  // Replace previous cleanup effect (that depended on unsubscribeChatRooms/unsubscribeMessages)
  // with an unmount-only cleanup so listeners aren't accidentally removed on state changes.
  useEffect(() => {
    return () => {
      unsubChatRoomsRef.current && unsubChatRoomsRef.current()
      unsubMessagesRef.current && unsubMessagesRef.current()
      Object.values(unreadUnsubsRef.current).forEach((fn) => fn && fn())
      unreadUnsubsRef.current = {}
      Object.values(lastMsgUnsubsRef.current).forEach((fn) => fn && fn())
      lastMsgUnsubsRef.current = {}
    }
  }, [])

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

  const handleTyping = useCallback(() => {
    if (!selectedChatRoom?.id || !user?.uid) return
    setTypingStatus(selectedChatRoom.id, user.uid, true)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      setTypingStatus(selectedChatRoom.id, user.uid, false)
    }, 2000)
  }, [selectedChatRoom?.id, user?.uid])

  const handleConversationSelect = useCallback(
    (chatRoomId) => {
      if (setSelectedChatRoomId) setSelectedChatRoomId(chatRoomId)
      // Optimistically clear unread count and persist read state
      setRoomUnreadCount((prev) => ({ ...prev, [chatRoomId]: 0 }))
      if (user?.uid) {
        markMessagesAsRead(chatRoomId, user.uid)
      }
    },
    [setSelectedChatRoomId, user?.uid]
  )

  const handleDeleteClick = (chatRoomId) => {
    setChatRoomToDelete(chatRoomId)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (chatRoomToDelete) {
      await deleteChatRoom(chatRoomToDelete)
      // Immediately reflect deletion in UI and clean up listeners/state
      setChatRooms((prev) => prev.filter((r) => r.id !== chatRoomToDelete))
      unreadUnsubsRef.current[chatRoomToDelete]?.()
      delete unreadUnsubsRef.current[chatRoomToDelete]
      setRoomUnreadCount((prev) => {
        const { [chatRoomToDelete]: _, ...rest } = prev
        return rest
      })
      setLastMessageByRoom((prev) => {
        const { [chatRoomToDelete]: __, ...rest } = prev
        return rest
      })
      setChatRoomToDelete(null)
      setDeleteDialogOpen(false)
      if (selectedChatRoomId === chatRoomToDelete && setSelectedChatRoomId) {
        setSelectedChatRoomId(null)
      }
      // Clean last played id for deleted room
      delete lastPlayedMessageIdRef.current[chatRoomToDelete]
    }
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false)
    setChatRoomToDelete(null)
  }

  // On open, clear unread for the active room immediately
  useEffect(() => {
    if (!drawerOpen || !selectedChatRoomId || !user?.uid) return
    setRoomUnreadCount((prev) => ({ ...prev, [selectedChatRoomId]: 0 }))
    markMessagesAsRead(selectedChatRoomId, user.uid)
  }, [drawerOpen, selectedChatRoomId, user?.uid])

  const conversations = useMemo(() => {
    const items = chatRooms.map((room) => {
      const otherUserId = room.participants.find((id) => id !== user?.uid)
      const otherUserData = otherUserId
        ? conversationUsers[otherUserId]
        : undefined
      const latest = lastMessageByRoom[room.id]

      const roomTsMs = room.lastMessageTime?.toDate?.()?.getTime?.()
        ? room.lastMessageTime.toDate().getTime()
        : 0
      const latestTsMs = latest?.tsMs || 0

      const useLatest = latestTsMs >= roomTsMs
      const effectiveText =
        (useLatest ? latest?.text : room.lastMessage) || 'No messages yet'
      const effectiveTsMs = Math.max(latestTsMs, roomTsMs)

      return {
        id: room.id,
        name: otherUserData?.displayName || otherUserId || 'Loading...',
        avatar:
          otherUserData?.profilePicture ||
          'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg',
        lastMessage: effectiveText,
        timestamp: effectiveTsMs,
        unreadCount: roomUnreadCount[room.id] || 0
      }
    })
    // Sort by latest timestamp desc to reflect new messages instantly
    items.sort((a, b) => b.timestamp - a.timestamp)
    return items
  }, [
    chatRooms,
    user?.uid,
    conversationUsers,
    roomUnreadCount,
    lastMessageByRoom
  ])

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        sx={{ backgroundColor: 'transparent' }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <MainContainer
      responsive
      style={{
        backgroundColor: 'transparent',
        color: theme.palette.text.primary
      }}
      data-mui-color-scheme={mode}
    >
      {selectedChatRoomId ? (
        <ChatContainer
          style={{
            backgroundColor: 'transparent',
            borderColor: 'transparent'
          }}
        >
          <ConversationHeader
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderBottom: `1px solid ${theme.palette.divider}`
            }}
          >
            <ConversationHeader.Back onClick={drawerClose} />
            <Avatar
              src={
                otherUser?.profilePicture ||
                'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'
              }
              name={otherUser?.displayName || ''}
            />
            <ConversationHeader.Content>
              <Stack direction="row" spacing={1} alignItems="center">
                <Stack spacing={0.3}>
                  <Typography
                    fontSize={16}
                    fontWeight={'medium'}
                    sx={{ color: theme.palette.text.primary }}
                  >
                    {otherUser?.displayName || ''}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    {otherUser?.role || ''}
                  </Typography>
                </Stack>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteClick(selectedChatRoom.id)}
                  style={{ marginLeft: 'auto' }}
                  sx={{ color: theme.palette.text.secondary }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            </ConversationHeader.Content>
          </ConversationHeader>
          <MessageList
            style={{
              backgroundColor: 'transparent'
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
                          message: 'No messages yet. Say hello!',
                          direction: 'incoming',
                          position: 'single',
                          sender: 'system'
                        }}
                        style={{
                          backgroundColor:
                            theme.palette.mode === 'dark'
                              ? 'rgba(45, 55, 72, 0.8)'
                              : 'rgba(247, 250, 252, 0.8)',
                          color: theme.palette.text.primary,
                          backdropFilter: 'blur(10px)'
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
                        style={{
                          backgroundColor:
                            msg.senderId === user?.uid
                              ? theme.palette.primary.main
                              : theme.palette.mode === 'dark'
                              ? 'rgba(45, 55, 72, 0.8)'
                              : 'rgba(247, 250, 252, 0.8)',
                          color:
                            msg.senderId === user?.uid
                              ? theme.palette.primary.contrastText
                              : theme.palette.text.primary,
                          backdropFilter:
                            msg.senderId !== user?.uid ? 'blur(10px)' : 'none'
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
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderTop: `1px solid ${theme.palette.divider}`
            }}
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
            backgroundColor: 'transparent'
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
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderLeft: `1px solid ${theme.palette.divider}`
        }}
      >
        <ConversationList>
          {conversations.map((conversation) => (
            <Conversation
              key={conversation.id}
              name={conversation.name}
              info={conversation.lastMessage}
              unreadCnt={conversation.unreadCount || 0}
              onClick={() => handleConversationSelect(conversation.id)}
              active={selectedChatRoom?.id === conversation.id}
              style={{
                position: 'relative',
                backgroundColor:
                  selectedChatRoom?.id === conversation.id
                    ? theme.palette.mode === 'dark'
                      ? 'rgba(45, 55, 72, 0.8)'
                      : 'rgba(227, 242, 253, 0.8)'
                    : 'transparent',
                color: theme.palette.text.primary,
                backdropFilter:
                  selectedChatRoom?.id === conversation.id
                    ? 'blur(10px)'
                    : 'none'
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
            <div style={{ padding: '16px', textAlign: 'center' }}>
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
          slotProps={{
            paper: {
              sx: {
                p: 2,
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary
              }
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
