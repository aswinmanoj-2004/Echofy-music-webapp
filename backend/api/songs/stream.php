<?php
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';

// Enable CORS for audio requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Range, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$songId   = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$filePath = isset($_GET['file']) ? trim($_GET['file']) : '';

$pdo = getDbConnection();

if ($songId > 0) {
    $stmt = $pdo->prepare("SELECT file_path FROM songs WHERE song_id = ?");
    $stmt->execute([$songId]);
    $song = $stmt->fetch();
    if ($song && !empty($song['file_path'])) {
        $filePath = $song['file_path'];
    }
}

if (empty($filePath)) {
    http_response_code(404);
    echo "Audio file not found.";
    exit();
}

// If external HTTP/HTTPS URL, redirect directly or proxy
if (preg_match('/^https?:\/\//i', $filePath)) {
    header("Location: " . $filePath);
    exit();
}

// Local file path resolution
$cleanPath = ltrim(str_replace('/backend/', '', $filePath), '/');
$realPath  = __DIR__ . '/../../' . $cleanPath;

if (!file_exists($realPath) || !is_file($realPath)) {
    $realPath = __DIR__ . '/../../../' . ltrim($filePath, '/');
}

if (!file_exists($realPath) || !is_file($realPath)) {
    http_response_code(404);
    echo "Local audio file not found on server.";
    exit();
}

$fileSize = filesize($realPath);
$mimeType = 'audio/mpeg';

$ext = strtolower(pathinfo($realPath, PATHINFO_EXTENSION));
if ($ext === 'wav')  $mimeType = 'audio/wav';
if ($ext === 'ogg')  $mimeType = 'audio/ogg';
if ($ext === 'm4a')  $mimeType = 'audio/mp4';
if ($ext === 'mp4')  $mimeType = 'audio/mp4';
if ($ext === 'webm') $mimeType = 'audio/webm';
if ($ext === 'opus') $mimeType = 'audio/ogg';

// Default chunk size for low-speed optimization: 256 KB
$chunkSize = 256 * 1024; 
$start = 0;
$end   = $fileSize - 1;

if (isset($_SERVER['HTTP_RANGE'])) {
    $range = $_SERVER['HTTP_RANGE'];
    if (preg_match('/bytes=\s*(\d+)-(\d*)/i', $range, $matches)) {
        $start = (int)$matches[1];
        if (!empty($matches[2])) {
            $end = (int)$matches[2];
        } else {
            $end = min($start + $chunkSize - 1, $fileSize - 1);
        }
    }
    http_response_code(206); // Partial Content
} else {
    http_response_code(200);
}

if ($start > $end || $start >= $fileSize) {
    http_response_code(416); // Range Not Satisfiable
    header("Content-Range: bytes */$fileSize");
    exit();
}

$length = ($end - $start) + 1;

header("Content-Type: {$mimeType}");
header("Accept-Ranges: bytes");
header("Content-Length: {$length}");
header("Content-Range: bytes {$start}-{$end}/{$fileSize}");
header("Cache-Control: public, max-age=86400, immutable");

$fp = fopen($realPath, 'rb');
if ($fp === false) {
    http_response_code(500);
    exit();
}

fseek($fp, $start);
$bufferSize = 8192;
$bytesToRead = $length;

while (!feof($fp) && $bytesToRead > 0 && connection_status() == 0) {
    $readSize = ($bytesToRead > $bufferSize) ? $bufferSize : $bytesToRead;
    $data = fread($fp, $readSize);
    echo $data;
    flush();
    $bytesToRead -= strlen($data);
}

fclose($fp);
exit();
