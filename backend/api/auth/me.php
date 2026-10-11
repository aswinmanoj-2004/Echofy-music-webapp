<?php
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendResponse(true, "OK");
}

$user = authenticateUser();

$pdo = getDbConnection();
$stmt = $pdo->prepare("SELECT u.user_id, u.name, u.email, u.profile_picture, u.role, u.theme, a.artist_id, a.biography 
                       FROM users u 
                       LEFT JOIN artists a ON u.user_id = a.user_id 
                       WHERE u.user_id = ?");
$stmt->execute([$user['user_id']]);
$userFull = $stmt->fetch();

sendResponse(true, "User session fetched", [
    'user' => [
        'user_id'         => (int)$userFull['user_id'],
        'name'            => $userFull['name'],
        'email'           => $userFull['email'],
        'role'            => $userFull['role'],
        'artist_id'       => $userFull['artist_id'] ? (int)$userFull['artist_id'] : null,
        'biography'       => $userFull['biography'],
        'profile_picture' => $userFull['profile_picture'],
        'theme'           => $userFull['theme']
    ]
]);
