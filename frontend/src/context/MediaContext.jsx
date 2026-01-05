import { createContext, useContext, useState, useEffect, useRef } from "react";
import { getUnifiedConnection, onUserEvent } from "../signalr/Media";  
import { onSignalREvent, removeSignalREvent } from "../signalr/index";
import { useAuth } from "./AuthContext";
import { getAccessToken } from "../api/axios";
import { apiGetVoiceUsers } from "../api/channels";
import { MediaRoomClient } from '../webrtc/MediaRoomClient';  

const MediaContext = createContext(null);

const hasActiveVideoTrack = (stream) => {
    if (!stream?.getVideoTracks) return false;
    return stream.getVideoTracks().some(track => track.readyState === "live" && track.enabled !== false);
};

export function MediaProvider({ children }) {
    const { loadingAuth, user: authUser } = useAuth();
    const authUserRef = useRef(authUser);
    const conn = getUnifiedConnection(); 
    const [joinedChannel, setJoinedChannel] = useState(null);
    const [users, setUsers] = useState([]);
    const [myState, setMyState] = useState({ micMuted: false, isDeaf: false });
    const [janusClient, setJanusClient] = useState(null); 
    const [localStream, setLocalStream] = useState(null);  
    const [remoteStreams, setRemoteStreams] = useState(new Map());    
    const [videoTiles, setVideoTiles] = useState([]);
    const [roomId, setRoomId] = useState(null);
    const [micDeviceId, setMicDeviceId] = useState(null);
    const [cameraEnabled, setCameraEnabled] = useState(false);
    const prevMicMutedRef = useRef(false);
    const joinedChannelRef = useRef(joinedChannel);
    const myStateRef = useRef(myState);
    const JanusClientRef = useRef(janusClient);
    const updateLocalStream = (stream) => {
        if (!stream) {
            setLocalStream(null);
            return;
        }
        const tracks = stream.getTracks ? stream.getTracks() : [];
        setLocalStream(new MediaStream(tracks));
    };

    useEffect(() => {
        JanusClientRef.current = janusClient;
    }, [janusClient]);

    useEffect(() => {
        const start = async () => {
            if (loadingAuth) return;
            const token = getAccessToken();
            if (!token) return;

            try {
                await conn.ensureStarted();
            } catch (err) {
                console.error("SignalR connection failed to start", err);
            }
        };
        start();
    }, [loadingAuth, conn]);

  
    useEffect(() => {
        authUserRef.current = authUser;
    }, [authUser]);

    useEffect(() => {
        joinedChannelRef.current = joinedChannel;
    }, [joinedChannel]);

    useEffect(() => {
        myStateRef.current = myState;
    }, [myState]);

    useEffect(() => {
        onUserEvent("UserJoinedChannel", (user) => {
            console.log("UserJoinedChannel payload:", user);
             if (!joinedChannelRef.current) return;

            const incomingGuid = user?.userGuid ?? user?.UserGuid ?? user?.userId ?? user?.UserId;
            if (!incomingGuid) return;

            const incomingChannel = user?.channelGuid ?? user?.ChannelGuid ?? user?.channelId ?? user?.ChannelId;
            if (incomingChannel && incomingChannel !== joinedChannelRef.current) return;

            const selfGuid = authUserRef.current?.userGuid ?? authUserRef.current?.UserGuid ?? authUserRef.current?.userId ?? authUserRef.current?.UserId;
            const enriched = incomingGuid === selfGuid && authUserRef.current
                ? { ...user, displayName: authUserRef.current.displayName, userName: authUserRef.current.userName }
                : user;

            setUsers((prevUsers) => {
                const existingIdx = prevUsers.findIndex(u =>
                    (u?.userGuid ?? u?.UserGuid ?? u?.userId ?? u?.UserId) === incomingGuid
                );

                if (existingIdx >= 0) {
                    const next = [...prevUsers];
                    const existing = next[existingIdx];
                    next[existingIdx] = {
                        ...existing,
                        ...enriched,
                        isMuted: (enriched?.isMuted ?? enriched?.IsMuted) ?? existing.isMuted,
                        isDeafened: (enriched?.isDeafened ?? enriched?.IsDeafened) ?? existing.isDeafened
                    };
                    return next;
                }
                return [...prevUsers, enriched];
            });
        });

        onUserEvent("UserLeftChannel", (user) => {
            const incomingGuid = user?.userGuid ?? user?.UserGuid ?? user?.userId ?? user?.UserId;
            if (!incomingGuid) return;

            setUsers(prev =>
                prev.filter(u => (u?.userGuid ?? u?.UserGuid ?? u?.userId ?? u?.UserId) !== incomingGuid)
            );
        });

        onUserEvent("UserMutedState", (user) => {
            const incomingGuid = user?.userGuid ?? user?.UserGuid ?? user?.userId ?? user?.UserId;
            const incomingMuted = user?.isMuted ?? user?.IsMuted;
            if (!incomingGuid || incomingMuted === undefined) return;

            setUsers(prev =>
                prev.map(u =>
                    (u?.userGuid ?? u?.UserGuid ?? u?.userId ?? u?.UserId) === incomingGuid
                        ? { ...u, isMuted: incomingMuted }
                        : u
                )
            );
        });

        onUserEvent("UserDeafenedState", (user) => {
            const incomingGuid = user?.userGuid ?? user?.UserGuid ?? user?.userId ?? user?.UserId;
            const incomingDeaf = user?.isDeafened ?? user?.IsDeafened;
            if (!incomingGuid || incomingDeaf === undefined) return;

            setUsers(prev =>
                prev.map(u =>
                    (u?.userGuid ?? u?.UserGuid ?? u?.userId ?? u?.UserId) === incomingGuid
                        ? { ...u, isDeafened: incomingDeaf }
                        : u
                )
            );
        });

        onUserEvent("SpeakingState", (user) => {
            if (!joinedChannelRef.current) return;
            setUsers((prevUsers) =>
                prevUsers.map(u => u.userGuid === user.userGuid ? { ...u, isSpeaking: user.isSpeaking } : u)
            );
        });

        onUserEvent("VoiceDisconnected", async (payload) => {
            const activeChannel = joinedChannelRef.current;
            if (!activeChannel) return;
            if (payload.channelGuid !== activeChannel) return;

            try {
                await JanusClientRef.current?.leaveRoom();
            } catch (err) {
                console.error("Error leaving Janus room after being disconnected", err);
            }

            setJoinedChannel(null);
            updateLocalStream(null);
            setRemoteStreams(new Map());
            setJanusClient(null);
            setRoomId(null);
            setUsers([]);
            setCameraEnabled(false);
        })
    }, []);

    useEffect(() => {
        const handleProfileUpdated = (payload) => {
            const userGuid = payload?.userGuid;
            if (!userGuid) return;
            setUsers((prev) =>
                prev.map((u) => {
                    const guid = u?.userGuid ?? u?.UserGuid ?? u?.userId ?? u?.UserId;
                    if (guid !== userGuid) return u;
                    return {
                        ...u,
                        displayName: payload.displayName ?? u.displayName,
                        avatarKey: payload.avatarKey ?? u.avatarKey
                    };
                })
            );
        };
        onSignalREvent("UserProfileUpdated", handleProfileUpdated);
        return () => removeSignalREvent("UserProfileUpdated", handleProfileUpdated);
    }, []);

   
    const joinVoice = async (channelGuid) => {
        await conn.ensureStarted();
        joinedChannelRef.current = channelGuid;
        if(joinedChannel === channelGuid && janusClient){
            return;
        };
        const { roomId } = await conn.invoke("JoinChannel", channelGuid);
        await conn.invoke("WatchChannel", channelGuid);
        setJoinedChannel(channelGuid);
        setUsers([]);
        let client = janusClient;
        if (client && joinedChannel && joinedChannel !== channelGuid) {
            await client.leaveRoom();
            client = null;
            setJanusClient(null);
        }

        if (!client) {
            client = new MediaRoomClient(roomId, updateLocalStream, addRemoteStream, removeRemoteStream);
            await client.initialize();
            if (micDeviceId) {
                await client.setAudioDevice(micDeviceId);
            }
            await client.joinRoom(roomId);
            setJanusClient(client);
        } else {
            if (micDeviceId) {
                await client.setAudioDevice(micDeviceId);
            }
            await client.joinRoom(roomId);
        }

       
        setRoomId(roomId);
    

        try {
            const { data } = await apiGetVoiceUsers(channelGuid);
            const list = Array.isArray(data) ? data : [];
              
            setUsers(prev => {
                const byId = new Map();
                prev.forEach(u => {
                    const id = u.userGuid ?? u.UserGuid;
                    if (id) byId.set(id, u);
                });

                list.forEach(u => {
                    const id = u.userGuid ?? u.UserGuid;
                    if (!id) return;
                    const existing = byId.get(id) ?? {};
                    byId.set(id, { ...existing, ...u });
                });
                return [...byId.values()];
            });
        
        } catch (err) {
            console.error("Failed to load voice users", err);
        }

        try {
            if (myStateRef.current?.micMuted) {
                await conn.invoke("MuteUser", channelGuid, true);
                client?.setAudioEnabled?.(false);
            }
            if (myStateRef.current?.isDeaf) {
                await conn.invoke("DeafenUser", channelGuid, true);
                client?.setRemoteAudioEnabled?.(false);
            }
        } catch (err) {
            console.error("Failed to apply pre-join voice state", err);
        }
    };

    const leaveVoice = async () => {
        
        try {
            const activeChannel = joinedChannelRef.current;
            if(activeChannel){
                await conn.invoke("UnwatchChannel", activeChannel);
            }
            await janusClient?.leaveRoom();
            await conn.invoke("LeaveChannel");
        } catch (err) {
            console.error("Error leaving Janus room", err);
        }
        setJoinedChannel(null);
        updateLocalStream(null);
        setRemoteStreams(new Map());
        setJanusClient(null);
        setRoomId(null);
        setUsers([]);
        setCameraEnabled(false);
    };

  
    const addRemoteStream = (videoElement, userGuid) => {
        setRemoteStreams(prev => new Map(prev).set(userGuid, videoElement));
    };

  
    const removeRemoteStream = (videoElement, userGuid) => {
        setRemoteStreams(prev => {
            const updated = new Map(prev);
            updated.delete(userGuid);
            return updated;
        });
    };

   
    const muteMic = async () => {
        setMyState(s => {
            const next = ({ ...s, micMuted: true });
            myStateRef.current = next;
            return next;
        });
        if (!joinedChannel) return;
        await conn.invoke("MuteUser", joinedChannel, true);
        janusClient?.setAudioEnabled?.(false);
    };

    const unmuteMic = async () => {
        if (myStateRef.current?.isDeaf) {
            prevMicMutedRef.current = false;
            await undeafen();
            return;
        }
        setMyState(s => {
            const next = ({ ...s, micMuted: false });
            myStateRef.current = next;
            return next;
        });
        if (!joinedChannel) return;
        await conn.invoke("MuteUser", joinedChannel, false);
        janusClient?.setAudioEnabled?.(true);
    };

   
    const deafen = async () => {
        prevMicMutedRef.current = myStateRef.current?.micMuted ?? false;
        setMyState(s => {
            const next = ({ ...s, micMuted: true, isDeaf: true });
            myStateRef.current = next;
            return next;
        });
        if (!joinedChannel) return;
        await conn.invoke("MuteUser", joinedChannel, true);
        await conn.invoke("DeafenUser", joinedChannel, true);
        JanusClientRef.current?.setRemoteAudioEnabled?.(false);
        JanusClientRef.current?.setAudioEnabled?.(false);
    };

    const undeafen = async () => {
        setMyState(s => {
            const next = ({ ...s, isDeaf: false, micMuted: prevMicMutedRef.current });
            myStateRef.current = next;
            return next;
        });
        if (!joinedChannel) return;
        await conn.invoke("MuteUser", joinedChannel, prevMicMutedRef.current);
        await conn.invoke("DeafenUser", joinedChannel, false);
        JanusClientRef.current?.setRemoteAudioEnabled?.(true);
        JanusClientRef.current?.setAudioEnabled?.(!prevMicMutedRef.current);
    };

    const selectMicrophone = async (deviceId) => {
        setMicDeviceId(deviceId);
        if (janusClient) {
            await janusClient.setAudioDevice(deviceId);
        }
    };

   
    const startCamera = async (channelGuid) => {
        const guid = channelGuid || joinedChannel;
        const activeRoomId = roomId;
        if (!guid || !activeRoomId) return;

        let client = janusClient;
        if (!client) {
            client = new MediaRoomClient(activeRoomId, updateLocalStream, addRemoteStream, removeRemoteStream);
            await client.initialize();
            if (micDeviceId) {
                await client.setAudioDevice(micDeviceId);
            }
            await client.joinRoom(activeRoomId);
            setJanusClient(client);
        } 
        await client.setVideoEnabled(true);
        setCameraEnabled(true);
        const muted = !!myStateRef.current?.micMuted;
        const deaf = !!myStateRef.current?.isDeaf;
        client.setAudioEnabled(!muted && !deaf);
        client.setRemoteAudioEnabled(!deaf);

    };

    const toggleCamera = async () => {
        if (!joinedChannelRef.current) return;
        if (cameraEnabled) {
            try {
                await janusClient?.setVideoEnabled(false);
            } catch (err) {
                console.error("Failed to disable camera", err);
                return;
            }
            setCameraEnabled(false);
            return;
        }
        await startCamera(joinedChannelRef.current);
    };

    useEffect(() => {
    const tiles = [];
    
    if (hasActiveVideoTrack(localStream)) {
        tiles.push({ id: "local", stream: localStream });
    }
  
    remoteStreams.forEach((stream, userId) => {
        if (hasActiveVideoTrack(stream)) {
            tiles.push({ id: userId, stream });
        }
    });

    setVideoTiles((prevTiles) => {
     
        if (JSON.stringify(prevTiles) !== JSON.stringify(tiles)) {
            return tiles;
        }
        return prevTiles; 
    });
}, [localStream, remoteStreams]);

    return (
        <MediaContext.Provider value={{
            joinVoice,  
            joinedChannel,
            setJoinedChannel,
            roomId,
            users,
            myState,
            localStream,
            remoteStreams,
            videoTiles,
            cameraEnabled,
            muteMic,
            unmuteMic,
            deafen,
            undeafen,
            startCamera,
            toggleCamera,
            leaveVoice,
            selectMicrophone,
            micDeviceId,
        }}>
            {children}
        </MediaContext.Provider>
    );
}

export function useMediaState() {
    return useContext(MediaContext);
}
