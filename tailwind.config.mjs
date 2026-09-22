/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    fontFamily: {
      sans: ['Rubik', 'system-ui', 'sans-serif'],
      heading: ['Rubik', 'system-ui', 'sans-serif'],
      mono: ['Space Mono', 'ui-monospace', 'monospace'],
    },
    /* Type scale. Headings use clamp(min = mobile, preferred, max = desktop) with
       a unitless line-height so it follows the clamp. Sizes are tokens on purpose:
       components should reach for `text-heading-lg`, not an arbitrary px value. */
    fontSize: {
      'heading-xxl': ['clamp(2.5rem, 5vw + 1rem, 4.25rem)',        { lineHeight: '1.1',  fontWeight: '500' }],
      'heading-xl':  ['clamp(2.25rem, 4.75vw + 0.75rem, 3.75rem)', { lineHeight: '1.1',  fontWeight: '500' }],
      'heading-lg':  ['clamp(2rem, 4.25vw + 0.5rem, 3.375rem)',    { lineHeight: '1.12', fontWeight: '500' }],
      'heading-md':  ['clamp(1.875rem, 3.5vw + 0.5rem, 3rem)',     { lineHeight: '1.14', fontWeight: '500' }],
      'heading-sm':  ['clamp(1.625rem, 3vw + 0.5rem, 2.5rem)',     { lineHeight: '1.16', fontWeight: '500' }],
      'heading-xs':  ['clamp(1.5rem, 2.25vw + 0.5rem, 2.125rem)',  { lineHeight: '1.2',  fontWeight: '500' }],

      'subtitle-lg': ['clamp(1.75rem, 2.5vw + 0.5rem, 2.375rem)',  { lineHeight: '1.1',  fontWeight: '500' }],
      'subtitle-md': ['clamp(1.5rem, 1.75vw + 0.5rem, 1.75rem)',   { lineHeight: '1.25', fontWeight: '500' }],
      'subtitle-sm': ['clamp(1.25rem, 1.25vw + 0.4rem, 1.375rem)', { lineHeight: '1.25', fontWeight: '500' }],

      'body-lg': ['20px', { lineHeight: '32px', fontWeight: '400' }],
      'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
      'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],

      'caption-sm': ['12px', { lineHeight: '16px', fontWeight: '400' }],
    },
    extend: {
      colors: {
        /* Brand ramp. `brand-primary` is the default step; the others are the
           darker/lighter stops used for hovers, borders and tinted surfaces. */
        brand: {
          primary: {
            darkest:  '#6D1E19',
            dark:     '#A32C26',
            DEFAULT:  '#D93B32',
            light:    '#EA938E',
            lightest: '#F9E2E0',
          },
          /* Azul marino de Medical Digital (títulos, hero, footer). Hex
             estimados desde el Figma: confirmar con el diseño. */
          secondary: {
            darkest:  '#111833',
            dark:     '#18214A',
            DEFAULT:  '#1F2B5B',
            light:    '#8C95B8',
            lightest: '#E6E9F2',
          },
        },
        semantics: {
          success: { dark: '#267C35', DEFAULT: '#37B24D', lightest: '#EBF7ED' },
          alert:   { dark: '#CA7900', DEFAULT: '#FC9700', lightest: '#FFF4D8' },
          error:   { dark: '#8C1D1D', DEFAULT: '#EB0E0E', lightest: '#F9EBEA' },
        },
        greyscale: {
          /* Rampa neutra FIJA. No depende del tema: es la paleta de grises, no
             los colores de la interfaz. Antes `darkest` apuntaba a BG_BASE, lo
             que solo funcionaba en oscuro — en claro el "gris más oscuro" habría
             sido blanco. */
          darkest:  '#16181D',
          dark:     '#3F3F3F',
          DEFAULT:  '#717274',
          light:    '#E5E7EB',
          lightest: '#F2F3F5',
          white:    '#FFFFFF',
        },

        /* ── Tokens semánticos del tema ──────────────────────────────────────
           Son los que usan los componentes. Cambiar el proyecto de claro a
           oscuro es cambiar estos seis valores (los deriva el generador desde
           `theme`), sin tocar una sola clase en el código.

           La regla: un componente nunca escribe `text-white/65` ni
           `bg-white/5`. Esas clases asumen fondo oscuro y son justo lo que
           impide cambiar de tema. */
        surface: {
          DEFAULT: '#FFFFFF',        // fondo de la página
          raised:  '#F5F5F5', // tarjetas y bloques elevados
        },
        content: {
          DEFAULT: '#1F2B5B',        // texto principal (azul marino de marca)
          muted:   '#4B5563',  // texto secundario
          subtle:  '#6B7280', // texto terciario, metadatos
        },
        line: {
          DEFAULT: '#E5E7EB',           // bordes y separadores
          strong:  '#CBD1D9',    // bordes de énfasis
        },
        /* Marca legible sobre el fondo de la página. NO es lo mismo que
           `brand-primary`: sobre blanco hay que usar un paso oscuro de la
           rampa y sobre negro uno claro. Un componente que quiere "texto en
           color de marca" pide `text-accent`, nunca `text-brand-primary-light`. */
        accent: '#A32C26',
      },
      borderRadius: {
        sm: '4px', md: '8px', lg: '12px', xl: '16px', '2xl': '24px',
      },
      /* Keyframes live here rather than in global.css: Tailwind's output is
         always bundled, a stray CSS file is only bundled if something imports it. */
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 600ms cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
