import { useCallback } from "react";
import serverApi from "../api/servers";
import { useAppState } from "../context/AppStateContext";
import { useToast } from "../context/ToastContext";
import { signalServersReload } from "./useServers";

export function useServerActions() {
    const toast = useToast();
    const {
        selectedServer,
        setSelectedServer,
        setSelectedChannel,
        setServerSettingsOpen
    } = useAppState();

    const leaveServer = useCallback(
        async (server) => {
            if (!server) return false;
            try {
                await serverApi.leaveServer(server.serverGuid);
                toast.show("success", `Left ${server.serverName}`);

                if (selectedServer?.serverGuid === server.serverGuid) {
                    setSelectedServer(null);
                    setSelectedChannel(null);
                    setServerSettingsOpen(false);
                }

                signalServersReload();
                return true;
            } catch {
                toast.show("error", "Failed to leave server.");
                return false;
            }
        },
        [selectedServer, setSelectedChannel, setSelectedServer, setServerSettingsOpen, toast]
    );

    const deleteServer = useCallback(
        async (server) => {
            if (!server) return false;
            try {
                await serverApi.deleteServer(server.serverGuid);
                toast.show("success", "Server deleted.");

                if (selectedServer?.serverGuid === server.serverGuid) {
                    setSelectedServer(null);
                    setSelectedChannel(null);
                    setServerSettingsOpen(false);
                }

                signalServersReload();
                return true;
            } catch {
                toast.show("error", "Failed to delete server.");
                return false;
            }
        },
        [selectedServer, setSelectedChannel, setSelectedServer, setServerSettingsOpen, toast]
    );

    const updateServerDetails = useCallback(
        async ({ server, serverName, iconFile, iconKey }) => {
            if (!server) return null;

            let nextIconKey = iconKey ?? "";

            try {
                if (iconFile) {
                    const res = await serverApi.uploadServerIcon(server.serverGuid, iconFile);
                    const uploadedKey = res.data?.iconKey;
                    if (uploadedKey) {
                        nextIconKey = uploadedKey;
                    }
                }

                const res = await serverApi.updateServer(server.serverGuid, {
                    serverGuid: server.serverGuid,
                    serverName,
                    iconKey: nextIconKey || null,
                });

                const updated = res.data ?? res;
                setSelectedServer((prev) => {
                    if (!prev || prev.serverGuid !== server.serverGuid) return prev;
                    return updated || prev;
                });

                toast.show("success", "Server updated.");
                signalServersReload();

                return { server: updated, iconKey: nextIconKey };
            } catch {
                toast.show("error", "Failed to update server.");
                return null;
            }
        },
        [setSelectedServer, toast]
    );

    return {
        leaveServer,
        deleteServer,
        updateServerDetails,
    };
}
