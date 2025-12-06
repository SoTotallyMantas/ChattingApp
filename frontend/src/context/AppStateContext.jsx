import { createContext, useContext, useState } from "react";

const AppStateContext = createContext();

export const AppStateProvider = ({ children }) => {
    const [selectedServer, setSelectedServer] = useState(null);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [serverSettingsOpen, setServerSettingsOpen] = useState(false);
    const [serverContextMenu, setServerContextMenu] = useState(null);

    return (
        <AppStateContext.Provider
            value={{
                selectedServer,setSelectedServer,
                selectedChannel,setSelectedChannel,
                serverSettingsOpen, setServerSettingsOpen,
                serverContextMenu, setServerContextMenu
            }}
        >
            {children}
        </AppStateContext.Provider>
    );
};

export const useAppState = () => useContext(AppStateContext);
