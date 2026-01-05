
export default function PermissionSelector({
    permissions = [],
    selected = [],
    onChange,
    toggle,
    allowedPermissions = [],
    lockedPermissions = []
}) {
    const hasAllowList = allowedPermissions.length > 0;

    const handleToggle = (id) => {
        const isLocked = lockedPermissions.includes(id);
        const isAllowed = !hasAllowList || allowedPermissions.includes(id);
        if (isLocked || !isAllowed) return;

        if (onChange) {
            const next = selected.includes(id)
                ? selected.filter((p) => p !== id)
                : [...selected, id];
            onChange(next);
        } else if (toggle) {
            toggle(id);
        }
    };

    return (
        <div className="permission-selector">
            <h4 className="permission-selector-title">Permissions</h4>

            {permissions.map((perm) => (
                <label
                    key={perm.permissionGuid}
                    className="permission-selector-item"
                >
                    <input
                        type="checkbox"
                        checked={selected.includes(perm.permissionGuid)}
                        disabled={
                            lockedPermissions.includes(perm.permissionGuid) ||
                            (hasAllowList && !allowedPermissions.includes(perm.permissionGuid))
                        }
                        onChange={() => handleToggle(perm.permissionGuid)}
                    />
                    {perm.permissionName}
                </label>
            ))}
        </div>
    );
}
