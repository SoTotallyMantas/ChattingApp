import { formatMessageDate } from "./formatDate";

export function flattenMessages(messages) {
    const rows = [];
    let currentDay = null;
    let lastUser = null;
    let lastMessageTime = null;

    messages.forEach((msg) => {
        const date = formatMessageDate(msg.createdAt);
        const timeLabel = new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        if (date !== currentDay) {
            rows.push({
                type: "day",
                id: "day-" + date,
                date
            });
            currentDay = date;
            lastUser = null;
            lastMessageTime = null;
        }

        if (msg.userGuid !== lastUser) {
            rows.push({
                type: "group-header",
                id: "group-" + msg.messageGuid,
                displayName: msg.displayName || msg.userName,
                userName: msg.userName,
                avatarUrl: msg.avatarKey || msg.avatarUrl || null,
                avatarKey: msg.avatarKey || null,
                userGuid: msg.userGuid,
                timestamp: msg.createdAt,
                timeLabel
            });
            lastUser = msg.userGuid;
            lastMessageTime = msg.createdAt;
        }

        rows.push({
            type: "bubble",
            id: msg.messageGuid,
            message: { ...msg, timeLabel }
        });
        lastMessageTime = msg.createdAt;
    });

    return rows;
}
