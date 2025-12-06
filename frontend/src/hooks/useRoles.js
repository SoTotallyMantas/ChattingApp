// hooks/useRoles.js
import { useState, useEffect } from "react";
import RolesApi from "../api/serverRoles";

export function useRoles(serverId) {
    const [roles, setRoles] = useState([]);
    const [roleMembers, setRoleMembers] = useState([]);

    const loadRoles = async () => {
        if (!serverId) return;
        const { data } = await RolesApi.getRoles(serverId);
        setRoles(data);
    };

    const loadMembers = async (roleGuid) => {
        const { data } = await RolesApi.getMembersWithRole(serverId, roleGuid);
        setRoleMembers(data);
    };

    const create = async (dto) => {
        const { data } = await RolesApi.createRole(serverId, dto);
        await loadRoles();
        return data;
    };

    const remove = async (roleGuid) => {
        await RolesApi.deleteRole(serverId, roleGuid);
        await loadRoles();
    };

    const assign = async (roleGuid, dto) => {
        await RolesApi.assignRoleToUser(serverId, roleGuid, dto);
        await loadMembers(roleGuid);
    };

    const unassign = async (roleGuid, dto) => {
        await RolesApi.removeRoleFromUser(serverId, roleGuid, dto);
        await loadMembers(roleGuid);
    };

    const updatePermissions = async (roleGuid, dto) => {
        await RolesApi.updateRolePermissions(serverId, roleGuid, dto);
        await loadRoles();
    };

    useEffect(() => {
        loadRoles();
    }, [serverId]);

    return {
        roles,
        roleMembers,
        loadRoles,
        loadMembers,
        createRole: create,
        deleteRole: remove,
        assignRole: assign,
        removeRole: unassign,
        updatePermissions
    };
}
