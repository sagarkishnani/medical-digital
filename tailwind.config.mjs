/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    fontFamily: {
      sans: ['Rubik', 'system-ui', 'sans-serif'],
      heading: ['Rubik', 'system-ui', 'sans-serif'],
      mono: ['Space Mono', 'ui-monospace', 'monospace'],
    },
    fontSize: {
      display:      ['56px', { lineHeight: '62px', fontWeight: '500' }],
      'heading-h1': ['44px', { lineHeight: '53px', fontWeight: '500' }],
      'heading-h2': ['32px', { lineHeight: '40px', fontWeight: '500' }],
      'heading-h3': ['24px', { lineHeight: '31px', fontWeight: '500' }],
      'heading-h4': ['20px', { lineHeight: '28px', fontWeight: '500' }],
      subtitle:     ['16px', { lineHeight: '24px', fontWeight: '500' }],
      'body-lg':    ['18px', { lineHeight: '27px', fontWeight: '400' }],
      'body-md':    ['16px', { lineHeight: '24px', fontWeight: '400' }],
      'body-sm':    ['14px', { lineHeight: '21px', fontWeight: '400' }],
      caption:      ['12px', { lineHeight: '17px', fontWeight: '400' }],
      overline:     ['12px', { lineHeight: '17px', fontWeight: '500' }],
      link:         ['16px', { lineHeight: '24px', fontWeight: '500' }],
      stat:         ['40px', { lineHeight: '44px', fontWeight: '500' }],

      'heading-xxl': ['clamp(2.5rem, 5vw + 1rem, 4.25rem)',        { lineHeight: '1.1',  fontWeight: '500' }],
      'heading-xl':  ['clamp(2.25rem, 4.75vw + 0.75rem, 3.75rem)', { lineHeight: '1.1',  fontWeight: '500' }],
      'heading-lg':  ['clamp(2rem, 4.25vw + 0.5rem, 3.375rem)',    { lineHeight: '1.12', fontWeight: '500' }],
      'heading-md':  ['clamp(1.875rem, 3.5vw + 0.5rem, 3rem)',     { lineHeight: '1.14', fontWeight: '500' }],
      'heading-sm':  ['clamp(1.625rem, 3vw + 0.5rem, 2.5rem)',     { lineHeight: '1.16', fontWeight: '500' }],
      'heading-xs':  ['clamp(1.5rem, 2.25vw + 0.5rem, 2.125rem)',  { lineHeight: '1.2',  fontWeight: '500' }],

      'subtitle-lg': ['clamp(1.75rem, 2.5vw + 0.5rem, 2.375rem)',  { lineHeight: '1.1',  fontWeight: '500' }],
      'subtitle-md': ['clamp(1.5rem, 1.75vw + 0.5rem, 1.75rem)',   { lineHeight: '1.25', fontWeight: '500' }],
      'subtitle-sm': ['clamp(1.25rem, 1.25vw + 0.4rem, 1.375rem)', { lineHeight: '1.25', fontWeight: '500' }],

      'caption-sm': ['12px', { lineHeight: '16px', fontWeight: '400' }],
    },
    extend: {
      colors: {
        brand: {
          primary: {
            darkest:  '#8E1A1F',
            dark:     '#B8242A',
            DEFAULT:  '#E83C3E',
            medium:   '#E83C3E',
            light:    '#F4A3A4',
            lightest: '#FDECEC',
          },
          secondary: {
            darkest:  '#0F1226',
            dark:     '#1C2140',
            DEFAULT:  '#3A4066',
            medium:   '#3A4066',
            light:    '#9A9EB5',
            lightest: '#ECEDF3',
          },
          tertiary: {
            darkest:  '#0F2C63',
            dark:     '#18459A',
            DEFAULT:  '#3D68C2',
            medium:   '#3D68C2',
            light:    '#B3C3E3',
            lightest: '#EEF2FA',
          },
        },
        semantics: {
          success: {
            darkest:  '#1E612A',
            dark:     '#267C35',
            DEFAULT:  '#37B24D',
            medium:   '#37B24D',
            light:    '#73C982',
            lightest: '#EBF7ED',
          },
          alert: {
            darkest:  '#7E4B00',
            dark:     '#CA7900',
            DEFAULT:  '#FC9700',
            medium:   '#FC9700',
            light:    '#FCDA6A',
            lightest: '#FFF4D8',
          },
          error: {
            darkest:  '#6E1717',
            dark:     '#8C1D1D',
            DEFAULT:  '#D11A1A',
            medium:   '#D11A1A',
            light:    '#D96A6A',
            lightest: '#F9EBEA',
          },
        },
        greyscale: {
          darkest:  '#0A0A0A',
          dark:     '#3F3F3F',
          DEFAULT:  '#717274',
          medium:   '#717274',
          light:    '#E5E7EB',
          lightest: '#F2F3F5',
          white:    '#FFFFFF',
        },
        background: {
          white: '#FFFFFF',
          soft:  '#F7F7F8',
        },

        surface: {
          DEFAULT: '#FFFFFF',
          raised:  '#F7F7F8',
        },
        content: {
          DEFAULT: '#3A4066',
          muted:   '#3F3F3F',
          subtle:  '#717274',
        },
        line: {
          DEFAULT: '#E5E7EB',
        },
        accent: '#B8242A',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(90deg, #1C2140 0%, #18459A 100%)',
        'gradient-overlay': 'linear-gradient(90deg, rgb(28 33 64 / 0.92) 0%, rgb(28 33 64 / 0) 100%)',
      },
      borderRadius: {
        sm: '4px', md: '8px', lg: '12px', xl: '16px', '2xl': '24px', pill: '999px',
      },
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
