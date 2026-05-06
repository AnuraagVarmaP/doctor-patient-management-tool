import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../api/supabaseClient";
import { getDoctorProfile } from "../services/doctorService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        setSession(session);

        if (session?.user?.id) {
          try {
            const { data } = await getDoctorProfile(session.user.id);
            setDoctorProfile(data || null);
          } catch (profileError) {
            console.error("Failed to fetch doctor profile:", profileError);
            setDoctorProfile(null);
          }
        } else {
          setDoctorProfile(null);
        }
      } catch (sessionError) {
        console.error("Failed to fetch session:", sessionError);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionAndProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user?.id) {
          try {
            const { data } = await getDoctorProfile(session.user.id);
            setDoctorProfile(data || null);
          } catch (err) {
            console.error("Failed on auth change profile fetch:", err);
            setDoctorProfile(null);
          }
        } else {
          setDoctorProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 30-minute inactivity session timeout
  useEffect(() => {
    let timeoutId;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      if (session) {
        timeoutId = setTimeout(() => {
          supabase.auth.signOut();
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