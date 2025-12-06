
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import { useToast } from "../../context/ToastContext";
import { kickMember } from "../../api/serverMembers";

export default function KickMemberModal({ serverId, member, onClose }) {
    const toast = useToast();

    const kick = async () => {
        try {
            await kickMember(serverId, { userGuid: member.userGuid });
            toast.show("success", `${member.userName} has been kicked.`);
            onClose();
        } catch {
            toast.show("error", "Failed to kick member.");
        }
    };

    return (
        <Modal onClose={onClose}>
            <h2>Kick Member</h2>
            <p>Kick <strong>{member.userName}</strong> from the server?</p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button variant="danger" onClick={kick}>Kick</Button>
            </div>
        </Modal>
    );
}
