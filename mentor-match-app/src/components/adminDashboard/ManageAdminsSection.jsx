import { useState, useEffect } from 'react'
import {
  Stack,
  Typography,
  Card,
  Grid2 as Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Box,
  Tooltip
} from '@mui/material'
import {
  Add as AddIcon,
  DeleteForever as DeleteIcon
} from '@mui/icons-material'
import ProfilePicture from '../ProfilePicture'
import {
  getAdmins,
  filterUsers,
  setAsAdmin,
  removeAdmin
} from '../../api/users'
import { useUser } from '../../hooks/useUser'
import SearchBar from '../SearchBar'
import { useSnackbar } from 'notistack'

const ManageAdminsSection = () => {
  const { userList, user } = useUser()
  const [admins, setAdmins] = useState([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [reloadList, setReloadList] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    const fetchAdmins = async () => {
      const admins = await getAdmins()
      console.log('Admins:', admins)
      setAdmins(admins)
      setReloadList(false)
    }
    fetchAdmins()
  }, [reloadList])

  const filteredUsers = filterUsers(searchQuery, userList)
    .slice()
    .sort((a, b) => {
      const nameA = a.displayName.toLowerCase()
      const nameB = b.displayName.toLowerCase()
      return nameA.localeCompare(nameB)
    })

  const handleSetAsAdmin = async (userId) => {
    const result = await setAsAdmin(userId, user.uid)
    if (result.alreadyAdmin) {
      enqueueSnackbar(result.msg, { variant: 'info' })
    }
    if (result.ok && !result.alreadyAdmin) {
      setReloadList(true)
      enqueueSnackbar('User has been set as admin', { variant: 'success' })
      setDialogOpen(false)
    } else if (result.error) {
      enqueueSnackbar(`Error: ${result.error}`, { variant: 'error' })
    }
  }

  const handleRemoveAdmin = async (userId) => {
    if (userId === user.uid) {
      enqueueSnackbar('You cannot remove yourself as an admin', {
        variant: 'warning'
      })
      return
    }
    try {
      const res = await removeAdmin(userId)
      if (res.ok) {
        enqueueSnackbar('Admin removed successfully', { variant: 'success' })
        setReloadList(true)
      } else {
        enqueueSnackbar(`Error: ${res.error}`, { variant: 'error' })
      }
    } catch (err) {
      console.error('Error removing admin:', err)
      enqueueSnackbar(`Error: ${err.message}`, { variant: 'error' })
    }
  }

  return (
    <Stack spacing={2} width="100%">
      <Grid container spacing={1}>
        <Grid size={1.7}>
          <Card
            sx={{
              height: '100%',
              transition: 'box-shadow 0.3s',
              '&:hover': {
                boxShadow: 2
              }
            }}
            variant="outlined"
          >
            <Stack
              height={'100%'}
              justifyContent={'center'}
              alignItems="center"
              spacing={1}
              p={2}
            >
              <IconButton
                sx={{ alignSelf: 'center' }}
                onClick={() => setDialogOpen(true)}
              >
                <AddIcon fontSize="large" color="primary" />
              </IconButton>
              <Typography variant="body2" textAlign={'center'}>
                Add New Admin
              </Typography>
            </Stack>
          </Card>
        </Grid>
        {admins.map((admin) => (
          <Grid size={1.7} key={admin.uid}>
            <Card
              sx={{
                height: '100%',
                transition: 'box-shadow 0.3s',
                '&:hover': {
                  boxShadow: 2
                }
              }}
              variant="outlined"
            >
              <Stack
                height={'100%'}
                justifyContent={'center'}
                alignItems="center"
                spacing={1}
                p={2}
              >
                <ProfilePicture
                  img={admin.profilePicture}
                  borderRadius={100}
                  size={50}
                />
                <Typography variant="body2" textAlign={'center'}>
                  {admin.displayName}
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Box alignSelf={'flex-end'} maxHeight={'min-content'}>
                  <Tooltip title="Remove Admin">
                    <IconButton onClick={() => handleRemoveAdmin(admin.uid)}>
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Stack>
            </Card>
          </Grid>
        ))}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          fullWidth
        >
          <DialogTitle>Add New Admin</DialogTitle>
          <DialogContent>
            <Typography>
              To add a new admin, please select a user from the list below
            </Typography>
            <SearchBar
              setSearchQuery={setSearchQuery}
              props={{ width: '100%', py: 1 }}
            />
            <List dense>
              {filteredUsers.map((user) => (
                <ListItemButton
                  key={user.uid}
                  onClick={() => handleSetAsAdmin(user.uid)}
                >
                  <ListItemAvatar>
                    <ProfilePicture
                      img={user.profilePicture}
                      size={40}
                      borderRadius={100}
                    />
                  </ListItemAvatar>
                  <ListItemText primary={user.displayName} />
                </ListItemButton>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </Stack>
  )
}

export default ManageAdminsSection
