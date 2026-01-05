import { useOverlay } from "../../context/OverlayContext";
import Button from "../../common/Button";

export default function ServerActionModal({ onCreate, onJoin }) {
    const { closeOverlay } = useOverlay();

    return (
        <div
            data-overlay-root="true"
            className="modal-content"
        >
            <h2 className="panel-title">Join or Create a Server</h2>

            <div className="server-action-options">
                <Button className="button" onClick={onCreate}>
                    Create a Server
                </Button>

                <Button className="button" onClick={onJoin}>
                    Join a Server
                </Button>
            </div>

            <div className="server-action-footer">
                <Button variant="secondary" className="button" onClick={closeOverlay}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}
