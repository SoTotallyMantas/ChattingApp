// components/servers/ServerActionModal.jsx
import Modal from "../../common/Modal";
import Button from "../../common/Button";

export default function ServerActionModal({ onClose, onCreate, onJoin }) {
    return (
        <Modal onClose={onClose}>
            <h2>Join or Create a Server</h2>

            <div style={container}>
                <Button style={actionBtn} onClick={onCreate}>
                    Create a Server
                </Button>

                <Button style={actionBtn} onClick={onJoin}>
                    Join a Server
                </Button>
            </div>

            <div style={{ marginTop: 20, textAlign: "right" }}>
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
            </div>
        </Modal>
    );
}

const container = {
    display: "flex",
    flexDirection: "column",
    gap: 15,
    marginTop: 20,
};

const actionBtn = {
    width: "100%",
    padding: 15,
    fontSize: 16,
    cursor: "pointer",
};
