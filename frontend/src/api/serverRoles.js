import api from "./axios";

export default {
    getRoles(serverId) {
        return api.get(`/servers/${serverId}/roles`);
    },

    createRole(serverId, dto) {
        return api.post(`/servers/${serverId}/roles`, dto);
    },

    updateRole(serverId, roleGuid, dto) {
        return api.put(`/servers/${serverId}/roles/${roleGuid}`, dto);
    },

    deleteRole(serverId, roleGuid) {
        return api.delete(`/servers/${serverId}/roles/${roleGuid}`);
    },

    updateRolePermissions(serverId, roleGuid, dto) {
        return api.post(`/servers/${serverId}/roles/${roleGuid}/permissions`, dto);
    },

    assignRoleToUser(serverId, roleGuid, dto) {
        return api.post(`/servers/${serverId}/roles/${roleGuid}/assign`, dto);
    },

    removeRoleFromUser(serverId, roleGuid, dto) {
        return api.post(`/servers/${serverId}/roles/${roleGuid}/remove`, dto);
    },

    getMembers(serverId, roleGuid) {
        return api.get(`/servers/${serverId}/roles/${roleGuid}/members`);
    },
    reorderRoles(serverId, dto) {
        return api.post(`/servers/${serverId}/roles/reorder`, dto);
    },
    getAllPermissions() {
        return api.get(`/permissions`);
    }
};
