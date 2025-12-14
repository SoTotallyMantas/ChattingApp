import { useOverlay } from "../../context/OverlayContext";
import Button from "../../common/Button";

export default function ServerActionModal({ onCreate, onJoin }) {
    const { closeOverlay } = useOverlay();

    return (
        <div
            data-overlay-root="true"
            style={{
                width: 420,
                background: "#2f3136",
                padding: 25,
                borderRadius: 8,
                color: "white"
            }}
        >
            <h2 style={{ marginTop: 0 }}>Join or Create a Server</h2>

            <div style={container}>
                <Button style={actionBtn} onClick={onCreate}>
                    Create a Server
                </Button>

                <Button style={actionBtn} onClick={onJoin}>
                    Join a Server
                </Button>
            </div>

            <div style={{ marginTop: 20, textAlign: "right" }}>
                <Button variant="secondary" onClick={closeOverlay}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}

const container = {
    display: "flex",
    flexDirection: "column",
    gap: 15,
    marginTop: 20
};

const actionBtn = {
    width: "100%",
    padding: 15,
    fontSize: 16,
    cursor: "pointer"
};
