
export default function Avatar({ src, size = 40, fallbackText = "?" }) {
    const showImg = Boolean(src);
    return showImg ? (
        <img
            src={src}
            alt="avatar"
            style={{
                width: size,
                height: size,
                borderRadius: "50%",
                objectFit: "cover",
                background: "#444",
            }}
        />
    ) : (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: "50%",
                background: "#444",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700
            }}
        >
            {fallbackText}
        </div>
    );
}
