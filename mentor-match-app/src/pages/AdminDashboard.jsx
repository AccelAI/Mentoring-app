// React hooks
import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// MUI components
import {
  Box,
  Card,
  Stack,
  Typography,
  Tab,
  CircularProgress,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import { Cached as ReloadIcon, Person as UserIcon } from '@mui/icons-material'
import { TabList, TabPanel, TabContext } from '@mui/lab'

// Hooks and services
import { useUser } from '../hooks/useUser'
import { getAllApplications } from '../api/forms'
import { getAllMentorshipPairs } from '../api/match'

// Components
import Header from '../components/Header'
import UserListView from '../components/dashboard/UserListView'
import ChatDrawer from '../components/chat/ChatDrawer'
import MentorshipApplicationCard from '../components/adminDashboard/MentorshipApplicationCard'
import MenteeApplicationDialog from '../components/dialogs/formReview/MenteeApplicationDialog'
import MentorApplicationDialog from '../components/dialogs/formReview/MentorApplicationDialog'
import CombinedApplicationDialog from '../components/dialogs/formReview/CombinedApplicationDialog'
import ManageMatchesSection from '../components/adminDashboard/ManageMatchesSection'
import ManageAdminsSection from '../components/adminDashboard/ManageAdminsSection'

const AdminDashboard = () => {
  const { userList } = useUser()
  const [toggleChat, setToggleChat] = useState(false)
  const [selectedChatRoomId, setSelectedChatRoomId] = useState(null)
  const [value, setValue] = useState('0')
  const navigate = useNavigate()
  // Application management state
  const [applications, setApplications] = useState([])
  const [loadingApplications, setLoadingApplications] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all') // new state

  // Mentorship pairs (lifted to page scope)
  const [mentorshipPairs, setMentorshipPairs] = useState([])
  const fetchPairs = useCallback(async () => {
    const pairs = await getAllMentorshipPairs()
    setMentorshipPairs(pairs)
  }, [])

  // Fetch pairs once when the page mounts
  useEffect(() => {
    fetchPairs()
  }, [fetchPairs])

  const fetchApplications = async () => {
    setLoadingApplications(true)
    try {
      const apps = await getAllApplications()
      setApplications(apps)
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoadingApplications(false)
    }
  }

  // Fetch all applications when the component mounts
  useEffect(() => {
    fetchApplications()
  }, [])

  const handleStartChat = useCallback((chatRoomId) => {
    setSelectedChatRoomId(chatRoomId)
    setToggleChat(true)
  }, [])

  const handleReviewApplication = useCallback((application) => {
    setSelectedApplication(application)
    setDialogOpen(true)
  }, [])

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false)
    setSelectedApplication(null)
  }, [])

  const handleApplicationStatusUpdate = useCallback(() => {
    // Refresh applications after status update (fetch all)
    const fetchApplications = async () => {
      const apps = await getAllApplications()
      setApplications(apps)
    }
    fetchApplications()
  }, [])

  // Derive filtered list based on status and type
  const filteredApplications = applications.filter(
    (a) =>
      (statusFilter === 'all' || a.status === statusFilter) &&
      (typeFilter === 'all' || a.type === typeFilter)
  )

  // Render the appropriate dialog based on application type
  const renderApplicationDialog = () => {
    if (!selectedApplication) return null

    const { type, status } = selectedApplication
    const dialogProps = {
      open: dialogOpen,
      onClose: handleCloseDialog,
      application: selectedApplication,
      onStatusUpdate: handleApplicationStatusUpdate
    }

    switch (type) {
      case 'Mentee':
        return (
          <MenteeApplicationDialog
            {...dialogProps}
            enableReview={status === 'pending'}
          />
        )
      case 'Mentor':
        return (
          <MentorApplicationDialog
            {...dialogProps}
            enableReview={status === 'pending'}
          />
        )
      case 'Combined':
        return (
          <CombinedApplicationDialog
            {...dialogProps}
            enableReview={status === 'pending'}
          />
        )
      default:
        return (
          <MenteeApplicationDialog
            {...dialogProps}
            enableReview={status === 'pending'}
          />
        )
    }
  }

  return (
    <>
      <Header />
      <Box p={3}>
        <Stack spacing={2}>
          <Typography variant="h5" color="white" fontWeight={'light'}>
            Admin Dashboard
          </Typography>
          <Card>
            <Box p={2}>
              <TabContext value={value}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <TabList
                    value={value}
                    onChange={(event, newValue) => setValue(newValue)}
                  >
                    <Tab label="Users" value="0" />
                    <Tab label="Mentorship Applications" value="1" />
                    <Tab label="Manage Matches" value="2" />
                    <Tab label="Manage Administrators" value="3" />
                  </TabList>
                  <Box flexGrow={1} />
                  <Button
                    color="primary"
                    onClick={() => navigate('/dashboard')}
                    startIcon={<UserIcon />}
                  >
                    Return to User Dashboard
                  </Button>
                </Stack>

                <TabPanel value="0">
                  <UserListView
                    usersList={userList}
                    title="User List"
                    subtitle={
                      'List of all users, including those without public profiles. You can start a chat with any user by clicking the chat button in their profile.'
                    }
                    listType="admin"
                    onStartChat={handleStartChat}
                    gridSize={3}
                  />
                </TabPanel>
                <TabPanel value="1">
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    justifyContent="space-between"
                    pb={2}
                  >
                    <Stack direction={'row'} spacing={0.75}>
                      <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel id="status-filter-label">Status</InputLabel>
                        <Select
                          labelId="status-filter-label"
                          id="status-filter"
                          label="Status"
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                        >
                          <MenuItem value="all">All</MenuItem>
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="approved">Approved</MenuItem>
                          <MenuItem value="rejected">Rejected</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel id="type-filter-label">Type</InputLabel>
                        <Select
                          labelId="type-filter-label"
                          id="type-filter"
                          label="Type"
                          value={typeFilter}
                          onChange={(e) => setTypeFilter(e.target.value)}
                        >
                          <MenuItem value="all">All</MenuItem>
                          <MenuItem value="Mentor">Mentor</MenuItem>
                          <MenuItem value="Mentee">Mentee</MenuItem>
                          <MenuItem value="Combined">Combined</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                    <Button
                      onClick={fetchApplications}
                      variant="contained"
                      startIcon={<ReloadIcon />}
                    >
                      Reload Applications
                    </Button>
                  </Stack>

                  {loadingApplications ? (
                    <Stack spacing={2} alignItems="center">
                      <Box display="flex" justifyContent="center" p={3}>
                        <CircularProgress />
                      </Box>
                    </Stack>
                  ) : (
                    <Stack spacing={2}>
                      {filteredApplications.length === 0 ? (
                        <Typography variant="body1" textAlign="center" p={3}>
                          No applications found.
                        </Typography>
                      ) : (
                        filteredApplications.map((application) => (
                          <MentorshipApplicationCard
                            key={application.id + '-' + application.type}
                            application={application}
                            onReview={handleReviewApplication}
                            onStatusUpdate={handleApplicationStatusUpdate}
                            status={application.status}
                          />
                        ))
                      )}
                    </Stack>
                  )}
                </TabPanel>
                {/* Keep Manage Matches mounted and just hide/show it */}
                <Box
                  role="tabpanel"
                  hidden={value !== '2'}
                  id="tabpanel-2"
                  aria-labelledby="tab-2"
                >
                  <ManageMatchesSection
                    mentorshipPairs={mentorshipPairs}
                    fetchPairs={fetchPairs}
                  />
                </Box>
                <TabPanel value="3">
                  <ManageAdminsSection userList={userList} />
                </TabPanel>
              </TabContext>
            </Box>
          </Card>
          <ChatDrawer
            open={toggleChat}
            onOpen={() => setToggleChat(true)}
            onClose={() => setToggleChat(false)}
            selectedChatRoomId={selectedChatRoomId}
            setSelectedChatRoomId={setSelectedChatRoomId}
          />
        </Stack>
      </Box>

      {renderApplicationDialog()}
    </>
  )
}

export default AdminDashboard
