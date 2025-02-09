# 天氣時鐘 Progressive Web App

Demo: https://ronnie-weather-clock.web.app

一個簡易的天氣時鐘網頁，讓舊手機也能成為天氣桌鐘繼續服役，起床時、出門前快速看一看，可更改顏色主題、每小時自動更新天氣資訊。

打包成PWA，支援 Android Chrome 或 iOS Safari「加到主畫面」選項，方便下載成 App 單獨使用。

# 開發環境
- [Bun](https://bun.sh) v1.2.1
- [Firebase CLI](https://firebase.google.com/docs/cli?hl=zh-tw)

# 架構

前後端分離架構：
- 前端 PWA 最初使用 [Create React App](https://github.com/facebookincubator/create-react-app)
建置，現已轉換使用 [Vite](https://vitejs.dev/)、[vitest](https://vitest.dev/) 與 [Vite PWA](https://vite-pwa-org.netlify.app/)。
- 後端 API 為 Firebase Functions 服務 (Node.js v20)，proxy 第三方服務API

### 平台
- [Firebase Hosting](https://firebase.google.com/docs/hosting) 託管靜態前端檔案
- [Firebase Functions](https://firebase.google.com/docs/functions) 部署 serverless functions

### 第三方服務
* 定位服務：[Google Geolocation API](https://developers.google.com/maps/documentation/geolocation/intro)
* 天氣資訊、地名查詢：[OpenWeatherMap API](https://openweathermap.org/api)

### 圖表套件
使用 [Chart.js](https://github.com/chartjs/Chart.js) 與 [Wrapper for React](https://github.com/reactchartjs/react-chartjs-2) 產生氣溫變化圖表，自製 Chart.js plugin 用以在折線圖上繪製天氣icon。

# 本機開發

## **第三方服務需求**：
- 需連結或新建 Firebase 專案，使用 functions（與 Hosting，選用）服務，參考 [Firebase 指南](https://firebase.google.com/docs/functions/get-started)
- 於 [Google Cloud 地圖平台](https://console.cloud.google.com/google/maps-apis/credentials)新增專案，並建立一組能呼叫 Geolocation API 的憑證金鑰
- 註冊 Open Weather Map 免費服務，建立一組 [API key](https://home.openweathermap.org/api_keys)

## 前端本機環境參數設定
於根目錄新建一個環境變數檔案 `.env.local` ，並寫入 Google Geolocation API 金鑰與 Firebase 專案ID：

```env .env.local
VITE_VAR_GEOLOCATION_API_KEY=Geolocation_API_Key
PROJECT_ID=Firebase_Project_ID
```

> Project ID 可在 Firebase web console 查看，也能從本機運行或部署 functions 時的終端機訊息中查找

## Firebase Functions 環境設定 密鑰參數
    
- 於 functions 資料夾下指令，將 Open Weather Map 提供的 API Key 設定為密鑰參數 `OPENWEATHER_KEY`：
    ```sh
    firebase functions:secrets:set OPENWEATHER_KEY  
    ```
    複製 API Key，於提示出現後的 hidden input 行貼上並 enter

    之後可用此指令查詢已輸入的值：
    ```sh
    firebase functions:secrets:access OPENWEATHER_KEY  
    ```
> 參考 [Firebase 文件: 設定環境-密鑰參數](https://firebase.google.com/docs/functions/config-env?hl=zh-tw&gen=2nd)

## 指令

***使用 [Bun](https://bun.sh/) 取代 Node.js 與 npm，作爲下一代執行環境(runtime)與套件管理工具(package manager)***

MacOS 使用 homebrew 安裝 bun
```sh
brew tap oven-sh/bun
brew install bun 
```

安裝依賴套件：
```sh
bun install
```

本機開發 web server：
```sh
# Run Vite at http://localhost:3000
bun start 
```

於 `functions` 目錄下運行本機 Firebase Functions：
```sh
cd functions
bun install

# 本機 API server 
# http://localhost:5000/project-id/region/functions
bun serve
```
