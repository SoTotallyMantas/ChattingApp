import { useState } from "react";
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import { useToast } from "../../context/ToastContext";

export default function CreateChannelModal({ serverId, createChannel, onClose }) {
    const [name, setName] = useState("");
    const toast = useToast();

    const create = async (e) => {
        e.preventDefault();

        if (!name.trim()) return;

        try {
            await createChannel({
                serverGuid: serverId,
                channelName: name,
                channelType: "text",
                parentGuid: null,
                position: 0
            });

            toast.show("success", "Channel created!");
            onClose();
        } catch {
            toast.show("error", "Failed to create channel.");
        }
    };

    return (
        <Modal onClose={onClose}>
            <h2>Create Channel</h2>

            <form onSubmit={create}>
                <label>Channel Name</label>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="general"
                    style={inputStyle}
                />

                <div style={actions}>
                    <Button variant="secondary" onClick={onClose} type="button">
                        Cancel
                    </Button>
                    <Button type="submit">Create</Button>
                </div>
            </form>
        </Modal>
    );
}

const inputStyle = {
    width: "100%",
    padding: 10,
    marginTop: 10,
    marginBottom: 15,
    background: "var(--bg-tertiary)",
    borderRadius: 6,
    border: "1px solid var(--border-color)",
    color: "var(--text-primary)"
};

const actions = {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10
};
