import { useUserOverlayActions } from "../../context/OverlayContext";

export default function MemberItem({ member, onAction, onClick, canKick = true, canBan = true }) {
    const { handleUserClick, handleUserContext } = useUserOverlayActions();

    return (
        <div
            onClick={(e) => {
                handleUserClick(member.user, e);
                onClick?.(e);
            }} 
            onContextMenu={(e) => {
                handleUserContext(member.user, e, {
                    canKick,
                    canBan,
                    onContext: onAction
                });
            }}
            className="channel-row"
        >
            <div>
                <strong>{member.userName}</strong>
                <div className="channel-row">
                    {member.roles?.map((r) => r.roleName).join(", ")}
                </div>
            </div>
        </div>
    );
}
