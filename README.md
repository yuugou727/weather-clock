# 天氣時鐘 Progressive Web App

Demo: https://ronnie-weather-clock.firebaseapp.com

一個簡易的天氣時鐘網頁，讓舊手機也能當天氣桌鐘使用，由於是PWA，Android 手機瀏覽頁面時可從瀏覽器右上的「選單 > 加到主畫面」的方式變成單獨App使用。天氣為計時一小時自動更新。


# 使用API

* [OA Wu 的台灣天氣資訊API](https://github.com/comdan66/weather)
* [Google Geolocation API](https://developers.google.com/maps/documentation/geolocation/intro)
* [Google Geocoding API](https://developers.google.com/maps/documentation/geocoding/intro)

# 開發

使用 [Create React App](https://github.com/facebookincubator/create-react-app)
建置。尚未 `yarn eject` ，更多開發說明可參考[原README](README-react.md)。

## 簡易指令

本機端 Live 開發
```
yarn start
```
編譯檔案
```
yarn build
```


## UML

![UML](uml.png)