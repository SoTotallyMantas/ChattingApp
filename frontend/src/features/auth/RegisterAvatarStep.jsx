import { useEffect, useRef, useState } from "react";
import { uploadAvatar } from "../../api/userSettings";

export default function RegisterAvatarStep({ initialName, onSkip, onComplete }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const pickFile = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);
        setPreview((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return URL.createObjectURL(f);
        });
    };

    const clearFile = () => {
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
        setFile(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    const save = async () => {
        setError(null);
        if (!file) {
            onComplete?.(null);
            return;
        }

        setSaving(true);
        try {
            const key = await uploadAvatar(file);
            onComplete?.(key || null);
        } catch {
            setError("Failed to upload avatar. You can skip and set it later.");
        }
        setSaving(false);
    };

    const initialLetter = (initialName || "U").charAt(0).toUpperCase();

    return (
        <div style={container}>
            <h2 style={{ margin: "0 0 6px" }}>Pick an avatar (optional)</h2>
            <p style={{ margin: "0 0 18px", color: "#888" }}>
                Upload a profile image or skip for now. You can change this in settings later.
            </p>

            <div style={previewRow}>
                <div style={avatarCircle}>
                    {preview ? (
                        <img src={preview} alt="Avatar preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                        <span style={{ fontSize: 28, fontWeight: 700 }}>{initialLetter}</span>
                    )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <button type="button" onClick={() => inputRef.current?.click()} style={primaryBtn}>
                        Choose image
                    </button>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={pickFile}
                    />
                    {preview && (
                        <button type="button" onClick={clearFile} style={secondaryBtn}>
                            Remove
                        </button>
                    )}
                    <div style={{ fontSize: 12, color: "#777" }}>PNG/JPG up to 7MB.</div>
                </div>
            </div>

            {error && <div style={errorBox}>{error}</div>}

            <div style={actions}>
                <button type="button" onClick={onSkip} style={secondaryBtn}>
                    Skip for now
                </button>
                <button type="button" onClick={save} style={primaryBtn} disabled={saving}>
                    {saving ? "Saving..." : file ? "Save and continue" : "Use default"}
                </button>
            </div>
        </div>
    );
}

const container = {
    display: "flex",
    flexDirection: "column",
    gap: 10,
};

const previewRow = {
    display: "flex",
    alignItems: "center",
    gap: 14,
};

const avatarCircle = {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "#1f2937",
    border: "1px solid #333",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#e5e7eb",
    overflow: "hidden",
};

const primaryBtn = {
    padding: "10px 14px",
    background: "#5865f2",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 700,
};

const secondaryBtn = {
    padding: "9px 14px",
    background: "#2f3136",
    color: "white",
    border: "1px solid #3a3c43",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
};

const actions = {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 10,
};

const errorBox = {
    padding: "10px 12px",
    borderRadius: 8,
    background: "rgba(239, 68, 68, 0.12)",
    border: "1px solid rgba(239, 68, 68, 0.4)",
    color: "#fecdd3",
    fontSize: 13,
};
