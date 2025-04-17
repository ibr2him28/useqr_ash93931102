const jwt = require('jsonwebtoken');
const { isBlacklisted } = require('../config/redis');

const authenticateToken = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        // Check if token is blacklisted
        const tokenIsBlacklisted = await isBlacklisted(token);
        if (tokenIsBlacklisted) {
            return res.status(401).json({ error: "Token has been invalidated" });
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        console.error('Token verification error:', err);
        res.status(403).json({ error: "Invalid token" });
    }
};

module.exports = { authenticateToken };