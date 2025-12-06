import { useOverlay } from "../../context/OverlayContext";
import { useAppState } from "../../context/AppStateContext";
import serverApi from "../../api/servers";
import { useToast } from "../../context/ToastContext";

export default function ServerContextMenu() {
    const { overlay, closeOverlay } = useOverlay();
    const {
        selectedServer,
        setSelectedServer,
        setServerSettingsOpen
    } = useAppState();
    const toast = useToast();

    console.log("ServerContextMenu RENDER -> overlay =", overlay);

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
                borderRadius: 6,
                padding: "6px 0",
                width: 180,
                zIndex: 99999
            }}
        >
            <div className="menu-item" onClick={openSettings}>
                Server Settings
            </div>

            <div
                className="menu-item"
                style={{ color: "#faa61a" }}
                onClick={leaveServer}
            >
                Leave Server
            </div>
        </div>
    );
}
