<?php
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendResponse(true, "OK");
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, "Method not allowed", null, 405);
}

$input = getJsonInput();

$email = isset($input['email']) ? trim(strtolower($input['email'])) : '';
$code  = isset($input['code']) ? trim($input['code']) : '';
$type  = isset($input['type']) ? trim($input['type']) : 'register';

if (empty($email) || empty($code)) {
    sendResponse(false, "Email address and 6-digit verification code are required", null, 400);
}

if (strlen($code) !== 6) {
    sendResponse(false, "Verification code must be 6 digits", null, 400);
}

$pdo = getDbConnection();

// Look up matching verification code
$stmt = $pdo->prepare("SELECT id, expires_at FROM email_verifications 
                       WHERE email = ? AND code = ? AND type = ? AND is_verified = 0 
                       ORDER BY id DESC LIMIT 1");
$stmt->execute([$email, $code, $type]);
$verification = $stmt->fetch();

if (!$verification) {
    sendResponse(false, "Invalid verification code. Please check your email or request a new code.", null, 400);
}

if (strtotime($verification['expires_at']) < time()) {
    sendResponse(false, "Verification code has expired. Please click resend code.", null, 400);
}

// Mark as verified in real-time
$stmtMark = $pdo->prepare("UPDATE email_verifications SET is_verified = 1 WHERE id = ?");
$stmtMark->execute([$verification['id']]);

sendResponse(true, "Email verified successfully!", [
    'email' => $email,
    'verified' => true
]);
