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
import { handleStatusUpdate } from '../../utils/mentorshipApplication'
import { formatDate } from '../../utils/date'
import { useSnackbar } from 'notistack'

const MentorshipApplicationCard = ({
  application,
  onReview,
  onStatusUpdate,
  status
}) => {
  const { user, formData, type, submittedAt } = application
  // Determine how to render the commitment statement
  const statementRaw = formData?.commitmentStatement
  const statement = typeof statementRaw === 'string' ? statementRaw.trim() : ''
  const isHttpsUrl = statement.startsWith('https://')

  const [openAcceptDialog, setOpenAcceptDialog] = useState(false)
  const [openRejectDialog, setOpenRejectDialog] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  const updateStatus = (status, reason = '') => {
    handleStatusUpdate({
      user,
      type,
      status,
      reason,
      onStatusUpdate,
      enqueueSnackbar
    })
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
              {/*Only mentees have commitment statements */}
              {(type === 'Mentee' || type === 'Combined') && (
                <Stack
                  direction={isHttpsUrl ? 'row' : 'column'}
                  spacing={0.5}
                  alignItems={isHttpsUrl ? 'center' : 'flex-start'}
                >
                  <Stack direction={'row'} spacing={0.5} alignItems={'center'}>
                    <StatementIcon fontSize="small" color="primary" />
                    <Typography variant={'body2'}>
                      Commitment and motivation statement:
                    </Typography>
                  </Stack>
                  {isHttpsUrl ? (
                    <Link
                      href={statement}
                      variant="body2"
                      target="_blank"
                      rel="noopener"
                      sx={{ wordBreak: 'break-all' }}
                    >
                      {statement}
                    </Link>
                  ) : (
                    <Box pr={2} pb={1}>
                      <Typography variant="body2" color="text.secondary">
                        {statement || 'No statement provided'}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              )}
            </Stack>
          </Stack>
          <Stack spacing={1} direction={'row'} alignItems={'center'}>
            {status === 'pending' ? (
              <Tooltip title="View Full Application">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => onReview(application)}
                >
                  <FormIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <Button
                onClick={() => onReview(application)}
                size="small"
                startIcon={<FormIcon />}
              >
                View Application
              </Button>
            )}
            {status === 'pending' && (
              <>
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
              </>
            )}
          </Stack>
        </Stack>
      </Box>

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
    </Card>
  )
}

export default MentorshipApplicationCard
