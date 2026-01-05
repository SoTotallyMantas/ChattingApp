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
        <div className="auth-avatar-step">
            <h2 className="auth-avatar-title">Pick an avatar (optional)</h2>
            <p className="auth-avatar-subtitle">
                Upload a profile image or skip for now. You can change this in settings later.
            </p>

            <div className="auth-avatar-preview">
                <div className="auth-avatar-circle">
                    {preview ? (
                        <img src={preview} alt="Avatar preview" className="auth-avatar-image" />
                    ) : (
                        <span className="auth-avatar-initial">{initialLetter}</span>
                    )}
                </div>

                <div className="auth-avatar-controls">
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="button"
                    >
                        Choose image
                    </button>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        className="auth-avatar-file"
                        onChange={pickFile}
                    />
                    {preview && (
                        <button
                            type="button"
                            onClick={clearFile}
                            className="button"
                        >
                            Remove
                        </button>
                    )}
                    <div className="auth-avatar-hint">PNG/JPG up to 7MB.</div>
                </div>
            </div>

            {error && <div className="auth-avatar-error">{error}</div>}

            <div className="auth-avatar-actions">
                <button
                    type="button"
                    onClick={onSkip}
                    className="button"
                >
                    Skip for now
                </button>
                <button
                    type="button"
                    onClick={save}
                    className="button"
                    disabled={saving}
                >
                    {saving ? "Saving..." : file ? "Save and continue" : "Use default"}
                </button>
            </div>
        </div>
    );
}
