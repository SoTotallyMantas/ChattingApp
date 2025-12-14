import { useState, useEffect } from "react";
import RolesApi from "../api/serverRoles";

export function useRoles(serverId) {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);

    const loadRoles = async () => {
        if (!serverId) return;
        const { data } = await RolesApi.getRoles(serverId);
        setRoles(data);
    };

    const loadPermissions = async () => {
        const { data } = await RolesApi.getAllPermissions();
        setPermissions(data);
    };

    const createRole = async (dto) => {
        const { data } = await RolesApi.createRole(serverId, dto);
        await loadRoles();
        return data;
    };

    const updateRole = async (roleGuid, dto) => {
        await RolesApi.updateRole(serverId, roleGuid, dto);
        await loadRoles();
    };

    const updateRolePermissions = async (roleGuid, dto) => {
        await RolesApi.updateRolePermissions(serverId, roleGuid, dto);
        await loadRoles();
    };

    const deleteRole = async (roleGuid) => {
        await RolesApi.deleteRole(serverId, roleGuid);
        await loadRoles();
    };

    useEffect(() => {
        loadRoles();
        loadPermissions();
    }, [serverId]);

    return {
        roles,
        permissions,
        loadRoles,
        createRole,
        updateRole,
        updateRolePermissions,
        deleteRole
    };
}
