import React, { useState, useEffect } from 'react'
import {
  Grid2 as Grid,
  Stack,
  Typography,
  Box,
  Card,
  Button,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  LocationOnOutlined as LocationIcon,
  AssignmentOutlined as FormIcon,
  AccountCircle as ProfileIcon
} from '@mui/icons-material'
import UserProfileDialog from '../profile/UserProfileDialog'
import ProfilePicture from '../ProfilePicture'
import MatchDialog from '../dialogs/MatchDialog'
import MenteeApplicationDialog from '../dialogs/formReview/MenteeApplicationDialog'
import { getApplicationByUserId } from '../../api/forms'

const UserGrid = ({
  user,
  gridSize = 4,
  showSelectAsMentorButton,
  showChatButton,
  showViewProfileButton,
  showEndMentorshipButton,
  showApplicationButton,
  onStartChat
}) => {
  const [openDialog, setOpenDialog] = useState(false)
  const [openMatchDialog, setOpenMatchDialog] = useState(false)
  const [openApplicationDialog, setOpenApplicationDialog] = useState(false)
  const [applicationData, setApplicationData] = useState(null)

  useEffect(() => {
    const fetchApplication = async () => {
      if (showApplicationButton && user?.uid) {
        const data = await getApplicationByUserId(user.uid)
        setApplicationData(data)
      }
    }
    fetchApplication()
  }, [showApplicationButton, user?.uid])

  if (!user) return null

  return (
    <Grid size={gridSize}>
      <Card
        sx={{
          height: '100%',
          transition: 'box-shadow 0.3s',
          '&:hover': {
            boxShadow: 2,
            cursor:
              showSelectAsMentorButton || showApplicationButton ? '' : 'pointer'
          }
        }}
        variant="outlined"
        onClick={(e) => {
          // Ignore if click originated from an element that should not open the dialog
          if (!showSelectAsMentorButton && !showApplicationButton) {
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
            <Stack
              sx={{
                maxWidth: showApplicationButton ? '100%' : '58%',
                width: '100%'
              }}
            >
              <Box>
                <Stack
                  direction={'row'}
                  alignItems={'center'}
                  sx={{ justifyContent: 'space-between' }}
                >
                  <Typography
                    fontSize={18}
                    fontWeight={'regular'}
                    lineHeight={1.2}
                  >
                    {user.displayName}
                  </Typography>
                  {showApplicationButton && (
                    <Stack direction={'row'} spacing={0.5}>
                      <Tooltip title="View Profile">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => {
                            setOpenDialog(true)
                          }}
                        >
                          <ProfileIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Application">
                        <IconButton
                          size="small"
                          color="primary"
                          data-ignore-card-click
                          onClick={() => {
                            setOpenApplicationDialog(true)
                          }}
                        >
                          <FormIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  )}
                  <MenteeApplicationDialog
                    open={openApplicationDialog}
                    onClose={() => setOpenApplicationDialog(false)}
                    enableReview={false}
                    application={applicationData}
                  />
                </Stack>
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
        onStartChat={onStartChat}
      />
      <MatchDialog
        openDialog={openMatchDialog}
        setOpenDialog={setOpenMatchDialog}
      />
    </Grid>
  )
}

export default UserGrid
