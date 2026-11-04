<?php
declare(strict_types=1);

date_default_timezone_set('America/Lima');
ini_set('display_errors', '0');

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 600;
const MAX_LINK_LENGTH = 500;
const DATA_DIR = __DIR__ . '/data';
const GRAPH_URL = 'https://graph.microsoft.com/v1.0';

// Debe coincidir con FORM_FIELDS de src/utils/formValidation.ts.
const FORMS = [
    'contacto' => [
        'prefix'  => 'CON',
        'subject' => 'Nuevo contacto web',
        'fields'  => [
            'firstName'   => ['label' => 'Nombre', 'required' => true, 'kind' => 'name', 'min' => 3, 'max' => 50],
            'lastName'    => ['label' => 'Apellidos', 'required' => true, 'kind' => 'name', 'min' => 3, 'max' => 100],
            'phone'       => ['label' => 'Teléfono', 'required' => true, 'kind' => 'phone', 'max' => 11],
            'email'       => ['label' => 'Correo', 'required' => true, 'kind' => 'email', 'max' => 100],
            'position'    => ['label' => 'Cargo', 'min' => 3, 'max' => 50],
            'institution' => ['label' => 'Institución', 'required' => true, 'min' => 3, 'max' => 100],
            'location'    => ['label' => 'Ubicación', 'required' => true, 'max' => 120],
            'specialty'   => ['label' => 'Especialidad', 'max' => 120],
            'message'     => ['label' => 'Mensaje', 'kind' => 'message', 'min' => 10, 'max' => 500],
        ],
    ],
    'cotizacion' => [
        'prefix'  => 'COT',
        'subject' => 'Nueva solicitud de cotización',
        'fields'  => [
            'product'     => ['label' => 'Producto', 'kind' => 'reference', 'max' => MAX_LINK_LENGTH],
            'productUrl'  => ['label' => 'Enlace del producto', 'kind' => 'url', 'max' => MAX_LINK_LENGTH],
            'name'        => ['label' => 'Nombre y apellido', 'required' => true, 'kind' => 'name', 'min' => 3, 'max' => 100],
            'institution' => ['label' => 'Institución', 'required' => true, 'min' => 3, 'max' => 100],
            'email'       => ['label' => 'Correo', 'required' => true, 'kind' => 'email', 'max' => 100],
            'phone'       => ['label' => 'Teléfono', 'required' => true, 'kind' => 'phone', 'max' => 11],
            'message'     => ['label' => 'Cantidad, plazo o consulta', 'kind' => 'message', 'min' => 10, 'max' => 500],
        ],
    ],
    'servicio-tecnico' => [
        'prefix'  => 'SVT',
        'subject' => 'Nueva solicitud de servicio técnico',
        'fields'  => [
            'firstName'   => ['label' => 'Nombres', 'required' => true, 'kind' => 'name', 'min' => 3, 'max' => 50],
            'lastName'    => ['label' => 'Apellidos', 'required' => true, 'kind' => 'name', 'min' => 3, 'max' => 100],
            'email'       => ['label' => 'Correo', 'required' => true, 'kind' => 'email', 'max' => 100],
            'phone'       => ['label' => 'Teléfono', 'required' => true, 'kind' => 'phone', 'max' => 11],
            'institution' => ['label' => 'Institución', 'required' => true, 'min' => 3, 'max' => 100],
            'brand'       => ['label' => 'Marca', 'required' => true, 'min' => 2, 'max' => 50],
            'model'       => ['label' => 'Modelo', 'required' => true, 'min' => 1, 'max' => 50],
            'serial'      => ['label' => 'Serie', 'required' => true, 'min' => 1, 'max' => 50],
            'message'     => ['label' => 'Mensaje del incidente', 'required' => true, 'kind' => 'message', 'min' => 10, 'max' => 500],
        ],
    ],
];

const ERROR_MESSAGES = [
    'required' => 'Este campo es obligatorio.',
    'name'     => 'Usa solo letras, espacios, apóstrofo o guion.',
    'email'    => 'Ingresa un correo válido, por ejemplo nombre@institucion.com.',
    'phone'    => 'Ingresa un teléfono válido, solo números, de 7 a 11 dígitos.',
    'consent'  => 'Debes aceptar la política de datos personales.',
];

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

set_exception_handler(function (Throwable $exception): void {
    error_log('send-email: ' . $exception->getMessage());
    respond(500, ['success' => false, 'error' => 'No se pudo enviar el formulario.']);
});

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

$graph = [];
foreach (['tenant_id', 'client_id', 'client_secret', 'sender'] as $key) {
    $graph[$key] = trim((string) ($config["graph_{$key}"] ?? ''));
}
if (in_array('', $graph, true) || !filter_var($graph['sender'], FILTER_VALIDATE_EMAIL)) {
    error_log('send-email: credenciales de Microsoft Graph vacías en site-config.php');
    respond(503, ['success' => false, 'error' => 'El envío de formularios no está configurado.']);
}

$input = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($input)) respond(400, ['success' => false, 'error' => 'Solicitud inválida.']);

// Los bots llenan el campo oculto: un falso éxito evita que reintenten.
if (stringValue($input['website'] ?? '') !== '') respond(200, ['success' => true]);

$clientIp = (string) ($_SERVER['REMOTE_ADDR'] ?? '');
if (!allowByRateLimit(hash('sha256', $clientIp . $graph['sender']))) {
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
$siteUrl = siteUrl();

try {
    $token = graphToken($graph);
    graphSendMail($token, $graph['sender'], [
        'subject'      => "{$form['subject']} [{$correlativo}] - {$leadName}",
        'body'         => ['contentType' => 'HTML', 'content' => internalEmailHtml($form['subject'], $correlativo, emailRows($form['fields'], $values), $siteUrl)],
        'toRecipients' => array_map(fn ($recipient) => graphAddress($recipient), $recipients),
        'replyTo'      => [graphAddress($leadEmail, $leadName)],
    ]);
} catch (RuntimeException $exception) {
    error_log('send-email: ' . $exception->getMessage());
    respond(500, ['success' => false, 'error' => 'No se pudo enviar el formulario.']);
}

try {
    graphSendMail($token, $graph['sender'], [
        'subject'      => "Recibimos tu solicitud [{$correlativo}] — Medical Digital",
        'body'         => ['contentType' => 'HTML', 'content' => confirmationEmailHtml($leadName, $correlativo, $siteUrl)],
        'toRecipients' => [graphAddress($leadEmail, $leadName)],
        'replyTo'      => [graphAddress($recipients[0])],
    ]);
} catch (RuntimeException $exception) {
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

function requestOrigin(): string
{
    $https = ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https'
        || (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
    return ($https ? 'https' : 'http') . '://' . strtolower((string) ($_SERVER['HTTP_HOST'] ?? ''));
}

function applyCors(mixed $allowedOrigins): void
{
    $origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
    if ($origin === '') return;

    if (strtolower(rtrim($origin, '/')) === requestOrigin()) return;

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
    [$status, $response] = httpPost(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        ['Content-Type: application/x-www-form-urlencoded'],
        http_build_query($fields),
    );
    if ($status !== 200) return false;

    $data = json_decode($response, true);
    return is_array($data) && !empty($data['success']);
}

// Devuelve [código HTTP, cuerpo]; un fallo de red es [0, ''].
function httpPost(string $url, array $headers, string $body): array
{
    if (function_exists('curl_init')) {
        $curl = curl_init($url);
        curl_setopt_array($curl, [
            CURLOPT_POST           => true,
            CURLOPT_HTTPHEADER     => $headers,
            CURLOPT_POSTFIELDS     => $body,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT        => 15,
        ]);
        $response = curl_exec($curl);
        $status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
        $failed = $response === false || curl_errno($curl) !== 0;
        return $failed ? [0, ''] : [$status, (string) $response];
    }

    $context = stream_context_create(['http' => [
        'method'        => 'POST',
        'header'        => implode("\r\n", $headers),
        'content'       => $body,
        'timeout'       => 15,
        'ignore_errors' => true,
    ]]);
    $response = @file_get_contents($url, false, $context);
    if ($response === false) return [0, ''];
    preg_match('#^HTTP/\S+\s+(\d{3})#', (string) ($http_response_header[0] ?? ''), $match);
    return [(int) ($match[1] ?? 0), $response];
}

// Token de aplicación (client credentials). El permiso Mail.Send está limitado al buzón
// remitente con RBAC de Exchange, no en Entra: ver specs/11-envio-de-formularios.md.
function graphToken(array $graph): string
{
    [$status, $response] = httpPost(
        'https://login.microsoftonline.com/' . rawurlencode($graph['tenant_id']) . '/oauth2/v2.0/token',
        ['Content-Type: application/x-www-form-urlencoded'],
        http_build_query([
            'client_id'     => $graph['client_id'],
            'client_secret' => $graph['client_secret'],
            'scope'         => 'https://graph.microsoft.com/.default',
            'grant_type'    => 'client_credentials',
        ]),
    );
    $data = json_decode($response, true);
    if ($status !== 200 || !is_string($data['access_token'] ?? null)) {
        throw new RuntimeException("token de Graph rechazado ({$status}): " . (string) ($data['error'] ?? 'sin respuesta'));
    }
    return $data['access_token'];
}

function graphSendMail(string $token, string $sender, array $message): void
{
    [$status, $response] = httpPost(
        GRAPH_URL . '/users/' . rawurlencode($sender) . '/sendMail',
        ['Authorization: Bearer ' . $token, 'Content-Type: application/json'],
        (string) json_encode(['message' => $message, 'saveToSentItems' => false], JSON_UNESCAPED_UNICODE),
    );
    if ($status !== 202) {
        $data = json_decode($response, true);
        throw new RuntimeException("sendMail rechazado ({$status}): " . (string) ($data['error']['code'] ?? 'sin respuesta'));
    }
}

function graphAddress(string $email, string $name = ''): array
{
    return ['emailAddress' => $name !== '' ? ['address' => $email, 'name' => $name] : ['address' => $email]];
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

function validateSubmission(array $fields, array $input): array
{
    $values = [];
    $errors = [];

    foreach ($fields as $name => $rule) {
        $kind = $rule['kind'] ?? 'text';
        $value = cleanText(stringValue($input[$name] ?? ''), $kind === 'message');
        $minLength = $rule['min'] ?? 0;
        $maxLength = $rule['max'];

        if ($kind === 'url' && $value !== '' && !preg_match('#^https?://#i', $value)) $value = '';
        if (in_array($kind, ['reference', 'url'], true)) $value = mb_substr($value, 0, $maxLength);

        if ($value === '') {
            if (!empty($rule['required'])) $errors[$name] = ERROR_MESSAGES['required'];
        } elseif ($kind === 'phone') {
            if (!preg_match('/^\d{7,11}$/', $value)) $errors[$name] = ERROR_MESSAGES['phone'];
        } elseif (mb_strlen($value) < $minLength) {
            $errors[$name] = "Escribe al menos {$minLength} caracteres.";
        } elseif (mb_strlen($value) > $maxLength) {
            $errors[$name] = "Escribe como máximo {$maxLength} caracteres.";
        } elseif ($kind === 'email' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
            $errors[$name] = ERROR_MESSAGES['email'];
        } elseif ($kind === 'name' && !preg_match("/^[\\p{L}\\s'-]+$/u", $value)) {
            $errors[$name] = ERROR_MESSAGES['name'];
        }
        $values[$name] = $value;
    }

    $consent = $input['consent'] ?? false;
    if ($consent !== true && $consent !== 'true') $errors['consent'] = ERROR_MESSAGES['consent'];

    return [$values, $errors];
}

function siteUrl(): string
{
    $directory = rtrim(str_replace('\\', '/', dirname((string) ($_SERVER['SCRIPT_NAME'] ?? '/'))), '/');
    return requestOrigin() . $directory . '/';
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
