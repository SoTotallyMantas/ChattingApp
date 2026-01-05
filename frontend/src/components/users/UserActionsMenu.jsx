import ConfirmModal from "../../common/ConfirmModal";
import { useOverlay } from "../../context/OverlayContext";
import { banMember, kickMember } from "../../api/serverMembers";
import { useAppState } from "../../context/AppStateContext";
import { useFriends } from "../../hooks/useFriends";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

export default function UserActionsMenu({ user, canKick = false, canBan = false, onAction, x = 0, y = 0 }) {
    const { closeOverlay, openOverlay } = useOverlay();
    const { selectedServer } = useAppState();
    const { user: currentUser } = useAuth();
    const toast = useToast();
    const targetGuid =
        user?.userGuid ?? user?.UserGuid ?? user?.userId ?? user?.UserId;
    
    const {
        friends,
        isFriend,
        isPendingOut,
        isPendingIn,
        sendRequest,
        accept,
        reject,
        blocked,
        unblock,
        remove
    } = useFriends();

    const blockedEntry =  blocked.find((friend) => friend.friendGuid === user.userGuid);
    const isBlocked = Boolean(blockedEntry);
    if (!user) return null;
    const isSelf = currentUser?.userGuid === user.userGuid;

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
                        if (!targetGuid) {
                            toast.show("error", "Could not find user id.");
                            return;
                        }
                        try {
                            await kickMember(selectedServer.serverGuid, { userGuid: targetGuid });
                            toast.show("success", "User kicked.");
                            onAction?.();
                        } catch (err) {
                            const message = err?.response?.data?.message || "Could not kick user.";
                            toast.show("error", message);
                        }
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
                    inputLabel="Reason"
                    inputPlaceholder="Why are you banning this user?"
                    inputRequired
                    inputMultiline
                    onConfirm={async (reason) => {
                        if (!targetGuid) {
                            toast.show("error", "Could not find user id.");
                            return;
                        }
                        const trimmedReason = (reason || "").trim();
                        if (!trimmedReason) {
                            toast.show("error", "Reason is required.");
                            return;
                        }
                        try {
                            await banMember(selectedServer.serverGuid, { userGuid: targetGuid, reason: trimmedReason });
                            toast.show("success", "User banned.");
                            onAction?.();
                        } catch (err) {
                            const message = err?.response?.data?.message || "Could not ban user.";
                            toast.show("error", message);
                        }
                    }}
                />
            )
        });
    };

    const viewProfile = () => {
        closeOverlay();
        openOverlay("user-profile", { user });
    };

    
    const friendEntry = friends.find((f) => f.friendGuid === user.userGuid);
    const handleRemove = () => {
         
       
        if (!friendEntry?.friendshipGuid) return;
        openOverlay("confirm", {
            component: (
                <ConfirmModal
                    title="Remove friend"
                    message={`Remove ${user.displayName || user.userName || "this user"}?`}
                    confirmLabel="Remove"
                    variant="danger"
                    onConfirm={async () => {   
                        await remove(friendEntry.friendshipGuid);
                        toast.show("success", "Friend removed");
                        onAction?.();
                    }}
                />
            )
        });
    };
    const handleAddFriend = async () => {
        try {
            await sendRequest(user.userGuid);
            toast.show("success", "Friend request sent");
        } catch {
            toast.show("error", "Could not send request");
        }
    };

    const handleAccept = async () => {
        try {
            const incoming = isPendingIn(user.userGuid);
            if (incoming?.friendshipGuid) {
                await accept(incoming.friendshipGuid);
                toast.show("success", "Request accepted");
            }
        } catch {
            toast.show("error", "Could not accept");
        }
    };
    
    const handleReject = async () => {
        try {
            const incoming = isPendingIn(user.userGuid);
            if (incoming?.friendshipGuid) {
                await reject(incoming.friendshipGuid);
                toast.show("success", "Request rejected");
            }
        } catch {
            toast.show("error", "Could not reject");
        }
    };

    return (
        <div
            data-overlay-root="true"
            className="user-actions-menu"
            style={{ left: x, top: y }}
        >
            <MenuItem label="View profile" onClick={viewProfile} />
            {!isSelf && !isFriend(user.userGuid) && !isPendingOut(user.userGuid) && !isPendingIn(user.userGuid) && (
                <MenuItem label="Add friend" onClick={handleAddFriend} />
            )}
            {!isSelf && isPendingOut(user.userGuid) && (
                <MenuItem label="Request sent" />
            )}
            {!isSelf && isFriend(user.userGuid) && (
                <MenuItem label="Remove friend" onClick={handleRemove} />
            )}
            {!isSelf && isBlocked && (
                <MenuItem label="Unblock" onClick={async () => {
                    await unblock(blockedEntry.friendshipGuid);
                    toast.show("success", "User unblocked");
                    onAction?.();
                }}
                />
            )}
            {!isSelf && isPendingIn(user.userGuid) && (
                <>
                    <MenuItem label="Accept request" onClick={handleAccept} />
                    <MenuItem label="Reject request" onClick={handleReject} />
                </>
            )}
            {canKick && <MenuItem label="Kick" onClick={doKick} />}
            {canBan && <MenuItem label="Ban" onClick={doBan} />}
        </div>
    );
}

    function MenuItem({ label, onClick }) {
        return (
            <div
                onClick={onClick}
                className="channel-row"
            >
                {label}
            </div>
        );
    }
