import { useState, useRef, useEffect } from "react";
import VideoGrid from "../components/media/VideoGrid";
import { useMediaState } from "../context/MediaContext";
import { useAppState } from "../context/AppStateContext";
import { MessagesProvider } from "../context/MessagesContext";
import { useMessages } from "../context/MessagesContext";
import { useFriends } from "../hooks/useFriends";
import MessageList from "../components/chat/MessageList";
import MessageInput from "../components/chat/MessageInput";
import MembersSidebar from "./ServerMembersSidebar";
import SearchIcon from "../components/icons/SearchIcon";
import { getAvatarSrc, getInitials } from "../utils/avatar";

export default function ChatWindow() {
    const { selectedServer, selectedChannel, membersSidebarOpen, setMembersSidebarOpen } = useAppState();
    const media = useMediaState();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchNavigating, setSearchNavigating] = useState(false);
    const { incoming, accept, reject, block, unblock, blocked, loading } = useFriends();
    const renderRequests = () => (
        <div className="dm-requests-banner">
            <div className="dm-requests-header">Friend requests</div>
            {loading && <div className="dm-sidebar-muted">Loading...</div>}
            {!loading && incoming.length === 0 && (
                <div className="dm-sidebar-muted">No pending requests</div>
            )}
            {!loading && incoming.map((req) => {
                const avatarSrc = getAvatarSrc({ avatarKey: req.avatarKey, userGuid: req.friendGuid });
                const initials = getInitials(req.displayName || req.userName);
                return(
                <div key={req.friendshipGuid} className="dm-request-row">
                    <div className="dm-request-user">
                        <div className="avatar avatar--sm">
                            {avatarSrc ? (
                                <img
                                    src={avatarSrc}
                                    alt={req.displayName || req.userName}
                                    className="avatar"
                                />
                            ) : (
                                initials
                            )}
                        </div>
                        <div className="dm-request-meta">
                            <strong>{req.displayName || req.userName}</strong>
                            <span className="dm-request-status">{req.relationshipStatus}</span>
                        </div>
                    </div>
                    <div className="dm-request-actions">
                        <button onClick={() => accept(req.friendshipGuid)} type="button">Accept</button>
                        <button onClick={() => reject(req.friendshipGuid)} type="button">Reject</button>
                        <button onClick={() => block(req.friendshipGuid)} type="button">Block</button>
                    </div>
                </div>
                );
            })}

            {!loading && blocked.length > 0 && (
                <>
                    <div className="dm-requests-header">Blocked Users</div>
                    {blocked.map((entry) => {
                        const avatarSrc = getAvatarSrc({ avatarKey: entry.avatarKey, userGuid: entry.friendGuid });
                        const initials = getInitials(entry.displayName || entry.userName);
                        return (
                            <div key={entry.friendshipGuid} className="dm-request-row">
                                <div className="dm-request-user">
                                    <div className="avatar avatar--sm">
                                        {avatarSrc ? (
                                            <img
                                                src={avatarSrc}
                                                alt={entry.displayName || entry.userName}
                                                className="avatar"
                                            />
                                        ) : (
                                            initials
                                        )}
                                    </div>
                                    <div className="dm-request-meta">
                                        <strong>{entry.displayName || entry.userName}</strong>
                                        <span className="dm-request-status">{entry.relationshipStatus}</span>
                                    </div>
                                </div>  
                                <div className="dm-request-actions">
                                    <button onClick={() => unblock(entry.friendshipGuid)} type="button">Unblock</button>
                                </div>
                            </div>
                        );
                    })}
                </>
            )}
        </div>
    );
      
    if (!selectedServer) {
    return (
        <div className="chat-window">
            <div className="chat-window-body">
                <div className="chat-window-main dm-requests-page">
                    {renderRequests()}
                </div>
            </div>
        </div>
    );
}

    if (!selectedChannel)
        return (
            <div className="chat-window-empty">
                <div>Select a channel</div>
            </div>
        );

    const isVoice = selectedChannel.channelType === "voice";
    const isDm = selectedChannel.channelType === "dm";
    const chatTitle = isDm
        ? (selectedServer?.serverName || selectedChannel.channelName)
        : `# ${selectedChannel.channelName}`;
    if (isVoice) {
        return (
            <div className="chat-window">
                <TopBar
                    hidden
                    title={selectedChannel.channelName}
                    membersOpen={membersSidebarOpen}
                    onToggleMembers={() => setMembersSidebarOpen((v) => !v)}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />
                <div className="chat-window-body">
                    <div className="chat-window-main">
                        <VideoGrid tiles={media.videoTiles} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <MessagesProvider channelGuid={selectedChannel.channelGuid}>
            <div className="chat-window">
                <TopBar
                    title={chatTitle}
                    membersOpen={membersSidebarOpen}
                    onToggleMembers={() => setMembersSidebarOpen((v) => !v)}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onNavigateStateChange={setSearchNavigating}
                    showMembersToggle={!isDm}
                />
                <div className="chat-window-body">
                    <div className="chat-window-main">
                        <MessageList searchNavigating={searchNavigating} />
                        <MessageInput />
                    </div>
                    {!isDm && <MembersSidebar />}
                </div>
            </div>
        </MessagesProvider>
    );
}

function TopBar({
    title,
    membersOpen,
    onToggleMembers,
    searchQuery,
    onSearchChange,
    onNavigateStateChange,
    hidden = false,
    showMembersToggle = true
}) {
    if (hidden) return null;
    const messagesCtx = useMessages();
    const search = messagesCtx?.search;
    const searching = messagesCtx?.searching ?? false;
    const searchMode = messagesCtx?.searchMode ?? false;
    const clearSearch = messagesCtx?.clearSearch;
    const results = messagesCtx?.searchResults ?? [];
    const hasMore = messagesCtx?.hasMore ?? false;
    const loadOlderMessages = messagesCtx?.loadOlderMessages;
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    const formatResultDate = (iso) => {
        if (!iso) return "";
        const d = new Date(iso);
        return d.toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const triggerSearch = () => {
        if (!search) return;
        search(searchQuery);
    };

    const focusMessage = async (messageGuid) => {
        const tryFind = () => document.getElementById(`msg-${messageGuid}`);
        let el = tryFind();
        let attempts = 0;

        onNavigateStateChange?.(true);
        while (!el && hasMore && attempts < 15) {
            attempts++;
            if (loadOlderMessages) {
                await loadOlderMessages();
                await new Promise((resolve) => requestAnimationFrame(resolve));
                el = tryFind();
            } else {
                break;
            }
        }

        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        onNavigateStateChange?.(false);
    };

    const onKey = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            triggerSearch();
        }
        if (e.key === "Escape") {
            clearSearch?.();
            onSearchChange("");
        }
    };

    useEffect(() => {
        const handler = (e) => {
            const drop = dropdownRef.current;
            const input = inputRef.current;
            if (!drop && !input) return;
            if (
                searchMode &&
                drop &&
                input &&
                !drop.contains(e.target) &&
                !input.contains(e.target)
            ) {
                clearSearch?.();
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [searchMode, clearSearch]);

    useEffect(() => {
        const keyHandler = (e) => {
            if (e.key === "Escape") {
                clearSearch?.();
                onSearchChange("");
            }
        };
        document.addEventListener("keydown", keyHandler);
        return () => document.removeEventListener("keydown", keyHandler);
    }, [clearSearch, onSearchChange]);

    return (
        <div className="chat-topbar">
            <div className="chat-topbar-title">
                {title}
            </div>
            <div className="chat-topbar-spacer" />
            <div className="chat-topbar-search">
                <input
                    ref={inputRef}
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onKeyDown={onKey}
                    placeholder="Search messages"
                    className="chat-topbar-search-input"
                />
                <button
                    onClick={triggerSearch}
                    disabled={searching}
                    className="button"
                    title="Search"
                    type="button"
                >
                    <SearchIcon size={16} />
                </button>
                {searchMode && results.length > 0 && (
                    <div
                        ref={dropdownRef}
                        className="chat-topbar-results"
                    >
                        <div className="chat-topbar-results-meta">
                            Showing {results.length} result(s){searchQuery ? ` for "${searchQuery}"` : ""}
                        </div>
                        {results.slice(0, 20).map((m) => (
                            <div
                                key={m.messageGuid}
                                className="chat-topbar-result"
                                onClick={() => focusMessage(m.messageGuid)}
                            >
                                <div className="chat-topbar-result-header">
                                    <div className="chat-topbar-result-name">
                                        {m.displayName || m.userName || "User"}
                                    </div>
                                    <div className="chat-topbar-result-time">
                                        {formatResultDate(m.createdAt)}
                                    </div>
                                </div>
                                <div className="chat-topbar-result-content">
                                    {m.content || "(no text)"}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {showMembersToggle && (
                <button
                    onClick={onToggleMembers}
                    className="chat-topbar-members"
                    title={membersOpen ? "Hide members" : "Show members"}
                    type="button"
                >
                    {membersOpen ? "Hide members" : "Show members"}
                </button>
            )}
        </div>
    );
}
