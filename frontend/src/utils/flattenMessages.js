import { formatMessageDate } from "./formatDate";

export function flattenMessages(messages) {
    const rows = [];
    let currentDay = null;
    let lastUser = null;

    messages.forEach((msg, i) => {
        const dateLabel = formatMessageDate(msg.createdAt);

        if (currentDay !== dateLabel) {
            rows.push({
                type: "day",
                id: "day-" + dateLabel,
                date: dateLabel
            });
            currentDay = dateLabel;
            lastUser = null;
        }

        const prev = messages[i - 1];
        const sameUser = prev && prev.userGuid === msg.userGuid;
        const sameDay = prev && formatMessageDate(prev.createdAt) === dateLabel;

        if (!sameUser || !sameDay) {
            rows.push({
                type: "group-header",
                id: "group-" + msg.userGuid + "-" + dateLabel,
                userGuid: msg.userGuid,
                avatarUrl: msg.avatarUrl,
                displayName: msg.displayName || msg.userName
            });
        }

        rows.push({
            type: "bubble",
            id: "bubble-" + msg.messageGuid,
            message: msg
        });

        lastUser = msg.userGuid;
    });

    return rows;
}
