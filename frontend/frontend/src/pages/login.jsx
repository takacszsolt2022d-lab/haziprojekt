import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosPublic } from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const res = await axiosPublic.post("/auth/login", { email, password });
            login(res.data.user, res.data.accessToken);
            navigate("/profile");
        } catch (err) {
            setError(err.response?.data?.message || "Sikertelen bejelentkezés.");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Bejelentkezés</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <input type="email" placeholder="Email" required onChange={(e) => setEmail(e.target.value)} />
            <br />
            <input type="password" placeholder="Jelszó" required onChange={(e) => setPassword(e.target.value)} />
            <br />
            <button type="submit">Belépés</button>
        </form>
    );
}
