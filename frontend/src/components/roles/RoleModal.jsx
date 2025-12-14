import { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import RolesApi from "../../api/serverRoles";
import { useOverlay } from "../../context/OverlayContext";
import Button from "../../common/Button"; 
import Modal from "../../common/Modal";

export default function RoleModal({ isCreating, roleData, onClose }) {
    const toast = useToast();
    const { closeOverlay } = useOverlay();

    const [availablePermissions, setAvailablePermissions] = useState(
        roleData.permissionsList || roleData.permissions || []
    );

    const [form, setForm] = useState({
        roleName: isCreating ? "" : roleData.roleName,
        roleColor: isCreating ? "#5865f2" : roleData.color,
        position: isCreating ? 0 : roleData.position,
        permissions: isCreating
            ? []
            : (roleData.permissions || []).map((p) => p.permissionGuid)
    });

    useEffect(() => {
        const loadPerms = async () => {
            if (availablePermissions.length > 0) return;
            try {
                const res = await RolesApi.getAllPermissions();
                setAvailablePermissions(res.data);
            } catch {
                toast.show("error", "Failed to load permissions.");
            }
        };
        loadPerms();
    }, [availablePermissions.length, toast]);

    const handleSave = async () => {
        try {
            const roleGuidFallback = roleData.roleGuid || roleData.roleId || roleData.id;
            if (isCreating) {
                const createdRole = await RolesApi.createRole(roleData.serverGuid, {
                    roleName: form.roleName,
                    color: form.roleColor,
                    position: form.position
                });
                await RolesApi.updateRolePermissions(roleData.serverGuid, createdRole.roleGuid, {
                    permissionsGuid: form.permissions
                });
                toast.show("success", "Role created!");
            } else {
                await RolesApi.updateRole(roleData.serverGuid, roleGuidFallback, {
                    roleName: form.roleName,
                    color: form.roleColor,
                    position: form.position
                });
                await RolesApi.updateRolePermissions(roleData.serverGuid, roleGuidFallback, {
                    permissionsGuid: form.permissions
                });
                toast.show("success", "Role updated!");
            }
            onClose(); 
        } catch (error) {
            toast.show("error", "Failed to save role.");
        }
    };

    const handleCancel = () => {
        closeOverlay(); 
    };

    return (
        <Modal onClose={onClose}> 
            <h3>{isCreating ? "Create Role" : "Edit Role"}</h3>

            <label>Name</label>
            <input
                type="text"
                value={form.roleName}
                onChange={(e) => setForm({ ...form, roleName: e.target.value })}
                className="role-modal-input"
            />

            <label>Color</label>
            <input
                type="color"
                value={form.roleColor}
                onChange={(e) => setForm({ ...form, roleColor: e.target.value })}
                className="role-modal-colorInput"
            />

            <label>Position</label>
            <input
                type="number"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: Number(e.target.value) })}
                className="role-modal-input"
            />

            <h4>Permissions</h4>
            {availablePermissions.map((perm) => (
                <label key={perm.permissionGuid} style={{ display: "block" }}>
                    <input
                        type="checkbox"
                        checked={form.permissions.includes(perm.permissionGuid)}
                        onChange={() => {
                            setForm((prev) => ({
                                ...prev,
                                permissions: prev.permissions.includes(perm.permissionGuid)
                                    ? prev.permissions.filter((p) => p !== perm.permissionGuid)
                                    : [...prev.permissions, perm.permissionGuid]
                            }));
                        }}
                    />
                    {perm.permissionName}
                </label>
            ))}

            <div className="role-modal-button-group">
                <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
                <Button variant="primary" onClick={handleSave}>Save</Button>
            </div>
        </Modal>
    );
}
