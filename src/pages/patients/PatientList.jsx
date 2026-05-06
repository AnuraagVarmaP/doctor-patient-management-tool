import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPatients, deletePatient } from "../../services/patientService";
import { useAuth } from "../../context/AuthContext";
import PatientForm from "../../components/patients/PatientForm";
import "./PatientList.css";

function PatientList() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, [session]);

  const fetchPatients = async () => {
    setIsLoading(true);
    const doctorId = session?.user?.id;
    if (doctorId) {
      const { data, error } = await getPatients(doctorId);
      if (error) {
        console.error("Error fetching patients:", error);
      } else {
        setPatients(data || []);
      }
    }
    setIsLoading(false);
  };

  const handleDelete = async (patientId) => {
    if (window.confirm("Are you sure you want to delete this patient and all their records?")) {
      const doctorId = session?.user?.id;
      const { error } = await deletePatient(patientId, doctorId);
      if (error) {
        alert(error.message);
      } else {
        fetchPatients();
      }
    }
  };

  const handleSavePatient = (savedPatient) => {
    setIsFormOpen(false);
    setEditingPatient(null);
    fetchPatients();
  };

  const openEditForm = (patient) => {
    setEditingPatient(patient);
    setIsFormOpen(true);
  };

  return (
    <div className="patient-list-container">
      <div className="patient-header">
        <h1>My Patients</h1>
        <button className="btn-primary" onClick={() => setIsFormOpen(true)}>
          + Add New Patient
        </button>
      </div>

      {isLoading ? (
        <p>Loading patients...</p>
      ) : patients.length === 0 ? (
        <div className="no-patients">
          <p>No patients found. Add your first patient to get started.</p>
        </div>
      ) : (
        <div className="patient-grid">
          {patients.map((patient) => (
            <div key={patient.id} className="patient-card">
              <h3>{patient.name}</h3>
              <div className="patient-info">
                <p><strong>Age:</strong> {patient.age || "N/A"}</p>
                <p><strong>Gender:</strong> {patient.gender || "N/A"}</p>
                <p><strong>Contact:</strong> {patient.contact_info || "N/A"}</p>
              </div>
              <div className="patient-actions">
                <button className="btn-secondary" onClick={() => navigate(`/patients/${patient.id}`)}>
                  View Records
                </button>
                <button className="btn-secondary" onClick={() => openEditForm(patient)}>
                  Edit
                </button>
                <button className="btn-danger" onClick={() => handleDelete(patient.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <PatientForm
          existingPatient={editingPatient}
          onSave={handleSavePatient}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingPatient(null);
          }}
        />
      )}
    </div>
  );
}

export default PatientList;