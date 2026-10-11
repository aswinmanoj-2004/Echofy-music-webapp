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

$user = authenticateUser('artist');
$pdo = getDbConnection();

$stmtArtist = $pdo->prepare("SELECT artist_id FROM artists WHERE user_id = ?");
$stmtArtist->execute([$user['user_id']]);
$artist = $stmtArtist->fetch();

if (!$artist) {
    sendResponse(false, "Artist profile not found", null, 404);
}

$title       = isset($_POST['title']) ? trim($_POST['title']) : '';
$releaseDate = isset($_POST['release_date']) ? trim($_POST['release_date']) : date('Y-m-d');

if (empty($title)) {
    sendResponse(false, "Album title is required", null, 400);
}

$relativeCoverPath = null;
if (isset($_FILES['cover_image']) && $_FILES['cover_image']['error'] === UPLOAD_ERR_OK) {
    $targetCoversDir = __DIR__ . '/../../uploads/covers/';
    if (!file_exists($targetCoversDir)) {
        mkdir($targetCoversDir, 0777, true);
    }
    $coverFile = $_FILES['cover_image'];
    $coverExt = strtolower(pathinfo($coverFile['name'], PATHINFO_EXTENSION));
    $coverFilename = 'album_' . time() . '_' . uniqid() . '.' . $coverExt;
    if (move_uploaded_file($coverFile['tmp_name'], $targetCoversDir . $coverFilename)) {
        $relativeCoverPath = '/backend/uploads/covers/' . $coverFilename;
    }
}

$stmt = $pdo->prepare("INSERT INTO albums (artist_id, title, cover_image, release_date) VALUES (?, ?, ?, ?)");
$stmt->execute([$artist['artist_id'], $title, $relativeCoverPath, $releaseDate]);
$albumId = $pdo->lastInsertId();

sendResponse(true, "Album created successfully", [
    'album_id' => (int)$albumId,
    'title' => $title,
    'cover_image' => $relativeCoverPath
], 201);
