import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}", "./data/**/*.{json}"],
  theme: {
    extend: {
      colors: {
        paddi: {
          ink: "#111827",
          navy: "#07111f",
          teal: "#1aa7a1",
          teal2: "#42c7c1",
          mint: "#e5fbf7",
          sand: "#fff7ed",
          rose: "#fff1f2",
          blue: "#eff6ff"
        }
      },
      boxShadow: {
        soft: "0 18px 50px -28px rgba(7, 17, 31, .45)",
        lift: "0 18px 42px -24px rgba(26, 167, 161, .42)"
      },
      borderRadius: { "2xl": "1.25rem", "3xl": "1.65rem" }
    }
  },
  plugins: [require("tailwindcss-animate")]
};
export default config;
