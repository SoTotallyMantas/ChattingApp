
import { useState, useEffect } from "react";
import {
    createInvite,
    getInvites,
    joinServer,
    revokeInvite,
} from "../api/invites";

export function useInvites(serverGuid) {
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadInvites = async () => {
        if (!serverGuid) return;
        setLoading(true);
        const data = await getInvites(serverGuid);
        setInvites(data);
        setLoading(false);
    };

    const create = async (dto) => {
        const newInvite = await createInvite(serverGuid, dto);
        await loadInvites();
        return newInvite;
    };

    const revoke = async (inviteGuid) => {
        await revokeInvite(serverGuid, inviteGuid);
        await loadInvites();
    };

    const join = async (inviteGuid) => {
        return await joinServer(inviteGuid, serverGuid);
    };

    useEffect(() => {
        loadInvites();
    }, [serverGuid]);

    return {
        invites,
        loading,
        loadInvites,
        createInvite: create,
        revokeInvite: revoke,
        joinServer: join,
    };
}
