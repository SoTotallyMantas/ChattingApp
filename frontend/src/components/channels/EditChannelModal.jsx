import { useState } from "react";
import { useToast } from "../../context/ToastContext";
import { useOverlay } from "../../context/OverlayContext";

export default function EditChannelModal({ channel, updateChannel }) {
    const [name, setName] = useState(channel.channelName);
    const toast = useToast();
    const { closeOverlay } = useOverlay();

    const save = async (e) => {
        e.preventDefault();

        try {
            await updateChannel(channel.channelGuid, {
                channelGuid: channel.channelGuid,
                channelName: name,
                channelType: channel.channelType,
                parentGuid: channel.parentGuid,
                position: channel.position
            });

            toast.show("success", "Channel updated!");
            closeOverlay();
        } catch {
            toast.show("error", "Failed to update channel.");
        }
    };

    return (
        <div
            data-overlay-root="true"
            style={{
                width: 380,
                background: "var(--bg-secondary)",
                padding: 20,
                borderRadius: 8,
                color: "var(--text-primary)"
            }}
        >
            <h2>Edit Channel</h2>

            <form onSubmit={save}>
                <label>Channel Name</label>

                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input"
                    style={inputStyle}
                />

                <div style={actions}>
                    <button
                        type="button"
                        onClick={closeOverlay}
                        style={secondaryBtn}
                    >
                        Cancel
                    </button>

                    <button type="submit" style={primaryBtn}>
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
}


const inputStyle = {
    marginTop: 10,
    marginBottom: 15
};

const actions = {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10
};

const primaryBtn = {
    padding: "10px 16px",
    background: "var(--accent)",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    color: "white",
    fontWeight: 600
};

const secondaryBtn = {
    padding: "10px 16px",
    background: "#4f535c",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    color: "white"
};
