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
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0,0,0,0.6)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 500,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}  
                style={{
                    background: "var(--modal-bg)",
                    padding: 20,
                    borderRadius: 8,
                    minWidth: 350,
                    color: "var(--text-primary)",
                    boxShadow: "0 0 20px rgba(0,0,0,0.4)",
                    border: "1px solid var(--border-color)",
                }}
            >
                {children}
            </div>
        </div>
    );
}
