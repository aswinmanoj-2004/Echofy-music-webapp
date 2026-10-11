<?php
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendResponse(true, "OK");
}

$pdo = getDbConnection();
$limit = isset($_GET['limit']) ? max(1, min(100, (int)$_GET['limit'])) : 20;

$sql = "SELECT a.artist_id, a.user_id, u.name AS artist_name, u.profile_picture, a.biography, a.total_plays, COUNT(s.song_id) AS total_songs
        FROM artists a
        JOIN users u ON a.user_id = u.user_id
        LEFT JOIN songs s ON a.artist_id = s.artist_id
        GROUP BY a.artist_id
        ORDER BY a.total_plays DESC, a.created_at DESC
        LIMIT {$limit}";

$stmt = $pdo->query($sql);
$artists = $stmt->fetchAll();

sendResponse(true, "Popular artists retrieved", $artists);
