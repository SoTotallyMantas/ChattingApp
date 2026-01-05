import { useOverlay } from "../../context/OverlayContext";
import { useAppState } from "../../context/AppStateContext";
import { useServerActions } from "../../hooks/useServerActions";
import "./ServerStyles.css";

export default function ServerContextMenu() {
    const { overlay, closeOverlay, openOverlay } = useOverlay();
    const { setSelectedServer, setServerSettingsOpen } = useAppState();
    const { leaveServer } = useServerActions();

    if (!overlay || overlay.type !== "server-menu") return null;

    const { x, y, server } = overlay.payload;

    const openSettings = () => {
        setSelectedServer(server);
        setServerSettingsOpen(true);
        closeOverlay();
    };

    const confirmLeave = () => {
        openOverlay("confirm", {
            title: "Leave Server",
            message: `Leave "${server.serverName}"?`,
            confirmLabel: "Yes, leave",
            cancelLabel: "Stay",
            variant: "danger",
            onConfirm: () => leaveServer(server)
        });
    };

    return (
        <div
            data-overlay-root="true"
            onMouseDown={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.stopPropagation()}
            className="server-context-menu"
            style={{ top: y, left: x }}
        >
            <MenuItem onClick={openSettings} label="Server Settings" />
            <MenuItem onClick={confirmLeave} label="Leave Server" danger />
        </div>
    );
}

function MenuItem({ label, onClick, danger }) {
    return (
        <div
            onClick={onClick}
            className={`server-menu-item${danger ? " danger" : ""}`}
        >
            <span className="server-menu-label">{label}</span>
        </div>
    );
}
