import { useMembers } from "../hooks/useMembers";
import { useAppState } from "../context/AppStateContext";

export default function MembersSidebar() {
    const { selectedServer } = useAppState();
    const { members } = useMembers(selectedServer?.serverGuid);

    if (!selectedServer) return null;

    return (
        <div
            style={{
                width: 240,
                background: "#2f3136",
                color: "white",
                display: "flex",
                flexDirection: "column",
                padding: "10px",
                overflowY: "auto",
                borderLeft: "1px solid #202225",
            }}
        >
            <div
                style={{
                    fontSize: 14,
                    fontWeight: 600,
                    opacity: 0.7,
                    marginBottom: 12,
                }}
            >
                Members — {members.length}
            </div>

            {members.map((member) => (
                <div
                    key={member.userGuid}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "6px 8px",
                        borderRadius: 6,
                        cursor: "pointer",
                        gap: 10,
                    }}
                >
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: "#444",
                        }}
                    />
                    <div>
                        <div style={{ fontSize: 14 }}>
                            {member.displayName || member.userName}
                        </div>
                        <div
                            style={{
                                fontSize: 12,
                                opacity: 0.6,
                            }}
                        >
                            {member.roleName || ""}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
