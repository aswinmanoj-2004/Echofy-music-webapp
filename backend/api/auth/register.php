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

$input = getJsonInput();

$name     = isset($input['name']) ? trim($input['name']) : '';
$email    = isset($input['email']) ? trim(strtolower($input['email'])) : '';
$password = isset($input['password']) ? trim($input['password']) : '';
$role     = isset($input['role']) && in_array($input['role'], ['listener', 'artist']) ? $input['role'] : 'listener';
$code     = isset($input['code']) ? trim($input['code']) : '';
$biography = isset($input['biography']) ? trim($input['biography']) : "Artist profile for " . $name;

if (empty($name) || empty($email) || empty($password)) {
    sendResponse(false, "Name, email, and password are required fields", null, 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse(false, "Invalid email format", null, 400);
}

if (strlen($password) < 6) {
    sendResponse(false, "Password must be at least 6 characters long", null, 400);
}

$pdo = getDbConnection();

// Check if email already exists
$stmtUser = $pdo->prepare("SELECT user_id FROM users WHERE email = ?");
$stmtUser->execute([$email]);
if ($stmtUser->fetch()) {
    sendResponse(false, "An account with this email address already exists", null, 400);
}

// Check if email has been verified via real-time OTP
$stmtVerified = $pdo->prepare("SELECT id FROM email_verifications 
                              WHERE email = ? AND type = 'register' AND is_verified = 1 
                              ORDER BY id DESC LIMIT 1");
$stmtVerified->execute([$email]);
$verifiedRecord = $stmtVerified->fetch();

if (!$verifiedRecord && !empty($code)) {
    // If not yet verified in real-time, verify using provided code
    $stmtOtp = $pdo->prepare("SELECT id, expires_at FROM email_verifications 
                              WHERE email = ? AND code = ? AND type = 'register' 
                              ORDER BY id DESC LIMIT 1");
    $stmtOtp->execute([$email, $code]);
    $verification = $stmtOtp->fetch();

    if (!$verification) {
        sendResponse(false, "Please verify your email address using the verification code before registering.", null, 400);
    }

    if (strtotime($verification['expires_at']) < time()) {
        sendResponse(false, "Verification code has expired. Please request a new code.", null, 400);
    }
} else if (!$verifiedRecord) {
    sendResponse(false, "Please complete email verification before creating an account.", null, 400);
}

$passwordHash = password_hash($password, PASSWORD_BCRYPT);

try {
    $pdo->beginTransaction();

    // Insert new user
    $stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)");
    $stmt->execute([$name, $email, $passwordHash, $role]);
    $userId = $pdo->lastInsertId();

    $artistId = null;
    if ($role === 'artist') {
        $stmtArtist = $pdo->prepare("INSERT INTO artists (user_id, biography) VALUES (?, ?)");
        $stmtArtist->execute([$userId, $biography]);
        $artistId = $pdo->lastInsertId();
    }

    $pdo->commit();

    $user = [
        'user_id' => (int)$userId,
        'name' => $name,
        'email' => $email,
        'role' => $role,
        'artist_id' => $artistId ? (int)$artistId : null,
        'profile_picture' => null,
        'theme' => 'dark'
    ];

    $token = generateAuthToken($user);

    sendResponse(true, "Registration successful", [
        'token' => $token,
        'user'  => $user
    ], 201);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    sendResponse(false, "Registration failed: " . $e->getMessage(), null, 500);
}
