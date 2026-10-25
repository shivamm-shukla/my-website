import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: { extend: { colors: { canvas: "var(--bg)", ink: "var(--fg)", accent: "var(--accent)" } } },
  plugins: [],
} satisfies Config;
