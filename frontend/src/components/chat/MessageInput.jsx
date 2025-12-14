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

    return (
        <div
            style={{
                padding: 15,
                borderTop: "1px solid var(--border-color)",
                background: "var(--bg-secondary)"
            }}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragLeave={onDragLeave}
        >
            <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        borderRadius: 6,
                        border: `1px solid var(--border-color)`,
                        background: "var(--bg-primary)",
                        color: "var(--text-primary)",
                        padding: "6px 10px",
                        cursor: "pointer",
                        fontWeight: 600
                    }}
                >
                    Attach
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    style={{ display: "none" }}
                    onChange={onPick}
                />
            </div>

            {replyTo && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 10px",
                        borderRadius: 8,
                        background: "var(--bg-primary)",
                        border: `1px solid var(--border-color)`,
                        marginBottom: 8
                    }}
                >
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 0.3 }}>
                        Replying to
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {replyTo.displayName || replyTo.userName || "User"}
                        </div>
                        <div style={{ color: "var(--text-secondary)", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {replyTo.content || "(no text)"}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={clearReply}
                        style={{
                            border: "none",
                            background: "transparent",
                            color: "var(--text-secondary)",
                            cursor: "pointer",
                            fontWeight: 700,
                            padding: "4px 6px"
                        }}
                        title="Cancel reply"
                    >
                        ×
                    </button>
                </div>
            )}

            {files.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                    {files.map((f) => (
                        <div
                            key={f.name}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "6px 10px",
                                borderRadius: 8,
                                background: "var(--bg-primary)",
                                border: `1px solid var(--border-color)`,
                                color: "var(--text-primary)"
                            }}
                        >
                            {previews[fileKey(f)] && (
                                <img
                                    src={previews[fileKey(f)]}
                                    alt={f.name}
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 8,
                                        objectFit: "cover",
                                        border: `1px solid var(--border-color)`
                                    }}
                                />
                            )}
                            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <span style={{ fontWeight: 600, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                                <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                                    {Math.ceil(f.size / 1024)} KB
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeFile(f.name)}
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    color: "var(--text-secondary)",
                                    cursor: "pointer",
                                    fontWeight: 700,
                                    marginLeft: "auto"
                                }}
                                title="Remove file"
                            >
                                ×
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
                style={{
                    ...box,
                    borderColor: isDragging ? "var(--accent)" : box.border,
                    background: isDragging ? "var(--bg-hover)" : box.background
                }}
            />

            <Button onClick={send} style={{ marginTop: 10 }}>
                Send
            </Button>
        </div>
    );
}

const box = {
    width: "100%",
    height: 60,
    padding: 10,
    borderRadius: 6,
    border: "1px solid var(--border-color)",
    resize: "none",
    background: "var(--bg-primary)",
    color: "var(--text-primary)"
};
