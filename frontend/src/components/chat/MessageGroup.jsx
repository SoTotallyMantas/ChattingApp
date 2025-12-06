import MessageBubble from "./MessageBubble";

export default function MessageGroup({ group }) {
    const { avatarUrl, displayName, messages } = group;

    return (
        <div style={{
            display: "flex",
            gap: 12,
            paddingInline: 12,
            minWidth: 0
        }}>
            <img
                src={avatarUrl || "/default-avatar.png"}
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    objectFit: "cover",
                    marginTop: 2
                }}
            />

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginBottom: 2
                }}>
                    {displayName}
                </div>

                <div style={{ width: "100%", minWidth: 0 }}>
                    {messages.map(msg => (
                        <MessageBubble key={msg.messageGuid} msg={msg} />
                    ))}
                </div>
            </div>
        </div>
    );
}
