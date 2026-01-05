import { useRef, useState } from "react";
import { useAppState } from "../../context/AppStateContext";
import { useMessages } from "../../context/MessagesContext";
import Button from "../../common/Button";
import { uploadAttachment } from "../../api/messageAttachments";

export default function MessageInput() {
    const { selectedChannel } = useAppState();
    const { sendMessage, replyTo, clearReply } = useMessages();
    const [text, setText] = useState("");
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState({});
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const fileKey = (f) => `${f.name}-${f.size}-${f.lastModified}`;

    const onPick = (e) => {
        const picked = Array.from(e.target.files || []);
        if (picked.length === 0) return;
        addFiles(picked);

        e.target.value = "";
    };

    const removeFile = (name) => {
        setFiles((prev) => prev.filter((f) => f.name !== name));
        setPreviews((prev) => {
            const copy = { ...prev };
            Object.entries(copy).forEach(([k, url]) => {
                if (k.startsWith(name + "-")) {
                    URL.revokeObjectURL(url);
                    delete copy[k];
                }
            });
            return copy;
        });
    };

    const addFiles = (newFiles) => {
        setFiles((prev) => {
            const existing = new Set(prev.map(fileKey));
            const merged = [...prev];
            const nextPreviews = {};

            newFiles.forEach(f => {
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
                setPreviews((p) => ({ ...p, ...nextPreviews }));
            }

            return merged;
        });
    };

    const send = async () => {
        if (!text.trim() && files.length === 0) return;

        const msg = await sendMessage({
            channelGuid: selectedChannel.channelGuid,
            content: text,
            replyToGuid: replyTo?.messageGuid ?? null
        });

        if (files.length > 0 && msg?.messageGuid) {
            for (const f of files) {
                await uploadAttachment(msg.messageGuid, f);
            }
        }

        setText("");
        setFiles([]);
        clearReply();
        Object.values(previews).forEach((url) => URL.revokeObjectURL(url));
        setPreviews({});
    };

    const onKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    const onPaste = (e) => {
        if (!e.clipboardData?.files?.length) return;
        e.preventDefault();
        addFiles(Array.from(e.clipboardData.files));
    };

    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (!e.dataTransfer?.files?.length) return;
        addFiles(Array.from(e.dataTransfer.files));
    };

    const onDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => setIsDragging(false);

    const textareaClassName = isDragging
        ? "message-input-textarea message-input-textarea--dragging"
        : "message-input-textarea";

    return (
        <div
            className="message-input"
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragLeave={onDragLeave}
        >
            <input
                ref={fileInputRef}
                type="file"
                multiple
                className="message-input-file-input"
                onChange={onPick}
                style={{ display: "none" }}
            />

            {replyTo && (
                <div className="message-input-reply">
                    <div className="message-input-reply-label">
                        Replying to
                    </div>
                    <div className="message-input-reply-content">
                        <div className="message-input-reply-name">
                            {replyTo.displayName || replyTo.userName || "User"}
                        </div>
                        <div className="message-input-reply-text">
                            {replyTo.content || "(no text)"}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={clearReply}
                        className="message-input-reply-cancel"
                        title="Cancel reply"
                    >
                        X
                    </button>
                </div>
            )}

            {files.length > 0 && (
                <div className="message-input-files">
                    {files.map((f) => (
                        <div
                            key={f.name}
                            className="message-input-file"
                        >
                            {previews[fileKey(f)] && (
                                <img
                                    src={previews[fileKey(f)]}
                                    alt={f.name}
                                    className="message-input-file-preview"
                                />
                            )}
                            <div className="message-input-file-info">
                                <span className="message-input-file-name">{f.name}</span>
                                <span className="message-input-file-size">
                                    {Math.ceil(f.size / 1024)} KB
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeFile(f.name)}
                                className="button"
                                title="Remove file"
                            >
                                X
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={onKey}
                onPaste={onPaste}
                placeholder="Message..."
                className={textareaClassName}
            />

            <div className="actions-row message-input-actions">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="button"
                >
                    Attach
                </button>
                <Button onClick={send} className="button">
                    Send
                </Button>
            </div>
        </div>
    );
}
