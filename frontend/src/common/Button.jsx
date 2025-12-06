
export default function Button({
    children,
    onClick,
    variant = "primary",
    style,
    ...rest
}) {
    const base = {
        padding: "6px 12px",
        borderRadius: 6,
        border: "none",
        cursor: "pointer",
        fontWeight: 500,
        color: "white",
    };

    const variants = {
        primary: { background: "#5865F2" },
        danger: { background: "#D83C3E" },
        secondary: { background: "#4F545C" },
    };

    return (
        <button
            onClick={onClick}
            style={{ ...base, ...variants[variant], ...style }}
            {...rest}
        >
            {children}
        </button>
    );
}
