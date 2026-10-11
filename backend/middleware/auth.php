<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../helpers/response.php';

if (!function_exists('getallheaders')) {
    function getallheaders() {
        $headers = [];
        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) == 'HTTP_') {
                $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
            }
        }
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers['Authorization'] = $_SERVER['HTTP_AUTHORIZATION'];
        } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $headers['Authorization'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }
        return $headers;
    }
}

define('SECRET_KEY', 'echofy_super_secret_key_2026_jwt_token');

/**
 * Generates a simple secure JWT-like token for user authentication.
 */
function generateAuthToken($user) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'user_id' => $user['user_id'],
        'email'   => $user['email'],
        'role'    => $user['role'],
        'name'    => $user['name'],
        'exp'     => time() + (86400 * 30) // 30 days validity
    ]);

    $base64UrlHeader  = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, SECRET_KEY, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

/**
 * Validates request Bearer token and returns authenticated user details.
 */
function authenticateUser($requiredRole = null) {
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : (isset($headers['authorization']) ? $headers['authorization'] : '');

    if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        sendResponse(false, "Authorization header missing or invalid", null, 401);
    }

    $jwt = $matches[1];
    $tokenParts = explode('.', $jwt);

    if (count($tokenParts) !== 3) {
        sendResponse(false, "Invalid token format", null, 401);
    }

    list($headerB64, $payloadB64, $sigB64) = $tokenParts;

    $signature = hash_hmac('sha256', $headerB64 . "." . $payloadB64, SECRET_KEY, true);
    $expectedSig = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

    if (!hash_equals($expectedSig, $sigB64)) {
        sendResponse(false, "Invalid token signature", null, 401);
    }

    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $payloadB64)), true);

    if (!$payload || $payload['exp'] < time()) {
        sendResponse(false, "Token has expired", null, 401);
    }

    // Verify user exists in database
    $pdo = getDbConnection();
    $stmt = $pdo->prepare("SELECT user_id, name, email, profile_picture, role, theme FROM users WHERE user_id = ? AND is_active = 1");
    $stmt->execute([$payload['user_id']]);
    $user = $stmt->fetch();

    if (!$user) {
        sendResponse(false, "User account not found or deactivated", null, 401);
    }

    // If role requirement specified
    if ($requiredRole && $user['role'] !== $requiredRole && $user['role'] !== 'admin') {
        sendResponse(false, "Unauthorized: Requires {$requiredRole} privilege", null, 403);
    }

    return $user;
}

/**
 * Optional user authentication - returns user array if logged in, null otherwise.
 */
function getOptionalUser() {
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : (isset($headers['authorization']) ? $headers['authorization'] : '');

    if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        return null;
    }

    try {
        $jwt = $matches[1];
        $tokenParts = explode('.', $jwt);
        if (count($tokenParts) !== 3) return null;
        list($headerB64, $payloadB64, $sigB64) = $tokenParts;

        $signature = hash_hmac('sha256', $headerB64 . "." . $payloadB64, SECRET_KEY, true);
        $expectedSig = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        if (!hash_equals($expectedSig, $sigB64)) return null;

        $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $payloadB64)), true);
        if (!$payload || $payload['exp'] < time()) return null;

        $pdo = getDbConnection();
        $stmt = $pdo->prepare("SELECT user_id, name, email, profile_picture, role, theme FROM users WHERE user_id = ? AND is_active = 1");
        $stmt->execute([$payload['user_id']]);
        return $stmt->fetch() ?: null;
    } catch (Exception $e) {
        return null;
    }
}
