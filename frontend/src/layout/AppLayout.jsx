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
    const isDirect = selectedServer?.isDirect;
    const joinedChannelName = useMemo(() => {
        if (!media?.joinedChannel) return null;
        if (selectedChannel?.channelGuid === media.joinedChannel) return selectedChannel.channelName;
        return "Voice channel";
    }, [media?.joinedChannel, selectedChannel]);

    return (
        <div className="app-layout">
            <div className="app-topbar">
                <div className="app-topbar-title">
                    Voxlock
                </div>
            </div>

            <div className="app-body">
                <div className="app-sidebar">
                    <div className="app-sidebar-content">
                        <ServerSidebar />
                        {selectedServer && !isDirect ? <ChannelSidebar /> : <DMSidebar />}
                    </div>
                    {media.joinedChannel && (
                        <div className="app-voice-banner">
                            <div className="app-voice-banner-title">
                                {joinedChannelName || "Voice channel"}
                            </div>
                            <MediaControls
                                embedded
                                showMicControls={false}
                                onCamera={() => media.startCamera(media.joinedChannel)}
                                onCameraToggle={media.toggleCamera}
                                cameraEnabled={media.cameraEnabled}
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
                        className="app-settings-overlay"
                        onClick={() => setServerSettingsOpen(false)}
                    >
                        <div
                            className="app-settings-panel"
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
