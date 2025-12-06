import { useState, useEffect, useRef } from "react";
import { useMessages } from "../../context/MessagesContext";
import { useOverlay } from "../../context/OverlayContext";
import Portal from "../../common/Portal";

export default function MessageBubble({ msg }) {
    const { editMessage, deleteMessage } = useMessages();
    const { overlay, openOverlay, closeOverlay } = useOverlay();

    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(msg.content);
    const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

    const bubbleRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (!overlay) return;
        if (overlay.type === "edit-message" && overlay.payload.id === msg.messageGuid) {
            setIsEditing(true);
        }
    }, [overlay, msg.messageGuid]);

    const saveEdit = async () => {
        await editMessage({ messageGuid: msg.messageGuid, NewContent: editText });
        setIsEditing(false);
        closeOverlay();
    };

    const onRightClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setMenuPos({ x: e.clientX, y: e.clientY });
        openOverlay("message-menu", { id: msg.messageGuid });
    };

    return (
        <>
            <div
                ref={bubbleRef}
                onContextMenu={onRightClick}
                style={{
                    maxWidth: 600,
                    padding: "4px 0",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    lineHeight: 1.4,
                    fontSize: 14,
                    color: "var(--text-primary)",
                }}
            >
                {!isEditing ? (
                    <>
                        {msg.content}
                        {msg.editedAt && (
                            <span
                                style={{
                                    opacity: 0.6,
                                    fontSize: 12,
                                    marginLeft: 6,
                                }}
                            >
                                (edited)
                            </span>
                        )}
                    </>
                ) : (
                    <textarea
                        ref={inputRef}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Escape") {
                                setIsEditing(false);
                                closeOverlay();
                            }
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                saveEdit();
                            }
                        }}
                        style={{
                            width: "100%",
                            padding: 6,
                            borderRadius: 6,
                            border: `1px solid var(--border-color)`,
                            background: "var(--bg-tertiary)",
                            resize: "none",
                            fontSize: 14,
                            lineHeight: 1.4,
                            color: "var(--text-primary)",
                        }}
                    />
                )}
            </div>

            {overlay?.type === "message-menu" &&
                overlay.payload.id === msg.messageGuid && (
                    <Portal>
                        <div
                            style={{
                                position: "fixed",
                                top: menuPos.y,
                                left: menuPos.x,
                                background: "var(--bg-secondary)",
                                border: `1px solid var(--border-color)`,
                                borderRadius: 6,
                                width: 160,
                                padding: "6px 0",
                                zIndex: 999999,
                            }}
                        >
                            <div
                                className="menu-item"
                                onClick={() =>
                                    openOverlay("edit-message", { id: msg.messageGuid })
                                }
                            >
                                Edit
                            </div>
                            <div
                                className="menu-item"
                                onClick={() => deleteMessage(msg.messageGuid)}
                            >
                                Delete
                            </div>
                        </div>
                    </Portal>
                )}
        </>
    );
}
