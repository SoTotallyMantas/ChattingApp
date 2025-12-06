
import { useState } from "react";
import { useRoles } from "../../hooks/useRoles";
import CreateRoleModal from "./CreateRoleModal";
import EditRoleModal from "./EditRoleModal";
import RoleMembersModal from "./RoleMembersModal";

export default function RoleList({ serverId }) {
    const { roles, deleteRole } = useRoles(serverId);

    const [createOpen, setCreateOpen] = useState(false);
    const [editRole, setEditRole] = useState(null);
    const [membersRole, setMembersRole] = useState(null);

    return (
        <div style={{ padding: 20 }}>
            <h2>Roles</h2>

            <button onClick={() => setCreateOpen(true)}>Create Role</button>

            {roles.map((role) => (
                <div
                    key={role.roleGuid}
                    style={{
                        padding: 10,
                        background: "#2f3136",
                        marginTop: 10,
                        borderRadius: 6,
                        color: "white"
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div>
                            <span style={{ color: role.color }}>{role.roleName}</span>
                        </div>

                        <div style={{ display: "flex", gap: 10 }}>
                            <button onClick={() => setMembersRole(role)}>
                                Members
                            </button>

                            <button onClick={() => setEditRole(role)}>
                                Edit
                            </button>

                            {!role.isDefault && (
                                <button onClick={() => deleteRole(role.roleGuid)} style={{ color: "red" }}>
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {createOpen && (
                <CreateRoleModal
                    serverId={serverId}
                    onClose={() => setCreateOpen(false)}
                />
            )}

            {editRole && (
                <EditRoleModal
                    serverId={serverId}
                    role={editRole}
                    onClose={() => setEditRole(null)}
                />
            )}

            {membersRole && (
                <RoleMembersModal
                    serverId={serverId}
                    role={membersRole}
                    onClose={() => setMembersRole(null)}
                />
            )}
        </div>
    );
}
