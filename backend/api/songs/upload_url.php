<?php
@ini_set('max_execution_time', '600');

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendResponse(true, "OK");
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, "Method not allowed", null, 405);
}

// Ensure user is logged in as artist or admin
$user = authenticateUser('artist');
$pdo = getDbConnection();

// Get artist_id for this user
$stmtArtist = $pdo->prepare("SELECT artist_id FROM artists WHERE user_id = ?");
$stmtArtist->execute([$user['user_id']]);
$artist = $stmtArtist->fetch();

if (!$artist) {
    $stmtCreateArtist = $pdo->prepare("INSERT INTO artists (user_id) VALUES (?)");
    $stmtCreateArtist->execute([$user['user_id']]);
    $artistId = $pdo->lastInsertId();
} else {
    $artistId = $artist['artist_id'];
}

// Paths to yt-dlp and ffmpeg (use realpath for consistent Windows paths)
$binDir = realpath(__DIR__ . '/../../bin') ?: __DIR__ . '/../../bin';
$ytDlpPath = $binDir . '\\yt-dlp.exe';
$ffmpegBinPath = $binDir . '\\node_modules\\ffmpeg-static';
$ffmpegExePath = $ffmpegBinPath . '\\ffmpeg.exe';

// Fallback: try system PATH if bundled binaries don't exist
if (!file_exists($ytDlpPath)) {
    $ytDlpPath = 'yt-dlp';
}
if (!file_exists($ffmpegExePath)) {
    $ffmpegExePath = 'ffmpeg';
    $ffmpegBinPath = '';
}

/**
 * Execute a command and capture its merged stdout+stderr output.
 *
 * IMPORTANT — Windows/Apache specifics that drive this implementation:
 *   - Under Apache (apache2handler, running as the LocalSystem service),
 *     proc_open() with a *string* command fails with
 *     "proc_open(): Command conversion failed" because PHP tries to route it
 *     through cmd.exe, which is unavailable in that service context.
 *   - Passing the command as an *argument ARRAY* makes PHP call CreateProcess
 *     directly on the executable, bypassing cmd.exe entirely — this launches
 *     reliably under Apache/LocalSystem (verified: array form returns rc=0).
 *   - An explicit environment array must be supplied AND must contain
 *     SYSTEMROOT/WINDIR: yt-dlp.exe is a PyInstaller bundle whose embedded
 *     Python aborts with "_Py_HashRandomization_Init: failed to get random
 *     numbers" otherwise.
 *   - Any proc_open warning is suppressed with @ so it can never leak into and
 *     corrupt the JSON response body.
 *
 * $cmd MUST be an array: [executable, arg1, arg2, ...].
 */
function runCmd($cmd, &$output, &$returnCode, &$errorOutput = null) {
    global $binDir;
    $output = [];
    $errorOutput = [];

    // Guarantee array form. If a caller still passes a legacy shell string we
    // cannot safely re-split it (quoted paths contain spaces), so reject it
    // with a clear message rather than reproducing the conversion failure.
    if (!is_array($cmd) || empty($cmd)) {
        $output = ['Invalid command: expected an argument array'];
        $returnCode = 1;
        $errorOutput = $output;
        return false;
    }

    $winRoot = getenv('SYSTEMROOT') ?: 'C:\\Windows';
    $tmpDir  = sys_get_temp_dir();
    $env = [
        'PATH'            => $binDir . ';' . $binDir . '\\node_modules\\ffmpeg-static;' . (getenv('PATH') ?: ''),
        'SYSTEMROOT'      => $winRoot,
        'WINDIR'          => getenv('WINDIR') ?: $winRoot,
        'TEMP'            => $tmpDir,
        'TMP'             => $tmpDir,
        'HOME'            => $tmpDir,
        'USERPROFILE'     => $tmpDir,
        'APPDATA'         => $tmpDir,
        'XDG_CONFIG_HOME' => $tmpDir,
    ];

    $descriptors = [
        0 => ['pipe', 'r'],
        1 => ['pipe', 'w'],
        2 => ['pipe', 'w'],
    ];

    // Array command + explicit cwd + explicit env: the combination verified to
    // launch under Apache/LocalSystem.
    $proc = @proc_open($cmd, $descriptors, $pipes, $binDir, $env);
    if (!is_resource($proc)) {
        // Fallback for CLI / php -S where inherited env works fine.
        $proc = @proc_open($cmd, $descriptors, $pipes);
    }
    if (!is_resource($proc)) {
        $output = ['Failed to start yt-dlp process'];
        $returnCode = 1;
        $errorOutput = $output;
        return false;
    }
    
    fclose($pipes[0]);
    
    $stdout = stream_get_contents($pipes[1]);
    fclose($pipes[1]);
    
    $stderr = stream_get_contents($pipes[2]);
    fclose($pipes[2]);
    
    $returnCode = proc_close($proc);
    
    $allLines = array_merge(explode("\n", $stdout), explode("\n", $stderr));
    $filtered = array_filter($allLines, function($line) {
        $trimmed = trim($line);
        if ($trimmed === '') return false;
        if (stripos($trimmed, 'Cannot read') !== false) return false;
        if (stripos($trimmed, 'clipboard') !== false) return false;
        return true;
    });
    $output = array_values($filtered);
    // Callers use $errorOutput to surface the failure reason; runCmd merges
    // stdout+stderr into a single stream, so expose the same lines here.
    $errorOutput = $output;
    return true;
}

// ═══════════════════════════════════════════
// Pure-PHP fallback: YouTube InnerTube /player API + cURL stream download.
// Used whenever yt-dlp cannot be launched (Defender, permissions, missing
// binary, disabled proc_open, etc.). No external process, no ffmpeg needed:
// we save the audio-only stream (AAC/m4a preferred) directly and let the
// browser play it via stream.php.
// ═══════════════════════════════════════════

/**
 * Call YouTube's InnerTube player endpoint using the ANDROID client.
 *
 * Why ANDROID and not WEB: since late 2024 YouTube enforces PO-token / bot
 * attestation on the WEB client, so plain server-side POSTs return
 * `playabilityStatus=UNPLAYABLE` with 0 streams. The ANDROID client still
 * accepts unauthenticated requests and returns signed audio URLs.
 *
 * Sets $err to a human-readable reason on failure.
 */
function innertubeFetch($videoId, &$err) {
    $err = null;
    $apiUrl = 'https://www.youtube.com/youtubei/v1/player?key=AIzaSyA8eiZmM1FaDVjRy-df2KTyQ_vz_yYM39w&prettyPrint=false';
    $ua     = 'com.google.android.youtube/20.10.4 (Linux; U; Android 11) gzip';
    $body = json_encode([
        'context' => [
            'client' => [
                'clientName'        => 'ANDROID',
                'clientVersion'     => '20.10.4',
                'androidSdkVersion' => 30,
                'hl'                => 'en',
                'gl'                => 'US',
            ],
        ],
        'videoId'        => $videoId,
        'contentCheckOk' => true,
        'racyCheckOk'    => true,
    ]);

    $raw = null;
    if (function_exists('curl_init')) {
        $ch = curl_init($apiUrl);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $body,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_USERAGENT      => $ua,
            CURLOPT_TIMEOUT        => 20,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => 0,
            // Force IPv4 egress. Google binds the returned stream URLs to the
            // requesting client IP; if the API call leaves over IPv6 but the
            // CDN download leaves over IPv4 (or vice-versa) the URL is
            // rejected with 403. Pinning both to IPv4 keeps the IP consistent.
            CURLOPT_IPRESOLVE      => CURL_IPRESOLVE_V4,
        ]);
        $raw = curl_exec($ch);
        if ($raw === false) {
            $err = 'cURL error: ' . curl_error($ch);
            curl_close($ch);
            return null;
        }
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($status >= 400) {
            $err = "InnerTube HTTP $status";
            return null;
        }
    } else {
        $ctx = stream_context_create(['http' => [
            'method'        => 'POST',
            'header'        => "Content-Type: application/json\r\nUser-Agent: $ua\r\n",
            'content'       => $body,
            'timeout'       => 20,
            'ignore_errors' => true,
        ], 'ssl' => ['verify_peer' => false, 'verify_peer_name' => false]]);
        $raw = @file_get_contents($apiUrl, false, $ctx);
        if ($raw === false) {
            $err = 'HTTP request to InnerTube failed';
            return null;
        }
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) {
        $err = 'Invalid JSON from InnerTube';
        return null;
    }
    $play  = $data['playabilityStatus'] ?? [];
    $pstat = $play['status'] ?? 'UNKNOWN';
    if ($pstat !== 'OK') {
        $reason = $play['reason'] ?? 'no reason given';
        $err = "Video not playable ($pstat: $reason)";
        return null;
    }
    if (empty($data['videoDetails']) || empty($data['streamingData'])) {
        $err = 'InnerTube response missing videoDetails/streamingData';
        return null;
    }
    return $data;
}

/**
 * Pick the best audio-only stream from an InnerTube player response.
 * Prefers AAC/m4a (itag 140) for browser compatibility, then opus/webm.
 * Returns ['url'=>..., 'ext'=>'m4a'|'webm'|'opus'] or null.
 */
function pickAudioStream($data) {
    $list = [];
    if (!empty($data['streamingData']['adaptiveFormats']) && is_array($data['streamingData']['adaptiveFormats'])) {
        $list = $data['streamingData']['adaptiveFormats'];
    }
    $cands = [];
    foreach ($list as $f) {
        $mime = $f['mimeType'] ?? '';
        if (stripos($mime, 'audio/') === false) continue;
        $url = $f['url'] ?? null;
        if (!$url) continue;
        $ext = 'm4a';
        if (stripos($mime, 'mp4a') !== false || stripos($mime, 'audio/mp4') !== false) {
            $ext = 'm4a';
        } elseif (stripos($mime, 'opus') !== false) {
            $ext = 'opus';
        } elseif (stripos($mime, 'webm') !== false) {
            $ext = 'webm';
        }
        $cands[] = ['url' => $url, 'ext' => $ext, 'bitrate' => (int)($f['bitrate'] ?? 0), 'mime' => $mime];
    }
    if (!$cands) return null;
    usort($cands, function ($a, $b) {
        $rank = ['m4a' => 0, 'webm' => 1, 'opus' => 2];
        $ra = $rank[$a['ext']] ?? 9;
        $rb = $rank[$b['ext']] ?? 9;
        if ($ra !== $rb) return $ra - $rb;
        return $b['bitrate'] - $a['bitrate'];
    });
    return $cands[0];
}

/**
 * Stream-download a URL to a local file. Uses cURL when available.
 */
function downloadToFile($url, $dest, &$err) {
    $err = null;
    if (!function_exists('curl_init')) {
        // Non-cURL fallback: many Google CDN URLs reject un-ranged requests,
        // so still send an open-ended Range header.
        $ctx = stream_context_create([
            'http' => [
                'method'          => 'GET',
                'user_agent'      => 'com.google.android.youtube/20.10.4 (Linux; U; Android 11) gzip',
                'referer'         => 'https://www.youtube.com/',
                'header'          => "Range: bytes=0-\r\nAccept-Encoding: identity\r\n",
                'timeout'         => 300,
                'follow_location' => 1,
                'ignore_errors'   => true,
            ],
            'ssl' => ['verify_peer' => false, 'verify_peer_name' => false],
        ]);
        $bytes = @file_get_contents($url, false, $ctx);
        if ($bytes === false || strlen($bytes) < 1024) {
            $err = 'Download failed (no cURL)';
            return false;
        }
        return file_put_contents($dest, $bytes) !== false;
    }

    // Google's googlevideo CDN returns 403 for a full (un-ranged) GET on these
    // ANDROID "sig"-signed URLs, but 206 for any byte-ranged request. So we
    // discover the total size, then stream the file down in bounded chunks.
    $fp = fopen($dest, 'wb');
    if (!$fp) { $err = 'Cannot open destination file for writing'; return false; }

    $contentRange = null;
    $mkCh = function ($range) use ($url, &$fp, &$contentRange) {
        $contentRange = null;
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_FILE            => $fp,
            CURLOPT_FOLLOWLOCATION  => true,
            CURLOPT_MAXREDIRS       => 5,
            CURLOPT_CONNECTTIMEOUT  => 20,
            CURLOPT_TIMEOUT         => 0,
            CURLOPT_LOW_SPEED_LIMIT => 1024,
            CURLOPT_LOW_SPEED_TIME  => 60,
            CURLOPT_USERAGENT       => 'com.google.android.youtube/20.10.4 (Linux; U; Android 11) gzip',
            CURLOPT_REFERER         => 'https://www.youtube.com/',
            CURLOPT_SSL_VERIFYPEER  => false,
            CURLOPT_SSL_VERIFYHOST  => 0,
            CURLOPT_IPRESOLVE       => CURL_IPRESOLVE_V4,
            CURLOPT_HTTPHEADER      => ["Range: bytes=$range", 'Accept-Encoding: identity'],
            CURLOPT_HEADERFUNCTION  => function ($_ch, $line) use (&$contentRange) {
                if (stripos($line, 'Content-Range:') !== false) {
                    $contentRange = trim(substr($line, strpos($line, ':') + 1));
                }
                return strlen($line);
            },
        ]);
        $ok = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $dl = curl_getinfo($ch, CURLINFO_SIZE_DOWNLOAD);
        $cerr = curl_error($ch);
        curl_close($ch);
        return [$ok, $status, $dl, $cerr];
    };

    // 1) Probe total size with a 1-byte range.
    list($ok, $status, , $cerr) = $mkCh('0-0');
    if (!$ok || ($status !== 206 && $status !== 200)) {
        fclose($fp);
        @unlink($dest);
        $err = $cerr ?: "HTTP $status from Google CDN (probe)";
        return false;
    }
    $total = 0;
    if ($contentRange && preg_match('/\/\s*(\d+)\s*$/', $contentRange, $mm)) {
        $total = (int)$mm[1];
    }
    // Reopen in write mode (the 0-0 probe wrote 1 byte) and stream in chunks.
    fclose($fp);
    $fp = fopen($dest, 'wb');

    if ($total <= 0) {
        // Total unknown: single open-ended ranged request.
        list($ok, $status, $dl, $cerr) = $mkCh('0-');
        fclose($fp);
        if (!$ok || ($status >= 400)) {
            @unlink($dest);
            $err = $cerr ?: "HTTP $status from Google CDN";
            return false;
        }
    } else {
        // Google tolerates small byte-ranges but 403s large/whole-file ranges
        // on these signed URLs, so download in 1 MB pieces with a per-chunk
        // retry (transient 403s clear on a short backoff) and a small gap
        // between requests to avoid tripping the CDN's rate limiter.
        $chunk = 1024 * 1024; // 1 MB per ranged request
        $start = 0;
        while ($start < $total) {
            $end   = min($start + $chunk - 1, $total - 1);
            $gave = false;
            for ($try = 1; $try <= 4; $try++) {
                list($ok, $status, $dl, $cerr) = $mkCh("$start-$end");
                if ($ok && ($status === 206 || $status === 200) && $dl > 0) {
                    $start = $end + 1;
                    $gave  = true;
                    break;
                }
                usleep(700000 * $try); // 0.7s, 1.4s, 2.1s backoff
            }
            if (!$gave) {
                fclose($fp);
                @unlink($dest);
                $err = $cerr ?: "HTTP $status from Google CDN at byte $start";
                return false;
            }
            usleep(120000); // ~0.12s between chunks
        }
        fclose($fp);
        clearstatcache(true, $dest);
        if (filesize($dest) < $total * 0.95) {
            @unlink($dest);
            $err = 'Incomplete download (' . filesize($dest) . '/' . $total . ' bytes)';
            return false;
        }
    }

    if (!file_exists($dest) || filesize($dest) < 1024) {
        @unlink($dest);
        $err = 'Downloaded file is empty or too small';
        return false;
    }
    return true;
}

$input = getJsonInput();
$action = isset($input['action']) ? $input['action'] : 'upload';

// ─── Helper: Validate YouTube URL ───
function isYouTubeUrl($url) {
    $pattern = '/^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/)/i';
    return (bool) preg_match($pattern, $url);
}

// ─── Helper: Extract YouTube Video ID ───
function extractYouTubeId($url) {
    $pattern = '/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/';
    if (preg_match($pattern, $url, $matches)) {
        return $matches[1];
    }
    return null;
}

// ═══════════════════════════════════════════
// ACTION: Fetch metadata (preview before download)
// ═══════════════════════════════════════════
if ($action === 'fetch_metadata') {
    $url = isset($input['url']) ? trim($input['url']) : '';

    if (empty($url)) {
        sendResponse(false, "URL is required", null, 400);
    }

    if (!isYouTubeUrl($url)) {
        sendResponse(false, "Only YouTube URLs are supported", null, 400);
    }

    $videoId = extractYouTubeId($url);
    if (!$videoId) {
        sendResponse(false, "Could not parse YouTube video ID from URL", null, 400);
    }

    // ─── Attempt 1: yt-dlp (preferred when the binary can be launched) ───
    $cmd = [$ytDlpPath, '--dump-json', '--no-download', '--no-warnings', '--no-write-info-json', $url];

    $jsonOutput = [];
    $returnCode = 0;
    $jsonErr = [];
    runCmd($cmd, $jsonOutput, $returnCode, $jsonErr);

    // yt-dlp may exit with code 1 even on success (e.g. warnings). Treat as
    // success if we got output that contains a JSON object, regardless of code.
    $rawStr  = implode("\n", $jsonOutput);
    $hasJson = (strpos($rawStr, '{') !== false && strpos($rawStr, '"id"') !== false);

    if ($hasJson) {
        $lines = array_filter($jsonOutput, function ($line) {
            $trimmed = ltrim($line);
            return strlen($trimmed) > 0 && $trimmed[0] === '{';
        });
        $jsonStr = !empty($lines) ? end($lines) : $rawStr;
        if (strpos($jsonStr, '{') === false && preg_match('/\{.*\}/s', $jsonStr, $m)) {
            $jsonStr = $m[0];
        }
        $meta = json_decode($jsonStr, true);
        if (is_array($meta) && !empty($meta['title'])) {
            $thumbnail = null;
            if (!empty($meta['thumbnail'])) {
                $thumbnail = $meta['thumbnail'];
            } elseif (!empty($meta['thumbnails'])) {
                $thumbs = $meta['thumbnails'];
                usort($thumbs, function ($a, $b) {
                    return ($b['resolution'] ?? 0) - ($a['resolution'] ?? 0);
                });
                $thumbnail = $thumbs[0]['url'] ?? null;
            }
            sendResponse(true, "Metadata fetched", [
                'video_id'  => $videoId,
                'title'     => $meta['title'] ?? 'Unknown',
                'duration'  => (int) ($meta['duration'] ?? 0),
                'thumbnail' => $thumbnail,
                'uploader'  => $meta['uploader'] ?? $meta['channel'] ?? 'Unknown',
                'url'       => $url,
                'source'    => 'yt-dlp',
            ]);
        }
    }

    // ─── Attempt 2: pure-PHP InnerTube API (no external binary needed) ───
    $ytErr = null;
    $data = innertubeFetch($videoId, $ytErr);
    if (!$data) {
        $ytdlpDetail = !empty($jsonErr) ? implode(' | ', $jsonErr) : 'no output';
        sendResponse(false, "Failed to fetch video metadata. Details: yt-dlp: $ytdlpDetail | InnerTube: $ytErr", null, 400);
    }
    $vd = $data['videoDetails'];
    $thumbnail = null;
    if (!empty($vd['thumbnail'])) {
        $thumbnail = $vd['thumbnail'];
    } elseif (!empty($vd['thumbnails'])) {
        $thumbs = $vd['thumbnails'];
        usort($thumbs, function ($a, $b) {
            return ($b['width'] ?? 0) - ($a['width'] ?? 0);
        });
        $thumbnail = $thumbs[0]['url'] ?? null;
    }
    sendResponse(true, "Metadata fetched", [
        'video_id'  => $videoId,
        'title'     => $vd['title'] ?? 'Unknown',
        'duration'  => (int) ($vd['lengthSeconds'] ?? 0),
        'thumbnail' => $thumbnail,
        'uploader'  => $vd['author'] ?? 'Unknown',
        'url'       => $url,
        'source'    => 'innertube',
    ]);
}

// ═══════════════════════════════════════════
// ACTION: Download audio and create song
// ═══════════════════════════════════════════
if ($action === 'upload') {
    $url       = isset($input['url']) ? trim($input['url']) : '';
    $title     = isset($input['title']) ? trim($input['title']) : '';
    $genreId   = isset($input['genre_id']) && (int)$input['genre_id'] > 0 ? (int)$input['genre_id'] : null;
    $albumId   = isset($input['album_id']) && (int)$input['album_id'] > 0 ? (int)$input['album_id'] : null;
    $duration  = isset($input['duration']) ? (int)$input['duration'] : 0;

    if (empty($url)) {
        sendResponse(false, "YouTube URL is required", null, 400);
    }

    if (!isYouTubeUrl($url)) {
        sendResponse(false, "Only YouTube URLs are supported", null, 400);
    }

    if (empty($title)) {
        sendResponse(false, "Song title is required", null, 400);
    }

    $videoId = extractYouTubeId($url);
    if (!$videoId) {
        sendResponse(false, "Could not parse YouTube video ID from URL", null, 400);
    }

    // Check for duplicate: same YouTube source
    $targetSongsDir  = __DIR__ . '/../../uploads/songs/';
    $targetCoversDir = __DIR__ . '/../../uploads/covers/';

    if (!file_exists($targetSongsDir)) mkdir($targetSongsDir, 0777, true);
    if (!file_exists($targetCoversDir)) mkdir($targetCoversDir, 0777, true);

    // ─── Attempt 1: yt-dlp (preferred: fetches the native audio stream) ───
    $uniquePrefix = 'song_' . time() . '_' . uniqid();
    $finalSongPath = null;
    $songFilename  = null;
    $ytdlpError    = null;

    // Download the best audio-only stream in its NATIVE container (m4a preferred,
    // then webm/opus). We deliberately do NOT pass `-x --audio-format mp3`: that
    // requires ffmpeg, which is not bundled here (ffmpeg-static is empty), so a
    // conversion request would make yt-dlp fail after a successful download.
    // stream.php serves m4a/webm/opus with the correct MIME types.
    $outTemplate = rtrim($targetSongsDir, '/\\') . '\\' . $uniquePrefix . '.%(ext)s';
    $cmd = [
        $ytDlpPath,
        '-f', 'bestaudio[ext=m4a]/bestaudio[ext=webm]/bestaudio/best',
        '-o', $outTemplate,
        '--no-playlist',
        '--no-warnings',
        '--no-check-certificates',
        '--retries', '3',
        '--fragment-retries', '3',
        '--no-write-info-json',
        '--print', 'after_move:filepath',
        $url,
    ];

    $output = [];
    $returnCode = 0;
    $dlErr = [];
    runCmd($cmd, $output, $returnCode, $dlErr);

    // Find the downloaded file (yt-dlp may produce .mp3 or .webm etc.)
    $downloadedFile = null;
    foreach ($output as $line) {
        $line = trim($line);
        if ($line !== '' && file_exists($line) && strpos($line, $uniquePrefix) !== false) {
            $downloadedFile = $line;
            break;
        }
    }

    // Fallback: glob for the file
    if (!$downloadedFile) {
        $matches = glob($targetSongsDir . $uniquePrefix . '.*');
        if ($matches) {
            $downloadedFile = $matches[0];
        }
    }

    if ($returnCode === 0 && $downloadedFile && file_exists($downloadedFile)) {
        // Keep the native container yt-dlp produced (m4a/webm/opus); renaming to
        // .mp3 without an actual transcode would corrupt the file.
        $ext = strtolower(pathinfo($downloadedFile, PATHINFO_EXTENSION)) ?: 'm4a';
        $songFilename  = $uniquePrefix . '.' . $ext;
        $finalSongPath = $targetSongsDir . $songFilename;
        if ($downloadedFile !== $finalSongPath) {
            @rename($downloadedFile, $finalSongPath);
        }
    } else {
        $ytdlpError = !empty($dlErr) ? implode(' | ', $dlErr) : 'yt-dlp produced no output file';
        $partials = glob($targetSongsDir . $uniquePrefix . '.*');
        if ($partials) {
            foreach ($partials as $p) @unlink($p);
        }
    }

    // ─── Attempt 2: pure-PHP InnerTube + cURL download (no external binary) ───
    if (!$finalSongPath) {
        $dlErr2 = null;
        // Retry with a freshly-fetched URL: Google's signed stream URLs are
        // IP-/time-bound, so a second attempt after a 403 often succeeds.
        for ($attempt = 1; $attempt <= 2 && !$finalSongPath; $attempt++) {
            $ytErr = null;
            $data = innertubeFetch($videoId, $ytErr);
            if (!$data) {
                $dlErr2 = "InnerTube: $ytErr";
                break;
            }
            $stream = pickAudioStream($data);
            if (!$stream) {
                $dlErr2 = 'No downloadable audio stream found for this video.';
                break;
            }
            $candidateName  = $uniquePrefix . '.' . $stream['ext'];
            $candidatePath  = $targetSongsDir . $candidateName;

            if (downloadToFile($stream['url'], $candidatePath, $dlErr2)) {
                $songFilename  = $candidateName;
                $finalSongPath = $candidatePath;
                if ($duration <= 0) {
                    $duration = (int) ($data['videoDetails']['lengthSeconds'] ?? 0);
                }
                break;
            }
            @unlink($candidatePath);
            usleep(500000); // 0.5s backoff before retrying with a fresh URL
        }

        if (!$finalSongPath) {
            sendResponse(false,
                "Failed to download audio stream: $dlErr2" . ($ytdlpError ? " | yt-dlp: $ytdlpError" : ''),
                null, 500);
        }
    }

    $relativeSongPath = '/backend/uploads/songs/' . $songFilename;

    // Download thumbnail as cover art using PHP's native copy() (no shell needed)
    $relativeCoverPath = null;
    $coverFilename = 'cover_' . time() . '_' . uniqid() . '.jpg';
    $coverPath = $targetCoversDir . $coverFilename;

    // Try YouTube thumbnail URLs in order of quality
    $thumbUrls = [
        "https://i.ytimg.com/vi/{$videoId}/maxresdefault.jpg",
        "https://i.ytimg.com/vi/{$videoId}/hqdefault.jpg",
        "https://i.ytimg.com/vi/{$videoId}/mqdefault.jpg",
    ];

    foreach ($thumbUrls as $thumbUrl) {
        // Use PHP's native copy() - no shell command needed, works reliably through Apache
        $context = stream_context_create([
            'http' => [
                'timeout' => 10,
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'follow_location' => true,
            ]
        ]);
        $result = @copy($thumbUrl, $coverPath, $context);
        if ($result && file_exists($coverPath) && filesize($coverPath) > 1000) {
            $relativeCoverPath = '/backend/uploads/covers/' . $coverFilename;
            break;
        }
        // Clean up failed download
        if (file_exists($coverPath)) {
            @unlink($coverPath);
        }
    }

    // Get actual duration if still unknown. Prefer yt-dlp (bundled + working);
    // fall back to an ffmpeg/ffprobe read of the local file if available.
    if ($duration <= 0) {
        $durCmd = [$ytDlpPath, '--no-download', '--no-warnings', '--no-write-info-json', '--print', 'duration', $url];
        $durOut = []; $durRet = 0; $durErr = [];
        runCmd($durCmd, $durOut, $durRet, $durErr);
        foreach (array_merge($durOut, $durErr) as $ln) {
            if (preg_match('/^\d+$/', trim($ln))) { $duration = (int) trim($ln); break; }
        }
    }
    if ($duration <= 0 && $ffmpegExePath !== 'ffmpeg') {
        $ffprobeCmd = [$ffmpegExePath, '-i', $finalSongPath];
        $ffOutput = [];
        $ffRet = 0;
        $ffErr = [];
        runCmd($ffprobeCmd, $ffOutput, $ffRet, $ffErr);
        // ffprobe outputs to stderr, so combine both for duration parsing
        $ffStr = implode("\n", array_merge($ffOutput, $ffErr));
        if (preg_match('/Duration:\s*(\d+):(\d+):(\d+\.\d+)/', $ffStr, $durMatch)) {
            $duration = (int)($durMatch[1] * 3600 + $durMatch[2] * 60 + round((float)$durMatch[3]));
        }
    }
    if ($duration <= 0) {
        $duration = 180; // fallback default
    }

    // Insert into DB
    $stmt = $pdo->prepare("INSERT INTO songs (artist_id, album_id, genre_id, title, file_path, cover_image, duration, video_id) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$artistId, $albumId, $genreId, $title, $relativeSongPath, $relativeCoverPath, $duration, $videoId]);
    $newSongId = $pdo->lastInsertId();

    sendResponse(true, "Track imported from YouTube successfully", [
        'song_id'     => (int)$newSongId,
        'title'       => $title,
        'file_path'   => $relativeSongPath,
        'cover_image' => $relativeCoverPath,
        'duration'    => $duration,
        'source'      => 'youtube',
        'video_id'    => $videoId,
    ], 201);
}

sendResponse(false, "Invalid action", null, 400);
