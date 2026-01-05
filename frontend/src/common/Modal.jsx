import React from "react";

export default function Modal({ children, onClose }) {
    const handleBackgroundClick = (e) => {
        if (e.target === e.currentTarget) { 
            onClose();
        }
    };

    return (
        <div
            data-overlay-root="true"
            onClick={handleBackgroundClick}  
            className="modal-backdrop"
        >
            <div
                onClick={(e) => e.stopPropagation()}  
                className="modal-content"
            >
                {children}
            </div>
        </div>
    );
}
