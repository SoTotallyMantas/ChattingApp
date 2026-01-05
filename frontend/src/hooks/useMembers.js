import { useState, useEffect } from "react";
import {
    getServerMembers,
    kickMember,
    banMember,
    unbanMember,
    getServerBans
} from "../api/serverMembers";
import { onSignalREvent, removeSignalREvent } from "../signalr/index.js";

export function useMembers(serverId, permissions = []) {
    const [members, setMembers] = useState([]);
    const [bans, setBans] = useState([]);

    const canViewBans = permissions.includes("BAN_MEMBERS");

    const loadMembers = async () => {
        if (!serverId) return;
        const data = await getServerMembers(serverId);
        setMembers(data);
    };

    const loadBans = async () => {
        if (!serverId || !canViewBans) return; 
        const data = await getServerBans(serverId);
        setBans(data);
    };

    const kick = async (dto) => {
        await kickMember(serverId, dto);
        await loadMembers();
    };

    const ban = async (dto) => {
        if (!canViewBans) return; 
        await banMember(serverId, dto);
        await loadMembers();
        await loadBans();
    };

    const unban = async (dto) => {
        if (!canViewBans) return; 
        await unbanMember(serverId, dto);
        await loadBans();
    };

    useEffect(() => {
        loadMembers();

        if (canViewBans) {
            loadBans();              
        } else {
            setBans([]);           
        }
    }, [serverId, canViewBans]);

    useEffect(() => {
        const HandlePresence = (payload) => {
            const userGuid = payload?.userGuid;
            if(!userGuid)
            {
                return;
            }
            const presence = payload?.status ?? payload?.presence ?? payload?.Presence;

            setMembers(( prevMembers) => 
                prevMembers.map((member) => {
                    
                    if (member.user?.userGuid === userGuid) 
                    {
                        return { ...member, user: { ...member.user, presence } };
                    }
                    return member;
                })
            );
        };
        onSignalREvent("UserPresenceChanged", HandlePresence);
        return () => removeSignalREvent("UserPresenceChanged", HandlePresence);
    }, []);

    useEffect(() => {
        if (!serverId) return;
        const handleMembersUpdated = (payload) => {
            const incomingServer = payload?.serverGuid ?? payload?.ServerGuid;
            if (!incomingServer || incomingServer !== serverId) return;
            loadMembers();
        };
        onSignalREvent("ServerMembersUpdated", handleMembersUpdated);
        return () => removeSignalREvent("ServerMembersUpdated", handleMembersUpdated);
    }, [serverId, canViewBans]);

    useEffect(() => {
        const handleProfileUpdated = (payload) => {
            const userGuid = payload?.userGuid;
            if (!userGuid) return;
            setMembers((prev) =>
                prev.map((member) => {
                    const memberGuid =
                        member?.user?.userGuid ||
                        member?.user?.UserGuid ||
                        member?.userGuid
                    if (memberGuid !== userGuid) return member;
                    const nextUser = {
                        ...member.user,
                        displayName: payload.displayName ?? member.user?.displayName,
                        avatarKey: payload.avatarKey ?? member.user?.avatarKey
                    };
                    return {
                        ...member,
                        user: nextUser,
                        displayName: payload.displayName ?? member.displayName,
                        avatarKey: payload.avatarKey ?? member.avatarKey
                    };
                })
            );
        };
        onSignalREvent("UserProfileUpdated", handleProfileUpdated);
        return () => removeSignalREvent("UserProfileUpdated", handleProfileUpdated);
    }, []);

    return {
        members,
        bans,
        canViewBans,
        loadMembers,
        loadBans,
        kickMember: kick,
        banMember: ban,
        unbanMember: unban
    };
}
