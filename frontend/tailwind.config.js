import civicTheme from "@civic/design-system";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    presets: [civicTheme],
    theme: {
        extend: {},
    },
    plugins: [],
}
