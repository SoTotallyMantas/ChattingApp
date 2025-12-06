import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

export default function Register() {
    const { register} = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        displayName: "",
        userName: "",
        email: "",
        password: "",
    });

    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            await register(form);
            navigate("/"); 
        } catch (err) {
            setError(err.response?.data || "Registration failed");
        }
    };

    return (
        <div className="auth-page">
            <h1>Register</h1>

            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Display Name"
                    value={form.displayName}
                    onChange={(e) =>
                        setForm({ ...form, displayName: e.target.value })
                    }
                />

                <input
                    type="text"
                    placeholder="Username"
                    value={form.userName}
                    onChange={(e) =>
                        setForm({ ...form, userName: e.target.value })
                    }
                />

                <input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
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

                <button type="submit">Register</button>
               
            </form>
            <div style={{ marginTop: "10px" }}>
                <Link to="/login"> have an account? Login</Link>
            </div>
        </div>
    );
}
