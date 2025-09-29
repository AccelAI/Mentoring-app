// React and hooks
import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

// Material-UI components and icons
import {
  Stack,
  Select,
  Typography,
  MenuItem,
  FormControl,
  FormControlLabel,
  InputLabel,
  Button,
  Box,
  Stepper,
  Step,
  StepButton,
  StepLabel,
  Switch,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  RadioGroup,
  Radio
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { ErrorOutline } from '@mui/icons-material'

// Component imports
import ProfilePicture from '../components/ProfilePicture'
import MainCard from '../components/MainCard'
import TextField from '../components/inputFields/TextField'
import UploadImageButton from '../components/UploadImageButton'
import CountrySelect from '../components/inputFields/CountrySelect'

// Hooks and services
import { updateUserProfile } from '../api/users'
import { finalizeUserProfile } from '../api/users'
import { useUser } from '../hooks/useUser'
import { useSnackbar } from 'notistack'

// Form validation
import { Form, Formik } from 'formik'
import * as yup from 'yup'

// Firebase
import { storage } from '../api/firebaseConfig'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

const schema = yup.object().shape({
  title: yup.string().required('Please enter your current position'),
  affiliation: yup.string().required('Please enter your affiliation'),
  //profilePicture: yup.string().url('Invalid URL'),
  websiteUrl: yup.string().url('Invalid URL'),
  publicProfile: yup.boolean().required('Please select an option'),
  location: yup.string().required('Please select your country'),
  identifyAs: yup.string().required('Please select an option')
})

const steps = ['1', '2', '3', '4']

const GetStarted = () => {
  const [activeStep, setActiveStep] = useState(1)
  const [openDialog, setOpenDialog] = useState(false)
  const [openApplicationDialog, setOpenApplicationDialog] = useState(false)
  const [selectedValue, setSelectedValue] = useState('mentee')
  // Track if "Other" is selected for gender
  const [genderIsOther, setGenderIsOther] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()
  const { user, refreshUser } = useUser()

  const handleValueChange = (event) => {
    setSelectedValue(event.target.value)
  }

  const finalizeProfile = useCallback(async () => {
    if (!user?.uid) return
    const res = await finalizeUserProfile(user.uid)
    if (res.ok) {
      await refreshUser(user.uid)
    }
  }, [user, refreshUser])

  const handleDialogClose = () => {
    setOpenDialog(false)
    // Do NOT finalize here to avoid Auth wrapper redirect before showing final step
    handleNext()
  }

  const handleApplicationDialogOpen = () => {
    setOpenDialog(false)
    setOpenApplicationDialog(true)
  }

  const handleApplicationDialogClose = () => {
    setOpenApplicationDialog(false)
  }

  const fillFormLater = () => {
    handleApplicationDialogClose()
    // Do NOT finalize yet; let user see final step and click Finish
    handleNext()
  }

  const goToApplicationForm = () => {
    handleApplicationDialogClose()
    // Finalize before leaving wizard to forms
    finalizeProfile()
    if (selectedValue === 'mentee') {
      navigate('/mentee-form')
    } else if (selectedValue === 'mentor') {
      navigate('/mentor-form')
    } else {
      navigate('/combined-form')
    }
  }

  const handleNext = () => {
    if (activeStep === 3) {
      navigate('/dashboard')
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }
  }

  const getTitle = () => {
    if (activeStep === 3) {
      return "Congrats, you've joined the private forum of the Accel AI network!"
    }
    return 'Welcome to the Accel AI Mentoring App!'
  }

  const onSubmit = useCallback(
    async (values, { setSubmitting }) => {
      console.log('Form submitted with values:', values)
      setSubmitting(true)
      try {
        const res = await updateUserProfile(user, values)
        if (!res.ok) {
          setSubmitting(false)
          return enqueueSnackbar(res.error, { variant: 'error' })
        }
        enqueueSnackbar('Profile created successfully', { variant: 'success' })
        // DO NOT refreshUser() here to avoid remount before showing dialog
        if (user.authMigrated === true) {
          await finalizeProfile()
          setActiveStep(3)
          setSubmitting(false)
          return
        }
        setOpenDialog(true)
      } catch (error) {
        console.error('Error during profile setup:', error)
        enqueueSnackbar('An error occurred during profile setup', {
          variant: 'error'
        })
      } finally {
        setSubmitting(false)
      }
    },
    [enqueueSnackbar, user, finalizeProfile]
  )

  const initialValues = useMemo(
    () => ({
      gender: '',
      title: '',
      affiliation: '',
      location: '',
      identifyAs: '',
      profilePicture: null,
      profileDescription: '',
      websiteUrl: '',
      publicProfile: true
    }),
    []
  )

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}
    >
      <Stack
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          width: 1,
          height: 1
        }}
        mt={{ lg: 2 }}
        spacing={3}
      >
        <Stepper
          activeStep={activeStep}
          sx={{ width: { xl: '50%', md: '60%', sm: '100%' } }}
        >
          {steps.map((label, index) => (
            <Step key={label}>
              {index === 0 ? (
                <StepLabel />
              ) : (
                <StepButton
                  disabled={index > activeStep}
                  onClick={() => index <= activeStep && setActiveStep(index)}
                >
                  <StepLabel />
                </StepButton>
              )}
            </Step>
          ))}
        </Stepper>
        <MainCard
          title={getTitle()}
          fontWeight={'light'}
          titleSize={'h5'}
          props={{ height: '100vh' }}
          enableContainer={false}
          hideLogo={activeStep === 2}
        >
          <Formik
            initialValues={initialValues}
            validationSchema={schema}
            onSubmit={onSubmit}
          >
            {({ isSubmitting, values, setFieldValue, isValid }) => {
              // derive which radio is selected
              const predefined = ['female', 'male', 'nonbinary']
              const radioGenderValue = genderIsOther
                ? 'other'
                : predefined.includes(values.gender)
                ? values.gender
                : ''
              return (
                <Form>
                  {activeStep === 1 && (
                    <>
                      <Typography variant="body1" sx={{ textAlign: 'center' }}>
                        Becoming a new member only takes a minute.
                      </Typography>
                      <Box>
                        <Stack spacing={2} mt={1}>
                          <Stack>
                            <Typography fontWeight={'medium'}>
                              Gender
                            </Typography>
                            <FormControl>
                              <RadioGroup
                                row
                                name="gender"
                                value={radioGenderValue}
                                onChange={(e) => {
                                  const v = e.target.value
                                  if (v === 'other') {
                                    setGenderIsOther(true)
                                    // keep current custom value in 'gender' or clear it if it's a predefined value
                                    if (predefined.includes(values.gender)) {
                                      setFieldValue('gender', '')
                                    }
                                  } else {
                                    setGenderIsOther(false)
                                    setFieldValue('gender', v)
                                  }
                                }}
                              >
                                <FormControlLabel
                                  value="female"
                                  control={<Radio />}
                                  label="Female"
                                />
                                <FormControlLabel
                                  value="male"
                                  control={<Radio />}
                                  label="Male"
                                />
                                <FormControlLabel
                                  value="nonbinary"
                                  control={<Radio />}
                                  label="Non-binary"
                                />
                                <FormControlLabel
                                  value="other"
                                  control={<Radio />}
                                  label="Other"
                                />
                                {genderIsOther && (
                                  <TextField
                                    name="gender"
                                    label="Please specify"
                                    variant="outlined"
                                    sx={{ width: '100%', mt: 1 }}
                                  />
                                )}
                              </RadioGroup>
                            </FormControl>
                          </Stack>
                          <Stack spacing={1}>
                            <Typography fontWeight={'medium'}>
                              What is your Current Title and Affiliation?
                            </Typography>
                            <Stack direction="row" spacing={3.5}>
                              <TextField
                                name="title"
                                label="Current Title"
                                variant="outlined"
                                sx={{ width: '100%' }}
                              />
                              <TextField
                                name="affiliation"
                                label="Affiliation"
                                variant="outlined"
                                sx={{ width: '100%' }}
                              />
                            </Stack>
                          </Stack>
                          <Stack spacing={1}>
                            <Typography fontWeight={'medium'}>
                              What is your Country of Origin or Current
                              Location?
                            </Typography>
                            <CountrySelect
                              values={values}
                              setFieldValue={setFieldValue}
                              name="location"
                            />
                          </Stack>
                          <Stack spacing={1}>
                            <Typography fontWeight={'medium'}>
                              Do you identify as being of LatinX origin?
                            </Typography>
                            <FormControl fullWidth>
                              <InputLabel>Select an Option</InputLabel>
                              <Select
                                label="Select an Option"
                                variant="outlined"
                                sx={{ width: '100%' }}
                                name="identifyAs"
                                value={values.identifyAs}
                                onChange={(event) => {
                                  setFieldValue(
                                    'identifyAs',
                                    event.target.value
                                  )
                                }}
                              >
                                <MenuItem value="Yes">Yes</MenuItem>
                                <MenuItem value="No, but Hispanic">
                                  No, but Hispanic
                                </MenuItem>
                                <MenuItem value="No, but LatinX Ally">
                                  No, but LatinX Ally
                                </MenuItem>
                                <MenuItem value="No">No</MenuItem>
                              </Select>
                            </FormControl>
                          </Stack>
                          <Button variant="contained" onClick={handleNext}>
                            Continue
                          </Button>
                        </Stack>
                      </Box>
                    </>
                  )}
                  {activeStep === 2 && (
                    <Box>
                      <Stack spacing={2} mt={3.5}>
                        <Stack spacing={3} direction="row" alignItems="center">
                          <Stack>
                            <ProfilePicture
                              img={values.profilePicture}
                              size={150}
                              borderRadius={10}
                            />
                          </Stack>
                          <Stack spacing={1}>
                            <Typography fontWeight={'medium'}>
                              Upload a profile picture
                            </Typography>
                            <UploadImageButton
                              inputId="profile-picture"
                              onChange={async (files) => {
                                const file = files[0]
                                if (file) {
                                  try {
                                    // Create a storage reference
                                    const storageRef = ref(
                                      storage,
                                      `profilePictures/${file.name}`
                                    )
                                    // Upload the file
                                    await uploadBytes(storageRef, file)
                                    // Get the download URL
                                    const downloadURL = await getDownloadURL(
                                      storageRef
                                    )
                                    // Update the form field value
                                    setFieldValue('profilePicture', downloadURL)
                                    enqueueSnackbar(
                                      'File uploaded successfully',
                                      { variant: 'success' }
                                    )
                                  } catch (error) {
                                    enqueueSnackbar(
                                      'Error uploading file: ' + error.message,
                                      { variant: 'error' }
                                    )
                                  }
                                }
                              }}
                              disabled={false}
                            />
                            <Typography variant="caption">
                              If a profile picture isn't uploaded, a default one
                              will be used
                            </Typography>
                          </Stack>
                        </Stack>
                        <Stack spacing={1}>
                          <Typography fontWeight={'medium'}>
                            Add a short bio or tagline
                          </Typography>
                          <TextField
                            name="profileDescription"
                            label="Profile Description"
                            variant="outlined"
                            sx={{ width: '100%' }}
                          />
                        </Stack>
                        <Stack spacing={1}>
                          <Typography fontWeight={'medium'}>
                            Do you have a professional website?
                          </Typography>
                          <TextField
                            name="websiteUrl"
                            label="Url"
                            variant="outlined"
                            sx={{ width: '100%' }}
                          />
                        </Stack>
                        <Stack spacing={1}>
                          <Typography fontWeight={'medium'}>
                            Do you want to be listed on our public directory for
                            collaboration, mentoring, speaking, or hiring
                            opportunities?
                          </Typography>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={values.publicProfile}
                                onChange={(event) =>
                                  setFieldValue(
                                    'publicProfile',
                                    event.target.checked
                                  )
                                }
                              />
                            }
                            label="Public Profile"
                            name="publicProfile"
                          />
                        </Stack>
                        {!isValid && (
                          <Stack
                            spacing={1}
                            direction={'row'}
                            alignItems={'center'}
                          >
                            <ErrorOutline color="error" />
                            <Typography variant="body2" color="error">
                              Please complete the missing required questions and
                              try again.
                            </Typography>
                          </Stack>
                        )}
                        <LoadingButton
                          type="submit"
                          loading={isSubmitting}
                          variant="contained"
                        >
                          Continue
                        </LoadingButton>
                      </Stack>
                    </Box>
                  )}
                  {activeStep === 3 && (
                    <Stack spacing={2}>
                      <Typography variant="body1" sx={{ textAlign: 'start' }}>
                        This space has been created for latinx identifying
                        students, post-docs, academic researchers, industry
                        researchers, and alies working in Artificial
                        Intelligence and Machine Learning to connect, share
                        resources, and foster mentorship opportunities.
                      </Typography>
                      <Button
                        onClick={async () => {
                          await finalizeProfile()
                          handleNext()
                        }}
                        variant="contained"
                        sx={{ width: '30%', alignSelf: 'end' }}
                      >
                        Finish
                      </Button>
                    </Stack>
                  )}

                  {/* MENTORSHIP PROGRAM DIALOG */}
                  <Dialog open={openDialog} onClose={handleDialogClose}>
                    <DialogTitle textAlign="center">
                      {
                        'Are you interested in participating as a mentor or mentee in our Mentorship Program?'
                      }
                    </DialogTitle>
                    <DialogActions
                      sx={{ justifyContent: 'space-around', m: 1 }}
                    >
                      <Button
                        variant="contained"
                        onClick={handleApplicationDialogOpen}
                        sx={{ width: '120px' }}
                        autoFocus
                      >
                        Yes
                      </Button>
                      <Button onClick={handleDialogClose}>No thanks</Button>
                    </DialogActions>
                  </Dialog>
                  {/* FILL APPLICATION FORM DIALOG */}
                  <Dialog
                    open={openApplicationDialog}
                    onClose={handleApplicationDialogClose}
                  >
                    <DialogTitle textAlign="center">
                      {
                        'Which role best matches your interest in our Mentorship Program?'
                      }
                    </DialogTitle>
                    <DialogContent sx={{ alignSelf: 'center' }}>
                      <FormControl>
                        <RadioGroup
                          row
                          name="form-radio-options"
                          value={selectedValue}
                          onChange={handleValueChange}
                        >
                          <FormControlLabel
                            value="mentee"
                            control={<Radio />}
                            label="Mentee"
                          />
                          <FormControlLabel
                            value="mentor"
                            control={<Radio />}
                            label="Mentor"
                          />
                          <FormControlLabel
                            value="both"
                            control={<Radio />}
                            label="Both"
                          />
                        </RadioGroup>
                      </FormControl>
                    </DialogContent>
                    <DialogActions
                      sx={{ justifyContent: 'space-between', m: 1 }}
                    >
                      <Button onClick={fillFormLater}>
                        Fill Application Form Later
                      </Button>
                      <Button
                        variant="contained"
                        onClick={goToApplicationForm}
                        autoFocus
                      >
                        Go to Application Form
                      </Button>
                    </DialogActions>
                  </Dialog>
                </Form>
              )
            }}
          </Formik>
        </MainCard>
      </Stack>
    </Box>
  )
}

export default GetStarted
