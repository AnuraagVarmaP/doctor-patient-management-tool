import { db } from "../api/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const getDoctorProfile = async (id) => {
  try {
    const docRef = doc(db, "doctors", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { data: { id: docSnap.id, ...docSnap.data() }, error: null };
    } else {
      return { data: null, error: null };
    }
  } catch (error) {
    console.error("getDoctorProfile thrown error:", error);
    return { data: null, error };
  }
};

export const upsertDoctorProfile = async (profileData) => {
  try {
    const { id, ...data } = profileData;
    const docRef = doc(db, "doctors", id);
    
    // Check if it exists to decide between setDoc (new) or updateDoc (existing)
    // Actually setDoc with merge: true acts like an upsert
    await setDoc(docRef, data, { merge: true });
    
    const updatedSnap = await getDoc(docRef);
    return { data: { id: updatedSnap.id, ...updatedSnap.data() }, error: null };
  } catch (error) {
    console.error("upsertDoctorProfile thrown error:", error);
    return { data: null, error };
  }
};
