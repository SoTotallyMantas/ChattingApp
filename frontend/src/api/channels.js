import api from "./axios";

export const apiGetChannels = (serverId) =>
    api.get(`/servers/${serverId}/channels`);

export const apiGetChannel = (serverId, channelId) =>
    api.get(`/servers/${serverId}/channels/${channelId}`);

export const apiCreateChannel = (serverId, dto) =>
    api.post(`/servers/${serverId}/channels`, dto);

export const apiUpdateChannel = (serverId, channelId, dto) =>
    api.put(`/servers/${serverId}/channels/${channelId}`, dto);

export const apiDeleteChannel = (serverId, channelId) =>
    api.delete(`/servers/${serverId}/channels/${channelId}`);