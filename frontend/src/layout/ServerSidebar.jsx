import { useEffect } from "react";
import { useServers } from "../hooks/useServers";
import { useAppState } from "../context/AppStateContext";
import { useOverlay } from "../context/OverlayContext";
import DMIcon from "../components/icons/DMIcon";
import { getServerIconSrc } from "../utils/serverIcon";

export default function ServerSidebar() {
    const { servers, loadServers } = useServers();
    const { selectedServer, setSelectedServer, setSelectedChannel } = useAppState();
    const { openOverlay } = useOverlay();

    useEffect(() => {
        if (!selectedServer) return;
        if (selectedServer.isDirect) return;
        const match = servers.find((s) => s.serverGuid === selectedServer.serverGuid);
        if (!match) {
            setSelectedServer(null);
            return;
        }
        if (match !== selectedServer) {
            setSelectedServer(match);
        }
    }, [servers, selectedServer, setSelectedServer]);

    const openServerActionMenu = () => {
        openOverlay("server-action", {
            onCreate: () =>
                openOverlay("create-server", {
                    onCreated: async (created) => {
                        await loadServers();
                        if (created?.serverGuid) {
                            setSelectedChannel(null);
                            setSelectedServer(created);
                        }
                    }
                }),

            onJoin: () =>
                openOverlay("join-server", { onJoined: loadServers })
        });
    };

    return (
        <div className="server-sidebar">
            <div className="server-sidebar-list">
                <IconButton
                    onClick={() => setSelectedServer(null)}
                    icon={<DMIcon size={20} />}
                    label="Direct Messages"
                />

                <div
                    onClick={openServerActionMenu}
                    className="server-sidebar-icon"
                    title="Create / Join server"
                >
                    +
                </div>

                {servers.map((s) => {
                    const isSelected = selectedServer?.serverGuid === s.serverGuid;
                    const iconUrl = getServerIconSrc(s);
                    const serverClassName = [
                        "server-sidebar-icon",
                        "server-sidebar-icon--server",
                        isSelected ? "server-sidebar-icon--selected" : ""
                    ]
                        .filter(Boolean)
                        .join(" ");

                    return (
                        <div
                            key={s.serverGuid}
                            className={serverClassName}
                            onClick={() => {
                                setSelectedServer(s);
                            }}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                openOverlay("server-menu", {
                                    server: s,
                                    x: e.clientX,
                                    y: e.clientY
                                });
                            }}
                        >
                            {iconUrl ? (
                                <img
                                    src={iconUrl}
                                    alt={s.serverName}
                                    className="server-sidebar-icon-image"
                                />
                            ) : (
                                s.serverName[0]
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function IconButton({ onClick, icon, label }) {
    return (
        <button
            onClick={onClick}
            title={label}
            className="server-sidebar-action"
            type="button"
        >
            <div className="server-sidebar-action-icon">
                {icon}
            </div>
        </button>
    );
}
