import {
  Card,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import {
  Group as GroupIcon,
  Dashboard as DashboardIcon,
  AccountBox as MentorIcon,
  Assignment as ApplicationIcon,
  ManageAccounts as AdminIcon
} from '@mui/icons-material'
import { useUser } from '../../hooks/useUser'
import { useNavigate } from 'react-router-dom'

const SideMenu = ({ setView }) => {
  const { user, isAdmin } = useUser()
  const navigate = useNavigate()
  const isMentor = user?.role === 'Mentor' || user?.role === 'Mentor/Mentee'
  const isMentee = user?.role === 'Mentee' || user?.role === 'Mentor/Mentee'

  return (
    <Card sx={{ width: { md: '40%', lg: 'auto', sm: 'auto' } }}>
      <MenuList>
        {isAdmin && (
          <MenuItem onClick={() => navigate('/admin')}>
            <ListItemIcon>
              <AdminIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText
              sx={{ display: { xs: 'none', sm: 'none', md: 'inline' } }}
            >
              Admin Dashboard
            </ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => setView('dashboard')}>
          <ListItemIcon>
            <DashboardIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText
            sx={{ display: { xs: 'none', sm: 'none', md: 'inline' } }}
          >
            Dashboard
          </ListItemText>
        </MenuItem>

        <MenuItem onClick={() => setView('applicationStatus')}>
          <ListItemIcon>
            <ApplicationIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText
            sx={{ display: { xs: 'none', sm: 'none', md: 'inline' } }}
          >
            Mentorship Application
          </ListItemText>
        </MenuItem>

        {isMentor && (
          <MenuItem onClick={() => setView('currentMentees')}>
            <ListItemIcon>
              <GroupIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText
              sx={{ display: { xs: 'none', sm: 'none', md: 'inline' } }}
            >
              Current Mentees
            </ListItemText>
          </MenuItem>
        )}

        {isMentee && (
          <MenuItem onClick={() => setView('currentMentor')}>
            <ListItemIcon>
              <MentorIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText
              sx={{ display: { xs: 'none', sm: 'none', md: 'inline' } }}
            >
              Current Mentor
            </ListItemText>
          </MenuItem>
        )}
      </MenuList>
    </Card>
  )
}

export default SideMenu
