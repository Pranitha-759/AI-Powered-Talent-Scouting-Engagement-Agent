const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

let db;

const connectDB = async () => {
    return new Promise((resolve, reject) => {
        const dbPath = path.join(__dirname, '../database.sqlite');
        
        db = new sqlite3.Database(dbPath, async (err) => {
            if (err) {
                console.error('SQLite connection error:', err.message);
                resolve(null);
            } else {
                console.log('SQLite connected (Local File Mode)...');
                
                // Initialize tables
                db.serialize(() => {
                    db.run(`
                        CREATE TABLE IF NOT EXISTS users (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            name TEXT NOT NULL,
                            email TEXT NOT NULL UNIQUE,
                            password TEXT NOT NULL,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                        )
                    `);

                    db.run(`
                        CREATE TABLE IF NOT EXISTS candidates (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            name TEXT NOT NULL,
                            skills TEXT,
                            experience INTEGER,
                            match_score INTEGER,
                            interest_score INTEGER,
                            final_score INTEGER,
                            status TEXT,
                            user_id INTEGER NOT NULL
                        )
                    `);
                });

                // Create a mock "pool" interface for compatibility
                const poolWrapper = {
                    query: (sql, params) => {
                        return new Promise((res, rej) => {
                            const upperSql = sql.trim().toUpperCase();
                            if (upperSql.startsWith('SELECT')) {
                                db.all(sql, params, (err, rows) => {
                                    if (err) rej(err);
                                    else res([rows]); // Wrap in array to match MySQL [rows, fields]
                                });
                            } else {
                                db.run(sql, params, function(err) {
                                    if (err) rej(err);
                                    else res([{ insertId: this.lastID, affectedRows: this.changes }]);
                                });
                            }
                        });
                    },
                    getConnection: async () => ({
                        query: poolWrapper.query,
                        release: () => {}
                    })
                };
                
                db.pool = poolWrapper;
                resolve(poolWrapper);
            }
        });
    });
};

module.exports = { connectDB, getPool: () => db ? db.pool : null };
