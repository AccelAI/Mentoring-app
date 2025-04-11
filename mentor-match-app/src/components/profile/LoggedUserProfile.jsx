import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  Button,
  Typography,
  CircularProgress,
  Box,
  Stack,
  Divider,
  Link,
  IconButton,
  Fab
} from '@mui/material'
import {
  Business as BusinessIcon,
  Language as LanguageIcon,
  LocationOn as LocationIcon,
  Link as LinkIcon,
  SchoolRounded as SchoolIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  Edit as EditIcon
} from '@mui/icons-material'
import ProfilePicture from '../ProfilePicture'
import { useUser } from '../../hooks/useUser'
import { getFormAnswers } from '../../api/forms'
import { useSnackbar } from 'notistack'
import { Form, Formik } from 'formik'
import * as yup from 'yup'
import { LoadingButton } from '@mui/lab'
import TextField from '../../components/questions/text/TextField'
import { updateUserProfile } from '../../api/users'
import SubmittedFormsSection from './SubmittedFormsSection'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../../api/firebaseConfig'
import ProfileField from './ProfileField'

const schema = yup.object().shape({
  name: yup.string().required('Please enter your name'),
  title: yup.string().required('Please enter your title'),
  affiliation: yup.string().required('Please enter your affiliation'),
  //profilePicture: yup.string().url('Invalid URL'),
  websiteUrl: yup.string().url('Invalid URL'),
  publicProfile: yup.boolean()
})

const LoggedUserProfile = ({ openDialog, setOpenDialog }) => {
  const [loading, setLoading] = useState(true)
  const { user, refreshUser } = useUser()
  const [formAnswers, setFormAnswers] = useState({})
  const [enableEdit, setEnableEdit] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  const onSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true)
    try {
      const res = await updateUserProfile(user, values)
      if (!res.ok) {
        setSubmitting(false)
        return enqueueSnackbar(res.error, { variant: 'error' })
      }
      enqueueSnackbar('Profile updated successfully', { variant: 'success' })
      await refreshUser()
      setSubmitting(false)
      setEnableEdit(false)
      //handleDialogOpen()
    } catch (error) {
      console.error('Error during profile update:', error)
      enqueueSnackbar('An error occurred during profile update', {
        variant: 'error'
      })
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (openDialog) {
      const fetchFormAnswers = async () => {
        const ans = await getFormAnswers(user.uid)
        setFormAnswers(ans)
        console.log('formAnswers', ans)
        setLoading(false)
      }
      fetchFormAnswers()
    }
  }, [openDialog, user.uid])

  const initialValues = {
    name: user.displayName,
    description: user.profileDescription,
    affiliation: user.affiliation,
    title: user.title,
    location: user.location,
    profilePicture: user.profilePicture,
    profileDescription: user.profileDescription,
    websiteUrl: user.websiteUrl
  }

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
          <Stack
            //alignItems={'center'}
            sx={{ width: '100%' }}
            spacing={1}
            pb={5}
          >
            <IconButton
              onClick={() => {
                setOpenDialog(false)
                setEnableEdit(false)
              }}
              color="text.secondary"
              sx={{ alignSelf: 'flex-end' }}
            >
              <CloseIcon />
            </IconButton>
            <Stack direction="row" spacing={2} width={'100%'} pr={6} pl={2}>
              <Formik
                initialValues={initialValues}
                validationSchema={schema}
                onSubmit={onSubmit}
                sx={{ width: '100%' }}
              >
                {({ isSubmitting, values, setFieldValue }) => (
                  <>
                    <Stack
                      width={'35%'}
                      alignItems={'center'}
                      justifyContent={'center'}
                    >
                      <Box>
                        <ProfilePicture
                          img={
                            enableEdit
                              ? values.profilePicture
                              : user.profilePicture
                          }
                          size={200}
                          borderRadius={100}
                          props={{
                            position: 'absolute',
                            left: '8rem',
                            top: '8rem'
                          }}
                        />
                        {enableEdit && (
                          <>
                            <input
                              type="file"
                              accept="image/*"
                              id="upload-profile-picture"
                              style={{ display: 'none' }}
                              onChange={async (e) => {
                                const file = e.target.files[0]
                                if (file) {
                                  try {
                                    // Upload the file to Firebase Storage
                                    const storageRef = ref(
                                      storage,
                                      `profilePictures/${file.name}`
                                    )
                                    await uploadBytes(storageRef, file)

                                    // Get the download URL
                                    const downloadURL = await getDownloadURL(
                                      storageRef
                                    )

                                    // Update the user's profile picture
                                    setFieldValue('profilePicture', downloadURL)
                                    enqueueSnackbar(
                                      'Profile picture updated successfully',
                                      {
                                        variant: 'success'
                                      }
                                    )
                                  } catch (error) {
                                    enqueueSnackbar(
                                      'Error uploading profile picture: ' +
                                        error.message,
                                      {
                                        variant: 'error'
                                      }
                                    )
                                  }
                                }
                              }}
                            />
                            <Fab
                              color="primary"
                              size="medium"
                              aria-label="edit"
                              sx={{
                                position: 'relative',
                                top: '5.5rem',
                                left: '4.5rem'
                              }}
                              onClick={() =>
                                document
                                  .getElementById('upload-profile-picture')
                                  .click()
                              }
                            >
                              <EditIcon />
                            </Fab>
                          </>
                        )}
                      </Box>
                    </Stack>

                    {enableEdit ? (
                      /* EDITABLE PROFILE (SETTINGS) */

                      <Box width={'65%'}>
                        <Form>
                          <Stack spacing={2}>
                            <Stack spacing={1}>
                              <Typography variant={'h6'} fontWeight={'light'}>
                                Edit Profile
                              </Typography>
                              <Stack
                                direction="row"
                                justifyContent={'space-between'}
                                alignItems={'center'}
                                width={'100%'}
                                spacing={'40%'}
                              >
                                <TextField
                                  name="name"
                                  label="Name"
                                  variant="standard"
                                />

                                {user.role && (
                                  <Stack direction="row" spacing={0.5}>
                                    <Typography
                                      variant={'body2'}
                                      color="text.secondary"
                                    >
                                      {user.role}
                                    </Typography>
                                    <SchoolIcon
                                      fontSize="small"
                                      color="secondary"
                                    />
                                  </Stack>
                                )}
                              </Stack>

                              <TextField
                                name="profileDescription"
                                label="Profile Description"
                                variant="standard"
                                size="small"
                              />
                            </Stack>

                            <Stack
                              spacing={2}
                              mt={2}
                              width={'100%'}
                              direction={'row'}
                            >
                              <Stack spacing={1}>
                                <ProfileField icon={PersonIcon}>
                                  <TextField
                                    name="title"
                                    label="Title"
                                    variant="standard"
                                    size="small"
                                  />
                                </ProfileField>
                                <ProfileField icon={BusinessIcon}>
                                  <TextField
                                    name="affiliation"
                                    label="Affiliation"
                                    variant="standard"
                                    size="small"
                                  />
                                </ProfileField>
                              </Stack>
                              <Stack spacing={1}>
                                <ProfileField icon={LocationIcon}>
                                  <TextField
                                    name="location"
                                    label="Location"
                                    variant="standard"
                                    size="small"
                                  />
                                </ProfileField>
                                <ProfileField icon={LinkIcon}>
                                  <TextField
                                    name="websiteUrl"
                                    label="Website URL"
                                    variant="standard"
                                    size="small"
                                  />
                                </ProfileField>
                              </Stack>
                            </Stack>
                            <Stack
                              direction={'row'}
                              spacing={1}
                              alignSelf={'flex-end'}
                            >
                              <LoadingButton
                                type="submit"
                                loading={isSubmitting}
                                variant="contained"
                                sx={{
                                  width: 'fit-content'
                                }}
                                size="small"
                              >
                                Save Changes
                              </LoadingButton>
                              <Button
                                sx={{ width: 'fit-content' }}
                                onClick={() => {
                                  setEnableEdit(false)
                                  setFieldValue(
                                    'profilePicture',
                                    user.profilePicture
                                  )
                                }}
                                variant="outlined"
                                size="small"
                              >
                                Cancel
                              </Button>
                            </Stack>
                          </Stack>
                        </Form>
                      </Box>
                    ) : (
                      /* USER PROFILE */
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
                              <Typography
                                variant={'body2'}
                                color="text.secondary"
                              >
                                {user.role}
                              </Typography>
                              <SchoolIcon fontSize="small" color="secondary" />
                            </Stack>
                          )}
                        </Stack>
                        <Divider orientation="horizontal" />
                        {user.profileDescription && (
                          <Typography
                            variant={'body2'}
                            color="text.secondary"
                            py={1.5}
                          >
                            {user.profileDescription}
                          </Typography>
                        )}
                        <Typography variant={'body2'} lineHeight={2}>
                          {user.title && (
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                            >
                              <PersonIcon fontSize="small" color="primary" />
                              <span>{user.title}</span>
                            </Stack>
                          )}
                          {user.affiliation && (
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                            >
                              <BusinessIcon fontSize="small" color="primary" />
                              <span>Affiliation: {user.affiliation}</span>
                            </Stack>
                          )}
                          {user.location && (
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                            >
                              <LocationIcon fontSize="small" color="primary" />
                              <span>Location: {user.location}</span>
                            </Stack>
                          )}

                          {formAnswers && (
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                            >
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
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems={'center'}
                            >
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

                        <Button
                          variant="contained"
                          onClick={() => setEnableEdit(true)}
                          startIcon={<EditIcon />}
                          sx={{
                            width: 'fit-content',
                            alignSelf: 'flex-end'
                          }}
                          size="small"
                        >
                          Edit Profile
                        </Button>
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
                    )}
                  </>
                )}
              </Formik>
            </Stack>

            <SubmittedFormsSection />
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default LoggedUserProfile
