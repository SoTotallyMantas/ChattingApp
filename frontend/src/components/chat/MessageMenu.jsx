import { useOverlay } from "../../context/OverlayContext";

export default function MessageMenu({
    id,
    message,
    x,
    y,
    deleteMessage,
    canEdit = true,
    canDelete = true,
    startReply
}) {
    const { openOverlay, closeOverlay } = useOverlay();

    return (
        <div
            data-overlay-root="true"
            className="message-menu"
            style={{ top: y, left: x }}
        >
            <MenuItem
                label="Reply"
                onClick={() => {
                    if (startReply && message) startReply(message);
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
            className={`channel-row${danger ? " channel-row--danger" : ""}`}
        >
            {label}
        </div>
    );
}
