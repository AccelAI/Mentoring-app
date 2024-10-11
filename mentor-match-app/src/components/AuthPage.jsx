import { Navigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { LinearProgress } from "@mui/material";

const AuthPage = ({ children }) => {
  const { user, loading } = useUser();
  if (loading) {
    return <LinearProgress />; // Show a loading indicator while checking authentication
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AuthPage;
