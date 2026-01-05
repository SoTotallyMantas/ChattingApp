import { createContext, useContext } from "react";
import { useChannelMessages } from "../hooks/useChannelMessages";
import { useAppState } from "./AppStateContext";

const MessagesContext = createContext(null);

export function MessagesProvider({ children }) {
    const { selectedChannel } = useAppState();

    const value = useChannelMessages(
        selectedChannel ? selectedChannel.channelGuid : null
    );

    return (
        <MessagesContext.Provider value={value}>
            {children}
        </MessagesContext.Provider>
    );
}

export function useMessages() {
    const ctx = useContext(MessagesContext);

    if (ctx) return ctx;

   
    return {
        messages: [],
        hasMore: false,
        loadOlderMessages: async () => {},
        search: async () => [],
        searching: false,
        searchMode: false,
        searchResults: [],
        clearSearch: () => {},
        replyTo: null,
        startReply: () => {},
        clearReply: () => {},
        sendMessage: async () => {},
        editMessage: async () => {},
        deleteMessage: async () => {},
    };
}
