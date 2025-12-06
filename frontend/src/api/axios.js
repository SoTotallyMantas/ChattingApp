import axios from "axios";

let accessToken = null;

export const setAccessToken = (t) => (accessToken = t);
export const getAccessToken = () => accessToken;

const api = axios.create({
    baseURL: "/api",
    withCredentials: true, 
});

api.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

let isRefreshing = false;
let queued = [];

const processQueue = (error, token) => {
    queued.forEach((p) => {
        if (error) p.reject(error);
        else p.resolve(token);
    });
    queued = [];
};

api.interceptors.response.use(
    (res) => res,
    async (err) => {
        const original = err.config;

        if (err.response?.status === 401 && !original._retry) {
            original._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    queued.push({ resolve, reject });
                }).then((token) => {
                    original.headers.Authorization = `Bearer ${token}`;
                    return api(original);
                });
            }

            isRefreshing = true;

            try {
                const res = await api.post("/auth/refresh", { refreshToken: "ignored" });

                const newToken = res.data.token;
                setAccessToken(newToken);

                processQueue(null, newToken);

                original.headers.Authorization = `Bearer ${newToken}`;
                return api(original);
            } catch (refreshErr) {
                processQueue(refreshErr, null);

                setAccessToken(null);
                window.location.href = "/login";
                throw refreshErr;
            } finally {
                isRefreshing = false;
            }
        }

        throw err;
    }
);

export default api;
