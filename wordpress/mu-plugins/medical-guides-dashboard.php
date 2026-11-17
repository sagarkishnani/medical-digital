<?php
/**
 * Plugin Name: Medical Digital · Guías del sistema
 * Description: Muestra en el Escritorio de WordPress la guía en video y la guía en PDF del sistema. Un administrador las elige desde "Configurar" en el propio widget (biblioteca de medios o URL; el video acepta YouTube y Vimeo).
 * Version: 1.0.0
 * Requires PHP: 8.0
 */

defined('ABSPATH') || exit;

const MEDICAL_GUIDES_WIDGET_ID = 'medical_guides_dashboard';
const MEDICAL_GUIDES_OPTION = 'medical_guides_dashboard';
const MEDICAL_GUIDES_EDIT_CAP = 'manage_options';

add_action('wp_dashboard_setup', 'medical_guides_register_widget');
add_action('admin_enqueue_scripts', 'medical_guides_enqueue_media');

function medical_guides_register_widget(): void
{
    wp_add_dashboard_widget(
        MEDICAL_GUIDES_WIDGET_ID,
        'Guías del sistema',
        'medical_guides_render_widget',
        current_user_can(MEDICAL_GUIDES_EDIT_CAP) ? 'medical_guides_render_control' : null,
        null,
        'normal',
        'high'
    );
    medical_guides_move_to_top();
}

// 'high' lo deja arriba de su columna, pero un widget que el usuario ya movió conserva su orden guardado.
function medical_guides_move_to_top(): void
{
    global $wp_meta_boxes;
    $normal = &$wp_meta_boxes['dashboard']['normal']['high'];
    if (!isset($normal[MEDICAL_GUIDES_WIDGET_ID])) {
        return;
    }
    $widget = [MEDICAL_GUIDES_WIDGET_ID => $normal[MEDICAL_GUIDES_WIDGET_ID]];
    $normal = $widget + $normal;
}

/** @return array{video_url: string, pdf_url: string} */
function medical_guides_get(): array
{
    $saved = get_option(MEDICAL_GUIDES_OPTION, []);
    return [
        'video_url' => is_array($saved) ? (string)($saved['video_url'] ?? '') : '',
        'pdf_url'   => is_array($saved) ? (string)($saved['pdf_url'] ?? '') : '',
    ];
}

function medical_guides_render_widget(): void
{
    $guides = medical_guides_get();

    if ($guides['video_url'] === '' && $guides['pdf_url'] === '') {
        echo '<p>Todavía no hay guías cargadas.';
        if (current_user_can(MEDICAL_GUIDES_EDIT_CAP)) {
            echo ' Usa <strong>Configurar</strong>, en la cabecera de este recuadro, para agregarlas.';
        }
        echo '</p>';
        return;
    }

    if ($guides['video_url'] !== '') {
        echo '<h3 style="margin:0 0 8px">Guía en video</h3>';
        echo '<div class="medical-guides-video" style="margin-bottom:16px">' . medical_guides_video_html($guides['video_url']) . '</div>';
    }

    if ($guides['pdf_url'] !== '') {
        $pdf = esc_url($guides['pdf_url']);
        echo '<h3 style="margin:0 0 8px">Guía en PDF</h3>';
        echo '<p style="display:flex;gap:8px;flex-wrap:wrap;margin:0">';
        echo '<a class="button button-primary" href="' . $pdf . '" target="_blank" rel="noopener">Abrir guía PDF</a>';
        echo '<a class="button" href="' . $pdf . '" download>Descargar</a>';
        echo '</p>';
    }
}

function medical_guides_video_html(string $url): string
{
    $path = (string)wp_parse_url($url, PHP_URL_PATH);
    $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));

    if (in_array($extension, wp_get_video_extensions(), true)) {
        return wp_video_shortcode(['src' => $url, 'preload' => 'metadata']);
    }

    $embed = wp_oembed_get($url, ['width' => 640]);
    if ($embed) {
        return '<div style="position:relative;padding-top:56.25%">'
            . preg_replace('/<iframe /', '<iframe style="position:absolute;inset:0;width:100%;height:100%" ', $embed, 1)
            . '</div>';
    }

    return '<a class="button" href="' . esc_url($url) . '" target="_blank" rel="noopener">Ver guía en video</a>';
}

// WordPress verifica el nonce del formulario (edit-dashboard-widget_<id>) antes de llamar a este callback.
function medical_guides_render_control(): void
{
    if (!current_user_can(MEDICAL_GUIDES_EDIT_CAP)) {
        return;
    }

    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && isset($_POST['medical_guides'])) {
        $input = wp_unslash((array)$_POST['medical_guides']);
        update_option(MEDICAL_GUIDES_OPTION, [
            'video_url' => esc_url_raw(trim((string)($input['video_url'] ?? ''))),
            'pdf_url'   => esc_url_raw(trim((string)($input['pdf_url'] ?? ''))),
        ], false);
        return;
    }

    $guides = medical_guides_get();
    $fields = [
        'video_url' => ['Guía en video', 'video', 'Un video de la biblioteca de medios o un enlace de YouTube o Vimeo.'],
        'pdf_url'   => ['Guía en PDF', 'application/pdf', 'Un PDF de la biblioteca de medios o su URL.'],
    ];

    foreach ($fields as $key => [$label, $mediaType, $help]) {
        $id = "medical-guides-$key";
        echo '<p><label for="' . esc_attr($id) . '"><strong>' . esc_html($label) . '</strong></label><br>';
        echo '<span style="display:flex;gap:6px">';
        echo '<input type="url" class="widefat" id="' . esc_attr($id) . '" name="medical_guides[' . esc_attr($key) . ']" value="' . esc_attr($guides[$key]) . '">';
        echo '<button type="button" class="button medical-guides-pick" data-target="' . esc_attr($id) . '" data-type="' . esc_attr($mediaType) . '">Biblioteca</button>';
        echo '</span>';
        echo '<span class="description">' . esc_html($help) . ' Déjalo vacío para no mostrarla.</span></p>';
    }
}

function medical_guides_enqueue_media(string $hook): void
{
    if ($hook !== 'index.php' || !current_user_can(MEDICAL_GUIDES_EDIT_CAP)) {
        return;
    }

    wp_enqueue_media();
    wp_add_inline_script('media-editor', <<<'JS'
document.addEventListener('click', function (event) {
    var button = event.target.closest('.medical-guides-pick');
    if (!button) return;
    event.preventDefault();
    var frame = wp.media({
        title: 'Elegir archivo',
        button: { text: 'Usar este archivo' },
        library: { type: button.dataset.type },
        multiple: false
    });
    frame.on('select', function () {
        var file = frame.state().get('selection').first().toJSON();
        document.getElementById(button.dataset.target).value = file.url;
    });
    frame.open();
});
JS);
}
