
export default function Button({
    children,
    onClick,
    variant = "",
    className,
    style,
    ...rest
}) {
    const buttonClassName = [className].filter(Boolean).join(" ");

    return (
        <button
            onClick={onClick}
            className={buttonClassName}
            style={style}
            {...rest}
        >
            {children}
        </button>
    );
}
