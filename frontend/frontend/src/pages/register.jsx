import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosPublic } from "../api/axios";

export default function Register() {
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (formData.password.length < 8) {
            return setError("A jelszónak legalább 8 karakternek kell lennie!");
        }
        try {
            await axiosPublic.post("/auth/reg", formData);
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.message || "Hiba a regisztráció során.");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Regisztráció</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <input type="text" placeholder="Név" required onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <br />
            <input type="email" placeholder="Email" required onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            <br />
            <input type="password" placeholder="Jelszó (min. 8 karakter)" required onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            <br />
            <button type="submit">Regisztráció</button>
        </form>
    );
}
