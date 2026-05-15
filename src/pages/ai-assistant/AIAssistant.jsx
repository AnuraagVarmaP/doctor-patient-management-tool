import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../api/firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { analyzeSymptoms, getAvailableModels } from "../../services/aiService";
import { createVisit } from "../../services/visitService";
import aiDoctorIcon from "../../assets/icons/ai-medical-doctor.svg";
import "./AIAssistant.css";

function AIAssistant() {
  const { session } = useAuth();
  
  const [symptoms, setSymptoms] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [isSpecialtySet, setIsSpecialtySet] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const doctorId = session?.user?.id;
    if (!doctorId) return;

    const patientsRef = collection(db, "patients");
    const q = query(patientsRef, where("doctor_id", "==", doctorId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name
      }));
      // Sort alphabetically for the dropdown
      data.sort((a, b) => a.name.localeCompare(b.name));
      setPatients(data);
    }, (error) => {
      console.error("Error fetching patients for AI dropdown:", error);
    });

    return () => unsubscribe();
  }, [session]);

  useEffect(() => {
    const fetchModels = async () => {
      const models = await getAvailableModels();
      setAvailableModels(models);
      if (models.length > 0 && !models.includes(selectedModel)) {
        setSelectedModel(models[0]);
      }
    };
    fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      setError("Please enter some symptoms to analyze.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setSaveMessage("");

    try {
      const result = await analyzeSymptoms(symptoms, selectedModel, specialty);
      setAnalysis(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToPatient = async () => {
    if (!selectedPatientId || !analysis) return;
    
    setIsSaving(true);
    setSaveMessage("");

    try {
      const visitData = {
        doctor_id: session.user.id,
        patient_id: selectedPatientId,
        visit_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        diagnosis: `[AI Predicted] ${analysis.summary}\n\nPossible Issues: ${analysis.possibleIssues.join(", ")}`,
        prescription: `[AI Suggested Medications] ${(analysis.possibleMedications || []).join(", ")}`,
        notes: `[AI Health Suggestions] ${analysis.healthSuggestions.join("\n")}\n\nOriginal Symptoms Input: ${symptoms}`,
      };

      const { error } = await createVisit(visitData);
      
      if (error) {
        throw error;
      }
      
      setSaveMessage("Analysis successfully saved to patient's visit history.");
      // Reset dropdown
      setSelectedPatientId("");
    } catch (err) {
      console.error("Error saving visit:", err);
      setError("Failed to save to patient. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isSpecialtySet) {
    return (
      <div className="ai-container setup-mode">
        <div className="ai-setup-card">
          <div className="ai-setup-icon">
            <img src={aiDoctorIcon} alt="AI Assistant" width="80" height="80" />
          </div>
          <h2>Welcome to AI Assistant</h2>
          <p>Please enter your medical specialization so the AI can perfectly tailor its analysis, medications, and insights to your clinical focus.</p>
          
          <div className="setup-input-group">
            <input 
              type="text"
              className="specialty-input-large"
              placeholder="e.g., General Practitioner, Cardiologist"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && specialty.trim()) setIsSpecialtySet(true);
              }}
              autoFocus
            />
            <button 
              className="btn-primary setup-btn" 
              onClick={() => setIsSpecialtySet(true)}
              disabled={!specialty.trim()}
            >
              Continue to Assistant
            </button>
          </div>
          
          <div className="quick-specialties">
             <span onClick={() => { setSpecialty("General Practitioner"); setIsSpecialtySet(true); }}>General Practitioner</span>
             <span onClick={() => { setSpecialty("Cardiologist"); setIsSpecialtySet(true); }}>Cardiologist</span>
             <span onClick={() => { setSpecialty("Pediatrician"); setIsSpecialtySet(true); }}>Pediatrician</span>
             <span onClick={() => { setSpecialty("Dermatologist"); setIsSpecialtySet(true); }}>Dermatologist</span>
             <span onClick={() => { setSpecialty("Neurologist"); setIsSpecialtySet(true); }}>Neurologist</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-container">
      <div className="ai-header">
        <h1>AI Symptom Checker</h1>
        <p>Enter patient symptoms to get AI-powered insights, predictions, and specialist recommendations.</p>
      </div>

      <div className="ai-content">
        {/* Results Section (Top) */}
        <div className="ai-results-container">
          {analysis ? (
            <div className="ai-results-section">
              <h2>Analysis Results</h2>
              
              <div className="ai-result-card summary-card">
                <h3>Clinical Summary</h3>
                <p>{analysis.summary}</p>
              </div>

              <div className="ai-result-grid">
                <div className="ai-result-card">
                  <h3>Possible Issues</h3>
                  <ul>
                    {analysis.possibleIssues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>

                <div className="ai-result-card">
                  <h3>Possible Medications</h3>
                  <ul>
                    {(analysis.possibleMedications || []).map((medication, idx) => (
                      <li key={idx}>{medication}</li>
                    ))}
                  </ul>
                </div>

                <div className="ai-result-card full-width">
                  <h3>Health Suggestions</h3>
                  <ul>
                    {analysis.healthSuggestions.map((suggestion, idx) => (
                      <li key={idx}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="ai-save-section">
                <h3>Save to Patient History</h3>
                <div className="save-controls">
                  <select 
                    className="patient-select"
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                  >
                    <option value="">-- Select a Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <button 
                    className="btn-secondary" 
                    onClick={handleSaveToPatient}
                    disabled={isSaving || !selectedPatientId}
                  >
                    {isSaving ? "Saving..." : "Save to Record"}
                  </button>
                </div>
                {saveMessage && <div className="ai-success">{saveMessage}</div>}
              </div>
            </div>
          ) : (
            <div className="ai-placeholder">
              <p>Type the patient's symptoms below to generate an AI analysis.</p>
            </div>
          )}
        </div>

        {/* Input Section (Bottom) */}
        <div className="ai-input-section">
          
          <div className="ai-input-header">
            <select 
              id="ai-model" 
              className="model-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {availableModels.length === 0 ? (
                <option value="gemini-2.5-flash">Loading models...</option>
              ) : (
                availableModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))
              )}
            </select>

            <input 
              type="text"
              className="model-select"
              placeholder="Your Specialty (e.g. Cardiologist)"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              title="Tailor AI responses to your medical specialty"
            />
          </div>

          <div className="ai-input-body">
            <textarea
              id="symptoms"
              className="ai-textarea"
              placeholder="Type patient symptoms here..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={2}
            />
            
            <button 
              className="btn-primary ai-analyze-btn" 
              onClick={handleAnalyze}
              disabled={isLoading || !symptoms.trim()}
            >
              {isLoading ? "..." : "Analyze"}
            </button>
          </div>

          {error && <div className="ai-error">{error}</div>}
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;
