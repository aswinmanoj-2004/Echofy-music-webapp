<?php
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendResponse(true, "OK");
}

if (!in_array($_SERVER['REQUEST_METHOD'], ['POST', 'DELETE'])) {
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

// Check ownership
$stmtCheck = $pdo->prepare("SELECT user_id FROM playlists WHERE playlist_id = ?");
$stmtCheck->execute([$playlistId]);
$playlist = $stmtCheck->fetch();

if (!$playlist || $playlist['user_id'] != $user['user_id']) {
    sendResponse(false, "Playlist not found or permission denied", null, 403);
}

$stmtDel = $pdo->prepare("DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?");
$stmtDel->execute([$playlistId, $songId]);

sendResponse(true, "Song removed from playlist successfully");
