
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";
import Button from "./Button";

export default function LogoutButton() {
    const { logout } = useContext(AuthContext);

    return (
        <Button
            variant="secondary"
            onClick={logout}
            style={{ marginTop: 10 }}
        >
            Logout
        </Button>
    );
}
