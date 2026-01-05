import { useState } from "react";
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import { useToast } from "../../context/ToastContext";
import { useFriends } from "../../hooks/useFriends";
import { searchUsers } from "../../api/users";
import { getAvatarSrc, getInitials } from "../../utils/avatar";
import { useOverlay } from "../../context/OverlayContext";

export default function UserSearchModal({ onClose }) {
    const toast = useToast();
    const { closeOverlay } = useOverlay?.() || {};
    const { sendRequest, accept, isFriend, isPendingOut, isPendingIn } = useFriends();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const handleClose = () => {
        if (onClose) {
            onClose();
            return;
        }
        closeOverlay?.();
    };

    const handleSearch = async () => {
        const q = query.trim();
        if (!q) {
            setResults([]);
            setSearched(false);
            return;
        }
        setLoading(true);
        try {
            const data = await searchUsers(q);
            setResults(Array.isArray(data) ? data : []);
            setSearched(true);
        } catch (err) {
            const message = err?.response?.data?.message || "Failed to search users.";
            toast.show("error", message);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (userGuid) => {
        try {
            await sendRequest(userGuid);
            toast.show("success", "Friend request sent.");
        } catch (err) {
            const message = err?.response?.data?.message || "Failed to send friend request.";
            toast.show("error", message);
        }
    };

    const handleAccept = async (friendshipGuid) => {
        try {
            await accept(friendshipGuid);
            toast.show("success", "Friend request accepted.");
        } catch (err) {
            const message = err?.response?.data?.message || "Failed to accept request.";
            toast.show("error", message);
        }
    };

    return (
        <Modal onClose={handleClose}>
            <div className="user-search-modal">
                <h2>Find users</h2>
                <div className="user-search-controls">
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleSearch();
                            }
                        }}
                        placeholder="Search by username or display name"
                        className="input"
                    />
                    <Button onClick={handleSearch} disabled={loading}>
                        {loading ? "Searching..." : "Search"}
                    </Button>
                </div>

                <div className="user-search-results">
                    {loading && <div className="invite-list-muted">Searching...</div>}

                    {!loading && searched && results.length === 0 && (
                        <div className="invite-list-muted">No users found.</div>
                    )}

                    {!loading && results.map((user) => {
                        const avatarSrc = getAvatarSrc({ avatarKey: user.avatarKey, userGuid: user.userGuid });
                        const initials = getInitials(user.displayName || user.userName);
                        const isAlreadyFriend = isFriend(user.userGuid);
                        const pendingOut = isPendingOut(user.userGuid);
                        const pendingIn = isPendingIn(user.userGuid);
                        const showAccept = !!pendingIn;

                        return (
                            <div key={user.userGuid} className="user-search-row">
                                <div className="user-search-info">
                                    <div className="avatar avatar--sm">
                                        {avatarSrc ? (
                                            <img src={avatarSrc} alt={user.displayName || user.userName} className="avatar" />
                                        ) : (
                                            initials
                                        )}
                                    </div>
                                    <div className="user-search-meta">
                                        <div className="user-search-name">
                                            {user.displayName || user.userName}
                                        </div>
                                        <div className="user-search-username">
                                            {user.userName}
                                        </div>
                                    </div>
                                </div>
                                <div className="user-search-actions">
                                    {isAlreadyFriend && (
                                        <Button aria-disabled="true" data-disabled="true">
                                            Friends
                                        </Button>
                                    )}
                                    {!isAlreadyFriend && pendingOut && (
                                        <Button aria-disabled="true" data-disabled="true">
                                            Pending
                                        </Button>
                                    )}
                                    {!isAlreadyFriend && !pendingOut && showAccept && (
                                        <Button onClick={() => handleAccept(pendingIn.friendshipGuid)}>
                                            Accept
                                        </Button>
                                    )}
                                    {!isAlreadyFriend && !pendingOut && !showAccept && (
                                        <Button onClick={() => handleAdd(user.userGuid)}>
                                            Add
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="user-search-footer">
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
