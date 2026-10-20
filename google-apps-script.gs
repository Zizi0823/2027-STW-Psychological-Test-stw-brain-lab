/**
 * STW Brain Lab 後台紀錄
 * 貼到 Google 試算表的「擴充功能 → Apps Script」，存檔後執行一次 setup()，
 * 再「部署 → 新增部署作業 → 網頁應用程式」，存取權選「所有人」。
 */

const LOG_SHEET = "紀錄";
const STAT_SHEET = "統計";
const TYPES = ["細節雷達型", "邏輯拆解型", "腦洞發射型", "行動推進型"];

function doPost(e) {
  let d = {};
  try { d = JSON.parse(e.postData.contents || "{}"); } catch (err) { d = {}; }
  const allowed = ["visit", "start", "complete", "share", "signup_click"];
  if (allowed.indexOf(d.event) === -1) return ok_();

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = getLog_();
    sh.appendRow([
      new Date(),
      d.event,
      String(d.type || "").slice(0, 20),
      String(d.answers || "").slice(0, 8),
      String(d.sid || "").slice(0, 40),
      String(d.ref || "").slice(0, 200),
      String(d.ua || "").slice(0, 200)
    ]);
  } finally {
    lock.releaseLock();
  }
  return ok_();
}

function doGet() { return ok_(); }

function ok_() {
  return ContentService.createTextOutput("ok").setMimeType(ContentService.MimeType.TEXT);
}

function getLog_() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(LOG_SHEET);
  if (!sh) {
    sh = ss.insertSheet(LOG_SHEET);
    sh.appendRow(["時間", "事件", "人格類型", "作答", "工作階段", "來源網址", "裝置"]);
    sh.setFrozenRows(1);
    sh.getRange("A:A").setNumberFormat("yyyy/mm/dd hh:mm:ss");
  }
  return sh;
}

/** 執行一次：建立「紀錄」與「統計」分頁 */
function setup() {
  getLog_();
  const ss = SpreadsheetApp.getActive();
  let st = ss.getSheetByName(STAT_SHEET);
  if (!st) st = ss.insertSheet(STAT_SHEET, 0);
  st.clear();
  const L = "'" + LOG_SHEET + "'!";
  const rows = [
    ["STW Brain Lab 統計", ""],
    ["", ""],
    ["開啟網頁次數", "=COUNTIF(" + L + "B:B,\"visit\")"],
    ["開始測驗次數", "=COUNTIF(" + L + "B:B,\"start\")"],
    ["完成測驗次數", "=COUNTIF(" + L + "B:B,\"complete\")"],
    ["完成率（完成 ÷ 開始）", "=IFERROR(B5/B4,0)"],
    ["今天完成", "=COUNTIFS(" + L + "B:B,\"complete\"," + L + "A:A,\">=\"&TODAY())"],
    ["開啟分享卡", "=COUNTIF(" + L + "B:B,\"share\")"],
    ["點擊報名", "=COUNTIF(" + L + "B:B,\"signup_click\")"],
    ["", ""],
    ["各人格完成人數", ""]
  ];
  TYPES.forEach(function (t) {
    rows.push([t, "=COUNTIFS(" + L + "B:B,\"complete\"," + L + "C:C,\"" + t + "\")"]);
  });
  rows.push(["", ""]);
  rows.push(["每日完成人數", ""]);
  st.getRange(1, 1, rows.length, 2).setValues(rows);
  const dailyRow = rows.length + 1;
  st.getRange(dailyRow, 1).setFormula(
    "=IFERROR(QUERY(" + L + "A2:B,\"select toDate(A), count(B) where B = 'complete' group by toDate(A) order by toDate(A) desc label toDate(A) '日期', count(B) '完成人數'\",0),\"尚無資料\")"
  );
  st.getRange("A1").setFontSize(16).setFontWeight("bold");
  st.getRange("A3:A9").setFontWeight("bold");
  st.getRange("A11").setFontWeight("bold");
  st.getRange(rows.length, 1).setFontWeight("bold");
  st.getRange("B6").setNumberFormat("0.0%");
  st.setColumnWidth(1, 200);
  st.setColumnWidth(2, 120);
}
