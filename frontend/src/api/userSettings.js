import api from "./axios";

export const getUserSettings = async () => {
    const res = await api.get("/user-settings");
    return res.data;
};

export const updateUserSettings = async (payload) => {
    const res = await api.put("/user-settings", payload);
    return res.data;
};

export const uploadAvatar = async (file) => {
    const form = new FormData();
    form.append("file", file);
    const res = await api.post("/user-settings/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data?.avatarKey;
};
