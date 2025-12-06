import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
    const { accessToken, loadingAuth } = useContext(AuthContext);

    if (loadingAuth) return <div>Loading...</div>;

    if (!accessToken) return <Navigate to="/login" replace />;

    return children;
}
