export function getAvatarSrc(user) {
    if (!user) return null;

    const key = typeof user.avatarKey === "string" ? user.avatarKey.trim() : user.avatarKey;
    if (key) {
        
        if (isProbablyUrl(key)) return key;
        if (user.userGuid) return `/api/user-settings/avatar?userGuid=${user.userGuid}&v=${encodeURIComponent(key)}`;
    }

    return null;
}
export function getInitials(text = "") {
    return text.slice(0, 1).toUpperCase();
}
function isProbablyUrl(value) {
    return typeof value === "string" && (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/"));
}
