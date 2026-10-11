<?php
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/mailer.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendResponse(true, "OK");
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, "Method not allowed", null, 405);
}

$input = getJsonInput();
$email = isset($input['email']) ? trim(strtolower($input['email'])) : '';
$type  = isset($input['type']) && in_array($input['type'], ['register', 'login']) ? $input['type'] : 'register';
$role  = isset($input['role']) && in_array($input['role'], ['listener', 'artist']) ? $input['role'] : 'listener';

if (empty($email)) {
    sendResponse(false, "Email address is required", null, 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse(false, "Invalid email format", null, 400);
}

$pdo = getDbConnection();

if ($type === 'register') {
    // Check if user already exists
    $stmt = $pdo->prepare("SELECT user_id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        sendResponse(false, "An account with this email address already exists. Please log in instead.", null, 400);
    }
} else if ($type === 'login') {
    // Check if user exists for login
    $stmt = $pdo->prepare("SELECT user_id, role, is_active FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || (int)$user['is_active'] !== 1) {
        sendResponse(false, "No active account found with this email address.", null, 404);
    }

    if ($role === 'artist' && $user['role'] !== 'artist' && $user['role'] !== 'admin') {
        sendResponse(false, "This email is registered as a Listener account. Please use Listener Login.", null, 403);
    }
}

// Generate 6-digit verification code
$code = str_pad((string)mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);

try {
    // Clear old codes for this email and type
    $stmtDel = $pdo->prepare("DELETE FROM email_verifications WHERE email = ? AND type = ?");
    $stmtDel->execute([$email, $type]);

    // Insert new verification record valid for 10 minutes
    $stmtIns = $pdo->prepare("INSERT INTO email_verifications (email, code, type, is_verified, expires_at) 
                             VALUES (?, ?, ?, 0, DATE_ADD(NOW(), INTERVAL 10 MINUTE))");
    $stmtIns->execute([$email, $code, $type]);

    // Dispatch verification email
    sendVerificationEmail($email, $code, $type, $role);

    sendResponse(true, "Verification code sent to {$email}", [
        'email' => $email,
        'type'  => $type,
        'debug_code' => $code // Provided for easy local testing
    ]);
} catch (Exception $e) {
    sendResponse(false, "Failed to send verification code: " . $e->getMessage(), null, 500);
}
