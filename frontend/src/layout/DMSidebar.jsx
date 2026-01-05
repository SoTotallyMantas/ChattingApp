import { useMemo, useState } from "react";
import { useFriends } from "../hooks/useFriends";
import { startDm } from "../api/dms";
import { useAppState } from "../context/AppStateContext";
import { useToast } from "../context/ToastContext";
import { getAvatarSrc, getInitials } from "../utils/avatar";
import { useOverlay, useUserOverlayActions } from "../context/OverlayContext";
export default function DMSidebar() {
    const { friends, loading } = useFriends();
    const [query, setQuery] = useState("");
    const { setSelectedServer, setSelectedChannel, setServerSettingsOpen } = useAppState();
    const toast = useToast();
    const { openOverlay } = useOverlay();
    const { handleUserClick, handleUserContext } = useUserOverlayActions();
    const openDm = async (friend) => {
        try {
            const data = await startDm(friend.friendGuid);
            setServerSettingsOpen(false);
            setSelectedServer(data.server);
            setSelectedChannel(data.channel);
        } catch {
            toast.show("error", "Failed to open DM.");
        }
    };

    const filtered = useMemo(() => {
        const list = Array.isArray(friends) ? friends : [];
        const q = query.trim().toLowerCase();
        if (!q) return list;

        return list.filter((f) => {
            const displayName = (f.displayName || "").toLowerCase();
            const userName = (f.userName || "").toLowerCase();
            return displayName.includes(q) || userName.includes(q);
        });
    }, [friends, query]);

    return (
        <div className="dm-sidebar">
            <div className="dm-sidebar-header">
                <div className="dm-sidebar-title">
                    Direct Messages
                </div>
                <button
                    className="dm-sidebar-new"
                    title="Find users"
                    type="button"
                    onClick={() => openOverlay("user-search")}
                >
                    +
                </button>
            </div>

            <div className="dm-sidebar-search">
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search friends"
                    className="input"
                />
            </div>

            <div className="dm-sidebar-list">
                {loading && (
                    <div className="dm-sidebar-muted">
                        Loading friends...
                    </div>
                )}

                {!loading && filtered.length === 0 && (
                    <div className="dm-sidebar-muted">
                        No friends found.
                    </div>
                )}

                {!loading && filtered.map((friend) => {
                    const displayName = friend.displayName || friend.userName || "Unknown";
                    const userOverlay = {
                        userGuid: friend.friendGuid,
                        displayName,
                        userName: friend.userName,
                        avatarKey: friend.avatarKey,
                        presence: friend.presence  
                    };
                    const avatarSrc = getAvatarSrc({ avatarKey: friend.avatarKey, userGuid: friend.friendGuid });
                    return (
                    <div
                        key={friend.friendshipGuid}
                        className="channel-row"
                        title={friend.userName}
                        onClick={() => openDm(friend)}
                        onContextMenu={(e) => handleUserContext(userOverlay, e)}
                    >
                        <div className="avatar avatar--md">
                          {avatarSrc ? (
                             <img
                                src={avatarSrc}
                                alt={displayName}
                                className="avatar"
                             /> 
                          ) : (
                             getInitials(displayName)
                          )}
                        </div>
                        <div className="dm-sidebar-info">
                            <div className="dm-sidebar-name">{displayName}</div>
                            <div className="dm-sidebar-presence">
                                <span
                                    className="dm-sidebar-presence-dot"
                                    style={{
                                        background: presenceColor(friend.presence || friend.relationshipStatus)
                                    }}
                                />
                                {friend.presence || "offline"}
                            </div>
                        </div>
                    </div>
                    );
                })}
            </div>
        </div>
    );
}



function presenceColor(presence) {
    if (!presence) return "var(--border-color)";
    const lower = presence.toLowerCase();
    if (lower === "online") return "#4ade80";
    if (lower === "away" || lower === "idle") return "#facc15";
    if (lower === "dnd" || lower === "busy") return "#f87171";
    return "var(--border-color)";
}
