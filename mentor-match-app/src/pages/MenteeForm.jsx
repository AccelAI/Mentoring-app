// React and hooks
import { useCallback, useState } from 'react'
// import { useNavigate } from 'react-router-dom' // removed

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
import TextfieldQuestion from '../components/questions/TextfieldQuestion'
import RadioQuestion from '../components/questions/RadioQuestion'
import CheckboxQuestion from '../components/questions/CheckboxQuestion'
import TimezoneQuestion from '../components/questions/TimezoneQuestion'
import ConditionalQuestions from '../components/questions/ConditionalQuestions'
import ConditionalQuestionsMentee from '../components/questions/ConditionalQuestionsMentee'
import FormSubmittedDialog from '../components/dialogs/FormSubmittedDialog'

// Hooks and services
import { setMenteeForm } from '../api/forms'
import { useUser } from '../hooks/useUser'
import useFormData from '../hooks/useFormData'

const defaultInitialValues = {
  currentInstitution: '',
  currentPosition: '',
  linkToResearch: '',
  preferredTimezone: '',
  languages: [],
  menteeMotivation: [],
  commitmentStatement: '',
  preferredExpectations: [],
  careerGoals: '',
  conferences: [],
  otherConferences: '',
  openToDiscussImpacts: '',
  mentoredSkills: [],
  topResearchAreas: [],
  reviewerInWorkshop: '',
  publicationsInWorkshop: '',
  reviewerInAiConferences: '',
  publicationsInAiConferences: '',
  reviewerInAiJournals: '',
  publicationsInAiJournals: ''
}

const requiredWhenMenteeMotivationIncludes = (area) => {
  // Return a yup schema that requires a field when menteeMotivation includes the given area
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
  preferredExpectations: yup
    .array()
    .min(1, 'Please select at least one option'),
  conferences: yup.array().min(1, 'Please select at least one conference'),
  // REQUIRED CONDITIONAL QUESTIONS
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
  reviewerInWorkshop: requiredWhenMenteeMotivationIncludes(
    'Improve as a Reviewer of Research Papers'
  ),
  publicationsInWorkshop: requiredWhenMenteeMotivationIncludes(
    'Improve as a Reviewer of Research Papers'
  ),
  reviewerInAiConferences: requiredWhenMenteeMotivationIncludes(
    'Improve as a Reviewer of Research Papers'
  ),
  publicationsInAiConferences: requiredWhenMenteeMotivationIncludes(
    'Improve as a Reviewer of Research Papers'
  ),
  reviewerInAiJournals: requiredWhenMenteeMotivationIncludes(
    'Improve as a Reviewer of Research Papers'
  ),
  publicationsInAiJournals: requiredWhenMenteeMotivationIncludes(
    'Improve as a Reviewer of Research Papers'
  )
})

const MenteeForm = () => {
  const { initialValues, loading } = useFormData(
    defaultInitialValues,
    (mentorData, menteeData) => menteeData
  )
  const { user, refreshUser } = useUser()
  const { enqueueSnackbar } = useSnackbar()
  const [openDialog, setOpenDialog] = useState(false)

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
                <TextfieldQuestion
                  question="Current Institution, Company or Organization Affiliation"
                  description="Where do you study or work? | ¿Dónde estudias o trabajas? | Onde você estuda ou trabalha?"
                  name={'currentInstitution'}
                />
                <RadioQuestion
                  question="Current Position"
                  description=""
                  options={[
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
                  description="Only select your preferred language(s) for receiving mentoring. | Seleccione únicamente su (s) idioma (s) preferido (s) para recibir tutoría. | Selecione apenas seu (s) idioma (s) preferido (s) para receber orientação."
                  options={['English', 'Spanish', 'Portuguese', 'French']}
                  name={'languages'}
                />
                <TimezoneQuestion
                  question="What is your preferred timezone for meetings?"
                  description="We'll do our best to match you with a mentor available in a similar timezone. | Haremos todo lo posible para emparejarlo con un mentor disponible en una zona horaria similar. | Faremos o nosso melhor para encontrar um mentor disponível em um fuso horário semelhante."
                  name={'preferredTimezone'}
                />
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
                  name={'preferredExpectations'}
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
                <RadioQuestion
                  question="Are you open to discuss/enumerate the impacts of the program with organizers in the future?"
                  description="We may ask you to provide a public testimonial if this program has helped you in achieving your goals. | Es posible que le pidamos que brinde un testimonio público si este programa lo ha ayudado a lograr sus objetivos. | Podemos pedir que você forneça um testemunho público se este programa o ajudou a alcançar seus objetivos."
                  name={'openToDiscussImpacts'}
                  options={['Yes', 'No']}
                  required={false}
                />

                <ConditionalQuestionsMentee />
                <ConditionalQuestions />

                <Stack spacing={2}>
                  <Typography variant="h6">Conference Preferences</Typography>
                  <Typography>
                    Choose the best time to start! Since we have year round
                    applications open, choose up to three conferences you would
                    like to use as a reference for the dates of the program.
                    Please consider that the programs will start about 3 months
                    prior to the date of chosen conferences.
                  </Typography>
                  <Typography>
                    ¡Elige el mejor momento para empezar! Dado que tenemos
                    solicitudes abiertas durante todo el año, elija hasta tres
                    conferencias que le gustaría utilizar como referencia para
                    las fechas del programa. Tenga en cuenta que los programas
                    comenzarán aproximadamente 3 meses antes de la fecha de las
                    conferencias elegidas.
                  </Typography>
                  <Typography>
                    Escolha a melhor hora para começar! Como temos inscrições
                    abertas para o ano todo, escolha até três conferências que
                    gostaria de usar como referência para as datas do programa.
                    Por favor, considere que os programas começarão cerca de 3
                    meses antes da data das conferências escolhidas.
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
