import api from "./axios";

const friendApi = {
    getFriends: () => api.get("/friends"),
    addFriend: (friendGuid) => api.post("/friends", { friendGuid })
};

export default friendApi;
