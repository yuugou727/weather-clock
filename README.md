# 天氣時鐘 Progressive Web App

Demo: https://ronnie-weather-clock.web.app

一個簡易的天氣時鐘網頁，讓舊手機也能成為天氣桌鐘繼續服役，起床時、出門前快速看一看，可更改顏色主題、每小時自動更新天氣資訊。

打包成PWA，支援 Android Chrome 或 iOS Safari「加到主畫面」選項，方便下載成 App 單獨使用。

# 開發

[Create React App](https://github.com/facebookincubator/create-react-app)
建置。尚未 `yarn eject` ，更多開發說明可參考[原README](README-react.md)。

## 第三方

氣溫變化圖表使用 [Chart.js](https://github.com/chartjs/Chart.js) 與 [Wrapper for React](https://github.com/reactchartjs/react-chartjs-2)，自製 Chart.js plugin 用以在折線圖上繪製天氣icon。

使用 Firebase Hosting 部署與 Firebase Functions 實作 proxy server 介接以下 API:
* 定位服務：[Google Geolocation API](https://developers.google.com/maps/documentation/geolocation/intro)
* 天氣資訊、Geocoding：[OpenWeatherMap API](https://openweathermap.org/api)

## 本機開發

**需求**：
- 新建 Firebase 專案
- Google Cloud Platform Geolocation API 
- Open Weather Map API 的金鑰憑證。

### React app 設定
於根目錄新建檔案 `.env.local` ，並寫入一行 `REACT_APP_GCP_KEY` 帶入 Google Cloud Platform 的金鑰：
```.env.local
REACT_APP_GCP_KEY=你的GoogleCloud金鑰
```

### Firebase Functions 設定
需連結或新建 Firebase 專案，並使用 functions（與 hosting，選用）服務，參考 [Firebase 指南](https://firebase.google.com/docs/functions/get-started)

> Firebase 專案的 `PROJECT_ID`、Hosting 網域可在 Firebase web console 查看，也會出現在模擬、部署 functions 時的終端機訊息中

- 置換 `.env` 檔案中 `REACT_APP_API` 路徑的 PROJECT_ID
    ```.env
    REACT_APP_API=http://localhost:5000/PROJECT_ID/us-central1/
    ```
- 於 functions 資料夾下指令，將金鑰設定至環境變數：
    ```sh
    firebase functions:config:set openweather.key="你的OpenWeatherMap金鑰"
    ```
- 下指令產生`.runtimeconfig.json` 檔案用以本機模擬變數使用：
    ```sh
    firebase functions:config:get > .runtimeconfig.json
    ```
    > 參考 [Run functions locally](https://firebase.google.com/docs/functions/local-emulator) 與 [為 function 設定環境變數](https://firebase.google.com/docs/functions/config-env)


本機開發 web server：
```sh
npm run start
```
於 functions 目錄下執行，本機模擬 functions：
```sh
npm run serve
```
