import api from "./axios";

export const getFriends = () =>
    api.get("/friends").then((res) => res.data);

export const getIncoming = () =>
    api.get("/friends/incoming").then((res) => res.data);

export const getOutgoing = () =>
    api.get("/friends/outgoing").then((res) => res.data);

export const addFriend = (friendGuid) =>
    api.post("/friends", { friendGuid }).then((res) => res.data);

export const acceptFriend = (id) =>
    api.post(`/friends/${id}/accept`).then((res) => res.data);

export const rejectFriend = (id) =>
    api.post(`/friends/${id}/reject`).then((res) => res.data);

export const blockFriend = (id) =>
    api.post(`/friends/${id}/block`).then((res) => res.data);
export const getBlocked = () =>
    api.get("/friends/blocked").then((res) => res.data);

export const unblockFriend = (friendshipGuid) =>
    api.post(`/friends/${friendshipGuid}/unblock`).then((res) => res.data);
export const removeFriend = (id) =>
    api.delete(`/friends/${id}`).then((res) => res.data);
