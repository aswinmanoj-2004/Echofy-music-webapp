<?php
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendResponse(true, "OK");
}

$query = isset($_GET['q']) ? trim($_GET['q']) : '';

if (empty($query)) {
    sendResponse(true, "Empty query", ['songs' => [], 'artists' => [], 'albums' => []]);
}

$pdo = getDbConnection();
$currentUser = getOptionalUser();
$currentUserId = $currentUser ? $currentUser['user_id'] : 0;
$param = "%" . $query . "%";

// 1. Search Songs
$stmtSongs = $pdo->prepare("SELECT s.*, u.name AS artist_name, al.title AS album_title, g.name AS genre_name,
                                   EXISTS(SELECT 1 FROM favorites f WHERE f.song_id = s.song_id AND f.user_id = {$currentUserId}) AS is_favorite
                            FROM songs s
                            JOIN artists a ON s.artist_id = a.artist_id
                            JOIN users u ON a.user_id = u.user_id
                            LEFT JOIN albums al ON s.album_id = al.album_id
                            LEFT JOIN genres g ON s.genre_id = g.genre_id
                            WHERE s.title LIKE ? OR u.name LIKE ? OR al.title LIKE ? OR g.name LIKE ?
                            ORDER BY s.play_count DESC
                            LIMIT 20");
$stmtSongs->execute([$param, $param, $param, $param]);
$songs = $stmtSongs->fetchAll();

// 2. Search Artists
$stmtArtists = $pdo->prepare("SELECT a.artist_id, u.name AS artist_name, u.profile_picture, a.total_plays 
                              FROM artists a 
                              JOIN users u ON a.user_id = u.user_id 
                              WHERE u.name LIKE ? OR a.biography LIKE ? 
                              LIMIT 10");
$stmtArtists->execute([$param, $param]);
$artists = $stmtArtists->fetchAll();

// 3. Search Albums
$stmtAlbums = $pdo->prepare("SELECT al.*, u.name AS artist_name 
                             FROM albums al 
                             JOIN artists a ON al.artist_id = a.artist_id 
                             JOIN users u ON a.user_id = u.user_id 
                             WHERE al.title LIKE ? 
                             LIMIT 10");
$stmtAlbums->execute([$param]);
$albums = $stmtAlbums->fetchAll();

sendResponse(true, "Search results fetched", [
    'songs' => $songs,
    'artists' => $artists,
    'albums' => $albums
]);
