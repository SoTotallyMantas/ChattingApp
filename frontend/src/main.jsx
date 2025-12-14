import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import 'virtual:webrtc-adapter-global';
import App from "./App";
import Login from "./features/auth/login";
import Register from "./features/auth/register";
import ProtectedRoute from "./routing/ProtectedRoute";
import OverlayRoot from "./common/OverlayRoot";
import { OverlayProvider } from "./context/OverlayContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { AppStateProvider } from "./context/AppStateContext";

import { MediaProvider } from "./context/MediaContext";


import "./theme.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <ThemeProvider>
            <ToastProvider>
                <AuthProvider>
                    <BrowserRouter>
                        <AppStateProvider>
                            <MediaProvider>
                                <OverlayProvider>
                                    <Routes>
                                        <Route path="/login" element={<Login />} />
                                        <Route path="/register" element={<Register />} />
                                        <Route
                                            path="/*"
                                            element={
                                                <ProtectedRoute>
                                                    <App />
                                                    <OverlayRoot />
                                                </ProtectedRoute>
                                            }
                                        />
                                    </Routes>
                                </OverlayProvider>
                            </MediaProvider>
                        </AppStateProvider>
                    </BrowserRouter>
                </AuthProvider>
            </ToastProvider>
        </ThemeProvider>
    </React.StrictMode>
);
