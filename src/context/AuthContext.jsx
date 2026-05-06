import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { auth } from "../api/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getDoctorProfile } from "../services/doctorService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safety timeout: if auth takes more than 2s, stop loading anyway
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      clearTimeout(safetyTimeout);

      if (user) {
        const normalizedSession = {
          user: {
            id: user.uid,
            email: user.email,
          }
        };
        setSession(normalizedSession);

        setLoading(false);

        // Fetch profile silently in the background
        getDoctorProfile(user.uid)
          .then(({ data }) => {
            if (data) setDoctorProfile(data);
          })
          .catch((err) => console.error("Background profile fetch failed:", err));
      } else {
        setSession(null);
        setDoctorProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  // 30-minute inactivity session timeout
  useEffect(() => {
    let timeoutId;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      if (session) {
        timeoutId = setTimeout(() => {
          signOut(auth);
        }, 30 * 60 * 1000); // 30 minutes
      }
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
    };
  }, [session]);

  const refreshProfile = async () => {
    if (session?.user?.id) {
      try {
        const { data } = await getDoctorProfile(session.user.id);
        setDoctorProfile(data || null);
      } catch (err) {
        console.error("Refresh profile failed:", err);
      }
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '16px',
        color: '#64748b',
        fontFamily: 'sans-serif'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        doctorProfile,
        refreshProfile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);