// React and hooks
import { useCallback, useState, useRef } from 'react'

// Material-UI components and icons
import { Typography, Stack, CircularProgress } from '@mui/material'
import { ErrorOutline } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'

// Form validation
import { Form, Formik } from 'formik'
import * as yup from 'yup'
import { useSnackbar } from 'notistack'

// Component imports
import FormCard from '../components/FormCard'
import CommonQuestions from '../components/questions/CommonQuestions'
import TextfieldQuestion from '../components/questions/TextfieldQuestion'
import RadioQuestion from '../components/questions/RadioQuestion'
import FormSubmittedDialog from '../components/dialogs/FormSubmittedDialog'

// Hooks and services
import { setMenteeForm } from '../api/forms'
import { useUser } from '../hooks/useUser'
import useFormData from '../hooks/useFormData'
import MenteeQuestions from '../components/questions/MenteeQuestions'

const defaultInitialValues = {
  academicPapers: '',
  careerGoals: '',
  commitmentStatement: '',
  currentInstitution: '',
  currentPosition: '',
  languages: [],
  linkToResearch: '',
  menteeFields: [],
  menteeProfile: '',
  mentoredSkills: [],
  mentorshipAspirations: '',
  openToDiscussImpacts: '',
  planningToSubmit: '',
  preferredConnections: '',
  preferredTimezone: '',
  researchAreas: [],
  shareExperience: '',
  submittedInAiConferences: '',
  submittedPapers: ''
}

// Form validation schema
const schema = yup.object().shape({
  academicPapers: yup.string().required('Please select an option'),
  careerGoals: yup.string().required('Please enter your career goals'),
  commitmentStatement: yup
    .string()
    .url('Invalid URL')
    .required('Please enter the link to your commitment statement'),
  currentInstitution: yup
    .string()
    .required('Please enter your current institution'),
  currentPosition: yup.string().required('Please select an option'),
  languages: yup.array().min(1, 'Please select at least one language'),
  linkToResearch: yup
    .string()
    .url('Invalid URL')
    .required('Please enter a link'),
  menteeFields: yup.array().min(1, 'Please select at least one field'),
  menteeProfile: yup.string().required('Please define your profile'),
  mentoredSkills: yup
    .array()
    .min(1, 'Please select at least one skill')
    .max(2, 'Please select up to 2 skills'),
  mentorshipAspirations: yup.string().required('Please select an option'),
  preferredConnections: yup.array().min(1, 'Please select at least one option'),
  preferredTimezone: yup
    .string()
    .required('Please enter your preferred timezone'),
  researchAreas: yup
    .array()
    .min(1, 'Please select at least one research area')
    .max(3, 'Please select up to 3 research areas'),
  shareExperience: yup.string().required('Please enter your response'),
  submittedInAiConferences: yup.string().required('Please select an option')
})

const MenteeForm = () => {
  const { initialValues, loading } = useFormData(
    defaultInitialValues,
    (mentorData, menteeData) => menteeData
  )
  const { user, refreshUser } = useUser()
  const { enqueueSnackbar } = useSnackbar()
  const [openDialog, setOpenDialog] = useState(false)
  const topRef = useRef(null)

  const onSubmit = useCallback(
    async (values, { setSubmitting }) => {
      // Submit the form data to the backend
      setSubmitting(true)
      try {
        const res = await setMenteeForm(user, values)
        if (res.ok) {
          console.log('Form submitted successfully')
          refreshUser() // Refresh the user data
          setOpenDialog(true)
        }
      } catch (err) {
        console.error('Error submitting form:', err)
        return enqueueSnackbar(err.message, { variant: 'error' })
      }
      setSubmitting(false)
    },
    [user, enqueueSnackbar, refreshUser]
  )

  return (
    <FormCard
      enableContainer={true}
      props={{ height: '100vh' }}
      title={'Accel AI Mentee Application Form'}
      type={'mentee'}
      topRef={topRef}
    >
      {loading ? (
        <CircularProgress />
      ) : (
        <Formik
          initialValues={initialValues}
          validationSchema={schema}
          onSubmit={onSubmit}
        >
          {({ isSubmitting, isValid }) => (
            <Form>
              <Stack spacing={3}>
                <Typography variant="h6">
                  Basic Information / Información básica / Informações Básicas
                </Typography>
                <RadioQuestion
                  question="Current Position / Posición Actual / Posição Atual"
                  description=""
                  options={[
                    'Senior Ph.D. Student (3rd year or more of Ph.D.)',
                    'Junior Ph.D. Students (1st or 2nd year of Ph.D.)',
                    'Undergraduate Student (or already earned a B.Sc. degree)',
                    'Graduate Student (M.Sc., MBA or equivalent level)',
                    'Early Career Professional (less than 5 years in academy or industry)',
                    'Other'
                  ]}
                  name={'currentPosition'}
                />
                <CommonQuestions />

                <MenteeQuestions />

                <Typography variant="h6">
                  Beyond the Program / Más allá del programa / Além do programa
                </Typography>
                <TextfieldQuestion
                  question="Do you plan to share your experience after the program? If yes, how? / ¿Planeas compartir tu experiencia después del programa? Si es así, ¿cómo? / Você planeja compartilhar sua experiência após o programa? Se sim, como?"
                  name={'shareExperience'}
                />
                <RadioQuestion
                  question={`Are you open to discuss/enumerate the impacts of the program sometime later in the future? / ¿Estás abierto/a a discutir o enumerar los impactos del programa en algún momento en el futuro? / Você está aberto(a) para discutir ou enumerar os impactos do programa em algum momento no futuro?`}
                  name={'openToDiscussImpacts'}
                  options={['Yes', 'No']}
                  required={false}
                />
                <Stack
                  direction={'row'}
                  alignItems={'center'}
                  justifyContent={!isValid ? 'space-between' : 'flex-end'}
                  spacing={3}
                >
                  {!isValid && (
                    <Stack spacing={1} direction={'row'} alignItems={'center'}>
                      <ErrorOutline color="error" />
                      <Typography variant="body2" color="error">
                        Cannot submit the application until all required
                        questions are answered. Please complete the missing
                        required questions and try again.
                      </Typography>
                    </Stack>
                  )}
                  <LoadingButton
                    variant="contained"
                    type="submit"
                    sx={{ width: '130px', alignSelf: 'flex-end' }}
                    loading={isSubmitting}
                  >
                    Submit
                  </LoadingButton>
                </Stack>
              </Stack>
            </Form>
          )}
        </Formik>
      )}
      <FormSubmittedDialog
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
      />
    </FormCard>
  )
}

export default MenteeForm
