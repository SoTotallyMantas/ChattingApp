
import { useState } from "react";

export function useToast() {
    const [message, setMessage] = useState(null);

    return {
        message,
        show: (msg) => setMessage(msg),
        clear: () => setMessage(null),
    };
}
