import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["bippy/dist/jsx-runtime", "bippy/dist/jsx-dev-runtime"]
  },
  build: {
    // Disable minification which is very memory intensive
    minify: false,
    // Set sourcemap to false to reduce memory usage during build
    sourcemap: false,
    rollupOptions: {
      output: {
      },
    },
    // You might want to adjust this value based on your project's size
    chunkSizeWarningLimit: 1000,
  }
});