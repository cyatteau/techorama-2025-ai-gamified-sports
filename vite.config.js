// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // force Vite to pre-bundle these
    include: ["esri-leaflet", "esri-leaflet-vector"],
  },
  resolve: {
    alias: {
      // if you need the UMD builds instead:
      "esri-leaflet$": "esri-leaflet/dist/esri-leaflet.js",
      "esri-leaflet-vector$": "esri-leaflet-vector/dist/esri-leaflet-vector.js",
    },
  },
});
