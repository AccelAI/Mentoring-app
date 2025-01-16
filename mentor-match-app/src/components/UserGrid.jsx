import React from 'react'
import {
  Grid2 as Grid,
  Stack,
  Typography,
  Box,
  Card,
  Button
} from '@mui/material'
import { LocationOnOutlined as LocationIcon } from '@mui/icons-material'

const UserGrid = ({ id, name, role, affiliation, location, image, select }) => {
  return (
    <Grid size={4}>
      <Card sx={{ height: '100%' }} variant="outlined">
        <Stack spacing={1} p={2} sx={{ height: '100%' }}>
          <Stack direction={'row'} spacing={2} sx={{ height: '100%' }}>
            <Box
              component="img"
              src={
                image
                  ? image
                  : 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'
              }
              alt="profile-picture"
              sx={{
                height: '80px',
                width: '80px',
                borderRadius: '10%',
                objectFit: 'cover'
              }}
            />
            <Stack sx={{ maxWidth: '58%' }}>
              <Box>
                <Typography
                  fontSize={18}
                  fontWeight={'regular'}
                  lineHeight={1.2}
                >
                  {name}
                </Typography>
                <Typography fontWeight={'light'}>{role}</Typography>
              </Box>
              <Box sx={{ flexGrow: 1 }} />
              <Box>
                <Typography
                  variant={'body2'}
                  fontWeight={'light'}
                  color="text.secondary"
                >
                  {affiliation}
                </Typography>
                <Stack direction={'row'} spacing={0.4} alignItems={'center'}>
                  <LocationIcon fontSize="small" color="secondary" />
                  <Typography
                    variant={'body2'}
                    fontWeight={'light'}
                    color="text.secondary"
                  >
                    {location}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
          {select && (
            <Button
              variant="contained"
              size="small"
              sx={{ width: 'fit-content', alignSelf: 'center' }}
            >
              Select Mentor
            </Button>
          )}
        </Stack>
      </Card>
    </Grid>
  )
}

export default UserGrid
