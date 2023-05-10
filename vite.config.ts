import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import { VitePWA } from 'vite-plugin-pwa';
import { manifestOption } from './manifestOption';

export default defineConfig({
  plugins: [
    react(),
    viteTsconfigPaths(),    
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      manifest: manifestOption,
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/openweathermap\.org\/img\/wn\/.*\.png$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'openweathermap-icons',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    }),
  ],
  build: {
    outDir: "build"
  },
});