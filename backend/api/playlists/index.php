<?php
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendResponse(true, "OK");
}

$user = authenticateUser();
$pdo = getDbConnection();

$playlistId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($playlistId > 0) {
    // Single playlist details with songs
    $stmt = $pdo->prepare("SELECT * FROM playlists WHERE playlist_id = ? AND user_id = ?");
    $stmt->execute([$playlistId, $user['user_id']]);
    $playlist = $stmt->fetch();

    if (!$playlist) {
        sendResponse(false, "Playlist not found or access denied", null, 404);
    }

    $stmtSongs = $pdo->prepare("SELECT s.*, u.name AS artist_name, ps.added_at,
                                       EXISTS(SELECT 1 FROM favorites f WHERE f.song_id = s.song_id AND f.user_id = ?) AS is_favorite
                                FROM playlist_songs ps
                                JOIN songs s ON ps.song_id = s.song_id
                                JOIN artists a ON s.artist_id = a.artist_id
                                JOIN users u ON a.user_id = u.user_id
                                WHERE ps.playlist_id = ?
                                ORDER BY ps.added_at DESC");
    $stmtSongs->execute([$user['user_id'], $playlistId]);
    $playlist['songs'] = $stmtSongs->fetchAll();

    sendResponse(true, "Playlist details retrieved", $playlist);
}

// User playlists summary
$stmt = $pdo->prepare("SELECT p.*, COUNT(ps.song_id) AS total_songs 
                       FROM playlists p 
                       LEFT JOIN playlist_songs ps ON p.playlist_id = ps.playlist_id 
                       WHERE p.user_id = ? 
                       GROUP BY p.playlist_id 
                       ORDER BY p.updated_at DESC");
$stmt->execute([$user['user_id']]);
$playlists = $stmt->fetchAll();

sendResponse(true, "Playlists retrieved", $playlists);
