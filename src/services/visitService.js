import { db } from "../api/firebaseConfig";
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
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
    const dataWithTimestamp = {
      ...visitData,
      created_at: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, "visits"), dataWithTimestamp);
    const newDoc = await getDoc(docRef);
    return { data: [{ id: docRef.id, ...newDoc.data() }], error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const updateVisit = async (id, doctorId, visitData) => {
  try {
    const docRef = doc(db, "visits", id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists() || docSnap.data().doctor_id !== doctorId) {
      return { data: null, error: { message: "Unauthorized or visit not found" } };
    }
    
    await updateDoc(docRef, visitData);
    const updatedDoc = await getDoc(docRef);
    return { data: [{ id: docRef.id, ...updatedDoc.data() }], error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const deleteVisit = async (id, doctorId) => {
  try {
    const docRef = doc(db, "visits", id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists() || docSnap.data().doctor_id !== doctorId) {
      return { error: { message: "Unauthorized or visit not found" } };
    }
    
    await deleteDoc(docRef);
    return { error: null };
  } catch (error) {
    return { error };
  }
};
