// React and hooks
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

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
import CheckboxQuestion from '../components/questions/CheckboxQuestion'
import ConditionalQuestions from '../components/questions/ConditionalQuestions'
import ConditionalQuestionsMentee from '../components/questions/ConditionalQuestionsMentee'

// Hooks and services
import { setMenteeForm } from '../api/forms'
import { useUser } from '../hooks/useUser'
import useFormData from '../hooks/useFormData'

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
  const navigate = useNavigate()

  const onSubmit = useCallback(
    async (values, { setSubmitting }) => {
      // Submit the form data to the backend
      setSubmitting(true)
      try {
        const res = await setMenteeForm(user, values)
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
    [user, enqueueSnackbar, navigate, refreshUser]
  )

  return (
    <FormCard
      enableContainer={true}
      props={{ height: '100vh' }}
      title={'Accel AI Mentee Application Form'}
      type={'mentee'}
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
                  question="Current Position"
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

                <Typography variant="h6">
                  Mentee Details / Detalles del Mentee / Detalhes do Mentee
                </Typography>
                <RadioQuestion
                  question={`What do you hope to achieve in this area through the mentorship? / ¿Qué esperas lograr en esa área a través de la mentoría? / O que você espera alcançar nessa área por meio da mentoria?`}
                  description="Select your top choice / Selecciona tu opción prioritaria / Selecione sua opção prioritária"
                  options={[
                    'Receive detailed feedback on a research paper or project / Recibir retroalimentación detallada sobre un artículo o proyecto / Receber feedback detalhado sobre um artigo ou projeto',
                    'Prepare a submission for a conference (e.g., CVPR, ICML, NeurIPS) / Preparar una presentación para una conferencia (por ejemplo, NeurIPS) / Preparar uma submissão para uma conferência (por exemplo, NeurIPS)',
                    'Understand career options and receive guidance / Comprender opciones profesionales y recibir orientación / Entender opções de carreira e receber orientação',
                    'Learn best practices and tools in the area / Aprender mejores prácticas y herramientas en el área / Aprender boas práticas e ferramentas na área',
                    'Build a lasting connection with a mentor in the field / Crear una conexión duradera con un mentor en el campo / Construir uma conexão duradoura com um mentor na área'
                  ]}
                  spacing={1.5}
                  name={'mentorshipAspirations'}
                />
                <TextfieldQuestion
                  question="(LINK) Commitment & Motivation statement / Declaración de Compromiso y Motivación / Declaração de Compromisso e Motivação (1-page pdf)"
                  description={`We want to understand your motivation for applying and your awareness of the responsibility and commitment to the program & mentors. The statement can be written in English, Portuguese or Spanish.\n\nQueremos comprender su motivación para postularse y su conciencia de la responsabilidad y el compromiso con el programa y los mentores. La declaración puede estar escrita en inglés, portugués o español. \n\nQueremos entender sua motivação para se inscrever e sua consciência da responsabilidade e compromisso com o programa e mentores. A declaração pode ser redigida em inglês, português ou espanhol.`}
                  name={'commitmentStatement'}
                />
                <TextfieldQuestion
                  question="Briefly define your profile and your best professional/academic characteristics / Define brevemente tu perfil y tus mejores características profesionales/académicas. / Defina brevemente seu perfil e suas melhores características profissionais/acadêmicas"
                  name={'menteeProfile'}
                />
                <RadioQuestion
                  question="How many research papers have you written or contributed to? / ¿Cuántos artículos de investigación has escrito o en cuántos has contribuido? / Quantos artigos de pesquisa você escreveu ou contribuiu?"
                  description={`If you haven’t written or contributed to a paper yet, that’s completely fine! This program is here to support you in developing your first research paper \n\nSi aún no has escrito ni contribuido a un artículo, ¡no hay problema! Este programa está diseñado para apoyarte en el desarrollo de tu primer trabajo de investigación \n\nSe você ainda não escreveu ou contribuiu para um artigo, não tem problema! Este programa foi criado para ajudá-lo a desenvolver seu primeiro trabalho de pesquisa`}
                  options={[
                    '0 – I haven’t written a paper yet, but I’m eager to learn!',
                    '1-3 – I have some experience and want to improve.',
                    '3-5 – I have moderate experience and want to refine my skills.',
                    '5+ – I have extensive experience and want to enhance my writing further'
                  ]}
                  name={'academicPapers'}
                />
                <RadioQuestion
                  question="Have you submitted a paper to a peer-reviewed AI conference or journal before?  / ¿Has enviado un artículo a una conferencia o revista de IA con revisión por pares anteriormente? / Você já enviou um artigo para uma conferência ou revista de IA com revisão por pares antes?"
                  description={`If not, no worries! This program will help you gain the experience needed for future submissions. \n\nSi no, ¡no te preocupes! Este programa te ayudará a adquirir la experiencia necesaria para futuras postulaciones. \n\nSe não, não se preocupe! Este programa vai ajudá-lo a ganhar a experiência necessária para futuras submissões.`}
                  options={['Yes', 'No']}
                  name={'submittedInAiConferences'}
                />
                <TextfieldQuestion
                  question="If Yes, please specify which ones  / Si es así, por favor especifica cuáles. / Se sim, por favor especifique quais"
                  name={'submittedPapers'}
                  required={false}
                />
                <CheckboxQuestion
                  question={`Are you planning to submit your research paper to the LatinX in AI Workshop (or an upcomming workshop at a conference), or to the main track top-tier AI conference in the near future? /
¿Planeas enviar tu artículo de investigación al Taller de LatinX en IA de NeurIPS, o a una conferencia de IA de alto nivel en un futuro cercano? / Você planeja enviar seu artigo de pesquisa para o Workshop de LatinX em IA no NeurIPS ou para uma conferência de IA de alto nível em um futuro próximo?`}
                  options={[
                    'LatinX in AI Workshop @ CVPR, ICML or NeurIPS 2026',
                    'Academic Workshop @ Top-tier AI conference',
                    'Main track - Top-tier AI conference (e.g., NeurIPS, ICML, CVPR, ACL, etc.)',
                    'I am not planning to submit a research paper in the near future',
                    'Other'
                  ]}
                  name={'planningToSubmit'}
                  required={false}
                />
                <TextfieldQuestion
                  question={`What career goals do you want to achieve in the next three years? / ¿Qué objetivos profesionales quieres alcanzar en los próximos tres años? / Quais objetivos de carreira você deseja alcançar nos próximos três anos?"`}
                  name={'careerGoals'}
                />
                <Typography variant="h6">
                  Strengthening skills / Fortalecimiento de habilidades /
                  Fortalecimento de habilidades
                </Typography>
                <CheckboxQuestion
                  question="What are the skills you are interested in being mentored? / ¿En qué habilidades te interesa recibir mentoría? / Em quais habilidades você tem interesse em receber mentoria?"
                  description="Choose up to 2 options / Elige hasta 2 opciones / Escolha até 2 opções"
                  name={'mentoredSkills'}
                  options={[
                    'Writing & Communication (e.g., research papers, technical writing, presentations)',
                    'Coding & Software Engineering (e.g., ML frameworks, best practices, debugging)',
                    'Experimentation & Reproducibility (e.g., designing experiments, hyperparameter tuning)',
                    'AI Ethics & Responsible AI (e.g., bias mitigation, fairness in AI)',
                    'Networking & Personal Branding (e.g., building an AI career, conferences, social media presence)',
                    'Public Speaking & Teaching (e.g., giving talks, mentoring others)',
                    'Project Management & Collaboration (e.g., working in teams, leading AI projects)'
                  ]}
                />
                <Typography variant="h6">
                  Research Guidance (AI Verticals) / Orientación en
                  Investigación (Verticales de IA) / Orientação em Pesquisa
                  (Verticais de IA)
                </Typography>
                <CheckboxQuestion
                  question="What are the research areas you are interested in being mentored? / ¿En qué áreas de investigación te interesa recibir mentoría? / Em quais áreas de pesquisa você tem interesse em receber mentoria?"
                  description="Choose up to 3 options / Elige hasta 3 opciones / Escolha até 3 opções"
                  name={'researchAreas'}
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
                  name={'menteeFields'}
                />
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
    </FormCard>
  )
}

export default MenteeForm
