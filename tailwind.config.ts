import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                border: "var(--border)",
                input: "var(--input)",
                ring: "var(--ring)",
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: {
                    DEFAULT: "var(--primary)",
                    foreground: "var(--primary-foreground)",
                },
                secondary: {
                    DEFAULT: "var(--secondary)",
                    foreground: "var(--secondary-foreground)",
                },
                destructive: {
                    DEFAULT: "var(--destructive)",
                    foreground: "var(--destructive-foreground)",
                },
                muted: {
                    DEFAULT: "var(--muted)",
                    foreground: "var(--muted-foreground)",
                },
                accent: {
                    DEFAULT: "var(--accent)",
                    foreground: "var(--accent-foreground)",
                },
                popover: {
                    DEFAULT: "var(--popover)",
                    foreground: "var(--popover-foreground)",
                },
                card: {
                    DEFAULT: "var(--card)",
                    foreground: "var(--card-foreground)",
                },
                // Remap Gold to Pink scale to enforce new theme
                gold: {
                    100: "#fce7f3", // Pink 100
                    200: "#fbcfe8", // Pink 200
                    300: "#f9a8d4", // Pink 300
                    400: "#f472b6", // Pink 400
                    500: "#ec4899", // Pink 500 (Primary)
                    600: "#db2777", // Pink 600
                    700: "#be185d", // Pink 700
                    800: "#9d174d", // Pink 800
                    900: "#831843", // Pink 900
                },
            },
            animation: {
                "border-shine": "border-shine 2s linear infinite",
            },
            keyframes: {
                "border-shine": {
                    "0%": { backgroundPosition: "0% 50%" },
                    "100%": { backgroundPosition: "200% 50%" },
                },
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
export default config;
