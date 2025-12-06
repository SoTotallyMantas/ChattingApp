import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGetChannels } from "../../api/channels";
import { useAppState } from "../../contexts/AppStateContext";

export default function ChannelPage() {
    const { serverGuid } = useParams();
    const navigate = useNavigate();
    const { selectedChannel, setSelectedChannel } = useAppState();

    const [channels, setChannels] = useState([]);

    useEffect(() => {
        async function loadChannels() {
            const res = await apiGetChannels(serverGuid);
            setChannels(res.data || res);
        }
        loadChannels();
    }, [serverGuid]);

    const openChannel = (ch) => {
        setSelectedChannel(ch);
        navigate(`/servers/${serverGuid}/channels/${ch.channelGuid}`);
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Channels</h2>

            {channels.map((ch) => (
                <div
                    key={ch.channelGuid}
                    onClick={() => openChannel(ch)}
                    style={{
                        padding: 10,
                        background: selectedChannel?.channelGuid === ch.channelGuid ? "#ddd" : "#eee",
                        cursor: "pointer",
                        marginBottom: 6
                    }}
                >
                    #{ch.name}
                </div>
            ))}
        </div>
    );
}
