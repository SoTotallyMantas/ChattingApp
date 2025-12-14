import * as signalR from "@microsoft/signalr";
import { getAccessToken } from "../api/axios";


const listeners = {
    NewMessage: [],
    MessageEdited: [],
    MessageDeleted: [],
    Reconnected: [],
    Disconnected: []
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

    connection.onreconnecting(() => {
        emit("Disconnected");
    });

    connection.onreconnected = async () => {
        console.warn("[SignalR] Reconnected — restoring groups...");

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
    };

    connection.onclose(() => {
        emit("Disconnected");
    });

    connection.start().catch(err =>
        console.error("SignalR connection failed:", err)
    );

    return connection;
}

