import api, { setAccessToken } from "./axios";

export const apiLogin = async (identifier, password) => {
  const res = await api.post("/auth/login", {
    email: identifier.includes("@") ? identifier : undefined,
    userName: !identifier.includes("@") ? identifier : undefined,
    password,
  });

  setAccessToken(res.data.token);
  return res.data;
};

export const apiRegister = async (dto) => {
  const res = await api.post("/auth/register", dto);
  setAccessToken(res.data.token);
  return res.data;
};

export const apiRefresh = async () => {
  const res = await api.post("/auth/refresh");
  setAccessToken(res.data.token);
  return res.data;
};

export const apiLogout = async () => {
  await api.post("/auth/logout");
  setAccessToken(null);
};

export const changePassword = async (currentPassword, newPassword) => {
  await api.post("/auth/change-password", { currentPassword, newPassword });
};
