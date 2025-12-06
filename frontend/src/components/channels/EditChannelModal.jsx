
import { useState } from "react";
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import { useToast } from "../../context/ToastContext";

export default function EditChannelModal({ channel, updateChannel, onClose }) {
    const [name, setName] = useState(channel.channelName);
    const toast = useToast();

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
            onClose();
        } catch {
            toast.show("error", "Failed to update channel.");
        }
    };

    return (
        <Modal onClose={onClose}>
            <h2>Edit Channel</h2>

            <form onSubmit={save}>
                <label>Channel Name</label>

                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={inputStyle}
                />

                <div style={actions}>
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit">Save</Button>
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
