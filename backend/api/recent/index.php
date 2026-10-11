<?php
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendResponse(true, "OK");
}

$user = authenticateUser();
$pdo = getDbConnection();

$sql = "SELECT DISTINCT s.*, u.name AS artist_name, u.profile_picture AS artist_picture, g.name AS genre_name, al.title AS album_title,
               rp.played_at,
               EXISTS(SELECT 1 FROM favorites f WHERE f.song_id = s.song_id AND f.user_id = ?) AS is_favorite
        FROM recently_played rp
        JOIN songs s ON rp.song_id = s.song_id
        JOIN artists a ON s.artist_id = a.artist_id
        JOIN users u ON a.user_id = u.user_id
        LEFT JOIN genres g ON s.genre_id = g.genre_id
        LEFT JOIN albums al ON s.album_id = al.album_id
        WHERE rp.user_id = ?
        ORDER BY rp.played_at DESC
        LIMIT 30";

$stmt = $pdo->prepare($sql);
$stmt->execute([$user['user_id'], $user['user_id']]);
$recent = $stmt->fetchAll();

sendResponse(true, "Recently played songs retrieved", $recent);
