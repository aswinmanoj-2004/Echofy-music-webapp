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

$name = isset($input['name']) ? trim($input['name']) : '';

if (empty($name)) {
    sendResponse(false, "Playlist name is required", null, 400);
}

$pdo = getDbConnection();
$stmt = $pdo->prepare("INSERT INTO playlists (user_id, name) VALUES (?, ?)");
$stmt->execute([$user['user_id'], $name]);
$playlistId = $pdo->lastInsertId();

sendResponse(true, "Playlist created successfully", [
    'playlist_id' => (int)$playlistId,
    'name' => $name,
    'total_songs' => 0
], 201);
