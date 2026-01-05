import MicrophoneIcon from "../icons/MicrophoneIcon";
import MicrophoneOffIcon from "../icons/MicrophoneOffIcon";
import DeafenedIcon from "../icons/DeafenedIcon";
import NonDeafenedIcon from "../icons/NonDeafenedIcon";

export default function MediaControls({
    onCamera,
    onCameraToggle,
    cameraEnabled = false,
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
    const wrapperClassName = embedded
        ? "media-controls media-controls--embedded"
        : "media-controls";

    const actionsClassName = showMicControls
        ? "media-controls-actions media-controls-actions--push"
        : "media-controls-actions";

    return (
        <div className={wrapperClassName}>
            {showMicControls && (
                <div className="media-controls-mic">
                    <button onClick={micMuted ? unmute : mute} className="icon-button">
                        {micMuted ? <MicrophoneOffIcon /> : <MicrophoneIcon />}
                    </button>

                    <button onClick={isDeaf ? undeafen : deafen} className="icon-button">
                        {isDeaf ? <DeafenedIcon /> : <NonDeafenedIcon />}
                    </button>
                </div>
            )}

            <div className={actionsClassName}>
                <button onClick={onCameraToggle ?? onCamera} className="button">
                    {cameraEnabled ? "Hide camera" : "Camera"}
                </button>
                <button
                    onClick={onLeave}
                    className="button"
                    title="Leave voice"
                >
                    Leave
                </button>
            </div>
        </div>
    );
}
