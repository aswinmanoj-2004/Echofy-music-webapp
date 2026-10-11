<?php
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendResponse(true, "OK");
}

$pdo = getDbConnection();
$stmt = $pdo->query("SELECT genre_id, name FROM genres ORDER BY name ASC");
$genres = $stmt->fetchAll();

sendResponse(true, "Genres retrieved", $genres);
