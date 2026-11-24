import { useEffect, useState } from "react";
import { axiosPrivate } from "../api/axios";

export default function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axiosPrivate.get("/users/profil");
                setProfile(res.data);
            } catch (err) {
                setError(err.response?.data?.message || "Nem sikerült betölteni a profiladatokat.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <p>Profiladatok betöltése...</p>;
    if (error) return <p role="alert">{error}</p>;
    if (!profile) return <p>Nem találhatók profiladatok.</p>;

    return (
        <div>
            <h2>Profilom</h2>
            <p>
                <strong>Név:</strong> {profile.name}
            </p>
            <p>
                <strong>Email:</strong> {profile.email}
            </p>
            <p>
                <strong>Szerepkör:</strong> {profile.role}
            </p>
            <p>
                <strong>Regisztráció ideje:</strong> {new Date(profile.created_at).toLocaleDateString()}
            </p>
        </div>
    );
}
