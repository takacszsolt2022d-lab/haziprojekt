import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <nav style={{ display: "flex", gap: "1rem", padding: "1rem", backgroundColor: "#f0f0f0" }}>
            <Link to="/">Főoldal</Link>
            {!user ? (
                <>
                    <Link to="/login">Bejelentkezés</Link>
                    <Link to="/register">Regisztráció</Link>
                </>
            ) : (
                <>
                    <Link to="/profile">Profil</Link>
                    <button onClick={handleLogout}>Kijelentkezés</button>
                </>
            )}
        </nav>
    );
};

export const Footer = () => (
    <footer style={{ marginTop: "2rem", padding: "1rem", borderTop: "1px solid #ccc", textAlign: "center" }}>
        <p>Auth Projekt &copy; {new Date().getFullYear()} Készítette: Takács Zsolt</p>
    </footer>
);
