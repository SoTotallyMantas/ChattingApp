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
        <div className="list-panel">
            <h3>Create Invite</h3>

            <label>Max Uses</label>
            <input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(Number(e.target.value))}
                className="input"
            />

            <label>Expires In (Hours)</label>
            <input
                type="number"
                value={expiresInHours}
                onChange={(e) => setExpiresInHours(Number(e.target.value))}
                className="input"
            />

            <button className="button" onClick={createNewInvite}>
                Create Invite
            </button>
        </div>
    );
}
