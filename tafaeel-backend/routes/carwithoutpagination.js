const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get confirmed cars - return all columns
router.get("/confirmed_cars", authenticateToken, async (req, res) => {
    try {
        const results = await executeQuery(`
            SELECT * FROM confirmed_cars
            ORDER BY detected_datetime DESC
        `);
        
        // Check if we got any results
        if (!results || results.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'No confirmed cars found'
            });
        }

        res.json({
            status: 'success',
            data: results,
            count: results.length
        });

    } catch (error) {
        console.error("Database error:", error);
        
        // Send a user-friendly error message
        res.status(500).json({
            status: 'error',
            message: 'Unable to fetch car data. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;