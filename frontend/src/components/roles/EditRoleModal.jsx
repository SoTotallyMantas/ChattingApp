
import { useState, useEffect } from "react";
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import { useToast } from "../../context/ToastContext";
import RolesApi from "../../api/serverRoles";
import PermissionSelector from "./PermissionSelector";
import { useAppState } from "../../context/AppStateContext";

export default function EditRoleModal({ serverId, role, onClose, onUpdated }) {
    const [name, setName] = useState(role.roleName);
    const [color, setColor] = useState(role.color || "#3b82f6");
    const [position, setPosition] = useState(role.position);
    const [permissions, setPermissions] = useState(
        role.permissions.map(p => p.permissionGuid)
    );
    const [allPermissions, setAllPermissions] = useState([]);
    const { selectedServer } = useAppState();
    const allowedPermissions = selectedServer?.permissions || [];
    const lockedPermissions = permissions.filter(
        (p) => allowedPermissions.length > 0 && !allowedPermissions.includes(p)
    );

    const toast = useToast();

    useEffect(() => {
        const loadPerms = async () => {
            try {
                const res = await RolesApi.getAllPermissions();
                setAllPermissions(res.data);
            } catch {
                toast.show("error", "Failed to load permissions.");
            }
        };
        loadPerms();
    }, [toast]);

    const save = async (e) => {
        e.preventDefault();

        try {
            const roleGuid = role.roleGuid || role.roleId || role.id;

            await RolesApi.updateRole(serverId, roleGuid, {
                roleName: name,
                color,
                position,
            });

            const safePermissions = Array.from(
                new Set([
                    ...lockedPermissions,
                    ...permissions.filter(
                        (p) => allowedPermissions.length === 0 || allowedPermissions.includes(p)
                    )
                ])
            );

            await RolesApi.updateRolePermissions(serverId, roleGuid, {
                roleId: role.roleGuid,
                permissionsGuid: safePermissions,
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
                    className="input"
                />

                <label>Color</label>
                <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="input role-form-color"
                />

                <label>Position</label>
                <input
                    type="number"
                    value={position}
                    onChange={(e) => setPosition(Number(e.target.value))}
                    className="input"
                />

            <PermissionSelector
                permissions={allPermissions}
                selected={permissions}
                allowedPermissions={allowedPermissions}
                lockedPermissions={lockedPermissions}
                onChange={setPermissions}
            />

                <div className="role-form-actions">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Modal>
    );
}
