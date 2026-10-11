<?php

// Send CORS headers immediately on script inclusion
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Sends structured JSON responses with CORS headers.
 */
function sendResponse($status = true, $message = "", $data = null, $httpCode = 200) {
    header("Content-Type: application/json; charset=UTF-8");

    http_response_code($httpCode);

    $response = [
        "status" => $status,
        "message" => $message
    ];

    if ($data !== null) {
        $response["data"] = $data;
    }

    echo json_encode($response, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit();
}

/**
 * Parses incoming JSON body from input stream.
 */
function getJsonInput() {
    $input = file_get_contents('php://input');
    if (!$input) return $_POST;
    $decoded = json_decode($input, true);
    return is_array($decoded) ? array_merge($_POST, $decoded) : $_POST;
}
