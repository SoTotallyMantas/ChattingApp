import { useMemo, useRef } from "react";
import { useMediaState } from "../../context/MediaContext";
import { useAuth } from "../../context/AuthContext";
import { useOverlay } from "../../context/OverlayContext";
import { getAvatarSrc } from "../../utils/avatar";
import MicrophoneIcon from "../icons/MicrophoneIcon";
import MicrophoneOffIcon from "../icons/MicrophoneOffIcon";
import DeafenedIcon from "../icons/DeafenedIcon";
import NonDeafenedIcon from "../icons/NonDeafenedIcon";
import SettingsIcon from "../icons/SettingsIcon";

export default function UserVoiceFooter({
    compact = false
}) {
    const {
        joinedChannel,
        myState,
        muteMic,
        unmuteMic,
        deafen,
        undeafen,
        leaveVoice
    } = useMediaState();
    const { user } = useAuth();
    const { openOverlay } = useOverlay();
    const profileBtnRef = useRef(null);

    const initials = useMemo(() => {
        const name = user?.displayName || user?.userName || "Me";
        return name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map(part => part[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    }, [user]);

    const avatarUrl = getAvatarSrc(user);

    const ring = myState?.isDeaf ? "#fbbf24" :
        myState?.micMuted ? "#f87171" :
            myState?.isSpeaking ? "#4ade80" :
                "var(--border-color)";

    const Controls = (
        <>
            <button
                style={iconBtn(compact)}
                title={myState?.micMuted ? "Unmute" : "Mute"}
                aria-label={myState?.micMuted ? "Unmute microphone" : "Mute microphone"}
                onClick={myState?.micMuted ? unmuteMic : muteMic}
            >
                {myState?.micMuted ? <MicrophoneOffIcon /> : <MicrophoneIcon />}
            </button>
            <button
                style={iconBtn(compact)}
                title={myState?.isDeaf ? "Undeafen" : "Deafen"}
                aria-label={myState?.isDeaf ? "Undeafen audio" : "Deafen audio"}
                onClick={myState?.isDeaf ? undeafen : deafen}
            >
                {myState?.isDeaf ? <DeafenedIcon /> : <NonDeafenedIcon />}
            </button>
            {!compact && (
                <button
                    ref={profileBtnRef}
                    style={iconBtn(compact)}
                    title="User settings"
                    aria-label="Open user settings"
                    onClick={() => {
                        const rect = profileBtnRef.current?.getBoundingClientRect();
                        openOverlay("user-profile", {
                            user,
                            x: rect ? rect.left : 0,
                            y: rect ? rect.bottom + 4 : 0
                        });
                    }}
                >
                    <SettingsIcon size={18} />
                </button>
            )}
        </>
    );

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: compact ? 4 : 10,
                padding: compact ? "8px 4px" : "12px",
                background: "var(--bg-secondary)",
                borderTop: `1px solid var(--border-color)`,
                borderLeft: compact ? "none" : undefined,
                flexShrink: 0,
                flexDirection: compact ? "column" : "row",
                justifyContent: compact ? "center" : "space-between"
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                    style={{
                        width: compact ? 34 : 40,
                        height: compact ? 34 : 40,
                        borderRadius: "50%",
                        border: `2px solid ${ring}`,
                        background: avatarUrl ? "transparent" : "var(--bg-tertiary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--text-primary)",
                        fontWeight: 700,
                        fontSize: compact ? 10 : 13,
                        flexShrink: 0,
                        overflow: "hidden"
                    }}
                >
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={user?.displayName || user?.userName || "User avatar"}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    ) : (
                        initials
                    )}
                </div>
                {!compact && (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>
                            {user?.displayName || user?.userName || "Unknown"}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                            {joinedChannel ? "In voice" : ""}
                        </div>
                    </div>
                )}
            </div>

            {compact ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
                    {Controls}
                </div>
            ) : (
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {Controls}
                </div>
            )}
        </div>
    );
}

const btn = (compact) => ({
    padding: compact ? "4px 6px" : "6px 10px",
    borderRadius: 6,
    border: `1px solid var(--border-color)`,
    background: "var(--bg-tertiary)",
    color: "var(--text-primary)",
    cursor: "pointer",
    fontSize: compact ? 10 : 12,
    width: compact ? "100%" : "auto"
});

const iconBtn = (compact) => ({
    width: compact ? 32 : 38,
    height: compact ? 32 : 38,
    borderRadius: 10,
    border: `1px solid var(--border-color)`,
    background: "var(--bg-tertiary)",
    color: "var(--text-primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0
});
