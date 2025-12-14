import { useEffect, useRef, useState } from "react";
import serverApi from "../../api/servers";
import { useToast } from "../../context/ToastContext";
import { useOverlay } from "../../context/OverlayContext";

export default function CreateServerModal({ onCreated }) {
    const [serverName, setServerName] = useState("");
    const [iconFile, setIconFile] = useState(null);
    const [iconPreview, setIconPreview] = useState(null);

    const toast = useToast();
    const { closeOverlay } = useOverlay();
    const fileInputRef = useRef(null);

    useEffect(() => {
        return () => {
            if (iconPreview) URL.revokeObjectURL(iconPreview);
        };
    }, [iconPreview]);

    const onPickIcon = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIconFile(file);
        const url = URL.createObjectURL(file);
        setIconPreview((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
        });
    };

    const clearIcon = () => {
        if (iconPreview) URL.revokeObjectURL(iconPreview);
        setIconFile(null);
        setIconPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const create = async (e) => {
        e.preventDefault();

        if (!serverName.trim()) {
            toast.show("error", "Server name is required.");
            return;
        }

        try {
            const { data } = await serverApi.createServer({
                serverName: serverName.trim(),
                iconKey: null
            });

            let createdServer = data;
            let uploadFailed = false;

            if (iconFile) {
                try {
                    const res = await serverApi.uploadServerIcon(data.serverGuid, iconFile);
                    const key = res.data?.iconKey;
                    if (key) {
                        createdServer = { ...createdServer, iconKey: key };
                    }
                } catch {
                    uploadFailed = true;
                }
            }

            toast.show(
                uploadFailed ? "error" : "success",
                uploadFailed ? "Server created, but icon upload failed." : "Server created!"
            );

            onCreated?.(createdServer);

            closeOverlay();
        } catch {
            toast.show("error", "Failed to create server.");
        }
    };

    return (
        <div data-overlay-root="true" style={modal}>
            <h2 style={title}>Create Server</h2>
            <p style={subtitle}>Set a server name and optional icon before inviting your friends.</p>

            <form onSubmit={create}>
                <label style={label}>Server Name</label>
                <input
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    style={inputStyle}
                    placeholder="My community"
                />

                <label style={label}>Server Icon</label>
                <div style={iconRow}>
                    <div style={iconPreviewBox}>
                        {iconPreview ? (
                            <img
                                src={iconPreview}
                                alt="Server icon preview"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        ) : (
                            <span style={{ color: "var(--text-secondary)", fontWeight: 700 }}>?</span>
                        )}
                    </div>

                    <div style={uploadActions}>
                        <button
                            type="button"
                            style={uploadBtn}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Upload Icon
                        </button>
                        {iconPreview && (
                            <button type="button" style={clearBtn} onClick={clearIcon}>
                                Remove
                            </button>
                        )}
                        <div style={hint}>PNG or JPG up to 7MB.</div>
                    </div>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={onPickIcon}
                />

                <div style={actions}>
                    <button
                        type="button"
                        onClick={closeOverlay}
                        style={cancelBtn}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        style={createBtn}
                    >
                        Create
                    </button>
                </div>
            </form>
        </div>
    );
}

const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    marginBottom: 16,
    borderRadius: 8,
    border: "1px solid var(--border-color)",
    background: "var(--bg-tertiary)",
    color: "var(--text-primary)",
    outline: "none"
};

const modal = {
    width: 440,
    background: "var(--bg-secondary)",
    padding: 24,
    borderRadius: 12,
    color: "var(--text-primary)",
    border: `1px solid var(--border-color)`,
    boxShadow: "0 16px 45px rgba(0,0,0,0.45)"
};

const title = { margin: 0, fontSize: 20 };

const subtitle = {
    margin: "6px 0 18px",
    color: "var(--text-secondary)",
    lineHeight: 1.4
};

const label = {
    display: "block",
    marginBottom: 8,
    color: "var(--text-secondary)",
    fontWeight: 600
};

const iconRow = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 16
};

const iconPreviewBox = {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "var(--bg-tertiary)",
    border: `1px solid var(--border-color)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
};

const uploadActions = {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    alignItems: "flex-start"
};

const uploadBtn = {
    padding: "10px 14px",
    background: "var(--accent)",
    border: "none",
    borderRadius: 8,
    color: "white",
    cursor: "pointer",
    fontWeight: 700
};

const clearBtn = {
    padding: "8px 12px",
    background: "transparent",
    borderRadius: 8,
    border: `1px solid var(--border-color)`,
    color: "var(--text-primary)",
    cursor: "pointer",
    fontWeight: 600
};

const hint = {
    fontSize: 12,
    color: "var(--text-secondary)"
};

const actions = {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20
};

const cancelBtn = {
    padding: "10px 14px",
    background: "var(--bg-tertiary)",
    border: `1px solid var(--border-color)`,
    borderRadius: 8,
    color: "var(--text-primary)",
    cursor: "pointer",
    fontWeight: 600
};

const createBtn = {
    padding: "10px 14px",
    background: "var(--accent)",
    border: "none",
    borderRadius: 8,
    color: "white",
    cursor: "pointer",
    fontWeight: 700
};
