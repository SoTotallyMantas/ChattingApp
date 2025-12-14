
import { useState, useEffect } from "react";
import serverApi from "../api/servers";
import { connectionState } from "../signalr/index";

const reloadEvent = "servers:reload";

export function signalServersReload() {
    window.dispatchEvent(new Event(reloadEvent));
}

export function useServers() {
    const [servers, setServers] = useState([]);
    const [currentServer, setCurrentServer] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadServers = async () => {
        setLoading(true);
        const { data } = await serverApi.getMyServers();
        setServers(data);

      
        connectionState.servers = data.map(s => s.serverGuid);

        setLoading(false);
    };

    const loadServer = async (serverGuid) => {
        const { data } = await serverApi.getServer(serverGuid);
        setCurrentServer(data);
        return data;
    };

    const createServer = async (dto) => {
        const { data } = await serverApi.createServer(dto);
        await loadServers();
        return data;
    };

 
    const updateServer = async (serverGuid, dto) => {
        const { data } = await serverApi.updateServer(serverGuid, dto);
        await loadServers();
        return data;
    };


    const deleteServer = async (serverGuid) => {
        await serverApi.deleteServer(serverGuid);

        if (currentServer?.serverGuid === serverGuid) {
            setCurrentServer(null);
        }

        await loadServers();
    };

 
    const leaveServer = async (serverGuid) => {
        await serverApi.leaveServer(serverGuid);

        if (currentServer?.serverGuid === serverGuid) {
            setCurrentServer(null);
        }

        await loadServers();
    };

  
    useEffect(() => {
        loadServers();
        const handler = () => loadServers();
        window.addEventListener(reloadEvent, handler);
        return () => window.removeEventListener(reloadEvent, handler);
    }, []);

    return {
        servers,
        currentServer,
        loading,
        loadServers,
        loadServer,
        createServer,
        updateServer,
        deleteServer,
        leaveServer
    };
}
