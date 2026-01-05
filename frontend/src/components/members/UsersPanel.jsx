import { useState, useMemo } from "react";
import { useToast } from "../../context/ToastContext";
import RolesApi from "../../api/serverRoles";
import { useMembers } from "../../hooks/useMembers";
import { useRoles } from "../../hooks/useRoles";
import { useAuth } from "../../context/AuthContext";
import { canActOnTarget, canAssignRole } from "../../utils/roleHierarchy";
import "./UsersPanel.css";
import { useAppState } from "../../context/AppStateContext";

export default function UsersPanel({ serverId }) {
    const toast = useToast();
    const [activeUser, setActiveUser] = useState(null);
    const { members, loadMembers } = useMembers(serverId);
    const { roles } = useRoles(serverId);
    const { user: currentUser } = useAuth();
    const {selectedServer} = useAppState();
    const IsOwner = selectedServer?.ownerGuid === currentUser?.userGuid;

    const actorMember = useMemo(
        () =>
            members.find(
                (m) =>
                    m?.user?.userGuid === currentUser?.userGuid ||
                    m?.userGuid === currentUser?.userGuid ||
                    m?.userId === currentUser?.userGuid
            ),
        [members, currentUser?.userGuid]
    );

    const canModifyTarget = (target) => {
        if (!target) return false;
        return IsOwner || canActOnTarget(actorMember, target);
    };

    const canGiveRole = (role) =>{
        if (!role) return false;
        return IsOwner || canAssignRole(actorMember, role);
    } 

    const assign = async (userGuid, roleGuid) => {
        const targetMember = members.find((m) => m.user?.userGuid === userGuid || m.userGuid === userGuid);
        const role = roles.find((r) => r.roleGuid === roleGuid);
        if (!canModifyTarget(targetMember) || !canGiveRole(role)) {
            toast.show("error", "You can't assign that role to this user.");
            return;
        }
        try {
            await RolesApi.assignRoleToUser(serverId, roleGuid, { userGuid });
            toast.show("success", "Role assigned.");
            loadMembers();
            // reflect change in the open detail view so buttons swap immediately
            setActiveUser((prev) => {
                if (!prev || prev.user.userGuid !== userGuid) return prev;
                const alreadyHas = prev.roles?.some((r) => r.roleGuid === roleGuid);
                if (alreadyHas) return prev;
                return { ...prev, roles: [...(prev.roles || []), role] };
            });
        } catch {
            toast.show("error", "Failed to assign role.");
        }
    };

    const remove = async (userGuid, roleGuid) => {
        const targetMember = members.find((m) => m.user?.userGuid === userGuid || m.userGuid === userGuid);
        const role = roles.find((r) => r.roleGuid === roleGuid);
        if (!canModifyTarget(targetMember) || !canGiveRole(role)) {
            toast.show("error", "You can't change this role for that user.");
            return;
        }
        try {
            await RolesApi.removeRoleFromUser(serverId, roleGuid, { userGuid });
            toast.show("success", "Role removed.");
            loadMembers();
            setActiveUser((prev) => {
                if (!prev || prev.user.userGuid !== userGuid) return prev;
                return { ...prev, roles: (prev.roles || []).filter((r) => r.roleGuid !== roleGuid) };
            });
        } catch {
            toast.show("error", "Failed to remove role.");
        }
    };


    if (!activeUser) {
        return (
        <div className="list-panel users-panel">
            <h2>Manage Users</h2>

                {members.map((m) => (
                    <div key={m.user.userGuid} className="user-member-row">
                        <div>
                            <strong>{m.user.userName}</strong>

                            <div className="user-roles">
                                {m.roles.length === 0 ? (
                                    <span className="user-no-roles">No roles</span>
                                ) : (
                                    m.roles.map((r) => (
                                        <span key={r.roleGuid} className="user-role-badge" style={{ background: r.color || "var(--bg-hover)" }}>
                                            {r.roleName}
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>

                        <button
                            className="user-manage-btn"
                            onClick={() => {
                                if (!canModifyTarget(m)) {
                                    toast.show("error", "You can't manage this user.");
                                    return;
                                }
                                setActiveUser(m);
                            }}
                            aria-disabled={!canModifyTarget(m)}
                            data-disabled={!canModifyTarget(m)}
                        >
                            Edit Roles
                        </button>
                    </div>
                ))}
            </div>
        );
    }

 
    return (
        <div className="list-panel users-panel">
            <button className="user-back-btn" onClick={() => setActiveUser(null)}>
                 Back
            </button>

            <h2>Edit Roles for {activeUser.user.userName}</h2>

            {roles.map((role) => {
                const hasRole = activeUser.roles.some(r => r.roleGuid === role.roleGuid);

                return (
                    <div key={role.roleGuid} className="user-role-row">
                        <span>{role.roleName}</span>

                        <div className="actions-row">
                            {hasRole ? (
                                <button
                                    className="user-remove-btn"
                                    onClick={() => remove(activeUser.user.userGuid, role.roleGuid)}
                                    aria-disabled={!canModifyTarget(activeUser) || !canGiveRole(role)}
                                    data-disabled={!canModifyTarget(activeUser) || !canGiveRole(role)}
                                >
                                    Remove
                                </button>
                            ) : (
                                <button
                                    className="user-assign-btn"
                                    onClick={() => assign(activeUser.user.userGuid, role.roleGuid)}
                                    aria-disabled={!canModifyTarget(activeUser) || !canGiveRole(role)}
                                    data-disabled={!canModifyTarget(activeUser) || !canGiveRole(role)}
                                >
                                    Assign
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
