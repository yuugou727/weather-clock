# 天氣時鐘 Progressive Web App

Demo: https://ronnie-weather-clock.web.app

一個簡易的天氣時鐘網頁，讓舊手機也能成為天氣桌鐘繼續服役，起床時、出門前快速看一看，可更改顏色主題、每小時自動更新天氣資訊。

打包成PWA，支援 Android Chrome 或 iOS Safari「加到主畫面」選項，方便下載成 App 單獨使用。

# 架構

前後端分離架構：
- 前端 PWA 使用 [Create React App](https://github.com/facebookincubator/create-react-app)
建置。尚未 `yarn eject` ，更多開發說明可參考[原README](README-react.md)
- 後端 API 為 Firebase Functions (Node.js)，proxy 第三方服務API

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

## 前端本機環境設定
於根目錄新建一個環境變數檔案 `.env.local` ，並寫入 Google Geolocation API 金鑰與 Firebase 專案ID：

```env .env.local
REACT_APP_GEOLOCATION_API_KEY=Geolocation_API_Key
PROJECT_ID=Firebase_Project_ID
```

> Project ID 可在 Firebase web console 查看，也能從本機運行或部署 functions 時的終端機訊息中查找

## Firebase Functions 環境設定
    
- 於 functions 資料夾下指令，將 Open Weather Map 的 API Key 設定至環境變數：
    ```sh
    firebase functions:config:set openweather.key="Weather_API_Key"
    ```
- 下指令產生`.runtimeconfig.json` 檔案用以本機模擬變數使用：
    ```sh
    firebase functions:config:get > .runtimeconfig.json
    ```
    > 參考 [Run functions locally](https://firebase.google.com/docs/functions/local-emulator) 與 [為 function 設定環境變數](https://firebase.google.com/docs/functions/config-env)

## 指令

本機開發 web server：
```sh
# Run React at http://localhost:3000
npm run start
```
於 `functions` 目錄下運行本機 Firebase Functions：
```sh
cd functions
npm run serve
# http://localhost:5000/project-id/region/functions
```
