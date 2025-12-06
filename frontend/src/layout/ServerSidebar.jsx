import { useState } from "react";
import { useServers } from "../hooks/useServers";
import { useAppState } from "../context/AppStateContext";
import { useOverlay } from "../context/OverlayContext";

import ServerActionModal from "../components/servers/ServerActionModal";
import CreateServerModal from "../components/servers/CreateServerModal";
import JoinServerModal from "../components/servers/JoinServerModal";

export default function ServerSidebar() {
    const { servers, loadServers } = useServers();
    const { selectedServer, setSelectedServer, setSelectedChannel } = useAppState();
    const { openOverlay } = useOverlay();

    const [actionOpen, setActionOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [joinOpen, setJoinOpen] = useState(false);

    return (
        <div style={{ width: 80, background: "#202225", padding: 10 }}>
            <div onClick={() => setActionOpen(true)} style={icon}>
                +
            </div>

            {servers.map((s) => (
                <div
                    key={s.serverGuid}
                    style={{
                        ...icon,
                        background:
                            selectedServer?.serverGuid === s.serverGuid
                                ? "#5865f2"
                                : "#2f3136"
                    }}
                    onClick={() => {
                        setSelectedServer(s);
                        setSelectedChannel(null);
                    }}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openOverlay("server-menu", {
                            id: s.serverGuid,
                            server: s,
                            x: e.clientX,
                            y: e.clientY
                        });
                    }}
                >
                    {s.serverName[0]}
                </div>
            ))}

            {actionOpen && (
                <ServerActionModal
                    onClose={() => setActionOpen(false)}
                    onCreate={() => {
                        setActionOpen(false);
                        setCreateOpen(true);
                    }}
                    onJoin={() => {
                        setActionOpen(false);
                        setJoinOpen(true);
                    }}
                />
            )}

            {createOpen && (
                <CreateServerModal
                    onClose={() => setCreateOpen(false)}
                    onCreated={loadServers}
                />
            )}

            {joinOpen && (
                <JoinServerModal
                    onClose={() => setJoinOpen(false)}
                    onJoined={loadServers}
                />
            )}
        </div>
    );
}

const icon = {
    width: 50,
    height: 50,
    margin: "10px auto",
    background: "#2f3136",
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    fontSize: 24
};
