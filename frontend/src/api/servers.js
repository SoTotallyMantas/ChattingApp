import api from "./axios";

const serverApi = {
  getMyServers: () => api.get("/servers/me"),

  createServer: (data) => api.post("/servers", data),

  getServer: (serverGuid) =>
    api.get(`/servers/${serverGuid}`),

  updateServer: (serverGuid, data) =>
    api.put(`/servers/${serverGuid}`, data),

  deleteServer: (serverGuid) =>
    api.delete(`/servers/${serverGuid}`),

  leaveServer: (serverGuid) =>
    api.post(`/servers/${serverGuid}/leave`),
};

export default serverApi;