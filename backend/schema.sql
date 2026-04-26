CREATE DATABASE IF NOT EXISTS talent_scouting;
USE talent_scouting;

-- Remove foreign key check to ensure tables can be dropped and recreated cleanly
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS candidates;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- Users Table
CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY email_unique (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Candidates Table (Removed the physical foreign key constraint to ensure compatibility across all MySQL versions)
CREATE TABLE candidates (
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
