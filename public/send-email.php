<?php
declare(strict_types=1);

use PHPMailer\PHPMailer\Exception as MailerException;
use PHPMailer\PHPMailer\PHPMailer;

date_default_timezone_set('America/Lima');

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 600;
const MAX_TEXT_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 3000;
const MAX_LINK_LENGTH = 500;
const DATA_DIR = __DIR__ . '/data';

// Debe coincidir con FORM_FIELDS de src/utils/formValidation.ts.
const FORMS = [
    'contacto' => [
        'prefix'  => 'CON',
        'subject' => 'Nuevo contacto web',
        'fields'  => [
            'firstName'   => ['label' => 'Nombre', 'required' => true],
            'lastName'    => ['label' => 'Apellidos', 'required' => true],
            'phone'       => ['label' => 'Teléfono', 'required' => true, 'kind' => 'phone'],
            'email'       => ['label' => 'Correo', 'required' => true, 'kind' => 'email'],
            'position'    => ['label' => 'Cargo'],
            'institution' => ['label' => 'Institución', 'required' => true],
            'location'    => ['label' => 'Ubicación', 'required' => true],
            'specialty'   => ['label' => 'Especialidad'],
            'message'     => ['label' => 'Mensaje', 'kind' => 'message'],
        ],
    ],
    'cotizacion' => [
        'prefix'  => 'COT',
        'subject' => 'Nueva solicitud de cotización',
        'fields'  => [
            'product'     => ['label' => 'Producto', 'kind' => 'reference'],
            'productUrl'  => ['label' => 'Enlace del producto', 'kind' => 'url'],
            'name'        => ['label' => 'Nombre y apellido', 'required' => true],
            'institution' => ['label' => 'Institución', 'required' => true],
            'email'       => ['label' => 'Correo', 'required' => true, 'kind' => 'email'],
            'phone'       => ['label' => 'Teléfono', 'required' => true, 'kind' => 'phone'],
            'message'     => ['label' => 'Cantidad, plazo o consulta', 'kind' => 'message'],
        ],
    ],
    'servicio-tecnico' => [
        'prefix'  => 'SVT',
        'subject' => 'Nueva solicitud de servicio técnico',
        'fields'  => [
            'firstName'   => ['label' => 'Nombres', 'required' => true],
            'lastName'    => ['label' => 'Apellidos', 'required' => true],
            'email'       => ['label' => 'Correo', 'required' => true, 'kind' => 'email'],
            'phone'       => ['label' => 'Teléfono', 'required' => true, 'kind' => 'phone'],
            'institution' => ['label' => 'Institución', 'required' => true],
            'brand'       => ['label' => 'Marca', 'required' => true],
            'model'       => ['label' => 'Modelo', 'required' => true],
            'serial'      => ['label' => 'Serie', 'required' => true],
            'message'     => ['label' => 'Mensaje del incidente', 'required' => true, 'kind' => 'message'],
        ],
    ],
];

const ERROR_MESSAGES = [
    'required' => 'Este campo es obligatorio.',
    'email'    => 'Ingresa un correo válido, por ejemplo nombre@institucion.com.',
    'phone'    => 'Ingresa un teléfono válido, de 7 a 15 dígitos.',
    'consent'  => 'Debes aceptar la política de datos personales.',
];

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

$configPath = __DIR__ . '/site-config.php';
$config = file_exists($configPath) ? require $configPath : null;
if (!is_array($config)) $config = null;

applyCors($config['allowed_origins'] ?? []);

$method = $_SERVER['REQUEST_METHOD'] ?? '';
if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}
if ($method !== 'POST') respond(405, ['success' => false, 'error' => 'Método no permitido.']);

if ($config === null) {
    error_log('send-email: falta site-config.php');
    respond(500, ['success' => false, 'error' => 'El envío de formularios no está configurado.']);
}

$smtpHost = (string) ($config['smtp_host'] ?? '');
$smtpUser = (string) ($config['smtp_user'] ?? '');
$smtpPass = (string) ($config['smtp_pass'] ?? '');
if ($smtpHost === '' || $smtpUser === '' || $smtpPass === '') {
    error_log('send-email: credenciales SMTP vacías en site-config.php');
    respond(503, ['success' => false, 'error' => 'El envío de formularios no está configurado.']);
}

$input = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($input)) respond(400, ['success' => false, 'error' => 'Solicitud inválida.']);

// Los bots llenan el campo oculto: un falso éxito evita que reintenten.
if (stringValue($input['website'] ?? '') !== '') respond(200, ['success' => true]);

$clientIp = (string) ($_SERVER['REMOTE_ADDR'] ?? '');
if (!allowByRateLimit(hash('sha256', $clientIp . $smtpUser))) {
    respond(429, ['success' => false, 'error' => 'Hiciste varios envíos seguidos. Inténtalo de nuevo en unos minutos.']);
}

$turnstileSecret = (string) ($config['turnstile_secret'] ?? '');
if ($turnstileSecret !== '' && !verifyTurnstile($turnstileSecret, stringValue($input['captchaToken'] ?? ''), $clientIp)) {
    respond(400, ['success' => false, 'error' => 'No pudimos verificar el envío. Recarga la página e inténtalo de nuevo.']);
}

$formType = stringValue($input['formType'] ?? '');
if (!isset(FORMS[$formType])) respond(400, ['success' => false, 'error' => 'Formulario inválido.']);
$form = FORMS[$formType];

$formSettings = findFormSettings($formType);
if (!$formSettings['enabled']) respond(400, ['success' => false, 'error' => 'Este formulario no está disponible por ahora.']);

[$values, $fieldErrors] = validateSubmission($form['fields'], $input);
if ($fieldErrors) respond(400, ['success' => false, 'error' => 'Revisa los campos marcados.', 'fields' => $fieldErrors]);

$recipients = $formSettings['recipients'];
$fallbackEmail = trim((string) ($config['fallback_email'] ?? ''));
if (!$recipients && filter_var($fallbackEmail, FILTER_VALIDATE_EMAIL)) $recipients = [$fallbackEmail];
if (!$recipients) {
    error_log("send-email: {$formType} sin destinatarios ni fallback_email");
    respond(500, ['success' => false, 'error' => 'No se pudo enviar el formulario.']);
}

$correlativo = nextCorrelative($formType, $form['prefix']);
$leadName = $formType === 'cotizacion'
    ? $values['name']
    : trim($values['firstName'] . ' ' . $values['lastName']);
$leadEmail = $values['email'];
$fromName = (string) ($config['from_name'] ?? 'Medical Digital Web');
$siteUrl = siteUrl();

require __DIR__ . '/phpmailer/Exception.php';
require __DIR__ . '/phpmailer/PHPMailer.php';
require __DIR__ . '/phpmailer/SMTP.php';

try {
    $mail = createMailer($config, $fromName);
    foreach ($recipients as $recipient) $mail->addAddress($recipient);
    $mail->addReplyTo($leadEmail, $leadName);
    $mail->Subject = "{$form['subject']} [{$correlativo}] - {$leadName}";
    $rows = emailRows($form['fields'], $values);
    $mail->Body = internalEmailHtml($form['subject'], $correlativo, $rows, $siteUrl);
    $mail->AltBody = internalEmailText($form['subject'], $correlativo, $rows);
    $mail->send();
} catch (MailerException $exception) {
    error_log('send-email: ' . $exception->getMessage());
    respond(500, ['success' => false, 'error' => 'No se pudo enviar el formulario.']);
}

try {
    $confirmation = createMailer($config, 'Medical Digital');
    $confirmation->addAddress($leadEmail, $leadName);
    $confirmation->Subject = "Recibimos tu solicitud [{$correlativo}] — Medical Digital";
    $confirmation->Body = confirmationEmailHtml($leadName, $correlativo, $siteUrl);
    $confirmation->AltBody = confirmationEmailText($leadName, $correlativo, $siteUrl);
    $confirmation->send();
} catch (MailerException $exception) {
    // La confirmación es cortesía: si falla, el envío al equipo ya salió y cuenta como éxito.
    error_log('send-email (confirmación): ' . $exception->getMessage());
}

respond(200, ['success' => true, 'correlativo' => $correlativo]);

function respond(int $status, array $body): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function stringValue(mixed $value): string
{
    return is_string($value) ? trim($value) : '';
}

function requestHost(): string
{
    return strtolower((string) preg_replace('/:\d+$/', '', (string) ($_SERVER['HTTP_HOST'] ?? '')));
}

function applyCors(mixed $allowedOrigins): void
{
    $origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
    if ($origin === '') return;

    $originHost = strtolower((string) parse_url($origin, PHP_URL_HOST));
    if ($originHost !== '' && $originHost === requestHost()) return;

    $allowed = is_array($allowedOrigins) ? array_map(fn ($item) => rtrim((string) $item, '/'), $allowedOrigins) : [];
    if (!in_array(rtrim($origin, '/'), $allowed, true)) {
        respond(403, ['success' => false, 'error' => 'Origen no permitido.']);
    }

    header("Access-Control-Allow-Origin: {$origin}");
    header('Vary: Origin');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
}

function ensureDataDir(): bool
{
    if (!is_dir(DATA_DIR) && !@mkdir(DATA_DIR, 0755, true)) {
        error_log('send-email: no se pudo crear data/');
        return false;
    }
    $htaccess = DATA_DIR . '/.htaccess';
    if (!file_exists($htaccess)) {
        @file_put_contents($htaccess, "Require all denied\n<IfModule !mod_authz_core.c>\n  Deny from all\n</IfModule>\n");
    }
    return is_writable(DATA_DIR);
}

function updateJsonFile(string $name, callable $update): mixed
{
    if (!ensureDataDir()) return null;
    $handle = @fopen(DATA_DIR . "/{$name}", 'c+');
    if ($handle === false || !flock($handle, LOCK_EX)) {
        error_log("send-email: no se pudo abrir data/{$name}");
        return null;
    }
    $data = json_decode((string) stream_get_contents($handle), true);
    [$data, $result] = $update(is_array($data) ? $data : []);
    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, (string) json_encode($data));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
    return $result;
}

function allowByRateLimit(string $ipHash): bool
{
    $now = time();
    $allowed = updateJsonFile('ratelimit.json', function (array $entries) use ($ipHash, $now) {
        foreach ($entries as $hash => $timestamps) {
            $recent = array_values(array_filter((array) $timestamps, fn ($time) => is_int($time) && $time > $now - RATE_LIMIT_WINDOW));
            if ($recent) $entries[$hash] = $recent;
            else unset($entries[$hash]);
        }
        $attempts = $entries[$ipHash] ?? [];
        if (count($attempts) >= RATE_LIMIT_MAX) return [$entries, false];
        $entries[$ipHash] = [...$attempts, $now];
        return [$entries, true];
    });
    return $allowed !== false;
}

function nextCorrelative(string $formType, string $prefix): string
{
    $number = updateJsonFile('counter.json', function (array $counters) use ($formType) {
        $counters[$formType] = (int) ($counters[$formType] ?? 0) + 1;
        return [$counters, $counters[$formType]];
    });
    if (!is_int($number)) return $prefix . '-' . date('ymdHis');
    return $prefix . '-' . str_pad((string) $number, 6, '0', STR_PAD_LEFT);
}

function verifyTurnstile(string $secret, string $token, string $remoteIp): bool
{
    if ($token === '') return false;

    $fields = ['secret' => $secret, 'response' => $token];
    if ($remoteIp !== '') $fields['remoteip'] = $remoteIp;
    $url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

    if (function_exists('curl_init')) {
        $curl = curl_init($url);
        curl_setopt_array($curl, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => http_build_query($fields),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT        => 10,
        ]);
        $response = curl_exec($curl);
        $failed = $response === false || curl_errno($curl) !== 0;
        curl_close($curl);
        if ($failed) return false;
    } else {
        $context = stream_context_create(['http' => [
            'method'  => 'POST',
            'header'  => 'Content-Type: application/x-www-form-urlencoded',
            'content' => http_build_query($fields),
            'timeout' => 10,
        ]]);
        $response = @file_get_contents($url, false, $context);
        if ($response === false) return false;
    }

    $data = json_decode((string) $response, true);
    return is_array($data) && !empty($data['success']);
}

function findFormSettings(string $formType): array
{
    $settings = ['enabled' => true, 'recipients' => []];
    $path = __DIR__ . '/form-config.json';
    $data = file_exists($path) ? json_decode((string) file_get_contents($path), true) : null;
    foreach ((is_array($data) ? $data['forms'] ?? [] : []) as $form) {
        if (!is_array($form) || ($form['formType'] ?? '') !== $formType) continue;
        $settings['enabled'] = ($form['enabled'] ?? true) !== false;
        $settings['recipients'] = array_values(array_filter(
            array_map(fn ($email) => trim((string) $email), (array) ($form['recipients'] ?? [])),
            fn ($email) => (bool) filter_var($email, FILTER_VALIDATE_EMAIL),
        ));
    }
    return $settings;
}

function cleanText(string $value, bool $multiline): string
{
    $pattern = $multiline ? '/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/u' : '/[\x00-\x1F\x7F]/u';
    return trim((string) preg_replace($pattern, ' ', $value));
}

function isValidPhone(string $value): bool
{
    $digits = strlen((string) preg_replace('/\D/', '', $value));
    return (bool) preg_match('/^[+\d\s()-]+$/', $value) && $digits >= 7 && $digits <= 15;
}

function validateSubmission(array $fields, array $input): array
{
    $values = [];
    $errors = [];

    foreach ($fields as $name => $rule) {
        $kind = $rule['kind'] ?? 'text';
        $value = cleanText(stringValue($input[$name] ?? ''), $kind === 'message');
        $maxLength = match ($kind) {
            'message' => MAX_MESSAGE_LENGTH,
            'reference', 'url' => MAX_LINK_LENGTH,
            default => MAX_TEXT_LENGTH,
        };

        if ($kind === 'url' && $value !== '' && !preg_match('#^https?://#i', $value)) $value = '';
        if (in_array($kind, ['reference', 'url'], true)) $value = mb_substr($value, 0, $maxLength);

        if ($value === '') {
            if (!empty($rule['required'])) $errors[$name] = ERROR_MESSAGES['required'];
        } elseif (mb_strlen($value) > $maxLength) {
            $errors[$name] = "Escribe como máximo {$maxLength} caracteres.";
        } elseif ($kind === 'email' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
            $errors[$name] = ERROR_MESSAGES['email'];
        } elseif ($kind === 'phone' && !isValidPhone($value)) {
            $errors[$name] = ERROR_MESSAGES['phone'];
        }
        $values[$name] = $value;
    }

    $consent = $input['consent'] ?? false;
    if ($consent !== true && $consent !== 'true') $errors['consent'] = ERROR_MESSAGES['consent'];

    return [$values, $errors];
}

function siteUrl(): string
{
    $https = ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https'
        || (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
    $directory = rtrim(str_replace('\\', '/', dirname((string) ($_SERVER['SCRIPT_NAME'] ?? '/'))), '/');
    return ($https ? 'https' : 'http') . '://' . requestHost() . $directory . '/';
}

function createMailer(array $config, string $fromName): PHPMailer
{
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = (string) $config['smtp_host'];
    $mail->Port = (int) ($config['smtp_port'] ?? 587);
    $mail->SMTPAuth = true;
    $mail->Username = (string) $config['smtp_user'];
    $mail->Password = (string) $config['smtp_pass'];
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->CharSet = PHPMailer::CHARSET_UTF8;
    $mail->Timeout = 15;
    $mail->setFrom((string) $config['smtp_user'], $fromName);
    $mail->isHTML(true);
    return $mail;
}

function h(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

function emailRows(array $fields, array $values): array
{
    $rows = [];
    foreach ($fields as $name => $rule) {
        if (($values[$name] ?? '') !== '') $rows[$rule['label']] = $values[$name];
    }
    return $rows;
}

// Tablas con estilos en línea: es el único maquetado que respetan Outlook y Gmail.
function emailLayout(string $heading, string $content, string $siteUrl): string
{
    $year = date('Y');
    return '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"></head>'
        . '<body style="margin:0;padding:0;background:#F4F5F8;font-family:Arial,Helvetica,sans-serif;">'
        . '<table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F5F8;padding:32px 16px;"><tr><td align="center">'
        . '<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border-radius:12px;overflow:hidden;">'
        . '<tr><td style="background:#1C2140;padding:24px 32px;">'
        . '<p style="margin:0;color:#FFFFFF;font-size:18px;font-weight:700;">Medical Digital</p>'
        . '<p style="margin:6px 0 0;color:#B3C3E3;font-size:13px;">' . h($heading) . '</p></td></tr>'
        . $content
        . '<tr><td style="padding:16px 32px;background:#F7F7F8;border-top:1px solid #E5E7EB;text-align:center;">'
        . '<p style="margin:0;color:#717274;font-size:11px;">© ' . $year . ' Medical Digital · <a href="' . h($siteUrl) . '" style="color:#717274;">' . h($siteUrl) . '</a></p></td></tr>'
        . '</table></td></tr></table></body></html>';
}

function internalEmailHtml(string $subject, string $correlativo, array $rows, string $siteUrl): string
{
    $tableRows = '';
    foreach ($rows as $label => $value) {
        $tableRows .= '<tr><td style="padding:8px 0;color:#717274;width:180px;vertical-align:top;font-size:13px;">' . h($label) . '</td>'
            . '<td style="padding:8px 0;color:#3A4066;font-size:14px;font-weight:500;">' . nl2br(h($value)) . '</td></tr>';
    }
    $content = '<tr><td style="padding:20px 32px 0;"><span style="display:inline-block;background:#B8242A;color:#FFFFFF;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:600;">' . h($correlativo) . '</span></td></tr>'
        . '<tr><td style="padding:24px 32px 32px;"><table width="100%" cellpadding="0" cellspacing="0">' . $tableRows . '</table></td></tr>';
    return emailLayout($subject, $content, $siteUrl);
}

function internalEmailText(string $subject, string $correlativo, array $rows): string
{
    $text = "{$subject} [{$correlativo}]\n\n";
    foreach ($rows as $label => $value) $text .= "{$label}: {$value}\n";
    return $text;
}

function confirmationEmailHtml(string $leadName, string $correlativo, string $siteUrl): string
{
    $greeting = $leadName !== '' ? 'Hola <strong>' . h($leadName) . '</strong>,' : 'Hola,';
    $content = '<tr><td style="padding:32px;">'
        . '<p style="margin:0 0 16px;color:#3A4066;font-size:15px;">' . $greeting . '</p>'
        . '<p style="margin:0 0 16px;color:#3F3F3F;font-size:14px;line-height:1.7;">Recibimos tu solicitud con el código <strong style="color:#B8242A;">' . h($correlativo) . '</strong>. Nuestro equipo se comunicará contigo en menos de 24 horas hábiles.</p>'
        . '<p style="margin:0;color:#717274;font-size:12px;">Este es un mensaje automático. Si necesitas agregar algo, responde a nuestro equipo citando tu código.</p>'
        . '</td></tr>';
    return emailLayout('Confirmación de tu solicitud', $content, $siteUrl);
}

function confirmationEmailText(string $leadName, string $correlativo, string $siteUrl): string
{
    $greeting = $leadName !== '' ? "Hola {$leadName}," : 'Hola,';
    return "{$greeting}\n\nRecibimos tu solicitud con el código {$correlativo}. Nuestro equipo se comunicará contigo en menos de 24 horas hábiles.\n\nMedical Digital · {$siteUrl}";
}
