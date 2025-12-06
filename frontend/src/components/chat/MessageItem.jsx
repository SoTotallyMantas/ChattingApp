import Avatar from "../../components/common/Avatar";

export default function MessageItem({ msg }) {
    return (
        <div style={{ marginBottom: 12, display: "flex", gap: 12 }}>
            <Avatar userGuid={msg.userGuid} />

            <div>
                <div style={{ fontWeight: "bold" }}>
                    {msg.userName || msg.userGuid}
                    {msg.editedAt && (
                        <span style={{ fontSize: 12, color: "#aaa" }}> (edited)</span>
                    )}
                </div>
                <div>{msg.content}</div>
            </div>
        </div>
    );
}
