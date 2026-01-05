import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { addWhitelistEntry, deleteWhitelistEntry, fetchWhitelist } from "../../api/whitelist";

export default function AdminWhitelist() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [items, setItems] = useState([]);
    const [email, setEmail] = useState("");
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) return;
        if (!user.isSystemAdmin) {
            navigate("/");
            return;
        }
        load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.isSystemAdmin]);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchWhitelist();
            setItems(data || []);
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data ||
                err?.message ||
                "Failed to load whitelist.";
            setError(typeof msg === "string" ? msg : "Failed to load whitelist.");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        setError(null);
        try {
            const trimmed = email.trim().toLowerCase();
            if (!trimmed) {
                setError("Please enter an email address.");
                return;
            }
            const created = await addWhitelistEntry(trimmed);
            setItems((prev) => [...prev, created].sort((a, b) => a.email.localeCompare(b.email)));
            setEmail("");
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data ||
                err?.message ||
                "Failed to add email.";
            setError(typeof msg === "string" ? msg : "Failed to add email.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemove = async (id) => {
        try {
            await deleteWhitelistEntry(id);
            setItems((prev) => prev.filter((i) => i.whitelistGuid !== id));
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data ||
                err?.message ||
                "Failed to remove email.";
            setError(typeof msg === "string" ? msg : "Failed to remove email.");
        }
    };

    const normalizedQuery = query.trim().toLowerCase();
    const visibleItems = normalizedQuery
        ? items.filter((item) => (item?.email || "").toLowerCase().includes(normalizedQuery))
        : items;

    return (
        <div className="admin-whitelist-page">
            <div className="list-panel">
                <div className="admin-whitelist-heading">
                    <div className="panel-title">Registration whitelist</div>
                    <div className="panel-subtitle">
                        Only system administrators can edit this list.
                    </div>
                </div>

                <form
                    onSubmit={handleAdd}
                    className="admin-whitelist-form"
                >
                    <input
                        type="email"
                        placeholder="user@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input"
                    />
                    <button
                        type="submit"
                        disabled={submitting}
                        className="button"
                    >
                        {submitting ? "Adding..." : "Add"}
                    </button>
                </form>

                <div className="admin-whitelist-search">
                    <input
                        type="text"
                        placeholder="Search emails..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="input"
                    />
                </div>

                {error && (
                    <div className="admin-whitelist-error">
                        {error}
                    </div>
                )}

                <div className="admin-whitelist-list">
                    {loading ? (
                        <div className="admin-whitelist-muted">Loading...</div>
                    ) : visibleItems.length === 0 ? (
                        <div className="admin-whitelist-muted">
                            {normalizedQuery ? "No matches found." : "No addresses yet."}
                        </div>
                    ) : (
                        visibleItems.map((item) => (
                            <div
                                key={item.whitelistGuid}
                                className="admin-whitelist-item"
                            >
                                <div className="admin-whitelist-email">{item.email}</div>
                                <button
                                    onClick={() => handleRemove(item.whitelistGuid)}
                                    className="button"
                                >
                                    Remove
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
