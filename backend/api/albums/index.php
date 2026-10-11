<?php
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendResponse(true, "OK");
}

$pdo = getDbConnection();
$artistId = isset($_GET['artist_id']) ? (int)$_GET['artist_id'] : 0;
$albumId  = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($albumId > 0) {
    // Single album detail with song list
    $stmt = $pdo->prepare("SELECT al.*, u.name AS artist_name, u.profile_picture AS artist_picture 
                           FROM albums al 
                           JOIN artists a ON al.artist_id = a.artist_id 
                           JOIN users u ON a.user_id = u.user_id 
                           WHERE al.album_id = ?");
    $stmt->execute([$albumId]);
    $album = $stmt->fetch();

    if (!$album) {
        sendResponse(false, "Album not found", null, 404);
    }

    // Fetch songs in album
    $stmtSongs = $pdo->prepare("SELECT s.*, u.name AS artist_name 
                                FROM songs s 
                                JOIN artists a ON s.artist_id = a.artist_id 
                                JOIN users u ON a.user_id = u.user_id 
                                WHERE s.album_id = ? 
                                ORDER BY s.uploaded_at ASC");
    $stmtSongs->execute([$albumId]);
    $album['songs'] = $stmtSongs->fetchAll();

    sendResponse(true, "Album details retrieved", $album);
}

$sql = "SELECT al.*, u.name AS artist_name, COUNT(s.song_id) AS total_songs 
        FROM albums al 
        JOIN artists a ON al.artist_id = a.artist_id 
        JOIN users u ON a.user_id = u.user_id 
        LEFT JOIN songs s ON al.album_id = s.album_id";

if ($artistId > 0) {
    $sql .= " WHERE al.artist_id = {$artistId}";
}

$sql .= " GROUP BY al.album_id ORDER BY al.created_at DESC";

$stmt = $pdo->query($sql);
$albums = $stmt->fetchAll();

sendResponse(true, "Albums retrieved", $albums);
