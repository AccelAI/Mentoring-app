import { useState, useEffect } from 'react'
import {
  Dialog,
  Checkbox,
  DialogContent,
  DialogActions,
  DialogTitle,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Typography,
  Stack,
  Box
} from '@mui/material'
import ProfilePicture from '../ProfilePicture'
import SearchBar from '../dashboard/SearchBar'
import { useUser } from '../../hooks/useUser'
import { asignMatch, endMentorship } from '../../api/match'
import { filterUsers } from '../../api/users'
import { getCurrentApplicationStatus } from '../../api/forms'
import { useSnackbar } from 'notistack'

const CreateNewMatchDialog = ({
  open,
  onClose,
  setReloadList,
  mentor,
  mentee
}) => {
  const { userList } = useUser()
  const { enqueueSnackbar } = useSnackbar()
  // Users that have a role
  const usersWithRoles = userList.filter((user) => !!user.role)
  const [applicationStatuses, setApplicationStatuses] = useState({}) // uid -> status
  const [checked, setChecked] = useState([])
  const [originalMentorId, setOriginalMentorId] = useState(null)
  const [originalMenteeId, setOriginalMenteeId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // NEW: apply initial selection safely when dialog opens or props change
  useEffect(() => {
    if (open && mentor && mentee) {
      setChecked([
        { id: mentor.uid, role: 'Mentor' },
        { id: mentee.uid, role: 'Mentee' }
      ])
      setOriginalMentorId(mentor.uid)
      setOriginalMenteeId(mentee.uid)
    }
  }, [open, mentor, mentee])

  // Fetch current application status for each user with a role when dialog opens
  useEffect(() => {
    if (!open) return
    let cancelled = false
    const roleToFormType = (role) =>
      role === 'Mentor/Mentee' ? 'Combined' : role
    const loadStatuses = async () => {
      const entries = await Promise.all(
        usersWithRoles.map(async (u) => {
          try {
            const formType = roleToFormType(u.role)
            const res = await getCurrentApplicationStatus(u.uid, formType)
            const status = res && typeof res === 'object' ? res.status : null
            return [u.uid, status]
          } catch (e) {
            console.error('Error fetching application status for', u.uid, e)
            return [u.uid, null]
          }
        })
      )
      if (!cancelled) {
        setApplicationStatuses(Object.fromEntries(entries))
      }
    }
    loadStatuses()
    return () => {
      cancelled = true
    }
  }, [open, userList]) // re-fetch if list changes or dialog re-opens

  // Only include users with BOTH a role AND accepted status (after fetch)
  const eligibleUsers = usersWithRoles.filter(
    (u) => applicationStatuses[u.uid] === 'approved'
  )

  const filteredUsers = filterUsers(searchQuery, eligibleUsers)

  // UPDATED: selection helpers
  const hasMentorSelected = checked.some((c) => c.role === 'Mentor')
  const hasMenteeSelected = checked.some((c) => c.role === 'Mentee')

  const isSelected = (userId, role) =>
    checked.some((c) => c.id === userId && c.role === role)

  const addSelection = (userId, role) => {
    setChecked((prev) => [...prev, { id: userId, role }])
  }

  const removeSelection = (userId, role) => {
    setChecked((prev) =>
      prev.filter((c) => !(c.id === userId && c.role === role))
    )
  }

  // Replaces old handleToggle (kept name for single-role users)
  const handleToggleSingleRole = (user) => () => {
    const userId = user.uid
    const role = user.role // 'Mentor' or 'Mentee'
    const already = isSelected(userId, role)
    const newList = already
      ? checked.filter((c) => !(c.id === userId && c.role === role))
      : (() => {
          if (role === 'Mentor' && hasMentorSelected) return checked
          if (role === 'Mentee' && hasMenteeSelected) return checked
          if (checked.length >= 2) return checked
          return [...checked, { id: userId, role }]
        })()
    setChecked(newList)
  }

  const handleToggleCombined = (user, targetRole) => (e) => {
    e.stopPropagation()
    const userId = user.uid
    // Prevent same user being both Mentor and Mentee
    if (
      (targetRole === 'Mentor' && isSelected(userId, 'Mentee')) ||
      (targetRole === 'Mentee' && isSelected(userId, 'Mentor'))
    )
      return

    const already = isSelected(userId, targetRole)
    if (already) {
      removeSelection(userId, targetRole)
      return
    }
    if (targetRole === 'Mentor' && hasMentorSelected) return
    if (targetRole === 'Mentee' && hasMenteeSelected) return
    if (checked.length >= 2) return
    addSelection(userId, targetRole)
  }

  const handleMatch = async () => {
    if (checked.length !== 2) {
      enqueueSnackbar('Please select one Mentor and one Mentee.', {
        variant: 'warning'
      })
      return
    }
    const mentorSel = checked.find((item) => item.role === 'Mentor')
    const menteeSel = checked.find((item) => item.role === 'Mentee')
    if (!mentorSel || !menteeSel) {
      enqueueSnackbar('Please select one Mentor and one Mentee.', {
        variant: 'warning'
      })
      return
    }

    const menteeUser = userList.find((u) => u.uid === menteeSel.id)
    const currentMenteeMentorId = menteeUser?.mentorId || null

    const isReassign =
      originalMenteeId &&
      originalMentorId &&
      menteeSel.id === originalMenteeId &&
      mentorSel.id !== originalMentorId &&
      currentMenteeMentorId === originalMentorId

    // Block if mentee already has some mentor and this is not a valid reassignment
    if (
      currentMenteeMentorId &&
      !isReassign &&
      currentMenteeMentorId !== mentorSel.id
    ) {
      enqueueSnackbar('Selected mentee already has a mentor assigned.', {
        variant: 'error'
      })
      return
    }

    try {
      if (isReassign) {
        enqueueSnackbar('Reassigning mentorship...', { variant: 'info' })
        await endMentorship(
          menteeSel.id,
          originalMentorId,
          'Reassigned',
          'Reassigned by admin'
        )
      }

      const result = await asignMatch(menteeSel.id, mentorSel.id)
      if (result.ok) {
        enqueueSnackbar(
          isReassign ? 'Mentorship reassigned!' : 'Match created successfully!',
          {
            variant: 'success'
          }
        )
        onClose()
        setChecked([])
        setOriginalMentorId(null)
        setOriginalMenteeId(null)
        setReloadList(true)
      } else {
        enqueueSnackbar(`Error creating match: ${result.error}`, {
          variant: 'error'
        })
      }
    } catch (e) {
      enqueueSnackbar(`Error processing match: ${e.message}`, {
        variant: 'error'
      })
    }
  }

  const isChecked = (user) => {
    // preserved for single-role checkbox usage
    return isSelected(user.uid, user.role)
  }

  useEffect(() => {
    if (!open) {
      setChecked([])
      setSearchQuery('')
      setOriginalMentorId(null)
      setOriginalMenteeId(null)
    }
  }, [open])

  return (
    <Dialog open={open} onClose={onClose} maxHeight={'80hv'} overflow="auto">
      <DialogTitle>Select a Mentor and Mentee to Match</DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="textSecondary" mb={2}>
          Only users with an approved application status are shown on this list.
        </Typography>
        <SearchBar setSearchQuery={setSearchQuery} props={{ width: '100%' }} />
        <List dense sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {filteredUsers.length === 0 && (
            <ListItem>
              <ListItemText primary="No users found." />
            </ListItem>
          )}
          {filteredUsers.map((user, idx) => {
            const userKey = user.uid ?? idx
            const labelId = `checkbox-list-secondary-label-${userKey}`
            const isCombined = user.role === 'Mentor/Mentee'
            return (
              <ListItem
                key={`user-${userKey}`}
                secondaryAction={
                  isCombined ? (
                    <Stack direction={'row'} spacing={1}>
                      <Box>
                        <Checkbox
                          size="small"
                          edge="end"
                          onChange={handleToggleCombined(user, 'Mentor')}
                          checked={isSelected(user.uid, 'Mentor')}
                          disabled={
                            !isSelected(user.uid, 'Mentor') && hasMentorSelected
                          }
                        />
                        <Typography
                          variant="caption"
                          sx={{ display: 'block', textAlign: 'center', mt: -1 }}
                        >
                          Mentor
                        </Typography>
                      </Box>
                      <Box>
                        <Checkbox
                          size="small"
                          edge="end"
                          onChange={handleToggleCombined(user, 'Mentee')}
                          checked={isSelected(user.uid, 'Mentee')}
                          disabled={
                            !isSelected(user.uid, 'Mentee') && hasMenteeSelected
                          }
                        />
                        <Typography
                          variant="caption"
                          sx={{ display: 'block', textAlign: 'center', mt: -1 }}
                        >
                          Mentee
                        </Typography>
                      </Box>
                    </Stack>
                  ) : (
                    <Checkbox
                      edge="end"
                      onChange={handleToggleSingleRole(user)}
                      checked={isChecked(user)}
                      id={labelId}
                    />
                  )
                }
                sx={{ pl: 0 }}
              >
                <ListItemButton>
                  <ListItemAvatar>
                    <ProfilePicture
                      img={user.profilePicture}
                      size={40}
                      borderRadius={100}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    id={labelId}
                    primary={user.displayName}
                    secondary={user.role}
                  />
                </ListItemButton>
              </ListItem>
            )
          })}
        </List>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            onClose()
          }}
        >
          Cancel
        </Button>
        <Button onClick={handleMatch} color="success" variant="contained">
          {(() => {
            const selMentor = checked.find((c) => c.role === 'Mentor')?.id
            const selMentee = checked.find((c) => c.role === 'Mentee')?.id
            const reassign =
              originalMentorId &&
              originalMenteeId &&
              selMentee === originalMenteeId &&
              selMentor &&
              selMentor !== originalMentorId
            return reassign ? 'Reassign' : 'Create'
          })()}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreateNewMatchDialog
