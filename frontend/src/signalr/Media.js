import * as signalR from "@microsoft/signalr";
import { getAccessToken } from "../api/axios";

let conn = null;
let startPromise = null;

const listeners = {
    UserJoinedChannel: [],
    UserLeftChannel: [],
    UserMutedState: [],
    UserDeafenedState: [],
    SpeakingState: [],
    VideoCandidate: [],
    VoiceDisconnected: []
};

export function onUserEvent(type, handler) {
    if (listeners[type]) listeners[type].push(handler);
}

function emit(type, payload) {
    if (!listeners[type]) return;
    for (const fn of listeners[type]) fn(payload);
}

export function removeUserEvent(type, handler) {
    if (!listeners[type]) return;
    listeners[type] = listeners[type].filter((fn) => fn !== handler);
}
export function getUnifiedConnection() {
    if (conn) return conn;

    conn = new signalR.HubConnectionBuilder()
        .withUrl("/hubs/media", {
            accessTokenFactory: () => getAccessToken(),
            transport: signalR.HttpTransportType.WebSockets
        })
        .withAutomaticReconnect()
        .build();

    conn.on("UserJoinedChannel", p => emit("UserJoinedChannel", p));
    conn.on("UserLeftChannel", p => emit("UserLeftChannel", p));
    conn.on("UserMutedState", p => emit("UserMutedState", p));
    conn.on("UserDeafenedState", p => emit("UserDeafenedState", p));
    conn.on("SpeakingState", p => emit("SpeakingState", p));
    conn.on("VideoCandidate", p => emit("VideoCandidate", p));
    conn.on("VoiceDisconnected", p => emit("VoiceDisconnected", p));

    conn.ensureStarted = async () => {
        if (conn.state === signalR.HubConnectionState.Connected) return;
        if (conn.state === signalR.HubConnectionState.Connecting && startPromise) return startPromise;

        const token = getAccessToken();
        if (!token) throw new Error("No access token available");

        startPromise = conn.start().catch(err => {
            startPromise = null;
            console.error("Failed to start connection", err);
            throw err;
        });

        return startPromise;
    };

    return conn;
}

export async function resetMediaConnection() {
    if (!conn) return;
    try {
        if (conn.state !== signalR.HubConnectionState.Disconnected) {
            await conn.stop();
        }
    } catch (err) {
        console.warn("SignalR media stop failed:", err);
    } finally {
        conn = null;
        startPromise = null;
    }
}
