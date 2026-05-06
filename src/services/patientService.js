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

export const getPatients = async (doctorId) => {
  try {
    const patientsRef = collection(db, "patients");
    const q = query(
      patientsRef, 
      where("doctor_id", "==", doctorId),
      orderBy("created_at", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate?.() || doc.data().created_at
    }));
    
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching patients:", error);
    return { data: null, error };
  }
};

export const getPatientById = async (id, doctorId) => {
  try {
    const docRef = doc(db, "patients", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists() && docSnap.data().doctor_id === doctorId) {
      return { data: { id: docSnap.id, ...docSnap.data() }, error: null };
    }
    return { data: null, error: { message: "Patient not found" } };
  } catch (error) {
    return { data: null, error };
  }
};

export const createPatient = async (patientData) => {
  try {
    // Generate ID locally for instant response
    const patientsRef = collection(db, "patients");
    const newDocRef = doc(patientsRef);
    const id = newDocRef.id;

    const dataToSave = {
      ...patientData,
      id: id,
      created_at: serverTimestamp()
    };

    await setDoc(newDocRef, dataToSave);
    
    return { 
      data: [dataToSave], 
      error: null 
    };
  } catch (error) {
    console.error("Create patient error:", error);
    return { data: null, error };
  }
};

export const updatePatient = async (id, doctorId, patientData) => {
  try {
    const docRef = doc(db, "patients", id);
    // Use updateDoc for targeted updates
    await updateDoc(docRef, {
      ...patientData,
      updated_at: serverTimestamp()
    });
    
    return { 
      data: [{ id, ...patientData }], 
      error: null 
    };
  } catch (error) {
    return { data: null, error };
  }
};

export const deletePatient = async (id, doctorId) => {
  try {
    const docRef = doc(db, "patients", id);
    await deleteDoc(docRef);
    return { error: null };
  } catch (error) {
    return { error };
  }
};
