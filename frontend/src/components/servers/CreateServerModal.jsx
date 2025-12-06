
import { useState } from "react";
import serverApi from "../../api/servers";
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import { useToast } from "../../context/ToastContext";

export default function CreateServerModal({ onClose, onCreated }) {
    const [serverName, setServerName] = useState("");
    const [iconUrl, setIconUrl] = useState("");
    const toast = useToast();

    const create = async (e) => {
        e.preventDefault();

        try {
            const { data } = await serverApi.createServer({
                serverName,
                iconUrl: iconUrl || null
            });

            toast.show("success", "Server created!");
            onCreated?.(data);
            onClose();
        } catch {
            toast.show("error", "Failed to create server.");
        }
    };

    return (
        <Modal onClose={onClose}>
            <h2>Create Server</h2>

            <form onSubmit={create}>
                <label>Server Name</label>
                <input
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    style={inputStyle}
                />

                <label>Icon URL (optional)</label>
                <input
                    value={iconUrl}
                    onChange={(e) => setIconUrl(e.target.value)}
                    style={inputStyle}
                />

                <div style={actions}>
                    <Button variant="secondary" onClick={onClose} type="button">
                        Cancel
                    </Button>
                    <Button type="submit">Create</Button>
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
    border: "1px solid var(--border-color)",
    background: "var(--bg-tertiary)",
    color: "var(--text-primary)"
};

const actions = {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10
};
