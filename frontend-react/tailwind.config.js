/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "surface": "#f8f9ff",
        "secondary": "#516070",
        "inverse-primary": "#b8c4ff",
        "on-primary-fixed": "#001453",
        "on-secondary-fixed-variant": "#3a4858",
        "surface-container-highest": "#d3e4fe",
        "primary-container": "#1e40af",
        "tertiary-container": "#872d00",
        "background": "#f8f9ff", /**{màu trắng xanh nhạt}**/
        "background-2": "#fdfdff", /**{màu trắng}**/

        // "surface-container-item": "#fdfdff", /**{màu item con}**/
        "surface-container-item": "#fdfdff", /**{màu item con}**/

        "inverse-surface": "#213145",
        "on-primary-container": "#a8b8ff",
        "on-primary-fixed-variant": "#173bab",
        "surface-variant": "#d3e4fe",
        "outline-variant": "#c4c5d5",
        "on-primary": "#ffffff",
        "primary-fixed-dim": "#b8c4ff",
        "on-error": "#ffffff",
        "outline": "#757684",
        "primary": "#00288e",
        "on-secondary": "#ffffff",
        "tertiary": "#611e00",
        "on-background": "#0b1c30",
        "on-tertiary": "#ffffff",
        "secondary-fixed": "#d5e4f8",
        "on-secondary-container": "#576676",
        "surface-container-high": "#dce9ff",
        "primary-fixed": "#dde1ff",
        "tertiary-fixed": "#ffdbce",
        "on-tertiary-fixed": "#380d00",
        "surface-dim": "#cbdbf5",
        "error-container": "#ffdad6",
        "surface-container": "#e5eeff",
        "surface-container-low": "#eff4ff",
        "on-surface-variant": "#444653",
        "on-tertiary-fixed-variant": "#802a00",
        "on-secondary-fixed": "#0e1d2b",
        "on-tertiary-container": "#ffa583",
        "inverse-on-surface": "#eaf1ff",
        "on-error-container": "#93000a",
        "secondary-container": "#d5e4f8",
        "surface-bright": "#f8f9ff",
        "surface-container-lowest": "#ffffff",
        "surface-tint": "#3755c3",
        "error": "#ba1a1a",
        "secondary-fixed-dim": "#b9c8db",
        "tertiary-fixed-dim": "#ffb59a"
      },
      spacing: {
        "margin-mobile": "20px",
        "unit": "8px",
        "gutter": "24px",
        "margin-desktop": "64px",
        "container-max": "1280px",
        "section-padding": "80px"
      },
      fontFamily: {
        "body-lg": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "h2": ["Montserrat", "sans-serif"],
        "h3": ["Montserrat", "sans-serif"],
        "label-sm": ["Inter", "sans-serif"],
        "h1": ["Montserrat", "sans-serif"]
      },
      fontSize: {
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        "h2": ["36px", { lineHeight: "1.3", fontWeight: "700" }],
        "h3": ["24px", { lineHeight: "1.4", fontWeight: "600" }],
        "label-sm": ["14px", { lineHeight: "1.4", fontWeight: "600" }],
        "h1": ["48px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }]
      }
    },
  },
  plugins: [],
}