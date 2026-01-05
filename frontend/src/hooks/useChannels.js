
import { useState, useEffect } from "react";
import {
    apiGetChannels,
    apiGetChannel,
    apiCreateChannel,
    apiUpdateChannel,
    apiDeleteChannel
} from "../api/channels";
import { onSignalREvent, removeSignalREvent } from "../signalr";

export function useChannels(serverGuid) {
    const [channels, setChannels] = useState([]);
    const [currentChannel, setCurrentChannel] = useState(null);


    const loadChannels = async () => {
        if (!serverGuid) return;

        const { data } = await apiGetChannels(serverGuid);


        const sorted = [...data].sort((a, b) => a.position - b.position);
        setChannels(sorted);
    };

    const loadChannel = async (channelGuid) => {
        const { data } = await apiGetChannel(serverGuid, channelGuid);
        setCurrentChannel(data);
    };


    const createChannel = async (dto) => {
        const { data } = await apiCreateChannel(serverGuid, dto);

        await loadChannels();
        return data;
    };

 
    const updateChannel = async (channelGuid, dto) => {
        const { data } = await apiUpdateChannel(serverGuid, channelGuid, dto);

        await loadChannels();
        return data;
    };

   
    const deleteChannel = async (channelGuid) => {
        await apiDeleteChannel(serverGuid, channelGuid);
        await loadChannels();
    };

   
    useEffect(() => {
        loadChannels();
    }, [serverGuid]);

    useEffect(() => {
        if (!serverGuid) return;
        const handleChannelsUpdated = (payload) => {
            const incomingServer = payload?.serverGuid ?? payload?.ServerGuid;
            if (!incomingServer || incomingServer !== serverGuid) return;
            loadChannels();
        };
        onSignalREvent("ServerChannelsUpdated", handleChannelsUpdated);
        return () => removeSignalREvent("ServerChannelsUpdated", handleChannelsUpdated);
    }, [serverGuid]);

    return {
        channels,
        currentChannel,
        loadChannels,
        loadChannel,
        createChannel,
        updateChannel,
        deleteChannel
    };
}
