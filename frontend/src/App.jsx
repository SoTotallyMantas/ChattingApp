import React, { useEffect } from "react";
import { getConnection } from "./signalr/index";
import AppLayout from "./layout/AppLayout";
import { useMediaState } from "./context/MediaContext";

export default function App() {
  const { remoteStreams, myState } = useMediaState();

  useEffect(() => {
    const conn = getConnection();
    conn.ensureStarted().catch(console.error);
  }, []);

  const audioNodes = Array.from(remoteStreams.entries()).map(([userId, stream]) => (
    <audio
      key={userId}
      data-user={userId}
      ref={a => {
        if (a && stream) {
          a.srcObject = stream;
          try {
            const p = a.play();
            if (p && p.catch) p.catch(() => {});
          } catch (error) {
            console.error("Error while playing remote audio:", error);
          }
        }
      }}
      autoPlay
      playsInline
      muted={!!myState?.isDeaf}
      controls={true} 
      style={{ position: "absolute", width: 0, height: 0, opacity: 0, pointerEvents: "none" }}
    />
  ));

  return (
    <div>
      {audioNodes}
      <AppLayout />
    </div>
  );
}
