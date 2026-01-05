import { createContext, useContext, useState, useEffect } from "react";
import { fetchMyServerPermissions } from "../api/serverPermissions";

const AppStateContext = createContext();

export const AppStateProvider = ({ children }) => {

    const [selectedServer, setSelectedServer] = useState(null);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [serverSettingsOpen, setServerSettingsOpen] = useState(false);
    const [serverContextMenu, setServerContextMenu] = useState(null);
    const [membersSidebarOpen, setMembersSidebarOpen] = useState(true);
    const [serverPermissions, setServerPermissions] = useState([]);

    useEffect(() => {
        if (!selectedServer) {
            if (selectedChannel) {
                setSelectedChannel(null);
            }
            return;
        }

        if (selectedChannel && selectedChannel.serverGuid !== selectedServer.serverGuid) {
            setSelectedChannel(null);
            return;
        }

        if (!selectedChannel) {
            const firstText = selectedServer.channels?.find(
                c => c.channelType === "text"
            );

            if (firstText) {
                setSelectedChannel(firstText);
            }
        }
    }, [selectedServer, selectedChannel]);

    useEffect(() => {
        
        if (selectedServer) {
            setMembersSidebarOpen(true);
        }
    }, [selectedServer]);

    const loadServerPermissions = async (serverGuidOverride = null) => {
        const serverGuid = serverGuidOverride || selectedServer?.serverGuid;
        if (!serverGuid) {
            setServerPermissions([]);
            return;
        }

        try {
            const permissions = await fetchMyServerPermissions(serverGuid);
            setServerPermissions(Array.isArray(permissions) ? permissions : []);
        } catch {
            setServerPermissions([]);
        }
    };

    useEffect(() => {
        let active = true;

        const refresh = async () => {
            if (!selectedServer?.serverGuid) {
                if (active) setServerPermissions([]);
                return;
            }
            try {
                const permissions = await fetchMyServerPermissions(selectedServer.serverGuid);
                if (active) {
                    setServerPermissions(Array.isArray(permissions) ? permissions : []);
                }
            } catch {
                if (active) setServerPermissions([]);
            }
        };

        refresh();

        return () => {
            active = false;
        };
    }, [selectedServer?.serverGuid]);

    const selectedServerWithPermissions = selectedServer
        ? { ...selectedServer, permissions: serverPermissions }
        : null;

    return (
        <AppStateContext.Provider
            value={{
                selectedServer: selectedServerWithPermissions,
                setSelectedServer,
                selectedChannel, setSelectedChannel,
                serverSettingsOpen, setServerSettingsOpen,
                serverContextMenu, setServerContextMenu,
                membersSidebarOpen, setMembersSidebarOpen,
                refreshServerPermissions: loadServerPermissions
            }}
        >
            {children}
        </AppStateContext.Provider>
    );
};

export const useAppState = () => useContext(AppStateContext);
