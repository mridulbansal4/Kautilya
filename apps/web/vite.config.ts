import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The frontend RENDERS; the backend THINKS. Proxy /v1 so the web app never needs to know the
// backend host. Port + API target are env-configurable so the stack can run on non-default ports.
//   VITE_PORT        — dev server port (default 5173)
//   VITE_API_TARGET  — backend base URL the /v1 proxy forwards to (default http://localhost:8000)
// VITE_MOCK=1 bypasses the proxy entirely and uses bundled fixtures.
const PORT = Number(process.env.VITE_PORT) || 5173;
const API_TARGET = process.env.VITE_API_TARGET || "http://localhost:8000";

export default defineConfig({
  plugins: [react()],
  server: {
    port: PORT,
    strictPort: false,
    proxy: {
      "/v1": {
        target: API_TARGET,
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
