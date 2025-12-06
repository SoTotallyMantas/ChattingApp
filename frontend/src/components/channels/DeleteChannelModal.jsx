
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import { useToast } from "../../context/ToastContext";

export default function DeleteChannelModal({ channel, deleteChannel, onClose }) {
    const toast = useToast();

    const remove = async () => {
        try {
            await deleteChannel(channel.channelGuid);
            toast.show("success", "Channel deleted.");
            onClose();
        } catch {
            toast.show("error", "Failed to delete channel.");
        }
    };

    return (
        <Modal onClose={onClose}>
            <h2>Delete Channel</h2>

            <p style={{ color: "var(--text-secondary)" }}>
                Are you sure you want to delete <strong>#{channel.channelName}</strong>?
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button variant="danger" onClick={remove}>Delete</Button>
            </div>
        </Modal>
    );
}
