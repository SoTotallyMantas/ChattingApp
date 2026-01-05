import { useMemo, useRef } from "react";
import { useMediaState } from "../../context/MediaContext";
import { useAuth } from "../../context/AuthContext";
import { useOverlay } from "../../context/OverlayContext";
import { getAvatarSrc, getInitials} from "../../utils/avatar";
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
        const name = user?.displayName || user?.userName;
        return getInitials(name);
    }, [user]);

    const avatarUrl = getAvatarSrc(user);

    const avatarStateClass = myState?.isDeaf
        ? "voice-footer-avatar--deaf"
        : myState?.micMuted
            ? "voice-footer-avatar--muted"
            : myState?.isSpeaking
                ? "voice-footer-avatar--speaking"
                : "";

    const footerClassName = compact
        ? "voice-footer voice-footer--compact"
        : "voice-footer";

    const controlsClassName = compact
        ? "voice-footer-controls voice-footer-controls--compact"
        : "voice-footer-controls";

    const iconButtonClassName = compact
        ? "icon-button icon-button--sm"
        : "icon-button";

    const Controls = (
        <>
            <button
                className={iconButtonClassName}
                title={myState?.micMuted ? "Unmute" : "Mute"}
                aria-label={myState?.micMuted ? "Unmute microphone" : "Mute microphone"}
                onClick={myState?.micMuted ? unmuteMic : muteMic}
            >
                {myState?.micMuted ? <MicrophoneOffIcon /> : <MicrophoneIcon />}
            </button>
            <button
                className={iconButtonClassName}
                title={myState?.isDeaf ? "Undeafen" : "Deafen"}
                aria-label={myState?.isDeaf ? "Undeafen audio" : "Deafen audio"}
                onClick={myState?.isDeaf ? undeafen : deafen}
            >
                {myState?.isDeaf ? <DeafenedIcon /> : <NonDeafenedIcon />}
            </button>
            {!compact && (
                <button
                    ref={profileBtnRef}
                    className={iconButtonClassName}
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
            className={footerClassName}
        >
            <div className="voice-footer-user">
                <div className={`avatar avatar--md ${avatarStateClass}`}>
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={user?.displayName || user?.userName || "User avatar"}
                            className="avatar"
                        />
                    ) : (
                        initials
                    )}
                </div>
                {!compact && (
                    <div className="voice-footer-meta">
                        <div className="voice-footer-name">
                            {user?.displayName || user?.userName || "Unknown"}
                        </div>
                        <div className="voice-footer-status">
                            {joinedChannel ? "In voice" : ""}
                        </div>
                    </div>
                )}
            </div>

            {compact ? (
                <div className={controlsClassName}>
                    {Controls}
                </div>
            ) : (
                <div className={controlsClassName}>
                    {Controls}
                </div>
            )}
        </div>
    );
}
