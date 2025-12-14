import ServerSidebar from "./ServerSidebar";
import ChannelSidebar from "./ChannelSidebar";
import ChatWindow from "./ChatWindow";
import { useAppState } from "../context/AppStateContext";
import { useSignalRStatus } from "../hooks/useSignalRStatus";
import ServerSettingsSidebar from "../components/servers/ServerSettingsSidebar";
import ReconnectingOverlay from "../common/ReconnectingOverlay";
import UserVoiceFooter from "../components/voice/UserVoiceFooter";
import DMSidebar from "./DMSidebar";
import { useMediaState } from "../context/MediaContext";
import MediaControls from "../components/media/MediaControls";
import { useMemo } from "react";

export default function AppLayout() {
    const status = useSignalRStatus();
    const { selectedServer, selectedChannel, serverSettingsOpen, setServerSettingsOpen } = useAppState();
    const media = useMediaState();
    const joinedChannelName = useMemo(() => {
        if (!media?.joinedChannel) return null;
        if (selectedChannel?.channelGuid === media.joinedChannel) return selectedChannel.channelName;
        return "Voice channel";
    }, [media?.joinedChannel, selectedChannel]);

    return (
        <div
            style={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
            }}
        >
            <div
                style={{
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    padding: "0 16px",
                    gap: 12,
                    background: "var(--bg-primary)",
                    borderBottom: `1px solid var(--border-color)`
                }}
            >
                <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: 16 }}>
                    Voxlock
                </div>
                <div style={{ color: "var(--text-secondary)" }}>
                    {selectedServer ? selectedServer.serverName : ""}
                </div>
        </div>

            <div
                style={{
                    display: "flex",
                    flex: 1,
                    position: "relative",
                    minHeight: 0
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        width: 330,
                        minWidth: 330,
                        maxWidth: 330,
                        flex: "0 0 330px",
                        background: "var(--bg-secondary)"
                    }}
                >
                    <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
                        <ServerSidebar />
                        {selectedServer && !serverSettingsOpen ? <ChannelSidebar /> : <DMSidebar />}
                    </div>
                    {media.joinedChannel && (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "8px 10px",
                                borderTop: `1px solid var(--border-color)`,
                                borderBottom: `1px solid var(--border-color)`,
                                background: "var(--bg-tertiary)"
                            }}
                        >
                            <div
                                style={{
                                    color: "var(--text-primary)",
                                    fontWeight: 600,
                                    fontSize: 12,
                                    flex: 1,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap"
                                }}
                            >
                                {joinedChannelName || "Voice channel"}
                            </div>
                            <MediaControls
                                embedded
                                showMicControls={false}
                                onCamera={() => media.startCamera(media.joinedChannel)}
                                onScreen={() => media.startScreen?.(media.joinedChannel)}
                                onStop={media.stopAll}
                                onLeave={media.leaveVoice}
                                micMuted={media.myState?.micMuted}
                                isDeaf={media.myState?.isDeaf}
                                mute={media.muteMic}
                                unmute={media.unmuteMic}
                                deafen={media.deafen}
                                undeafen={media.undeafen}
                            />
                        </div>
                    )}
                    <UserVoiceFooter />
                </div>

                {serverSettingsOpen && (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(0,0,0,0.6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 24,
                            zIndex: 30
                        }}
                        onClick={() => setServerSettingsOpen(false)}
                    >
                        <div
                            style={{ maxWidth: "1200px", width: "100%", maxHeight: "95vh" }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ServerSettingsSidebar />
                        </div>
                    </div>
                )}

                <ChatWindow />
            </div>


            {status === "disconnected" && <ReconnectingOverlay />}
        </div>
    );
}
