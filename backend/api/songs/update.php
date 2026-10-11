<?php
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendResponse(true, "OK");
}

if (!in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT'])) {
    sendResponse(false, "Method not allowed", null, 405);
}

$user = authenticateUser('artist');
$input = getJsonInput();

$songId    = isset($input['song_id']) ? (int)$input['song_id'] : 0;
$title     = isset($input['title']) ? trim($input['title']) : '';
$genreId   = isset($input['genre_id']) ? (int)$input['genre_id'] : null;
$albumId   = isset($input['album_id']) ? (int)$input['album_id'] : null;
$isTrending = isset($input['is_trending']) ? ((int)$input['is_trending'] ? 1 : 0) : null;

if ($songId <= 0 || empty($title)) {
    sendResponse(false, "Valid song ID and title are required", null, 400);
}

$pdo = getDbConnection();

// Check ownership
$stmtCheck = $pdo->prepare("SELECT s.song_id, a.user_id FROM songs s JOIN artists a ON s.artist_id = a.artist_id WHERE s.song_id = ?");
$stmtCheck->execute([$songId]);
$song = $stmtCheck->fetch();

if (!$song) {
    sendResponse(false, "Song not found", null, 404);
}

if ($song['user_id'] != $user['user_id'] && $user['role'] !== 'admin') {
    sendResponse(false, "Unauthorized to update this song", null, 403);
}

$updates = ["title = ?"];
$params = [$title];

if ($genreId !== null) {
    $updates[] = "genre_id = ?";
    $params[] = $genreId > 0 ? $genreId : null;
}

if ($albumId !== null) {
    $updates[] = "album_id = ?";
    $params[] = $albumId > 0 ? $albumId : null;
}

if ($isTrending !== null) {
    $updates[] = "is_trending = ?";
    $params[] = $isTrending;
}

$params[] = $songId;

$stmt = $pdo->prepare("UPDATE songs SET " . implode(", ", $updates) . " WHERE song_id = ?");
$stmt->execute($params);

sendResponse(true, "Song updated successfully");
