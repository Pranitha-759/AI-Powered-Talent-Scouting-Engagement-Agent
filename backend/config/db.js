const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

const connectDB = async () => {
    try {
        pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Test connection and initialize tables
        const connection = await pool.getConnection();
        console.log('MySQL connected...');

        // Auto-initialize tables
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT NOT NULL AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                UNIQUE KEY email_unique (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS candidates (
                id INT NOT NULL AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                skills TEXT,
                experience INT,
                match_score INT,
                interest_score INT,
                final_score INT,
                status VARCHAR(50),
                user_id INT NOT NULL,
                PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        connection.release();
        return pool;
    } catch (err) {
        console.error('MySQL connection/init error:', err.message);
        console.log('Falling back to mock data mode...');
        pool = null; // Ensure pool is null so routes use demo mode
        return null;
    }
};

module.exports = { connectDB, getPool: () => pool };
