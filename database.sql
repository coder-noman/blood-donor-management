-- Run this in MySQL Workbench to set up the database

CREATE DATABASE IF NOT EXISTS blood_donation_db;
USE blood_donation_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    age INT,
    blood_group VARCHAR(5),
    phone VARCHAR(20),
    address VARCHAR(255),
    last_donation_date DATE,
    is_admin TINYINT(1) DEFAULT 0,
    is_available TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- If you already created the table before this update, run this line
-- to add the new column instead of recreating everything:
-- ALTER TABLE users ADD COLUMN is_available TINYINT(1) DEFAULT 0;

-- Everyone who registers on the website becomes a normal user (is_admin = 0).
-- To make yourself the admin, first register a normal account on the website,
-- then run the line below (replace the email with the account you want to make admin):

-- UPDATE users SET is_admin = 1 WHERE email = 'admin@example.com';
