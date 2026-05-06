import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { deleteVisit } from "../../services/visitService";
import { db } from "../../api/firebaseConfig";
import { doc, collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import VisitForm from "../../components/visits/VisitForm";
import "./PatientDetails.css";

function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();

  const [patient, setPatient] = useState(null);
  const [visits, setVisits] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const [isVisitFormOpen, setIsVisitFormOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState(null);

  /* ── ⚡ ROBUST REAL-TIME LISTENERS ⚡ ── */
  useEffect(() => {
    const doctorId = session?.user?.id;
    if (!doctorId || !id) {
      setIsInitialLoading(false);
      return;
    }

    setIsInitialLoading(true);
    setIsSyncing(true);

    // 1. Listen to Patient Data
    const patientRef = doc(db, "patients", id);
    const unsubPatient = onSnapshot(patientRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.doctor_id === doctorId) {
          setPatient({ id: docSnap.id, ...data });
        } else {
          console.error("Access denied to patient profile");
          navigate("/patients");
        }
      } else {
        console.error("Patient document not found in Firestore");
        navigate("/patients");
      }
      setIsInitialLoading(false);
      setIsSyncing(false);
    }, (error) => {
      console.error("Patient profile listener error:", error);
      setIsInitialLoading(false);
    });

    // 2. Listen to Visits
    const visitsRef = collection(db, "visits");
    const q = query(
      visitsRef,
      where("patient_id", "==", id),
      where("doctor_id", "==", doctorId),
      orderBy("visit_date", "desc")
    );

    const unsubVisits = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVisits(data);
      setIsInitialLoading(false);
      setIsSyncing(false);
    }, (error) => {
      // CRITICAL: If you see a "Query requires an index" error here, 
      // check your browser console and click the link to create it!
      console.error("Visits list listener error:", error);
      if (error.code === 'failed-precondition') {
        console.warn("TIP: This query likely needs a Firestore Index. Check the link above.");
      }
      setIsInitialLoading(false);
    });

    return () => {
      unsubPatient();
      unsubVisits();
    };
  }, [id, session, navigate]);

  const handleDeleteVisit = async (visitId) => {
    if (window.confirm("Are you sure you want to delete this visit record?")) {
      const doctorId = session?.user?.id;
      const { error } = await deleteVisit(visitId, doctorId);
      if (error) {
        alert("Delete failed: " + error.message);
      }
    }
  };

  const handleSaveVisit = () => {
    setIsVisitFormOpen(false);
    setEditingVisit(null);
    // UI will update automatically via onSnapshot
  };

  const openEditVisitForm = (visit) => {
    setEditingVisit(visit);
    setIsVisitFormOpen(true);
  };

  if (isInitialLoading) {
    return (
      <div className="patient-details-container">
        <div className="loading-spinner-wrap">
          <p>Connecting to database...</p>
        </div>
      </div>
    );
  }

  if (!patient) return null;

  return (
    <div className="patient-details-container">
      <div className="patient-header">
        <button className="btn-secondary" onClick={() => navigate("/patients")}>
          &larr; Back to Patients
        </button>
        {isSyncing && <span className="sync-indicator">Syncing...</span>}
      </div>

      <div className="patient-info-card">
        <h2>{patient.name}</h2>
        <div className="patient-meta">
          <p><strong>Age:</strong> {patient.age || "N/A"}</p>
          <p><strong>Gender:</strong> {patient.gender || "N/A"}</p>
          <p><strong>Contact:</strong> {patient.contact_info || "N/A"}</p>
        </div>
        <p className="added-date">
          Member since: {patient.created_at ? new Date(patient.created_at?.toDate?.() || patient.created_at).toLocaleDateString() : "Just now"}
        </p>
      </div>

      <div className="visits-section">
        <div className="visits-header">
          <h3>Visit History</h3>
          <button className="btn-primary" onClick={() => setIsVisitFormOpen(true)}>
            + Add Visit Record
          </button>
        </div>

        {visits.length === 0 ? (
          <div className="no-visits">
            <p>No visit records found. Create the first record for this patient.</p>
          </div>
        ) : (
          <div className="visit-list">
            {visits.map((visit) => (
              <div key={visit.id} className="visit-card">
                <div className="visit-content">
                  <span className="visit-date">
                    {new Date(visit.visit_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  {visit.diagnosis && (
                    <div className="visit-detail">
                      <label>Diagnosis</label>
                      <p>{visit.diagnosis}</p>
                    </div>
                  )}
                  {visit.prescription && (
                    <div className="visit-detail">
                      <label>Prescription</label>
                      <p className="prescription-text">{visit.prescription}</p>
                    </div>
                  )}
                  {visit.notes && (
                    <div className="visit-detail">
                      <label>Notes</label>
                      <p className="notes-text">{visit.notes}</p>
                    </div>
                  )}
                </div>
                <div className="visit-actions">
                  <button className="btn-icon" onClick={() => openEditVisitForm(visit)} title="Edit">
                    Edit
                  </button>
                  <button className="btn-icon btn-danger-text" onClick={() => handleDeleteVisit(visit.id)} title="Delete">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isVisitFormOpen && (
        <VisitForm
          patientId={patient.id}
          existingVisit={editingVisit}
          onSave={handleSaveVisit}
          onCancel={() => {
            setIsVisitFormOpen(false);
            setEditingVisit(null);
          }}
        />
      )}
    </div>
  );
}

export default PatientDetails;
