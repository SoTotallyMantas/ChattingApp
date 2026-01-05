import { getAvatarSrc } from "../../utils/avatar";

export default function VoiceMiniAvatar({ user, onClick, size = "md" }) {
    if (!user) return null;

    const {
        avatarKey,
        displayName,
        userGuid,

        isSpeaking
    } = user;

    const src = getAvatarSrc({ avatarKey, userGuid });

    const initial = (displayName || userGuid || "?")
        .trim()
        .substring(0, 2)
        .toUpperCase();

    const avatarClassName = [
        "avatar",
        size === "sm" ? "avatar--sm" : "avatar--md",
        isSpeaking ? "voice-mini-avatar--speaking" : ""
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div
            onClick={onClick}
            className={avatarClassName}
        >
            {src ? (
                <img
                    src={src}
                    alt=""
                    className="avatar"
                />
            ) : (
                <span className="voice-mini-avatar-initials">
                    {initial}
                </span>
            )}

            
        </div>
    );
}

