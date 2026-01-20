export function getServerIconSrc(server) {
    if (!server) return null;
    const iconKey = typeof server.iconKey === "string" ? server.iconKey.trim() : server.iconKey;
    if (!iconKey) return null;

    if (isUrlLike(iconKey)) return iconKey;
    if (server.serverGuid) {
        const encodedKey = encodeURIComponent(iconKey);
        return `/api/servers/${server.serverGuid}/icon?v=${encodedKey}`;
    }
    return null;
}

function isUrlLike(value) {
    return typeof value === "string" && (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/"));
}
