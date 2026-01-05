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
        <div className="ban-list">
            <h2 className="ban-list-title">Banned Users</h2>

            {loading && <div className="ban-list-muted">Loading...</div>}
            {!loading && bans.length === 0 && (
                <div className="ban-list-muted">No bans.</div>
            )}

            {bans.map((b) => {
                const target = b.user || {};
                const displayName = target.displayName || target.userName || "Unknown";
                const userGuid = target.userGuid;
                return (
                <div
                    key={b.banGuid || userGuid}
                    className="ban-list-item"
                >
                    <div className="ban-list-info">
                        <span className="ban-list-name">{displayName}</span>
                        <span className="ban-list-username">{target.userName}</span>
                        {b.reason && (
                            <span className="ban-list-username">
                                Reason: {b.reason}
                            </span>
                        )}
                    </div>
                    <button
                        className="button"
                        onClick={() => {
                            if (!selectedServer) return;
                            if (!userGuid) return;
                            openOverlay("confirm", {
                                component: (
                                    <ConfirmModal
                                        title="Unban user"
                                        message={`Unban ${displayName}?`}
                                        confirmLabel="Unban"
                                        onConfirm={async () => {
                                            await unbanMember(selectedServer.serverGuid, { userGuid });
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
                );
            })}
        </div>
    );
}
