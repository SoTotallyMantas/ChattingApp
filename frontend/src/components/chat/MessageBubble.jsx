import { useState, useEffect, useRef, useMemo } from "react";
import { useMessages } from "../../context/MessagesContext";
import { useOverlay } from "../../context/OverlayContext";
import { downloadAttachment } from "../../api/messages";
import { uploadAttachment, deleteAttachment } from "../../api/messageAttachments";
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
    const [newFiles, setNewFiles] = useState([]);
    const [newPreviews, setNewPreviews] = useState({});
    const [lightbox, setLightbox] = useState(null);

    const editContainerRef = useRef(null);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);

    const fileKey = (f) => `${f.name}-${f.size}-${f.lastModified}`;

    const addFiles = (files) => {
        setNewFiles((prev) => {
            const existing = new Set(prev.map(fileKey));
            const merged = [...prev];
            const nextPreviews = {};

            files.forEach((f) => {
                const key = fileKey(f);
                if (!existing.has(key)) {
                    merged.push(f);
                    existing.add(key);
                    if (f.type?.startsWith("image/")) {
                        nextPreviews[key] = URL.createObjectURL(f);
                    }
                }
            });

            if (Object.keys(nextPreviews).length) {
                setNewPreviews((p) => ({ ...p, ...nextPreviews }));
            }

            return merged;
        });
    };

    const removeFile = (key) => {
        setNewFiles((prev) => prev.filter((f) => fileKey(f) !== key));
        setNewPreviews((prev) => {
            const copy = { ...prev };
            if (copy[key]) {
                URL.revokeObjectURL(copy[key]);
                delete copy[key];
            }
            return copy;
        });
    };

    const clearNewFiles = () => {
        Object.values(newPreviews).forEach((url) => URL.revokeObjectURL(url));
        setNewPreviews({});
        setNewFiles([]);
    };

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
        const canEdit = user?.userGuid === msg.userGuid;
        const canDelete = canManageMessages || user?.userGuid === msg.userGuid;

        openOverlay("message-menu", {
            id: msg.messageGuid,
            message: msg,
            x: e.clientX,
            y: e.clientY,
            deleteMessage,
            canEdit,
            canDelete,
            startReply
        });
    };

    const saveEdit = async () => {
        const trimmed = (editText || "").trim();
        const existingAttachments = msg.attachments?.length || 0;
        if (!trimmed && existingAttachments === 0 && newFiles.length === 0) {
            alert("Message must have text or at least one attachment.");
            return;
        }

        try {
            await editMessage({
                messageGuid: msg.messageGuid,
                NewContent: trimmed
            });

            for (const f of newFiles) {
                await uploadAttachment(msg.messageGuid, f);
            }
            clearNewFiles();
            setIsEditing(false);
            closeOverlay();
        } catch (e) {
            console.error("Edit failed", e);
        }
    };

    const cancelEdit = () => {
        setEditText(msg.content);
        clearNewFiles();
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
                className={`message-bubble${hovered ? " message-bubble--hovered" : ""}`}
            >
                {!msg.firstInGroup && (
                    <div className="message-bubble-time">
                        {msg.timeLabel}
                    </div>
                )}
                {!isEditing ? (
                    <div className="message-bubble-content">
                        {repliedMessage && (
                            <div
                                onClick={jumpToReplied}
                                className="message-bubble-reply"
                                title="Jump to replied message"
                            >
                                <div className="message-bubble-reply-meta">
                                    <span className="message-bubble-reply-label">Replying to</span>
                                    <span className="message-bubble-reply-name">
                                        {repliedMessage.displayName || repliedMessage.userName || "User"}
                                    </span>
                                </div>
                                <div className="message-bubble-reply-text">
                                    {repliedMessage.content || "(no text)"}
                                </div>
                            </div>
                        )}
                        <div className="message-bubble-body">
                            <span>{msg.content}</span>
                            {msg.editedAt && (
                                <span className="message-bubble-edited">
                                    (edited)
                                </span>
                            )}
                        </div>

                        {msg.attachments?.length > 0 && (
                            <div className="message-bubble-attachments">
                                {msg.attachments.map((att) => (
                                    <div key={att.attachmentGuid} className="message-bubble-attachment">
                                        {previews[att.attachmentGuid]?.url && att.contentType?.startsWith("image/") ? (
                                            <img
                                                src={previews[att.attachmentGuid].url}
                                                alt={att.fileName}
                                                className="message-bubble-attachment-image"
                                                onClick={() => setLightbox(previews[att.attachmentGuid].url)}
                                            />
                                        ) : previews[att.attachmentGuid]?.url ? (
                                            <a
                                                href={previews[att.attachmentGuid].url}
                                                download={att.fileName || "attachment"}
                                                className="message-bubble-attachment-link"
                                            >
                                                Download {att.fileName || "file"}
                                            </a>
                                        ) : (
                                            <span className="message-bubble-attachment-loading">Loading...</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div ref={editContainerRef} className="message-bubble-edit">
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
                            className="message-bubble-edit-textarea"
                        />
                        <div className="message-bubble-edit-actions">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="button"
                            >
                                Add attachment
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                className="message-bubble-file-input"
                                onChange={(e) => {
                                    const picked = Array.from(e.target.files || []);
                                    addFiles(picked);
                                    e.target.value = "";
                                }}
                            />
                        </div>
                        {(msg.attachments?.length > 0 || newFiles.length > 0) && (
                            <div className="message-bubble-attachment-list">
                                {msg.attachments?.map((att) => (
                                    <div
                                        key={att.attachmentGuid}
                                        className="message-bubble-attachment-row"
                                    >
                                        <div className="message-bubble-attachment-info">
                                            <div className="message-bubble-attachment-name">
                                                {att.fileName || att.attachmentGuid}
                                            </div>
                                            <div className="message-bubble-attachment-type">{att.contentType || "file"}</div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                try {
                                                    await deleteAttachment(msg.messageGuid, att.attachmentGuid);
                                                } catch (e) {
                                                    console.error("Failed to delete attachment", e);
                                                    alert("Failed to delete attachment");
                                                }
                                            }}
                                            className="button"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                {newFiles.map((f) => {
                                    const key = fileKey(f);
                                    return (
                                        <div
                                            key={key}
                                            className="message-bubble-attachment-row"
                                        >
                                            {newPreviews[key] && f.type?.startsWith("image/") ? (
                                                <img
                                                    src={newPreviews[key]}
                                                    alt={f.name}
                                                    className="message-bubble-attachment-thumb"
                                                />
                                            ) : (
                                                <span className="message-bubble-attachment-size">{Math.ceil(f.size / 1024)} KB</span>
                                            )}
                                            <div className="message-bubble-attachment-info">
                                                <div className="message-bubble-attachment-name">
                                                    {f.name}
                                                </div>
                                                <div className="message-bubble-attachment-type">{f.type || "file"}</div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(key)}
                                                className="button"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <div className="message-bubble-edit-footer">
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="button"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={saveEdit}
                                className="button"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {lightbox && (
                <div
                    className="message-bubble-lightbox"
                    onClick={() => setLightbox(null)}
                >
                    <img
                        src={lightbox}
                        alt="Attachment"
                        className="message-bubble-lightbox-image"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
}
