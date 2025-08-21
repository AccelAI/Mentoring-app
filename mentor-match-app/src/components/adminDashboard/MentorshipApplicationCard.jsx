import React from 'react'
import { useState } from 'react'
import {
  Card,
  Typography,
  Stack,
  Box,
  Button,
  IconButton,
  Tooltip,
  Link
} from '@mui/material'
import {
  CheckCircleOutline as CheckIcon,
  CancelOutlined as CancelIcon,
  AssignmentOutlined as FormIcon,
  Today as DateIcon,
  Description as StatementIcon
} from '@mui/icons-material'
import ProfilePicture from '../ProfilePicture'
import ConfirmApplicationDialog from '../dialogs/ConfirmApplicationDialog'
import { updateApplicationStatus } from '../../api/forms'
import { formatDate } from '../../utils/date'
import { useSnackbar } from 'notistack'

const MentorshipApplicationCard = ({
  application,
  onReview,
  onStatusUpdate
}) => {
  const { user, formData, type, submittedAt } = application
  const [openAcceptDialog, setOpenAcceptDialog] = useState(false)
  const [openRejectDialog, setOpenRejectDialog] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  const handleStatusUpdate = async (status, reason = '') => {
    try {
      await updateApplicationStatus(user.uid, type, status, reason)
      if (onStatusUpdate) {
        onStatusUpdate()
      }
      enqueueSnackbar(`Application ${status} successfully`, {
        variant: 'success'
      })
    } catch (error) {
      console.error('Error updating application status:', error)
      enqueueSnackbar('Error updating application status: ' + error.message, {
        variant: 'error'
      })
    }
  }

  return (
    <Card
      variant="outlined"
      sx={{
        transition: 'box-shadow 0.3s',
        '&:hover': {
          boxShadow: 2
        }
      }}
    >
      <Box p={2}>
        <Stack direction={'row'} spacing={2} alignItems={'center'}>
          <ProfilePicture
            img={user.profilePicture}
            size={70}
            borderRadius={100}
          />
          <Stack spacing={1.5} flexGrow={1}>
            <Stack>
              <Typography variant={'h6'} fontWeight={'light'}>
                {user.displayName || user.email || 'Unknown User'}
              </Typography>
              <Typography variant={'body2'} fontWeight={'medium'}>
                {type} Application
              </Typography>
            </Stack>
            <Stack spacing={0.5}>
              <Stack direction={'row'} spacing={0.5} alignItems={'center'}>
                <DateIcon fontSize="small" color="primary" />
                <Typography variant={'body2'}>
                  Submitted on: {formatDate(submittedAt)}
                </Typography>
              </Stack>

              <Stack direction={'row'} spacing={0.5} alignItems={'center'}>
                <StatementIcon fontSize="small" color="primary" />
                <Typography variant={'body2'}>
                  Commitment and motivation statement:
                </Typography>
                <Link
                  href={formData.commitmentStatement}
                  variant={'body2'}
                  target="_blank"
                  sx={{ wordBreak: 'break-all' }}
                >
                  {formData.commitmentStatement || 'No statement provided'}
                </Link>
              </Stack>
            </Stack>
          </Stack>
          <Stack spacing={1} direction={'row'} alignItems={'center'}>
            <Tooltip title="View Full Application">
              <IconButton
                size="small"
                color="primary"
                onClick={() => onReview(application)}
              >
                <FormIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Accept Application">
              <IconButton
                color="success"
                onClick={() => setOpenAcceptDialog(true)}
              >
                <CheckIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reject Application">
              <IconButton
                color="error"
                onClick={() => setOpenRejectDialog(true)}
              >
                <CancelIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>
      <ConfirmApplicationDialog
        open={openAcceptDialog}
        onClose={() => setOpenAcceptDialog(false)}
        onConfirm={(reason) => handleStatusUpdate('approved', reason)}
        action="accept"
      />
      <ConfirmApplicationDialog
        open={openRejectDialog}
        onClose={() => setOpenRejectDialog(false)}
        onConfirm={(reason) => handleStatusUpdate('denied', reason)}
        action="reject"
      />
    </Card>
  )
}

export default MentorshipApplicationCard
