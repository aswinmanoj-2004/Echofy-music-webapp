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

$songId = isset($input['song_id']) ? (int)$input['song_id'] : 0;

if ($songId <= 0) {
    sendResponse(false, "Valid song ID required", null, 400);
}

$pdo = getDbConnection();

// Record history entry
$stmt = $pdo->prepare("INSERT INTO recently_played (user_id, song_id) VALUES (?, ?)");
$stmt->execute([$user['user_id'], $songId]);

sendResponse(true, "Added to recently played");
