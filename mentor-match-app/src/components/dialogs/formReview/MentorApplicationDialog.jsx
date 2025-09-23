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
  DialogActions
} from '@mui/material'

// Form validation
import { Form, Formik } from 'formik'

import { handleStatusUpdate } from '../../../utils/mentorshipApplication'
import { useSnackbar } from 'notistack'

// Component imports
import MentorQuestions from '../../questions/MentorQuestions'
import CommonQuestions from '../../questions/CommonQuestions'
import TextfieldQuestion from '../../questions/TextfieldQuestion'
import RadioQuestion from '../../questions/RadioQuestion'
import ConfirmApplicationDialog from '../ConfirmApplicationDialog'

const MentorApplicationDialog = ({
  application,
  open,
  onClose,
  onStatusUpdate,
  enableReview = true
}) => {
  const { user, formData } = application || {}
  const [openAcceptDialog, setOpenAcceptDialog] = useState(false)
  const [openRejectDialog, setOpenRejectDialog] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  if (!application) return null

  // Use the form data directly
  const initialValues = formData || {}

  const updateStatus = (status, reason = '') => {
    handleStatusUpdate({
      user,
      type: 'Mentor',
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
        {user?.displayName || user?.email || 'Unknown User'} - Mentor
        Application Form
      </DialogTitle>
      <DialogContent dividers>
        <Container>
          <Formik initialValues={initialValues}>
            {() => (
              <Form>
                <Stack spacing={3}>
                  <Typography variant="h6">
                    Basic Information / Información básica / Informações Básicas
                  </Typography>
                  <TextfieldQuestion
                    question="Current Position / Posición Actual / Posição Atual"
                    name={'currentPosition'}
                    disabled={true}
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
                    disabled={true}
                  />
                  <CommonQuestions disabled={true} />
                  <MentorQuestions disabled={true} />
                  <Typography variant="h6">
                    Beyond the Program / Más allá del programa / Além do
                    programa
                  </Typography>
                  <TextfieldQuestion
                    question="What do you hope to contribute as a mentor in this program?/¿Qué esperas aportar como mentor en este programa? / O que você espera contribuir como mentor neste programa?"
                    name={'contributeAsMentor'}
                    disabled={true}
                  />
                  <RadioQuestion
                    question="Are you open to discuss/enumerate the impacts of the program sometime later in the future? / ¿Estás abierto/a a discutir o enumerar los impactos del programa en algún momento en el futuro? / Você está aberto(a) para discutir ou enumerar os impactos do programa em algum momento no futuro?"
                    name={'openToDiscussImpacts'}
                    options={['Yes', 'No']}
                    required={false}
                    disabled={true}
                  />
                </Stack>
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

export default MentorApplicationDialog
