import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Box,
  Stack,
  Divider,
  Link,
  IconButton
} from '@mui/material'
import {
  Business as BusinessIcon,
  Language as LanguageIcon,
  LocationOn as LocationIcon,
  Link as LinkIcon,
  SchoolRounded as SchoolIcon,
  Person as PersonIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import ProfilePicture from '../ProfilePicture'
import { useUser } from '../../hooks/useUser'
import { getFormAnswers } from '../../api/forms'

const UserProfileDialog = ({ openDialog, setOpenDialog, userId, editable }) => {
  const [user, setUser] = useState({})
  const [loading, setLoading] = useState(true)
  const { userList } = useUser()
  const [formAnswers, setFormAnswers] = useState({})

  useEffect(() => {
    if (openDialog) {
      const fetchUser = async () => {
        const res = userList.find((user) => user.id === userId)
        console.log('user', res)
        setUser(res)

        const ans = await getFormAnswers(userId)
        setFormAnswers(ans)
        console.log('formAnswers', ans)
        setLoading(false)
      }
      fetchUser()
    }
  }, [openDialog, userId, userList])

  return (
    <Dialog
      open={openDialog}
      onClose={() => setOpenDialog(false)}
      maxWidth={editable ? 'lg' : 'md'}
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
          <Stack
            //alignItems={'center'}
            sx={{ width: '100%' }}
            spacing={1}
            pb={5}
          >
            <IconButton
              onClick={() => setOpenDialog(false)}
              color="text.secondary"
              sx={{ alignSelf: 'flex-end' }}
            >
              <CloseIcon />
            </IconButton>
            <Stack direction="row" spacing={2} width={'100%'} pr={6} pl={2}>
              <Stack
                width={'35%'}
                alignItems={'center'}
                justifyContent={'center'}
              >
                <ProfilePicture
                  img={user.profilePicture}
                  size={200}
                  borderRadius={100}
                  props={{ alignSelf: 'center' }}
                />
              </Stack>
              <Stack spacing={1} width={'65%'}>
                <Stack
                  direction="row"
                  justifyContent={'space-between'}
                  alignItems={'center'}
                >
                  <Typography variant={'h6'} fontWeight={'regular'}>
                    {user.displayName}
                  </Typography>

                  {user.role && (
                    <Stack direction="row" spacing={0.5}>
                      <Typography variant={'body2'} color="text.secondary">
                        {user.role}
                      </Typography>
                      <SchoolIcon fontSize="small" color="secondary" />
                    </Stack>
                  )}
                </Stack>
                <Divider orientation="horizontal" />

                {user.profileDescription && (
                  <Typography variant={'body2'} color="text.secondary" py={1.5}>
                    {user.profileDescription}
                  </Typography>
                )}

                <Typography variant={'body2'} lineHeight={2}>
                  {user.title && (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <PersonIcon fontSize="small" color="primary" />
                      <span>{user.title}</span>
                    </Stack>
                  )}
                  {user.affiliation && (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <BusinessIcon fontSize="small" color="primary" />
                      <span>Affiliation: {user.affiliation}</span>
                    </Stack>
                  )}
                  {user.location && (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <LocationIcon fontSize="small" color="primary" />
                      <span>Location: {user.location}</span>
                    </Stack>
                  )}

                  {formAnswers && (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <LanguageIcon fontSize="small" color="primary" />
                      <span>
                        Languages:{' '}
                        {formAnswers.mentorData
                          ? formAnswers.mentorData.languages.join(', ')
                          : formAnswers.menteeData.languages.join(', ')}
                      </span>
                    </Stack>
                  )}
                  {user.websiteUrl && (
                    <Stack direction="row" spacing={0.5} alignItems={'center'}>
                      <LinkIcon fontSize="small" color="primary" />
                      <Link
                        color="inherit"
                        target="_blank"
                        rel="noopener"
                        href={user.websiteUrl}
                      >
                        {user.websiteUrl}
                      </Link>
                    </Stack>
                  )}
                </Typography>
                {false && (
                  <Button
                    variant="contained"
                    sx={{
                      width: 'fit-content',
                      alignSelf: 'center'
                    }}
                  >
                    Choose as mentor
                  </Button>
                )}
              </Stack>
            </Stack>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default UserProfileDialog
