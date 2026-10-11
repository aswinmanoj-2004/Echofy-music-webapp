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

$playlistId = isset($_GET['id']) ? (int)$_GET['id'] : (isset($input['playlist_id']) ? (int)$input['playlist_id'] : 0);

if ($playlistId <= 0) {
    sendResponse(false, "Valid playlist ID required", null, 400);
}

$pdo = getDbConnection();

$stmtCheck = $pdo->prepare("SELECT user_id FROM playlists WHERE playlist_id = ?");
$stmtCheck->execute([$playlistId]);
$playlist = $stmtCheck->fetch();

if (!$playlist || $playlist['user_id'] != $user['user_id']) {
    sendResponse(false, "Playlist not found or permission denied", null, 403);
}

$stmtDel = $pdo->prepare("DELETE FROM playlists WHERE playlist_id = ?");
$stmtDel->execute([$playlistId]);

sendResponse(true, "Playlist deleted successfully");
