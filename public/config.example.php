<?php
// Plantilla de site-config.php: se sube a mano junto a send-email.php y nunca se versiona con valores reales.
return [
  // Microsoft Graph: app de Entra con "Application Mail.Send" limitado al buzón remitente (RBAC de Exchange).
  // client_secret es el "Valor" del secreto, no su ID; vence a los 24 meses.
  'graph_tenant_id'     => '86f3e28a-067a-4d87-bc50-c9941ea0f85f',
  'graph_client_id'     => '',
  'graph_client_secret' => '',
  'graph_sender'        => 'importaciones@medicaldigitalperu.com',
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
