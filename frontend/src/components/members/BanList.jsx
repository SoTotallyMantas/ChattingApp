
import { useEffect, useState } from "react";
import { getServerBans } from "../../api/serverMembers";
import UnbanMemberModal from "./UnbanMemberModal";
import { useAppState } from "../../context/AppStateContext";

export default function BanList() {
    const { selectedServer } = useAppState();
    const [bans, setBans] = useState([]);
    const [unbanTarget, setUnbanTarget] = useState(null);

    useEffect(() => {
        if (!selectedServer) return;

        async function load() {
            const data = await getServerBans(selectedServer.serverGuid);
            setBans(data);
        }

        load();
    }, [selectedServer]);

    return (
        <div style={{ padding: 20, color: "white" }}>
            <h2>Banned Users</h2>

            {bans.map((b) => (
                <div
                    key={b.userGuid}
                    style={{
                        padding: 10,
                        marginBottom: 8,
                        background: "#2f3136",
                        borderRadius: 6,
                        display: "flex",
                        justifyContent: "space-between",
                    }}
                >
                    <span>{b.userName}</span>
                    <button style={btnConfirm} onClick={() => setUnbanTarget(b)}>
                        Unban
                    </button>
                </div>
            ))}

            {unbanTarget && (
                <UnbanMemberModal
                    ban={unbanTarget}
                    onClose={() => setUnbanTarget(null)}
                    onAction={() => {
                        getServerBans(selectedServer.serverGuid).then(setBans);
                    }}
                />
            )}
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
