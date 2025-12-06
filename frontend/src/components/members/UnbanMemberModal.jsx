
import { unbanMember } from "../../api/serverMembers";
import { useAppState } from "../../context/AppStateContext";

export default function UnbanMemberModal({ ban, onClose, onAction }) {
    const { selectedServer } = useAppState();

    const unban = async () => {
        await unbanMember(selectedServer.serverGuid, {
            targetUserGuid: ban.userGuid,
        });

        onAction?.();
        onClose();
    };

    return (
        <div style={overlay}>
            <div style={box}>
                <h2>Unban {ban.userName}?</h2>

                <div style={actions}>
                    <button onClick={onClose} style={btnCancel}>Cancel</button>
                    <button onClick={unban} style={btnConfirm}>Unban</button>
                </div>
            </div>
        </div>
    );
}

const overlay = { ... };
const box = { ... };
const actions = { ... };
const btnCancel = { ... };
const btnConfirm = {
    padding: "6px 12px",
    background: "#43b581",
    borderRadius: 4,
    border: "none",
    cursor: "pointer",
    color: "white",
};
