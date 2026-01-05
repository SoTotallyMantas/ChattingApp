import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        displayName: "",
        userName: "",
        email: "",
        password: "",
    });

    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        setError(null);

        try {
            await register(form);
            navigate("/"); 
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data ||
                err?.message ||
                "Registration failed";
            setError(typeof msg === "string" ? msg : "Registration failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-shell">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-brand">Voxlock</div>
                    <div className="auth-title">Create your account</div>
                    <div className="auth-subtitle">Join the conversation in seconds.</div>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <label className="auth-label">
                        Display Name
                        <input
                            className="auth-input"
                            type="text"
                            placeholder="Your name"
                            value={form.displayName}
                            onChange={(e) =>
                                setForm({ ...form, displayName: e.target.value })
                            }
                        />
                    </label>

                    <label className="auth-label">
                        Username
                        <input
                            className="auth-input"
                            type="text"
                            placeholder="username"
                            value={form.userName}
                            onChange={(e) =>
                                setForm({ ...form, userName: e.target.value })
                            }
                        />
                    </label>

                    <label className="auth-label">
                        Email
                        <input
                            className="auth-input"
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={(e) =>
                                setForm({ ...form, email: e.target.value })
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
                        {submitting ? "Creating account..." : "Create account"}
                    </button>
                </form>

                <div className="auth-footer">
                    <span>Already have an account?</span>
                    <Link to="/login">Log in</Link>
                </div>
            </div>
        </div>
    );
}
