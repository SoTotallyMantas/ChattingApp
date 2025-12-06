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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            await login(form.emailOrUsername, form.password);
            navigate("/"); 
        } catch (err) {
            setError(err.response?.data || "Login failed");
        }
    };

    return (
        <div className="auth-page">
            <h1>Login</h1>

            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Email or Username"
                    value={form.emailOrUsername}
                    onChange={(e) =>
                        setForm({ ...form, emailOrUsername: e.target.value })
                    }
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                    }
                />

                <button type="submit">Login</button>
            </form>

            <div style={{ marginTop: "10px" }}>
                <Link to="/register">Don't have an account? Register</Link>
            </div>
        </div>
    );
}
