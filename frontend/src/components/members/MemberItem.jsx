import { useState } from "react";
import KickMemberModal from "./KickMemberModal";
import BanMemberModal from "./BanMemberModal";

export default function MemberItem({ member, onAction, onClick }) {
    const [kickOpen, setKickOpen] = useState(false);
    const [banOpen, setBanOpen] = useState(false);

    return (
        <div
            onClick={onClick} 
            style={{
                padding: 10,
                marginBottom: 8,
                background: "#2f3136",
                borderRadius: 6,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
            }}
        >
            <div>
                <strong>{member.userName}</strong>
                <div style={{ fontSize: 12, color: "#aaa" }}>
                    {member.roles?.map((r) => r.roleName).join(", ")}
                </div>
            </div>

            <div
                style={{ display: "flex", gap: 8 }}
                onClick={(e) => e.stopPropagation()} 
            >
                <button style={btnAction} onClick={() => setKickOpen(true)}>
                    Kick
                </button>
                <button style={btnDanger} onClick={() => setBanOpen(true)}>
                    Ban
                </button>
            </div>

            {kickOpen && (
                <KickMemberModal
                    member={member}
                    onClose={() => setKickOpen(false)}
                    onAction={onAction}
                />
            )}

            {banOpen && (
                <BanMemberModal
                    member={member}
                    onClose={() => setBanOpen(false)}
                    onAction={onAction}
                />
            )}
        </div>
    );
}

const btnAction = {
    padding: "6px 10px",
    background: "#5865f2",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    color: "white",
};

const btnDanger = {
    padding: "6px 10px",
    background: "#d83c3e",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    color: "white",
};
