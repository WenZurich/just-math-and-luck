# 每日數學選股

美股與台股的公開行情篩選頁面。依動能、相對強度、均線與量比整理名單，並附紙上模擬交易紀錄。

內容僅供參考，不是投資建議，也不會真實下單。

網站：[每日數學選股](https://WenZurich.github.io/Just-Math-and-Luck/)

## 加到主畫面

iPhone 請用 Safari 開啟，點分享後選「加入主畫面」。Android 請用 Chrome 開啟，從選單選「安裝應用程式」。

## 更新資料

在專案目錄依序執行既有指令：`scripts/daily-scan.mjs`、`npm run strategies`、`npm run paper`。需要時再執行 `npm run fetch-social`、`npm run fetch-us-options`、`npm run fetch-earnings`。本機 `npm run build` 後，把 `dist/` 的內容放到 `docs/`，再推上 `main`。網站目前由 `docs/` 提供。

紙上模擬把美股與台股分開記帳，不會換成同一種貨幣，也不會送到券商。
