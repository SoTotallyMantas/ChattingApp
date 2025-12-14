import MicrophoneIcon from "../icons/MicrophoneIcon";
import MicrophoneOffIcon from "../icons/MicrophoneOffIcon";
import DeafenedIcon from "../icons/DeafenedIcon";
import NonDeafenedIcon from "../icons/NonDeafenedIcon";

export default function MediaControls({
    onCamera,
    onScreen,
    onStop,
    onLeave,
    micMuted,
    isDeaf,
    mute,
    unmute,
    deafen,
    undeafen,
    embedded = false,
    showMicControls = true
}) {
    const wrapperStyle = embedded
        ? {
            display: "flex",
            alignItems: "center",
            gap: 8
        }
        : {
            position: "absolute",
            bottom: "20px",
            right: "20px",
            display: "flex",
            gap: "10px",
            padding: "10px",
            background: "var(--bg-tertiary)",
            borderRadius: "8px",
            zIndex: 200
        };

    return (
        <div style={wrapperStyle}>
            {showMicControls && (
                <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={micMuted ? unmute : mute} style={controlBtn}>
                        {micMuted ? <MicrophoneOffIcon /> : <MicrophoneIcon />}
                    </button>

                    <button onClick={isDeaf ? undeafen : deafen} style={controlBtn}>
                        {isDeaf ? <DeafenedIcon /> : <NonDeafenedIcon />}
                    </button>
                </div>
            )}

            <div style={{ display: "flex", gap: 8, marginLeft: showMicControls ? "auto" : 0 }}>
                <button onClick={onCamera} style={actionBtn}>
                    Camera
                </button>
                <button onClick={onScreen} style={actionBtn}>
                    Share
                </button>
                <button
                    onClick={onStop}
                    style={actionBtn}
                    title="Stop media"
                >
                    Stop
                </button>
                <button
                    onClick={onLeave}
                    style={{ ...actionBtn, color: "var(--danger)", borderColor: "var(--danger)" }}
                    title="Leave voice"
                >
                    Leave
                </button>
            </div>
        </div>
    );
}

const controlBtn = {
    width: 38,
    height: 38,
    borderRadius: 10,
    border: `1px solid var(--border-color)`,
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer"
};

const actionBtn = {
    padding: "6px 10px",
    borderRadius: 8,
    border: `1px solid var(--border-color)`,
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
    cursor: "pointer",
    fontSize: 12
};
