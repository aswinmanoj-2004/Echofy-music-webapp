<?php
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendResponse(true, "OK");
}

$pdo = getDbConnection();
$currentUser = getOptionalUser();

$search    = isset($_GET['search']) ? trim($_GET['search']) : '';
$genreId   = isset($_GET['genre_id']) ? (int)$_GET['genre_id'] : 0;
$artistId  = isset($_GET['artist_id']) ? (int)$_GET['artist_id'] : 0;
$albumId   = isset($_GET['album_id']) ? (int)$_GET['album_id'] : 0;
$trending  = isset($_GET['trending']) && $_GET['trending'] == '1';
$latest    = isset($_GET['latest']) && $_GET['latest'] == '1';
$limit     = isset($_GET['limit']) ? max(1, min(100, (int)$_GET['limit'])) : 50;

$whereClause = ["1=1"];
$params = [];

if ($search !== '') {
    $whereClause[] = "(s.title LIKE ? OR u.name LIKE ? OR al.title LIKE ?)";
    $searchTerm = "%" . $search . "%";
    $params[] = $searchTerm;
    $params[] = $searchTerm;
    $params[] = $searchTerm;
}

if ($genreId > 0) {
    $whereClause[] = "s.genre_id = ?";
    $params[] = $genreId;
}

if ($artistId > 0) {
    $whereClause[] = "s.artist_id = ?";
    $params[] = $artistId;
}

if ($albumId > 0) {
    $whereClause[] = "s.album_id = ?";
    $params[] = $albumId;
}

if ($trending) {
    $whereClause[] = "s.is_trending = 1";
}

$orderBy = "s.uploaded_at DESC";
if ($trending) {
    $orderBy = "s.play_count DESC, s.uploaded_at DESC";
} else if ($latest) {
    $orderBy = "s.uploaded_at DESC";
}

$currentUserId = $currentUser ? $currentUser['user_id'] : 0;

$sql = "SELECT s.*, 
               u.name AS artist_name, 
               u.profile_picture AS artist_picture,
               g.name AS genre_name, 
               al.title AS album_title,
               EXISTS(SELECT 1 FROM favorites f WHERE f.song_id = s.song_id AND f.user_id = {$currentUserId}) AS is_favorite
        FROM songs s
        JOIN artists a ON s.artist_id = a.artist_id
        JOIN users u ON a.user_id = u.user_id
        LEFT JOIN genres g ON s.genre_id = g.genre_id
        LEFT JOIN albums al ON s.album_id = al.album_id
        WHERE " . implode(" AND ", $whereClause) . "
        ORDER BY {$orderBy}
        LIMIT {$limit}";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$songs = $stmt->fetchAll();

// Format response data types
foreach ($songs as &$song) {
    $song['song_id']     = (int)$song['song_id'];
    $song['artist_id']   = (int)$song['artist_id'];
    $song['album_id']    = $song['album_id'] ? (int)$song['album_id'] : null;
    $song['genre_id']    = $song['genre_id'] ? (int)$song['genre_id'] : null;
    $song['duration']    = (int)$song['duration'];
    $song['play_count']  = (int)$song['play_count'];
    $song['like_count']  = (int)$song['like_count'];
    $song['is_trending'] = (bool)$song['is_trending'];
    $song['is_favorite'] = (bool)$song['is_favorite'];
}

sendResponse(true, "Songs retrieved", $songs);
