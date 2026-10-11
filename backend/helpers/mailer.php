<?php

/**
 * Sends a branded HTML email with a 6-digit verification code.
 */
function sendVerificationEmail($toEmail, $code, $type = 'register', $role = 'listener') {
    $subject = "Your Echofy Verification Code: {$code}";
    
    $roleTitle = ($role === 'artist') ? 'Artist Portal' : 'Listener Account';
    $actionText = ($type === 'register') ? 'complete your registration' : 'log in to your account';

    $htmlContent = '
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; background-color: #090b10; color: #e1e1e1; margin: 0; padding: 20px; }
            .container { max-width: 520px; margin: 0 auto; background: #121620; border-radius: 16px; border: 1px solid #222938; padding: 32px; text-align: center; }
            .logo { font-size: 24px; font-weight: 800; color: #1db954; letter-spacing: -0.5px; margin-bottom: 24px; }
            .logo span { color: #ffffff; }
            .heading { font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
            .subtext { font-size: 14px; color: #8a94a6; margin-bottom: 28px; line-height: 1.5; }
            .otp-box { background: rgba(29, 185, 84, 0.1); border: 2px dashed #1db954; border-radius: 12px; padding: 18px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1db954; margin: 0 auto 28px auto; width: fit-content; min-width: 200px; }
            .footer { font-size: 12px; color: #5a6475; margin-top: 24px; border-top: 1px solid #1a202c; padding-top: 16px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">Echo<span>fy</span></div>
            <div class="heading">Verification Code</div>
            <div class="subtext">Use the 6-digit code below to ' . htmlspecialchars($actionText) . ' for your ' . htmlspecialchars($roleTitle) . '. This code expires in 10 minutes.</div>
            <div class="otp-box">' . htmlspecialchars($code) . '</div>
            <div class="subtext">If you did not request this verification code, please ignore this email.</div>
            <div class="footer">&copy; ' . date('Y') . ' Echofy Music Platform. All rights reserved.</div>
        </div>
    </body>
    </html>
    ';

    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: Echofy Auth <no-reply@echofy.test>\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    // Attempt php mail delivery
    $mailSent = @mail($toEmail, $subject, $htmlContent, $headers);

    // Save to local debug log file for easy inspection in local dev environments
    $logDir = __DIR__ . '/../uploads/logs';
    if (!is_dir($logDir)) {
        @mkdir($logDir, 0777, true);
    }
    $logEntry = date('Y-m-d H:i:s') . " | To: {$toEmail} | Code: {$code} | Type: {$type} | Role: {$role} | Mail Sent: " . ($mailSent ? 'YES' : 'NO') . "\n";
    @file_put_contents($logDir . '/email_codes.log', $logEntry, FILE_APPEND);

    return $mailSent;
}
