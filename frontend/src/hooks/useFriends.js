import { useEffect, useState, useCallback } from "react";
import {
    getFriends,
    getIncoming,
    getOutgoing,
    addFriend,
    acceptFriend,
    rejectFriend,
    blockFriend,
    unblockFriend,
    getBlocked,
    removeFriend
} from "../api/friends";
import { onSignalREvent, removeSignalREvent } from "../signalr/index.js";
export function useFriends() {
    const [friends, setFriends] = useState([]);
    const [incoming, setIncoming] = useState([]);
    const [outgoing, setOutgoing] = useState([]);
    const [loading, setLoading] = useState(false);
    const [blocked, setBlocked] = useState([]);
    const loadAll = useCallback(async () => {
        setLoading(true);
        const [f, inc, out, blk] = await Promise.all([
            getFriends(),
            getIncoming(),
            getOutgoing(),
            getBlocked()
        ]);
        setFriends(f);
        setIncoming(inc);
        setOutgoing(out);
        setBlocked(blk);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadAll();
    }, [loadAll]);
    
    useEffect(() => {
        const HandlePresence = (payload) => {
            const userGuid = payload?.userGuid;
            if(!userGuid) 
            {
                return;
            }
            const presence = payload?.status ?? payload?.presence ?? payload?.Presence;

            setFriends(( prevFriends) =>
                prevFriends.map((friend) => friend.friendGuid === userGuid
                    ? { ...friend, presence }
                    : friend
                )
            );
            setIncoming((prevIncoming) => 
                prevIncoming.map((friend) => friend.friendGuid === userGuid
                    ? { ...friend, presence }
                    : friend)
            );
            setOutgoing((prevOutgoing) =>
                prevOutgoing.map((friend) => friend.friendGuid === userGuid
                    ? { ...friend, presence }
                    : friend)
            );
            setBlocked((prevBlocked) =>
                prevBlocked.map((friend) => friend.friendGuid === userGuid
                    ? { ...friend, presence }
                    : friend)
            );
        };
            onSignalREvent("UserPresenceChanged", HandlePresence);
            return () => removeSignalREvent("UserPresenceChanged", HandlePresence);
            
    }, []);

    useEffect(() => {
        const handleFriendsUpdated = () => {
            loadAll();
        };
        onSignalREvent("FriendsUpdated", handleFriendsUpdated);
        return () => removeSignalREvent("FriendsUpdated", handleFriendsUpdated);
    }, [loadAll]);

    useEffect(() => {
        const handleProfileUpdated = (payload) => {
            const userGuid = payload?.userGuid;
            if (!userGuid) return;
            const updates = {};
            if (payload.displayName !== undefined) updates.displayName = payload.displayName;
            if (payload.avatarKey !== undefined) updates.avatarKey = payload.avatarKey;
            if (Object.keys(updates).length === 0) return;

            const apply = (list) =>
                list.map((entry) =>
                    entry.friendGuid === userGuid ? { ...entry, ...updates } : entry
                );

            setFriends((prev) => apply(prev));
            setIncoming((prev) => apply(prev));
            setOutgoing((prev) => apply(prev));
            setBlocked((prev) => apply(prev));
        };

        onSignalREvent("UserProfileUpdated", handleProfileUpdated);
        return () => removeSignalREvent("UserProfileUpdated", handleProfileUpdated);
    }, []);
    
    const isFriend = (userGuid) => friends.some((f) => f.friendGuid === userGuid);
    const isPendingOut = (userGuid) => outgoing.find((f) => f.friendGuid === userGuid) || null;
    const isPendingIn = (userGuid) => incoming.find((f) => f.friendGuid === userGuid) || null;

    const sendRequest = async (userGuid) => {
        await addFriend(userGuid);
        await loadAll();
    };
    const unblock = async (friendshipGuid) => {
        await unblockFriend(friendshipGuid);
        await loadAll();
    }
    const accept = async (friendshipGuid) => {
        await acceptFriend(friendshipGuid);
        await loadAll();
    };

    const reject = async (friendshipGuid) => {
        await rejectFriend(friendshipGuid);
        await loadAll();
    };

    const block = async (friendshipGuid) => {
        await blockFriend(friendshipGuid);
        await loadAll();
    };

    const remove = async (friendshipGuid) => {
        console.log("remove called", friendshipGuid);
        await removeFriend(friendshipGuid);
        await loadAll();
    };

    return {
        friends,
        incoming,
        outgoing,
        loading,
        loadAll,
        isFriend,
        isPendingOut,
        isPendingIn,
        sendRequest,
        accept,
        reject,
        block,
        remove,
        blocked,
        unblock
    };
}
