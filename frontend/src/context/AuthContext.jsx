import { createContext,useContext, useEffect, useState } from "react";
import api, { setAccessToken as setGlobalAccessToken } from "../api/axios";
import { apiLogout } from "../api/auth";

const AuthContext = createContext();

const parseToken = (token, avatarKeyOverride = null) => {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
        userGuid:
            payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
            payload.nameid,
        userName: payload.userName,
        email: payload.email,
        displayName: payload.DisplayName || payload.displayName || payload.userName,
        avatarKey: avatarKeyOverride || payload.AvatarKey || payload.avatarKey || null,
    };
};

export function AuthProvider({ children }) {
    const [accessToken, setTokenState] = useState(sessionStorage.getItem("accessToken"));
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    const setToken = (token) => {
        setGlobalAccessToken(token);
        setTokenState(token);

        if (token) sessionStorage.setItem("accessToken", token);
        else sessionStorage.removeItem("accessToken");
    };

    useEffect(() => {
        const init = async () => {
           
            if (!accessToken) {
                setLoadingAuth(false);
                return;
            }

        try {
                
                const res = await api.post("/auth/refresh", { refreshToken: "ignored" });

                setToken(res.data.token);

                setUser(parseToken(res.data.token, res.data.avatarKey));

            } catch {
                
                setToken(null);
                setUser(null);
            }

            setLoadingAuth(false);
        };

        init();
    }, []);

    const logout = async () => {
        try {
            await apiLogout();
        } catch { /* ignore */ }
        setToken(null);
        setUser(null);
    };

    const register = async (form) => {
        const res = await api.post("/auth/register", form);

        setToken(res.data.token);

        setUser(parseToken(res.data.token, res.data.avatarKey));

        return res.data;
    };

    const login = async (identifier, password) => {
        const res = await api.post("/auth/login", {
            email: identifier.includes("@") ? identifier : null,
            userName: !identifier.includes("@") ? identifier : null,
            password,
        });

        setToken(res.data.token);

        setUser(parseToken(res.data.token, res.data.avatarKey));

        return res.data;
    };


    return (
        <AuthContext.Provider value={{ accessToken, user, setUser, loadingAuth, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
export function useAuth() {
    return useContext(AuthContext);
}
