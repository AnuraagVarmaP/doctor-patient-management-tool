import AppRoutes from "./routes/AppRoutes";

import Navbar from "./components/layout/Navbar/Navbar";

import { useAuth } from "./context/AuthContext";

function App() {
  const { session } = useAuth();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {session && <Navbar />}

      <div style={{ flexGrow: 1 }}>
        <AppRoutes />
      </div>
      
    </div>
  );
}

export default App;