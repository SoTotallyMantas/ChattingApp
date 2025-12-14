import { useMemo, useState } from "react";
import { useFriends } from "../hooks/useFriends";

export default function DMSidebar() {
    const { friends, loading } = useFriends();
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return friends;

        return friends.filter((f) =>
            (f.displayName || "").toLowerCase().includes(q) ||
            (f.userName || "").toLowerCase().includes(q)
        );
    }, [friends, query]);

    return (
        <div
            style={{
                width: 250,
                background: "linear-gradient(180deg, var(--bg-secondary), var(--bg-primary))",
                borderRight: `1px solid var(--border-color)`,
                padding: 10,
                display: "flex",
                flexDirection: "column",
                height: "100%",
                boxSizing: "border-box",
                overflowY: "auto",
                overflowX: "hidden"
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12
                }}
            >
                <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 15 }}>
                    Direct Messages
                </div>
                <button
                    style={ghostBtn}
                    title="Start a DM (placeholder)"
                >
                    +
                </button>
            </div>

            <div style={{ marginBottom: 12 }}>
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search friends"
                    style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: `1px solid var(--border-color)`,
                        background: "var(--bg-tertiary)",
                        color: "var(--text-primary)"
                    }}
                />
            </div>

            <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", paddingRight: 4, display: "flex", flexDirection: "column", gap: 6 }}>
                {loading && (
                    <div style={{ color: "var(--text-secondary)", padding: "6px 4px" }}>
                        Loading friends...
                    </div>
                )}

                {!loading && filtered.length === 0 && (
                    <div style={{ color: "var(--text-secondary)", padding: "6px 4px" }}>
                        No friends found.
                    </div>
                )}

                {!loading && filtered.map((friend) => (
                    <div
                        key={friend.friendshipGuid}
                        style={{
                            padding: "8px 10px",
                            borderRadius: 10,
                            background: "var(--bg-tertiary)",
                            color: "var(--text-primary)",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            cursor: "pointer"
                        }}
                        title={friend.userName}
                    >
                        <div
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                background: "var(--bg-hover)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                fontSize: 12
                            }}
                        >
                            {getInitials(friend.displayName || friend.userName)}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600 }}>{friend.displayName}</div>
                            <div style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    background: presenceColor(friend.presence || friend.relationshipStatus)
                                }} />
                                {friend.presence || "offline"}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const ghostBtn = {
    width: 28,
    height: 28,
    borderRadius: 8,
    border: `1px solid var(--border-color)`,
    background: "var(--bg-tertiary)",
    color: "var(--text-primary)",
    cursor: "pointer",
    fontWeight: 700
};

function getInitials(text = "") {
    return text.slice(0, 2).toUpperCase();
}

function presenceColor(presence) {
    if (!presence) return "var(--border-color)";
    const lower = presence.toLowerCase();
    if (lower === "online") return "#4ade80";
    if (lower === "away" || lower === "idle") return "#facc15";
    if (lower === "dnd" || lower === "busy") return "#f87171";
    return "var(--border-color)";
}
