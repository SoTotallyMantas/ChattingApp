import Modal from "../../common/Modal";
import Button from "../../common/Button";
import { useToast } from "../../context/ToastContext";
import { useOverlay } from "../../context/OverlayContext";

export default function DeleteMessageModal({ id, deleteMessage }) {
    const toast = useToast();
    const { closeOverlay } = useOverlay();

    const remove = async () => {
        try {
            console.log("DELETE CLICKED");

            await deleteMessage(id);  
            toast.show("success", "Message deleted.");
            closeOverlay();
        } catch (error) {
            console.error("Delete failed:", error);  
            toast.show("error", "Failed to delete message.");
        }
    };

    return (
        <Modal onClose={closeOverlay}>
            <h2>Delete Message</h2>

            <p style={{ color: "var(--text-secondary)" }}>
                Are you sure you want to delete this message?
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                <Button variant="secondary" onClick={closeOverlay}>Cancel</Button>
                <Button variant="danger" onClick={remove}>Delete</Button>
            </div>
        </Modal>
    );
}
