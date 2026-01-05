
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import { useToast } from "../../context/ToastContext";
import RolesApi from "../../api/serverRoles";
import { useAuth } from "../../context/AuthContext";
import { useMembers } from "../../hooks/useMembers";
import { canActOnTarget, canAssignRole } from "../../utils/roleHierarchy";

export default function AssignRoleToUserModal({ serverId, member, roles, onClose, onUpdated }) {
    const toast = useToast();
    const { user: currentUser } = useAuth();
    const { members } = useMembers(serverId);

    const actorMember = members.find((m) =>
        m?.user?.userGuid === currentUser?.userGuid ||
        m?.userGuid === currentUser?.userGuid ||
        m?.userId === currentUser?.userGuid
    );

    const targetMember = members.find((m) =>
        m?.user?.userGuid === member?.userGuid ||
        m?.userGuid === member?.userGuid ||
        m?.userId === member?.userGuid
    ) || member;

    const canModifyTarget = canActOnTarget(actorMember, targetMember);

    const assign = async (roleGuid) => {
        const role = roles.find((r) => r.roleGuid === roleGuid);
        if (!canModifyTarget || !canAssignRole(actorMember, role)) {
            toast.show("error", "You don't have permission to assign this role.");
            return;
        }

        try {
            await RolesApi.assignRoleToUser(serverId, roleGuid, {
                userGuid: member.userGuid
            });

            toast.show("success", "Role assigned!");
            onUpdated?.();
        } catch {
            toast.show("error", "Failed to assign role.");
        }
    };

    return (
        <Modal onClose={onClose}>
            <h2>Assign Role to {member.userName}</h2>

            {roles.map((role) => (
                <div key={role.roleGuid} className="member-profile-role">
                    <span>{role.roleName}</span>
                    <Button
                        onClick={() => assign(role.roleGuid)}
                        aria-disabled={!canModifyTarget || !canAssignRole(actorMember, role)}
                        data-disabled={!canModifyTarget || !canAssignRole(actorMember, role)}
                    >
                        Assign
                    </Button>
                </div>
            ))}

            <div className="member-profile-actions">
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
            </div>
        </Modal>
    );
}
