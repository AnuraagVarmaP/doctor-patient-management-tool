import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();

  // Still checking auth — don't redirect yet
  if (loading) return null;

  if (!session) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;