/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#002A4E",
        accent: "#00C8E5",
        background: "#F9FAFB",
      },
    },
  },
  plugins: [],
};
