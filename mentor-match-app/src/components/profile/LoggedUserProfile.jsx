// React and hooks
import { useState, useEffect, useCallback, useMemo } from 'react'

// Material-UI components and icons
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
import { LoadingButton } from '@mui/lab'

// Component imports
import ProfilePicture from '../ProfilePicture'
import TextField from '../inputFields/TextField'
import ProfileField from './ProfileField'
import CountrySelect from '../inputFields/CountrySelect'

// Hooks and services
import { useUser } from '../../hooks/useUser'
import { useSnackbar } from 'notistack'
import { getFormAnswers } from '../../api/forms'
import { updateUserProfile } from '../../api/users'

// Firebase
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../../api/firebaseConfig'

// Form validation
import { Form, Formik } from 'formik'
import * as yup from 'yup'

const schema = yup.object().shape({
  displayName: yup.string().required('Please enter your name'),
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

  const onSubmit = useCallback(
    async (values, { setSubmitting }) => {
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
    },
    [user, enqueueSnackbar, refreshUser]
  )

  const handleFileUpload = useCallback(
    async (e, setFieldValue) => {
      const file = e.target.files[0]
      if (file) {
        try {
          const storageRef = ref(
            storage,
            `profilePictures/${user.uid}_${Date.now()}_${file.name}`
          )
          await uploadBytes(storageRef, file)
          const downloadURL = await getDownloadURL(storageRef)
          setFieldValue('profilePicture', downloadURL)
          enqueueSnackbar('Profile picture updated successfully', {
            variant: 'success'
          })
        } catch (error) {
          enqueueSnackbar('Error uploading profile picture: ' + error.message, {
            variant: 'error'
          })
        }
      }
    },
    [enqueueSnackbar, user.uid]
  )

  useEffect(() => {
    if (openDialog) {
      if (!openDialog || !user?.uid) return
      const fetchFormAnswers = async () => {
        try {
          const ans = await getFormAnswers(user.uid)
          setFormAnswers(ans)
          console.log('formAnswers', ans)
          setFormAnswers(ans || {})
          setLoading(false)
        } catch (error) {
          enqueueSnackbar('Error fetching form answers: ' + error.message, {
            variant: 'error'
          })
          setFormAnswers({})
          setLoading(false)
        }
      }
      fetchFormAnswers()
    }
    // eslint-disable-next-line
  }, [openDialog, user.uid])

  const initialValues = useMemo(
    () => ({
      displayName: user?.displayName || '',
      description: user?.profileDescription || '',
      affiliation: user?.affiliation || '',
      title: user?.title || '',
      location: user?.location || '',
      profilePicture: user?.profilePicture || '',
      profileDescription: user?.profileDescription || '',
      websiteUrl: user?.websiteUrl || ''
    }),
    [user]
  )

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
            <Stack
              direction={{ md: 'row', xs: 'column' }}
              alignItems={{ lg: 'normal', xs: 'center' }}
              spacing={2}
              width={'100%'}
              pr={6}
              pl={2}
              pb={2}
            >
              <Formik
                initialValues={initialValues}
                validationSchema={schema}
                onSubmit={onSubmit}
                sx={{ width: '100%' }}
                enableReinitialize
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
                            position: { lg: 'absolute', xs: 'relative' },
                            left: { lg: '8rem', xs: '0' },
                            top: { lg: '8rem', xs: '0' }
                          }}
                        />
                        {enableEdit && (
                          <>
                            <input
                              type="file"
                              accept="image/*"
                              id="upload-profile-picture"
                              style={{ display: 'none' }}
                              onChange={(e) =>
                                handleFileUpload(e, setFieldValue)
                              }
                            />
                            <Fab
                              color="primary"
                              size="medium"
                              aria-label="edit"
                              sx={{
                                position: 'relative',
                                top: { lg: '5.5rem', md: '1rem', xs: '0' },
                                left: { lg: '4.5rem', md: '-3rem', xs: '0' },
                                marginTop: { lg: 0, xs: -8 }
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
                                direction={{ lg: 'row', xs: 'column-reverse' }}
                                justifyContent={{
                                  lg: 'space-between',
                                  xs: 'flex-start'
                                }}
                                alignItems={'center'}
                                width={'100%'}
                                spacing={{ lg: '40%', sx: 0 }}
                              >
                                <TextField
                                  name="displayName"
                                  label="Name"
                                  variant="standard"
                                />

                                {user.role && (
                                  <Stack
                                    direction="row"
                                    spacing={0.5}
                                    alignSelf={{ lg: 'auto', xs: 'flex-start' }}
                                  >
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
                              direction={{ md: 'row', xs: 'column' }}
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
                                  {/* <TextField
                                    name="location"
                                    label="Location"
                                    variant="standard"
                                    size="small"
                                  /> */}
                                  <CountrySelect
                                    values={values}
                                    setFieldValue={setFieldValue}
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
                      <Stack spacing={1} width={'65%'} minHeight={'270px'}>
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

                          {formAnswers.ok && (
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                            >
                              <LanguageIcon fontSize="small" color="primary" />
                              <span>
                                Languages:{' '}
                                {formAnswers.mentorData
                                  ? formAnswers.mentorData.languages?.join(', ')
                                  : formAnswers.menteeData?.languages?.join(
                                      ', '
                                    )}
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
                                sx={{ wordBreak: 'break-all' }}
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
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default LoggedUserProfile
