import { useState, useEffect, useRef } from "react";
import { useAppState } from "../../context/AppStateContext";
import serverApi from "../../api/servers";
import { useToast } from "../../context/ToastContext";
import { useServers } from "../../hooks/useServers";
import { useOverlay } from "../../context/OverlayContext";

import RolesPanel from "../roles/RolesPanel";
import UsersPanel from "../members/UsersPanel";
import InviteCreatePanel from "../invites/InviteCreatePanel";
import InviteListPanel from "../invites/InviteListPanel";
import { getServerIconSrc } from "../../utils/serverIcon";
import BanList from "../members/BanList";

export default function ServerSettingsSidebar() {
    const {
        selectedServer,
        setSelectedServer,
        setSelectedChannel,
        serverSettingsOpen,
        setServerSettingsOpen,
    } = useAppState();

    const { loadServers } = useServers();
    const { openOverlay } = useOverlay();
    const toast = useToast();
    const inviteListRef = useRef();

    if (!serverSettingsOpen || !selectedServer) return null;

    const [tab, setTab] = useState("overview");
    const permissions = selectedServer?.permissions || [];
    const canBan = permissions.includes("BAN_MEMBERS");

    const [serverName, setServerName] = useState(selectedServer.serverName);
    const [iconKey, setIconKey] = useState(selectedServer.iconKey || "");
    const [iconFile, setIconFile] = useState(null);
    const [iconPreview, setIconPreview] = useState(null);
    const iconSrc = getServerIconSrc({ serverGuid: selectedServer.serverGuid, iconKey });
    const fileInputRef = useRef(null);

    useEffect(() => {
        setServerName(selectedServer.serverName);
        setIconKey(selectedServer.iconKey || "");
        setIconFile(null);
        setIconPreview(null);
        setTab("overview");
    }, [selectedServer]);

    const save = async () => {
        try {
            let nextIconKey = iconKey;

            if (iconFile) {
                const res = await serverApi.uploadServerIcon(selectedServer.serverGuid, iconFile);
                const key = res.data?.iconKey;
                if (key) {
                    nextIconKey = key;
                    setIconKey(key);
                    setSelectedServer(prev => prev ? { ...prev, iconKey: key } : prev);
                    setIconFile(null);
                    setIconPreview(null);
                }
            }

            const updated = await serverApi.updateServer(selectedServer.serverGuid, {
                serverGuid: selectedServer.serverGuid,
                serverName,
                iconKey: nextIconKey || null,
            });

            toast.show("success", "Server updated.");
            await loadServers();
            setSelectedServer(updated.data ?? selectedServer);
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
                <Tab label="Manage Users" active={tab === "manageUsers"} onClick={() => setTab("manageUsers")} />
                <Tab label="Invites" active={tab === "invites"} onClick={() => setTab("invites")} />
                {canBan && <Tab label="Bans" active={tab === "bans"} onClick={() => setTab("bans")} />}
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

                        <label>Icon</label>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", background: "var(--bg-tertiary)" }}>
                                {(iconPreview || iconSrc) ? (
                                    <img src={iconPreview || iconSrc} alt="Server icon" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : null}
                            </div>
                            <button
                                style={primaryBtn}
                                onClick={() => fileInputRef.current?.click()}
                                type="button"
                            >
                                Upload Icon
                            </button>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setIconFile(file);
                                const url = URL.createObjectURL(file);
                                setIconPreview(url);
                            }}
                        />

                        <button style={primaryBtn} onClick={save}>Save Changes</button>
                    </>
                )}

                {tab === "roles" && (
                    <RolesPanel serverId={selectedServer.serverGuid} />
                )}

                {tab === "manageUsers" && (
                    <UsersPanel serverId={selectedServer.serverGuid} />
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

                {tab === "bans" && (
                    <BanList />
                )}

                {tab === "danger" && (
                    <>
                        <h2>Danger Zone</h2>

                        <button
                            style={dangerBtn}
                            onClick={() =>
                                openOverlay("confirm", {
                                    title: "Delete Server",
                                    message: `Delete "${selectedServer.serverName}"? This cannot be undone.`,
                                    confirmLabel: "Yes, delete",
                                    cancelLabel: "Cancel",
                                    variant: "danger",
                                    onConfirm: deleteServer
                                })
                            }
                        >
                            Delete Server
                        </button>
                        <button
                            style={warnBtn}
                            onClick={() =>
                                openOverlay("confirm", {
                                    title: "Leave Server",
                                    message: `Leave "${selectedServer.serverName}"?`,
                                    confirmLabel: "Yes, leave",
                                    cancelLabel: "Stay",
                                    variant: "danger",
                                    onConfirm: leaveServer
                                })
                            }
                        >
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
                background: active ? "var(--bg-tertiary)" : "transparent",
                color: active ? "var(--text-primary)" : "var(--text-secondary)",
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
    width: "100%",
    height: "95vh",
    background: "var(--bg-secondary)",
    color: "var(--text-primary)",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
};

const tabs = {
    width: 170,
    padding: 15,
    display: "flex",
    flexDirection: "column",
    borderRight: `1px solid var(--border-color)`,
    background: "var(--bg-secondary)",
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
    background: "var(--bg-tertiary)",
    border: `1px solid var(--border-color)`,
    borderRadius: 5,
    color: "var(--text-primary)",
};

const primaryBtn = {
    width: "100%",
    padding: 12,
    borderRadius: 5,
    border: "none",
    cursor: "pointer",
    background: "var(--accent)",
    color: "white",
    marginTop: 10,
};

const dangerBtn = {
    width: "100%",
    padding: 12,
    background: "var(--danger)",
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
