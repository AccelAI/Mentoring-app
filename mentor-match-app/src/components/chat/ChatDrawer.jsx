import { useState } from 'react'
import { Fab, Box, SwipeableDrawer, Badge } from '@mui/material'
import { Chat as ChatIcon } from '@mui/icons-material'
import Chat from './Chat'

const ChatDrawer = ({
  open,
  onOpen,
  onClose,
  selectedChatRoomId,
  setSelectedChatRoomId
}) => {
  const [hasUnread, setHasUnread] = useState(false)
  return (
    <>
      {!open && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
            pointerEvents: 'auto'
          }}
        >
          <Fab
            color="primary"
            aria-label="chat"
            onClick={onOpen}
            sx={{ overflow: 'visible' }}
          >
            <Badge
              key={hasUnread ? 'unread' : 'read'}
              color="error"
              variant="dot"
              overlap="circular"
              invisible={!hasUnread}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <ChatIcon />
            </Badge>
          </Fab>
        </Box>
      )}

      <SwipeableDrawer
        anchor="right"
        onClose={onClose}
        onOpen={onOpen}
        open={open}
        keepMounted
        disableSwipeToOpen={true}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100%', sm: '400px', md: '40%' },
              height: '100vh',
              borderTopLeftRadius: 8,
              borderBottomLeftRadius: 8,
              overflow: 'visible'
            }
          }
        }}
      >
        <Box
          sx={{
            height: '100%',
            pt: 3,
            px: 2,
            pb: 2
          }}
        >
          <Chat
            selectedChatRoomId={selectedChatRoomId}
            setSelectedChatRoomId={setSelectedChatRoomId}
            setHasUnread={setHasUnread}
            drawerOpen={open}
          />
        </Box>
      </SwipeableDrawer>
    </>
  )
}

export default ChatDrawer
