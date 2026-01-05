import { memo, useEffect } from "react";
import { useChannels } from "../hooks/useChannels";
import { useAppState } from "../context/AppStateContext";
import { useOverlay } from "../context/OverlayContext";
import { useMediaState } from "../context/MediaContext";
import VoiceUserList from "../components/voice/VoiceUserList";
import VoiceChannelIcon from "../components/icons/VoiceChannelIcon";
import ChatChannelIcon from "../components/icons/ChatChannelIcon";

export default function ChannelSidebar() {
    const { selectedServer, selectedChannel, setSelectedChannel } = useAppState();
    const { openOverlay } = useOverlay();

    const { channels, createChannel, updateChannel, deleteChannel } = useChannels(selectedServer?.serverGuid);
    const mediaState = useMediaState();
    const {
        joinedChannel,
        joinVoice,
        leaveVoice
    } = mediaState;

    if (!selectedServer) return null;

    const sorted = [...(channels ?? [])].sort((a, b) => a.position - b.position);
    useEffect(() => {
        if (selectedChannel) {
            const stillExists = sorted.some(c => c.channelGuid === selectedChannel.channelGuid);
            if (!stillExists) {
                setSelectedChannel(null);
                return;
            }
        }
        if (!selectedChannel && sorted.length > 0) {
            const firstText = sorted.find(c => c.channelType === "text");
            if (firstText) setSelectedChannel(firstText);
        }
    }, [sorted, selectedChannel, setSelectedChannel]);

    return (
        <div className="channel-sidebar">
            <Header
                serverName={selectedServer.serverName}
                serverGuid={selectedServer.serverGuid}
                createChannel={createChannel}
                openOverlay={openOverlay}
            />

            {sorted.map(channel => (
                <ChannelRow
                    key={channel.channelGuid}
                    channel={channel}
                    selectedChannel={selectedChannel}
                    joinedChannel={joinedChannel}
                    setSelectedChannel={setSelectedChannel}
                    joinVoice={joinVoice}
                    leaveVoice={leaveVoice}
                    openOverlay={openOverlay}
                    updateChannel={updateChannel}
                    deleteChannel={deleteChannel}
                    createChannel={createChannel}
                />
            ))}
        </div>
    );
}

const Header = memo(function Header({ serverName, serverGuid, createChannel, openOverlay }) {
    return (
        <h3 className="channel-sidebar-header">
            {serverName}

            <button
                onClick={() =>
                    openOverlay("create-channel", {
                        serverId: serverGuid,
                        createChannel
                    })
                }
                className="channel-sidebar-create"
                type="button"
            >
                +
            </button>
        </h3>
    );
});

const ChannelRow = memo(function ChannelRow({
    channel,
    selectedChannel,
    joinedChannel,
    setSelectedChannel,
    joinVoice,
    leaveVoice,
    openOverlay,
    updateChannel,
    deleteChannel,
    createChannel
}) {
    const isSelected = selectedChannel?.channelGuid === channel.channelGuid;
    const isJoined = joinedChannel === channel.channelGuid;
    const isActive = isSelected || (channel.channelType === "voice" && isJoined);

    const rowClassName = [
        "channel-row",
        isActive ? "channel-row--active" : "",
        isSelected && channel.channelType === "text" ? "channel-row--selected-text" : ""
    ]
        .filter(Boolean)
        .join(" ");

    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        openOverlay("channel-menu", {
            channel,
            x: e.clientX,
            y: e.clientY,
            updateChannel,
            deleteChannel,
            createChannel
        });
    };

    return (
        <div className="channel-row-wrap">
            <div
                onClick={() => {
                    setSelectedChannel(channel);
                    if (channel.channelType === "voice") {
                        joinVoice(channel.channelGuid);
                    }
                }}
                className={rowClassName}
                onContextMenu={handleContextMenu}
            >
                {channel.channelType === "text" && (
                    <span className="channel-row-label">
                        <ChatChannelIcon size={14} />
                        <span className="channel-row-label-text">
                            {channel.channelName}
                        </span>
                    </span>
                )}

                {channel.channelType === "voice" && (
                    <>
                        <span className="channel-row-label">
                            <VoiceChannelIcon size={14} />
                            <span className="channel-row-label-text">
                                {channel.channelName}
                            </span>
                        </span>

                        {isJoined ? (
                            <div className="channel-row-actions">
                                <button
                                    onClick={e => {
                                        e.stopPropagation();
                                        leaveVoice(channel.channelGuid);
                                    }}
                                    className="button"
                                    type="button"
                                >
                                    Leave
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={e => {
                                    e.stopPropagation();
                                    joinVoice(channel.channelGuid);
                                }}
                                className="button"
                                type="button"
                            >
                                Join
                            </button>
                        )}
                    </>
                )}
            </div>

            {channel.channelType === "voice" && (
                <VoiceUserList channelGuid={channel.channelGuid} />
            )}
        </div>
    );
});
