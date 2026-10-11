<?php
error_reporting(E_ERROR | E_PARSE);
@ini_set('upload_max_filesize', '10M');
@ini_set('post_max_size', '10M');

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

if (!isset($_FILES['profile_picture']) || $_FILES['profile_picture']['error'] === UPLOAD_ERR_NO_FILE) {
    sendResponse(false, "Please select an image file", null, 400);
}

$uploadErr = $_FILES['profile_picture']['error'];
if ($uploadErr !== UPLOAD_ERR_OK) {
    sendResponse(false, "File upload error", null, 400);
}

$file = $_FILES['profile_picture'];
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

if (!in_array($ext, $allowedExts)) {
    sendResponse(false, "Invalid image format. Allowed: " . implode(', ', $allowedExts), null, 400);
}

$targetDir = __DIR__ . '/../../uploads/covers/';
if (!file_exists($targetDir)) mkdir($targetDir, 0777, true);

$filename = 'avatar_' . $user['user_id'] . '_' . time() . '.' . $ext;
$filepath = $targetDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $filepath)) {
    sendResponse(false, "Failed to save image", null, 500);
}

$relativePath = '/backend/uploads/covers/' . $filename;

$stmt = $pdo->prepare("UPDATE users SET profile_picture = ? WHERE user_id = ?");
$stmt->execute([$relativePath, $user['user_id']]);

sendResponse(true, "Profile picture updated", [
    'profile_picture' => $relativePath
]);
