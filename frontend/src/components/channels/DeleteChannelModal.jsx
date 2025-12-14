import { useOverlay } from "../../context/OverlayContext";
import { useToast } from "../../context/ToastContext";

export default function DeleteChannelModal({ channel, deleteChannel }) {
    const { closeOverlay } = useOverlay();
    const toast = useToast();

    const remove = async () => {
        try {
            await deleteChannel(channel.channelGuid);
            toast.show("success", "Channel deleted.");
            closeOverlay();
        } catch {
            toast.show("error", "Failed to delete channel.");
        }
    };

    return (
        <div
            data-overlay-root="true"
            style={{
                width: 400,
                background: "var(--bg-secondary)",
                padding: 24,
                borderRadius: 8,
                color: "var(--text-primary)"
            }}
        >
            <h2 style={{ marginTop: 0 }}>Delete Channel</h2>

            <p style={{ color: "var(--text-secondary)", marginTop: 10 }}>
                Are you sure you want to delete <strong>#{channel.channelName}</strong>?
            </p>

            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 10,
                    marginTop: 25
                }}
            >
                <button
                    type="button"
                    onClick={closeOverlay}
                    style={secondaryBtn}
                >
                    Cancel
                </button>

                <button
                    type="button"
                    onClick={remove}
                    style={dangerBtn}
                >
                    Delete
                </button>
            </div>
        </div>
    );
}


const secondaryBtn = {
    padding: "10px 16px",
    background: "#4f535c",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    color: "white"
};

const dangerBtn = {
    padding: "10px 16px",
    background: "#ed4245",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    color: "white",
    fontWeight: 600
};
