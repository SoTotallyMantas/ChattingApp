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

  uploadServerIcon: (serverGuid, file) => {
    const form = new FormData();
    form.append("file", file);
    return api.post(`/servers/${serverGuid}/icon`, form, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  }
};

export default serverApi;
