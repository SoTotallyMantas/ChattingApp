import { useMediaState } from "../../context/MediaContext";  
import { useAuth } from "../../context/AuthContext";  

export default function VideoGrid({ tiles }) {
    const { users } = useMediaState();  
    const { user } = useAuth();  
    const myId = user?.userGuid; 

    const count = tiles.length;
    const size = Math.ceil(Math.sqrt(count));  

   
    const mergedTiles = tiles.map(t => {
        const voiceUser = users.find(u => u.userGuid === t.id);
        return {
            ...t,
            isSpeaking: voiceUser?.isSpeaking || false
        };
    });

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(${size}, 1fr)`,
                gridTemplateRows: `repeat(${size}, 1fr)`,
                width: "100%",
                height: "100%",
                gap: "4px",
                padding: "4px"
            }}
        >
            {mergedTiles.map(t => (
                <video
                    key={t.id}
                    data-user={t.id}
                    ref={v => v && (v.srcObject = t.stream)}  
                    autoPlay
                    playsInline
                    muted={t.id === myId || t.id === "local"}  
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        background: "black",
                        borderRadius: "6px",
                        border: t.isSpeaking
                            ? "3px solid #43b581"  
                            : "3px solid transparent",
                        transition: "border 0.1s ease"
                    }}
                />
            ))}
        </div>
    );
}
