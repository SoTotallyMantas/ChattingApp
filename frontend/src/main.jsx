import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App";
import Login from "./features/auth/login";
import Register from "./features/auth/register";
import ProtectedRoute from "./routing/ProtectedRoute";

import { OverlayProvider } from "./context/OverlayContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { AppStateProvider } from "./context/AppStateContext";

import ServerContextMenu from "./components/servers/ServerContextMenu";
import "./theme.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <ThemeProvider>
            <ToastProvider>
                <OverlayProvider>
                    <BrowserRouter>
                        <AuthProvider>
                            <AppStateProvider>
                                <Routes>
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/register" element={<Register />} />
                                    <Route
                                        path="/*"
                                        element={
                                            <ProtectedRoute>
                                                <App />
                                            </ProtectedRoute>
                                        }
                                    />
                                </Routes>
                                <ServerContextMenu />
                            </AppStateProvider>
                        </AuthProvider>
                    </BrowserRouter>
                </OverlayProvider>
            </ToastProvider>
        </ThemeProvider>
    </React.StrictMode>
);
