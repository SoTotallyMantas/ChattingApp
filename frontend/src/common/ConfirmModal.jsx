import { useState } from "react";
import { useOverlay } from "../context/OverlayContext";

export default function ConfirmModal({
    title = "Are you sure?",
    message,
    confirmLabel = "Yes",
    cancelLabel = "No",
    onConfirm,
    variant = "danger"
}) {
    const { closeOverlay } = useOverlay();
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        if (loading) return;
        setLoading(true);
        try {
            await onConfirm?.();
        } finally {
            setLoading(false);
            closeOverlay();
        }
    };

    return (
        <div
            data-overlay-root="true"
            style={{
                width: 420,
                maxWidth: "90vw",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                padding: 24,
                borderRadius: 10,
                boxShadow: "0 12px 40px rgba(0,0,0,0.45)"
            }}
        >
            <h2 style={{ margin: "0 0 10px" }}>{title}</h2>
            {message && (
                <p style={{ color: "var(--text-secondary)", margin: "6px 0 18px" }}>
                    {message}
                </p>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                    type="button"
                    onClick={closeOverlay}
                    style={secondaryBtn}
                    disabled={loading}
                >
                    {cancelLabel}
                </button>
                <button
                    type="button"
                    onClick={handleConfirm}
                    style={variant === "danger" ? dangerBtn : primaryBtn}
                    disabled={loading}
                >
                    {loading ? "Working..." : confirmLabel}
                </button>
            </div>
        </div>
    );
}

const baseBtn = {
    padding: "10px 16px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    color: "white",
    minWidth: 90
};

const secondaryBtn = {
    ...baseBtn,
    background: "#4f535c"
};

const primaryBtn = {
    ...baseBtn,
    background: "#5865f2"
};

const dangerBtn = {
    ...baseBtn,
    background: "#ed4245",
    fontWeight: 600
};
