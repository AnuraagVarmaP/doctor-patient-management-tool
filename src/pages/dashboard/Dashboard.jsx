import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPatients } from "../../services/patientService";
import { useAuth } from "../../context/AuthContext";
import "./Dashboard.css";

function Dashboard() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [patientCount, setPatientCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      const doctorId = session?.user?.id;
      if (doctorId) {
        const { data, error } = await getPatients(doctorId);
        if (!error && data) {
          setPatientCount(data.length);
        }
      }
      setIsLoading(false);
    };

    fetchStats();
  }, [session]);

  const doctorEmail = session?.user?.email;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome Back, Doctor</h1>
        <p>{doctorEmail}</p>
      </div>

      {isLoading ? (
        <p>Loading dashboard...</p>
      ) : (
        <>
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>{patientCount}</h3>
              <p>Total Registered Patients</p>
            </div>
          </div>

          <div className="dashboard-actions">
            <div className="action-card">
              <h2>Patient Directory</h2>
              <p>View your complete list of patients, check their detailed visit history, and manage their information.</p>
              <button onClick={() => navigate("/patients")}>View All Patients</button>
            </div>
            <div className="action-card">
              <h2>Recent Records</h2>
              <p>Easily access patient details to add new diagnoses, prescriptions, and notes from today's visits.</p>
              <button onClick={() => navigate("/patients")}>Manage Records</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;