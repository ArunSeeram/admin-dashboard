import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          500: "#3159e8",
          600: "#2646c2",
          700: "#1d379a",
        },
      },
    },
  },
  plugins: [],
};
export default config;
