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

$user = authenticateUser('artist');
$input = getJsonInput();

$songId = isset($_GET['id']) ? (int)$_GET['id'] : (isset($input['song_id']) ? (int)$input['song_id'] : 0);

if ($songId <= 0) {
    sendResponse(false, "Valid song ID required", null, 400);
}

$pdo = getDbConnection();

$stmtCheck = $pdo->prepare("SELECT s.song_id, s.file_path, s.cover_image, a.user_id 
                            FROM songs s 
                            JOIN artists a ON s.artist_id = a.artist_id 
                            WHERE s.song_id = ?");
$stmtCheck->execute([$songId]);
$song = $stmtCheck->fetch();

if (!$song) {
    sendResponse(false, "Song not found", null, 404);
}

if ($song['user_id'] != $user['user_id'] && $user['role'] !== 'admin') {
    sendResponse(false, "Unauthorized to delete this song", null, 403);
}

// Delete file assets if exist
if ($song['file_path'] && file_exists(__DIR__ . '/../../..' . $song['file_path'])) {
    @unlink(__DIR__ . '/../../..' . $song['file_path']);
}
if ($song['cover_image'] && file_exists(__DIR__ . '/../../..' . $song['cover_image'])) {
    @unlink(__DIR__ . '/../../..' . $song['cover_image']);
}

$stmtDel = $pdo->prepare("DELETE FROM songs WHERE song_id = ?");
$stmtDel->execute([$songId]);

sendResponse(true, "Song deleted successfully");
