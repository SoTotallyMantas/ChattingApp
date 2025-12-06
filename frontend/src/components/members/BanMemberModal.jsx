
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import { useToast } from "../../context/ToastContext";
import { banMember } from "../../api/serverMembers";

export default function BanMemberModal({ serverId, member, onClose }) {
    const toast = useToast();

    const ban = async () => {
        try {
            await banMember(serverId, { userGuid: member.userGuid });
            toast.show("success", `${member.userName} has been banned.`);
            onClose();
        } catch {
            toast.show("error", "Failed to ban member.");
        }
    };

    return (
        <Modal onClose={onClose}>
            <h2>Ban Member</h2>
            <p>Ban <strong>{member.userName}</strong> permanently?</p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button variant="danger" onClick={ban}>Ban</Button>
            </div>
        </Modal>
    );
}
