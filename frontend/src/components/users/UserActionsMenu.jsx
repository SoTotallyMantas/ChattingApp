import ConfirmModal from "../../common/ConfirmModal";
import { useOverlay } from "../../context/OverlayContext";
import { banMember, kickMember } from "../../api/serverMembers";
import { useAppState } from "../../context/AppStateContext";

export default function UserActionsMenu({ user, canKick = false, canBan = false, onAction, x = 0, y = 0 }) {
    const { closeOverlay, openOverlay } = useOverlay();
    const { selectedServer } = useAppState();

    if (!user) return null;

    const doKick = async () => {
        if (!selectedServer) return;
        openOverlay("confirm", {
            component: (
                <ConfirmModal
                    title="Kick user"
                    message={`Kick ${user.displayName || user.userName || "this user"}?`}
                    confirmLabel="Kick"
                    variant="danger"
                    onConfirm={async () => {
                        await kickMember(selectedServer.serverGuid, { userGuid: user.userGuid });
                        onAction?.();
                    }}
                />
            )
        });
    };

    const doBan = async () => {
        if (!selectedServer) return;
        openOverlay("confirm", {
            component: (
                <ConfirmModal
                    title="Ban user"
                    message={`Ban ${user.displayName || user.userName || "this user"}?`}
                    confirmLabel="Ban"
                    variant="danger"
                    onConfirm={async () => {
                        await banMember(selectedServer.serverGuid, { userGuid: user.userGuid });
                        onAction?.();
                    }}
                />
            )
        });
    };

    const viewProfile = () => {
        closeOverlay();
        openOverlay("user-profile", { user });
    };

    return (
        <div
            data-overlay-root="true"
            style={{
                position: "fixed",
                left: x,
                top: y,
                background: "var(--bg-secondary)",
                border: `1px solid var(--border-color)`,
                borderRadius: 8,
                boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
                padding: 8,
                minWidth: 180,
                color: "var(--text-primary)"
            }}
        >
            <MenuItem label="View profile" onClick={viewProfile} />
            {canKick && <MenuItem label="Kick" onClick={doKick} />}
            {canBan && <MenuItem label="Ban" onClick={doBan} />}
        </div>
    );
}

function MenuItem({ label, onClick }) {
    return (
        <div
            onClick={onClick}
            style={{
                padding: "8px 10px",
                borderRadius: 6,
                cursor: "pointer",
                transition: "background 120ms ease"
            }}
        >
            {label}
        </div>
    );
}
