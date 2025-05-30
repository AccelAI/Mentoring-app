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
  Dashboard as DashboardIcon
} from '@mui/icons-material'
import { useUser } from '../../hooks/useUser'

const SideMenu = () => {
  const navigate = useNavigate()
  const { user } = useUser()
  const isMentor = user?.role === 'Mentor' || user?.role === 'Mentor/Mentee'

  return (
    <Card>
      <MenuList>
        <MenuItem onClick={() => navigate('/dashboard')}>
          <ListItemIcon>
            <DashboardIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Dashboard</ListItemText>
        </MenuItem>
        {isMentor && (
          <MenuItem onClick={() => navigate('/matches')}>
            <ListItemIcon>
              <GroupIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText>Mentee Matches</ListItemText>
          </MenuItem>
        )}
      </MenuList>
    </Card>
  )
}

export default SideMenu
