const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Minden mező kitöltése kötelező!" });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Érvénytelen email formátum!" });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: "A jelszónak legalább 8 karakternek kell lennie!" });
        }

        const [existingUsers] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: "Ez az email cím már regisztrálva van!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword]);

        res.status(201).json({ message: "Sikeres regisztráció!" });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email és jelszó megadása kötelező!" });
        }

        const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: "Hibás email cím vagy jelszó!" });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Hibás email cím vagy jelszó!" });
        }

        const payload = { id: user.id, email: user.email, role: user.role };
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES });
        const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES });

        await db.query("UPDATE users SET refresh_token = ? WHERE id = ?", [refreshToken, user.id]);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            accessToken,
            user: { id: user.id, name: user.name, email: user.email },
        });
    } catch (error) {
        next(error);
    }
};

exports.refreshToken = async (req, res, next) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.refreshToken) {
            return res.status(401).json({ message: "Nincs refresh token!" });
        }

        const refreshToken = cookies.refreshToken;
        const [users] = await db.query("SELECT * FROM users WHERE refresh_token = ?", [refreshToken]);
        if (users.length === 0) {
            return res.status(403).json({ message: "Érvénytelen refresh token!" });
        }

        const user = users[0];
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err || user.id !== decoded.id) {
                return res.status(403).json({ message: "Lejárt vagy hibás refresh token!" });
            }

            const payload = { id: user.id, email: user.email, role: user.role };
            const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES });

            res.status(200).json({
                accessToken: newAccessToken,
                user: { id: user.id, name: user.name, email: user.email },
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.logout = async (req, res, next) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.refreshToken) {
            return res.sendStatus(204);
        }

        const refreshToken = cookies.refreshToken;
        await db.query("UPDATE users SET refresh_token = NULL WHERE refresh_token = ?", [refreshToken]);

        res.clearCookie("refreshToken", {
            httpOnly: true,
            sameSite: "Strict",
            secure: process.env.NODE_ENV === "production",
        });
        res.status(200).json({ message: "Sikeres kijelentkezés!" });
    } catch (error) {
        next(error);
    }
};
