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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Normalize Firebase user to match the app's expected session structure
        const normalizedSession = {
          user: {
            id: user.uid,
            email: user.email,
          }
        };
        setSession(normalizedSession);

        try {
          const { data } = await getDoctorProfile(user.uid);
          setDoctorProfile(data || null);
        } catch (profileError) {
          console.error("Failed to fetch doctor profile:", profileError);
          setDoctorProfile(null);
        }
      } else {
        setSession(null);
        setDoctorProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
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