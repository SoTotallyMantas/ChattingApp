import ServerSidebar from "./ServerSidebar";
import ChannelSidebar from "./ChannelSidebar";
import ChatWindow from "./ChatWindow";
import { useAppState } from "../context/AppStateContext";
import { useSignalRStatus } from "../hooks/useSignalRStatus";
import ServerSettingsSidebar from "../components/servers/ServerSettingsSidebar";
import ServerContextMenu from "../components/servers/ServerContextMenu";
import ReconnectingOverlay from "../common/ReconnectingOverlay";
import MembersSidebar from "./ServerMembersSidebar";

export default function AppLayout() {
    
    const status = useSignalRStatus();
    const { selectedServer, serverSettingsOpen } = useAppState();

    return (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", }}>

            
           

            
            <div style={{
                display: "flex",
                flex: 1,
                position: "relative",
                minHeight: 0     
            }}>
                <ServerSidebar />

                {selectedServer && !serverSettingsOpen && <ChannelSidebar />}

                {serverSettingsOpen && (
                    <div style={overlayPanelStyle}>
                        <ServerSettingsSidebar />
                    </div>
                )}

                <ChatWindow />
                {selectedServer && <MembersSidebar />}
            </div>
            {status === "disconnected" && <ReconnectingOverlay />}
           


        </div>
    );
}
const overlayPanelStyle = {
    position: "absolute",
    top: 0,
    left: 80,       
    width: 260,    
    height: "100%",
    background: "#2f3136",
    zIndex: 30,
};