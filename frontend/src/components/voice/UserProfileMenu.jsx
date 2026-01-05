import { useEffect, useMemo, useRef, useState } from "react";
import { uploadAvatar } from "../../api/userSettings";
import { changePassword, deleteAccount } from "../../api/auth";
import { useUserSettings } from "../../hooks/useUserSettings";
import { useAuth } from "../../context/AuthContext";
import { useOverlay } from "../../context/OverlayContext";
import Button from "../../common/Button";
import { getAvatarSrc } from "../../utils/avatar";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import ConfirmModal from "../../common/ConfirmModal";

export default function UserProfileMenu({ close, user: targetUser }) {
    const { logout, user: authUser, setUser } = useAuth?.() || {};
    const { closeOverlay, openOverlay } = useOverlay?.() || {};
    const { setTheme } = useTheme?.() || {};
    const toast = useToast();

    const isSelf = !targetUser || (authUser && targetUser?.userGuid === authUser.userGuid);
    const profileUser = isSelf ? authUser : targetUser;

    const safeUser = useMemo(
        () =>
            profileUser || {
                userGuid: "Unknown",
                displayName: "Unknown",
                userName: "Unknown"
            },
        [profileUser]
    );

    const fileInputRef = useRef(null);
    const { settings, loading, error, save } = useUserSettings();

    const [form, setForm] = useState({
        theme: "light",
        muteNotifications: false,
        displayName: ""
    });

    const [pwd, setPwd] = useState({
        current: "",
        next: "",
        confirm: ""
    });
    const [pwdStatus, setPwdStatus] = useState(null);

    const [initialForm, setInitialForm] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const avatarPending = Boolean(avatarFile);

    useEffect(() => {
        if (settings) {
            const next = {
                theme: settings.theme || "light",
                muteNotifications: Boolean(settings.muteNotifications),
                displayName: settings.displayName || safeUser.displayName || safeUser.userName || ""
            };
            setForm(next);
            setInitialForm(next);
        }
    }, [settings, safeUser.displayName, safeUser.userName]);

    const onPick = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const isFormChanged = () =>
        initialForm &&
        (form.theme !== initialForm.theme ||
            form.muteNotifications !== initialForm.muteNotifications ||
            form.displayName !== initialForm.displayName);

    const handleClose = () => {
        const hasPwd = pwd.current || pwd.next || pwd.confirm;
        if (avatarPending || isFormChanged() || hasPwd) {
            const ok = window.confirm("Discard unsaved changes?");
            if (!ok) return;
        }
        (close || closeOverlay || (() => {}))();
    };

    const avatarSrc = avatarPreview || getAvatarSrc(safeUser);
    const avatarInitial = (safeUser.displayName || safeUser.userName || "U").charAt(0).toUpperCase();

    if (!isSelf) {
        return (
            <div
                data-overlay-root="true"
                className="user-profile-menu"
            >
                <div className="user-profile-header">
                    <h2 className="user-profile-title">User Profile</h2>
                    <button
                        onClick={close || closeOverlay || (() => {})}
                        className="user-profile-close"
                        aria-label="Close"
                        type="button"
                    >
                        x
                    </button>
                </div>

                <div className="user-profile-summary user-profile-summary--compact">
                    <div className="avatar avatar--lg">
                        {avatarSrc ? (
                            <img
                                src={avatarSrc}
                                alt=""
                                className="avatar"
                            />
                        ) : (
                            avatarInitial
                        )}
                    </div>

                    <div>
                        <div className="user-profile-name">
                            {safeUser.displayName || safeUser.userName || safeUser.userGuid}
                        </div>

                        <div className="user-profile-username">
                            {safeUser.userName || safeUser.userGuid}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            data-overlay-root="true"
            className="user-profile-menu"
        >
            <div className="user-profile-header">
                <h2 className="user-profile-title">User Profile</h2>
                <button
                    onClick={handleClose}
                    className="user-profile-close"
                    aria-label="Close"
                    type="button"
                >
                    x
                </button>
            </div>

            <div className="user-profile-summary">
                <div className="avatar avatar--lg">
                    {avatarSrc ? (
                        <img
                            src={avatarSrc}
                            alt=""
                            className="avatar"
                        />
                    ) : (
                        avatarInitial
                    )}
                </div>

                <div>
                    <div className="user-profile-name">
                        {safeUser.displayName || safeUser.userName || safeUser.userGuid}
                    </div>

                    <div className="user-profile-username">
                        {safeUser.userName || safeUser.userGuid}
                    </div>
                </div>
            </div>

            <div
                className="user-profile-body"
            >
                <label className="user-profile-label">Display name</label>
                <input
                    type="text"
                    value={form.displayName}
                    onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                    className="input "
                    placeholder="How others see you"
                />

                <label className="user-profile-label">Theme</label>
                <select
                    value={form.theme}
                    onChange={(e) => setForm({ ...form, theme: e.target.value })}
                    className="input user-profile-select"
                >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                </select>

                <div className="user-profile-actions">
                    <Button
                        variant="secondary"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        Change avatar
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="user-profile-hidden-file"
                        onChange={onPick}
                    />
                </div>

                {error && (
                    <div className="user-profile-error">
                        Failed to load settings.
                    </div>
                )}

                <div className="user-profile-footer-actions">
                    <Button
                        onClick={handleClose}
                        variant="secondary"
                    >
                        Close
                    </Button>
                    <Button
                        onClick={async () => {
                            if (isFormChanged()) {
                                const trimmed = form.displayName?.trim() || "";
                                const payload = { ...form, displayName: trimmed };
                                const updated = await save(payload);

                                setInitialForm({
                                    theme: updated.theme,
                                    muteNotifications: Boolean(updated.muteNotifications),
                                    displayName: updated.displayName || trimmed
                                });
                                setForm((prev) => ({ ...prev, displayName: updated.displayName || trimmed }));
                                setTheme?.(updated.theme);
                                if (setUser && authUser) {
                                    setUser({ ...authUser, displayName: updated.displayName || trimmed });
                                }
                            }
                            if (avatarPending && avatarFile) {
                                try {
                                    const key = await uploadAvatar(avatarFile);
                                    if (setUser && authUser && key) {
                                        setUser({ ...authUser, avatarKey: key });
                                    }
                                    setAvatarFile(null);
                                    setAvatarPreview(null);
                                } catch {
                                    alert("Failed to upload avatar");
                                }
                            }
                        }}
                        disabled={(!isFormChanged() && !avatarPending) || loading}
                    >
                        Save changes
                    </Button>
                </div>

                <div className="user-profile-section">
                    <label className="user-profile-label">Change password</label>
                    <input
                        type="password"
                        placeholder="Current password"
                        value={pwd.current}
                        onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
                        className="input"
                    />
                    <input
                        type="password"
                        placeholder="New password"
                        value={pwd.next}
                        onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
                        className="input"
                    />
                    <input
                        type="password"
                        placeholder="Confirm new password"
                        value={pwd.confirm}
                        onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                        className="input"
                    />
                    {pwdStatus && (
                        <div
                            className={`user-profile-status ${
                                pwdStatus.error ? "user-profile-status--error" : "user-profile-status--success"
                            }`}
                        >
                            {pwdStatus.message}
                        </div>
                    )}
                    <Button
                        variant="secondary"
                        onClick={async () => {
                            if (!pwd.current || !pwd.next || !pwd.confirm) {
                                setPwdStatus({ error: true, message: "Fill all password fields." });
                                return;
                            }
                            if (pwd.next !== pwd.confirm) {
                                setPwdStatus({ error: true, message: "New passwords do not match." });
                                return;
                            }
                            try {
                                await changePassword(pwd.current, pwd.next);
                                setPwdStatus({ error: false, message: "Password changed. Please log in again." });
                                await logout();
                                window.location.reload();
                            } catch (err) {
                                setPwdStatus({ error: true, message: "Failed to change password." });
                            }
                        }}
                    >
                        Change password
                    </Button>
                </div>

                <div className="user-profile-section">
                    <Button
                        variant="danger"
                        onClick={logout}
                    >
                        Logout
                    </Button>
                </div>

                <div className="user-profile-section">
                    <Button
                        className="danger-button"
                        onClick={() =>
                            openOverlay?.("confirm", {
                                component: (
                                    <ConfirmModal
                                        title="Delete account"
                                        message="This will delete your account and remove you from servers and friends. This action cannot be undone."
                                        confirmLabel="Delete"
                                        cancelLabel="Cancel"
                                        variant="danger"
                                        inputLabel="Password"
                                        inputPlaceholder="Enter your password"
                                        inputRequired
                                        inputType="password"
                                        onConfirm={async (password) => {
                                            try {
                                                await deleteAccount(password);
                                                await logout?.();
                                                window.location.href = "/login";
                                            } catch (err) {
                                                const message =
                                                    err?.response?.data?.message ||
                                                    err?.message ||
                                                    "Failed to delete account.";
                                                toast.show("error", message);
                                            }
                                        }}
                                    />
                                )
                            })
                        }
                    >
                        Delete account
                    </Button>
                </div>
            </div>
        </div>
    );
}
