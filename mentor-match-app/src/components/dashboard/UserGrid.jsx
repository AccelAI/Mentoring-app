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
import MatchDialog from '../dialogs/MatchDialog'

const UserGrid = ({
  user,
  gridSize = 4,
  showSelectAsMentorButton,
  showChatButton,
  showViewProfileButton,
  showEndMentorshipButton
}) => {
  const [openDialog, setOpenDialog] = useState(false)
  const [openMatchDialog, setOpenMatchDialog] = useState(false)

  return (
    <Grid size={gridSize}>
      <Card
        sx={{
          height: '100%',
          transition: 'box-shadow 0.3s',
          '&:hover': {
            boxShadow: 2,
            cursor: showSelectAsMentorButton ? '' : 'pointer'
          }
        }}
        variant="outlined"
        onClick={() => {
          if (!showSelectAsMentorButton) {
            setOpenDialog(true)
          }
        }}
      >
        <Stack spacing={1} p={2} sx={{ height: '100%' }}>
          <Stack direction={'row'} spacing={2} sx={{ height: '100%' }}>
            <ProfilePicture
              img={user.profilePicture}
              size={80}
              borderRadius={10}
            />
            <Stack sx={{ maxWidth: '58%' }}>
              <Box>
                <Typography
                  fontSize={18}
                  fontWeight={'regular'}
                  lineHeight={1.2}
                >
                  {user.displayName}
                </Typography>
                {showSelectAsMentorButton && (
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
                {!showSelectAsMentorButton && (
                  <Typography fontWeight={'light'}>
                    {user.role ? user.role : ''}
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
                  {user.affiliation}
                </Typography>
                <Stack direction={'row'} spacing={0.4} alignItems={'center'}>
                  <LocationIcon fontSize="small" color="secondary" />
                  <Typography
                    variant={'body2'}
                    fontWeight={'light'}
                    color="text.secondary"
                  >
                    {user.location}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
          {showViewProfileButton && (
            <Button
              variant="contained"
              size="small"
              sx={{ width: 'fit-content', alignSelf: 'center' }}
              onClick={() => {
                setOpenDialog(true)
              }}
            >
              View Profile
            </Button>
          )}
        </Stack>
      </Card>
      <UserProfileDialog
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        setOpenMatchDialog={setOpenMatchDialog}
        userId={user.uid}
        showSelectAsMentorButton={showSelectAsMentorButton}
        showChatButton={showChatButton}
        showEndMentorshipButton={showEndMentorshipButton}
      />
      <MatchDialog
        openDialog={openMatchDialog}
        setOpenDialog={setOpenMatchDialog}
      />
    </Grid>
  )
}

export default UserGrid
