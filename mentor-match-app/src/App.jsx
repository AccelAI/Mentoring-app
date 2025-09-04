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
import CombinedForm from './pages/CombinedForm'
import Login from './pages/Login'
import GetStarted from './pages/GetStarted'
import Signup from './pages/Signup'
import { CssBaseline } from '@mui/material'
import UnAuthPage from './components/UnAuthPage'
import AuthPage from './components/AuthPage'
import { UserProvider } from './hooks/useUser'
import ErrorPage from './components/ErrorPage'
import AdminRoute from './components/AdminRoute'
import AdminDashboard from './pages/AdminDashboard'
import MentorPick from './pages/MentorPick'

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
              <Route path="/combined-form" element={<CombinedForm />} />
              <Route path="/mentee-form/:id" element={<MenteeForm />} />
              <Route path="/mentor-form/:id" element={<MentorForm />} />
              <Route path="/combined-form/:id" element={<CombinedForm />} />
              <Route
                path="/form-not-found"
                element={<ErrorPage>Couldn't find this form!</ErrorPage>}
              />
              <Route path="/mentor-pick" element={<MentorPick />} />
              <Route
                element={
                  <AdminRoute>
                    <Outlet />
                  </AdminRoute>
                }
              >
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeContextProvider>
    </UserProvider>
  )
}

export default App
