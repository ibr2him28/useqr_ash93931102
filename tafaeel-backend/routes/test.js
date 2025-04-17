require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const Redis = require('redis');

const app = express();
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const db = mysql.createConnection({
    host: process.env.DB_HOST || "car-washing-tracking-db.cjcwsoqckcet.ap-southeast-2.rds.amazonaws.com",
    user: process.env.DB_USER || "admin",
    password: process.env.DB_PASS || "tafaeel1234",
    database: process.env.DB_BASE || "car-washing-tracking-db",
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed:", err.stack);
        return;
    }
    console.log("Connected to the database.");
});

// Example API Route
app.get("/", async(req, res) => {
    return res.json("From Backend Side")
})


// Helper function to execute queries
const executeQuery = (query, params) => {
    return new Promise((resolve, reject) => {
        db.query(query, params, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

// Create Redis client with fallback to in-memory storage
let redisClient = null;
const tokenBlacklist = new Set(); // In-memory fallback

const initializeRedis = async () => {
    try {
        redisClient = Redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });

        redisClient.on('error', err => console.log('Redis Client Error:', err));
        await redisClient.connect();
        console.log('Redis connected successfully');
    } catch (error) {
        console.log('Redis connection failed, using in-memory storage:', error.message);
        redisClient = null;
    }
};

initializeRedis();

// Updated authenticateToken middleware with fallback
const authenticateToken = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        // Check if token is blacklisted
        let isBlacklisted = false;
        if (redisClient) {
            // Use Redis if available
            isBlacklisted = await redisClient.get(bl_${token});
        } else {
            // Use in-memory fallback
            isBlacklisted = tokenBlacklist.has(token);
        }

        if (isBlacklisted) {
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

// Login endpoint
app.post("/login", async(req, res) => {
    const { email, password } = req.body;
    
    try {
        const users = await executeQuery("SELECT * FROM users WHERE email = ?", [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (isMatch) {
            // Generate JWT token
            const token = jwt.sign(
                { 
                    id: user.user_id, 
                    email: user.email, 
                    user_type: user.user_type,
                    tokenVersion: Date.now() // Add version for blacklisting
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Remove sensitive data
            delete user.password_hash;

            // Set HTTP-only cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });

            return res.json({ 
                message: "Login successful", 
                user: {
                    user_id: user.user_id,
                    email: user.email,
                    user_type: user.user_type,
                    first_name: user.first_name,
                    last_name: user.last_name
                }
            });
        }

        return res.status(401).json({ error: "Invalid email or password" });

    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Updated logout endpoint with fallback
app.post("/logout", authenticateToken, async (req, res) => {
    try {
        const token = req.cookies.token;
        if (token) {
            if (redisClient) {
                // Use Redis if available
                await redisClient.set(
                    bl_${token}, 
                    'true',
                    'EX',
                    24 * 60 * 60 // 24 hours
                );
            } else {
                // Use in-memory fallback
                tokenBlacklist.add(token);
                // Optional: Clean up old tokens periodically
                setTimeout(() => tokenBlacklist.delete(token), 24 * 60 * 60 * 1000);
            }
        }

        // Clear the cookie
        res.cookie('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(0)
        });
        
        res.json({ message: "Logged out successfully" });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: "Logout failed" });
    }
});

// car_metadata
app.get("/car_metadata", authenticateToken, async(req, res) => {
    try {
        const query = "SELECT * FROM car_metadata";
        db.query(query, (err, results) => {
            if (err) {
                res.status(500).json({ error: "Database query failed", details: err });
            } else {
                res.json(results);
            }
        });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error });
    }
});

// car_washes
app.get("/car_washes", async(req, res) => {
    try {
        const query = "SELECT * FROM car_washes";
        db.query(query, (err, results) => {
            if (err) {
                res.status(500).json({ error: "Database query failed", details: err });
            } else {
                res.json(results);
            }
        });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error });
    }
});

// users 
app.get("/users", async(req, res) => {
    try {
        const query = "SELECT * FROM users";
        db.query(query, (err, results) => {
            if (err) {
                res.status(500).json({ error: "Database query failed", details: err });
            } else {
                res.json(results);
            }
        });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error });
    }
});

// shops
app.get("/shops", async(req, res) => {
    try {
        const query = "SELECT * FROM shops";
        db.query(query, (err, results) => {
            if (err) {
                res.status(500).json({ error: "Database query failed", details: err });
            } else {
                res.json(results);
            }
        });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error });
    }
});

// customers
app.get("/customers", async(req, res) => {
    try {
        const query = "SELECT * FROM customers";
        db.query(query, (err, results) => {
            if (err) {
                res.status(500).json({ error: "Database query failed", details: err });
            } else {
                res.json(results);
            }
        });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error });
    }
});

// user_shops
app.get("/user_shops", async(req, res) => {
    try {
        const query = "SELECT * FROM user_shops";
        db.query(query, (err, results) => {
            if (err) {
                res.status(500).json({ error: "Database query failed", details: err });
            } else {
                res.json(results);
            }
        });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error });
    }
});

// customer_shops
app.get("/customer_shops", async(req, res) => {
    try {
        const query = "SELECT * FROM customer_shops";
        db.query(query, (err, results) => {
            if (err) {
                res.status(500).json({ error: "Database query failed", details: err });
            } else {
                res.json(results);
            }
        });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error });
    }
});

// confirmed_cars
// get null
app.get("/confirmed_cars", async(req, res) => {
    try {
        const query = "SELECT * FROM confirmed_cars";
        db.query(query, (err, results) => {
            if (err) {
                res.status(500).json({ error: "Database query failed", details: err });
            } else {
                res.json(results);
            }
        });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error });
    }
});

// Revenue Statistics API Endpoint
app.get("/revenue-stats", authenticateToken, async (req, res) => {
    try {
        // Daily revenue (last 24 hours)
        const dailyQuery = 
            SELECT 
                HOUR(detected_datetime) as timeframe,
                SUM(CAST(estimated_price AS DECIMAL(10,2))) as revenue,
                COUNT(*) as count
            FROM wash_details
            WHERE DATE(detected_datetime) = CURDATE()
            GROUP BY HOUR(detected_datetime)
            ORDER BY timeframe;

        // Weekly revenue (last 7 days)
        const weeklyQuery = 
            SELECT 
                DAYNAME(detected_datetime) as day_name,
                SUM(CAST(estimated_price AS DECIMAL(10,2))) as revenue,
                COUNT(*) as count
            FROM wash_details
            WHERE detected_datetime >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY DAYNAME(detected_datetime), DAYOFWEEK(detected_datetime)
            ORDER BY DAYOFWEEK(detected_datetime);

        // Monthly revenue (12 months)
        const monthlyQuery = 
            SELECT 
                MONTHNAME(detected_datetime) as month_name,
                SUM(CAST(estimated_price AS DECIMAL(10,2))) as revenue,
                COUNT(*) as count
            FROM wash_details
            WHERE detected_datetime >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY MONTHNAME(detected_datetime), MONTH(detected_datetime)
            ORDER BY MONTH(detected_datetime);

        // Yearly revenue
        const yearlyQuery = 
            SELECT 
                YEAR(detected_datetime) as year,
                SUM(CAST(estimated_price AS DECIMAL(10,2))) as revenue,
                COUNT(*) as count
            FROM wash_details
            WHERE detected_datetime >= DATE_SUB(CURDATE(), INTERVAL 12 YEAR)
            GROUP BY YEAR(detected_datetime)
            ORDER BY year;

        // Execute all queries concurrently
        const [dailyResults, weeklyResults, monthlyResults, yearlyResults] = await Promise.all([
            executeQuery(dailyQuery),
            executeQuery(weeklyQuery),
            executeQuery(monthlyQuery),
            executeQuery(yearlyQuery)
        ]);

        // Process and format the data
        const formatData = (results, length, defaultLabels) => {
            const data = Array(length).fill(0);
            results.forEach(row => {
                let index;
                if ('timeframe' in row) index = row.timeframe;
                else if ('day_name' in row) index = defaultLabels.indexOf(row.day_name);
                else if ('month_name' in row) index = defaultLabels.indexOf(row.month_name);
                else if ('year' in row) {
                    const currentYear = new Date().getFullYear();
                    index = length - (currentYear - row.year) - 1;
                }
                if (index >= 0 && index < length) {
                    data[index] = parseFloat(row.revenue) || 0;
                }
            });
            return data;
        };

        // Format response with consistent arrays
        const response = {
            daily: formatData(dailyResults, 24, []),
            weekly: formatData(weeklyResults, 7, ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']),
            monthly: formatData(monthlyResults, 12, ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']),
            yearly: formatData(yearlyResults, 12, []),
            labels: {
                daily: Array.from({ length: 24 }, (_, i) => ${i}h),
                weekly: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                monthly: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                yearly: Array.from({ length: 12 }, (_, i) => ${new Date().getFullYear() - 11 + i})
            }
        };

        res.json(response);

    } catch (error) {
        console.error("Error fetching revenue statistics:", error);
        res.status(500).json({
            error: "Failed to fetch revenue statistics",
            details: error.message
        });
    }
});

// Create User API Endpoint
app.post("/create-user", authenticateToken, async (req, res) => {
    // Check if the requesting user is an admin
    if (req.user.user_type !== 'admin') {
        return res.status(403).json({ error: "Access denied. Only admins can create new users." });
    }

    const {
        first_name,
        last_name,
        email,
        password,
        mobile,
        user_type,
        shop_id
    } = req.body;

    try {
        // Check if email already exists
        const existingUser = await executeQuery(
            "SELECT email FROM users WHERE email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ error: "Email already exists" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(12);
        const password_hash = await bcrypt.hash(password, salt);

        // Insert new user
        const query = 
            INSERT INTO users (
                first_name,
                last_name,
                email,
                password_hash,
                mobile,
                user_type,
                shop_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ;

        const result = await executeQuery(query, [
            first_name,
            last_name,
            email,
            password_hash,
            mobile,
            user_type,
            shop_id
        ]);

        // Return success response
        res.status(201).json({
            message: "User created successfully",
            user_id: result.insertId
        });

    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({
            error: "Failed to create user",
            details: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(Server is running on port ${PORT});
});