<?php
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendResponse(true, "OK");
}

$user = authenticateUser();
$pdo = getDbConnection();

$sql = "SELECT s.*, u.name AS artist_name, u.profile_picture AS artist_picture, g.name AS genre_name, al.title AS album_title,
               1 AS is_favorite, f.created_at AS favorited_at
        FROM favorites f
        JOIN songs s ON f.song_id = s.song_id
        JOIN artists a ON s.artist_id = a.artist_id
        JOIN users u ON a.user_id = u.user_id
        LEFT JOIN genres g ON s.genre_id = g.genre_id
        LEFT JOIN albums al ON s.album_id = al.album_id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC";

$stmt = $pdo->prepare($sql);
$stmt->execute([$user['user_id']]);
$favorites = $stmt->fetchAll();

sendResponse(true, "User favorites retrieved", $favorites);
