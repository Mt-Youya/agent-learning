/* Tailwind v4 requires @tailwindcss/postcss instead of tailwindcss directly.
   autoprefixer is no longer needed — Tailwind v4 bundles it.            */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
}

export default config
