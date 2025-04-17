// Simple in-memory storage implementation
const tokenBlacklist = new Set();

const isBlacklisted = async (token) => {
    return tokenBlacklist.has(token);
};

const blacklistToken = async (token, expirySeconds = 86400) => {
    tokenBlacklist.add(token);
    // Automatically remove token after expiry
    setTimeout(() => tokenBlacklist.delete(token), expirySeconds * 1000);
};

const clearBlacklist = async () => {
    tokenBlacklist.clear();
};

module.exports = {
    tokenBlacklist,
    isBlacklisted,
    blacklistToken,
    clearBlacklist
};