import { Stack } from '@mui/material'
import TextfieldQuestion from './TextfieldQuestion'
import TimezoneQuestion from './TimezoneQuestion'
import CheckboxQuestion from './CheckboxQuestion'

/* Component for the questions that are part of the 3 forms (mentee, mentors and mentee-mentor) */
const CommonQuestions = () => {
  return (
    <>
      <Stack spacing={2}>
        <TextfieldQuestion
          question="Institution, Company or Organization / Institución, Empresa u Organización / Instituição, Empresa ou Organização"
          name={'currentInstitution'}
        />
        <TextfieldQuestion
          question="Google scholar (preferred), website or LinkedIn page."
          name={'linkToResearch'}
        />
        <CheckboxQuestion
          question="What language(s) do you speak? / ¿Qué idioma(s) hablas? / Que idioma(s) você fala?"
          options={['English', 'Spanish', 'Portuguese', 'Other']}
          name={'languages'}
        />
        <TimezoneQuestion
          question="What is your preferred timezone for meetings? / ¿Cuál es tu zona horaria preferida para reuniones? / Qual é o seu fuso horário preferido para reuniões?"
          name={'preferredTimezone'}
        />
        <CheckboxQuestion
          question="How do you prefer to connect with your mentee? / ¿Cómo prefieres conectarte con tu mentee? / Como você prefere se conectar com seu mentee?"
          options={[
            'Video Conference (e.g., Zoom)',
            'Chat (e.g., Slack)',
            'Email',
            'Phone call',
            'Other'
          ]}
          name={'preferredConnections'}
        />
      </Stack>
    </>
  )
}

export default CommonQuestions
