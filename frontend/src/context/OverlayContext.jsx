import { createContext, useContext, useState, useEffect } from "react";

const OverlayContext = createContext(null);

export function OverlayProvider({ children }) {
    const [overlay, setOverlay] = useState(null);

    const openOverlay = (type, payload) => {
        setOverlay({ type, payload });
    };

    const closeOverlay = () => setOverlay(null);

    useEffect(() => {
        console.log("OVERLAY STATE >", overlay);
    }, [overlay]);

    useEffect(() => {
        if (!overlay) return;

        const handleMouseDown = (e) => {
            const inside = e.target.closest("[data-overlay-root='true']");
            if (inside) return;
            closeOverlay();
        };

        window.addEventListener("mousedown", handleMouseDown);
        return () => window.removeEventListener("mousedown", handleMouseDown);
    }, [overlay]);

    return (
        <OverlayContext.Provider value={{ overlay, openOverlay, closeOverlay }}>
            {children}
        </OverlayContext.Provider>
    );
}

export function useOverlay() {
    return useContext(OverlayContext);
}
