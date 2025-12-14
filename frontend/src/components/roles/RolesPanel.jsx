import { useState, useEffect, useMemo } from "react";
import { useToast } from "../../context/ToastContext";
import RolesApi from "../../api/serverRoles";
import { useOverlay } from "../../context/OverlayContext";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function RolesPanel({ serverId }) {
    const toast = useToast();
    const { openOverlay } = useOverlay();

    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);

    const loadData = async () => {
        try {
            const rolesRes = await RolesApi.getRoles(serverId);
            const incoming = rolesRes.data || [];
            const owner = incoming.find(r => r.isOwner || r.roleName?.toLowerCase() === "owner");
            const ordered = owner
                ? [owner, ...incoming.filter(r => r.roleGuid !== owner.roleGuid)]
                : incoming;
            setRoles(ordered);

            const permissionsRes = await RolesApi.getAllPermissions();
            setPermissions(permissionsRes.data);
        } catch {
            toast.show("error", "Failed to load roles or permissions.");
        }
    };

    useEffect(() => {
        loadData();
    }, [serverId, toast]);

   
    const startCreate = () => {
        openOverlay("role-modal", {
            isCreating: true,
            roleData: { serverGuid: serverId, permissionsList: permissions }
        });
    };

    
    const startEdit = (role) => {
        openOverlay("role-modal", {
            isCreating: false,
            roleData: { ...role, serverGuid: serverId, permissionsList: permissions }
        });
    };

   
    const deleteRole = async (roleGuid) => {
        try {
            await RolesApi.deleteRole(serverId, roleGuid);
            toast.show("success", "Role deleted.");
            loadData();
        } catch {
            toast.show("error", "Failed to delete role.");
        }
    };

   
    const ownerRole = useMemo(() =>
        roles.find(r => r.isOwner || r.roleName?.toLowerCase() === "owner"),
    [roles]);

    const draggableRoles = useMemo(
        () => roles.filter(r => r.roleGuid !== ownerRole?.roleGuid),
        [roles, ownerRole]
    );

    const onDragEnd = async (result) => {
        if (!result.destination) return;
        if (result.source.index === result.destination.index) return;

        const updated = [...draggableRoles];
        const [moved] = updated.splice(result.source.index, 1);
        updated.splice(result.destination.index, 0, moved);

        const nextOrder = ownerRole ? [ownerRole, ...updated] : updated;
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
                <button className="role-modal-createBtn" onClick={startCreate}>+ Create Role</button>
            </div>

            <div className="role-list">
                {ownerRole && (
                    <div className="roleItem roleItem--owner">
                        <div className="role-info">
                            <strong style={{ color: ownerRole.color }}>{ownerRole.roleName}</strong>
                            <span className="role-sub">Owner • fixed at top</span>
                        </div>
                        <div className="role-actions">
                            <button className="role-modal-button" onClick={() => startEdit(ownerRole)}>Edit</button>
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
                                                        className="role-modal-button"
                                                        onClick={() => startEdit(role)}
                                                    >
                                                        Edit
                                                    </button>
                                                    {!role.isDefault && (
                                                        <button
                                                            className="role-modal-button"
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
