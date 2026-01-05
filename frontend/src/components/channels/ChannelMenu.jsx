import { useOverlay } from "../../context/OverlayContext";

export default function ChannelMenu({ channel, x, y, updateChannel, deleteChannel, createChannel }) {
    const { openOverlay, closeOverlay } = useOverlay();

    return (
        <div
            data-overlay-root="true"
            style={{
                position: "fixed",
                top: y,
                left: x,
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: 6,
                padding: "6px 0",
                width: 180,
                zIndex: 999999,
                boxShadow: "0 4px 12px rgba(0,0,0,0.35)"
            }}
        >
            
            <MenuItem
                label="Edit Channel"
                onClick={() => {
                    closeOverlay();
                    openOverlay("edit-channel", { channel, updateChannel });
                }}
            />

           
            <MenuItem
                label="Delete Channel"
                danger
                onClick={() => {
                    closeOverlay();
                    openOverlay("delete-channel", { channel, deleteChannel });
                }}
            />

            <div style={{ borderBottom: "1px solid #333", margin: "6px 0" }} />

        
            <MenuItem
                label="Create Channel"
                onClick={() => {
                    closeOverlay();
                    openOverlay("create-channel", {
                        serverId: channel.serverGuid,
                        createChannel
                    });
                }}
            />

        
            <div
                style={{
                    marginTop: 4,
                    padding: "6px 10px",
                    fontSize: 12,
                    color: "#666",
                    textAlign: "center",
                    cursor: "pointer"
                }}
                onClick={closeOverlay}
            >
                Close
            </div>
        </div>
    );
}

function MenuItem({ label, onClick, danger = false }) {
    return (
        <div
            onClick={onClick}
            style={{
                padding: "8px 12px",
                cursor: "pointer",
                color: danger ? "#ff4d4d" : "var(--text-primary)",
                fontSize: 14,
                userSelect: "none"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
            {label}
        </div>
    );
}
