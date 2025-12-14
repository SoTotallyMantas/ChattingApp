import { useMembers } from "../hooks/useMembers";
import { useAppState } from "../context/AppStateContext";
import { getAvatarSrc } from "../utils/avatar";

export default function MembersSidebar() {
    const { selectedServer, membersSidebarOpen, setMembersSidebarOpen } = useAppState();
    const { members } = useMembers(
        selectedServer?.serverGuid,
        selectedServer?.permissions || []
    );

    if (!selectedServer || !membersSidebarOpen) return null;

    const renderName = (member) =>
        member.user?.displayName ||  
        member.displayName;
       
        

    const getHighestRole = (member) => {
        const roles = member.roles || member.Roles || [];
        if (roles.length) {
            return roles.reduce((best, role) => {
                if (!best) return role;
                const bestPos = best.position ?? Number.POSITIVE_INFINITY;
                const rolePos = role.position ?? Number.POSITIVE_INFINITY;
                return rolePos < bestPos ? role : best;
            }, null);
        }
        if (member.roleName) {
            return { roleName: member.roleName, position: Number.POSITIVE_INFINITY, color: "#888" };
        }
        return { roleName: "Members", position: Number.POSITIVE_INFINITY, color: "#888" };
    };

    const renderRole = (member) => {
        const roles = member.roles || member.Roles || [];
        if (roles.length) return roles.map((r) => r.roleName).join(", ");
        return member.roleName || "";
    };

    const renderInitials = (member) => {
        const name = renderName(member);
        return name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map(part => part[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const grouped = () => {
        const groups = new Map();
        members.forEach((m) => {
            const role = getHighestRole(m);
            const key = role.roleName || "Members";
            if (!groups.has(key)) {
                groups.set(key, { role, members: [] });
            }
            groups.get(key).members.push(m);
        });

        return Array.from(groups.values())
            .sort((a, b) => {
                const posA = a.role.position ?? Number.POSITIVE_INFINITY;
                const posB = b.role.position ?? Number.POSITIVE_INFINITY;
                if (posA !== posB) return posA - posB; 
                return (a.role.roleName || "").localeCompare(b.role.roleName || "");
            })
            .map((group) => ({
                ...group,
                members: group.members.sort((a, b) =>
                    renderName(a).localeCompare(renderName(b))
                ),
            }));
    };

    return (
        <div
            style={{
                width: 240,
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                display: "flex",
                flexDirection: "column",
                padding: "10px",
                overflowY: "auto",
                borderLeft: `1px solid var(--border-color)`,
            }}
        >
            <div
                style={{
                    fontSize: 14,
                    fontWeight: 600,
                    opacity: 0.85,
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    color: "var(--text-primary)"
                }}
            >
                <span>Members · {members.length}</span>
                <button
                    onClick={() => setMembersSidebarOpen(false)}
                    style={toggleBtn}
                    title="Hide members"
                >
                    ✕
                </button>
            </div>

            {members.length === 0 && (
                <div style={{ color: "#b9bbbe", fontSize: 13, padding: "6px 0" }}>
                    No members to display.
                </div>
            )}

            {grouped().map((group) => (
                <div key={group.role.roleName || "group"}>
                    <div
                        style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: group.role.color || "#b9bbbe",
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                            margin: "10px 0 6px",
                            opacity: 0.85
                        }}
                    >
                        {group.role.roleName || "Members"} · {group.members.length}
                    </div>
                    {group.members.map((member) => (
                        <div
                            key={member.userGuid || member.userId || renderName(member)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "8px 8px",
                                borderRadius: 6,
                                gap: 10,
                                background: "var(--bg-tertiary)",
                                marginBottom: 6,
                            }}
                        >
                            <Avatar member={member} renderInitials={renderInitials} />
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                                    {renderName(member)}
                                </div>
                                <div
                                    style={{
                                        fontSize: 12,
                                        opacity: 0.65,
                                        color: "var(--text-secondary)",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis"
                                    }}
                                >
                                    {renderRole(member)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

function Avatar({ member, renderInitials }) {
    const src = getAvatarSrc({
        avatarKey: member.avatarKey || member.AvatarKey || member.user?.avatarKey || member.user?.AvatarKey,
        userGuid: member.userGuid || member.userId || member.user?.userGuid || member.user?.UserGuid
    });
    const initials = renderInitials(member) || "?";

    return (
        <div
            style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--bg-hover)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-primary)",
                fontSize: 12,
                fontWeight: 700,
                overflow: "hidden"
            }}
        >
            {src ? (
                <img
                    src={src}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
            ) : (
                initials
            )}
        </div>
    );
}

const toggleBtn = {
    width: 28,
    height: 28,
    borderRadius: 6,
    border: `1px solid var(--border-color)`,
    background: "transparent",
    color: "var(--text-primary)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
};
