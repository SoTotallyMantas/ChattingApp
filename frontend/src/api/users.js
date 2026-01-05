import api from "./axios";

export const searchUsers = async (query, limit = 20) => {
    const res = await api.get("/users/search", {
        params: { q: query, limit }
    });
    return res.data;
};
