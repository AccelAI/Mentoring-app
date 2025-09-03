// React and hooks
import { useNavigate } from 'react-router-dom'
import { useCallback, useEffect, useRef, useState } from 'react'

// Material-UI components and icons
import {
  Typography,
  Stack,
  CircularProgress,
  Pagination,
  Button
} from '@mui/material'
import { ErrorOutline } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'

// Component imports
import FormCard from '../components/FormCard'
import CommonQuestions from '../components/questions/CommonQuestions'
import TextfieldQuestion from '../components/questions/TextfieldQuestion'
import RadioQuestion from '../components/questions/RadioQuestion'

// Form validation
import { Form, Formik } from 'formik'
import * as yup from 'yup'
import { useSnackbar } from 'notistack'

// Hooks and services
import { setCombinedForm } from '../api/forms'
import { useUser } from '../hooks/useUser'
import useFormData from '../hooks/useFormData'
import MentorQuestions from '../components/questions/MentorQuestions'
import MenteeQuestions from '../components/questions/MenteeQuestions'

// Updated initial values (union of mentor + mentee; resolved collisions via namespacing)
const defaultInitialValues = {
  // Common
  currentInstitution: '',
  currentPosition: '',
  linkToResearch: '',
  preferredTimezone: '',
  languages: [],
  preferredConnections: [],
  academicPapers: '',

  // Mentor-only
  seniority: '',
  offeredSupport: [],
  mentoringTime: '',
  reviewerInAiConferences: '',
  reviewedConferences: '',
  menteeCharacteristics: '',
  menteePreferences: [],
  mentorSkills: [],
  areasConsideringMentoring: [],
  mentorFields: [],
  contributeAsMentor: '',

  // Mentee-only
  mentorshipAspirations: '',
  commitmentStatement: '',
  menteeProfile: '',
  submittedInAiConferences: '',
  submittedPapers: '',
  planningToSubmit: '', // kept as in MenteeForm
  careerGoals: '',
  mentoredSkills: [],
  researchAreas: [],
  menteeFields: [],
  shareExperience: '',

  // Shared
  openToDiscussImpacts: ''
}

// Combined validation schema based on MentorForm and MenteeForm
const schema = yup.object().shape({
  // Common
  currentInstitution: yup
    .string()
    .required('Please enter your current institution'),
  currentPosition: yup.string().required('Please select an option'),
  linkToResearch: yup
    .string()
    .url('Invalid URL')
    .required('Please enter a link'),
  preferredTimezone: yup
    .string()
    .required('Please enter your preferred timezone'),
  languages: yup.array().min(1, 'Please select at least one language'),
  preferredConnections: yup.array().min(1, 'Please select at least one option'),
  academicPapers: yup.string().required('Please select an option'),

  // Mentor-only
  offeredSupport: yup.array().min(1, 'Please select at least one option'),
  mentoringTime: yup.string().required('Please select an option'),
  reviewerInAiConferences: yup.string().required('Please select an option'),
  menteeCharacteristics: yup
    .string()
    .required('Please describe your ideal mentee profile'),
  menteePreferences: yup
    .array()
    .min(1, 'Please select at least one preference'),
  areasConsideringMentoring: yup
    .array()
    .min(1, 'Please select at least one area'),
  mentorFields: yup.array().min(1, 'Please select at least one field'),

  // Mentee-only
  mentorshipAspirations: yup.string().required('Please select an option'),
  commitmentStatement: yup
    .string()
    .url('Invalid URL')
    .required('Please enter the link to your commitment statement'),
  menteeProfile: yup.string().required('Please define your profile'),
  submittedInAiConferences: yup.string().required('Please select an option'),
  // submittedPapers optional
  // planningToSubmit optional
  careerGoals: yup.string().required('Please enter your career goals'),
  mentoredSkills: yup
    .array()
    .min(1, 'Please select at least one skill')
    .max(2, 'Please select up to 2 skills'),
  researchAreas: yup
    .array()
    .min(1, 'Please select at least one research area')
    .max(3, 'Please select up to 3 research areas'),
  menteeFields: yup.array().min(1, 'Please select at least one field'),
  shareExperience: yup.string().required('Please enter your response')
})

const CombinedForm = () => {
  const { user, refreshUser } = useUser()
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const topRef = useRef(null)

  useEffect(() => {
    // Scroll the scrollable Card to its top
    topRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  const onSubmit = useCallback(
    async (values, { setSubmitting }) => {
      setSubmitting(true)
      try {
        const res = await setCombinedForm(user, values)
        if (res.ok) {
          enqueueSnackbar('Form submitted successfully', { variant: 'success' })
          refreshUser()
          setTimeout(() => navigate('/dashboard'), 3000)
        }
      } catch (err) {
        console.error('Error submitting form:', err)
        enqueueSnackbar(err.message, { variant: 'error' })
      }
      setSubmitting(false)
    },
    [enqueueSnackbar, navigate, user, refreshUser]
  )

  // Merge mentor + mentee saved answers into combined initial values
  const mergeFormAnswers = useCallback(
    (mentorData, menteeData) => ({
      // Common fields
      currentInstitution:
        mentorData.currentInstitution || menteeData.currentInstitution || '',
      currentPosition:
        mentorData.currentPosition || menteeData.currentPosition || '',
      linkToResearch:
        mentorData.linkToResearch || menteeData.linkToResearch || '',
      preferredTimezone:
        mentorData.preferredTimezone || menteeData.preferredTimezone || '',
      languages:
        (mentorData.languages &&
          mentorData.languages.length &&
          mentorData.languages) ||
        menteeData.languages ||
        [],
      preferredConnections:
        (mentorData.preferredConnections &&
          mentorData.preferredConnections.length &&
          mentorData.preferredConnections) ||
        menteeData.preferredConnections ||
        [],
      academicPapers:
        mentorData.academicPapers || menteeData.academicPapers || '',

      // Mentor-only
      seniority: mentorData.currentPosition || menteeData.currentPosition || '',
      offeredSupport: mentorData.offeredSupport || [],
      mentoringTime: mentorData.mentoringTime || '',
      reviewerInAiConferences: mentorData.reviewerInAiConferences || '',
      reviewedConferences: mentorData.reviewedConferences || '',
      menteeCharacteristics: mentorData.menteeCharacteristics || '',
      menteePreferences: mentorData.menteePreferences || [],
      mentorSkills: mentorData.mentorSkills || [],
      areasConsideringMentoring: mentorData.areasConsideringMentoring || [],
      mentorFields: mentorData.mentorFields || [],
      contributeAsMentor: mentorData.contributeAsMentor || '',

      // Mentee-only
      mentorshipAspirations: menteeData.mentorshipAspirations || '',
      commitmentStatement: menteeData.commitmentStatement || '',
      menteeProfile: menteeData.menteeProfile || '',
      submittedInAiConferences: menteeData.submittedInAiConferences || '',
      submittedPapers: menteeData.submittedPapers || '',
      planningToSubmit: menteeData.planningToSubmit || '',
      careerGoals: menteeData.careerGoals || '',
      mentoredSkills: menteeData.mentoredSkills || [],
      researchAreas: menteeData.researchAreas || [],
      menteeFields: menteeData.menteeFields || [],
      shareExperience: menteeData.shareExperience || '',

      // Shared
      openToDiscussImpacts:
        mentorData.openToDiscussImpacts || menteeData.openToDiscussImpacts || ''
    }),
    []
  )

  const { initialValues, loading } = useFormData(
    defaultInitialValues,
    mergeFormAnswers
  )

  return (
    <FormCard
      enableContainer={true}
      props={{ height: '100vh' }}
      title={'Accel AI Mentor and Mentee Application Form'}
      type={'both'}
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
          {({ isSubmitting, isValid, errors }) => (
            <>
              {/* {console.log('Formik validation errors:', errors)} */}
              <Form>
                <Stack spacing={3}>
                  {/* Basic Information */}
                  {page === 1 && (
                    <>
                      <Typography variant="h6">
                        Basic Information / Información básica / Informações
                        Básicas
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
                          'Faculty Member',
                          'Senior Industry or Academic Researcher',
                          'Management / Business Profesional',
                          'Other'
                        ]}
                        name={'currentPosition'}
                      />
                      <CommonQuestions />
                    </>
                  )}

                  {/* Mentee Section */}
                  {page === 2 && <MenteeQuestions isCombinedForm={true} />}

                  {/* Mentor Section */}
                  {page === 3 && <MentorQuestions isCombinedForm={true} />}

                  {page === 4 && (
                    <>
                      <RadioQuestion
                        question="How many academic research papers have you written or contributed to?  / ¿Cuántos artículos de investigación académica has escrito o en cuántos has contribuido? / Quantos artigos de pesquisa acadêmica você escreveu ou contribuiu?"
                        name={'academicPapers'}
                        options={[
                          '0 – I haven’t written a paper yet, but I’m eager to learn!',
                          '1-3 – I have some experience publishing research and want to improve.',
                          '3-5 – I have moderate experience and want to refine my skills.',
                          '4-7 – I have moderate experience publishing in conferences or journals.',
                          '8+ – I have extensive experience publishing research.'
                        ]}
                      />
                      <Typography variant="h6">
                        Beyond the Program / Más allá del programa / Além do
                        programa
                      </Typography>
                      <TextfieldQuestion
                        question="Do you plan to share your experience after the program? If yes, how? / ¿Planeas compartir tu experiencia después del programa? Si es así, ¿cómo? / Você planeja compartilhar sua experiência após o programa? Se sim, como?"
                        name={'shareExperience'}
                      />

                      <TextfieldQuestion
                        question="What do you hope to contribute as a mentor in this program?/¿Qué esperas aportar como mentor en este programa? / O que você espera contribuir como mentor neste programa?"
                        name={'contributeAsMentor'}
                      />

                      {/* Shared closing */}
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
                          <Stack
                            spacing={1}
                            direction={'row'}
                            alignItems={'center'}
                          >
                            <ErrorOutline color="error" />
                            <Typography variant="body2" color="error">
                              Cannot submit the application until all required
                              questions are answered. Please complete the
                              missing required questions and try again.
                            </Typography>
                          </Stack>
                        )}
                      </Stack>
                    </>
                  )}
                  <Stack
                    direction={'row'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                  >
                    {page !== 1 && (
                      <Button
                        onClick={() => setPage((p) => p - 1)}
                        sx={{ height: 'min-content' }}
                        variant="contained"
                      >
                        Back
                      </Button>
                    )}
                    <Pagination
                      count={4}
                      page={page}
                      onChange={(event, value) => setPage(value)}
                      hidePrevButton
                      hideNextButton
                      color="primary"
                    />
                    {page !== 4 ? (
                      <Button
                        onClick={() => setPage((p) => p + 1)}
                        sx={{ height: 'min-content' }}
                        variant="contained"
                      >
                        Next
                      </Button>
                    ) : (
                      <LoadingButton
                        variant="contained"
                        type="submit"
                        sx={{ width: '130px', alignSelf: 'flex-end' }}
                        loading={isSubmitting}
                        color="success"
                      >
                        Submit
                      </LoadingButton>
                    )}
                  </Stack>
                </Stack>
              </Form>
            </>
          )}
        </Formik>
      )}
    </FormCard>
  )
}

export default CombinedForm
