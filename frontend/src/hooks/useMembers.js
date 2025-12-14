import { useState, useEffect } from "react";
import {
    getServerMembers,
    kickMember,
    banMember,
    unbanMember,
    getServerBans
} from "../api/serverMembers";


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
