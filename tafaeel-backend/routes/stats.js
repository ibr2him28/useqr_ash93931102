const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { executeQuery } = require('../config/database');

// Default labels for different periods
const defaultLabelsMap = {
    daily: Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`),
    weekly: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    monthly: Array.from({ length: 12 }, (_, i) => {
        const date = new Date(2024, i, 1);
        return date.toLocaleString('default', { month: 'long' });
    }),
    yearly: Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 2 + i).toString())
};

// Get revenue stats route
router.get('/revenue', authenticateToken, async (req, res) => {
    try {
        const { period = 'weekly' } = req.query;
        const shop_id = req.query.shop_id;
        let query = '';
        let params = [];

        switch(period.toLowerCase()) {
            case 'daily':
                query = `
                    SELECT 
                        DATE_FORMAT(detected_datetime, '%H:00') as time_period,
                        COUNT(*) as car_count,
                        SUM(CAST(estimated_price AS DECIMAL(10,2))) as total_revenue,
                        car_type
                    FROM confirmed_cars 
                    WHERE DATE(detected_datetime) = DATE(NOW()) AND shop_id = ?
                    GROUP BY DATE_FORMAT(detected_datetime, '%H:00'), car_type
                    ORDER BY time_period;
                `;
                break;

            case 'weekly':
                query = `
                    SELECT 
                        DAYNAME(detected_datetime) as time_period,
                        COUNT(*) as car_count,
                        SUM(CAST(estimated_price AS DECIMAL(10,2))) as total_revenue,
                        car_type
                    FROM confirmed_cars 
                    WHERE detected_datetime >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND shop_id = ?
                        OR detected_datetime >= (
                            SELECT DATE_SUB(MAX(detected_datetime), INTERVAL 7 DAY)
                            FROM confirmed_cars
                        )
                    GROUP BY DAYNAME(detected_datetime), car_type
                    ORDER BY DAYOFWEEK(detected_datetime);
                `;
                break;

            case 'monthly':
                query = `
                    SELECT 
                        DATE_FORMAT(detected_datetime, '%M') as time_period,
                        COUNT(*) as car_count,
                        SUM(CAST(estimated_price AS DECIMAL(10,2))) as total_revenue,
                        car_type
                    FROM confirmed_cars 
                    WHERE detected_datetime >= DATE_SUB(NOW(), INTERVAL 12 MONTH) AND shop_id = ?
                        OR detected_datetime >= (
                            SELECT DATE_SUB(MAX(detected_datetime), INTERVAL 12 MONTH)
                            FROM confirmed_cars
                        )
                    GROUP BY DATE_FORMAT(detected_datetime, '%M'), car_type
                    ORDER BY MONTH(detected_datetime);
                `;
                break;

            case 'yearly':
                query = `
                    SELECT 
                        YEAR(detected_datetime) as time_period,
                        COUNT(*) as car_count,
                        SUM(CAST(estimated_price AS DECIMAL(10,2))) as total_revenue,
                        car_type
                    FROM confirmed_cars 
                    WHERE shop_id = ?
                    GROUP BY YEAR(detected_datetime), car_type
                    ORDER BY time_period;
                `;
                break;

            default:
                return res.status(400).json({ error: "Invalid period parameter" });
        }

        const results = await executeQuery(query, [shop_id]);

        // If no results, return default structure with appropriate labels
        if (!results.length) {
            const defaultLabels = defaultLabelsMap[period.toLowerCase()] || [];
            return res.json({
                labels: defaultLabels,
                datasets: {
                    big: defaultLabels.map(() => 0),
                    small: defaultLabels.map(() => 0)
                }
            });
        }

        // Process the results to separate big and small car data
        const timeLabels = [...new Set(results.map(r => r.time_period))];
        
        // Merge with default labels if needed (especially for sparse data)
        const defaultLabels = defaultLabelsMap[period.toLowerCase()] || [];
        const finalLabels = period.toLowerCase() === 'yearly' ? timeLabels : defaultLabels;

        const bigCarData = finalLabels.map(label => {
            const entry = results.find(r => r.time_period === label && r.car_type === 'big');
            return entry ? parseFloat(entry.total_revenue) : 0;
        });

        const smallCarData = finalLabels.map(label => {
            const entry = results.find(r => r.time_period === label && r.car_type === 'small');
            return entry ? parseFloat(entry.total_revenue) : 0;
        });

        const responseData = {
            labels: finalLabels,
            datasets: {
                big: bigCarData,
                small: smallCarData
            }
        };

        res.json(responseData);

    } catch (error) {
        console.error('Detailed error:', error);
        res.status(500).json({ 
            error: "Failed to fetch revenue stats",
            details: error.message 
        });
    }
});

// Get revenue by car type statistics
router.get('/revenue-by-type', authenticateToken, async (req, res) => {
    const shop_id = req.query.shop_id;
    try {
        // Query for today's data
        const dailyQuery = `
            SELECT 
                car_type,
                COUNT(*) as count,
                SUM(CAST(estimated_price AS DECIMAL(10,2))) as total_revenue,
                COUNT(*) * 100.0 / (SELECT COUNT(*) FROM confirmed_cars WHERE DATE(detected_datetime) = CURDATE() AND shop_id = ?) as percentage
            FROM confirmed_cars 
            WHERE DATE(detected_datetime) = CURDATE() AND shop_id = ?
            GROUP BY car_type;
        `;

        // Query for last 7 days
        const weeklyQuery = `
            SELECT 
                car_type,
                COUNT(*) as count,
                SUM(CAST(estimated_price AS DECIMAL(10,2))) as total_revenue,
                COUNT(*) * 100.0 / (
                    SELECT COUNT(*) 
                    FROM confirmed_cars 
                    WHERE detected_datetime >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND shop_id = ?
                ) as percentage
            FROM confirmed_cars 
            WHERE detected_datetime >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND shop_id = ?
            GROUP BY car_type;
        `;

        // Query for last 30 days
        const monthlyQuery = `
            SELECT 
                car_type,
                COUNT(*) as count,
                SUM(CAST(estimated_price AS DECIMAL(10,2))) as total_revenue,
                COUNT(*) * 100.0 / (
                    SELECT COUNT(*) 
                    FROM confirmed_cars 
                    WHERE detected_datetime >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) AND shop_id = ?
                ) as percentage
            FROM confirmed_cars 
            WHERE detected_datetime >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) AND shop_id = ?
            GROUP BY car_type;
        `;

        // Query for yearly data
        const yearlyQuery = `
            SELECT 
                car_type,
                COUNT(*) as count,
                SUM(CAST(estimated_price AS DECIMAL(10,2))) as total_revenue,
                COUNT(*) * 100.0 / (
                    SELECT COUNT(*) 
                    FROM confirmed_cars 
                    WHERE YEAR(detected_datetime) = YEAR(CURDATE()) AND shop_id = ?
                ) as percentage
            FROM confirmed_cars 
            WHERE YEAR(detected_datetime) = YEAR(CURDATE()) AND shop_id = ?
            GROUP BY car_type;
        `;

        // Execute all queries concurrently with correct number of parameters
        const [dailyResults, weeklyResults, monthlyResults, yearlyResults] = await Promise.all([
            executeQuery(dailyQuery, [shop_id, shop_id]),
            executeQuery(weeklyQuery, [shop_id, shop_id]),
            executeQuery(monthlyQuery, [shop_id, shop_id]),
            executeQuery(yearlyQuery, [shop_id, shop_id])
        ]);

        // Process results into the required format
        const formatResults = (results) => {
            const big = results.find(r => r.car_type === 'big') || { count: 0, total_revenue: 0, percentage: 0 };
            const small = results.find(r => r.car_type === 'small') || { count: 0, total_revenue: 0, percentage: 0 };
            
            return {
                big: {
                    count: big.count,
                    revenue: parseFloat(big.total_revenue || 0).toFixed(2),
                    percentage: parseFloat(big.percentage || 0).toFixed(1)
                },
                small: {
                    count: small.count,
                    revenue: parseFloat(small.total_revenue || 0).toFixed(2),
                    percentage: parseFloat(small.percentage || 0).toFixed(1)
                },
                total: {
                    count: big.count + small.count,
                    revenue: parseFloat((big.total_revenue || 0) + (small.total_revenue || 0)).toFixed(2)
                }
            };
        };

        res.json({
            status: 'success',
            data: {
                daily: formatResults(dailyResults),
                weekly: formatResults(weeklyResults),
                monthly: formatResults(monthlyResults),
                yearly: formatResults(yearlyResults)
            }
        });

    } catch (error) {
        console.error('Error fetching revenue by type stats:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch revenue by type statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get confirmed cars count statistics
router.get('/confirmed-cars-count', authenticateToken, async (req, res) => {
    try {
        // Query for hourly data (today)
        const shop_id = req.query.shop_id;
        const dailyQuery = `
            SELECT 
                DATE_FORMAT(detected_datetime, '%H:00') as time_period,
                COUNT(*) as car_count
            FROM confirmed_cars 
            WHERE DATE(detected_datetime) = CURDATE() AND shop_id = ?
            GROUP BY DATE_FORMAT(detected_datetime, '%H:00')
            ORDER BY time_period;
        `;

        // Query for last 7 days
        const weeklyQuery = `
            SELECT 
                DAYNAME(detected_datetime) as day_name,
                COUNT(*) as car_count
            FROM confirmed_cars 
            WHERE detected_datetime >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND shop_id = ?
            GROUP BY DAYNAME(detected_datetime)
            ORDER BY DAYOFWEEK(detected_datetime);
        `;

        // Query for last 12 months
        const monthlyQuery = `
            SELECT 
                DATE_FORMAT(detected_datetime, '%M') as month_name,
                COUNT(*) as car_count
            FROM confirmed_cars 
            WHERE detected_datetime >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH) AND shop_id = ?
            GROUP BY DATE_FORMAT(detected_datetime, '%M')
            ORDER BY MONTH(detected_datetime);
        `;

        // Query for yearly data (current year and previous 4 years)
        const yearlyQuery = `
            SELECT 
                YEAR(detected_datetime) as year,
                COUNT(*) as car_count
            FROM confirmed_cars 
            WHERE YEAR(detected_datetime) >= YEAR(CURDATE()) - 4 AND shop_id = ?
            GROUP BY YEAR(detected_datetime)
            ORDER BY year;
        `;

        // Execute all queries concurrently
        const [dailyResults, weeklyResults, monthlyResults, yearlyResults] = await Promise.all([
            executeQuery(dailyQuery, [shop_id]),
            executeQuery(weeklyQuery, [shop_id]),
            executeQuery(monthlyQuery, [shop_id]),
            executeQuery(yearlyQuery, [shop_id])
        ]);

        // Default labels for different periods
        const defaultLabels = {
            daily: Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`),
            weekly: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            monthly: Array.from({ length: 12 }, (_, i) => {
                const date = new Date(2024, i, 1);
                return date.toLocaleString('default', { month: 'long' });
            }),
            yearly: Array.from({ length: 5 }, (_, i) => {
                const currentYear = new Date().getFullYear();
                return (currentYear - 4 + i).toString();
            })
        };

        // Process results with default values for missing periods
        const processResults = (results, timeframe) => {
            const defaultData = defaultLabels[timeframe].reduce((acc, label) => {
                acc[label] = 0;
                return acc;
            }, {});

            results.forEach(result => {
                const key = result.time_period || result.day_name || result.month_name || result.year.toString();
                defaultData[key] = result.car_count;
            });

            return {
                labels: defaultLabels[timeframe],
                data: defaultLabels[timeframe].map(label => defaultData[label] || 0)
            };
        };

        res.json({
            status: 'success',
            data: {
                daily: processResults(dailyResults, 'daily'),
                weekly: processResults(weeklyResults, 'weekly'),
                monthly: processResults(monthlyResults, 'monthly'),
                yearly: processResults(yearlyResults, 'yearly')
            }
        });

    } catch (error) {
        console.error('Error fetching confirmed cars count:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch confirmed cars count',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Add this test endpoint
router.get('/test', (req, res) => {
    res.json({ message: 'Stats route is working!' });
});

module.exports = router;
