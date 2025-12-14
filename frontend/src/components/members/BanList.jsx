
import { useEffect, useState } from "react";
import { getServerBans, unbanMember } from "../../api/serverMembers";
import { useAppState } from "../../context/AppStateContext";
import { useOverlay } from "../../context/OverlayContext";
import ConfirmModal from "../../common/ConfirmModal";

export default function BanList() {
    const { selectedServer } = useAppState();
    const [bans, setBans] = useState([]);
    const [loading, setLoading] = useState(false);
    const { openOverlay, closeOverlay } = useOverlay();

    useEffect(() => {
        if (!selectedServer) return;

        async function load() {
            setLoading(true);
            const data = await getServerBans(selectedServer.serverGuid);
            setBans(data || []);
            setLoading(false);
        }

        load();
    }, [selectedServer]);

    return (
        <div style={{ padding: 4 }}>
            <h2 style={{ marginBottom: 12 }}>Banned Users</h2>

            {loading && <div style={{ color: "var(--text-secondary)" }}>Loading...</div>}
            {!loading && bans.length === 0 && (
                <div style={{ color: "var(--text-secondary)" }}>No bans.</div>
            )}

            {bans.map((b) => (
                <div
                    key={b.userGuid}
                    style={{
                        padding: 10,
                        marginBottom: 8,
                        background: "var(--bg-tertiary)",
                        borderRadius: 6,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        border: `1px solid var(--border-color)`
                    }}
                >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ color: "var(--text-primary)" }}>{b.displayName || b.userName}</span>
                        <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>{b.userName}</span>
                    </div>
                    <button
                        style={btnConfirm}
                        onClick={() => {
                            if (!selectedServer) return;
                            openOverlay("confirm", {
                                component: (
                                    <ConfirmModal
                                        title="Unban user"
                                        message={`Unban ${b.displayName || b.userName}?`}
                                        confirmLabel="Unban"
                                        onConfirm={async () => {
                                            await unbanMember(selectedServer.serverGuid, { userGuid: b.userGuid });
                                            const fresh = await getServerBans(selectedServer.serverGuid);
                                            setBans(fresh || []);
                                            closeOverlay();
                                        }}
                                        cancelLabel="Cancel"
                                        variant="danger"
                                    />
                                )
                            });
                        }}
                    >
                        Unban
                    </button>
                </div>
            ))}
        </div>
    );
}

const btnConfirm = {
    padding: "6px 10px",
    background: "#43b581",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    color: "white",
};
