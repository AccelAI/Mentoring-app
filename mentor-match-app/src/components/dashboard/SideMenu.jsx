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
  AccountBox as MentorIcon
} from '@mui/icons-material'
import { useUser } from '../../hooks/useUser'

const SideMenu = ({ setView }) => {
  const { user } = useUser()
  const isMentor = user?.role === 'Mentor' || user?.role === 'Mentor/Mentee'
  const isMentee = user?.role === 'Mentee' || user?.role === 'Mentor/Mentee'

  return (
    <Card>
      <MenuList>
        <MenuItem onClick={() => setView('dashboard')}>
          <ListItemIcon>
            <DashboardIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Dashboard</ListItemText>
        </MenuItem>
        {isMentor && (
          <MenuItem onClick={() => setView('currentMentees')}>
            <ListItemIcon>
              <GroupIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText>Current Mentees</ListItemText>
          </MenuItem>
        )}
        {isMentee && (
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
