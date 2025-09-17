import { useState, useCallback, useEffect } from 'react'
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
import { TabList, TabPanel, TabContext } from '@mui/lab'
import Header from '../components/Header'
import { useUser } from '../hooks/useUser'
import UserListView from '../components/dashboard/UserListView'
import ChatDrawer from '../components/chat/ChatDrawer'
import MentorshipApplicationCard from '../components/adminDashboard/MentorshipApplicationCard'
import MenteeApplicationDialog from '../components/dialogs/formReview/MenteeApplicationDialog'
import MentorApplicationDialog from '../components/dialogs/formReview/MentorApplicationDialog'
import CombinedApplicationDialog from '../components/dialogs/formReview/CombinedApplicationDialog'
import { getAllApplications } from '../api/forms'
import { useNavigate } from 'react-router-dom'
import { Person as UserIcon } from '@mui/icons-material'
import ManageMatchesSection from '../components/adminDashboard/ManageMatchesSection'

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

  // Fetch all applications when Applications tab is active
  useEffect(() => {
    const fetchApplications = async () => {
      console.log('fetching applications (all statuses)')
      setLoadingApplications(true)
      try {
        const apps = await getAllApplications()
        console.log(apps)
        setApplications(apps)
      } catch (error) {
        console.error('Error fetching applications:', error)
      } finally {
        setLoadingApplications(false)
      }
    }

    if (value === '1') {
      fetchApplications()
    }
  }, [value])

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

  // Derive filtered list based on status
  const filteredApplications =
    statusFilter === 'all'
      ? applications
      : applications.filter((a) => a.status === statusFilter)

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
                  {loadingApplications ? (
                    <Box display="flex" justifyContent="center" p={3}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                          <InputLabel id="status-filter-label">
                            Status
                          </InputLabel>
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
                      </Stack>

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
                <TabPanel value="2">
                  <ManageMatchesSection />
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
