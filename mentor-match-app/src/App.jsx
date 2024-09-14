import React from "react";
import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeContextProvider } from "./hooks/useTheme";
import Dashboard from "./pages/Dashboard";
import MenteeForm from "./pages/MenteeForm";
import MentorForm from "./pages/MentorForm";
import MentorMenteeForm from "./pages/MentorMenteeForm";
import UserProfile from "./pages/UserProfile";
import Login from "./pages/Login";
import GetStarted from "./pages/GetStarted";
import Signup from "./pages/Signup";
import ProfileSettings from "./pages/ProfileSettings";
import { CssBaseline } from "@mui/material";

function App() {
  return (
    <ThemeContextProvider>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mentee-form" element={<MenteeForm />} />
          <Route path="/mentor-form" element={<MentorForm />} />
          <Route path="/mentor-mentee-form" element={<MentorMenteeForm />} />
          <Route path="/profile/:id" element={<UserProfile />} />
          <Route path="/profile-settings" element={<ProfileSettings />} />
        </Routes>
      </BrowserRouter>
    </ThemeContextProvider>
  );
}

export default App;
