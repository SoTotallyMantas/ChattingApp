import { useMembers } from "../hooks/useMembers";
import { useAppState } from "../context/AppStateContext";
import { useUserOverlayActions } from "../context/OverlayContext";
import { getAvatarSrc } from "../utils/avatar";
import { getTopRole } from "../utils/roleHierarchy";

const rolePosition = (role) => {
    if (!role) return Number.POSITIVE_INFINITY;
    const name = role.roleName?.toLowerCase();
    if (role.isOwner || name === "owner") return -Infinity;
    if (role.isDefault) return Number.POSITIVE_INFINITY;
    return typeof role.position === "number" ? role.position : Number.POSITIVE_INFINITY;
};

export default function MembersSidebar() {
    const { selectedServer, membersSidebarOpen } = useAppState();
    const { handleUserClick, handleUserContext } = useUserOverlayActions();
    const { members, loadMembers, loadBans, canViewBans } = useMembers(
        selectedServer?.serverGuid,
        selectedServer?.permissions || []
    );

    if (!selectedServer || !membersSidebarOpen) return null;

    const permissions = selectedServer?.permissions || [];
    const canKick = permissions.includes("KICK_MEMBERS");
    const canBan = permissions.includes("BAN_MEMBERS");

    const getUser = (member) => {
        const user = member.user || {};
        return {
            userGuid: user.userGuid || member.userGuid || member.userId || user.UserGuid,
            userName: user.userName || member.userName || member.UserName,
            displayName: user.displayName || member.displayName || user.userName || member.userName,
            avatarKey: user.avatarKey || member.avatarKey || user.AvatarKey || member.AvatarKey,
            presence: user.presence || member.presence || user.presence
        };
    };

    const renderName = (member) =>
        member.user?.displayName ||
        member.displayName;

    const getHighestRole = (member) => {
        const topRole = getTopRole(member);
        if (topRole) return topRole;
        if (member.roleName) {
            return { roleName: member.roleName, position: Number.POSITIVE_INFINITY, color: "#888" };
        }
        return { roleName: "Members", position: Number.POSITIVE_INFINITY, color: "#888" };
    };

    const renderRole = (member) => {
        const topRole = getTopRole(member);
        if (topRole) return topRole.roleName || "";
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
                const posA = rolePosition(a.role);
                const posB = rolePosition(b.role);
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
        <div className="members-sidebar">
            <div className="members-sidebar-header">
                <span>Members: {members.length}</span>
            </div>

            {members.length === 0 && (
                <div className="members-sidebar-empty">
                    No members to display.
                </div>
            )}

            {grouped().map((group) => (
                <div key={group.role.roleName || "group"}>
                    <div
                        className="members-sidebar-group-title"
                        style={{ color: group.role.color || "#b9bbbe" }}
                    >
                        {group.role.roleName || "Members"}: {group.members.length}
                    </div>
                    {group.members.map((member) => {
                        const user = getUser(member);

                        return (
                            <div
                                key={member.userGuid || member.userId || renderName(member)}
                                className="members-sidebar-member"
                                onClick={(e) => handleUserClick(user, e)}
                                onContextMenu={(e) => handleUserContext(user, e, {
                                    canKick,
                                    canBan,
                                    onAction: async () => {
                                        await loadMembers();
                                        if (canViewBans) {
                                            await loadBans();
                                        }
                                    }
                                })}
                            >
                                <Avatar member={member} renderInitials={renderInitials} />
                                <div className="members-sidebar-member-info">
                                    <div className="members-sidebar-member-name">
                                        {renderName(member)}
                                    </div>
                                    <div className="members-sidebar-presence">
                                        <span
                                        className="members-sidebar-presence-dot"
                                        style={{background: presenceColor(user.presence)}}
                                        />
                                        {user.presence || "offline"}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

function presenceColor(presence) {
    if(!presence) return "var(--border-color)";
    const lower = presence.toLowerCase();
    switch(lower) {
        case "online":
            return "#1ce465ff";
        default:
            return "var(--border-color)";
    }
}

function Avatar({ member, renderInitials }) {
    const src = getAvatarSrc({
        avatarKey: member.avatarKey || member.AvatarKey || member.user?.avatarKey || member.user?.AvatarKey,
        userGuid: member.userGuid || member.userId || member.user?.userGuid || member.user?.UserGuid
    });
    const initials = renderInitials(member) || "?";

    return (
        <div className="avatar avatar--sm">
            {src ? (
                <img
                    src={src}
                    alt=""
                    className="avatar"
                />
            ) : (
                initials
            )}
        </div>
    );
}
