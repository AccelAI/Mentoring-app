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
  Container,
  Switch,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  RadioGroup,
  Radio
} from '@mui/material'
import { Form, Formik } from 'formik'
import * as yup from 'yup'
import MainCard from '../components/MainCard'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { storage } from '../api/firebaseConfig'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { LoadingButton } from '@mui/lab'
import TextField from '../components/questions/text/TextField'
import UploadImageButton from '../components/UploadImageButton'
import { updateUserProfile } from '../api/users'
import { useUser } from '../hooks/useUser'
import { useSnackbar } from 'notistack'
import ProfilePicture from '../components/ProfilePicture'

const initialValues = {
  title: '',
  affiliation: '',
  location: '',
  identifyAs: '',
  profilePicture: null,
  profileDescription: '',
  websiteUrl: '',
  publicProfile: true
}

const schema = yup.object().shape({
  title: yup.string().required('Please enter your title'),
  affiliation: yup.string().required('Please enter your affiliation'),
  //profilePicture: yup.string().url('Invalid URL'),
  websiteUrl: yup.string().url('Invalid URL'),
  publicProfile: yup.boolean()
})

const steps = ['1', '2', '3', '4']

const GetStarted = () => {
  const [activeStep, setActiveStep] = useState(1)
  const [openDialog, setOpenDialog] = useState(false)
  const [openApplicationDialog, setOpenApplicationDialog] = useState(false)
  const [selectedValue, setSelectedValue] = useState('mentee')
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()
  const { user } = useUser()

  const handleValueChange = (event) => {
    setSelectedValue(event.target.value)
  }

  const onSubmit = async (values, { setSubmitting }) => {
    console.log('Form submitted with values:', values)
    setSubmitting(true)
    try {
      const res = await updateUserProfile(user, values)
      if (!res.ok) {
        setSubmitting(false)
        return enqueueSnackbar(res.error, { variant: 'error' })
      }
      enqueueSnackbar('Profile created successfully', { variant: 'success' })
      setSubmitting(false)
      handleDialogOpen()
    } catch (error) {
      console.error('Error during profile setup:', error)
      enqueueSnackbar('An error occurred during profile setup', {
        variant: 'error'
      })
      setSubmitting(false)
    }
  }

  const handleDialogOpen = () => {
    setOpenDialog(true)
  }

  const handleDialogClose = () => {
    setOpenDialog(false)
    handleNext()
  }

  const handleApplicationDialogOpen = () => {
    handleDialogClose()
    setOpenApplicationDialog(true)
  }

  const handleApplicationDialogClose = () => {
    setOpenApplicationDialog(false)
  }

  const fillFormLater = () => {
    handleApplicationDialogClose()
    handleNext()
  }

  const goToApplicationForm = () => {
    handleApplicationDialogClose()
    if (selectedValue === 'mentee') {
      navigate('/mentee-form')
    } else if (selectedValue === 'mentor') {
      navigate('/mentor-form')
    } else {
      navigate('/mentor-mentee-form')
    }
  }

  const handleNext = () => {
    if (activeStep === 3) {
      navigate('/dashboard')
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }
  }

  const handleStep = (index) => {
    setActiveStep(index)
  }

  const getTitle = () => {
    if (activeStep === 3) {
      return "Congrats, you've joined the private forum of the LatinX in AI network!"
    }
    return 'Hi, Welcome to Latinx In AI (LXAI)!'
  }

  return (
    <Container
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Stack
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          width: 1,
          height: 1
        }}
        mt={5}
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
                <StepButton onClick={() => handleStep(index)}>
                  <StepLabel />
                </StepButton>
              )}
            </Step>
          ))}
        </Stepper>
        <MainCard
          title={getTitle()}
          titleSize={'h4'}
          props={{ height: '100vh' }}
          enableContainer={false}
        >
          <Formik
            initialValues={initialValues}
            validationSchema={schema}
            onSubmit={onSubmit}
          >
            {({ isSubmitting, values, setFieldValue }) => (
              <Form>
                {activeStep === 1 && (
                  <>
                    <Typography variant="body1" sx={{ textAlign: 'center' }}>
                      Becoming a new member only takes a minute.
                    </Typography>
                    <Box>
                      <Stack spacing={2} mt={3.5}>
                        <Stack spacing={1}>
                          <Typography>
                            What is your professional Title and Affiliation?
                          </Typography>
                          <Stack direction="row" spacing={3.5}>
                            <TextField
                              name="title"
                              label="Title"
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
                          <Typography>
                            What is your City, State, Country of Origin?
                          </Typography>
                          <TextField
                            name="location"
                            label="Origin Location"
                            variant="outlined"
                            sx={{ width: '100%' }}
                          />
                        </Stack>
                        <Stack spacing={1}>
                          <Typography>
                            Do you identify as LatinX or as an ally?
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
                                setFieldValue('identifyAs', event.target.value)
                              }}
                            >
                              <MenuItem value="LatinX (Latino/Latina/Latine)">
                                LatinX (Latino/Latina/Latine)
                              </MenuItem>
                              <MenuItem value="Afro-LatinX">
                                Afro-LatinX
                              </MenuItem>
                              <MenuItem value="Asian-LatinX">
                                Asian-LatinX
                              </MenuItem>
                              <MenuItem value="ChicanX (Chicano/Chicana)">
                                ChicanX (Chicano/Chicana)
                              </MenuItem>
                              <MenuItem value="FilipinX (Filipino/Filipina)">
                                FilipinX (Filipino/Filipina)
                              </MenuItem>
                              <MenuItem value="Garifuna">Garifuna</MenuItem>
                              <MenuItem value="Hispanic">Hispanic</MenuItem>
                              <MenuItem value="Latin-American">
                                Latin American
                              </MenuItem>
                              <MenuItem value="Martinican">Martinican</MenuItem>
                              <MenuItem value="Mestizo">Mestizo</MenuItem>
                              <MenuItem value="Mulattoe">Mulattoe</MenuItem>
                              <MenuItem value="Pardo / Multi-racial (including LatinX)">
                                Pardo / Multi-racial (including LatinX)
                              </MenuItem>
                              <MenuItem value="Zambos">Zambos</MenuItem>
                              <MenuItem value="Ally (not of any Latin origin)">
                                Ally (not of any Latin origin)
                              </MenuItem>
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
                          <Typography>Upload a profile picture</Typography>
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
                        <Typography>Add a short bio or tagline</Typography>
                        <TextField
                          name="profileDescription"
                          label="Profile Description"
                          variant="outlined"
                          sx={{ width: '100%' }}
                        />
                      </Stack>
                      <Stack spacing={1}>
                        <Typography>
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
                        <Typography>
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
                    <Typography variant="body1" sx={{ textAlign: 'center' }}>
                      This space has been created for latinx identifying
                      students, post-docs, academic researchers, industry
                      researchers, and alies working in Artificial Intelligence
                      and Machine Learning
                    </Typography>
                    <Button
                      onClick={handleNext}
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
                  <DialogActions sx={{ justifyContent: 'space-around', m: 1 }}>
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
                  <DialogActions sx={{ justifyContent: 'space-between', m: 1 }}>
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
            )}
          </Formik>
        </MainCard>
      </Stack>
    </Container>
  )
}

export default GetStarted
