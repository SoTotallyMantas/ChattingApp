import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import serverApi from "../../api/servers";
import { getServerMembers } from "../../api/serverMembers";
import RolesApi from "../../api/serverRoles";

export default function ServerDashboard() {
    const { serverGuid } = useParams();

    const [server, setServer] = useState(null);
    const [members, setMembers] = useState([]);
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        async function load() {
            const s = await serverApi.getServer(serverGuid);
            setServer(s.data || s);

            const m = await getServerMembers(serverGuid);
            setMembers(m);

            const r = await RolesApi.getRoles(serverGuid);
            setRoles(r.data || r);
        }
        load();
    }, [serverGuid]);

    if (!server) return <div>Loading...</div>;

    return (
        <div style={{ padding: 20 }}>
            <h2>Server Dashboard</h2>

            <div><strong>Server name:</strong> {server.name}</div>

            <h3>Members</h3>
            <ul>
                {members.map((m) => (
                    <li key={m.userGuid}>{m.userName}</li>
                ))}
            </ul>

            <h3>Roles</h3>
            <ul>
                {roles.map((r) => (
                    <li key={r.roleGuid}>{r.name}</li>
                ))}
            </ul>
        </div>
    );
}
