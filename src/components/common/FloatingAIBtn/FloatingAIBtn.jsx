import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import aiDoctorIcon from '../../../assets/icons/ai-medical-doctor.svg';
import './FloatingAIBtn.css';

function FloatingAIBtn() {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show the floating button if we are already on the AI Assistant page
  if (location.pathname === '/ai-assistant') {
    return null;
  }

  return (
    <button 
      className="floating-ai-btn" 
      onClick={() => navigate('/ai-assistant')}
      title="Open AI Assistant"
    >
      <img src={aiDoctorIcon} alt="AI Assistant" width="36" height="36" />
      <span className="ai-btn-text">ASK AI</span>
    </button>
  );
}

export default FloatingAIBtn;
