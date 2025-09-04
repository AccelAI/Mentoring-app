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
  DialogActions
} from '@mui/material'

// Form validation
import { Form, Formik } from 'formik'

// Component imports
import TextfieldQuestion from '../../questions/TextfieldQuestion'
import RadioQuestion from '../../questions/RadioQuestion'
import CheckboxQuestion from '../../questions/CheckboxQuestion'
import TimezoneQuestion from '../../questions/TimezoneQuestion'
import ConditionalQuestions from '../../questions/ConditionalQuestions'
import ConditionalQuestionsMentor from '../../questions/ConditionalQuestionsMentor'

const MentorApplicationDialog = ({ application, open, onClose }) => {
  const { user, formData } = application || {}

  if (!application) return null

  // Use the form data directly - this is a mentor application dialog
  const initialValues = formData || {}

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={'lg'}
      fullWidth
      maxHeight={'90vh'}
    >
      <DialogTitle color="primary">
        {user?.displayName || user?.email || 'Unknown User'} - Mentor
        Application Form
      </DialogTitle>
      <DialogContent dividers>
        <Container>
          <Formik initialValues={initialValues}>
            {() => (
              <Form>
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
                      'Management / Business Professional'
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
                    description=""
                    options={['English', 'Spanish', 'Portuguese', 'French']}
                    name={'languages'}
                    disabled={true}
                  />
                  <TimezoneQuestion
                    question="What is your preferred timezone for meetings?"
                    description="We'll do our best to match you with a mentee available in a similar timezone."
                    name={'preferredTimezone'}
                    disabled={true}
                  />
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
                    name={'preferredExpectations'}
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
                  <RadioQuestion
                    question="Are you open to discuss/enumerate the impacts of the program with organizers in the future?"
                    description="We may ask you to provide a public testimonial if this program has helped you in achieving your goals. | Es posible que le pidamos que brinde un testimonio público si este programa lo ha ayudado a lograr sus objetivos. | Podemos pedir que você forneça um testemunho público se este programa o ajudou a alcançar seus objetivos."
                    name={'openToDiscussImpacts'}
                    options={['Yes', 'No']}
                    required={false}
                    disabled={true}
                  />
                  <ConditionalQuestionsMentor disabled={true} />
                  <ConditionalQuestions disabled={true} />

                  <Stack spacing={2}>
                    <Typography variant="h6">Conference Preferences</Typography>

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

export default MentorApplicationDialog
