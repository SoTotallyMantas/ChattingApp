import { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import RolesApi from "../../api/serverRoles";
import { useOverlay } from "../../context/OverlayContext";
import { useAppState } from "../../context/AppStateContext";
import Button from "../../common/Button"; 
import Modal from "../../common/Modal";

export default function RoleModal({ isCreating, roleData, onClose }) {
    const toast = useToast();
    const { closeOverlay } = useOverlay();
    const { refreshServerPermissions } = useAppState();
    const handleClose = onClose || closeOverlay;

    const [availablePermissions, setAvailablePermissions] = useState(
        roleData.permissionsList || roleData.permissions || []
    );

    const currentUserPermissions = Array.isArray(roleData.currentUserPermissions) 
        ? roleData.currentUserPermissions
        : [];

    const allowedPermissionGuids = new Set(
        availablePermissions
            .filter((perm) => currentUserPermissions.includes(perm.permissionName))
            .map((perm) => perm.permissionGuid)
    )
    const initialPermissions = (roleData.permissions || []).map((p) => p.permissionGuid);
    const lockedPermissions = initialPermissions.filter(
        (permGuid) => !allowedPermissionGuids.has(permGuid)
    );

    const [form, setForm] = useState({
        roleName: isCreating ? "" : roleData.roleName,
        roleColor: isCreating ? "#3b82f6" : roleData.color,
        permissions: isCreating ? [] : initialPermissions
    });
    const [saving, setSaving] = useState(false);

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
        if (saving) return;
        const normalizedName = form.roleName?.trim() || "New Role";
        setSaving(true);
        try {
            const selectedPermissions = Array.from(
                new Set([
                    ...lockedPermissions,
                    ...form.permissions.filter((perm) => allowedPermissionGuids.has(perm))
                ])
            );
            const roleGuidFallback = roleData.roleGuid || roleData.roleId || roleData.id;
            if (isCreating) {
                const { data: createdRole } = await RolesApi.createRole(roleData.serverGuid, {
                    roleName: normalizedName,
                    color: form.roleColor,
                    position: roleData.nextPosition ?? 0
                });
                await RolesApi.updateRolePermissions(roleData.serverGuid, createdRole.roleGuid, {
                    permissionsGuid: selectedPermissions
                });
                toast.show("success", "Role created!");
            } else {
                await RolesApi.updateRole(roleData.serverGuid, roleGuidFallback, {
                    roleName: normalizedName,
                    roleColor: form.roleColor,
                    position: roleData.position ?? 0,
                    roleGuid: roleGuidFallback
                });
                await RolesApi.updateRolePermissions(roleData.serverGuid, roleGuidFallback, {
                    permissionsGuid: selectedPermissions
                });
                toast.show("success", "Role updated!");
            }
            await refreshServerPermissions(roleData.serverGuid);
            roleData.onSaved?.();
            handleClose(); 
        } catch (err) {
            const message = err?.response?.data?.message || "Failed to save role.";
            toast.show("error", message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        handleClose(); 
    };

    return (
        <Modal onClose={handleClose}> 
            <h3>{isCreating ? "Create Role" : "Edit Role"}</h3>

            <label>Name</label>
            <input
                type="text"
                value={form.roleName}
                onChange={(e) => setForm({ ...form, roleName: e.target.value })}
                className="input"
            />

            <label>Color</label>
            <input
                type="color"
                value={form.roleColor}
                onChange={(e) => setForm({ ...form, roleColor: e.target.value })}
                className="role-modal-colorInput"
            />

            <h4>Permissions</h4>
            {availablePermissions.map((perm) => {
                const isLocked = lockedPermissions.includes(perm.permissionGuid);
                const isAllowed = allowedPermissionGuids.has(perm.permissionGuid);

                return (
                    <label key={perm.permissionGuid} className="role-modal-permission">
                        <input
                            type="checkbox"
                            checked={form.permissions.includes(perm.permissionGuid)}
                            disabled={isLocked || !isAllowed}
                            onChange={() => {
                                if (isLocked || !isAllowed) return;
                                setForm((prev) => ({
                                    ...prev,
                                    permissions: prev.permissions.includes(perm.permissionGuid)
                                        ? prev.permissions.filter((p) => p !== perm.permissionGuid)
                                        : [...prev.permissions, perm.permissionGuid]
                                }));
                            }}
                        />
                        {perm.permissionName}
                        {!isAllowed && !isLocked && (
                            <span className="role-modal-permission-hint"> (not allowed)</span>
                        )}
                    </label>
                );
            })}

            <div className="role-modal-button-group">
                <Button variant="secondary" onClick={handleCancel} disabled={saving}>Cancel</Button>
                <Button variant="primary" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                </Button>
            </div>
        </Modal>
    );
}
