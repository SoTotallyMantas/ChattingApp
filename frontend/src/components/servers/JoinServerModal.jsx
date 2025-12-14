import { useState } from "react";
import { useToast } from "../../context/ToastContext";
import { useOverlay } from "../../context/OverlayContext";
import { joinServer } from "../../api/invites";

export default function JoinServerModal({ onJoined }) {
    const [input, setInput] = useState("");
    const toast = useToast();
    const { closeOverlay } = useOverlay();

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
            closeOverlay();
        } catch {
            toast.show("error", "Invalid or expired invite code.");
        }
    };

    return (
        <div data-overlay-root="true" style={modal}>
            <h2 style={title}>Join a Server</h2>
            <p style={subtitle}>Paste an invite link or code to join your friends.</p>

            <form onSubmit={join}>
                <label style={label}>Invite Link or Code</label>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="https://example.com/invite/abc123"
                    style={inputStyle}
                />

                <div style={actions}>
                    <button
                        type="button"
                        onClick={closeOverlay}
                        style={cancelBtn}
                    >
                        Cancel
                    </button>

                    <button type="submit" style={joinBtn}>
                        Join
                    </button>
                </div>
            </form>
        </div>
    );
}

const modal = {
    width: 420,
    background: "var(--bg-secondary)",
    padding: 24,
    borderRadius: 12,
    color: "var(--text-primary)",
    border: `1px solid var(--border-color)`,
    boxShadow: "0 16px 45px rgba(0,0,0,0.45)",
};

const title = { margin: 0, fontSize: 20 };

const subtitle = {
    margin: "6px 0 16px",
    color: "var(--text-secondary)",
    lineHeight: 1.4,
};

const label = {
    display: "block",
    marginBottom: 8,
    color: "var(--text-secondary)",
    fontWeight: 600,
};

const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    marginBottom: 16,
    borderRadius: 8,
    border: "1px solid var(--border-color)",
    background: "var(--bg-tertiary)",
    color: "var(--text-primary)",
};

const actions = {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 12,
};

const cancelBtn = {
    padding: "10px 14px",
    background: "var(--bg-tertiary)",
    border: `1px solid var(--border-color)`,
    borderRadius: 8,
    color: "var(--text-primary)",
    cursor: "pointer",
    fontWeight: 600,
};

const joinBtn = {
    padding: "10px 14px",
    background: "var(--accent)",
    border: "none",
    borderRadius: 8,
    color: "white",
    cursor: "pointer",
    fontWeight: 700,
};
