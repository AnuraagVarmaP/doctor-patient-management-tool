import { db } from "../api/firebaseConfig";
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from "firebase/firestore";

export const getVisitsByPatient = async (patientId, doctorId) => {
  try {
    const visitsRef = collection(db, "visits");
    const q = query(
      visitsRef, 
      where("patient_id", "==", patientId),
      where("doctor_id", "==", doctorId),
      orderBy("visit_date", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching visits:", error);
    return { data: null, error };
  }
};

export const createVisit = async (visitData) => {
  try {
    // 🔥 INSTANT SAVE FIX: Generate ID locally
    const visitsRef = collection(db, "visits");
    const newDocRef = doc(visitsRef);
    const id = newDocRef.id;

    const dataToSave = {
      ...visitData,
      id: id,
      created_at: serverTimestamp()
    };

    await setDoc(newDocRef, dataToSave);
    
    return { 
      data: [dataToSave], 
      error: null 
    };
  } catch (error) {
    console.error("Create visit error:", error);
    return { data: null, error };
  }
};

export const updateVisit = async (id, doctorId, visitData) => {
  try {
    const docRef = doc(db, "visits", id);
    await updateDoc(docRef, visitData);
    
    return { 
      data: [{ id, ...visitData }], 
      error: null 
    };
  } catch (error) {
    return { data: null, error };
  }
};

export const deleteVisit = async (id, doctorId) => {
  try {
    const docRef = doc(db, "visits", id);
    await deleteDoc(docRef);
    return { error: null };
  } catch (error) {
    return { error };
  }
};
