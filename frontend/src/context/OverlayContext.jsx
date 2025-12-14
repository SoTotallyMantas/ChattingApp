import { createContext, useContext, useState, useEffect } from "react";
import ConfirmModal from "../common/ConfirmModal";

const OverlayContext = createContext(null);

export function OverlayProvider({ children }) {
    const [overlay, setOverlay] = useState(null);

    const openOverlay = (type, payload) => setOverlay({ type, payload });
    const closeOverlay = () => setOverlay(null);

    useEffect(() => {
        if (!overlay) return;

        
        const handleMouseDown = (e) => {
            
            if (!e.target.closest("[data-overlay-root='true']")) {
                closeOverlay();
            }
        };

      
        const handleEsc = (e) => {
            if (e.key === "Escape") {
                closeOverlay();
            }
        };

        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("keydown", handleEsc);

        
        return () => {
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("keydown", handleEsc);
        };
    }, [overlay]); 

    const renderOverlay = () => {
        if (!overlay) return null;
        if (overlay.payload?.component) return overlay.payload.component;
        if (overlay.type === "confirm") {
            return <ConfirmModal closeOverlay={closeOverlay} {...(overlay.payload || {})} />;
        }
        return null;
    };

    return (
        <OverlayContext.Provider value={{ overlay, openOverlay, closeOverlay }}>
            {children}
            {renderOverlay()}
        </OverlayContext.Provider>
    );
}

export function useOverlay() {
    return useContext(OverlayContext);
}
