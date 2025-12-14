import { useEffect, useState } from "react";
import { getUserSettings, updateUserSettings } from "../api/userSettings";

export function useUserSettings() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = async () => {
        try {
            setLoading(true);
            const data = await getUserSettings();
            setSettings(data);
            setError(null);
        } catch (e) {
            setError(e);
        } finally {
            setLoading(false);
        }
    };

    const save = async (partial) => {
        const next = { ...(settings || {}), ...partial };
        const updated = await updateUserSettings(next);
        setSettings(updated);
        return updated;
    };

    useEffect(() => {
        load();
    }, []);

    return { settings, loading, error, reload: load, save };
}
