import logo from "./logo.svg";
import "./App.css";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import MenteeForm from "./pages/MenteeForm";
import MentorForm from "./pages/MentorForm";
import MentorMenteeForm from "./pages/MentorMenteeForm";
import UserProfile from "./pages/UserProfile";
import Login from "./pages/Login";
import GetStarted from "./pages/GetStarted";
import Signup from "./pages/Signup";
import ProfileSettings from "./pages/ProfileSettings";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/get-started" element={<GetStarted />} />
      <Route path="/mentee-form" element={<MenteeForm />} />
      <Route path="/mentor-form" element={<MentorForm />} />
      <Route path="/mentor-mentee-form" element={<MentorMenteeForm />} />
      <Route path="/profile/:id" element={<UserProfile />} />
      <Route path="/profile-settings" element={<ProfileSettings />} />
    </Routes>
  );
}

export default App;
