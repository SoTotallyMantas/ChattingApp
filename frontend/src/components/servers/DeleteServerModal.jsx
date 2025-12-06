
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import { useToast } from "../../context/ToastContext";
import serverApi from "../../api/servers";

export default function DeleteServerModal({ server, onClose, onDeleted }) {
    const toast = useToast();

    const handleDelete = async () => {
        try {
            await serverApi.deleteServer(server.serverGuid);
            toast.show("success", "Server deleted.");
            onDeleted?.();
            onClose();
        } catch {
            toast.show("error", "Failed to delete server.");
        }
    };

    return (
        <Modal onClose={onClose}>
            <h2>Delete Server</h2>
            <p style={{ color: "var(--text-secondary)" }}>
                Are you sure you want to delete <strong>{server.serverName}</strong>?
                This action cannot be undone.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button variant="danger" onClick={handleDelete}>Delete</Button>
            </div>
        </Modal>
    );
}
