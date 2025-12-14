import { createPortal } from "react-dom";
import { useOverlay } from "../context/OverlayContext";

import MessageMenu from "../components/chat/MessageMenu";
import DeleteMessageModal from "../components/chat/DeleteMessageModal";

import CreateChannelModal from "../components/channels/CreateChannelModal";
import EditChannelModal from "../components/channels/EditChannelModal";
import DeleteChannelModal from "../components/channels/DeleteChannelModal";
import RoleModal from "../components/roles/RoleModal";
import ChannelMenu from "../components/channels/ChannelMenu";
import UserProfileMenu from "../components/voice/UserProfileMenu";
import ServerActionModal from "../components/servers/ServerActionModal";
import CreateServerModal from "../components/servers/CreateServerModal";
import JoinServerModal from "../components/servers/JoinServerModal";
import ServerContextMenu from "../components/servers/ServerContextMenu";
import ConfirmModal from "./ConfirmModal";

export default function OverlayRoot() {
    const { overlay } = useOverlay();
    if (!overlay) return null;

    const { type, payload } = overlay;
    let modal = null;
    let isFloating = false;

    switch (type) {
        
        case "message-menu":
            modal = <MessageMenu {...payload} />;
            isFloating = true;
            break;

        case "channel-menu":
            modal = <ChannelMenu {...payload} />;
            isFloating = true;
            break;

        case "server-menu":
            modal = <ServerContextMenu {...payload} />;
            isFloating = true;
            break;

        
        case "delete-message":
            modal = <DeleteMessageModal {...payload} />;
            break;
        case "role-modal":
            modal = <RoleModal {...payload} />;
            break;
        case "server-action":
            modal = <ServerActionModal {...payload} />;
            break;
        case "create-server":
            modal = <CreateServerModal {...payload} />;
            break;
        case "join-server":
            modal = <JoinServerModal {...payload} />;
            break;
        case "user-profile":
            modal = <UserProfileMenu {...payload} />;
            break;
        case "create-channel":
            modal = <CreateChannelModal {...payload} />;
            break;

        case "edit-channel":
            modal = <EditChannelModal {...payload} />;
            break;

        case "delete-channel":
            modal = <DeleteChannelModal {...payload} />;
            break;
        case "confirm":
            modal = <ConfirmModal {...payload} />;
            break;

        default:
            return null;
    }

   
    if (isFloating) {
        return createPortal(
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    pointerEvents: "none",
                    zIndex: 9999
                }}
            >
                <div
                    data-overlay-root="true"
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        pointerEvents: "auto",
                    }}
                >
                    {modal}
                </div>
            </div>,
            document.body
        );
    }

    return createPortal(
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
            }}
        >
            {modal}
        </div>,
        document.body
    );
}
