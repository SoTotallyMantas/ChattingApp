
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import { useToast } from "../../context/ToastContext";
import serverApi from "../../api/servers";

export default function LeaveServerModal({ server, onClose, onLeft }) {
    const toast = useToast();

    const leave = async () => {
        try {
            await serverApi.leaveServer(server.serverGuid);
            toast.show("success", `Left ${server.serverName}`);
            onLeft?.();
            onClose();
        } catch {
            toast.show("error", "Failed to leave server.");
        }
    };

    return (
        <Modal onClose={onClose}>
            <h2>Leave Server</h2>
            <p style={{ color: "var(--text-secondary)" }}>
                Are you sure you want to leave <strong>{server.serverName}</strong>?
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button variant="danger" onClick={leave}>Leave</Button>
            </div>
        </Modal>
    );
}
