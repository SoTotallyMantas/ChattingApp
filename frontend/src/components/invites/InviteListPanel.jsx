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
        <div style={container}>
            <h3 style={{ marginTop: 0, color: "var(--text-primary)" }}>Active Invites</h3>

            {loading && <div style={{ color: "var(--text-secondary)" }}>Loading invites...</div>}

            {!loading && invites.length === 0 && (
                <div style={{ color: "var(--text-secondary)" }}>No active invites.</div>
            )}

            {!loading && invites.map((inv) => {
                const url = inv.inviteUrl || inv.url || inv.code || inv.inviteGuid;
                const uses = inv.remainingUses ?? inv.maxUses ?? "∞";
                return (
                    <div key={inv.inviteGuid || url} style={inviteRow}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {url || "Invite"}
                            </div>
                            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                                Uses: {uses} · Expires: {formatExpiry(inv)}
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button style={ghostBtn} onClick={() => copyInvite(inv)}>Copy</button>
                            <button style={dangerBtn} onClick={() => revokeInvite(inv.inviteGuid)}>Revoke</button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

const container = {
    background: "var(--bg-secondary)",
    padding: 20,
    borderRadius: 8,
    color: "var(--text-primary)"
};

const inviteRow = {
    background: "var(--bg-tertiary)",
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "var(--text-primary)",
    gap: 10
};

const ghostBtn = {
    padding: "8px 10px",
    borderRadius: 6,
    border: `1px solid var(--border-color)`,
    background: "transparent",
    color: "var(--text-primary)",
    cursor: "pointer"
};

const dangerBtn = {
    padding: "8px 10px",
    borderRadius: 6,
    border: "none",
    background: "var(--danger)",
    color: "#fff",
    cursor: "pointer"
};