import { Outlet, useParams } from "react-router-dom";
import ChannelPage from "../channels/ChannelPage";

export default function ServerPage() {
    const { serverGuid } = useParams();

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            <div style={{ width: 250, background: "#2f3136", color: "white" }}>
                <ChannelPage serverGuid={serverGuid} />
            </div>

            <div style={{ flex: 1, background: "#36393f" }}>
                <Outlet />
            </div>
        </div>
    );
}
