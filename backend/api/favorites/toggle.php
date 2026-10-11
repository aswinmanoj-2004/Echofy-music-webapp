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

// Check if currently favorited
$stmt = $pdo->prepare("SELECT favorite_id FROM favorites WHERE user_id = ? AND song_id = ?");
$stmt->execute([$user['user_id'], $songId]);
$existing = $stmt->fetch();

if ($existing) {
    // Remove favorite
    $stmtDel = $pdo->prepare("DELETE FROM favorites WHERE favorite_id = ?");
    $stmtDel->execute([$existing['favorite_id']]);

    // Decrement song like count
    $stmtDec = $pdo->prepare("UPDATE songs SET like_count = GREATEST(0, like_count - 1) WHERE song_id = ?");
    $stmtDec->execute([$songId]);

    sendResponse(true, "Removed from favorites", ['is_favorite' => false]);
} else {
    // Add favorite
    $stmtAdd = $pdo->prepare("INSERT INTO favorites (user_id, song_id) VALUES (?, ?)");
    $stmtAdd->execute([$user['user_id'], $songId]);

    // Increment song like count
    $stmtInc = $pdo->prepare("UPDATE songs SET like_count = like_count + 1 WHERE song_id = ?");
    $stmtInc->execute([$songId]);

    sendResponse(true, "Added to favorites", ['is_favorite' => true]);
}
