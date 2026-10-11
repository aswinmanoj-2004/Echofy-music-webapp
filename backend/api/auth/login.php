<?php
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../helpers/mailer.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendResponse(true, "OK");
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, "Method not allowed", null, 405);
}

$input = getJsonInput();
$email    = isset($input['email']) ? trim(strtolower($input['email'])) : '';
$password = isset($input['password']) ? trim($input['password']) : '';
$role     = isset($input['role']) && in_array($input['role'], ['listener', 'artist']) ? $input['role'] : null;
$code     = isset($input['code']) ? trim($input['code']) : '';

if (empty($email) || empty($password)) {
    sendResponse(false, "Email and password are required", null, 400);
}

$pdo = getDbConnection();

$stmt = $pdo->prepare("SELECT u.*, a.artist_id 
                       FROM users u 
                       LEFT JOIN artists a ON u.user_id = a.user_id 
                       WHERE u.email = ? AND u.is_active = 1");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    sendResponse(false, "Invalid email or password", null, 401);
}

// Role separation enforcement
if ($role === 'artist' && $user['role'] !== 'artist' && $user['role'] !== 'admin') {
    sendResponse(false, "This email belongs to a Listener account. Please use the Listener Login portal.", null, 403);
}

if ($role === 'listener' && $user['role'] === 'artist') {
    sendResponse(false, "This email belongs to an Artist account. Please use the Artist Studio Login portal.", null, 403);
}

// Direct Authentication (No OTP required for login)
$userData = [
    'user_id'         => (int)$user['user_id'],
    'name'            => $user['name'],
    'email'           => $user['email'],
    'role'            => $user['role'],
    'artist_id'       => $user['artist_id'] ? (int)$user['artist_id'] : null,
    'profile_picture' => $user['profile_picture'],
    'theme'           => $user['theme']
];

$token = generateAuthToken($userData);

sendResponse(true, "Login successful", [
    'token' => $token,
    'user'  => $userData
]);
