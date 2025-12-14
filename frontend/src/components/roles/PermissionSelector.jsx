
export default function PermissionSelector({
    permissions = [],
    selected = [],
    onChange,
    toggle
}) {
    const handleToggle = (id) => {
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
        <div style={{ marginTop: 10, color: "var(--text-primary)" }}>
            <h4 style={{ margin: "8px 0" }}>Permissions</h4>

            {permissions.map((perm) => (
                <label
                    key={perm.permissionGuid}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "4px 0",
                        color: "var(--text-primary)"
                    }}
                >
                    <input
                        type="checkbox"
                        checked={selected.includes(perm.permissionGuid)}
                        onChange={() => handleToggle(perm.permissionGuid)}
                    />
                    {perm.permissionName}
                </label>
            ))}
        </div>
    );
}
