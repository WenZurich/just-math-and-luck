/**
 * 讀財報 — 繁體中文一句話公司簡介（白話，給一般讀者）。
 * Yahoo 只給英文 summaryProfile；這裡是人工寫的中文說明，只講公司主要在賣什麼，不含任何數字。
 * 名單外的公司仍顯示 Yahoo 英文原文（不硬翻）。
 */
export const COMPANY_ZH = {
  AAPL: "蘋果：設計和銷售 iPhone、Mac、iPad、手錶耳機等裝置，也靠 App Store、iCloud 等服務收費。",
  MSFT: "微軟：Windows 和 Office（Microsoft 365）軟體、Azure 雲端服務，也經營 Xbox 遊戲和 LinkedIn。",
  NVDA: "輝達：設計 AI 和資料中心用的 GPU 晶片與整套伺服器系統，也賣遊戲顯示卡。",
  AMZN: "亞馬遜：全球大型網購平台，另有 AWS 雲端服務、廣告和 Prime 會員訂閱。",
  GOOGL: "Alphabet（Google 母公司）：Google 搜尋廣告、YouTube、Google Cloud 雲端和 Android。GOOGL 是有投票權的 A 股。",
  GOOG: "Alphabet（Google 母公司）：和 GOOGL 是同一家公司，GOOG 是沒有投票權的 C 股，財報一起公布。",
  META: "Meta：經營 Facebook、Instagram、WhatsApp，主要靠廣告賺錢，也投資 AI 和智慧眼鏡／VR。",
  TSLA: "特斯拉：電動車、儲能電池系統和太陽能，也在發展自動駕駛軟體。",
  "BRK-B": "波克夏海瑟威：巴菲特長年經營的控股公司，旗下有保險（GEICO）、鐵路（BNSF）、能源等事業，也持有大量股票。",
  LLY: "禮來：大型藥廠，主力是糖尿病和減重藥（Mounjaro、Zepbound），也有癌症和免疫用藥。",
  AMD: "超微：設計電腦和伺服器用的 CPU、資料中心 AI 晶片，也做遊戲主機晶片。",
  XOM: "埃克森美孚：大型石油天然氣公司，從探勘、開採到煉油和化學品都有。",
  MA: "萬事達卡：信用卡／金融卡的刷卡網路，每筆交易收處理費，本身不借錢給持卡人。",
  ABBV: "艾伯維：生技藥廠，主力是免疫疾病藥（Skyrizi、Rinvoq），也有腫瘤、神經科學和醫美（肉毒桿菌素 Botox）。",
  INTC: "英特爾：電腦和伺服器 CPU，也在發展幫別家公司代工晶片的晶圓代工事業。",
  PLTR: "Palantir：大數據分析和 AI 軟體平台，客戶有美國政府、國防單位和大企業。",
  CSCO: "思科：網路設備（交換器、路由器）、資安和視訊會議軟體（Webex）。",
  AMAT: "應用材料：半導體設備大廠，賣晶圓廠用的薄膜沉積、蝕刻等製程機台。",
  CAT: "開拓重工（Caterpillar）：營建和礦業機具、柴油引擎和發電設備。",
  ITUB: "伊塔烏聯合銀行（Itaú Unibanco）：巴西最大的民營銀行，做存放款、信用卡、保險和資產管理。",
  NU: "Nu Holdings（Nubank）：巴西起家的純網路銀行，在巴西、墨西哥、哥倫比亞用手機 App 提供信用卡、帳戶和貸款。",
  CRWV: "CoreWeave：出租 AI 運算用的雲端 GPU 伺服器，客戶多是訓練和執行 AI 模型的大公司。",
  GRAB: "Grab：東南亞的超級 App，提供叫車、外送美食生鮮，也做電子支付和小額貸款。",
  SHOP: "Shopify：幫商家開網路商店的平台，提供金流、物流等工具，按月費和交易抽成收費。",
  QCOM: "高通：手機處理器（Snapdragon）和通訊晶片，也向手機廠收通訊專利授權費。",
  UBER: "Uber：叫車和外送（Uber Eats）平台，也有貨運媒合。",
  JPM: "摩根大通：美國最大銀行，做存放款、信用卡、投資銀行和資產管理。",
  V: "Visa：全球最大的刷卡網路，每筆交易收處理費，本身不借錢給持卡人。",
  AVGO: "博通：網通和客製化 AI 晶片，另有企業軟體（VMware）。",
  NFLX: "Netflix：線上影音串流訂閱服務，也開始賣廣告。",
  ORCL: "甲骨文：企業資料庫和雲端服務，近年大量蓋 AI 資料中心。",
  WMT: "沃爾瑪：美國最大連鎖量販店，也經營網購和會員倉儲 Sam's Club。",
  COST: "好市多：會員制倉儲量販店，主要靠會員年費賺錢。",
  KO: "可口可樂：飲料公司，賣濃縮液和品牌授權給各地裝瓶廠。",
  PEP: "百事：飲料（百事可樂）和零食（樂事洋芋片）公司。",
  JNJ: "嬌生：大型藥廠和醫療器材公司。",
  UNH: "聯合健康：美國最大健康保險公司，也經營診所和藥品福利管理。",
  MU: "美光：記憶體晶片（DRAM、NAND、AI 用 HBM）大廠。",
  TSM: "台積電 ADR：全球最大晶圓代工廠，幫蘋果、輝達等公司製造晶片。",
  ARM: "安謀：設計處理器架構，授權給手機和電腦晶片公司並收權利金。",
  CRM: "Salesforce：企業客戶管理（CRM）雲端軟體。",
  ADBE: "Adobe：Photoshop、Acrobat（PDF）等創作和文件軟體，按月訂閱收費。",
  IBM: "IBM：企業軟體、雲端和顧問服務，也研發量子電腦。",
  BA: "波音：民航客機和國防航太。",
  DIS: "迪士尼：主題樂園、電影和串流平台 Disney+。",
};

/** zh-Hant one-liner for a ticker, or null when we have none (caller shows Yahoo English). */
export function companyZh(ticker) {
  const k = String(ticker || "").toUpperCase();
  return Object.prototype.hasOwnProperty.call(COMPANY_ZH, k) ? COMPANY_ZH[k] : null;
}
