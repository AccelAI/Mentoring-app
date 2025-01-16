import React, { useState } from 'react'
import {
  Stack,
  Typography,
  Box,
  Card,
  Divider,
  IconButton,
  TextField
} from '@mui/material'
import { Edit as EditIcon } from '@mui/icons-material'
import { useUser } from '../hooks/useUser'

const ProfileWidget = () => {
  const { user } = useUser()

  return (
    <Card sx={{ width: { md: '28%', xs: '100%' }, height: '350px' }}>
      {user ? (
        /* Logged in user */
        <Stack spacing={0.5} px={2} pb={2} pt={1}>
          <IconButton sx={{ alignSelf: 'end' }}>
            <EditIcon color="primary" />
          </IconButton>
          <Box
            component="img"
            src={
              user.profilePicture
                ? user.profilePicture
                : 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'
            }
            alt="profile-picture"
            sx={{
              height: '120px',
              width: '120px',
              borderRadius: '100%',
              objectFit: 'cover',
              alignSelf: 'center'
            }}
          />

          <Typography
            fontSize={18}
            fontWeight={'regular'}
            lineHeight={1.2}
            sx={{ pt: 1 }}
          >
            {user.display_name}
          </Typography>
          <Typography fontSize={14} color="secondary">
            @{user.username}
          </Typography>
          <Stack
            direction={'row'}
            spacing={1}
            divider={<Divider orientation="vertical" flexItem />}
          >
            <Typography variant="body2" color="text.secondary">
              {user.affiliation}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.title}
            </Typography>
          </Stack>

          <Typography
            variant="subtitle2"
            fontWeight={'regular'}
            color="text.secondary"
          >
            {user.profileDescription}
          </Typography>
        </Stack>
      ) : (
        /* Not logged in */
        <Stack spacing={2} alignItems={'center'} p={2}></Stack>
      )}
    </Card>
  )
}

export default ProfileWidget
