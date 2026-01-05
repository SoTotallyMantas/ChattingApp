import { useEffect } from "react";
import { useInvites } from "../../hooks/useInvites";
import { useToast } from "../../context/ToastContext";

export default function InviteListPanel({ serverGuid, innerRef }) {
    const toast = useToast();
    const { invites, loading, loadInvites, revokeInvite } = useInvites(serverGuid);

    useEffect(() => {
        if (!innerRef) return;
        innerRef.current = { reload: loadInvites };
        return () => {
            innerRef.current = null;
        };
    }, [innerRef, loadInvites]);

    const copyInvite = async (invite) => {
        const url = invite.inviteUrl || invite.url || invite.code || invite.inviteGuid || "";
        if (!url) return;
        try {
            await navigator.clipboard.writeText(url);
            toast.show("success", "Invite copied to clipboard.");
        } catch {
            toast.show("error", "Failed to copy invite.");
        }
    };

    const formatExpiry = (inv) => {
        if (inv.expiresAt) {
            try {
                return new Date(inv.expiresAt).toLocaleString();
            } catch {
                return inv.expiresAt;
            }
        }
        return "Never";
    };

    return (
        <div className="list-panel">
            <h3 className="panel-title">Active Invites</h3>

            {loading && <div className="invite-list-muted">Loading invites...</div>}

            {!loading && invites.length === 0 && (
                <div className="invite-list-muted">No active invites.</div>
            )}

            {!loading && invites.map((inv) => {
                const url = inv.inviteUrl || inv.url || inv.code || inv.inviteGuid;
                const uses = inv.remainingUses ?? inv.maxUses ?? "?";
                return (
                    <div key={inv.inviteGuid || url} className="channel-row">
                        <div className="invite-row-details">
                            <div className="invite-row-url">
                                {url || "Invite"}
                            </div>
                            <div className="invite-row-meta">
                                Uses: {uses} | Expires: {formatExpiry(inv)}
                            </div>
                        </div>
                        <div className="invite-row-actions">
                            <button className="button" onClick={() => copyInvite(inv)}>Copy</button>
                            <button className="button" onClick={() => revokeInvite(inv.inviteGuid)}>Revoke</button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
