import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],
  optimizeDeps: {
    exclude: ["@react-native-async-storage/async-storage"],
  },
  server: {
    // allowedHosts: bookmarks-east-liz-activists.trycloudflare.com["dicke-shoe-lil-equation.trycloudflare.com"],
    allowedHosts: true,
  },
});
