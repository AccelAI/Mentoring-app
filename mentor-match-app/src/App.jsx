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
import Login from './pages/Login'
import GetStarted from './pages/GetStarted'
import Signup from './pages/Signup'
import { CssBaseline } from '@mui/material'
import UnAuthPage from './components/UnAuthPage'
import AuthPage from './components/AuthPage'
import { UserProvider } from './hooks/useUser'
import ErrorPage from './components/ErrorPage'
import MentorPick from './pages/MentorPick'
import RootHandler from './components/RootHandler'

function App() {
  return (
    <UserProvider>
      <ThemeContextProvider>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootHandler />} />
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
              <Route path="/mentee-form/:id" element={<MenteeForm />} />
              <Route path="/mentor-form/:id" element={<MentorForm />} />
              <Route
                path="/mentor-mentee-form/:id"
                element={<MentorMenteeForm />}
              />
              <Route
                path="/form-not-found"
                element={<ErrorPage>Couldn't find this form!</ErrorPage>}
              />
              <Route path="/mentor-pick" element={<MentorPick />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeContextProvider>
    </UserProvider>
  )
}

export default App
