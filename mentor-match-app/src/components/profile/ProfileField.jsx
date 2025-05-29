import React from 'react'
import { Box } from '@mui/material'

const ProfileField = ({ icon: Icon, children }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'flex-end'
    }}
  >
    <Icon color="primary" sx={{ mr: 0.6, my: 0.5 }} />
    {children}
  </Box>
)

export default ProfileField
