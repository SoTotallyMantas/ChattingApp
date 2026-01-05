import { useState, useEffect, useMemo } from "react";
import { useToast } from "../../context/ToastContext";
import RolesApi from "../../api/serverRoles";
import { useOverlay } from "../../context/OverlayContext";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useAppState } from "../../context/AppStateContext";

export default function RolesPanel({ serverId }) {
    const toast = useToast();
    const { openOverlay } = useOverlay();
    const { refreshServerPermissions, selectedServer } = useAppState();

    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);

    const loadData = async ({ silent = false } = {}) => {
        try {
            const rolesRes = await RolesApi.getRoles(serverId);
            const incoming = rolesRes.data || [];
            const owner = incoming.find(r => r.isOwner || r.roleName?.toLowerCase() === "owner");
            const defaults = incoming.filter(r => r.isDefault && r.roleGuid !== owner?.roleGuid);
            const rest = incoming.filter(r => r.roleGuid !== owner?.roleGuid && !r.isDefault);
            const ordered = owner
                ? [owner, ...rest, ...defaults]
                : [...rest, ...defaults];
            setRoles(ordered);

            const permissionsRes = await RolesApi.getAllPermissions();
            setPermissions(permissionsRes.data);
        } catch {
            if (!silent) {
                toast.show("error", "Failed to load roles or permissions.");
            }
        }
    };

    useEffect(() => {
        loadData();
    }, [serverId, toast]);

   
    const startCreate = () => {
        const nextPosition = roles
            .filter((role) => !role.isDefault)
            .reduce((max, role) => {
                const pos = typeof role.position === "number" ? role.position : 0;
                return Math.max(max, pos);
            }, 0) + 1;

        openOverlay("role-modal", {
            isCreating: true,
            roleData: {
                serverGuid: serverId,
                permissionsList: permissions,
                currentUserPermissions: selectedServer?.permissions || [],
                nextPosition,
                onSaved: () => loadData({ silent: true })
            }
        });
    };

    
    const startEdit = (role) => {
        openOverlay("role-modal", {
            isCreating: false,
            roleData: {
                ...role,
                serverGuid: serverId,
                permissionsList: permissions,
                currentUserPermissions: selectedServer?.permissions || [],
                onSaved: () => loadData({ silent: true })
            }
        });
    };

   
    const deleteRole = async (roleGuid) => {
        try {
            await RolesApi.deleteRole(serverId, roleGuid);
            toast.show("success", "Role deleted.");
            await refreshServerPermissions(serverId);
            loadData();
        } catch {
            toast.show("error", "Failed to delete role.");
        }
    };

   
    const ownerRole = useMemo(() =>
        roles.find(r => r.isOwner || r.roleName?.toLowerCase() === "owner"),
    [roles]);

    const defaultRoles = useMemo(
        () => roles.filter(r => r.isDefault && r.roleGuid !== ownerRole?.roleGuid),
        [roles, ownerRole]
    );

    const draggableRoles = useMemo(
        () => roles.filter(r => r.roleGuid !== ownerRole?.roleGuid && !r.isDefault),
        [roles, ownerRole]
    );

    const onDragEnd = async (result) => {
        if (!result.destination) return;
        if (result.source.index === result.destination.index) return;

        const updated = [...draggableRoles];
        const [moved] = updated.splice(result.source.index, 1);
        updated.splice(result.destination.index, 0, moved);

        const nextOrder = ownerRole
            ? [ownerRole, ...updated, ...defaultRoles]
            : [...updated, ...defaultRoles];
        setRoles(nextOrder);

        try {
            await RolesApi.reorderRoles(serverId, {
                order: nextOrder.map((r, i) => ({
                    roleGuid: r.roleGuid,
                    position: i
                }))
            });
            toast.show("success", "Roles reordered");
        } catch {
            toast.show("error", "Failed to reorder roles.");
            loadData();
        }
    };

    return (
        <div className="roles-panel">
            <div className="roles-header">
                <h2>Roles</h2>
                <button className="button" onClick={startCreate}>+ Create Role</button>
            </div>

            <div className="role-list">
                {ownerRole && (
                    <div className="roleItem roleItem--owner">
                        <div className="role-info">
                            <strong style={{ color: ownerRole.color }}>{ownerRole.roleName}</strong>
                            <span className="role-sub">Owner • fixed at top</span>
                        </div>
                            <div className="role-actions">
                            <button className="button" onClick={() => startEdit(ownerRole)}>Edit</button>
                        </div>
                    </div>
                )}

                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="roles-droppable">
                        {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps}>
                                {draggableRoles.map((role, idx) => (
                                    <Draggable key={role.roleGuid} draggableId={role.roleGuid} index={idx}>
                                        {(dragProvided, snapshot) => (
                                            <div
                                                ref={dragProvided.innerRef}
                                                {...dragProvided.draggableProps}
                                                {...dragProvided.dragHandleProps}
                                                className={`roleItem${snapshot.isDragging ? " roleItem--dragging" : ""}`}
                                            >
                                                <div className="role-info">
                                                    <strong style={{ color: role.color }}>{role.roleName}</strong>
                                                    <span className="role-sub">Drag to reorder</span>
                                                </div>
                                                <div className="role-actions">
                                                    <button
                                                        className="button"
                                                        onClick={() => startEdit(role)}
                                                    >
                                                        Edit
                                                    </button>
                                                    {!role.isDefault && (
                                                        <button
                                                            className="button"
                                                            onClick={() => deleteRole(role.roleGuid)}
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        </div>
    );
}
