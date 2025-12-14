import { useMemo, useState } from "react";
import { useServers } from "../hooks/useServers";
import { useAppState } from "../context/AppStateContext";
import { useOverlay } from "../context/OverlayContext";
import SearchIcon from "../components/icons/SearchIcon";
import DMIcon from "../components/icons/DMIcon";
import { getServerIconSrc } from "../utils/serverIcon";

export default function ServerSidebar() {
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    const { servers, loadServers } = useServers();
    const { selectedServer, setSelectedServer } = useAppState();
    const { openOverlay } = useOverlay();

    const openServerActionMenu = () => {
        openOverlay("server-action", {
            onCreate: () =>
                openOverlay("create-server", { onCreated: loadServers }),

            onJoin: () =>
                openOverlay("join-server", { onJoined: loadServers })
        });
    };

    const filteredServers = servers.filter((s) =>
        s.serverName.toLowerCase().includes(searchValue.toLowerCase())
    );

    return (
        <div
            style={{
                position: "relative",
                width: 80,
                background: "var(--bg-secondary)",
                padding: 10,
                borderRight: `1px solid var(--border-color)`,
                color: "var(--text-primary)",
                display: "flex",
                flexDirection: "column",
                height: "100%"
            }}
        >
            <div style={{ flex: 1, overflowY: "auto" }}>
                <IconButton
                    onClick={() => setSearchOpen((v) => !v)}
                    icon={<SearchIcon size={20} />}
                    label="Search"
                />

                <IconButton
                    onClick={() => setSelectedServer(null)}
                    icon={<DMIcon size={20} />}
                    label="Direct Messages"
                />

                <div onClick={openServerActionMenu} style={icon} title="Create / Join server">
                    +
                </div>

                {filteredServers.map((s) => {
                    const isSelected = selectedServer?.serverGuid === s.serverGuid;
                    const iconUrl = getServerIconSrc(s);

                    return (
                        <div
                            key={s.serverGuid}
                            style={{
                                ...icon,
                                background: "var(--bg-tertiary)",
                                boxShadow: isSelected ? "0 0 0 3px var(--accent)" : "none",
                                border: isSelected ? `1px solid var(--accent)` : `1px solid var(--border-color)`
                            }}
                            onClick={() => {
                                setSelectedServer(s);
                            }}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                openOverlay("server-menu", {
                                    server: s,
                                    x: e.clientX,
                                    y: e.clientY
                                });
                            }}
                        >
                            {iconUrl ? (
                                <img
                                    src={iconUrl}
                                    alt={s.serverName}
                                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                                />
                            ) : (
                                s.serverName[0]
                            )}
                        </div>
                    );
                })}
            </div>

            {searchOpen && (
                <div
                    style={{
                        position: "absolute",
                        top: 10,
                        left: 80,
                        width: 220,
                        padding: 10,
                        background: "var(--bg-secondary)",
                        border: `1px solid var(--border-color)`,
                        borderRadius: 10,
                        boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        zIndex: 10
                    }}
                >
                    <input
                        autoFocus
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder="Search servers or DMs"
                        style={{
                            flex: 1,
                            padding: "8px 10px",
                            borderRadius: 8,
                            border: `1px solid var(--border-color)`,
                            background: "var(--bg-tertiary)",
                            color: "var(--text-primary)"
                        }}
                    />
                    <button
                        onClick={() => setSearchOpen(false)}
                        style={{
                            border: "none",
                            background: "var(--bg-tertiary)",
                            color: "var(--text-primary)",
                            borderRadius: 8,
                            cursor: "pointer",
                            padding: "8px 10px"
                        }}
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
}

const icon = {
    width: 50,
    height: 50,
    margin: "10px auto",
    background: "var(--bg-tertiary)",
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "var(--text-primary)",
    fontSize: 20,
    userSelect: "none",
    overflow: "hidden",
    transition: "box-shadow 120ms ease, border 120ms ease"
};

const actionIcon = {
    width: 44,
    height: 44,
    margin: "8px auto",
    background: "transparent",
    borderRadius: 10,
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "var(--text-primary)",
    fontSize: 18,
    userSelect: "none",
    border: `1px solid var(--border-color)`
};

function IconButton({ onClick, icon, label }) {
    return (
        <button
            onClick={onClick}
            title={label}
            style={{
                ...actionIcon,
                border: `1px solid var(--border-color)`,
                padding: 0,
                background: "var(--bg-secondary)"
            }}
        >
            <div style={{ color: "var(--text-primary)" }}>
                {icon}
            </div>
        </button>
    );
}
