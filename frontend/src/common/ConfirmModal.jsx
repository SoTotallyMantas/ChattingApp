import { useState } from "react";
import { useOverlay } from "../context/OverlayContext";
import Modal from "./Modal";

export default function ConfirmModal({
    title = "Are you sure?",
    message,
    confirmLabel = "Yes",
    cancelLabel = "No",
    onConfirm,
    inputLabel,
    inputPlaceholder = "",
    inputRequired = false,
    inputMultiline = false,
    inputDefaultValue = "",
    inputType = "text"
}) {
    const { closeOverlay } = useOverlay();
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState(inputDefaultValue);
    const showInput = Boolean(inputLabel || inputPlaceholder);
    const trimmedValue = inputValue.trim();
    const disableConfirm = loading || (showInput && inputRequired && trimmedValue.length === 0);

    const handleConfirm = async () => {
        if (disableConfirm) return;
        setLoading(true);
        try {
            await onConfirm?.(showInput ? inputValue : undefined);
        } finally {
            setLoading(false);
            closeOverlay();
        }
    };

    return (
        <Modal onClose={closeOverlay}>
            <h2>{title}</h2>
            {message && <p>{message}</p>}
            {showInput && (
                <div className="confirm-modal-input">
                    {inputLabel && (
                        <label className="confirm-modal-input-label">
                            {inputLabel}
                        </label>
                    )}
                    {inputMultiline ? (
                        <textarea
                            className="input "
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={inputPlaceholder}
                            rows={3}
                        />
                    ) : (
                        <input
                            className="input "
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={inputPlaceholder}
                            type={inputType}
                        />
                    )}
                </div>
            )}

            <div className="confirm-modal-actions">
                <button
                    type="button"
                    onClick={closeOverlay}
                    className="button"
                    disabled={loading}
                >
                    {cancelLabel}
                </button>
                <button
                    type="button"
                    onClick={handleConfirm}
                    className="button"
                    disabled={disableConfirm}
                >
                    {loading ? "Working..." : confirmLabel}
                </button>
            </div>
        </Modal>
    );
}
