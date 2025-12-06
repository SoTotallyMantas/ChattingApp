
import { useState } from "react";
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import { useToast } from "../../context/ToastContext";
import RolesApi from "../../api/serverRoles";
import PermissionSelector from "./PermissionSelector";

export default function EditRoleModal({ serverId, role, onClose, onUpdated }) {
    const [name, setName] = useState(role.roleName);
    const [color, setColor] = useState(role.color || "#5865f2");
    const [position, setPosition] = useState(role.position);
    const [permissions, setPermissions] = useState(
        role.permissions.map(p => p.permissionGuid)
    );

    const toast = useToast();

    const save = async (e) => {
        e.preventDefault();

        try {
            await RolesApi.updateRole(serverId, {
                roleGuid: role.roleGuid,
                roleName: name,
                roleColor: color,
                position,
            });

            await RolesApi.updateRolePermissions(serverId, role.roleGuid, {
                roleId: role.roleGuid,
                permissionsGuid: permissions,
            });

            toast.show("success", "Role updated.");
            onUpdated?.();
            onClose();
        } catch {
            toast.show("error", "Failed to update role.");
        }
    };

    return (
        <Modal onClose={onClose}>
            <h2>Edit Role</h2>

            <form onSubmit={save}>
                <label>Name</label>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={input}
                />

                <label>Color</label>
                <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    style={{ ...input, padding: 4, height: 40 }}
                />

                <label>Position</label>
                <input
                    type="number"
                    value={position}
                    onChange={(e) => setPosition(Number(e.target.value))}
                    style={input}
                />

                <PermissionSelector
                    selected={permissions}
                    onChange={setPermissions}
                />

                <div style={actions}>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Modal>
    );
}

const input = {
    width: "100%",
    padding: 10,
    marginTop: 10,
    marginBottom: 15,
    background: "var(--bg-tertiary)",
    border: "1px solid var(--border-color)",
    borderRadius: 6,
    color: "var(--text-primary)"
};

const actions = {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
};
