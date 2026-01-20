
import { useState, useEffect } from "react";
import {
    createInvite,
    getInvites,
    joinServer,
    revokeInvite,
} from "../api/invites";
import { onSignalREvent, removeSignalREvent } from "../signalr";

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

    useEffect(() => {
        if (!serverGuid) return;
        const handleInvitesUpdated = (payload) => {
            const incomingServer = payload?.serverGuid ?? payload?.ServerGuid;
            if (!incomingServer || incomingServer !== serverGuid) return;
            loadInvites();
        };
        onSignalREvent("ServerInvitesUpdated", handleInvitesUpdated);
        return () => removeSignalREvent("ServerInvitesUpdated", handleInvitesUpdated);
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
