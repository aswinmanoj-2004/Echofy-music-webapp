<?php
error_reporting(E_ERROR | E_PARSE);
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendResponse(true, "OK");
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, "Method not allowed", null, 405);
}

$user = authenticateUser();
$pdo = getDbConnection();

$input = getJsonInput();
$currentPassword = isset($input['current_password']) ? trim($input['current_password']) : '';
$newPassword     = isset($input['new_password']) ? trim($input['new_password']) : '';

if (empty($currentPassword) || empty($newPassword)) {
    sendResponse(false, "Current password and new password are required", null, 400);
}

if (strlen($newPassword) < 6) {
    sendResponse(false, "New password must be at least 6 characters long", null, 400);
}

// Verify current password
$stmt = $pdo->prepare("SELECT password_hash FROM users WHERE user_id = ?");
$stmt->execute([$user['user_id']]);
$row = $stmt->fetch();

if (!$row || !password_verify($currentPassword, $row['password_hash'])) {
    sendResponse(false, "Current password is incorrect", null, 400);
}

$newHash = password_hash($newPassword, PASSWORD_BCRYPT);
$stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE user_id = ?");
$stmt->execute([$newHash, $user['user_id']]);

sendResponse(true, "Password changed successfully");
