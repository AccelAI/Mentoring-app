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
import CheckboxQuestion from '../components/questions/CheckboxQuestion'
import CommonQuestions from '../components/questions/CommonQuestions'

const defaultInitialValues = {
  academicPapers: '',
  areasConsideringMentoring: [],
  contributeAsMentor: '',
  currentInstitution: '',
  currentPosition: '',
  languages: [],
  linkToResearch: '',
  menteeProfile: '',
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
  menteeProfile: yup
    .string()
    .required('Please describe your ideal mentee profile'),
  menteePreferences: yup
    .array()
    .min(1, 'Please select at least one preference'),
  mentorFields: yup.array().min(1, 'Please select at least one field'),
  mentoringTime: yup.string().required('Please select an option'),
  offeredSupport: yup.string().required('Please select an option'),
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
                <Typography variant="h6">
                  Mentoring Details / Detalles del Mentoria / Detalhes da
                  Mentoria
                </Typography>
                <CheckboxQuestion
                  question="What kinds of support are you able to offer? / ¿Qué tipo de apoyo estás en condiciones de ofrecer? /  Que tipo de apoio está disposto(a) a oferecer?"
                  name={'offeredSupport'}
                  options={[
                    'Provide detailed feedback on a research paper or project / Brindar retroalimentación detallada sobre un artículo o proyecto / Oferecer feedback detalhado sobre um artigo ou projeto',
                    'Support the preparation of a conference submission (e.g., NeurIPS) / Apoyar la preparación de una presentación para una conferencia (por ejemplo, NeurIPS) / Apoiar a preparação de uma submissão para uma conferência (por exemplo, NeurIPS)',
                    'Offer career advice and share experiences in the field / Ofrecer consejos de carrera y compartir experiencias en el campo / Oferecer conselhos de carreira e compartilhar experiências na área',
                    'Teach tools or best practices related to your area / Enseñar herramientas o buenas prácticas relacionadas con tu área / Ensinar ferramentas ou boas práticas relacionadas à sua área',
                    'Build a lasting connection with a mentee in the field / Crear una conexión duradera con un mentee en el campo / Construir uma conexão duradoura com um mentee na área'
                  ]}
                  spacing={1.5}
                />
                <RadioQuestion
                  question="How much time do you have available for mentoring? / ¿Cuánto tiempo tienes disponible para la mentoría? / Quanto tempo você tem disponível para a mentoria?"
                  description="The mentoring program suggests at least 1 hour per week for each mentee until the submission deadline. Some work, such as providing feedback on drafts and refining research ideas, may require additional mentoring hours depending on the mentee's needs."
                  name={'mentoringTime'}
                  options={[
                    '1 hour per week',
                    '2-3 hours per week',
                    '4-5 hours per week',
                    '5+ hours per week',
                    'Other'
                  ]}
                />
                <RadioQuestion
                  question="How many academic research papers have you written or contributed to?  / ¿Cuántos artículos de investigación académica has escrito o en cuántos has contribuido? / Quantos artigos de pesquisa acadêmica você escreveu ou contribuiu?"
                  name={'academicPapers'}
                  options={[
                    '1-3 – I have some experience publishing research.',
                    '4-7 – I have moderate experience publishing in conferences or journals.',
                    '8+ – I have extensive experience publishing research.'
                  ]}
                />
                <RadioQuestion
                  question="Have you served as a reviewer for AI conferences or workshops?  / ¿Has sido revisor/a en conferencias o talleres de IA? / Você já atuou como revisor(a) em conferências ou workshops de IA?"
                  name={'reviewerInAiConferences'}
                  options={['Yes', 'No']}
                />
                <TextfieldQuestion
                  question="If Yes, please specify which ones / Si es así, por favor especifica cuáles. / Se sim, por favor especifique quais."
                  name={'reviewedConferences'}
                  required={false}
                />
                <TextfieldQuestion
                  question="What are the characteristics/profile of a mentee that may interest you? / ¿Cuáles son las características o el perfil de un mentee que te pueden interesar? / Quais são as características ou o perfil de um mentee que podem te interessar?"
                  name={'menteeProfile'}
                />
                <CheckboxQuestion
                  question="Do have any specific preferences for accepting a mentee? / ¿Tienes alguna preferencia específica para aceptar a un mentee? / Você tem alguma preferência específica para aceitar um mentee?"
                  description="While we encourage flexibility in mentoring, we understand that some mentors may have preferences to ensure the best match with a mentee."
                  name={'menteePreferences'}
                  options={[
                    'Similar research area (e.g., NLP, CV, RL, etc.)',
                    'Similar demographic background (e.g., LatinX, first-generation academic, underrepresented group)',
                    'At least 1 published paper',
                    'Minimum academic level (e.g., master’s, PhD)',
                    'Minimum industry experience (e.g., X years in AI-related roles)',
                    'Prefers mentees from academia',
                    'Prefers mentees from industry',
                    'Specific company affiliation (e.g., startups, big tech, research labs)',
                    'No specific preference—open to all mentees',
                    'Other'
                  ]}
                />
                <Typography variant="h6">
                  Strengthening skills / Fortalecimiento de habilidades /
                  Fortalecimento de habilidades
                </Typography>
                <CheckboxQuestion
                  question="What skills do you want to help mentees to improve? / ¿Qué habilidades te gustaría ayudar a los mentees a mejorar? / Quais habilidades você gostaria de ajudar os mentees a melhorar?"
                  name={'mentorSkills'}
                  options={[
                    'Writing & Communication (e.g., research papers, technical writing, presentations)',
                    'Coding & Software Engineering (e.g., ML frameworks, best practices, debugging)',
                    'Experimentation & Reproducibility (e.g., designing experiments, hyperparameter tuning)',
                    'AI Ethics & Responsible AI (e.g., bias mitigation, fairness in AI)',
                    'Networking & Personal Branding (e.g., building an AI career, conferences, social media presence)',
                    'Public Speaking & Teaching (e.g., giving talks, mentoring others)',
                    'Project Management & Collaboration (e.g., working in teams, leading AI projects)',
                    'Other'
                  ]}
                  required={false}
                />
                <Typography variant="h6">
                  Research Guidance (AI Verticals) / Orientación en
                  Investigación (Verticales de IA) / Orientação em Pesquisa
                  (Verticais de IA)
                </Typography>

                <CheckboxQuestion
                  question="What are the research areas you are interested in mentoring? / ¿En qué áreas de investigación te interesa dar mentoría? / Em quais áreas de pesquisa você tem interesse em dar mentoria?"
                  name="areasConsideringMentoring"
                  options={[
                    'General Machine Learning/Artificial Intelligence',
                    'Computer Vision',
                    'Natural Language Processing',
                    'Graph ML',
                    'Generative Models',
                    'Multimodal AI',
                    'Representation Learning',
                    'Reinforcement Learning',
                    'Large Language Models',
                    'AI Agents',
                    'Fairness / Explainability'
                  ]}
                />
                <CheckboxQuestion
                  question="Do you work in a specific research field or application domain? / ¿Trabajas en un campo de investigación o dominio de aplicación específico? / Você trabalha em uma área de pesquisa ou domínio de aplicação específico?"
                  name={'mentorFields'}
                  options={[
                    'General ML Theory and Research',
                    'Finance and Investing',
                    'Technology and Services',
                    'Medicine and Biology',
                    'Robotics and Automation',
                    'Science (Physics, Chemistry, Materials Science)',
                    'Art and Creativity',
                    'Environmental Science'
                  ]}
                />
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
