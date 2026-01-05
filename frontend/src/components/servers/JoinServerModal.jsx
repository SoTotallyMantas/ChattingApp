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
        } catch (err) {
            const message = err?.response?.data?.message;
            toast.show("error", message || "Invalid or expired invite code.");
        }
    };

    return (
        <div data-overlay-root="true" className="modal-content">
            <h2 className="panel-title">Join a Server</h2>
            <p className="panel-subtitle">Paste an invite link or code to join your friends.</p>

            <form onSubmit={join}>
                <label className="join-server-label">Invite Link or Code</label>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="https://example.com/invite/abc123"
                    className="input "
                />

                <div className="actions-row">
                    <button
                        type="button"
                        onClick={closeOverlay}
                        className="button"
                    >
                        Cancel
                    </button>

                    <button type="submit" className="button">
                        Join
                    </button>
                </div>
            </form>
        </div>
    );
}
