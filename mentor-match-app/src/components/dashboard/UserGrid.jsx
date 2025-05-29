import React, { useState } from 'react'
import {
  Grid2 as Grid,
  Stack,
  Typography,
  Box,
  Card,
  Button
} from '@mui/material'
import { LocationOnOutlined as LocationIcon } from '@mui/icons-material'
import UserProfileDialog from '../profile/UserProfileDialog'
import ProfilePicture from '../ProfilePicture'

const UserGrid = ({ id, name, role, affiliation, location, image, select }) => {
  const [openDialog, setOpenDialog] = useState(false)

  return (
    <Grid size={4}>
      <Card
        sx={{
          height: '100%',
          transition: 'box-shadow 0.3s',
          '&:hover': {
            boxShadow: 2,
            cursor: 'pointer'
          }
        }}
        variant="outlined"
        onClick={() => setOpenDialog(true)}
      >
        <Stack spacing={1} p={2} sx={{ height: '100%' }}>
          <Stack direction={'row'} spacing={2} sx={{ height: '100%' }}>
            <ProfilePicture img={image} size={80} borderRadius={10} />
            <Stack sx={{ maxWidth: '58%' }}>
              <Box>
                <Typography
                  fontSize={18}
                  fontWeight={'regular'}
                  lineHeight={1.2}
                >
                  {name}
                </Typography>
                <Typography fontWeight={'light'}>{role ? role : ''}</Typography>
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
      <UserProfileDialog
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        userId={id}
        editable={false}
      />
    </Grid>
  )
}

export default UserGrid
