
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import { useToast } from "../../context/ToastContext";
import RolesApi from "../../api/serverRoles";

export default function RemoveRoleFromUserModal({ serverId, member, role, onClose, onUpdated }) {
    const toast = useToast();

    const remove = async () => {
        try {
            await RolesApi.removeRoleFromUser(serverId, role.roleGuid, {
                userGuid: member.userGuid
            });

            toast.show("success", "Role removed");
            onUpdated?.();
        } catch {
            toast.show("error", "Failed to remove role.");
        }
    };

    return (
        <Modal onClose={onClose}>
            <h2>Remove Role</h2>
            <p>Remove <strong>{role.roleName}</strong> from {member.userName}?</p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button variant="danger" onClick={remove}>Remove</Button>
            </div>
        </Modal>
    );
}
