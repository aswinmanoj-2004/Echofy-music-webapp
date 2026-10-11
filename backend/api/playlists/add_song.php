<?php
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendResponse(true, "OK");
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, "Method not allowed", null, 405);
}

$user = authenticateUser();
$input = getJsonInput();

$playlistId = isset($input['playlist_id']) ? (int)$input['playlist_id'] : 0;
$songId     = isset($input['song_id']) ? (int)$input['song_id'] : 0;

if ($playlistId <= 0 || $songId <= 0) {
    sendResponse(false, "Valid playlist ID and song ID are required", null, 400);
}

$pdo = getDbConnection();

// Check playlist ownership
$stmtCheck = $pdo->prepare("SELECT user_id FROM playlists WHERE playlist_id = ?");
$stmtCheck->execute([$playlistId]);
$playlist = $stmtCheck->fetch();

if (!$playlist || $playlist['user_id'] != $user['user_id']) {
    sendResponse(false, "Playlist not found or permission denied", null, 403);
}

// Add song to playlist (ignore if already added)
$stmtAdd = $pdo->prepare("INSERT IGNORE INTO playlist_songs (playlist_id, song_id) VALUES (?, ?)");
$stmtAdd->execute([$playlistId, $songId]);

sendResponse(true, "Song added to playlist successfully");
