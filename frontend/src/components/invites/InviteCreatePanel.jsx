
import { useState } from "react";
import { useToast } from "../../context/ToastContext";
import { createInvite } from "../../api/invites";

export default function InviteCreatePanel({ serverGuid, onCreated }) {
    const toast = useToast();

    const [maxUses, setMaxUses] = useState(1);
    const [expiresInHours, setExpiresInHours] = useState(24);

    const createNewInvite = async () => {
        try {
            const invite = await createInvite(serverGuid, {
                maxUses,
                expiresInHours,
            });

            navigator.clipboard.writeText(invite.inviteUrl);
            toast.show("success", "Invite created and copied!");

            onCreated?.(); 
        } catch {
            toast.show("error", "Failed to create invite.");
        }
    };

    return (
        <div style={box}>
            <h3>Create Invite</h3>

            <label>Max Uses</label>
            <input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(Number(e.target.value))}
                style={input}
            />

            <label>Expires In (Hours)</label>
            <input
                type="number"
                value={expiresInHours}
                onChange={(e) => setExpiresInHours(Number(e.target.value))}
                style={input}
            />

            <button style={btn} onClick={createNewInvite}>
                Create Invite
            </button>
        </div>
    );
}

const box = {
    background: "#202225",
    padding: 15,
    borderRadius: 6,
    marginBottom: 20,
};

const input = {
    width: "100%",
    padding: 9,
    marginTop: 5,
    marginBottom: 15,
    borderRadius: 6,
    border: "1px solid #333",
    background: "#1e1f22",
    color: "white",
};

const btn = {
    width: "100%",
    padding: 10,
    background: "#5865f2",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    color: "white",
};
