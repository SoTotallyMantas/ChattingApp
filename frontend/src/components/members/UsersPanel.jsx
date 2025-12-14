import { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";
import RolesApi from "../../api/serverRoles";
import { getServerMembers } from "../../api/serverMembers";

export default function UsersPanel({ serverId }) {
    const toast = useToast();

    const [members, setMembers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [activeUser, setActiveUser] = useState(null); 

    const loadData = async () => {
        try {
            const membersList = await getServerMembers(serverId);
            setMembers(membersList);

            const rolesRes = await RolesApi.getRoles(serverId);
            setRoles(rolesRes.data);
        } catch {
            toast.show("error", "Failed to load users or roles.");
        }
    };

    useEffect(() => {
        loadData();
    }, [serverId]);

    const assign = async (userGuid, roleGuid) => {
        try {
            await RolesApi.assignRoleToUser(serverId, roleGuid, { userGuid });
            toast.show("success", "Role assigned.");
            loadData();
        } catch {
            toast.show("error", "Failed to assign role.");
        }
    };

    const remove = async (userGuid, roleGuid) => {
        try {
            await RolesApi.removeRoleFromUser(serverId, roleGuid, { userGuid });
            toast.show("success", "Role removed.");
            loadData();
        } catch {
            toast.show("error", "Failed to remove role.");
        }
    };


    if (!activeUser) {
        return (
            <div style={{ color: "var(--text-primary)" }}>
                <h2>Manage Users</h2>

                {members.map((m) => (
                    <div key={m.user.userGuid} style={memberRow}>
                        <div>
                            <strong>{m.user.userName}</strong>

                            <div style={{ marginTop: 6 }}>
                                {m.roles.length === 0 ? (
                                    <span style={{ opacity: 0.6 }}>No roles</span>
                                ) : (
                                    m.roles.map((r) => (
                                        <span key={r.roleGuid} style={roleBadge(r.color)}>
                                            {r.roleName}
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>

                        <button
                            style={manageBtn}
                            onClick={() => setActiveUser(m)}
                        >
                            Edit Roles
                        </button>
                    </div>
                ))}
            </div>
        );
    }

 
    return (
        <div style={{ color: "var(--text-primary)" }}>
            <button style={backBtn} onClick={() => setActiveUser(null)}>
                 Back
            </button>

            <h2>Edit Roles for {activeUser.user.userName}</h2>

            {roles.map((role) => {
                const hasRole = activeUser.roles.some(r => r.roleGuid === role.roleGuid);

                return (
                    <div key={role.roleGuid} style={roleRow}>
                        <span>{role.roleName}</span>

                        {hasRole ? (
                            <button
                                style={removeBtn}
                                onClick={() => remove(activeUser.user.userGuid, role.roleGuid)}
                            >
                                Remove
                            </button>
                        ) : (
                            <button
                                style={assignBtn}
                                onClick={() => assign(activeUser.user.userGuid, role.roleGuid)}
                            >
                                Assign
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
}


const memberRow = {
    padding: "12px",
    background: "var(--bg-tertiary)",
    borderRadius: 6,
    marginBottom: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
};

const roleBadge = (color) => ({
    background: color || "var(--bg-hover)",
    padding: "3px 6px",
    borderRadius: 4,
    marginRight: 6,
    fontSize: 12,
});

const manageBtn = {
    padding: "6px 10px",
    background: "var(--accent)",
    color: "white",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
};

const backBtn = {
    padding: "6px 12px",
    marginBottom: 15,
    background: "transparent",
    color: "var(--text-secondary)",
    border: `1px solid var(--border-color)`,
    borderRadius: 4,
    cursor: "pointer",
};

const roleRow = {
    padding: "8px 0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
};

const assignBtn = {
    background: "#3ba55d",
    color: "white",
    border: "none",
    padding: "4px 10px",
    borderRadius: 4,
    cursor: "pointer",
};

const removeBtn = {
    background: "var(--danger)",
    color: "white",
    border: "none",
    padding: "4px 10px",
    borderRadius: 4,
    cursor: "pointer",
};
