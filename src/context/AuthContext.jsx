import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { auth, db } from "../api/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

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

    let unsubProfile = () => {};

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      clearTimeout(safetyTimeout);
      
      if (user) {
        const normalizedSession = {
          user: {
            id: user.uid,
            email: user.email,
          }
        };
        setSession(normalizedSession);
        // 🔥 REAL-TIME PROFILE LISTENER
        const profileRef = doc(db, "doctors", user.uid);
        unsubProfile = onSnapshot(profileRef, (docSnap) => {
          if (docSnap.exists()) {
            setDoctorProfile({ id: docSnap.id, ...docSnap.data() });
          } else {
            setDoctorProfile(null);
          }
          // Only stop loading once we have at least tried to get the profile
          setLoading(false);
        }, (err) => {
          console.error("Profile sync error:", err);
          setLoading(false);
        });
      } else {
        setSession(null);
        setDoctorProfile(null);
        setLoading(false);
        unsubProfile();
      }
    });

    return () => {
      unsubscribe();
      unsubProfile();
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
    // Redundant now that we have a real-time onSnapshot listener!
    // Keeping the function signature to avoid breaking components like Register.jsx
    return Promise.resolve();
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