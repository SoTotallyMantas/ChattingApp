import { createContext, useContext, useState, useEffect, useRef } from "react";
import { getUnifiedConnection, onUserEvent } from "../signalr/Media";  
import { useAuth } from "./AuthContext";
import { getAccessToken } from "../api/axios";
import { apiGetVoiceUsers } from "../api/channels";
import { MediaRoomClient } from '../webrtc/MediaRoomClient';  

const MediaContext = createContext(null);

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
        onUserEvent("UserJoinedChannel", (user) => {
            setUsers((prevUsers) => {
                const enriched = {
                    ...user,
                    // Fill in our own display info when the event payload is sparse.
                    ...(user.userGuid === authUserRef.current?.userGuid
                        ? { displayName: authUserRef.current.displayName, userName: authUserRef.current.userName }
                        : {})
                };

                const existingIdx = prevUsers.findIndex(u => u.userGuid === enriched.userGuid);
                if (existingIdx >= 0) {
                    const next = [...prevUsers];
                    next[existingIdx] = { ...next[existingIdx], ...enriched };
                    return next;
                }
                return [...prevUsers, enriched];
            });
        });

        onUserEvent("UserLeftChannel", (user) => {
            setUsers((prevUsers) => prevUsers.filter(u => u.userGuid !== user.userGuid));
            
            setRemoteStreams((prev) => {
                const updated = new Map(prev);
                updated.delete(user.userGuid);
                return updated;
            });
        });

        onUserEvent("UserMutedState", (user) => {
            setUsers((prevUsers) =>
                prevUsers.map(u => u.userGuid === user.userGuid ? { ...u, isMuted: user.isMuted } : u)
            );
        });

        onUserEvent("UserDeafenedState", (user) => {
            setUsers((prevUsers) =>
                prevUsers.map(u => u.userGuid === user.userGuid ? { ...u, isDeafened: user.isDeafened } : u)
            );
        });

        onUserEvent("SpeakingState", (user) => {
            setUsers((prevUsers) =>
                prevUsers.map(u => u.userGuid === user.userGuid ? { ...u, isSpeaking: user.isSpeaking } : u)
            );
        });
    }, []);

   
    const joinVoice = async (channelGuid) => {
        const { roomId } = await conn.invoke("JoinChannel", channelGuid);

        if (janusClient && joinedChannel && joinedChannel !== channelGuid) {

            await janusClient.leaveRoom(); 
        }

        if (!janusClient) {
       
            const client = new MediaRoomClient(roomId, setLocalStream, addRemoteStream, removeRemoteStream);
            await client.initialize();
            if (micDeviceId) {
                await client.setAudioDevice(micDeviceId);
            }
            await client.joinRoom(roomId);
            setJanusClient(client); 
        } else {
            
            if (micDeviceId) {
                await janusClient.setAudioDevice(micDeviceId);
            }
            await janusClient.joinRoom(roomId);
        }

        setJoinedChannel(channelGuid);  
        setRoomId(roomId);
        setUsers([]); // reset voice roster until events arrive for the new channel

        try {
            const { data } = await apiGetVoiceUsers(channelGuid);
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load voice users", err);
        }
    };

    const leaveVoice = async (channelGuid) => {
        const targetChannel = channelGuid || joinedChannel;
        if (!targetChannel) return;
        try {
            await janusClient?.leaveRoom();
            await conn.invoke("LeaveChannel", targetChannel);
        } catch (err) {
            console.error("Error leaving Janus room", err);
        }
        setJoinedChannel(null);
        setLocalStream(null);
        setRemoteStreams(new Map());
        setJanusClient(null);
        setRoomId(null);
        setUsers([]);
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
        await conn.invoke("MuteUser", joinedChannel, true);
        setMyState(s => ({ ...s, micMuted: true }));
        janusClient?.setAudioEnabled?.(false);
    };

    const unmuteMic = async () => {
        await conn.invoke("MuteUser", joinedChannel, false);
        setMyState(s => ({ ...s, micMuted: false }));
        janusClient?.setAudioEnabled?.(true);
    };

   
    const deafen = async () => {
        await conn.invoke("DeafenUser", joinedChannel, true);
        setMyState(s => ({ ...s, isDeaf: true }));
        janusClient?.setRemoteAudioEnabled?.(false);
    };

    const undeafen = async () => {
        await conn.invoke("DeafenUser", joinedChannel, false);
        setMyState(s => ({ ...s, isDeaf: false }));
        janusClient?.setRemoteAudioEnabled?.(true);
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
        if (!janusClient) {
            const client = new MediaRoomClient(activeRoomId, setLocalStream, addRemoteStream, removeRemoteStream);
            await client.initialize();
            if (micDeviceId) {
                await client.setAudioDevice(micDeviceId);
            }
            await client.joinRoom(activeRoomId);
            setJanusClient(client);
        } else {
            if (micDeviceId) {
                await janusClient.setAudioDevice(micDeviceId);
            }
            await janusClient.joinRoom(activeRoomId);
        }
    };


    const stopAll = async () => {
        await leaveVoice();
    };

    useEffect(() => {
    const tiles = [];

    
    if (localStream) {
        tiles.push({ id: "local", stream: localStream });
    }

  
    remoteStreams.forEach((stream, userId) => {
        tiles.push({ id: userId, stream });
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
            muteMic,
            unmuteMic,
            deafen,
            undeafen,
            startCamera,
            stopAll,
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
