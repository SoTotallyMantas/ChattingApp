import { useOverlay } from "../../context/OverlayContext";
import { useMessages } from "../../context/MessagesContext";

export default function MessageMenu({ id, x, y, deleteMessage, canEdit = true, canDelete = true }) {
    const { openOverlay, closeOverlay } = useOverlay();
    const { startReply, messages } = useMessages();
    const target = messages?.find(m => m.messageGuid === id);

    return (
        <div
            data-overlay-root="true"
            style={{
                position: "fixed",
                top: y,
                left: x,
                background: "var(--bg-secondary)",
                border: `1px solid var(--border-color)`,
                borderRadius: 6,
                padding: "6px 0",
                width: 170,
                zIndex: 999999,
                boxShadow: "0 4px 14px rgba(0,0,0,0.45)",
                userSelect: "none",
            }}
        >
            <MenuItem
                label="Reply"
                onClick={() => {
                    if (target) {
                        startReply(target);
                    }
                    closeOverlay();
                }}
            />
            {canEdit && (
                <MenuItem
                    label="Edit"
                    onClick={() => {
                        closeOverlay();
                        openOverlay("edit-message", { id });
                    }}
                />
            )}

            {canDelete && (
                <MenuItem
                    label="Delete"
                    danger
                    onClick={() => {
                        closeOverlay();

                        openOverlay("delete-message", { id, deleteMessage });
                    }}
                />
            )}
        </div>
    );
}

function MenuItem({ label, onClick, danger }) {
    return (
        <div
            onClick={onClick}
            style={{
                padding: "8px 12px",
                fontSize: 14,
                cursor: "pointer",
                color: danger ? "#ff4f4f" : "var(--text-primary)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
            {label}
        </div>
    );
}
