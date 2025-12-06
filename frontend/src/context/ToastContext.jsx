import { createContext, useContext, useState } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const show = (type, message) => {
        const id = crypto.randomUUID();
        setToasts((prev) => [...prev, { id, type, message }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    };

    return (
        <ToastContext.Provider value={{ show }}>
            {children}

          
            <div
                style={{
                    position: "fixed",
                    bottom: 20,
                    left: 20,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    zIndex: 999,
                }}
            >
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        style={{
                            padding: "10px 16px",
                            borderRadius: 6,
                            background:
                                t.type === "error"
                                    ? "var(--danger)"
                                    : "var(--accent)",
                            color: "white",
                            fontWeight: 500,
                            boxShadow: "0 0 10px rgba(0,0,0,0.3)",
                        }}
                    >
                        {t.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);
