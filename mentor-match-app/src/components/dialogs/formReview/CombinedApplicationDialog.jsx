// React and hooks
import { useState } from 'react'

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

import { handleStatusUpdate } from '../../../utils/mentorshipApplication'
import { useSnackbar } from 'notistack'

// Component imports
import CommonQuestions from '../../questions/CommonQuestions'
import MenteeQuestions from '../../questions/MenteeQuestions'
import MentorQuestions from '../../questions/MentorQuestions'
import TextfieldQuestion from '../../questions/TextfieldQuestion'
import RadioQuestion from '../../questions/RadioQuestion'
import ConfirmApplicationDialog from '../ConfirmApplicationDialog'

const CombinedApplicationDialog = ({
  application,
  open,
  onClose,
  onStatusUpdate,
  enableReview = true
}) => {
  const { user, formData } = application || {}
  const [activeTab, setActiveTab] = useState(0)
  const [openAcceptDialog, setOpenAcceptDialog] = useState(false)
  const [openRejectDialog, setOpenRejectDialog] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  if (!application) return null

  // For combined applications, we need to get both mentor and mentee data
  // The formData should contain both sets of data
  const initialValues = formData || {}

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const updateStatus = (status, reason = '') => {
    handleStatusUpdate({
      user,
      type: 'Combined',
      status,
      reason,
      onStatusUpdate,
      enqueueSnackbar
    })
    onClose()
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
                      disabled={true}
                    />
                    <CommonQuestions disabled={true} />
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
                      disabled={true}
                    />
                    <RadioQuestion
                      question={`Are you open to discuss/enumerate the impacts of the program sometime later in the future? / ¿Estás abierto/a a discutir o enumerar los impactos del programa en algún momento en el futuro? / Você está aberto(a) para discutir ou enumerar os impactos do programa em algum momento no futuro?`}
                      name={'openToDiscussImpacts'}
                      options={['Yes', 'No']}
                      required={false}
                      disabled={true}
                    />
                  </Stack>
                )}

                {activeTab === 1 && (
                  <Stack spacing={3}>
                    <MenteeQuestions isCombinedForm={true} disabled={true} />
                    <Typography variant="h6">
                      Beyond the Program / Más allá del programa / Além do
                      programa
                    </Typography>
                    <TextfieldQuestion
                      question="Do you plan to share your experience after the program? If yes, how? / ¿Planeas compartir tu experiencia después del programa? Si es así, ¿cómo? / Você planeja compartilhar sua experiência após o programa? Se sim, como?"
                      name={'shareExperience'}
                      disabled={true}
                    />
                  </Stack>
                )}

                {activeTab === 2 && (
                  <Stack spacing={3}>
                    <MentorQuestions isCombinedForm={true} disabled={true} />
                    <Typography variant="h6">
                      Beyond the Program / Más allá del programa / Além do
                      programa
                    </Typography>
                    <TextfieldQuestion
                      question="What do you hope to contribute as a mentor in this program?/¿Qué esperas aportar como mentor en este programa? / O que você espera contribuir como mentor neste programa?"
                      name={'contributeAsMentor'}
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
        {!enableReview ? (
          <Button
            onClick={() => {
              onClose()
            }}
          >
            Close
          </Button>
        ) : (
          <>
            <Button
              variant="contained"
              color="error"
              onClick={() => setOpenRejectDialog(true)}
            >
              Reject Application
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => setOpenAcceptDialog(true)}
            >
              Accept Application
            </Button>
          </>
        )}
      </DialogActions>
      <ConfirmApplicationDialog
        open={openAcceptDialog}
        onClose={() => setOpenAcceptDialog(false)}
        onConfirm={(reason) => updateStatus('approved', reason)}
        action="accept"
      />
      <ConfirmApplicationDialog
        open={openRejectDialog}
        onClose={() => setOpenRejectDialog(false)}
        onConfirm={(reason) => updateStatus('rejected', reason)}
        action="reject"
      />
    </Dialog>
  )
}

export default CombinedApplicationDialog
