
import { useEffect, useState, useRef, useCallback } from "react";
import { sendMessage, editMessage, deleteMessage, getHistory, searchMessages } from "../api/messages";
import {
    getConnection,
    onSignalREvent,
    removeSignalREvent,
    connectionState
} from "../signalr/index";
import { useAuth } from "../context/AuthContext";


export function useChannelMessages(channelGuid) {
    const [messages, setMessages] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [searching, setSearching] = useState(false);
    const initialLoadRef = useRef(false);
    const [searchMode, setSearchMode] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [replyTo, setReplyTo] = useState(null);

    const channelRef = useRef(null);
    const conn = getConnection();
    const { user } = useAuth();

    
    useEffect(() => {
        if (!channelGuid) return;

       
        if (channelRef.current === channelGuid) return;

        const loadChannel = async () => {
            const previous = channelRef.current;

            try {
                await conn.ensureStarted();
            } catch (err) {
                console.error("SignalR connection failed to start:", err);
                return;
            }

            if (previous && previous !== channelGuid) {
                try {
                    await conn.invoke("LeaveChannel", previous);
                } catch { }
            }

            channelRef.current = channelGuid;
            connectionState.channel = channelGuid;

            try {
                await conn.invoke("JoinChannel", channelGuid);
            } catch (e) {
                console.error("JoinChannel failed:", e);
            }

            await loadLatest(channelGuid);
            initialLoadRef.current = true;
        };

        loadChannel();
    }, [channelGuid]);

    const loadLatest = useCallback(async (cg = null) => {
        const target = cg ?? channelRef.current;
        if (!target) return;
        try {
            const { data } = await getHistory(target);
            setMessages(data.reverse());
            setHasMore(true);
            setSearchMode(false);
            setSearchResults([]);
            setReplyTo(null);
        } catch (e) {
            console.error("History load failed:", e);
        }
    }, []);

 
    const loadOlderMessages = async () => {
        if (!hasMore) return;
        const oldest = messages[0];
        if (!oldest) return;

        try {
            const { data } = await getHistory(channelRef.current, oldest.createdAt);

            if (data.length === 0) {
                setHasMore(false);
            } else {
                setMessages(prev => [...data.reverse(), ...prev]);
            }
        } catch (e) {
            console.error("Older history load failed:", e);
        }
    };

    const search = useCallback(async (query) => {
        if (!channelRef.current) return [];
        const trimmed = (query || "").trim();
        if (!trimmed) {
            await loadLatest();
            setSearching(false);
            setSearchMode(false);
            return [];
        }
        setSearching(true);
        setSearchMode(true);
        try {
            const { data } = await searchMessages(channelRef.current, trimmed);
            setSearchResults(data);
            return data;
        } catch (e) {
            console.error("Search failed:", e);
            return [];
        } finally {
            setSearching(false);
        }
    }, [loadLatest]);

    const clearSearch = useCallback(async () => {
        setSearchResults([]);
        setSearchMode(false);
        setReplyTo(null);
    }, []);

    const startReply = useCallback((message) => {
        if (!message) return;
        setReplyTo(message);
    }, []);

    const clearReply = useCallback(() => setReplyTo(null), []);


    useEffect(() => {
        const handleNew = (msg) => {
            if (msg.channelGuid === channelRef.current) {
                setMessages(prev => [...prev, msg]);
            }
        };

        const handleEdited = (msg) => {
            if (msg.channelGuid === channelRef.current) {
                setMessages(prev =>
                    prev.map(m => m.messageGuid === msg.messageGuid ? msg : m)
                );
            }
        };

        const handleDeleted = ({ messageGuid, channelGuid }) => {
            if (channelGuid === channelRef.current) {
                setMessages(prev => prev.filter(m => m.messageGuid !== messageGuid));
            }
        };

       
        onSignalREvent("NewMessage", handleNew);
        onSignalREvent("MessageEdited", handleEdited);
        onSignalREvent("MessageDeleted", handleDeleted);

        return () => {
            removeSignalREvent("NewMessage", handleNew);
            removeSignalREvent("MessageEdited", handleEdited);
            removeSignalREvent("MessageDeleted", handleDeleted);
        };
    }, []);

    useEffect(() => {
        const handleProfileUpdated = (payload) => {
            const userGuid = payload?.userGuid;
            if (!userGuid) return;
            setMessages((prev) =>
                prev.map((m) =>
                    m.userGuid === userGuid
                        ? {
                            ...m,
                            displayName: payload.displayName ?? m.displayName,
                            avatarKey: payload.avatarKey ?? m.avatarKey
                        }
                        : m
                )
            );
        };
        onSignalREvent("UserProfileUpdated", handleProfileUpdated);
        return () => removeSignalREvent("UserProfileUpdated", handleProfileUpdated);
    }, []);

    useEffect(() => {
        if (!user?.userGuid) return;

        setMessages((prev) =>
            prev.map((m) =>
                m.userGuid === user.userGuid
                    ? {
                        ...m,
                        displayName: user.displayName || m.displayName,
                        userName: user.userName || m.userName,
                        avatarKey: user.avatarKey ?? m.avatarKey
                    }
                    : m
            )
        );
    }, [user?.displayName, user?.userName, user?.avatarKey, user?.userGuid]);

    return {
        messages,
        hasMore,
        loadOlderMessages,
        search,
        searching,
        searchMode,
        searchResults,
        clearSearch,
        replyTo,
        startReply,
        clearReply,
        sendMessage,
        editMessage,
        deleteMessage,
    };
}
