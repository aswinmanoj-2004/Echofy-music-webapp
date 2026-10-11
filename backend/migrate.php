<?php
require_once __DIR__ . '/../config/database.php';

$pdo = getDbConnection();

$sql = "
CREATE TABLE IF NOT EXISTS email_verifications (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    email         VARCHAR(150) NOT NULL,
    code          VARCHAR(10)  NOT NULL,
    type          ENUM('register', 'login') NOT NULL DEFAULT 'register',
    is_verified   TINYINT(1)   NOT NULL DEFAULT 0,
    expires_at    TIMESTAMP    NOT NULL,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    KEY idx_email_code (email, code),
    KEY idx_expires (expires_at)
) ENGINE=InnoDB;
";

$pdo->exec($sql);
echo "email_verifications table created successfully!\n";
