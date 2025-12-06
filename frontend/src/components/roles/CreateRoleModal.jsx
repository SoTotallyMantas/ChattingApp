
import { useState } from "react";
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import { useToast } from "../../context/ToastContext";
import RolesApi from "../../api/serverRoles";
import PermissionSelector from "./PermissionSelector";

export default function CreateRoleModal({ serverId, onClose, onCreated }) {
    const [name, setName] = useState("");
    const [color, setColor] = useState("#5865f2");
    const [permissions, setPermissions] = useState([]);

    const toast = useToast();

    const create = async (e) => {
        e.preventDefault();

        try {
            const { data } = await RolesApi.createRole(serverId, {
                roleName: name,
                color,
            });

            if (permissions.length > 0) {
                await RolesApi.updateRolePermissions(serverId, data.roleGuid, {
                    roleId: data.roleGuid,
                    permissionsGuid: permissions
                });
            }

            toast.show("success", "Role created!");
            onCreated?.(data);
            onClose();
        } catch {
            toast.show("error", "Failed to create role.");
        }
    };

    return (
        <Modal onClose={onClose}>
            <h2>Create Role</h2>

            <form onSubmit={create}>
                <label>Name</label>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={input}
                />

                <label>Color</label>
                <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    style={{ ...input, padding: 4, height: 40 }}
                />

                <PermissionSelector
                    selected={permissions}
                    onChange={setPermissions}
                />

                <div style={actions}>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Create</Button>
                </div>
            </form>
        </Modal>
    );
}

const input = {
    width: "100%",
    padding: 10,
    marginTop: 10,
    marginBottom: 15,
    background: "var(--bg-tertiary)",
    border: "1px solid var(--border-color)",
    borderRadius: 6,
    color: "var(--text-primary)"
};

const actions = {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
};
