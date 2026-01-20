import * as signalR from "@microsoft/signalr";
import { getAccessToken } from "../api/axios";


const listeners = {
    NewMessage: [],
    MessageEdited: [],
    MessageDeleted: [],
    Reconnected: [],
    Disconnected: [],
    UserPresenceChanged: [],
    FriendsUpdated: [],
    ServerMembersUpdated: [],
    ServerInvitesUpdated: [],
    ServerMembershipRemoved: [],
    UserProfileUpdated: [],
    ServerUpdated: [],
    ServerChannelsUpdated: []
};


export const connectionState = {
    servers: [],
    channel: null
};

export function onSignalREvent(event, handler) {
    if (!listeners[event]) return;
    listeners[event].push(handler);
}


export function removeSignalREvent(event, handler) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(fn => fn !== handler);
}


function emit(event, payload) {
    if (!listeners[event]) return;
    for (const fn of listeners[event]) {
        try {
            fn(payload);
        } catch (err) {
            console.error("SignalR handler error:", err);
        }
    }
}

let connection = null;
let startPromise = null;

const infiniteRetryPolicy = {
    nextRetryDelayInMilliseconds: (retryContext) => {
        return 5000; 
    }
};
export function getConnection() {
    if (connection) return connection;

    connection = new signalR.HubConnectionBuilder()
        .withUrl("/hubs/chat", {
            accessTokenFactory: () => getAccessToken(),
            transport: signalR.HttpTransportType.WebSockets
        })
        .withAutomaticReconnect(infiniteRetryPolicy)
        .build();


    connection.on("NewMessage", msg => emit("NewMessage", msg));
    connection.on("MessageEdited", msg => emit("MessageEdited", msg));
    connection.on("MessageDeleted", msg => emit("MessageDeleted", msg));
    connection.on("UserPresenceChanged", payload => emit("UserPresenceChanged", payload));
    connection.on("FriendsUpdated", payload => emit("FriendsUpdated", payload));
    connection.on("ServerMembersUpdated", payload => emit("ServerMembersUpdated", payload));
    connection.on("ServerInvitesUpdated", payload => emit("ServerInvitesUpdated", payload));
    connection.on("ServerMembershipRemoved", payload => emit("ServerMembershipRemoved", payload));
    connection.on("UserProfileUpdated", payload => emit("UserProfileUpdated", payload));
    connection.on("ServerUpdated", payload => emit("ServerUpdated", payload));
    connection.on("ServerChannelsUpdated", payload => emit("ServerChannelsUpdated", payload));

    connection.onreconnecting(() => {
        emit("Disconnected");
    });

    connection.onreconnected(async () => {
        startPromise = null;
        console.warn("[SignalR] Reconnected � restoring groups...");

        for (const s of connectionState.servers) {
            try {
                await connection.invoke("JoinServer", s);
            } catch (err) {
                console.error("JOIN SERVER FAILED", s, err);
            }
        }


        if (connectionState.channel) {
            try {
                await connection.invoke("JoinChannel", connectionState.channel);
            } catch (err) {
                console.error("JOIN CHANNEL FAILED", err);
            }
        }

        emit("Reconnected");
    });

    connection.ensureStarted = async () => {
        if (connection.state === signalR.HubConnectionState.Connected) return;
        if (connection.state === signalR.HubConnectionState.Connecting && startPromise) return startPromise;

        const token = getAccessToken();
        if (!token) throw new Error("No access token available");

        startPromise = connection.start().catch(err => {
            startPromise = null;
            throw err;
        });

        return startPromise;
    };

    connection.onclose(() => {
        startPromise = null;
        emit("Disconnected");
    });

    connection.ensureStarted().catch(err =>
        console.error("SignalR connection failed:", err)
    );

    return connection;
}

export async function resetChatConnection() {
    if (!connection) return;
    try {
        if (connection.state !== signalR.HubConnectionState.Disconnected) {
            await connection.stop();
        }
    } catch (err) {
        console.warn("SignalR chat stop failed:", err);
    } finally {
        connection = null;
        startPromise = null;
        connectionState.servers = [];
        connectionState.channel = null;
    }
}

