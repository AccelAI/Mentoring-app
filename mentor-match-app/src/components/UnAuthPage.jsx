import { Navigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";

const UnAuthPage = ({ children }) => {
  const { user } = useUser();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default UnAuthPage;
