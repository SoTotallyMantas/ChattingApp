
export default function Spinner({ size = 40 }) {
    return (
        <div
            style={{
                width: size,
                height: size,
                border: "4px solid #444",
                borderTopColor: "#5865F2",
                borderRadius: "50%",
                animation: "spin 0.9s linear infinite",
                margin: "auto",
            }}
        ></div>
    );
}
