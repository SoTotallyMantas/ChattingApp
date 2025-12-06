
export default function Avatar({ src, size = 40 }) {
    return (
        <img
            src={src || "/default-avatar.png"}
            alt="avatar"
            style={{
                width: size,
                height: size,
                borderRadius: "50%",
                objectFit: "cover",
                background: "#444",
            }}
        />
    );
}
