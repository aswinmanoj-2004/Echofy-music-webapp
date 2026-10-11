<?php
/**
 * Migration script to:
 * 1. Add video_id column to songs table
 * 2. Download cover images for existing YouTube songs
 */

require_once __DIR__ . '/../config/database.php';

$pdo = getDbConnection();

echo "=== Echofy Cover Image Migration ===\n\n";

// Step 1: Add video_id column if it doesn't exist
echo "Step 1: Adding video_id column to songs table...\n";
try {
    // Check if column exists first
    $checkStmt = $pdo->query("SHOW COLUMNS FROM songs LIKE 'video_id'");
    if ($checkStmt->rowCount() === 0) {
        $pdo->exec("ALTER TABLE songs ADD COLUMN video_id VARCHAR(20) DEFAULT NULL AFTER duration");
        echo "  ✓ video_id column added\n\n";
    } else {
        echo "  ✓ video_id column already exists\n\n";
    }
} catch (PDOException $e) {
    echo "  ✗ Error: " . $e->getMessage() . "\n\n";
    exit(1);
}

// Step 2: Find songs with missing cover images
echo "Step 2: Finding songs with missing cover images...\n";
$stmt = $pdo->query("SELECT song_id, title, video_id FROM songs WHERE cover_image IS NULL OR cover_image = ''");
$songs = $stmt->fetchAll();

echo "  Found " . count($songs) . " songs\n\n";

if (empty($songs)) {
    echo "No songs need fixing. All done!\n";
    exit(0);
}

// Step 3: Download thumbnails for songs with video_id
$coversDir = __DIR__ . '/../backend/uploads/covers';
if (!is_dir($coversDir)) {
    mkdir($coversDir, 0755, true);
}

$fixed = 0;
$noVideoId = 0;

foreach ($songs as $song) {
    echo "Song #{$song['song_id']}: {$song['title']}\n";
    
    if (empty($song['video_id'])) {
        echo "  - Skipping (no video_id stored)\n";
        $noVideoId++;
        continue;
    }
    
    $videoId = $song['video_id'];
    $coverFilename = 'cover_' . time() . '_' . uniqid() . '.jpg';
    $coverPath = $coversDir . '/' . $coverFilename;
    
    // Try YouTube thumbnail URLs in order of quality
    $thumbUrls = [
        "https://i.ytimg.com/vi/{$videoId}/maxresdefault.jpg",
        "https://i.ytimg.com/vi/{$videoId}/hqdefault.jpg",
        "https://i.ytimg.com/vi/{$videoId}/mqdefault.jpg",
    ];
    
    $downloaded = false;
    foreach ($thumbUrls as $thumbUrl) {
        $context = stream_context_create([
            'http' => [
                'timeout' => 10,
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'follow_location' => true,
            ]
        ]);
        $result = @copy($thumbUrl, $coverPath, $context);
        if ($result && file_exists($coverPath) && filesize($coverPath) > 1000) {
            $downloaded = true;
            break;
        }
        if (file_exists($coverPath)) {
            @unlink($coverPath);
        }
    }
    
    if ($downloaded) {
        $relativeCoverPath = '/backend/uploads/covers/' . $coverFilename;
        $updateStmt = $pdo->prepare("UPDATE songs SET cover_image = ? WHERE song_id = ?");
        $updateStmt->execute([$relativeCoverPath, $song['song_id']]);
        echo "  ✓ Cover image downloaded and saved\n";
        $fixed++;
    } else {
        echo "  ✗ Failed to download cover image\n";
    }
}

echo "\n\n=== Migration Complete ===\n";
echo "Total songs checked: " . count($songs) . "\n";
echo "Fixed: {$fixed}\n";
echo "Skipped (no video_id): {$noVideoId}\n";
echo "\nNote: Songs without video_id need to be re-uploaded using the URL Import feature.\n";
