
import { useState } from "react";
import serverApi from "../../api/servers";
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import { useToast } from "../../context/ToastContext";

export default function EditServerModal({ server, onClose, onUpdated }) {
    const [serverName, setServerName] = useState(server.serverName);
    const [iconUrl, setIconUrl] = useState(server.iconUrl || "");
    const toast = useToast();

    const save = async (e) => {
        e.preventDefault();

        try {
            await serverApi.updateServer(server.serverGuid, {
                serverGuid: server.serverGuid,
                serverName,
                iconUrl: iconUrl || null
            });

            toast.show("success", "Server updated.");
            onUpdated?.();
            onClose();
        } catch {
            toast.show("error", "Failed to update server.");
        }
    };

    return (
        <Modal onClose={onClose}>
            <h2>Edit Server</h2>

            <form onSubmit={save}>
                <label>Server Name</label>
                <input
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    style={inputStyle}
                />

                <label>Icon URL</label>
                <input
                    value={iconUrl}
                    onChange={(e) => setIconUrl(e.target.value)}
                    style={inputStyle}
                />

                <div style={actions}>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Modal>
    );
}

const inputStyle = {
    width: "100%",
    padding: 10,
    marginBottom: 15,
    borderRadius: 6,
    background: "var(--bg-tertiary)",
    border: "1px solid var(--border-color)",
    color: "var(--text-primary)"
};

const actions = {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10
};
