<?php
// Suppress non-critical warnings to keep JSON response clean
error_reporting(E_ERROR | E_PARSE);

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendResponse(true, "OK");
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, "Method not allowed", null, 405);
}

$songId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($songId <= 0) {
    sendResponse(false, "Valid song ID is required", null, 400);
}

// Optional user auth to check favorite status
$userId = 0;
$optionalUser = getOptionalUser();
if ($optionalUser) {
    $userId = (int)$optionalUser['user_id'];
}

$pdo = getDbConnection();

$stmt = $pdo->prepare("SELECT s.*, 
                              COALESCE(a.name, 'Unknown Artist') as artist_name, 
                              alb.title as album_title, 
                              g.name as genre_name,
                              (SELECT COUNT(*) FROM favorites f WHERE f.song_id = s.song_id AND f.user_id = ?) as is_favorite
                       FROM songs s
                       LEFT JOIN artists art ON s.artist_id = art.artist_id
                       LEFT JOIN users a ON art.user_id = a.user_id
                       LEFT JOIN albums alb ON s.album_id = alb.album_id
                       LEFT JOIN genres g ON s.genre_id = g.genre_id
                       WHERE s.song_id = ?");
$stmt->execute([$userId, $songId]);
$song = $stmt->fetch();

if (!$song) {
    sendResponse(false, "Song not found", null, 404);
}

$songData = [
    'song_id'     => (int)$song['song_id'],
    'artist_id'   => (int)$song['artist_id'],
    'album_id'    => $song['album_id'] ? (int)$song['album_id'] : null,
    'genre_id'    => $song['genre_id'] ? (int)$song['genre_id'] : null,
    'title'       => $song['title'],
    'artist_name' => $song['artist_name'] ?? 'Unknown Artist',
    'album_title' => $song['album_title'],
    'genre_name'  => $song['genre_name'],
    'file_path'   => $song['file_path'],
    'cover_image' => $song['cover_image'],
    'duration'    => (int)$song['duration'],
    'play_count'  => (int)$song['play_count'],
    'is_favorite' => (bool)$song['is_favorite'],
    'uploaded_at' => $song['uploaded_at'] ?? null
];

sendResponse(true, "Song details fetched", $songData);
