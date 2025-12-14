import { getAvatarSrc } from "../../utils/avatar";

export default function VoiceMiniAvatar({ user, onClick, style }) {
    if (!user) return null;

    const {
        avatarKey,
        displayName,
        userGuid,
        isMuted,
        isDeafened,
        isSpeaking
    } = user;

    const src = getAvatarSrc({ avatarKey, userGuid });

    const initial = (displayName || userGuid || "?")
        .trim()
        .substring(0, 2)
        .toUpperCase();

    const ringColor =
        isSpeaking ? "var(--accent)" :
            isMuted ? "#f87171" :
                isDeafened ? "#fbbf24" :
                    "var(--border-color)";

    return (
        <div
            onClick={onClick}
            style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                border: `2px solid ${ringColor}`,
                background: "var(--bg-tertiary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                cursor: "pointer",
                overflow: "hidden",
                userSelect: "none",
                ...style
            }}
        >
            {src ? (
                <img
                    src={src}
                    alt=""
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                    }}
                />
            ) : (
                <span
                    style={{
                        color: "var(--text-primary)",
                        fontSize: 12,
                        fontWeight: "bold"
                    }}
                >
                    {initial}
                </span>
            )}

            {isMuted && (
                <div style={badgeMuted}>
                    📴
                </div>
            )}

            {isDeafened && (
                <div style={badgeDeaf}>
                    🙉
                </div>
            )}
        </div>
    );
}

const badgeBase = {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 10,
    color: "white"
};

const badgeMuted = {
    ...badgeBase,
    background: "#f87171"
};

const badgeDeaf = {
    ...badgeBase,
    background: "#fbbf24"
};
