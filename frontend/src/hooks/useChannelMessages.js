
import { useEffect, useState, useRef } from "react";
import { sendMessage, editMessage, deleteMessage, getHistory } from "../api/messages";
import {
    getConnection,
    onSignalREvent,
    removeSignalREvent,
    connectionState
} from "../signalr/index";


export function useChannelMessages(channelGuid) {
    const [messages, setMessages] = useState([]);
    const [hasMore, setHasMore] = useState(true);

    const channelRef = useRef(null);
    const conn = getConnection();

    
    useEffect(() => {
        if (!channelGuid) return;

       
        if (channelRef.current === channelGuid) return;

        const loadChannel = async () => {
            const previous = channelRef.current;

           
            if (previous && previous !== channelGuid) {
                try {
                    await conn.invoke("LeaveChannel", previous);
                } catch {
                    
                }
            }

            channelRef.current = channelGuid;
            connectionState.channel = channelGuid;

           
            try {
                await conn.invoke("JoinChannel", channelGuid);
            } catch (e) {
                console.error("JoinChannel failed:", e);
            }

            try {
                const { data } = await getHistory(channelGuid);
                setMessages(data.reverse());
                setHasMore(true);
            } catch (e) {
                console.error("History load failed:", e);
            }
        };

        loadChannel();
    }, [channelGuid]);

  
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

    return {
        messages,
        hasMore,
        loadOlderMessages,
        sendMessage,
        editMessage,
        deleteMessage,
    };
}
