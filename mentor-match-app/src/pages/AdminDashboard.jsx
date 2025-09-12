import { useState, useCallback, useEffect } from 'react'
import {
  Box,
  Card,
  Stack,
  Typography,
  Tab,
  CircularProgress,
  Button
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
import { getPendingApplications } from '../api/forms'
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

  // Fetch pending applications
  useEffect(() => {
    const fetchApplications = async () => {
      console.log('fetching applications')
      setLoadingApplications(true)
      try {
        const apps = await getPendingApplications()
        console.log('apps', apps)
        setApplications(apps)
      } catch (error) {
        console.error('Error fetching applications:', error)
      } finally {
        setLoadingApplications(false)
      }
    }

    if (value === '1') {
      // Only fetch when on applications tab
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
    // Refresh applications after status update
    const fetchApplications = async () => {
      const apps = await getPendingApplications()
      setApplications(apps)
    }
    fetchApplications()
  }, [])

  // Render the appropriate dialog based on application type
  const renderApplicationDialog = () => {
    if (!selectedApplication) return null

    const { type } = selectedApplication
    const dialogProps = {
      open: dialogOpen,
      onClose: handleCloseDialog,
      application: selectedApplication,
      onStatusUpdate: handleApplicationStatusUpdate
    }

    switch (type) {
      case 'Mentee':
        return <MenteeApplicationDialog {...dialogProps} />
      case 'Mentor':
        return <MentorApplicationDialog {...dialogProps} />
      case 'Combined':
        return <CombinedApplicationDialog {...dialogProps} />
      default:
        return <MenteeApplicationDialog {...dialogProps} />
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
                  ) : applications.length === 0 ? (
                    <Typography variant="body1" textAlign="center" p={3}>
                      No pending applications found.
                    </Typography>
                  ) : (
                    <Stack spacing={2}>
                      {applications.map((application) => (
                        <MentorshipApplicationCard
                          key={application.id}
                          application={application}
                          onReview={handleReviewApplication}
                          onStatusUpdate={handleApplicationStatusUpdate}
                        />
                      ))}
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
