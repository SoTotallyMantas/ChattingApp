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
        <div data-overlay-root="true" className="modal-content">
            <h2 className="panel-title">Create Server</h2>
            <p className="panel-subtitle">Set a server name and optional icon before inviting your friends.</p>

            <form onSubmit={create}>
                <label className="create-server-label">Server Name</label>
                <input
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    className="input"
                    placeholder="My community"
                />

                <label className="create-server-label">Server Icon</label>
                <div className="create-server-icon-row">
                    <div className="create-server-icon-preview">
                        {iconPreview ? (
                            <img
                                src={iconPreview}
                                alt="Server icon preview"
                                className="create-server-icon-image"
                            />
                        ) : (
                            <span className="create-server-icon-placeholder">?</span>
                        )}
                    </div>

                    <div className="create-server-upload-actions">
                        <button
                            type="button"
                            className="button"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Upload Icon
                        </button>
                        {iconPreview && (
                            <button type="button" className="button" onClick={clearIcon}>
                                Remove
                            </button>
                        )}
                        <div className="create-server-hint">PNG or JPG up to 7MB.</div>
                    </div>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="create-server-file-input"
                    onChange={onPickIcon}
                />

                <div className="actions-row">
                    <button
                        type="button"
                        onClick={closeOverlay}
                        className="button"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="button"
                    >
                        Create
                    </button>
                </div>
            </form>
        </div>
    );
}
