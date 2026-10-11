<?php
require_once __DIR__ . '/../config/database.php';
$pdo = getDbConnection();
$stmt = $pdo->query('SELECT song_id, title, artist_id FROM songs');
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_PRETTY_PRINT);
