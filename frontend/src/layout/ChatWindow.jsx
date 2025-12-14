import { useState,useRef,useEffect } from "react";
import VideoGrid from "../components/media/VideoGrid";
import { useMediaState } from "../context/MediaContext";  
import { useAppState } from "../context/AppStateContext";
import { MessagesProvider } from "../context/MessagesContext";
import { useMessages } from "../context/MessagesContext";
import MessageList from "../components/chat/MessageList";
import MessageInput from "../components/chat/MessageInput";
import MembersSidebar from "./ServerMembersSidebar";
import SearchIcon from "../components/icons/SearchIcon";

export default function ChatWindow() {
    const { selectedChannel, membersSidebarOpen, setMembersSidebarOpen } = useAppState();
    const media = useMediaState();  
    const [searchQuery, setSearchQuery] = useState("");
    const [searchNavigating, setSearchNavigating] = useState(false);

    if (!selectedChannel)
        return (
            <div style={{
                flex: 1,
                background: "var(--bg-secondary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-secondary)"
            }}>
                Select a channel
            </div>
        );

    const isVoice = selectedChannel.channelType === "voice";
    const guid = selectedChannel.channelGuid;

    if (isVoice) {
        return (
            <div style={{ display: "flex", flex: 1, background: "var(--bg-secondary)", flexDirection: "column" }}>
                <TopBar
                    title={selectedChannel.channelName}
                    membersOpen={membersSidebarOpen}
                    onToggleMembers={() => setMembersSidebarOpen((v) => !v)}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />
                <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
                    <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column" }}>
                       
                        <VideoGrid tiles={media.videoTiles} />
                    </div>

                    
                    <MembersSidebar />
                </div>
            </div>
        );
    }

    return (
        <MessagesProvider channelGuid={selectedChannel.channelGuid}>
            <div style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                background: "var(--bg-secondary)"
            }}>
                <TopBar
                    title={`# ${selectedChannel.channelName}`}
                    membersOpen={membersSidebarOpen}
                    onToggleMembers={() => setMembersSidebarOpen((v) => !v)}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onNavigateStateChange={setSearchNavigating}
                />
                <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
                    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, position: "relative" }}>
                        <MessageList searchNavigating={searchNavigating} />
                        <MessageInput />
                    </div>
                    <MembersSidebar />
                </div>
            </div>
        </MessagesProvider>
    );
}

function TopBar({ title, membersOpen, onToggleMembers, searchQuery, onSearchChange, onNavigateStateChange }) {
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
        <div
            style={{
                height: 48,
                display: "flex",
                alignItems: "center",
                padding: "0 12px",
                borderBottom: `1px solid var(--border-color)`,
                background: "var(--bg-secondary)",
                gap: 8,
                position: "relative"
            }}
        >
            <div style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: 15 }}>
                {title}
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                    ref={inputRef}
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onKeyDown={onKey}
                    placeholder="Search messages"
                    style={{
                        height: 30,
                        minWidth: 200,
                        padding: "0 34px 0 10px",
                        borderRadius: 6,
                        border: `1px solid var(--border-color)`,
                        background: "var(--bg-primary)",
                        color: "var(--text-primary)"
                    }}
                />
                <button
                    onClick={triggerSearch}
                    disabled={searching}
                    style={{
                        position: "absolute",
                        right: 4,
                        top: 4,
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        border: `1px solid var(--border-color)`,
                        background: "var(--bg-primary)",
                        color: "var(--text-primary)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 12,
                        opacity: searching ? 0.6 : 1,
                        padding: 0
                    }}
                    title="Search"
                >
                    <SearchIcon size={16} />
                </button>
                {searchMode && (
                    <button
                        onClick={clearSearch}
                        style={{
                            marginLeft: 6,
                            height: 30,
                            padding: "0 8px",
                            borderRadius: 6,
                            border: `1px solid var(--border-color)`,
                            background: "var(--bg-primary)",
                            color: "var(--text-primary)",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: 12
                        }}
                        title="Clear search"
                    >
                        Clear
                    </button>
                )}
                {searchMode && results.length > 0 && (
                    <div
                        ref={dropdownRef}
                        style={{
                            position: "absolute",
                            top: 38,
                            left: 0,
                            minWidth: 260,
                            maxWidth: 420,
                            maxHeight: 320,
                            overflowY: "auto",
                            background: "var(--bg-secondary)",
                            border: `1px solid var(--border-color)`,
                            borderRadius: 10,
                            boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
                            zIndex: 20,
                            padding: 8
                        }}
                    >
                        <div style={{ color: "var(--text-secondary)", fontSize: 12, marginBottom: 6 }}>
                            Showing {results.length} result(s){searchQuery ? ` for "${searchQuery}"` : ""}
                        </div>
                        {results.slice(0, 20).map((m) => (
                            <div
                                key={m.messageGuid}
                                style={{
                                    padding: "6px 8px",
                                    borderRadius: 6,
                                    border: `1px solid var(--border-color)`,
                                    background: "var(--bg-tertiary)",
                                    color: "var(--text-primary)",
                                    fontSize: 13,
                                    marginBottom: 6,
                                    cursor: "pointer"
                                }}
                                onClick={() => focusMessage(m.messageGuid)}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                                    <div style={{ fontWeight: 600 }}>
                                        {m.displayName || m.userName || "User"}
                                    </div>
                                    <div style={{ color: "var(--text-secondary)", fontSize: 11, whiteSpace: "nowrap" }}>
                                        {formatResultDate(m.createdAt)}
                                    </div>
                                </div>
                                <div style={{ color: "var(--text-secondary)" }}>
                                    {m.content || "(no text)"}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <button
                onClick={onToggleMembers}
                style={{
                    height: 30,
                    padding: "0 10px",
                    borderRadius: 6,
                    border: `1px solid var(--border-color)`,
                    background: "var(--bg-primary)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 13
                }}
                title={membersOpen ? "Hide members" : "Show members"}
            >
                {membersOpen ? "Hide members" : "Show members"}
            </button>
        </div>
    );
}
