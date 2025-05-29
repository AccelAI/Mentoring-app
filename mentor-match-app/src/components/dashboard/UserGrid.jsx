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
import MatchDialog from '../MatchDialog'

const UserGrid = ({
  id,
  name,
  role,
  affiliation,
  location,
  image,
  enableSelect
}) => {
  const [openDialog, setOpenDialog] = useState(false)
  const [openMatchDialog, setOpenMatchDialog] = useState(false)

  return (
    <Grid size={4}>
      <Card
        sx={{
          height: '100%',
          transition: 'box-shadow 0.3s',
          '&:hover': {
            boxShadow: 2,
            cursor: enableSelect ? '' : 'pointer'
          }
        }}
        variant="outlined"
        onClick={() => {
          if (!enableSelect) {
            setOpenDialog(true)
          }
        }}
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
                {enableSelect && (
                  <Typography
                    variant={'body2'}
                    fontWeight={'light'}
                    my={0.5}
                    mb={1}
                    display={'inline-flex'}
                  >
                    Match Score:{' '}
                    <Typography variant={'body2'} pl={0.3} color="primary">
                      85%
                    </Typography>
                  </Typography>
                )}
                {!enableSelect && (
                  <Typography fontWeight={'light'}>
                    {role ? role : ''}
                  </Typography>
                )}
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
          {enableSelect && (
            <Button
              variant="contained"
              size="small"
              sx={{ width: 'fit-content', alignSelf: 'center' }}
              onClick={() => {
                setOpenDialog(true)
              }}
            >
              View Mentor
            </Button>
          )}
        </Stack>
      </Card>
      <UserProfileDialog
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        userId={id}
        editable={false}
        enableSelect={enableSelect}
        setOpenMatchDialog={setOpenMatchDialog}
      />
      <MatchDialog
        openDialog={openMatchDialog}
        setOpenDialog={setOpenMatchDialog}
      />
    </Grid>
  )
}

export default UserGrid
