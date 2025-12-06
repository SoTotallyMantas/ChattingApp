
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import { useToast } from "../../context/ToastContext";
import RolesApi from "../../api/serverRoles";

export default function AssignRoleToUserModal({ serverId, member, roles, onClose, onUpdated }) {
    const toast = useToast();

    const assign = async (roleGuid) => {
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
                <div key={role.roleGuid} style={roleRow}>
                    <span>{role.roleName}</span>
                    <Button onClick={() => assign(role.roleGuid)}>Assign</Button>
                </div>
            ))}

            <div style={{ textAlign: "right", marginTop: 20 }}>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
            </div>
        </Modal>
    );
}

const roleRow = {
    padding: 10,
    background: "var(--bg-tertiary)",
    borderRadius: 6,
    marginBottom: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
};
