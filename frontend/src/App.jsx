import { useEffect } from "react";
import { getConnection } from "./signalr/index";
import AppLayout from "./layout/AppLayout";

export default function App() {
    useEffect(() => {
        const conn = getConnection();
        conn.start().catch(console.error);
    }, []);

    return <AppLayout />;
}
