import { useNavigate } from 'react-router-dom'
import {
  Card,
  Typography,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import {
  Group as GroupIcon,
  Dashboard as DashboardIcon,
  AccountBox as MentorIcon
} from '@mui/icons-material'
import { useUser } from '../../hooks/useUser'

const SideMenu = ({ setView }) => {
  const navigate = useNavigate()
  const { user } = useUser()
  const isMentor = user?.role === 'Mentor' || user?.role === 'Mentor/Mentee'

  return (
    <Card>
      <MenuList>
        <MenuItem onClick={() => setView('dashboard')}>
          <ListItemIcon>
            <DashboardIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Dashboard</ListItemText>
        </MenuItem>
        {isMentor ? (
          <MenuItem onClick={() => setView('currentMentees')}>
            <ListItemIcon>
              <GroupIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText>Current Mentees</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem onClick={() => setView('currentMentor')}>
            <ListItemIcon>
              <MentorIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText>Current Mentor</ListItemText>
          </MenuItem>
        )}
      </MenuList>
    </Card>
  )
}

export default SideMenu
