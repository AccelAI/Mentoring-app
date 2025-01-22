import React from 'react'
import './App.css'
import {
  BrowserRouter,
  Navigate,
  Route,
  Router,
  Routes,
  Outlet
} from 'react-router-dom'
import { ThemeContextProvider } from './hooks/useTheme'
import Dashboard from './pages/Dashboard'
import MenteeForm from './pages/MenteeForm'
import MentorForm from './pages/MentorForm'
import MentorMenteeForm from './pages/MentorMenteeForm'
import UserProfile from './pages/UserProfile'
import Login from './pages/Login'
import GetStarted from './pages/GetStarted'
import Signup from './pages/Signup'
import ProfileSettings from './pages/ProfileSettings'
import { CssBaseline } from '@mui/material'
import UnAuthPage from './components/UnAuthPage'
import AuthPage from './components/AuthPage'
import { UserProvider } from './hooks/useUser'

function App() {
  return (
    <UserProvider>
      <ThemeContextProvider>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route
              element={
                <UnAuthPage>
                  <Outlet />
                </UnAuthPage>
              }
            >
              <Route path="/login" element={<Login />} />
            </Route>
            <Route path="/signup" element={<Signup />} />
            <Route
              element={
                <AuthPage>
                  <Outlet />
                </AuthPage>
              }
            >
              <Route path="/get-started" element={<GetStarted />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/mentee-form" element={<MenteeForm />} />
              <Route path="/mentor-form" element={<MentorForm />} />
              <Route
                path="/mentor-mentee-form"
                element={<MentorMenteeForm />}
              />
              <Route path="/profile-settings" element={<ProfileSettings />} />
            </Route>
            <Route path="/profile/:id" element={<UserProfile />} />
          </Routes>
        </BrowserRouter>
      </ThemeContextProvider>
    </UserProvider>
  )
}

export default App
