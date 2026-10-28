(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const l of r)if(l.type==="childList")for(const o of l.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function a(r){const l={};return r.integrity&&(l.integrity=r.integrity),r.referrerPolicy&&(l.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?l.credentials="include":r.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function i(r){if(r.ep)return;r.ep=!0;const l=a(r);fetch(r.href,l)}})();const yi="modulepreload",$i=function(e){return"/just-math-and-luck/"+e},bn={},Ca=function(t,a,i){let r=Promise.resolve();if(a&&a.length>0){let o=function(d){return Promise.all(d.map(p=>Promise.resolve(p).then(f=>({status:"fulfilled",value:f}),f=>({status:"rejected",reason:f}))))};document.getElementsByTagName("link");const c=document.querySelector("meta[property=csp-nonce]"),u=(c==null?void 0:c.nonce)||(c==null?void 0:c.getAttribute("nonce"));r=o(a.map(d=>{if(d=$i(d),d in bn)return;bn[d]=!0;const p=d.endsWith(".css"),f=p?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${d}"]${f}`))return;const h=document.createElement("link");if(h.rel=p?"stylesheet":yi,p||(h.as="script"),h.crossOrigin="",h.href=d,u&&h.setAttribute("nonce",u),document.head.appendChild(h),p)return new Promise((g,m)=>{h.addEventListener("load",g),h.addEventListener("error",()=>m(new Error(`Unable to preload CSS for ${d}`)))})}))}function l(o){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=o,window.dispatchEvent(c),!c.defaultPrevented)throw o}return r.then(o=>{for(const c of o||[])c.status==="rejected"&&l(c.reason);return t().catch(l)})},us=[{id:"zh-Hant",label:"繁體中文",short:"繁"},{id:"en",label:"English",short:"EN"},{id:"zh-Hans",label:"简体中文",short:"简"},{id:"ja",label:"日本語",short:"日"}],ds=us.map(e=>e.id),ps="site-lang",ft="zh-Hant",ja=new Set;function vi(){try{const t=localStorage.getItem(ps);if(t&&ds.includes(t))return t}catch{}const e=typeof navigator<"u"&&navigator.language||"";return/^zh[-_]?(CN|Hans|SG)/i.test(e)?"zh-Hans":/^zh/i.test(e)?"zh-Hant":/^ja/i.test(e)?"ja":/^en/i.test(e)?"en":ft}let W=vi();function _e(){return W}let kn=0;async function bi(e){if(!ds.includes(e))return!1;const t=++kn;if(e===W||!await hs(e)||t!==kn||e===W)return!1;W=e;try{localStorage.setItem(ps,e)}catch{}return typeof document<"u"&&(document.documentElement.lang=e==="zh-Hant"?"zh-Hant":e==="zh-Hans"?"zh-Hans":e),ja.forEach(a=>{try{a(e)}catch{}}),!0}function ki(e){return ja.add(e),()=>ja.delete(e)}function D(){return W==="en"?"en-US":W==="ja"?"ja-JP":W==="zh-Hans"?"zh-CN":"zh-TW"}function Aa(){typeof document>"u"||(document.documentElement.lang=W==="zh-Hant"?"zh-Hant":W==="zh-Hans"?"zh-Hans":W)}const fs={siteTitle:"每日數學選股",loading:"載入中…",disclaimer:"投資涉及風險，資訊僅供參考，非投資建議",footer:"投資涉及風險，資訊僅供參考，非投資建議",dataAsOf:"資料",taipei:"（台北）",navMain:"主要導覽",skipToContent:"跳到主要內容",navToday:"今日",navStrategies:"策略",navPaper:"模擬",navMore:"更多",navMoreClose:"關閉",navLogic:"邏輯",researchTitle:"研究",navResearch:"研究",navOptions:"選擇權",navEarnings:"讀財報",earningsTitle:"讀財報",earningsLead:"美股 Magnificent 7 與高關注財報摘要：公司在做什麼、關鍵數字、下一步看什麼——白話、每日更新，非投資建議。",earningsDisclaimer:"非投資建議。數字來自公開 Yahoo Finance；缺欄略過不顯示，不構成個人化投資建議。",earningsUsFocus:"以美股為主",earningsTwStub:"台股財報稍後開放（規劃中）",earningsSelectionTitle:"關注名單規則：",earningsSelectionFallback:"除了 Mag7，再挑未來 14 天內要公布財報、市值最大的美國大公司；也納入 Yahoo 當日成交最熱、近期剛公布或即將公布的股票。名單不滿時，用 45 天內的重要財報補上，最多 14 家。",earningsLatestDate:"最近財報",earningsReportedOn:"{date} 已公布",earningsResultTitle:"這次財報結果",earningsReportedHead:"{date} 已公布（{q} 那一季）。",earningsReportedEps:"每股盈餘（EPS）{a} 美元",earningsBeat:"，市場原本預估 {e}，高於預估 {p}%。",earningsMiss:"，市場原本預估 {e}，低於預估 {p}%。",earningsInline:"，與市場預估 {e} 相同。",earningsNextUnknown:"下一次財報日期公司尚未公布。",earningsReportedPending:"{date} 已公布；這次的數字資料源還沒更新，明天再看。",earningsInDays:"還有 {n} 天",earningsToday:"今天公布",earningsWatchUpcoming:"{date} 公布，還有 {n} 天。重點看營收和每股盈餘（EPS）有沒有達到市場預估。",earningsWatchToday:"今天（美東時間）公布。重點看營收和每股盈餘（EPS）有沒有達到市場預估。",earningsWatchConsensus:"市場預估這一季 EPS 約 {e} 美元。",earningsWatchTrend:"最近一年營收成長 {rev}、獲利成長 {eps}（Yahoo）。",earningsMag7Title:"Magnificent 7",earningsMag7Lead:"AAPL、MSFT、NVDA、AMZN、GOOGL／GOOG、META、TSLA——上次財報與下次日期（已知時）。",earningsMag7Badge:"Mag7",earningsHotTitle:"高關注／熱門財報",earningsHotLead:"依上方規則挑選；標籤說明為何入選。",earningsHotEmpty:"目前視窗內暫無符合條件的標的",earningsWhatItDoes:"這家公司在做什麼",earningsWhatToWatch:"下一步看什麼",earningsNextDate:"下次財報",earningsLastEps:"上次 EPS",earningsRevYoy:"營收 YoY",earningsEpsYoy:"獲利 YoY",earningsPe:"本益比",earningsForwardPe:"預估本益",earningsEstimate:"預估",earningsDataMissing:"資料不足",earningsTagPrimary:"14 日內・大型",earningsTagActives:"熱門成交・14 日內",earningsTagRecent:"近日已公布",earningsTagFallback:"45 日行事曆亮點",earningsTagOther:"關注",earningsPartialBlocker:"部分資料受阻",earningsRefreshHow:"資料會隨站點更新；若畫面異常請稍後再試。",earningsLoadError:"無法載入財報摘要（{msg}）",earningsEmpty:"財報摘要整理中，請稍後再看。",navLookup:"查股",lookupTitle:"查股／個股",lookupLead:"輸入美股或台股代碼，查看公司簡介、即時報價、財報重點與官方財報連結——白話整理；行情來自 Yahoo，官方申報連至 SEC／公開資訊觀測站。非投資建議。",lookupDisclaimer:"非投資建議。行情數字來自公開 Yahoo Finance；官方財報連結連至 SEC EDGAR／公開資訊觀測站。缺欄不顯示、不編造。即時抓取可能受網路或來源限制。",lookupInputLabel:"股票代碼",lookupPlaceholderUs:"例如 AAPL",lookupPlaceholderTw:"例如 2330 或 2330.TW",lookupHintUs:"美股：輸入代號如 AAPL、MSFT、NVDA",lookupHintTw:"台股：四碼代號如 2330（自動加 .TW；上櫃可試 .TWO）",lookupSearch:"查詢",lookupIdle:"輸入代碼後按查詢，即可查看報價與財報摘要。",lookupLoading:"正在向 Yahoo Finance 抓取…",lookupEmptyInput:"請輸入股票代碼",lookupInvalid:"代碼格式無法辨識。美股如 AAPL；台股如 2330 或 2330.TW",lookupNotFound:"找不到此代碼的報價。請確認市場分頁（美股／台股）與代碼是否正確。",lookupUnreachTitle:"即時報價暫時連不上——不是代碼打錯",lookupUnreachBody:"本站透過公開轉接服務向 Yahoo 讀取行情，現在對方拒絕連線或逾時（常見於轉接服務限流或網路壅塞）。請等一兩分鐘再按「重試」。下面先列出本站已整理好的官方資料與連結，不放任何猜的數字。",lookupRetry:"重試",lookupOfflineTag:"未含即時報價",lookupOfflineUnknown:"本站資料裡還沒有這檔；連線恢復後按「重試」就能確認代碼。",lookupOfflineDigestAsOf:"以上是本站 {at}（台北）整理的公開財報日程，不是即時資料。",lookupBizSrcDigest:"本站 {at}（台北）整理的 Yahoo 公開公司簡介",lookupEstSuffix:"（預估）",lookupOfflineFilingsNote:"近期 10-K／10-Q／8-K 清單要連上 SEC 才列得出來，暫時無法載入。",lookupError:"查詢失敗（{msg}）",lookupBizSourceLabel:"來源：",lookupBizSrcMops:"公開資訊觀測站・公司基本資料（主要經營業務）",lookupBizSrcTwOpenApi:"證交所／櫃買中心 OpenAPI 公司基本資料",lookupBizSrcSec:"SEC EDGAR 公司登記資料",lookupBizTwBasics:"{n}（{f}），{mk}公司，產業類別：{ind}。",lookupBizUsSic:"SEC 登記行業：{desc}（SIC {sic}）{ex}",lookupBizOfficialOnly:"公司簡介暫時抓不到，請看官方資料：",lookupBusiness:"公司在做什麼",lookupQuoteStats:"報價與關鍵數據",lookupFinancials:"財務摘要",lookupEarnings:"財報重點",lookupPrevClose:"前收",lookupVolume:"成交量",lookupDayRange:"今日區間",lookup52w:"52 週高低",lookupMarketCap:"市值",lookupEps:"每股盈餘",lookupBeta:"Beta",lookupDivYield:"殖利率",lookupRevenue:"營收",lookupGrossMargin:"毛利率",lookupProfitMargin:"淨利率",lookupEpsConsensus:"預估 EPS",lookupEpsSurprise:"EPS 驚喜",lookupSources:"來源",lookupPartial:"部分進階欄位暫無法取得（已顯示可得數字，未編造）。",lookupOfficialFilings:"官方財報",lookupOfficialFilingsLead:"以下連結通往官方申報與公開資訊；美股可另列近期 10-K／10-Q／8-K（公開可抓取時）。數字不編造。",lookupSourceOfficial:"官方來源",lookupSourceQuote:"行情來源",lookupSourceCompany:"公司網站",lookupSecEdgarSearch:"SEC EDGAR 公司申報查詢",lookupSecEdgarBrowse:"SEC EDGAR 公司瀏覽頁",lookupSecFormsFilter:"SEC 10-K／10-Q 等年季報篩選",lookupMopsFinancialBook:"公開資訊觀測站｜財務報告書",lookupMopsFinancialQuery:"公開資訊觀測站｜財務報告查詢頁",lookupMopsCompany:"公開資訊觀測站｜公司基本資料",lookupMopsMaterial:"公開資訊觀測站｜重大訊息",lookupTwseIsin:"證交所 ISIN／基本資料查詢",lookupTpexCompany:"櫃買中心｜公司資料",lookupYahooTwQuote:"Yahoo 奇摩股市（行情，非正式財報）",lookupCompanyWebsite:"公司官網",lookupInvestorRelations:"投資人關係／IR（公開資料）",lookupRecentFilings:"近期官方申報",lookupFilingForm:"表單",lookupFilingDate:"申報日",lookupFilingDoc:"文件",lookupCikLabel:"CIK",lookupFilingsListUnavailable:"近期申報清單暫時無法載入（網路或來源限制）。",lookupFilingsListEmpty:"目前沒有可列示的近期 10-K／10-Q／8-K。",lookupFilingsLinksStillWork:"上方官方連結仍可開啟查閱。",lookupFilingsTwNote:"台股請以公開資訊觀測站（MOPS）為官方財報來源；下方亦附行情頁供對照。",lookupFilingsCikUnavailable:"尚無法對應 SEC CIK；仍可透過上方 EDGAR 以代號查詢。",navSoxl:"SOXL",soxlTitle:"SOXL 半導體槓桿",soxlLead:"Direxion 每日半導體多頭 3 倍 ETF：最新報價、異常／事件、相關新聞，以及 SEC N-PORT 持股權重與估算貢獻——白話整理，非投資建議。",soxlDisclaimer:"非投資建議。SOXL 為約 3 倍日槓桿 ETF，波動與虧損風險極高；持股權重來自 SEC N-PORT（非當日），貢獻度為估算。",soxlHeroLabel:"SOXL 最新報價",soxlFundFallback:"Direxion Daily Semiconductor Bull 3X Shares",soxlRegularClose:"正規收盤",soxlOvernight:"盤後／夜盤",soxlLeverageNote:"SOXL 目標約為 ICE Semiconductor Index 單日表現的 3 倍；隔夜與多日累積不可用簡單 3 倍推估。",soxlHoldingsAsOf:"持股權重截至",soxlHoldingsNotSameDay:"最新 N-PORT，非今日即時",soxlEventsTitle:"事件／異常",soxlNewsTitle:"相關新聞",soxlNewsEmpty:"暫無相關新聞",soxlHoldingsTitle:"持股與估算貢獻",soxlHoldingsLead:"權重來自美國證管會（SEC）公開的 SOXL 持股季報（N-PORT）；現金與指數交換常佔大宗，個股漲跌則抓最近一個美股交易日的收盤。",soxlHoldingsEmpty:"持股清單整理中，請稍後再看。",soxlColName:"標的",soxlColWeight:"權重",soxlColReturn:"日報酬",soxlColContrib:"估算貢獻",soxlColReasons:"白話原因",soxlContributionHint:"估算貢獻：這檔在基金裡的比重，乘上它最近一天的漲跌，約等於它把整籃股票推高或拉低多少個百分點（還沒乘 3 倍槓桿，不等於 SOXL 實際漲跌）",soxlSourceN:"來源 {n}",soxlOverallTitle:"為何漲／為何跌",soxlWhyUp:"偏多時常見原因",soxlWhyDown:"偏空時常見原因",soxlRefreshHow:"資料會隨站點更新；若畫面異常請稍後再試。",soxlLoadError:"無法載入 SOXL 桌面（{msg}）",soxlNoDailyMove:"不適用",soxlPp:"百分點",soxlReturnAsOf:"{date} 收盤",soxlTypeOther:"其他",soxlTypeSwap:"指數交換合約",soxlTypeCash:"現金／貨幣基金",soxlTypeEquity:"個股",soxlHoldingsLeadDated:"權重：SEC 官方持股季報 N-PORT，統計到 {date}（不是今天即時持股）。漲跌：各個股最近一個美股交易日收盤（{day}）。現金與指數交換合約常佔一大塊，本身不太會漲跌。",navTxf:"台指期",txfTitle:"台指期",txfLead:"臺灣加權現貨對臺股期貨：近月／次月報價、基差、成交與未平倉、三大法人部位、保證金與到期日——全部來自期交所／證交所公開資料，白話整理，非投資建議。",txfDisclaimer:"投資涉及風險，資訊僅供參考，非投資建議。美股與台指期分欄；數字缺欄不捏造。",txfHeroLabel:"臺股期貨近月報價",txfNearBadge:"近月",txfNextBadge:"次月",txfSettle:"結算價",txfVolume:"成交量",txfOI:"未平倉",txfSessionDate:"行情日",txfSpotLabel:"加權現貨",txfBasisLabel:"基差",txfBasisHint:"基差＝近月期貨 − 現貨；正值表示期貨相對現貨溢價。",txfMultiplierShort:"大台乘數 NT${n}／點（紙上損益＝點數差×乘數×口數）",txfExpiredNote:"{m} 契約已在 {d} 到期，期交所公告最後結算價 {p}；近月改看 {n}。",txfContractsTitle:"契約：大台／小台／微台",txfContractsLead:"一般交易時段行情。月契約最後交易日依官方「第三個星期三」規則推算，假日調整請對照期交所公告。",txfMultLabel:"契約乘數",txfPerPoint:"／點",txfMarginInitial:"原始保證金",txfMarginMaint:"維持保證金",txfColMonth:"月份",txfColLast:"最新",txfColSettle:"結算",txfColChange:"漲跌",txfColVolume:"成交量",txfColOI:"未平倉",txfColLTD:"最後交易日",txfInstTitle:"三大法人期貨部位",txfInstLead:"未平倉多空與當日淨買賣（期交所，截至 {date}）",txfInstFoot:"三大法人為彙總結果，不代表單一機構策略。",txfColParty:"身份",txfColLongOI:"多方未平倉",txfColShortOI:"空方未平倉",txfColNetOI:"淨未平倉",txfColNetVol:"淨買賣口數",txfCalendarTitle:"結算／選擇權彙總",txfNextLTD:"近月最後交易日",txfNearMonth:"近月",txfNextMonth:"次月",txfLTDRule:"月契約最後交易日＝交割月份第三個星期三。",txfRecentSettle:"近期最後結算價",txfPcrTitle:"臺指選擇權 P/C",txfPcrVol:"成交量比",txfPcrOI:"未平倉比",txfExplainTitle:"白話說明",txfExplain1:"台指期（TX）是以臺灣加權股價指數為標的的指數期貨，採現金交割；小台（MTX）與微台（TMF）規格較小，方便調整部位。",txfExplain2:"基差＝期貨價 − 現貨指數。升水（正基差）表示期貨貴於現貨；貼水則相反。基差會隨到期日逼近而收斂。",txfExplain3:"未平倉（OI）是尚未平倉的契約口數，反映市場留倉規模，不是當日漲跌原因本身。",txfExplain4:"紙上損益可用：點數差 × 契約乘數 × 口數（大台每點 NT$200、小台 NT$50、微台 NT$10）。保證金以期交所公告為準。",txfSourcesTitle:"資料來源",txfLoadError:"無法載入台指期桌面（{msg}）",navPodcasts:"名人podcast",navLetters:"股東信",navManbao:"曼報 Pro",lettersTitle:"巴菲特的股東信",lettersLead:"選定年份後，在這一頁打開波克夏官方原文。旁邊是讀過後整理的投資要點，不是全文，也不是買賣建議。官方頁不允許嵌入。",lettersDisclaimer:"要點是我們的話，不是引用信的原文。1965–1976 年沒有單獨公開頁，官方索引只從 1977 年起。2025 年是 Greg Abel 的第一封信。",lettersMenuLead:"先選時期，再選年份。原文在波克夏官方網站閱讀，這裡只留要點。",lettersReadBadge:"已讀要點",lettersLinkBadge:"僅連結",lettersOpen:"官方原文",lettersReaderOpen:"閱讀官方原文",lettersReaderOpenPdf:"閱讀官方 PDF",lettersReaderNote:"波克夏不允許把信嵌進其他網站，所以這裡不放全文。按下面的按鈕，在官方頁面閱讀。",lettersReaderRegion:"官方原文",lettersOfficialHost:"原文在 berkshirehathaway.com，離開本站後由波克夏提供。",lettersYearRail:"年份",lettersMissing:"找不到這一年的官方連結。",lettersLinkOnlyNote:"這封沒有另外整理要點，請直接讀官方頁。",lettersAuthor:"作者",lettersBack:"回目錄",manbaoTitle:"曼報 Pro",manbaoLead:"付費內文不轉載。公開長文只放讀過後的短摘要；會員限定只列公開索引上的標題與連結。",manbaoDisclaimer:"不是投資建議，也不是曼報的授權轉載。Pro 正文留在官方網站。",manbaoMenuLead:"先選分類。公開長文有摘要；Pro 只有標題與官方連結。",manbaoPublicBadge:"公開摘要",manbaoPaywallBadge:"僅連結",manbaoOpen:"官方頁面",manbaoBack:"回目錄",manbaoCatPublic:"公開長文",manbaoCatDecode:"商業解碼",manbaoCatTech:"科技曼讀",manbaoCatGiants:"巨人之聲",manbaoCatClub:"曼報俱樂部",manbaoCatAbout:"入口",lettersCatEarly:"1977–1989",lettersCat90:"1990–1999",lettersCat00:"2000–2009",lettersCat10:"2010–2019",lettersCat20:"2020–2025",lettersCatSpecial:"特別信",podcastsTitle:"名人podcast",podcastsLead:"精選投資人／主持人公開訪談與 Podcast 框架整理：可掃讀論點、市場分欄、候選狀態標示清楚——非投資建議。",podcastsDisclaimer:"非投資建議。本區整理公開訪談與研究書庫已有資料；數字與做法標示來源，不構成個人化建議。數學閘門未通過者僅候選／觀察。",podcastsFeatured:"精選",podcastsStubBadge:"候選摘要",podcastsGodzillaHandle:"哥吉拉 · @godzilla.us",podcastsGooayeTitle:"Gooaye 股癌（謝孟恭）",podcastsGooayeLead:"台灣市場／總經／風險／散戶心理 Podcast；集數重點整理自公開 RSS 節目指引（非逐字稿、非投資建議）。",podcastsGooayeMarket:"以台股為主 · 美／台分欄",podcastsGooayeStubNote:"輕量 stub：完整條目與可計算規則在研究書庫；此處不發明集數引言。",podcastsGooayePoint1:"先管風險與部位，再談單一標的故事",podcastsGooayePoint2:"護國神山供應鏈用籃子強弱看，不單壓一檔",podcastsGooayePoint3:"美股用利率方向當風險偏好代理；台股另算",podcastsGotoResearch:"到研究書庫看完整條目",podcastsGooayeApple:"Apple Podcasts",podcastsCatMenu:"分類選單",podcastsCategories:"名人podcast分類",podcastsMenuLead:"先選分類再進入內容——不把長文全部攤在同一頁。",podcastsOpenCategory:"開啟此分類",podcastsLatestEpisode:"最新一集：{title}",podcastsLatestPost:"最新貼文：{title}",podcastsLatestMeta:"{date} 上架・共 {n} 集",podcastsLatestMetaPosts:"{date} 發表・共 {n} 篇",podcastsNewBadge:"本週新集",gooayeLibraryBadge:"集數庫",gooayeDisclaimer:"候選／觀察；數學閘關閉。標「已聽寫」者：下載公開音檔＋語音轉文字後撰寫股票重點分析。標「僅節目說明」者：僅 RSS／節目說明，未聽寫。主持人觀點、候選狀態；非投資建議。",gooayeLoading:"載入股癌集數庫…",gooayeLoadError:"無法載入集數庫（{msg}）",gooayeEpisodeCount:"共 {n} 集（公開 RSS）",gooayeAsOf:"資料截至 {date}（台北）",gooayeEmptyCount:"其中 {n} 集公開文字不足，僅列標題",gooayeSearchLabel:"搜尋集數",gooayeSearchPlaceholder:"標題、集數或關鍵字",gooayeSourceLine:"來源：",gooayeKeyPoints:"重點整理",gooayeTeaserKicker:"主持人開場短語",gooayeNotesThin:"公開節目指引幾乎只有標題／短語，無更多可整理文字。",gooayeTeaserNote:"這集公開的節目說明只有開場短語（其餘多半是業配廣告，已幫你拿掉）；我們還沒聽音檔，也不自己補內容。",gooayeListen:"收聽（SoundOn）",gooayeLoadMore:"再顯示 {n} 集（尚餘 {left}）",gooayeShowingAll:"已顯示全部 {n} 集",gooayeNoResults:"沒有符合的集數。",gooayeUntitled:"未命名集數",gooayeBadgeListened:"已聽寫",gooayeBadgeRssOnly:"僅節目說明",gooayeStockAnalysis:"股票重點分析（已聽寫）",gooayeRssTeaserToggle:"公開節目說明（RSS）",gooayeListenedAt:"聽寫於 {date}（台北）",gooayeListenedCount:"已聽寫 {n} 集",gooayeRssOnlyNote:"此集尚未聽音檔；以上僅整理公開 RSS／節目說明，非聽寫分析。",podcastsXiaojunTitle:"張小珺jùn｜商業訪談錄",podcastsXiaojunHandle:"張小珺 · 商業／科技長訪談",podcastsXiaojunLead:"以中國科技與商業人物為主的長篇訪談；集數庫來自公開 RSS 節目說明。標「已聽寫」者另附股票／產業重點（候選／觀察，非投資建議）。",podcastsXiaojunMarket:"以中國科技產業為主 · 跨市場觀察",podcastsXiaojunApple:"在 Apple Podcasts 收聽",xiaojunLibraryBadge:"集數庫",xiaojunDisclaimer:"候選／觀察；數學閘關閉。標「已聽寫」者：下載公開音檔＋語音轉文字後撰寫股票／產業重點。標「僅節目說明」者：僅 RSS／節目說明，未聽寫。主持人觀點；非投資建議。",xiaojunLoading:"載入張小珺集數庫…",xiaojunLoadError:"無法載入集數庫（{msg}）",xiaojunEpisodeCount:"共 {n} 集（公開 RSS）",xiaojunAsOf:"資料截至 {date}（台北）",xiaojunEmptyCount:"其中 {n} 集公開文字不足，僅列標題",xiaojunSearchLabel:"搜尋集數",xiaojunSearchPlaceholder:"標題、集數或關鍵字",xiaojunSourceLine:"來源：",xiaojunKeyPoints:"重點整理",xiaojunNotesThin:"公開節目指引幾乎只有標題／短語，無更多可整理文字。",xiaojunTeaserNote:"以上僅整理公開 RSS／節目說明，未聽音檔、未發明內容。",xiaojunListen:"在 Apple Podcasts 收聽",xiaojunLoadMore:"再顯示 {n} 集（尚餘 {left}）",xiaojunShowingAll:"已顯示全部 {n} 集",xiaojunNoResults:"沒有符合的集數。",xiaojunUntitled:"未命名集數",xiaojunBadgeListened:"已聽寫",xiaojunBadgeRssOnly:"僅節目說明",xiaojunStockAnalysis:"股票／產業重點分析（已聽寫）",xiaojunRssTeaserToggle:"公開節目說明（RSS）",xiaojunListenedAt:"聽寫於 {date}（台北）",xiaojunListenedCount:"已聽寫 {n} 集",xiaojunRssOnlyNote:"此集尚未聽音檔；以上僅整理公開 RSS／節目說明，非聽寫分析。",podcastsWhynottvTitle:"WhynotTV Podcast",podcastsWhynottvHandle:"Tairan He · AI／機器人長訪談",podcastsWhynottvLead:"聚焦 AI、機器人與科研創業的長篇訪談；集數庫來自公開 Anchor RSS。標「已聽寫」者另附產業重點（候選／觀察，非投資建議）。",podcastsWhynottvMarket:"AI／機器人與科研創業 · 跨市場觀察",podcastsWhynottvApple:"在 Apple Podcasts 收聽",whynottvLibraryBadge:"集數庫",whynottvDisclaimer:"候選／觀察；數學閘關閉。標「已聽寫」者：下載公開音檔＋語音轉文字後撰寫產業重點。標「僅節目說明」者：僅 RSS／節目說明，未聽寫。主持人觀點；非投資建議。",whynottvLoading:"載入 WhynotTV 集數庫…",whynottvLoadError:"無法載入集數庫（{msg}）",whynottvEpisodeCount:"共 {n} 集（公開 RSS）",whynottvAsOf:"資料截至 {date}（台北）",whynottvEmptyCount:"其中 {n} 集公開文字不足，僅列標題",whynottvSearchLabel:"搜尋集數",whynottvSearchPlaceholder:"標題、集數或關鍵字",whynottvSourceLine:"來源：",whynottvKeyPoints:"重點整理",whynottvNotesThin:"公開節目指引幾乎只有標題／短語，無更多可整理文字。",whynottvTeaserNote:"以上僅整理公開 RSS／節目說明，未聽音檔、未發明內容。",whynottvListen:"在 Apple Podcasts 收聽",whynottvLoadMore:"再顯示 {n} 集（尚餘 {left}）",whynottvShowingAll:"已顯示全部 {n} 集",whynottvNoResults:"沒有符合的集數。",whynottvUntitled:"未命名集數",whynottvBadgeListened:"已聽寫",whynottvBadgeRssOnly:"僅節目說明",whynottvStockAnalysis:"股票／產業重點分析（已聽寫）",whynottvRssTeaserToggle:"公開節目說明（RSS）",whynottvListenedAt:"聽寫於 {date}（台北）",whynottvListenedCount:"已聽寫 {n} 集",whynottvRssOnlyNote:"此集尚未聽音檔；以上僅整理公開 RSS／節目說明，非聽寫分析。",podcastsZhangJunanTitle:"張濬安",podcastsZhangJunanHandle:"et220870 · Blogspot／PTT",podcastsZhangJunanLead:"公開部落格與 PTT 發文整理：績效覆盤、交易紀律、券商／房貸實務與早期操作日誌。標「已讀分析」者已讀全文；標「僅標題」者公開正文不可得。候選／觀察，非投資建議。",podcastsZhangJunanMarket:"台股／交易實務 · 個人覆盤",zhangJunanLibraryBadge:"文章庫",zhangJunanDisclaimer:"候選／觀察；數學閘關閉。標「已讀分析」：已讀公開正文（部落格全文或 PTT 原文＋留言）後撰寫股市／資產重點。標「僅標題」：公開頁正文不可讀或已刪。作者觀點；非投資建議。不納入選股清單。",zhangJunanLoading:"載入張濬安文章庫…",zhangJunanLoadError:"無法載入文章庫（{msg}）",zhangJunanPostCount:"共 {n} 篇（公開列表）",zhangJunanAsOf:"資料截至 {date}（台北）",zhangJunanAnalyzedCount:"已讀分析 {n} 篇",zhangJunanTitleOnlyCount:"其中 {n} 篇僅標題（正文不可讀）",zhangJunanSearchLabel:"搜尋文章",zhangJunanSearchPlaceholder:"標題、看板、關鍵字",zhangJunanSourceLine:"來源：",zhangJunanKeyPoints:"重點整理",zhangJunanStockAnalysis:"股市／資產重點分析（已讀）",zhangJunanNotesThin:"公開文字不足，僅列標題與連結。",zhangJunanTitleOnlyNote:"公開頁正文已刪除或無法解析；以上不臆造內容。",zhangJunanOpenBlog:"開啟原文（部落格）",zhangJunanOpenPtt:"開啟原文（PTT）",zhangJunanLoadMore:"再顯示 {n} 篇（尚餘 {left}）",zhangJunanShowingAll:"已顯示全部 {n} 篇",zhangJunanNoResults:"沒有符合的文章。",zhangJunanUntitled:"未命名文章",zhangJunanBadgeAnalyzed:"已讀分析",zhangJunanBadgeTitleOnly:"僅標題",zhangJunanSourceBlog:"部落格",zhangJunanSourcePtt:"PTT",zhangJunanCommentSummary:"留言重點",zhangJunanFilterAll:"全部",zhangJunanFilterBlog:"部落格",zhangJunanFilterPtt:"PTT",zhangJunanFilterSeriesAll:"全部子分類",zhangJunanSourceFilters:"來源篩選",zhangJunanSeriesFilters:"子分類篩選",researchCatMenu:"分類選單",researchCategories:"研究分類",researchMenuLead:"先選類型／市場／狀態，再瀏覽該分類條目。",researchOpenCategory:"開啟此分類",researchCatBooks:"書籍",researchCatPapers:"論文",researchCatPodcasts:"Podcast",researchCatUs:"美股焦點",researchCatTw:"台股焦點",researchCatCandidate:"候選",researchCatWatch:"觀察中",researchBackMenu:"回分類選單",researchStatusFilters:"狀態",godzillaTitle:"哥吉拉",godzillaLead:"Threads 受訪者「哥吉拉」的美股框架整理：時間與健康、RSU 再配置、基本面、能力圈、稅務節奏、選擇權工具——白話卡片，非投資建議。",godzillaDisclaimer:"非投資建議。整理自公開訪談；數字與做法標示為受訪者自述，不構成個人化建議。數學閘門未通過，僅候選／觀察。",godzillaHeroLabel:"哥吉拉框架總覽",godzillaKicker:"候選框架 · 美股為主",godzillaTagline:"用健康的時間換自由；長股為核、選擇權為輔；稅務決定換倉節奏。",godzillaBadgeCandidate:"候選",godzillaBadgeWatch:"觀察中",godzillaUsFocus:"以美股為主",godzillaSelfReport:"受訪者自述",godzillaListenedBadge:"已聽寫",godzillaStockTitle:"股票重點分析（已聽寫）",godzillaStockLead:"依公開 YouTube 訪談音訊＋語音轉寫整理的受訪者觀點（候選／觀察；非投資建議）。",godzillaStock1:"時間與健康優先於再堆金錢／RSU；金錢買不回時間，退休目標會隨 RSU 累積而上修。",godzillaStock2:"美股科技薪資結構高度依賴 RSU；股價上漲會放大總報酬，也放大單一公司集中風險。",godzillaStock3:"進場時點：特斯拉较早布局自覺「可更早出場會賺更多」；Meta 約在相對低檔區間進入（受訪者自述）。",godzillaStock4:"下一波關注偏 B2C AI 應用落地；當下顯見案例如 Tesla FSD、Palantir，其餘仍在觀察。硬體／AI 資本開支仍在成長，但多數應用仍偏 B2B。",godzillaStock5:"即便看好 NVIDIA，也不主張把倉位壓在單一公司；美國 W2／稅務計算下，高薪＋集中持股需一起規劃。",godzillaStock6:"台股無資本利得稅 vs 美國稅負：流動性／進出方便是優點，稅制誘因不同，不能直接照搬美股玩法。",godzillaStockNote:"轉寫模型：faster-whisper small int8。來源影片公開可查；數字與標的均為訪談中受訪者觀點，候選／觀察。",godzillaSourceLabel:"來源",godzillaSourceCite:"Terry × 哥吉拉",godzillaYoutube:"觀看 YouTube 訪談",godzillaThesesTitle:"核心論點",godzillaThesesLead:"十條可掃讀重點；細節皆為受訪者自述。",godzillaThesis1Title:"時間與健康重於再堆 RSU",godzillaThesis1Body:"退休目標常會膨脹（例如自述從約 3,000 萬美元調到 6,000 萬，再加上住房與子女）；停下來往往是身體撐不住。用健康的 40 多歲換旅行與自由，和 50–60 歲很不一樣。",godzillaThesis2Title:"美股 RSU 改變誘因",godzillaThesis2Body:"四年歸屬、與公司利益綁在一起；對比台股現金獎金較少用來買自家股票。",godzillaThesis3Title:"歸屬當日賣出、轉到信念標的",godzillaThesis3Body:"既得 RSU 當日賣出，再配置到有信念的名字（其例：NVDA），避免薪水＋未歸屬全押同一籃。",godzillaThesis4Title:"只看基本面",godzillaThesis4Body:"看營收／EPS 趨勢；忽略華爾街目標價；新聞噪音多半有害。",godzillaThesis5Title:"能力圈：硬體／科技",godzillaThesis5Body:"能力圈在硬體與科技——NVDA 權重最高；亦提 PLTR、AVGO、TSM；很少碰科技外。指數部位現在較小，終局想像多數在指數。",godzillaThesis6Title:"稅務決定換倉節奏",godzillaThesis6Body:"高 W2 收入時資本利得稅重；離職後可多年把個股輪換成指數、把稅負控在可接受範圍；賣出 Covered Call 可緩衝下跌。",godzillaThesis7Title:"選擇權是工具",godzillaThesis7Body:"多半當卖方（Covered Call／Cash-secured Put）；少數做多買權／LEAP，僅在恐慌或價格與基本面背離時；接受權利金可能歸零；從不裸賣。",godzillaThesis8Title:"Covered Call：被指派就延後",godzillaThesis8Body:"有被指派風險就往後換月（roll out）；不要為了小權利金去履約或賣掉核心持股；不舒服就少賣合約。",godzillaThesis9Title:"進場等趨勢",godzillaThesis9Body:"等 1–2 次乾淨財報確認趨勢，即使成本墊高也接受；有閒錢就持續買好公司；不追熱門明牌。",godzillaThesis10Title:"美／台觀察分欄",godzillaThesis10Body:"美股資本利得稅→傾向抱更久；台股無資本利得＋有證交稅→周轉較高、投機文化較重（僅觀察，非操作指令）。",godzillaChecklistTitle:"作法清單",godzillaChecklistLead:"可執行的自我檢查，不是下單清單。",godzillaCheck1:"物慾低；別讓「夠了」的數字一直往上漲。",godzillaCheck2:"長股為核心；選擇權是衛星／避險／偶爾槓桿。",godzillaCheck3:"部位：不借錢；接受不了歸零，就別碰選擇權。",godzillaCheck4:"選擇權優先流動性高的大型股。",godzillaCheck5:"終局配置草圖：約 80% 寬基指數，小袖口參與產業（＋偶爾小額買權）。",godzillaCheck6:"PLTR 例子：B2B 靠前線工程師變現；若商業成長失望就減碼。",godzillaOptionsTitle:"選擇權用法",godzillaOptionsLead:"卖方為主；买方極少、僅在極端偏離時。",godzillaOpt1:"主力：Covered Call、Cash-secured Put。",godzillaOpt2:"小部位長買權／LEAP：恐慌或價格脫離基本面時。",godzillaOpt3:"權利金可全部虧完；從不裸倉。",godzillaOpt4:"被指派風險：往後換月；核心持股不為小權利金賣出。",godzillaRsuTitle:"RSU、稅務與輪換",godzillaRsuLead:"誘因、分散與離職後的稅務節奏。",godzillaRsu1:"歸屬當日賣出 RSU，再配置到信念標的（例：NVDA）。",godzillaRsu2:"在職高稅負時少動大額已實現利得；離職後多年輪換個股→指數。",godzillaRsu3:"Covered Call 作為下跌緩衝，不是賭方向。",godzillaTwTitle:"台股觀察",godzillaTwLead:"與美股框架分開；僅文化／稅制觀察。",godzillaTwBody:"美股有資本利得稅，傾向長期持有；台股無資本利得稅、有證交稅，周轉與短線文化較明顯。此頁主軸仍是美股框架，台股僅作對照，不寫進正式篩選。",godzillaGateNote:"尚未寫進正式篩選",godzillaGateDetail:"狀態：候選／strategyCandidate=watch。數學閘門關閉——未接入即時篩選器或模擬交易；僅供閱讀與對照。",jensenTitle:"黃仁勳／Jensen Huang",jensenHandle:"Stanford Entrepreneurial Thought Leaders · NVIDIA",jensenLead:"Stanford STVP／Entrepreneurial Thought Leaders 公開演講整理：視角、需求與摩爾定律、文化、現金現實、再發明——候選／觀察，非投資建議。",jensenDisclaimer:"非投資建議。整理自 Stanford Online 公開演講（約 2009；YouTube 2011 上傳）；論點來自講者自述主題，不構成個人化建議。數學閘門未通過，僅候選／觀察。",jensenHeroLabel:"黃仁勳演講重點",jensenKicker:"候選演講 · 美股科技／半導體創業",jensenTagline:"視角勝過空泛「願景」；用文化與再發明撐住長週期公司建設。",jensenUsFocus:"以美股／科技為主",jensenTalkBadge:"公開演講",jensenListenedBadge:"已聽寫",jensenStockTitle:"股票／事業重點（已聽寫）",jensenStockLead:"依公開 Stanford ETL 訪談影片音訊＋語音轉寫整理（約2009；歷史觀點，非當下財報）。候選／觀察；非投資建議。",jensenStock1:"創業敘事（1993）：押注 PC＋3D／遊戲會成大市場；VC／長輩當時不信「為了打遊戲開公司」。",jensenStock2:"競爭：消費級3D一度湧入數十～上百家；NVIDIA自述最終成僅存的電腦繪圖公司——關鍵是看懂事業本質（半導體／Moore's Law 如競爭律）與持續重塑，而非只靠執行。",jensenStock3:"可程式著色器轉型：主動吞噬自己成功的固定功能產品；第一代幾乎拖垮公司，但自認不做會死於 Moore's Law 節奏。",jensenStock4:"資源配置：競爭決定價格，CEO決定要不要接案；看關鍵資源相對市場需求與機會成本，不只會計成本。",jensenStock5:"文化：創新需容忍計算過的失敗；新創定義＝幾乎一直快倒閉。通用化 GPU（瑞士刀）有偏離利基風險，卻是延長產業壽命的路徑。",jensenStock6:"時間錨點：本場為歷史談（預現代AI訓練熱潮），勿直接外推今日資料中心財報。NVIDIA為講者公司；候選／觀察。",jensenStockNote:"轉寫：faster-whisper small int8（en）。來源 YouTube Xn1EsFe7snQ／Stanford ETL。歷史訪談觀點。",jensenMeta:"Stanford Online · STVP ETL · 約 1:03:38 · 上傳 2011-06-23",jensenSourceCite:"Jen-Hsun Huang · Stanford Online",jensenYoutube:"觀看 YouTube 演講",jensenOpenYoutube:"在 YouTube 開啟完整影片",jensenEmbedTitle:"Jen-Hsun Huang：Stanford student and Entrepreneur（Stanford Online）",jensenEcorner:"Stanford eCorner／STVP 相關剪輯",jensenHighlightsTitle:"演講重點（白話）",jensenHighlightsLead:"五條可掃讀主題；僅整理公開演講中反覆出現的論點，非逐字稿。",jensenH1Title:"視角，而非空泛「願景」",jensenH1Body:"人人都有視角。NVIDIA 早期押注：個人電腦加上便宜的 3D 會打開遊戲市場（後來也談到 Keyhole→Google Earth），當時對許多 VC 而言市場幾乎是零。",jensenH2Title:"無窮需求與摩爾定律",jensenH2Body:"新類別尚未被定價時，有時要暫時忽略顧客回饋；先 rinse-and-repeat，再在「夠好」扼殺媒介前重新發明（固定功能→可程式著色器／GeForce FX 近死經驗、CG 語言）。",jensenH3Title:"文化：敢冒算過的風險",jensenH3Body:"創新需要計算過的風險、容忍快速失敗、智識誠實、願意改道；動機是熱情與目的，而非「把公司賣掉」。",jensenH4Title:"現金與新創現實",jensenH4Body:"永遠在募資、省錢或賺錢；新創幾乎總是瀕臨倒閉。VC 更押人與夠大的市場，而非完美商業計畫。",jensenH5Title:"再發明：成功也要拆掉重建",jensenH5Body:"每一次成功終須拆解再建；黃仁勳談的是長視野公司建設，不是連續翻轉出場。",jensenTwTitle:"美／台分欄（僅脈絡）",jensenTwLead:"本條目市場主軸為美股科技／半導體公司建設；台灣僅作供應鏈脈絡，不發明台股標的。",jensenTwBody:"NVDA 作為美股半導體／運算平台公司，供應鏈與台灣晶圓製造、封測生態高度相關——此處僅作產業脈絡註記，不列台股清單，也不寫進正式篩選。",jensenGateNote:"尚未寫進正式篩選",jensenGateDetail:"狀態：候選／strategyCandidate=watch。數學閘門關閉——未接入即時篩選器或模擬交易；僅供閱讀與對照。",jensenWatchCta:"在 YouTube 觀看",jensenEmbedBlockedNote:"此演講由擁有者設定為僅能在 YouTube 觀看（無法於本站內嵌播放）。",optionsTitle:"美股選擇權",optionsLead:"以 McMillan《選擇權策略完全手冊》策略族為主：先看波動與風險形狀，再用公開 Yahoo 鏈結學習——非投資建議。",optionsDisclaimer:"非投資建議；選擇權風險高。僅供教育與公開數據篩選，不構成個人化下單建議。",optionsBookBadge:"這本書",optionsBookCite:"主要參考書",optionsBookLead:"Lawrence G. McMillan《選擇權策略完全手冊》增訂第五版：依看法與波動高低對應策略族（原創摘要，非原文）。",optionsBookFallbackTitle:"選擇權策略完全手冊（McMillan）",optionsGotoResearch:"到研究書庫看完整條目",optionsUsOnly:"僅美股",optionsQualityTitle:"標的輕量財報檢核",optionsQualityLead:"次要濾網：本益、淨值、負債、ROE、營收／獲利趨勢。缺欄略過；不作薦股。",optionsViewTitle:"選擇權觀點（McMillan）",optionsViewLead:"公開期權鏈：ATM 隱含波動、歷史波動、量能偏向；策略族為教育說明。",optionsMcmillanFirst:"先對齊波動高低與風險形狀，再想策略族——不是先猜漲跌再硬套。",optionsPe:"本益比",optionsPb:"股價淨值",optionsDebt:"負債／權益",optionsRoe:"ROE",optionsRevTrend:"營收趨勢",optionsEarnTrend:"獲利趨勢",optionsGate:"品質閘",optionsGatePass:"通過",optionsGateWatch:"觀察",optionsGateFail:"偏弱",optionsGateIncomplete:"資料不足",optionsDataMissing:"資料不足",optionsForwardPe:"預估本益",optionsTrendUp:"成長約 {pct}%",optionsTrendDown:"下滑約 {pct}%",optionsTrendFlat:"大致持平 {pct}%",optionsAtmIv:"ATM 隱含波動",optionsHv:"歷史波動（約 1 月）",optionsIvHv:"IV／HV",optionsVolRegime:"波動狀態",optionsRegimeIvRich:"隱含偏高",optionsRegimeIvCheap:"隱含偏低",optionsRegimeIvFair:"大致均衡",optionsRegimeIvOnly:"僅有 IV",optionsCallPutVol:"買權／賣權成交量",optionsAtmStrike:"近價履約價",optionsExpiry:"到期日",optionsSkewPutHeavy:"賣權量較重",optionsSkewCallHeavy:"買權量較重",optionsSkewBalanced:"量能大致均衡",optionsEduSetups:"策略族（教育）",optionsEduSetupsLead:"依看法＋波動狀態挑選家族；綠底表示較常對齊目前 IV／HV 狀態（仍非建議）。",optionsSetupCoveredCall:"備兌買權（Covered Call）",optionsSetupCoveredCallBody:"已持有股票時賣出買權，換取權利金；上漲空間被履約價「蓋住」。",optionsSetupCoveredCallWarn:"最大利潤有天花板；大跌時股票虧損仍在。",optionsSetupProtectivePut:"保護性賣權（Protective Put）",optionsSetupProtectivePutBody:"持股同時買進賣權，像買保險：下跌有地板，但要付保費。",optionsSetupProtectivePutWarn:"保險成本會吃掉報酬；若波動已很貴，保費更痛。",optionsSetupVertical:"垂直價差（Vertical）",optionsSetupVerticalBody:"同到期、不同履約價的買權或賣權組合，把最大損益框在可計算區間。",optionsSetupVerticalWarn:"方向看錯仍會虧；好處是虧損有上限。",optionsSetupCalendar:"日曆／對角價差（Calendar / Diagonal）",optionsSetupCalendarBody:"不同到期的選擇權組合，常用來表達「時間流逝」或波動變化看法。",optionsSetupCalendarWarn:"對波動與時間敏感；形狀會隨市價移動改變。",optionsSetupStraddle:"跨式／勒式（Straddle / Strangle）",optionsSetupStraddleBody:"同時買（或賣）買權與賣權，押「大波動」或「波動不夠」。",optionsSetupStraddleWarn:"買方需要夠大的移動；賣方面臨兩側風險。",optionsSetupButterfly:"蝶式（Butterfly）",optionsSetupButterflyBody:"多履約價組合，押價格收斂在中間附近；利潤區通常很窄。",optionsSetupButterflyWarn:"甜蜜點很窄；錯過中間就可能接近最大虧損。",optionsSetupVolAligned:"與目前波動狀態較常一起討論",optionsSetupVolNotAligned:"與目前波動狀態較不契合（仍可學習）",optionsRiskShape:"風險形狀（白話）",optionsNoSetups:"暫無策略族說明",optionsPickTicker:"請選擇上方美股代碼",optionsChainBlocked:"期權鏈暫時無法取得",optionsPartialBlocker:"部分欄位不完整",optionsRefreshHow:"資料會隨站點更新；若畫面異常請稍後再試。",optionsLoadError:"無法載入選擇權快照（{msg}）",optionsEmpty:"尚無美股樣本——請先跑 fetch-us-options",optionsGlossaryTitle:"小詞典（不用公式）",optionsTermDelta:"Delta（方向敏感度）",optionsDefDelta:"價格漲跌時，選擇權大概會跟多少。數字愈靠近 1 或 −1，跟現貨愈緊。",optionsTermIv:"隱含波動 IV",optionsDefIv:"市場「現在願意付多少保費」換算成的波動預期。愈高通常選擇權愈貴。",optionsTermHv:"歷史波動 HV",optionsDefHv:"過去一段時間股價實際晃動有多大，用來和 IV 對照。",optionsTermAtm:"ATM（近價）",optionsDefAtm:"履約價最靠近現價的合約，常拿來當波動溫度計。",optionsTermSkew:"量能偏向",optionsDefSkew:"買權與賣權成交量誰比較多，粗看市場偏保險還是偏追漲。",optionsTermProb:"機率（教育）",optionsDefProb:"只談「比較可能／比較少見」的直覺，不保證結果，也不給個人化勝率。",researchLead:"書單與論文：標題 → 摘要 → 重點作法 → 是否納入策略候選",researchMathGateBanner:"正式納入策略需數學閘門通過（目前未過）— 僅候選",researchMathGate:"數學閘門",researchMathGateDefault:"尚未通過數學閘門",researchFormulas:"可程式化公式",researchTakeaways:"重點作法",researchNoTakeaways:"尚無重點作法",researchSources:"來源",researchFilters:"篩選",researchFilterAll:"全部",researchType:"類型",researchTypeBook:"書籍",researchTypePaper:"論文",researchTypePodcast:"Podcast",researchMarketBoth:"美＋台",researchStrategy:"策略候選",researchCandYes:"候選納入",researchCandNo:"不納入",researchCandWatch:"觀察中",researchStatusCandidate:"候選",researchStatusDeferred:"暫緩",researchStatusAdopted:"已納入",researchStatusRejected:"排除",researchCounts:"書籍 {books} · 論文 {papers} · Podcast {podcasts} · 顯示 {total}",researchEmpty:"此篩選條件下暫無項目",researchNoFormulas:"尚無公式條目",researchLoadError:"無法載入研究庫（{msg}）",researchShelfFilters:"書架分類",researchShelfCoreInvesting:"核心投資經典",researchShelfValueInvesting:"價值型投資",researchShelfBusiness:"商業管理與商界視角",researchShelfLifePartner:"人生智慧與合夥人思想",researchShelfOptions:"選擇權／衍生品",researchShelfRecentReads:"近期閱讀與推薦書",researchShelfFiConcepts:"必看財商觀念書",researchShelfMoneyValues:"理財與金錢價值觀",researchShelfInvestingBasics:"投資理財入門",researchShelfAssetAllocation:"資產配置",researchShelfFinancials:"財報分析",researchShelfMarketAnalysis:"投資分析與戰勝市場",researchShelfEconAnalysis:"經濟分析",researchShelfPsych:"投資心理／隨機性／人性",researchShelfBiographies:"名人傳記",researchShelfAdjacent:"其他／隣接",todayPicks:"今日選股",market:"市場",hot:"熱門",marketQuotes:"市場報價",macroTitle:"美股大事",macroTzEt:"時間・美東 ET",macroAsOf:"更新",macroStale:"資料偏舊（仍顯示上次成功抓取）",macroToday:"今日",macroNext:"即將",macroHighImpact:"高影響",macroEmpty:"近期無高影響美股大事（或資料尚未更新）",macroLoadError:"無法載入美股大事（{msg}）",liveQuotesLive:"即時",liveQuotesStale:"報價暫緩（仍顯示上次成功）",liveQuotesStaleShort:"暫緩",liveQuotesClosed:"休市",liveQuotesClosedTitle:"台股與美股目前都不在交易時段，顯示最近收盤",liveQuotesPending:"即時報價連線中…",liveQuotesClock:"報價",macroEvent_fomcDecision:"FOMC 利率決議",macroEvent_fomcMinutes:"FOMC 會議紀要",macroEvent_cpi:"CPI 通膨",macroEvent_ppi:"PPI 生產者物價",macroEvent_pce:"PCE／核心 PCE",macroEvent_nfp:"非農就業 NFP",macroEvent_joblessClaims:"初請失業金",macroEvent_gdp:"GDP",macroEvent_retailSales:"零售銷售",macroEvent_ismMfg:"ISM 製造業",macroEvent_ismServices:"ISM 服務業",macroEvent_jolts:"JOLTS 職缺",twMacroTitle:"台股大事",twMacroTz:"時間・台北時間",twMacroEmpty:"近期無高影響台股大事（或資料尚未更新）",twMacroLoadError:"無法載入台股大事（{msg}）",twMacroEvent_cbcDecision:"央行理監事會",twMacroEvent_dgbasCpi:"CPI 消費者物價",twMacroEvent_dgbasPpi:"PPI／物價指數",twMacroEvent_dgbasUnemployment:"失業率",twMacroEvent_dgbasGdpFlash:"GDP 概估",twMacroEvent_dgbasGdp:"GDP／經濟成長",twMacroEvent_dgbasForecast:"經濟預測",twMacroEvent_moeaExportOrders:"外銷訂單",twMacroEvent_moeaIndustrialProd:"工業生產",twMacroEvent_twseHoliday:"台股休市",usStock:"美股",twStock:"台股",usList:"美股清單",twList:"台股清單",usTop:"美股 Top",twTop:"台股 Top",emptyTop:"{market} 暫無 Top 候選",ticker:"代碼",name:"名稱",price:"價格",dayPct:"日漲跌",rs:"RS",priorClose:"前收",priorCloseFull:"前收漲幅",pct5d:"5 日",pct1m:"約 1 月",volRatio:"量比",ma:"均線",screening:"篩選",reason:"理由",details:"詳情",business:"本業",risk:"風險",observe:"觀察",dataIncomplete:"資料不全",intraday:"盤中",taipeiClose:"台北收",taiex:"台灣加權 TAIEX",otc:"櫃買",spx:"S&P 500",nasdaq:"Nasdaq",sox:"SOX",usdtwd:"USD/TWD",loadError:"無法載入資料（{msg}）。請確認以靜態伺服器開啟，且 data/latest.json 存在。",langLabel:"語言",paper:"模擬",paperMissing:"尚無模擬帳本檔案。請於專案執行 npm run paper。",paperDisclaimer:"累積模擬帳戶（自 {date} 起） · 不會每日歸零 · 買進即成交 · 非真實下單",paperRules:"規則（各市場獨立帳）",paperRuleTw:"台股本金 NT$3,000,000 · 整張成交 · 休市日（含颱風停市）不買不賣，休市後要等第一個交易日收盤的新價格才重新判斷",paperRuleUs:"美股本金 US$100,000 · 可買 1 股起",paperRuleBuy:"買：當天名單裡的股票，每檔最多放帳本總值的 8%，再看現金夠不夠；台股只買整張，買不起一張就跳過 · 下單即成交",paperRuleSell:"賣：停損−3% · 停利+12%半倉 · 破SMA20且日跌>2% · 離名單虧損 · 漲停隔日−5%",paperTabTw:"台股帳 · NT$",paperTabUs:"美股帳 · US$",paperBookTw:"台股帳本（NT$）",paperBookUs:"美股帳本（US$）",principal:"本金",cash:"現金",equity:"權益（部位＋現金）",totalPnl:"總損益",totalPnlPct:"總損益 ％",weekPerf:"週績效",monthPerf:"月績效",quarterPerf:"季績效",yearPerf:"年績效",sinceInception:"成立以來",noTradesToday:"本日尚無此類成交（模擬）",noPositions:"目前沒有持股",buy:"買",sell:"賣",shares:"股",qtyShares:"股數",positions:"目前部位",position:"部位",avgCost:"成本",mark:"現價",mktValue:"市值",dayPnl:"日損益",costBasis:"成本合計",weightPct:"權重 ％",posScrollHint:"左右滑動看全部欄位",unrealizedPnl:"未實現損益",unrealizedPct:"未實現 ％",recentTrades:"成交（近 40）",tradeHistory:"全部成交紀錄（依交易日）",tradeHistoryHint:"共 {n} 個交易日、{total} 筆。點日期展開，可看每筆價格、成本與賺賠金額。",histDayCount:"買 {b} 筆 · 賣 {s} 筆",histDayRealized:"當天賣出實現",histNoSells:"當天沒有賣出",paperSession:"{date} · 自 {inception} 累積 · 買進即成交",reasonScreenBuy:"名單新開倉",reasonAdd:"持續買進",reasonStop:"停損",reasonTakeProfit:"停利",reasonMomentumBreak:"動能轉弱",reasonOffList:"離開名單",reasonLimitUpChase:"漲停追價急殺",paperRuleOpt:"美股帳可模擬買／賣選擇權（單腳）；權利金來自公開期權鏈，乘數×100；到期依內含價值結算",paperRuleTxf:"台股帳可模擬台指期 TX／MTX；點數×官方乘數（TX 200／MTX 50）×口數＝損益；保證金用期交所公開初始保證金",paperDerivUsTitle:"美股選擇權（紙上）",paperDerivUsLead:"單腳買／賣 Call／Put。權利金＝當日公開鏈；絕不捏造。現金借記／貸記更新本帳。",paperDerivServerBook:"全站模擬部位（每台裝置都看得到，不是手機暫存）。",paperDerivTwTitle:"台指期 TX／MTX（紙上）",paperDerivTwLead:"價格來自台指期桌（session {session}）。多／空口數；損益＝點數差×乘數×口數（TWD）。",paperDerivFreeCash:"可用現金（本帳）",paperDerivOptMv:"選擇權市值",paperDerivMarginHold:"保證金占用",paperDerivUnderlying:"標的",paperDerivRight:"Call／Put",paperDerivStrike:"履約價",paperDerivPremium:"權利金",paperDerivCashImpact:"現金影響",paperDerivFutCode:"商品",paperDerivMonth:"契約月",paperDerivNear:"近月",paperDerivNext:"次月",paperDerivContract:"契約",paperDerivContracts:" 口",paperDerivLong:"多",paperDerivShort:"空",paperDerivMarkSrc:"標記來源",paperDerivLastDay:"最後交易日",paperDerivMarginNote:"紙上保證金：以期交所公開「初始保證金」×口數占用現金；非真實下單。",paperDerivNoOptPos:"尚無選擇權部位",paperDerivNoFutPos:"尚無台指期部位",paperDerivNoChain:"尚無可成交的公開期權鏈（需 paperChain 權利金）",paperDerivNoPremium:"此履約價沒有可用公開權利金",paperDerivNoTxf:"尚無台指期桌資料（public/data/txf-desk.json）",paperDerivNoMonth:"桌面沒有此契約月報價",paperDerivNoFutPrice:"沒有可用的公開期貨價（last／settle）",paperDerivNoMargin:"桌面缺少官方初始保證金數字",paperDerivBadRight:"請選 Call 或 Put",paperDerivBadQty:"口數／張數須為正整數",paperDerivBadSide:"買賣方向無效",paperDerivBadCode:"僅支援 TX／MTX",paperDerivBadMult:"乘數與官方規格不一致，已阻擋",paperDerivExpiryMismatch:"到期日與公開鏈不一致",paperDerivNeedCash:"現金不足（需要約 {need}）",paperDerivNeedMargin:"保證金不足（需要約 {need}）",paperDerivMathBlock:"數學守衛攔截：非有限數字，未寫入",paperDerivFail:"下單失敗",paperDerivFillOk:"已成交 @ {px}",paperDerivUserOpen:"紙上開倉",paperDerivUserClose:"紙上平倉",paperDerivExpirySettle:"到期依內含價值結算",paperDerivFutSettle:"最後交易日後依結算／最後價平倉",paperDerivStrategy_covered_call:"備兌買權",paperDerivStrategy_protective_put:"保護性賣權",paperDerivStrategy_long_call:"買進買權",paperDerivStrategy_long_put:"買進賣權",paperDerivStrategy_short_call:"賣出買權",paperDerivStrategy_short_put:"賣出賣權",stopLoss:"停損",takeProfit:"停利",paperTrade:"模擬",realizedPnl:"實現損益",sessionRealizedPnl:"本次賣出實現損益合計",costMissing:"成本資料缺失",costMissingCount:"另有 {n} 筆缺成本",realizedOpenOnly:"尚未實現（持倉中）",paperDerivFills:"衍生性成交",tradeDate:"日期",periodPerf:"績效",qty:"數量",note:"說明",strategyScreen:"策略選股",strategyLead:"台／美命中分開檢視 · 公開資料命中優先",strategyLoading:"載入策略結果中…",strategyEmpty:"尚無策略資料。請執行 npm run strategies。",strategyLoadError:"無法載入策略選股（{msg}）。請確認已執行 npm run strategies。",strategyList:"策略列表",strategyCat:"策略分類",hitCount:"檔命中",hitTitle:"命中檔數",strategyDetails:"詳情 · 策略說明",conditions:"條件",results:"篩選結果",copyJson:"複製 JSON",exportCsv:"匯出此策略 CSV",exportJson:"匯出 JSON",copied:"已複製",noHitsExport:"此策略今日無命中列可匯出",incomplete:"不足",hitsTotal:"共{n}檔",twOnlyHint:"本策略僅台股",hitMarket:"命中市場",noHits:"本日無命中",dataInsufficient:"資料不足",calibTitle:"校準說明",incompleteFilters:"未檢查濾網（不算通過）：",sessionTwse:"證交所 session",ohlcvBar:"OHLCV K棒",generated:"產生",universeTw:"台股宇宙",universeUs:"美股宇宙",cat精選:"精選",cat價量:"價量",cat籌碼:"籌碼",cat財務:"財務",cat大師:"大師",cat週期:"週期",cat技術:"技術",cat基本:"基本",cat綜合:"綜合",addWatchlist:"加入自選",watchlistAdded:"已加入自選 {ticker}",watchlistExists:"{ticker} 已在自選",copyFailed:"複製失敗（請手動選取）",csvDownloaded:"已下載 CSV",csvBlocked:"下載被擋：改以資料連結開啟",backtestSoon:"回測：尚未開放",backtestHint:"回測：資料／引擎尚未開放（不提供假回測）",regimeToday:"今日市場週期（美／台分開）",psychologyPhase:"心理相位",cycleStance:"週期姿態",liquidityBias:"流動性偏誤",temperatureScore:"市場溫度",sizeMult:"部位乘數",regimeTags:"週期標籤",dataGaps:"資料缺口",marketRegime:"市場週期",enum_euphoric:"亢奮",enum_late_optimism:"晚期樂觀",enum_mid_cycle:"中期",enum_cautious_recovery:"謹慎復甦",enum_despondent:"絕望",enum_panic:"恐慌",enum_defensive:"防守",enum_selective:"精選",enum_balanced:"均衡",enum_constructive:"偏建設",enum_aggressive:"積極",enum_stabilize_first:"先求穩",enum_risk_off:"偏防守",enum_risk_on:"偏進攻",enum_neutral:"中性",logicTitle:"選股邏輯",logicSubtitle:"先看市場，再挑個股。門檻用日常用語說明，不把流程寫成算式。",logicLead:"這頁說明每日名單怎麼來，以及模擬帳在什麼情況下買進、賣出。美股與台股各自判斷，不會併成一種全球心情。先看該市場現在偏熱還是偏冷，再決定今天挑股票有多嚴；模擬帳只在自己的帳本裡成交，不是向券商下單，也不構成投資建議。",logicNoRegime:"今天還沒有市場心情的資料，等下次掃描寫入。",logicRegimePlain:"上面是今天的判斷，美股與台股各看各的。心情與資金面用文字呈現；原始溫度分數不在這裡展開。部位倍數代表什麼，寫在第一節。",logicStep1:"先看市場",logicStep1Lead:"每天先分開看美國與台灣，決定今天的挑法有多嚴、名單大概留幾檔。這一層本身不下單。",logicStep1Caption:"表上是基本對應。部位倍數只改名單長短，以及畫面上的積極程度，不會拿去乘模擬帳的股數。恐慌後若已站回二十日均線，挑法會改得比較積極，見下面說明。",logicStep2:"再挑個股",logicStep2Lead:"下面每一條都是能不能進名單。真正的買與賣在模擬帳，而且美股、台股各過各的關。",logicStep3:"策略頁另外對照",logicStep3Lead:"這不是每日名單的複本，而是用公開欄位再對一次。缺資料就略過。",logicStep4:"決定誰排前面",logicStep4Lead:"過關之後才排序。往前或往後，不代表已經買進或賣出。",logicStep5:"理由那一句",logicStep5Lead:"名單上的說明，來自當天已核對的欄位，不是另外寫的故事。",logicStep6:"模擬帳的買與賣",logicStep6Lead:"模擬帳用來檢查流程有沒有照規則走。它不是券商委託，也不會把美股盈虧換算進台股。",logicPhaseDefensive:"約七檔",logicPhaseSelective:"約九檔",logicPhaseBalanced:"約十二檔",logicPhaseConstructive:"約十二檔",logicPhaseAggressive:"最多十四檔",logicPhaseStabilize:"約五檔",logicLblDoes:"在做什麼",logicLblWhen:"何時進出",logicLblRefuse:"不會做什麼",logicLblExample:"舉例",logicOpenStrategies:"開啟策略頁",logicOpenPaper:"開啟模擬頁",logicFootnote:"以上說明供對照篩選規則，不是投資建議。經典方法只採用公開數字算得出來的部分，不搬運受著作權保護的原文。",logicSepTitle:"美股與台股分開",logicSepDoes:"兩個市場各看自己的指數、自己的名單，不合成一種全球心情。",logicSepWhen:"美股只跟標普比，台股只跟加權指數比。模擬的美股帳與台股帳分開記，現金不互相移轉。",logicSepRefuse:"不會因為美股很熱，就把台股改成同一種挑法，反過來也不會。",logicSepExample:"同一天可以是美股精選、台股仍均衡。兩邊名單各寫各的，不會用一邊的結果去填另一邊。",logicMoodTitle:"市場心情決定今天有多挑",logicMoodDoes:"先把該市場分成六種心情，每一種對應一種挑法，並改每天大約留幾檔。",logicMoodWhen:"亢奮用防守，約七檔，畫面上的部位倍數約平常的一半。晚期樂觀用精選，約九檔、約八成。中期用均衡，約十二檔、維持平常。謹慎復甦用偏建設，仍約十二檔，倍數約一點一倍。絕望用積極，最多十四檔，約一點三五倍。恐慌用先求穩，約五檔、約三成。若恐慌之後指數已站回二十日均線，挑法會改偏積極；若資金面同時偏緊，則只到偏建設，不會放到最積極。",logicMoodRefuse:"部位倍數不拿來計算模擬帳要買幾股。也不會把六種心情合成一個全球分數。",logicMoodExample:"價格離高點很近、市場顯得亢奮時，不會因此多挑，反而少留幾檔，只看走勢比較完整的名字。",logicRatesTitle:"利率走快時，把積極度拉回來",logicRatesDoes:"用美國十年期公債殖利率的變化，標記資金面偏緊或偏鬆。這是註記，不是另一套選股算式。",logicRatesWhen:"二十個交易日內，殖利率上升達到零點二五個百分點，資金面標成偏防守。若當時的挑法比精選更鬆，包括均衡、偏建設與積極，而且不是恐慌當下的先求穩，就改成精選。已經是防守的，維持防守。六十個交易日內，殖利率下降達到零點二五個百分點，資金面標成偏進攻。",logicRatesRefuse:"殖利率下降不會因此把挑法改成積極。市場已經亢奮時，也不會因為資金面偏鬆就把防守拿掉。台股另看美元兌台幣：二十日內上升達到百分之二，原本偏進攻的改為中性，否則標成偏防守。這條不套到美股名單。美元兌台幣走弱只作註記，不放寬挑法。",logicRatesExample:"股價看起來平平，但美國公債殖利率半個月內明顯走高，今天仍會挑得比較嚴，不會當成普通的中期行情。台股若同時碰到美元走強，資金面註記會更偏緊，美股名單不跟著改。",logicBalTitle:"均衡時，怎麼進動能名單",logicBalDoes:"市場中性時，用今天、近五天、近一個月的強弱，加上股價有沒有站上短期均線，決定能不能標成動能。二十日均線是近二十個交易日的平均價，五十日、兩百日依此類推。",logicBalWhen:"符合下面任何一項就標上。今天比該市場指數強至少零點五個百分點，或自己上漲至少百分之一點五。或者近五天漲至少百分之三。或者近一個月漲至少百分之六，而且股價在二十日均線之上。或者同時在二十日與五十日均線之上，而且近五天沒有下跌，或今天沒有輸給指數。過了這關才有資格進動能名單。模擬帳還要等它出現在該市場名單、而且不是純觀察，才可能買。",logicBalRefuse:"四項都不符合，就不標動能。這一關不賣股票，也不會用美股的強弱去讓台股過關。",logicBalExample:"一檔美股今天只小漲，但比標普多出至少半個百分點，可以進這關。一檔台股要跟加權指數比，不是跟標普比。",logicSelTitle:"精選時更看中期均線",logicSelDoes:"要少挑的時候，先要求股價站上五十日均線，再看短線有沒有力量。",logicSelWhen:"必須在五十日均線之上，而且再符合一項：今天比指數強至少零點五個百分點，或近五天漲至少百分之三，或近一個月漲至少百分之六且在二十日均線之上。",logicSelRefuse:"還在五十日均線下方的，即使今天反彈，也不進這關。",logicSelExample:"一檔台股今天反彈，但仍低於五十日均線。精選日不會因為單日上漲就放進動能名單。美股同樣先看五十日均線，只是比較的對象換成標普。",logicDefTitle:"防守時兩條均線都要在",logicDefDoes:"市場很熱時，只留短期與中期趨勢都還在、而且不是靠很小的成交量硬墊高的名字。",logicDefWhen:"必須同時站上二十日與五十日均線，而且今天比指數強至少零點八個百分點，或近五天漲至少百分之四。成交量至少要有近二十日的平常水準。若當天沒有成交量資料，這一項不擋。",logicDefRefuse:"近一個月已經漲至少百分之十二，成交量卻不到平常的八成，直接剔除。不把這種又急又薄的漲勢留在防守名單。",logicDefExample:"一檔美股一個月漲很多，今天成交卻明顯少於平常。防守日不會因為漲得多就留下它。台股用同樣的標準，成交量跟自己近二十日比，不跟美股比。",logicAggTitle:"積極時放寬，但仍要有均線或量",logicAggDoes:"可以早一點看的時候，放寬今天和近一個月的門檻，也允許價格還弱、但成交放大的情況。",logicAggWhen:"今天比指數強至少零點三個百分點，或自己上漲至少百分之一，或近五天漲至少百分之二，或近一個月漲至少百分之四且在二十日均線之上，或站在兩百日均線之上、近一個月仍下跌、成交量至少是平常的一點四倍。除此之外，還要站上兩百日或二十日均線，或成交量至少是平常的一點三倍。",logicAggRefuse:"只是弱、沒有站上這些均線、量也不夠的，不會因為姿態積極就放行。",logicAggExample:"一檔股票一個月還在跌，但已站上長期均線，成交也明顯比平常多。積極日可以把它看成有人承接，而不是直接忽略。美股、台股都用這組條件，只是各自跟自己的指數比。",logicConTitle:"偏建設比積極多一道均線",logicConDoes:"復甦初期用和積極幾乎相同的力量條件，但一定要站上二十日或兩百日均線。",logicConWhen:"力量條件與積極相同。過了之後，還必須在二十日均線或兩百日均線之上。",logicConRefuse:"沒有站上這兩條之一、只靠成交量湊過積極那一關的，偏建設不收。",logicConExample:"成交量來到平常的一點三倍，股價卻仍在二十日與兩百日均線下方。積極日有機會，偏建設日不會收。這條在美股與台股各自判斷，不會互相借用。",logicStabTitle:"先求穩，要先站回二十日均線",logicStabDoes:"恐慌之後不急著接，先看股價有沒有回到二十日均線之上，而且當天要明顯強過指數，或成交明顯放大。",logicStabWhen:"必須在二十日均線之上，並且今天比指數強至少一個百分點，或成交量至少是平常的一點五倍。",logicStabRefuse:"還在二十日均線下方的一律不進。這種日子也不使用一個月漲夠多就補標的後門。",logicStabExample:"大跌過後，一檔台股仍在二十日均線下，即使成交很大，也不放進動能名單。美股同樣要先站回自己的二十日均線。",logicVolTitle:"成交量是另一個標籤",logicVolDoes:"用今天的成交量，除以近二十個交易日的平均量，看今天有沒有比平常熱。這是標籤，不是另一筆買進。",logicVolWhen:"防守日至少要有平常的水準。積極日至少要是平常的一點一倍。其他挑法至少一點二倍。達到就多標一個量能記號。",logicVolRefuse:"沒有成交量資料就不標。不會只因為有量能記號，就在另一個市場下單，也不會因此賣出。",logicVolExample:"均衡日一檔股票比平常多出至少兩成，會標上量能；不到兩成則不標。台股的平常是它自己近二十日的量，不是美股的量。",logicBackTitle:"一個月夠強，可以補進動能",logicBackDoes:"有些股票今天不夠強，但近一個月趨勢清楚，仍補上動能標籤。",logicBackWhen:"原本沒過動能關，但近一個月漲至少百分之八，而且同時站上二十日與五十日均線。先求穩的日子不用這條。",logicBackRefuse:"一個月強、卻沒有同時站上這兩條均線的，不補。先求穩時也不補。補上之後仍只留在該市場的名單。",logicBackExample:"今天輸給加權指數，但近一個月漲超過百分之八，而且兩條均線都在股價下方。台股的均衡日仍會補上動能。美股則是跟標普比完仍沒過關時，才用同一條補。",logicRankTitle:"名單裡誰排前面",logicRankDoes:"進了名單之後，今天比指數強的程度排最前，其次是近五天，再來是近一個月。站上均線、成交明顯放大，會再往前靠。",logicRankWhen:"站上二十日均線的加分多於五十日，五十日又多於兩百日。成交量至少是平常的一點二倍會再往前；不到平常的四成會略往後。當天漲至少百分之九點五，也會往前。美股用相對標普的差距，台股用相對加權的差距。",logicRankRefuse:"這裡不公開加權算式。缺了當天漲跌，這檔不照正常方式往前排。不會把台股的強弱拿去排美股。",logicRankExample:"兩檔都在美股名單上時，今天比標普強更多的那檔，通常排在只靠一個月漲幅的前面。台股名單裡的名次只在台股之間比。",logicHotTitle:"熱但量不夠，就往後排",logicHotDoes:"防守和精選時，已經漲一段、成交卻變少的名字，排序往後，不讓它因為漲得多就排很前。",logicHotWhen:"這兩種挑法下，若同時站上二十日與五十日均線，排序略往前；少了其中一條就往後。近一個月漲至少百分之八、成交量不到平常的八成，再明顯往後。成交量不到平常的七成、當天又漲超過百分之二，也往後。",logicHotRefuse:"不會在這種日子把縮量急漲排到最前。策略頁在防守或精選時，會把這種一個月強、量卻薄的標的排除在那一包之外。每日名單仍可能看得到，只是名次往後。",logicHotExample:"精選日一檔台股一個月漲了約一成，今天的量只有平常的一半。它就算還在台股名單裡，也會被排到後面。美股用同一標準，量是跟自己比。",logicFirmTitle:"價弱但量出來，可以往前",logicFirmDoes:"積極和偏建設時，價格一個月還在跌、但長期趨勢還在、成交放大的名字，排序往前。",logicFirmWhen:"近一個月仍下跌、成交量至少是平常的一點五倍、而且站上兩百日均線，會明顯往前。當天上漲且成交量至少是平常的一點一倍，也會往前一些。低於五十日均線、但仍在兩百日均線之上，再小幅往前。",logicFirmRefuse:"不會把一個月下跌、量又沒有放大的當成承接。這條不加在防守、精選或先求穩的日子。",logicFirmExample:"積極日一檔美股一個月還小跌，但站在長期均線上，成交比平常多出一半以上。它會排在同樣弱、量卻平平的美股前面。台股只跟其他台股比這件事。",logicPanicTitle:"沒站回短期均線，就排更後",logicPanicDoes:"先求穩時，名字先整體往後排；已經站回二十日均線的再拉回一些，還沒站回的再往後。",logicPanicWhen:"站上二十日均線的，往後排的幅度比較小。沒站上的，通常排不進前面。",logicPanicRefuse:"不會因為恐慌就改去買跌最深的，也沒有越跌越優先。",logicPanicExample:"大跌之後，已回到二十日均線上的那檔，會排在仍在均線下的前面。美股、台股各自排序，不把兩邊混成一張表。",logicCountTitle:"名單大概留幾檔",logicCountDoes:"挑法會改每天公布的檔數，避免熱的時候名單太長。",logicCountWhen:"平常約十二檔。防守約七檔，精選約九檔，先求穩約五檔，積極最多十四檔。均衡與偏建設維持約十二檔。美股一份、台股一份，檔數各自計算。",logicCountRefuse:"不會為了湊滿檔數，把沒過門檻的補進去，也不會把美股空出來的名額讓給台股。",logicCountExample:"防守日即使很多股票都漲，公開的美股名單仍只留前面約七檔。台股名單另外留自己的約七檔。",logicXqTitle:"策略頁是另一份對照",logicXqDoes:"用公開的價量、籌碼、財務，以及能用公開數字計算的經典條件，另外列命中的股票。它跟每日名單同時存在，不是同一張表的複本。",logicXqWhen:"價量看均線與短線。籌碼看公開的法人張數。財務看獲利、本益比、營益率等公開欄位。週期條件則跟著當天美股、台股各自的挑法走。",logicXqRefuse:"某個欄位沒有公開資料，就跳過那個條件，不補一個看起來合理的數字，也不搬付費資料庫的內容。不會用台股的張數去填美股。",logicXqExample:"台股若缺少法人張數，籌碼那一條就略過，不會假設外資在買。美股沒有同一套張數時，也不拿台股的籌碼結果去補。",logicWhyTitle:"理由是把當天看得到的事實接起來",logicWhyDoes:"每一檔後面的理由，用當天已核對的漲跌、均線和成交量串成一句話，不是另外寫的故事。",logicWhyWhen:"一定寫當天漲跌，以及相對指數差了幾個百分點：美股對標普，台股對加權。有近五天、近一個月就寫上。成交量至少是平常的一點二倍才寫量。均線優先寫有沒有同時站上二十日與五十日，再補兩百日。排序時若有週期註記就附上，否則附上當天的挑法。",logicWhyRefuse:"不會寫資料裡沒有的目標價。量沒有明顯放大，就不寫成爆量。也不會把台股的理由寫成相對標普。",logicWhyExample:"同一天，台股的理由會寫相對加權，美股的理由會寫相對標普。兩邊不會共用一句比較。",logicBuyTitle:"模擬帳怎麼買",logicBuyDoes:"資料日更新後，先處理該賣的，再依當天名單在美股帳、台股帳各自買。成交價用當天資料裡的價格，視為立刻成交。帳從台幣三百萬與美元十萬起算，現金和持股會留下，不會每天歸零。",logicBuyWhen:"只買該市場名單裡的股票，純觀察的不買。先買當天前五名裡屬於這個市場的，再買其餘。每一筆新倉願意承擔的虧損大約是帳上權益的百分之一；假設價格往不利方向走百分之一點五，反推能買幾股。成交量達到平常的三倍時，不利方向改用百分之二點五，同樣的風險金額會買得少一些。單一個股的市值不超過權益的百分之八。已經持有、今天仍在名單、還沒到百分之八，同一天最多再加一次；當天賣過的不加回。",logicBuyRefuse:"現金不夠買一股就不買。台股買不起一整張，也就是一千股，就跳過，不改買零股。美股可以從一股開始。兩本帳不做匯率換算。畫面上的部位倍數不拿來乘股數。",logicBuyExample:"台股帳看到名單上的股票，但依上面的算法買不起一千股，就整檔跳過。美股帳同一天可以只買一股，不會套用台股的張數規則。",logicSellTitle:"模擬帳怎麼賣",logicSellDoes:"每天先檢查該帳手上的股票。先碰到的規則先賣，停損排在停利前面。賣出也用當天資料裡的價格。",logicSellWhen:"相對成本虧了百分之三或更多，全部賣掉。當初買進時當天漲至少百分之九點五，或風險說明寫了漲停，而且不是買進當天、今天又跌了百分之五或更多，全部賣掉。資料寫明股價在二十日均線之下，而且當天下跌超過百分之二，全部賣掉。今天不在該市場名單上，而且帳上還在賠，全部賣掉。獲利達到百分之十二或更多，賣掉一半。美股只剩一股，或台股一半不足一千股，就全部賣掉。台股賣出股數會取整到一千股。",logicSellRefuse:"獲利不到百分之十二，不會因為已經賺錢就賣。還在名單上、又沒碰到上面幾條，就不賣。兩條資料若沒有寫明均線或當天漲跌，動能轉弱這一條不觸發，不會用猜的。美股的賣出不拿去結算台股帳。",logicSellExample:"成本一百元、漲到一百一十二元，模擬帳賣掉一半，另一半留著。若先跌到九十七元，則是全部停損，不會先做停利。這套賣法在美股帳用美元成本，在台股帳用台幣成本，不混著算。",sma20:"SMA20",sma50:"SMA50",screenA:"A",screenB:"B",screenC:"C",condPass:"條件",condFail:"未過",condSkip:"略過",pe:"本益比",opMargin:"營益率",grossMargin:"毛利率",foreignInv:"外資",trustInv:"投信",dealerInv:"自營商",maBull:"均線多頭",rsi:"RSI",amplitude:"振幅",zhang:"張",limitUp:"漲停",momentum:"動能",metricPrice:"價格",metricDayPct:"日漲跌",metricVolRatioYday:"量比(昨)",metricVolToday:"今量(張)",metricDebt:"負債比%",metricDirector:"董監持股%",metricOpQ:"近季營益率%",metricSource:"來源",foreign1d:"外資1日(張)",trust1d:"投信1日(張)",dealer1d:"自營商1日(張)",foreign5d:"外資5日(張)",trust5d:"投信5日(張)",dealer5d:"自營5日(張)"},rt={"zh-Hant":fs},Si={en:()=>Ca(()=>import("./en-Cx_v8ocm.js"),[]),"zh-Hans":()=>Ca(()=>import("./zh-Hans-BoGRqZBA.js"),[]),ja:()=>Ca(()=>import("./ja-BvQw3kSs.js"),[])},bt=new Map;function hs(e){if(rt[e])return Promise.resolve(!0);const t=Si[e];return t?(bt.has(e)||bt.set(e,t().then(a=>(rt[e]={...fs,...a.default||{}},!0)).catch(a=>(bt.delete(e),console.warn(`i18n ${e} load failed`,a),!1))),bt.get(e)):Promise.resolve(!1)}function Ti(){return hs(W).then(e=>(!e&&W!==ft&&(W=ft),W))}function ee(e){if(e==null||e==="")return s("dataInsufficient");const t=String(e),a=`enum_${t}`,i=t.includes("_")?t.replace(/_/g," "):t;return s(a,i.replace(/\b\w/g,r=>r.toUpperCase()))}function wi(e){const t=String(e||"").toLowerCase();return["defensive","selective","balanced","constructive","aggressive","stabilize_first"].includes(t)?t.replace(/_/g,"-"):"neutral"}function s(e,t,a){let i,r=a;t&&typeof t=="object"&&!Array.isArray(t)?r=t:typeof t=="string"&&(i=t);let o=(rt[W]||rt[ft])[e]??rt[ft][e]??i??e;if(r)for(const[c,u]of Object.entries(r))o=o.replace(new RegExp(`\\{${c}\\}`,"g"),String(u));return o}function xi(){const e=us.map(t=>`<option value="${t.id}"${t.id===W?" selected":""}>${t.label}</option>`).join("");return`
    <label class="lang-switch" title="${s("langLabel")}">
      <span class="lang-switch-label">${s("langLabel")}</span>
      <select class="lang-select" data-lang-select aria-label="${s("langLabel")}">
        ${e}
      </select>
    </label>`}function Pi(e,t){var i;const a=(i=e==null?void 0:e.querySelector)==null?void 0:i.call(e,"[data-lang-select]");a&&(a.value=W,a.addEventListener("change",async()=>{const r=a.value;!await bi(r)&&a.isConnected&&a.value===r&&(a.value=W)}))}function n(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function T(e,t){return n(s(e,t))}const ae=100,Sn=Object.freeze({TX:200,MTX:50,TMF:10});function k(e){return typeof e=="number"&&Number.isFinite(e)}function gs(e){return Number.isInteger(e)&&e>0}function Ci(e,t,a){if(!k(e)||!k(t)||!(e>=0)||!(t>=0))return null;const i=String(a||"").toLowerCase();return i==="call"||i==="c"?Math.max(e-t,0):i==="put"||i==="p"?Math.max(t-e,0):null}function Zt({side:e,premium:t,contracts:a,multiplier:i=ae}){if(e!=="buy"&&e!=="sell")return{ok:!1,error:"side must be buy|sell"};if(!k(t)||t<0)return{ok:!1,error:"premium must be ≥ 0 finite"};if(!gs(a))return{ok:!1,error:"contracts must be positive integer"};if(!k(i)||!(i>0))return{ok:!1,error:"multiplier must be > 0"};const r=t*i*a;return k(r)?{ok:!0,cashDelta:e==="buy"?-r:r,notional:r}:{ok:!1,error:"notional non-finite"}}function ms({qty:e,markPremium:t,multiplier:a=ae}){if(!Number.isInteger(e)||e===0||!k(t)||t<0||!k(a)||!(a>0))return null;const i=e*t*a;return k(i)?i:null}function va({qtySigned:e,avgPremium:t,markPremium:a,multiplier:i=ae}){if(!Number.isInteger(e)||e===0||!k(t)||t<0||!k(a)||a<0||!k(i)||!(i>0))return null;const r=(a-t)*i*e;return k(r)?r:null}function Li({qtySigned:e,spot:t,strike:a,right:i,multiplier:r=ae}){const l=Ci(t,a,i);if(l==null)return{ok:!1,error:"bad intrinsic inputs"};if(!Number.isInteger(e)||e===0)return{ok:!1,error:"qtySigned must be non-zero int"};if(!k(r)||!(r>0))return{ok:!1,error:"bad multiplier"};const o=e*l*r;return k(o)?{ok:!0,intrinsic:l,cashDelta:o,settlePremium:l}:{ok:!1,error:"cash non-finite"}}function ys(e){const t=String(e||"").toUpperCase();return Object.prototype.hasOwnProperty.call(Sn,t)?Sn[t]:null}function ji({pointsDelta:e,multiplier:t,contractsSigned:a}){if(!k(e)||!k(t)||!(t>0)||!Number.isInteger(a)||a===0)return null;const i=e*t*a;return k(i)?i:null}function ba({entryPrice:e,markPrice:t,code:a,contractsSigned:i}){if(!k(e)||!k(t)||!(e>0)||!(t>0))return null;const r=ys(a);return r==null?null:ji({pointsDelta:t-e,multiplier:r,contractsSigned:i})}function ka({contracts:e,initialMarginPerContract:t}){if(!gs(e)||!k(t)||!(t>0))return null;const a=e*t;return k(a)?a:null}function Ai({freeCash:e,contracts:t,initialMarginPerContract:a}){if(!k(e)||e<0)return{ok:!1,error:"freeCash invalid"};const i=ka({contracts:t,initialMarginPerContract:a});return i==null?{ok:!1,error:"margin hold invalid"}:e+1e-9<i?{ok:!1,error:"insufficient margin cash",hold:i}:{ok:!0,hold:i}}function Tn({freeCash:e,premium:t,contracts:a,multiplier:i=ae}){if(!k(e)||e<0)return{ok:!1,error:"freeCash invalid"};const r=Zt({side:"buy",premium:t,contracts:a,multiplier:i});return r.ok?e+1e-9<r.notional?{ok:!1,error:"insufficient cash for premium debit",need:r.notional}:{ok:!0,debit:r.notional}:r}function $s(e,t="payload"){const a=[],i=(r,l)=>{if(typeof r=="number"&&!Number.isFinite(r))a.push(l);else if(r&&typeof r=="object")for(const[o,c]of Object.entries(r))i(c,l?`${l}.${o}`:o)};return i(e,""),a.length?{ok:!1,error:`${t} non-finite: ${a.join(",")}`}:{ok:!0}}function vs({stockQty:e,optionRight:t,optionQtySigned:a,underlying:i}){if(!i||!Number.isInteger(a)||a===0)return null;const r=String(t||"").toLowerCase();return a<0&&(r==="call"||r==="c")?Number.isInteger(e)&&e>=Math.abs(a)*ae?"covered-call":"short-call":a>0&&(r==="put"||r==="p")&&Number.isInteger(e)&&e>0?"protective-put":a>0&&(r==="call"||r==="c")?"long-call":a>0&&(r==="put"||r==="p")?"long-put":a<0&&(r==="put"||r==="p")?"short-put":null}function Ei({fillPrice:e,avgCost:t,sharesSold:a}){if(!k(e)||!k(t)||!k(a)||!(a>0))return null;const i=(e-t)*a;return k(i)?i:null}function Va(e){if(!e||typeof e!="object")return{status:"missing-cost",value:null};const t=String(e.side||"").toUpperCase();if(t==="BUY"||t==="OPEN")return{status:"open",value:null};if(k(e.realizedPnl))return{status:"ok",value:e.realizedPnl};const a=e.avgCostAtSale??e.avgCost,i=Ei({fillPrice:e.price??e.premium,avgCost:a,sharesSold:e.qty});return i!=null?{status:"ok",value:i}:{status:"missing-cost",value:null}}function bs(e){let t=0,a=0,i=0;for(const r of e||[]){const l=String((r==null?void 0:r.side)||"").toUpperCase();if(l!=="SELL"&&l!=="CLOSE")continue;const o=Va(r);o.status==="ok"?(t+=o.value,i+=1):o.status==="missing-cost"&&(a+=1)}return k(t)?{ok:!0,sum:t,missing:a,counted:i}:{ok:!1,sum:null,missing:a,counted:i}}const Di="./data/paper-portfolio.json";function Q(e){return e==null||Number.isNaN(e)?"flat":e>0?"up":e<0?"down":"flat"}function Jt(e,t=2){return e==null||Number.isNaN(e)?"—":`${e>0?"+":""}${e.toFixed(t)}%`}function Xt(e,t=2){return e==null||Number.isNaN(e)?"—":Number(e).toLocaleString(D(),{minimumFractionDigits:t,maximumFractionDigits:t})}function Qt(e){return e==="USD"?"US$":e==="TWD"?"NT$":""}function lt(e,t){if(e==null||Number.isNaN(e))return"—";const a=t==="TWD"?0:2;return`${Qt(t)}${Xt(e,a)}`}function he(e,t){if(e==null||Number.isNaN(e))return"—";const a=t==="TWD"?0:2,i=Xt(Math.abs(e),a);return i===Xt(0,a)?`${Qt(t)}${i}`:`${e>0?"+":"−"}${Qt(t)}${i}`}function Be(e,t){if(e==null||Number.isNaN(e))return"—";const a=t==="TWD"&&e>=100?0:2;return`${Qt(t)}${Xt(e,a)}`}function ks(e){return{"screen-buy":s("reasonScreenBuy"),add:s("reasonAdd"),stop:s("reasonStop"),"take-profit":s("reasonTakeProfit"),"momentum-break":s("reasonMomentumBreak"),"off-list":s("reasonOffList"),"limit-up-chase":s("reasonLimitUpChase")}[e]||e||""}function kt(e){return e?`
    <div class="paper-win">
      <div class="w-label">${e.sinceInception?T("sinceInception",s("sinceInception")):n(e.label||"")}</div>
      <div class="w-val ${Q(e.pct)}">${Jt(e.pct)}</div>
    </div>`:'<div class="paper-win"><div class="w-label">—</div><div class="w-val">—</div></div>'}function zi(e){if(k(e==null?void 0:e.avgCostAtSale))return e.avgCostAtSale;if(k(e==null?void 0:e.avgCost))return e.avgCost;if(k(e==null?void 0:e.realizedPnl)&&k(e==null?void 0:e.price)&&k(e==null?void 0:e.qty)&&e.qty>0){const t=e.price-e.realizedPnl/e.qty;return k(t)?t:null}return null}function Ss(e,t){if(String((e==null?void 0:e.side)||"").toUpperCase()==="BUY")return{html:"—",cls:"flat",value:null,avgCost:null};const i=Va(e),r=zi(e);return i.status==="ok"&&k(i.value)?{html:he(i.value,t),cls:Q(i.value),value:i.value,avgCost:r}:i.status==="open"?{html:n(s("realizedOpenOnly")),cls:"flat",value:null,avgCost:r}:{html:n(s("costMissing")),cls:"flat",value:null,avgCost:null}}function Ts(e,t){return e.length?e.map(a=>{var l;const i=Ss(a,t),r=k(i.avgCost)?`<div class="rp-cost">${n(s("avgCost"))} ${Be(i.avgCost,t)}</div>`:"";return`
      <tr>
        <td><span class="ticker">${n(a.ticker)}</span></td>
        <td class="name-cell">${n(a.name||"")}</td>
        <td class="num">${(l=a.qty)==null?void 0:l.toLocaleString(D())}</td>
        <td class="num">${Be(a.price,t)}</td>
        <td class="num ${i.cls}">${i.html}${r}</td>
        <td><span class="badge reason ${n(a.reason||"")}">${n(ks(a.reason))}</span></td>
        <td class="why-cell">${n(a.reasonText||"")}</td>
      </tr>`}).join(""):`<tr><td colspan="7" class="empty-cell">${n(s("noTradesToday"))}</td></tr>`}function Ni(e){return e.dayPct==null||Number.isNaN(e.dayPct)||e.mark==null||e.qty==null?null:e.mark*e.qty*e.dayPct/100}function qi(e,t,a){if(!e.length)return`<tr><td colspan="11" class="empty-cell">${n(s("noPositions"))}</td></tr>`;const r=a>0?a:e.reduce((l,o)=>l+(o.mark||0)*(o.qty||0),0);return e.map(l=>{var g;const o=(l.mark||0)*(l.qty||0),c=(l.avgCost||0)*(l.qty||0),u=(l.mark-l.avgCost)*l.qty,d=l.avgCost?(l.mark-l.avgCost)/l.avgCost*100:0,p=Ni(l),f=r>0?o/r*100:null,h=l.name?n(l.name):"";return`
      <tr class="pos-row" data-lq="pos" data-lq-sym="${n(l.ticker)}"
          data-ticker="${n(l.ticker)}"
          data-lq-qty="${l.qty??""}" data-lq-avg="${l.avgCost??""}" data-lq-ccy="${n(t)}"
          data-lq-mark="${l.mark??""}" data-lq-daypct="${l.dayPct??""}"
          tabindex="0">
        <td class="pos-sym">
          <span class="ticker">${n(l.ticker)}</span>
          ${h?`<span class="pos-name">${h}</span>`:""}
        </td>
        <td class="num">${(g=l.qty)==null?void 0:g.toLocaleString(D())}</td>
        <td class="num" data-lq-field="price">${Be(l.mark,t)}</td>
        <td class="num">${lt(o,t)}</td>
        <td class="num ${Q(p)}">${p==null?"—":he(p,t)}</td>
        <td class="num ${Q(l.dayPct)}" data-lq-field="dayPct">${Jt(l.dayPct)}</td>
        <td class="num ${Q(u)}">${he(u,t)}</td>
        <td class="num ${Q(d)}">${Jt(d)}</td>
        <td class="num">${lt(c,t)}</td>
        <td class="num">${Be(l.avgCost,t)}</td>
        <td class="num">${f==null?"—":`${f.toFixed(2)}%`}</td>
      </tr>`}).join("")}function Mi(e,t,a){const i=t.currency,r=s(e==="TW"?"paperBookTw":"paperBookUs"),l=lt(t.startCash,i),o=(a==null?void 0:a.totalPnl)??t.equity-t.startCash,c=(a==null?void 0:a.totalPnlPct)??(t.startCash?(t.equity-t.startCash)/t.startCash*100:0),u=(a==null?void 0:a.realizedPnl)??t.realizedPnl??0,d=(a==null?void 0:a.unrealizedPnl)??(k(o)&&k(u)?o-u:null);return`
    <article class="paper-book">
      <h3 class="paper-book-title">${n(r)}</h3>
      <p class="paper-start">${T("principal",s("principal"))} ${l}</p>
      <div class="paper-kpis">
        <div class="paper-kpi paper-kpi--equity">
          <div class="k-label">${T("position",s("equity"))}</div>
          <div class="k-val" data-lq-kpi="equity">${lt(t.equity,i)}</div>
        </div>
        <div class="paper-kpi">
          <div class="k-label">${n(s("cash"))}</div>
          <div class="k-val" data-lq-kpi="cash">${lt(t.cash,i)}</div>
        </div>
        <div class="paper-kpi">
          <div class="k-label">${n(s("totalPnl"))}</div>
          <div class="k-val ${Q(o)}" data-lq-kpi="pnl">${he(o,i)}</div>
        </div>
        <div class="paper-kpi">
          <div class="k-label">${n(s("totalPnlPct"))}</div>
          <div class="k-val ${Q(c)}" data-lq-kpi="pnlPct">${Jt(c)}</div>
        </div>
        <div class="paper-kpi">
          <div class="k-label">${n(s("realizedPnl"))}</div>
          <div class="k-val ${Q(u)}" data-lq-kpi="realized">${he(u,i)}</div>
        </div>
        <div class="paper-kpi">
          <div class="k-label">${n(s("unrealizedPnl"))}</div>
          <div class="k-val ${Q(d)}" data-lq-kpi="unrealized">${he(d,i)}</div>
        </div>
      </div>
      <div class="paper-windows">
        <div>
          <div class="win-name">${n(s("weekPerf"))}</div>
          ${kt(a==null?void 0:a.week)}
        </div>
        <div>
          <div class="win-name">${n(s("monthPerf"))}</div>
          ${kt(a==null?void 0:a.month)}
        </div>
        <div>
          <div class="win-name">${n(s("quarterPerf"))}</div>
          ${kt(a==null?void 0:a.quarter)}
        </div>
        <div>
          <div class="win-name">${n(s("yearPerf"))}</div>
          ${kt(a==null?void 0:a.year)}
        </div>
      </div>
    </article>`}function ws(e,t){return e.length?e.map(a=>{var o;const i=a.side==="SELL"?s("sell"):s("buy"),r=Ss(a,t),l=a.side==="SELL"&&k(r.avgCost)?`<div style="font-family:var(--mono);font-size:0.82rem;color:var(--text-muted)">${n(s("avgCost"))} ${Be(r.avgCost,t)}</div>`:"";return`
      <div class="list-card paper-card">
        <div class="lc-head">
          <div>
            <span class="ticker" style="font-family:var(--mono);font-weight:600">${n(a.ticker)}</span>
            <span style="color:var(--text-muted);font-size:0.85rem;margin-left:0.35rem">${n(a.name||"")}</span>
          </div>
          <div style="text-align:right">
            <div style="font-family:var(--mono)">${n(i)} ${(o=a.qty)==null?void 0:o.toLocaleString(D())} ${n(s("shares"))}</div>
            <div style="font-family:var(--mono)">${Be(a.price,t)}</div>
            ${a.side==="SELL"?`<div style="font-family:var(--mono)" class="${r.cls}">${n(s("realizedPnl"))} ${r.html}</div>`:""}
            ${l}
          </div>
        </div>
        <div class="flags" style="margin-bottom:0.35rem">
          <span class="badge reason ${n(a.reason||"")}">${n(ks(a.reason))}</span>
        </div>
        ${a.reasonText?`<p class="lc-why">${n(a.reasonText)}</p>`:""}
      </div>`}).join(""):`<div class="list-card empty-card">${n(s("noTradesToday"))}</div>`}function Ri(e,t){const a=(e||[]).filter(l=>String(l.side||"").toUpperCase()==="SELL");if(!a.length)return"";const i=bs(a);if(!i.ok)return"";const r=i.missing>0?` · ${n(s("costMissingCount",{n:String(i.missing)}))}`:"";return`
    <p class="paper-realized-foot">
      ${n(s("sessionRealizedPnl"))}
      <strong class="${Q(i.sum)}">${he(i.sum,t)}</strong>${r}
    </p>`}function wn(e,t,a,{showSessionRealized:i=!1}={}){return`
    <div class="paper-table-block">
      <h4>${n(e)}</h4>
      <div class="table-wrap">
        <table class="stock-table paper-table">
          <thead>
            <tr>
              <th>${T("ticker",s("ticker"))}</th>
              <th>${n(s("name"))}</th>
              <th>${n(s("qty"))}</th>
              <th>${n(s("price"))}</th>
              <th class="num">${n(s("realizedPnl"))}</th>
              <th>${n(s("reason"))}</th>
              <th>${n(s("note"))}</th>
            </tr>
          </thead>
          <tbody>${Ts(t,a)}</tbody>
        </table>
      </div>
      <div class="mobile-list">${ws(t,a)}</div>
      ${i?Ri(t,a):""}
    </div>`}function Oi(e,t,a){if(!e.length)return"";const i=new Map;for(const o of e){const c=o.date||"—";i.has(c)||i.set(c,[]),i.get(c).push(o)}const r=[...i.entries()],l=r.map(([o,c],u)=>{const d=c.filter(m=>String(m.side||"").toUpperCase()==="BUY").length,p=c.length-d,f=c.filter(m=>String(m.side||"").toUpperCase()==="SELL"),h=f.length?bs(f):null,g=h&&h.ok?`<span class="th-pnl ${Q(h.sum)}">${n(s("histDayRealized"))} ${he(h.sum,t)}</span>`:`<span class="th-pnl flat">${n(s("histNoSells"))}</span>`;return`
      <details class="trade-day"${u===0&&o!==a?" open":""}>
        <summary>
          <span class="th-date">${n(o)}</span>
          <span class="th-count">${n(s("histDayCount",{b:String(d),s:String(p)}))}</span>
          ${g}
        </summary>
        <div class="table-wrap">
          <table class="stock-table paper-table">
            <thead>
              <tr>
                <th>${T("ticker",s("ticker"))}</th>
                <th>${n(s("name"))}</th>
                <th>${n(s("qty"))}</th>
                <th>${n(s("price"))}</th>
                <th class="num">${n(s("realizedPnl"))}</th>
                <th>${n(s("reason"))}</th>
                <th>${n(s("note"))}</th>
              </tr>
            </thead>
            <tbody>${Ts(c,t)}</tbody>
          </table>
        </div>
        <div class="mobile-list">${ws(c,t)}</div>
      </details>`}).join("");return`
    <div class="paper-table-block paper-history">
      <h4>${n(s("tradeHistory"))}</h4>
      <p class="paper-history-hint">${n(s("tradeHistoryHint",{n:String(r.length),total:String(e.length)}))}</p>
      ${l}
    </div>`}function Bi(e,t,a){return`
    <div class="paper-table-block paper-pos-block">
      <div class="pos-block-head">
        <h4>${n(s("positions"))}</h4>
        <span class="pos-scroll-hint">${n(s("posScrollHint"))}</span>
      </div>
      <div class="pos-scroll" role="region" tabindex="0" aria-label="${n(s("positions"))}">
        <table class="pos-table">
          <thead>
            <tr>
              <th class="pos-sym">${T("ticker",s("ticker"))}</th>
              <th class="num">${n(s("qty"))}</th>
              <th class="num">${n(s("mark"))}</th>
              <th class="num">${n(s("mktValue"))}</th>
              <th class="num">${n(s("dayPnl"))}</th>
              <th class="num">${n(s("dayPct"))}</th>
              <th class="num">${n(s("unrealizedPnl"))}</th>
              <th class="num">${n(s("unrealizedPct"))}</th>
              <th class="num">${n(s("costBasis"))}</th>
              <th class="num">${n(s("avgCost"))}</th>
              <th class="num">${n(s("weightPct"))}</th>
            </tr>
          </thead>
          <tbody>${qi(e,t,a)}</tbody>
        </table>
      </div>
    </div>`}function xn(e,t,a,i,r,l){if(!t)return"";const o=t.currency,c=[...t.trades||[]].sort((h,g)=>h.date<g.date?1:h.date>g.date?-1:0),u=c.filter(h=>h.date===i),d=u.filter(h=>h.side==="BUY"),p=u.filter(h=>h.side==="SELL"),f=l;return`
    <div class="paper-panel ${r?"active":""}" id="paper-panel-${e}" role="tabpanel"
         data-lq-book="${n(e)}" data-lq-cash="${t.cash??""}"
         data-lq-start="${t.startCash??""}" data-lq-ccy="${n(o)}">
      ${Mi(e,t,a)}
      <p class="paper-session-note">${n(s("paperSession",{date:i||"—",inception:f}))}</p>
      ${wn(`${s("buy")} ${i||""}`,d,o)}
      ${wn(`${s("sell")} ${i||""}`,p,o,{showSessionRealized:!0})}
      ${Bi(t.positions||[],o,t.positionsValue)}
      ${Oi(c,o,i)}
    </div>`}function Hi(e){var o,c;if(!e||!e.books)return`
      <section class="section paper-section" id="paper">
        <h2 class="section-title">${T("paperTrade",s("paper"))}</h2>
        <p class="paper-missing">${n(s("paperMissing"))}</p>
      </section>`;const t=e.books.TW,a=e.books.US;let r=(e.asOf||"").slice(0,10);try{r=new Date(e.asOf).toLocaleDateString("en-CA",{timeZone:"Asia/Taipei"})}catch{}const l=e.startDate||(t==null?void 0:t.startDate)||(a==null?void 0:a.startDate)||"2026-09-15";return`
    <section class="section paper-section" id="paper">
      <h2 class="section-title">${T("paperTrade",s("paper"))}</h2>
      <p class="paper-disclaimer" role="note">
        ${n(s("paperDisclaimer",{date:l}))}
      </p>
      <details class="paper-rules">
        <summary>${n(s("paperRules"))}</summary>
        <ul>
          <li>${n(s("paperRuleTw"))}</li>
          <li>${n(s("paperRuleUs"))}</li>
          <li>${n(s("paperRuleBuy"))}</li>
          <li>${n(s("paperRuleSell"))}</li>
          <li>${n(s("paperRuleOpt"))}</li>
          <li>${n(s("paperRuleTxf"))}</li>
        </ul>
      </details>
      <div class="tabs paper-tabs" role="tablist">
        <button type="button" class="paper-tab-btn active" data-paper-tab="TW" role="tab" aria-selected="true">${n(s("paperTabTw"))}</button>
        <button type="button" class="paper-tab-btn" data-paper-tab="US" role="tab" aria-selected="false">${n(s("paperTabUs"))}</button>
      </div>
      ${xn("TW",t,(o=e.metrics)==null?void 0:o.TW,r,!0,l)}
      ${xn("US",a,(c=e.metrics)==null?void 0:c.US,r,!1,l)}
    </section>`}function Ui(e){const t=e.querySelectorAll(".paper-tab-btn");t.forEach(a=>{a.addEventListener("click",()=>{const i=a.dataset.paperTab;t.forEach(r=>{const l=r.dataset.paperTab===i;r.classList.toggle("active",l),r.setAttribute("aria-selected",l?"true":"false")}),e.querySelectorAll(".paper-panel").forEach(r=>{r.classList.toggle("active",r.id===`paper-panel-${i}`)})})})}async function Ii(){try{const e=await fetch(Di);return e.ok?await e.json():null}catch{return null}}const xs="jml-paper-deriv-v1",_i="./data/us-options-snapshot.json",Wi="./data/txf-desk.json",Fi="./data/paper-derivatives.json",Ga="2026-09-15";function Pe(){return{cashAdj:0,marginHold:0,realizedPnl:0,positions:[],trades:[]}}function et(){return{version:1,startDate:Ga,cumulative:!0,US:Pe(),TW:Pe()}}function Vi(){try{const e=localStorage.getItem(xs);if(!e)return et();const t=JSON.parse(e);return!t||t.version!==1?et():{...et(),...t,US:{...Pe(),...t.US||{}},TW:{...Pe(),...t.TW||{}}}}catch{return et()}}function ht(e){const t=$s({US:{cashAdj:e.US.cashAdj,marginHold:e.US.marginHold,realizedPnl:e.US.realizedPnl},TW:{cashAdj:e.TW.cashAdj,marginHold:e.TW.marginHold,realizedPnl:e.TW.realizedPnl}});return t.ok?(localStorage.setItem(xs,JSON.stringify(e)),!0):(console.error("paper-deriv blocked save:",t.error),!1)}function Y(e,t=2){if(!Number.isFinite(e))return 0;const a=10**t;return Math.round(e*a)/a}function te(){return new Date().toLocaleDateString("en-CA",{timeZone:"Asia/Taipei"})}function ne(e,t=2){return e==null||Number.isNaN(e)?"—":Number(e).toLocaleString(D(),{minimumFractionDigits:t,maximumFractionDigits:t})}function V(e,t){return e==null||Number.isNaN(e)?"—":`${t==="USD"?"US$":t==="TWD"?"NT$":""}${ne(e,t==="TWD"?0:2)}`}function Te(e){return e==null||Number.isNaN(e)?"flat":e>0?"up":e<0?"down":"flat"}function Gi(e){return`${e.underlying}|${e.expiry}|${e.strike}|${e.right}`}function Ki(e){return`${e.code}|${e.month}`}async function Yi(){try{const e=await fetch(_i);return e.ok?await e.json():null}catch{return null}}async function Zi(){try{const e=await fetch(Wi);if(!e.ok)return null;const t=await e.json();return(t==null?void 0:t.market)!=="TW"||!(t!=null&&t.contracts)?null:t}catch{return null}}async function Ji(){try{const e=await fetch(Fi);if(!e.ok)return null;const t=await e.json();if(!t||t.version!==1||t.booksSeparate!==!0)return null;const a={version:1,startDate:t.startDate||Ga,asOf:t.asOf||null,noteZh:t.noteZh||"",noteEn:t.noteEn||"",US:{...Pe(),...t.US||{}},TW:{...Pe(),...t.TW||{}}};if(!$s({US:{cashAdj:a.US.cashAdj,marginHold:a.US.marginHold,realizedPnl:a.US.realizedPnl},TW:{cashAdj:a.TW.cashAdj,marginHold:a.TW.marginHold,realizedPnl:a.TW.realizedPnl}}).ok)return null;const r=(a.US.positions||[]).some(o=>o.asset==="option"&&Number.isInteger(o.qtySigned)&&o.qtySigned!==0),l=(a.TW.positions||[]).some(o=>o.asset==="futures"&&(o.code==="TX"||o.code==="MTX")&&Number.isInteger(o.qtySigned)&&o.qtySigned!==0);return!r||!l?null:a}catch{return null}}function Xi(e){for(const t of["US","TW"])e[t].positions=(e[t].positions||[]).filter(a=>a.origin!=="server"),e[t].trades=(e[t].trades||[]).filter(a=>a.origin!=="server")}function Qi(e,t){if(!t)return e;const a=et();a.startDate=e.startDate||t.startDate||Ga,a.serverAsOf=t.asOf||null,a.noteZh=t.noteZh||"",a.noteEn=t.noteEn||"";for(const i of["US","TW"]){const r=t[i]||Pe(),l=e[i],o=i==="TW"?0:2,c=(r.positions||[]).map(d=>({...d,origin:"server"})),u=(l.positions||[]).filter(d=>d.origin!=="server");a[i]={cashAdj:Y((r.cashAdj||0)+(l.cashAdj||0),o),marginHold:Y((r.marginHold||0)+(l.marginHold||0),o),realizedPnl:Y((r.realizedPnl||0)+(l.realizedPnl||0),o),positions:[...c,...u],trades:[...(r.trades||[]).map(d=>({...d,origin:"server"})),...(l.trades||[]).filter(d=>d.origin!=="server")],summaryZh:r.summaryZh||"",summaryEn:r.summaryEn||""}}return a}function Pn(e,t){const a=e==null?void 0:e[t];if(!a)return"";const i=_e(),r=i==="en"||i==="ja"?a.summaryEn||a.summaryZh:a.summaryZh||a.summaryEn;if(!r&&!e.noteZh)return"";const l=i==="en"||i==="ja"?e.noteEn||e.noteZh:e.noteZh||e.noteEn;return`<p class="paper-deriv-server">${n(s("paperDerivServerBook"))}${r?` ${n(r)}`:""}${l?` ${n(l)}`:""}</p>`}function Ps(e){const t=_e(),a=t==="en"||t==="ja"?e.fillSourceEn||e.fillSource:e.fillSource||e.fillSourceEn,i=e.openedAsOf||e.lastTradeAsOf||"";return`${a?`<span class="pos-name">${n(a)}</span>`:""}${i?`<span class="pos-name">asOf ${n(i)}</span>`:""}`}function Cs(e,t,a){var l;const i=(l=e==null?void 0:e.books)==null?void 0:l[t],r=((i==null?void 0:i.positions)||[]).find(o=>o.ticker===a);return(r==null?void 0:r.qty)||0}function ea(e,t,a){var o;const i=(o=e==null?void 0:e.books)==null?void 0:o[t],r=typeof(i==null?void 0:i.cash)=="number"?i.cash:0,l=a[t];return Y(r+(l.cashAdj||0)-(l.marginHold||0),t==="TW"?0:2)}function Ls(e,t,a){if(!e)return null;const i=t==="put"?e.puts:e.calls;return Array.isArray(i)&&i.find(l=>l.strike===a&&k(l.premium)&&l.premium>=0)||null}function Cn(e,t){var l,o;const a=new Map(((t==null?void 0:t.tickers)||[]).map(c=>[c.ticker,c])),i=(t==null?void 0:t.asOf)||null,r=[];for(const c of e.US.positions){if(c.asset!=="option")continue;const u=a.get(c.underlying),d=(l=u==null?void 0:u.options)==null?void 0:l.paperChain,p=((o=u==null?void 0:u.options)==null?void 0:o.asOfUnderlying)??(u==null?void 0:u.price)??null;if((c.expiry&&te()>c.expiry?!0:c.expiry&&(!d||d.expiration!==c.expiry)&&te()>=c.expiry)&&k(p)){const g=Li({qtySigned:c.qtySigned,spot:p,strike:c.strike,right:c.right});if(g.ok){const m=Zt({side:c.qtySigned>0?"sell":"buy",premium:g.settlePremium,contracts:Math.abs(c.qtySigned)});if(m.ok){const v=va({qtySigned:c.qtySigned,avgPremium:c.avgPremium,markPremium:g.settlePremium});e.US.cashAdj=Y(e.US.cashAdj+m.cashDelta),k(v)&&(e.US.realizedPnl=Y(e.US.realizedPnl+v)),e.US.trades.push({date:te(),asOf:i,market:"US",asset:"option",side:c.qtySigned>0?"SELL":"BUY",underlying:c.underlying,right:c.right,expiry:c.expiry,strike:c.strike,qty:Math.abs(c.qtySigned),premium:g.settlePremium,reason:"expiry-settle",reasonText:s("paperDerivExpirySettle"),realizedPnl:v??0});continue}}}const h=Ls(d,c.right,c.strike);h?(c.markPremium=h.premium,c.markAsOf=i,c.markSource="chain"):k(c.markPremium)?c.markSource=c.markSource||"stored":(c.markPremium=c.avgPremium,c.markSource="last-fill",c.markAsOf=c.lastTradeAsOf||i),k(p)&&(c.spot=p),r.push(c)}e.US.positions=r}function Ln(e,t){var i;if(!(t!=null&&t.contracts))return;const a=[];for(const r of e.TW.positions){if(r.asset!=="futures")continue;const l=t.contracts[r.code];if(!l){a.push(r);continue}const o=l.near&&l.near.month===r.month&&l.near||l.next&&l.next.month===r.month&&l.next||(l.listed||[]).find(f=>f.month===r.month)||null,c=o==null?void 0:o.lastTradingDay,u=(i=t.calendar)==null?void 0:i.recentSettlement,d=u&&u.deliveryMonth===r.month&&String(u.contract||"").split("/").includes(r.code)&&k(u.finalSettlementPrice)&&u.finalSettlementPrice>0?u.finalSettlementPrice:null,p=c&&te()>c&&d||k(o==null?void 0:o.settle)&&o.settle||k(o==null?void 0:o.last)&&o.last||null;if(c&&te()>c&&k(p)){const f=ba({entryPrice:r.avgPrice,markPrice:p,code:r.code,contractsSigned:r.qtySigned}),h=ka({contracts:Math.abs(r.qtySigned),initialMarginPerContract:r.initialMarginPerContract});k(f)&&(e.TW.cashAdj=Y(e.TW.cashAdj+f,0),e.TW.realizedPnl=Y(e.TW.realizedPnl+f,0)),k(h)&&(e.TW.marginHold=Y(Math.max(0,e.TW.marginHold-h),0)),e.TW.trades.push({date:te(),asOf:t.asOf,market:"TW",asset:"futures",side:r.qtySigned>0?"SELL":"BUY",code:r.code,month:r.month,qty:Math.abs(r.qtySigned),price:p,reason:"expiry-settle",reasonText:s("paperDerivFutSettle"),realizedPnl:f??0,flagged:!d&&!k(o==null?void 0:o.settle)});continue}k(o==null?void 0:o.last)?(r.mark=o.last,r.markSource="desk-last"):k(o==null?void 0:o.settle)?(r.mark=o.settle,r.markSource="desk-settle"):(r.markSource="last-fill",k(r.mark)||(r.mark=r.avgPrice)),r.markAsOf=t.asOf,k(o==null?void 0:o.settle)&&(r.settle=o.settle),a.push(r)}e.TW.positions=a}function er({paper:e,state:t,optSnap:a,underlying:i,right:r,strike:l,expiry:o,side:c,contracts:u}){var b;if(r!=="call"&&r!=="put")return{ok:!1,error:s("paperDerivBadRight")};if(!Number.isInteger(u)||u<=0)return{ok:!1,error:s("paperDerivBadQty")};if(c!=="buy"&&c!=="sell")return{ok:!1,error:s("paperDerivBadSide")};const d=((a==null?void 0:a.tickers)||[]).find($=>$.ticker===i),p=(b=d==null?void 0:d.options)==null?void 0:b.paperChain;if(!p||!Array.isArray(p.calls))return{ok:!1,error:s("paperDerivNoChain")};if(o&&p.expiration&&o!==p.expiration)return{ok:!1,error:s("paperDerivExpiryMismatch")};const f=p.expiration,h=Ls(p,r,Number(l));if(!h)return{ok:!1,error:s("paperDerivNoPremium")};const g=h.premium;if(!k(g)||g<0)return{ok:!1,error:s("paperDerivNoPremium")};const m=ea(e,"US",t),v=`${i}|${f}|${Number(l)}|${r}`;let S=t.US.positions.find($=>Gi($)===v);const x=c==="buy"?u:-u;if(S&&Math.sign(S.qtySigned)!==0&&Math.sign(S.qtySigned)!==Math.sign(x)){const $=Math.min(Math.abs(S.qtySigned),u),w=Zt({side:c,premium:g,contracts:$});if(!w.ok)return{ok:!1,error:w.error};if(c==="buy"){const I=Tn({freeCash:m,premium:g,contracts:$});if(!I.ok)return{ok:!1,error:s("paperDerivNeedCash",{need:V(I.need||w.notional,"USD")})}}const j=va({qtySigned:S.qtySigned>0?$:-$,avgPremium:S.avgPremium,markPremium:g});t.US.cashAdj=Y(t.US.cashAdj+w.cashDelta),k(j)&&(t.US.realizedPnl=Y(t.US.realizedPnl+j)),S.qtySigned+=S.qtySigned>0?-$:$,S.qtySigned===0&&(t.US.positions=t.US.positions.filter(I=>I!==S),S=null),t.US.trades.push({date:te(),asOf:a==null?void 0:a.asOf,market:"US",asset:"option",side:c==="buy"?"BUY":"SELL",underlying:i,right:r,expiry:f,strike:Number(l),qty:$,premium:g,reason:"user-close",reasonText:s("paperDerivUserClose"),realizedPnl:j??0});const B=u-$;if(B<=0)return ht(t)?{ok:!0,premium:g,closed:$}:{ok:!1,error:s("paperDerivMathBlock")};u=B}if(c==="buy"){const $=Tn({freeCash:ea(e,"US",t),premium:g,contracts:u});if(!$.ok)return{ok:!1,error:s("paperDerivNeedCash",{need:V($.need||g*ae*u,"USD")})}}const L=Zt({side:c,premium:g,contracts:u});if(!L.ok)return{ok:!1,error:L.error};t.US.cashAdj=Y(t.US.cashAdj+L.cashDelta);const N=c==="buy"?u:-u;if(!S)S={asset:"option",underlying:i,name:(d==null?void 0:d.name)||i,right:r,expiry:f,strike:Number(l),qtySigned:N,avgPremium:g,markPremium:g,markAsOf:a==null?void 0:a.asOf,markSource:"fill",lastTradeAsOf:a==null?void 0:a.asOf,openedOn:te(),currency:"USD",multiplier:ae},t.US.positions.push(S);else{const $=S.qtySigned+N,w=Math.abs(S.qtySigned),j=Math.abs(N);S.avgPremium=(S.avgPremium*w+g*j)/(w+j),S.qtySigned=$,S.markPremium=g,S.lastTradeAsOf=a==null?void 0:a.asOf}const A=Cs(e,"US",i),C=vs({stockQty:A,optionRight:r,optionQtySigned:S.qtySigned,underlying:i});return t.US.trades.push({date:te(),asOf:a==null?void 0:a.asOf,market:"US",asset:"option",side:c==="buy"?"BUY":"SELL",underlying:i,right:r,expiry:f,strike:Number(l),qty:u,premium:g,reason:"user-open",reasonText:C?js(C):s("paperDerivUserOpen"),strategy:C,realizedPnl:0}),ht(t)?{ok:!0,premium:g,strategy:C}:{ok:!1,error:s("paperDerivMathBlock")}}function tr({paper:e,state:t,txf:a,code:i,month:r,side:l,contracts:o}){var L,N;if(i=String(i||"").toUpperCase(),i!=="TX"&&i!=="MTX")return{ok:!1,error:s("paperDerivBadCode")};if(!Number.isInteger(o)||o<=0)return{ok:!1,error:s("paperDerivBadQty")};if(l!=="buy"&&l!=="sell")return{ok:!1,error:s("paperDerivBadSide")};const c=(L=a==null?void 0:a.contracts)==null?void 0:L[i];if(!c)return{ok:!1,error:s("paperDerivNoTxf")};const u=ys(i);if(u==null||u!==c.multiplierTwdPerPoint)return{ok:!1,error:s("paperDerivBadMult")};const d=c.near&&c.near.month===r&&c.near||c.next&&c.next.month===r&&c.next||(c.listed||[]).find(A=>A.month===r);if(!d)return{ok:!1,error:s("paperDerivNoMonth")};const p=k(d.last)&&d.last||k(d.settle)&&d.settle||null;if(!k(p)||!(p>0))return{ok:!1,error:s("paperDerivNoFutPrice")};const f=typeof((N=c.margin)==null?void 0:N.initial)=="number"?c.margin.initial:null;if(!k(f)||!(f>0))return{ok:!1,error:s("paperDerivNoMargin")};const h=`${i}|${r}`;let g=t.TW.positions.find(A=>Ki(A)===h);const m=l==="buy"?o:-o;if(g&&Math.sign(g.qtySigned)!==Math.sign(m)){const A=Math.min(Math.abs(g.qtySigned),o),C=g.qtySigned>0?A:-A,b=ba({entryPrice:g.avgPrice,markPrice:p,code:i,contractsSigned:C});if(!k(b))return{ok:!1,error:s("paperDerivMathBlock")};const $=ka({contracts:A,initialMarginPerContract:g.initialMarginPerContract||f});t.TW.cashAdj=Y(t.TW.cashAdj+b,0),t.TW.realizedPnl=Y(t.TW.realizedPnl+b,0),k($)&&(t.TW.marginHold=Y(Math.max(0,t.TW.marginHold-$),0)),g.qtySigned+=g.qtySigned>0?-A:A,g.qtySigned===0?(t.TW.positions=t.TW.positions.filter(j=>j!==g),g=null):g.mark=p,t.TW.trades.push({date:te(),asOf:a.asOf,market:"TW",asset:"futures",side:l==="buy"?"BUY":"SELL",code:i,month:r,qty:A,price:p,reason:"user-close",reasonText:s("paperDerivUserClose"),realizedPnl:b});const w=o-A;if(w<=0)return ht(t)?{ok:!0,price:p,closed:A}:{ok:!1,error:s("paperDerivMathBlock")};o=w}const v=Ai({freeCash:ea(e,"TW",t),contracts:o,initialMarginPerContract:f});if(!v.ok)return{ok:!1,error:s("paperDerivNeedMargin",{need:V(v.hold||f*o,"TWD")})};const S=v.hold;t.TW.marginHold=Y(t.TW.marginHold+S,0);const x=l==="buy"?o:-o;if(!g)g={asset:"futures",code:i,name:c.nameZh||i,month:r,qtySigned:x,avgPrice:p,mark:p,markAsOf:a.asOf,markSource:"fill",openedOn:te(),currency:"TWD",multiplier:u,initialMarginPerContract:f,lastTradingDay:d.lastTradingDay||null},t.TW.positions.push(g);else{const A=Math.abs(g.qtySigned),C=Math.abs(x);g.avgPrice=(g.avgPrice*A+p*C)/(A+C),g.qtySigned+=x,g.mark=p}return t.TW.trades.push({date:te(),asOf:a.asOf,market:"TW",asset:"futures",side:l==="buy"?"BUY":"SELL",code:i,month:r,qty:o,price:p,reason:"user-open",reasonText:s("paperDerivUserOpen"),realizedPnl:0,marginHold:S}),ht(t)?{ok:!0,price:p,marginHold:S}:{ok:!1,error:s("paperDerivMathBlock")}}function js(e){if(!e)return"";const t=`paperDerivStrategy_${String(e).replace(/-/g,"_")}`,a=s(t);return a===t?e:a}function ar(e,t){return e.length?e.map(a=>{const i=va({qtySigned:a.qtySigned,avgPremium:a.avgPremium,markPremium:a.markPremium}),r=ms({qty:a.qtySigned,markPremium:a.markPremium}),l=vs({stockQty:Cs(t,"US",a.underlying),optionRight:a.right,optionQtySigned:a.qtySigned,underlying:a.underlying}),o=a.qtySigned>0?s("paperDerivLong"):s("paperDerivShort");return`<tr>
        <td class="pos-sym"><span class="ticker">${n(a.underlying)}</span>
          <span class="pos-name">${n(a.right.toUpperCase())} ${n(String(a.strike))} ${n(a.expiry||"")}${a.contractSymbol?` · ${n(a.contractSymbol)}`:""}</span>
          ${l?`<span class="deriv-tag">${n(js(l))}</span>`:""}
          ${Ps(a)}
        </td>
        <td class="num">${n(o)} ${Math.abs(a.qtySigned)}</td>
        <td class="num">${ne(a.avgPremium,2)}</td>
        <td class="num">${ne(a.markPremium,2)}</td>
        <td class="num">${V(r,"USD")}</td>
        <td class="num ${Te(i)}">${V(i,"USD")}</td>
        <td class="num">${n(a.markSource||"—")}</td>
        <td class="num">${n((a.markAsOf||"").slice(0,16)||"—")}</td>
        <td class="num">×${ae}</td>
      </tr>`}).join(""):`<tr><td colspan="9" class="empty-cell">${n(s("paperDerivNoOptPos"))}</td></tr>`}function nr(e){return e.length?e.map(t=>{const a=ba({entryPrice:t.avgPrice,markPrice:t.mark,code:t.code,contractsSigned:t.qtySigned}),i=t.qtySigned>0?s("paperDerivLong"):s("paperDerivShort"),r=ka({contracts:Math.abs(t.qtySigned),initialMarginPerContract:t.initialMarginPerContract});return`<tr>
        <td class="pos-sym"><span class="ticker">${n(t.code)}</span>
          <span class="pos-name">${n(t.name||"")} ${n(t.month)} · ${n(t.qtySigned>0?s("paperDerivLong"):s("paperDerivShort"))} ${Math.abs(t.qtySigned)}</span>
          ${Ps(t)}
        </td>
        <td class="num">${n(i)} ${Math.abs(t.qtySigned)}${n(s("paperDerivContracts"))}</td>
        <td class="num">${ne(t.avgPrice,0)}</td>
        <td class="num">${ne(t.mark,0)}</td>
        <td class="num ${Te(a)}">${V(a,"TWD")}</td>
        <td class="num">${V(r,"TWD")}</td>
        <td class="num">NT$${t.multiplier}/pt</td>
        <td class="num">${n(t.markSource||"—")}</td>
        <td class="num">${n(t.lastTradingDay||"—")}</td>
      </tr>`}).join(""):`<tr><td colspan="9" class="empty-cell">${n(s("paperDerivNoFutPos"))}</td></tr>`}function sr(e){const t=((e==null?void 0:e.tickers)||[]).filter(i=>{var r,l,o;return(o=(l=(r=i==null?void 0:i.options)==null?void 0:r.paperChain)==null?void 0:l.calls)==null?void 0:o.length});if(!t.length)return`<p class="paper-deriv-missing">${n(s("paperDerivNoChain"))}</p>`;const a=t.map(i=>`<option value="${n(i.ticker)}">${n(i.ticker)} · ${n(i.name||"")}</option>`).join("");return`
    <form class="paper-deriv-form" data-deriv-form="us-opt" autocomplete="off">
      <div class="pdf-row">
        <label>${n(s("paperDerivUnderlying"))}
          <select name="underlying" required>${a}</select>
        </label>
        <label>${n(s("paperDerivRight"))}
          <select name="right"><option value="call">Call</option><option value="put">Put</option></select>
        </label>
        <label>${n(s("paperDerivStrike"))}
          <select name="strike" required></select>
        </label>
        <label>${n(s("qty"))}
          <input name="qty" type="number" min="1" step="1" value="1" required />
        </label>
      </div>
      <div class="pdf-row pdf-meta">
        <span data-field="expiry">—</span>
        <span data-field="premium">—</span>
        <span data-field="debit">—</span>
      </div>
      <div class="pdf-actions">
        <button type="submit" name="side" value="buy" class="pdf-btn buy">${n(s("buy"))}</button>
        <button type="submit" name="side" value="sell" class="pdf-btn sell">${n(s("sell"))}</button>
      </div>
      <p class="pdf-msg" data-msg hidden></p>
    </form>`}function ir(e){var a;if(!((a=e==null?void 0:e.contracts)!=null&&a.TX))return`<p class="paper-deriv-missing">${n(s("paperDerivNoTxf"))}</p>`;const t=["TX","MTX"].filter(i=>e.contracts[i]).map(i=>{const r=e.contracts[i];return`<option value="${i}">${n(i)} · ${n(r.nameZh||"")} · NT$${r.multiplierTwdPerPoint}/pt</option>`}).join("");return`
    <form class="paper-deriv-form" data-deriv-form="tw-fut" autocomplete="off">
      <div class="pdf-row">
        <label>${n(s("paperDerivFutCode"))}
          <select name="code" required>${t}</select>
        </label>
        <label>${n(s("paperDerivMonth"))}
          <select name="month" required></select>
        </label>
        <label>${n(s("qty"))}
          <input name="qty" type="number" min="1" step="1" value="1" required />
        </label>
      </div>
      <div class="pdf-row pdf-meta">
        <span data-field="price">—</span>
        <span data-field="margin">—</span>
        <span data-field="mult">—</span>
      </div>
      <div class="pdf-actions">
        <button type="submit" name="side" value="buy" class="pdf-btn buy">${n(s("paperDerivLong"))} / ${n(s("buy"))}</button>
        <button type="submit" name="side" value="sell" class="pdf-btn sell">${n(s("paperDerivShort"))} / ${n(s("sell"))}</button>
      </div>
      <p class="paper-deriv-margin-note">${n(s("paperDerivMarginNote"))}</p>
      <p class="pdf-msg" data-msg hidden></p>
    </form>`}function jn(e,t){const a=[...e||[]].sort((r,l)=>r.date<l.date?1:r.date>l.date?-1:0).slice(0,20);if(!a.length)return"";const i=a.map(r=>{var f;const l=String(r.side||"").toUpperCase(),o=l==="BUY"||r.reason==="server-open"||r.reason==="user-open",c=r.asset==="option"?`${r.underlying||""} ${String(r.right||"").toUpperCase()} ${r.strike??""} ${r.expiry||""}`:`${r.code||""} ${r.month||""}`,u=r.premium!=null?r.premium:r.price;let d="—",p="flat";if(o||l==="BUY")d=n(s("realizedOpenOnly"));else{const h=Va({...r,side:l==="SELL"||l==="CLOSE"?"SELL":r.side});h.status==="ok"&&k(h.value)?(d=V(h.value,t),p=Te(h.value)):h.status==="missing-cost"?d=n(s("costMissing")):d=n(s("realizedOpenOnly"))}return`<tr>
        <td>${n(r.date||"")}</td>
        <td>${n(c.trim()||"—")}</td>
        <td>${n(l==="BUY"?s("buy"):l==="SELL"?s("sell"):l)}</td>
        <td class="num">${((f=r.qty)==null?void 0:f.toLocaleString(D()))??"—"}</td>
        <td class="num">${ne(u,t==="TWD"?0:2)}</td>
        <td class="num ${p}">${d}</td>
        <td class="why-cell">${n(r.reasonText||r.reason||"")}</td>
      </tr>`}).join("");return`
    <div class="paper-deriv-fills">
      <h5>${n(s("paperDerivFills"))}</h5>
      <p class="paper-deriv-open-note">${n(s("realizedOpenOnly"))} ≠ ${n(s("realizedPnl"))}</p>
      <div class="table-wrap">
        <table class="stock-table paper-table">
          <thead>
            <tr>
              <th>${n(s("tradeDate"))}</th>
              <th>${n(s("paperDerivContract"))}</th>
              <th>${n(s("buy"))}/${n(s("sell"))}</th>
              <th class="num">${n(s("qty"))}</th>
              <th class="num">${n(s("price"))}</th>
              <th class="num">${n(s("realizedPnl"))}</th>
              <th>${n(s("note"))}</th>
            </tr>
          </thead>
          <tbody>${i}</tbody>
        </table>
      </div>
    </div>`}function An(e,t,a,{optSnap:i,txf:r}){var f;if(!((f=t==null?void 0:t.books)==null?void 0:f[e]))return"";const o=a[e],c=ea(t,e,a);if(e==="US"){const h=(o.positions||[]).filter(v=>v.asset==="option");let g=0,m=0;for(const v of h){const S=ms({qty:v.qtySigned,markPremium:v.markPremium}),x=va({qtySigned:v.qtySigned,avgPremium:v.avgPremium,markPremium:v.markPremium});k(S)&&(g+=S),k(x)&&(m+=x)}return`
      <div class="paper-deriv" data-deriv-market="US">
        <div class="paper-deriv-head">
          <h4>${n(s("paperDerivUsTitle"))}</h4>
          <p class="paper-deriv-lead">${n(s("paperDerivUsLead"))}</p>
          ${Pn(a,"US")}
        </div>
        <div class="paper-deriv-kpis">
          <div><div class="k-label">${n(s("paperDerivFreeCash"))}</div><div class="k-val">${V(c,"USD")}</div></div>
          <div><div class="k-label">${n(s("paperDerivOptMv"))}</div><div class="k-val">${V(g,"USD")}</div></div>
          <div><div class="k-label">${n(s("unrealizedPnl"))}</div><div class="k-val ${Te(m)}">${V(m,"USD")}</div></div>
          <div><div class="k-label">${n(s("realizedPnl"))}</div><div class="k-val ${Te(o.realizedPnl)}">${V(o.realizedPnl,"USD")}</div></div>
        </div>
        ${sr(i)}
        <p class="paper-deriv-open-note">${n(s("unrealizedPnl"))} · ${n(s("realizedOpenOnly"))}</p>
        <div class="pos-scroll" role="region" tabindex="0" aria-label="${n(s("paperDerivContract"))}">
          <table class="pos-table deriv-table">
            <thead><tr>
              <th>${n(s("paperDerivContract"))}</th>
              <th class="num">${n(s("qty"))}</th>
              <th class="num">${n(s("avgCost"))}</th>
              <th class="num">${n(s("mark"))}</th>
              <th class="num">${n(s("mktValue"))}</th>
              <th class="num">${n(s("unrealizedPnl"))}</th>
              <th class="num">${n(s("paperDerivMarkSrc"))}</th>
              <th class="num">asOf</th>
              <th class="num">mult</th>
            </tr></thead>
            <tbody>${ar(h,t)}</tbody>
          </table>
        </div>
        ${jn(o.trades,"USD")}
      </div>`}const u=(o.positions||[]).filter(h=>h.asset==="futures");let d=0;for(const h of u){const g=ba({entryPrice:h.avgPrice,markPrice:h.mark,code:h.code,contractsSigned:h.qtySigned});k(g)&&(d+=g)}const p=(r==null?void 0:r.sessionDate)||"—";return`
    <div class="paper-deriv" data-deriv-market="TW">
      <div class="paper-deriv-head">
        <h4>${n(s("paperDerivTwTitle"))}</h4>
        <p class="paper-deriv-lead">${n(s("paperDerivTwLead",{session:p}))}</p>
        ${Pn(a,"TW")}
      </div>
      <div class="paper-deriv-kpis">
        <div><div class="k-label">${n(s("paperDerivFreeCash"))}</div><div class="k-val">${V(c,"TWD")}</div></div>
        <div><div class="k-label">${n(s("paperDerivMarginHold"))}</div><div class="k-val">${V(o.marginHold,"TWD")}</div></div>
        <div><div class="k-label">${n(s("unrealizedPnl"))}</div><div class="k-val ${Te(d)}">${V(d,"TWD")}</div></div>
        <div><div class="k-label">${n(s("realizedPnl"))}</div><div class="k-val ${Te(o.realizedPnl)}">${V(o.realizedPnl,"TWD")}</div></div>
      </div>
      ${ir(r)}
      <p class="paper-deriv-open-note">${n(s("unrealizedPnl"))} · ${n(s("realizedOpenOnly"))}</p>
      <div class="pos-scroll" role="region" tabindex="0" aria-label="${n(s("paperDerivContract"))}">
        <table class="pos-table deriv-table pos-table">
          <thead><tr>
            <th>${n(s("paperDerivContract"))}</th>
            <th class="num">${n(s("qty"))}</th>
            <th class="num">${n(s("avgCost"))}</th>
            <th class="num">${n(s("mark"))}</th>
            <th class="num">${n(s("unrealizedPnl"))}</th>
            <th class="num">${n(s("paperDerivMarginHold"))}</th>
            <th class="num">mult</th>
            <th class="num">${n(s("paperDerivMarkSrc"))}</th>
            <th class="num">${n(s("paperDerivLastDay"))}</th>
          </tr></thead>
          <tbody>${nr(u)}</tbody>
        </table>
      </div>
      ${jn(o.trades,"TWD")}
    </div>`}function rr(e,t){var u;const a=e.underlying.value,i=e.right.value,r=((t==null?void 0:t.tickers)||[]).find(d=>d.ticker===a),l=(u=r==null?void 0:r.options)==null?void 0:u.paperChain,o=e.strike;if(o.innerHTML="",!l)return;const c=i==="put"?l.puts:l.calls;for(const d of c||[]){const p=document.createElement("option");p.value=String(d.strike),p.textContent=`${d.strike} · ${d.premium}`,p.dataset.premium=String(d.premium),o.appendChild(p)}e.querySelector('[data-field="expiry"]').textContent=`${s("optionsExpiry")}: ${l.expiration||"—"}`,Ea(e)}function Ea(e){const t=e.strike.selectedOptions[0],a=t?Number(t.dataset.premium):NaN,i=Number(e.qty.value),r=e.querySelector('[data-field="premium"]'),l=e.querySelector('[data-field="debit"]');if(!k(a)||!Number.isInteger(i)||i<=0){r.textContent="—",l.textContent="—";return}r.textContent=`${s("paperDerivPremium")}: US$${ne(a,2)}`;const o=a*ae*i;l.textContent=`${s("paperDerivCashImpact")}: US$${ne(o,2)} (×${ae})`}function lr(e,t){var o,c,u,d;const a=e.code.value,i=(o=t==null?void 0:t.contracts)==null?void 0:o[a],r=e.month;if(r.innerHTML="",!i)return;const l=[];(c=i.near)!=null&&c.month&&l.push({...i.near,label:`${i.near.month} (${s("paperDerivNear")})`}),(u=i.next)!=null&&u.month&&i.next.month!==((d=i.near)==null?void 0:d.month)&&l.push({...i.next,label:`${i.next.month} (${s("paperDerivNext")})`});for(const p of l){const f=document.createElement("option");f.value=p.month,f.textContent=p.label,f.dataset.last=String(p.last??""),f.dataset.settle=String(p.settle??""),r.appendChild(f)}Da(e,t)}function Da(e,t){var g,m;const a=e.code.value,i=(g=t==null?void 0:t.contracts)==null?void 0:g[a],r=e.month.selectedOptions[0],l=Number(e.qty.value),o=e.querySelector('[data-field="price"]'),c=e.querySelector('[data-field="margin"]'),u=e.querySelector('[data-field="mult"]');if(!i||!r){o.textContent=c.textContent=u.textContent="—";return}const d=Number(r.dataset.last),p=Number(r.dataset.settle),f=k(d)&&d>0?d:p;o.textContent=`${s("mark")}: ${k(f)?ne(f,0):"—"}`,u.textContent=`× NT$${i.multiplierTwdPerPoint}/pt`;const h=(m=i.margin)==null?void 0:m.initial;k(h)&&Number.isInteger(l)&&l>0?c.textContent=`${s("paperDerivMarginHold")}: ${V(h*l,"TWD")}`:c.textContent="—"}function St(e,t,a){const i=e.querySelector("[data-msg]");i&&(i.hidden=!t,i.textContent=t||"",i.classList.toggle("ok",!!a),i.classList.toggle("err",!!t&&!a))}async function za(e,t){if(!e||!(t!=null&&t.books))return;const[a,i,r]=await Promise.all([Yi(),Zi(),Ji()]),l=Vi();Xi(l),Cn(l,a),Ln(l,i),ht(l);const o=r?structuredClone(r):null;o&&(Cn(o,a),Ln(o,i));const c=Qi(l,o),u=e.querySelector("#paper-panel-US"),d=e.querySelector("#paper-panel-TW");if(u){let h=u.querySelector('[data-deriv-market="US"]');const g=An("US",t,c,{optSnap:a,txf:i});h?h.outerHTML=g:u.insertAdjacentHTML("beforeend",g)}if(d){let h=d.querySelector('[data-deriv-market="TW"]');const g=An("TW",t,c,{optSnap:a,txf:i});h?h.outerHTML=g:d.insertAdjacentHTML("beforeend",g)}const p=e.querySelector('[data-deriv-form="us-opt"]');if(p&&a){const h=()=>rr(p,a);p.underlying.addEventListener("change",h),p.right.addEventListener("change",h),p.strike.addEventListener("change",()=>Ea(p)),p.qty.addEventListener("input",()=>Ea(p)),h(),p.addEventListener("submit",g=>{var S,x,L,N;g.preventDefault();const m=((S=g.submitter)==null?void 0:S.value)||"buy",v=er({paper:t,state:l,optSnap:a,underlying:p.underlying.value,right:p.right.value,strike:Number(p.strike.value),expiry:(N=(L=(x=a.tickers.find(A=>A.ticker===p.underlying.value))==null?void 0:x.options)==null?void 0:L.paperChain)==null?void 0:N.expiration,side:m,contracts:Number(p.qty.value)});if(!v.ok){St(p,v.error||s("paperDerivFail"),!1);return}St(p,s("paperDerivFillOk",{px:ne(v.premium,2)}),!0),za(e,t)})}const f=e.querySelector('[data-deriv-form="tw-fut"]');if(f&&i){const h=()=>lr(f,i);f.code.addEventListener("change",h),f.month.addEventListener("change",()=>Da(f,i)),f.qty.addEventListener("input",()=>Da(f,i)),h(),f.addEventListener("submit",g=>{var S;g.preventDefault();const m=((S=g.submitter)==null?void 0:S.value)||"buy",v=tr({paper:t,state:l,txf:i,code:f.code.value,month:f.month.value,side:m,contracts:Number(f.qty.value)});if(!v.ok){St(f,v.error||s("paperDerivFail"),!1);return}St(f,s("paperDerivFillOk",{px:ne(v.price,0)}),!0),za(e,t)})}}const me="([+\\-−]?\\d+(?:\\.\\d+)?)",Sa=e=>String(e).replace(/^[+\-−]/,""),As=e=>/^[\-−]/.test(String(e)),Es=e=>Number(Sa(e))===0;function Tt(e){return Es(e)?"持平":`${As(e)?"跌":"漲"} ${Sa(e)}%`}function En(e){return Es(e)?"差不多":`${As(e)?"弱":"強"} ${Sa(e)} 個百分點`}const Dn={"週期偏防禦：提高雙均線／品質門檻":"大盤偏保守，今天挑得比較嚴：要站上兩條平均線、體質也要較好","週期偏熱：量能不足的高 RS 降權":"大盤偏熱：漲得比大盤多、但成交量跟不上的股票，排名往後放","週期偏熱：縮量上漲降權":"大盤偏熱：上漲但成交量變少的股票，排名往後放","週期偏積極：早段放量相對強度加權":"大盤偏積極：剛開始放量、又比大盤強的股票，排名往前放","週期偏積極：放寬進場節奏":"大盤偏積極，今天進場條件稍微放寬","週期偏積極：價弱量增（firm-hands）加權":"大盤偏積極：價格雖弱、但成交量變大（有人在承接）的股票，排名往前放"},or=[[new RegExp(`^日漲跌 ${me}%（相對 S&P 約 ${me}pp）$`),e=>`今天${Tt(e[1])}，比 S&P 500 ${En(e[2])}`],[new RegExp(`^日漲跌 ${me}%，相對加權約 ${me}pp$`),e=>`今天${Tt(e[1])}，比加權指數${En(e[2])}`],[new RegExp(`^五日約 ${me}%$`),e=>`近 5 個交易日${Tt(e[1])}`],[new RegExp(`^一個月約 ${me}%$`),e=>`近一個月${Tt(e[1])}`],[new RegExp(`^量比約 ${me}×$`),e=>`成交量約是近 20 日平均的 ${Sa(e[1])} 倍`],[/^站上雙均線$/,()=>"股價在近 20 日、近 50 日的平均價之上"],[/^站上 SMA(\d+)$/,e=>e[1]==="200"?"在近 200 日的長期平均價之上":`股價在近 ${e[1]} 日的平均價之上`],[/^週期偏積極：允許站上 SMA(\d+) 但低於 SMA(\d+)$/,e=>`大盤偏積極：股價只要回到近 ${e[1]} 日平均價之上就可以，還沒回到近 ${e[2]} 日平均價也收`],[/^市場週期姿態 ([a-z_]+)(?:（相位 ([a-z_]+)）)?$/,e=>e[2]?`市場心情「${ee(e[2])}」，今天用「${ee(e[1])}」的標準挑股`:`今天用「${ee(e[1])}」的標準挑股`]];function cr(e){const t=e.trim();if(!t)return"";if(Dn[t])return Dn[t];for(const[a,i]of or){const r=t.match(a);if(r)return i(r)}return t.replace(/SMA(\d+)/g,"近 $1 日平均價").replace(/(\d)pp/g,"$1 個百分點")}function ur(e){return e?String(e).replace(/[。.]\s*$/,"").split("；").map(cr).filter(Boolean):[]}function Ka(e,t){const a=ur(e);return a.length?`<ul class="why-list">${a.map(i=>`<li>${t(i)}</li>`).join("")}</ul>`:""}const dr={euphoric:"defensive",late_optimism:"selective",mid_cycle:"balanced",cautious_recovery:"constructive",despondent:"aggressive",panic:"stabilize_first"};function Ya(e){if(!e)return`<span class="stance-badge stance-neutral">${n(s("dataInsufficient"))}</span>`;const t=wi(e),a=ee(e);return`<span class="stance-badge stance-${t}">${n(a)}</span>`}function zn(e,t){return`<div class="logic-metric" role="listitem">
    <span class="k">${n(e)}</span>
    <span class="v">${t}</span>
  </div>`}function ta(e,t,{detailed:a=!1}={}){if(!t)return"";const i=t.incomplete?" incomplete":"",r=t.psychologyPhase,l=t.cycleStance,o=t.liquidityBias,c=r?ee(r):s("dataInsufficient"),u=o?ee(o):s("dataInsufficient"),d=Array.isArray(t.dataGaps)&&t.dataGaps.length?`<div class="regime-gaps">${n(s("dataGaps"))}: ${n(t.dataGaps.slice(0,5).join(", "))}${t.dataGaps.length>5?"…":""}</div>`:"",p="",f=a?`<div class="logic-metrics" role="list">
        ${zn(s("psychologyPhase"),n(c))}
        ${zn(s("liquidityBias"),n(u))}
      </div>
      <p class="logic-caption">${n(s("logicRegimePlain"))}</p>`:`<div class="regime-meta">
        <span>${n(s("psychologyPhase"))} <strong>${n(c)}</strong></span>
        <span>${n(s("liquidityBias"))} <strong>${n(u)}</strong></span>
      </div>`;return`<div class="regime-chip${a?" logic-regime-chip":""}${i}">
    <div class="regime-chip-top">
      <div class="label">${n(e)} · ${n(s("marketRegime"))}</div>
      ${Ya(l)}
    </div>
    ${f}
    ${p}
    ${d}
  </div>`}function pr(e){return!e||!e.us&&!e.tw?`<p class="logic-muted">${n(s("logicNoRegime"))}</p>`:`<div class="regime-strip logic-regime-live" aria-label="${n(s("regimeToday"))}">
    ${ta("US",e.us,{detailed:!0})}
    ${ta("TW",e.tw,{detailed:!0})}
  </div>`}function fr(e){return!e||!e.us&&!e.tw?"":`<div class="regime-strip" aria-label="${n(s("marketRegime"))}">
    ${ta("US",e.us,{detailed:!1})}
    ${ta("TW",e.tw,{detailed:!1})}
  </div>`}function je(e,t,a){return`<section class="logic-step" id="logic-step-${e}">
    <header class="logic-step-head">
      <span class="logic-step-num" aria-hidden="true">${e}</span>
      <h3 class="logic-step-title">${n(t)}</h3>
    </header>
    <div class="logic-step-body">${a}</div>
  </section>`}function hr(e){return`<div class="logic-table-wrap"><table class="logic-table">
    <tbody>
      ${e.map(([t,a])=>`<tr><th scope="row">${n(t)}</th><td>${a}</td></tr>`).join("")}
    </tbody>
  </table></div>`}function H(e){const t=(a,i)=>`<div><dt>${n(s(a))}</dt><dd>${n(s(i))}</dd></div>`;return`<article class="logic-rule">
    <h4 class="logic-rule-title">${n(s(`logic${e}Title`))}</h4>
    <dl class="logic-rule-dl">
      ${t("logicLblDoes",`logic${e}Does`)}
      ${t("logicLblWhen",`logic${e}When`)}
      ${t("logicLblRefuse",`logic${e}Refuse`)}
      ${t("logicLblExample",`logic${e}Example`)}
    </dl>
  </article>`}function gr(e){const t=e==null?void 0:e.marketRegime,a={defensive:"logicPhaseDefensive",selective:"logicPhaseSelective",balanced:"logicPhaseBalanced",constructive:"logicPhaseConstructive",aggressive:"logicPhaseAggressive",stabilize_first:"logicPhaseStabilize"},i=Object.entries(dr).map(([r,l])=>[ee(r),`${Ya(l)} <span class="logic-phase-note">${n(s(a[l]))}</span>`]);return`
    <header class="view-header">
      <h2 class="view-title">${n(s("logicTitle"))}</h2>
      <p class="logic-subtitle">${n(s("logicSubtitle"))}</p>
      <p class="logic-intro">${n(s("logicLead"))}</p>
    </header>

    <section class="logic-live section" aria-labelledby="logic-live-h">
      <h3 id="logic-live-h" class="section-title">${n(s("regimeToday"))}</h3>
      ${pr(t)}
    </section>

    <div class="logic-pipeline">
      ${je(1,s("logicStep1"),`
        <p class="logic-lead">${n(s("logicStep1Lead"))}</p>
        ${hr(i)}
        <p class="logic-caption">${n(s("logicStep1Caption"))}</p>
        ${H("Sep")}
        ${H("Mood")}
        ${H("Rates")}
      `)}

      ${je(2,s("logicStep2"),`
        <p class="logic-lead">${n(s("logicStep2Lead"))}</p>
        ${H("Bal")}
        ${H("Sel")}
        ${H("Def")}
        ${H("Agg")}
        ${H("Con")}
        ${H("Stab")}
        ${H("Vol")}
        ${H("Back")}
      `)}

      ${je(3,s("logicStep3"),`
        <p class="logic-lead">${n(s("logicStep3Lead"))}</p>
        ${H("Xq")}
        <p class="logic-jump"><button type="button" class="logic-link-btn" data-jump="strategies">${n(s("logicOpenStrategies"))}</button></p>
      `)}

      ${je(4,s("logicStep4"),`
        <p class="logic-lead">${n(s("logicStep4Lead"))}</p>
        ${H("Rank")}
        ${H("Hot")}
        ${H("Firm")}
        ${H("Panic")}
        ${H("Count")}
      `)}

      ${je(5,s("logicStep5"),`
        <p class="logic-lead">${n(s("logicStep5Lead"))}</p>
        ${H("Why")}
      `)}

      ${je(6,s("logicStep6"),`
        <p class="logic-lead">${n(s("logicStep6Lead"))}</p>
        ${H("Buy")}
        ${H("Sell")}
        <p class="logic-jump"><button type="button" class="logic-link-btn" data-jump="paper">${n(s("logicOpenPaper"))}</button></p>
      `)}
    </div>

    <p class="logic-footnote" role="note">${n(s("logicFootnote"))}</p>
  `}const Ds="./data/strategy-screener.json",Nn="jml-watchlist",Na=new Set(["inst-sync","margin-up","earnings-steady","low-pe-small","peter-lynch","warren-buffett","michael-murphy","kenneth-fisher","mark-minervini","michael-price","benjamin-graham","james-oshaughnessy","ultra-short","ma-tangle-break","new-high-momentum","short-roc","day-up-5","pct5d-10","near-high","chip-main-force","chip-branch","chip-large-holders","gooaye-tw-semicon-chain","gooaye-tw-vol-breakout"]),qn=["大師","基本","籌碼","技術","綜合","週期"],Za={精選:"綜合",價量:"技術",財務:"基本",技術:"技術",基本:"基本",籌碼:"籌碼",大師:"大師",週期:"週期",綜合:"綜合"};function mr(e){const t=Za[e]||e;return s(`cat${t}`,t)}function yr(e){try{return new Date(e).toLocaleString(D(),{timeZone:"Asia/Taipei",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1})+s("taipei")}catch{return e||"—"}}function y(e,t=2){return e==null||Number.isNaN(e)?"—":Number(e).toLocaleString(D(),{minimumFractionDigits:t,maximumFractionDigits:t})}function _(e){return e==null||Number.isNaN(e)?"flat":e>0?"up":e<0?"down":"flat"}function F(e){return e==null||Number.isNaN(e)?"—":`${e>0?"+":""}${e.toFixed(2)}%`}function Mn(e){const t=e.categoryGroup||e.category||"綜合";return Za[t]||t}function $r(e){let t=n(e);return t=t.replace(/本益比/g,()=>T("pe",s("pe"))),t=t.replace(/營益率/g,()=>T("opMargin",s("opMargin"))),t=t.replace(/毛利率/g,()=>T("grossMargin",s("grossMargin"))),t=t.replace(/外資/g,()=>T("foreignInv",s("foreignInv"))),t=t.replace(/投信/g,()=>T("trustInv",s("trustInv"))),t=t.replace(/自營商/g,()=>T("dealerInv",s("dealerInv"))),t=t.replace(/均線多頭/g,()=>T("maBull",s("maBull"))),t=t.replace(/RSI/g,()=>T("rsi",s("rsi"))),t=t.replace(/振幅/g,()=>T("amplitude",s("amplitude"))),t=t.replace(/(\d+)\s*張/g,(a,i)=>`${i}${T("zhang",s("zhang"))}`),t=t.replace(/＞\s*(\d+)\s*張/g,(a,i)=>`＞ ${i}${T("zhang",s("zhang"))}`),t}function vr(e){return e==="skip"?`<span class="xq-cond-st skip">${n(s("condSkip"))}</span>`:e==="fail"?`<span class="xq-cond-st fail">${n(s("condFail"))}</span>`:`<span class="xq-cond-st pass">${n(s("condPass"))}</span>`}function br(e){switch(e){case"ma-bull":return[{key:"price",label:s("metricPrice"),fmt:t=>y(t.price)},{key:"dayPct",label:s("metricDayPct"),fmt:t=>F(t.dayPct),cls:t=>_(t.dayPct)},{key:"sma5",label:"SMA5",fmt:t=>y(t.sma5)},{key:"sma10",label:"SMA10",fmt:t=>y(t.sma10)},{key:"sma20",label:"SMA20",fmt:t=>y(t.sma20)},{key:"sma60",label:"SMA60",fmt:t=>y(t.sma60)},{key:"volRatioYday",label:s("metricVolRatioYday"),fmt:t=>t.volRatioYday!=null?y(t.volRatioYday)+"×":"—"},{key:"volTodayZhang",label:s("metricVolToday"),fmt:t=>t.volTodayZhang!=null?y(t.volTodayZhang,1):t.volToday!=null?y(t.volToday,0):"—"}];case"peter-lynch":return[{key:"pe",label:T("pe",s("pe")),fmt:t=>y(t.pe,2),rawLabel:!0},{key:"revGrowth2yAvgPct",label:"2年營收成長均%",fmt:t=>t.revGrowth2yAvgPct!=null?y(t.revGrowth2yAvgPct,1)+"%":"—"},{key:"pretaxGrowth5yAvgPct",label:"5年稅前成長均%",fmt:t=>t.pretaxGrowth5yAvgPct!=null?y(t.pretaxGrowth5yAvgPct,1)+"%":"—"},{key:"debtRatioPct",label:s("metricDebt"),fmt:t=>t.debtRatioPct!=null?y(t.debtRatioPct,1)+"%":"—"},{key:"price",label:s("metricPrice"),fmt:t=>y(t.price)},{key:"avgVol5Zhang",label:"5日均量(張)",fmt:t=>t.avgVol5Zhang!=null?y(t.avgVol5Zhang,1):"—"},{key:"dayPct",label:s("metricDayPct"),fmt:t=>F(t.dayPct),cls:t=>_(t.dayPct)}];case"chip-main-force":return[{key:"instNet1dZhang",label:"法人1日(張)",fmt:t=>y(t.instNet1dZhang,1)},{key:"instNet5dZhang",label:"法人5日(張)",fmt:t=>y(t.instNet5dZhang,1)},{key:"foreignNet5dZhang",label:s("foreign5d"),fmt:t=>y(t.foreignNet5dZhang,1)},{key:"trustNet5dZhang",label:s("trust5d"),fmt:t=>y(t.trustNet5dZhang,1)},{key:"dealerNet5dZhang",label:s("dealer5d"),fmt:t=>y(t.dealerNet5dZhang,1)}];case"chip-branch":return[{key:"foreignBuyStreakDays",label:"外資連買日",fmt:t=>t.foreignBuyStreakDays!=null?String(t.foreignBuyStreakDays):"—"},{key:"foreignNet1dZhang",label:s("foreign1d"),fmt:t=>y(t.foreignNet1dZhang,1),rawLabel:!0},{key:"foreignNet5dZhang",label:s("foreign5d"),fmt:t=>y(t.foreignNet5dZhang,1)},{key:"instNet5dZhang",label:"法人5日(張)",fmt:t=>y(t.instNet5dZhang,1)}];case"chip-large-holders":return[{key:"megaHolderPct",label:"大戶>100萬股%",fmt:t=>t.megaHolderPct!=null?y(t.megaHolderPct,1)+"%":"—"},{key:"largeHolderPct",label:"分級12–15%",fmt:t=>t.largeHolderPct!=null?y(t.largeHolderPct,1)+"%":"—"},{key:"megaHolderCount",label:">100萬股人數",fmt:t=>t.megaHolderCount!=null?y(t.megaHolderCount,0):"—"},{key:"major10pctCount",label:"逾10%大股東家數",fmt:t=>t.major10pctCount!=null?y(t.major10pctCount,0):"—"},{key:"tdccAsOf",label:"集保日",fmt:t=>t.tdccAsOf||"—"}];case"inst-sync":return[{key:"foreignNet1dZhang",label:s("foreign1d"),fmt:t=>y(t.foreignNet1dZhang,1),rawLabel:!0},{key:"trustNet1dZhang",label:s("trust1d"),fmt:t=>y(t.trustNet1dZhang,1),rawLabel:!0},{key:"dealerNet1dZhang",label:s("dealer1d"),fmt:t=>y(t.dealerNet1dZhang,1),rawLabel:!0},{key:"foreignNet5dZhang",label:s("foreign5d"),fmt:t=>y(t.foreignNet5dZhang,1)},{key:"trustNet5dZhang",label:s("trust5d"),fmt:t=>y(t.trustNet5dZhang,1)},{key:"dealerNet5dZhang",label:s("dealer5d"),fmt:t=>y(t.dealerNet5dZhang,1)}];case"ultra-short":return[{key:"price",label:s("metricPrice"),fmt:t=>y(t.price)},{key:"dayPct",label:s("metricDayPct"),fmt:t=>F(t.dayPct),cls:t=>_(t.dayPct)},{key:"rsi",label:T("rsi",s("rsi")),fmt:t=>y(t.rsi,2),rawLabel:!0},{key:"rsiPrev",label:"RSI昨",fmt:t=>y(t.rsiPrev,2)},{key:"ampPct",label:T("amplitude",s("amplitude")),fmt:t=>t.ampPct!=null?y(t.ampPct,2)+"%":"—",rawLabel:!0},{key:"avgVol5Zhang",label:"5日均量(張)",fmt:t=>t.avgVol5Zhang!=null?y(t.avgVol5Zhang,1):"—"}];case"michael-price":return[{key:"pb",label:"P/B",fmt:t=>y(t.pb,2)},{key:"directorHoldPct",label:s("metricDirector"),fmt:t=>t.directorHoldPct!=null?y(t.directorHoldPct,1)+"%":"—"},{key:"debtRatioPct",label:s("metricDebt"),fmt:t=>t.debtRatioPct!=null?y(t.debtRatioPct,1)+"%":"—"},{key:"price",label:s("metricPrice"),fmt:t=>y(t.price)},{key:"avgVol5Zhang",label:"5日均量(張)",fmt:t=>y(t.avgVol5Zhang,1)}];case"michael-sivy":case"mark-minervini":return[{key:"pe",label:T("pe",s("pe")),fmt:t=>y(t.pe,2),rawLabel:!0},{key:"roe4qPct",label:"4季ROE合計%",fmt:t=>t.roe4qPct!=null?y(t.roe4qPct,1)+"%":"—"},{key:"debtRatioPct",label:s("metricDebt"),fmt:t=>t.debtRatioPct!=null?y(t.debtRatioPct,1)+"%":"—"},{key:"revGrowth3y",label:"3年營收成長%",fmt:t=>Array.isArray(t.revGrowth3y)?t.revGrowth3y.map(a=>a!=null?a+"%":"—").join(" → "):"—"},{key:"price",label:s("metricPrice"),fmt:t=>y(t.price)},{key:"avgVol5Zhang",label:"5日均量(張)",fmt:t=>y(t.avgVol5Zhang,1)}];case"kenneth-fisher":return[{key:"revGrowth5yAvgPct",label:"5年營收成長均%",fmt:t=>t.revGrowth5yAvgPct!=null?y(t.revGrowth5yAvgPct,1)+"%":"—"},{key:"pretaxGrowth5yAvgPct",label:"5年稅前成長均%",fmt:t=>t.pretaxGrowth5yAvgPct!=null?y(t.pretaxGrowth5yAvgPct,1)+"%":"—"},{key:"debtRatioPct",label:s("metricDebt"),fmt:t=>t.debtRatioPct!=null?y(t.debtRatioPct,1)+"%":"—"},{key:"price",label:s("metricPrice"),fmt:t=>y(t.price)},{key:"avgVol5Zhang",label:"5日均量(張)",fmt:t=>y(t.avgVol5Zhang,1)}];case"michael-murphy":return[{key:"roe4qPct",label:"4季ROE合計%",fmt:t=>t.roe4qPct!=null?y(t.roe4qPct,1)+"%":"—"},{key:"opMargin1qPct",label:s("metricOpQ"),fmt:t=>t.opMargin1qPct!=null?y(t.opMargin1qPct,1)+"%":"—"},{key:"opMargin3y",label:"3年營益率%",fmt:t=>Array.isArray(t.opMargin3y)?t.opMargin3y.map(a=>a!=null?a+"%":"—").join(" → "):"—"},{key:"revGrowth3yAvgPct",label:"3年營收成長均%",fmt:t=>t.revGrowth3yAvgPct!=null?y(t.revGrowth3yAvgPct,1)+"%":"—"},{key:"price",label:s("metricPrice"),fmt:t=>y(t.price)}];case"benjamin-graham":return[{key:"pe",label:T("pe",s("pe")),fmt:t=>y(t.pe,2),rawLabel:!0},{key:"pb",label:"P/B",fmt:t=>y(t.pb,2)},{key:"debtRatioPct",label:s("metricDebt"),fmt:t=>t.debtRatioPct!=null?y(t.debtRatioPct,1)+"%":"—"},{key:"price",label:s("metricPrice"),fmt:t=>y(t.price)},{key:"avgVol5Zhang",label:"5日均量(張)",fmt:t=>y(t.avgVol5Zhang,1)}];case"warren-buffett":return[{key:"roe4qPct",label:"4季ROE合計%",fmt:t=>t.roe4qPct!=null?y(t.roe4qPct,1)+"%":"—"},{key:"opMargin1qPct",label:s("metricOpQ"),fmt:t=>t.opMargin1qPct!=null?y(t.opMargin1qPct,1)+"%":"—"},{key:"debtRatioPct",label:s("metricDebt"),fmt:t=>t.debtRatioPct!=null?y(t.debtRatioPct,1)+"%":"—"},{key:"price",label:s("metricPrice"),fmt:t=>y(t.price)},{key:"avgVol5Zhang",label:"5日均量(張)",fmt:t=>y(t.avgVol5Zhang,1)}];case"james-oshaughnessy":return[{key:"pe",label:T("pe",s("pe")),fmt:t=>y(t.pe,2),rawLabel:!0},{key:"roe4qPct",label:"4季ROE合計%",fmt:t=>t.roe4qPct!=null?y(t.roe4qPct,1)+"%":"—"},{key:"roeGrowthPct",label:"ROE成長%",fmt:t=>t.roeGrowthPct!=null?y(t.roeGrowthPct,1)+"%":"—"},{key:"epsGrowthStreak",label:"EPS連季>10%",fmt:t=>t.epsGrowthStreak!=null?String(t.epsGrowthStreak):"—"},{key:"price",label:s("metricPrice"),fmt:t=>y(t.price)},{key:"avgVol5Zhang",label:"5日均量(張)",fmt:t=>y(t.avgVol5Zhang,1)}];case"margin-up":return[{key:"yoyPairs",label:"YoY配對",fmt:t=>Array.isArray(t.yoyPairs)?t.yoyPairs.join("；"):"—"},{key:"yoyOmPct",label:"YoY營益成長%",fmt:t=>Array.isArray(t.yoyOmPct)?t.yoyOmPct.map(a=>a!=null?a+"%":"—").join(" → "):"—"},{key:"yoyGmPct",label:"YoY毛利成長%",fmt:t=>Array.isArray(t.yoyGmPct)?t.yoyGmPct.map(a=>a!=null?a+"%":"—").join(" → "):"—"},{key:"opMargins",label:T("opMargin",s("opMargin")),fmt:t=>Array.isArray(t.opMargins)?t.opMargins.slice(-4).map(a=>a!=null?a+"%":"—").join(" → "):"—",rawLabel:!0},{key:"source",label:s("metricSource"),fmt:t=>t.source||"—"}];case"kostolany-cycle":return[{key:"price",label:s("metricPrice"),fmt:t=>y(t.price)},{key:"dayPct",label:s("metricDayPct"),fmt:t=>F(t.dayPct),cls:t=>_(t.dayPct)},{key:"pct5d",label:"5日%",fmt:t=>F(t.pct5d),cls:t=>_(t.pct5d)},{key:"pct1m",label:"1月%",fmt:t=>F(t.pct1m),cls:t=>_(t.pct1m)},{key:"volRatio",label:s("volRatio"),fmt:t=>t.volRatio!=null?y(t.volRatio)+"×":"—"},{key:"psychologyPhase",label:s("psychologyPhase"),fmt:t=>t.psychologyPhase?ee(t.psychologyPhase):"—"},{key:"cycleStance",label:s("cycleStance"),fmt:t=>t.cycleStance?ee(t.cycleStance):"—"},{key:"liquidityBias",label:s("liquidityBias"),fmt:t=>t.liquidityBias?ee(t.liquidityBias):"—"},{key:"tags",label:s("regimeTags"),fmt:t=>t.tags||"—"},{key:"sizeMult",label:s("sizeMult"),fmt:t=>t.sizeMult!=null?y(t.sizeMult,2)+"×":"—"}];case"ma-tangle-break":return[{key:"price",label:s("metricPrice"),fmt:t=>y(t.price)},{key:"dayPct",label:s("metricDayPct"),fmt:t=>F(t.dayPct),cls:t=>_(t.dayPct)},{key:"smaSpreadPct",label:"均線糾結%",fmt:t=>t.smaSpreadPct!=null?y(t.smaSpreadPct,2)+"%":"—"},{key:"volRatioYday",label:s("metricVolRatioYday"),fmt:t=>t.volRatioYday!=null?y(t.volRatioYday)+"×":"—"},{key:"sma5",label:"SMA5",fmt:t=>y(t.sma5)},{key:"sma20",label:"SMA20",fmt:t=>y(t.sma20)}];case"new-high-momentum":case"near-high":return[{key:"price",label:s("metricPrice"),fmt:t=>y(t.price)},{key:"dayPct",label:s("metricDayPct"),fmt:t=>F(t.dayPct),cls:t=>_(t.dayPct)},{key:"pct5d",label:"5日%",fmt:t=>F(t.pct5d),cls:t=>_(t.pct5d)},{key:"high20",label:"20日高",fmt:t=>y(t.high20)},{key:"distHigh20Pct",label:"距高%",fmt:t=>t.distHigh20Pct!=null?y(t.distHigh20Pct,2)+"%":"—"},{key:"volRatioYday",label:s("metricVolRatioYday"),fmt:t=>t.volRatioYday!=null?y(t.volRatioYday)+"×":"—"}];case"short-roc":return[{key:"price",label:s("metricPrice"),fmt:t=>y(t.price)},{key:"dayPct",label:s("metricDayPct"),fmt:t=>F(t.dayPct),cls:t=>_(t.dayPct)},{key:"roc10",label:"ROC10%",fmt:t=>t.roc10!=null?y(t.roc10,2)+"%":"—",cls:t=>_(t.roc10)},{key:"pct5d",label:"5日%",fmt:t=>F(t.pct5d),cls:t=>_(t.pct5d)},{key:"avgVol5Zhang",label:"5日均量(張)",fmt:t=>t.avgVol5Zhang!=null?y(t.avgVol5Zhang,1):"—"}];case"day-up-5":case"pct5d-10":return[{key:"price",label:s("metricPrice"),fmt:t=>y(t.price)},{key:"dayPct",label:s("metricDayPct"),fmt:t=>F(t.dayPct),cls:t=>_(t.dayPct)},{key:"pct5d",label:"5日%",fmt:t=>F(t.pct5d),cls:t=>_(t.pct5d)},{key:"volRatioYday",label:s("metricVolRatioYday"),fmt:t=>t.volRatioYday!=null?y(t.volRatioYday)+"×":"—"},{key:"avgVol5Zhang",label:"5日均量(張)",fmt:t=>t.avgVol5Zhang!=null?y(t.avgVol5Zhang,1):"—"}];case"earnings-steady":return[{key:"yoyOmPct",label:"YoY營益成長%",fmt:t=>Array.isArray(t.yoyOmPct)?t.yoyOmPct.map(a=>a!=null?a+"%":"—").join(" → "):"—"},{key:"opMargins",label:T("opMargin",s("opMargin")),fmt:t=>Array.isArray(t.opMargins)?t.opMargins.slice(-4).map(a=>a!=null?a+"%":"—").join(" → "):"—",rawLabel:!0},{key:"source",label:s("metricSource"),fmt:t=>t.source||"—"}];case"low-pe-small":return[{key:"pe",label:T("pe",s("pe")),fmt:t=>y(t.pe,2),rawLabel:!0},{key:"price",label:s("metricPrice"),fmt:t=>y(t.price)},{key:"marketCapHint",label:"市值代理",fmt:t=>t.marketCapHint||"—"},{key:"avgVol5Zhang",label:"5日均量(張)",fmt:t=>t.avgVol5Zhang!=null?y(t.avgVol5Zhang,1):"—"}];case"gooaye-tw-semicon-chain":case"gooaye-tw-vol-breakout":case"gooaye-us-risk-on":case"gooaye-us-fomo-filter":return[{key:"price",label:s("metricPrice"),fmt:t=>y(t.price)},{key:"dayPct",label:s("metricDayPct"),fmt:t=>F(t.dayPct),cls:t=>_(t.dayPct)},{key:"pct5d",label:"5日%",fmt:t=>F(t.pct5d),cls:t=>_(t.pct5d)},{key:"pct1m",label:"1月%",fmt:t=>F(t.pct1m),cls:t=>_(t.pct1m)},{key:"volRatio",label:s("metricVolRatioYday"),fmt:t=>t.volRatio!=null?y(t.volRatio)+"×":"—"},{key:"aboveSma50",label:"＞SMA50",fmt:t=>t.aboveSma50?"Y":"N"}];default:return[{key:"price",label:s("metricPrice"),fmt:t=>y(t.price)},{key:"dayPct",label:s("metricDayPct"),fmt:t=>F(t.dayPct),cls:t=>_(t.dayPct)}]}}function kr(e){const t=e.calibrationNotes;if(!t||typeof t!="object")return"";const a=Array.isArray(t.matchedXq)?t.matchedXq.map(o=>n(o)).join(" · "):"",i=Array.isArray(t.stillDiffers)?t.stillDiffers.map(o=>n(o)).join(" · "):"",r=t.unitsNote||t.units||"",l=[];return a&&l.push(`<span class="xq-cal-m">對齊 XQ：${a}</span>`),i&&l.push(`<span class="xq-cal-d">仍差異：${i}</span>`),r&&l.push(`<span class="xq-cal-u">${n(String(r))}</span>`),l.length?`<p class="xq-calibration" title="${s("calibTitle")}">${l.join("<br/>")}</p>`:""}function Sr(e){return`<ol class="xq-cond-list">${(e.conditions||[]).map((a,i)=>{const r=a.status||"pass";return`<li class="xq-cond ${r}">
        <span class="xq-cond-num">${i+1}</span>
        <span class="xq-cond-text">${$r(a.text)}</span>
        ${vr(r)}
      </li>`}).join("")}</ol>`}function Ja(e,t){return!t||t==="ALL"?e||[]:(e||[]).filter(a=>{const i=String(a.market||"").toUpperCase();if(i===t)return!0;const r=String(a.ticker||"").toUpperCase().endsWith(".TW");return i?!1:t==="TW"?r:!r})}function Tr(e,t="TW"){const a=e.hits||[],i=Ja(a,t),r=s(t==="US"?"usStock":"twStock");if(e.incomplete&&!a.length){const d=n(e.incompleteLabel||s("dataInsufficient")),p=(e.blockers||[]).map(f=>`<li>${n(f)}</li>`).join("");return`<div class="xq-incomplete" role="status">
      <div class="xq-incomplete-badge">${d}</div>
      <ul>${p}</ul>
    </div>`}if(!i.length)return`<div class="xq-empty"><p>${n(r)} · ${n(s("noHits"))}</p></div>`;const l=br(e.id),o=l.map(d=>`<th>${d.rawLabel?d.label:n(d.label)}</th>`).join(""),c=i.map(d=>{const p=d.metrics||{},f=l.map(h=>`<td class="num ${h.cls?h.cls(p):""}">${h.fmt(p)}</td>`).join("");return`<tr>
        <td><span class="ticker">${n(d.ticker)}</span></td>
        <td class="name-cell">${n(d.name||"")}${d.ohlcvBarDate?`<div class="xq-bar-date">K ${n(d.ohlcvBarDate)}</div>`:""}
          <button type="button" class="xq-btn xq-btn-sm xq-watch-inline" data-xq-watch="${n(d.ticker)}" data-xq-watch-name="${n(d.name||"")}">${n(s("addWatchlist"))}</button>
        </td>
        ${f}
      </tr>`}).join(""),u=i.map(d=>{const p=d.metrics||{},f=l.map(h=>{const g=h.cls?h.cls(p):"";return`<div class="xq-m"><span class="xq-ml">${h.rawLabel?h.label:n(h.label)}</span><span class="xq-mv ${g}">${h.fmt(p)}</span></div>`}).join("");return`<article class="xq-hit-card">
        <div class="xq-hit-head">
          <div>
            <div class="ticker">${n(d.ticker)}</div>
            <div class="name">${n(d.name||"")}</div>
            ${d.ohlcvBarDate?`<div class="xq-bar-date">K棒 ${n(d.ohlcvBarDate)}</div>`:""}
          </div>
          <div class="xq-hit-actions">
            <span class="badge market">${n(d.market||t)}</span>
            <button type="button" class="xq-btn xq-btn-sm" data-xq-watch="${n(d.ticker)}" data-xq-watch-name="${n(d.name||"")}">${n(s("addWatchlist"))}</button>
          </div>
        </div>
        <div class="xq-hit-metrics">${f}</div>
      </article>`}).join("");return`
    <div class="xq-market-block" data-market="${n(t)}">
      <h5 class="xq-market-title">${r}（${i.length}）</h5>
      <div class="table-wrap xq-table-wrap">
        <table class="stock-table xq-table">
          <thead><tr><th>代碼</th><th>名稱</th>${o}</tr></thead>
          <tbody>${c}</tbody>
        </table>
      </div>
      <div class="xq-mobile-cards">${u}</div>
    </div>`}function wr(e,t,a="TW"){var d,p,f,h;const i=e.hits||[],l=Ja(i,a).length,o=(e.unchecked||[]).map(g=>`<li class="xq-unchecked">${n(g)}</li>`).join(""),c=(e.notes||[]).map(g=>`<li>${n(g)}</li>`).join(""),u=!e.incomplete&&(e.blockers||[]).length?`<ul class="xq-blockers">${(e.blockers||[]).map(g=>`<li>${n(g)}</li>`).join("")}</ul>`:"";return`
    <div class="xq-panel" data-strategy-id="${n(e.id)}">
      <div class="xq-panel-head">
        <div>
          <h3 class="xq-strategy-name">${n(e.name)}</h3>
          <div class="xq-tags">
            ${(e.xqTags||[e.category]).map(g=>`<span class="xq-tag">${n(g)}</span>`).join("")}
          </div>
        </div>
        <div class="xq-hit-count" title="${s("hitTitle")}">
          <span class="xq-hit-num">${l}</span>
          <span class="xq-hit-label">${n(s("hitCount"))}</span>
        </div>
      </div>
      ${e.description?`<details class="fold-block"><summary>${n(s("strategyDetails"))}</summary><p class="xq-desc fold-p">${n(e.description)}</p></details>`:""}
      <div class="xq-meta-row">
        <span>${n(s("sessionTwse"))} ${n(t.sessionDate||"—")}</span>
        <span>${n(s("ohlcvBar"))} ${n(((d=e.ohlcvBarDates)==null?void 0:d[0])||t.ohlcvBarDate||"—")}</span>
        <span>${n(s("generated"))} ${yr(t.asOf)}</span>
        <span>${n(s("universeTw"))} ${((p=t.universe)==null?void 0:p.tw)??"—"}</span>
        <span>${n(s("universeUs"))} ${((f=t.universe)==null?void 0:f.us)??"—"}</span>
      </div>
      <h4 class="xq-sub">${n(s("conditions"))}</h4>
      ${Sr(e)}
      ${kr(e)}
      ${(h=e.incompleteFilters)!=null&&h.length?`<p class="xq-incomplete-filters">${n(s("incompleteFilters"))}${n(e.incompleteFilters.join("、"))}</p>`:""}
      ${o?`<ul class="xq-unchecked-list">${o}</ul>`:""}
      ${e.regimeSnapshot?`<div class="xq-regime-box" role="status">
        <div class="xq-regime-title">${n(s("regimeToday"))}</div>
        <div class="xq-regime-grid">
          ${["us","tw"].map(g=>{const m=e.regimeSnapshot[g];if(!m)return"";const v=m.psychologyPhase?ee(m.psychologyPhase):s("dataInsufficient"),S=m.cycleStance,x=m.liquidityBias?ee(m.liquidityBias):s("dataInsufficient"),L=Array.isArray(m.dataGaps)&&m.dataGaps.length?`<div class="xq-regime-gaps">${n(s("dataGaps"))}：${n(m.dataGaps.join(", "))}</div>`:"";return`<div class="xq-regime-card">
                <div class="xq-regime-mkt">${n(g.toUpperCase())}</div>
                <div class="xq-regime-stance">${Ya(S)}</div>
                <div class="xq-regime-metrics">
                  <div><span class="k">${n(s("psychologyPhase"))}</span><strong>${n(v)}</strong></div>
                  <div><span class="k">${n(s("liquidityBias"))}</span><strong>${n(x)}</strong></div>
                  <div><span class="k">${n(s("temperatureScore"))}</span><strong>${n(m.temperatureScore==null?s("dataInsufficient"):String(m.temperatureScore))}</strong></div>
                </div>
                ${L}
              </div>`}).join("")}
        </div>
      </div>`:""}
      ${c?`<ul class="xq-notes">${c}</ul>`:""}
      ${u}
      <div class="xq-toolbar">
        <h4 class="xq-sub">${n(s("results"))}</h4>
        <div class="xq-actions">
          <button type="button" class="xq-btn" data-xq-copy>${n(s("copyJson"))}</button>
          <button type="button" class="xq-btn" data-xq-csv>${n(s("exportCsv"))}</button>
          <a class="xq-btn xq-btn-link" href="${Ds}" download="strategy-screener.json">${n(s("exportJson"))}</a>
          <button type="button" class="xq-btn" disabled title="${n(s("backtestHint"))}">${n(s("backtestSoon"))}</button>
        </div>
      </div>
      ${e.twOnly||Na.has(e.id)?`<div class="xq-market-tabs"><span class="xq-mkt-hint">${n(s("twOnlyHint"))}</span></div>`:`<div class="xq-market-tabs" role="tablist" aria-label="${n(s("hitMarket"))}">
        <button type="button" class="xq-mkt-btn${a==="TW"?" active":""}" data-xq-market="TW" aria-pressed="${a==="TW"}">${n(s("twStock"))}</button>
        <button type="button" class="xq-mkt-btn${a==="US"?" active":""}" data-xq-market="US" aria-pressed="${a==="US"}">${n(s("usStock"))}</button>
      </div>`}
      ${Tr(e,e.twOnly||Na.has(e.id)?"TW":a)}
    </div>
  `}function xr(e=!0){return`
    <section class="section xq-section" id="strategies">
      <h2 class="section-title">${T("strategyScreen",s("strategyScreen"))}</h2>
      <p class="view-lead-tight">${n(s("strategyLead"))}</p>
      <div id="xq-root" class="xq-root" aria-label="${n(s("strategyScreen"))}">
        ${e?`<p class="xq-loading">${n(s("strategyLoading"))}</p>`:""}
      </div>
    </section>
  `}async function Pr(e=Ds){const t=await fetch(e,{cache:"no-cache"});if(!t.ok)throw new Error(`strategy-screener ${t.status}`);return t.json()}function Cr(e,t){var A,C;const a=typeof e=="string"?document.querySelector(e):e;if(!a||!((A=t==null?void 0:t.strategies)!=null&&A.length)){a&&(a.innerHTML=`<div class="xq-empty"><p>${n(s("strategyEmpty"))}</p></div>`);return}const i=[...qn];for(const b of t.categoryOrder||[]){const $=Za[b]||b;i.includes($)||i.push($)}const r=new Map(i.map(b=>[b,[]]));for(const b of t.strategies){const $=Mn(b);r.has($)||(r.set($,[]),i.push($)),r.get($).push(b)}for(const[b,$]of r)!$.length&&qn.includes(b);let l=i.find(b=>(r.get(b)||[]).length)||i[0],o=((C=(r.get(l)||[])[0])==null?void 0:C.id)||t.strategies[0].id,c="TW";const u=(b,$)=>b.map(w=>{const j=(w.hits||[]).length,B=w.incomplete?" incomplete":"";return`<button type="button" class="xq-chip${w.id===$?" active":""}${B}" data-xq-id="${n(w.id)}" aria-pressed="${w.id===$}">
          <span class="xq-chip-name">${n(w.name)}</span>
          <span class="xq-chip-n">${w.incomplete?n(s("incomplete")):n(s("hitsTotal",{n:j}))}</span>
        </button>`}).join(""),d=()=>i.map(b=>{const $=r.get(b)||[];return $.length?`<button type="button" class="xq-tab${b===l?" active":""}" data-xq-tab="${n(b)}" role="tab" aria-selected="${b===l}">
          <span>${n(mr(b))}</span>
          <span class="xq-tab-n">${$.length}</span>
        </button>`:""}).join(""),p=()=>t.strategies.map(b=>{const $=(b.hits||[]).length,w=b.id===o?" active":"",j=b.incomplete?" incomplete":"";return`<button type="button" class="xq-side-item${w}${j}" data-xq-id="${n(b.id)}">
          <span>${n(b.name)}</span>
          <span class="xq-side-n">${b.incomplete?n(s("incomplete")):n(s("hitsTotal",{n:$}))}</span>
        </button>`}).join(""),f=()=>{const b=r.get(l)||[],$=t.strategies.find(w=>w.id===o)||b[0]||t.strategies[0];o=$.id,a.innerHTML=`
      <div class="xq-layout">
        <aside class="xq-sidebar" aria-label="${n(s("strategyList"))}">
          <div class="xq-side-title">${n(s("navStrategies"))}</div>
          ${p()}
        </aside>
        <div class="xq-main">
          <div class="xq-tabs" role="tablist" aria-label="${n(s("strategyCat"))}">${d()}</div>
          <div class="xq-chips" aria-label="${n(s("strategyList"))}">
            <div class="xq-chip-row">${u(b,o)}</div>
          </div>
          <div class="xq-panel-host">${wr($,t,c)}</div>
        </div>
      </div>
      <p class="xq-foot">${n((t.disclaimer||"").split("。")[0]+(t.disclaimer?"。":""))}</p>
      <div class="xq-toast" id="xq-toast" hidden role="status"></div>
    `},h=b=>{const $=t.strategies.find(j=>j.id===b);if(!$)return;o=b;const w=Mn($);w!==l&&(l=w),f()},g=b=>{const $=r.get(b)||[];$.length&&(l=b,$.some(w=>w.id===o)||(o=$[0].id),f())},m=(b,$=2200)=>{const w=a.querySelector("#xq-toast");w&&(w.hidden=!1,w.textContent=b,clearTimeout(m._t),m._t=setTimeout(()=>{w.hidden=!0},$))},v=async b=>{var $;try{if(($=navigator.clipboard)!=null&&$.writeText)return await navigator.clipboard.writeText(b),!0}catch{}try{const w=document.createElement("textarea");w.value=b,w.setAttribute("readonly",""),w.style.position="fixed",w.style.left="-9999px",w.style.top="0",document.body.appendChild(w),w.select();const j=document.execCommand("copy");return document.body.removeChild(w),j}catch{return!1}},S=(b,$,w)=>{const j=new Blob([$],{type:w});try{const B=document.createElement("a");return B.href=URL.createObjectURL(j),B.download=b,B.rel="noopener",document.body.appendChild(B),B.click(),B.remove(),setTimeout(()=>URL.revokeObjectURL(B.href),2e3),!0}catch{try{const B=`data:${w||"text/plain"};charset=utf-8,${encodeURIComponent($)}`,I=document.createElement("a");return I.href=B,I.download=b,document.body.appendChild(I),I.click(),I.remove(),!0}catch{return!1}}},x=()=>{try{const b=localStorage.getItem(Nn),$=b?JSON.parse(b):[];return Array.isArray($)?$:[]}catch{return[]}},L=b=>{try{localStorage.setItem(Nn,JSON.stringify(b.slice(0,200)))}catch{}},N=(b,$)=>{if(!b)return;const w=x();if(w.some(j=>j.ticker===b)){m(s("watchlistExists",{ticker:b}));return}w.unshift({ticker:b,name:$||b,addedAt:new Date().toISOString()}),L(w),m(s("watchlistAdded",{ticker:b}))};a.onclick=async b=>{var Fe;const $=b.target,w=$&&typeof $.closest=="function"?$:$&&$.parentElement&&typeof $.parentElement.closest=="function"?$.parentElement:null;if(!w)return;const j=w.closest("[data-xq-tab]");if(j&&a.contains(j)){b.preventDefault(),g(j.getAttribute("data-xq-tab"));return}const B=w.closest("[data-xq-id]");if(B&&a.contains(B)){b.preventDefault(),h(B.getAttribute("data-xq-id"));return}const I=w.closest("[data-xq-market]");if(I&&a.contains(I)){b.preventDefault(),c=I.getAttribute("data-xq-market")||"TW",f();return}const yt=w.closest("[data-xq-copy]");if(yt&&a.contains(yt)){b.preventDefault();const P=await v(JSON.stringify(t,null,2));m(s(P?"copied":"copyFailed"));return}const We=w.closest("[data-xq-csv]");if(We&&a.contains(We)){b.preventDefault();const P=((Fe=a.querySelector(".xq-panel"))==null?void 0:Fe.getAttribute("data-strategy-id"))||o,de=t.strategies.find(Le=>Le.id===P);if(!de)return;const xa=Ja(de.hits||[],de.twOnly||Na.has(de.id)?"TW":c),$t=Lr({...de,hits:xa});if(!$t){m(s("noHitsExport"));return}const vt="\uFEFF"+$t;if(S(`${de.id}-hits.csv`,vt,"text/csv;charset=utf-8"))m(s("csvDownloaded"));else{const Le=`data:text/csv;charset=utf-8,${encodeURIComponent(vt)}`;m(s("csvBlocked"));try{window.open(Le,"_blank")}catch{}}return}const ge=w.closest("[data-xq-watch]");ge&&a.contains(ge)&&(b.preventDefault(),N(ge.getAttribute("data-xq-watch"),ge.getAttribute("data-xq-watch-name")))},f()}function Lr(e){const t=e.hits||[];if(!t.length)return"";const a=[...new Set(t.flatMap(o=>Object.keys(o.metrics||{})))],i=["ticker","name","market","ohlcvBarDate",...a],r=o=>{const c=o==null?"":String(o);return/[",\n]/.test(c)?`"${c.replace(/"/g,'""')}"`:c},l=t.map(o=>{const c=o.metrics||{};return[o.ticker,o.name,o.market,o.ohlcvBarDate||"",...a.map(u=>{const d=c[u];return Array.isArray(d)?d.join("|"):d})].map(r).join(",")});return[i.join(","),...l].join(`
`)}async function jr(e="#xq-root"){const t=()=>typeof e=="string"?document.querySelector(e):e;try{let a=t();if(a||(await new Promise(r=>requestAnimationFrame(r)),a=t()),!a)return console.warn("initStrategies: #xq-root missing"),{ok:!1,error:new Error("xq-root missing")};const i=await Pr();return a=t(),a?(Cr(a,i),{ok:!0,data:i}):{ok:!1,error:new Error("xq-root gone after fetch")}}catch(a){const i=t();return i&&(i.innerHTML=`<div class="xq-empty"><p>${n(s("strategyLoadError",{msg:a.message}))}</p></div>`),{ok:!1,error:a}}}const zs="./data/research-library.json",Ns="./covers/placeholder-book.svg",qs="./covers/placeholder-paper.svg",Ms="./covers/placeholder-podcast.svg",Ar={candidate:"rl-status-candidate",deferred:"rl-status-deferred",adopted:"rl-status-adopted",rejected:"rl-status-rejected"},Er={yes:"rl-cand-yes",no:"rl-cand-no",watch:"rl-cand-watch"};function Dr(e){return{candidate:s("researchStatusCandidate"),deferred:s("researchStatusDeferred"),adopted:s("researchStatusAdopted"),rejected:s("researchStatusRejected")}[e]||e}function zr(e){return{yes:s("researchCandYes"),no:s("researchCandNo"),watch:s("researchCandWatch")}[e]||e}function Nr(e){return e==="US"?s("usStock"):e==="TW"?s("twStock"):e==="BOTH"?s("researchMarketBoth"):e}function Rs(e){return s(e==="paper"?"researchTypePaper":e==="podcast"?"researchTypePodcast":"researchTypeBook")}function Ut(e,t={}){var r;if(!e)return s("researchShelfAdjacent");const a=(r=t==null?void 0:t.shelfLabels)==null?void 0:r[e];if(a&&typeof a=="object")return Ta(a,e);const i={core_investing:"researchShelfCoreInvesting",value_investing:"researchShelfValueInvesting",business_management:"researchShelfBusiness",life_partner_wisdom:"researchShelfLifePartner",options:"researchShelfOptions",recent_reads:"researchShelfRecentReads",fi_concepts:"researchShelfFiConcepts",money_values:"researchShelfMoneyValues",investing_basics:"researchShelfInvestingBasics",asset_allocation:"researchShelfAssetAllocation",financials:"researchShelfFinancials",market_analysis:"researchShelfMarketAnalysis",econ_analysis:"researchShelfEconAnalysis",psych_randomness:"researchShelfPsych",biographies:"researchShelfBiographies",adjacent:"researchShelfAdjacent"}[e];return i?s(i):e}function qr(e={}){return(Array.isArray(e.shelves)?e.shelves:null)||["core_investing","value_investing","business_management","life_partner_wisdom","options","recent_reads","fi_concepts","money_values","investing_basics","asset_allocation","financials","market_analysis","econ_analysis","psych_randomness","biographies","adjacent"]}function Ta(e,t){if(!e||typeof e!="object")return t;const a=_e();return e[a]||e.en||e["zh-Hant"]||t}function Os(e){return Ta(e.titleLocalized,e.title)||""}function Mr(e){return Ta(e.summaryLocalized,e.summary)||""}function Rr(e,t){return e.coverUrl?e.coverUrl:e.cover?e.cover:e.type==="paper"?(t==null?void 0:t.defaultCoverPaper)||qs:e.type==="podcast"?(t==null?void 0:t.defaultCoverPodcast)||Ms:(t==null?void 0:t.defaultCoverBook)||Ns}function Or(e,t){return e.coverFallback?e.coverFallback:e.type==="paper"?(t==null?void 0:t.defaultCoverPaper)||qs:e.type==="podcast"?(t==null?void 0:t.defaultCoverPodcast)||Ms:(t==null?void 0:t.defaultCoverBook)||Ns}function Br(e){const t=e==null?void 0:e.plainTakeawaysLocalized;if(t&&typeof t=="object"){const a=_e(),i=t[a]||t["zh-Hant"]||t.en;if(Array.isArray(i)&&i.length)return i}return Array.isArray(e==null?void 0:e.plainTakeaways)&&e.plainTakeaways.length?e.plainTakeaways:[]}function Hr(e){const t=Br(e);return t.length?`<div class="rl-block">
    <h4 class="rl-h">${n(s("researchTakeaways"))}</h4>
    <ul class="rl-takeaways">${t.map(a=>`<li>${n(a)}</li>`).join("")}</ul>
  </div>`:""}function Ur(e){if(!Array.isArray(e)||!e.length)return"";const t=e.filter(i=>/^https?:\/\//i.test(String(i)));if(!t.length)return"";const a=t.map(i=>`<a href="${n(i)}" target="_blank" rel="noopener noreferrer">${n(i)}</a>`).join(" · ");return`<div class="rl-sources"><span class="rl-k">${n(s("researchSources"))}</span> ${a}</div>`}function Ir(e,t){const a=Rr(e,t),i=Or(e,t),r=Os(e)||Rs(e.type);return`
    <div class="rl-cover-wrap">
      <img
        class="rl-cover"
        src="${n(a)}"
        alt="${n(r)}"
        loading="lazy"
        decoding="async"
        data-rl-fallback="${n(i)}"
      />
    </div>`}function _r(e){e.querySelectorAll("img.rl-cover[data-rl-fallback]").forEach(t=>{t.addEventListener("error",()=>{const a=t.dataset.rlFallback;a&&t.getAttribute("src")!==a?t.setAttribute("src",a):t.classList.add("is-broken")})})}function Ve(e,t={}){const a=e.status||"candidate",i=e.strategyCandidate||"watch",r=e.year!=null?String(e.year):"—",l=(e.authors||[]).join(", ")||"—";return`
    <article class="rl-card" data-rl-id="${n(e.id)}" data-rl-market="${n(e.market)}" data-rl-type="${n(e.type)}" data-rl-shelf="${n(e.shelf||"adjacent")}">
      ${Ir(e,t)}
      <div class="rl-card-body">
        <header class="rl-card-head">
          <div class="rl-badges">
            <span class="rl-badge rl-type">${n(Rs(e.type))}</span>
            <span class="rl-badge rl-shelf">${n(Ut(e.shelf,t))}</span>
            <span class="rl-badge rl-market">${n(Nr(e.market))}</span>
            <span class="rl-badge ${Ar[a]||""}">${n(Dr(a))}</span>
            <span class="rl-badge ${Er[i]||""}" title="${n(s("researchStrategy"))}">${n(zr(i))}</span>
          </div>
          <h3 class="rl-title">${n(Os(e))}</h3>
          <p class="rl-meta">${n(l)} · ${n(r)}</p>
        </header>
        <p class="rl-summary">${n(Mr(e))}</p>
        ${Hr(e)}
        ${Ur(e.sources)}
      </div>
    </article>`}function Wr(e=!0){return`
    <section class="section research-section" aria-labelledby="research-heading">
      <header class="view-header view-header-tight">
        <h2 class="view-title" id="research-heading">${n(s("researchTitle"))}</h2>
        <p class="view-lead view-lead-tight">${n(s("researchLead"))}</p>
      </header>
      <p class="rl-banner" role="note">${n(s("researchMathGateBanner"))}</p>
      <div id="rl-root" class="rl-root" data-placeholder="${e?"1":"0"}">
        <p class="rl-loading">${n(s("loading"))}</p>
      </div>
    </section>`}function It(e,{market:t,type:a,shelf:i,status:r,candidate:l}){return e.filter(o=>a&&a!=="all"&&o.type!==a||i&&i!=="all"&&(o.shelf||"adjacent")!==i||r&&r!=="all"&&(o.status||"candidate")!==r||l&&l!=="all"&&(o.strategyCandidate||"watch")!==l?!1:!t||t==="all"?!0:t==="US"?o.market==="US"||o.market==="BOTH":t==="TW"?o.market==="TW"||o.market==="BOTH":!0)}function Fr(e){var a,i,r;const t=(a=e==null?void 0:e.meta)==null?void 0:a.mathGateLocalized;return t&&typeof t=="object"?Ta(t,(i=e==null?void 0:e.meta)==null?void 0:i.mathGate)||s("researchMathGateBanner"):((r=e==null?void 0:e.meta)==null?void 0:r.mathGate)||s("researchMathGateBanner")}const wa=[{id:"book",titleKey:"researchCatBooks",type:"book"},{id:"paper",titleKey:"researchCatPapers",type:"paper"},{id:"podcast",titleKey:"researchCatPodcasts",type:"podcast"},{id:"us",titleKey:"researchCatUs",market:"US"},{id:"tw",titleKey:"researchCatTw",market:"TW"},{id:"candidate",titleKey:"researchCatCandidate",status:"candidate"},{id:"watch",titleKey:"researchCatWatch",candidate:"watch"}],Rn={menu:"menu",all:"menu",index:"menu",book:"book",books:"book",paper:"paper",papers:"paper",podcast:"podcast",podcasts:"podcast",us:"us",tw:"tw",candidate:"candidate",watch:"watch",watching:"watch"};let qa=null,Ma=null,ce={category:"menu",market:"all",type:"all",shelf:"all",status:"all",candidate:"all"};function Xa(e){if(e==null||e==="")return"menu";const a=String(e).trim().toLowerCase();return Rn[a]?Rn[a]:wa.some(i=>i.id===a)?a:"menu"}function Qa(e,t){const a=wa.find(i=>i.id===t);return e.category=a?t:"menu",e.market="all",e.type="all",e.shelf="all",e.status="all",e.candidate="all",a&&(a.type&&(e.type=a.type),a.market&&(e.market=a.market),a.status&&(e.status=a.status),a.candidate&&(e.candidate=a.candidate)),e}function Vr(e,t){return It(e,{market:t.market||"all",type:t.type||"all",shelf:"all",status:t.status||"all",candidate:t.candidate||"all"}).length}function Gr(e){return!e||e.category==="menu"?"#research":e.shelf&&e.shelf!=="all"?`#research/shelf/${encodeURIComponent(e.shelf)}`:`#research/${e.category}`}function Bs(e){const t=Gr(e);location.hash!==t&&history.replaceState(null,"",t)}function On(e){return[{id:"menu",label:s("researchCatMenu")},...wa.map(a=>({id:a.id,label:s(a.titleKey)}))].map(a=>`<button type="button" class="rl-tab${a.id===e.category?" is-active":""}" data-rl-cat="${n(a.id)}" role="tab" aria-selected="${a.id===e.category}">${n(a.label)}</button>`).join("")}function Kr(e){const t=wa.map(a=>{const i=Vr(e,a);return`
      <button type="button" class="rl-menu-card" data-rl-cat="${n(a.id)}" aria-label="${n(s(a.titleKey))}">
        <h3 class="rl-menu-title">${n(s(a.titleKey))}</h3>
        <p class="rl-menu-count">${i}</p>
        <span class="rl-menu-cta">${n(s("researchOpenCategory"))}</span>
      </button>`}).join("");return`
    <div class="rl-menu" role="group" aria-label="${n(s("researchCategories"))}">
      <p class="rl-menu-lead">${n(s("researchMenuLead"))}</p>
      <div class="rl-menu-grid">${t}</div>
    </div>`}function Ne(e,t,a,{syncUrl:i=!0}={}){const r=Array.isArray(t==null?void 0:t.items)?t.items:[],l=(t==null?void 0:t.meta)||{},o=qr(l);if(i&&Bs(a),a.category==="menu"){e.innerHTML=`
      <div class="rl-tabs-wrap">
        <div class="rl-tabs" role="tablist" aria-label="${n(s("researchCategories"))}">
          ${On(a)}
        </div>
      </div>
      ${Kr(r)}`,Bn(e,t,a);return}const c=It(r,a),u=c.filter(C=>C.type==="book"),d=c.filter(C=>C.type==="paper"),p=c.filter(C=>C.type==="podcast"),f=l.mathGate?`<p class="rl-meta-line">${n(Fr(t))}</p>`:"",h=[`<button type="button" class="rl-filter rl-shelf-chip${a.shelf==="all"?" is-active":""}" data-rl-shelf="all">${n(s("researchFilterAll"))}</button>`,...o.map(C=>{const b=It(r,{...a,shelf:C}).length;return b?`<button type="button" class="rl-filter rl-shelf-chip${a.shelf===C?" is-active":""}" data-rl-shelf="${n(C)}">${n(Ut(C,l))} <span class="rl-chip-count">${b}</span></button>`:""})].join(""),g=[["all",s("researchFilterAll")],["candidate",s("researchStatusCandidate")],["deferred",s("researchStatusDeferred")],["adopted",s("researchStatusAdopted")],["rejected",s("researchStatusRejected")]].map(([C,b])=>{const $=It(r,{...a,status:C==="all"?"all":C}).length;return C!=="all"&&!r.some(w=>(w.status||"candidate")===C)?"":`<button type="button" class="rl-filter${a.status===C?" is-active":""}" data-rl-status="${C}">${n(b)}${C==="all"?"":` <span class="rl-chip-count">${$}</span>`}</button>`}).join("");function m(C){if(!C.length)return`<p class="rl-empty">${n(s("researchEmpty"))}</p>`;if(a.shelf&&a.shelf!=="all")return`<div class="rl-grid">${C.map($=>Ve($,l)).join("")}</div>`;const b=o.filter($=>C.some(w=>(w.shelf||"adjacent")===$));return b.length?b.map($=>{const w=C.filter(j=>(j.shelf||"adjacent")===$);return`<section class="rl-shelf-group" data-shelf="${n($)}" aria-label="${n(Ut($,l))}">
          <h4 class="rl-shelf-title">${n(Ut($,l))} <span class="rl-list-count">(${w.length})</span></h4>
          <div class="rl-grid">${w.map(j=>Ve(j,l)).join("")}</div>
        </section>`}).join(""):`<div class="rl-grid">${C.map($=>Ve($,l)).join("")}</div>`}const v=a.type==="all"||a.type==="book",S=a.type==="all"||a.type==="paper",x=a.type==="all"||a.type==="podcast",L=[];v&&L.push(`<section class="rl-list" aria-label="${n(s("researchTypeBook"))}">
        <h3 class="rl-list-title">${n(s("researchTypeBook"))} <span class="rl-list-count">(${u.length})</span></h3>
        ${m(u)}
      </section>`),S&&L.push(`<section class="rl-list" aria-label="${n(s("researchTypePaper"))}">
        <h3 class="rl-list-title">${n(s("researchTypePaper"))} <span class="rl-list-count">(${d.length})</span></h3>
        <div class="rl-grid">
          ${d.length?d.map(C=>Ve(C,l)).join(""):`<p class="rl-empty">${n(s("researchEmpty"))}</p>`}
        </div>
      </section>`),x&&L.push(`<section class="rl-list" aria-label="${n(s("researchTypePodcast"))}">
        <h3 class="rl-list-title">${n(s("researchTypePodcast"))} <span class="rl-list-count">(${p.length})</span></h3>
        <div class="rl-grid">
          ${p.length?p.map(C=>Ve(C,l)).join(""):`<p class="rl-empty">${n(s("researchEmpty"))}</p>`}
        </div>
      </section>`);const N=a.category==="us"||a.category==="tw"?"":`<div class="rl-filter-group" role="group" aria-label="${n(s("market"))}">
        <button type="button" class="rl-filter${a.market==="all"?" is-active":""}" data-rl-market="all">${n(s("researchFilterAll"))}</button>
        <button type="button" class="rl-filter${a.market==="US"?" is-active":""}" data-rl-market="US">${n(s("usStock"))}</button>
        <button type="button" class="rl-filter${a.market==="TW"?" is-active":""}" data-rl-market="TW">${n(s("twStock"))}</button>
      </div>`,A=a.category==="candidate"||a.category==="watch"?"":`<div class="rl-filter-group" role="group" aria-label="${n(s("researchStatusFilters"))}">
        ${g}
      </div>`;e.innerHTML=`
    <div class="rl-tabs-wrap">
      <div class="rl-tabs" role="tablist" aria-label="${n(s("researchCategories"))}">
        ${On(a)}
      </div>
    </div>
    <div class="rl-toolbar" role="toolbar" aria-label="${n(s("researchFilters"))}">
      ${N}
      ${A}
    </div>
    <div class="rl-shelf-scroll" role="group" aria-label="${n(s("researchShelfFilters"))}">
      ${h}
    </div>
    ${f}
    <p class="rl-counts">${n(s("researchCounts",{books:u.length,papers:d.length,podcasts:p.length,total:c.length}))}</p>
    <div class="rl-lists">
      ${L.join("")}
    </div>`,_r(e),Bn(e,t,a)}function Bn(e,t,a){e.querySelectorAll("[data-rl-cat]").forEach(i=>{i.addEventListener("click",()=>{Qa(a,i.dataset.rlCat),Ne(e,t,a,{syncUrl:!0})})}),e.querySelectorAll("[data-rl-market]").forEach(i=>{i.addEventListener("click",()=>{a.market=i.dataset.rlMarket,Ne(e,t,a,{syncUrl:!1})})}),e.querySelectorAll("[data-rl-status]").forEach(i=>{i.addEventListener("click",()=>{a.status=i.dataset.rlStatus,Ne(e,t,a,{syncUrl:!1})})}),e.querySelectorAll("[data-rl-shelf]").forEach(i=>{i.addEventListener("click",()=>{a.shelf=i.dataset.rlShelf,Bs(a),Ne(e,t,a,{syncUrl:!1})})})}async function Yr(e=zs){const t=await fetch(e);if(!t.ok)throw new Error(`HTTP ${t.status}`);return t.json()}function Zr(e,{syncUrl:t=!0,shelf:a=null}={}){return!qa||!Ma?{ok:!1,reason:"not-ready"}:(Qa(ce,Xa(e)),a&&(ce.shelf=a),Ne(qa,Ma,ce,{syncUrl:t}),{ok:!0,category:ce.category,state:{...ce}})}async function Jr(e="#rl-root",t=zs,a={}){const i=typeof e=="string"?document.querySelector(e):e;if(!i)return{ok:!1,reason:"missing-root"};qa=i;try{const r=await Yr(t);return Ma=r,ce={category:"menu",market:"all",type:"all",shelf:"all",status:"all",candidate:"all"},Qa(ce,Xa(a.category??"menu")),a.shelf&&(ce.shelf=a.shelf),Ne(i,r,ce,{syncUrl:a.syncUrl!==!1}),{ok:!0,data:r}}catch(r){return i.innerHTML=`<p class="rl-error">${n(s("researchLoadError",{msg:r.message}))}</p>`,{ok:!1,error:r}}}const Xr="./data/us-options-snapshot.json",Qr="book-mcmillan-options-handbook",el={"covered-call":["optionsSetupCoveredCall","optionsSetupCoveredCallBody","optionsSetupCoveredCallWarn"],"protective-put":["optionsSetupProtectivePut","optionsSetupProtectivePutBody","optionsSetupProtectivePutWarn"],"vertical-spread":["optionsSetupVertical","optionsSetupVerticalBody","optionsSetupVerticalWarn"],"calendar-diagonal":["optionsSetupCalendar","optionsSetupCalendarBody","optionsSetupCalendarWarn"],"straddle-strangle":["optionsSetupStraddle","optionsSetupStraddleBody","optionsSetupStraddleWarn"],butterfly:["optionsSetupButterfly","optionsSetupButterflyBody","optionsSetupButterflyWarn"]};function tl(e,t){if(!e||typeof e!="object")return t;const a=_e();return e[a]||e["zh-Hant"]||e.en||t}function al(e){return e&&tl(e.titleLocalized,e.title)||""}function nl(e){if(!e)return[];const t=e.plainTakeawaysLocalized;if(t&&typeof t=="object"){const a=_e(),i=t[a]||t["zh-Hant"]||t.en;if(Array.isArray(i)&&i.length)return i}return Array.isArray(e.plainTakeaways)?e.plainTakeaways:[]}function sl(e){try{return new Date(e).toLocaleString(D(),{timeZone:"Asia/Taipei",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1})+s("taipei")}catch{return e||"—"}}function re(e,t=2){return e==null||Number.isNaN(e)?null:Number(e).toLocaleString(D(),{minimumFractionDigits:t,maximumFractionDigits:t})}function Hs(e,t=1){return e==null||Number.isNaN(e)?null:`${(e*100).toFixed(t)}%`}function Hn(e){return e==null||Number.isNaN(e)?null:`${(e*100).toFixed(1)}%`}function R(e,t=""){return e==null||e===""?"—":`<span class="uo-val">${n(String(e))}${t?n(t):""}</span>`}function en(e){return s(e==="pass"?"optionsGatePass":e==="watch"?"optionsGateWatch":e==="fail"?"optionsGateFail":"optionsGateIncomplete")}function tn(e){return e==="pass"?"uo-gate-pass":e==="watch"?"uo-gate-watch":e==="fail"?"uo-gate-fail":"uo-gate-incomplete"}function aa(e){return!e||e.incomplete||e.label==null?null:e.label==="up"?s("optionsTrendUp",{pct:e.pct!=null?e.pct:"—"}):e.label==="down"?s("optionsTrendDown",{pct:e.pct!=null?e.pct:"—"}):s("optionsTrendFlat",{pct:e.pct!=null?e.pct:"—"})}function il(e){return e==null?null:e>1.2?s("optionsSkewPutHeavy"):e<.8?s("optionsSkewCallHeavy"):s("optionsSkewBalanced")}function Us(e){return e==="iv_rich"?s("optionsRegimeIvRich"):e==="iv_cheap"?s("optionsRegimeIvCheap"):e==="iv_fair"?s("optionsRegimeIvFair"):e==="iv_only"?s("optionsRegimeIvOnly"):"—"}function rl(e){return e!=null&&e.primaryBook?e.primaryBook:null}function ll(e){const t=rl(e),a=al(t)||s("optionsBookFallbackTitle"),i=nl(t),r=i.length?`<ul class="uo-takeaways">${i.map(l=>`<li>${n(l)}</li>`).join("")}</ul>`:`<p class="uo-muted">${n(s("researchNoTakeaways"))}</p>`;return`
    <aside class="uo-book" aria-label="${n(s("optionsBookCite"))}">
      <div class="uo-book-head">
        <span class="uo-book-badge">${n(s("optionsBookBadge"))}</span>
        <h3 class="uo-book-title">${n(a)}</h3>
      </div>
      <p class="uo-book-lead">${n(s("optionsBookLead"))}</p>
      ${r}
      <p class="uo-book-link">
        <button type="button" class="uo-link-btn" data-jump="research">${n(s("optionsGotoResearch"))}</button>
        <span class="uo-muted">· ${n(Qr)}</span>
      </p>
    </aside>`}function ol(e){const t=e.fundamentals||{},a=e.quality||{},i=t.trailingPE??t.forwardPE,r=t.trailingPE!=null?"":t.forwardPE!=null?` <span class="uo-hint">(${n(s("optionsForwardPe"))})</span>`:"";return`
    <tr data-uo-ticker="${n(e.ticker)}" class="uo-q-row">
      <td>
        <button type="button" class="uo-ticker-btn" data-uo-select="${n(e.ticker)}">
          <span class="uo-ticker">${n(e.ticker)}</span>
          <span class="uo-name">${n(e.name||"")}</span>
        </button>
      </td>
      <td class="num">${R(re(i,1))}${r}</td>
      <td class="num">${R(re(t.priceToBook,2))}</td>
      <td class="num">${R(re(t.debtToEquity,1))}</td>
      <td class="num">${R(Hs(t.roe))}</td>
      <td>${R(aa(t.revenueTrend))}</td>
      <td>${R(aa(t.earningsTrend))}</td>
      <td><span class="uo-gate ${tn(a.gate)}">${n(en(a.gate))}</span></td>
    </tr>`}function cl(e){return e.map(t=>{const a=t.fundamentals||{},i=t.quality||{},r=a.trailingPE??a.forwardPE;return`
      <article class="uo-q-card" data-uo-ticker="${n(t.ticker)}">
        <button type="button" class="uo-ticker-btn" data-uo-select="${n(t.ticker)}">
          <span class="uo-ticker">${n(t.ticker)}</span>
          <span class="uo-name">${n(t.name||"")}</span>
        </button>
        <div class="uo-metrics">
          <div><span class="m-l">${n(s("optionsPe"))}</span> ${R(re(r,1))}</div>
          <div><span class="m-l">${n(s("optionsPb"))}</span> ${R(re(a.priceToBook,2))}</div>
          <div><span class="m-l">${n(s("optionsDebt"))}</span> ${R(re(a.debtToEquity,1))}</div>
          <div><span class="m-l">${n(s("optionsRoe"))}</span> ${R(Hs(a.roe))}</div>
          <div><span class="m-l">${n(s("optionsRevTrend"))}</span> ${R(aa(a.revenueTrend))}</div>
          <div><span class="m-l">${n(s("optionsEarnTrend"))}</span> ${R(aa(a.earningsTrend))}</div>
        </div>
        <span class="uo-gate ${tn(i.gate)}">${n(en(i.gate))}</span>
      </article>`}).join("")}function ul(){return`
    <details class="uo-glossary fold-block">
      <summary>${n(s("optionsGlossaryTitle"))}</summary>
      <dl class="uo-dl">
        <div><dt>${n(s("optionsTermDelta"))}</dt><dd>${n(s("optionsDefDelta"))}</dd></div>
        <div><dt>${n(s("optionsTermIv"))}</dt><dd>${n(s("optionsDefIv"))}</dd></div>
        <div><dt>${n(s("optionsTermHv"))}</dt><dd>${n(s("optionsDefHv"))}</dd></div>
        <div><dt>${n(s("optionsTermAtm"))}</dt><dd>${n(s("optionsDefAtm"))}</dd></div>
        <div><dt>${n(s("optionsTermSkew"))}</dt><dd>${n(s("optionsDefSkew"))}</dd></div>
        <div><dt>${n(s("optionsTermProb"))}</dt><dd>${n(s("optionsDefProb"))}</dd></div>
      </dl>
    </details>`}function dl(e){const t=e.setups||[];return t.length?`<div class="uo-setups">
    ${t.map(a=>{const i=el[a.id];if(!i)return"";const[r,l,o]=i,c=a.volAligned?s("optionsSetupVolAligned"):s("optionsSetupVolNotAligned");return`
        <article class="uo-setup${a.volAligned?" is-aligned":""}">
          <h4>${n(s(r))}</h4>
          <p>${n(s(l))}</p>
          <p class="uo-risk-shape">${n(s("optionsRiskShape"))}: ${n(s(o))}</p>
          <p class="uo-muted">${n(c)} · ${n(Us(a.volRegime))}</p>
        </article>`}).join("")}
  </div>`:`<p class="uo-muted">${n(s("optionsNoSetups"))}</p>`}function pl(e){var c,u;if(!e)return`<p class="uo-muted">${n(s("optionsPickTicker"))}</p>`;const t=e.options,a=e.blockers||[];if(!t)return`
      <div class="uo-blocker" role="status">
        <p><strong>${n(s("optionsChainBlocked"))}</strong></p>
        <p>${n(a.join(" · ")||s("optionsDataMissing"))}</p>
      </div>`;const i=il(t.putCallVolumeRatio),r=t.atmIv==null,l=t.historicalVol==null,o=r?"unknown":l?"iv_only":t.ivHvRatio>=1.25?"iv_rich":t.ivHvRatio<=.8?"iv_cheap":"iv_fair";return`
    <div class="uo-opt-head">
      <div>
        <div class="uo-ticker">${n(e.ticker)}</div>
        <div class="uo-name">${n(e.name||"")}</div>
      </div>
      <span class="uo-gate ${tn((c=e.quality)==null?void 0:c.gate)}">${n(en((u=e.quality)==null?void 0:u.gate))}</span>
    </div>
    <p class="uo-opt-note">${n(s("optionsMcmillanFirst"))}</p>
    <div class="uo-opt-grid">
      <div class="uo-opt-metric">
        <div class="m-l">${n(s("optionsAtmIv"))}</div>
        <div class="m-v">${R(r?null:Hn(t.atmIv))}</div>
        <div class="uo-muted">${n(s("optionsExpiry"))}: ${n(t.expiration||"—")}</div>
      </div>
      <div class="uo-opt-metric">
        <div class="m-l">${n(s("optionsHv"))}</div>
        <div class="m-v">${R(l?null:Hn(t.historicalVol))}</div>
        <div class="uo-muted">${n(s("optionsIvHv"))}: ${t.ivHvRatio!=null?R(re(t.ivHvRatio,2)+"×"):R(null)}</div>
      </div>
      <div class="uo-opt-metric">
        <div class="m-l">${n(s("optionsVolRegime"))}</div>
        <div class="m-v">${n(Us(o))}</div>
        <div class="uo-muted">${i?n(i):""}</div>
      </div>
      <div class="uo-opt-metric">
        <div class="m-l">${n(s("optionsCallPutVol"))}</div>
        <div class="m-v">${R(re(t.callVolume,0))} / ${R(re(t.putVolume,0))}</div>
        <div class="uo-muted">${n(s("optionsAtmStrike"))}: ${R(re(t.atmStrikeCall??t.atmStrikePut,1))}</div>
      </div>
    </div>
    ${(()=>{const d=a.filter(f=>!/atmIv|options fields incomplete/i.test(String(f))||t.historicalVol==null&&!(t.callVolume||t.putVolume)),p=d.length?d:[];return p.length?`<p class="uo-warn">${n(s("optionsPartialBlocker"))}: ${n(p.join(" · "))}</p>`:""})()}
    <h4 class="uo-h">${n(s("optionsEduSetups"))}</h4>
    <p class="uo-panel-lead">${n(s("optionsEduSetupsLead"))}</p>
    ${dl(e)}
    <p class="uo-disclaimer" role="note">${n(s("optionsDisclaimer"))}</p>
    ${ul()}
  `}function Is(e,t,a){const i=Array.isArray(t==null?void 0:t.tickers)?t.tickers:[],r=i.find(l=>l.ticker===a.ticker)||i[0]||null;r&&(a.ticker=r.ticker),e.innerHTML=`
    ${ll(t)}
    <p class="uo-meta">${n(s("dataAsOf"))} ${n(sl(t==null?void 0:t.asOf))} · ${n(s("optionsUsOnly"))}</p>
        <div class="uo-panels">
      <section class="uo-panel uo-panel-opt" aria-label="${n(s("optionsViewTitle"))}">
        <h3 class="uo-panel-title">${n(s("optionsViewTitle"))}</h3>
        <p class="uo-panel-lead">${n(s("optionsViewLead"))}</p>
        <div class="uo-ticker-chips" role="tablist" aria-label="${n(s("ticker"))}">
          ${i.map(l=>`
            <button type="button" class="uo-chip${l.ticker===a.ticker?" is-active":""}" data-uo-select="${n(l.ticker)}" role="tab" aria-selected="${l.ticker===a.ticker?"true":"false"}">${n(l.ticker)}</button>`).join("")}
        </div>
        <div class="uo-detail" id="uo-detail">
          ${pl(r)}
        </div>
      </section>
      <section class="uo-panel" aria-label="${n(s("optionsQualityTitle"))}">
        <h3 class="uo-panel-title">${n(s("optionsQualityTitle"))}</h3>
        <p class="uo-panel-lead">${n(s("optionsQualityLead"))}</p>
        <div class="table-wrap uo-table-wrap">
          <table class="stock-table uo-table">
            <thead>
              <tr>
                <th>${n(s("ticker"))}</th>
                <th>${n(s("optionsPe"))}</th>
                <th>${n(s("optionsPb"))}</th>
                <th>${n(s("optionsDebt"))}</th>
                <th>${n(s("optionsRoe"))}</th>
                <th>${n(s("optionsRevTrend"))}</th>
                <th>${n(s("optionsEarnTrend"))}</th>
                <th>${n(s("optionsGate"))}</th>
              </tr>
            </thead>
            <tbody>
              ${i.length?i.map(ol).join(""):`<tr><td colspan="8">${n(s("optionsEmpty"))}</td></tr>`}
            </tbody>
          </table>
        </div>
        <div class="uo-mobile">${i.length?cl(i):`<p class="uo-muted">${n(s("optionsEmpty"))}</p>`}</div>
      </section>
    </div>
  `,e.querySelectorAll("[data-uo-select]").forEach(l=>{l.addEventListener("click",()=>{a.ticker=l.getAttribute("data-uo-select"),Is(e,t,a)})}),e.querySelectorAll("[data-uo-ticker]").forEach(l=>{l.classList.toggle("is-selected",l.getAttribute("data-uo-ticker")===a.ticker)})}function fl(){return`
    <section class="section options-section" aria-label="${n(s("optionsTitle"))}">
      <header class="view-header">
        <h2 class="view-title">${n(s("optionsTitle"))}</h2>
        <p class="view-lead">${n(s("optionsLead"))}</p>
      </header>
      <p class="uo-disclaimer uo-disclaimer-top" role="note">${n(s("optionsDisclaimer"))}</p>
      <div id="uo-root" class="uo-root">
        <p class="uo-loading">${n(s("loading"))}</p>
      </div>
    </section>`}async function hl(e="#uo-root"){var a,i;const t=typeof e=="string"?document.querySelector(e):e;if(!t)return{ok:!1};try{const r=await fetch(Xr);if(!r.ok)throw new Error(`HTTP ${r.status}`);const l=await r.json(),o={ticker:((i=(a=l==null?void 0:l.tickers)==null?void 0:a[0])==null?void 0:i.ticker)||null};return Is(t,l,o),{ok:!0,data:l}}catch(r){return t.innerHTML=`
      <div class="uo-blocker" role="alert">
        <p>${n(s("optionsLoadError",{msg:r.message||String(r)}))}</p>
      </div>`,{ok:!1,error:r}}}const gl="./data/earnings-digest.json";function ml(e){try{return new Date(e).toLocaleString(D(),{timeZone:"Asia/Taipei",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1})+s("taipei")}catch{return e||"—"}}function Me(e,t=2){return e==null||Number.isNaN(e)?null:Number(e).toLocaleString(D(),{minimumFractionDigits:t,maximumFractionDigits:t})}function na(e,t=1){return e==null||Number.isNaN(e)?null:`${e>0?"+":""}${Number(e).toFixed(t)}%`}function Ae(e,t=""){return e==null||e===""?null:`<span class="er-val">${n(String(e))}${t?n(t):""}</span>`}function Ee(e,t){return t?`<div class="er-metric">
          <div class="m-l">${n(e)}</div>
          <div class="m-v">${t}</div>
        </div>`:""}function yl(e){return e==="mega_cap_earnings_next_14d"?s("earningsTagPrimary"):e==="yahoo_most_actives_earnings_next_14d"?s("earningsTagActives"):e==="recently_reported"?s("earningsTagRecent"):e==="calendar_highlight_within_45d"?s("earningsTagFallback"):e||s("earningsTagOther")}function $l(e){return e==="recently_reported"?"er-badge-recent":e==="calendar_highlight_within_45d"?"er-badge-fallback":e!=null&&e.includes("most_actives")?"er-badge-hot":""}function vl(e=new Date){return new Intl.DateTimeFormat("en-CA",{timeZone:"America/New_York"}).format(e)}function _s(e,t){const a=/^\d{4}-\d{2}-\d{2}$/;return!a.test(e||"")||!a.test(t||"")?null:Math.round((Date.parse(`${t}T00:00:00Z`)-Date.parse(`${e}T00:00:00Z`))/864e5)}function bl(e,t=vl()){const a=e==null?void 0:e.nextEarningsDate,i=_s(t,a);return i==null?{state:"unknown",days:null}:i<0?{state:"reported",days:-i}:i===0?{state:"today",days:0}:{state:"upcoming",days:i}}function kl(e,t){const a=[],i=e.lastReport||{};if(t.state==="reported"){const r=_s(i.quarter,e.nextEarningsDate);if(!(r!=null&&r>=0&&r<=100))return s("earningsReportedPending",{date:e.nextEarningsDate});if(a.push(s("earningsReportedHead",{date:e.nextEarningsDate,q:i.quarter})),i.epsActual!=null){let o=s("earningsReportedEps",{a:Me(i.epsActual,2)});if(i.epsEstimate!=null&&i.epsSurprisePct!=null&&Number.isFinite(i.epsSurprisePct)){const c=i.epsSurprisePct>0?"earningsBeat":i.epsSurprisePct<0?"earningsMiss":"earningsInline";o+=s(c,{e:Me(i.epsEstimate,2),p:Math.abs(i.epsSurprisePct).toFixed(1)})}a.push(o)}return a.push(s("earningsNextUnknown")),a.join("")}if(t.state==="upcoming"||t.state==="today"){a.push(t.state==="today"?s("earningsWatchToday"):s("earningsWatchUpcoming",{date:e.nextEarningsDate,n:t.days})),e.consensusEpsNext!=null&&a.push(s("earningsWatchConsensus",{e:Me(e.consensusEpsNext,2)}));const r=na(e.revenueYoYPct),l=na(e.epsYoYPct);return r&&l&&a.push(s("earningsWatchTrend",{rev:r,eps:l})),a.join("")}return e.whatToWatch||""}function Un(e,{hot:t=!1}={}){var p;if(!e)return"";const a=bl(e),i=a.state==="reported",r=e.nextEarningsDate==null?null:i?s("earningsReportedOn",{date:e.nextEarningsDate}):`${e.nextEarningsDate}${e.nextEarningsDateIsEstimate?` (${s("earningsEstimate")})`:""}`,l=a.state==="today"?s("earningsToday"):a.state==="upcoming"?s("earningsInDays",{n:a.days}):"",o=r?`${Ae(r)}${l?`<span class="er-sub">${n(l)}</span>`:""}`:null,c=kl(e,a),u=((p=e.lastReport)==null?void 0:p.epsActual)!=null?`${Me(e.lastReport.epsActual,2)}${e.lastReport.quarter?` · ${e.lastReport.quarter}`:""}`:null,d=i?`<span class="er-badge er-badge-recent">${n(s("earningsTagRecent"))}</span>`:t?`<span class="er-badge ${$l(e.selectionTag)}">${n(yl(e.selectionTag))}</span>`:`<span class="er-badge">${n(s("earningsMag7Badge"))}</span>`;return`
    <article class="er-card${i?" er-card-reported":""}" data-ticker="${n(e.ticker)}">
      <div class="er-card-head">
        <div>
          <div class="er-ticker">${n(e.ticker)}</div>
          <div class="er-name">${n(e.name||"")}</div>
        </div>
        ${d}
      </div>
      <div>
        <div class="er-label">${n(s("earningsWhatItDoes"))}</div>
        <p class="er-does"${e.whatItDoes?` title="${n(e.whatItDoes)}"`:""}>${e.whatItDoes?n(e.whatItDoes):""}</p>
      </div>
      <div class="er-metrics">
        ${Ee(s(i?"earningsLatestDate":"earningsNextDate"),o)}
        ${Ee(s("earningsLastEps"),Ae(u))}
        ${Ee(s("earningsRevYoy"),Ae(na(e.revenueYoYPct)))}
        ${Ee(s("earningsEpsYoy"),Ae(na(e.epsYoYPct)))}
        ${Ee(s("earningsPe"),Ae(Me(e.pe,1)))}
        ${Ee(s("earningsForwardPe"),Ae(Me(e.forwardPe,1)))}
      </div>
      ${c?`<div>
        <div class="er-label">${n(s(i?"earningsResultTitle":"earningsWhatToWatch"))}</div>
        <p class="er-watch">${n(c)}</p>
      </div>`:""}
      ${e.blocker?`<p class="er-miss">${n(s("earningsPartialBlocker"))}: ${n(e.blocker)}</p>`:""}
    </article>`}function Sl(e,t){const a=Array.isArray(t==null?void 0:t.mag7)?t.mag7:[],i=Array.isArray(t==null?void 0:t.watchlistHot)?t.watchlistHot:[];e.innerHTML=`
    <p class="er-meta">${n(s("dataAsOf"))} ${n(ml(t==null?void 0:t.asOf))} · ${n(s("earningsUsFocus"))}</p>
    <p class="er-stub" role="note">${n(s("earningsTwStub"))}</p>
    <div class="er-rule"><strong>${n(s("earningsSelectionTitle"))}</strong> ${n(s("earningsSelectionFallback"))}</div>
        <div class="er-panels">
      <section class="er-panel" aria-label="${n(s("earningsMag7Title"))}">
        <h3 class="er-panel-title">${n(s("earningsMag7Title"))}</h3>
        <p class="er-panel-lead">${n(s("earningsMag7Lead"))}</p>
        <div class="er-cards">
          ${a.length?a.map(r=>Un(r,{hot:!1})).join(""):`<p class="er-empty">${n(s("earningsEmpty"))}</p>`}
        </div>
      </section>
      <section class="er-panel" aria-label="${n(s("earningsHotTitle"))}">
        <h3 class="er-panel-title">${n(s("earningsHotTitle"))}</h3>
        <p class="er-panel-lead">${n(s("earningsHotLead"))}</p>
        <div class="er-cards">
          ${i.length?i.map(r=>Un(r,{hot:!0})).join(""):`<p class="er-empty">${n(s("earningsHotEmpty"))}</p>`}
        </div>
      </section>
    </div>
    <p class="er-disclaimer" role="note">${n(s("earningsDisclaimer"))}</p>
  `}function Tl(){return`
    <section class="section earnings-section" aria-label="${n(s("earningsTitle"))}">
      <header class="view-header">
        <h2 class="view-title">${n(s("earningsTitle"))}</h2>
        <p class="view-lead">${n(s("earningsLead"))}</p>
      </header>
      <p class="er-disclaimer er-disclaimer-top" role="note">${n(s("earningsDisclaimer"))}</p>
      <div id="er-root" class="er-root">
        <p class="er-loading">${n(s("loading"))}</p>
      </div>
    </section>`}async function wl(e="#er-root"){const t=typeof e=="string"?document.querySelector(e):e;if(!t)return{ok:!1};try{const a=await fetch(gl);if(!a.ok)throw new Error(`HTTP ${a.status}`);const i=await a.json();return Sl(t,i),{ok:!0,data:i}}catch(a){return t.innerHTML=`
      <div class="er-empty" role="status">
        <p>${n(s("earningsLoadError",{msg:a.message||String(a)}))}</p>
      </div>`,{ok:!1,error:a}}}const xl="https://r.jina.ai/",an="",Pl=new Set(["query1.finance.yahoo.com","query2.finance.yahoo.com","mis.twse.com.tw"]),Cl=6e3,Ll=1e4;function jl(e,t=an){if(!t)return null;let a;try{const i=new URL(e);if(i.protocol!=="https:")return null;a=i.hostname}catch{return null}return Pl.has(a)?`${String(t).replace(/\/+$/,"")}/?url=${encodeURIComponent(e)}`:null}function Al(e,{backupBase:t=an,primaryTimeoutMs:a=18e3}={}){const i=jl(e,t),r=[{via:"jina",url:`${xl}${e}`,timeoutMs:i?Math.min(a,Cl):a}];return i&&r.push({via:"backup",url:i,timeoutMs:Ll}),r}async function Ws(e,{fetchText:t,parse:a,backupBase:i=an,primaryTimeoutMs:r=18e3,onError:l,only:o}={}){const c=[];for(const u of Al(e,{backupBase:i,primaryTimeoutMs:r}))if(!(o&&!o.includes(u.via)))try{const d=await t(u.url,{timeoutMs:u.timeoutMs}),p=a(d);if(p)return{ok:!0,data:p,via:u.via,errors:c};c.push(`${u.via}: parse`)}catch(d){l&&l(d,u),c.push(`${u.via}: ${(d==null?void 0:d.message)||d}`)}return{ok:!1,data:null,via:null,errors:c}}const El="./data/earnings-digest.json",Dl="./data/company-profiles.json",Fs="https://mops.twse.com.tw/mops/#/web/t05st03",zl="https://openapi.twse.com.tw/",sa=["https://query2.finance.yahoo.com","https://query1.finance.yahoo.com"],ve="https://r.jina.ai/",Nl="https://www.sec.gov/files/company_tickers.json",ql=e=>`https://efts.sec.gov/LATEST/search-index?keysTyped=${encodeURIComponent(e)}`,Ml=e=>`https://data.sec.gov/submissions/CIK${e}.json`,Rl=/^(10-K|10-Q|8-K)(\/A)?$/i,Ol=8,In=["price","summaryProfile","summaryDetail","defaultKeyStatistics","financialData","calendarEvents","earningsHistory"].join(",");let be=null,wt=null,ke=null,xt=null,tt=null,Pt=null;function E(e){if(e==null)return null;if(typeof e=="object"&&"raw"in e){const t=e.raw;return t==null||Number.isNaN(t)?null:t}return typeof e=="number"&&Number.isNaN(e)?null:e}function G(e,t=2){return e==null||Number.isNaN(e)?null:Number(e).toLocaleString(D(),{minimumFractionDigits:t,maximumFractionDigits:t})}function ye(e,t=2){return e==null||Number.isNaN(e)?null:`${e>0?"+":""}${Number(e).toFixed(t)}%`}function Bl(e){return e==null||Number.isNaN(e)?null:Math.abs(e)>=1e9?`${G(e/1e9,2)}B`:Math.abs(e)>=1e6?`${G(e/1e6,2)}M`:Math.abs(e)>=1e3?`${G(e/1e3,1)}K`:G(e,0)}function _n(e,t){if(e==null||Number.isNaN(e))return null;const a=t==="TWD"?"NT$":t==="USD"?"$":"";return Math.abs(e)>=1e12?`${a}${G(e/1e12,2)}T`:Math.abs(e)>=1e9?`${a}${G(e/1e9,2)}B`:Math.abs(e)>=1e6?`${a}${G(e/1e6,2)}M`:`${a}${G(e,0)}`}function $e(e,t){if(e==null||Number.isNaN(e))return null;const a=t==="TWD"&&e>=100?0:2;return`${t==="USD"?"$":t==="TWD"?"NT$":""}${G(e,a)}`}function Vs(e){try{const t=typeof e=="number"?new Date(e*(e<1e12?1e3:1)):new Date(e);return Number.isNaN(t.getTime())?null:t.toLocaleString(D(),{timeZone:"Asia/Taipei",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1})+s("taipei")}catch{return null}}function Hl(e){return e==null||Number.isNaN(e)||e===0?"lk-flat":e>0?"lk-up":"lk-down"}function at(e){if(!e)return null;const t=String(e).trim();if(t.startsWith("{")||t.startsWith("["))try{return JSON.parse(t)}catch{}const a=t.match(/Markdown Content:\s*(\{[\s\S]*|\[[\s\S]*)/i),i=a?a[1].trim():t,r=i.search(/[\{\[]/);if(r<0)return null;const l=i.slice(r);for(let o=l.length;o>2;o--){try{return JSON.parse(l.slice(0,o))}catch{}const c=Math.max(l.lastIndexOf("}",o-2),l.lastIndexOf("]",o-2));if(c<8)break;o=c+2}return null}async function ia(e,{timeoutMs:t=14e3}={}){const a=typeof AbortController<"u"?new AbortController:null,i=a?setTimeout(()=>a.abort(),t):null;try{const r=await fetch(e,{signal:a==null?void 0:a.signal,headers:{Accept:"application/json,text/plain,*/*"}});if(!r.ok){const l=new Error(`HTTP ${r.status}`);l.status=r.status;try{l.body=(await r.text()).slice(0,4e3)}catch{}throw l}return await r.text()}finally{i&&clearTimeout(i)}}function Wn(e){return!!(e&&typeof e=="object"&&(e.chart||e.finance||e.quoteSummary||e.quoteResponse))}async function Ra(e){const t=[];let a=!1;for(const i of sa){const r=`${i}${e}`;try{const l=await ia(r,{timeoutMs:1e4}),o=at(l);if(o)return{ok:!0,data:o,via:"direct",url:r};t.push(`${i}: non-json`)}catch(l){l!=null&&l.body&&Wn(at(l.body))&&(a=!0),t.push(`${i}: ${l.message||l}`)}}for(const i of["jina","backup"])for(const r of sa){const l=`${r}${e}`,o=await Ws(l,{fetchText:ia,parse:at,primaryTimeoutMs:18e3,only:[i],onError:c=>{c!=null&&c.body&&Wn(at(c.body))&&(a=!0)}});if(o.ok)return{ok:!0,data:o.data,via:o.via,url:l};for(const c of o.errors)t.push(`${r} ${c}`)}return{ok:!1,data:null,via:null,answered:a,error:t.slice(0,4).join(" · ")}}function Ul(e,t="US"){let a=String(e||"").trim().toUpperCase();if(a=a.replace(/\s+/g,""),!a)return{ok:!1,error:"empty"};const i=t==="TW"?"TW":"US";if(/^\d{4}(\.(TW|TWO))?$/.test(a)){const l=a.replace(/\.(TW|TWO)$/,"");return{ok:!0,market:"TW",symbol:`${l}.TW`,alt:`${l}.TWO`,display:l}}if(/\.(TW|TWO)$/.test(a))return{ok:!0,market:"TW",symbol:a,alt:a.endsWith(".TW")?a.replace(/\.TW$/,".TWO"):a.replace(/\.TWO$/,".TW"),display:a.replace(/\.(TW|TWO)$/,"")};if(/^\d{4,6}$/.test(a)&&i==="TW")return{ok:!0,market:"TW",symbol:`${a}.TW`,alt:`${a}.TWO`,display:a};let r=a.replace(/\./g,"-");return/^[A-Z][A-Z0-9\-]{0,9}$/.test(r)?{ok:!0,market:"US",symbol:r,alt:null,display:r}:{ok:!1,error:"invalid"}}function Il(e){var c,u,d,p,f;const t=(u=(c=e==null?void 0:e.chart)==null?void 0:c.result)==null?void 0:u[0];if(!t)return null;const a=t.meta||{},i=a.chartPreviousClose??a.previousClose??(Array.isArray((f=(p=(d=t.indicators)==null?void 0:d.quote)==null?void 0:p[0])==null?void 0:f.close)?[...t.indicators.quote[0].close].reverse().find(h=>h!=null):null),r=a.regularMarketPrice??null;let l=null,o=a.regularMarketChangePercent??a.fulldayChangePercent??null;return r!=null&&i!=null&&(l=r-i,o==null&&i!==0&&(o=l/i*100)),{symbol:a.symbol||null,shortName:a.shortName||null,longName:a.longName||null,currency:a.currency||null,exchange:a.fullExchangeName||a.exchangeName||null,price:r,previousClose:i??null,change:l,changePct:o,volume:a.regularMarketVolume??null,dayHigh:a.regularMarketDayHigh??null,dayLow:a.regularMarketDayLow??null,fiftyTwoWeekHigh:a.fiftyTwoWeekHigh??null,fiftyTwoWeekLow:a.fiftyTwoWeekLow??null,marketTime:a.regularMarketTime??null,instrumentType:a.instrumentType||null}}function _l(e,t){const a=Array.isArray(e==null?void 0:e.quotes)?e.quotes:[],i=a.find(r=>String(r.symbol||"").toUpperCase()===t.toUpperCase())||a.find(r=>r.isYahooFinance)||a[0];return i?{symbol:i.symbol||null,shortName:i.shortname||i.shortName||null,longName:i.longname||i.longName||null,exchange:i.exchDisp||i.exchange||null,sector:i.sectorDisp||i.sector||null,industry:i.industryDisp||i.industry||null,quoteType:i.quoteType||i.typeDisp||null}:null}function Oa(e){var h,g,m,v,S;const t=(g=(h=e==null?void 0:e.quoteSummary)==null?void 0:h.result)==null?void 0:g[0];if(!t)return null;const a=t.price||{},i=t.summaryProfile||{},r=t.summaryDetail||{},l=t.defaultKeyStatistics||{},o=t.financialData||{},c=((m=t.calendarEvents)==null?void 0:m.earnings)||{},u=Array.isArray((v=t.earningsHistory)==null?void 0:v.history)?t.earningsHistory.history:[],d=u.find(x=>x.period==="-1q")||[...u].sort((x,L)=>String(L.period||"").localeCompare(String(x.period||"")))[0]||null,f=(Array.isArray(c.earningsDate)?c.earningsDate:[]).map(x=>{var L;return(x==null?void 0:x.fmt)||(E(x)!=null?(L=Vs(E(x)))==null?void 0:L.slice(0,10):null)}).find(Boolean)||null;return{name:a.longName||a.shortName||null,currency:a.currency||r.currency||null,business:i.longBusinessSummary||null,sector:i.sector||null,industry:i.industry||null,website:i.website||null,pe:E(r.trailingPE)??E(l.trailingPE),forwardPe:E(r.forwardPE)??E(l.forwardPE),marketCap:E(r.marketCap)??E(a.marketCap),epsTrailing:E(l.trailingEps)??E(o.trailingEps),revenue:E(o.totalRevenue),revenueGrowth:E(o.revenueGrowth)!=null?E(o.revenueGrowth)*100:null,earningsGrowth:E(o.earningsGrowth)!=null?E(o.earningsGrowth)*100:null,profitMargins:E(o.profitMargins)!=null?E(o.profitMargins)*100:null,grossMargins:E(o.grossMargins)!=null?E(o.grossMargins)*100:null,dividendYield:E(r.dividendYield)!=null?E(r.dividendYield)*100:null,beta:E(l.beta)??E(r.beta),bookValue:E(l.bookValue),nextEarningsDate:f,nextEarningsEstimate:E(c.earningsAverage),lastEpsActual:d?E(d.epsActual):null,lastEpsEstimate:d?E(d.epsEstimate):null,lastEpsSurprisePct:d&&E(d.surprisePercent)!=null?E(d.surprisePercent)*100:null,lastEpsPeriod:(d==null?void 0:d.period)||null,lastEpsQuarter:((S=d==null?void 0:d.quarter)==null?void 0:S.fmt)||null}}async function Wl(){try{await fetch("https://guce.yahoo.com/consent?brandType=nonEu",{mode:"cors",credentials:"include",redirect:"follow"})}catch{}for(const e of sa)try{const t=await fetch(`${e}/v1/test/getcrumb`,{mode:"cors",credentials:"include"});if(!t.ok)continue;const a=(await t.text()).trim();if(a&&a.length<80&&!a.includes("{"))return{ok:!0,crumb:a,host:e}}catch{}return{ok:!1,crumb:"",host:sa[0]}}async function Fl(e){const t=await Wl();if(t.ok){const l=`/v10/finance/quoteSummary/${encodeURIComponent(e)}?modules=${In}&crumb=${encodeURIComponent(t.crumb)}`;try{const o=await fetch(`${t.host}${l}`,{mode:"cors",credentials:"include",headers:{Accept:"application/json"}});if(o.ok){const c=await o.json(),u=Oa(c);if(u)return{ok:!0,data:u,via:"yahoo-crumb"}}}catch{}}const a=`/v10/finance/quoteSummary/${encodeURIComponent(e)}?modules=${In}`,i=await Ra(a);if(i.ok){const l=Oa(i.data);if(l)return{ok:!0,data:l,via:`yahoo-${i.via}`}}const r=await Vl(e);return r.ok?r:{ok:!1,data:null,via:null,error:i.error||"quoteSummary unavailable"}}async function Vl(e){const t=[`https://finance.yahoo.com/quote/${encodeURIComponent(e)}/`,`${ve}https://finance.yahoo.com/quote/${encodeURIComponent(e)}/`];for(const a of t)try{const i=await ia(a,{timeoutMs:2e4});if(/AbuseAlleviation|Invalid Crumb|AuthenticationRequired/i.test(i)&&i.length<2e3)continue;const r=[...i.matchAll(/<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/gi)];for(const o of r)try{const c=JSON.parse(o[1]),u=typeof(c==null?void 0:c.body)=="string"?JSON.parse(c.body):(c==null?void 0:c.body)||c,d=Oa(u);if(d!=null&&d.business||(d==null?void 0:d.pe)!=null||(d==null?void 0:d.marketCap)!=null)return{ok:!0,data:d,via:a.startsWith(ve)?"yahoo-html-jina":"yahoo-html"}}catch{}const l=i.match(/\\"longBusinessSummary\\":\\"(.*?)\\"/);if(l)return{ok:!0,data:{business:l[1].replace(/\\n/g," ").replace(/\\"/g,'"').replace(/\\\\/g,"\\").slice(0,800)},via:"yahoo-html-partial"}}catch{}return{ok:!1,data:null,via:null}}async function Gs(){return be||wt||(wt=(async()=>{try{const e=await fetch(El,{cache:"no-cache"});if(!e.ok)throw new Error(`HTTP ${e.status}`);be=await e.json()}catch{be={mag7:[],watchlistHot:[]}}return be})(),wt)}async function Gl(){return ke||xt||(xt=(async()=>{try{const e=await fetch(Dl,{cache:"no-cache"});if(!e.ok)throw new Error(`HTTP ${e.status}`);ke=await e.json()}catch{ke={tw:{},us:{}}}return ke})(),xt)}function Ks({market:e,symbol:t,profiles:a,secProfile:i}={}){var f,h;const r=a||{tw:{},us:{}};if(e==="TW"){const g=String(t||"").replace(/\.(TW|TWO)$/i,""),m=(f=r.tw)==null?void 0:f[g];return m?m.biz?{text:String(m.biz),industry:m.ind||null,srcKey:"lookupBizSrcMops",srcUrl:Fs}:m.n||m.f?{text:s("lookupBizTwBasics",{n:m.n||m.f,f:m.f||m.n,mk:m.mk||"",ind:m.ind||"—"}),industry:m.ind||null,srcKey:"lookupBizSrcTwOpenApi",srcUrl:zl}:null:null}const l=String(t||"").toUpperCase().replace(/\./g,"-"),o=(h=r.us)==null?void 0:h[l],c=(o==null?void 0:o.sicDesc)||(i==null?void 0:i.sicDescription)||null,u=(o==null?void 0:o.sic)||(i==null?void 0:i.sic)||null;if(!c)return null;const d=(o==null?void 0:o.cik)||(i==null?void 0:i.cik)||null,p=(o==null?void 0:o.ex)||(i==null?void 0:i.exchanges)||"";return{text:s("lookupBizUsSic",{desc:c,sic:u||"—",ex:p?` · ${p}`:""}),industry:c,srcKey:"lookupBizSrcSec",srcUrl:d?`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${encodeURIComponent(d)}&type=&dateb=&owner=include&count=40`:`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${encodeURIComponent(l)}&type=&dateb=&owner=include&count=40`}}function Kl(e){const t=be;if(!t)return null;const a=String(e||"").replace(/\.TW$/i,"").replace(/\.TWO$/i,"").toUpperCase();return[...t.mag7||[],...t.watchlistHot||[]].find(r=>String(r.ticker||"").toUpperCase()===a)||null}function He(e){const t=String(e??"").replace(/\D/g,"");return t?t.padStart(10,"0").slice(-10):null}function Yl(e,t,a){const i=String(e??"").replace(/^0+/,"")||String(e??"").replace(/\D/g,""),r=String(t||"").replace(/-/g,""),l=String(a||"").trim();return!i||!r||!l?null:`https://www.sec.gov/Archives/edgar/data/${i}/${r}/${l}`}function Ba({market:e,symbol:t,display:a,website:i,cik:r}={}){const l=e==="TW"?"TW":"US",o=String(t||"").toUpperCase(),c=String(a||o.replace(/\.(TW|TWO)$/i,"")).replace(/\D/g,"").slice(0,6),u=[],p=new Date().getFullYear()-1911;if(l==="US"){const f=o.replace(/-/,"."),h=He(r),g=h?String(Number(h)):null;u.push({kind:"official",id:"sec-edgar-search",labelKey:"lookupSecEdgarSearch",href:`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${encodeURIComponent(f)}&type=&dateb=&owner=include&count=40`}),g&&u.push({kind:"official",id:"sec-edgar-browse",labelKey:"lookupSecEdgarBrowse",href:`https://www.sec.gov/edgar/browse/?CIK=${encodeURIComponent(g)}`}),u.push({kind:"official",id:"sec-forms-filter",labelKey:"lookupSecFormsFilter",href:`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${encodeURIComponent(h||f)}&type=10-&dateb=&owner=include&count=40`})}else c?(u.push({kind:"official",id:"mops-financial-book",labelKey:"lookupMopsFinancialBook",href:`https://mops.twse.com.tw/server-java/t57sb01?step=1&colorchg=1&co_id=${encodeURIComponent(c)}&year=${p}&season=&mtype=A`}),u.push({kind:"official",id:"mops-financial-query",labelKey:"lookupMopsFinancialQuery",href:"https://mops.twse.com.tw/mops/web/t57sb01_q1"}),u.push({kind:"official",id:"mops-company",labelKey:"lookupMopsCompany",href:`https://mops.twse.com.tw/mops/web/t05st01?co_id=${encodeURIComponent(c)}`}),u.push({kind:"official",id:"mops-material",labelKey:"lookupMopsMaterial",href:`https://mops.twse.com.tw/mops/web/t05st02?co_id=${encodeURIComponent(c)}`}),u.push({kind:"official",id:"twse-isin",labelKey:"lookupTwseIsin",href:`https://isin.twse.com.tw/isin/basic_search.jsp?code=${encodeURIComponent(c)}`}),/\.TWO$/i.test(o)&&u.push({kind:"official",id:"tpex-company",labelKey:"lookupTpexCompany",href:`https://www.tpex.org.tw/zh-tw/mainboard/listed/company-detail.html?stkno=${encodeURIComponent(c)}`})):u.push({kind:"official",id:"mops-home",labelKey:"lookupMopsFinancialQuery",href:"https://mops.twse.com.tw/mops/web/t57sb01_q1"}),o&&u.push({kind:"quote",id:"yahoo-tw",labelKey:"lookupYahooTwQuote",href:`https://tw.stock.yahoo.com/quote/${encodeURIComponent(o)}`});return i&&/^https?:\/\//i.test(String(i))&&u.push({kind:"company",id:"company-website",labelKey:"lookupCompanyWebsite",href:String(i).trim()}),{market:l,links:u,code:c||null,cik:He(r)}}async function nn(e,{timeoutMs:t=18e3,directFallback:a=!0}={}){const i=[];for(const r of a?[`${ve}${e}`,e]:[`${ve}${e}`])try{const l=await ia(r,{timeoutMs:t}),o=at(l);if(o)return{ok:!0,data:o,via:r.startsWith(ve)?"jina":"direct"};i.push(`${r.startsWith(ve)?"jina":"direct"}: non-json`)}catch(l){i.push(`${r.startsWith(ve)?"jina":"direct"}: ${l.message||l}`)}return{ok:!1,data:null,via:null,error:i.slice(0,3).join(" · ")}}async function Zl(){return tt||Pt||(Pt=(async()=>{const e=await nn(Nl,{timeoutMs:22e3,directFallback:!1}),t=new Map;if(e.ok&&e.data&&typeof e.data=="object")for(const a of Object.values(e.data)){const i=String((a==null?void 0:a.ticker)||"").toUpperCase(),r=He(a==null?void 0:a.cik_str);i&&r&&t.set(i,r)}return tt={map:t,via:e.via,ok:e.ok,error:e.error||null},tt})(),Pt)}function Jl(e,t){var r,l;const a=(r=e==null?void 0:e.hits)==null?void 0:r.hits;if(!Array.isArray(a))return null;const i=String(t||"").toUpperCase();for(const o of a)if(String(((l=o==null?void 0:o._source)==null?void 0:l.tickers)||"").toUpperCase().split(/[\s,]+/).filter(Boolean).map(u=>u.replace(/\./g,"-")).includes(i)){const u=He(o==null?void 0:o._id);if(u)return u}return null}const La=new Map;async function Xl(e){if(La.has(e))return La.get(e);const t=nn(ql(e),{timeoutMs:12e3,directFallback:!1}).then(a=>a.ok?Jl(a.data,e):null);return La.set(e,t),t}async function Ql(e){const t=String(e||"").toUpperCase().replace(/\./g,"-");if(!t)return{ok:!1,cik:null};if(!tt)try{const r=await Xl(t);if(r)return{ok:!0,cik:r,via:"edgar-search",error:null}}catch{}const a=await Zl(),i=a.map.get(t)||null;return{ok:!!i,cik:i,via:a.via,error:i?null:a.error||"cik_not_found"}}function eo(e,{limit:t=Ol}={}){var l,o,c,u,d,p;const a=(l=e==null?void 0:e.filings)==null?void 0:l.recent;if(!a||!Array.isArray(a.form))return[];const i=He(e.cik),r=[];for(let f=0;f<a.form.length&&r.length<t;f++){const h=String(a.form[f]||"");if(!Rl.test(h))continue;const g=((o=a.accessionNumber)==null?void 0:o[f])||null,m=((c=a.primaryDocument)==null?void 0:c[f])||null,v=((u=a.filingDate)==null?void 0:u[f])||null,S=((d=a.primaryDocDescription)==null?void 0:d[f])||((p=a.items)==null?void 0:p[f])||h,x=Yl(i,g,m);x&&r.push({form:h,filingDate:v,description:String(S||h).slice(0,160),accessionNumber:g,href:x})}return r}async function to(e){var l,o,c,u,d;const t=He(e);if(!t)return{ok:!1,filings:[],companyName:null,investorWebsite:null,error:"no_cik"};const a=await nn(Ml(t),{timeoutMs:22e3});if(!a.ok)return{ok:!1,filings:[],companyName:null,investorWebsite:null,error:a.error};const i=eo(a.data),r=(l=a.data)!=null&&l.investorWebsite&&/^https?:\/\//i.test(a.data.investorWebsite)?a.data.investorWebsite:null;return{ok:!0,filings:i,companyName:((o=a.data)==null?void 0:o.name)||null,investorWebsite:r,sic:(c=a.data)!=null&&c.sic?String(a.data.sic):null,sicDescription:((u=a.data)==null?void 0:u.sicDescription)||null,exchanges:Array.isArray((d=a.data)==null?void 0:d.exchanges)?a.data.exchanges.filter(Boolean).join("/"):null,via:a.via}}async function ao({market:e,symbol:t,display:a,website:i}={}){const r=Ba({market:e,symbol:t,display:a,website:i,cik:null}),l={market:r.market,links:r.links,recent:[],cik:null,status:"links_only",noteKey:null,sources:[]};if(r.market==="TW")return l.status="links_ready",l.noteKey="lookupFilingsTwNote",l.sources.push("MOPS"),l;const o=String(t||"").toUpperCase();try{const c=await Ql(o);if(c.ok){l.cik=c.cik,l.links=Ba({market:"US",symbol:t,display:a,website:i,cik:c.cik}).links,c.via&&l.sources.push(`SEC ticker map (${c.via})`);const u=await to(c.cik);u.ok?(l.recent=u.filings,l.status=u.filings.length?"filings_ok":"filings_empty",l.noteKey=u.filings.length?null:"lookupFilingsListEmpty",u.via&&l.sources.push(`SEC submissions (${u.via})`),u.sicDescription&&(l.secProfile={cik:c.cik,sic:u.sic,sicDescription:u.sicDescription,exchanges:u.exchanges}),u.investorWebsite&&(l.links.some(p=>p.href===u.investorWebsite)||l.links.push({kind:"company",id:"sec-investor-site",labelKey:"lookupInvestorRelations",href:u.investorWebsite}))):(l.status="filings_unavailable",l.noteKey="lookupFilingsListUnavailable")}else l.status="cik_unavailable",l.noteKey="lookupFilingsCikUnavailable"}catch{l.status="filings_unavailable",l.noteKey="lookupFilingsListUnavailable"}return l}function no({market:e,symbol:t,chart:a,search:i,summary:r,digest:l}){var p,f,h,g;const o=(r==null?void 0:r.currency)||(a==null?void 0:a.currency)||(e==="TW"?"TWD":"USD"),c=(r==null?void 0:r.name)||(a==null?void 0:a.longName)||(a==null?void 0:a.shortName)||(i==null?void 0:i.longName)||(i==null?void 0:i.shortName)||(l==null?void 0:l.name)||t,u=(r==null?void 0:r.business)||(l!=null&&l.whatItDoes?String(l.whatItDoes):null)||null;return{market:e,symbol:t,name:c,business:u,sector:(r==null?void 0:r.sector)||(i==null?void 0:i.sector)||null,industry:(r==null?void 0:r.industry)||(i==null?void 0:i.industry)||null,exchange:(a==null?void 0:a.exchange)||(i==null?void 0:i.exchange)||null,currency:o,price:(a==null?void 0:a.price)??null,change:(a==null?void 0:a.change)??null,changePct:(a==null?void 0:a.changePct)??null,previousClose:(a==null?void 0:a.previousClose)??null,volume:(a==null?void 0:a.volume)??null,dayHigh:(a==null?void 0:a.dayHigh)??null,dayLow:(a==null?void 0:a.dayLow)??null,fiftyTwoWeekHigh:(a==null?void 0:a.fiftyTwoWeekHigh)??null,fiftyTwoWeekLow:(a==null?void 0:a.fiftyTwoWeekLow)??null,marketTime:(a==null?void 0:a.marketTime)??null,pe:(r==null?void 0:r.pe)??(l==null?void 0:l.pe)??null,forwardPe:(r==null?void 0:r.forwardPe)??(l==null?void 0:l.forwardPe)??null,marketCap:(r==null?void 0:r.marketCap)??(l==null?void 0:l.marketCap)??null,epsTrailing:(r==null?void 0:r.epsTrailing)??null,revenue:(r==null?void 0:r.revenue)??null,revenueGrowth:(r==null?void 0:r.revenueGrowth)??(l==null?void 0:l.revenueYoYPct)??null,earningsGrowth:(r==null?void 0:r.earningsGrowth)??(l==null?void 0:l.epsYoYPct)??null,profitMargins:(r==null?void 0:r.profitMargins)??null,grossMargins:(r==null?void 0:r.grossMargins)??null,dividendYield:(r==null?void 0:r.dividendYield)??null,beta:(r==null?void 0:r.beta)??null,nextEarningsDate:(r==null?void 0:r.nextEarningsDate)??(l==null?void 0:l.nextEarningsDate)??null,nextEarningsEstimate:(r==null?void 0:r.nextEarningsEstimate)??(l==null?void 0:l.consensusEpsNext)??null,lastEpsActual:(r==null?void 0:r.lastEpsActual)??((p=l==null?void 0:l.lastReport)==null?void 0:p.epsActual)??null,lastEpsEstimate:(r==null?void 0:r.lastEpsEstimate)??((f=l==null?void 0:l.lastReport)==null?void 0:f.epsEstimate)??null,lastEpsSurprisePct:(r==null?void 0:r.lastEpsSurprisePct)??((h=l==null?void 0:l.lastReport)==null?void 0:h.epsSurprisePct)??null,lastEpsQuarter:(r==null?void 0:r.lastEpsQuarter)??((g=l==null?void 0:l.lastReport)==null?void 0:g.quarter)??null,website:(r==null?void 0:r.website)||null,sources:[],filings:null}}function so(e,{profiles:t=ke,digest:a=be}={}){var m,v,S,x,L;if(!(e!=null&&e.ok))return null;const i=e.market;let r=e.symbol,l=null,o=!1;if(i==="TW"){const N=(m=t==null?void 0:t.tw)==null?void 0:m[e.display];N&&(o=!0,l=N.n||N.f||null,N.mk==="上櫃"&&e.alt&&(r=e.alt))}const c=i==="US"?io(a,r):null;c&&(o=!0,l=l||c.name||null);const u=Ks({market:i,symbol:r,profiles:t,secProfile:null});u&&(o=!0);const d=(u==null?void 0:u.text)||(c!=null&&c.whatItDoes?String(c.whatItDoes):null),p=u?{key:u.srcKey,url:u.srcUrl}:c!=null&&c.whatItDoes?{key:"lookupBizSrcDigest",url:null}:null,f=i==="TW"&&((S=(v=t==null?void 0:t.tw)==null?void 0:v[e.display])==null?void 0:S.web)||null,h=Ba({market:i,symbol:r,display:e.display,website:f,cik:null}).links,g=c?{nextEarningsDate:c.nextEarningsDate||null,nextIsEstimate:!!c.nextEarningsDateIsEstimate,lastEpsActual:((x=c.lastReport)==null?void 0:x.epsActual)??null,nextEpsConsensus:c.consensusEpsNext??null,lastEpsQuarter:((L=c.lastReport)==null?void 0:L.quarter)||null,asOf:(a==null?void 0:a.asOf)||null}:null;return{market:i,symbol:r,display:e.display,name:l,known:o,business:d,businessSource:p,links:h,earnings:g}}function io(e,t){if(!e)return null;const a=String(t||"").replace(/\.TWO?$/i,"").toUpperCase();return[...e.mag7||[],...e.watchlistHot||[]].find(r=>String(r.ticker||"").toUpperCase()===a)||null}async function ro(e,t="US"){const a=Ul(e,t);if(!a.ok)return{ok:!1,error:a.error||"invalid",snapshot:null};await Promise.all([Gs(),Gl()]);const i=[a.symbol];a.alt&&i.push(a.alt);let r=null,l=a.symbol,o=null,c=null,u=!1;for(const x of i){const L=await Ra(`/v8/finance/chart/${encodeURIComponent(x)}?interval=1d&range=5d&includePrePost=false`);if((L.ok||L.answered)&&(u=!0),L.ok){if(r=Il(L.data),(r==null?void 0:r.price)!=null||r!=null&&r.longName||r!=null&&r.shortName){l=x,o=L.via;break}r=null}else c=L.error}if(!r&&!u)return{ok:!1,error:"unreachable",detail:c,snapshot:null,offline:so(a),symbol:a.symbol,market:a.market};if(!r)return{ok:!1,error:"not_found",detail:c,snapshot:null,symbol:l,market:a.market};const d=encodeURIComponent(a.display||l),p=await Ra(`/v1/finance/search?q=${d}&quotesCount=8&newsCount=0&listsCount=0`),f=p.ok?_l(p.data,l):null,h=await Fl(l),g=Kl(l),m=no({market:a.market,symbol:l,chart:r,search:f,summary:h.data,digest:g}),v=[];o&&v.push(`Yahoo chart (${o})`),p.ok&&v.push(`Yahoo search (${p.via})`),h.ok&&v.push(`Yahoo quoteSummary (${h.via})`),g&&v.push("site earnings-digest");const S=await ao({market:a.market,symbol:l,display:a.display,website:m.website});if(m.filings=S,Array.isArray(S==null?void 0:S.sources))for(const x of S.sources)v.push(x);if(!m.business){const x=Ks({market:a.market,symbol:l,profiles:ke,secProfile:(S==null?void 0:S.secProfile)||null});x&&(m.business=x.text,m.businessSource={key:x.srcKey,url:x.srcUrl},!m.industry&&x.industry&&(m.industry=x.industry),v.push(s(x.srcKey)))}return m.sources=v,{ok:!0,snapshot:m,market:a.market,symbol:l,partial:!h.ok}}function q(e,t){return t?`<div class="lk-metric">
    <div class="lk-ml">${n(e)}</div>
    <div class="lk-mv">${t}</div>
  </div>`:""}function M(e){return e==null||e===""?null:`<span class="lk-mono">${n(String(e))}</span>`}function lo(e){return e==="official"?`<span class="lk-src-badge lk-src-official">${n(s("lookupSourceOfficial"))}</span>`:e==="quote"?`<span class="lk-src-badge lk-src-quote">${n(s("lookupSourceQuote"))}</span>`:e==="company"?`<span class="lk-src-badge lk-src-company">${n(s("lookupSourceCompany"))}</span>`:""}function Ys(e){if(!e||!Array.isArray(e.links)||!e.links.length)return"";const t=e.links.map(r=>{if(!(r!=null&&r.href))return"";const l=s(r.labelKey||"lookupOfficialFilings");return`<li class="lk-ofil-item">
        ${lo(r.kind)}
        <a class="lk-ofil-link" href="${n(r.href)}" target="_blank" rel="noopener noreferrer">${n(l)}</a>
      </li>`}).filter(Boolean).join("");let a="";if(e.market==="US")if(Array.isArray(e.recent)&&e.recent.length){const r=e.recent.map(l=>{const o=l.description||l.form||"";return`<tr>
            <td class="lk-ofil-form"><span class="lk-mono">${n(l.form||"")}</span></td>
            <td class="lk-ofil-date">${n(l.filingDate||"—")}</td>
            <td class="lk-ofil-title"><a href="${n(l.href)}" target="_blank" rel="noopener noreferrer">${n(o)}</a></td>
          </tr>`}).join("");a=`
        <h5 class="lk-h5">${n(s("lookupRecentFilings"))}</h5>
        <div class="lk-ofil-table-wrap">
          <table class="lk-ofil-table">
            <thead><tr>
              <th>${n(s("lookupFilingForm"))}</th>
              <th>${n(s("lookupFilingDate"))}</th>
              <th>${n(s("lookupFilingDoc"))}</th>
            </tr></thead>
            <tbody>${r}</tbody>
          </table>
        </div>`}else{const r=e.noteKey?s(e.noteKey):s("lookupFilingsListUnavailable");a=`<p class="lk-ofil-note">${n(r)}</p>
        <p class="lk-ofil-note">${n(s("lookupFilingsLinksStillWork"))}</p>`}else if(e.market==="TW"){const r=e.noteKey?s(e.noteKey):s("lookupFilingsTwNote");a=`<p class="lk-ofil-note">${n(r)}</p>`}const i=e.cik?`<p class="lk-ofil-meta">${n(s("lookupCikLabel"))}: <span class="lk-mono">${n(e.cik)}</span></p>`:"";return`
    <section class="lk-block lk-ofil" aria-label="${n(s("lookupOfficialFilings"))}">
      <h4 class="lk-h4">${n(s("lookupOfficialFilings"))}</h4>
      <p class="lk-ofil-lead">${n(s("lookupOfficialFilingsLead"))}</p>
      ${i}
      <ul class="lk-ofil-links">${t}</ul>
      ${a}
    </section>`}function oo(e,t){var p;const a=t.offline,i=f=>{if(!f)return"";try{return new Intl.DateTimeFormat("zh-TW",{timeZone:"Asia/Taipei",month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit",hour12:!1}).format(new Date(f))}catch{return""}},r=a?`<span class="lk-badge ${a.market==="TW"?"lk-badge-tw":"lk-badge-us"}">${n(s(a.market==="TW"?"twStock":"usStock"))}</span>`:"",l=a!=null&&a.businessSource?a.businessSource.url?`<p class="lk-muted">${n(s("lookupBizSourceLabel"))}<a href="${n(a.businessSource.url)}" target="_blank" rel="noopener noreferrer">${n(s(a.businessSource.key))}</a></p>`:`<p class="lk-muted">${n(s("lookupBizSourceLabel"))}${n(s(a.businessSource.key,{at:i((p=a.earnings)==null?void 0:p.asOf)}))}</p>`:"",o=a!=null&&a.business?`<section class="lk-block" aria-label="${n(s("lookupBusiness"))}">
        <h4 class="lk-h4">${n(s("lookupBusiness"))}</h4>
        <p class="lk-biz">${n(a.business.length>520?`${a.business.slice(0,520)}…`:a.business)}</p>${l}
      </section>`:"",c=a==null?void 0:a.earnings,u=c&&(c.nextEarningsDate||c.lastEpsActual!=null)?`<section class="lk-block" aria-label="${n(s("lookupEarnings"))}">
        <h4 class="lk-h4">${n(s("lookupEarnings"))}</h4>
        <div class="lk-metrics">
          ${q(s("earningsNextDate"),M(c.nextEarningsDate?`${c.nextEarningsDate}${c.nextIsEstimate?s("lookupEstSuffix"):""}`:null))}
          ${q(s("earningsLastEps"),c.lastEpsActual!=null?M(`${G(c.lastEpsActual,2)}${c.lastEpsQuarter?` · ${c.lastEpsQuarter}`:""}`):null)}
          ${q(s("lookupEpsConsensus"),c.nextEpsConsensus!=null?M(G(c.nextEpsConsensus,2)):null)}
        </div>
        ${c.asOf?`<p class="lk-muted">${n(s("lookupOfflineDigestAsOf",{at:i(c.asOf)}))}</p>`:""}
      </section>`:"",d=a?Ys({market:a.market,links:a.links,recent:[],noteKey:a.market==="TW"?"lookupFilingsTwNote":"lookupOfflineFilingsNote"}):"";e.innerHTML=`
    <div class="lk-unreach" role="alert">
      <p class="lk-unreach-title">${n(s("lookupUnreachTitle"))}</p>
      <p class="lk-unreach-body">${n(s("lookupUnreachBody"))}</p>
      <button type="button" class="lk-retry" data-lk-retry>${n(s("lookupRetry"))}</button>
    </div>
    ${a?`<article class="lk-card lk-card-offline" data-symbol="${n(a.symbol)}">
      <header class="lk-card-head">
        <div>
          <div class="lk-sym-row">
            <span class="lk-symbol">${n(a.market==="TW"?a.display:a.symbol)}</span>
            ${r}
            <span class="lk-offline-tag">${n(s("lookupOfflineTag"))}</span>
          </div>
          ${a.name?`<h3 class="lk-name">${n(a.name)}</h3>`:""}
          ${a.known?"":`<p class="lk-meta-line">${n(s("lookupOfflineUnknown"))}</p>`}
        </div>
      </header>
      ${o}
      ${u}
      ${d}
      <p class="lk-disclaimer" role="note">${n(s("lookupDisclaimer"))}</p>
    </article>`:""}`}function Fn(e,t){if((t==null?void 0:t.error)==="unreachable"){oo(e,t);return}if(!(t!=null&&t.ok)||!t.snapshot){const p=(t==null?void 0:t.error)==="empty"?s("lookupEmptyInput"):(t==null?void 0:t.error)==="invalid"?s("lookupInvalid"):(t==null?void 0:t.error)==="not_found"?s("lookupNotFound"):s("lookupError",{msg:(t==null?void 0:t.detail)||(t==null?void 0:t.error)||"error"});e.innerHTML=`<div class="lk-empty" role="status">${n(p)}</div>`;return}const a=t.snapshot,i=Hl(a.changePct??a.change),r=a.market==="TW"?`<span class="lk-badge lk-badge-tw">${n(s("twStock"))}</span>`:`<span class="lk-badge lk-badge-us">${n(s("usStock"))}</span>`,l=a.businessSource?`<p class="lk-muted">${n(s("lookupBizSourceLabel"))}<a href="${n(a.businessSource.url)}" target="_blank" rel="noopener noreferrer">${n(s(a.businessSource.key))}</a></p>`:"",o=a.business?`<p class="lk-biz">${n(a.business.length>520?`${a.business.slice(0,520)}…`:a.business)}</p>${l}`:"",c=a.market==="TW"?Fs:`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${encodeURIComponent(a.symbol)}&type=&dateb=&owner=include&count=40`,u=`<p class="lk-muted">${n(s("lookupBizOfficialOnly"))}<a href="${n(c)}" target="_blank" rel="noopener noreferrer">${n(s(a.market==="TW"?"lookupBizSrcMops":"lookupBizSrcSec"))}</a></p>`,d=Vs(a.marketTime);e.innerHTML=`
    <article class="lk-card" data-symbol="${n(a.symbol)}">
      <header class="lk-card-head">
        <div>
          <div class="lk-sym-row">
            <span class="lk-symbol">${n(a.symbol)}</span>
            ${r}
          </div>
          <h3 class="lk-name">${n(a.name||"")}</h3>
          <p class="lk-meta-line">
            ${a.exchange?n(a.exchange):""}
            ${a.sector?` · ${n(a.sector)}`:""}
            ${a.industry?` · ${n(a.industry)}`:""}
          </p>
        </div>
        <div class="lk-quote ${i}">
          <div class="lk-price">${n($e(a.price,a.currency)||"—")}</div>
          <div class="lk-chg">
            <span>${n($e(a.change,a.currency)||"—")}</span>
            <span>${n(ye(a.changePct)||"—")}</span>
          </div>
          ${d?`<div class="lk-asof">${n(s("dataAsOf"))} ${n(d)}</div>`:""}
        </div>
      </header>

      <section class="lk-block" aria-label="${n(s("lookupBusiness"))}">
        <h4 class="lk-h4">${n(s("lookupBusiness"))}</h4>
        ${o||u}
      </section>

      <section class="lk-block" aria-label="${n(s("lookupQuoteStats"))}">
        <h4 class="lk-h4">${n(s("lookupQuoteStats"))}</h4>
        <div class="lk-metrics">
          ${q(s("lookupPrevClose"),M($e(a.previousClose,a.currency)))}
          ${q(s("lookupVolume"),M(Bl(a.volume)))}
          ${q(s("lookupDayRange"),a.dayLow!=null&&a.dayHigh!=null?M(`${$e(a.dayLow,a.currency)} – ${$e(a.dayHigh,a.currency)}`):null)}
          ${q(s("lookup52w"),a.fiftyTwoWeekLow!=null&&a.fiftyTwoWeekHigh!=null?M(`${$e(a.fiftyTwoWeekLow,a.currency)} – ${$e(a.fiftyTwoWeekHigh,a.currency)}`):null)}
          ${q(s("lookupMarketCap"),M(_n(a.marketCap,a.currency)))}
          ${q(s("earningsPe"),M(G(a.pe,1)))}
          ${q(s("earningsForwardPe"),M(G(a.forwardPe,1)))}
          ${q(s("lookupEps"),M(G(a.epsTrailing,2)))}
          ${q(s("lookupBeta"),M(G(a.beta,2)))}
          ${q(s("lookupDivYield"),M(ye(a.dividendYield,2)))}
        </div>
      </section>

      <section class="lk-block" aria-label="${n(s("lookupFinancials"))}">
        <h4 class="lk-h4">${n(s("lookupFinancials"))}</h4>
        <div class="lk-metrics">
          ${q(s("lookupRevenue"),M(_n(a.revenue,a.currency)))}
          ${q(s("earningsRevYoy"),M(ye(a.revenueGrowth,1)))}
          ${q(s("earningsEpsYoy"),M(ye(a.earningsGrowth,1)))}
          ${q(s("lookupGrossMargin"),M(ye(a.grossMargins,1)))}
          ${q(s("lookupProfitMargin"),M(ye(a.profitMargins,1)))}
        </div>
      </section>

      <section class="lk-block" aria-label="${n(s("lookupEarnings"))}">
        <h4 class="lk-h4">${n(s("lookupEarnings"))}</h4>
        <div class="lk-metrics">
          ${q(s("earningsNextDate"),M(a.nextEarningsDate))}
          ${q(s("lookupEpsConsensus"),M(G(a.nextEarningsEstimate,2)))}
          ${q(s("earningsLastEps"),a.lastEpsActual!=null?M(`${G(a.lastEpsActual,2)}${a.lastEpsQuarter?` · ${a.lastEpsQuarter}`:""}`):null)}
          ${q(s("lookupEpsSurprise"),M(ye(a.lastEpsSurprisePct,1)))}
        </div>
      </section>

      ${Ys(a.filings)}

      <p class="lk-sources">${n(s("lookupSources"))}: ${n((a.sources||[]).join(" · ")||"Yahoo Finance")}</p>
      ${t.partial?`<p class="lk-partial">${n(s("lookupPartial"))}</p>`:""}
      <p class="lk-disclaimer" role="note">${n(s("lookupDisclaimer"))}</p>
    </article>`}function co(){return`
    <section class="section lookup-section" aria-label="${n(s("lookupTitle"))}">
      <header class="view-header">
        <h2 class="view-title">${n(s("lookupTitle"))}</h2>
        <p class="view-lead">${n(s("lookupLead"))}</p>
      </header>
      <p class="lk-disclaimer lk-disclaimer-top" role="note">${n(s("lookupDisclaimer"))}</p>
      <div class="lk-market-tabs" role="tablist" aria-label="${n(s("market"))}">
        <button type="button" class="lk-tab is-active" data-lk-market="US" role="tab" aria-selected="true">${n(s("usStock"))}</button>
        <button type="button" class="lk-tab" data-lk-market="TW" role="tab" aria-selected="false">${n(s("twStock"))}</button>
      </div>
      <form class="lk-form" data-lk-form>
        <label class="lk-label" for="lk-input">${n(s("lookupInputLabel"))}</label>
        <div class="lk-row">
          <input id="lk-input" class="lk-input" name="symbol" type="text" autocomplete="off" spellcheck="false"
            placeholder="${n(s("lookupPlaceholderUs"))}" data-lk-input />
          <button type="submit" class="lk-submit">${n(s("lookupSearch"))}</button>
        </div>
        <p class="lk-hint" data-lk-hint>${n(s("lookupHintUs"))}</p>
      </form>
      <div id="lk-root" class="lk-root" aria-live="polite">
        <p class="lk-muted">${n(s("lookupIdle"))}</p>
      </div>
    </section>`}function uo(e="#lk-root"){const t=typeof e=="string"?document.querySelector(e):e;if(!t)return{ok:!1};const a=t.closest(".lookup-section")||t.parentElement;if(!a||a.dataset.lkBound==="1")return{ok:!0,root:t};a.dataset.lkBound="1";const i=a.querySelector("[data-lk-form]"),r=a.querySelector("[data-lk-input]"),l=a.querySelector("[data-lk-hint]"),o=a.querySelectorAll("[data-lk-market]");let c="US";const u=p=>{c=p==="TW"?"TW":"US",o.forEach(f=>{const h=f.dataset.lkMarket===c;f.classList.toggle("is-active",h),f.setAttribute("aria-selected",h?"true":"false")}),r&&(r.placeholder=s(c==="TW"?"lookupPlaceholderTw":"lookupPlaceholderUs")),l&&(l.textContent=s(c==="TW"?"lookupHintTw":"lookupHintUs"))};o.forEach(p=>{p.addEventListener("click",()=>u(p.dataset.lkMarket))});const d=async()=>{const p=(r==null?void 0:r.value)||"";t.innerHTML=`<p class="lk-loading">${n(s("lookupLoading"))}</p>`;try{const f=await ro(p,c);Fn(t,f)}catch(f){Fn(t,{ok:!1,error:"error",detail:(f==null?void 0:f.message)||String(f)})}};i==null||i.addEventListener("submit",p=>{p.preventDefault(),d()}),t.addEventListener("click",p=>{var f,h;(h=(f=p.target)==null?void 0:f.closest)!=null&&h.call(f,"[data-lk-retry]")&&d()});try{const p=String(location.hash||""),f=p.match(/[?&]q=([^&]+)/i)||p.match(/#(?:lookup|quote)\/([A-Za-z0-9.\-]+)/i);if(f){const h=decodeURIComponent(f[1]);/^\d{4}/.test(h)||/\.TW/i.test(h)?u("TW"):u("US"),r&&(r.value=h),d()}}catch{}return Gs(),{ok:!0,root:t,run:d}}const po="./data/soxl-desk.json";function fo(e){try{return new Date(e).toLocaleString(D(),{timeZone:"Asia/Taipei",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1})+s("taipei")}catch{return e||"—"}}function nt(e,t=2){return e==null||Number.isNaN(e)?null:Number(e).toLocaleString(D(),{minimumFractionDigits:t,maximumFractionDigits:t})}function Ct(e,t=2){return e==null||Number.isNaN(e)?null:`${e>0?"+":""}${Number(e).toFixed(t)}%`}function Lt(e,t=2){return e==null||Number.isNaN(e)?null:`${e>0?"+":(e<0,"")}${nt(e,t)}`}function Ge(e){return e==null||Number.isNaN(e)||e===0?"sx-flat":e>0?"sx-up":"sx-down"}function ho(e){return/overnight|extended|Blue Ocean|盤後|夜盤/i.test(String(e||""))}function go(e,t){var We,ge,Fe;const a=(t==null?void 0:t.quote)||{},i=a.regularClose,r=(i==null?void 0:i.price)!=null&&ho(a.session),l=r?{price:i.price,change:i.change,changePct:i.changePct,session:i.session||s("soxlRegularClose")}:{price:a.price,change:a.change,changePct:a.changePct,session:a.session},o=l.change,c=l.changePct,u=Ge(c??o),d=r?`<p class="sx-regular sx-overnight">${n(s("soxlOvernight"))}: $${n(nt(a.price,2)||"—")}
        <span class="${Ge(a.changePct)}">${n(Lt(a.change,2)||"")} (${n(Ct(a.changePct,2)||"")})</span>
        ${a.session?` · ${n(a.session)}`:""}</p>`:(i==null?void 0:i.price)!=null?`<p class="sx-regular">${n(s("soxlRegularClose"))}: $${n(nt(i.price,2))}
          <span class="${Ge(i.changePct)}">${n(Lt(i.change,2)||"")} (${n(Ct(i.changePct,2)||"")})</span>
          ${i.session?` · ${n(i.session)}`:""}</p>`:"",p=`
    <section class="sx-hero" aria-label="${n(s("soxlHeroLabel"))}">
      <div class="sx-hero-main">
        <div class="sx-symbol-row">
          <span class="sx-symbol">SOXL</span>
          <span class="sx-badge">3×</span>
          <span class="sx-fund">${n((t==null?void 0:t.fundName)||s("soxlFundFallback"))}</span>
        </div>
        <div class="sx-price-row ${u}"${r?"":' data-lq="soxl" data-lq-sym="SOXL"'}>
          <span class="sx-price"${r?"":' data-lq-field="price"'}>$${n(nt(l.price,2)||"—")}</span>
          <span class="sx-chg">${n(Lt(o,2)||"—")}</span>
          <span class="sx-chgp"${r?"":' data-lq-field="dayPct"'}>${n(Ct(c,2)||"—")}</span>
        </div>
        <p class="sx-session">${n(l.session||"")} · ${n(s("dataAsOf"))} ${n(fo(t==null?void 0:t.asOf))}</p>
        ${d}
      </div>
      <div class="sx-hero-side">
        <p class="sx-lev">${n(s("soxlLeverageNote"))}</p>
        <p class="sx-hold-date"><strong>${n(s("soxlHoldingsAsOf"))}</strong> ${n((t==null?void 0:t.holdingsAsOf)||"—")}
          <span class="sx-muted">（${n(s("soxlHoldingsNotSameDay"))}）</span></p>
      </div>
    </section>`,f=Array.isArray(t==null?void 0:t.events)?t.events:[],h=f.length?`<section class="sx-events" aria-label="${n(s("soxlEventsTitle"))}">
        <h3 class="sx-h3">${n(s("soxlEventsTitle"))}</h3>
        <ul class="sx-event-list">
          ${f.map(P=>`<li class="sx-event sx-sev-${n(P.severity||"info")}">
              <div class="sx-event-title">${n(P.title||"")}</div>
              <p class="sx-event-detail">${n(P.detail||"")}</p>
            </li>`).join("")}
        </ul>
      </section>`:"",g=Array.isArray(t==null?void 0:t.news)?t.news:[],m=`
    <section class="sx-news" aria-label="${n(s("soxlNewsTitle"))}">
      <h3 class="sx-h3">${n(s("soxlNewsTitle"))}</h3>
      <div class="sx-news-list">
        ${g.length?g.map(P=>`<a class="sx-news-card" href="${n(P.url||"#")}" target="_blank" rel="noopener noreferrer">
              <div class="sx-news-title">${n(P.title||"")}</div>
              ${P.published?`<div class="sx-news-meta">${n(P.published)}</div>`:""}
              ${P.summary?`<p class="sx-news-sum">${n(P.summary)}</p>`:""}
            </a>`).join(""):`<p class="sx-empty">${n(s("soxlNewsEmpty"))}</p>`}
      </div>
    </section>`,v=Array.isArray(t==null?void 0:t.holdings)?t.holdings:[],S={equity:"soxlTypeEquity",cash_equivalent:"soxlTypeCash",swap:"soxlTypeSwap"},x=P=>s(S[P]||"soxlTypeOther"),L=P=>/^\d{4}-(\d{2})-(\d{2})$/.test(P||"")?`${Number(P.slice(5,7))}/${Number(P.slice(8,10))}`:P||"",N=((We=v.find(P=>P.changePctAsOf))==null?void 0:We.changePctAsOf)||null,A=v.map(P=>{const de=P.instrumentType==="equity",xa=P.ticker||x(P.instrumentType),$t=Ge(P.changePct),vt=Ge(P.contributionPct),$n=Array.isArray(P.reasons)?P.reasons:[],Le=Array.isArray(P.sources)?P.sources:[],vn=de?"—":s("soxlNoDailyMove");return`<tr class="sx-row sx-row-${n(P.instrumentType||"other")}">
        <td class="sx-cell-name">
          <div class="sx-tk">${n(String(xa))}</div>
          <div class="sx-name">${n(P.name||"")}</div>
          ${P.instrumentType&&P.ticker?`<span class="sx-itype">${n(x(P.instrumentType))}</span>`:""}
        </td>
        <td class="sx-num" data-label="${n(s("soxlColWeight"))}">${P.weightPct!=null?n(nt(P.weightPct,2))+"%":"—"}</td>
        <td class="sx-num ${$t}" data-label="${n(s("soxlColReturn"))}">${P.changePct!=null?`${n(Ct(P.changePct,2))}${P.changePctAsOf?`<span class="sx-asof">${n(s("soxlReturnAsOf",{date:L(P.changePctAsOf)}))}</span>`:""}`:`<span class="sx-na">${n(vn)}</span>`}</td>
        <td class="sx-num ${vt}" data-label="${n(s("soxlColContrib"))}" title="${n(s("soxlContributionHint"))}">
          ${P.contributionPct!=null?`${n(Lt(P.contributionPct,3))} <span class="sx-unit">${n(s("soxlPp"))}</span>*`:`<span class="sx-na">${n(vn)}</span>`}
        </td>
        <td class="sx-reasons" data-label="${n(s("soxlColReasons"))}">
          <ul>${$n.map(Pa=>`<li>${n(Pa)}</li>`).join("")}</ul>
          ${Le.length?`<div class="sx-srcs">${Le.slice(0,3).map((Pa,mi)=>`<a href="${n(Pa)}" target="_blank" rel="noopener noreferrer">${n(s("soxlSourceN",{n:String(mi+1)}))}</a>`).join(" · ")}</div>`:""}
        </td>
      </tr>`}).join(""),C=t!=null&&t.holdingsAsOf?s("soxlHoldingsLeadDated",{date:t.holdingsAsOf,day:N||"—"}):s("soxlHoldingsLead"),b=((ge=t==null?void 0:t.holdingsSource)==null?void 0:ge.index_url)||((Fe=t==null?void 0:t.holdingsSource)==null?void 0:Fe.url),$=`
    <section class="sx-holdings" aria-label="${n(s("soxlHoldingsTitle"))}">
      <h3 class="sx-h3">${n(s("soxlHoldingsTitle"))}</h3>
      <p class="sx-panel-lead">${n(C)}${b?` <a href="${n(b)}" target="_blank" rel="noopener noreferrer">SEC N-PORT</a>`:""}</p>
      <div class="sx-table-wrap">
        <table class="sx-table">
          <caption class="sx-sr-only">${n(s("soxlHoldingsTitle"))}</caption>
          <thead>
            <tr>
              <th scope="col">${n(s("soxlColName"))}</th>
              <th scope="col">${n(s("soxlColWeight"))}</th>
              <th scope="col">${n(s("soxlColReturn"))}</th>
              <th scope="col">${n(s("soxlColContrib"))}</th>
              <th scope="col">${n(s("soxlColReasons"))}</th>
            </tr>
          </thead>
          <tbody>${A||`<tr><td colspan="5">${n(s("soxlHoldingsEmpty"))}</td></tr>`}</tbody>
        </table>
      </div>
      <p class="sx-footnote">* ${n(s("soxlContributionHint"))}</p>
    </section>`,w=Array.isArray(t==null?void 0:t.overallUpReasons)?t.overallUpReasons:[],j=Array.isArray(t==null?void 0:t.overallDownReasons)?t.overallDownReasons:[],B=`
    <section class="sx-overall" aria-label="${n(s("soxlOverallTitle"))}">
      <h3 class="sx-h3">${n(s("soxlOverallTitle"))}</h3>
      <div class="sx-overall-grid">
        <article class="sx-card sx-card-up">
          <h4>${n(s("soxlWhyUp"))}</h4>
          <ul>${w.map(P=>`<li>${n(P)}</li>`).join("")||`<li>${n(s("earningsDataMissing"))}</li>`}</ul>
        </article>
        <article class="sx-card sx-card-down">
          <h4>${n(s("soxlWhyDown"))}</h4>
          <ul>${j.map(P=>`<li>${n(P)}</li>`).join("")||`<li>${n(s("earningsDataMissing"))}</li>`}</ul>
        </article>
      </div>
    </section>`,I=Array.isArray(t==null?void 0:t.disclaimers)?t.disclaimers:[],yt=I.length?`<ul class="sx-disc-list">${I.map(P=>`<li>${n(P)}</li>`).join("")}</ul>`:`<p>${n(s("soxlDisclaimer"))}</p>`;e.innerHTML=`
    ${p}
    ${h}
    ${m}
    ${$}
    ${B}
    <div class="sx-disclaimer" role="note">${yt}</div>
  `}function mo(){return`
    <section class="section soxl-section" aria-label="${n(s("soxlTitle"))}">
      <header class="view-header">
        <h2 class="view-title">${n(s("soxlTitle"))}</h2>
        <p class="view-lead">${n(s("soxlLead"))}</p>
      </header>
      <p class="sx-disclaimer sx-disclaimer-top" role="note">${n(s("soxlDisclaimer"))}</p>
      <div id="sx-root" class="sx-root">
        <p class="sx-loading">${n(s("loading"))}</p>
      </div>
    </section>`}async function yo(e="#sx-root"){const t=typeof e=="string"?document.querySelector(e):e;if(!t)return{ok:!1};try{const a=await fetch(po);if(!a.ok)throw new Error(`HTTP ${a.status}`);const i=await a.json();return go(t,i),{ok:!0,data:i}}catch(a){return t.innerHTML=`
      <div class="sx-empty" role="status">
        <p>${n(s("soxlLoadError",{msg:a.message||String(a)}))}</p>
      </div>`,{ok:!1,error:a}}}const $o="./data/txf-desk.json";function vo(e){try{return new Date(e).toLocaleString(D(),{timeZone:"Asia/Taipei",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1})+s("taipei")}catch{return e||"—"}}function le(e,t=2){return e==null||Number.isNaN(e)?null:Number(e).toLocaleString(D(),{minimumFractionDigits:t,maximumFractionDigits:t})}function X(e){return e==null||Number.isNaN(e)?null:Number(e).toLocaleString(D(),{maximumFractionDigits:0})}function _t(e,t=2){return e==null||Number.isNaN(e)?null:`${e>0?"+":""}${Number(e).toFixed(t)}%`}function Ha(e,t=2){return e==null||Number.isNaN(e)?null:`${e>0?"+":""}${le(e,t)}`}function fe(e){return e==null||Number.isNaN(e)||e===0?"txf-flat":e>0?"txf-up":"txf-down"}function Ue(e){if(!e)return"—";const t=String(e);return/^\d{6}$/.test(t)?`${t.slice(0,4)}/${t.slice(4,6)}`:t}function bo(e){var l,o,c;const t=(l=e==null?void 0:e.contracts)==null?void 0:l.TX,a=t==null?void 0:t.expiredOnSession,i=(o=e==null?void 0:e.calendar)==null?void 0:o.recentSettlement;if(!(a!=null&&a.month)||!((c=t==null?void 0:t.near)!=null&&c.month))return"";const r=i&&i.deliveryMonth===a.month&&i.finalSettlementPrice>0?le(i.finalSettlementPrice,0):null;return r?`<p class="txf-session txf-expired-note">${n(s("txfExpiredNote",{m:Ue(a.month),d:a.lastTradingDay||i.finalSettlementDay||"—",p:r,n:Ue(t.near.month)}))}</p>`:""}function ko(e){var u;const t=(u=e==null?void 0:e.contracts)==null?void 0:u.TX,a=(t==null?void 0:t.near)||{},i=(e==null?void 0:e.spot)||{},r=(e==null?void 0:e.basis)||{},l=a.change,o=a.changePct,c=fe(o??l);return`
    <section class="txf-hero" aria-label="${n(s("txfHeroLabel"))}">
      <div class="txf-hero-main">
        <div class="txf-symbol-row">
          <span class="txf-symbol">TX</span>
          <span class="txf-badge">${n(s("txfNearBadge"))}</span>
          <span class="txf-fund">${n((t==null?void 0:t.nameZh)||s("txfTitle"))} · ${n(Ue(a.month))}</span>
        </div>
        <div class="txf-price-row ${c}">
          <span class="txf-price">${n(le(a.last,0)||"—")}</span>
          <span class="txf-chg">${n(Ha(l,0)||"—")}</span>
          <span class="txf-chgp">${n(_t(o,2)||"—")}</span>
        </div>
        <p class="txf-session">${n(s("txfSettle"))}: ${n(le(a.settle,0)||"—")}
          · ${n(s("txfVolume"))}: ${n(X(a.volume)||"—")}
          · ${n(s("txfOI"))}: ${n(X(a.openInterest)||"—")}
        </p>
        ${bo(e)}
        <p class="txf-session">${n(s("dataAsOf"))} ${n(vo(e==null?void 0:e.asOf))}
          · ${n(s("txfSessionDate"))}: ${n((e==null?void 0:e.sessionDate)||"—")}</p>
      </div>
      <div class="txf-hero-side">
        <div class="txf-side-row" data-lq-key="tw" data-lq-sym="^TWII">
          <span class="txf-side-label">${n(s("txfSpotLabel"))}</span>
          <span class="txf-side-val ${fe(i.changePct)}" data-lq-field="value">${n(le(i.last,2)||"—")}</span>
          <span class="txf-side-chg ${fe(i.changePct)}">${n(_t(i.changePct,2)||"—")}</span>
        </div>
        <div class="txf-side-row">
          <span class="txf-side-label">${n(s("txfBasisLabel"))}</span>
          <span class="txf-side-val ${fe(r.basisPoints)}">${n(Ha(r.basisPoints,1)||"—")}</span>
          <span class="txf-side-chg ${fe(r.basisPct)}">${n(_t(r.basisPct,3)||"—")}</span>
        </div>
        <p class="txf-side-note">${n(r.noteZh||s("txfBasisHint"))}</p>
        <p class="txf-side-note">${n(s("txfMultiplierShort",{n:String((t==null?void 0:t.multiplierTwdPerPoint)??200)}))}</p>
      </div>
    </section>`}function So(e){const t=[];return e!=null&&e.near&&t.push({tag:s("txfNearBadge"),c:e.near}),e!=null&&e.next&&t.push({tag:s("txfNextBadge"),c:e.next}),t.map(({tag:a,c:i})=>{const r=fe(i.changePct??i.change);return`<tr>
        <td><span class="txf-pill">${n(a)}</span> ${n(Ue(i.month))}</td>
        <td class="txf-num ${r}">${n(le(i.last,0)||"—")}</td>
        <td class="txf-num">${n(le(i.settle,0)||"—")}</td>
        <td class="txf-num ${r}">${n(Ha(i.change,0)||"—")} (${n(_t(i.changePct,2)||"—")})</td>
        <td class="txf-num">${n(X(i.volume)||"—")}</td>
        <td class="txf-num">${n(X(i.openInterest)||"—")}</td>
        <td class="txf-num">${n(i.lastTradingDay||"—")}</td>
      </tr>`}).join("")}function To(e){var i,r,l;const a=[["TX",(i=e==null?void 0:e.contracts)==null?void 0:i.TX],["MTX",(r=e==null?void 0:e.contracts)==null?void 0:r.MTX],["TMF",(l=e==null?void 0:e.contracts)==null?void 0:l.TMF]].filter(([,o])=>o==null?void 0:o.near).map(([o,c])=>{const u=c.margin||{};return`
      <article class="txf-contract-card">
        <header class="txf-contract-head">
          <h4>${n(o)} · ${n(c.nameZh||"")}</h4>
          <p class="txf-muted">${n(s("txfMultLabel"))}: NT$${n(X(c.multiplierTwdPerPoint)||"—")}${n(s("txfPerPoint"))}
            · ${n(s("txfMarginInitial"))}: NT$${n(X(u.initial)||"—")}
            · ${n(s("txfMarginMaint"))}: NT$${n(X(u.maintenance)||"—")}</p>
        </header>
        <div class="txf-table-wrap" role="region" tabindex="0" aria-label="${n(o)} ${n(c.nameZh||"")}">
          <table class="txf-table">
            <thead>
              <tr>
                <th>${n(s("txfColMonth"))}</th>
                <th>${n(s("txfColLast"))}</th>
                <th>${n(s("txfColSettle"))}</th>
                <th>${n(s("txfColChange"))}</th>
                <th>${n(s("txfColVolume"))}</th>
                <th>${n(s("txfColOI"))}</th>
                <th>${n(s("txfColLTD"))}</th>
              </tr>
            </thead>
            <tbody>${So(c)}</tbody>
          </table>
        </div>
      </article>`}).join("");return`
    <section class="txf-panel" aria-label="${n(s("txfContractsTitle"))}">
      <h3 class="txf-h3">${n(s("txfContractsTitle"))}</h3>
      <p class="txf-panel-lead">${n(s("txfContractsLead"))}</p>
      ${a}
    </section>`}function wo(e){const t=e==null?void 0:e.institutional;if(!(t!=null&&t.byContract))return"";const a=["TX","MTX","TMF"].filter(r=>(t.byContract[r]||[]).length);if(!a.length)return"";const i=a.map(r=>{const l=(t.byContract[r]||[]).map(o=>{const c=o.openInterestNet;return`<tr>
            <td>${n(o.partyZh||"—")}</td>
            <td class="txf-num">${n(X(o.openInterestLong)||"—")}</td>
            <td class="txf-num">${n(X(o.openInterestShort)||"—")}</td>
            <td class="txf-num ${fe(c)}">${n(X(c)||"—")}</td>
            <td class="txf-num ${fe(o.tradingVolumeNet)}">${n(X(o.tradingVolumeNet)||"—")}</td>
          </tr>`}).join("");return`
        <article class="txf-inst-card">
          <h4>${n(r)}</h4>
          <div class="txf-table-wrap" role="region" tabindex="0" aria-label="${n(r)}">
            <table class="txf-table">
              <thead>
                <tr>
                  <th>${n(s("txfColParty"))}</th>
                  <th>${n(s("txfColLongOI"))}</th>
                  <th>${n(s("txfColShortOI"))}</th>
                  <th>${n(s("txfColNetOI"))}</th>
                  <th>${n(s("txfColNetVol"))}</th>
                </tr>
              </thead>
              <tbody>${l}</tbody>
            </table>
          </div>
        </article>`}).join("");return`
    <section class="txf-panel" aria-label="${n(s("txfInstTitle"))}">
      <h3 class="txf-h3">${n(s("txfInstTitle"))}</h3>
      <p class="txf-panel-lead">${n(s("txfInstLead",{date:t.asOf||"—"}))}</p>
      <div class="txf-inst-grid">${i}</div>
      <p class="txf-footnote">${n(s("txfInstFoot"))}</p>
    </section>`}function xo(e){const t=(e==null?void 0:e.calendar)||{},a=t.recentSettlement,i=e==null?void 0:e.putCallRatio;return`
    <section class="txf-panel" aria-label="${n(s("txfCalendarTitle"))}">
      <h3 class="txf-h3">${n(s("txfCalendarTitle"))}</h3>
      <div class="txf-cal-grid">
        <article class="txf-cal-card">
          <h4>${n(s("txfNextLTD"))}</h4>
          <p class="txf-cal-big">${n(t.nextNearLastTradingDay||"—")}</p>
          <p class="txf-muted">${n(s("txfNearMonth"))}: ${n(Ue(t.nextNearMonth))}
            · ${n(s("txfNextMonth"))}: ${n(Ue(t.nextNextMonth))}（${n(t.nextNextLastTradingDay||"—")}）</p>
          <p class="txf-muted">${n(t.ruleZh||s("txfLTDRule"))}</p>
        </article>
        <article class="txf-cal-card">
          <h4>${n(s("txfRecentSettle"))}</h4>
          <p class="txf-cal-big">${n(a?le(a.finalSettlementPrice,0):"—")}</p>
          <p class="txf-muted">${n((a==null?void 0:a.finalSettlementDay)||"—")} · ${n((a==null?void 0:a.deliveryMonth)||"")}</p>
          <p class="txf-muted">${n((a==null?void 0:a.contractName)||"")}</p>
        </article>
        ${i?`<article class="txf-cal-card">
          <h4>${n(s("txfPcrTitle"))}</h4>
          <p class="txf-cal-big">${n(le(i.putCallVolumeRatioPct,2)||"—")}%</p>
          <p class="txf-muted">${n(s("txfPcrVol"))}: P ${n(X(i.putVolume)||"—")} / C ${n(X(i.callVolume)||"—")}</p>
          <p class="txf-muted">${n(s("txfPcrOI"))}: ${n(le(i.putCallOIRatioPct,2)||"—")}% · ${n(s("dataAsOf"))} ${n(i.asOf||"—")}</p>
        </article>`:""}
      </div>
    </section>`}function Po(){return`
    <section class="txf-panel" aria-label="${n(s("txfExplainTitle"))}">
      <h3 class="txf-h3">${n(s("txfExplainTitle"))}</h3>
      <ul class="txf-explain">
        <li>${n(s("txfExplain1"))}</li>
        <li>${n(s("txfExplain2"))}</li>
        <li>${n(s("txfExplain3"))}</li>
        <li>${n(s("txfExplain4"))}</li>
      </ul>
    </section>`}function Co(e){const t=Array.isArray(e==null?void 0:e.sourcesDetail)?e.sourcesDetail:[];return t.length?`
    <section class="txf-panel txf-sources" aria-label="${n(s("txfSourcesTitle"))}">
      <h3 class="txf-h3">${n(s("txfSourcesTitle"))}</h3>
      <ul class="txf-src-list">
        ${t.map(a=>`<li><a href="${n(a.url)}" target="_blank" rel="noopener noreferrer">${n(a.label||a.url)}</a></li>`).join("")}
      </ul>
    </section>`:""}function Lo(e,t){const a=Array.isArray(t==null?void 0:t.disclaimers)?t.disclaimers:[],i=a.length?`<ul class="txf-disc-list">${a.map(r=>`<li>${n(r)}</li>`).join("")}</ul>`:`<p>${n(s("txfDisclaimer"))}</p>`;e.innerHTML=`
    ${ko(t)}
    ${To(t)}
    ${wo(t)}
    ${xo(t)}
    ${Po()}
    ${Co(t)}
    <div class="txf-disclaimer" role="note">${i}</div>
  `}function jo(){return`
    <section class="section txf-section" aria-label="${n(s("txfTitle"))}">
      <header class="view-header">
        <h2 class="view-title">${n(s("txfTitle"))}</h2>
        <p class="view-lead">${n(s("txfLead"))}</p>
      </header>
      <p class="txf-disclaimer txf-disclaimer-top" role="note">${n(s("txfDisclaimer"))}</p>
      <div id="txf-root" class="txf-root">
        <p class="txf-loading">${n(s("loading"))}</p>
      </div>
    </section>`}async function Ao(e="#txf-root"){const t=typeof e=="string"?document.querySelector(e):e;if(!t)return{ok:!1};try{const a=await fetch($o);if(!a.ok)throw new Error(`HTTP ${a.status}`);const i=await a.json();return Lo(t,i),{ok:!0,data:i}}catch(a){return t.innerHTML=`
      <div class="txf-empty" role="status">
        <p>${n(s("txfLoadError",{msg:a.message||String(a)}))}</p>
      </div>`,{ok:!1,error:a}}}const Eo=["https://query2.finance.yahoo.com","https://query1.finance.yahoo.com"],Do="https://mis.twse.com.tw/stock/api/getStockInfo.jsp?json=1&delay=0&ex_ch=",zo={tw:"^TWII",spx:"^GSPC",nasdaq:"^IXIC",sox:"^SOX",usdTwd:"USDTWD=X"},No={tw:"tse_t00.tw",otc:"otc_o00.tw"},qo=14,Mo=2e4,Zs=5*6e4;let Wt=null,Vn=!1,ra=new Map,xe=null,Ie=!1,mt=!1,z=null;function Gn(e){if(!e)return null;const t=String(e).trim();if(t.startsWith("{")||t.startsWith("["))try{return JSON.parse(t)}catch{}const a=t.match(/Markdown Content:\s*(\{[\s\S]*|\[[\s\S]*)/i),i=a?a[1].trim():t,r=i.search(/[\{\[]/);if(r<0)return null;const l=i.slice(r);for(let o=l.length;o>2;o--){try{return JSON.parse(l.slice(0,o))}catch{}const c=Math.max(l.lastIndexOf("}",o-2),l.lastIndexOf("]",o-2));if(c<8)break;o=c+2}return null}async function Kn(e,{timeoutMs:t=14e3}={}){const a=typeof AbortController<"u"?new AbortController:null,i=a?setTimeout(()=>a.abort(),t):null;try{const r=await fetch(e,{signal:a==null?void 0:a.signal,headers:{Accept:"application/json,text/plain,*/*"},cache:"no-store"});if(!r.ok)throw new Error(`HTTP ${r.status}`);return await r.text()}finally{i&&clearTimeout(i)}}async function Js(e){const t=[];try{const i=await Kn(e,{timeoutMs:1e4}),r=Gn(i);if(r)return{ok:!0,data:r,via:"direct"};t.push("direct: non-json")}catch(i){t.push(`direct: ${i.message||i}`)}const a=await Ws(e,{fetchText:Kn,parse:Gn,primaryTimeoutMs:2e4});return a.ok?{ok:!0,data:a.data,via:a.via}:(t.push(...a.errors),{ok:!1,data:null,via:null,error:t.slice(0,3).join(" · ")})}function Ro(e){return typeof CSS<"u"&&typeof CSS.escape=="function"?CSS.escape(e):String(e).replace(/\\/g,"\\\\").replace(/"/g,'\\"')}function Oo(e,t){const a=[];for(let i=0;i<e.length;i+=t)a.push(e.slice(i,i+t));return a}function we(e){return e==null||Number.isNaN(e)?"flat":e>0?"up":e<0?"down":"flat"}function oe(e,t=2){return e==null||Number.isNaN(e)?"—":Number(e).toLocaleString(D(),{minimumFractionDigits:t,maximumFractionDigits:t})}function Ce(e,t=2){return e==null||Number.isNaN(e)?"—":`${e>0?"+":""}${Number(e).toFixed(t)}%`}function Yn(e,t){if(e==null||Number.isNaN(e))return"—";const a=t==="TWD"&&e>=100?0:2;return`${t==="USD"?"$":t==="TWD"?"NT$":""}${oe(e,a)}`}function Xs(e,t){return e==null||Number.isNaN(e)?"—":`${t==="USD"?"US$":t==="TWD"?"NT$":""}${oe(e,t==="TWD"?0:2)}`}function Ua(e,t){if(e==null||Number.isNaN(e))return"—";const a=t==="TWD"?0:2,i=t==="USD"?"US$":t==="TWD"?"NT$":"",r=oe(Math.abs(e),a);return r===oe(0,a)?`${i}${r}`:`${e>0?"+":"−"}${i}${r}`}function Bo(e,t){if(e==null||Number.isNaN(e))return"—";const a=t==="TWD"&&e>=100?0:2;return`${t==="USD"?"US$":t==="TWD"?"NT$":""}${oe(e,a)}`}function Qs(e=new Date){const t=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Taipei",year:"numeric",month:"2-digit",day:"2-digit",weekday:"short",hour:"2-digit",minute:"2-digit",hour12:!1}).formatToParts(e),a=i=>{var r;return(r=t.find(l=>l.type===i))==null?void 0:r.value};return{ymd:`${a("year")}-${a("month")}-${a("day")}`,weekday:a("weekday"),hour:Number(a("hour")),minute:Number(a("minute"))}}function Ho(e=Qs()){return!["Sat","Sun"].includes(e.weekday)}function ei(e=new Date){const t=Qs(e),a=t.hour*60+t.minute,i=Ho(t),r=i&&a>=540&&a<=815,l=i&&(a>=1260||a<=315),o=t.weekday==="Sat"&&a<=315,c=t.weekday==="Sun"&&a>=1260;return{twOpen:r,usOpen:l||o||c,weekday:i,parts:t}}function Uo(){const{twOpen:e,usOpen:t}=ei();return e||t?Mo:Zs}function Io(e){try{return new Date(e).toLocaleString(D(),{timeZone:"Asia/Taipei",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1})+s("taipei")}catch{return"—"}}function ti(e){const t=String(e||"").trim().toUpperCase();return t?/^\d{4}\.(TW|TWO)$/.test(t)?t:/^\d{4}$/.test(t)?`${t}.TW`:t.replace(/\./g,"-"):null}function _o(e){const t=String(e||"").toUpperCase(),a=t.match(/^(\d{4})\.(TW|TWO)$/)||t.match(/^(\d{4})$/);if(!a)return null;const i=a[1];return/\.TWO$/.test(t)?`otc_${i}.tw`:`tse_${i}.tw`}function Wo(e,t){!e||(t==null?void 0:t.price)==null||Number.isNaN(t.price)||ra.set(e,{...t,asOfMs:t.asOfMs||Date.now()})}function Fo(e){var i,r;const t=(i=e==null?void 0:e.spark)==null?void 0:i.result;if(!Array.isArray(t))return[];const a=[];for(const l of t){const o=l==null?void 0:l.symbol,c=((r=((l==null?void 0:l.response)||[{}])[0])==null?void 0:r.meta)||{},u=c.regularMarketPrice;if(u==null||Number.isNaN(Number(u)))continue;const d=c.chartPreviousClose??c.previousClose??null;let p=null,f=null;d!=null&&d!==0&&(f=Number(u)-Number(d),p=f/Number(d)*100);const h=typeof c.regularMarketTime=="number"?c.regularMarketTime*(c.regularMarketTime<1e12?1e3:1):Date.now();a.push({symbol:o,price:Number(u),prev:d!=null?Number(d):null,change:f,changePct:p,currency:c.currency||null,asOfMs:h,source:"yahoo-spark"})}return a}async function Vo(e){const t=[...new Set(e.filter(Boolean))];if(!t.length)return{ok:!0,quotes:[],via:null};const a=[];let i=null,r=!1,l=null;for(const o of Oo(t,qo)){const c=`/v7/finance/spark?symbols=${encodeURIComponent(o.join(","))}&range=1d&interval=5m`;let u=null;for(const d of Eo){const p=await Js(`${d}${c}`);if(p.ok){u=p;break}l=p.error}u!=null&&u.ok&&(r=!0,i=u.via,a.push(...Fo(u.data)))}return{ok:r,quotes:a,via:i,error:r?null:l}}function Ke(e){if(e==null||e===""||e==="-"||e==="—"||e==="null")return null;const t=Number(String(e).replace(/,/g,""));return Number.isFinite(t)?t:null}function Go(e){const t=e==null?void 0:e.msgArray;if(!Array.isArray(t))return[];const a=[];for(const i of t){const r=i==null?void 0:i.c;if(!r)continue;const l=Ke(i.z)??Ke(i.pz)??Ke(i.o),o=Ke(i.y);if(l==null)continue;let c=null,u=null;o!=null&&o!==0&&(u=l-o,c=u/o*100);const d=i.ex==="otc"?"otc":"tse";let p;r==="t00"?p="__MIS_TWII":r==="o00"?p="__MIS_OTC":p=`${r}.${d==="otc"?"TWO":"TW"}`;const f=Ke(i.tlong);a.push({symbol:p,price:l,prev:o,change:u,changePct:c,currency:"TWD",asOfMs:f||Date.now(),source:"twse-mis",misCode:r,misEx:d})}return a}async function Ko(e){const t=[...new Set(e.filter(Boolean))];if(!t.length)return{ok:!0,quotes:[],via:null};const a=`${Do}${t.join("|")}`,i=await Js(a);return i.ok?{ok:!0,quotes:Go(i.data),via:i.via}:{ok:!1,quotes:[],via:null,error:i.error}}function Yo(e){const t=new Set(Object.values(zo));t.add("SOXL");const a=new Set(Object.values(No));return e.querySelectorAll("[data-lq-sym]").forEach(i=>{const r=i.getAttribute("data-lq-sym"),l=ti(r);l&&t.add(l);const o=_o(r);o&&a.add(o)}),{yahoo:[...t],mis:[...a]}}function la(e,t){if(!e)return;e.classList.remove("up","down","flat","lk-up","lk-down","lk-flat","sx-up","sx-down","sx-flat");const a=we(t);e.classList.add(a)}function Zo(e){e&&(e.classList.remove("lq-flash"),e.offsetWidth,e.classList.add("lq-flash"),window.setTimeout(()=>{e.classList.remove("lq-flash")},700))}function O(e,t,{flash:a=!1}={}){e&&e.textContent!==t&&(e.textContent=t,a&&Zo(e))}function Jo(e=Date.now()){try{return new Date(e).toLocaleTimeString("en-GB",{timeZone:"Asia/Taipei",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1})}catch{return"—"}}function De(e,t,a,i){const r=e.querySelectorAll(`[data-lq-key="${t}"]`);if(!r.length||!a||a.price==null)return;const l=t==="usdTwd"?3:2;r.forEach(o=>{o.classList.remove("incomplete");const c=o.querySelector("[data-lq-field='value'], .value");O(c,oe(a.price,l),{flash:!0});const u=o.querySelector("[data-lq-field='date']");if(u&&a.asOfMs)try{const p=new Date(a.asOfMs).toLocaleDateString("en-US",{timeZone:"Asia/Taipei",month:"2-digit",day:"2-digit"});u.textContent=p}catch{}let d=o.querySelector("[data-lq-field='dayPct'], .pct");if(t==="usdTwd"){if(d&&i){const p=i.taipeiClose!=null?oe(i.taipeiClose,3):"—";d.className="pct flat",d.style.fontSize="0.7rem",d.textContent=`${s("taipeiClose")} ${p} · Yahoo ${oe(a.price,3)}`}}else a.changePct!=null&&(d||(d=document.createElement("div"),d.className="pct",d.setAttribute("data-lq-field","dayPct"),o.appendChild(d)),d.className=`pct ${we(a.changePct)}`,d.setAttribute("data-lq-field","dayPct"),O(d,Ce(a.changePct),{flash:!0}))})}function Xo(e,t,a){if(!a||a.price==null)return;const i=a.currency||(/\.(TW|TWO)$/i.test(t)?"TWD":"USD");e.querySelectorAll(`[data-lq-sym="${Ro(t)}"]`).forEach(l=>{const o=l.getAttribute("data-lq");if(o==="soxl")return;if(o==="pos"){Qo(l,a,i);return}const c=l.querySelectorAll("[data-lq-field='price']"),u=l.querySelectorAll("[data-lq-field='dayPct']");if(c.length||u.length){c.forEach(f=>O(f,Yn(a.price,i),{flash:!0})),u.forEach(f=>{la(f,a.changePct),O(f,Ce(a.changePct),{flash:!0})});return}const d=l.querySelector(".price"),p=l.querySelector(".day-pct");d&&O(d,Yn(a.price,i),{flash:!0}),p&&(la(p,a.changePct),O(p,Ce(a.changePct),{flash:!0}))})}function Qo(e,t,a){const i=Number(e.getAttribute("data-lq-qty")),r=Number(e.getAttribute("data-lq-avg")),l=e.getAttribute("data-lq-ccy")||a,o=t.price,c=t.changePct,u=e.querySelectorAll("td");if(!(u.length<10)){if(O(u[2],Bo(o,l),{flash:!0}),Number.isFinite(i)){const d=o*i;O(u[3],Xs(d,l));const p=c!=null&&Number.isFinite(c)?o*i*c/100:null;if(u[4].className=`num ${we(p)}`,O(u[4],p==null?"—":Ua(p,l)),Number.isFinite(r)){const f=(o-r)*i,h=r?(o-r)/r*100:0;u[6].className=`num ${we(f)}`,O(u[6],Ua(f,l)),u[7].className=`num ${we(h)}`,O(u[7],Ce(h))}}u[5].className=`num ${we(c)}`,O(u[5],Ce(c),{flash:!0}),e.setAttribute("data-lq-mark",String(o)),c!=null&&e.setAttribute("data-lq-daypct",String(c))}}function ec(e){e.querySelectorAll("[data-lq-book]").forEach(t=>{const a=t.getAttribute("data-lq-book"),i=Number(t.getAttribute("data-lq-cash")),r=Number(t.getAttribute("data-lq-start")),l=t.getAttribute("data-lq-ccy")||(a==="TW"?"TWD":"USD");if(!Number.isFinite(i))return;let o=0;t.querySelectorAll(".pos-row[data-lq-sym]").forEach(m=>{const v=Number(m.getAttribute("data-lq-qty")),S=Number(m.getAttribute("data-lq-mark"));Number.isFinite(v)&&Number.isFinite(S)&&(o+=v*S)});const c=o;t.querySelectorAll(".pos-row[data-lq-sym]").forEach(m=>{const v=Number(m.getAttribute("data-lq-qty")),S=Number(m.getAttribute("data-lq-mark")),x=m.querySelectorAll("td");if(x.length>=11&&Number.isFinite(v)&&Number.isFinite(S)&&c>0){const L=S*v/c*100;O(x[10],`${L.toFixed(2)}%`)}});const u=i+o,d=Number.isFinite(r)?u-r:null,p=Number.isFinite(r)&&r!==0?(u-r)/r*100:null,f=t.querySelector("[data-lq-kpi='equity']"),h=t.querySelector("[data-lq-kpi='pnl']"),g=t.querySelector("[data-lq-kpi='pnlPct']");f&&O(f,Xs(u,l)),h&&d!=null&&(la(h,d),O(h,Ua(d,l))),g&&p!=null&&(la(g,p),O(g,Ce(p)))})}function tc(e,t){if(!t||t.price==null)return;const a=e.querySelector("#sx-root .sx-price"),i=e.querySelector("#sx-root .sx-chg"),r=e.querySelector("#sx-root .sx-chgp"),l=e.querySelector("#sx-root .sx-price-row"),o=e.querySelector("#sx-root .sx-session");if(a&&O(a,`$${oe(t.price,2)}`,{flash:!0}),i)if(t.change==null||Number.isNaN(t.change))O(i,"—");else{const c=t.change>0?"+":"";O(i,`${c}${oe(t.change,2)}`)}if(r&&O(r,Ce(t.changePct),{flash:!0}),l){l.classList.remove("sx-up","sx-down","sx-flat");const c=we(t.changePct??t.change);l.classList.add(c==="up"?"sx-up":c==="down"?"sx-down":"sx-flat")}if(o){const c=Io(t.asOfMs||Date.now());O(o,`live · ${s("dataAsOf")} ${c}`)}}function ac(e,t){const a=ti(t);if(a&&e.has(a))return e.get(a);if(a&&a.endsWith(".TW")){const i=a.replace(/\.TW$/,".TWO");if(e.has(i))return e.get(i)}if(a&&a.endsWith(".TWO")){const i=a.replace(/\.TWO$/,".TW");if(e.has(i))return e.get(i)}return null}function oa(e,{ok:t,stale:a}){const i=e.querySelector("#lq-live-suffix");if(!i)return;const r=xe?Jo(xe):"",{twOpen:l,usOpen:o}=ei();if(!l&&!o){i.hidden=!1,i.dataset.state="closed",i.title=s("liveQuotesClosedTitle"),i.textContent=` · ${s("liveQuotesClosed")}`;return}t&&!a&&r?(i.hidden=!1,i.dataset.state="live",i.removeAttribute("title"),i.textContent=` · ${s("liveQuotesLive")} ${r}`):xe?(i.hidden=!1,i.dataset.state="stale",i.title=s("liveQuotesStale"),i.textContent=r?` · ${s("liveQuotesStaleShort")} ${r}`:` · ${s("liveQuotesStaleShort")}`):t?(i.hidden=!0,i.dataset.state="pending",i.removeAttribute("title"),i.textContent=""):(i.hidden=!1,i.dataset.state="stale",i.title=s("liveQuotesStale"),i.textContent=` · ${s("liveQuotesStaleShort")}`)}function ai(...e){const t=new Map(ra);for(const a of e)for(const i of a)!(i!=null&&i.symbol)||i.price==null||(Wo(i.symbol,i),t.set(i.symbol,ra.get(i.symbol)));if(t.has("__MIS_TWII")){const a=t.get("__MIS_TWII");t.set("^TWII",a)}return t}async function sn(){if(!z||document.visibilityState==="hidden")return;const{yahoo:e,mis:t}=Yo(z),[a,i]=await Promise.all([Vo(e),Ko(t)]),r=ai(a.quotes||[],i.quotes||[]),l=a.ok||i.ok;l?(xe=Date.now(),Ie=!0):Ie=!1,ni(r,l)}function ni(e,t){if(!z)return;const a=e.get("__MIS_TWII")||e.get("^TWII"),i=e.get("__MIS_OTC");De(z,"tw",a),De(z,"otc",i),De(z,"spx",e.get("^GSPC")),De(z,"nasdaq",e.get("^IXIC")),De(z,"sox",e.get("^SOX"));const r=e.get("USDTWD=X"),l=z.querySelector("[data-lq-key='usdTwd']"),o=l==null?void 0:l.getAttribute("data-lq-taipei-close"),c=o!=null&&o!==""?Number(o):null;De(z,"usdTwd",r,{taipeiClose:Number.isFinite(c)?c:null});const u=new Set;z.querySelectorAll("[data-lq-sym]").forEach(p=>{const f=p.getAttribute("data-lq-sym");if(!f||u.has(f))return;u.add(f);const h=ac(e,f);h&&Xo(z,f,h)}),tc(z,e.get("SOXL")),ec(z);const d=xe?Date.now()-xe:1/0;oa(z,{ok:t,stale:!t||d>Zs})}function rn(){Wt&&(clearTimeout(Wt),Wt=null)}function ln(){if(rn(),!mt)return;const e=Uo();Wt=window.setTimeout(async()=>{try{await sn()}catch{Ie=!1,z&&oa(z,{ok:!1,stale:!0})}ln()},e)}function nc(){if(mt){if(document.visibilityState==="hidden"){rn();return}sn().finally(()=>ln())}}async function sc(e){if(si(),z=e,!z)return{ok:!1};mt=!0,Vn||(document.addEventListener("visibilitychange",nc),Vn=!0),oa(z,{ok:!1,stale:!1});try{await sn()}catch{Ie=!1,oa(z,{ok:!1,stale:!0})}return ln(),{ok:Ie,lastSuccessAt:xe}}function ic(){return!mt||!z||ra.size===0?!1:(ni(ai(),Ie),!0)}function si(){mt=!1,rn(),z=null}const Zn="./data/us-macro-calendar.json",rc=900*1e3,lc=2160*60*1e3;let jt=null;function oc(e){const t=e!=null&&e.eventKey?`macroEvent_${e.eventKey}`:null;if(t){const a=s(t,"");if(a&&a!==t)return a}return(e==null?void 0:e.shortName)||(e==null?void 0:e.eventName)||"—"}function cc(e,t){const a=new Intl.DateTimeFormat("en-CA",{timeZone:t,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(e),i=r=>{var l;return(l=a.find(o=>o.type===r))==null?void 0:l.value};return`${i("year")}-${i("month")}-${i("day")}`}function uc(e,t){try{const a=new Date(e),i=a.toLocaleDateString(D(),{timeZone:t,month:"numeric",day:"numeric",weekday:"short"}),r=a.toLocaleTimeString(D(),{timeZone:t,hour:"2-digit",minute:"2-digit",hour12:!1});return{datePart:i,timePart:r}}catch{return{datePart:"—",timePart:""}}}function dc(e){try{return new Date(e).toLocaleString(D(),{timeZone:"Asia/Taipei",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1})}catch{return e||"—"}}function pc(e,t){let a=null;for(const i of e)if(i.dayEt>=t){a=i.id;break}return a}function fc(e,{todayEt:t,nextId:a,timeZone:i}){const r=n(oc(e)),{datePart:l,timePart:o}=uc(e.scheduledAt,i),c=e.dayEt===t,u=e.id===a,d=e.dayEt<t,p=["macro-chip",e.highImpact||e.importance==="high"?"macro-chip--high":"",c?"macro-chip--today":"",u&&!c?"macro-chip--next":"",d?"macro-chip--past":""].filter(Boolean).join(" "),f=[];c?f.push(`<span class="macro-chip-tag">${n(s("macroToday"))}</span>`):u&&f.push(`<span class="macro-chip-tag macro-chip-tag--next">${n(s("macroNext"))}</span>`),(e.highImpact||e.importance==="high")&&f.push(`<span class="macro-chip-tag macro-chip-tag--high">${n(s("macroHighImpact"))}</span>`);const h=[e.eventName,e.periodLabel,`${e.dayEt} ${o} ET`,e.officialUrl?"↗ official":null].filter(Boolean).join(" · "),m=`
      <span class="macro-chip-when">${o?`${n(l)} ${n(o)}`:n(l)}</span>
      <span class="macro-chip-name">${r}</span>
      ${f.length?`<span class="macro-chip-tags">${f.join("")}</span>`:""}`,v=typeof e.officialUrl=="string"&&/^https?:\/\//i.test(e.officialUrl)?e.officialUrl:null;return v?`
    <a class="${p}" href="${n(v)}" target="_blank" rel="noopener noreferrer"
       title="${n(h)}" data-event-id="${n(e.id)}">${m}
    </a>`:`
    <span class="${p}" title="${n(h)}" data-event-id="${n(e.id)}">${m}
    </span>`}function hc(e){const t=e.querySelector(".index-marquee");if(!t||t.dataset.marqueeBound==="1")return;t.dataset.marqueeBound="1";const a=()=>t.classList.add("is-paused"),i=()=>t.classList.remove("is-paused");t.addEventListener("pointerdown",a),t.addEventListener("pointerup",i),t.addEventListener("pointercancel",i),t.addEventListener("pointerleave",i),t.addEventListener("touchstart",a,{passive:!0}),t.addEventListener("touchend",i,{passive:!0}),t.addEventListener("touchcancel",i,{passive:!0})}function gc(e,t){if(!e)return;const a=(t==null?void 0:t.timezone)||"America/New_York",i=cc(new Date,a),r=Array.isArray(t==null?void 0:t.events)?t.events:[],l=pc(r,i),o=(t==null?void 0:t.asOf)||null,c=o?Date.now()-Date.parse(o):NaN,u=!!(t!=null&&t.stale)||!Number.isNaN(c)&&c>lc;let d=`${n(s("macroTzEt"))}`;if(o&&(d+=` · ${n(s("macroAsOf"))} ${n(dc(o))}`),u&&(d+=` · ${n(s("macroStale"))}`),!r.length){e.innerHTML=`
      <div class="macro-strip" role="region" aria-label="${n(s("macroTitle"))}">
        <div class="macro-strip-side">
          <span class="macro-strip-label">${n(s("macroTitle"))}</span>
          <span class="macro-strip-meta">${d}</span>
        </div>
        <p class="macro-strip-empty">${n(s("macroEmpty"))}</p>
      </div>`;return}const p=r.map(g=>fc(g,{todayEt:i,nextId:l,timeZone:a})),f=`<div class="index-marquee-group">${p.join("")}</div>`,h=`<div class="index-marquee-group index-marquee-group--clone" aria-hidden="true" inert>${p.join("").replace(/<a /g,'<a tabindex="-1" ')}</div>`;e.innerHTML=`
    <div class="macro-strip" role="region" aria-label="${n(s("macroTitle"))}">
      <div class="macro-strip-side">
        <span class="macro-strip-label">${n(s("macroTitle"))}</span>
        <span class="macro-strip-meta" title="${d}">${d}</span>
      </div>
      <div class="index-strip index-strip--marquee macro-strip-marquee">
        <div class="index-marquee" tabindex="0">
          <div class="index-marquee-track">
            ${f}
            ${h}
          </div>
        </div>
      </div>
    </div>`,hc(e)}function mc(){return'<div id="us-macro-strip" class="us-macro-strip-host" aria-live="polite"></div>'}async function yc(e=!1){const t=e?`${Zn}?t=${Date.now()}`:Zn,a=await fetch(t,{cache:e?"no-store":"default"});if(!a.ok)throw new Error(`HTTP ${a.status}`);return a.json()}async function $c(e="#us-macro-strip"){const t=typeof e=="string"?document.querySelector(e):e;if(!t)return{ok:!1};const a=async r=>{try{const l=await yc(r);return gc(t,l),{ok:!0,data:l}}catch(l){return t.innerHTML=`
        <div class="macro-strip macro-strip--error" role="status">
          <div class="macro-strip-side">
            <span class="macro-strip-label">${n(s("macroTitle"))}</span>
          </div>
          <p class="macro-strip-empty">${n(s("macroLoadError",{msg:l.message||String(l)}))}</p>
        </div>`,{ok:!1,error:l}}},i=await a(!1);return jt&&(window.clearInterval(jt),jt=null),jt=window.setInterval(()=>{a(!0)},rc),i}const Jn="./data/tw-macro-calendar.json",vc=900*1e3,bc=2160*60*1e3;let At=null;function kc(e){const t=e!=null&&e.eventKey?`twMacroEvent_${e.eventKey}`:null;if(t){const a=s(t,"");if(a&&a!==t)return a}return(e==null?void 0:e.shortName)||(e==null?void 0:e.eventName)||"—"}function Sc(e,t){const a=new Intl.DateTimeFormat("en-CA",{timeZone:t,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(e),i=r=>{var l;return(l=a.find(o=>o.type===r))==null?void 0:l.value};return`${i("year")}-${i("month")}-${i("day")}`}function Tc(e,t){try{const a=new Date(e),i=a.toLocaleDateString(D(),{timeZone:t,month:"numeric",day:"numeric",weekday:"short"}),r=a.toLocaleTimeString(D(),{timeZone:t,hour:"2-digit",minute:"2-digit",hour12:!1});return{datePart:i,timePart:r}}catch{return{datePart:"—",timePart:""}}}function wc(e){try{return new Date(e).toLocaleString(D(),{timeZone:"Asia/Taipei",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1})}catch{return e||"—"}}function xc(e,t){let a=null;for(const i of e)if(i.dayTw>=t){a=i.id;break}return a}function Pc(e,{todayTw:t,nextId:a,timeZone:i}){const r=n(kc(e)),{datePart:l,timePart:o}=Tc(e.scheduledAt,i),c=e.dayTw===t,u=e.id===a,d=e.dayTw<t,p=["macro-chip",e.highImpact||e.importance==="high"?"macro-chip--high":"",c?"macro-chip--today":"",u&&!c?"macro-chip--next":"",d?"macro-chip--past":""].filter(Boolean).join(" "),f=[];c?f.push(`<span class="macro-chip-tag">${n(s("macroToday"))}</span>`):u&&f.push(`<span class="macro-chip-tag macro-chip-tag--next">${n(s("macroNext"))}</span>`),(e.highImpact||e.importance==="high")&&f.push(`<span class="macro-chip-tag macro-chip-tag--high">${n(s("macroHighImpact"))}</span>`);const h=[e.eventName,e.periodLabel,`${e.dayTw} ${o} 台北`,e.officialUrl?"↗ official":null].filter(Boolean).join(" · "),m=`
      <span class="macro-chip-when">${o?`${n(l)} ${n(o)}`:n(l)}</span>
      <span class="macro-chip-name">${r}</span>
      ${f.length?`<span class="macro-chip-tags">${f.join("")}</span>`:""}`,v=typeof e.officialUrl=="string"&&/^https?:\/\//i.test(e.officialUrl)?e.officialUrl:null;return v?`
    <a class="${p}" href="${n(v)}" target="_blank" rel="noopener noreferrer"
       title="${n(h)}" data-event-id="${n(e.id)}">${m}
    </a>`:`
    <span class="${p}" title="${n(h)}" data-event-id="${n(e.id)}">${m}
    </span>`}function Cc(e){const t=e.querySelector(".index-marquee");if(!t||t.dataset.marqueeBound==="1")return;t.dataset.marqueeBound="1";const a=()=>t.classList.add("is-paused"),i=()=>t.classList.remove("is-paused");t.addEventListener("pointerdown",a),t.addEventListener("pointerup",i),t.addEventListener("pointercancel",i),t.addEventListener("pointerleave",i),t.addEventListener("touchstart",a,{passive:!0}),t.addEventListener("touchend",i,{passive:!0}),t.addEventListener("touchcancel",i,{passive:!0})}function Lc(e,t){if(!e)return;const a=(t==null?void 0:t.timezone)||"Asia/Taipei",i=Sc(new Date,a),r=Array.isArray(t==null?void 0:t.events)?t.events:[],l=xc(r,i),o=(t==null?void 0:t.asOf)||null,c=o?Date.now()-Date.parse(o):NaN,u=!!(t!=null&&t.stale)||!Number.isNaN(c)&&c>bc;let d=`${n(s("twMacroTz"))}`;if(o&&(d+=` · ${n(s("macroAsOf"))} ${n(wc(o))}`),u&&(d+=` · ${n(s("macroStale"))}`),!r.length){e.innerHTML=`
      <div class="macro-strip" role="region" aria-label="${n(s("twMacroTitle"))}">
        <div class="macro-strip-side">
          <span class="macro-strip-label">${n(s("twMacroTitle"))}</span>
          <span class="macro-strip-meta">${d}</span>
        </div>
        <p class="macro-strip-empty">${n(s("twMacroEmpty"))}</p>
      </div>`;return}const p=r.map(g=>Pc(g,{todayTw:i,nextId:l,timeZone:a})),f=`<div class="index-marquee-group">${p.join("")}</div>`,h=`<div class="index-marquee-group index-marquee-group--clone" aria-hidden="true" inert>${p.join("").replace(/<a /g,'<a tabindex="-1" ')}</div>`;e.innerHTML=`
    <div class="macro-strip" role="region" aria-label="${n(s("twMacroTitle"))}">
      <div class="macro-strip-side">
        <span class="macro-strip-label">${n(s("twMacroTitle"))}</span>
        <span class="macro-strip-meta" title="${d}">${d}</span>
      </div>
      <div class="index-strip index-strip--marquee macro-strip-marquee">
        <div class="index-marquee" tabindex="0">
          <div class="index-marquee-track">
            ${f}
            ${h}
          </div>
        </div>
      </div>
    </div>`,Cc(e)}function jc(){return'<div id="tw-macro-strip" class="tw-macro-strip-host" aria-live="polite"></div>'}async function Ac(e=!1){const t=e?`${Jn}?t=${Date.now()}`:Jn,a=await fetch(t,{cache:e?"no-store":"default"});if(!a.ok)throw new Error(`HTTP ${a.status}`);return a.json()}async function Ec(e="#tw-macro-strip"){const t=typeof e=="string"?document.querySelector(e):e;if(!t)return{ok:!1};const a=async r=>{try{const l=await Ac(r);return Lc(t,l),{ok:!0,data:l}}catch(l){return t.innerHTML=`
        <div class="macro-strip macro-strip--error" role="status">
          <div class="macro-strip-side">
            <span class="macro-strip-label">${n(s("twMacroTitle"))}</span>
          </div>
          <p class="macro-strip-empty">${n(s("twMacroLoadError",{msg:l.message||String(l)}))}</p>
        </div>`,{ok:!1,error:l}}},i=await a(!1);return At&&(window.clearInterval(At),At=null),At=window.setInterval(()=>{a(!0)},vc),i}const Dc="https://www.youtube.com/watch?v=7n-e5pe6z4U",zc=[1,2,3,4,5,6,7,8,9,10],Nc=[1,2,3,4,5,6],qc=[1,2,3,4],Mc=[1,2,3];function Rc(){return`
    <div class="gz-badges" role="list">
      <span class="gz-badge gz-badge-candidate" role="listitem">${n(s("godzillaBadgeCandidate"))}</span>
      <span class="gz-badge gz-badge-watch" role="listitem">${n(s("godzillaBadgeWatch"))}</span>
      <span class="gz-badge gz-badge-us" role="listitem">${n(s("godzillaUsFocus"))}</span>
      <span class="gz-badge gz-badge-self" role="listitem">${n(s("godzillaSelfReport"))}</span>
      <span class="gz-badge gz-badge-listened" role="listitem">${n(s("godzillaListenedBadge"))}</span>
    </div>`}function Oc(){return zc.map(e=>{const t=s(`godzillaThesis${e}Title`),a=s(`godzillaThesis${e}Body`);return`
      <article class="gz-card" data-thesis="${e}">
        <div class="gz-card-num" aria-hidden="true">${e}</div>
        <div class="gz-card-body">
          <h3 class="gz-card-title">${n(t)}</h3>
          <p class="gz-card-text">${n(a)}</p>
        </div>
      </article>`}).join("")}function Bc(){return`
    <ul class="gz-check-list">
      ${Nc.map(e=>`<li class="gz-check-item">
          <span class="gz-check-mark" aria-hidden="true">✓</span>
          <span>${n(s(`godzillaCheck${e}`))}</span>
        </li>`).join("")}
    </ul>`}function Hc(){return`
    <ul class="gz-bullet-list">
      ${qc.map(e=>`<li>${n(s(`godzillaOpt${e}`))}</li>`).join("")}
    </ul>`}function Uc(){return`
    <ul class="gz-bullet-list">
      ${Mc.map(e=>`<li>${n(s(`godzillaRsu${e}`))}</li>`).join("")}
    </ul>`}function Ic(e){e.innerHTML=`
    <section class="gz-hero" aria-label="${n(s("godzillaHeroLabel"))}">
      <div class="gz-hero-main">
        <h3 class="gz-hero-kicker">${n(s("godzillaKicker"))}</h3>
        <p class="gz-hero-tagline">${n(s("godzillaTagline"))}</p>
        ${Rc()}
        <p class="gz-source">
          <span class="gz-source-label">${n(s("godzillaSourceLabel"))}</span>
          <a class="gz-yt" href="${Dc}" target="_blank" rel="noopener noreferrer">${n(s("godzillaYoutube"))}</a>
          <span class="gz-source-cite">· ${n(s("godzillaSourceCite"))}</span>
        </p>
      </div>
    </section>


    <section class="gz-panel gz-listened" aria-label="${n(s("godzillaStockTitle"))}">
      <h3 class="gz-h3">${n(s("godzillaStockTitle"))}</h3>
      <p class="gz-panel-lead">${n(s("godzillaStockLead"))}</p>
      <ul class="gz-bullet-list gz-stock-list">
        ${[1,2,3,4,5,6].map(t=>`<li>${n(s(`godzillaStock${t}`))}</li>`).join("")}
      </ul>
      <p class="gz-source-note">${n(s("godzillaStockNote"))}</p>
    </section>

    <section class="gz-panel" aria-label="${n(s("godzillaThesesTitle"))}">
      <h3 class="gz-h3">${n(s("godzillaThesesTitle"))}</h3>
      <p class="gz-panel-lead">${n(s("godzillaThesesLead"))}</p>
      <div class="gz-thesis-grid">
        ${Oc()}
      </div>
    </section>

    <section class="gz-panel" aria-label="${n(s("godzillaChecklistTitle"))}">
      <h3 class="gz-h3">${n(s("godzillaChecklistTitle"))}</h3>
      <p class="gz-panel-lead">${n(s("godzillaChecklistLead"))}</p>
      ${Bc()}
    </section>

    <div class="gz-two-col">
      <section class="gz-panel" aria-label="${n(s("godzillaOptionsTitle"))}">
        <h3 class="gz-h3">${n(s("godzillaOptionsTitle"))}</h3>
        <p class="gz-panel-lead">${n(s("godzillaOptionsLead"))}</p>
        ${Hc()}
      </section>
      <section class="gz-panel" aria-label="${n(s("godzillaRsuTitle"))}">
        <h3 class="gz-h3">${n(s("godzillaRsuTitle"))}</h3>
        <p class="gz-panel-lead">${n(s("godzillaRsuLead"))}</p>
        ${Uc()}
      </section>
    </div>

    <section class="gz-panel gz-tw" aria-label="${n(s("godzillaTwTitle"))}">
      <h3 class="gz-h3">${n(s("godzillaTwTitle"))}</h3>
      <p class="gz-panel-lead">${n(s("godzillaTwLead"))}</p>
      <p class="gz-tw-body">${n(s("godzillaTwBody"))}</p>
    </section>

    <aside class="gz-gate" role="note">
      <strong class="gz-gate-title">${n(s("godzillaGateNote"))}</strong>
      <p class="gz-gate-detail">${n(s("godzillaGateDetail"))}</p>
    </aside>
  `}function _c(e="#gz-root"){const t=typeof e=="string"?document.querySelector(e):e;return t?(Ic(t),{ok:!0}):{ok:!1}}const st={id:"Xn1EsFe7snQ",watchUrl:"https://www.youtube.com/watch?v=Xn1EsFe7snQ",thumbUrl:"https://i.ytimg.com/vi/Xn1EsFe7snQ/hqdefault.jpg"},Wc="https://ecorner.stanford.edu",Fc=[1,2,3,4,5];function Vc(){return`
    <div class="jh-badges" role="list">
      <span class="jh-badge jh-badge-candidate" role="listitem">${n(s("godzillaBadgeCandidate"))}</span>
      <span class="jh-badge jh-badge-watch" role="listitem">${n(s("godzillaBadgeWatch"))}</span>
      <span class="jh-badge jh-badge-us" role="listitem">${n(s("jensenUsFocus"))}</span>
      <span class="jh-badge jh-badge-talk" role="listitem">${n(s("jensenTalkBadge"))}</span>
      <span class="jh-badge jh-badge-listened" role="listitem">${n(s("jensenListenedBadge"))}</span>
    </div>`}function Gc(){return Fc.map(e=>{const t=s(`jensenH${e}Title`),a=s(`jensenH${e}Body`);return`
      <article class="jh-card" data-highlight="${e}">
        <div class="jh-card-num" aria-hidden="true">${e}</div>
        <div class="jh-card-body">
          <h4 class="jh-card-title">${n(t)}</h4>
          <p class="jh-card-text">${n(a)}</p>
        </div>
      </article>`}).join("")}function Kc(){const e=s("jensenEmbedTitle");return`
    <div class="jh-yt-card" data-yt-id="${n(st.id)}" data-embed-allowed="false">
      <a class="jh-yt-card-media" href="${st.watchUrl}" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true">
        <img
          class="jh-yt-card-thumb"
          src="${st.thumbUrl}"
          alt=""
          width="480"
          height="360"
          loading="lazy"
          decoding="async"
        />
        <span class="jh-yt-card-play" aria-hidden="true"></span>
      </a>
      <div class="jh-yt-card-body">
        <p class="jh-yt-card-kicker">${n(s("jensenYoutube"))}</p>
        <h4 class="jh-yt-card-title">${n(e)}</h4>
        <p class="jh-yt-card-note">${n(s("jensenEmbedBlockedNote"))}</p>
        <a
          class="jh-yt-card-cta"
          href="${st.watchUrl}"
          target="_blank"
          rel="noopener noreferrer"
        >${n(s("jensenWatchCta"))}</a>
      </div>
    </div>`}function Yc(){return Kc()}function Zc(e){e.innerHTML=`
    <section class="jh-hero" aria-label="${n(s("jensenHeroLabel"))}">
      <div class="jh-hero-main">
        <h3 class="jh-hero-kicker">${n(s("jensenKicker"))}</h3>
        <p class="jh-hero-tagline">${n(s("jensenTagline"))}</p>
        ${Vc()}
        <p class="jh-meta">${n(s("jensenMeta"))}</p>
        <p class="jh-source">
          <span class="jh-source-label">${n(s("godzillaSourceLabel"))}</span>
          <a class="jh-yt" href="${st.watchUrl}" target="_blank" rel="noopener noreferrer">${n(s("jensenYoutube"))}</a>
          <span class="jh-source-cite">· ${n(s("jensenSourceCite"))}</span>
        </p>
        <p class="jh-source jh-source-alt">
          <a class="jh-yt" href="${Wc}" target="_blank" rel="noopener noreferrer">${n(s("jensenEcorner"))}</a>
        </p>
      </div>
    </section>

    ${Yc()}


    <section class="jh-panel jh-listened" aria-label="${n(s("jensenStockTitle"))}">
      <h3 class="jh-h3">${n(s("jensenStockTitle"))}</h3>
      <p class="jh-panel-lead">${n(s("jensenStockLead"))}</p>
      <ul class="jh-bullet-list jh-stock-list">
        ${[1,2,3,4,5,6].map(t=>`<li>${n(s(`jensenStock${t}`))}</li>`).join("")}
      </ul>
      <p class="jh-source-note">${n(s("jensenStockNote"))}</p>
    </section>

    <section class="jh-panel" aria-label="${n(s("jensenHighlightsTitle"))}">
      <h3 class="jh-h3">${n(s("jensenHighlightsTitle"))}</h3>
      <p class="jh-panel-lead">${n(s("jensenHighlightsLead"))}</p>
      <div class="jh-highlight-grid">
        ${Gc()}
      </div>
    </section>

    <section class="jh-panel jh-tw" aria-label="${n(s("jensenTwTitle"))}">
      <h3 class="jh-h3">${n(s("jensenTwTitle"))}</h3>
      <p class="jh-panel-lead">${n(s("jensenTwLead"))}</p>
      <p class="jh-tw-body">${n(s("jensenTwBody"))}</p>
    </section>

    <aside class="jh-gate" role="note">
      <strong class="jh-gate-title">${n(s("jensenGateNote"))}</strong>
      <p class="jh-gate-detail">${n(s("jensenGateDetail"))}</p>
    </aside>
  `}function Jc(e="#jh-root"){const t=typeof e=="string"?document.querySelector(e):e;return t?(Zc(t),{ok:!0}):{ok:!1}}const Xc="./data/gooaye-episodes.json",ot=25,Qc="#research/podcast",Xn="https://podcasts.apple.com/tw/podcast/gooaye-%E8%82%A1%E7%99%8C/id1500839292";let Et=null,Ye=null,Ft=ot,ca="";async function eu(){return Et||Ye||(Ye=(async()=>{const e=await fetch(Xc,{cache:"no-cache"});if(!e.ok)throw new Error(`HTTP ${e.status}`);return Et=await e.json(),Et})().catch(e=>{throw Ye=null,e}),Ye)}function tu(e){if(!e)return"";try{const t=new Date(e);return Number.isNaN(t.getTime())?e:new Intl.DateTimeFormat(void 0,{timeZone:"Asia/Taipei",year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(t)}catch{return e}}function au(e){return(e==null?void 0:e.notesQuality)==="listened"&&Array.isArray(e.stockAnalysis)&&e.stockAnalysis.length>0}function nu(e){const t=(e==null?void 0:e.episodes)||[],a=ca.trim().toLowerCase();return a?t.filter(i=>[i.title,i.subtitle,i.ep!=null?`ep${i.ep}`:"",i.ep!=null?String(i.ep):"",...i.stockAnalysis||[],...i.keyPoints||[],...i.rssTeaser||[]].filter(Boolean).join(`
`).toLowerCase().includes(a)):t}function su(e){const t=au(e),a=e.ep!=null?`<span class="gy-ep-num">EP${n(String(e.ep))}</span>`:"",i=e.pubDateTw?`<time class="gy-ep-date" datetime="${n(e.pubDateIso||e.pubDateTw)}">${n(e.pubDateTw)}</time>`:"",r=t?`<span class="gy-ep-badge gy-ep-badge-listened">${n(s("gooayeBadgeListened"))}</span>`:`<span class="gy-ep-badge gy-ep-badge-rss">${n(s("gooayeBadgeRssOnly"))}</span>`,l=e.title||(e.ep!=null?`EP${e.ep}`:s("gooayeUntitled"));let o="";if(t){const u=(e.stockAnalysis||[]).filter(Boolean);o+=`<p class="gy-ep-kicker gy-ep-kicker-stock">${n(s("gooayeStockAnalysis"))}</p>`,o+=`<ul class="gy-ep-points gy-ep-stock">${u.map(p=>`<li>${n(p)}</li>`).join("")}</ul>`;const d=(e.rssTeaser||e.keyPoints||[]).filter(Boolean);if(d.length&&(o+=`<details class="gy-ep-rss-details"><summary>${n(s("gooayeRssTeaserToggle"))}</summary>`,o+=`<ul class="gy-ep-points gy-ep-rss">${d.map(p=>`<li>${n(p)}</li>`).join("")}</ul></details>`),e.listenedAt||e.transcriptSource){const p=[];e.listenedAt&&p.push(s("gooayeListenedAt",{date:String(e.listenedAt).slice(0,16).replace("T"," ")})),e.transcriptSource&&p.push(String(e.transcriptSource)),o+=`<p class="gy-ep-source-note">${n(p.join(" · "))}</p>`}}else{const u=(e.keyPoints||[]).filter(Boolean),d=e.notesQuality==="teaser"&&u.length>0&&u.length<=2;o+=`<p class="gy-ep-kicker">${n(s(d?"gooayeTeaserKicker":"gooayeKeyPoints"))}</p>`,u.length?o+=`<ul class="gy-ep-points">${u.map(f=>`<li>${n(f)}</li>`).join("")}</ul>`:o+=`<p class="gy-ep-empty">${n(s("gooayeNotesThin"))}</p>`;const p=e.notesQuality==="teaser"||e.notesQuality==="title-only"||!u.length?`<p class="gy-ep-source-note">${n(s("gooayeTeaserNote"))}</p>`:`<p class="gy-ep-source-note">${n(s("gooayeRssOnlyNote"))}</p>`;o+=p}const c=e.link?`<a class="gy-ep-link" href="${n(e.link)}" target="_blank" rel="noopener noreferrer">${n(s("gooayeListen"))}</a>`:"";return`
    <article class="gy-ep${t?" gy-ep-listened":" gy-ep-rss-only"}" data-ep="${n(String(e.ep??""))}" data-quality="${n(t?"listened":"rss-only")}">
      <header class="gy-ep-head">
        <div class="gy-ep-meta">${a}${r}${i}</div>
        <h4 class="gy-ep-title">${n(l)}</h4>
      </header>
      <div class="gy-ep-body">
        ${o}
        <div class="gy-ep-actions">${c}</div>
      </div>
    </article>`}function ua(e,t,{error:a}={}){var f;if(a){e.innerHTML=`
      <div class="gy-error" role="alert">
        <p>${n(s("gooayeLoadError",{msg:String(a.message||a)}))}</p>
        <a class="pc-link pc-link-ext" href="${Xn}" target="_blank" rel="noopener noreferrer">${n(s("podcastsGooayeApple"))}</a>
      </div>`;return}const i=nu(t),r=(t.episodes||[]).length,l=i.slice(0,Ft),o=Math.max(0,i.length-l.length),c=tu(t.asOf),u=t.counts||{};e.innerHTML=`
    <div class="gy-toolbar">
      <div class="gy-toolbar-stats" aria-live="polite">
        <span class="gy-stat">${n(s("gooayeEpisodeCount",{n:String(r)}))}</span>
        ${u.listened?`<span class="gy-stat gy-stat-listened">${n(s("gooayeListenedCount",{n:String(u.listened)}))}</span>`:""}
        ${c?`<span class="gy-asof">${n(s("gooayeAsOf",{date:c}))}</span>`:""}
        ${u.notesEmpty?`<span class="gy-stat-muted">${n(s("gooayeEmptyCount",{n:String(u.notesEmpty)}))}</span>`:""}
      </div>
      <label class="gy-search">
        <span class="gy-search-label">${n(s("gooayeSearchLabel"))}</span>
        <input type="search" class="gy-search-input" data-gy-search
          placeholder="${n(s("gooayeSearchPlaceholder"))}"
          value="${n(ca)}" autocomplete="off" />
      </label>
    </div>

    <p class="gy-source-line">
      ${n(s("gooayeSourceLine"))}
      <a class="pc-link pc-link-ext" href="${n(((f=t.show)==null?void 0:f.feedUrl)||"")}" target="_blank" rel="noopener noreferrer">SoundOn RSS</a>
      ·
      <a class="pc-link pc-link-ext" href="${Xn}" target="_blank" rel="noopener noreferrer">${n(s("podcastsGooayeApple"))}</a>
      ·
      <a class="pc-link" href="${Qc}">${n(s("podcastsGotoResearch"))}</a>
    </p>

    <div class="gy-list" role="list">
      ${l.length?l.map(su).join(""):`<p class="gy-empty">${n(s("gooayeNoResults"))}</p>`}
    </div>

    <div class="gy-pager">
      ${o>0?`<button type="button" class="gy-load-more" data-gy-more>
              ${n(s("gooayeLoadMore",{n:String(Math.min(ot,o)),left:String(o)}))}
            </button>`:i.length?`<p class="gy-pager-done">${n(s("gooayeShowingAll",{n:String(i.length)}))}</p>`:""}
    </div>`;const d=e.querySelector("[data-gy-search]");if(d){let h=null;d.addEventListener("input",()=>{clearTimeout(h),h=setTimeout(()=>{ca=d.value||"",Ft=ot,ua(e,t)},180)})}const p=e.querySelector("[data-gy-more]");p&&p.addEventListener("click",()=>{Ft+=ot,ua(e,t)})}function iu(){return`
    <article class="pc-card pc-card-gooaye" id="podcast-gooaye" data-podcast="gooaye">
      <header class="pc-card-head pc-card-head-gooaye">
        <div class="pc-card-identity">
          <span class="pc-card-badge pc-badge-library">${n(s("gooayeLibraryBadge"))}</span>
          <span class="pc-card-badge pc-badge-tw">${n(s("podcastsGooayeMarket"))}</span>
          <span class="pc-card-badge pc-badge-candidate">${n(s("godzillaBadgeCandidate"))}</span>
          <span class="pc-card-badge pc-badge-watch">${n(s("godzillaBadgeWatch"))}</span>
        </div>
        <h3 class="pc-card-title">${n(s("podcastsGooayeTitle"))}</h3>
        <p class="pc-card-blurb">${n(s("podcastsGooayeLead"))}</p>
      </header>
      <div class="pc-card-body">
        <p class="gy-disclaimer" role="note">${n(s("gooayeDisclaimer"))}</p>
        <div id="gy-root" class="gy-root" aria-busy="true">
          <p class="gy-loading">${n(s("gooayeLoading"))}</p>
        </div>
      </div>
    </article>`}function ru(){return iu()}async function lu(e="#gy-root"){var a;const t=typeof e=="string"?document.querySelector(e):e;if(!t)return{ok:!1,reason:"missing-root"};Ft=ot,ca="";try{const i=await eu();return t.setAttribute("aria-busy","false"),ua(t,i),{ok:!0,count:((a=i.episodes)==null?void 0:a.length)||0}}catch(i){return t.setAttribute("aria-busy","false"),ua(t,null,{error:i}),{ok:!1,reason:String((i==null?void 0:i.message)||i)}}}const ou="./data/xiaojun-episodes.json",ct=25,cu="#research/podcast",Qn="https://podcasts.apple.com/tw/podcast/%E5%BC%A0%E5%B0%8F%E7%8F%BAj%C3%B9n-%E5%95%86%E4%B8%9A%E8%AE%BF%E8%B0%88%E5%BD%95/id1634356920";let Dt=null,Ze=null,Vt=ct,da="";async function uu(){return Dt||Ze||(Ze=(async()=>{const e=await fetch(ou,{cache:"no-cache"});if(!e.ok)throw new Error(`HTTP ${e.status}`);return Dt=await e.json(),Dt})().catch(e=>{throw Ze=null,e}),Ze)}function du(e){if(!e)return"";try{const t=new Date(e);return Number.isNaN(t.getTime())?e:new Intl.DateTimeFormat(void 0,{timeZone:"Asia/Taipei",year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(t)}catch{return e}}function pu(e){return(e==null?void 0:e.notesQuality)==="listened"&&Array.isArray(e.stockAnalysis)&&e.stockAnalysis.length>0}function fu(e){const t=(e==null?void 0:e.episodes)||[],a=da.trim().toLowerCase();return a?t.filter(i=>[i.title,i.subtitle,i.ep!=null?`ep${i.ep}`:"",i.ep!=null?String(i.ep):"",...i.stockAnalysis||[],...i.keyPoints||[],...i.rssTeaser||[]].filter(Boolean).join(`
`).toLowerCase().includes(a)):t}function hu(e){const t=pu(e),a=e.ep!=null?`<span class="xj-ep-num">EP${n(String(e.ep))}</span>`:"",i=e.pubDateTw?`<time class="xj-ep-date" datetime="${n(e.pubDateIso||e.pubDateTw)}">${n(e.pubDateTw)}</time>`:"",r=t?`<span class="xj-ep-badge xj-ep-badge-listened">${n(s("xiaojunBadgeListened"))}</span>`:`<span class="xj-ep-badge xj-ep-badge-rss">${n(s("xiaojunBadgeRssOnly"))}</span>`,l=e.title||(e.ep!=null?`EP${e.ep}`:s("xiaojunUntitled"));let o="";if(t){const u=(e.stockAnalysis||[]).filter(Boolean);o+=`<p class="xj-ep-kicker xj-ep-kicker-stock">${n(s("xiaojunStockAnalysis"))}</p>`,o+=`<ul class="xj-ep-points xj-ep-stock">${u.map(p=>`<li>${n(p)}</li>`).join("")}</ul>`;const d=(e.rssTeaser||e.keyPoints||[]).filter(Boolean);if(d.length&&(o+=`<details class="xj-ep-rss-details"><summary>${n(s("xiaojunRssTeaserToggle"))}</summary>`,o+=`<ul class="xj-ep-points xj-ep-rss">${d.map(p=>`<li>${n(p)}</li>`).join("")}</ul></details>`),e.listenedAt||e.transcriptSource){const p=[];e.listenedAt&&p.push(s("xiaojunListenedAt",{date:String(e.listenedAt).slice(0,16).replace("T"," ")})),e.transcriptSource&&p.push(String(e.transcriptSource)),o+=`<p class="xj-ep-source-note">${n(p.join(" · "))}</p>`}}else{const u=(e.keyPoints||[]).filter(Boolean);o+=`<p class="xj-ep-kicker">${n(s("xiaojunKeyPoints"))}</p>`,u.length?o+=`<ul class="xj-ep-points">${u.map(p=>`<li>${n(p)}</li>`).join("")}</ul>`:o+=`<p class="xj-ep-empty">${n(s("xiaojunNotesThin"))}</p>`;const d=e.notesQuality==="teaser"||e.notesQuality==="title-only"||!u.length?`<p class="xj-ep-source-note">${n(s("xiaojunTeaserNote"))}</p>`:`<p class="xj-ep-source-note">${n(s("xiaojunRssOnlyNote"))}</p>`;o+=d}const c=e.link?`<a class="xj-ep-link" href="${n(e.link)}" target="_blank" rel="noopener noreferrer">${n(s("xiaojunListen"))}</a>`:"";return`
    <article class="xj-ep${t?" xj-ep-listened":" xj-ep-rss-only"}" data-ep="${n(String(e.ep??""))}" data-quality="${n(t?"listened":"rss-only")}">
      <header class="xj-ep-head">
        <div class="xj-ep-meta">${a}${r}${i}</div>
        <h4 class="xj-ep-title">${n(l)}</h4>
      </header>
      <div class="xj-ep-body">
        ${o}
        <div class="xj-ep-actions">${c}</div>
      </div>
    </article>`}function pa(e,t,{error:a}={}){var f;if(a){e.innerHTML=`
      <div class="xj-error" role="alert">
        <p>${n(s("xiaojunLoadError",{msg:String(a.message||a)}))}</p>
        <a class="pc-link pc-link-ext" href="${Qn}" target="_blank" rel="noopener noreferrer">${n(s("podcastsXiaojunApple"))}</a>
      </div>`;return}const i=fu(t),r=(t.episodes||[]).length,l=i.slice(0,Vt),o=Math.max(0,i.length-l.length),c=du(t.asOf),u=t.counts||{};e.innerHTML=`
    <div class="xj-toolbar">
      <div class="xj-toolbar-stats" aria-live="polite">
        <span class="xj-stat">${n(s("xiaojunEpisodeCount",{n:String(r)}))}</span>
        ${u.listened?`<span class="xj-stat xj-stat-listened">${n(s("xiaojunListenedCount",{n:String(u.listened)}))}</span>`:""}
        ${c?`<span class="xj-asof">${n(s("xiaojunAsOf",{date:c}))}</span>`:""}
        ${u.notesEmpty?`<span class="xj-stat-muted">${n(s("xiaojunEmptyCount",{n:String(u.notesEmpty)}))}</span>`:""}
      </div>
      <label class="xj-search">
        <span class="xj-search-label">${n(s("xiaojunSearchLabel"))}</span>
        <input type="search" class="xj-search-input" data-xj-search
          placeholder="${n(s("xiaojunSearchPlaceholder"))}"
          value="${n(da)}" autocomplete="off" />
      </label>
    </div>

    <p class="xj-source-line">
      ${n(s("xiaojunSourceLine"))}
      <a class="pc-link pc-link-ext" href="${n(((f=t.show)==null?void 0:f.feedUrl)||"")}" target="_blank" rel="noopener noreferrer">SoundOn RSS</a>
      ·
      <a class="pc-link pc-link-ext" href="${Qn}" target="_blank" rel="noopener noreferrer">${n(s("podcastsXiaojunApple"))}</a>
      ·
      <a class="pc-link" href="${cu}">${n(s("podcastsGotoResearch"))}</a>
    </p>

    <div class="xj-list" role="list">
      ${l.length?l.map(hu).join(""):`<p class="xj-empty">${n(s("xiaojunNoResults"))}</p>`}
    </div>

    <div class="xj-pager">
      ${o>0?`<button type="button" class="xj-load-more" data-xj-more>
              ${n(s("xiaojunLoadMore",{n:String(Math.min(ct,o)),left:String(o)}))}
            </button>`:i.length?`<p class="xj-pager-done">${n(s("xiaojunShowingAll",{n:String(i.length)}))}</p>`:""}
    </div>`;const d=e.querySelector("[data-xj-search]");if(d){let h=null;d.addEventListener("input",()=>{clearTimeout(h),h=setTimeout(()=>{da=d.value||"",Vt=ct,pa(e,t)},180)})}const p=e.querySelector("[data-xj-more]");p&&p.addEventListener("click",()=>{Vt+=ct,pa(e,t)})}function gu(){return`
    <article class="pc-card pc-card-xiaojun" id="podcast-xiaojun" data-podcast="xiaojun">
      <header class="pc-card-head pc-card-head-xiaojun">
        <div class="pc-card-identity">
          <span class="pc-card-badge pc-badge-library">${n(s("xiaojunLibraryBadge"))}</span>
          <span class="pc-card-badge pc-badge-cn">${n(s("podcastsXiaojunMarket"))}</span>
          <span class="pc-card-badge pc-badge-candidate">${n(s("godzillaBadgeCandidate"))}</span>
          <span class="pc-card-badge pc-badge-watch">${n(s("godzillaBadgeWatch"))}</span>
        </div>
        <h3 class="pc-card-title">${n(s("podcastsXiaojunTitle"))}</h3>
        <p class="pc-card-blurb">${n(s("podcastsXiaojunLead"))}</p>
      </header>
      <div class="pc-card-body">
        <p class="xj-disclaimer" role="note">${n(s("xiaojunDisclaimer"))}</p>
        <div id="xj-root" class="xj-root" aria-busy="true">
          <p class="xj-loading">${n(s("xiaojunLoading"))}</p>
        </div>
      </div>
    </article>`}function mu(){return gu()}async function yu(e="#xj-root"){var a;const t=typeof e=="string"?document.querySelector(e):e;if(!t)return{ok:!1,reason:"missing-root"};Vt=ct,da="";try{const i=await uu();return t.setAttribute("aria-busy","false"),pa(t,i),{ok:!0,count:((a=i.episodes)==null?void 0:a.length)||0}}catch(i){return t.setAttribute("aria-busy","false"),pa(t,null,{error:i}),{ok:!1,reason:String((i==null?void 0:i.message)||i)}}}const $u="./data/whynottv-episodes.json",ut=25,vu="#research/podcast",es="https://podcasts.apple.com/tw/podcast/whynottv-podcast/id1824936911";let zt=null,Je=null,Gt=ut,fa="";async function bu(){return zt||Je||(Je=(async()=>{const e=await fetch($u,{cache:"no-cache"});if(!e.ok)throw new Error(`HTTP ${e.status}`);return zt=await e.json(),zt})().catch(e=>{throw Je=null,e}),Je)}function ku(e){if(!e)return"";try{const t=new Date(e);return Number.isNaN(t.getTime())?e:new Intl.DateTimeFormat(void 0,{timeZone:"Asia/Taipei",year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(t)}catch{return e}}function Su(e){return(e==null?void 0:e.notesQuality)==="listened"&&Array.isArray(e.stockAnalysis)&&e.stockAnalysis.length>0}function Tu(e){const t=(e==null?void 0:e.episodes)||[],a=fa.trim().toLowerCase();return a?t.filter(i=>[i.title,i.subtitle,i.ep!=null?`ep${i.ep}`:"",i.ep!=null?String(i.ep):"",...i.stockAnalysis||[],...i.keyPoints||[],...i.rssTeaser||[]].filter(Boolean).join(`
`).toLowerCase().includes(a)):t}function wu(e){const t=Su(e),a=e.ep!=null?`<span class="wn-ep-num">EP${n(String(e.ep))}</span>`:"",i=e.pubDateTw?`<time class="wn-ep-date" datetime="${n(e.pubDateIso||e.pubDateTw)}">${n(e.pubDateTw)}</time>`:"",r=t?`<span class="wn-ep-badge wn-ep-badge-listened">${n(s("whynottvBadgeListened"))}</span>`:`<span class="wn-ep-badge wn-ep-badge-rss">${n(s("whynottvBadgeRssOnly"))}</span>`,l=e.title||(e.ep!=null?`EP${e.ep}`:s("whynottvUntitled"));let o="";if(t){const u=(e.stockAnalysis||[]).filter(Boolean);o+=`<p class="wn-ep-kicker wn-ep-kicker-stock">${n(s("whynottvStockAnalysis"))}</p>`,o+=`<ul class="wn-ep-points wn-ep-stock">${u.map(p=>`<li>${n(p)}</li>`).join("")}</ul>`;const d=(e.rssTeaser||e.keyPoints||[]).filter(Boolean);if(d.length&&(o+=`<details class="wn-ep-rss-details"><summary>${n(s("whynottvRssTeaserToggle"))}</summary>`,o+=`<ul class="wn-ep-points wn-ep-rss">${d.map(p=>`<li>${n(p)}</li>`).join("")}</ul></details>`),e.listenedAt||e.transcriptSource){const p=[];e.listenedAt&&p.push(s("whynottvListenedAt",{date:String(e.listenedAt).slice(0,16).replace("T"," ")})),e.transcriptSource&&p.push(String(e.transcriptSource)),o+=`<p class="wn-ep-source-note">${n(p.join(" · "))}</p>`}}else{const u=(e.keyPoints||[]).filter(Boolean);o+=`<p class="wn-ep-kicker">${n(s("whynottvKeyPoints"))}</p>`,u.length?o+=`<ul class="wn-ep-points">${u.map(p=>`<li>${n(p)}</li>`).join("")}</ul>`:o+=`<p class="wn-ep-empty">${n(s("whynottvNotesThin"))}</p>`;const d=e.notesQuality==="teaser"||e.notesQuality==="title-only"||!u.length?`<p class="wn-ep-source-note">${n(s("whynottvTeaserNote"))}</p>`:`<p class="wn-ep-source-note">${n(s("whynottvRssOnlyNote"))}</p>`;o+=d}const c=e.link?`<a class="wn-ep-link" href="${n(e.link)}" target="_blank" rel="noopener noreferrer">${n(s("whynottvListen"))}</a>`:"";return`
    <article class="wn-ep${t?" wn-ep-listened":" wn-ep-rss-only"}" data-ep="${n(String(e.ep??""))}" data-quality="${n(t?"listened":"rss-only")}">
      <header class="wn-ep-head">
        <div class="wn-ep-meta">${a}${r}${i}</div>
        <h4 class="wn-ep-title">${n(l)}</h4>
      </header>
      <div class="wn-ep-body">
        ${o}
        <div class="wn-ep-actions">${c}</div>
      </div>
    </article>`}function ha(e,t,{error:a}={}){var f;if(a){e.innerHTML=`
      <div class="wn-error" role="alert">
        <p>${n(s("whynottvLoadError",{msg:String(a.message||a)}))}</p>
        <a class="pc-link pc-link-ext" href="${es}" target="_blank" rel="noopener noreferrer">${n(s("podcastsWhynottvApple"))}</a>
      </div>`;return}const i=Tu(t),r=(t.episodes||[]).length,l=i.slice(0,Gt),o=Math.max(0,i.length-l.length),c=ku(t.asOf),u=t.counts||{};e.innerHTML=`
    <div class="wn-toolbar">
      <div class="wn-toolbar-stats" aria-live="polite">
        <span class="wn-stat">${n(s("whynottvEpisodeCount",{n:String(r)}))}</span>
        ${u.listened?`<span class="wn-stat wn-stat-listened">${n(s("whynottvListenedCount",{n:String(u.listened)}))}</span>`:""}
        ${c?`<span class="wn-asof">${n(s("whynottvAsOf",{date:c}))}</span>`:""}
        ${u.notesEmpty?`<span class="wn-stat-muted">${n(s("whynottvEmptyCount",{n:String(u.notesEmpty)}))}</span>`:""}
      </div>
      <label class="wn-search">
        <span class="wn-search-label">${n(s("whynottvSearchLabel"))}</span>
        <input type="search" class="wn-search-input" data-wn-search
          placeholder="${n(s("whynottvSearchPlaceholder"))}"
          value="${n(fa)}" autocomplete="off" />
      </label>
    </div>

    <p class="wn-source-line">
      ${n(s("whynottvSourceLine"))}
      <a class="pc-link pc-link-ext" href="${n(((f=t.show)==null?void 0:f.feedUrl)||"")}" target="_blank" rel="noopener noreferrer">SoundOn RSS</a>
      ·
      <a class="pc-link pc-link-ext" href="${es}" target="_blank" rel="noopener noreferrer">${n(s("podcastsWhynottvApple"))}</a>
      ·
      <a class="pc-link" href="${vu}">${n(s("podcastsGotoResearch"))}</a>
    </p>

    <div class="wn-list" role="list">
      ${l.length?l.map(wu).join(""):`<p class="wn-empty">${n(s("whynottvNoResults"))}</p>`}
    </div>

    <div class="wn-pager">
      ${o>0?`<button type="button" class="wn-load-more" data-wn-more>
              ${n(s("whynottvLoadMore",{n:String(Math.min(ut,o)),left:String(o)}))}
            </button>`:i.length?`<p class="wn-pager-done">${n(s("whynottvShowingAll",{n:String(i.length)}))}</p>`:""}
    </div>`;const d=e.querySelector("[data-wn-search]");if(d){let h=null;d.addEventListener("input",()=>{clearTimeout(h),h=setTimeout(()=>{fa=d.value||"",Gt=ut,ha(e,t)},180)})}const p=e.querySelector("[data-wn-more]");p&&p.addEventListener("click",()=>{Gt+=ut,ha(e,t)})}function xu(){return`
    <article class="pc-card pc-card-whynottv" id="podcast-whynottv" data-podcast="whynottv">
      <header class="pc-card-head pc-card-head-whynottv">
        <div class="pc-card-identity">
          <span class="pc-card-badge pc-badge-library">${n(s("whynottvLibraryBadge"))}</span>
          <span class="pc-card-badge pc-badge-cn">${n(s("podcastsWhynottvMarket"))}</span>
          <span class="pc-card-badge pc-badge-candidate">${n(s("godzillaBadgeCandidate"))}</span>
          <span class="pc-card-badge pc-badge-watch">${n(s("godzillaBadgeWatch"))}</span>
        </div>
        <h3 class="pc-card-title">${n(s("podcastsWhynottvTitle"))}</h3>
        <p class="pc-card-blurb">${n(s("podcastsWhynottvLead"))}</p>
      </header>
      <div class="pc-card-body">
        <p class="wn-disclaimer" role="note">${n(s("whynottvDisclaimer"))}</p>
        <div id="wn-root" class="wn-root" aria-busy="true">
          <p class="wn-loading">${n(s("whynottvLoading"))}</p>
        </div>
      </div>
    </article>`}function Pu(){return xu()}async function Cu(e="#wn-root"){var a;const t=typeof e=="string"?document.querySelector(e):e;if(!t)return{ok:!1,reason:"missing-root"};Gt=ut,fa="";try{const i=await bu();return t.setAttribute("aria-busy","false"),ha(t,i),{ok:!0,count:((a=i.episodes)==null?void 0:a.length)||0}}catch(i){return t.setAttribute("aria-busy","false"),ha(t,null,{error:i}),{ok:!1,reason:String((i==null?void 0:i.message)||i)}}}const Lu="./data/zhang-junan-posts.json",Se=25,ts="https://et220870.blogspot.com/",ju="https://www.pttweb.cc/user/et220870";let Nt=null,Xe=null,ze=Se,ga="",Re="all",Oe="all";async function Au(){return Nt||Xe||(Xe=(async()=>{const e=await fetch(Lu,{cache:"no-cache"});if(!e.ok)throw new Error(`HTTP ${e.status}`);return Nt=await e.json(),Nt})().catch(e=>{throw Xe=null,e}),Xe)}function Eu(e){if(!e)return"";try{const t=new Date(e);return Number.isNaN(t.getTime())?e:new Intl.DateTimeFormat(void 0,{timeZone:"Asia/Taipei",year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(t)}catch{return e}}function Du(e){if(!e)return"";try{const t=new Date(e);return Number.isNaN(t.getTime())?String(e).slice(0,10):new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Taipei",year:"numeric",month:"2-digit",day:"2-digit"}).format(t)}catch{return String(e).slice(0,10)}}function zu(e){return(e==null?void 0:e.analysisQuality)==="analyzed"&&Array.isArray(e.analysis)&&e.analysis.length>0}function Nu(e,t){const a=new Set;for(const i of e)t!=="all"&&i.source!==t||i.series&&a.add(i.series);return["all",...[...a].sort((i,r)=>i.localeCompare(r,"zh-Hant"))]}function qu(e){const t=(e==null?void 0:e.posts)||[],a=ga.trim().toLowerCase();return t.filter(i=>Re!=="all"&&i.source!==Re||Oe!=="all"&&i.series!==Oe?!1:a?[i.title,i.series,i.board,i.source,...i.analysis||[],i.commentSummary||""].filter(Boolean).join(`
`).toLowerCase().includes(a):!0)}function Mu(e){const t=zu(e),a=Du(e.publishedAt),i=a?`<time class="zj-ep-date" datetime="${n(e.publishedAt||a)}">${n(a)}</time>`:"",r=t?`<span class="zj-ep-badge zj-ep-badge-analyzed">${n(s("zhangJunanBadgeAnalyzed"))}</span>`:`<span class="zj-ep-badge zj-ep-badge-title">${n(s("zhangJunanBadgeTitleOnly"))}</span>`,l=e.source==="blog"?`<span class="zj-ep-badge">${n(s("zhangJunanSourceBlog"))}</span>`:`<span class="zj-ep-badge">${n(s("zhangJunanSourcePtt"))}</span>`,o=e.source==="ptt"&&e.board?`<span class="zj-ep-board">[${n(e.board)}]</span>`:"",c=e.series?`<span class="zj-ep-badge">${n(e.series)}</span>`:"";let u="";u+=`<p class="zj-ep-kicker zj-ep-kicker-stock">${n(s(t?"zhangJunanStockAnalysis":"zhangJunanKeyPoints"))}</p>`;const d=(e.analysis||[]).filter(Boolean);d.length?u+=`<ul class="zj-ep-points${t?" zj-ep-stock":""}">${d.map(h=>`<li>${n(h)}</li>`).join("")}</ul>`:u+=`<p class="zj-ep-empty">${n(s("zhangJunanNotesThin"))}</p>`,t||(u+=`<p class="zj-ep-source-note">${n(s("zhangJunanTitleOnlyNote"))}</p>`),e.commentSummary&&(u+=`<div class="zj-ep-comments"><div class="zj-ep-comments-label">${n(s("zhangJunanCommentSummary"))}</div><div>${n(e.commentSummary)}</div></div>`);const p=e.source==="blog"?s("zhangJunanOpenBlog"):s("zhangJunanOpenPtt"),f=e.url?`<a class="zj-ep-link" href="${n(e.url)}" target="_blank" rel="noopener noreferrer">${n(p)}</a>`:"";return`
    <article class="zj-ep${t?" zj-ep-listened":" zj-ep-rss-only"}" data-id="${n(e.id)}" data-quality="${n(t?"analyzed":"title-only")}">
      <header class="zj-ep-head">
        <div class="zj-ep-meta">${l}${c}${r}${i}</div>
        <h4 class="zj-ep-title">${o}${n(e.title||s("zhangJunanUntitled"))}</h4>
      </header>
      <div class="zj-ep-body">
        ${u}
        <div class="zj-ep-actions">${f}</div>
      </div>
    </article>`}function qe(e,t,{error:a}={}){var m;if(a){e.innerHTML=`
      <div class="zj-error" role="alert">
        <p>${n(s("zhangJunanLoadError",{msg:String(a.message||a)}))}</p>
        <a class="pc-link pc-link-ext" href="${ts}" target="_blank" rel="noopener noreferrer">${n(s("zhangJunanOpenBlog"))}</a>
      </div>`;return}const i=qu(t),r=(t.posts||[]).length,l=i.slice(0,ze),o=Math.max(0,i.length-l.length),c=Eu(t.asOf),u=t.counts||{},d=Nu(t.posts||[],Re),p=[{id:"all",label:s("zhangJunanFilterAll")},{id:"blog",label:s("zhangJunanFilterBlog")},{id:"ptt",label:s("zhangJunanFilterPtt")}].map(v=>`<button type="button" class="zj-subtab${Re===v.id?" is-active":""}" data-zj-source="${v.id}">${n(v.label)}</button>`).join(""),f=d.map(v=>{const S=v==="all"?s("zhangJunanFilterSeriesAll"):v;return`<button type="button" class="zj-series-tab${Oe===v?" is-active":""}" data-zj-series="${n(v)}">${n(S)}</button>`}).join("");e.innerHTML=`
    <div class="zj-toolbar">
      <div class="zj-toolbar-stats" aria-live="polite">
        <span class="zj-stat">${n(s("zhangJunanPostCount",{n:String(r)}))}</span>
        ${u.analyzed?`<span class="zj-stat zj-stat-listened">${n(s("zhangJunanAnalyzedCount",{n:String(u.analyzed)}))}</span>`:""}
        ${u.titleOnly?`<span class="zj-stat-muted">${n(s("zhangJunanTitleOnlyCount",{n:String(u.titleOnly)}))}</span>`:""}
        ${c?`<span class="zj-asof">${n(s("zhangJunanAsOf",{date:c}))}</span>`:""}
      </div>
      <label class="zj-search">
        <span class="zj-search-label">${n(s("zhangJunanSearchLabel"))}</span>
        <input type="search" class="zj-search-input" data-zj-search
          placeholder="${n(s("zhangJunanSearchPlaceholder"))}"
          value="${n(ga)}" autocomplete="off" />
      </label>
    </div>

    <div class="zj-subtabs" role="tablist" aria-label="${n(s("zhangJunanSourceFilters"))}">${p}</div>
    <div class="zj-series-tabs" role="tablist" aria-label="${n(s("zhangJunanSeriesFilters"))}">${f}</div>

    <p class="zj-source-line">
      ${n(s("zhangJunanSourceLine"))}
      <a class="pc-link pc-link-ext" href="${ts}" target="_blank" rel="noopener noreferrer">Blogspot</a>
      ·
      <a class="pc-link pc-link-ext" href="${ju}" target="_blank" rel="noopener noreferrer">PTT ${n(((m=t.person)==null?void 0:m.pttId)||"et220870")}</a>
    </p>

    <div class="zj-list" role="list">
      ${l.length?l.map(Mu).join(""):`<p class="zj-empty">${n(s("zhangJunanNoResults"))}</p>`}
    </div>

    <div class="zj-pager">
      ${o>0?`<button type="button" class="zj-load-more" data-zj-more>
              ${n(s("zhangJunanLoadMore",{n:String(Math.min(Se,o)),left:String(o)}))}
            </button>`:i.length?`<p class="zj-pager-done">${n(s("zhangJunanShowingAll",{n:String(i.length)}))}</p>`:""}
    </div>`;const h=e.querySelector("[data-zj-search]");if(h){let v=null;h.addEventListener("input",()=>{clearTimeout(v),v=setTimeout(()=>{ga=h.value||"",ze=Se,qe(e,t)},180)})}e.querySelectorAll("[data-zj-source]").forEach(v=>{v.addEventListener("click",()=>{Re=v.getAttribute("data-zj-source")||"all",Oe="all",ze=Se,qe(e,t)})}),e.querySelectorAll("[data-zj-series]").forEach(v=>{v.addEventListener("click",()=>{Oe=v.getAttribute("data-zj-series")||"all",ze=Se,qe(e,t)})});const g=e.querySelector("[data-zj-more]");g&&g.addEventListener("click",()=>{ze+=Se,qe(e,t)})}function Ru(){return`
    <article class="pc-card pc-card-zhang-junan" id="podcast-zhang-junan" data-podcast="zhang-junan">
      <header class="pc-card-head pc-card-head-zhang-junan">
        <div class="pc-card-identity">
          <span class="pc-card-badge pc-badge-library">${n(s("zhangJunanLibraryBadge"))}</span>
          <span class="pc-card-badge pc-badge-tw">${n(s("podcastsZhangJunanMarket"))}</span>
          <span class="pc-card-badge pc-badge-candidate">${n(s("godzillaBadgeCandidate"))}</span>
          <span class="pc-card-badge pc-badge-watch">${n(s("godzillaBadgeWatch"))}</span>
        </div>
        <h3 class="pc-card-title">${n(s("podcastsZhangJunanTitle"))}</h3>
        <p class="pc-card-blurb">${n(s("podcastsZhangJunanLead"))}</p>
      </header>
      <div class="pc-card-body">
        <p class="zj-disclaimer" role="note">${n(s("zhangJunanDisclaimer"))}</p>
        <div id="zj-root" class="zj-root" aria-busy="true">
          <p class="zj-loading">${n(s("zhangJunanLoading"))}</p>
        </div>
      </div>
    </article>`}function Ou(){return Ru()}async function Bu(e="#zj-root"){var a;const t=typeof e=="string"?document.querySelector(e):e;if(!t)return{ok:!1,reason:"missing-root"};ze=Se,ga="",Re="all",Oe="all";try{const i=await Au();return t.setAttribute("aria-busy","false"),qe(t,i),{ok:!0,count:((a=i.posts)==null?void 0:a.length)||0}}catch(i){return t.setAttribute("aria-busy","false"),qe(t,null,{error:i}),{ok:!1,reason:String((i==null?void 0:i.message)||i)}}}const on=[{id:"godzilla",titleKey:"godzillaTitle",handleKey:"podcastsGodzillaHandle",blurbKey:"godzillaLead",marketKey:"godzillaUsFocus",market:"US",featured:!0},{id:"jensen",titleKey:"jensenTitle",handleKey:"jensenHandle",blurbKey:"jensenLead",marketKey:"jensenUsFocus",market:"US",featured:!0},{id:"gooaye",titleKey:"podcastsGooayeTitle",handleKey:null,blurbKey:"podcastsGooayeLead",marketKey:"podcastsGooayeMarket",market:"TW",featured:!1},{id:"xiaojun",titleKey:"podcastsXiaojunTitle",handleKey:"podcastsXiaojunHandle",blurbKey:"podcastsXiaojunLead",marketKey:"podcastsXiaojunMarket",market:"CN",featured:!1},{id:"whynottv",titleKey:"podcastsWhynottvTitle",handleKey:"podcastsWhynottvHandle",blurbKey:"podcastsWhynottvLead",marketKey:"podcastsWhynottvMarket",market:"CN",featured:!1},{id:"zhang-junan",titleKey:"podcastsZhangJunanTitle",handleKey:"podcastsZhangJunanHandle",blurbKey:"podcastsZhangJunanLead",marketKey:"podcastsZhangJunanMarket",market:"TW",featured:!1}],qt={godzilla:"godzilla","godzilla-playbook":"godzilla",playbook:"godzilla",哥吉拉:"godzilla",哥吉拉心法:"godzilla",jensen:"jensen",huang:"jensen","jensen-huang":"jensen",nvidia:"jensen","jen-hsun":"jensen",etl:"jensen",黃仁勳:"jensen",黄仁勋:"jensen",gooaye:"gooaye",股癌:"gooaye",xiaojun:"xiaojun",張小珺:"xiaojun",张小珺:"xiaojun",whynottv:"whynottv",whynot:"whynottv",WhynotTV:"whynottv","zhang-junan":"zhang-junan",zhangjunan:"zhang-junan",張濬安:"zhang-junan",张浚安:"zhang-junan",menu:"menu",all:"menu",index:"menu","":"menu"},Hu=new Set(["gooaye","xiaojun","whynottv","zhang-junan"]),Uu="./data/podcast-latest.json",Iu=7;let Mt=null;function _u(){return Mt||(Mt=fetch(Uu,{cache:"no-cache"}).then(e=>e.ok?e.json():null).catch(()=>null).then(e=>(e||(Mt=null),e))),Mt}function Wu(e){const t=/^(\d{4})-(\d{2})-(\d{2})$/.exec(e||"");return t?`${t[1]}/${t[2]}/${t[3]}`:""}function Fu(e){const t=Date.parse(`${e}T00:00:00+08:00`);if(!Number.isFinite(t))return!1;const a=(Date.now()-t)/864e5;return a>=-1&&a<=Iu}async function Vu(e){const t=await _u(),a=t==null?void 0:t.shows;a&&e.querySelectorAll("[data-pc-latest]").forEach(i=>{const r=a[i.dataset.pcLatest],l=Wu(r==null?void 0:r.latestDate);if(!r||!r.latestTitle||!l||!Number.isFinite(r.count))return;const o=r.kind==="posts",c=!o&&Fu(r.latestDate);i.innerHTML=`
      <p class="pc-menu-latest-title">${c?`<span class="pc-menu-new">${n(s("podcastsNewBadge"))}</span>`:""}${n(s(o?"podcastsLatestPost":"podcastsLatestEpisode",{title:r.latestTitle}))}</p>
      <p class="pc-menu-latest-meta">${n(s(o?"podcastsLatestMetaPosts":"podcastsLatestMeta",{date:l,n:String(r.count)}))}</p>`,i.hidden=!1})}let cn="menu",Ia=null;function un(e){if(e==null||e==="")return"menu";const t=String(e).trim(),a=t.toLowerCase();return qt[a]?qt[a]:qt[t]?qt[t]:on.some(i=>i.id===a)?a:"menu"}function Gu(){return`
    <article class="pc-card pc-card-featured" id="podcast-godzilla" data-podcast="godzilla">
      <header class="pc-card-head">
        <div class="pc-card-identity">
          <span class="pc-card-badge pc-badge-featured">${n(s("podcastsFeatured"))}</span>
          <span class="pc-card-badge pc-badge-us">${n(s("godzillaUsFocus"))}</span>
          <span class="pc-card-badge pc-badge-candidate">${n(s("godzillaBadgeCandidate"))}</span>
          <span class="pc-card-badge pc-badge-watch">${n(s("godzillaBadgeWatch"))}</span>
        </div>
        <h3 class="pc-card-title">${n(s("godzillaTitle"))}</h3>
        <p class="pc-card-handle">${n(s("podcastsGodzillaHandle"))}</p>
        <p class="pc-card-blurb">${n(s("godzillaLead"))}</p>
      </header>
      <div class="pc-card-body">
        <p class="gz-disclaimer" role="note">${n(s("godzillaDisclaimer"))}</p>
        <div id="gz-root" class="gz-root"></div>
      </div>
    </article>`}function Ku(){return`
    <article class="pc-card pc-card-featured pc-card-jensen" id="podcast-jensen" data-podcast="jensen">
      <header class="pc-card-head pc-card-head-jensen">
        <div class="pc-card-identity">
          <span class="pc-card-badge pc-badge-featured">${n(s("podcastsFeatured"))}</span>
          <span class="pc-card-badge pc-badge-us">${n(s("jensenUsFocus"))}</span>
          <span class="pc-card-badge pc-badge-candidate">${n(s("godzillaBadgeCandidate"))}</span>
          <span class="pc-card-badge pc-badge-watch">${n(s("godzillaBadgeWatch"))}</span>
        </div>
        <h3 class="pc-card-title">${n(s("jensenTitle"))}</h3>
        <p class="pc-card-handle">${n(s("jensenHandle"))}</p>
        <p class="pc-card-blurb">${n(s("jensenLead"))}</p>
      </header>
      <div class="pc-card-body">
        <p class="jh-disclaimer" role="note">${n(s("jensenDisclaimer"))}</p>
        <div id="jh-root" class="jh-root"></div>
      </div>
    </article>`}function Yu(){return on.map(e=>{const t=e.market==="TW"?"pc-badge-tw":e.market==="CN"?"pc-badge-cn":"pc-badge-us",a=e.featured?`<span class="pc-card-badge pc-badge-featured">${n(s("podcastsFeatured"))}</span>`:e.id==="gooaye"||e.id==="xiaojun"||e.id==="whynottv"||e.id==="zhang-junan"?`<span class="pc-card-badge pc-badge-library">${n(s(e.id==="gooaye"?"gooayeLibraryBadge":e.id==="xiaojun"?"xiaojunLibraryBadge":e.id==="whynottv"?"whynottvLibraryBadge":"zhangJunanLibraryBadge"))}</span>`:`<span class="pc-card-badge pc-badge-stub">${n(s("podcastsStubBadge"))}</span>`,i=e.handleKey?`<p class="pc-menu-handle">${n(s(e.handleKey))}</p>`:"";return`
      <button type="button" class="pc-menu-card" data-pc-cat="${n(e.id)}" aria-label="${n(s(e.titleKey))}">
        <div class="pc-menu-badges">
          ${a}
          <span class="pc-card-badge ${t}">${n(s(e.marketKey))}</span>
          <span class="pc-card-badge pc-badge-candidate">${n(s("godzillaBadgeCandidate"))}</span>
        </div>
        <h3 class="pc-menu-title">${n(s(e.titleKey))}</h3>
        ${i}
        <p class="pc-menu-blurb">${n(s(e.blurbKey))}</p>
        ${Hu.has(e.id)?`<div class="pc-menu-latest" data-pc-latest="${n(e.id)}" hidden></div>`:""}
        <span class="pc-menu-cta">${n(s("podcastsOpenCategory"))}</span>
      </button>`}).join("")}function Zu(e){return[{id:"menu",label:s("podcastsCatMenu")},...on.map(a=>({id:a.id,label:s(a.titleKey)}))].map(a=>`<button type="button" class="pc-tab${a.id===e?" is-active":""}" data-pc-cat="${n(a.id)}" role="tab" aria-selected="${a.id===e}">${n(a.label)}</button>`).join("")}function Ju(e){return e==="godzilla"?Gu():e==="jensen"?Ku():e==="gooaye"?ru():e==="xiaojun"?mu():e==="whynottv"?Pu():e==="zhang-junan"?Ou():`
    <div class="pc-menu" role="group" aria-label="${n(s("podcastsCatMenu"))}">
      <p class="pc-menu-lead">${n(s("podcastsMenuLead"))}</p>
      <div class="pc-menu-grid">${Yu()}</div>
    </div>`}function Xu(e){return!e||e==="menu"?"#podcasts":`#podcasts/${e}`}function Qu(e){const t=Xu(e);location.hash!==t&&history.replaceState(null,"",t)}function dn(e,t,{syncUrl:a=!0}={}){const i=un(t);cn=i,a&&Qu(i),e.innerHTML=`
    <div class="pc-tabs-wrap">
      <div class="pc-tabs" role="tablist" aria-label="${n(s("podcastsCategories"))}">
        ${Zu(i)}
      </div>
    </div>
    <div class="pc-panel" role="tabpanel" data-pc-panel="${n(i)}">
      ${Ju(i)}
    </div>`,e.querySelectorAll("[data-pc-cat]").forEach(r=>{r.addEventListener("click",()=>{dn(e,r.dataset.pcCat,{syncUrl:!0})})}),i==="menu"&&Vu(e),i==="godzilla"&&_c("#gz-root"),i==="jensen"&&Jc("#jh-root"),i==="gooaye"&&lu("#gy-root"),i==="xiaojun"&&yu("#xj-root"),i==="whynottv"&&Cu("#wn-root"),i==="zhang-junan"&&Bu("#zj-root")}function ed(){return`
    <section class="section podcasts-section" aria-label="${n(s("podcastsTitle"))}">
      <header class="view-header">
        <h2 class="view-title">${n(s("podcastsTitle"))}</h2>
        <p class="view-lead">${n(s("podcastsLead"))}</p>
      </header>
      <p class="pc-disclaimer" role="note">${n(s("podcastsDisclaimer"))}</p>
      <div id="pc-root" class="pc-root"></div>
    </section>`}function td(e,{syncUrl:t=!0}={}){return Ia?(dn(Ia,e,{syncUrl:t}),{ok:!0,category:cn}):{ok:!1,reason:"missing-root"}}function ad(e="#pc-root",t={}){const i=(typeof e=="string"?document.querySelector(e):e)||document.querySelector("#pc-root");if(!i)return{ok:!1,reason:"missing-root"};Ia=i;const r=un(t.category??"menu");return dn(i,r,{syncUrl:t.syncUrl!==!1}),{ok:!0,category:cn}}const nd="./data/berkshire-letters.json",ii=[{id:"early",labelKey:"lettersCatEarly"},{id:"nineties",labelKey:"lettersCat90"},{id:"twothousands",labelKey:"lettersCat00"},{id:"tens",labelKey:"lettersCat10"},{id:"recent",labelKey:"lettersCat20"},{id:"special",labelKey:"lettersCatSpecial"}],as={menu:"menu",early:"early",1977:"early",nineties:"nineties","1990s":"nineties",twothousands:"twothousands","2000s":"twothousands",tens:"tens","2010s":"tens",recent:"recent","2020s":"recent",special:"special"};let Z=null,se="menu",pe=null,dt=null;function _a(e){if(e==null||e==="")return"menu";const a=String(e).trim().toLowerCase();if(as[a])return as[a];if(/^\d{4}$/.test(a)){const i=Number(a);if(i>=1977&&i<=1989)return"early";if(i>=1990&&i<=1999)return"nineties";if(i>=2e3&&i<=2009)return"twothousands";if(i>=2010&&i<=2019)return"tens";if(i>=2020&&i<=2025)return"recent"}return"menu"}function sd(e,t){return t==="special"?"#letters/special":t&&/^\d{4}$/.test(String(t))?`#letters/${t}`:!e||e==="menu"?"#letters":`#letters/${e}`}function ri(e){return((Z==null?void 0:Z.letters)||[]).filter(t=>t.category===e)}function id(e){const a=ri(e).filter(i=>i.access!=="link-only").reduce((i,r)=>!i||r.year>i.year?r:i,null);return a?String(a.year):null}function rd(e){if(e==="special")return((Z==null?void 0:Z.letters)||[]).find(a=>a.access==="link-only")||null;if(e==null||!/^\d{4}$/.test(String(e)))return null;const t=Number(e);return((Z==null?void 0:Z.letters)||[]).find(a=>a.year===t&&a.access!=="link-only")||null}function ma(e,{syncUrl:t=!0,year:a}={}){const i=e==null||e===""?"menu":String(e).trim(),r=/^\d{4}$/.test(i)?i:null,l=i.toLowerCase()==="special",o=a!=null&&a!==""?String(a):r;if(o==="special"||l&&!r&&o==null?(se="special",pe="special"):o&&/^\d{4}$/.test(o)?(se=_a(o),pe=o):(se=_a(i),se==="menu"?pe=null:se==="special"?pe="special":pe=id(se)),t){const c=sd(se,pe);location.hash!==c&&history.replaceState(null,"",c)}pd()}function ld(e){return e.title?e.title:String(e.year)}function od(e){const t=e.filter(i=>i.access!=="link-only");if(t.length<2)return"";const a=t.slice().sort((i,r)=>r.year-i.year).map(i=>{const r=String(i.year)===String(pe);return`<button type="button" class="lt-year-chip${r?" is-on":""}" data-letter-year="${i.year}" aria-pressed="${r?"true":"false"}">${i.year}</button>`}).join("");return`
    <div class="lt-year-rail" role="group" aria-label="${n(s("lettersYearRail"))}">
      ${a}
    </div>`}function cd(e){if(!e)return`<p class="lt-note">${n(s("lettersMissing"))}</p>`;const t=e.access==="read",a=s(t?"lettersReadBadge":"lettersLinkBadge"),i=t?"pc-badge-featured":"pc-badge-stub",r=t?`<ul class="lt-points">${e.bullets.map(u=>`<li>${n(u)}</li>`).join("")}</ul>`:`<p class="lt-linkonly">${n(s("lettersLinkOnlyNote"))}</p>`,l=String(e.url||"").toLowerCase().endsWith(".pdf"),o=s(l?"lettersReaderOpenPdf":"lettersReaderOpen");return`
    <article class="lt-reader" id="${e.access==="link-only"?`letter-${e.year}-special`:`letter-${e.year}`}">
      <header class="lt-reader-head">
        <span class="pc-card-badge ${i}">${n(a)}</span>
        <h3 class="lt-reader-title">${n(ld(e))}</h3>
        <p class="lt-reader-by">${n(s("lettersAuthor"))}：${n(e.author)}</p>
      </header>
      ${r}
      <div class="lt-reader-stage" role="region" aria-label="${n(s("lettersReaderRegion"))}">
        <p class="lt-reader-note">${n(s("lettersReaderNote"))}</p>
        <a class="lt-reader-open" href="${n(e.url)}" target="_blank" rel="noopener noreferrer">${n(o)}</a>
        <p class="lt-reader-src">${n(s("lettersOfficialHost"))}</p>
      </div>
    </article>`}function ud(){const e={};for(const a of(Z==null?void 0:Z.letters)||[])e[a.category]=(e[a.category]||0)+1;const t=ii.map(a=>{const i=e[a.id]||0;return`
      <button type="button" class="pc-menu-card" data-letter-cat="${a.id}">
        <span class="pc-menu-title">${n(s(a.labelKey))}</span>
        <span class="pc-menu-blurb">${i}</span>
        <span class="pc-menu-cta">${n(s("lettersOpen"))}</span>
      </button>`}).join("");return`
    <div class="pc-menu" role="group">
      <p class="pc-menu-lead">${n(s("lettersMenuLead"))}</p>
      <div class="pc-menu-grid">${t}</div>
    </div>`}function dd(){const e=ri(se),t=ii.find(i=>i.id===se),a=rd(pe);return`
    <button type="button" class="lt-back" data-letter-cat="menu">${n(s("lettersBack"))}</button>
    <h3 class="lt-cat-title">${n(s((t==null?void 0:t.labelKey)||"lettersTitle"))}</h3>
    ${od(e)}
    ${cd(a)}`}function pd(){const e=dt==null?void 0:dt.querySelector("#lt-host");!e||!Z||(e.innerHTML=se==="menu"?ud():dd(),e.querySelectorAll("[data-letter-cat]").forEach(t=>{t.addEventListener("click",()=>ma(t.dataset.letterCat))}),e.querySelectorAll("[data-letter-year]").forEach(t=>{t.addEventListener("click",()=>ma(t.dataset.letterYear))}))}function fd(){return`
    <section class="section letters-section" aria-label="${n(s("lettersTitle"))}">
      <header class="view-header">
        <h2 class="view-title">${n(s("lettersTitle"))}</h2>
        <p class="view-lead">${n(s("lettersLead"))}</p>
      </header>
      <p class="pc-disclaimer" role="note">${n(s("lettersDisclaimer"))}</p>
      <div id="lt-root"><div id="lt-host"></div></div>
    </section>`}async function hd(e,{category:t="menu",year:a,syncUrl:i=!1}={}){if(dt=document.querySelector(e),!!dt){if(!Z){const r=await fetch(nd);if(!r.ok)throw new Error(`letters HTTP ${r.status}`);Z=await r.json()}ma(t,{syncUrl:i,year:a})}}const gd="./data/manbao.json",li=[{id:"about",labelKey:"manbaoCatAbout"},{id:"public",labelKey:"manbaoCatPublic"},{id:"decode",labelKey:"manbaoCatDecode"},{id:"tech",labelKey:"manbaoCatTech"},{id:"giants",labelKey:"manbaoCatGiants"},{id:"club",labelKey:"manbaoCatClub"}],ns={menu:"menu",about:"about",public:"public",essay:"public",decode:"decode",tech:"tech",giants:"giants",club:"club"};let U=null,ue="menu",pt=null;function pn(e){if(e==null||e==="")return"menu";const a=String(e).trim().toLowerCase();return ns[a]?ns[a]:"menu"}function oi(e){return!e||e==="menu"?"#manbao":`#manbao/${e}`}function ci(e,{syncUrl:t=!0}={}){if(ue=pn(e),t){const a=oi(ue);location.hash!==a&&history.replaceState(null,"",a)}ui()}function md(){var a;const e={about:4,public:((a=U==null?void 0:U.essays)==null?void 0:a.length)||0};for(const i of(U==null?void 0:U.posts)||[])e[i.category]=(e[i.category]||0)+1;const t=li.map(i=>{const r=e[i.id]||0;return`
      <button type="button" class="pc-menu-card" data-manbao-cat="${i.id}">
        <span class="pc-menu-title">${n(s(i.labelKey))}</span>
        <span class="pc-menu-blurb">${r}</span>
        <span class="pc-menu-cta">${n(s("manbaoOpen"))}</span>
      </button>`}).join("");return`
    <div class="pc-menu" role="group">
      <p class="pc-menu-lead">${n(s("manbaoMenuLead"))}</p>
      <p class="lt-note">${n((U==null?void 0:U.indexNote)||"")}</p>
      <div class="pc-menu-grid">${t}</div>
    </div>`}function yd(){const e=[[U.officialSite,"manny-li.com"],[U.essayIndex,"essay"],[U.proHome,"pro.manny-li.com"],[U.proJoin,"join"],[U.proPosts,"posts"]];return`
    <button type="button" class="lt-back" data-manbao-cat="menu">${n(s("manbaoBack"))}</button>
    <h3 class="lt-cat-title">${n(s("manbaoCatAbout"))}</h3>
    <div class="pc-list">
      ${e.map(([t,a])=>`
        <article class="pc-card">
          <header class="pc-card-head">
            <h3 class="pc-card-title">${n(a)}</h3>
          </header>
          <div class="lt-body">
            <a class="lt-official" href="${n(t)}" target="_blank" rel="noopener noreferrer">${n(s("manbaoOpen"))}</a>
          </div>
        </article>`).join("")}
    </div>`}function $d(){const e=U.essays||[];return`
    <button type="button" class="lt-back" data-manbao-cat="menu">${n(s("manbaoBack"))}</button>
    <h3 class="lt-cat-title">${n(s("manbaoCatPublic"))}</h3>
    <div class="pc-list">
      ${e.map(t=>`
        <article class="pc-card">
          <header class="pc-card-head">
            <div class="pc-card-identity">
              <span class="pc-card-badge pc-badge-featured">${n(s("manbaoPublicBadge"))}</span>
            </div>
            <h3 class="pc-card-title">${n(t.title)}</h3>
            <p class="pc-card-handle">${n(t.date)}</p>
          </header>
          <div class="lt-body">
            <ul class="lt-points">${t.summary.map(a=>`<li>${n(a)}</li>`).join("")}</ul>
            <a class="lt-official" href="${n(t.url)}" target="_blank" rel="noopener noreferrer">${n(s("manbaoOpen"))}</a>
          </div>
        </article>`).join("")}
    </div>`}function vd(){const e=li.find(l=>l.id===ue),t=(U.posts||[]).filter(l=>l.category===ue),a=new Map;for(const l of t){const o=(l.date||"").slice(0,4)||"—";a.has(o)||a.set(o,[]),a.get(o).push(l)}const r=[...a.keys()].map(l=>{const o=a.get(l).map(c=>`
        <li class="lt-pro-row">
          <a href="${n(c.url)}" target="_blank" rel="noopener noreferrer">${n(c.title)}</a>
          <span class="lt-pro-meta">${n(c.date)} · ${n(s("manbaoPaywallBadge"))}</span>
        </li>`).join("");return`<section class="lt-year"><h4>${n(l)}</h4><ul class="lt-pro-list">${o}</ul></section>`}).join("");return`
    <button type="button" class="lt-back" data-manbao-cat="menu">${n(s("manbaoBack"))}</button>
    <h3 class="lt-cat-title">${n(s((e==null?void 0:e.labelKey)||"manbaoTitle"))}</h3>
    <p class="lt-note">${n(s("manbaoPaywallBadge"))} · ${t.length}</p>
    ${r}`}function ui(){const e=pt==null?void 0:pt.querySelector("#mb-host");if(!e||!U)return;let t=md();ue==="about"?t=yd():ue==="public"?t=$d():ue!=="menu"&&(t=vd()),e.innerHTML=t,e.querySelectorAll("[data-manbao-cat]").forEach(a=>{a.addEventListener("click",()=>ci(a.dataset.manbaoCat))})}function bd(){return`
    <section class="section manbao-section" aria-label="${n(s("manbaoTitle"))}">
      <header class="view-header">
        <h2 class="view-title">${n(s("manbaoTitle"))}</h2>
        <p class="view-lead">${n(s("manbaoLead"))}</p>
      </header>
      <p class="pc-disclaimer" role="note">${n(s("manbaoDisclaimer"))}</p>
      <div id="mb-root"><div id="mb-host"></div></div>
    </section>`}async function kd(e,{category:t="menu",syncUrl:a=!1}={}){if(pt=document.querySelector(e),!!pt){if(!U){const i=await fetch(gd);if(!i.ok)throw new Error(`manbao HTTP ${i.status}`);U=await i.json()}if(ue=pn(t),a){const i=oi(ue);location.hash!==i&&history.replaceState(null,"",i)}ui()}}const Sd="./data/latest.json";function J(e){return e==null||Number.isNaN(e)?"flat":e>0?"up":e<0?"down":"flat"}function K(e,t=2){return e==null||Number.isNaN(e)?"—":`${e>0?"+":""}${e.toFixed(t)}%`}function ie(e,t=2){return e==null||Number.isNaN(e)?"—":Number(e).toLocaleString(D(),{minimumFractionDigits:t,maximumFractionDigits:t})}function fn(e,t){if(e==null||Number.isNaN(e))return"—";const a=t==="TWD"&&e>=100?0:2;return`${t==="USD"?"$":t==="TWD"?"NT$":""}${ie(e,a)}`}function Td(e){try{return new Date(e).toLocaleString(D(),{timeZone:"Asia/Taipei",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1})+s("taipei")}catch{return e}}function hn(e){const t=e.aboveSma20?`<span class="badge sma-on">${T("sma20","SMA20")}↑</span>`:`<span class="badge sma-off">${T("sma20","SMA20")}↓</span>`,a=e.aboveSma50?`<span class="badge sma-on">${T("sma50","SMA50")}↑</span>`:`<span class="badge sma-off">${T("sma50","SMA50")}↓</span>`;return t+a}function gn(e){return e!=null&&e.length?e.map(t=>{const a=String(t);return a==="A"?`<span class="badge screen">${T("screenA","A")}</span>`:a==="B"?`<span class="badge screen">${T("screenB","B")}</span>`:a==="C"?`<span class="badge screen">${T("screenC","C")}</span>`:a==="observe"?`<span class="badge screen">${n(s("observe"))}</span>`:`<span class="badge screen">${n(a)}</span>`}).join(""):""}const ss={tw:"https://www.twse.com.tw/zh/indices/taiex/mi-5min-indices.html",otc:"https://www.tpex.org.tw/zh-tw/mainboard/trading/info/daily-indices.html",spx:"https://www.spglobal.com/spdji/en/indices/equity/sp-500/",nasdaq:"https://www.nasdaq.com/market-activity/index/comp",sox:"https://www.nasdaq.com/market-activity/index/sox",usdTwd:"https://www.cbc.gov.tw/tw/lp-645-1.html"};function wd(e){var r,l,o,c,u;const t=[],a=(d,p,f)=>{if(!f)return;const h=f.incomplete,g=f.value!=null?ie(f.value,2):"—",m=f.date&&/^\d{4}-\d{2}-\d{2}$/.test(f.date)?`<span class="asof-tag" data-lq-field="date">${f.date.slice(5,7)}/${f.date.slice(8,10)}</span>`:"",v=f.dayPct!=null?`<div data-lq-field="dayPct" class="pct ${J(f.dayPct)}">${K(f.dayPct)}</div>`:"",S=f.session==="intraday"?` · ${T("intraday",s("intraday"))}`:"",x=ss[d],L=[f.name||d,f.date?`${s("dataAsOf")} ${f.date}${f.stale?"（上次成功值）":""}`:null,f.source||null,"official ↗"].filter(Boolean).join(" · "),N=x?`title="${n(L)}"`:"",A=`
        <div class="label">${p}${S}${m}</div>
        <div class="value" data-lq-field="value">${g}</div>
        ${v}`;x?t.push(`
      <a class="index-chip ${h&&f.value==null?"incomplete":""}" data-lq="index" data-lq-key="${n(d)}" href="${n(x)}"
         target="_blank" rel="noopener noreferrer" ${N}>${A}
      </a>`):t.push(`
      <div class="index-chip ${h?"incomplete":""}" data-lq="index" data-lq-key="${n(d)}">${A}
      </div>`)};if(a("tw",T("taiex",((r=e.tw)==null?void 0:r.name)||s("taiex")),e.tw),a("otc",T("otc",((l=e.otc)==null?void 0:l.name)||s("otc")),e.otc),a("spx",T("spx",((o=e.spx)==null?void 0:o.name)||s("spx")),e.spx),a("nasdaq",T("nasdaq",((c=e.nasdaq)==null?void 0:c.name)||s("nasdaq")),e.nasdaq),a("sox",T("sox",((u=e.sox)==null?void 0:u.name)||s("sox")),e.sox),e.usdTwd){const d=e.usdTwd,p=d.taipeiClose??d.yahoo,f=ss.usdTwd,h=["USD/TWD",s("taipeiClose")+(d.taipeiClose!=null?` ${ie(d.taipeiClose,3)}`:" —"),d.yahoo!=null?`Yahoo ${ie(d.yahoo,3)}`:null,"CBC / 台北外匯 official ↗"].filter(Boolean).join(" · ");t.push(`
      <a class="index-chip" data-lq="index" data-lq-key="usdTwd"
         data-lq-taipei-close="${d.taipeiClose!=null?n(String(d.taipeiClose)):""}"
         href="${n(f)}" target="_blank" rel="noopener noreferrer"
         title="${n(h)}">
        <div class="label">${T("usdtwd",s("usdtwd"))}</div>
        <div class="value" data-lq-field="value">${ie(p,3)}</div>
        <div class="pct flat" data-lq-field="dayPct" style="font-size:0.7rem">
          ${n(s("taipeiClose"))} ${d.taipeiClose!=null?ie(d.taipeiClose,3):"—"}
          · Yahoo ${d.yahoo!=null?ie(d.yahoo,3):"—"}
        </div>
      </a>
    `)}return t.length?`
    <div class="index-strip index-strip--marquee">
      <div class="index-marquee" tabindex="0">
        <div class="index-marquee-track">
          ${`<div class="index-marquee-group">${t.join("")}</div>`}
          <div class="index-marquee-group index-marquee-group--clone" aria-hidden="true" inert>${t.join("").replace(/<a /g,'<a tabindex="-1" ')}</div>
        </div>
      </div>
    </div>`:'<div class="index-strip index-strip--marquee"></div>'}function xd(e,t){const a=e.market==="TW"?T("twStock",s("twStock")):e.market==="US"?T("usStock",s("usStock")):n(e.market||""),i=e.rsVsIndexPp!=null?`<div class="metric"><div class="m-label">${T("rs","RS")}</div><div class="m-val ${J(e.rsVsIndexPp)}">${K(e.rsVsIndexPp)}</div></div>`:e.priorClosePct!=null?`<div class="metric"><div class="m-label">${T("priorClose",s("priorCloseFull"))}</div><div class="m-val ${J(e.priorClosePct)}">${K(e.priorClosePct)}</div></div>`:`<div class="metric"><div class="m-label">${T("rs","RS")}</div><div class="m-val">—</div></div>`;return`
    <article class="pick-card" data-lq="pick" data-lq-sym="${n(e.ticker)}">
      <div class="rank">TOP ${t}</div>
      <div class="head">
        <div class="ticker-block">
          <div class="ticker">${n(e.ticker)}</div>
          <div class="name">${n(e.name||"")}</div>
        </div>
        <div class="price-block">
          <div class="price" data-lq-field="price">${fn(e.price,e.currency)}</div>
          <div class="day-pct ${J(e.dayPct)}" data-lq-field="dayPct">${K(e.dayPct)}</div>
        </div>
      </div>
      <div class="flags">
        <span class="badge market">${a}</span>
        ${gn(e.screens)}
        ${hn(e)}
      </div>
      <div class="metrics">
        ${i}
        <div class="metric"><div class="m-label">${T("pct5d",s("pct5d"))}</div><div class="m-val ${J(e.pct5d)}">${K(e.pct5d)}</div></div>
        <div class="metric"><div class="m-label">${T("pct1m",s("pct1m"))}</div><div class="m-val ${J(e.pct1m)}">${K(e.pct1m)}</div></div>
        <div class="metric"><div class="m-label">${T("volRatio",s("volRatio"))}</div><div class="m-val">${e.volRatio!=null?ie(e.volRatio,2)+"×":"—"}</div></div>
      </div>
      ${e.business||e.why||e.risk?`<details class="fold-block card-fold"><summary>${n(s("details"))}</summary>
        ${e.business?`<p class="card-text"><strong>${n(s("business"))}</strong>　${n(e.business)}</p>`:""}
        ${e.why?`<div class="card-text"><strong>${n(s("reason"))}</strong>${Ka(e.why,n)}</div>`:""}
        ${e.risk?`<p class="card-text risk"><strong>${n(s("risk"))}</strong>　${di(e.risk)}</p>`:""}
      </details>`:""}
    </article>
  `}function di(e){let t=n(e);return t=t.replace(/漲停/g,T("limitUp",s("limitUp"))),t=t.replace(/動能/g,T("momentum",s("momentum"))),t}function is(e){return e.map(t=>{const a=t.rsVsIndexPp??t.priorClosePct,i=t.rsVsIndexPp!=null?K(t.rsVsIndexPp):t.priorClosePct!=null?K(t.priorClosePct):"—";return`
      <tr data-lq="pick" data-lq-sym="${n(t.ticker)}">
        <td><span class="ticker">${n(t.ticker)}</span></td>
        <td class="name-cell">${n(t.name||"")}</td>
        <td class="num" data-lq-field="price">${fn(t.price,t.currency)}</td>
        <td class="num ${J(t.dayPct)}" data-lq-field="dayPct">${K(t.dayPct)}</td>
        <td class="num ${J(a)}">${i}</td>
        <td class="num ${J(t.pct5d)}">${K(t.pct5d)}</td>
        <td class="num ${J(t.pct1m)}">${K(t.pct1m)}</td>
        <td class="num">${t.volRatio!=null?ie(t.volRatio,2)+"×":"—"}</td>
        <td>${hn(t)}</td>
        <td>${gn(t.screens)}</td>
        <td class="why-cell">${Ka(t.why,n)}</td>
      </tr>`}).join("")}function rs(e){return e.map(t=>{const a=t.rsVsIndexPp!=null?`<span class="${J(t.rsVsIndexPp)}">${T("rs","RS")} ${K(t.rsVsIndexPp)}</span>`:t.priorClosePct!=null?`<span class="${J(t.priorClosePct)}">${T("priorClose",s("priorClose"))} ${K(t.priorClosePct)}</span>`:"";return`
      <div class="list-card" data-lq="pick" data-lq-sym="${n(t.ticker)}">
        <div class="lc-head">
          <div>
            <span class="ticker" style="font-family:var(--mono);font-weight:600">${n(t.ticker)}</span>
            <span style="color:var(--text-muted);font-size:0.85rem;margin-left:0.35rem">${n(t.name||"")}</span>
          </div>
          <div style="text-align:right">
            <div style="font-family:var(--mono)" data-lq-field="price">${fn(t.price,t.currency)}</div>
            <div class="${J(t.dayPct)}" data-lq-field="dayPct" style="font-family:var(--mono);font-weight:600">${K(t.dayPct)}</div>
          </div>
        </div>
        <div class="lc-metrics">
          ${a}
          <span class="${J(t.pct5d)}">${T("pct5d","5d")} ${K(t.pct5d)}</span>
          <span class="${J(t.pct1m)}">${T("pct1m","1m")} ${K(t.pct1m)}</span>
          <span>${T("volRatio",s("volRatio"))} ${t.volRatio!=null?ie(t.volRatio,2)+"×":"—"}</span>
        </div>
        <div class="flags" style="margin-bottom:0.4rem">${hn(t)}${gn(t.screens)}</div>
        ${t.why?`<div class="lc-why">${Ka(t.why,n)}</div>`:""}
        ${t.risk&&t.risk!=="—"?`<p class="lc-why lc-risk">${n(s("risk"))}：${di(t.risk)}</p>`:""}
      </div>`}).join("")}function Pd(){return`
    <tr>
      <th>${T("ticker",s("ticker"))}</th>
      <th>${n(s("name"))}</th>
      <th>${n(s("price"))}</th>
      <th>${T("dayPct",s("dayPct"))}</th>
      <th>${T("rs","RS")}／${T("priorClose",s("priorClose"))}</th>
      <th>${T("pct5d",s("pct5d"))}</th>
      <th>${T("pct1m",s("pct1m"))}</th>
      <th>${T("volRatio",s("volRatio"))}</th>
      <th>${n(s("ma"))}</th>
      <th>${T("screening",s("screening"))}</th>
      <th>${n(s("reason"))}</th>
    </tr>`}function ls(e){return e?e.market==="TW"||e.market==="US"?e.market:String(e.ticker||"").toUpperCase().endsWith(".TW")?"TW":"US":"US"}function os(e,t){return e.length?`<div class="top5-grid">${e.map((a,i)=>xd(a,i+1)).join("")}</div>`:`<div class="empty-state">${n(s("emptyTop",{market:t}))}</div>`}function mn(){return[{id:"today",label:s("navToday"),hash:"today"},{id:"logic",label:s("navLogic"),hash:"logic"},{id:"research",label:s("navResearch"),hash:"research"},{id:"strategies",label:s("navStrategies"),hash:"strategies"},{id:"options",label:s("navOptions"),hash:"options"},{id:"earnings",label:s("navEarnings"),hash:"earnings"},{id:"lookup",label:s("navLookup"),hash:"lookup"},{id:"soxl",label:s("navSoxl"),hash:"soxl"},{id:"txf",label:s("navTxf"),hash:"txf"},{id:"podcasts",label:s("navPodcasts"),hash:"podcasts"},{id:"letters",label:s("navLetters"),hash:"letters"},{id:"manbao",label:s("navManbao"),hash:"manbao"},{id:"paper",label:s("navPaper"),hash:"paper"}]}const Cd=["today","strategies","paper","research"],pi=["logic","options","earnings","lookup","soxl","txf","podcasts","letters","manbao"],gt={today:"today",logic:"logic",research:"research",strategies:"strategies",options:"options",earnings:"earnings",lookup:"lookup",quote:"lookup",soxl:"soxl",txf:"txf","futures-tw":"txf",台指期:"txf",臺指期:"txf","tx-futures":"txf",podcasts:"podcasts",podcast:"podcasts",名人podcast:"podcasts","celebrity-podcasts":"podcasts",godzilla:"podcasts",jensen:"podcasts",xiaojun:"podcasts",whynottv:"podcasts","zhang-junan":"podcasts",zhangjunan:"podcasts",張濬安:"podcasts",whynot:"podcasts",huang:"podcasts","jensen-huang":"podcasts",黃仁勳:"podcasts",nvidia:"podcasts",letters:"letters",berkshire:"letters",buffett:"letters",股東信:"letters",股东信:"letters",巴菲特:"letters",manbao:"manbao","mann-pro":"manbao",曼報:"manbao",曼报:"manbao",曼報pro:"manbao",曼報Pro:"manbao",paper:"paper",social:"today",danmaku:"today","social-digest":"today",giscus:"today",help:"logic",glossary:"logic",bookshelf:"research",library:"research",研究:"research","us-options":"options",選擇權:"options",美股選擇權:"options",mcmillan:"options",讀財報:"earnings",reports:"earnings","us-earnings":"earnings",財報:"earnings",查股:"lookup",個股:"lookup","stock-lookup":"lookup","us-quote":"lookup","tw-quote":"lookup","soxl-desk":"soxl",semiconductor:"soxl",半導體:"soxl",三倍半導體:"soxl",台指期貨:"txf",臺股期貨:"txf",哥吉拉:"podcasts",哥吉拉心法:"podcasts","godzilla-playbook":"podcasts",playbook:"podcasts",黃仁勳:"podcasts","jen-hsun":"podcasts",etl:"podcasts",method:"logic",邏輯:"logic"},Wa={today:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 2h2v2h6V2h2v2h3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3V2zm12 8H5v10h14V10zm-2-5H7v2h10V5z"/></svg>',logic:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 2h2v2h-2v-2zm3 0h2v2h-2v-2zm-3 3h2v2h-2v-2zm3 0h2v2h-2v-2zm3-3h2v5h-2v-5z"/></svg>',research:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm8 1.5V8h4.5L14 3.5zM8 12h8v1.5H8V12zm0 3.5h8V17H8v-1.5zm0 3.5h5V20.5H8V19z"/></svg>',strategies:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 19h16v2H4v-2zm2.5-3.5 4-4 3 3L21 6.5 19.5 5l-6 7.5-3-3L4 14.5l2.5 1z"/></svg>',options:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 12a8 8 0 1 1 16 0H4zm8-6a6 6 0 0 0-5.65 4h11.3A6 6 0 0 0 12 6zm0 12a6 6 0 0 0 5.65-4H6.35A6 6 0 0 0 12 18z"/></svg>',earnings:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 3h14a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm2 4v2h10V7H7zm0 4v2h10v-2H7zm0 4v2h6v-2H7z"/></svg>',lookup:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10 3a7 7 0 0 1 5.47 11.34l4.1 4.09-1.42 1.42-4.09-4.1A7 7 0 1 1 10 3zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/></svg>',soxl:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 17.25 9.5 9l3.5 4.5L17 8l4 9.25H3zM5 19h14v2H5v-2z"/></svg>',txf:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 18h16v2H4v-2zm1.5-3.5 3.2-4.2 2.8 3.3L16 8l4 6.5H5.5zM7 4h2v2H7V4zm4 0h2v2h-2V4zm4 0h2v2h-2V4z"/></svg>',podcasts:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3a9 9 0 0 0-9 9v7a2 2 0 0 0 2 2h3v-8H7v-1a5 5 0 0 1 10 0v1h-1v8h3a2 2 0 0 0 2-2v-7a9 9 0 0 0-9-9zm-4 11v5H5v-5h3zm11 5h-3v-5h3v5zM12 7a3 3 0 0 0-3 3v1h6v-1a3 3 0 0 0-3-3z"/></svg>',letters:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm8 8.2L5.2 6.5 4 7.9l8 6.2 8-6.2-1.2-1.4L12 12.2z"/></svg>',manbao:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 3h11l4 4v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm10 1.5V8h3.5L15 4.5zM7 11h10v1.6H7V11zm0 3.4h10v1.6H7v-1.6zM7 18h6v1.6H7V18z"/></svg>',paper:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 14.93V17h-2v-.07A8.01 8.01 0 0 1 5.07 13H7v-2H5.07A8.01 8.01 0 0 1 11 5.07V7h2V5.07A8.01 8.01 0 0 1 18.93 11H17v2h1.93A8.01 8.01 0 0 1 13 16.93z"/></svg>',more:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 10h4v4H5v-4zm5 0h4v4h-4v-4zm5 0h4v4h-4v-4z"/></svg>'},Rt={godzilla:"godzilla","godzilla-playbook":"godzilla",playbook:"godzilla",哥吉拉:"godzilla",哥吉拉心法:"godzilla",jensen:"jensen",huang:"jensen","jensen-huang":"jensen",nvidia:"jensen","jen-hsun":"jensen",etl:"jensen",黃仁勳:"jensen",黄仁勋:"jensen",gooaye:"gooaye",股癌:"gooaye",xiaojun:"xiaojun",張小珺:"xiaojun",张小珺:"xiaojun",whynottv:"whynottv",whynot:"whynottv",WhynotTV:"whynottv","zhang-junan":"zhang-junan",zhangjunan:"zhang-junan",張濬安:"zhang-junan",张浚安:"zhang-junan"};function ya(){const a=(location.hash||"").replace(/^#/,"").split(/[/?&]/).filter(Boolean).map(d=>{try{return decodeURIComponent(d)}catch{return d}}),i=a[0]||"",r=i.toLowerCase();if(Rt[r]||Rt[i])return{view:"podcasts",sub:Rt[r]||Rt[i],parts:a.slice(1)};const l=gt[r]||gt[i]||"today",o=a.slice(1);let c=o[0]||null;l==="podcasts"&&c&&(c=un(c));let u=null;if(l==="letters"){const d=o.find(h=>/^\d{4}$/.test(h)),p=o.some(h=>String(h).toLowerCase()==="special");p?u="special":d&&(u=d);const f=p?"special":d||c;f&&(c=_a(f))}if(l==="manbao"&&c&&(c=pn(c)),l==="research"&&c){if(c.toLowerCase()==="shelf"&&o[1])return{view:l,sub:"menu",shelf:o[1],parts:o};c=Xa(c)}return{view:l,sub:c,parts:o,shelf:null,letterYear:u}}function Ld(){return ya().view}function fi(e,t){const a=Wa[e.id]||"";return`
      <button type="button"
        class="nav-item"
        data-nav="${e.id}"
        data-variant="${t}"
        aria-label="${n(e.label)}"
        aria-current="false">
        <span class="nav-icon">${a}</span>
        <span class="nav-label">${n(e.label)}</span>
      </button>`}function jd(e){return mn().map(t=>fi(t,e)).join("")}function Ad(){const e=Object.fromEntries(mn().map(r=>[r.id,r])),t=Cd.map(r=>fi(e[r],"mobile")).join(""),a=`
      <button type="button"
        class="nav-item nav-more-btn"
        data-nav-more
        data-variant="mobile"
        aria-label="${n(s("navMore"))}"
        aria-haspopup="dialog"
        aria-expanded="false"
        aria-controls="nav-more-sheet"
        aria-current="false">
        <span class="nav-icon">${Wa.more}</span>
        <span class="nav-label">${n(s("navMore"))}</span>
      </button>`,i=pi.map(r=>{const l=e[r],o=Wa[r]||"";return`
        <button type="button"
          class="nav-more-item"
          data-nav="${l.id}"
          aria-label="${n(l.label)}"
          aria-current="false">
          <span class="nav-icon">${o}</span>
          <span class="nav-label">${n(l.label)}</span>
        </button>`}).join("");return`
    <nav class="nav-bottom" aria-label="${n(s("navMain"))}">
      ${t}
      ${a}
    </nav>
    <div id="nav-more-sheet" class="nav-more-sheet" hidden>
      <button type="button" class="nav-more-backdrop" data-more-close aria-label="${n(s("navMoreClose"))}"></button>
      <div class="nav-more-panel" role="dialog" aria-modal="true" aria-label="${n(s("navMore"))}">
        <div class="nav-more-grabber" aria-hidden="true"></div>
        <div class="nav-more-head">
          <h2 class="nav-more-title">${n(s("navMore"))}</h2>
          <button type="button" class="nav-more-close" data-more-close aria-label="${n(s("navMoreClose"))}">×</button>
        </div>
        <div class="nav-more-list">
          ${i}
        </div>
      </div>
    </div>`}function Ed(e,t){const a=e.top5||[],i=e.us||[],r=e.tw||[],l=n(s("disclaimer")),o=Pd();return`
    <a class="skip-link" href="#main-content">${n(s("skipToContent"))}</a>
    <header class="site-chrome">
      <div class="chrome-row">
        <div class="chrome-brand">
          <img class="brand-mark" src="/just-math-and-luck/logo.svg?v=5" width="40" height="40" alt="每日數學選股" decoding="async" />
          <div class="brand-text">
            <h1>${n(s("siteTitle"))}</h1>
            <p class="brand-meta"><span id="brand-asof">${n(s("dataAsOf"))} ${Td(e.asOf)}</span><span id="lq-live-suffix" class="lq-live-suffix" hidden aria-live="polite"></span></p>
          </div>
        </div>
        <div class="chrome-actions">
          ${xi()}
          <nav class="nav-desktop" aria-label="${n(s("navMain"))}">
            ${jd("desktop")}
          </nav>
        </div>
      </div>
      <p class="disclaimer-line" role="note">${l}</p>
      <div class="market-strip-wrap" aria-label="${n(s("marketQuotes"))}">
        <span class="market-strip-label">${n(s("hot"))}</span>
        ${wd(e.indices||{})}
      </div>
      ${mc()}
      ${jc()}
    </header>

    <main class="view-host" id="main-content" tabindex="-1">
      <div class="view" id="view-today" data-view="today" hidden>
        <span id="today" class="view-anchor" tabindex="-1"></span>
        <header class="view-header view-header-tight">
          <h2 class="view-title">${n(s("todayPicks"))}</h2>
        </header>
        ${fr(e.marketRegime)}
        <div class="tabs market-tabs" role="tablist" aria-label="${n(s("market"))}">
          <button type="button" class="tab-btn active" data-tab="us" role="tab" aria-selected="true">${T("usStock",s("usStock"))}（${i.length}）</button>
          <button type="button" class="tab-btn" data-tab="tw" role="tab" aria-selected="false">${T("twStock",s("twStock"))}（${r.length}）</button>
        </div>
        <div class="panel active" id="panel-us" role="tabpanel">
          <section class="section">
            <h2 class="section-title">${n(s("usTop"))}</h2>
            ${os(a.filter(u=>ls(u)==="US"),s("usStock"))}
          </section>
          <section class="section">
            <h2 class="section-title">${n(s("usList"))}</h2>
            <div class="table-wrap">
              <table class="stock-table">
                <thead>${o}</thead>
                <tbody>${is(i)}</tbody>
              </table>
            </div>
            <div class="mobile-list">${rs(i)}</div>
          </section>
        </div>
        <div class="panel" id="panel-tw" role="tabpanel">
          <section class="section">
            <h2 class="section-title">${n(s("twTop"))}</h2>
            ${os(a.filter(u=>ls(u)==="TW"),s("twStock"))}
          </section>
          <section class="section">
            <h2 class="section-title">${n(s("twList"))}</h2>
            <div class="table-wrap">
              <table class="stock-table">
                <thead>${o}</thead>
                <tbody>${is(r)}</tbody>
              </table>
            </div>
            <div class="mobile-list">${rs(r)}</div>
          </section>
        </div>
      </div>
      <div class="view" id="view-logic" data-view="logic" hidden>
        <span id="logic" class="view-anchor" tabindex="-1"></span>
        ${gr(e)}
      </div>

      <div class="view" id="view-research" data-view="research" hidden>
        <span id="research" class="view-anchor" tabindex="-1"></span>
        ${Wr()}
      </div>

      <div class="view" id="view-strategies" data-view="strategies" hidden>
        <span id="strategies" class="view-anchor" tabindex="-1"></span>
        ${xr()}
      </div>

      <div class="view" id="view-options" data-view="options" hidden>
        <span id="options" class="view-anchor" tabindex="-1"></span>
        ${fl()}
      </div>

      <div class="view" id="view-earnings" data-view="earnings" hidden>
        <span id="earnings" class="view-anchor" tabindex="-1"></span>
        ${Tl()}
      </div>

      <div class="view" id="view-lookup" data-view="lookup" hidden>
        <span id="lookup" class="view-anchor" tabindex="-1"></span>
        <span id="quote" class="view-anchor" tabindex="-1"></span>
        ${co()}
      </div>

      <div class="view" id="view-soxl" data-view="soxl" hidden>
        <span id="soxl" class="view-anchor" tabindex="-1"></span>
        ${mo()}
      </div>

      <div class="view" id="view-txf" data-view="txf" hidden>
        <span id="txf" class="view-anchor" tabindex="-1"></span>
        <span id="futures-tw" class="view-anchor" tabindex="-1"></span>
        ${jo()}
      </div>

      <div class="view" id="view-podcasts" data-view="podcasts" hidden>
        <span id="podcasts" class="view-anchor" tabindex="-1"></span>
        <span id="godzilla" class="view-anchor" tabindex="-1"></span>
        <span id="jensen" class="view-anchor" tabindex="-1"></span>
        <span id="xiaojun" class="view-anchor" tabindex="-1"></span>
        <span id="whynottv" class="view-anchor" tabindex="-1"></span>
        <span id="zhang-junan" class="view-anchor" tabindex="-1"></span>
        ${ed()}
      </div>

      <div class="view" id="view-letters" data-view="letters" hidden>
        <span id="letters" class="view-anchor" tabindex="-1"></span>
        ${fd()}
      </div>

      <div class="view" id="view-manbao" data-view="manbao" hidden>
        <span id="manbao" class="view-anchor" tabindex="-1"></span>
        ${bd()}
      </div>

      <div class="view" id="view-paper" data-view="paper" hidden>
        <span id="paper" class="view-anchor" tabindex="-1"></span>
        ${Hi(t)}
      </div>
    </main>

    ${Ad()}

    <footer class="site-footer">${n(s("footer"))}</footer>
  `}let Qe=null;function Dd(){try{return typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches}catch{return!1}}function Kt(e,t){const a=e.querySelector("#nav-more-sheet"),i=e.querySelector("[data-nav-more]");if(!a||!i)return;if(Qe&&(clearTimeout(Qe),Qe=null),t){a.hidden=!1,requestAnimationFrame(()=>{requestAnimationFrame(()=>{a.hidden||a.classList.add("is-open")})}),i.setAttribute("aria-expanded","true"),document.body.classList.add("nav-more-open");return}const r=a.classList.contains("is-open")||!a.hidden;if(a.classList.remove("is-open"),i.setAttribute("aria-expanded","false"),document.body.classList.remove("nav-more-open"),!r||Dd()){a.hidden=!0;return}Qe=setTimeout(()=>{a.hidden=!0,Qe=null},340)}function zd(e,t){const a=pi.includes(t);e.querySelectorAll(".nav-item[data-nav]").forEach(r=>{const l=r.dataset.nav===t;r.classList.toggle("is-active",l),r.setAttribute("aria-current",l?"page":"false")});const i=e.querySelector("[data-nav-more]");i&&(i.classList.toggle("is-active",a),i.setAttribute("aria-current",a?"true":"false")),e.querySelectorAll(".nav-more-item").forEach(r=>{const l=r.dataset.nav===t;r.classList.toggle("is-active",l),r.setAttribute("aria-current",l?"page":"false")})}function Nd(e){const t=s("siteTitle"),a=mn().find(i=>i.id===e);document.title=a!=null&&a.label?`${a.label} · ${t}`:t}function qd(e){var a;const t=(a=e==null?void 0:e.querySelector)==null?void 0:a.call(e,"#main-content");if(t)try{t.focus({preventScroll:!0})}catch{t.focus()}}function Yt(e,t,{updateHash:a=!0,scrollTop:i=!0}={}){const r=gt[t]||"today";if(e.querySelectorAll(".view").forEach(l=>{const o=l.dataset.view===r;l.hidden=!o,l.classList.toggle("is-active",o)}),zd(e,r),Kt(e,!1),Nd(r),a){const l=`#${r}`;location.hash!==l&&history.replaceState(null,"",l)}return i&&(window.scrollTo(0,0),qd(e)),r}let Ot=null,Bt=null,Ht=null;function Md(e){const t=(l,o)=>{const c=Yt(e,l,o);return $a(c),c};e.querySelectorAll(".nav-item[data-nav], .nav-more-item[data-nav]").forEach(l=>{l.addEventListener("click",()=>t(l.dataset.nav))}),Ht&&e.removeEventListener("click",Ht),Ht=l=>{var c,u;const o=(u=(c=l.target)==null?void 0:c.closest)==null?void 0:u.call(c,"[data-jump]");o&&e.contains(o)&&t(o.dataset.jump)},e.addEventListener("click",Ht);const a=e.querySelector("[data-nav-more]");a&&a.addEventListener("click",()=>{const l=a.getAttribute("aria-expanded")==="true";Kt(e,!l)}),e.querySelectorAll("[data-more-close]").forEach(l=>{l.addEventListener("click",()=>Kt(e,!1))}),Bt&&window.removeEventListener("keydown",Bt),Bt=l=>{l.key==="Escape"&&Kt(e,!1)},window.addEventListener("keydown",Bt),Ot&&window.removeEventListener("hashchange",Ot),Ot=()=>{const l=ya(),o=Yt(e,l.view,{updateHash:!1});$a(o,l).then(()=>Rd(l))},window.addEventListener("hashchange",Ot);const i=ya(),r=!!(i.sub||i.shelf);return Yt(e,i.view,{updateHash:!r,scrollTop:!1}),{go:t}}function Rd(e){e&&(e.view==="podcasts"&&td(e.sub||"menu",{syncUrl:!1}),e.view==="research"&&Zr(e.sub||"menu",{syncUrl:!1,shelf:e.shelf||null}),e.view==="letters"&&ma(e.sub||"menu",{syncUrl:!1,year:e.letterYear}),e.view==="manbao"&&ci(e.sub||"menu",{syncUrl:!1}))}function Od(e){const t=e.querySelector(".index-marquee");if(!t||t.dataset.marqueeBound==="1")return;t.dataset.marqueeBound="1";const a=()=>t.classList.add("is-paused"),i=()=>t.classList.remove("is-paused");t.addEventListener("pointerdown",a),t.addEventListener("pointerup",i),t.addEventListener("pointercancel",i),t.addEventListener("pointerleave",i),t.addEventListener("touchstart",a,{passive:!0}),t.addEventListener("touchend",i,{passive:!0}),t.addEventListener("touchcancel",i,{passive:!0})}function Bd(e){const t=e.querySelectorAll(".tab-btn");t.forEach(a=>{a.addEventListener("click",()=>{const i=a.dataset.tab;t.forEach(r=>{const l=r.dataset.tab===i;r.classList.toggle("active",l),r.setAttribute("aria-selected",l?"true":"false")}),e.querySelectorAll(".panel").forEach(r=>{r.classList.toggle("active",r.id===`panel-${i}`)})})})}let yn=null,hi=null;async function gi(e){const t=yn,a=hi,i=Ld();e.innerHTML=Ed(t,a),it=new Map,document.title=s("siteTitle"),Aa(),Md(e);const r=ya(),l=!!(r.sub||r.shelf);Yt(e,i,{updateHash:!l,scrollTop:!1}),Bd(e),Od(e),await $c("#us-macro-strip"),await Ec("#tw-macro-strip"),Ui(e),a&&await za(e,a),Pi(e),await $a(r.view,r),sc(e),Ud()}let it=new Map;const Hd={strategies:()=>jr("#xq-root"),research:e=>Jr("#rl-root",void 0,{category:e.view==="research"&&e.sub||"menu",shelf:e.view==="research"?e.shelf:null,syncUrl:!1}),options:()=>hl("#uo-root"),earnings:()=>wl("#er-root"),lookup:()=>uo("#lk-root"),soxl:()=>yo("#sx-root"),txf:()=>Ao("#txf-root"),podcasts:e=>ad("#pc-root",{category:e.view==="podcasts"&&e.sub||"menu",syncUrl:!1}),letters:e=>hd("#lt-root",{category:e.view==="letters"&&e.sub||"menu",year:e.view==="letters"?e.letterYear:void 0,syncUrl:!1}),manbao:e=>kd("#mb-root",{category:e.view==="manbao"&&e.sub||"menu",syncUrl:!1})};function $a(e,t=null){const a=gt[e]||e,i=Hd[a];if(!i)return Promise.resolve(!1);if(it.has(a))return it.get(a);const r=t&&(gt[t.view]||t.view)===a?t:{view:a},l=Promise.resolve().then(()=>i(r)).then(()=>(ic(),!0)).catch(o=>(console.warn(`section ${a} init failed`,o),it.delete(a),!1));return it.set(a,l),l}function Ud(){const e=()=>{for(const t of["strategies","earnings","txf","soxl"])$a(t)};"requestIdleCallback"in window?window.requestIdleCallback(e,{timeout:4e3}):window.setTimeout(e,2500)}async function Id(){const e=document.getElementById("app");!e||!yn||(si(),await gi(e))}async function Fa(){const e=document.getElementById("app"),t=Ti();Aa();const a=document.getElementById("loading");a&&(a.textContent=s("loading"));try{const i=await fetch(Sd);if(!i.ok)throw new Error(`HTTP ${i.status}`);yn=await i.json(),hi=await Ii(),await t,Aa(),await gi(e),Fa._langHooked||(Fa._langHooked=!0,ki(()=>{Id()}))}catch(i){e.innerHTML=`<div class="error">${n(s("loadError",{msg:i.message}))}</div>`}}function _d(){if(!("serviceWorker"in navigator))return;const e="/just-math-and-luck/",t=`${e}sw.js`,a="jml-sw-controller-reload";navigator.serviceWorker.addEventListener("controllerchange",()=>{try{if(sessionStorage.getItem(a)==="1"){sessionStorage.removeItem(a);return}sessionStorage.setItem(a,"1")}catch{}window.location.reload()}),window.addEventListener("load",()=>{navigator.serviceWorker.register(t,{scope:e}).catch(()=>{})})}const cs="jml-pwa-hint-dismissed";function Wd(){try{if(window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===!0)return!0}catch{}return!1}function Fd(){return/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent||"")}function Vd(){var r;if(Wd()||!Fd())return;try{if(localStorage.getItem(cs)==="1")return}catch{return}if(document.getElementById("pwa-install-hint"))return;const e=document.createElement("div");e.id="pwa-install-hint",e.className="pwa-install-hint",e.setAttribute("role","status");const a=/iPhone|iPad|iPod/i.test(navigator.userAgent||"")?"可「分享 → 加入主畫面」離線開啟":"可加入主畫面，離線也能開";e.innerHTML=`<span class="pwa-install-hint__text">${a}</span><button type="button" class="pwa-install-hint__close" aria-label="關閉">×</button>`,document.body.appendChild(e);const i=()=>{e.remove();try{localStorage.setItem(cs,"1")}catch{}};(r=e.querySelector(".pwa-install-hint__close"))==null||r.addEventListener("click",i),window.setTimeout(()=>{e.isConnected&&e.classList.add("pwa-install-hint--fade")},8e3),window.setTimeout(()=>{e.isConnected&&i()},12e3)}_d();Fa();window.setTimeout(()=>{try{Vd()}catch{}},2500);
