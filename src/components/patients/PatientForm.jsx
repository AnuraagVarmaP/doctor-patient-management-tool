import React, { useState, useEffect } from "react";
import { createPatient, updatePatient } from "../../services/patientService";
import { useAuth } from "../../context/AuthContext";
import "./PatientForm.css"; // We'll add some basic styling

const PatientForm = ({ existingPatient, onSave, onCancel }) => {
  const { session } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    contact_info: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (existingPatient) {
      setFormData({
        name: existingPatient.name || "",
        age: existingPatient.age || "",
        gender: existingPatient.gender || "",
        contact_info: existingPatient.contact_info || "",
      });
    }
  }, [existingPatient]);

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

    const patientPayload = {
      ...formData,
      doctor_id: doctorId,
      age: formData.age ? parseInt(formData.age, 10) : null,
    };

    let result;
    if (existingPatient) {
      result = await updatePatient(existingPatient.id, doctorId, patientPayload);
    } else {
      result = await createPatient(patientPayload);
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
        <h2>{existingPatient ? "Edit Patient" : "Add Patient"}</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name <span className="required">*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Contact Info</label>
            <input
              type="text"
              name="contact_info"
              value={formData.contact_info}
              onChange={handleChange}
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

export default PatientForm;
