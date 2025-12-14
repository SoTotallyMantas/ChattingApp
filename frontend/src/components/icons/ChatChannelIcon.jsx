export default function ChatChannelIcon({ size = 16, style }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="currentColor"
            style={{ display: "block", ...style }}
        >
            <line x1="16" y1="20" x2="48" y2="20" />
            <line x1="16" y1="30" x2="48" y2="30" />
            <line x1="16" y1="40" x2="48" y2="40" />
            <path d="m56 56-12-4H17.16A9.16 9.16 0 0 1 8 42.84V17.16A9.16 9.16 0 0 1 17.16 8h29.68A9.16 9.16 0 0 1 56 17.16z" />
        </svg>
    );
}
