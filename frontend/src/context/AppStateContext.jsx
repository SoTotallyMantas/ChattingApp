import { createContext, useContext, useState, useEffect } from "react";

const AppStateContext = createContext();

export const AppStateProvider = ({ children }) => {

    const [selectedServer, setSelectedServer] = useState(null);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [serverSettingsOpen, setServerSettingsOpen] = useState(false);
    const [serverContextMenu, setServerContextMenu] = useState(null);
    const [membersSidebarOpen, setMembersSidebarOpen] = useState(true);

    useEffect(() => {
        if (!selectedServer) return;

    
        if (selectedChannel && selectedChannel.serverGuid === selectedServer.serverGuid) return;

        
        const firstText = selectedServer.channels?.find(
            c => c.channelType === "text"
        );

        if (firstText) {
            setSelectedChannel(firstText);
        }
    }, [selectedServer]);

    useEffect(() => {
        
        if (selectedServer) {
            setMembersSidebarOpen(true);
        }
    }, [selectedServer]);

    return (
        <AppStateContext.Provider
            value={{
                selectedServer, setSelectedServer,
                selectedChannel, setSelectedChannel,
                serverSettingsOpen, setServerSettingsOpen,
                serverContextMenu, setServerContextMenu,
                membersSidebarOpen, setMembersSidebarOpen
            }}
        >
            {children}
        </AppStateContext.Provider>
    );
};

export const useAppState = () => useContext(AppStateContext);
