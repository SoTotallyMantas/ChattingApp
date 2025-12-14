import { useState, useEffect, useRef, useMemo } from "react";
import { useMessages } from "../../context/MessagesContext";
import { useOverlay } from "../../context/OverlayContext";
import { downloadAttachment } from "../../api/messages";
import { useAuth } from "../../context/AuthContext";
import { useAppState } from "../../context/AppStateContext";

export default function MessageBubble({ msg }) {
    const { editMessage, deleteMessage, startReply, messages } = useMessages();
    const { overlay, openOverlay, closeOverlay } = useOverlay();
    const { user } = useAuth();
    const { selectedServer } = useAppState();

    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(msg.content);
    const [hovered, setHovered] = useState(false);
    const [previews, setPreviews] = useState({});
    const [lightbox, setLightbox] = useState(null);

    const editContainerRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (!overlay) return;

        if (overlay.type === "edit-message" && overlay.payload.id === msg.messageGuid) {
            setIsEditing(true);
        } else if (overlay.type !== "message-menu") {
            setIsEditing(false);
        }
    }, [overlay, msg.messageGuid]);

    const onRightClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const perms = selectedServer?.permissions || [];
        const canManageMessages = perms.includes("MANAGE_MESSAGES");
        const canEditOrDelete = canManageMessages || user?.userGuid === msg.userGuid;

        openOverlay("message-menu", {
            id: msg.messageGuid,
            x: e.clientX,
            y: e.clientY,
            deleteMessage,
            canEdit: canEditOrDelete,
            canDelete: canEditOrDelete
        });
    };

    const saveEdit = async () => {
        await editMessage({
            messageGuid: msg.messageGuid,
            NewContent: editText
        });
        setIsEditing(false);
        closeOverlay();
    };

    const cancelEdit = () => {
        setEditText(msg.content);
        setIsEditing(false);
        closeOverlay();
    };

    const resizeTextarea = () => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
    };

    const repliedMessage = useMemo(() => {
        if (!msg.replyToGuid) return null;
        return messages?.find(m => m.messageGuid === msg.replyToGuid) || null;
    }, [messages, msg.replyToGuid]);

    const jumpToReplied = () => {
        if (!repliedMessage) return;
        const el = document.getElementById(`msg-${repliedMessage.messageGuid}`);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    };

    const handleOutsideClick = (e) => {
        if (editContainerRef.current && !editContainerRef.current.contains(e.target)) {
            cancelEdit();
        }
    };

    useEffect(() => {
        if (isEditing) {
            window.addEventListener("mousedown", handleOutsideClick);
            resizeTextarea();
        }
        return () => window.removeEventListener("mousedown", handleOutsideClick);
    }, [isEditing]);

    useEffect(() => {
        resizeTextarea();
    }, [editText]);

    useEffect(() => {
        let active = true;
        const load = async () => {
            if (!msg.attachments?.length) return;

            for (const att of msg.attachments) {
                if (previews[att.attachmentGuid]) continue;
                try {
                    const blob = await downloadAttachment(att.attachmentGuid);
                    if (!active) break;
                    const url = URL.createObjectURL(blob);
                    setPreviews((prev) => ({ ...prev, [att.attachmentGuid]: { url, contentType: att.contentType, fileName: att.fileName } }));
                } catch (e) {
                    console.error("Failed to load attachment", e);
                }
            }
        };
        load();
        return () => {
            active = false;
        };
    }, [msg.attachments]);

    return (
        <>
            <div
                onContextMenu={onRightClick}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                    width: "100%",
                    padding: "4px 0",
                    marginBottom: 3,
                }}
            >
                {!isEditing ? (
                    <div style={{
                        width: "calc(100% - 16px)",
                        padding: "8px 12px",
                        borderRadius: 10,
                        background: hovered ? "var(--bg-tertiary)" : "transparent",
                        marginRight: 16,
                        transition: "background 120ms ease",
                        whiteSpace: "pre-wrap",
                        color: "var(--text-primary)"
                    }}>
                        {repliedMessage && (
                            <div
                                onClick={jumpToReplied}
                                style={{
                                    padding: "6px 8px",
                                    borderLeft: `3px solid var(--border-color)`,
                                    background: "var(--bg-primary)",
                                    borderRadius: 8,
                                    marginBottom: 6,
                                    cursor: "pointer"
                                }}
                                title="Jump to replied message"
                            >
                                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 2 }}>
                                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Replying to</span>
                                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                                        {repliedMessage.displayName || repliedMessage.userName || "User"}
                                    </span>
                                </div>
                                <div style={{ fontSize: 13, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {repliedMessage.content || "(no text)"}
                                </div>
                            </div>
                        )}
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span>{msg.content}</span>
                            {msg.timeLabel && (
                                <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                                    {msg.timeLabel}
                                </span>
                            )}
                            {msg.editedAt && (
                                <span style={{ opacity: 0.6, fontSize: 12 }}>
                                    (edited)
                                </span>
                            )}
                        </div>

                        {msg.attachments?.length > 0 && (
                            <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
                                {msg.attachments.map((att) => (
                                    <div key={att.attachmentGuid} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        {previews[att.attachmentGuid]?.url && att.contentType?.startsWith("image/") ? (
                                            <img
                                                src={previews[att.attachmentGuid].url}
                                                alt={att.fileName}
                                                style={{ maxWidth: 200, maxHeight: 140, borderRadius: 8, border: `1px solid var(--border-color)`, cursor: "pointer" }}
                                                onClick={() => setLightbox(previews[att.attachmentGuid].url)}
                                            />
                                        ) : previews[att.attachmentGuid]?.url ? (
                                            <a
                                                href={previews[att.attachmentGuid].url}
                                                download={att.fileName || "attachment"}
                                                style={{ color: "var(--accent)", fontWeight: 600 }}
                                            >
                                                Download {att.fileName || "file"}
                                            </a>
                                        ) : (
                                            <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>Loading...</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div ref={editContainerRef}>
                        <textarea
                            ref={textareaRef}
                            value={editText}
                            autoFocus
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Escape") {
                                    cancelEdit();
                                }
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    saveEdit();
                                }
                            }}
                            style={{
                                width: "100%",
                                minHeight: 40,
                                padding: 10,
                                borderRadius: 10,
                                border: "none",
                                background: "var(--bg-tertiary)",
                                resize: "none",
                                color: "var(--text-primary)",
                                outline: "none",
                                boxShadow: hovered ? "0 0 0 1px var(--border-color)" : "none",
                                overflow: "hidden"
                            }}
                        />
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                            <button
                                type="button"
                                onClick={cancelEdit}
                                style={secondaryBtn}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={saveEdit}
                                style={primaryBtn}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {lightbox && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.7)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000
                    }}
                    onClick={() => setLightbox(null)}
                >
                    <img
                        src={lightbox}
                        alt="Attachment"
                        style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 12, boxShadow: "0 12px 40px rgba(0,0,0,0.4)" }}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
}

const baseBtn = {
    padding: "8px 12px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    color: "white",
    fontWeight: 600
};

const secondaryBtn = {
    ...baseBtn,
    background: "#4f535c"
};

const primaryBtn = {
    ...baseBtn,
    background: "#5865f2"
};
