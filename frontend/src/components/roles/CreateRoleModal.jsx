
import { useState, useEffect } from "react";
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import { useToast } from "../../context/ToastContext";
import RolesApi from "../../api/serverRoles";
import PermissionSelector from "./PermissionSelector";
import { useAppState } from "../../context/AppStateContext";

export default function CreateRoleModal({ serverId, onClose, onCreated }) {
    const [name, setName] = useState("");
    const [color, setColor] = useState("#3b82f6");
    const [permissions, setPermissions] = useState([]);
    const [allPermissions, setAllPermissions] = useState([]);
    const { selectedServer } = useAppState();
    const allowedPermissions = selectedServer?.permissions || [];

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

    const create = async (e) => {
        e.preventDefault();

        try {
            const safePermissions = permissions.filter(
                (p) => allowedPermissions.length === 0 || allowedPermissions.includes(p)
            );

            const { data } = await RolesApi.createRole(serverId, {
                roleName: name,
                color,
            });

            if (permissions.length > 0) {
                await RolesApi.updateRolePermissions(serverId, data.roleGuid, {
                    roleId: data.roleGuid,
                    permissionsGuid: safePermissions
                });
            }

            toast.show("success", "Role created!");
            onCreated?.(data);
            onClose();
        } catch {
            toast.show("error", "Failed to create role.");
        }
    };

    return (
        <Modal onClose={onClose}>
            <h2>Create Role</h2>

            <form onSubmit={create}>
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

            <PermissionSelector
                permissions={allPermissions}
                selected={permissions}
                allowedPermissions={allowedPermissions}
                onChange={setPermissions}
            />

                <div className="role-form-actions">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Create</Button>
                </div>
            </form>
        </Modal>
    );
}
