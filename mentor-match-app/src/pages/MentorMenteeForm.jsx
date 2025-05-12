// React and hooks
import { useNavigate } from 'react-router-dom'
import { useCallback } from 'react'

// Material-UI components and icons
import {
  Typography,
  Stack,
  Divider,
  Box,
  CircularProgress
} from '@mui/material'
import { ErrorOutline } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'

// Component imports
import FormCard from '../components/FormCard'
import TextfieldQuestion from '../components/questions/text/TextfieldQuestion'
import RadioQuestion from '../components/questions/RadioQuestion'
import CheckboxQuestion from '../components/questions/checkbox/CheckboxQuestion'
import ConditionalQuestions from '../components/questions/ConditionalQuestions'
import ConditionalQuestionsMentor from '../components/questions/ConditionalQuestionsMentor'
import ConditionalQuestionsMentee from '../components/questions/ConditionalQuestionsMentee'

// Form validation
import { Form, Formik } from 'formik'
import * as yup from 'yup'
import { useSnackbar } from 'notistack'

// Hooks and services
import { setMentorMenteeForm } from '../api/forms'
import { useUser } from '../hooks/useUser'
import useFormData from '../hooks/useFormData'

const defaultInitialValues = {
  currentInstitution: '',
  currentPosition: '',
  linkToResearch: '',
  preferredTimezone: '',
  languages: [],
  conferences: [],
  otherConferences: '',
  openToDiscussImpacts: '',
  reviewerInWorkshop: '',
  publicationsInWorkshop: '',
  reviewerInAiConferences: '',
  publicationsInAiConferences: '',
  reviewerInAiJournals: '',
  publicationsInAiJournals: '',

  // Mentor-specific fields
  preferredExpectationsMentor: [],
  otherMenteePref: '',
  otherExpectations: '',
  mentorMotivation: '',
  mentorArea: [],
  mentoringTime: '',
  menteePreferences: [],
  mentorSkills: [],
  areasConsideringMentoring: [],

  // Mentee-specific fields
  preferredExpectationsMentee: [],
  careerGoals: '',
  menteeMotivation: [],
  commitmentStatement: '',
  topResearchAreas: [],
  mentoredSkills: []
}

const requiredWhenMentorAreaIncludes = (area) => {
  // Return a yup schema that requires a field when mentorArea includes the given area
  return yup.string().when('mentorArea', {
    is: (mentorArea) => mentorArea && mentorArea.includes(area),
    then: (schema) => schema.required('Please select an option'),
    otherwise: (schema) => schema
  })
}

const requiredWhenMenteeMotivationIncludes = (area) => {
  //  Return a yup schema that requires a field when menteeMotivation includes the given area
  return yup.string().when('menteeMotivation', {
    is: (menteeMotivation) =>
      menteeMotivation && menteeMotivation.includes(area),
    then: (schema) => schema.required('Please select an option'),
    otherwise: (schema) => schema
  })
}

// Form validation schema
const schema = yup.object().shape({
  currentInstitution: yup
    .string()
    .required('Please enter your current institution'),
  currentPosition: yup.string().required('Please enter your current position'),
  linkToResearch: yup
    .string()
    .url('Invalid URL')
    .required('Please enter a link'),
  preferredTimezone: yup
    .string()
    .required('Please enter your preferred timezone'),
  languages: yup.array().min(1, 'Please select at least one language'),
  menteeMotivation: yup.array().min(1, 'Please select at least one area'),
  preferredExpectationsMentee: yup
    .array()
    .min(1, 'Please select at least one option'),
  preferredExpectationsMentor: yup
    .array()
    .min(1, 'Please select at least one option'),
  conferences: yup.array().min(1, 'Please select at least one conference'),
  // REQUIRED CONDITIONAL QUESTIONS
  mentorSkills: yup.array().when('mentorArea', {
    is: (mentorArea) =>
      mentorArea &&
      mentorArea.includes(
        'Strengthening skills (Writing or Communication or Engineering)'
      ),
    then: (schema) => schema.min(1, 'Please select at least one skill'),
    otherwise: (schema) => schema
  }),
  areasConsideringMentoring: yup.array().when('mentorArea', {
    is: (mentorArea) =>
      mentorArea && mentorArea.includes('Research Guidance (AI Verticals)'),
    then: (schema) => schema.min(1, 'Please select at least one research area'),
    otherwise: (schema) => schema
  }),
  mentoredSkills: yup.array().when('menteeMotivation', {
    is: (menteeMotivation) =>
      menteeMotivation &&
      menteeMotivation.includes(
        'Strengthening skills (Writing or Communication or Engineering)'
      ),
    then: (schema) => schema.min(1, 'Please select at least one skill'),
    otherwise: (schema) => schema
  }),
  topResearchAreas: yup.array().when('menteeMotivation', {
    is: (menteeMotivation) =>
      menteeMotivation &&
      menteeMotivation.includes('Research Guidance (AI Verticals)'),
    then: (schema) => schema.min(1, 'Please select at least one research area'),
    otherwise: (schema) => schema
  }),
  reviewerInWorkshop: requiredWhenMentorAreaIncludes(
    'Improve as a Reviewer of Research Papers'
  ),
  publicationsInWorkshop: requiredWhenMentorAreaIncludes(
    'Improve as a Reviewer of Research Papers'
  ),
  reviewerInAiConferences: requiredWhenMentorAreaIncludes(
    'Improve as a Reviewer of Research Papers'
  ),
  publicationsInAiConferences: requiredWhenMentorAreaIncludes(
    'Improve as a Reviewer of Research Papers'
  ),
  reviewerInAiJournals: requiredWhenMentorAreaIncludes(
    'Improve as a Reviewer of Research Papers'
  ),
  publicationsInAiJournals: requiredWhenMentorAreaIncludes(
    'Improve as a Reviewer of Research Papers'
  )
})

const MentorMenteeForm = () => {
  const { user } = useUser()
  const { enqueueSnackbar } = useSnackbar()

  const navigate = useNavigate()

  const onSubmit = useCallback(
    async (values, { setSubmitting }) => {
      // Submit the form data to the backend
      setSubmitting(true)
      try {
        const res = await setMentorMenteeForm(user, values) //TODO: Implement setMentorMenteeForm
        if (res.ok) {
          console.log('Form submitted successfully')
          enqueueSnackbar('Form submitted successfully', { variant: 'success' })
          setTimeout(() => {
            navigate('/dashboard')
          }, 4000)
        }
      } catch (err) {
        console.error('Error submitting form:', err)
        return enqueueSnackbar(err.message, { variant: 'error' })
      }
      setSubmitting(false)
    },
    [enqueueSnackbar, navigate, user]
  )

  const mergeFormAnswers = useCallback(
    (mentorData, menteeData) => ({
      // Common fields
      currentInstitution:
        mentorData.currentInstitution || menteeData.currentInstitution,
      currentPosition: mentorData.currentPosition || menteeData.currentPosition,
      linkToResearch: mentorData.linkToResearch || menteeData.linkToResearch,
      preferredTimezone:
        mentorData.preferredTimezone || menteeData.preferredTimezone,
      languages: mentorData.languages || menteeData.languages,
      conferences: mentorData.conferences || menteeData.conferences,
      otherConferences:
        mentorData.otherConferences || menteeData.otherConferences,
      openToDiscussImpacts:
        mentorData.openToDiscussImpacts || menteeData.openToDiscussImpacts,
      reviewerInWorkshop:
        mentorData.reviewerInWorkshop || menteeData.reviewerInWorkshop,
      publicationsInWorkshop:
        mentorData.publicationsInWorkshop || menteeData.publicationsInWorkshop,
      reviewerInAiConferences:
        mentorData.reviewerInAiConferences ||
        menteeData.reviewerInAiConferences,
      publicationsInAiConferences:
        mentorData.publicationsInAiConferences ||
        menteeData.publicationsInAiConferences,
      reviewerInAiJournals:
        mentorData.reviewerInAiJournals || menteeData.reviewerInAiJournals,
      publicationsInAiJournals:
        mentorData.publicationsInAiJournals ||
        menteeData.publicationsInAiJournals,

      // Mentor-specific fields
      preferredExpectationsMentor: mentorData.preferredExpectations,
      otherMenteePref: mentorData.otherMenteePref,
      otherExpectations: mentorData.otherExpectations,
      mentorMotivation: mentorData.mentorMotivation,
      mentorArea: mentorData.mentorArea,
      mentoringTime: mentorData.mentoringTime,
      menteePreferences: mentorData.menteePreferences,
      mentorSkills: mentorData.mentorSkills,
      areasConsideringMentoring: mentorData.areasConsideringMentoring,

      // Mentee-specific fields
      preferredExpectationsMentee: menteeData.preferredExpectations,
      careerGoals: menteeData.careerGoals,
      menteeMotivation: menteeData.menteeMotivation,
      commitmentStatement: menteeData.commitmentStatement,
      topResearchAreas: menteeData.topResearchAreas,
      mentoredSkills: menteeData.mentoredSkills
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
    >
      {loading ? (
        <CircularProgress />
      ) : (
        <Formik
          initialValues={initialValues}
          validationSchema={schema}
          onSubmit={onSubmit}
        >
          {({ isSubmitting, isValid }) => {
            return (
              <Form>
                <Stack spacing={3}>
                  <TextfieldQuestion
                    question="Current Institution, Company or Organization Affiliation"
                    description="Where do you study or work? | ¿Dónde estudias o trabajas? | Onde você estuda ou trabalha?"
                    name={'currentInstitution'}
                  />
                  <RadioQuestion
                    question="Current Seniority Level"
                    description="What is your highest level of education or working experience? | ¿Cuál es su nivel más alto de educación o experiencia laboral? | Qual é o seu nível mais alto de educação ou experiência de trabalho?"
                    options={[
                      'Post Doc or Early Career PhD',
                      'Faculty Member',
                      'Senior Industry or Academic Researcher',
                      'Management / Business Professional',
                      'Early Career Professional (less than 5 years in academy or industry)',
                      'Senior Ph.D. Student (3rd year or more of Ph.D.)',
                      'Junior Ph.D. Students (1st or 2nd year of Ph.D.)',
                      'Graduate Student (M.Sc., MBA or equivalent level)',
                      'Undergraduate Student (or already earned a B.Sc. degree)',
                      'High School Graduate (minimum requirement to participate in LXAI mentoring program)'
                    ]}
                    name={'currentPosition'}
                  />
                  <TextfieldQuestion
                    question="Link to Google scholar (preferred), website or LinkedIn page."
                    description="Share a link to your current research publications or industry achievements. | Comparta un enlace a sus publicaciones de investigación actuales o logros académicos / industriales. | Compartilhe um link para suas publicações de pesquisa atuais ou realizações acadêmicas / industriais."
                    name={'linkToResearch'}
                  />
                  <CheckboxQuestion
                    question="What language(s) do you speak?"
                    description=""
                    options={['English', 'Spanish', 'Portuguese', 'French']}
                    name={'languages'}
                  />
                  <TextfieldQuestion
                    question="What is your preferred timezone for meetings?"
                    description="We'll do our best to match you with a mentee available in a similar timezone."
                    name={'preferredTimezone'}
                  />

                  <Box sx={{ width: '20%', alignSelf: 'center' }}>
                    <Divider variant="middle" sx={{ pt: 2 }} />
                  </Box>
                  <Typography variant="h6">Mentor Questions</Typography>

                  {/*MENTOR QUESTIONS START*/}
                  <RadioQuestion
                    question="Mentor Motivation. Have you served as a Mentor previously?"
                    description=""
                    name={'mentorMotivation'}
                    options={[
                      'Yes, with LatinX in AI',
                      'Yes, with another organization',
                      'No'
                    ]}
                  />
                  <CheckboxQuestion
                    question="Which area do you prefer to mentor?"
                    description="Where can you provide the most guidance in order for mentees to reach their short term goals?"
                    name={'mentorArea'}
                    options={[
                      'Strengthening skills (Writing or Communication or Engineering)',
                      'Research Guidance (AI Verticals)',
                      'Improve as a Reviewer of Research Papers'
                    ]}
                  />
                  <RadioQuestion
                    question="How much time do you have available for mentoring?"
                    description=""
                    name={'mentoringTime'}
                    options={[
                      '1 hour per month',
                      '2 hours per month',
                      '3 hours per month',
                      '4 hours per month'
                    ]}
                  />
                  <CheckboxQuestion
                    question="Do have any specific preferences for a mentee?"
                    description="We will do our best to match you with mentees who meet your preferences. This is not guaranteed as we weigh the mentee's preferences over the mentor's preferences when matching candidates."
                    name={'menteePreferences'}
                    options={[
                      'Similar Demographic Area (Country or Region of the World)',
                      'At least 1 Peer-Reviewed Publication in a Journal, Conference, or Workshop',
                      'Early Career Academic Professional',
                      'Early Career Industry Professional',
                      'Ph.D. or Post-Doc',
                      'Graduate School',
                      'Undergrad',
                      'Other'
                    ]}
                  />
                  <TextfieldQuestion
                    question="If you answered other to the question above, please elaborate."
                    description=""
                    name={'otherMenteePref'}
                    required={false}
                  />
                  <CheckboxQuestion
                    question="What are your preferred expectations and outcomes from this program?"
                    description=""
                    name={'preferredExpectationsMentor'}
                    options={[
                      'Improve your experience and career level by mentoring others',
                      'Establish a research collaboration',
                      'Co-author research with a mentee',
                      'Hire entry-level candidates',
                      'Other'
                    ]}
                  />
                  <TextfieldQuestion
                    question="If you answered other to the question above, please elaborate."
                    description=""
                    name={'otherExpectations'}
                    required={false}
                  />
                  <ConditionalQuestionsMentor />

                  <Box sx={{ width: '20%', alignSelf: 'center' }}>
                    <Divider variant="middle" sx={{ pt: 2 }} />
                  </Box>
                  <Typography variant="h6">Mentee Questions</Typography>

                  {/*MENTEE QUESTIONS START*/}
                  <CheckboxQuestion
                    question="Mentee Motivation. Which area do you prefer to be mentored in?"
                    description="Where do you need the most guidance in order to reach your short term goals? | ¿Dónde necesita más orientación para alcanzar sus objetivos a corto plazo? | Onde você precisa de mais orientação para alcançar seus objetivos de curto prazo?"
                    name={'menteeMotivation'}
                    options={[
                      'Strengthening skills (Writing or Communication or Engineering)',
                      'Research Guidance (AI Verticals)',
                      'Improve as a Reviewer of Research Papers'
                    ]}
                  />
                  <TextfieldQuestion
                    question="Commitment & Motivation statement (1-page pdf)"
                    description={`We want to understand your motivation for applying and your awareness of the responsibility and commitment to the program & mentors. The statement can be written in English, Portuguese or Spanish. Submit a link to PDF in Google Drive or Dropbox.\n
Motivation Letter Writing Resources:
- https://www.mastersportal.com/articles/406/write-a-successful-motivation-letter-for-your-masters.html
- https://www.indeed.com/career-advice/resumes-cover-letters/motivation-letter\n
⎯⎯⎯⎯\n
Queremos comprender su motivación para postularse y su conciencia de la responsabilidad y el compromiso con el programa y los mentores. La declaración puede estar escrita en inglés, portugués o español. Envíe un enlace al PDF almacenado en Google Drive o Dropbox.\n
Queremos entender sua motivação para se inscrever e sua consciência da responsabilidade e compromisso com o programa e mentores. A declaração pode ser redigida em inglês, português ou espanhol. Envie um link para PDF armazenado no Google Drive ou Dropbox.`}
                    name={'commitmentStatement'}
                  />
                  <CheckboxQuestion
                    question="What are your preferred expectations and outcomes from this program?"
                    description="Select all that apply. We will follow-up with you upon completion of the program to learn if you've achieved your goals.  | Seleccione todas las que correspondan. Haremos un seguimiento con usted al finalizar el programa para saber si ha logrado sus objetivos. | Selecione tudo que se aplica. Entraremos em contato com você após a conclusão do programa para saber se você atingiu seus objetivos."
                    name={'preferredExpectationsMentee'}
                    options={[
                      'Connect to job/research opportunities',
                      'Establish a research partnership',
                      'Connect to scholarships/graduate opportunities',
                      'Improve technical and soft skills in general'
                    ]}
                  />
                  <TextfieldQuestion
                    question="What career goals do you want to achieve in the next three years?"
                    description="Briefly describe your ideal position, company, or research publication goal. | Describe brevemente tu puesto ideal, empresa o objetivo de publicación de investigación. | Descreva resumidamente sua posição ideal, empresa ou objetivo de publicação de pesquisa."
                    name={'careerGoals'}
                  />
                  <ConditionalQuestionsMentee />

                  <Box sx={{ width: '20%', alignSelf: 'center' }}>
                    <Divider variant="middle" sx={{ pt: 2 }} />
                  </Box>

                  <ConditionalQuestions />
                  <Stack spacing={2}>
                    <Typography variant="h6">Conference Preferences</Typography>
                    <Typography>
                      Choose the best time to start! Since we have year round
                      applications open, choose up to three conferences you
                      would like to use as a reference for the dates of the
                      program. Please consider that the programs will start
                      about 3 months prior to the date of chosen conferences.
                    </Typography>
                    <Typography>
                      ¡Elige el mejor momento para empezar! Dado que tenemos
                      solicitudes abiertas durante todo el año, elija hasta tres
                      conferencias que le gustaría utilizar como referencia para
                      las fechas del programa. Tenga en cuenta que los programas
                      comenzarán aproximadamente 3 meses antes de la fecha de
                      las conferencias elegidas.
                    </Typography>
                    <Typography>
                      Escolha a melhor hora para começar! Como temos inscrições
                      abertas para o ano todo, escolha até três conferências que
                      gostaria de usar como referência para as datas do
                      programa. Por favor, considere que os programas começarão
                      cerca de 3 meses antes da data das conferências
                      escolhidas.
                    </Typography>

                    <CheckboxQuestion
                      question="Which conferences would you like to align your mentorship with?"
                      description="Choose up to 3 options | Elija hasta 3 opciones | Escolha até 3 opções"
                      name={'conferences'}
                      options={[
                        'CVPR (IEEE Conference on Computer Vision)',
                        'NAACL (The North American Chapter of the Association for Computational Linguistics)',
                        'ICML (International Conference on Machine Learning)',
                        'NeurIPS (Neural Information Processing Systems)',
                        'Other'
                      ]}
                    />
                    <TextfieldQuestion
                      question="If you answered other to the question above, please elaborate."
                      description=""
                      name={'otherConferences'}
                      required={false}
                    />

                    <RadioQuestion
                      question="Are you open to discuss/enumerate the impacts of the program with organizers in the future?"
                      description="We may ask you to provide a public testimonial if this program has helped you in achieving your goals. | Es posible que le pidamos que brinde un testimonio público si este programa lo ha ayudado a lograr sus objetivos. | Podemos pedir que você forneça um testemunho público se este programa o ajudou a alcançar seus objetivos."
                      name={'openToDiscussImpacts'}
                      options={['Yes', 'No']}
                      required={false}
                    />
                  </Stack>
                  <Typography variant="body2">
                    * Notification of Acceptance: Applications are accepted on a
                    rolling basis for our quarterly 3-month cohorts. Your
                    application will be considered in alignment with the
                    conferences which you selected for your preference.
                  </Typography>
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
            )
          }}
        </Formik>
      )}
    </FormCard>
  )
}

export default MentorMenteeForm
