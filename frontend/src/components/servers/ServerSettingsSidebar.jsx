import { useState, useEffect, useRef } from "react";
import { useAppState } from "../../context/AppStateContext";
import serverApi from "../../api/servers";
import { useToast } from "../../context/ToastContext";
import { useServers } from "../../hooks/useServers";

import InviteCreatePanel from "../invites/InviteCreatePanel";
import InviteListPanel from "../invites/InviteListPanel";

export default function ServerSettingsSidebar() {
    const {
        selectedServer,
        setSelectedServer,
        setSelectedChannel,
        serverSettingsOpen,
        setServerSettingsOpen,
    } = useAppState();

    const { loadServers } = useServers();
    const toast = useToast();
    const inviteListRef = useRef();

    if (!serverSettingsOpen || !selectedServer) return null;

   
    const [tab, setTab] = useState("overview");

    
    const [serverName, setServerName] = useState(selectedServer.serverName);
    const [iconUrl, setIconUrl] = useState(selectedServer.iconUrl || "");

    useEffect(() => {
        setServerName(selectedServer.serverName);
        setIconUrl(selectedServer.iconUrl || "");
        setTab("overview");
    }, [selectedServer]);

  
    const save = async () => {
        try {
            await serverApi.updateServer(selectedServer.serverGuid, {
                serverGuid: selectedServer.serverGuid,
                serverName,
                iconUrl: iconUrl || null,
            });

            toast.show("success", "Server updated.");
            await loadServers();
        } catch {
            toast.show("error", "Failed to update server.");
        }
    };

    const deleteServer = async () => {
        try {
            await serverApi.deleteServer(selectedServer.serverGuid);

            toast.show("success", "Server deleted.");

            await loadServers();
            setSelectedServer(null);
            setSelectedChannel(null);
            setServerSettingsOpen(false);
        } catch {
            toast.show("error", "Failed to delete server.");
        }
    };

    const leaveServer = async () => {
        try {
            await serverApi.leaveServer(selectedServer.serverGuid);

            toast.show("success", `Left ${selectedServer.serverName}`);

            setSelectedServer(null);
            setSelectedChannel(null);
            setServerSettingsOpen(false);

            await loadServers();
        } catch {
            toast.show("error", "Failed to leave server.");
        }
    };

    return (
        <div style={container}>
          
            <div style={tabs}>
                <Tab label="Overview" active={tab === "overview"} onClick={() => setTab("overview")} />
                <Tab label="Roles" active={tab === "roles"} onClick={() => setTab("roles")} />
                <Tab label="Invites" active={tab === "invites"} onClick={() => setTab("invites")} />
                <Tab label="Danger Zone" active={tab === "danger"} onClick={() => setTab("danger")} />

                <div style={{ flex: 1 }} />

                <button style={exitBtn} onClick={() => setServerSettingsOpen(false)}>
                    Exit
                </button>
            </div>

           
            <div style={panel}>
                {tab === "overview" && (
                    <>
                        <h2>Overview</h2>

                        <label>Server Name</label>
                        <input
                            value={serverName}
                            onChange={(e) => setServerName(e.target.value)}
                            style={input}
                        />

                        <label>Icon URL</label>
                        <input
                            value={iconUrl}
                            onChange={(e) => setIconUrl(e.target.value)}
                            style={input}
                        />

                        <button style={primaryBtn} onClick={save}>
                            Save Changes
                        </button>
                    </>
                )}

                {tab === "roles" && (
                    <div>
                        <h2>Roles</h2>
                        <p style={{ opacity: 0.7 }}>Roles UI not implemented yet.</p>
                    </div>
                )}

                {tab === "invites" && (
                    <div>
                        <InviteCreatePanel
                            serverGuid={selectedServer.serverGuid}
                            onCreated={() => inviteListRef.current?.reload()}
                        />

                        <InviteListPanel
                            serverGuid={selectedServer.serverGuid}
                            innerRef={inviteListRef}
                        />
                    </div>
                )}

                {tab === "danger" && (
                    <>
                        <h2>Danger Zone</h2>

                        <button style={dangerBtn} onClick={deleteServer}>
                            Delete Server
                        </button>

                        <button style={warnBtn} onClick={leaveServer}>
                            Leave Server
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}


function Tab({ label, active, onClick }) {
    return (
        <div
            onClick={onClick}
            style={{
                padding: "12px 16px",
                cursor: "pointer",
                background: active ? "#3a3c43" : "transparent",
                color: active ? "white" : "#b9bbbe",
                borderRadius: 4,
                marginBottom: 6,
                fontWeight: active ? 600 : 400,
            }}
        >
            {label}
        </div>
    );
}

const container = {
    display: "flex",
    width: 500,
    height: "100%",
    background: "#2f3136",
    color: "white",
    borderLeft: "1px solid #111",
};

const tabs = {
    width: 150,
    padding: 15,
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid #111",
    background: "#202225",
};

const panel = {
    flex: 1,
    padding: 20,
    overflowY: "auto",
};

const input = {
    width: "100%",
    padding: 10,
    marginTop: 5,
    marginBottom: 20,
    background: "#1e1f22",
    border: "1px solid #333",
    borderRadius: 5,
    color: "white",
};

const primaryBtn = {
    width: "100%",
    padding: 12,
    borderRadius: 5,
    border: "none",
    cursor: "pointer",
    background: "#5865f2",
    color: "white",
    marginTop: 10,
};

const dangerBtn = {
    width: "100%",
    padding: 12,
    background: "#ed4245",
    borderRadius: 5,
    border: "none",
    cursor: "pointer",
    color: "white",
    marginBottom: 10,
};

const warnBtn = {
    width: "100%",
    padding: 12,
    background: "#faa61a",
    borderRadius: 5,
    border: "none",
    cursor: "pointer",
    color: "white",
};

const exitBtn = {
    padding: 12,
    marginTop: 10,
    width: "100%",
    background: "#ed4245",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    color: "white",
    fontWeight: 700,
    fontSize: 14,
};
