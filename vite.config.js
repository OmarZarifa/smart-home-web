import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Ensures the server binds to all network interfaces
    port: process.env.PORT || 3000, // Use Render's port or default
    allowedHosts: ["smart-home-bov6.onrender.com"],
  },
  preview: {
    port: 3000,
  },
  css: {
    postcss: "./postcss.config.js",
  },
});
