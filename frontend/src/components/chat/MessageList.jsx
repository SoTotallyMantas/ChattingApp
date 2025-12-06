import { useRef, useState, useLayoutEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useMessages } from "../../context/MessagesContext";
import { useAppState } from "../../context/AppStateContext";
import { flattenMessages } from "../../utils/flattenMessages";
import MessageBubble from "./MessageBubble";

export default function MessageList() {
    const { selectedChannel } = useAppState();
    const { messages, loadOlderMessages, hasMore } = useMessages();

    const scrollRef = useRef(null);
    const isLoadingRef = useRef(false);
    const [showJump, setShowJump] = useState(false);
    const stickToBottomRef = useRef(true);

    if (!selectedChannel) {
        return (
            <div
                style={{
                    flex: 1,
                    background: "var(--bg-secondary)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "var(--text-secondary)",
                }}
            >
                Select a channel to start chatting.
            </div>
        );
    }

    const rows = flattenMessages(messages);

    const virtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: () => 56,
        overscan: 12,
    });

    const items = virtualizer.getVirtualItems();

    const scrollToBottom = () => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
    };

    const loadHistory = async () => {
        if (!hasMore || isLoadingRef.current) return;
        const el = scrollRef.current;
        if (!el) return;

        isLoadingRef.current = true;

        const prevScrollHeight = el.scrollHeight;
        const prevScrollTop = el.scrollTop;

        await loadOlderMessages();

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const newScrollHeight = el.scrollHeight;
                const delta = newScrollHeight - prevScrollHeight;
                el.scrollTop = prevScrollTop + delta;
                isLoadingRef.current = false;
            });
        });
    };

    const onScroll = () => {
        const el = scrollRef.current;
        if (!el) return;

        const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        stickToBottomRef.current = distFromBottom < 2;
        setShowJump(distFromBottom > 200);

        if (el.scrollTop <= 150) {
            loadHistory();
        }
    };

    useLayoutEffect(() => {
        if (!rows.length) return;
        if (!stickToBottomRef.current) return;
        requestAnimationFrame(scrollToBottom);
    }, [rows.length, selectedChannel]);

    return (
        <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
            <div
                ref={scrollRef}
                onScroll={onScroll}
                style={{
                    position: "absolute",
                    inset: 0,
                    overflowY: "auto",
                    overflowX: "hidden",
                    padding: "20px 0 40px",
                    background: "var(--bg-secondary)",
                    wordBreak: "break-word",
                }}
            >
                <div
                    style={{
                        height: virtualizer.getTotalSize(),
                        width: "100%",
                        position: "relative",
                    }}
                >
                    {items.map((v) => {
                        const row = rows[v.index];

                        return (
                            <div
                                key={row.id}
                                data-index={v.index}
                                ref={virtualizer.measureElement}
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    width: "100%",
                                    transform: `translateY(${v.start}px)`,
                                    boxSizing: "border-box",
                                }}
                            >
                                {row.type === "day" && (
                                    <div
                                        style={{
                                            textAlign: "center",
                                            margin: "12px 0",
                                            color: "var(--text-secondary)",
                                            fontSize: 14,
                                            opacity: 0.8,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 10,
                                        }}
                                    >
                                        <span
                                            style={{
                                                flex: 1,
                                                height: 1,
                                                background: "var(--border-color)",
                                            }}
                                        />
                                        {row.date}
                                        <span
                                            style={{
                                                flex: 1,
                                                height: 1,
                                                background: "var(--border-color)",
                                            }}
                                        />
                                    </div>
                                )}

                                {row.type === "group-header" && (
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 12,
                                            padding: "6px 12px",
                                            height: 52,              
                                            boxSizing: "border-box",
                                        }}
                                    >
                                        <img
                                            src={row.avatarUrl || "/default-avatar.png"}
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: "50%",
                                                objectFit: "cover",
                                                flexShrink: 0,
                                            }}
                                        />
                                        <div
                                            style={{
                                                fontWeight: 600,
                                                color: "var(--text-primary)",
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            {row.displayName}
                                        </div>
                                    </div>
                                )}

                                {row.type === "bubble" && (
                                    <div
                                        style={{
                                            paddingLeft: 64,
                                            paddingRight: 12,
                                            minWidth: 0,
                                        }}
                                    >
                                        <MessageBubble msg={row.message} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {showJump && (
                <div
                    onClick={scrollToBottom}
                    style={{
                        position: "absolute",
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
                        fontSize: 13,
                    }}
                >
                    Jump to Present
                </div>
            )}
        </div>
    );
}
