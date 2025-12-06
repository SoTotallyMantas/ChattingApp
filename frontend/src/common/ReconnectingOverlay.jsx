export default function ReconnectingOverlay() {
    return (
        <div style={wrapper}>
            <div style={spinner} />
            <div style={{ marginTop: 20, color: "white", fontSize: 18 }}>
                Reconnecting...
            </div>
        </div>
    );
}

const wrapper = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.65)",
    zIndex: 99999,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    pointerEvents: "all" 
};

const spinner = {
    width: 60,
    height: 60,
    borderRadius: "50%",
    border: "6px solid #888",
    borderTopColor: "#fff",
    animation: "spin 0.8s linear infinite"
};
