import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { deletePatient } from "../../services/patientService";
import { db } from "../../api/firebaseConfig";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import PatientForm from "../../components/patients/PatientForm";
import "./PatientList.css";

const RECENT_KEY = "patient_recent_searches";
const MAX_RECENT = 5;
const GENDER_TAGS = ["All", "Male", "Female", "Other"];

function PatientList() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [showRecent, setShowRecent] = useState(false);
  const searchRef = useRef(null);

  /* ── ⚡ REAL-TIME LISTENER: The "Firebase Way" ⚡ ── */
  useEffect(() => {
    const doctorId = session?.user?.id;
    if (!doctorId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const patientsRef = collection(db, "patients");
    const q = query(
      patientsRef,
      where("doctor_id", "==", doctorId),
      orderBy("created_at", "desc")
    );

    // This listener will trigger automatically whenever a patient is added, edited, or deleted
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Handle potential delay in server timestamps
        created_at: doc.data().created_at?.toDate?.() || doc.data().created_at || new Date()
      }));
      setPatients(data);
      setIsLoading(false);
    }, (error) => {
      console.error("Real-time listener error:", error);
      setIsLoading(false);
      // Note: If you see an "Index required" error in the console, 
      // click the link provided there to create it.
    });

    return () => unsubscribe();
  }, [session]);

  /* ── close recent panel on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowRecent(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const commitSearch = (term) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const updated = [trimmed, ...prev.filter((r) => r !== trimmed)].slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      commitSearch(searchQuery);
      setShowRecent(false);
    }
    if (e.key === "Escape") setShowRecent(false);
  };

  const applyRecent = (term) => {
    setSearchQuery(term);
    setShowRecent(false);
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_KEY);
  };

  const handleDelete = async (patientId) => {
    if (window.confirm("Are you sure you want to delete this patient and all their records?")) {
      const doctorId = session?.user?.id;
      const { error } = await deletePatient(patientId, doctorId);
      if (error) {
        alert(error.message);
      }
      // Note: No need to call fetchPatients here! onSnapshot handles it.
    }
  };

  const handleSavePatient = () => {
    setIsFormOpen(false);
    setEditingPatient(null);
    // Note: No need to call fetchPatients here! onSnapshot handles it.
  };

  const openEditForm = (patient) => {
    setEditingPatient(patient);
    setIsFormOpen(true);
  };

  /* ── filter logic ── */
  const filteredPatients = patients.filter((p) => {
    const matchesName = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGender =
      genderFilter === "All" ||
      (p.gender || "").toLowerCase() === genderFilter.toLowerCase();
    return matchesName && matchesGender;
  });

  return (
    <div className="patient-list-container">
      {/* ── Page header ── */}
      <div className="patient-header">
        <h1>My Patients</h1>
        <button className="btn-primary" onClick={() => setIsFormOpen(true)}>
          + Add New Patient
        </button>
      </div>

      {/* ── Search panel ── */}
      <div className="search-panel">
        <div className="search-panel-inner">
          <h4 className="search-panel-title">Find a Patient</h4>

          {/* Input row */}
          <div className="search-input-wrap" ref={searchRef}>
            <span className="si-icon">&#128269;</span>
            <input
              id="patient-search-input"
              type="text"
              className="si-input"
              placeholder="Search by patient name…"
              value={searchQuery}
              autoComplete="off"
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowRecent(true);
              }}
              onFocus={() => setShowRecent(true)}
              onKeyDown={handleSearchKeyDown}
              onBlur={() => setTimeout(() => setShowRecent(false), 150)}
            />
            {searchQuery && (
              <button
                className="si-clear"
                onClick={() => { setSearchQuery(""); setShowRecent(false); }}
                aria-label="Clear search"
              >
                &#10005;
              </button>
            )}

            {/* Recent dropdown */}
            {showRecent && recentSearches.length > 0 && (
              <div className="recent-dropdown">
                <div className="recent-dropdown-header">
                  <span>Recent Searches</span>
                  <button className="recent-clear-all" onClick={clearRecent}>
                    Clear all
                  </button>
                </div>
                {recentSearches.map((term) => (
                  <div
                    key={term}
                    className="recent-item"
                    onMouseDown={() => applyRecent(term)}
                  >
                    <span className="recent-clock">&#128337;</span>
                    {term}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gender tag pills */}
          <div className="search-tags">
            {GENDER_TAGS.map((tag) => (
              <button
                key={tag}
                className={`tag${genderFilter === tag ? " tag--active" : ""}`}
                onClick={() => setGenderFilter(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      {isLoading ? (
        <p className="loading-text">Loading patients…</p>
      ) : patients.length === 0 ? (
        <div className="no-patients">
          <p>No patients found. Add your first patient to get started.</p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="no-patients">
          <p>
            No patients match&nbsp;<strong>&ldquo;{searchQuery}&rdquo;</strong>
            {genderFilter !== "All" && <> with gender <strong>{genderFilter}</strong></>}.
          </p>
        </div>
      ) : (
        <div className="patient-grid">
          {filteredPatients.map((patient) => (
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