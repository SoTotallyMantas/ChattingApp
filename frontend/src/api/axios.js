import axios from "axios";
import { isTokenExpiringSoon } from "../utils/jwt";

let accessToken = null;
let refreshPromise = null;

export const setAccessToken = (t) => (accessToken = t);
export const getAccessToken = () => accessToken;

const api = axios.create({
    baseURL: "/api",
    withCredentials: true,
});

const refreshToken = () => {
    if (refreshPromise) return refreshPromise;
    refreshPromise = axios
        .post("/api/auth/refresh", { refreshToken: "ignored" }, { withCredentials: true })
        .then((res) => {
            const newToken = res.data.token;
            setAccessToken(newToken);
            return newToken;
        })
        .catch((err) => {
            setAccessToken(null);
            throw err;
        })
        .finally(() => {
            refreshPromise = null;
        });
    return refreshPromise;
};

api.interceptors.request.use(async (config) => {
    if (accessToken) {
        if (isTokenExpiringSoon(accessToken, 120)) {
            try {
                await refreshToken();
            } catch (err) {
                window.location.href = "/login";
                throw err;
            }
        }
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

api.interceptors.response.use(
    (res) => res,
    async (err) => {
        const original = err.config;
        const isAuthEndpoint = (url) =>
            typeof url === "string" &&
            (url.includes("/auth/login") ||
                url.includes("/auth/register") ||
                url.includes("/auth/refresh") ||
                url.includes("/auth/logout"));

        if (isAuthEndpoint(original?.url)) {
            throw err;
        }

        if ((err.response?.status === 401 || err.response?.status === 403) && !original._retry) {
            original._retry = true;

            try {
                const newToken = await refreshToken();
                if (newToken) {
                    original.headers.Authorization = `Bearer ${newToken}`;
                }
                return api(original);
            } catch (refreshErr) {
                window.location.href = "/login";
                throw refreshErr;
            }
        }

        throw err;
    }
);

export default api;
