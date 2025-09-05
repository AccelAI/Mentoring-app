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
import CommonQuestions from '../../questions/CommonQuestions'
import MenteeQuestions from '../../questions/MenteeQuestions'
import TextfieldQuestion from '../../questions/TextfieldQuestion'
import RadioQuestion from '../../questions/RadioQuestion'
import ConfirmApplicationDialog from '../ConfirmApplicationDialog'

const MenteeApplicationDialog = ({
  application,
  open,
  onClose,
  onStatusUpdate
}) => {
  const { user, formData } = application || {}
  const [openAcceptDialog, setOpenAcceptDialog] = useState(false)
  const [openRejectDialog, setOpenRejectDialog] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  if (!application) return null

  // Use the form data directly - this is a mentee application dialog
  const initialValues = formData || {}

  const updateStatus = (status, reason = '') => {
    handleStatusUpdate({
      user,
      type: 'Mentee',
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
        {user?.displayName || user?.email || 'Unknown User'} - Mentee
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
                  <RadioQuestion
                    question="Current Position / Posición Actual / Posição Atual"
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
                    disabled={true}
                  />
                  <CommonQuestions disabled={true} />

                  <MenteeQuestions disabled={true} />

                  <Typography variant="h6">
                    Beyond the Program / Más allá del programa / Além do
                    programa
                  </Typography>
                  <TextfieldQuestion
                    question="Do you plan to share your experience after the program? If yes, how? / ¿Planeas compartir tu experiencia después del programa? Si es así, ¿cómo? / Você planeja compartilhar sua experiência após o programa? Se sim, como?"
                    name={'shareExperience'}
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
              </Form>
            )}
          </Formik>
        </Container>
      </DialogContent>
      <DialogActions>
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

export default MenteeApplicationDialog
