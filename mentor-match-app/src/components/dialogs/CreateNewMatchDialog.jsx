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
  Typography
} from '@mui/material'
import ProfilePicture from '../ProfilePicture'
import SearchBar from '../dashboard/SearchBar'
import { useUser } from '../../hooks/useUser'
import { asignMatch } from '../../api/match'
import { filterUsers } from '../../api/users'
import { getCurrentApplicationStatus } from '../../api/forms'
import { useSnackbar } from 'notistack'

const CreateNewMatchDialog = ({ open, onClose, setReloadList }) => {
  const { userList } = useUser()
  const { enqueueSnackbar } = useSnackbar()
  // Users that have a role
  const usersWithRoles = userList.filter((user) => !!user.role)
  const [applicationStatuses, setApplicationStatuses] = useState({}) // uid -> status
  const [checked, setChecked] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch current application status for each user with a role when dialog opens
  useEffect(() => {
    if (!open) return
    let cancelled = false
    const loadStatuses = async () => {
      const entries = await Promise.all(
        usersWithRoles.map(async (u) => {
          try {
            const res = await getCurrentApplicationStatus(u.uid, u.role)
            console.log('Fetched application status for', u.uid, res.status)
            return [u.uid, res.status]
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

  const handleToggle = (user) => () => {
    console.log('Toggling user:', user)
    const userKey = user.uid ?? user.displayName
    const userRole = user.role
    const currentIndex = checked.findIndex((item) => item.id === userKey)
    const newChecked = [...checked]

    if (currentIndex !== -1) {
      newChecked.splice(currentIndex, 1)
    } else {
      // Only allow one Mentor and one Mentee
      const hasMentor = newChecked.some((item) => item.role === 'Mentor')
      const hasMentee = newChecked.some((item) => item.role === 'Mentee')
      if (
        (userRole === 'Mentor' && hasMentor) ||
        (userRole === 'Mentee' && hasMentee) ||
        newChecked.length >= 2
      ) {
        return
      }
      newChecked.push({ id: user.uid, role: userRole })
    }
    console.log(newChecked)
    setChecked(newChecked)
  }

  const handleMatch = async () => {
    if (checked.length !== 2) {
      enqueueSnackbar('Please select one Mentor and one Mentee.', {
        variant: 'warning'
      })
      return
    }
    const mentor = checked.find((item) => item.role === 'Mentor')
    const mentee = checked.find((item) => item.role === 'Mentee')
    if (!mentor || !mentee) {
      enqueueSnackbar('Please select one Mentor and one Mentee.', {
        variant: 'warning'
      })
      return
    }

    const menteeUser = userList.find((u) => u.uid === mentee.id)
    console.log('Selected mentee user:', menteeUser)
    if (menteeUser?.mentorId) {
      enqueueSnackbar('Selected mentee already has a mentor assigned.', {
        variant: 'error'
      })
      return
    }

    const result = await asignMatch(mentee.id, mentor.id)
    if (result.ok) {
      enqueueSnackbar('Match created successfully!', { variant: 'success' })
      onClose()
      setChecked([])
      setReloadList(true)
    } else {
      enqueueSnackbar(`Error creating match: ${result.error}`, {
        variant: 'error'
      })
    }
  }

  const isChecked = (user) => {
    const userKey = user.uid ?? user.displayName
    return checked.some((item) => item.id === userKey)
  }

  useEffect(() => {
    if (!open) {
      setChecked([])
      setSearchQuery('')
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
            return (
              <ListItem
                key={`user-${userKey}`}
                secondaryAction={
                  <Checkbox
                    edge="end"
                    onChange={handleToggle(user)}
                    checked={isChecked(user)}
                    id={labelId}
                  />
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
          Create
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreateNewMatchDialog
