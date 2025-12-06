import { useState } from "react";
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import { useToast } from "../../context/ToastContext";
import { joinServer } from "../../api/invites";

export default function JoinServerModal({ onClose, onJoined }) {
    const [input, setInput] = useState("");
    const toast = useToast();

   
    const extractInviteCode = (text) => {
        if (!text) return "";

        
        text = text.trim();

        
        if (!text.includes("/") && !text.includes("http")) {
            return text;
        }

       
        try {
            const url = new URL(text);
            const parts = url.pathname.split("/");
            return parts.pop() || parts.pop(); 
        } catch {
            
            const parts = text.split("/");
            return parts.pop();
        }
    };

    const join = async (e) => {
        e.preventDefault();

        const inviteCode = extractInviteCode(input);

        if (!inviteCode) {
            toast.show("error", "Invalid invite code.");
            return;
        }

        try {
            const res = await joinServer(inviteCode, "ignored");
            toast.show("success", "Joined server!");
            onJoined?.(res);
            onClose();
        } catch {
            toast.show("error", "Invalid or expired invite code.");
        }
    };

    const handleChange = (e) => {
        const raw = e.target.value;
        setInput(raw);
    };

    return (
        <Modal onClose={onClose}>
            <h2>Join a Server</h2>

            <form onSubmit={join}>
                <label>Invite Link or Code</label>
                <input
                    value={input}
                    onChange={handleChange}
                    placeholder="Enter invite code or paste link"
                    style={inputStyle}
                />

                <div style={actions}>
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>

                    <Button type="submit">
                        Join
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

const inputStyle = {
    width: "100%",
    padding: 10,
    marginTop: 10,
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
