import { useState } from "react";
import { useToast } from "../../context/ToastContext";
import { useOverlay } from "../../context/OverlayContext";

export default function CreateChannelModal({ serverId, createChannel }) {
    const [name, setName] = useState("");
    const [type, setType] = useState("text");
    const toast = useToast();
    const { closeOverlay } = useOverlay();

    const create = async (e) => {
        e.preventDefault();

        if (!name.trim()) return;

        try {
            await createChannel({
                serverGuid: serverId,
                channelName: name,
                channelType: type,
                parentGuid: null,
                position: 0
            });

            toast.show("success", "Channel created!");
            closeOverlay();
        } catch {
            toast.show("error", "Failed to create channel.");
        }
    };

    return (
        <div
            data-overlay-root="true"
            style={{
                background: "var(--bg-secondary)",
                padding: 20,
                borderRadius: 8,
                width: 380,
                color: "var(--text-primary)"
            }}
        >
            <h2>Create Channel</h2>

            <form onSubmit={create}>
                <label>Channel Name</label>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="general"
                    className="input"
                    style={inputStyle}
                />

                <label>Channel Type</label>
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="input"
                    style={inputStyle}
                >
                    <option value="text">Text Channel</option>
                    <option value="voice">Voice Channel</option>
                </select>

                <div style={actions}>
                    <button
                        type="button"
                        onClick={closeOverlay}
                        style={secondaryBtn}
                    >
                        Cancel
                    </button>

                    <button type="submit" style={primaryBtn}>
                        Create
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
