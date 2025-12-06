
import { useState, useEffect } from "react";
import {
    apiGetChannels,
    apiGetChannel,
    apiCreateChannel,
    apiUpdateChannel,
    apiDeleteChannel
} from "../api/channels";

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
