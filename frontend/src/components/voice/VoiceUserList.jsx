import { useEffect, useState, useRef } from "react";
import { useMediaState } from "../../context/MediaContext";
import VoiceMiniAvatar from "./VoiceMiniAvatar";
import { useUserOverlayActions } from "../../context/OverlayContext";
import MicrophoneOffIcon from "../icons/MicrophoneOffIcon";
import DeafenedIcon from "../icons/DeafenedIcon";
import { apiGetVoiceUsers } from "../../api/channels";
import { getUnifiedConnection, onUserEvent, removeUserEvent } from "../../signalr/Media";
import { onSignalREvent, removeSignalREvent } from "../../signalr/index";

export default function VoiceUserList({ channelGuid }) {
    const { joinedChannel, users } = useMediaState();
    const joinedRef = useRef(joinedChannel);
    joinedRef.current = joinedChannel;
    const { handleUserClick, handleUserContext, openProfile } = useUserOverlayActions();
    const [previewUsers, setPreviewUsers] = useState([]);

    if (!channelGuid) return null;

    const isJoined = joinedChannel === channelGuid;
    const roster = isJoined ? users : previewUsers;

    useEffect(() => {
        if (!channelGuid || isJoined) return;
        let alive = true;

        (async () => {
            try {
                const { data } = await apiGetVoiceUsers(channelGuid);
                console.log("Fetched voice users:", data);
                const list = Array.isArray(data)
                    ? data.map(u => ({
                        userGuid: u?.userGuid ?? u?.UserGuid ?? u?.userId ?? u?.UserId,
                        isMuted: u?.isMuted ?? u?.IsMuted,
                        isDeafened: u?.isDeafened ?? u?.IsDeafened,
                        displayName: u?.displayName ?? u?.DisplayName,
                        userName: u?.userName ?? u?.UserName,
                        avatarKey: u?.avatarKey ?? u?.AvatarKey
                    })).filter(u => u.userGuid)
                    : [];
                if (alive) setPreviewUsers(list);
            } catch (err) {
                console.error("Failed to load voice users", err);
                if (alive) setPreviewUsers([]);
            }
        })();

        return () => {
            alive = false;
        };
    }, [channelGuid, isJoined]);

    useEffect(() => {
        if (!channelGuid || isJoined) return;
        const conn = getUnifiedConnection();

        const upsert = (user) => {
            setPreviewUsers((prev) => {
                const idx = prev.findIndex((u) => u.userGuid === user.userGuid);
                if (idx >= 0) {
                    const next = [...prev];
                    next[idx] = { ...next[idx], ...user };
                    return next;
                }
                return [...prev, user];
            });
        };

        const onJoined = (user) => {
            const incomingChannel = user?.channelGuid ?? user?.ChannelGuid ?? user?.channelId ?? user?.ChannelId;
            if (incomingChannel !== channelGuid) return;

            const incomingGuid = user?.userGuid ?? user?.UserGuid ?? user?.userId ?? user?.UserId;
            if (!incomingGuid) return;

            upsert({
                userGuid: incomingGuid,
                displayName: user?.displayName ?? user?.DisplayName,
                userName: user?.userName ?? user?.UserName,
                avatarKey: user?.avatarKey ?? user?.AvatarKey,
                isMuted: user?.isMuted ?? user?.IsMuted,
                isDeafened: user?.isDeafened ?? user?.IsDeafened
            });
        };

        const onLeft = (user) => {
            const incomingChannel = user?.channelGuid ?? user?.ChannelGuid ?? user?.channelId ?? user?.ChannelId;
            if (incomingChannel !== channelGuid) return;

            const incomingGuid = user?.userGuid ?? user?.UserGuid ?? user?.userId ?? user?.UserId;
            if (!incomingGuid) return;

            setPreviewUsers((prev) => prev.filter((u) => u.userGuid !== incomingGuid));
        };

        const onMuted = (user) => {
            const incomingChannel = user?.channelGuid ?? user?.ChannelGuid ?? user?.channelId ?? user?.ChannelId;
            if (incomingChannel !== channelGuid) return;

            const incomingGuid = user?.userGuid ?? user?.UserGuid ?? user?.userId ?? user?.UserId;
            const incomingMuted = user?.isMuted ?? user?.IsMuted;
            if (!incomingGuid || incomingMuted === undefined) return;

            setPreviewUsers((prev) =>
                prev.map((u) => u.userGuid === incomingGuid ? { ...u, isMuted: incomingMuted } : u)
            );
        };

        const onDeafened = (user) => {
            const incomingChannel = user?.channelGuid ?? user?.ChannelGuid ?? user?.channelId ?? user?.ChannelId;
            if (incomingChannel !== channelGuid) return;

            const incomingGuid = user?.userGuid ?? user?.UserGuid ?? user?.userId ?? user?.UserId;
            const incomingDeaf = user?.isDeafened ?? user?.IsDeafened;
            if (!incomingGuid || incomingDeaf === undefined) return;

            setPreviewUsers((prev) =>
                prev.map((u) => u.userGuid === incomingGuid ? { ...u, isDeafened: incomingDeaf } : u)
            );
        };

        conn.ensureStarted()
            .then(() => conn.invoke("WatchChannel", channelGuid))
            .catch(() => {});

        onUserEvent("UserJoinedChannel", onJoined);
        onUserEvent("UserLeftChannel", onLeft);
        onUserEvent("UserMutedState", onMuted);
        onUserEvent("UserDeafenedState", onDeafened);

        return () => {
            removeUserEvent("UserJoinedChannel", onJoined);
            removeUserEvent("UserLeftChannel", onLeft);
            removeUserEvent("UserMutedState", onMuted);
            removeUserEvent("UserDeafenedState", onDeafened);
            if(joinedRef.current !== channelGuid){
                conn.invoke("UnwatchChannel", channelGuid).catch(() => {});
            };
        };
    }, [channelGuid, isJoined]);

    useEffect(() => {
        const handleProfileUpdated = (payload) => {
            const userGuid = payload?.userGuid;
            if (!userGuid) return;
            setPreviewUsers((prev) =>
                prev.map((u) =>
                    u.userGuid === userGuid
                        ? {
                            ...u,
                            displayName: payload.displayName ?? u.displayName,
                            avatarKey: payload.avatarKey ?? u.avatarKey
                        }
                        : u
                )
            );
        };
        onSignalREvent("UserProfileUpdated", handleProfileUpdated);
        return () => removeSignalREvent("UserProfileUpdated", handleProfileUpdated);
    }, []);

    return (
        <div
            className="voice-user-list"
        >
            {roster.length === 0 && (
                <div className="voice-user-list-empty">
                    No one in voice
                </div>
            )}

            {roster.map((u) => (
                <UserEntry
                    key={u.userGuid}
                    user={u}
                    handleUserClick={handleUserClick}
                    handleUserContext={handleUserContext}
                    openProfile={openProfile}
                />
            ))}
        </div>
    );
}

function UserEntry({ user, handleUserClick, handleUserContext, openProfile }) {
    return (
        <div
            data-user={user.userGuid}
            className="voice-user-entry"
            onContextMenu={(e) => handleUserContext(user, e)}
            onClick={(e) => handleUserClick(user, e)}
        >
            <VoiceMiniAvatar
                user={user}
                onClick={(e) => {
                    e.stopPropagation();
                    openProfile?.(user, { x: e.clientX, y: e.clientY });
                }}
                size="sm"
            />

            <div className="voice-user-entry-info">
                <div className="voice-user-entry-name">
                    {user.displayName || user.userName || "Unknown"}
                </div>
                <div className="voice-user-entry-status">
                    {user.isMuted && (
                        <span className="voice-user-entry-status-icon voice-user-entry-status-icon--muted" title="Muted">
                            <MicrophoneOffIcon size={12} />
                        </span>
                    )}
                    {user.isDeafened && (
                        <span className="voice-user-entry-status-icon voice-user-entry-status-icon--deafened" title="Deafened">
                            <DeafenedIcon size={12} />
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
