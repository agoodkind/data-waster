import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Set base URL for GitHub Pages deployment
  // In production, use the repository name as base path
  // In development, use root path
  const base = mode === 'production' ? '/data-waster/' : '/';
  
  return {
    base,
    plugins: [
      tsconfigPaths(),
      react(),
      tailwindcss(),
    ],
    publicDir: "public",
    
    server: {
      fs: {
        allow: ["src", "public"],
      },
    },
  };
});
