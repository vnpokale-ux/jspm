-- =========================================================================
-- TSSM's BSCOER Pune (JSPM Group) - Campus Lost & Found Database Schema
-- =========================================================================

-- Use current database (defaultdb on cloud or campus_lostandfound locally)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Items Table
CREATE TABLE IF NOT EXISTS items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    item_date DATETIME,
    image_url VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    user_id BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Claims Table
CREATE TABLE IF NOT EXISTS claims (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    proof_description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    handover_token VARCHAR(50),
    is_handed_over BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Matches Table
CREATE TABLE IF NOT EXISTS matches (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lost_item_id BIGINT NOT NULL,
    found_item_id BIGINT NOT NULL,
    match_score DOUBLE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'SUGGESTED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lost_item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (found_item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- 5. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    reference_id BIGINT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Initial Sample Records (Official Campus Administrator)
INSERT INTO users (id, clerk_id, email, first_name, last_name, role, created_at)
VALUES 
(1, 'admin_sanjay_patil', 'sb@patil.bscoer.gmail.com', 'Sanjay', 'Patil', 'ADMIN', NOW())
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO items (id, type, title, description, category, location, status, user_id, created_at)
VALUES 
(101, 'LOST', 'Apple AirPods Pro (2nd Gen) in Black Silicone Case', 'Lost near reading desk on library 3rd floor.', 'Electronics & Gadgets', 'BSCOER Central Library & Digital Reading Hall (3rd Floor)', 'ACTIVE', 1, NOW()),
(102, 'FOUND', 'AirPods Pro with Matte Black Case Cover', 'Found on study desk on library 3rd floor near window.', 'Electronics & Gadgets', 'BSCOER Central Library & Digital Reading Hall (3rd Floor)', 'ACTIVE', 2, NOW()),
(103, 'LOST', 'HP Pavilion 65W Blue-Pin Laptop Charger', 'Left plugged into wall socket in Computer Lab 204.', 'Electronics & Gadgets', 'Computer Dept - Programming Lab 204 (B-Wing)', 'ACTIVE', 1, NOW()),
(104, 'FOUND', 'BSCOER Student ID Card & Blue Leather Wallet', 'Contains student identity card of Rohit Patil (Computer Dept) and cafeteria coupons.', 'Wallets, IDs & Documents', 'TSSM Central Canteen & Food Court', 'ACTIVE', 2, NOW()),
(105, 'FOUND', 'White Engineering Chemistry Lab Coat (Size M)', 'Found on hanger rack in Chemistry Lab 102.', 'Clothing, Uniforms & Bags', 'Applied Science Dept - Chemistry Lab 102', 'RESOLVED', 2, NOW())
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO claims (id, item_id, user_id, proof_description, status, handover_token, is_handed_over, created_at)
VALUES
(1, 104, 1, 'My student ID has PRN 72189342 (Rohit Patil). Inside there is a silver metallic Metro card.', 'PENDING', NULL, FALSE, NOW()),
(2, 105, 1, 'Name tag inside collar says "Rohit P. - Comp Engg".', 'APPROVED', 'TK-824915', FALSE, NOW())
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO matches (id, lost_item_id, found_item_id, match_score, status, created_at)
VALUES
(1, 101, 102, 0.94, 'SUGGESTED', NOW())
ON DUPLICATE KEY UPDATE id=id;
