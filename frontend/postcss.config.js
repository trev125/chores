/**
 * PostCSS configuration
 * ---------------------
 * We use the standard Tailwind CSS v3 setup: Tailwind followed by Autoprefixer.
 * The previous entry `@tailwindcss/postcss` was a v4-alpha plugin and no longer
 * applies to the stable release we’re targeting.
 */
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
