
import { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";
import { getInvites, revokeInvite } from "../../api/invites";

export default function InviteListPanel({ serverGuid, innerRef }) {
    const toast = useToast();

    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadInvites = async () => {
        setLoading(true);
        try {
            const data = await getInvites(serverGuid);
            setInvites(data);
        } catch {
            toast.show("error", "Failed to load invites.");
        }
        setLoading(false);
    };

    useEffect(() => {
        loadInvites();
    }, [serverGuid]);

 
    useEffect(() => {
        if (innerRef) {
            innerRef.current = {
                reload: loadInvites,
            };
        }
    }, [innerRef]);

    const revoke = async (inviteGuid) => {
        try {
            await revokeInvite(serverGuid, inviteGuid);
            toast.show("success", "Invite revoked.");
            loadInvites();
        } catch {
            toast.show("error", "Failed to revoke invite.");
        }
    };

    return (
        <div>
            <h3>Active Invites</h3>

            {loading && <p>Loading invites…</p>}

            {!loading && invites.length === 0 && (
                <p style={{ opacity: 0.7 }}>No invites created.</p>
            )}

            <div style={{ marginTop: 10, maxHeight: 350, overflowY: "auto" }}>
                {invites.map((inv) => (
                    <div key={inv.inviteGuid} style={row}>
                        <div>
                            <strong>{inv.inviteCode}</strong>
                            <div style={{ fontSize: 12, opacity: 0.6 }}>
                                Uses: {inv.uses}/{inv.maxUses} <br />
                                Expires: {inv.expiresAt}
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: 8 }}>
                            <button
                                style={copyBtn}
                                onClick={() => {
                                    const link = `${window.location.origin}/invite/${inv.inviteGuid}`;
                                    navigator.clipboard.writeText(link);
                                    toast.show("success", "Copied!");
                                }}
                            >
                                Copy
                            </button>

                            <button
                                style={dangerBtn}
                                onClick={() => revoke(inv.inviteGuid)}
                            >
                                Revoke
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const row = {
    padding: 12,
    background: "#202225",
    borderRadius: 6,
    marginBottom: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
};

const copyBtn = {
    padding: "6px 10px",
    fontSize: 12,
    background: "#5865f2",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    color: "white",
};

const dangerBtn = {
    padding: "6px 10px",
    fontSize: 12,
    background: "#ed4245",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    color: "white",
};
