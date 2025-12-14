import { useEffect, useState, useCallback } from "react";
import friendApi from "../api/friends";

export function useFriends() {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadFriends = useCallback(async () => {
        setLoading(true);
        const { data } = await friendApi.getFriends();
        setFriends(data);
        setLoading(false);
    }, []);

    const addFriend = useCallback(async (friendGuid) => {
        const { data } = await friendApi.addFriend(friendGuid);
        setFriends((prev) => {
            const exists = prev.find((f) => f.friendGuid === data.friendGuid);
            if (exists) {
                return prev.map((f) =>
                    f.friendGuid === data.friendGuid ? data : f
                );
            }
            return [...prev, data];
        });
        return data;
    }, []);

    useEffect(() => {
        loadFriends();
    }, [loadFriends]);

    return { friends, loading, loadFriends, addFriend };
}
