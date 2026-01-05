import { createContext, useContext, useState, useEffect } from "react";
import UserActionsMenu from "../components/users/UserActionsMenu";
import { useAppState } from "./AppStateContext";
import { useAuth } from "./AuthContext";
import { useMembers } from "../hooks/useMembers";
import { canActOnTarget } from "../utils/roleHierarchy";

const OverlayContext = createContext(null);

export function OverlayProvider({ children }) {
    const [overlay, setOverlay] = useState(null);
    const { selectedServer } = useAppState();
    const { user: currentUser } = useAuth();
    const { members } = useMembers(
        selectedServer?.serverGuid,
        selectedServer?.permissions || []
    );

    const openOverlay = (type, payload) => setOverlay({ type, payload });
    const closeOverlay = () => setOverlay(null);

    useEffect(() => {
        if (!overlay) return;

        
        const handleMouseDown = (e) => {
            
            if (!e.target.closest("[data-overlay-root='true']")) {
                closeOverlay();
            }
        };

      
        const handleEsc = (e) => {
            if (e.key === "Escape") {
                closeOverlay();
            }
        };

        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("keydown", handleEsc);

        
        return () => {
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("keydown", handleEsc);
        };
    }, [overlay]); 

   

    const getUserGuid = (member) =>
        member?.user?.userGuid ||
        member?.userGuid ||
        member?.userId ||
        member?.user?.UserGuid ||
        member?.UserGuid;

    const getModerationOptions = (targetGuid, options = {}) => {
        const perms = selectedServer?.permissions || [];
        const baseCanKick =
            options.canKick ?? perms.includes("KICK_MEMBERS");
        const baseCanBan =
            options.canBan ?? perms.includes("BAN_MEMBERS");

        const ownerGuid = selectedServer?.ownerGuid || selectedServer?.OwnerGuid;
        const actorGuid = currentUser?.userGuid;

        if (!actorGuid || !targetGuid) {
            return { canKick: false, canBan: false };
        }

        if (targetGuid === actorGuid) {
            return { canKick: false, canBan: false };
        }

        if (ownerGuid && targetGuid === ownerGuid) {
            return { canKick: false, canBan: false };
        }

        if (ownerGuid && actorGuid === ownerGuid) {
            return { canKick: baseCanKick, canBan: baseCanBan };
        }

        const actorMember = members.find((m) => getUserGuid(m) === actorGuid);
        const targetMember = members.find((m) => getUserGuid(m) === targetGuid);
        const canTarget = canActOnTarget(actorMember, targetMember);
        return {
            canKick: baseCanKick && canTarget,
            canBan: baseCanBan && canTarget
        };
    };

    return (
        <OverlayContext.Provider value={{ overlay, openOverlay, closeOverlay, getModerationOptions }}>
            {children}
        </OverlayContext.Provider>
    );
}

export function useOverlay() {
    return useContext(OverlayContext);
}

export function useUserOverlayActions() {
    const { openOverlay, closeOverlay, getModerationOptions } = useOverlay();
    const { selectedServer } = useAppState();

    const openProfile = (user, anchor) => {
        const x = anchor?.x ?? 0;
        const y = anchor?.y ?? 0;
        openOverlay("user-profile", { user, x, y });
    };

    const openActions = (user, coords, options = {}) => {
        if (!user) return;
        const x = coords?.x ?? 0;
        const y = coords?.y ?? 0;
        const targetGuid =
            user?.userGuid ?? user?.UserGuid ?? user?.userId ?? user?.UserId;
        const moderation = getModerationOptions
            ? getModerationOptions(targetGuid, options)
            : { canKick: options.canKick ?? false, canBan: options.canBan ?? false };
        const handleAction = () => {
            options.onAction?.();
            closeOverlay();
        };

        openOverlay("user-actions", {
            component: (
                <UserActionsMenu
                    user={user}
                    canKick={moderation.canKick && !!selectedServer}
                    canBan={moderation.canBan && !!selectedServer}
                    x={x}
                    y={y}
                    onAction={handleAction}
                />
            )
        });
    };

    const handleUserClick = (user, event, options) => {
        if (event?.currentTarget?.getBoundingClientRect) {
            const rect = event.currentTarget.getBoundingClientRect();
            openProfile(user, { x: rect.left + 10, y: rect.bottom + 6 });
        } else {
            openProfile(user, { x: 0, y: 0 });
        }
        options?.onClick?.();
    };

    const handleUserContext = (user, event, options) => {
        event?.preventDefault?.();
        event?.stopPropagation?.();
        openActions(
            user,
            { x: event?.clientX ?? 0, y: event?.clientY ?? 0 },
            options
        );
        options?.onContext?.();
    };

    return { handleUserClick, handleUserContext, openProfile, openActions };
}
