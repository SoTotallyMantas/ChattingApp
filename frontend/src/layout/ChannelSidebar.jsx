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

    const { channels, createChannel } = useChannels(selectedServer?.serverGuid);
    const mediaState = useMediaState();
    const {
        joinedChannel,
        joinVoice,
        leaveVoice,
        muteMic,
        unmuteMic,
        myState
    } = mediaState;

    const micMuted = myState?.micMuted;

    if (!selectedServer) return null;

    const sorted = [...(channels ?? [])].sort((a, b) => a.position - b.position);
    useEffect(() => {
        if (!selectedChannel && sorted.length > 0) {
            const firstText = sorted.find(c => c.channelType === "text");
            if (firstText) setSelectedChannel(firstText);
        }
    }, [sorted, selectedChannel, setSelectedChannel]);

    return (
        <div style={{ width: 250, height: "100%", background: "var(--bg-secondary)", padding: 10, borderRight: `1px solid var(--border-color)`, boxSizing: "border-box", overflowY: "auto" }}>
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
                    mediaState={mediaState}  
                    setSelectedChannel={setSelectedChannel}
                    joinVoice={joinVoice}
                    leaveVoice={leaveVoice}
                    muteMic={muteMic}
                    unmuteMic={unmuteMic}
                    micMuted={micMuted}
                    openOverlay={openOverlay}
                />
            ))}
        </div>
    );
}


const Header = memo(function Header({ serverName, serverGuid, createChannel, openOverlay }) {
    return (
        <h3 style={{ color: "var(--text-primary)", display: "flex", justifyContent: "space-between", margin: "6px 0 12px" }}>
            {serverName}

            <button
                onClick={() =>
                    openOverlay("create-channel", {
                        serverId: serverGuid,
                        createChannel
                    })
                }
                style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    fontSize: 20
                }}
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
    mediaState,
    setSelectedChannel,
    joinVoice,
    leaveVoice,
    muteMic,
    unmuteMic,
    micMuted,
    openOverlay
}) {
    const isSelected = selectedChannel?.channelGuid === channel.channelGuid;
    const isJoined = joinedChannel === channel.channelGuid;

    return (
        <div style={{ marginBottom: 4 }}>
            <div
                onClick={() => {
                    setSelectedChannel(channel);
                    if (channel.channelType === "voice") {
                        joinVoice(channel.channelGuid);
                    }
                }}
                style={{
                    padding: "6px 10px",
                    cursor: "pointer",
                    borderRadius: 4,
                    color: isSelected || isJoined ? "var(--text-primary)" : "var(--text-secondary)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >
                {channel.channelType === "text" && (
                    <span style={{ display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
                        <ChatChannelIcon size={14} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {channel.channelName}
                        </span>
                    </span>
                )}

                {channel.channelType === "voice" && (
                    <>
                        <span style={{ display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
                            <VoiceChannelIcon size={14} />
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {channel.channelName}
                            </span>
                        </span>

                        {isJoined ? (
                            <div style={{ display: "flex", gap: 6 }}>
                                <button
                                    onClick={e => {
                                        e.stopPropagation();
                                        micMuted ? unmuteMic() : muteMic();
                                    }}
                                >
                                    {micMuted ? "Unmute" : "Mute"}
                                </button>

                                <button
                                    onClick={e => {
                                        e.stopPropagation();
                                        leaveVoice(channel.channelGuid);
                                    }}
                                    style={inlineBtn}
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
                                style={inlineBtn}
                            >
                                Join
                            </button>
                        )}
                    </>
                )}
            </div>

            {channel.channelType === "voice" && (
                <VoiceUserList channelGuid={channel.channelGuid} openOverlay={openOverlay} />
            )}
        </div>
    );
});



const inlineBtn = {
    padding: "4px 8px",
    borderRadius: 6,
    border: `1px solid var(--border-color)`,
    background: "var(--bg-tertiary)",
    color: "var(--text-primary)",
    cursor: "pointer"
};
