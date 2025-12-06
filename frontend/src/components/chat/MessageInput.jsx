
import { useState } from "react";
import { useAppState } from "../../context/AppStateContext";
import { useMessages } from "../../context/MessagesContext"
import Button from "../../common/Button";

export default function MessageInput() {
    const { selectedChannel } = useAppState();
    const { sendMessage } = useMessages();
    const [text, setText] = useState("");

    const send = async () => {
        if (!text.trim()) return;
        await sendMessage({
            channelGuid: selectedChannel.channelGuid,
            content: text
        });
        setText("");
    };

    const onKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    return (
        <div
            style={{
                padding: 15,
                borderTop: "1px solid var(--border-color)",
                background: "var(--bg-secondary)"
            }}
        >
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={onKey}
                placeholder="Message..."
                style={box}
            />

            <Button onClick={send} style={{ marginTop: 10 }}>
                Send
            </Button>
        </div>
    );
}

const box = {
    width: "100%",
    height: 60,
    padding: 10,
    borderRadius: 6,
    border: "1px solid var(--border-color)",
    resize: "none",
    background: "var(--bg-primary)",
    color: "var(--text-primary)"
};
