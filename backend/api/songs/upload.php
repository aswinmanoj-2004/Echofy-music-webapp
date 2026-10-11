<?php
@ini_set('upload_max_filesize', '100M');
@ini_set('post_max_size', '100M');
@ini_set('max_execution_time', '300');

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendResponse(true, "OK");
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, "Method not allowed", null, 405);
}

// Ensure user is logged in as artist or admin
$user = authenticateUser('artist');
$pdo = getDbConnection();

// Get artist_id for this user
$stmtArtist = $pdo->prepare("SELECT artist_id FROM artists WHERE user_id = ?");
$stmtArtist->execute([$user['user_id']]);
$artist = $stmtArtist->fetch();

if (!$artist) {
    $stmtCreateArtist = $pdo->prepare("INSERT INTO artists (user_id) VALUES (?)");
    $stmtCreateArtist->execute([$user['user_id']]);
    $artistId = $pdo->lastInsertId();
} else {
    $artistId = $artist['artist_id'];
}

$title       = isset($_POST['title']) ? trim($_POST['title']) : '';
$genreId     = isset($_POST['genre_id']) && (int)$_POST['genre_id'] > 0 ? (int)$_POST['genre_id'] : null;
$albumId     = isset($_POST['album_id']) && (int)$_POST['album_id'] > 0 ? (int)$_POST['album_id'] : null;
$duration    = isset($_POST['duration']) ? (int)$_POST['duration'] : 210;

if (empty($title)) {
    sendResponse(false, "Song title is required", null, 400);
}

$relativeSongPath = null;
$relativeCoverPath = null;

// File upload is required
if (!isset($_FILES['song_file']) || $_FILES['song_file']['error'] === UPLOAD_ERR_NO_FILE) {
    sendResponse(false, "Please select an audio file to upload", null, 400);
}

$uploadErr = $_FILES['song_file']['error'];
if ($uploadErr !== UPLOAD_ERR_OK) {
    switch ($uploadErr) {
        case UPLOAD_ERR_INI_SIZE:
        case UPLOAD_ERR_FORM_SIZE:
            sendResponse(false, "Audio file is too large. Maximum allowed file size is 100MB.", null, 400);
            break;
        case UPLOAD_ERR_PARTIAL:
            sendResponse(false, "Audio file was only partially uploaded. Please try again.", null, 400);
            break;
        default:
            sendResponse(false, "File upload error code: " . $uploadErr, null, 400);
            break;
    }
}

$songFile = $_FILES['song_file'];
$songExt = strtolower(pathinfo($songFile['name'], PATHINFO_EXTENSION));
$allowedAudioExts = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'];

if (!in_array($songExt, $allowedAudioExts)) {
    sendResponse(false, "Invalid audio file format. Allowed: " . implode(', ', $allowedAudioExts), null, 400);
}

$targetSongsDir  = __DIR__ . '/../../uploads/songs/';
$targetCoversDir = __DIR__ . '/../../uploads/covers/';

if (!file_exists($targetSongsDir)) mkdir($targetSongsDir, 0777, true);
if (!file_exists($targetCoversDir)) mkdir($targetCoversDir, 0777, true);

$songFilename = 'song_' . time() . '_' . uniqid() . '.' . $songExt;
$songPath = $targetSongsDir . $songFilename;

if (!move_uploaded_file($songFile['tmp_name'], $songPath)) {
    sendResponse(false, "Failed to save uploaded audio file on server", null, 500);
}

$relativeSongPath = '/backend/uploads/songs/' . $songFilename;

// Handle uploaded cover art image
if (isset($_FILES['cover_image']) && $_FILES['cover_image']['error'] === UPLOAD_ERR_OK) {
    $targetCoversDir = __DIR__ . '/../../uploads/covers/';
    if (!file_exists($targetCoversDir)) mkdir($targetCoversDir, 0777, true);

    $coverFile = $_FILES['cover_image'];
    $coverExt = strtolower(pathinfo($coverFile['name'], PATHINFO_EXTENSION));
    $allowedImgExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    
    if (in_array($coverExt, $allowedImgExts)) {
        $coverFilename = 'cover_' . time() . '_' . uniqid() . '.' . $coverExt;
        $coverPath = $targetCoversDir . $coverFilename;
        if (move_uploaded_file($coverFile['tmp_name'], $coverPath)) {
            $relativeCoverPath = '/backend/uploads/covers/' . $coverFilename;
        }
    }
}

// Insert into DB
$stmt = $pdo->prepare("INSERT INTO songs (artist_id, album_id, genre_id, title, file_path, cover_image, duration) 
                       VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->execute([$artistId, $albumId, $genreId, $title, $relativeSongPath, $relativeCoverPath, $duration]);
$newSongId = $pdo->lastInsertId();

sendResponse(true, "Song published successfully", [
    'song_id' => (int)$newSongId,
    'title' => $title,
    'file_path' => $relativeSongPath,
    'cover_image' => $relativeCoverPath
], 201);
