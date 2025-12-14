import { useEffect, useRef, useState } from "react";
import { useMessages } from "../../context/MessagesContext";
import { useAppState } from "../../context/AppStateContext";
import { flattenMessages } from "../../utils/flattenMessages";
import MessageBubble from "./MessageBubble";
import { SkeletonMessage } from "./SkeletonMessage";
import { getAvatarSrc } from "../../utils/avatar";
import { useOverlay } from "../../context/OverlayContext";
import UserActionsMenu from "../users/UserActionsMenu";

const WINDOW_SIZE = 300;

export default function MessageList({ searchNavigating = false }) {
    const { selectedChannel } = useAppState();
    const { messages, loadOlderMessages, hasMore } = useMessages();
    const { openOverlay, closeOverlay } = useOverlay();

    const scrollRef = useRef(null);
    const loadingRef = useRef(false);
    const stickBottomRef = useRef(true);

    const [visibleRows, setVisibleRows] = useState([]);
    const [topIndex, setTopIndex] = useState(0);
    const [showJump, setShowJump] = useState(false);

    useEffect(() => {
        const flat = flattenMessages(messages);
        const total = flat.length;

        if (total <= WINDOW_SIZE) {
            setTopIndex(0);
            setVisibleRows(flat);
            return;
        }

        const start = topIndex;
        const end = Math.min(total, start + WINDOW_SIZE);

        setVisibleRows(flat.slice(start, end));
    }, [messages, topIndex]);

    const scrollToBottom = (smooth = false) => {
        const el = scrollRef.current;
        if (!el) return;

        if (smooth && el.scrollTo) {
            el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
        } else {
            el.scrollTop = el.scrollHeight;
        }
    };

    useEffect(() => {
        if (stickBottomRef.current) scrollToBottom(false);
    }, [visibleRows]);

    const loadHistory = async () => {
        const el = scrollRef.current;
        if (!el || loadingRef.current || !hasMore) return;

        loadingRef.current = true;

        const oldScroll = el.scrollTop;
        const oldHeight = el.scrollHeight;

        await loadOlderMessages();

        requestAnimationFrame(() => {
            const newHeight = el.scrollHeight;
            el.scrollTop = oldScroll + (newHeight - oldHeight);
            loadingRef.current = false;
        });
    };

    const onScroll = () => {
        const el = scrollRef.current;
        if (!el) return;

        const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
        stickBottomRef.current = dist <= 2;

        setShowJump(dist > 200);

        if (el.scrollTop < 120 && topIndex === 0 && hasMore) {
            loadHistory();
        }
    };

    if (!selectedChannel) {
        return (
            <div
                style={{
                    flex: 1,
                    background: "var(--bg-secondary)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "var(--text-secondary)"
                }}
            >
                Select a channel to start chatting.
            </div>
        );
    }

    return (
        <div
            ref={scrollRef}
            onScroll={onScroll}
            style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px 0 40px",
                background: "var(--bg-secondary)",
                position: "relative"
            }}
        >
            {!hasMore && visibleRows.length > 0 && (
                <div
                    style={{
                        textAlign: "center",
                        padding: "8px 0",
                        color: "var(--text-secondary)",
                        fontSize: 13,
                        opacity: 0.9
                    }}
                >
                    Beginning of history
                </div>
            )}

            {visibleRows.map((row) => {
                if (row.type === "day") {
                    return (
                        <div
                            key={row.id}
                            style={{
                                textAlign: "center",
                                margin: "14px 0",
                                color: "var(--text-secondary)",
                                fontSize: 14,
                                opacity: 0.85,
                                display: "flex",
                                alignItems: "center",
                                gap: 10
                            }}
                        >
                            <span style={{ flex: 1, height: 1, background: "var(--border-color)" }} />
                            {row.date}
                            <span style={{ flex: 1, height: 1, background: "var(--border-color)" }} />
                        </div>
                    );
                }

                if (row.type === "group-header") {
                    const userSummary = {
                        userGuid: row.userGuid,
                        displayName: row.displayName,
                        userName: row.userName,
                        avatarKey: row.avatarKey
                    };
                    return (
                        <div
                            key={row.id}
                            onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-tertiary)"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                            onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                openOverlay("user-actions", {
                                    component: (
                                        <UserActionsMenu
                                            user={userSummary}
                                            x={rect.left + 10}
                                            y={rect.bottom + 4}
                                            onAction={() => closeOverlay()}
                                            canKick={false}
                                            canBan={false}
                                        />
                                    )
                                });
                            }}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                openOverlay("user-actions", {
                                    component: (
                                        <UserActionsMenu
                                            user={userSummary}
                                            x={e.clientX}
                                            y={e.clientY}
                                            onAction={() => closeOverlay()}
                                            canKick={false}
                                            canBan={false}
                                        />
                                    )
                                });
                            }}
                            style={{
                                display: "flex",
                                gap: 12,
                                padding: "6px 12px",
                                marginTop: 6,
                                minHeight: 50,
                                borderRadius: 10,
                                cursor: "pointer",
                                transition: "background 120ms ease"
                            }}
                        >
                            <div
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    openOverlay("user-actions", {
                                        component: (
                                            <UserActionsMenu
                                                user={userSummary}
                                                canKick={false}
                                                canBan={false}
                                                x={e.clientX}
                                                y={e.clientY}
                                                onAction={() => closeOverlay()}
                                            />
                                        )
                                    });
                                }}
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: "50%",
                                    background: "var(--bg-tertiary)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 700,
                                    color: "var(--text-primary)",
                                    overflow: "hidden"
                                }}
                            >
                                {getAvatarSrc({ avatarKey: row.avatarKey, userGuid: row.userGuid }) ? (
                                    <img
                                        src={getAvatarSrc({ avatarKey: row.avatarKey, userGuid: row.userGuid })}
                                        alt=""
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover"
                                        }}
                                    />
                                ) : (
                                    (row.displayName || row.userName || "?").charAt(0).toUpperCase()
                                )}
                            </div>

                            <div
                                style={{
                                    fontWeight: 600,
                                    color: "var(--text-primary)",
                                    marginTop: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8
                                }}
                            >
                                <span>{row.displayName}</span>
                                {row.timestamp && (
                                    <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                                        {new Date(row.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                }

                if (row.type === "bubble") {
                    return (
                        <div
                            key={row.id}
                            id={`msg-${row.message.messageGuid}`}
                            style={{
                                paddingLeft: 64,
                                paddingRight: 32
                            }}
                        >
                            <MessageBubble msg={row.message} />
                        </div>
                    );
                }

                return null;
            })}

            {searchNavigating && (
                <div style={{ padding: "0 16px" }}>
                    <SkeletonMessage />
                    <SkeletonMessage />
                    <SkeletonMessage />
                </div>
            )}

            {showJump && (
                <div
                    onClick={() => {
                        stickBottomRef.current = true;
                        scrollToBottom(true);
                        setShowJump(false);
                    }}
                    style={{
                        position: "fixed",
                        bottom: 80,
                        right: 30,
                        padding: "8px 12px",
                        background: "var(--bg-primary)",
                        border: `1px solid var(--border-color)`,
                        borderRadius: 6,
                        cursor: "pointer",
                        zIndex: 9999,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                        color: "var(--text-primary)",
                        fontSize: 13
                    }}
                >
                    Jump to Present
                </div>
            )}
        </div>
    );
}
