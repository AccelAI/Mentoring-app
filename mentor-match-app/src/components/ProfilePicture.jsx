import React from 'react'
import { Box } from '@mui/material'

const ProfilePicture = ({ img, size, borderRadius, props }) => {
  return (
    <Box
      component="img"
      src={
        img
          ? img
          : 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'
      }
      alt="profile-picture"
      sx={{
        height: `${size}px`,
        width: `${size}px`,
        borderRadius: `${borderRadius}%`,
        objectFit: 'cover',
        ...props
      }}
    />
  )
}

export default ProfilePicture
