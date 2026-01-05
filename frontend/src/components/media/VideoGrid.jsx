import { useMediaState } from "../../context/MediaContext";  
import { useAuth } from "../../context/AuthContext";  

export default function VideoGrid({ tiles }) {
    const { users } = useMediaState();  
    const { user } = useAuth();  
    const myId = user?.userGuid; 

    if (!tiles || tiles.length === 0) {
        return null;
    }

    const count = tiles.length;
    const layoutCount = Math.max(1, count);
    const columns = Math.ceil(Math.sqrt(layoutCount));
    const rows = Math.ceil(layoutCount / columns);

   
    const mergedTiles = tiles.map(t => {
        const voiceUser = users.find(u => u.userGuid === t.id);
        return {
            ...t,
            isSpeaking: voiceUser?.isSpeaking || false
        };
    });

    const gridStyle = {
        "--video-grid-columns": String(columns),
        "--video-grid-rows": String(rows)
    };

    return (
        <div
            className="video-grid"
            data-count={count}
            style={gridStyle}
        >
            {mergedTiles.map(t => (
                <video
                    key={t.id}
                    data-user={t.id}
                    ref={v => v && (v.srcObject = t.stream)}  
                    autoPlay
                    playsInline
                    muted={t.id === myId || t.id === "local"}  
                    className={`video-grid-tile ${t.isSpeaking ? "video-grid-tile--speaking" : ""}`}
                />
            ))}
        </div>
    );
}
