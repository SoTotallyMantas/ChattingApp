import { useOverlay } from "../../context/OverlayContext";
import { useAppState } from "../../context/AppStateContext";
import serverApi from "../../api/servers";
import { useToast } from "../../context/ToastContext";

export default function ServerContextMenu() {
    const { overlay, closeOverlay, openOverlay } = useOverlay();
    const {
        selectedServer,
        setSelectedServer,
        setServerSettingsOpen
    } = useAppState();
    const toast = useToast();

   

    if (!overlay || overlay.type !== "server-menu") return null;

    const { x, y, server } = overlay.payload;

    const openSettings = () => {
        setSelectedServer(server);
        setServerSettingsOpen(true);
        closeOverlay();
    };

    const leaveServer = async () => {
        try {
            await serverApi.leaveServer(server.serverGuid);
            toast.show("success", `Left ${server.serverName}`);

            if (selectedServer?.serverGuid === server.serverGuid) {
                setSelectedServer(null);
            }
        } catch {
            toast.show("error", "Failed to leave server.");
        } finally {
            closeOverlay();
        }
    };

    const confirmLeave = () => {
        openOverlay("confirm", {
            title: "Leave Server",
            message: `Leave "${server.serverName}"?`,
            confirmLabel: "Yes, leave",
            cancelLabel: "Stay",
            variant: "danger",
            onConfirm: leaveServer
        });
    };

    return (
        <div
            data-overlay-root="true"
            onMouseDown={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.stopPropagation()}
            style={{
                position: "fixed",
                top: y,
                left: x,
                background: "var(--bg-secondary)",
                border: `1px solid var(--border-color)`,
                borderRadius: 10,
                padding: 8,
                width: 220,
                zIndex: 99999,
                boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
                backdropFilter: "blur(8px)",
            }}
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
            style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                cursor: "pointer",
                color: danger ? "var(--danger)" : "var(--text-primary)",
                transition: "background 120ms ease, color 120ms ease",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--bg-tertiary)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
            }}
        >
            <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
        </div>
    );
}
