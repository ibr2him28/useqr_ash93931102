const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');
const { redisClient, tokenBlacklist } = require('../config/redis');
const { authenticateToken } = require('../middleware/auth');

// Login route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const users = await executeQuery("SELECT * FROM users WHERE email = ?", [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (isMatch) {
            const token = jwt.sign(
                { 
                    id: user.user_id, 
                    email: user.email, 
                    user_type: user.user_type,
                    tokenVersion: Date.now()
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            delete user.password_hash;

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000
            });

            return res.json({ 
                message: "Login successful", 
                user
            });
        }

        return res.status(401).json({ error: "Invalid email or password" });

    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Logout route
router.post("/logout", authenticateToken, async (req, res) => {
    try {
        const token = req.cookies.token;
        if (token) {
            if (redisClient) {
                await redisClient.set(
                    `bl_${token}`, 
                    'true',
                    'EX',
                    24 * 60 * 60
                );
            } else {
                tokenBlacklist.add(token);
                setTimeout(() => tokenBlacklist.delete(token), 24 * 60 * 60 * 1000);
            }
        }

        res.cookie('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(0)
        });
        
        res.json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ error: "Logout failed" });
    }
});

// Add check-auth endpoint
router.get("/check-auth", authenticateToken, async (req, res) => {
    try {
        const user = await executeQuery(
            "SELECT user_id, email, user_type, first_name, last_name, shop_id FROM users WHERE user_id = ?",
            [req.user.id]
        );

        if (user.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ 
            authenticated: true,
            user: user[0]
        });
    } catch (error) {
        console.error('Check auth error:', error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;