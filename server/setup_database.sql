-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS skinforge_db;
USE skinforge_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    steam_id VARCHAR(255) NOT NULL UNIQUE,
    api_key VARCHAR(255),
    trade_url TEXT,
    app_installed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_steam_id (steam_id)
);

-- Create any additional tables as needed
-- Add more tables here based on your application requirements

-- Show the created table structure
DESCRIBE users; 