<?php
declare(strict_types=1);

// Configure this address if you later use a different inbox.
const RECIPIENT_EMAIL = 'sanish.maharjan001@gmail.com';

function redirectToPortfolio(string $status): never
{
    header('Location: index.html?contact=' . rawurlencode($status), true, 303);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    exit('Method not allowed.');
}

// Honeypot: real visitors never see or fill this field. Return a success-like
// response so automated clients do not learn that the submission was rejected.
if (trim((string) ($_POST['website'] ?? '')) !== '') {
    redirectToPortfolio('sent');
}

$name = trim((string) ($_POST['name'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));

if ($name === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    redirectToPortfolio('invalid');
}

// Prevent email-header injection through user-supplied fields.
if (preg_match('/[\r\n]/', $name . $email)) {
    redirectToPortfolio('invalid');
}

$subject = 'Portfolio enquiry from ' . $name;
$body = "Name: {$name}\nEmail: {$email}\n\nMessage:\n{$message}\n";
$headers = [
    'From: Portfolio Contact Form <no-reply@sanish-maharjan.com.np>',
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8',
];

if (!mail(RECIPIENT_EMAIL, $subject, $body, implode("\r\n", $headers))) {
    redirectToPortfolio('error');
}

redirectToPortfolio('sent');
