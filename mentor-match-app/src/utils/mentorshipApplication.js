import { updateApplicationStatus } from '../api/forms'

export const handleStatusUpdate = async ({
  user,
  type,
  status,
  reason = '',
  onStatusUpdate,
  enqueueSnackbar
}) => {
  try {
    const res = await updateApplicationStatus(user.uid, type, status, reason)

    if (res.ok && onStatusUpdate && enqueueSnackbar) {
      onStatusUpdate()
      enqueueSnackbar(`Application ${status} successfully`, {
        variant: 'success'
      })
    }
  } catch (error) {
    console.error('Error updating application status:', error)
    if (enqueueSnackbar) {
      enqueueSnackbar('Error updating application status: ' + error.message, {
        variant: 'error'
      })
    }
  }
}
