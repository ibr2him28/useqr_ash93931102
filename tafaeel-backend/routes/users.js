const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { executeQuery } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Create user route
router.post("/create", authenticateToken, async (req, res) => {
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
        const existingUser = await executeQuery(
            "SELECT email FROM users WHERE email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ error: "Email already exists" });
        }

        const salt = await bcrypt.genSalt(12);
        const password_hash = await bcrypt.hash(password, salt);

        const result = await executeQuery(
            `INSERT INTO users (
                first_name, last_name, email, password_hash, 
                mobile, user_type, shop_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [first_name, last_name, email, password_hash, mobile, user_type, shop_id]
        );

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

// Get users route
router.get("/", authenticateToken, async (req, res) => {
    try {
        const users = await executeQuery("SELECT * FROM users");
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// Reset user password (admin only)
router.post("/reset-password", authenticateToken, async (req, res) => {
    try {
        // Check if the requester is an admin
        if (req.user.user_type !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: "Access denied. Only admins can reset passwords."
            });
        }

        const { email, newPassword } = req.body;

        // Validate inputs
        if (!email || !newPassword) {
            return res.status(400).json({
                status: 'error',
                message: "Email and new password are required"
            });
        }

        // Check if user exists and get their ID
        const user = await executeQuery(
            "SELECT user_id FROM users WHERE email = ?",
            [email]
        );

        if (user.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: "User not found"
            });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(12);
        const password_hash = await bcrypt.hash(newPassword, salt);

        // Update the user's password
        await executeQuery(
            "UPDATE users SET password_hash = ? WHERE email = ?",
            [password_hash, email]
        );

        // Log the password reset action with null check for admin_id
        const admin_id = req.user?.user_id || null;
        if (admin_id) {
            await executeQuery(
                `INSERT INTO admin_logs (
                    admin_id, 
                    action_type, 
                    action_details, 
                    affected_user_id
                ) VALUES (?, ?, ?, ?)`,
                [
                    admin_id,
                    'password_reset',
                    'Password reset by admin',
                    user[0].user_id
                ]
            );
        }

        res.json({
            status: 'success',
            message: "Password has been reset successfully"
        });

    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({
            status: 'error',
            message: "Failed to reset password",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get all users route
// router.get("/users", authenticateToken, async (req, res) => {
//     try {
//         const users = await executeQuery(`
//             SELECT 
//                 u.user_id,
//                 u.email,
//                 u.user_type,
//                 u.shop_id,
//                 u.created_at,
//             FROM users 
//             ORDER BY u.created_at DESC
//         `);

//         if (!users || users.length === 0) {
//             return res.status(404).json({
//                 status: 'error',
//                 message: 'No users found'
//             });
//         }

//         // Format dates and remove sensitive data
//         const formattedUsers = users.map(user => ({
//             ...user,
//             created_at: user.created_at ? new Date(user.created_at).toISOString() : null,
//             password_hash: undefined // Remove sensitive data
//         }));

//         res.json({
//             status: 'success',
//             data: formattedUsers,
//             count: formattedUsers.length
//         });

//     } catch (error) {
//         console.error("Error fetching users:", error);
//         res.status(500).json({
//             status: 'error',
//             message: 'Failed to fetch users',
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// });

// Get all users - simple route
// router.get("/users", authenticateToken, async (req, res) => {
//     try {
//         const users = await executeQuery(`
//             SELECT * FROM users
//             ORDER BY created_at DESC
//         `);

//         res.json({
//             status: 'success',
//             data: users
//         });

//     } catch (error) {
//         console.error("Error fetching users:", error);
//         res.status(500).json({
//             status: 'error',
//             message: 'Failed to fetch users'
//         });
//     }
// });



module.exports = router;