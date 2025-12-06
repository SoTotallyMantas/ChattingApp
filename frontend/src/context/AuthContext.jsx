import { createContext, useEffect, useState } from "react";
import api, { setAccessToken as setGlobalAccessToken } from "../api/axios";

const AuthContext = createContext();

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

                const payload = JSON.parse(atob(res.data.token.split(".")[1]));
                setUser({
                    userGuid: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
                    userName: payload.userName,
                    displayName: payload.DisplayName,
                });

            } catch {
                
                setToken(null);
                setUser(null);
            }

            setLoadingAuth(false);
        };

        init();
    }, []);

    const register = async (form) => {
        const res = await api.post("/auth/register", form);

        setToken(res.data.token);

        const payload = JSON.parse(atob(res.data.token.split(".")[1]));
        setUser({
            userGuid: payload.nameid,
            userName: payload.userName,
            email: payload.email,
            displayName: payload.DisplayName,
        });

        return res.data;
    };

    const login = async (identifier, password) => {
        const res = await api.post("/auth/login", {
            email: identifier.includes("@") ? identifier : null,
            userName: !identifier.includes("@") ? identifier : null,
            password,
        });

        setToken(res.data.token);

        const payload = JSON.parse(atob(res.data.token.split(".")[1]));

  
        setUser({
            userGuid: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
            userName: payload.userName,
            displayName: payload.DisplayName,
        });

        return res.data;
    };


    return (
        <AuthContext.Provider value={{ accessToken, user, loadingAuth, login, register }}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
