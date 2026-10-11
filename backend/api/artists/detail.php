<?php
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendResponse(true, "OK");
}

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id <= 0) {
    sendResponse(false, "Invalid artist ID", null, 400);
}

$pdo = getDbConnection();
$currentUser = getOptionalUser();
$currentUserId = $currentUser ? $currentUser['user_id'] : 0;

$stmt = $pdo->prepare("SELECT a.artist_id, a.user_id, u.name AS artist_name, u.profile_picture, a.biography, a.total_plays 
                       FROM artists a 
                       JOIN users u ON a.user_id = u.user_id 
                       WHERE a.artist_id = ?");
$stmt->execute([$id]);
$artist = $stmt->fetch();

if (!$artist) {
    sendResponse(false, "Artist profile not found", null, 404);
}

// Fetch artist's songs
$stmtSongs = $pdo->prepare("SELECT s.*, u.name AS artist_name, al.title AS album_title, g.name AS genre_name,
                                   EXISTS(SELECT 1 FROM favorites f WHERE f.song_id = s.song_id AND f.user_id = {$currentUserId}) AS is_favorite
                            FROM songs s 
                            JOIN artists a ON s.artist_id = a.artist_id 
                            JOIN users u ON a.user_id = u.user_id 
                            LEFT JOIN albums al ON s.album_id = al.album_id 
                            LEFT JOIN genres g ON s.genre_id = g.genre_id 
                            WHERE s.artist_id = ? 
                            ORDER BY s.uploaded_at DESC");
$stmtSongs->execute([$id]);
$artist['songs'] = $stmtSongs->fetchAll();

// Fetch artist's albums
$stmtAlbums = $pdo->prepare("SELECT al.*, COUNT(s.song_id) AS total_songs 
                             FROM albums al 
                             LEFT JOIN songs s ON al.album_id = s.album_id 
                             WHERE al.artist_id = ? 
                             GROUP BY al.album_id 
                             ORDER BY al.release_date DESC");
$stmtAlbums->execute([$id]);
$artist['albums'] = $stmtAlbums->fetchAll();

sendResponse(true, "Artist details retrieved", $artist);
