import { useEffect, useRef, useState } from "react";
import { useMessages } from "../../context/MessagesContext";
import { useAppState } from "../../context/AppStateContext";
import MessageBubble from "./MessageBubble";
import { SkeletonMessage } from "./SkeletonMessage";
import { getAvatarSrc, getInitials } from "../../utils/avatar";
import { formatMessageDate } from "../../utils/formatDate";
import { useUserOverlayActions } from "../../context/OverlayContext";

const WINDOW_SIZE = 300;

function flattenMessages(messages) {
    const rows = [];
    let currentDay = null;
    let lastUser = null;
    let lastMessageTime = null;

    messages.forEach((msg) => {
        const date = formatMessageDate(msg.createdAt);
        const baseTime = new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const isToday = date === "Today";
        const timeLabel = isToday
            ? baseTime
            : `${new Date(msg.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} ${baseTime}`;

        const isFirstInGroup = msg.userGuid !== lastUser;

        if (date !== currentDay) {
            rows.push({
                type: "day",
                id: "day-" + date,
                date
            });
            currentDay = date;
            lastUser = null;
            lastMessageTime = null;
        }

        if (isFirstInGroup) {
            rows.push({
                type: "group-header",
                id: "group-" + msg.messageGuid,
                displayName: msg.displayName || msg.userName,
                userName: msg.userName,
                avatarUrl: msg.avatarKey || msg.avatarUrl || null,
                avatarKey: msg.avatarKey || null,
                userGuid: msg.userGuid,
                timestamp: msg.createdAt,
                timeLabel
            });
            lastUser = msg.userGuid;
            lastMessageTime = msg.createdAt;
        }

        rows.push({
            type: "bubble",
            id: msg.messageGuid,
            message: { ...msg, timeLabel, firstInGroup: isFirstInGroup }
        });
        lastMessageTime = msg.createdAt;
    });

    return rows;
}

export default function MessageList({ searchNavigating = false }) {
    const { selectedChannel } = useAppState();
    const { messages, loadOlderMessages, hasMore } = useMessages();
    const { handleUserClick, handleUserContext } = useUserOverlayActions();

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
            <div className="message-list-empty">
                Select a channel to start chatting.
            </div>
        );
    }

    return (
        <div
            ref={scrollRef}
            onScroll={onScroll}
            className="message-list"
        >
            {!hasMore && visibleRows.length > 0 && (
                <div className="message-list-history">
                    Beginning of history
                </div>
            )}

            {visibleRows.map((row) => {
                if (row.type === "day") {
                    return (
                        <div
                            key={row.id}
                            className="message-list-day"
                        >
                            <span className="message-list-day-line" />
                            {row.date}
                            <span className="message-list-day-line" />
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
                            onClick={(e) => handleUserClick(userSummary, e)}
                            onContextMenu={(e) => handleUserContext(userSummary, e)}
                            className="message-list-group"
                        >
                            <div
                                onContextMenu={(e) => handleUserContext(userSummary, e)}
                                className="avatar avatar--md"
                            >
                                {getAvatarSrc({ avatarKey: row.avatarKey, userGuid: row.userGuid }) ? (
                                    <img
                                        src={getAvatarSrc({ avatarKey: row.avatarKey, userGuid: row.userGuid })}
                                        alt=""
                                        className="avatar"
                                    />
                                ) : (
                                    getInitials(row.displayName || row.userName)
                                )}
                            </div>

                            <div className="message-list-group-meta">
                                <span>{row.displayName}</span>
                                {row.timestamp && (
                                    <span className="message-list-group-time">
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
                            className="message-list-bubble-wrap"
                        >
                            <MessageBubble msg={row.message} />
                        </div>
                    );
                }

                return null;
            })}

            {searchNavigating && (
                <div className="message-list-skeletons">
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
                    className="message-list-jump"
                >
                    Jump to Present
                </div>
            )}
        </div>
    );
}
