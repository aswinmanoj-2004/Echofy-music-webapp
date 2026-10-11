<?php
require_once __DIR__ . '/../config/database.php';

$pdo = getDbConnection();
echo "Initializing Echofy database configuration...\n";

// 1. Genres Setup
$genres = ['Pop', 'Hip-Hop', 'Rock', 'R&B', 'Electronic', 'Jazz', 'Classical', 'Indie', 'Lo-fi', 'Devotional'];
foreach ($genres as $g) {
    $stmt = $pdo->prepare("INSERT IGNORE INTO genres (name) VALUES (?)");
    $stmt->execute([$g]);
}

echo "Database initialization complete! No demo accounts created.\n";
