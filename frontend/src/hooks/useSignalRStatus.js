import { useEffect, useState } from "react";
import { onSignalREvent } from "../signalr/index";

export function useSignalRStatus() {
    const [status, setStatus] = useState("connected");

    useEffect(() => {
        onSignalREvent("Disconnected", () => setStatus("disconnected"));
        onSignalREvent("Reconnected", () => setStatus("connected"));
    }, []);

    return status;
}
