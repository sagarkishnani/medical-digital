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

  // Rebuild por webhook de WooCommerce (rebuild-hook.php). Con alguna vacía, el relevo responde 503.
  // webhook_secret: openssl rand -hex 32; es el mismo que va en los webhooks de Woo.
  'webhook_secret'   => '',
  'github_repo'      => 'sagarkishnani/medical-digital',
  // Token fine-grained con Contents read and write, solo sobre este repo.
  'github_token'     => '',
];
