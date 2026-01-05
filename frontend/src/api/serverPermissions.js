import api from "./axios";

export const fetchMyServerPermissions = (serverGuid) =>
    api.get(`/servers/${serverGuid}/permissions/me`).then((res) => res.data);
