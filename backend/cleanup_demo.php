<?php
require_once __DIR__ . '/../config/database.php';

$pdo = getDbConnection();
echo "Cleaning up demo users and artists from database...\n";

// Delete demo users matching @echofy.test
$stmt = $pdo->prepare("DELETE FROM users WHERE email LIKE '%@echofy.test'");
$stmt->execute();
$count = $stmt->rowCount();

echo "Deleted {$count} demo user accounts and associated artist profiles.\n";
