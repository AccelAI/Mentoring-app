// React and hooks
import React from 'react'

// Material-UI components and icons
import {
  Typography,
  Stack,
  Container,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Box
} from '@mui/material'

// Form validation
import { Form, Formik } from 'formik'

// Component imports
import TextfieldQuestion from '../../questions/TextfieldQuestion'
import RadioQuestion from '../../questions/RadioQuestion'
import CheckboxQuestion from '../../questions/CheckboxQuestion'
import TimezoneQuestion from '../../questions/TimezoneQuestion'

const CombinedApplicationDialog = ({ application, open, onClose }) => {
  const { user, formData } = application || {}
  const [activeTab, setActiveTab] = React.useState(0)

  if (!application) return null

  // For combined applications, we need to get both mentor and mentee data
  // The formData should contain both sets of data
  const initialValues = formData || {}

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={'lg'}
      fullWidth
      maxHeight={'90vh'}
    >
      <DialogTitle color="primary">
        {user?.displayName || user?.email || 'Unknown User'} - Combined
        Application Form
      </DialogTitle>
      <DialogContent dividers>
        <Container>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Common Questions" />
              <Tab label="Mentee Application" />
              <Tab label="Mentor Application" />
            </Tabs>
          </Box>

          <Formik initialValues={initialValues}>
            {() => (
              <Form>
                {activeTab === 0 && (
                  <Stack spacing={3}>
                    <TextfieldQuestion
                      question="Current Institution, Company or Organization Affiliation"
                      description="Where do you study or work? | ¿Dónde estudias o trabajas? | Onde você estuda ou trabalha?"
                      name={'currentInstitution'}
                      disabled={true}
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
                      disabled={true}
                    />
                    <TextfieldQuestion
                      question="Link to Google scholar (preferred), website or LinkedIn page."
                      description="Share a link to your current research publications or industry achievements. | Comparta un enlace a sus publicaciones de investigación actuales o logros académicos / industriales. | Compartilhe um link para suas publicações de pesquisa atuais ou realizações acadêmicas / industriais."
                      name={'linkToResearch'}
                      disabled={true}
                    />
                    <CheckboxQuestion
                      question="What language(s) do you speak?"
                      description="Only select your preferred language(s) for receiving mentoring. | Seleccione únicamente su (s) idioma (s) preferido (s) para recibir tutoría. | Selecione apenas seu (s) idioma (s) preferido (s) para receber orientação."
                      options={['English', 'Spanish', 'Portuguese', 'French']}
                      name={'languages'}
                      disabled={true}
                    />
                    <TimezoneQuestion
                      question="What is your preferred timezone for meetings?"
                      description="We'll do our best to match you with a mentor/mentee available in a similar timezone. | Haremos todo lo posible para emparejarlo con un mentor/mentee disponible en una zona horaria similar. | Faremos o nosso melhor para encontrar um mentor/mentee disponível em um fuso horário semelhante."
                      name={'preferredTimezone'}
                      disabled={true}
                    />
                    <RadioQuestion
                      question="Are you open to discuss/enumerate the impacts of the program with organizers in the future?"
                      description="We may ask you to provide a public testimonial if this program has helped you in achieving your goals. | Es posible que le pidamos que brinde un testimonio público si este programa lo ha ayudado a lograr sus objetivos. | Podemos pedir que você forneça um testemunho público se este programa o ajudou a alcançar seus objetivos."
                      name={'openToDiscussImpacts'}
                      options={['Yes', 'No']}
                      required={false}
                      disabled={true}
                    />
                    <Stack spacing={2}>
                      <Typography variant="h6">
                        Conference Preferences
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
                        disabled={true}
                      />
                      <TextfieldQuestion
                        question="If you answered other to the question above, please elaborate."
                        description=""
                        name={'otherConferences'}
                        required={false}
                        disabled={true}
                      />
                    </Stack>
                  </Stack>
                )}

                {activeTab === 1 && (
                  <Stack spacing={3}>
                    <CheckboxQuestion
                      question="Mentee Motivation. Which area do you prefer to be mentored in?"
                      description="Where do you need the most guidance in order to reach your short term goals? | ¿Dónde necesita más orientación para alcanzar sus objetivos a corto plazo? | Onde você precisa de mais orientação para alcançar seus objetivos de curto prazo?"
                      name={'menteeMotivation'}
                      options={[
                        'Strengthening skills (Writing or Communication or Engineering)',
                        'Research Guidance (AI Verticals)',
                        'Improve as a Reviewer of Research Papers'
                      ]}
                      disabled={true}
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
                      disabled={true}
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
                      disabled={true}
                    />
                    <TextfieldQuestion
                      question="What career goals do you want to achieve in the next three years?"
                      description="Briefly describe your ideal position, company, or research publication goal. | Describe brevemente tu puesto ideal, empresa o objetivo de publicación de investigación. | Descreva resumidamente sua posição ideal, empresa ou objetivo de publicação de pesquisa."
                      name={'careerGoals'}
                      disabled={true}
                    />
                  </Stack>
                )}

                {activeTab === 2 && (
                  <Stack spacing={3}>
                    <RadioQuestion
                      question="Mentor Motivation. Have you served as a Mentor previously?"
                      description=""
                      name={'mentorMotivation'}
                      options={[
                        'Yes, with LatinX in AI',
                        'Yes, with another organization',
                        'No'
                      ]}
                      disabled={true}
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
                      disabled={true}
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
                      disabled={true}
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
                      disabled={true}
                    />
                    <TextfieldQuestion
                      question="If you answered other to the question above, please elaborate."
                      description=""
                      name={'otherMenteePref'}
                      required={false}
                      disabled={true}
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
                      disabled={true}
                    />
                    <TextfieldQuestion
                      question="If you answered other to the question above, please elaborate."
                      description=""
                      name={'otherExpectations'}
                      required={false}
                      disabled={true}
                    />
                  </Stack>
                )}
              </Form>
            )}
          </Formik>
        </Container>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="error">
          Reject Application
        </Button>
        <Button variant="contained" color="success">
          Accept Application
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CombinedApplicationDialog
