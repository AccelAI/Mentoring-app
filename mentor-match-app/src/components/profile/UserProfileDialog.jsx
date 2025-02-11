import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Box,
  Stack
} from '@mui/material'
import { getUserById } from '../../api/users'

const UserProfileDialog = ({ openDialog, setOpenDialog, userId }) => {
  const [user, setUser] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (openDialog) {
      const fetchUser = async () => {
        const res = await getUserById(userId)
        console.log('user', res)
        setUser(res)
        setLoading(false)
      }
      fetchUser()
    }
  }, [openDialog, userId])

  return (
    <Dialog
      open={openDialog}
      onClose={() => setOpenDialog(false)}
      maxWidth={'lg'}
      fullWidth
    >
      <DialogContent>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            pt={2}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Stack alignItems={'center'}>
            <Stack direction="row" spacing={2}>
              <Box
                component="img"
                src={
                  user.profilePicture
                    ? user.profilePicture
                    : 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'
                }
                alt="profile-picture"
                sx={{
                  height: '150px',
                  width: '150px',
                  borderRadius: '10%',
                  objectFit: 'cover'
                }}
              />
              <Typography>{user.displayName}</Typography>
            </Stack>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenDialog(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default UserProfileDialog
