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
                gold: {
                    100: "#FFF9C4",
                    200: "#FFF59D",
                    300: "#FFF176",
                    400: "#FFEE58",
                    500: "#FFD700", // Standard Gold
                    600: "#FFC107",
                    700: "#FFB300",
                    800: "#FFA000",
                    900: "#FF8F00",
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
