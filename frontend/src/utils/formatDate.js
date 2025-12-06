export function formatMessageDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();

    const sameDay = date.toDateString() === today.toDateString();

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (sameDay) return "Today";
    if (isYesterday) return "Yesterday";

    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}
