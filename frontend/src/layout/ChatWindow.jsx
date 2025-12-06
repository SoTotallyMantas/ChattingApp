import { MessagesProvider } from "../context/MessagesContext";
import { useAppState } from "../context/AppStateContext";
import MessageList from "../components/chat/MessageList";
import MessageInput from "../components/chat/MessageInput";

export default function ChatWindow() {
    const { selectedChannel } = useAppState();

    if (!selectedChannel) {
        return (
            <div
                style={{
                    flex: 1,
                    background: "#36393f",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#bbb"
                }}
            >
                Select a channel to start chatting.
            </div>
        );
    }

    return (
        <MessagesProvider channelGuid={selectedChannel.channelGuid}>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    minHeight: 0,
                    background: "#36393f"
                }}
            >
                <MessageList />
                <MessageInput />
            </div>
        </MessagesProvider>
    );
}
