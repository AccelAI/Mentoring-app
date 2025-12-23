import {
  Card,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography
} from '@mui/material'
import {
  Group as GroupIcon,
  Dashboard as DashboardIcon,
  AccountBox as MentorIcon,
  Assignment as ApplicationIcon,
  ManageAccounts as AdminIcon,
  OpenInNew as OpenInNewIcon  
} from '@mui/icons-material'
import { useUser } from '../../hooks/useUser'
import { useNavigate } from 'react-router-dom'
import { useThemeContext } from '../../hooks/useTheme'

const SideMenu = ({ setView, currentView }) => {
  const { user, isAdmin } = useUser()
  const navigate = useNavigate()
  const { theme } = useThemeContext()
  const isMentor = user?.role === 'Mentor' || user?.role === 'Mentor/Mentee'
  const isMentee = user?.role === 'Mentee' || user?.role === 'Mentor/Mentee'

  return (
    <Card sx={{ width: { md: '40%', lg: 'auto', sm: 'auto' } }}>
      <MenuList>
        
        <MenuItem onClick={() => setView('dashboard')}>
          <ListItemIcon>
            <DashboardIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText
            sx={{ display: { xs: 'none', sm: 'none', md: 'inline' } }}
          >
            <Typography
              color={currentView === 'dashboard' ? 'primary' : 'inherit'}
            >
              Dashboard
            </Typography>
          </ListItemText>
        </MenuItem>

        <MenuItem onClick={() => setView('applicationStatus')}>
          <ListItemIcon>
            <ApplicationIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText
            sx={{ display: { xs: 'none', sm: 'none', md: 'inline' } }}
          >
            <Typography
              color={
                currentView === 'applicationStatus' ? 'primary' : 'inherit'
              }
            >
              Mentorship Application
            </Typography>
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
              <Typography
                color={currentView === 'currentMentees' ? 'primary' : 'inherit'}
              >
                Current Mentees
              </Typography>
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
              <Typography
                color={currentView === 'currentMentor' ? 'primary' : 'inherit'}
              >
                Current Mentor
              </Typography>
            </ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => setView('slack')}>
          <ListItemIcon>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke={theme.palette.primary.main}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M12 12v-6a2 2 0 0 1 4 0v6m0 -2a2 2 0 1 1 2 2h-6" />
              <path d="M12 12h6a2 2 0 0 1 0 4h-6m2 0a2 2 0 1 1 -2 2v-6" />
              <path d="M12 12v6a2 2 0 0 1 -4 0v-6m0 2a2 2 0 1 1 -2 -2h6" />
              <path d="M12 12h-6a2 2 0 0 1 0 -4h6m-2 0a2 2 0 1 1 2 -2v6" />
            </svg>
          </ListItemIcon>
          <ListItemText
            sx={{ display: { xs: 'none', sm: 'none', md: 'inline' } }}
          >
            <Typography color={currentView === 'slack' ? 'primary' : 'inherit'}>
              Slack Channel
            </Typography>
          </ListItemText>
        </MenuItem>
        {isAdmin && (
          <MenuItem onClick={() => navigate('/admin')}>
            <ListItemIcon>
              <AdminIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText
              sx={{ display: { xs: 'none', sm: 'none', md: 'inline' } }}
            >
              <Typography
                color={currentView === 'admin' ? 'primary' : 'inherit'}
              >
                Admin Dashboard
              </Typography>
            </ListItemText>
            <ListItemIcon sx={{ placeContent: 'center' }}>
              <OpenInNewIcon fontSize="small" color="secondary" />
            </ListItemIcon>
          </MenuItem>
        )}
      </MenuList>
    </Card>
  )
}

export default SideMenu
