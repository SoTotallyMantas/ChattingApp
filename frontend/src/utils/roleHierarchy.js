const NO_ROLE_POSITION = Number.POSITIVE_INFINITY;

const getRolesArray = (member) => member?.roles || member?.Roles || [];
const isOwnerRole = (role) =>
    role?.isOwner || role?.roleName?.toLowerCase() === "owner";

const getRolePosition = (role) => {
    if (isOwnerRole(role)) return -Infinity;
    if (role?.isDefault) return NO_ROLE_POSITION;
    return typeof role?.position === "number" ? role.position : NO_ROLE_POSITION;
};

export const getHighestRolePosition = (member) => {
    const roles = getRolesArray(member);
    if (!roles.length) return NO_ROLE_POSITION;

    return roles.reduce((min, role) => {
        const pos = getRolePosition(role);
        return pos < min ? pos : min;
    }, NO_ROLE_POSITION);
};

export const getTopRole = (member) => {
    const roles = getRolesArray(member);
    if (!roles.length) return null;

    return roles.reduce((best, role) => {
        if (isOwnerRole(role)) return role;
        if (!best) return role;
        const bestPos = getRolePosition(best);
        const rolePos = getRolePosition(role);
        return rolePos < bestPos ? role : best;
    }, null);
};

export const canActOnTarget = (actorMember, targetMember) => {
    if (!actorMember || !targetMember) return false;
    const actorPos = getHighestRolePosition(actorMember);
    const targetPos = getHighestRolePosition(targetMember);
    return actorPos < targetPos;
};

export const canAssignRole = (actorMember, role) => {
    if (!actorMember || !role) return false;
    const actorPos = getHighestRolePosition(actorMember);
    const rolePos = getRolePosition(role);
    return actorPos < rolePos;
};
