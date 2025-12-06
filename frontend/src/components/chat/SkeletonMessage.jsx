export function SkeletonMessage() {
    return (
        <div
            style={{
                height: 40,
                background: "rgba(255,255,255,0.05)",
                borderRadius: 6,
                marginBottom: 10,
                animation: "pulse 1.2s infinite ease-in-out",
            }}
        />
    );
}
