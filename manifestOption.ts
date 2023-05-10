import { ManifestOptions } from 'vite-plugin-pwa';

export const manifestOption: Partial<ManifestOptions> = {
  "name": "台灣天氣時鐘",
  "short_name": "TW天氣時鐘",
  "icons": [
    {
      "src": "icons8-clock-192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "icons8-clock-512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": "./index.html",
  "display": "fullscreen",
  "theme_color": "#000",
  "background_color": "#000",
  "description": "簡易的時鐘網頁附加台灣天氣資訊，舊手機變身實用桌鐘",
  "dir": "ltr",
  "lang": "zh-TW"
};
