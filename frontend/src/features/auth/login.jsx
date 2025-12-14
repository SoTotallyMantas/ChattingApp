import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        emailOrUsername: "",
        password: "",
    });

    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (submitting) return;
        setSubmitting(true);

        try {
            await login(form.emailOrUsername, form.password);
            navigate("/");
        } catch (err) {
            const status = err?.response?.status;
            const msg =
                (status === 403 || status === 401)
                    ? "Wrong username/email or password"
                    : err?.response?.data?.message ||
                      err?.response?.data ||
                      err?.message ||
                      "Login failed";
            setError(typeof msg === "string" ? msg : "Login failed");
        }
        setSubmitting(false);
    };

    return (
        <div className="auth-shell">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-brand">Voxlock</div>
                    <div className="auth-title">Welcome back</div>
                    <div className="auth-subtitle">Sign in to keep the conversation going.</div>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <label className="auth-label">
                        Email or Username
                        <input
                            className="auth-input"
                            type="text"
                            placeholder="you@example.com"
                            value={form.emailOrUsername}
                            onChange={(e) =>
                                setForm({ ...form, emailOrUsername: e.target.value })
                            }
                        />
                    </label>

                    <label className="auth-label">
                        Password
                        <input
                            className="auth-input"
                            type="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={(e) =>
                                setForm({ ...form, password: e.target.value })
                            }
                        />
                    </label>

                    <button className="auth-button" type="submit" disabled={submitting}>
                        {submitting ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                <div className="auth-footer">
                    <span>New here?</span>
                    <Link to="/register">Create an account</Link>
                </div>
            </div>
        </div>
    );
}
