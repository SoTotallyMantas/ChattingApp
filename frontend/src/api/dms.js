import api from "./axios";

export const startDm = (friendGuid) =>
    api.post(`/dms/${friendGuid}`).then((res) => res.data);
