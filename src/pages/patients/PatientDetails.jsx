import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPatientById } from "../../services/patientService";
import { getVisitsByPatient, deleteVisit } from "../../services/visitService";
import { useAuth } from "../../context/AuthContext";
import VisitForm from "../../components/visits/VisitForm";
import "./PatientDetails.css";

function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();

  const [patient, setPatient] = useState(null);
  const [visits, setVisits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isVisitFormOpen, setIsVisitFormOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState(null);

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    const doctorId = session?.user?.id;
    if (doctorId && id) {
      const [patientRes, visitsRes] = await Promise.all([
        getPatientById(id, doctorId),
        getVisitsByPatient(id, doctorId)
      ]);

      if (patientRes.error) {
        console.error("Error fetching patient:", patientRes.error);
        alert("Patient not found or access denied.");
        navigate("/patients");
      } else {
        setPatient(patientRes.data);
        setVisits(visitsRes.data || []);
      }
    }
    setIsLoading(false);
  }, [id, session, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteVisit = async (visitId) => {
    if (window.confirm("Are you sure you want to delete this visit record?")) {
      const doctorId = session?.user?.id;
      const { error } = await deleteVisit(visitId, doctorId);
      if (error) {
        alert(error.message);
      } else {
        fetchData();
      }
    }
  };

  const handleSaveVisit = (savedVisit) => {
    setIsVisitFormOpen(false);
    setEditingVisit(null);
    fetchData();
  };

  const openEditVisitForm = (visit) => {
    setEditingVisit(visit);
    setIsVisitFormOpen(true);
  };

  if (isLoading) return <div className="patient-details-container"><p>Loading...</p></div>;
  if (!patient) return null;

  return (
    <div className="patient-details-container">
      <div className="patient-header">
        <button className="btn-secondary" onClick={() => navigate("/patients")}>
          &larr; Back to Patients
        </button>
      </div>

      <div className="patient-info-card">
        <h2>{patient.name}</h2>
        <p><strong>Age:</strong> {patient.age || "N/A"}</p>
        <p><strong>Gender:</strong> {patient.gender || "N/A"}</p>
        <p><strong>Contact Info:</strong> {patient.contact_info || "N/A"}</p>
        <p><strong>Added On:</strong> {new Date(patient.created_at).toLocaleDateString()}</p>
      </div>

      <div className="visits-section">
        <div className="visits-header">
          <h3>Visit Records</h3>
          <button className="btn-primary" onClick={() => setIsVisitFormOpen(true)}>
            + Add Visit Record
          </button>
        </div>

        {visits.length === 0 ? (
          <div className="no-visits">
            <p>No visit records found for this patient.</p>
          </div>
        ) : (
          <div className="visit-list">
            {visits.map((visit) => (
              <div key={visit.id} className="visit-card">
                <div className="visit-content">
                  <h4>{new Date(visit.visit_date).toLocaleDateString()}</h4>
                  {visit.diagnosis && <p><strong>Diagnosis:</strong> {visit.diagnosis}</p>}
                  {visit.prescription && <p><strong>Prescription:</strong> {visit.prescription}</p>}
                  {visit.notes && <p><strong>Notes:</strong> {visit.notes}</p>}
                </div>
                <div className="visit-actions">
                  <button className="btn-secondary" onClick={() => openEditVisitForm(visit)}>
                    Edit
                  </button>
                  <button className="btn-danger" onClick={() => handleDeleteVisit(visit.id)}>
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
