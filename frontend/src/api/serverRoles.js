import api from "./axios";

const RolesApi = {
   
    getRoles: (serverGuid) =>
        api.get(`/servers/${serverGuid}/roles`),

    createRole: (serverGuid, data) =>
        api.post(`/servers/${serverGuid}/roles`, data),

    deleteRole: (serverGuid, roleGuid) =>
        api.delete(`/servers/${serverGuid}/roles/${roleGuid}`),

    assignRoleToUser: (serverGuid, roleGuid, data) =>
        api.post(`/servers/${serverGuid}/roles/${roleGuid}/assign`, data),

    removeRoleFromUser: (serverGuid, roleGuid, data) =>
        api.post(`/servers/${serverGuid}/roles/${roleGuid}/remove`, data),

  
    getMembersWithRole: (serverGuid, roleGuid) =>
        api.get(`/servers/${serverGuid}/roles/${roleGuid}/members`),

    updateRolePermissions: (serverGuid, roleGuid, data) =>
        api.post(`/servers/${serverGuid}/roles/${roleGuid}/permissions`, data),
};

export default RolesApi;