import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import { VitePWA } from 'vite-plugin-pwa';

/// <reference types="vitest" />
export default defineConfig({
  plugins: [
    react(),
    viteTsconfigPaths(),    
    VitePWA({
      injectRegister: 'auto'
    }),
  ],
  build: {
    outDir: "build"
  },
});