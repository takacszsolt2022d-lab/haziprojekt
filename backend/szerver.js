import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import db from "./config/db.js";
import * as authController from "./controllers/authcontroller.js";
import verifyToken from "./middleware/verifyToken.js";

const app = express();


app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    }),
);
app.use(express.json());
app.use(cookieParser());


app.post("/api/auth/reg", authController.register);
app.post("/api/auth/login", authController.login);
app.post("/api/auth/refresh-token", authController.refreshToken);
app.post("/api/auth/logout", authController.logout);

app.get("/api/users/profil", verifyToken, async (req, res, next) => {
    try {
        const [users] = await db.query("SELECT id, name, email, role, created_at FROM users WHERE id = ?", [req.user.id]);
        if (users.length === 0) {
            return res.status(404).json({ message: "Felhasználó nem található!" });
        }
        res.status(200).json(users[0]);
    } catch (error) {
        next(error);
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || "Szerver oldali hiba történt!",
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Szerver fut a ${PORT}-es porton`));
