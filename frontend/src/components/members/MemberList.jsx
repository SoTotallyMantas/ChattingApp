
import { useEffect, useState } from "react";
import { getServerMembers } from "../../api/serverMembers";
import { useAppState } from "../../context/AppStateContext";

import MemberItem from "./MemberItem";
import MemberProfileCard from "./MemberProfileCard";

export default function MemberList() {
    const { selectedServer } = useAppState();
    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);

    const load = async () => {
        if (!selectedServer) return;
        const data = await getServerMembers(selectedServer.serverGuid);
        setMembers(data);
    };

    useEffect(() => {
        load();
    }, [selectedServer]);

    return (
        <div style={{ padding: 20, color: "white", position: "relative" }}>
            <h2>Members</h2>

            {members.map((m) => (
                <MemberItem
                    key={m.userGuid}
                    member={m}
                    onClick={() => setSelectedMember(m)} 
                    onAction={load} 
                />
            ))}

            {/* Profile card overlay */}
            {selectedMember && (
                <div
                    style={{
                        position: "absolute",
                        top: 50,
                        right: 0,
                        zIndex: 100,
                    }}
                >
                    <MemberProfileCard
                        serverId={selectedServer.serverGuid}
                        member={selectedMember}
                        onClose={() => setSelectedMember(null)}
                    />
                </div>
            )}
        </div>
    );
}
