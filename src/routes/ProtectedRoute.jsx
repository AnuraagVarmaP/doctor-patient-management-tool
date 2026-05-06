import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { session } = useAuth();

  if (!session) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;