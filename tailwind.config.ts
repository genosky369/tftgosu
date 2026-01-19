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
        // 다크 게이밍 테마 (시안 A)
        background: {
          DEFAULT: "#1a1a2e",
          card: "#16213e",
          header: "#0f0f1a",
        },
        accent: {
          bronze: "#cd7f32",
          worldrune: "#4ecdc4",
          pink: "#e94560",
          blue: "#0f3460",
          ryze: "#f97316", // 라이즈 시뮬레이터용 오렌지
        },
        text: {
          DEFAULT: "#eaeaea",
          sub: "#8892a0",
          muted: "#6c757d",
        },
      },
    },
  },
  plugins: [],
};

export default config;
