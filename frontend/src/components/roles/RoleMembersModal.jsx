
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import { useToast } from "../../context/ToastContext";
import RolesApi from "../../api/serverRoles";
import { useAuth } from "../../context/AuthContext";
import { useMembers } from "../../hooks/useMembers";
import { canActOnTarget, canAssignRole } from "../../utils/roleHierarchy";

export default function RemoveRoleFromUserModal({ serverId, role, member, onClose, onUpdated }) {
    const toast = useToast();
    const { user: currentUser } = useAuth();
    const { members } = useMembers(serverId);

    const actorMember = members.find(
        (m) =>
            m?.user?.userGuid === currentUser?.userGuid ||
            m?.userGuid === currentUser?.userGuid ||
            m?.userId === currentUser?.userGuid
    );
    const targetMember = members.find(
        (m) =>
            m?.user?.userGuid === member?.userGuid ||
            m?.userGuid === member?.userGuid ||
            m?.userId === member?.userGuid
    ) || member;

    const canModify = canActOnTarget(actorMember, targetMember) && canAssignRole(actorMember, role);

    const remove = async () => {
        if (!canModify) {
            toast.show("error", "You don't have permission to change this role.");
            return;
        }
        try {
            await RolesApi.removeRoleFromUser(serverId, role.roleGuid, {
                userGuid: member.userGuid
            });

            toast.show("success", "Role removed.");
            onUpdated?.();
            onClose();
        } catch {
            toast.show("error", "Failed to remove role.");
        }
    };

    return (
        <Modal onClose={onClose}>
            <h2>Remove Role</h2>
            <p className="role-members-modal-text">
                Remove <strong>{role.roleName}</strong> from{" "}
                <strong>{member.userName}</strong>?
            </p>

            <div className="role-members-modal-actions">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button variant="danger" onClick={remove} disabled={!canModify}>Remove</Button>
            </div>
        </Modal>
    );
}
