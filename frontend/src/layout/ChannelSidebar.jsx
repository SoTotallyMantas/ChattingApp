import { useChannels } from "../hooks/useChannels";
import { useAppState } from "../context/AppStateContext";
import { useState } from "react";

import CreateChannelModal from "../components/channels/CreateChannelModal";
import EditChannelModal from "../components/channels/EditChannelModal";
import DeleteChannelModal from "../components/channels/DeleteChannelModal";

export default function ChannelSidebar() {
    const { selectedServer, selectedChannel, setSelectedChannel } = useAppState();

    const {
        channels,
        createChannel,
        updateChannel,
        deleteChannel
    } = useChannels(selectedServer?.serverGuid);

    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    return (
        <div style={{ width: 250, background: "#2f3136", padding: 10 }}>
            <h3 style={{ color: "white", display: "flex", justifyContent: "space-between" }}>
                {selectedServer.serverName}

                <button
                    onClick={() => setCreateOpen(true)}
                    style={{
                        background: "transparent",
                        border: "none",
                        color: "white",
                        cursor: "pointer",
                        fontSize: 20
                    }}
                >
                    +
                </button>
            </h3>

            {channels
                .sort((a, b) => a.position - b.position)
                .map((c) => (
                    <div
                        key={c.channelGuid}
                        style={{
                            padding: "6px 10px",
                            display: "flex",
                            justifyContent: "space-between",
                            color: selectedChannel?.channelGuid === c.channelGuid ? "#fff" : "#aaa",
                            cursor: "pointer",
                        }}
                    >
                        <span onClick={() => setSelectedChannel(c)}>
                            # {c.channelName}
                        </span>

                        <button onClick={() => setEditTarget(c)} style={actionBtn}>Edit</button>
                        <button onClick={() => setDeleteTarget(c)} style={actionBtn}>Delete</button>
                    </div>
                ))}

   
            {createOpen && (
                <CreateChannelModal
                    serverId={selectedServer.serverGuid}
                    createChannel={createChannel}
                    onClose={() => setCreateOpen(false)}
                />
            )}

     
            {editTarget && (
                <EditChannelModal
                    channel={editTarget}
                    updateChannel={updateChannel}
                    onClose={() => setEditTarget(null)}
                />
            )}

            
            {deleteTarget && (
                <DeleteChannelModal
                    channel={deleteTarget}
                    deleteChannel={deleteChannel}
                    onClose={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
}

const actionBtn = {
    background: "transparent",
    border: "none",
    color: "#ccc",
    cursor: "pointer",
    marginLeft: 5
};
