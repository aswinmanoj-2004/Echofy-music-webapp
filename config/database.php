<?php
// Database configuration for Echofy Music Streaming Platform

if (!defined('DB_HOST')) define('DB_HOST', 'localhost');
if (!defined('DB_NAME')) define('DB_NAME', 'Echofy');
if (!defined('DB_USER')) define('DB_USER', 'root');
if (!defined('DB_PASSWORD')) define('DB_PASSWORD', '');

/**
 * Returns a shared PDO database connection instance.
 * Automatically attempts to create database & tables if DB does not exist yet.
 */
function getDbConnection() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    try {
        // Try connecting directly to Echofy DB
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $pdo = new PDO($dsn, DB_USER, DB_PASSWORD, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        ensureEmailVerificationTableExists($pdo);
        return $pdo;
    } catch (PDOException $e) {
        // If DB doesn't exist, try connecting to MySQL host to create it
        try {
            $dsnNoDb = "mysql:host=" . DB_HOST . ";charset=utf8mb4";
            $pdoNoDb = new PDO($dsnNoDb, DB_USER, DB_PASSWORD, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
            ]);
            $pdoNoDb->exec("CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            $pdoNoDb->exec("USE `" . DB_NAME . "`");
            
            // Connect to newly created database
            $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASSWORD, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);

            // Run initial database tables setup
            initializeDatabaseTables($pdo);
            return $pdo;
        } catch (PDOException $ex) {
            header('Content-Type: application/json');
            http_response_code(500);
            echo json_encode([
                "status" => false,
                "message" => "Database connection failed: " . $ex->getMessage()
            ]);
            exit();
        }
    }
}

/**
 * Creates default tables if missing.
 */
function initializeDatabaseTables($pdo) {
    $sql = "
    CREATE TABLE IF NOT EXISTS users (
        user_id         INT AUTO_INCREMENT PRIMARY KEY,
        name            VARCHAR(100)        NOT NULL,
        email           VARCHAR(150)        NOT NULL UNIQUE,
        password_hash   VARCHAR(255)        NOT NULL,
        profile_picture VARCHAR(255)        DEFAULT NULL,
        role            ENUM('listener','artist','admin') NOT NULL DEFAULT 'listener',
        theme           ENUM('light','dark') NOT NULL DEFAULT 'dark',
        is_active       TINYINT(1)          NOT NULL DEFAULT 1,
        created_at      TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
        updated_at      TIMESTAMP           DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS artists (
        artist_id     INT AUTO_INCREMENT PRIMARY KEY,
        user_id       INT NOT NULL UNIQUE,
        biography     TEXT DEFAULT NULL,
        banner_image  VARCHAR(255) DEFAULT NULL,
        total_plays   BIGINT NOT NULL DEFAULT 0,
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS genres (
        genre_id    INT AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(50) NOT NULL UNIQUE
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS albums (
        album_id       INT AUTO_INCREMENT PRIMARY KEY,
        artist_id      INT NOT NULL,
        title          VARCHAR(150) NOT NULL,
        cover_image    VARCHAR(255) DEFAULT NULL,
        release_date   DATE DEFAULT NULL,
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (artist_id) REFERENCES artists(artist_id) ON DELETE CASCADE
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS songs (
        song_id        INT AUTO_INCREMENT PRIMARY KEY,
        artist_id      INT NOT NULL,
        album_id       INT DEFAULT NULL,
        genre_id       INT DEFAULT NULL,
        title          VARCHAR(150) NOT NULL,
        file_path      VARCHAR(255) NOT NULL,
        cover_image    VARCHAR(255) DEFAULT NULL,
        duration       INT DEFAULT 180,
        video_id       VARCHAR(20) DEFAULT NULL,
        play_count     BIGINT NOT NULL DEFAULT 0,
        like_count     BIGINT NOT NULL DEFAULT 0,
        is_trending    TINYINT(1) NOT NULL DEFAULT 0,
        uploaded_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (artist_id) REFERENCES artists(artist_id) ON DELETE CASCADE,
        FOREIGN KEY (album_id) REFERENCES albums(album_id) ON DELETE SET NULL,
        FOREIGN KEY (genre_id) REFERENCES genres(genre_id) ON DELETE SET NULL
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS playlists (
        playlist_id  INT AUTO_INCREMENT PRIMARY KEY,
        user_id      INT NOT NULL,
        name         VARCHAR(100) NOT NULL,
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS playlist_songs (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        playlist_id   INT NOT NULL,
        song_id       INT NOT NULL,
        added_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (playlist_id) REFERENCES playlists(playlist_id) ON DELETE CASCADE,
        FOREIGN KEY (song_id) REFERENCES songs(song_id) ON DELETE CASCADE,
        UNIQUE KEY uq_playlist_song (playlist_id, song_id)
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS favorites (
        favorite_id   INT AUTO_INCREMENT PRIMARY KEY,
        user_id       INT NOT NULL,
        song_id       INT NOT NULL,
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (song_id) REFERENCES songs(song_id) ON DELETE CASCADE,
        UNIQUE KEY uq_user_song_favorite (user_id, song_id)
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS recently_played (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        user_id       INT NOT NULL,
        song_id       INT NOT NULL,
        played_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (song_id) REFERENCES songs(song_id) ON DELETE CASCADE
    ) ENGINE=InnoDB;

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

    // Insert initial seed genres if empty
    $stmt = $pdo->query("SELECT COUNT(*) as cnt FROM genres");
    if ($stmt->fetch()['cnt'] == 0) {
        $pdo->exec("INSERT INTO genres (name) VALUES 
            ('Pop'), ('Hip-Hop'), ('Rock'), ('R&B'), ('Electronic'),
            ('Jazz'), ('Classical'), ('Indie'), ('Lo-fi'), ('Devotional')");
    }
}

/**
 * Self-healing check to ensure email_verifications table exists.
 */
function ensureEmailVerificationTableExists($pdo) {
    try {
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
    } catch (Exception $e) {
        // Silently handle if table already exists or permission restricted
    }
}

