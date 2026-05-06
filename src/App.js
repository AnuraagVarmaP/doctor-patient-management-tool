import AppRoutes from "./routes/AppRoutes";

import Navbar from "./components/layout/Navbar/Navbar";

import { useAuth } from "./context/AuthContext";

function App() {
  const { session } = useAuth();

  return (
    <>
      {session && <Navbar />}

      <AppRoutes />
    </>
  );
}

export default App;