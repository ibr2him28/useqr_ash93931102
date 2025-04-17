const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get confirmed cars with pagination
router.get("/confirmed_cars", authenticateToken, async (req, res) => {
    try {
        // Parse and validate pagination parameters
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 10);
        const offset = (page - 1) * limit;
        
        // Get shop_id from query parameters and convert to number
        const shop_id = parseInt(req.query.shop_id);
        
        if (!shop_id) {
            return res.status(400).json({
                status: 'error',
                message: 'Shop ID is required'
            });
        }

        // Get total count first with shop_id filter
        const countResult = await executeQuery(
            'SELECT COUNT(*) as total FROM confirmed_cars WHERE shop_id = ?',
            [shop_id]
        );
        const totalItems = countResult[0].total;

        // Use the limit and offset directly in the query string
        const query = `
            SELECT * FROM confirmed_cars 
            WHERE shop_id = ? 
            ORDER BY detected_datetime DESC 
            LIMIT ${limit} OFFSET ${offset}
        `;

        const results = await executeQuery(query, [shop_id]);

        if (!results || results.length === 0) {
            return res.status(404).json({ 
                status: 'error', 
                message: 'No confirmed cars found for this shop' 
            });
        }

        res.json({
            status: 'success',
            data: results,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                totalItems: totalItems,
                itemsPerPage: limit
            }
        });

    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            status: 'error',
            message: 'Unable to fetch car data',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});



// Get latest 3 confirmed cars
router.get("/latest_cars", authenticateToken, async (req, res) => {
    try {
        const shop_id = req.query.shop_id;
        const query = `
            SELECT 
                service_type, 
                detected_datetime, 
                car_picture_url, 
                estimated_price 
            FROM confirmed_cars 
            WHERE shop_id = ?
            ORDER BY detected_datetime DESC 
            LIMIT 3
        `;

        const results = await executeQuery(query, [shop_id]);

        if (!results || results.length === 0) {
            return res.status(404).json({ 
                status: 'error', 
                message: 'No recent cars found' 
            });
        }

        res.json({
            status: 'success',
            data: results,
            count: results.length
        });

    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            status: 'error',
            message: 'Unable to fetch latest cars',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});


// Get confirmed cars summary
router.get("/confirmed_cars_summary", authenticateToken, async (req, res) => {
    try {
        const shop_id = req.query.shop_id;
        // Query for today's confirmed cars count and revenue
        const todayQuery = `
            SELECT 
                COUNT(*) as total_today, 
                SUM(estimated_price) as revenue_today 
            FROM confirmed_cars 
            WHERE DATE(detected_datetime) = CURDATE() AND shop_id = ?
        `;

        // Query for this week's confirmed cars count and revenue
        const thisWeekQuery = `
            SELECT 
                COUNT(*) as total_this_week, 
                SUM(estimated_price) as revenue_this_week 
            FROM confirmed_cars 
            WHERE YEARWEEK(detected_datetime, 1) = YEARWEEK(CURDATE(), 1) AND shop_id = ?
        `;

        // Execute both queries concurrently for efficiency
        const [todayResult, thisWeekResult] = await Promise.all([
            executeQuery(todayQuery, [shop_id]),
            executeQuery(thisWeekQuery, [shop_id]),
        ]);
            
        // Parse results
        const totalToday = todayResult[0]?.total_today || 0;
        const revenueToday = parseFloat(todayResult[0]?.revenue_today || 0).toFixed(2);

        const totalThisWeek = thisWeekResult[0]?.total_this_week || 0;
        const revenueThisWeek = parseFloat(thisWeekResult[0]?.revenue_this_week || 0).toFixed(2);

        // Send response
        res.json({
            status: "success",
            data: {
                today: {
                    count: totalToday,
                    revenue: revenueToday,
                },
                thisWeek: {
                    count: totalThisWeek,
                    revenue: revenueThisWeek,
                },
            },
        });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            status: "error",
            message: "Unable to fetch confirmed cars summary",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});

// Get car washing statistics
router.get("/washing-stats", async (req, res) => {
    try {
        // Get today's stats
        const todayQuery = `
            SELECT 
                COUNT(*) as total_cars,
                SUM(CASE WHEN service_type = 'premium wash' THEN 1 ELSE 0 END) as premium_wash,
                SUM(CASE WHEN service_type = 'basic wash' THEN 1 ELSE 0 END) as basic_wash,
                SUM(CASE WHEN service_type = 'deluxe wash' THEN 1 ELSE 0 END) as deluxe_wash
            FROM confirmed_cars 
            WHERE DATE(detected_datetime) = CURDATE()
        `;

        // Get this week's stats (starting from Sunday)
        const weekQuery = `
            SELECT 
                COUNT(*) as total_cars,
                SUM(CASE WHEN service_type = 'premium wash' THEN 1 ELSE 0 END) as premium_wash,
                SUM(CASE WHEN service_type = 'basic wash' THEN 1 ELSE 0 END) as basic_wash,
                SUM(CASE WHEN service_type = 'deluxe wash' THEN 1 ELSE 0 END) as deluxe_wash
            FROM confirmed_cars 
            WHERE YEARWEEK(detected_datetime, 1) = YEARWEEK(CURDATE(), 1)
        `;

        // Get total stats
        const totalQuery = `
            SELECT 
                COUNT(*) as total_cars,
                SUM(CASE WHEN service_type = 'premium wash' THEN 1 ELSE 0 END) as premium_wash,
                SUM(CASE WHEN service_type = 'basic wash' THEN 1 ELSE 0 END) as basic_wash,
                SUM(CASE WHEN service_type = 'deluxe wash' THEN 1 ELSE 0 END) as deluxe_wash
            FROM confirmed_cars
        `;

        const [todayStats] = await executeQuery(todayQuery);
        const [weekStats] = await executeQuery(weekQuery);
        const [totalStats] = await executeQuery(totalQuery);

        // Calculate percentages for today
        const todayTotal = todayStats.total_cars || 0;
        const todayPercentages = {
            premium_wash: todayTotal ? ((todayStats.premium_wash / todayTotal) * 100).toFixed(1) : 0,
            basic_wash: todayTotal ? ((todayStats.basic_wash / todayTotal) * 100).toFixed(1) : 0,
            deluxe_wash: todayTotal ? ((todayStats.deluxe_wash / todayTotal) * 100).toFixed(1) : 0
        };

        // Calculate percentages for week
        const weekTotal = weekStats.total_cars || 0;
        const weekPercentages = {
            premium_wash: weekTotal ? ((weekStats.premium_wash / weekTotal) * 100).toFixed(1) : 0,
            basic_wash: weekTotal ? ((weekStats.basic_wash / weekTotal) * 100).toFixed(1) : 0,
            deluxe_wash: weekTotal ? ((weekStats.deluxe_wash / weekTotal) * 100).toFixed(1) : 0
        };

        res.json({
            status: 'success',
            data: {
                today: {
                    ...todayStats,
                    percentages: todayPercentages
                },
                this_week: {
                    ...weekStats,
                    percentages: weekPercentages
                },
                total: totalStats
            }
        });

    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            status: 'error',
            message: 'Unable to fetch washing statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;