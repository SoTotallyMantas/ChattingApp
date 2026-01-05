import api from "./axios";

export const fetchWhitelist = () =>
    api.get("/admin/whitelist").then((res) => res.data);

export const addWhitelistEntry = (email) =>
    api.post("/admin/whitelist", { email }).then((res) => res.data);

export const deleteWhitelistEntry = (id) =>
    api.delete(`/admin/whitelist/${id}`).then((res) => res.data);
