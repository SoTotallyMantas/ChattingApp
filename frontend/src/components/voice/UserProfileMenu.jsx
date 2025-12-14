import { useEffect, useMemo, useRef, useState } from "react";
import { uploadAvatar } from "../../api/userSettings";
import { changePassword } from "../../api/auth";
import { useUserSettings } from "../../hooks/useUserSettings";
import { useAuth } from "../../context/AuthContext";
import { useOverlay } from "../../context/OverlayContext";
import Button from "../../common/Button";
import { getAvatarSrc } from "../../utils/avatar";
import { useTheme } from "../../context/ThemeContext";

export default function UserProfileMenu({ close }) {
    const { logout, user, setUser } = useAuth?.() || {};
    const { closeOverlay } = useOverlay?.() || {};
    const { setTheme } = useTheme?.() || {};

    const safeUser = useMemo(
        () =>
            user || {
                userGuid: "Unknown",
                displayName: "Unknown",
                userName: "Unknown"
            },
        [user]
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

    return (
        <div
            data-overlay-root="true"
            style={{
                width: 520,
                maxWidth: "90vw",
                background: "var(--bg-secondary, #2f3136)",
                borderRadius: 12,
                padding: 20,
                color: "var(--text-primary, #fff)",
                boxShadow: "0 16px 50px rgba(0,0,0,0.5)"
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h2 style={{ margin: 0, fontSize: 18 }}>User Profile</h2>
                <button
                    onClick={handleClose}
                    style={{
                        background: "transparent",
                        border: "1px solid var(--border-color, #444)",
                        color: "var(--text-secondary, #ccc)",
                        cursor: "pointer",
                        fontSize: 16,
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        lineHeight: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                    aria-label="Close"
                    type="button"
                >
                    ×
                </button>
            </div>

            <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 16 }}>
                <div
                    style={{
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        background: "var(--bg-tertiary)",
                        color: "var(--text-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: 20,
                        overflow: "hidden"
                    }}
                >
                    {avatarSrc ? (
                        <img
                            src={avatarSrc}
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    ) : (
                        avatarInitial
                    )}
                </div>

                <div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>
                        {safeUser.displayName || safeUser.userName || safeUser.userGuid}
                    </div>

                    <div style={{ fontSize: 13, opacity: 0.7 }}>
                        {safeUser.userName || safeUser.userGuid}
                    </div>
                </div>
            </div>

            <div
                style={{
                    borderTop: "1px solid var(--border-color, #444)",
                    paddingTop: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12
                }}
            >
                <label style={label}>Display name</label>
                <input
                    type="text"
                    value={form.displayName}
                    onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                    style={input}
                    placeholder="How others see you"
                />

                <label style={label}>Theme</label>
                <select
                    value={form.theme}
                    onChange={(e) => setForm({ ...form, theme: e.target.value })}
                    style={select}
                >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                </select>

                <label style={{ ...label, display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                        type="checkbox"
                        checked={form.muteNotifications}
                        onChange={(e) => setForm({ ...form, muteNotifications: e.target.checked })}
                    />
                    Mute notifications
                </label>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
                        style={{ display: "none" }}
                        onChange={onPick}
                    />
                </div>

                {error && (
                    <div style={{ color: "var(--danger, #f87171)", fontSize: 13 }}>
                        Failed to load settings.
                    </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
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
                                if (setUser && user) {
                                    setUser({ ...user, displayName: updated.displayName || trimmed });
                                }
                            }
                            if (avatarPending && avatarFile) {
                                try {
                                    const key = await uploadAvatar(avatarFile);
                                    if (setUser && user && key) {
                                        setUser({ ...user, avatarKey: key });
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

                <div style={{ borderTop: "1px solid var(--border-color, #444)", paddingTop: 12 }}>
                    <label style={label}>Change password</label>
                    <input
                        type="password"
                        placeholder="Current password"
                        value={pwd.current}
                        onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
                        style={input}
                    />
                    <input
                        type="password"
                        placeholder="New password"
                        value={pwd.next}
                        onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
                        style={input}
                    />
                    <input
                        type="password"
                        placeholder="Confirm new password"
                        value={pwd.confirm}
                        onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                        style={input}
                    />
                    {pwdStatus && (
                        <div style={{ color: pwdStatus.error ? "var(--danger, #f87171)" : "var(--accent, #22c55e)", fontSize: 13, marginBottom: 4 }}>
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
                        style={{ marginTop: 6 }}
                    >
                        Change password
                    </Button>
                </div>

                <div style={{ borderTop: "1px solid var(--border-color, #444)", paddingTop: 12 }}>
                    <Button
                        variant="secondary"
                        onClick={logout}
                        style={{ background: "var(--danger, #ef4444)", border: "none", color: "#fff" }}
                    >
                        Logout
                    </Button>
                </div>
            </div>
        </div>
    );
}

const label = {
    fontSize: 13,
    color: "var(--text-primary, #fff)",
    marginBottom: 4
};

const select = {
    padding: "10px",
    borderRadius: 8,
    border: "1px solid var(--border-color, #444)",
    background: "var(--bg-tertiary, #202225)",
    color: "var(--text-primary, #fff)"
};

const input = {
    width: "100%",
    padding: "10px",
    borderRadius: 8,
    border: "1px solid var(--border-color, #444)",
    background: "var(--bg-tertiary, #202225)",
    color: "var(--text-primary, #fff)",
    marginBottom: 8
};
