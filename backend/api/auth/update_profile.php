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
$name  = isset($input['name']) ? trim($input['name']) : '';
$email = isset($input['email']) ? trim(strtolower($input['email'])) : '';

if (empty($name)) {
    sendResponse(false, "Name is required", null, 400);
}

if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse(false, "Invalid email format", null, 400);
}

// Check if email is already taken by another user
if (!empty($email) && $email !== $user['email']) {
    $stmt = $pdo->prepare("SELECT user_id FROM users WHERE email = ? AND user_id != ?");
    $stmt->execute([$email, $user['user_id']]);
    if ($stmt->fetch()) {
        sendResponse(false, "This email is already in use", null, 400);
    }
}

$fields = [];
$values = [];

if (!empty($name) && $name !== $user['name']) {
    $fields[] = "name = ?";
    $values[] = $name;
}

if (!empty($email) && $email !== $user['email']) {
    $fields[] = "email = ?";
    $values[] = $email;
}

if (empty($fields)) {
    sendResponse(true, "No changes to update", ['user' => $user]);
}

$values[] = $user['user_id'];
$sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE user_id = ?";

$stmt = $pdo->prepare($sql);
$stmt->execute($values);

// Fetch updated user
$stmt = $pdo->prepare("SELECT user_id, name, email, profile_picture, role, theme FROM users WHERE user_id = ?");
$stmt->execute([$user['user_id']]);
$updatedUser = $stmt->fetch();

sendResponse(true, "Profile updated successfully", [
    'user' => [
        'user_id'         => (int)$updatedUser['user_id'],
        'name'            => $updatedUser['name'],
        'email'           => $updatedUser['email'],
        'role'            => $updatedUser['role'],
        'profile_picture' => $updatedUser['profile_picture'],
        'theme'           => $updatedUser['theme']
    ]
]);
