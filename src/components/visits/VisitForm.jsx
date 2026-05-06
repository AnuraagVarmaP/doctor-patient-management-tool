import React, { useState, useEffect } from "react";
import { createVisit, updateVisit } from "../../services/visitService";
import { useAuth } from "../../context/AuthContext";
import "../patients/PatientForm.css"; // Reuse the same modal styles

const VisitForm = ({ existingVisit, patientId, onSave, onCancel }) => {
  const { session } = useAuth();
  const [formData, setFormData] = useState({
    visit_date: new Date().toISOString().split("T")[0],
    diagnosis: "",
    prescription: "",
    notes: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (existingVisit) {
      setFormData({
        visit_date: existingVisit.visit_date ? new Date(existingVisit.visit_date).toISOString().split("T")[0] : "",
        diagnosis: existingVisit.diagnosis || "",
        prescription: existingVisit.prescription || "",
        notes: existingVisit.notes || "",
      });
    }
  }, [existingVisit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const doctorId = session?.user?.id;
    if (!doctorId) {
      setError("User not authenticated");
      setIsLoading(false);
      return;
    }

    const visitPayload = {
      ...formData,
      doctor_id: doctorId,
      patient_id: patientId,
    };

    let result;
    if (existingVisit) {
      result = await updateVisit(existingVisit.id, doctorId, visitPayload);
    } else {
      result = await createVisit(visitPayload);
    }

    setIsLoading(false);

    if (result.error) {
      setError(result.error.message);
    } else {
      onSave(result.data ? result.data[0] : null);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{existingVisit ? "Edit Visit Record" : "Add Visit Record"}</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Visit Date</label>
            <input
              type="date"
              name="visit_date"
              value={formData.visit_date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Diagnosis</label>
            <input
              type="text"
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Prescription</label>
            <textarea
              name="prescription"
              value={formData.prescription}
              onChange={handleChange}
              placeholder="Medications prescribed..."
            />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes..."
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VisitForm;
