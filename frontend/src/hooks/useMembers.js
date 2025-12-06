
import { useState, useEffect } from "react";
import {
    getServerMembers,
    kickMember,
    banMember,
    unbanMember,
    getServerBans
} from "../api/serverMembers";

export function useMembers(serverId) {
    const [members, setMembers] = useState([]);
    const [bans, setBans] = useState([]);

    const loadMembers = async () => {
        if (!serverId) return;
        const data = await getServerMembers(serverId);
        setMembers(data);
    };

    const loadBans = async () => {
        if (!serverId) return;
        const data = await getServerBans(serverId);
        setBans(data);
    };

    const kick = async (dto) => {
        await kickMember(serverId, dto);
        await loadMembers();
    };

    const ban = async (dto) => {
        await banMember(serverId, dto);
        await loadMembers();
        await loadBans();
    };

    const unban = async (dto) => {
        await unbanMember(serverId, dto);
        await loadBans();
    };

    useEffect(() => {
        loadMembers();
        loadBans();
    }, [serverId]);

    return {
        members,
        bans,
        loadMembers,
        loadBans,
        kickMember: kick,
        banMember: ban,
        unbanMember: unban
    };
}
