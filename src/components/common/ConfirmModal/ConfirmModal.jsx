import React, { useEffect } from 'react';
import './ConfirmModal.css';
import warningIcon from '../../../assets/icons/warning.svg';
import infoIcon from '../../../assets/icons/info.svg';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message = "This action cannot be undone.", 
  confirmText = "Delete", 
  cancelText = "Cancel",
  type = "danger" 
}) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle"></div>
        <div className="modal-content">
          <div className={`modal-icon-container ${type}`}>
            <img 
              src={type === 'danger' ? warningIcon : infoIcon} 
              alt={type} 
              width="48" 
              height="48" 
            />
          </div>
          <h3 className="modal-title">{title}</h3>
          <p className="modal-message">{message}</p>
        </div>
        <div className="modal-actions">
          <button className="modal-btn modal-btn-cancel" onClick={onClose}>
            {cancelText}
          </button>
          <button 
            className={`modal-btn modal-btn-confirm ${type}`} 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
