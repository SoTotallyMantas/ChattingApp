
export default function PermissionSelector({ allPermissions, selected, toggle }) {
    return (
        <div style={{ marginTop: 10 }}>
            <h4 style={{ color: "white" }}>Permissions</h4>

            {allPermissions.map((perm) => (
                <label key={perm.permissionGuid} style={{ display: "block", color: "white" }}>
                    <input
                        type="checkbox"
                        checked={selected.includes(perm.permissionGuid)}
                        onChange={() => toggle(perm.permissionGuid)}
                    />
                    {perm.permissionName}
                </label>
            ))}
        </div>
    );
}
