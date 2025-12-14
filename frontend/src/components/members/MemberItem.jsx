import UserActionsMenu from "../users/UserActionsMenu";
import { useOverlay } from "../../context/OverlayContext";

export default function MemberItem({ member, onAction, onClick, canKick = true, canBan = true }) {
    const { openOverlay, closeOverlay } = useOverlay();
    const baseBg = "var(--bg-tertiary)";

    return (
        <div
            onClick={onClick} 
            onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openOverlay("user-actions", {
                    component: (
                        <UserActionsMenu
                            user={member.user}
                            canKick={canKick}
                            canBan={canBan}
                            onAction={() => {
                                onAction?.();
                                closeOverlay();
                            }}
                            x={e.clientX}
                            y={e.clientY}
                        />
                    )
                });
            }}
            style={{
                padding: 10,
                marginBottom: 8,
                background: baseBg,
                borderRadius: 6,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                color: "var(--text-primary)",
                transition: "background 120ms ease"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = baseBg)}
        >
            <div>
                <strong>{member.userName}</strong>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                    {member.roles?.map((r) => r.roleName).join(", ")}
                </div>
            </div>
        </div>
    );
}
