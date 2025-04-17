const mysql = require('mysql2');

// Create a connection pool with AWS RDS configuration
const pool = mysql.createPool({
    host: 'car-washing-tracking-db.cjcwsoqckcet.ap-southeast-2.rds.amazonaws.com',
    user: 'admin',
    password: 'tafaeel1234',
    database: 'car-washing-tracking-db',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 20000, // Increased timeout for RDS connection
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    ssl: {
        rejectUnauthorized: false // Required for AWS RDS SSL connection
    }
});

// Promisify for async/await
const promisePool = pool.promise();

// Improved test connection function
const testConnection = async () => {
    let connection;
    try {
        // Get a connection from the pool
        connection = await promisePool.getConnection();
        
        // Test the connection with a simple query
        const [result] = await connection.query('SELECT 1');
        console.log('Database connected successfully to AWS RDS', {
            host: 'car-washing-tracking-db.cjcwsoqckcet.ap-southeast-2.rds.amazonaws.com',
            database: 'car-washing-tracking-db'
        });
        
        // Release the connection back to the pool
        connection.release();
        
    } catch (error) {
        console.error('Database connection error:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        
        if (connection) {
            connection.release();
        }
        
        throw error;
    }
};

// Initialize database with retries
const initializeDatabase = async (retries = 5, delay = 5000) => {
    for (let i = 0; i < retries; i++) {
        try {
            await testConnection();
            console.log('Database initialization successful');
            return;
        } catch (error) {
            console.error(`Connection attempt ${i + 1} of ${retries} failed`);
            if (i === retries - 1) {
                console.error('Failed to connect to database after all retries');
                return;
            }
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

// Execute queries with better error handling
const executeQuery = async (query, params = []) => {
    try {
        const [results] = await promisePool.execute(query, params);
        return results;
    } catch (error) {
        console.error('Query execution error:', {
            query,
            params,
            error: error.message,
            code: error.code
        });
        throw error;
    }
};

// Graceful shutdown
process.on('SIGINT', async () => {
    try {
        await promisePool.end();
        console.log('Database connection closed gracefully');
        process.exit(0);
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
});

// Initialize the database connection
initializeDatabase().catch(console.error);

module.exports = { executeQuery };