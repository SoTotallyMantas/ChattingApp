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

          
            <div className="toast-stack">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`toast ${t.type === "error" ? "toast--error" : "toast--success"}`}
                    >
                        {t.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);
