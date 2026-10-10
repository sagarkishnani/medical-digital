<?php
// Plantilla de site-config.php: se sube a mano junto a send-email.php y nunca se versiona con valores reales.
return [
  'smtp_host'        => 'smtp.office365.com',
  'smtp_port'        => 587,
  'smtp_user'        => '',
  'smtp_pass'        => '',
  'from_name'        => 'Medical Digital Web',
  'fallback_email'   => '',
  'turnstile_secret' => '',
  'allowed_origins'  => [],
];
