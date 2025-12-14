import { useMediaState } from "../../context/MediaContext";
import VoiceMiniAvatar from "./VoiceMiniAvatar";
import { useOverlay } from "../../context/OverlayContext";
import UserActionsMenu from "../users/UserActionsMenu";

export default function VoiceUserList({ channelGuid, openOverlay, style }) {
    const { joinedChannel, users } = useMediaState();
    const { openOverlay: showOverlay, closeOverlay } = useOverlay();

    if (!joinedChannel || (channelGuid && joinedChannel !== channelGuid)) return null;

    return (
        <div
            style={{
                marginLeft: 10,
                marginTop: 6,
                display: "flex",
                flexDirection: "column",
                gap: 6,
                ...style
            }}
        >
            {users.length === 0 && (
                <div style={{ color: "var(--text-secondary)", fontSize: 12, padding: "4px 0" }}>
                    No one in voice
                </div>
            )}

            {users.map((u) => (
                <UserEntry
                    key={u.userGuid}
                    user={u}
                    openOverlay={openOverlay}
                    showOverlay={showOverlay}
                    closeOverlay={closeOverlay}
                />
            ))}
        </div>
    );
}

function UserEntry({ user, openOverlay, showOverlay, closeOverlay }) {
    const speakingRing = user.isSpeaking ? `2px solid var(--accent)` : `2px solid var(--border-color)`;
    const baseBg = "var(--bg-tertiary)";

    return (
        <div
            data-user={user.userGuid}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 8px",
                borderRadius: 8,
                background: baseBg,
                cursor: "pointer",
                transition: "background 120ms ease"
            }}
            onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                showOverlay?.("user-actions", {
                    component: (
                        <UserActionsMenu
                            user={user}
                            canKick={false}
                            canBan={false}
                            x={e.clientX}
                            y={e.clientY}
                            onAction={() => {
                                closeOverlay?.();
                            }}
                        />
                    )
                });
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = baseBg)}
            onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                showOverlay?.("user-actions", {
                    component: (
                        <UserActionsMenu
                            user={user}
                            canKick={false}
                            canBan={false}
                            x={rect.left + 10}
                            y={rect.bottom + 4}
                            onAction={() => closeOverlay?.()}
                        />
                    )
                });
            }}
        >
            <VoiceMiniAvatar
                user={user}
                onClick={(e) => {
                    e.stopPropagation();
                    openOverlay?.("user-profile", {
                        user,
                        x: e.clientX,
                        y: e.clientY
                    });
                }}
                style={{
                    width: 32,
                    height: 32,
                    border: speakingRing,
                    transition: "border 120ms ease"
                }}
            />

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                    {user.displayName || user.userName || "Unknown"}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", gap: 6 }}>
                    {user.isMuted && <span>🔇</span>}
                    {user.isDeafened && <span>🔕</span>}
                </div>
            </div>
        </div>
    );
}
