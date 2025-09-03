// React and hooks
import { useNavigate } from 'react-router-dom'
import { useCallback } from 'react'

// Material UI components
import { Typography, Stack, CircularProgress } from '@mui/material'
import { ErrorOutline } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'

// Form validation
import { Form, Formik } from 'formik'
import * as yup from 'yup'

// Hooks and services
import { setMentorForm } from '../api/forms'
import { useUser } from '../hooks/useUser'
import useFormData from '../hooks/useFormData'
import { useSnackbar } from 'notistack'

// Components
import FormCard from '../components/FormCard'
import TextfieldQuestion from '../components/questions/TextfieldQuestion'
import RadioQuestion from '../components/questions/RadioQuestion'
import CommonQuestions from '../components/questions/CommonQuestions'
import MentorQuestions from '../components/questions/MentorQuestions'

const defaultInitialValues = {
  academicPapers: '',
  areasConsideringMentoring: [],
  contributeAsMentor: '',
  currentInstitution: '',
  currentPosition: '',
  languages: [],
  linkToResearch: '',
  menteeCharacteristics: '',
  menteePreferences: [],
  mentorFields: [],
  mentorSkills: [],
  mentoringTime: '',
  offeredSupport: [],
  openToDiscussImpacts: '',
  preferredConnections: [],
  //preferredExpectations: [],
  preferredTimezone: '',
  reviewerInAiConferences: '',
  reviewedConferences: '',
  seniority: ''
}

// Form validation schema
const schema = yup.object().shape({
  academicPapers: yup.string().required('Please select an option'),
  areasConsideringMentoring: yup
    .array()
    .min(1, 'Please select at least one area'),
  currentInstitution: yup
    .string()
    .required('Please enter your current institution'),
  currentPosition: yup.string().required('Please enter your current position'),
  languages: yup.array().min(1, 'Please select at least one language'),
  linkToResearch: yup
    .string()
    .url('Invalid URL')
    .required('Please enter a link'),
  menteeCharacteristics: yup
    .string()
    .required('Please describe your ideal mentee profile'),
  menteePreferences: yup
    .array()
    .min(1, 'Please select at least one preference'),
  mentorFields: yup.array().min(1, 'Please select at least one field'),
  mentoringTime: yup.string().required('Please select an option'),
  offeredSupport: yup.array().min(1, 'Please select at least one option'),
  openToDiscussImpacts: yup.string().required('Please select an option'),
  preferredConnections: yup.array().min(1, 'Please select at least one option'),
  /*   preferredExpectations: yup
    .array()
    .min(1, 'Please select at least one option'), */
  preferredTimezone: yup
    .string()
    .required('Please enter your preferred timezone'),
  reviewerInAiConferences: yup.string().required('Please select an option'),
  seniority: yup.string().required('Please select your seniority level')
})

const MentorForm = () => {
  const { user, refreshUser } = useUser()
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()
  const { initialValues, loading } = useFormData(
    defaultInitialValues,
    (mentorData, menteeData) => mentorData
  )

  const onSubmit = useCallback(
    async (values, { setSubmitting }) => {
      // Submit the form data to the backend
      setSubmitting(true)
      try {
        const res = await setMentorForm(user, values)
        if (res.ok) {
          console.log('Form submitted successfully')
          enqueueSnackbar('Form submitted successfully', { variant: 'success' })
          refreshUser() // Refresh the user data
          setTimeout(() => {
            navigate('/dashboard')
          }, 3000)
        }
      } catch (err) {
        console.error('Error submitting form:', err)
        return enqueueSnackbar(err.message, { variant: 'error' })
      }
      setSubmitting(false)
    },
    [enqueueSnackbar, navigate, user, refreshUser]
  )

  return (
    <FormCard
      enableContainer={true}
      props={{ height: '100vh' }}
      title={'Accel AI Mentor Application Form'}
      type={'mentor'}
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
                <TextfieldQuestion
                  question="Current Position / Posición Actual / Posição Atual"
                  name={'currentPosition'}
                />
                <RadioQuestion
                  question="Seniority / Senioridad / Senioridade"
                  name={'seniority'}
                  options={[
                    'Senior PhD Candidate',
                    'Post Doc or Early Career PhD',
                    'Faculty Member',
                    'Senior Industry or Academic Researcher',
                    'Management / Business Profesional',
                    'Other'
                  ]}
                />
                <CommonQuestions />

                <MentorQuestions />

                <Typography variant="h6">
                  Beyond the Program / Más allá del programa / Além do programa
                </Typography>
                <TextfieldQuestion
                  question="What do you hope to contribute as a mentor in this program?/¿Qué esperas aportar como mentor en este programa? / O que você espera contribuir como mentor neste programa?"
                  name={'contributeAsMentor'}
                />
                <RadioQuestion
                  question="Are you open to discuss/enumerate the impacts of the program sometime later in the future? / ¿Estás abierto/a a discutir o enumerar los impactos del programa en algún momento en el futuro? / Você está aberto(a) para discutir ou enumerar os impactos do programa em algum momento no futuro?"
                  name={'openToDiscussImpacts'}
                  options={['Yes', 'No']}
                  required={false}
                />
                {/*<CheckboxQuestion
                  question="What are your preferred expectations and outcomes from this program?"
                  description=""
                  name={'preferredExpectations'}
                  options={[
                    'Improve your experience and career level by mentoring others',
                    'Establish a research collaboration',
                    'Co-author research with a mentee',
                    'Hire entry-level candidates',
                    'Other'
                  ]}
                /> */}

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
    </FormCard>
  )
}

export default MentorForm
