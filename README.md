# STW Brain Lab 心理測驗：部署與後台設定

## 資料夾內容

- `index.html`：測驗網頁本體
- `img/`：所有插圖與分享卡
- `vercel.json`：Vercel 設定（圖片快取）
- `google-apps-script.gs`：後台紀錄程式，貼到 Google 試算表用

---

## 一、建立後台（Google 試算表，約 5 分鐘）

1. 到 Google 雲端硬碟新增一份空白試算表，命名為「STW Brain Lab 後台」。
2. 上方選單點「擴充功能 → Apps Script」。
3. 刪掉編輯器裡原本的內容，貼上 `google-apps-script.gs` 的全部內容，按存檔。
4. 上方函式下拉選單選 `setup`，按「執行」。第一次會要求授權，用你自己的 Google 帳號同意即可。
   - 完成後，試算表會多出「統計」和「紀錄」兩個分頁。
5. 右上角點「部署 → 新增部署作業」：
   - 類型選「網頁應用程式」
   - 執行身分：「我」
   - 誰可以存取：「所有人」
6. 按「部署」，複製畫面上的「網頁應用程式網址」（以 `https://script.google.com/macros/s/` 開頭、`/exec` 結尾）。
7. 用文字編輯器打開 `index.html`，搜尋 `const TRACK_URL`，把網址貼進引號中間（目前已填好你的網址，換新的部署作業時才需要改）：

   ```js
   const TRACK_URL = "https://script.google.com/macros/s/xxxxxxxx/exec";
   ```

> 「誰可以存取：所有人」只代表學生的瀏覽器能把紀錄送進來。試算表本身仍然只有你看得到，不要把試算表分享出去就好。

---

## 二、部署到 Vercel

**方法 A：用 GitHub（你之前的網站如果是這樣放的，就用這個）**

1. 在 GitHub 新增一個 repository，例如 `stw-brain-lab`。
2. 把這個資料夾裡的所有檔案上傳上去（網頁上「Add file → Upload files」可以直接拖拉整個資料夾）。
3. 到 Vercel 首頁按「Add New → Project」，選剛剛的 repository，按「Deploy」。
4. 完成後會得到 `stw-brain-lab.vercel.app` 這樣的網址。之後只要在 GitHub 更新檔案，Vercel 會自動重新部署。

**方法 B：用指令（電腦有裝 Node.js 的話）**

```bash
npm i -g vercel
cd 這個資料夾
vercel --prod
```

想用自己的網域（例如 `quiz.stwchallenge.org`），到 Vercel 專案的「Settings → Domains」新增即可。

---

## 三、看數據

打開試算表的「統計」分頁就能看到：

| 項目 | 意思 |
|---|---|
| 開啟網頁次數 | 有多少次有人打開測驗 |
| 開始測驗次數 | 按下「開始測驗」的次數 |
| 完成測驗次數 | **實際填完 8 題的人數** |
| 完成率 | 完成 ÷ 開始 |
| 今天完成 | 今天填完的人數 |
| 開啟分享卡 / 點擊報名 | 按下這兩個按鈕的次數 |
| 各人格完成人數 | 四種人格各有多少人 |
| 每日完成人數 | 依日期列出每天完成的人數 |

「紀錄」分頁是每一筆原始資料，包含時間、事件、測出的人格與作答（例如 `ABCDDCBA`）。
同一個人重新測驗會再記一筆。想看「不重複人數」的話，可以依「工作階段」欄去除重複。

---

## 四、之後要改內容

- 報名網址：搜尋 `SIGNUP_URL`
- 題目與選項：搜尋 `const QS`
- 人格說明、最佳夥伴、雷達圖數值：搜尋 `const TYPES`
