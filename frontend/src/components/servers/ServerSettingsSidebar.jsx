import { useState, useEffect, useRef } from "react";
import { useAppState } from "../../context/AppStateContext";
import { useAuth } from "../../context/AuthContext";
import { useOverlay } from "../../context/OverlayContext";
import { useServerActions } from "../../hooks/useServerActions";
import "./ServerStyles.css";

import RolesPanel from "../roles/RolesPanel";
import UsersPanel from "../members/UsersPanel";
import InviteCreatePanel from "../invites/InviteCreatePanel";
import InviteListPanel from "../invites/InviteListPanel";
import { getServerIconSrc } from "../../utils/serverIcon";
import BanList from "../members/BanList";

export default function ServerSettingsSidebar() {
    const {
        selectedServer,
        serverSettingsOpen,
        setServerSettingsOpen,
    } = useAppState();
    const { user } = useAuth();

    const { openOverlay } = useOverlay();
    const {
        updateServerDetails,
        deleteServer: deleteServerAction,
        leaveServer: leaveServerAction
    } = useServerActions();
    const inviteListRef = useRef();

    if (!serverSettingsOpen || !selectedServer) return null;
    const [tab, setTab] = useState("overview");
    const permissions = selectedServer?.permissions || [];
    const ownerGuid = selectedServer?.ownerGuid ?? selectedServer?.OwnerGuid;
    const isOwner = ownerGuid && user?.userGuid && ownerGuid === user.userGuid;
    const canBan = permissions.includes("BAN_MEMBERS");
    const canManageServer = permissions.includes("MANAGE_SERVER");
    const canManageRoles = permissions.includes("MANAGE_ROLES");
    const canInvite = permissions.includes("CREATE_INVITES");
    const canManageUsers = canManageRoles;
    const [serverName, setServerName] = useState(selectedServer.serverName);
    const [iconKey, setIconKey] = useState(selectedServer.iconKey || "");
    const [iconFile, setIconFile] = useState(null);
    const [iconPreview, setIconPreview] = useState(null);
    const iconSrc = getServerIconSrc({ serverGuid: selectedServer.serverGuid, iconKey });
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!selectedServer?.serverGuid) return;
        setServerName(selectedServer.serverName);
        setIconKey(selectedServer.iconKey || "");
        setIconFile(null);
        setIconPreview(null);
        setTab("overview");
    }, [selectedServer?.serverGuid]);

    useEffect(() => {
        if (!selectedServer) return;
        setServerName(selectedServer.serverName);
        setIconKey(selectedServer.iconKey || "");
    }, [selectedServer?.serverName, selectedServer?.iconKey]);

    const save = async () => {
        const result = await updateServerDetails({
            server: selectedServer,
            serverName,
            iconFile,
            iconKey
        });

        if (!result) return;

        if (result.iconKey !== undefined) {
            setIconKey(result.iconKey || "");
        }

        if (iconFile) {
            setIconFile(null);
            setIconPreview(null);
        }
    };

    const deleteServer = async () => {
        await deleteServerAction(selectedServer);
    };

    const leaveServer = async () => {
        await leaveServerAction(selectedServer);
    };

    return (
        <div className="server-settings-container">
            <div className="server-settings-tabs">
                {canManageServer && <Tab label="Overview" active={tab === "overview"} onClick={() => setTab("overview")} />}
                {canManageRoles && <Tab label="Roles" active={tab === "roles"} onClick={() => setTab("roles")} />}
                {canManageUsers && <Tab label="Manage Users" active={tab === "manageUsers"} onClick={() => setTab("manageUsers")} />}
                {canInvite && <Tab label="Invites" active={tab === "invites"} onClick={() => setTab("invites")} />}
                {canBan && <Tab label="Bans" active={tab === "bans"} onClick={() => setTab("bans")} />}
                <Tab label="Danger Zone" active={tab === "danger"} onClick={() => setTab("danger")} />

                <div className="server-settings-spacer" />

                <button className="server-settings-btn exit" onClick={() => setServerSettingsOpen(false)}>
                    Exit
                </button>
            </div>

            <div className="server-settings-panel">
                {tab === "overview" && canManageServer && (
                    <>
                        <h2>Overview</h2>

                        <label>Server Name</label>
                        <input
                            value={serverName}
                            onChange={(e) => setServerName(e.target.value)}
                            className="server-settings-input"
                        />

                        <label>Icon</label>
                        <div className="server-settings-icon-row">
                            <div className="server-settings-icon-thumb">
                                {(iconPreview || iconSrc) ? (
                                    <img src={iconPreview || iconSrc} alt="Server icon" />
                                ) : null}
                            </div>
                            <button
                                className="server-settings-btn primary server-settings-upload-btn"
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
                            className="server-settings-file-input"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setIconFile(file);
                                const url = URL.createObjectURL(file);
                                setIconPreview(url);
                            }}
                        />

                        <button className="server-settings-btn primary" onClick={save}>Save Changes</button>
                    </>
                )}

                {tab === "roles" && canManageRoles &&(
                    <RolesPanel serverId={selectedServer.serverGuid} />
                )}

                {tab === "manageUsers" && canManageUsers && (
                    <UsersPanel serverId={selectedServer.serverGuid} />
                )}

                {tab === "invites" && canInvite && (
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

                        {isOwner && (
                            <button
                                className="server-settings-btn danger"
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
                        )}
                        <button
                            className="server-settings-btn warn"
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
            className={`server-settings-tab${active ? " active" : ""}`}
        >
            {label}
        </div>
    );
}
