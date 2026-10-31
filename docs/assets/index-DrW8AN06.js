(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const l of o.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&i(l)}).observe(document,{childList:!0,subtree:!0});function a(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(r){if(r.ep)return;r.ep=!0;const o=a(r);fetch(r.href,o)}})();const dn="modulepreload",un=function(e){return"/just-math-and-luck/"+e},ja={},se=function(t,a,i){let r=Promise.resolve();if(a&&a.length>0){let l=function(d){return Promise.all(d.map(p=>Promise.resolve(p).then(h=>({status:"fulfilled",value:h}),h=>({status:"rejected",reason:h}))))};document.getElementsByTagName("link");const c=document.querySelector("meta[property=csp-nonce]"),u=(c==null?void 0:c.nonce)||(c==null?void 0:c.getAttribute("nonce"));r=l(a.map(d=>{if(d=un(d),d in ja)return;ja[d]=!0;const p=d.endsWith(".css"),h=p?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${d}"]${h}`))return;const g=document.createElement("link");if(g.rel=p?"stylesheet":dn,p||(g.as="script"),g.crossOrigin="",g.href=d,u&&g.setAttribute("nonce",u),document.head.appendChild(g),p)return new Promise((f,k)=>{g.addEventListener("load",f),g.addEventListener("error",()=>k(new Error(`Unable to preload CSS for ${d}`)))})}))}function o(l){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=l,window.dispatchEvent(c),!c.defaultPrevented)throw l}return r.then(l=>{for(const c of l||[])c.status==="rejected"&&o(c.reason);return t().catch(o)})},ps=[{id:"zh-Hant",label:"繁體中文",short:"繁"},{id:"en",label:"English",short:"EN"},{id:"zh-Hans",label:"简体中文",short:"简"},{id:"ja",label:"日本語",short:"日"}],hs=ps.map(e=>e.id),gs="site-lang",Be="zh-Hant",Ut=new Set;function pn(){try{const t=localStorage.getItem(gs);if(t&&hs.includes(t))return t}catch{}const e=typeof navigator<"u"&&navigator.language||"";return/^zh[-_]?(CN|Hans|SG)/i.test(e)?"zh-Hans":/^zh/i.test(e)?"zh-Hant":/^ja/i.test(e)?"ja":/^en/i.test(e)?"en":Be}let N=pn();function Dt(){return N}let Ca=0;async function hn(e){if(!hs.includes(e))return!1;const t=++Ca;if(e===N||!await ms(e)||t!==Ca||e===N)return!1;N=e;try{localStorage.setItem(gs,e)}catch{}return typeof document<"u"&&(document.documentElement.lang=e==="zh-Hant"?"zh-Hant":e==="zh-Hans"?"zh-Hans":e),Ut.forEach(a=>{try{a(e)}catch{}}),!0}function gn(e){return Ut.add(e),()=>Ut.delete(e)}function R(){return N==="en"?"en-US":N==="ja"?"ja-JP":N==="zh-Hans"?"zh-CN":"zh-TW"}function It(){typeof document>"u"||(document.documentElement.lang=N==="zh-Hant"?"zh-Hant":N==="zh-Hans"?"zh-Hans":N)}const fs={siteTitle:"每日數學選股",loading:"載入中…",disclaimer:"投資涉及風險，資訊僅供參考，非投資建議",footer:"投資涉及風險，資訊僅供參考，非投資建議",dataAsOf:"資料",taipei:"（台北）",navMain:"主要導覽",skipToContent:"跳到主要內容",navToday:"今日",navStrategies:"策略",navPaper:"模擬",navMore:"更多",navMoreClose:"關閉",navLogic:"邏輯",researchTitle:"研究",navResearch:"研究",navOptions:"選擇權",navEarnings:"讀財報",earningsTitle:"讀財報",earningsLead:"美股 Magnificent 7 與高關注財報摘要：公司在做什麼、關鍵數字、下一步看什麼——白話、每日更新，非投資建議。",earningsDisclaimer:"非投資建議。數字來自公開 Yahoo Finance；缺欄略過不顯示，不構成個人化投資建議。",earningsUsFocus:"以美股為主",earningsTwStub:"台股財報稍後開放（規劃中）",earningsSelectionTitle:"關注名單規則：",earningsSelectionFallback:"除了 Mag7，再挑未來 14 天內要公布財報、市值最大的美國大公司；也納入 Yahoo 當日成交最熱、近期剛公布或即將公布的股票。名單不滿時，用 45 天內的重要財報補上，最多 14 家。",earningsLatestDate:"最近財報",earningsReportedOn:"{date} 已公布",earningsResultTitle:"這次財報結果",earningsReportedHead:"{date} 已公布（{q} 那一季）。",earningsReportedEps:"每股盈餘（EPS）{a} 美元",earningsBeat:"，市場原本預估 {e}，高於預估 {p}%。",earningsMiss:"，市場原本預估 {e}，低於預估 {p}%。",earningsInline:"，與市場預估 {e} 相同。",earningsGaapNote:"這兩個數字都是調整後的算法（扣掉一次性或非現金項目），用同一套標準比；照會計準則算是 {g} 美元。",earningsNoSameBasis:"。這個數字含一次性收益或費用，市場預估沒有含，兩者不能直接比，所以不標高於或低於預估。",earningsNextUnknown:"下一次財報日期公司尚未公布。",earningsReportedPending:"{date} 已公布；這次的數字資料源還沒更新，明天再看。",earningsInDays:"還有 {n} 天",earningsToday:"今天公布",earningsWatchUpcoming:"{date} 公布，還有 {n} 天。重點看營收和每股盈餘（EPS）有沒有達到市場預估。",earningsWatchToday:"今天（美東時間）公布。重點看營收和每股盈餘（EPS）有沒有達到市場預估。",earningsWatchConsensus:"市場預估這次 EPS 約 {e} 美元。",earningsWatchTrend:"最近一年營收成長 {rev}、獲利成長 {eps}（Yahoo）。",earningsMag7Title:"Magnificent 7",earningsMag7Lead:"AAPL、MSFT、NVDA、AMZN、GOOGL／GOOG、META、TSLA——上次財報與下次日期（已知時）。",earningsMag7Badge:"Mag7",earningsHotTitle:"高關注／熱門財報",earningsHotLead:"依上方規則挑選；標籤說明為何入選。",earningsHotEmpty:"目前視窗內暫無符合條件的標的",earningsWhatItDoes:"這家公司在做什麼",earningsSchedTitle:"財報時程",earningsSchedLead:"依公布日期（美東時間）排好；點代號直接跳到那家公司。",earningsSchedDone:"已公布",earningsWhatToWatch:"下一步看什麼",earningsNextDate:"下次財報",earningsLastEps:"上次 EPS",earningsRevYoy:"營收年增",earningsEpsYoy:"獲利年增",earningsPe:"本益比",earningsForwardPe:"預估本益",earningsEstimate:"預估",earningsDataMissing:"資料不足",earningsTagPrimary:"14 日內・大型",earningsTagActives:"熱門成交・14 日內",earningsTagRecent:"近日已公布",earningsTagFallback:"45 日行事曆亮點",earningsTagOther:"關注",earningsPartialBlocker:"部分資料受阻",earningsRefreshHow:"資料會隨站點更新；若畫面異常請稍後再試。",earningsLoadError:"無法載入財報摘要（{msg}）",earningsEmpty:"財報摘要整理中，請稍後再看。",navLookup:"查股",lookupTitle:"查股／個股",lookupLead:"輸入美股或台股代碼，查看公司簡介、即時報價、財報重點與官方財報連結——白話整理；行情來自 Yahoo，官方申報連至 SEC／公開資訊觀測站。非投資建議。",lookupDisclaimer:"非投資建議。行情數字來自公開 Yahoo Finance；官方財報連結連至 SEC EDGAR／公開資訊觀測站。缺欄不顯示、不編造。即時抓取可能受網路或來源限制。",lookupInputLabel:"股票代碼",lookupPlaceholderUs:"例如 AAPL",lookupPlaceholderTw:"例如 2330 或 2330.TW",lookupHintUs:"美股：輸入代號如 AAPL、MSFT、NVDA",lookupHintTw:"台股：四碼代號如 2330（自動加 .TW；上櫃可試 .TWO）",lookupSearch:"查詢",lookupIdle:"輸入代碼後按查詢，即可查看報價與財報摘要。",lookupLoading:"正在向 Yahoo Finance 抓取…",lookupEmptyInput:"請輸入股票代碼",lookupInvalid:"代碼格式無法辨識。美股如 AAPL；台股如 2330 或 2330.TW",lookupNotFound:"找不到此代碼的報價。請確認市場分頁（美股／台股）與代碼是否正確。",lookupUnreachTitle:"即時報價暫時連不上——不是代碼打錯",lookupUnreachBody:"本站透過公開轉接服務向 Yahoo 讀取行情，現在對方拒絕連線或逾時（常見於轉接服務限流或網路壅塞）。請等一兩分鐘再按「重試」。下面先列出本站已整理好的官方資料與連結，不放任何猜的數字。",lookupRetry:"重試",lookupOfflineTag:"未含即時報價",lookupOfflineUnknown:"本站資料裡還沒有這檔；連線恢復後按「重試」就能確認代碼。",lookupOfflineDigestAsOf:"以上是本站 {at}（台北）整理的公開財報日程，不是即時資料。",lookupBizSrcDigest:"本站 {at}（台北）整理的 Yahoo 公開公司簡介",lookupEstSuffix:"（預估）",lookupOfflineFilingsNote:"近期 10-K／10-Q／8-K 清單要連上 SEC 才列得出來，暫時無法載入。",lookupError:"查詢失敗（{msg}）",lookupBizSourceLabel:"來源：",lookupBizSrcMops:"公開資訊觀測站・公司基本資料（主要經營業務）",lookupBizSrcTwOpenApi:"證交所／櫃買中心 OpenAPI 公司基本資料",lookupBizSrcSec:"SEC EDGAR 公司登記資料",lookupBizTwBasics:"{n}（{f}），{mk}公司，產業類別：{ind}。",lookupBizUsSic:"SEC 登記行業：{desc}（SIC {sic}）{ex}",lookupBizOfficialOnly:"公司簡介暫時抓不到，請看官方資料：",lookupBusiness:"公司在做什麼",lookupQuoteStats:"報價與關鍵數據",lookupFinancials:"財務摘要",lookupEarnings:"財報重點",lookupPrevClose:"前收",lookupVolume:"成交量",lookupDayRange:"今日區間",lookup52w:"52 週高低",lookupMarketCap:"市值",lookupEps:"每股盈餘",lookupBeta:"Beta",lookupDivYield:"殖利率",lookupRevenue:"營收",lookupGrossMargin:"毛利率",lookupProfitMargin:"淨利率",lookupEpsConsensus:"預估 EPS",lookupEpsSurprise:"EPS 驚喜",lookupSources:"來源",lookupPartial:"部分進階欄位暫無法取得（已顯示可得數字，未編造）。",lookupOfficialFilings:"官方財報",lookupOfficialFilingsLead:"以下連結通往官方申報與公開資訊；美股可另列近期 10-K／10-Q／8-K（公開可抓取時）。數字不編造。",lookupSourceOfficial:"官方來源",lookupSourceQuote:"行情來源",lookupSourceCompany:"公司網站",lookupSecEdgarSearch:"SEC EDGAR 公司申報查詢",lookupSecEdgarBrowse:"SEC EDGAR 公司瀏覽頁",lookupSecFormsFilter:"SEC 10-K／10-Q 等年季報篩選",lookupMopsFinancialBook:"公開資訊觀測站｜財務報告書",lookupMopsFinancialQuery:"公開資訊觀測站｜財務報告查詢頁",lookupMopsCompany:"公開資訊觀測站｜公司基本資料",lookupMopsMaterial:"公開資訊觀測站｜重大訊息",lookupTwseIsin:"證交所 ISIN／基本資料查詢",lookupTpexCompany:"櫃買中心｜公司資料",lookupYahooTwQuote:"Yahoo 奇摩股市（行情，非正式財報）",lookupCompanyWebsite:"公司官網",lookupInvestorRelations:"投資人關係／IR（公開資料）",lookupRecentFilings:"近期官方申報",lookupFilingForm:"表單",lookupFilingDate:"申報日",lookupFilingDoc:"文件",lookupCikLabel:"CIK",lookupFilingsListUnavailable:"近期申報清單暫時無法載入（網路或來源限制）。",lookupFilingsListEmpty:"目前沒有可列示的近期 10-K／10-Q／8-K。",lookupFilingsLinksStillWork:"上方官方連結仍可開啟查閱。",lookupFilingsTwNote:"台股請以公開資訊觀測站（MOPS）為官方財報來源；下方亦附行情頁供對照。",lookupFilingsCikUnavailable:"尚無法對應 SEC CIK；仍可透過上方 EDGAR 以代號查詢。",navSoxl:"SOXL",soxlTitle:"SOXL 半導體槓桿",soxlLead:"Direxion 每日半導體多頭 3 倍 ETF：最新報價、異常／事件、相關新聞，以及 SEC N-PORT 持股權重與估算貢獻——白話整理，非投資建議。",soxlDisclaimer:"非投資建議。SOXL 為約 3 倍日槓桿 ETF，波動與虧損風險極高；持股權重來自 SEC N-PORT（非當日），貢獻度為估算。",soxlHeroLabel:"SOXL 最新報價",soxlFundFallback:"Direxion Daily Semiconductor Bull 3X Shares",soxlRegularClose:"正規收盤",soxlOvernight:"盤後／夜盤",soxlLeverageNote:"SOXL 目標約為 ICE Semiconductor Index 單日表現的 3 倍；隔夜與多日累積不可用簡單 3 倍推估。",soxlHoldingsAsOf:"持股權重截至",soxlHoldingsNotSameDay:"最新 N-PORT，非今日即時",soxlEventsTitle:"事件／異常",soxlNewsTitle:"相關新聞",soxlNewsEmpty:"暫無相關新聞",soxlHoldingsTitle:"持股與估算貢獻",soxlHoldingsLead:"權重來自美國證管會（SEC）公開的 SOXL 持股季報（N-PORT）；現金與指數交換常佔大宗，個股漲跌則抓最近一個美股交易日的收盤。",soxlHoldingsEmpty:"持股清單整理中，請稍後再看。",soxlColName:"標的",soxlColWeight:"權重",soxlColReturn:"日報酬",soxlColContrib:"估算貢獻",soxlColReasons:"白話原因",soxlContributionHint:"估算貢獻：這檔在基金裡的比重，乘上它最近一天的漲跌，約等於它把整籃股票推高或拉低多少個百分點（還沒乘 3 倍槓桿，不等於 SOXL 實際漲跌）",soxlSourceN:"來源 {n}",soxlOverallTitle:"為何漲／為何跌",soxlWhyUp:"偏多時常見原因",soxlWhyDown:"偏空時常見原因",soxlRefreshHow:"資料會隨站點更新；若畫面異常請稍後再試。",soxlLoadError:"無法載入 SOXL 桌面（{msg}）",soxlNoDailyMove:"不適用",soxlPp:"百分點",soxlReturnAsOf:"{date} 收盤",soxlTypeOther:"其他",soxlTypeSwap:"指數交換合約",soxlTypeCash:"現金／貨幣基金",soxlTypeEquity:"個股",soxlHoldingsLeadDated:"權重：SEC 官方持股季報 N-PORT，統計到 {date}（不是今天即時持股）。漲跌：各個股最近一個美股交易日收盤（{day}）。現金與指數交換合約常佔一大塊，本身不太會漲跌。",navTxf:"台指期",txfTitle:"台指期",txfLead:"臺灣加權現貨對臺股期貨：近月／次月報價、基差、成交與未平倉、三大法人部位、保證金與到期日——全部來自期交所／證交所公開資料，白話整理，非投資建議。",txfDisclaimer:"投資涉及風險，資訊僅供參考，非投資建議。美股與台指期分欄；數字缺欄不捏造。",txfHeroLabel:"臺股期貨近月報價",txfNearBadge:"近月",txfNextBadge:"次月",txfSettle:"結算價",txfVolume:"成交量",txfOI:"未平倉",txfSessionDate:"行情日",txfSpotLabel:"加權現貨",txfBasisLabel:"基差",txfBasisHint:"基差＝近月期貨 − 現貨；正值表示期貨相對現貨溢價。",txfMultiplierShort:"大台乘數 NT${n}／點（紙上損益＝點數差×乘數×口數）",txfExpiredNote:"{m} 契約已在 {d} 到期，期交所公告最後結算價 {p}；近月改看 {n}。",txfContractsTitle:"契約：大台／小台／微台",txfContractsLead:"一般交易時段行情。月契約最後交易日依官方「第三個星期三」規則推算，假日調整請對照期交所公告。",txfMultLabel:"契約乘數",txfPerPoint:"／點",txfMarginInitial:"原始保證金",txfMarginMaint:"維持保證金",txfColMonth:"月份",txfColLast:"最新",txfColSettle:"結算",txfColChange:"漲跌",txfColVolume:"成交量",txfColOI:"未平倉",txfColLTD:"最後交易日",txfInstTitle:"三大法人期貨部位",txfInstLead:"未平倉多空與當日淨買賣（期交所，截至 {date}）",txfInstFoot:"三大法人為彙總結果，不代表單一機構策略。",txfColParty:"身份",txfColLongOI:"多方未平倉",txfColShortOI:"空方未平倉",txfColNetOI:"淨未平倉",txfColNetVol:"淨買賣口數",txfCalendarTitle:"結算／選擇權彙總",txfNextLTD:"近月最後交易日",txfNearMonth:"近月",txfNextMonth:"次月",txfLTDRule:"月契約最後交易日＝交割月份第三個星期三。",txfRecentSettle:"近期最後結算價",txfPcrTitle:"臺指選擇權 P/C",txfPcrVol:"成交量比",txfPcrOI:"未平倉比",txfExplainTitle:"白話說明",txfExplain1:"台指期（TX）是以臺灣加權股價指數為標的的指數期貨，採現金交割；小台（MTX）與微台（TMF）規格較小，方便調整部位。",txfExplain2:"基差＝期貨價 − 現貨指數。升水（正基差）表示期貨貴於現貨；貼水則相反。基差會隨到期日逼近而收斂。",txfExplain3:"未平倉（OI）是尚未平倉的契約口數，反映市場留倉規模，不是當日漲跌原因本身。",txfExplain4:"紙上損益可用：點數差 × 契約乘數 × 口數（大台每點 NT$200、小台 NT$50、微台 NT$10）。保證金以期交所公告為準。",txfSourcesTitle:"資料來源",txfLoadError:"無法載入台指期桌面（{msg}）",navPodcasts:"名人podcast",navLetters:"股東信",navManbao:"曼報 Pro",lettersTitle:"巴菲特的股東信",lettersLead:"選定年份後，在這一頁打開波克夏官方原文。旁邊是讀過後整理的投資要點，不是全文，也不是買賣建議。官方頁不允許嵌入。",lettersDisclaimer:"要點是我們的話，不是引用信的原文。1965–1976 年沒有單獨公開頁，官方索引只從 1977 年起。2025 年是 Greg Abel 的第一封信。",lettersMenuLead:"先選時期，再選年份。原文在波克夏官方網站閱讀，這裡只留要點。",lettersReadBadge:"已讀要點",lettersLinkBadge:"僅連結",lettersOpen:"官方原文",lettersReaderOpen:"閱讀官方原文",lettersReaderOpenPdf:"閱讀官方 PDF",lettersReaderNote:"波克夏不允許把信嵌進其他網站，所以這裡不放全文。按下面的按鈕，在官方頁面閱讀。",lettersReaderRegion:"官方原文",lettersOfficialHost:"原文在 berkshirehathaway.com，離開本站後由波克夏提供。",lettersYearRail:"年份",lettersMissing:"找不到這一年的官方連結。",lettersLinkOnlyNote:"這封沒有另外整理要點，請直接讀官方頁。",lettersAuthor:"作者",lettersBack:"回目錄",manbaoTitle:"曼報 Pro",manbaoLead:"付費內文不轉載。公開長文只放讀過後的短摘要；會員限定只列公開索引上的標題與連結。",manbaoDisclaimer:"不是投資建議，也不是曼報的授權轉載。Pro 正文留在官方網站。",manbaoMenuLead:"先選分類。公開長文有摘要；Pro 只有標題與官方連結。",manbaoPublicBadge:"公開摘要",manbaoPaywallBadge:"僅連結",manbaoOpen:"官方頁面",manbaoBack:"回目錄",manbaoCatPublic:"公開長文",manbaoCatDecode:"商業解碼",manbaoCatTech:"科技曼讀",manbaoCatGiants:"巨人之聲",manbaoCatClub:"曼報俱樂部",manbaoCatAbout:"入口",lettersCatEarly:"1977–1989",lettersCat90:"1990–1999",lettersCat00:"2000–2009",lettersCat10:"2010–2019",lettersCat20:"2020–2025",lettersCatSpecial:"特別信",podcastsTitle:"名人podcast",podcastsLead:"精選投資人／主持人公開訪談與 Podcast 框架整理：可掃讀論點、市場分欄、候選狀態標示清楚——非投資建議。",podcastsDisclaimer:"非投資建議。本區整理公開訪談與研究書庫已有資料；數字與做法標示來源，不構成個人化建議。數學閘門未通過者僅候選／觀察。",podcastsFeatured:"精選",podcastsStubBadge:"候選摘要",podcastsGodzillaHandle:"哥吉拉 · @godzilla.us",podcastsGooayeTitle:"Gooaye 股癌（謝孟恭）",podcastsGooayeLead:"台灣市場／總經／風險／散戶心理 Podcast；集數重點整理自公開 RSS 節目指引（非逐字稿、非投資建議）。",podcastsGooayeMarket:"以台股為主 · 美／台分欄",podcastsGooayeStubNote:"輕量 stub：完整條目與可計算規則在研究書庫；此處不發明集數引言。",podcastsGooayePoint1:"先管風險與部位，再談單一標的故事",podcastsGooayePoint2:"護國神山供應鏈用籃子強弱看，不單壓一檔",podcastsGooayePoint3:"美股用利率方向當風險偏好代理；台股另算",podcastsGotoResearch:"到研究書庫看完整條目",podcastsGooayeApple:"Apple Podcasts",podcastsCatMenu:"分類選單",podcastsCategories:"名人podcast分類",podcastsMenuLead:"先選分類再進入內容——不把長文全部攤在同一頁。",podcastsOpenCategory:"開啟此分類",podcastsLatestEpisode:"最新一集：{title}",podcastsLatestPost:"最新貼文：{title}",podcastsLatestMeta:"{date} 上架・共 {n} 集",podcastsLatestMetaPosts:"{date} 發表・共 {n} 篇",podcastsNewBadge:"本週新集",gooayeLibraryBadge:"集數庫",gooayeDisclaimer:"候選／觀察；數學閘關閉。標「已聽寫」者：下載公開音檔＋語音轉文字後撰寫股票重點分析。標「僅節目說明」者：僅 RSS／節目說明，未聽寫。主持人觀點、候選狀態；非投資建議。",gooayeLoading:"載入股癌集數庫…",gooayeLoadError:"無法載入集數庫（{msg}）",gooayeEpisodeCount:"共 {n} 集（公開 RSS）",gooayeAsOf:"資料截至 {date}（台北）",gooayeEmptyCount:"其中 {n} 集公開文字不足，僅列標題",gooayeSearchLabel:"搜尋集數",gooayeSearchPlaceholder:"標題、集數或關鍵字",gooayeSourceLine:"來源：",gooayeKeyPoints:"重點整理",gooayeTeaserKicker:"主持人開場短語",gooayeNotesThin:"公開節目指引幾乎只有標題／短語，無更多可整理文字。",gooayeTeaserNote:"這集公開的節目說明只有開場短語（其餘多半是業配廣告，已幫你拿掉）；我們還沒聽音檔，也不自己補內容。",gooayeListen:"收聽（SoundOn）",gooayeLoadMore:"再顯示 {n} 集（尚餘 {left}）",gooayeShowingAll:"已顯示全部 {n} 集",gooayeNoResults:"沒有符合的集數。",gooayeUntitled:"未命名集數",gooayeBadgeListened:"已聽寫",gooayeBadgeRssOnly:"僅節目說明",gooayeStockAnalysis:"股票重點分析（已聽寫）",gooayeRssTeaserToggle:"公開節目說明（RSS）",gooayeListenedAt:"聽寫於 {date}（台北）",gooayeListenedCount:"已聽寫 {n} 集",gooayeRssOnlyNote:"此集尚未聽音檔；以上僅整理公開 RSS／節目說明，非聽寫分析。",podcastsXiaojunTitle:"張小珺jùn｜商業訪談錄",podcastsXiaojunHandle:"張小珺 · 商業／科技長訪談",podcastsXiaojunLead:"以中國科技與商業人物為主的長篇訪談；集數庫來自公開 RSS 節目說明。標「已聽寫」者另附股票／產業重點（候選／觀察，非投資建議）。",podcastsXiaojunMarket:"以中國科技產業為主 · 跨市場觀察",podcastsXiaojunApple:"在 Apple Podcasts 收聽",xiaojunLibraryBadge:"集數庫",xiaojunDisclaimer:"候選／觀察；數學閘關閉。標「已聽寫」者：下載公開音檔＋語音轉文字後撰寫股票／產業重點。標「僅節目說明」者：僅 RSS／節目說明，未聽寫。主持人觀點；非投資建議。",xiaojunLoading:"載入張小珺集數庫…",xiaojunLoadError:"無法載入集數庫（{msg}）",xiaojunEpisodeCount:"共 {n} 集（公開 RSS）",xiaojunAsOf:"資料截至 {date}（台北）",xiaojunEmptyCount:"其中 {n} 集公開文字不足，僅列標題",xiaojunSearchLabel:"搜尋集數",xiaojunSearchPlaceholder:"標題、集數或關鍵字",xiaojunSourceLine:"來源：",xiaojunKeyPoints:"重點整理",xiaojunNotesThin:"公開節目指引幾乎只有標題／短語，無更多可整理文字。",xiaojunTeaserNote:"以上僅整理公開 RSS／節目說明，未聽音檔、未發明內容。",xiaojunListen:"在 Apple Podcasts 收聽",xiaojunLoadMore:"再顯示 {n} 集（尚餘 {left}）",xiaojunShowingAll:"已顯示全部 {n} 集",xiaojunNoResults:"沒有符合的集數。",xiaojunUntitled:"未命名集數",xiaojunBadgeListened:"已聽寫",xiaojunBadgeRssOnly:"僅節目說明",xiaojunStockAnalysis:"股票／產業重點分析（已聽寫）",xiaojunRssTeaserToggle:"公開節目說明（RSS）",xiaojunListenedAt:"聽寫於 {date}（台北）",xiaojunListenedCount:"已聽寫 {n} 集",xiaojunRssOnlyNote:"此集尚未聽音檔；以上僅整理公開 RSS／節目說明，非聽寫分析。",podcastsWhynottvTitle:"WhynotTV Podcast",podcastsWhynottvHandle:"Tairan He · AI／機器人長訪談",podcastsWhynottvLead:"聚焦 AI、機器人與科研創業的長篇訪談；集數庫來自公開 Anchor RSS。標「已聽寫」者另附產業重點（候選／觀察，非投資建議）。",podcastsWhynottvMarket:"AI／機器人與科研創業 · 跨市場觀察",podcastsWhynottvApple:"在 Apple Podcasts 收聽",whynottvLibraryBadge:"集數庫",whynottvDisclaimer:"候選／觀察；數學閘關閉。標「已聽寫」者：下載公開音檔＋語音轉文字後撰寫產業重點。標「僅節目說明」者：僅 RSS／節目說明，未聽寫。主持人觀點；非投資建議。",whynottvLoading:"載入 WhynotTV 集數庫…",whynottvLoadError:"無法載入集數庫（{msg}）",whynottvEpisodeCount:"共 {n} 集（公開 RSS）",whynottvAsOf:"資料截至 {date}（台北）",whynottvEmptyCount:"其中 {n} 集公開文字不足，僅列標題",whynottvSearchLabel:"搜尋集數",whynottvSearchPlaceholder:"標題、集數或關鍵字",whynottvSourceLine:"來源：",whynottvKeyPoints:"重點整理",whynottvNotesThin:"公開節目指引幾乎只有標題／短語，無更多可整理文字。",whynottvTeaserNote:"以上僅整理公開 RSS／節目說明，未聽音檔、未發明內容。",whynottvListen:"在 Apple Podcasts 收聽",whynottvLoadMore:"再顯示 {n} 集（尚餘 {left}）",whynottvShowingAll:"已顯示全部 {n} 集",whynottvNoResults:"沒有符合的集數。",whynottvUntitled:"未命名集數",whynottvBadgeListened:"已聽寫",whynottvBadgeRssOnly:"僅節目說明",whynottvStockAnalysis:"股票／產業重點分析（已聽寫）",whynottvRssTeaserToggle:"公開節目說明（RSS）",whynottvListenedAt:"聽寫於 {date}（台北）",whynottvListenedCount:"已聽寫 {n} 集",whynottvRssOnlyNote:"此集尚未聽音檔；以上僅整理公開 RSS／節目說明，非聽寫分析。",podcastsZhangJunanTitle:"張濬安",podcastsZhangJunanHandle:"et220870 · Blogspot／PTT",podcastsZhangJunanLead:"公開部落格與 PTT 發文整理：績效覆盤、交易紀律、券商／房貸實務與早期操作日誌。標「已讀分析」者已讀全文；標「僅標題」者公開正文不可得。候選／觀察，非投資建議。",podcastsZhangJunanMarket:"台股／交易實務 · 個人覆盤",zhangJunanLibraryBadge:"文章庫",zhangJunanDisclaimer:"候選／觀察；數學閘關閉。標「已讀分析」：已讀公開正文（部落格全文或 PTT 原文＋留言）後撰寫股市／資產重點。標「僅標題」：公開頁正文不可讀或已刪。作者觀點；非投資建議。不納入選股清單。",zhangJunanLoading:"載入張濬安文章庫…",zhangJunanLoadError:"無法載入文章庫（{msg}）",zhangJunanPostCount:"共 {n} 篇（公開列表）",zhangJunanAsOf:"資料截至 {date}（台北）",zhangJunanAnalyzedCount:"已讀分析 {n} 篇",zhangJunanTitleOnlyCount:"其中 {n} 篇僅標題（正文不可讀）",zhangJunanSearchLabel:"搜尋文章",zhangJunanSearchPlaceholder:"標題、看板、關鍵字",zhangJunanSourceLine:"來源：",zhangJunanKeyPoints:"重點整理",zhangJunanStockAnalysis:"股市／資產重點分析（已讀）",zhangJunanNotesThin:"公開文字不足，僅列標題與連結。",zhangJunanTitleOnlyNote:"公開頁正文已刪除或無法解析；以上不臆造內容。",zhangJunanOpenBlog:"開啟原文（部落格）",zhangJunanOpenPtt:"開啟原文（PTT）",zhangJunanLoadMore:"再顯示 {n} 篇（尚餘 {left}）",zhangJunanShowingAll:"已顯示全部 {n} 篇",zhangJunanNoResults:"沒有符合的文章。",zhangJunanUntitled:"未命名文章",zhangJunanBadgeAnalyzed:"已讀分析",zhangJunanBadgeTitleOnly:"僅標題",zhangJunanSourceBlog:"部落格",zhangJunanSourcePtt:"PTT",zhangJunanCommentSummary:"留言重點",zhangJunanFilterAll:"全部",zhangJunanFilterBlog:"部落格",zhangJunanFilterPtt:"PTT",zhangJunanFilterSeriesAll:"全部子分類",zhangJunanSourceFilters:"來源篩選",zhangJunanSeriesFilters:"子分類篩選",researchCatMenu:"分類選單",researchCategories:"研究分類",researchMenuLead:"先選類型／市場／狀態，再瀏覽該分類條目。",researchOpenCategory:"開啟此分類",researchCatBooks:"書籍",researchCatPapers:"論文",researchCatPodcasts:"Podcast",researchCatUs:"美股焦點",researchCatTw:"台股焦點",researchCatCandidate:"候選",researchCatWatch:"觀察中",researchBackMenu:"回分類選單",researchStatusFilters:"狀態",godzillaTitle:"哥吉拉",godzillaLead:"Threads 受訪者「哥吉拉」的美股框架整理：時間與健康、RSU 再配置、基本面、能力圈、稅務節奏、選擇權工具——白話卡片，非投資建議。",godzillaDisclaimer:"非投資建議。整理自公開訪談；數字與做法標示為受訪者自述，不構成個人化建議。數學閘門未通過，僅候選／觀察。",godzillaHeroLabel:"哥吉拉框架總覽",godzillaKicker:"候選框架 · 美股為主",godzillaTagline:"用健康的時間換自由；長股為核、選擇權為輔；稅務決定換倉節奏。",godzillaBadgeCandidate:"候選",godzillaBadgeWatch:"觀察中",godzillaUsFocus:"以美股為主",godzillaSelfReport:"受訪者自述",godzillaListenedBadge:"已聽寫",godzillaStockTitle:"股票重點分析（已聽寫）",godzillaStockLead:"依公開 YouTube 訪談音訊＋語音轉寫整理的受訪者觀點（候選／觀察；非投資建議）。",godzillaStock1:"時間與健康優先於再堆金錢／RSU；金錢買不回時間，退休目標會隨 RSU 累積而上修。",godzillaStock2:"美股科技薪資結構高度依賴 RSU；股價上漲會放大總報酬，也放大單一公司集中風險。",godzillaStock3:"進場時點：特斯拉较早布局自覺「可更早出場會賺更多」；Meta 約在相對低檔區間進入（受訪者自述）。",godzillaStock4:"下一波關注偏 B2C AI 應用落地；當下顯見案例如 Tesla FSD、Palantir，其餘仍在觀察。硬體／AI 資本開支仍在成長，但多數應用仍偏 B2B。",godzillaStock5:"即便看好 NVIDIA，也不主張把倉位壓在單一公司；美國 W2／稅務計算下，高薪＋集中持股需一起規劃。",godzillaStock6:"台股無資本利得稅 vs 美國稅負：流動性／進出方便是優點，稅制誘因不同，不能直接照搬美股玩法。",godzillaStockNote:"轉寫模型：faster-whisper small int8。來源影片公開可查；數字與標的均為訪談中受訪者觀點，候選／觀察。",godzillaSourceLabel:"來源",godzillaSourceCite:"Terry × 哥吉拉",godzillaYoutube:"觀看 YouTube 訪談",godzillaThesesTitle:"核心論點",godzillaThesesLead:"十條可掃讀重點；細節皆為受訪者自述。",godzillaThesis1Title:"時間與健康重於再堆 RSU",godzillaThesis1Body:"退休目標常會膨脹（例如自述從約 3,000 萬美元調到 6,000 萬，再加上住房與子女）；停下來往往是身體撐不住。用健康的 40 多歲換旅行與自由，和 50–60 歲很不一樣。",godzillaThesis2Title:"美股 RSU 改變誘因",godzillaThesis2Body:"四年歸屬、與公司利益綁在一起；對比台股現金獎金較少用來買自家股票。",godzillaThesis3Title:"歸屬當日賣出、轉到信念標的",godzillaThesis3Body:"既得 RSU 當日賣出，再配置到有信念的名字（其例：NVDA），避免薪水＋未歸屬全押同一籃。",godzillaThesis4Title:"只看基本面",godzillaThesis4Body:"看營收／EPS 趨勢；忽略華爾街目標價；新聞噪音多半有害。",godzillaThesis5Title:"能力圈：硬體／科技",godzillaThesis5Body:"能力圈在硬體與科技——NVDA 權重最高；亦提 PLTR、AVGO、TSM；很少碰科技外。指數部位現在較小，終局想像多數在指數。",godzillaThesis6Title:"稅務決定換倉節奏",godzillaThesis6Body:"高 W2 收入時資本利得稅重；離職後可多年把個股輪換成指數、把稅負控在可接受範圍；賣出 Covered Call 可緩衝下跌。",godzillaThesis7Title:"選擇權是工具",godzillaThesis7Body:"多半當卖方（Covered Call／Cash-secured Put）；少數做多買權／LEAP，僅在恐慌或價格與基本面背離時；接受權利金可能歸零；從不裸賣。",godzillaThesis8Title:"Covered Call：被指派就延後",godzillaThesis8Body:"有被指派風險就往後換月（roll out）；不要為了小權利金去履約或賣掉核心持股；不舒服就少賣合約。",godzillaThesis9Title:"進場等趨勢",godzillaThesis9Body:"等 1–2 次乾淨財報確認趨勢，即使成本墊高也接受；有閒錢就持續買好公司；不追熱門明牌。",godzillaThesis10Title:"美／台觀察分欄",godzillaThesis10Body:"美股資本利得稅→傾向抱更久；台股無資本利得＋有證交稅→周轉較高、投機文化較重（僅觀察，非操作指令）。",godzillaChecklistTitle:"作法清單",godzillaChecklistLead:"可執行的自我檢查，不是下單清單。",godzillaCheck1:"物慾低；別讓「夠了」的數字一直往上漲。",godzillaCheck2:"長股為核心；選擇權是衛星／避險／偶爾槓桿。",godzillaCheck3:"部位：不借錢；接受不了歸零，就別碰選擇權。",godzillaCheck4:"選擇權優先流動性高的大型股。",godzillaCheck5:"終局配置草圖：約 80% 寬基指數，小袖口參與產業（＋偶爾小額買權）。",godzillaCheck6:"PLTR 例子：B2B 靠前線工程師變現；若商業成長失望就減碼。",godzillaOptionsTitle:"選擇權用法",godzillaOptionsLead:"卖方為主；买方極少、僅在極端偏離時。",godzillaOpt1:"主力：Covered Call、Cash-secured Put。",godzillaOpt2:"小部位長買權／LEAP：恐慌或價格脫離基本面時。",godzillaOpt3:"權利金可全部虧完；從不裸倉。",godzillaOpt4:"被指派風險：往後換月；核心持股不為小權利金賣出。",godzillaRsuTitle:"RSU、稅務與輪換",godzillaRsuLead:"誘因、分散與離職後的稅務節奏。",godzillaRsu1:"歸屬當日賣出 RSU，再配置到信念標的（例：NVDA）。",godzillaRsu2:"在職高稅負時少動大額已實現利得；離職後多年輪換個股→指數。",godzillaRsu3:"Covered Call 作為下跌緩衝，不是賭方向。",godzillaTwTitle:"台股觀察",godzillaTwLead:"與美股框架分開；僅文化／稅制觀察。",godzillaTwBody:"美股有資本利得稅，傾向長期持有；台股無資本利得稅、有證交稅，周轉與短線文化較明顯。此頁主軸仍是美股框架，台股僅作對照，不寫進正式篩選。",godzillaGateNote:"尚未寫進正式篩選",godzillaGateDetail:"狀態：候選／strategyCandidate=watch。數學閘門關閉——未接入即時篩選器或模擬交易；僅供閱讀與對照。",jensenTitle:"黃仁勳／Jensen Huang",jensenHandle:"Stanford Entrepreneurial Thought Leaders · NVIDIA",jensenLead:"Stanford STVP／Entrepreneurial Thought Leaders 公開演講整理：視角、需求與摩爾定律、文化、現金現實、再發明——候選／觀察，非投資建議。",jensenDisclaimer:"非投資建議。整理自 Stanford Online 公開演講（約 2009；YouTube 2011 上傳）；論點來自講者自述主題，不構成個人化建議。數學閘門未通過，僅候選／觀察。",jensenHeroLabel:"黃仁勳演講重點",jensenKicker:"候選演講 · 美股科技／半導體創業",jensenTagline:"視角勝過空泛「願景」；用文化與再發明撐住長週期公司建設。",jensenUsFocus:"以美股／科技為主",jensenTalkBadge:"公開演講",jensenListenedBadge:"已聽寫",jensenStockTitle:"股票／事業重點（已聽寫）",jensenStockLead:"依公開 Stanford ETL 訪談影片音訊＋語音轉寫整理（約2009；歷史觀點，非當下財報）。候選／觀察；非投資建議。",jensenStock1:"創業敘事（1993）：押注 PC＋3D／遊戲會成大市場；VC／長輩當時不信「為了打遊戲開公司」。",jensenStock2:"競爭：消費級3D一度湧入數十～上百家；NVIDIA自述最終成僅存的電腦繪圖公司——關鍵是看懂事業本質（半導體／Moore's Law 如競爭律）與持續重塑，而非只靠執行。",jensenStock3:"可程式著色器轉型：主動吞噬自己成功的固定功能產品；第一代幾乎拖垮公司，但自認不做會死於 Moore's Law 節奏。",jensenStock4:"資源配置：競爭決定價格，CEO決定要不要接案；看關鍵資源相對市場需求與機會成本，不只會計成本。",jensenStock5:"文化：創新需容忍計算過的失敗；新創定義＝幾乎一直快倒閉。通用化 GPU（瑞士刀）有偏離利基風險，卻是延長產業壽命的路徑。",jensenStock6:"時間錨點：本場為歷史談（預現代AI訓練熱潮），勿直接外推今日資料中心財報。NVIDIA為講者公司；候選／觀察。",jensenStockNote:"轉寫：faster-whisper small int8（en）。來源 YouTube Xn1EsFe7snQ／Stanford ETL。歷史訪談觀點。",jensenMeta:"Stanford Online · STVP ETL · 約 1:03:38 · 上傳 2011-06-23",jensenSourceCite:"Jen-Hsun Huang · Stanford Online",jensenYoutube:"觀看 YouTube 演講",jensenOpenYoutube:"在 YouTube 開啟完整影片",jensenEmbedTitle:"Jen-Hsun Huang：Stanford student and Entrepreneur（Stanford Online）",jensenEcorner:"Stanford eCorner／STVP 相關剪輯",jensenHighlightsTitle:"演講重點（白話）",jensenHighlightsLead:"五條可掃讀主題；僅整理公開演講中反覆出現的論點，非逐字稿。",jensenH1Title:"視角，而非空泛「願景」",jensenH1Body:"人人都有視角。NVIDIA 早期押注：個人電腦加上便宜的 3D 會打開遊戲市場（後來也談到 Keyhole→Google Earth），當時對許多 VC 而言市場幾乎是零。",jensenH2Title:"無窮需求與摩爾定律",jensenH2Body:"新類別尚未被定價時，有時要暫時忽略顧客回饋；先 rinse-and-repeat，再在「夠好」扼殺媒介前重新發明（固定功能→可程式著色器／GeForce FX 近死經驗、CG 語言）。",jensenH3Title:"文化：敢冒算過的風險",jensenH3Body:"創新需要計算過的風險、容忍快速失敗、智識誠實、願意改道；動機是熱情與目的，而非「把公司賣掉」。",jensenH4Title:"現金與新創現實",jensenH4Body:"永遠在募資、省錢或賺錢；新創幾乎總是瀕臨倒閉。VC 更押人與夠大的市場，而非完美商業計畫。",jensenH5Title:"再發明：成功也要拆掉重建",jensenH5Body:"每一次成功終須拆解再建；黃仁勳談的是長視野公司建設，不是連續翻轉出場。",jensenTwTitle:"美／台分欄（僅脈絡）",jensenTwLead:"本條目市場主軸為美股科技／半導體公司建設；台灣僅作供應鏈脈絡，不發明台股標的。",jensenTwBody:"NVDA 作為美股半導體／運算平台公司，供應鏈與台灣晶圓製造、封測生態高度相關——此處僅作產業脈絡註記，不列台股清單，也不寫進正式篩選。",jensenGateNote:"尚未寫進正式篩選",jensenGateDetail:"狀態：候選／strategyCandidate=watch。數學閘門關閉——未接入即時篩選器或模擬交易；僅供閱讀與對照。",jensenWatchCta:"在 YouTube 觀看",jensenEmbedBlockedNote:"此演講由擁有者設定為僅能在 YouTube 觀看（無法於本站內嵌播放）。",optionsTitle:"美股選擇權",optionsLead:"以 McMillan《選擇權策略完全手冊》策略族為主：先看波動與風險形狀，再用公開 Yahoo 鏈結學習——非投資建議。",optionsDisclaimer:"非投資建議；選擇權風險高。僅供教育與公開數據篩選，不構成個人化下單建議。",optionsBookBadge:"這本書",optionsBookCite:"主要參考書",optionsBookLead:"Lawrence G. McMillan《選擇權策略完全手冊》增訂第五版：依看法與波動高低對應策略族（原創摘要，非原文）。",optionsBookFallbackTitle:"選擇權策略完全手冊（McMillan）",optionsGotoResearch:"到研究書庫看完整條目",optionsUsOnly:"僅美股",optionsQualityTitle:"標的輕量財報檢核",optionsQualityLead:"次要濾網：本益、淨值、負債、ROE、營收／獲利趨勢。缺欄略過；不作薦股。",optionsViewTitle:"選擇權觀點（McMillan）",optionsViewLead:"公開期權鏈：ATM 隱含波動、歷史波動、量能偏向；策略族為教育說明。",optionsMcmillanFirst:"先對齊波動高低與風險形狀，再想策略族——不是先猜漲跌再硬套。",optionsPe:"本益比",optionsPb:"股價淨值",optionsDebt:"負債／權益",optionsRoe:"ROE",optionsRevTrend:"營收趨勢",optionsEarnTrend:"獲利趨勢",optionsGate:"品質閘",optionsGatePass:"通過",optionsGateWatch:"觀察",optionsGateFail:"偏弱",optionsGateIncomplete:"資料不足",optionsDataMissing:"資料不足",optionsForwardPe:"預估本益",optionsTrendUp:"成長約 {pct}%",optionsTrendDown:"下滑約 {pct}%",optionsTrendFlat:"大致持平 {pct}%",optionsAtmIv:"ATM 隱含波動",optionsHv:"歷史波動（約 1 月）",optionsIvHv:"IV／HV",optionsVolRegime:"波動狀態",optionsRegimeIvRich:"隱含偏高",optionsRegimeIvCheap:"隱含偏低",optionsRegimeIvFair:"大致均衡",optionsRegimeIvOnly:"僅有 IV",optionsCallPutVol:"買權／賣權成交量",optionsAtmStrike:"近價履約價",optionsExpiry:"到期日",optionsSkewPutHeavy:"賣權量較重",optionsSkewCallHeavy:"買權量較重",optionsSkewBalanced:"量能大致均衡",optionsEduSetups:"策略族（教育）",optionsEduSetupsLead:"依看法＋波動狀態挑選家族；綠底表示較常對齊目前 IV／HV 狀態（仍非建議）。",optionsSetupCoveredCall:"備兌買權（Covered Call）",optionsSetupCoveredCallBody:"已持有股票時賣出買權，換取權利金；上漲空間被履約價「蓋住」。",optionsSetupCoveredCallWarn:"最大利潤有天花板；大跌時股票虧損仍在。",optionsSetupProtectivePut:"保護性賣權（Protective Put）",optionsSetupProtectivePutBody:"持股同時買進賣權，像買保險：下跌有地板，但要付保費。",optionsSetupProtectivePutWarn:"保險成本會吃掉報酬；若波動已很貴，保費更痛。",optionsSetupVertical:"垂直價差（Vertical）",optionsSetupVerticalBody:"同到期、不同履約價的買權或賣權組合，把最大損益框在可計算區間。",optionsSetupVerticalWarn:"方向看錯仍會虧；好處是虧損有上限。",optionsSetupCalendar:"日曆／對角價差（Calendar / Diagonal）",optionsSetupCalendarBody:"不同到期的選擇權組合，常用來表達「時間流逝」或波動變化看法。",optionsSetupCalendarWarn:"對波動與時間敏感；形狀會隨市價移動改變。",optionsSetupStraddle:"跨式／勒式（Straddle / Strangle）",optionsSetupStraddleBody:"同時買（或賣）買權與賣權，押「大波動」或「波動不夠」。",optionsSetupStraddleWarn:"買方需要夠大的移動；賣方面臨兩側風險。",optionsSetupButterfly:"蝶式（Butterfly）",optionsSetupButterflyBody:"多履約價組合，押價格收斂在中間附近；利潤區通常很窄。",optionsSetupButterflyWarn:"甜蜜點很窄；錯過中間就可能接近最大虧損。",optionsSetupVolAligned:"與目前波動狀態較常一起討論",optionsSetupVolNotAligned:"與目前波動狀態較不契合（仍可學習）",optionsRiskShape:"風險形狀（白話）",optionsNoSetups:"暫無策略族說明",optionsPickTicker:"請選擇上方美股代碼",optionsChainBlocked:"期權鏈暫時無法取得",optionsPartialBlocker:"部分欄位不完整",optionsRefreshHow:"資料會隨站點更新；若畫面異常請稍後再試。",optionsLoadError:"無法載入選擇權快照（{msg}）",optionsEmpty:"尚無美股樣本——請先跑 fetch-us-options",optionsGlossaryTitle:"小詞典（不用公式）",optionsTermDelta:"Delta（方向敏感度）",optionsDefDelta:"價格漲跌時，選擇權大概會跟多少。數字愈靠近 1 或 −1，跟現貨愈緊。",optionsTermIv:"隱含波動 IV",optionsDefIv:"市場「現在願意付多少保費」換算成的波動預期。愈高通常選擇權愈貴。",optionsTermHv:"歷史波動 HV",optionsDefHv:"過去一段時間股價實際晃動有多大，用來和 IV 對照。",optionsTermAtm:"ATM（近價）",optionsDefAtm:"履約價最靠近現價的合約，常拿來當波動溫度計。",optionsTermSkew:"量能偏向",optionsDefSkew:"買權與賣權成交量誰比較多，粗看市場偏保險還是偏追漲。",optionsTermProb:"機率（教育）",optionsDefProb:"只談「比較可能／比較少見」的直覺，不保證結果，也不給個人化勝率。",researchLead:"書單與論文：標題 → 摘要 → 重點作法 → 是否納入策略候選",researchMathGateBanner:"正式納入策略需數學閘門通過（目前未過）— 僅候選",researchMathGate:"數學閘門",researchMathGateDefault:"尚未通過數學閘門",researchFormulas:"可程式化公式",researchTakeaways:"重點作法",researchNoTakeaways:"尚無重點作法",researchSources:"來源",researchFilters:"篩選",researchFilterAll:"全部",researchType:"類型",researchTypeBook:"書籍",researchTypePaper:"論文",researchTypePodcast:"Podcast",researchMarketBoth:"美＋台",researchStrategy:"策略候選",researchCandYes:"候選納入",researchCandNo:"不納入",researchCandWatch:"觀察中",researchStatusCandidate:"候選",researchStatusDeferred:"暫緩",researchStatusAdopted:"已納入",researchStatusRejected:"排除",researchCounts:"書籍 {books} · 論文 {papers} · Podcast {podcasts} · 顯示 {total}",researchEmpty:"此篩選條件下暫無項目",researchNoFormulas:"尚無公式條目",researchLoadError:"無法載入研究庫（{msg}）",researchShelfFilters:"書架分類",researchShelfCoreInvesting:"核心投資經典",researchShelfValueInvesting:"價值型投資",researchShelfBusiness:"商業管理與商界視角",researchShelfLifePartner:"人生智慧與合夥人思想",researchShelfOptions:"選擇權／衍生品",researchShelfRecentReads:"近期閱讀與推薦書",researchShelfFiConcepts:"必看財商觀念書",researchShelfMoneyValues:"理財與金錢價值觀",researchShelfInvestingBasics:"投資理財入門",researchShelfAssetAllocation:"資產配置",researchShelfFinancials:"財報分析",researchShelfMarketAnalysis:"投資分析與戰勝市場",researchShelfEconAnalysis:"經濟分析",researchShelfPsych:"投資心理／隨機性／人性",researchShelfBiographies:"名人傳記",researchShelfAdjacent:"其他／隣接",todayPicks:"今日選股",market:"市場",hot:"熱門",marketQuotes:"市場報價",macroTitle:"美股大事",macroTzEt:"時間・美東 ET",macroAsOf:"更新",macroStale:"資料偏舊（仍顯示上次成功抓取）",macroToday:"今日",macroNext:"即將",macroHighImpact:"高影響",macroEmpty:"近期無高影響美股大事（或資料尚未更新）",macroLoadError:"無法載入美股大事（{msg}）",liveQuotesLive:"即時",liveQuotesStale:"報價暫緩（仍顯示上次成功）",liveQuotesStaleShort:"暫緩",liveQuotesClosed:"休市",liveQuotesClosedTitle:"台股與美股目前都不在交易時段，顯示最近收盤",liveQuotesPending:"即時報價連線中…",liveQuotesClock:"報價",macroEvent_fomcDecision:"FOMC 利率決議",macroEvent_fomcMinutes:"FOMC 會議紀要",macroEvent_cpi:"CPI 通膨",macroEvent_ppi:"PPI 生產者物價",macroEvent_pce:"PCE／核心 PCE",macroEvent_nfp:"非農就業 NFP",macroEvent_joblessClaims:"初請失業金",macroEvent_gdp:"GDP",macroEvent_retailSales:"零售銷售",macroEvent_ismMfg:"ISM 製造業",macroEvent_ismServices:"ISM 服務業",macroEvent_jolts:"JOLTS 職缺",twMacroTitle:"台股大事",twMacroTz:"時間・台北時間",twMacroEmpty:"近期無高影響台股大事（或資料尚未更新）",twMacroLoadError:"無法載入台股大事（{msg}）",twMacroEvent_cbcDecision:"央行理監事會",twMacroEvent_dgbasCpi:"CPI 消費者物價",twMacroEvent_dgbasPpi:"PPI／物價指數",twMacroEvent_dgbasUnemployment:"失業率",twMacroEvent_dgbasGdpFlash:"GDP 概估",twMacroEvent_dgbasGdp:"GDP／經濟成長",twMacroEvent_dgbasForecast:"經濟預測",twMacroEvent_moeaExportOrders:"外銷訂單",twMacroEvent_moeaIndustrialProd:"工業生產",twMacroEvent_twseHoliday:"台股休市",usStock:"美股",twStock:"台股",usList:"美股清單",twList:"台股清單",usTop:"美股 Top",twTop:"台股 Top",emptyTop:"{market} 暫無 Top 候選",ticker:"代碼",name:"名稱",price:"價格",dayPct:"日漲跌",rs:"RS",priorClose:"前收",priorCloseFull:"前收漲幅",pct5d:"5 日",pct1m:"約 1 月",volRatio:"量比",ma:"均線",screening:"篩選",reason:"理由",details:"詳情",business:"本業",risk:"風險",observe:"觀察",dataIncomplete:"資料不全",intraday:"盤中",taipeiClose:"台北收",taiex:"台灣加權 TAIEX",otc:"櫃買",spx:"S&P 500",nasdaq:"Nasdaq",sox:"SOX",usdtwd:"USD/TWD",loadError:"無法載入資料（{msg}）。請確認以靜態伺服器開啟，且 data/latest.json 存在。",langLabel:"語言",paper:"模擬",paperMissing:"尚無模擬帳本檔案。請於專案執行 npm run paper。",paperDisclaimer:"累積模擬帳戶（自 {date} 起） · 不會每日歸零 · 買進即成交 · 非真實下單",paperRules:"規則（各市場獨立帳）",paperRuleTw:"台股本金 NT$3,000,000 · 整張成交 · 休市日（含颱風停市）不買不賣，休市後要等第一個交易日收盤的新價格才重新判斷",paperRuleUs:"美股本金 US$100,000 · 可買 1 股起",paperRuleBuy:"買：當天名單裡的股票，每檔最多放帳本總值的 8%，再看現金夠不夠；台股只買整張，買不起一張就跳過 · 下單即成交",paperRuleSell:"賣：停損−3% · 停利+12%半倉 · 破SMA20且日跌>2% · 離名單虧損 · 漲停隔日−5%",paperTabTw:"台股帳 · NT$",paperTabUs:"美股帳 · US$",paperBookTw:"台股帳本（NT$）",paperBookUs:"美股帳本（US$）",principal:"本金",cash:"現金",equity:"權益（部位＋現金）",totalPnl:"總損益",totalPnlPct:"總損益 ％",weekPerf:"週績效",monthPerf:"月績效",quarterPerf:"季績效",yearPerf:"年績效",sinceInception:"成立以來",noTradesToday:"本日尚無此類成交（模擬）",noPositions:"目前沒有持股",buy:"買",sell:"賣",shares:"股",qtyShares:"股數",positions:"目前部位",position:"部位",avgCost:"成本",mark:"現價",mktValue:"市值",dayPnl:"日損益",costBasis:"成本合計",weightPct:"權重 ％",posScrollHint:"左右滑動看全部欄位",unrealizedPnl:"未實現損益",unrealizedPct:"未實現 ％",recentTrades:"成交（近 40）",tradeHistory:"全部成交紀錄（依交易日）",tradeHistoryHint:"共 {n} 個交易日、{total} 筆。點日期展開，可看每筆價格、成本與賺賠金額。",histDayCount:"買 {b} 筆 · 賣 {s} 筆",histDayRealized:"當天賣出實現",histNoSells:"當天沒有賣出",paperSession:"{date} · 自 {inception} 累積 · 買進即成交",reasonScreenBuy:"名單新開倉",reasonAdd:"持續買進",reasonStop:"停損",reasonTakeProfit:"停利",reasonMomentumBreak:"動能轉弱",reasonOffList:"離開名單",reasonLimitUpChase:"漲停追價急殺",paperRuleOpt:"美股帳可模擬買／賣選擇權（單腳）；權利金來自公開期權鏈，乘數×100；到期依內含價值結算",paperRuleTxf:"台股帳可模擬台指期 TX／MTX；點數×官方乘數（TX 200／MTX 50）×口數＝損益；保證金用期交所公開初始保證金",paperDerivUsTitle:"美股選擇權（紙上）",paperDerivUsLead:"單腳買／賣 Call／Put。權利金＝當日公開鏈；絕不捏造。現金借記／貸記更新本帳。",paperDerivServerBook:"全站模擬部位（每台裝置都看得到，不是手機暫存）。",paperDerivTwTitle:"台指期 TX／MTX（紙上）",paperDerivTwLead:"價格來自台指期桌（session {session}）。多／空口數；損益＝點數差×乘數×口數（TWD）。",paperDerivFreeCash:"可用現金（本帳）",paperDerivOptMv:"選擇權市值",paperDerivMarginHold:"保證金占用",paperDerivUnderlying:"標的",paperDerivRight:"Call／Put",paperDerivStrike:"履約價",paperDerivPremium:"權利金",paperDerivCashImpact:"現金影響",paperDerivFutCode:"商品",paperDerivMonth:"契約月",paperDerivNear:"近月",paperDerivNext:"次月",paperDerivContract:"契約",paperDerivContracts:" 口",paperDerivLong:"多",paperDerivShort:"空",paperDerivMarkSrc:"標記來源",paperDerivLastDay:"最後交易日",paperDerivMarginNote:"紙上保證金：以期交所公開「初始保證金」×口數占用現金；非真實下單。",paperDerivNoOptPos:"尚無選擇權部位",paperDerivNoFutPos:"尚無台指期部位",paperDerivNoChain:"尚無可成交的公開期權鏈（需 paperChain 權利金）",paperDerivNoPremium:"此履約價沒有可用公開權利金",paperDerivNoTxf:"尚無台指期桌資料（public/data/txf-desk.json）",paperDerivNoMonth:"桌面沒有此契約月報價",paperDerivNoFutPrice:"沒有可用的公開期貨價（last／settle）",paperDerivNoMargin:"桌面缺少官方初始保證金數字",paperDerivBadRight:"請選 Call 或 Put",paperDerivBadQty:"口數／張數須為正整數",paperDerivBadSide:"買賣方向無效",paperDerivBadCode:"僅支援 TX／MTX",paperDerivBadMult:"乘數與官方規格不一致，已阻擋",paperDerivExpiryMismatch:"到期日與公開鏈不一致",paperDerivNeedCash:"現金不足（需要約 {need}）",paperDerivNeedMargin:"保證金不足（需要約 {need}）",paperDerivMathBlock:"數學守衛攔截：非有限數字，未寫入",paperDerivFail:"下單失敗",paperDerivFillOk:"已成交 @ {px}",paperDerivUserOpen:"紙上開倉",paperDerivUserClose:"紙上平倉",paperDerivExpirySettle:"到期依內含價值結算",paperDerivFutSettle:"最後交易日後依結算／最後價平倉",paperDerivStrategy_covered_call:"備兌買權",paperDerivStrategy_protective_put:"保護性賣權",paperDerivStrategy_long_call:"買進買權",paperDerivStrategy_long_put:"買進賣權",paperDerivStrategy_short_call:"賣出買權",paperDerivStrategy_short_put:"賣出賣權",stopLoss:"停損",takeProfit:"停利",paperTrade:"模擬",realizedPnl:"實現損益",sessionRealizedPnl:"本次賣出實現損益合計",costMissing:"成本資料缺失",costMissingCount:"另有 {n} 筆缺成本",realizedOpenOnly:"尚未實現（持倉中）",paperDerivFills:"衍生性成交",tradeDate:"日期",periodPerf:"績效",qty:"數量",note:"說明",strategyScreen:"策略選股",strategyLead:"台／美命中分開檢視 · 公開資料命中優先",strategyLoading:"載入策略結果中…",strategyEmpty:"尚無策略資料。請執行 npm run strategies。",strategyLoadError:"無法載入策略選股（{msg}）。請確認已執行 npm run strategies。",strategyList:"策略列表",strategyCat:"策略分類",hitCount:"檔命中",hitTitle:"命中檔數",strategyDetails:"詳情 · 策略說明",conditions:"條件",results:"篩選結果",copyJson:"複製 JSON",exportCsv:"匯出此策略 CSV",exportJson:"匯出 JSON",copied:"已複製",noHitsExport:"此策略今日無命中列可匯出",incomplete:"不足",hitsTotal:"共{n}檔",twOnlyHint:"本策略僅台股",hitMarket:"命中市場",noHits:"本日無命中",dataInsufficient:"資料不足",calibTitle:"校準說明",incompleteFilters:"未檢查濾網（不算通過）：",sessionTwse:"證交所 session",ohlcvBar:"OHLCV K棒",generated:"產生",universeTw:"台股宇宙",universeUs:"美股宇宙",cat精選:"精選",cat價量:"價量",cat籌碼:"籌碼",cat財務:"財務",cat大師:"大師",cat週期:"週期",cat技術:"技術",cat基本:"基本",cat綜合:"綜合",addWatchlist:"加入自選",watchlistAdded:"已加入自選 {ticker}",watchlistExists:"{ticker} 已在自選",copyFailed:"複製失敗（請手動選取）",csvDownloaded:"已下載 CSV",csvBlocked:"下載被擋：改以資料連結開啟",backtestSoon:"回測：尚未開放",backtestHint:"回測：資料／引擎尚未開放（不提供假回測）",regimeToday:"今日市場週期（美／台分開）",psychologyPhase:"心理相位",cycleStance:"週期姿態",liquidityBias:"流動性偏誤",temperatureScore:"市場溫度",sizeMult:"部位乘數",regimeTags:"週期標籤",dataGaps:"資料缺口",marketRegime:"市場週期",enum_euphoric:"亢奮",enum_late_optimism:"晚期樂觀",enum_mid_cycle:"中期",enum_cautious_recovery:"謹慎復甦",enum_despondent:"絕望",enum_panic:"恐慌",enum_defensive:"防守",enum_selective:"精選",enum_balanced:"均衡",enum_constructive:"偏建設",enum_aggressive:"積極",enum_stabilize_first:"先求穩",enum_risk_off:"偏防守",enum_risk_on:"偏進攻",enum_neutral:"中性",logicTitle:"選股邏輯",logicSubtitle:"先看市場，再挑個股。門檻用日常用語說明，不把流程寫成算式。",logicLead:"這頁說明每日名單怎麼來，以及模擬帳在什麼情況下買進、賣出。美股與台股各自判斷，不會併成一種全球心情。先看該市場現在偏熱還是偏冷，再決定今天挑股票有多嚴；模擬帳只在自己的帳本裡成交，不是向券商下單，也不構成投資建議。",logicNoRegime:"今天還沒有市場心情的資料，等下次掃描寫入。",logicRegimePlain:"上面是今天的判斷，美股與台股各看各的。心情與資金面用文字呈現；原始溫度分數不在這裡展開。部位倍數代表什麼，寫在第一節。",logicStep1:"先看市場",logicStep1Lead:"每天先分開看美國與台灣，決定今天的挑法有多嚴、名單大概留幾檔。這一層本身不下單。",logicStep1Caption:"表上是基本對應。部位倍數只改名單長短，以及畫面上的積極程度，不會拿去乘模擬帳的股數。恐慌後若已站回二十日均線，挑法會改得比較積極，見下面說明。",logicStep2:"再挑個股",logicStep2Lead:"下面每一條都是能不能進名單。真正的買與賣在模擬帳，而且美股、台股各過各的關。",logicStep3:"策略頁另外對照",logicStep3Lead:"這不是每日名單的複本，而是用公開欄位再對一次。缺資料就略過。",logicStep4:"決定誰排前面",logicStep4Lead:"過關之後才排序。往前或往後，不代表已經買進或賣出。",logicStep5:"理由那一句",logicStep5Lead:"名單上的說明，來自當天已核對的欄位，不是另外寫的故事。",logicStep6:"模擬帳的買與賣",logicStep6Lead:"模擬帳用來檢查流程有沒有照規則走。它不是券商委託，也不會把美股盈虧換算進台股。",logicPhaseDefensive:"約七檔",logicPhaseSelective:"約九檔",logicPhaseBalanced:"約十二檔",logicPhaseConstructive:"約十二檔",logicPhaseAggressive:"最多十四檔",logicPhaseStabilize:"約五檔",logicLblDoes:"在做什麼",logicLblWhen:"何時進出",logicLblRefuse:"不會做什麼",logicLblExample:"舉例",logicOpenStrategies:"開啟策略頁",logicOpenPaper:"開啟模擬頁",logicFootnote:"以上說明供對照篩選規則，不是投資建議。經典方法只採用公開數字算得出來的部分，不搬運受著作權保護的原文。",logicSepTitle:"美股與台股分開",logicSepDoes:"兩個市場各看自己的指數、自己的名單，不合成一種全球心情。",logicSepWhen:"美股只跟標普比，台股只跟加權指數比。模擬的美股帳與台股帳分開記，現金不互相移轉。",logicSepRefuse:"不會因為美股很熱，就把台股改成同一種挑法，反過來也不會。",logicSepExample:"同一天可以是美股精選、台股仍均衡。兩邊名單各寫各的，不會用一邊的結果去填另一邊。",logicMoodTitle:"市場心情決定今天有多挑",logicMoodDoes:"先把該市場分成六種心情，每一種對應一種挑法，並改每天大約留幾檔。",logicMoodWhen:"亢奮用防守，約七檔，畫面上的部位倍數約平常的一半。晚期樂觀用精選，約九檔、約八成。中期用均衡，約十二檔、維持平常。謹慎復甦用偏建設，仍約十二檔，倍數約一點一倍。絕望用積極，最多十四檔，約一點三五倍。恐慌用先求穩，約五檔、約三成。若恐慌之後指數已站回二十日均線，挑法會改偏積極；若資金面同時偏緊，則只到偏建設，不會放到最積極。",logicMoodRefuse:"部位倍數不拿來計算模擬帳要買幾股。也不會把六種心情合成一個全球分數。",logicMoodExample:"價格離高點很近、市場顯得亢奮時，不會因此多挑，反而少留幾檔，只看走勢比較完整的名字。",logicRatesTitle:"利率走快時，把積極度拉回來",logicRatesDoes:"用美國十年期公債殖利率的變化，標記資金面偏緊或偏鬆。這是註記，不是另一套選股算式。",logicRatesWhen:"二十個交易日內，殖利率上升達到零點二五個百分點，資金面標成偏防守。若當時的挑法比精選更鬆，包括均衡、偏建設與積極，而且不是恐慌當下的先求穩，就改成精選。已經是防守的，維持防守。六十個交易日內，殖利率下降達到零點二五個百分點，資金面標成偏進攻。",logicRatesRefuse:"殖利率下降不會因此把挑法改成積極。市場已經亢奮時，也不會因為資金面偏鬆就把防守拿掉。台股另看美元兌台幣：二十日內上升達到百分之二，原本偏進攻的改為中性，否則標成偏防守。這條不套到美股名單。美元兌台幣走弱只作註記，不放寬挑法。",logicRatesExample:"股價看起來平平，但美國公債殖利率半個月內明顯走高，今天仍會挑得比較嚴，不會當成普通的中期行情。台股若同時碰到美元走強，資金面註記會更偏緊，美股名單不跟著改。",logicBalTitle:"均衡時，怎麼進動能名單",logicBalDoes:"市場中性時，用今天、近五天、近一個月的強弱，加上股價有沒有站上短期均線，決定能不能標成動能。二十日均線是近二十個交易日的平均價，五十日、兩百日依此類推。",logicBalWhen:"符合下面任何一項就標上。今天比該市場指數強至少零點五個百分點，或自己上漲至少百分之一點五。或者近五天漲至少百分之三。或者近一個月漲至少百分之六，而且股價在二十日均線之上。或者同時在二十日與五十日均線之上，而且近五天沒有下跌，或今天沒有輸給指數。過了這關才有資格進動能名單。模擬帳還要等它出現在該市場名單、而且不是純觀察，才可能買。",logicBalRefuse:"四項都不符合，就不標動能。這一關不賣股票，也不會用美股的強弱去讓台股過關。",logicBalExample:"一檔美股今天只小漲，但比標普多出至少半個百分點，可以進這關。一檔台股要跟加權指數比，不是跟標普比。",logicSelTitle:"精選時更看中期均線",logicSelDoes:"要少挑的時候，先要求股價站上五十日均線，再看短線有沒有力量。",logicSelWhen:"必須在五十日均線之上，而且再符合一項：今天比指數強至少零點五個百分點，或近五天漲至少百分之三，或近一個月漲至少百分之六且在二十日均線之上。",logicSelRefuse:"還在五十日均線下方的，即使今天反彈，也不進這關。",logicSelExample:"一檔台股今天反彈，但仍低於五十日均線。精選日不會因為單日上漲就放進動能名單。美股同樣先看五十日均線，只是比較的對象換成標普。",logicDefTitle:"防守時兩條均線都要在",logicDefDoes:"市場很熱時，只留短期與中期趨勢都還在、而且不是靠很小的成交量硬墊高的名字。",logicDefWhen:"必須同時站上二十日與五十日均線，而且今天比指數強至少零點八個百分點，或近五天漲至少百分之四。成交量至少要有近二十日的平常水準。若當天沒有成交量資料，這一項不擋。",logicDefRefuse:"近一個月已經漲至少百分之十二，成交量卻不到平常的八成，直接剔除。不把這種又急又薄的漲勢留在防守名單。",logicDefExample:"一檔美股一個月漲很多，今天成交卻明顯少於平常。防守日不會因為漲得多就留下它。台股用同樣的標準，成交量跟自己近二十日比，不跟美股比。",logicAggTitle:"積極時放寬，但仍要有均線或量",logicAggDoes:"可以早一點看的時候，放寬今天和近一個月的門檻，也允許價格還弱、但成交放大的情況。",logicAggWhen:"今天比指數強至少零點三個百分點，或自己上漲至少百分之一，或近五天漲至少百分之二，或近一個月漲至少百分之四且在二十日均線之上，或站在兩百日均線之上、近一個月仍下跌、成交量至少是平常的一點四倍。除此之外，還要站上兩百日或二十日均線，或成交量至少是平常的一點三倍。",logicAggRefuse:"只是弱、沒有站上這些均線、量也不夠的，不會因為姿態積極就放行。",logicAggExample:"一檔股票一個月還在跌，但已站上長期均線，成交也明顯比平常多。積極日可以把它看成有人承接，而不是直接忽略。美股、台股都用這組條件，只是各自跟自己的指數比。",logicConTitle:"偏建設比積極多一道均線",logicConDoes:"復甦初期用和積極幾乎相同的力量條件，但一定要站上二十日或兩百日均線。",logicConWhen:"力量條件與積極相同。過了之後，還必須在二十日均線或兩百日均線之上。",logicConRefuse:"沒有站上這兩條之一、只靠成交量湊過積極那一關的，偏建設不收。",logicConExample:"成交量來到平常的一點三倍，股價卻仍在二十日與兩百日均線下方。積極日有機會，偏建設日不會收。這條在美股與台股各自判斷，不會互相借用。",logicStabTitle:"先求穩，要先站回二十日均線",logicStabDoes:"恐慌之後不急著接，先看股價有沒有回到二十日均線之上，而且當天要明顯強過指數，或成交明顯放大。",logicStabWhen:"必須在二十日均線之上，並且今天比指數強至少一個百分點，或成交量至少是平常的一點五倍。",logicStabRefuse:"還在二十日均線下方的一律不進。這種日子也不使用一個月漲夠多就補標的後門。",logicStabExample:"大跌過後，一檔台股仍在二十日均線下，即使成交很大，也不放進動能名單。美股同樣要先站回自己的二十日均線。",logicVolTitle:"成交量是另一個標籤",logicVolDoes:"用今天的成交量，除以近二十個交易日的平均量，看今天有沒有比平常熱。這是標籤，不是另一筆買進。",logicVolWhen:"防守日至少要有平常的水準。積極日至少要是平常的一點一倍。其他挑法至少一點二倍。達到就多標一個量能記號。",logicVolRefuse:"沒有成交量資料就不標。不會只因為有量能記號，就在另一個市場下單，也不會因此賣出。",logicVolExample:"均衡日一檔股票比平常多出至少兩成，會標上量能；不到兩成則不標。台股的平常是它自己近二十日的量，不是美股的量。",logicBackTitle:"一個月夠強，可以補進動能",logicBackDoes:"有些股票今天不夠強，但近一個月趨勢清楚，仍補上動能標籤。",logicBackWhen:"原本沒過動能關，但近一個月漲至少百分之八，而且同時站上二十日與五十日均線。先求穩的日子不用這條。",logicBackRefuse:"一個月強、卻沒有同時站上這兩條均線的，不補。先求穩時也不補。補上之後仍只留在該市場的名單。",logicBackExample:"今天輸給加權指數，但近一個月漲超過百分之八，而且兩條均線都在股價下方。台股的均衡日仍會補上動能。美股則是跟標普比完仍沒過關時，才用同一條補。",logicRankTitle:"名單裡誰排前面",logicRankDoes:"進了名單之後，今天比指數強的程度排最前，其次是近五天，再來是近一個月。站上均線、成交明顯放大，會再往前靠。",logicRankWhen:"站上二十日均線的加分多於五十日，五十日又多於兩百日。成交量至少是平常的一點二倍會再往前；不到平常的四成會略往後。當天漲至少百分之九點五，也會往前。美股用相對標普的差距，台股用相對加權的差距。",logicRankRefuse:"這裡不公開加權算式。缺了當天漲跌，這檔不照正常方式往前排。不會把台股的強弱拿去排美股。",logicRankExample:"兩檔都在美股名單上時，今天比標普強更多的那檔，通常排在只靠一個月漲幅的前面。台股名單裡的名次只在台股之間比。",logicHotTitle:"熱但量不夠，就往後排",logicHotDoes:"防守和精選時，已經漲一段、成交卻變少的名字，排序往後，不讓它因為漲得多就排很前。",logicHotWhen:"這兩種挑法下，若同時站上二十日與五十日均線，排序略往前；少了其中一條就往後。近一個月漲至少百分之八、成交量不到平常的八成，再明顯往後。成交量不到平常的七成、當天又漲超過百分之二，也往後。",logicHotRefuse:"不會在這種日子把縮量急漲排到最前。策略頁在防守或精選時，會把這種一個月強、量卻薄的標的排除在那一包之外。每日名單仍可能看得到，只是名次往後。",logicHotExample:"精選日一檔台股一個月漲了約一成，今天的量只有平常的一半。它就算還在台股名單裡，也會被排到後面。美股用同一標準，量是跟自己比。",logicFirmTitle:"價弱但量出來，可以往前",logicFirmDoes:"積極和偏建設時，價格一個月還在跌、但長期趨勢還在、成交放大的名字，排序往前。",logicFirmWhen:"近一個月仍下跌、成交量至少是平常的一點五倍、而且站上兩百日均線，會明顯往前。當天上漲且成交量至少是平常的一點一倍，也會往前一些。低於五十日均線、但仍在兩百日均線之上，再小幅往前。",logicFirmRefuse:"不會把一個月下跌、量又沒有放大的當成承接。這條不加在防守、精選或先求穩的日子。",logicFirmExample:"積極日一檔美股一個月還小跌，但站在長期均線上，成交比平常多出一半以上。它會排在同樣弱、量卻平平的美股前面。台股只跟其他台股比這件事。",logicPanicTitle:"沒站回短期均線，就排更後",logicPanicDoes:"先求穩時，名字先整體往後排；已經站回二十日均線的再拉回一些，還沒站回的再往後。",logicPanicWhen:"站上二十日均線的，往後排的幅度比較小。沒站上的，通常排不進前面。",logicPanicRefuse:"不會因為恐慌就改去買跌最深的，也沒有越跌越優先。",logicPanicExample:"大跌之後，已回到二十日均線上的那檔，會排在仍在均線下的前面。美股、台股各自排序，不把兩邊混成一張表。",logicCountTitle:"名單大概留幾檔",logicCountDoes:"挑法會改每天公布的檔數，避免熱的時候名單太長。",logicCountWhen:"平常約十二檔。防守約七檔，精選約九檔，先求穩約五檔，積極最多十四檔。均衡與偏建設維持約十二檔。美股一份、台股一份，檔數各自計算。",logicCountRefuse:"不會為了湊滿檔數，把沒過門檻的補進去，也不會把美股空出來的名額讓給台股。",logicCountExample:"防守日即使很多股票都漲，公開的美股名單仍只留前面約七檔。台股名單另外留自己的約七檔。",logicXqTitle:"策略頁是另一份對照",logicXqDoes:"用公開的價量、籌碼、財務，以及能用公開數字計算的經典條件，另外列命中的股票。它跟每日名單同時存在，不是同一張表的複本。",logicXqWhen:"價量看均線與短線。籌碼看公開的法人張數。財務看獲利、本益比、營益率等公開欄位。週期條件則跟著當天美股、台股各自的挑法走。",logicXqRefuse:"某個欄位沒有公開資料，就跳過那個條件，不補一個看起來合理的數字，也不搬付費資料庫的內容。不會用台股的張數去填美股。",logicXqExample:"台股若缺少法人張數，籌碼那一條就略過，不會假設外資在買。美股沒有同一套張數時，也不拿台股的籌碼結果去補。",logicWhyTitle:"理由是把當天看得到的事實接起來",logicWhyDoes:"每一檔後面的理由，用當天已核對的漲跌、均線和成交量串成一句話，不是另外寫的故事。",logicWhyWhen:"一定寫當天漲跌，以及相對指數差了幾個百分點：美股對標普，台股對加權。有近五天、近一個月就寫上。成交量至少是平常的一點二倍才寫量。均線優先寫有沒有同時站上二十日與五十日，再補兩百日。排序時若有週期註記就附上，否則附上當天的挑法。",logicWhyRefuse:"不會寫資料裡沒有的目標價。量沒有明顯放大，就不寫成爆量。也不會把台股的理由寫成相對標普。",logicWhyExample:"同一天，台股的理由會寫相對加權，美股的理由會寫相對標普。兩邊不會共用一句比較。",logicBuyTitle:"模擬帳怎麼買",logicBuyDoes:"資料日更新後，先處理該賣的，再依當天名單在美股帳、台股帳各自買。成交價用當天資料裡的價格，視為立刻成交。帳從台幣三百萬與美元十萬起算，現金和持股會留下，不會每天歸零。",logicBuyWhen:"只買該市場名單裡的股票，純觀察的不買。先買當天前五名裡屬於這個市場的，再買其餘。每一筆新倉願意承擔的虧損大約是帳上權益的百分之一；假設價格往不利方向走百分之一點五，反推能買幾股。成交量達到平常的三倍時，不利方向改用百分之二點五，同樣的風險金額會買得少一些。單一個股的市值不超過權益的百分之八。已經持有、今天仍在名單、還沒到百分之八，同一天最多再加一次；當天賣過的不加回。",logicBuyRefuse:"現金不夠買一股就不買。台股買不起一整張，也就是一千股，就跳過，不改買零股。美股可以從一股開始。兩本帳不做匯率換算。畫面上的部位倍數不拿來乘股數。",logicBuyExample:"台股帳看到名單上的股票，但依上面的算法買不起一千股，就整檔跳過。美股帳同一天可以只買一股，不會套用台股的張數規則。",logicSellTitle:"模擬帳怎麼賣",logicSellDoes:"每天先檢查該帳手上的股票。先碰到的規則先賣，停損排在停利前面。賣出也用當天資料裡的價格。",logicSellWhen:"相對成本虧了百分之三或更多，全部賣掉。當初買進時當天漲至少百分之九點五，或風險說明寫了漲停，而且不是買進當天、今天又跌了百分之五或更多，全部賣掉。資料寫明股價在二十日均線之下，而且當天下跌超過百分之二，全部賣掉。今天不在該市場名單上，而且帳上還在賠，全部賣掉。獲利達到百分之十二或更多，賣掉一半。美股只剩一股，或台股一半不足一千股，就全部賣掉。台股賣出股數會取整到一千股。",logicSellRefuse:"獲利不到百分之十二，不會因為已經賺錢就賣。還在名單上、又沒碰到上面幾條，就不賣。兩條資料若沒有寫明均線或當天漲跌，動能轉弱這一條不觸發，不會用猜的。美股的賣出不拿去結算台股帳。",logicSellExample:"成本一百元、漲到一百一十二元，模擬帳賣掉一半，另一半留著。若先跌到九十七元，則是全部停損，不會先做停利。這套賣法在美股帳用美元成本，在台股帳用台幣成本，不混著算。",sma20:"SMA20",sma50:"SMA50",screenA:"A",screenB:"B",screenC:"C",condPass:"條件",condFail:"未過",condSkip:"略過",pe:"本益比",opMargin:"營益率",grossMargin:"毛利率",foreignInv:"外資",trustInv:"投信",dealerInv:"自營商",maBull:"均線多頭",rsi:"RSI",amplitude:"振幅",zhang:"張",limitUp:"漲停",momentum:"動能",metricPrice:"價格",metricDayPct:"日漲跌",metricVolRatioYday:"量比(昨)",metricVolToday:"今量(張)",metricDebt:"負債比%",metricDirector:"董監持股%",metricOpQ:"近季營益率%",metricSource:"來源",foreign1d:"外資1日(張)",trust1d:"投信1日(張)",dealer1d:"自營商1日(張)",foreign5d:"外資5日(張)",trust5d:"投信5日(張)",dealer5d:"自營5日(張)"},Ee={"zh-Hant":fs},fn={en:()=>se(()=>import("./en-DkccwOZD.js"),[]),"zh-Hans":()=>se(()=>import("./zh-Hans-CSrf3NNq.js"),[]),ja:()=>se(()=>import("./ja-CHFOJX8r.js"),[])},We=new Map;function ms(e){if(Ee[e])return Promise.resolve(!0);const t=fn[e];return t?(We.has(e)||We.set(e,t().then(a=>(Ee[e]={...fs,...a.default||{}},!0)).catch(a=>(We.delete(e),console.warn(`i18n ${e} load failed`,a),!1))),We.get(e)):Promise.resolve(!1)}function mn(){return ms(N).then(e=>(!e&&N!==Be&&(N=Be),N))}function G(e){if(e==null||e==="")return s("dataInsufficient");const t=String(e),a=`enum_${t}`,i=t.includes("_")?t.replace(/_/g," "):t;return s(a,i.replace(/\b\w/g,r=>r.toUpperCase()))}function yn(e){const t=String(e||"").toLowerCase();return["defensive","selective","balanced","constructive","aggressive","stabilize_first"].includes(t)?t.replace(/_/g,"-"):"neutral"}function s(e,t,a){let i,r=a;t&&typeof t=="object"&&!Array.isArray(t)?r=t:typeof t=="string"&&(i=t);let l=(Ee[N]||Ee[Be])[e]??Ee[Be][e]??i??e;if(r)for(const[c,u]of Object.entries(r))l=l.replace(new RegExp(`\\{${c}\\}`,"g"),String(u));return l}function vn(){const e=ps.map(t=>`<option value="${t.id}"${t.id===N?" selected":""}>${t.label}</option>`).join("");return`
    <label class="lang-switch" title="${s("langLabel")}">
      <span class="lang-switch-label">${s("langLabel")}</span>
      <select class="lang-select" data-lang-select aria-label="${s("langLabel")}">
        ${e}
      </select>
    </label>`}function $n(e,t){var i;const a=(i=e==null?void 0:e.querySelector)==null?void 0:i.call(e,"[data-lang-select]");a&&(a.value=N,a.addEventListener("change",async()=>{const r=a.value;!await hn(r)&&a.isConnected&&a.value===r&&(a.value=N)}))}function n(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function b(e,t){return n(s(e,t))}const Y=100,za=Object.freeze({TX:200,MTX:50,TMF:10});function $(e){return typeof e=="number"&&Number.isFinite(e)}function ys(e){return Number.isInteger(e)&&e>0}function bn(e,t,a){if(!$(e)||!$(t)||!(e>=0)||!(t>=0))return null;const i=String(a||"").toLowerCase();return i==="call"||i==="c"?Math.max(e-t,0):i==="put"||i==="p"?Math.max(t-e,0):null}function gt({side:e,premium:t,contracts:a,multiplier:i=Y}){if(e!=="buy"&&e!=="sell")return{ok:!1,error:"side must be buy|sell"};if(!$(t)||t<0)return{ok:!1,error:"premium must be ≥ 0 finite"};if(!ys(a))return{ok:!1,error:"contracts must be positive integer"};if(!$(i)||!(i>0))return{ok:!1,error:"multiplier must be > 0"};const r=t*i*a;return $(r)?{ok:!0,cashDelta:e==="buy"?-r:r,notional:r}:{ok:!1,error:"notional non-finite"}}function vs({qty:e,markPremium:t,multiplier:a=Y}){if(!Number.isInteger(e)||e===0||!$(t)||t<0||!$(a)||!(a>0))return null;const i=e*t*a;return $(i)?i:null}function qt({qtySigned:e,avgPremium:t,markPremium:a,multiplier:i=Y}){if(!Number.isInteger(e)||e===0||!$(t)||t<0||!$(a)||a<0||!$(i)||!(i>0))return null;const r=(a-t)*i*e;return $(r)?r:null}function kn({qtySigned:e,spot:t,strike:a,right:i,multiplier:r=Y}){const o=bn(t,a,i);if(o==null)return{ok:!1,error:"bad intrinsic inputs"};if(!Number.isInteger(e)||e===0)return{ok:!1,error:"qtySigned must be non-zero int"};if(!$(r)||!(r>0))return{ok:!1,error:"bad multiplier"};const l=e*o*r;return $(l)?{ok:!0,intrinsic:o,cashDelta:l,settlePremium:o}:{ok:!1,error:"cash non-finite"}}function $s(e){const t=String(e||"").toUpperCase();return Object.prototype.hasOwnProperty.call(za,t)?za[t]:null}function Sn({pointsDelta:e,multiplier:t,contractsSigned:a}){if(!$(e)||!$(t)||!(t>0)||!Number.isInteger(a)||a===0)return null;const i=e*t*a;return $(i)?i:null}function Mt({entryPrice:e,markPrice:t,code:a,contractsSigned:i}){if(!$(e)||!$(t)||!(e>0)||!(t>0))return null;const r=$s(a);return r==null?null:Sn({pointsDelta:t-e,multiplier:r,contractsSigned:i})}function Nt({contracts:e,initialMarginPerContract:t}){if(!ys(e)||!$(t)||!(t>0))return null;const a=e*t;return $(a)?a:null}function Tn({freeCash:e,contracts:t,initialMarginPerContract:a}){if(!$(e)||e<0)return{ok:!1,error:"freeCash invalid"};const i=Nt({contracts:t,initialMarginPerContract:a});return i==null?{ok:!1,error:"margin hold invalid"}:e+1e-9<i?{ok:!1,error:"insufficient margin cash",hold:i}:{ok:!0,hold:i}}function Aa({freeCash:e,premium:t,contracts:a,multiplier:i=Y}){if(!$(e)||e<0)return{ok:!1,error:"freeCash invalid"};const r=gt({side:"buy",premium:t,contracts:a,multiplier:i});return r.ok?e+1e-9<r.notional?{ok:!1,error:"insufficient cash for premium debit",need:r.notional}:{ok:!0,debit:r.notional}:r}function bs(e,t="payload"){const a=[],i=(r,o)=>{if(typeof r=="number"&&!Number.isFinite(r))a.push(o);else if(r&&typeof r=="object")for(const[l,c]of Object.entries(r))i(c,o?`${o}.${l}`:l)};return i(e,""),a.length?{ok:!1,error:`${t} non-finite: ${a.join(",")}`}:{ok:!0}}function ks({stockQty:e,optionRight:t,optionQtySigned:a,underlying:i}){if(!i||!Number.isInteger(a)||a===0)return null;const r=String(t||"").toLowerCase();return a<0&&(r==="call"||r==="c")?Number.isInteger(e)&&e>=Math.abs(a)*Y?"covered-call":"short-call":a>0&&(r==="put"||r==="p")&&Number.isInteger(e)&&e>0?"protective-put":a>0&&(r==="call"||r==="c")?"long-call":a>0&&(r==="put"||r==="p")?"long-put":a<0&&(r==="put"||r==="p")?"short-put":null}function wn({fillPrice:e,avgCost:t,sharesSold:a}){if(!$(e)||!$(t)||!$(a)||!(a>0))return null;const i=(e-t)*a;return $(i)?i:null}function ta(e){if(!e||typeof e!="object")return{status:"missing-cost",value:null};const t=String(e.side||"").toUpperCase();if(t==="BUY"||t==="OPEN")return{status:"open",value:null};if($(e.realizedPnl))return{status:"ok",value:e.realizedPnl};const a=e.avgCostAtSale??e.avgCost,i=wn({fillPrice:e.price??e.premium,avgCost:a,sharesSold:e.qty});return i!=null?{status:"ok",value:i}:{status:"missing-cost",value:null}}function Ss(e){let t=0,a=0,i=0;for(const r of e||[]){const o=String((r==null?void 0:r.side)||"").toUpperCase();if(o!=="SELL"&&o!=="CLOSE")continue;const l=ta(r);l.status==="ok"?(t+=l.value,i+=1):l.status==="missing-cost"&&(a+=1)}return $(t)?{ok:!0,sum:t,missing:a,counted:i}:{ok:!1,sum:null,missing:a,counted:i}}const Pn="./data/paper-portfolio.json";function V(e){return e==null||Number.isNaN(e)?"flat":e>0?"up":e<0?"down":"flat"}function ft(e,t=2){return e==null||Number.isNaN(e)?"—":`${e>0?"+":""}${e.toFixed(t)}%`}function mt(e,t=2){return e==null||Number.isNaN(e)?"—":Number(e).toLocaleString(R(),{minimumFractionDigits:t,maximumFractionDigits:t})}function yt(e){return e==="USD"?"US$":e==="TWD"?"NT$":""}function De(e,t){if(e==null||Number.isNaN(e))return"—";const a=t==="TWD"?0:2;return`${yt(t)}${mt(e,a)}`}function ne(e,t){if(e==null||Number.isNaN(e))return"—";const a=t==="TWD"?0:2,i=mt(Math.abs(e),a);return i===mt(0,a)?`${yt(t)}${i}`:`${e>0?"+":"−"}${yt(t)}${i}`}function be(e,t){if(e==null||Number.isNaN(e))return"—";const a=t==="TWD"&&e>=100?0:2;return`${yt(t)}${mt(e,a)}`}function Ts(e){return{"screen-buy":s("reasonScreenBuy"),add:s("reasonAdd"),stop:s("reasonStop"),"take-profit":s("reasonTakeProfit"),"momentum-break":s("reasonMomentumBreak"),"off-list":s("reasonOffList"),"limit-up-chase":s("reasonLimitUpChase")}[e]||e||""}function Fe(e){return e?`
    <div class="paper-win">
      <div class="w-label">${e.sinceInception?b("sinceInception",s("sinceInception")):n(e.label||"")}</div>
      <div class="w-val ${V(e.pct)}">${ft(e.pct)}</div>
    </div>`:'<div class="paper-win"><div class="w-label">—</div><div class="w-val">—</div></div>'}function xn(e){if($(e==null?void 0:e.avgCostAtSale))return e.avgCostAtSale;if($(e==null?void 0:e.avgCost))return e.avgCost;if($(e==null?void 0:e.realizedPnl)&&$(e==null?void 0:e.price)&&$(e==null?void 0:e.qty)&&e.qty>0){const t=e.price-e.realizedPnl/e.qty;return $(t)?t:null}return null}function ws(e,t){if(String((e==null?void 0:e.side)||"").toUpperCase()==="BUY")return{html:"—",cls:"flat",value:null,avgCost:null};const i=ta(e),r=xn(e);return i.status==="ok"&&$(i.value)?{html:ne(i.value,t),cls:V(i.value),value:i.value,avgCost:r}:i.status==="open"?{html:n(s("realizedOpenOnly")),cls:"flat",value:null,avgCost:r}:{html:n(s("costMissing")),cls:"flat",value:null,avgCost:null}}function Ps(e,t){return e.length?e.map(a=>{var o;const i=ws(a,t),r=$(i.avgCost)?`<div class="rp-cost">${n(s("avgCost"))} ${be(i.avgCost,t)}</div>`:"";return`
      <tr>
        <td><span class="ticker">${n(a.ticker)}</span></td>
        <td class="name-cell">${n(a.name||"")}</td>
        <td class="num">${(o=a.qty)==null?void 0:o.toLocaleString(R())}</td>
        <td class="num">${be(a.price,t)}</td>
        <td class="num ${i.cls}">${i.html}${r}</td>
        <td><span class="badge reason ${n(a.reason||"")}">${n(Ts(a.reason))}</span></td>
        <td class="why-cell">${n(a.reasonText||"")}</td>
      </tr>`}).join(""):`<tr><td colspan="7" class="empty-cell">${n(s("noTradesToday"))}</td></tr>`}function Ln(e){return e.dayPct==null||Number.isNaN(e.dayPct)||e.mark==null||e.qty==null?null:e.mark*e.qty*e.dayPct/100}function jn(e,t,a){if(!e.length)return`<tr><td colspan="11" class="empty-cell">${n(s("noPositions"))}</td></tr>`;const r=a>0?a:e.reduce((l,c)=>l+(c.mark||0)*(c.qty||0),0),o=Object.fromEntries(["qty","mark","mktValue","dayPnl","dayPct","unrealizedPnl","unrealizedPct","costBasis","avgCost","weightPct"].map(l=>[l,n(s(l))]));return e.map(l=>{var k;const c=(l.mark||0)*(l.qty||0),u=(l.avgCost||0)*(l.qty||0),d=(l.mark-l.avgCost)*l.qty,p=l.avgCost?(l.mark-l.avgCost)/l.avgCost*100:0,h=Ln(l),g=r>0?c/r*100:null,f=l.name?n(l.name):"";return`
      <tr class="pos-row" data-lq="pos" data-lq-sym="${n(l.ticker)}"
          data-ticker="${n(l.ticker)}"
          data-lq-qty="${l.qty??""}" data-lq-avg="${l.avgCost??""}" data-lq-ccy="${n(t)}"
          data-lq-mark="${l.mark??""}" data-lq-daypct="${l.dayPct??""}"
          tabindex="0">
        <td class="pos-sym">
          <span class="ticker">${n(l.ticker)}</span>
          ${f?`<span class="pos-name">${f}</span>`:""}
        </td>
        <td class="num" data-label="${o.qty}">${(k=l.qty)==null?void 0:k.toLocaleString(R())}</td>
        <td class="num" data-label="${o.mark}" data-lq-field="price">${be(l.mark,t)}</td>
        <td class="num" data-label="${o.mktValue}">${De(c,t)}</td>
        <td class="num ${V(h)}" data-label="${o.dayPnl}">${h==null?"—":ne(h,t)}</td>
        <td class="num ${V(l.dayPct)}" data-label="${o.dayPct}" data-lq-field="dayPct">${ft(l.dayPct)}</td>
        <td class="num ${V(d)}" data-label="${o.unrealizedPnl}">${ne(d,t)}</td>
        <td class="num ${V(p)}" data-label="${o.unrealizedPct}">${ft(p)}</td>
        <td class="num" data-label="${o.costBasis}">${De(u,t)}</td>
        <td class="num" data-label="${o.avgCost}">${be(l.avgCost,t)}</td>
        <td class="num" data-label="${o.weightPct}">${g==null?"—":`${g.toFixed(2)}%`}</td>
      </tr>`}).join("")}function Cn(e,t,a){const i=t.currency,r=s(e==="TW"?"paperBookTw":"paperBookUs"),o=De(t.startCash,i),l=(a==null?void 0:a.totalPnl)??t.equity-t.startCash,c=(a==null?void 0:a.totalPnlPct)??(t.startCash?(t.equity-t.startCash)/t.startCash*100:0),u=(a==null?void 0:a.realizedPnl)??t.realizedPnl??0,d=(a==null?void 0:a.unrealizedPnl)??($(l)&&$(u)?l-u:null);return`
    <article class="paper-book">
      <h3 class="paper-book-title">${n(r)}</h3>
      <p class="paper-start">${b("principal",s("principal"))} ${o}</p>
      <div class="paper-kpis">
        <div class="paper-kpi paper-kpi--equity">
          <div class="k-label">${b("position",s("equity"))}</div>
          <div class="k-val" data-lq-kpi="equity">${De(t.equity,i)}</div>
        </div>
        <div class="paper-kpi">
          <div class="k-label">${n(s("cash"))}</div>
          <div class="k-val" data-lq-kpi="cash">${De(t.cash,i)}</div>
        </div>
        <div class="paper-kpi">
          <div class="k-label">${n(s("totalPnl"))}</div>
          <div class="k-val ${V(l)}" data-lq-kpi="pnl">${ne(l,i)}</div>
        </div>
        <div class="paper-kpi">
          <div class="k-label">${n(s("totalPnlPct"))}</div>
          <div class="k-val ${V(c)}" data-lq-kpi="pnlPct">${ft(c)}</div>
        </div>
        <div class="paper-kpi">
          <div class="k-label">${n(s("realizedPnl"))}</div>
          <div class="k-val ${V(u)}" data-lq-kpi="realized">${ne(u,i)}</div>
        </div>
        <div class="paper-kpi">
          <div class="k-label">${n(s("unrealizedPnl"))}</div>
          <div class="k-val ${V(d)}" data-lq-kpi="unrealized">${ne(d,i)}</div>
        </div>
      </div>
      <div class="paper-windows">
        <div>
          <div class="win-name">${n(s("weekPerf"))}</div>
          ${Fe(a==null?void 0:a.week)}
        </div>
        <div>
          <div class="win-name">${n(s("monthPerf"))}</div>
          ${Fe(a==null?void 0:a.month)}
        </div>
        <div>
          <div class="win-name">${n(s("quarterPerf"))}</div>
          ${Fe(a==null?void 0:a.quarter)}
        </div>
        <div>
          <div class="win-name">${n(s("yearPerf"))}</div>
          ${Fe(a==null?void 0:a.year)}
        </div>
      </div>
    </article>`}function xs(e,t){return e.length?e.map(a=>{var l;const i=a.side==="SELL"?s("sell"):s("buy"),r=ws(a,t),o=a.side==="SELL"&&$(r.avgCost)?`<div style="font-family:var(--mono);font-size:0.82rem;color:var(--text-muted)">${n(s("avgCost"))} ${be(r.avgCost,t)}</div>`:"";return`
      <div class="list-card paper-card">
        <div class="lc-head">
          <div>
            <span class="ticker" style="font-family:var(--mono);font-weight:600">${n(a.ticker)}</span>
            <span style="color:var(--text-muted);font-size:0.85rem;margin-left:0.35rem">${n(a.name||"")}</span>
          </div>
          <div style="text-align:right">
            <div style="font-family:var(--mono)">${n(i)} ${(l=a.qty)==null?void 0:l.toLocaleString(R())} ${n(s("shares"))}</div>
            <div style="font-family:var(--mono)">${be(a.price,t)}</div>
            ${a.side==="SELL"?`<div style="font-family:var(--mono)" class="${r.cls}">${n(s("realizedPnl"))} ${r.html}</div>`:""}
            ${o}
          </div>
        </div>
        <div class="flags" style="margin-bottom:0.35rem">
          <span class="badge reason ${n(a.reason||"")}">${n(Ts(a.reason))}</span>
        </div>
        ${a.reasonText?`<p class="lc-why">${n(a.reasonText)}</p>`:""}
      </div>`}).join(""):`<div class="list-card empty-card">${n(s("noTradesToday"))}</div>`}function zn(e,t){const a=(e||[]).filter(o=>String(o.side||"").toUpperCase()==="SELL");if(!a.length)return"";const i=Ss(a);if(!i.ok)return"";const r=i.missing>0?` · ${n(s("costMissingCount",{n:String(i.missing)}))}`:"";return`
    <p class="paper-realized-foot">
      ${n(s("sessionRealizedPnl"))}
      <strong class="${V(i.sum)}">${ne(i.sum,t)}</strong>${r}
    </p>`}function Ea(e,t,a,{showSessionRealized:i=!1}={}){return`
    <div class="paper-table-block">
      <h4>${n(e)}</h4>
      <div class="table-wrap">
        <table class="stock-table paper-table">
          <thead>
            <tr>
              <th>${b("ticker",s("ticker"))}</th>
              <th>${n(s("name"))}</th>
              <th>${n(s("qty"))}</th>
              <th>${n(s("price"))}</th>
              <th class="num">${n(s("realizedPnl"))}</th>
              <th>${n(s("reason"))}</th>
              <th>${n(s("note"))}</th>
            </tr>
          </thead>
          <tbody>${Ps(t,a)}</tbody>
        </table>
      </div>
      <div class="mobile-list">${xs(t,a)}</div>
      ${i?zn(t,a):""}
    </div>`}function An(e,t,a){if(!e.length)return"";const i=new Map;for(const l of e){const c=l.date||"—";i.has(c)||i.set(c,[]),i.get(c).push(l)}const r=[...i.entries()],o=r.map(([l,c],u)=>{const d=c.filter(k=>String(k.side||"").toUpperCase()==="BUY").length,p=c.length-d,h=c.filter(k=>String(k.side||"").toUpperCase()==="SELL"),g=h.length?Ss(h):null,f=g&&g.ok?`<span class="th-pnl ${V(g.sum)}">${n(s("histDayRealized"))} ${ne(g.sum,t)}</span>`:`<span class="th-pnl flat">${n(s("histNoSells"))}</span>`;return`
      <details class="trade-day"${u===0&&l!==a?" open":""}>
        <summary>
          <span class="th-date">${n(l)}</span>
          <span class="th-count">${n(s("histDayCount",{b:String(d),s:String(p)}))}</span>
          ${f}
        </summary>
        <div class="table-wrap">
          <table class="stock-table paper-table">
            <thead>
              <tr>
                <th>${b("ticker",s("ticker"))}</th>
                <th>${n(s("name"))}</th>
                <th>${n(s("qty"))}</th>
                <th>${n(s("price"))}</th>
                <th class="num">${n(s("realizedPnl"))}</th>
                <th>${n(s("reason"))}</th>
                <th>${n(s("note"))}</th>
              </tr>
            </thead>
            <tbody>${Ps(c,t)}</tbody>
          </table>
        </div>
        <div class="mobile-list">${xs(c,t)}</div>
      </details>`}).join("");return`
    <div class="paper-table-block paper-history">
      <h4>${n(s("tradeHistory"))}</h4>
      <p class="paper-history-hint">${n(s("tradeHistoryHint",{n:String(r.length),total:String(e.length)}))}</p>
      ${o}
    </div>`}function En(e,t,a){return`
    <div class="paper-table-block paper-pos-block">
      <div class="pos-block-head">
        <h4>${n(s("positions"))}</h4>
        <span class="pos-scroll-hint">${n(s("posScrollHint"))}</span>
      </div>
      <div class="pos-scroll" role="region" tabindex="0" aria-label="${n(s("positions"))}">
        <table class="pos-table pos-table--cards">
          <thead>
            <tr>
              <th class="pos-sym">${b("ticker",s("ticker"))}</th>
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
          <tbody>${jn(e,t,a)}</tbody>
        </table>
      </div>
    </div>`}function Da(e,t,a,i,r,o){if(!t)return"";const l=t.currency,c=[...t.trades||[]].sort((g,f)=>g.date<f.date?1:g.date>f.date?-1:0),u=c.filter(g=>g.date===i),d=u.filter(g=>g.side==="BUY"),p=u.filter(g=>g.side==="SELL"),h=o;return`
    <div class="paper-panel ${r?"active":""}" id="paper-panel-${e}" role="tabpanel"
         data-lq-book="${n(e)}" data-lq-cash="${t.cash??""}"
         data-lq-start="${t.startCash??""}" data-lq-ccy="${n(l)}">
      ${Cn(e,t,a)}
      <p class="paper-session-note">${n(s("paperSession",{date:i||"—",inception:h}))}</p>
      ${Ea(`${s("buy")} ${i||""}`,d,l)}
      ${Ea(`${s("sell")} ${i||""}`,p,l,{showSessionRealized:!0})}
      ${En(t.positions||[],l,t.positionsValue)}
      ${An(c,l,i)}
    </div>`}function Dn(e){var l,c;if(!e||!e.books)return`
      <section class="section paper-section" id="paper">
        <h2 class="section-title">${b("paperTrade",s("paper"))}</h2>
        <p class="paper-missing">${n(s("paperMissing"))}</p>
      </section>`;const t=e.books.TW,a=e.books.US;let r=(e.asOf||"").slice(0,10);try{r=new Date(e.asOf).toLocaleDateString("en-CA",{timeZone:"Asia/Taipei"})}catch{}const o=e.startDate||(t==null?void 0:t.startDate)||(a==null?void 0:a.startDate)||"2026-09-15";return`
    <section class="section paper-section" id="paper">
      <h2 class="section-title">${b("paperTrade",s("paper"))}</h2>
      <p class="paper-disclaimer" role="note">
        ${n(s("paperDisclaimer",{date:o}))}
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
      ${Da("TW",t,(l=e.metrics)==null?void 0:l.TW,r,!0,o)}
      ${Da("US",a,(c=e.metrics)==null?void 0:c.US,r,!1,o)}
    </section>`}function qn(e){const t=e.querySelectorAll(".paper-tab-btn");t.forEach(a=>{a.addEventListener("click",()=>{const i=a.dataset.paperTab;t.forEach(r=>{const o=r.dataset.paperTab===i;r.classList.toggle("active",o),r.setAttribute("aria-selected",o?"true":"false")}),e.querySelectorAll(".paper-panel").forEach(r=>{r.classList.toggle("active",r.id===`paper-panel-${i}`)})})})}async function Mn(){try{const e=await fetch(Pn);return e.ok?await e.json():null}catch{return null}}const Ls="jml-paper-deriv-v1",Nn="./data/us-options-snapshot.json",Rn="./data/txf-desk.json",On="./data/paper-derivatives.json",aa="2026-09-15";function de(){return{cashAdj:0,marginHold:0,realizedPnl:0,positions:[],trades:[]}}function Ce(){return{version:1,startDate:aa,cumulative:!0,US:de(),TW:de()}}function Bn(){try{const e=localStorage.getItem(Ls);if(!e)return Ce();const t=JSON.parse(e);return!t||t.version!==1?Ce():{...Ce(),...t,US:{...de(),...t.US||{}},TW:{...de(),...t.TW||{}}}}catch{return Ce()}}function He(e){const t=bs({US:{cashAdj:e.US.cashAdj,marginHold:e.US.marginHold,realizedPnl:e.US.realizedPnl},TW:{cashAdj:e.TW.cashAdj,marginHold:e.TW.marginHold,realizedPnl:e.TW.realizedPnl}});return t.ok?(localStorage.setItem(Ls,JSON.stringify(e)),!0):(console.error("paper-deriv blocked save:",t.error),!1)}function _(e,t=2){if(!Number.isFinite(e))return 0;const a=10**t;return Math.round(e*a)/a}function J(){return new Date().toLocaleDateString("en-CA",{timeZone:"Asia/Taipei"})}function K(e,t=2){return e==null||Number.isNaN(e)?"—":Number(e).toLocaleString(R(),{minimumFractionDigits:t,maximumFractionDigits:t})}function B(e,t){return e==null||Number.isNaN(e)?"—":`${t==="USD"?"US$":t==="TWD"?"NT$":""}${K(e,t==="TWD"?0:2)}`}function le(e){return e==null||Number.isNaN(e)?"flat":e>0?"up":e<0?"down":"flat"}function Hn(e){return`${e.underlying}|${e.expiry}|${e.strike}|${e.right}`}function _n(e){return`${e.code}|${e.month}`}async function Un(){try{const e=await fetch(Nn);return e.ok?await e.json():null}catch{return null}}async function In(){try{const e=await fetch(Rn);if(!e.ok)return null;const t=await e.json();return(t==null?void 0:t.market)!=="TW"||!(t!=null&&t.contracts)?null:t}catch{return null}}async function Wn(){try{const e=await fetch(On);if(!e.ok)return null;const t=await e.json();if(!t||t.version!==1||t.booksSeparate!==!0)return null;const a={version:1,startDate:t.startDate||aa,asOf:t.asOf||null,noteZh:t.noteZh||"",noteEn:t.noteEn||"",US:{...de(),...t.US||{}},TW:{...de(),...t.TW||{}}};if(!bs({US:{cashAdj:a.US.cashAdj,marginHold:a.US.marginHold,realizedPnl:a.US.realizedPnl},TW:{cashAdj:a.TW.cashAdj,marginHold:a.TW.marginHold,realizedPnl:a.TW.realizedPnl}}).ok)return null;const r=(a.US.positions||[]).some(l=>l.asset==="option"&&Number.isInteger(l.qtySigned)&&l.qtySigned!==0),o=(a.TW.positions||[]).some(l=>l.asset==="futures"&&(l.code==="TX"||l.code==="MTX")&&Number.isInteger(l.qtySigned)&&l.qtySigned!==0);return!r||!o?null:a}catch{return null}}function Fn(e){for(const t of["US","TW"])e[t].positions=(e[t].positions||[]).filter(a=>a.origin!=="server"),e[t].trades=(e[t].trades||[]).filter(a=>a.origin!=="server")}function Vn(e,t){if(!t)return e;const a=Ce();a.startDate=e.startDate||t.startDate||aa,a.serverAsOf=t.asOf||null,a.noteZh=t.noteZh||"",a.noteEn=t.noteEn||"";for(const i of["US","TW"]){const r=t[i]||de(),o=e[i],l=i==="TW"?0:2,c=(r.positions||[]).map(d=>({...d,origin:"server"})),u=(o.positions||[]).filter(d=>d.origin!=="server");a[i]={cashAdj:_((r.cashAdj||0)+(o.cashAdj||0),l),marginHold:_((r.marginHold||0)+(o.marginHold||0),l),realizedPnl:_((r.realizedPnl||0)+(o.realizedPnl||0),l),positions:[...c,...u],trades:[...(r.trades||[]).map(d=>({...d,origin:"server"})),...(o.trades||[]).filter(d=>d.origin!=="server")],summaryZh:r.summaryZh||"",summaryEn:r.summaryEn||""}}return a}function qa(e,t){const a=e==null?void 0:e[t];if(!a)return"";const i=Dt(),r=i==="en"||i==="ja"?a.summaryEn||a.summaryZh:a.summaryZh||a.summaryEn;if(!r&&!e.noteZh)return"";const o=i==="en"||i==="ja"?e.noteEn||e.noteZh:e.noteZh||e.noteEn;return`<p class="paper-deriv-server">${n(s("paperDerivServerBook"))}${r?` ${n(r)}`:""}${o?` ${n(o)}`:""}</p>`}function js(e){const t=Dt(),a=t==="en"||t==="ja"?e.fillSourceEn||e.fillSource:e.fillSource||e.fillSourceEn,i=e.openedAsOf||e.lastTradeAsOf||"";return`${a?`<span class="pos-name">${n(a)}</span>`:""}${i?`<span class="pos-name">asOf ${n(i)}</span>`:""}`}function Cs(e,t,a){var o;const i=(o=e==null?void 0:e.books)==null?void 0:o[t],r=((i==null?void 0:i.positions)||[]).find(l=>l.ticker===a);return(r==null?void 0:r.qty)||0}function vt(e,t,a){var l;const i=(l=e==null?void 0:e.books)==null?void 0:l[t],r=typeof(i==null?void 0:i.cash)=="number"?i.cash:0,o=a[t];return _(r+(o.cashAdj||0)-(o.marginHold||0),t==="TW"?0:2)}function zs(e,t,a){if(!e)return null;const i=t==="put"?e.puts:e.calls;return Array.isArray(i)&&i.find(o=>o.strike===a&&$(o.premium)&&o.premium>=0)||null}function Ma(e,t){var o,l;const a=new Map(((t==null?void 0:t.tickers)||[]).map(c=>[c.ticker,c])),i=(t==null?void 0:t.asOf)||null,r=[];for(const c of e.US.positions){if(c.asset!=="option")continue;const u=a.get(c.underlying),d=(o=u==null?void 0:u.options)==null?void 0:o.paperChain,p=((l=u==null?void 0:u.options)==null?void 0:l.asOfUnderlying)??(u==null?void 0:u.price)??null;if((c.expiry&&J()>c.expiry?!0:c.expiry&&(!d||d.expiration!==c.expiry)&&J()>=c.expiry)&&$(p)){const f=kn({qtySigned:c.qtySigned,spot:p,strike:c.strike,right:c.right});if(f.ok){const k=gt({side:c.qtySigned>0?"sell":"buy",premium:f.settlePremium,contracts:Math.abs(c.qtySigned)});if(k.ok){const T=qt({qtySigned:c.qtySigned,avgPremium:c.avgPremium,markPremium:f.settlePremium});e.US.cashAdj=_(e.US.cashAdj+k.cashDelta),$(T)&&(e.US.realizedPnl=_(e.US.realizedPnl+T)),e.US.trades.push({date:J(),asOf:i,market:"US",asset:"option",side:c.qtySigned>0?"SELL":"BUY",underlying:c.underlying,right:c.right,expiry:c.expiry,strike:c.strike,qty:Math.abs(c.qtySigned),premium:f.settlePremium,reason:"expiry-settle",reasonText:s("paperDerivExpirySettle"),realizedPnl:T??0});continue}}}const g=zs(d,c.right,c.strike);g?(c.markPremium=g.premium,c.markAsOf=i,c.markSource="chain"):$(c.markPremium)?c.markSource=c.markSource||"stored":(c.markPremium=c.avgPremium,c.markSource="last-fill",c.markAsOf=c.lastTradeAsOf||i),$(p)&&(c.spot=p),r.push(c)}e.US.positions=r}function Na(e,t){var i;if(!(t!=null&&t.contracts))return;const a=[];for(const r of e.TW.positions){if(r.asset!=="futures")continue;const o=t.contracts[r.code];if(!o){a.push(r);continue}const l=o.near&&o.near.month===r.month&&o.near||o.next&&o.next.month===r.month&&o.next||(o.listed||[]).find(h=>h.month===r.month)||null,c=l==null?void 0:l.lastTradingDay,u=(i=t.calendar)==null?void 0:i.recentSettlement,d=u&&u.deliveryMonth===r.month&&String(u.contract||"").split("/").includes(r.code)&&$(u.finalSettlementPrice)&&u.finalSettlementPrice>0?u.finalSettlementPrice:null,p=c&&J()>c&&d||$(l==null?void 0:l.settle)&&l.settle||$(l==null?void 0:l.last)&&l.last||null;if(c&&J()>c&&$(p)){const h=Mt({entryPrice:r.avgPrice,markPrice:p,code:r.code,contractsSigned:r.qtySigned}),g=Nt({contracts:Math.abs(r.qtySigned),initialMarginPerContract:r.initialMarginPerContract});$(h)&&(e.TW.cashAdj=_(e.TW.cashAdj+h,0),e.TW.realizedPnl=_(e.TW.realizedPnl+h,0)),$(g)&&(e.TW.marginHold=_(Math.max(0,e.TW.marginHold-g),0)),e.TW.trades.push({date:J(),asOf:t.asOf,market:"TW",asset:"futures",side:r.qtySigned>0?"SELL":"BUY",code:r.code,month:r.month,qty:Math.abs(r.qtySigned),price:p,reason:"expiry-settle",reasonText:s("paperDerivFutSettle"),realizedPnl:h??0,flagged:!d&&!$(l==null?void 0:l.settle)});continue}$(l==null?void 0:l.last)?(r.mark=l.last,r.markSource="desk-last"):$(l==null?void 0:l.settle)?(r.mark=l.settle,r.markSource="desk-settle"):(r.markSource="last-fill",$(r.mark)||(r.mark=r.avgPrice)),r.markAsOf=t.asOf,$(l==null?void 0:l.settle)&&(r.settle=l.settle),a.push(r)}e.TW.positions=a}function Gn({paper:e,state:t,optSnap:a,underlying:i,right:r,strike:o,expiry:l,side:c,contracts:u}){var v;if(r!=="call"&&r!=="put")return{ok:!1,error:s("paperDerivBadRight")};if(!Number.isInteger(u)||u<=0)return{ok:!1,error:s("paperDerivBadQty")};if(c!=="buy"&&c!=="sell")return{ok:!1,error:s("paperDerivBadSide")};const d=((a==null?void 0:a.tickers)||[]).find(y=>y.ticker===i),p=(v=d==null?void 0:d.options)==null?void 0:v.paperChain;if(!p||!Array.isArray(p.calls))return{ok:!1,error:s("paperDerivNoChain")};if(l&&p.expiration&&l!==p.expiration)return{ok:!1,error:s("paperDerivExpiryMismatch")};const h=p.expiration,g=zs(p,r,Number(o));if(!g)return{ok:!1,error:s("paperDerivNoPremium")};const f=g.premium;if(!$(f)||f<0)return{ok:!1,error:s("paperDerivNoPremium")};const k=vt(e,"US",t),T=`${i}|${h}|${Number(o)}|${r}`;let w=t.US.positions.find(y=>Hn(y)===T);const j=c==="buy"?u:-u;if(w&&Math.sign(w.qtySigned)!==0&&Math.sign(w.qtySigned)!==Math.sign(j)){const y=Math.min(Math.abs(w.qtySigned),u),S=gt({side:c,premium:f,contracts:y});if(!S.ok)return{ok:!1,error:S.error};if(c==="buy"){const I=Aa({freeCash:k,premium:f,contracts:y});if(!I.ok)return{ok:!1,error:s("paperDerivNeedCash",{need:B(I.need||S.notional,"USD")})}}const x=qt({qtySigned:w.qtySigned>0?y:-y,avgPremium:w.avgPremium,markPremium:f});t.US.cashAdj=_(t.US.cashAdj+S.cashDelta),$(x)&&(t.US.realizedPnl=_(t.US.realizedPnl+x)),w.qtySigned+=w.qtySigned>0?-y:y,w.qtySigned===0&&(t.US.positions=t.US.positions.filter(I=>I!==w),w=null),t.US.trades.push({date:J(),asOf:a==null?void 0:a.asOf,market:"US",asset:"option",side:c==="buy"?"BUY":"SELL",underlying:i,right:r,expiry:h,strike:Number(o),qty:y,premium:f,reason:"user-close",reasonText:s("paperDerivUserClose"),realizedPnl:x??0});const q=u-y;if(q<=0)return He(t)?{ok:!0,premium:f,closed:y}:{ok:!1,error:s("paperDerivMathBlock")};u=q}if(c==="buy"){const y=Aa({freeCash:vt(e,"US",t),premium:f,contracts:u});if(!y.ok)return{ok:!1,error:s("paperDerivNeedCash",{need:B(y.need||f*Y*u,"USD")})}}const z=gt({side:c,premium:f,contracts:u});if(!z.ok)return{ok:!1,error:z.error};t.US.cashAdj=_(t.US.cashAdj+z.cashDelta);const U=c==="buy"?u:-u;if(!w)w={asset:"option",underlying:i,name:(d==null?void 0:d.name)||i,right:r,expiry:h,strike:Number(o),qtySigned:U,avgPremium:f,markPremium:f,markAsOf:a==null?void 0:a.asOf,markSource:"fill",lastTradeAsOf:a==null?void 0:a.asOf,openedOn:J(),currency:"USD",multiplier:Y},t.US.positions.push(w);else{const y=w.qtySigned+U,S=Math.abs(w.qtySigned),x=Math.abs(U);w.avgPremium=(w.avgPremium*S+f*x)/(S+x),w.qtySigned=y,w.markPremium=f,w.lastTradeAsOf=a==null?void 0:a.asOf}const L=Cs(e,"US",i),P=ks({stockQty:L,optionRight:r,optionQtySigned:w.qtySigned,underlying:i});return t.US.trades.push({date:J(),asOf:a==null?void 0:a.asOf,market:"US",asset:"option",side:c==="buy"?"BUY":"SELL",underlying:i,right:r,expiry:h,strike:Number(o),qty:u,premium:f,reason:"user-open",reasonText:P?As(P):s("paperDerivUserOpen"),strategy:P,realizedPnl:0}),He(t)?{ok:!0,premium:f,strategy:P}:{ok:!1,error:s("paperDerivMathBlock")}}function Jn({paper:e,state:t,txf:a,code:i,month:r,side:o,contracts:l}){var z,U;if(i=String(i||"").toUpperCase(),i!=="TX"&&i!=="MTX")return{ok:!1,error:s("paperDerivBadCode")};if(!Number.isInteger(l)||l<=0)return{ok:!1,error:s("paperDerivBadQty")};if(o!=="buy"&&o!=="sell")return{ok:!1,error:s("paperDerivBadSide")};const c=(z=a==null?void 0:a.contracts)==null?void 0:z[i];if(!c)return{ok:!1,error:s("paperDerivNoTxf")};const u=$s(i);if(u==null||u!==c.multiplierTwdPerPoint)return{ok:!1,error:s("paperDerivBadMult")};const d=c.near&&c.near.month===r&&c.near||c.next&&c.next.month===r&&c.next||(c.listed||[]).find(L=>L.month===r);if(!d)return{ok:!1,error:s("paperDerivNoMonth")};const p=$(d.last)&&d.last||$(d.settle)&&d.settle||null;if(!$(p)||!(p>0))return{ok:!1,error:s("paperDerivNoFutPrice")};const h=typeof((U=c.margin)==null?void 0:U.initial)=="number"?c.margin.initial:null;if(!$(h)||!(h>0))return{ok:!1,error:s("paperDerivNoMargin")};const g=`${i}|${r}`;let f=t.TW.positions.find(L=>_n(L)===g);const k=o==="buy"?l:-l;if(f&&Math.sign(f.qtySigned)!==Math.sign(k)){const L=Math.min(Math.abs(f.qtySigned),l),P=f.qtySigned>0?L:-L,v=Mt({entryPrice:f.avgPrice,markPrice:p,code:i,contractsSigned:P});if(!$(v))return{ok:!1,error:s("paperDerivMathBlock")};const y=Nt({contracts:L,initialMarginPerContract:f.initialMarginPerContract||h});t.TW.cashAdj=_(t.TW.cashAdj+v,0),t.TW.realizedPnl=_(t.TW.realizedPnl+v,0),$(y)&&(t.TW.marginHold=_(Math.max(0,t.TW.marginHold-y),0)),f.qtySigned+=f.qtySigned>0?-L:L,f.qtySigned===0?(t.TW.positions=t.TW.positions.filter(x=>x!==f),f=null):f.mark=p,t.TW.trades.push({date:J(),asOf:a.asOf,market:"TW",asset:"futures",side:o==="buy"?"BUY":"SELL",code:i,month:r,qty:L,price:p,reason:"user-close",reasonText:s("paperDerivUserClose"),realizedPnl:v});const S=l-L;if(S<=0)return He(t)?{ok:!0,price:p,closed:L}:{ok:!1,error:s("paperDerivMathBlock")};l=S}const T=Tn({freeCash:vt(e,"TW",t),contracts:l,initialMarginPerContract:h});if(!T.ok)return{ok:!1,error:s("paperDerivNeedMargin",{need:B(T.hold||h*l,"TWD")})};const w=T.hold;t.TW.marginHold=_(t.TW.marginHold+w,0);const j=o==="buy"?l:-l;if(!f)f={asset:"futures",code:i,name:c.nameZh||i,month:r,qtySigned:j,avgPrice:p,mark:p,markAsOf:a.asOf,markSource:"fill",openedOn:J(),currency:"TWD",multiplier:u,initialMarginPerContract:h,lastTradingDay:d.lastTradingDay||null},t.TW.positions.push(f);else{const L=Math.abs(f.qtySigned),P=Math.abs(j);f.avgPrice=(f.avgPrice*L+p*P)/(L+P),f.qtySigned+=j,f.mark=p}return t.TW.trades.push({date:J(),asOf:a.asOf,market:"TW",asset:"futures",side:o==="buy"?"BUY":"SELL",code:i,month:r,qty:l,price:p,reason:"user-open",reasonText:s("paperDerivUserOpen"),realizedPnl:0,marginHold:w}),He(t)?{ok:!0,price:p,marginHold:w}:{ok:!1,error:s("paperDerivMathBlock")}}function As(e){if(!e)return"";const t=`paperDerivStrategy_${String(e).replace(/-/g,"_")}`,a=s(t);return a===t?e:a}function Yn(e,t){return e.length?e.map(a=>{const i=qt({qtySigned:a.qtySigned,avgPremium:a.avgPremium,markPremium:a.markPremium}),r=vs({qty:a.qtySigned,markPremium:a.markPremium}),o=ks({stockQty:Cs(t,"US",a.underlying),optionRight:a.right,optionQtySigned:a.qtySigned,underlying:a.underlying}),l=a.qtySigned>0?s("paperDerivLong"):s("paperDerivShort");return`<tr>
        <td class="pos-sym"><span class="ticker">${n(a.underlying)}</span>
          <span class="pos-name">${n(a.right.toUpperCase())} ${n(String(a.strike))} ${n(a.expiry||"")}${a.contractSymbol?` · ${n(a.contractSymbol)}`:""}</span>
          ${o?`<span class="deriv-tag">${n(As(o))}</span>`:""}
          ${js(a)}
        </td>
        <td class="num">${n(l)} ${Math.abs(a.qtySigned)}</td>
        <td class="num">${K(a.avgPremium,2)}</td>
        <td class="num">${K(a.markPremium,2)}</td>
        <td class="num">${B(r,"USD")}</td>
        <td class="num ${le(i)}">${B(i,"USD")}</td>
        <td class="num">${n(a.markSource||"—")}</td>
        <td class="num">${n((a.markAsOf||"").slice(0,16)||"—")}</td>
        <td class="num">×${Y}</td>
      </tr>`}).join(""):`<tr><td colspan="9" class="empty-cell">${n(s("paperDerivNoOptPos"))}</td></tr>`}function Kn(e){return e.length?e.map(t=>{const a=Mt({entryPrice:t.avgPrice,markPrice:t.mark,code:t.code,contractsSigned:t.qtySigned}),i=t.qtySigned>0?s("paperDerivLong"):s("paperDerivShort"),r=Nt({contracts:Math.abs(t.qtySigned),initialMarginPerContract:t.initialMarginPerContract});return`<tr>
        <td class="pos-sym"><span class="ticker">${n(t.code)}</span>
          <span class="pos-name">${n(t.name||"")} ${n(t.month)} · ${n(t.qtySigned>0?s("paperDerivLong"):s("paperDerivShort"))} ${Math.abs(t.qtySigned)}</span>
          ${js(t)}
        </td>
        <td class="num">${n(i)} ${Math.abs(t.qtySigned)}${n(s("paperDerivContracts"))}</td>
        <td class="num">${K(t.avgPrice,0)}</td>
        <td class="num">${K(t.mark,0)}</td>
        <td class="num ${le(a)}">${B(a,"TWD")}</td>
        <td class="num">${B(r,"TWD")}</td>
        <td class="num">NT$${t.multiplier}/pt</td>
        <td class="num">${n(t.markSource||"—")}</td>
        <td class="num">${n(t.lastTradingDay||"—")}</td>
      </tr>`}).join(""):`<tr><td colspan="9" class="empty-cell">${n(s("paperDerivNoFutPos"))}</td></tr>`}function Zn(e){const t=((e==null?void 0:e.tickers)||[]).filter(i=>{var r,o,l;return(l=(o=(r=i==null?void 0:i.options)==null?void 0:r.paperChain)==null?void 0:o.calls)==null?void 0:l.length});if(!t.length)return`<p class="paper-deriv-missing">${n(s("paperDerivNoChain"))}</p>`;const a=t.map(i=>`<option value="${n(i.ticker)}">${n(i.ticker)} · ${n(i.name||"")}</option>`).join("");return`
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
    </form>`}function Xn(e){var a;if(!((a=e==null?void 0:e.contracts)!=null&&a.TX))return`<p class="paper-deriv-missing">${n(s("paperDerivNoTxf"))}</p>`;const t=["TX","MTX"].filter(i=>e.contracts[i]).map(i=>{const r=e.contracts[i];return`<option value="${i}">${n(i)} · ${n(r.nameZh||"")} · NT$${r.multiplierTwdPerPoint}/pt</option>`}).join("");return`
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
    </form>`}function Ra(e,t){const a=[...e||[]].sort((r,o)=>r.date<o.date?1:r.date>o.date?-1:0).slice(0,20);if(!a.length)return"";const i=a.map(r=>{var h;const o=String(r.side||"").toUpperCase(),l=o==="BUY"||r.reason==="server-open"||r.reason==="user-open",c=r.asset==="option"?`${r.underlying||""} ${String(r.right||"").toUpperCase()} ${r.strike??""} ${r.expiry||""}`:`${r.code||""} ${r.month||""}`,u=r.premium!=null?r.premium:r.price;let d="—",p="flat";if(l||o==="BUY")d=n(s("realizedOpenOnly"));else{const g=ta({...r,side:o==="SELL"||o==="CLOSE"?"SELL":r.side});g.status==="ok"&&$(g.value)?(d=B(g.value,t),p=le(g.value)):g.status==="missing-cost"?d=n(s("costMissing")):d=n(s("realizedOpenOnly"))}return`<tr>
        <td>${n(r.date||"")}</td>
        <td>${n(c.trim()||"—")}</td>
        <td>${n(o==="BUY"?s("buy"):o==="SELL"?s("sell"):o)}</td>
        <td class="num">${((h=r.qty)==null?void 0:h.toLocaleString(R()))??"—"}</td>
        <td class="num">${K(u,t==="TWD"?0:2)}</td>
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
    </div>`}function Oa(e,t,a,{optSnap:i,txf:r}){var h;if(!((h=t==null?void 0:t.books)==null?void 0:h[e]))return"";const l=a[e],c=vt(t,e,a);if(e==="US"){const g=(l.positions||[]).filter(T=>T.asset==="option");let f=0,k=0;for(const T of g){const w=vs({qty:T.qtySigned,markPremium:T.markPremium}),j=qt({qtySigned:T.qtySigned,avgPremium:T.avgPremium,markPremium:T.markPremium});$(w)&&(f+=w),$(j)&&(k+=j)}return`
      <div class="paper-deriv" data-deriv-market="US">
        <div class="paper-deriv-head">
          <h4>${n(s("paperDerivUsTitle"))}</h4>
          <p class="paper-deriv-lead">${n(s("paperDerivUsLead"))}</p>
          ${qa(a,"US")}
        </div>
        <div class="paper-deriv-kpis">
          <div><div class="k-label">${n(s("paperDerivFreeCash"))}</div><div class="k-val">${B(c,"USD")}</div></div>
          <div><div class="k-label">${n(s("paperDerivOptMv"))}</div><div class="k-val">${B(f,"USD")}</div></div>
          <div><div class="k-label">${n(s("unrealizedPnl"))}</div><div class="k-val ${le(k)}">${B(k,"USD")}</div></div>
          <div><div class="k-label">${n(s("realizedPnl"))}</div><div class="k-val ${le(l.realizedPnl)}">${B(l.realizedPnl,"USD")}</div></div>
        </div>
        ${Zn(i)}
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
            <tbody>${Yn(g,t)}</tbody>
          </table>
        </div>
        ${Ra(l.trades,"USD")}
      </div>`}const u=(l.positions||[]).filter(g=>g.asset==="futures");let d=0;for(const g of u){const f=Mt({entryPrice:g.avgPrice,markPrice:g.mark,code:g.code,contractsSigned:g.qtySigned});$(f)&&(d+=f)}const p=(r==null?void 0:r.sessionDate)||"—";return`
    <div class="paper-deriv" data-deriv-market="TW">
      <div class="paper-deriv-head">
        <h4>${n(s("paperDerivTwTitle"))}</h4>
        <p class="paper-deriv-lead">${n(s("paperDerivTwLead",{session:p}))}</p>
        ${qa(a,"TW")}
      </div>
      <div class="paper-deriv-kpis">
        <div><div class="k-label">${n(s("paperDerivFreeCash"))}</div><div class="k-val">${B(c,"TWD")}</div></div>
        <div><div class="k-label">${n(s("paperDerivMarginHold"))}</div><div class="k-val">${B(l.marginHold,"TWD")}</div></div>
        <div><div class="k-label">${n(s("unrealizedPnl"))}</div><div class="k-val ${le(d)}">${B(d,"TWD")}</div></div>
        <div><div class="k-label">${n(s("realizedPnl"))}</div><div class="k-val ${le(l.realizedPnl)}">${B(l.realizedPnl,"TWD")}</div></div>
      </div>
      ${Xn(r)}
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
          <tbody>${Kn(u)}</tbody>
        </table>
      </div>
      ${Ra(l.trades,"TWD")}
    </div>`}function Qn(e,t){var u;const a=e.underlying.value,i=e.right.value,r=((t==null?void 0:t.tickers)||[]).find(d=>d.ticker===a),o=(u=r==null?void 0:r.options)==null?void 0:u.paperChain,l=e.strike;if(l.innerHTML="",!o)return;const c=i==="put"?o.puts:o.calls;for(const d of c||[]){const p=document.createElement("option");p.value=String(d.strike),p.textContent=`${d.strike} · ${d.premium}`,p.dataset.premium=String(d.premium),l.appendChild(p)}e.querySelector('[data-field="expiry"]').textContent=`${s("optionsExpiry")}: ${o.expiration||"—"}`,Wt(e)}function Wt(e){const t=e.strike.selectedOptions[0],a=t?Number(t.dataset.premium):NaN,i=Number(e.qty.value),r=e.querySelector('[data-field="premium"]'),o=e.querySelector('[data-field="debit"]');if(!$(a)||!Number.isInteger(i)||i<=0){r.textContent="—",o.textContent="—";return}r.textContent=`${s("paperDerivPremium")}: US$${K(a,2)}`;const l=a*Y*i;o.textContent=`${s("paperDerivCashImpact")}: US$${K(l,2)} (×${Y})`}function ei(e,t){var l,c,u,d;const a=e.code.value,i=(l=t==null?void 0:t.contracts)==null?void 0:l[a],r=e.month;if(r.innerHTML="",!i)return;const o=[];(c=i.near)!=null&&c.month&&o.push({...i.near,label:`${i.near.month} (${s("paperDerivNear")})`}),(u=i.next)!=null&&u.month&&i.next.month!==((d=i.near)==null?void 0:d.month)&&o.push({...i.next,label:`${i.next.month} (${s("paperDerivNext")})`});for(const p of o){const h=document.createElement("option");h.value=p.month,h.textContent=p.label,h.dataset.last=String(p.last??""),h.dataset.settle=String(p.settle??""),r.appendChild(h)}Ft(e,t)}function Ft(e,t){var f,k;const a=e.code.value,i=(f=t==null?void 0:t.contracts)==null?void 0:f[a],r=e.month.selectedOptions[0],o=Number(e.qty.value),l=e.querySelector('[data-field="price"]'),c=e.querySelector('[data-field="margin"]'),u=e.querySelector('[data-field="mult"]');if(!i||!r){l.textContent=c.textContent=u.textContent="—";return}const d=Number(r.dataset.last),p=Number(r.dataset.settle),h=$(d)&&d>0?d:p;l.textContent=`${s("mark")}: ${$(h)?K(h,0):"—"}`,u.textContent=`× NT$${i.multiplierTwdPerPoint}/pt`;const g=(k=i.margin)==null?void 0:k.initial;$(g)&&Number.isInteger(o)&&o>0?c.textContent=`${s("paperDerivMarginHold")}: ${B(g*o,"TWD")}`:c.textContent="—"}function Ve(e,t,a){const i=e.querySelector("[data-msg]");i&&(i.hidden=!t,i.textContent=t||"",i.classList.toggle("ok",!!a),i.classList.toggle("err",!!t&&!a))}async function Vt(e,t){if(!e||!(t!=null&&t.books))return;const[a,i,r]=await Promise.all([Un(),In(),Wn()]),o=Bn();Fn(o),Ma(o,a),Na(o,i),He(o);const l=r?structuredClone(r):null;l&&(Ma(l,a),Na(l,i));const c=Vn(o,l),u=e.querySelector("#paper-panel-US"),d=e.querySelector("#paper-panel-TW");if(u){let g=u.querySelector('[data-deriv-market="US"]');const f=Oa("US",t,c,{optSnap:a,txf:i});g?g.outerHTML=f:u.insertAdjacentHTML("beforeend",f)}if(d){let g=d.querySelector('[data-deriv-market="TW"]');const f=Oa("TW",t,c,{optSnap:a,txf:i});g?g.outerHTML=f:d.insertAdjacentHTML("beforeend",f)}const p=e.querySelector('[data-deriv-form="us-opt"]');if(p&&a){const g=()=>Qn(p,a);p.underlying.addEventListener("change",g),p.right.addEventListener("change",g),p.strike.addEventListener("change",()=>Wt(p)),p.qty.addEventListener("input",()=>Wt(p)),g(),p.addEventListener("submit",f=>{var w,j,z,U;f.preventDefault();const k=((w=f.submitter)==null?void 0:w.value)||"buy",T=Gn({paper:t,state:o,optSnap:a,underlying:p.underlying.value,right:p.right.value,strike:Number(p.strike.value),expiry:(U=(z=(j=a.tickers.find(L=>L.ticker===p.underlying.value))==null?void 0:j.options)==null?void 0:z.paperChain)==null?void 0:U.expiration,side:k,contracts:Number(p.qty.value)});if(!T.ok){Ve(p,T.error||s("paperDerivFail"),!1);return}Ve(p,s("paperDerivFillOk",{px:K(T.premium,2)}),!0),Vt(e,t)})}const h=e.querySelector('[data-deriv-form="tw-fut"]');if(h&&i){const g=()=>ei(h,i);h.code.addEventListener("change",g),h.month.addEventListener("change",()=>Ft(h,i)),h.qty.addEventListener("input",()=>Ft(h,i)),g(),h.addEventListener("submit",f=>{var w;f.preventDefault();const k=((w=f.submitter)==null?void 0:w.value)||"buy",T=Jn({paper:t,state:o,txf:i,code:h.code.value,month:h.month.value,side:k,contracts:Number(h.qty.value)});if(!T.ok){Ve(h,T.error||s("paperDerivFail"),!1);return}Ve(h,s("paperDerivFillOk",{px:K(T.price,0)}),!0),Vt(e,t)})}}const ie="([+\\-−]?\\d+(?:\\.\\d+)?)",Rt=e=>String(e).replace(/^[+\-−]/,""),Es=e=>/^[\-−]/.test(String(e)),Ds=e=>Number(Rt(e))===0;function Ge(e){return Ds(e)?"持平":`${Es(e)?"跌":"漲"} ${Rt(e)}%`}function Ba(e){return Ds(e)?"差不多":`${Es(e)?"弱":"強"} ${Rt(e)} 個百分點`}const Ha={"週期偏防禦：提高雙均線／品質門檻":"大盤偏保守，今天挑得比較嚴：要站上兩條平均線、體質也要較好","週期偏熱：量能不足的高 RS 降權":"大盤偏熱：漲得比大盤多、但成交量跟不上的股票，排名往後放","週期偏熱：縮量上漲降權":"大盤偏熱：上漲但成交量變少的股票，排名往後放","週期偏積極：早段放量相對強度加權":"大盤偏積極：剛開始放量、又比大盤強的股票，排名往前放","週期偏積極：放寬進場節奏":"大盤偏積極，今天進場條件稍微放寬","週期偏積極：價弱量增（firm-hands）加權":"大盤偏積極：價格雖弱、但成交量變大（有人在承接）的股票，排名往前放"},ti=[[new RegExp(`^日漲跌 ${ie}%（相對 S&P 約 ${ie}pp）$`),e=>`今天${Ge(e[1])}，比 S&P 500 ${Ba(e[2])}`],[new RegExp(`^日漲跌 ${ie}%，相對加權約 ${ie}pp$`),e=>`今天${Ge(e[1])}，比加權指數${Ba(e[2])}`],[new RegExp(`^五日約 ${ie}%$`),e=>`近 5 個交易日${Ge(e[1])}`],[new RegExp(`^一個月約 ${ie}%$`),e=>`近一個月${Ge(e[1])}`],[new RegExp(`^量比約 ${ie}×$`),e=>`成交量約是近 20 日平均的 ${Rt(e[1])} 倍`],[/^站上雙均線$/,()=>"股價在近 20 日、近 50 日的平均價之上"],[/^站上 SMA(\d+)$/,e=>e[1]==="200"?"在近 200 日的長期平均價之上":`股價在近 ${e[1]} 日的平均價之上`],[/^週期偏積極：允許站上 SMA(\d+) 但低於 SMA(\d+)$/,e=>`大盤偏積極：股價只要回到近 ${e[1]} 日平均價之上就可以，還沒回到近 ${e[2]} 日平均價也收`],[/^市場週期姿態 ([a-z_]+)(?:（相位 ([a-z_]+)）)?$/,e=>e[2]?`市場心情「${G(e[2])}」，今天用「${G(e[1])}」的標準挑股`:`今天用「${G(e[1])}」的標準挑股`]];function ai(e){const t=e.trim();if(!t)return"";if(Ha[t])return Ha[t];for(const[a,i]of ti){const r=t.match(a);if(r)return i(r)}return t.replace(/SMA(\d+)/g,"近 $1 日平均價").replace(/(\d)pp/g,"$1 個百分點")}function si(e){return e?String(e).replace(/[。.]\s*$/,"").split("；").map(ai).filter(Boolean):[]}function sa(e,t){const a=si(e);return a.length?`<ul class="why-list">${a.map(i=>`<li>${t(i)}</li>`).join("")}</ul>`:""}const ni={euphoric:"defensive",late_optimism:"selective",mid_cycle:"balanced",cautious_recovery:"constructive",despondent:"aggressive",panic:"stabilize_first"};function na(e){if(!e)return`<span class="stance-badge stance-neutral">${n(s("dataInsufficient"))}</span>`;const t=yn(e),a=G(e);return`<span class="stance-badge stance-${t}">${n(a)}</span>`}function _a(e,t){return`<div class="logic-metric" role="listitem">
    <span class="k">${n(e)}</span>
    <span class="v">${t}</span>
  </div>`}function $t(e,t,{detailed:a=!1}={}){if(!t)return"";const i=t.incomplete?" incomplete":"",r=t.psychologyPhase,o=t.cycleStance,l=t.liquidityBias,c=r?G(r):s("dataInsufficient"),u=l?G(l):s("dataInsufficient"),d=Array.isArray(t.dataGaps)&&t.dataGaps.length?`<div class="regime-gaps">${n(s("dataGaps"))}: ${n(t.dataGaps.slice(0,5).join(", "))}${t.dataGaps.length>5?"…":""}</div>`:"",p="",h=a?`<div class="logic-metrics" role="list">
        ${_a(s("psychologyPhase"),n(c))}
        ${_a(s("liquidityBias"),n(u))}
      </div>
      <p class="logic-caption">${n(s("logicRegimePlain"))}</p>`:`<div class="regime-meta">
        <span>${n(s("psychologyPhase"))} <strong>${n(c)}</strong></span>
        <span>${n(s("liquidityBias"))} <strong>${n(u)}</strong></span>
      </div>`;return`<div class="regime-chip${a?" logic-regime-chip":""}${i}">
    <div class="regime-chip-top">
      <div class="label">${n(e)} · ${n(s("marketRegime"))}</div>
      ${na(o)}
    </div>
    ${h}
    ${p}
    ${d}
  </div>`}function ii(e){return!e||!e.us&&!e.tw?`<p class="logic-muted">${n(s("logicNoRegime"))}</p>`:`<div class="regime-strip logic-regime-live" aria-label="${n(s("regimeToday"))}">
    ${$t("US",e.us,{detailed:!0})}
    ${$t("TW",e.tw,{detailed:!0})}
  </div>`}function ri(e){return!e||!e.us&&!e.tw?"":`<div class="regime-strip" aria-label="${n(s("marketRegime"))}">
    ${$t("US",e.us,{detailed:!1})}
    ${$t("TW",e.tw,{detailed:!1})}
  </div>`}function he(e,t,a){return`<section class="logic-step" id="logic-step-${e}">
    <header class="logic-step-head">
      <span class="logic-step-num" aria-hidden="true">${e}</span>
      <h3 class="logic-step-title">${n(t)}</h3>
    </header>
    <div class="logic-step-body">${a}</div>
  </section>`}function li(e){return`<div class="logic-table-wrap"><table class="logic-table">
    <tbody>
      ${e.map(([t,a])=>`<tr><th scope="row">${n(t)}</th><td>${a}</td></tr>`).join("")}
    </tbody>
  </table></div>`}function E(e){const t=(a,i)=>`<div><dt>${n(s(a))}</dt><dd>${n(s(i))}</dd></div>`;return`<article class="logic-rule">
    <h4 class="logic-rule-title">${n(s(`logic${e}Title`))}</h4>
    <dl class="logic-rule-dl">
      ${t("logicLblDoes",`logic${e}Does`)}
      ${t("logicLblWhen",`logic${e}When`)}
      ${t("logicLblRefuse",`logic${e}Refuse`)}
      ${t("logicLblExample",`logic${e}Example`)}
    </dl>
  </article>`}function oi(e){const t=e==null?void 0:e.marketRegime,a={defensive:"logicPhaseDefensive",selective:"logicPhaseSelective",balanced:"logicPhaseBalanced",constructive:"logicPhaseConstructive",aggressive:"logicPhaseAggressive",stabilize_first:"logicPhaseStabilize"},i=Object.entries(ni).map(([r,o])=>[G(r),`${na(o)} <span class="logic-phase-note">${n(s(a[o]))}</span>`]);return`
    <header class="view-header">
      <h2 class="view-title">${n(s("logicTitle"))}</h2>
      <p class="logic-subtitle">${n(s("logicSubtitle"))}</p>
      <p class="logic-intro">${n(s("logicLead"))}</p>
    </header>

    <section class="logic-live section" aria-labelledby="logic-live-h">
      <h3 id="logic-live-h" class="section-title">${n(s("regimeToday"))}</h3>
      ${ii(t)}
    </section>

    <div class="logic-pipeline">
      ${he(1,s("logicStep1"),`
        <p class="logic-lead">${n(s("logicStep1Lead"))}</p>
        ${li(i)}
        <p class="logic-caption">${n(s("logicStep1Caption"))}</p>
        ${E("Sep")}
        ${E("Mood")}
        ${E("Rates")}
      `)}

      ${he(2,s("logicStep2"),`
        <p class="logic-lead">${n(s("logicStep2Lead"))}</p>
        ${E("Bal")}
        ${E("Sel")}
        ${E("Def")}
        ${E("Agg")}
        ${E("Con")}
        ${E("Stab")}
        ${E("Vol")}
        ${E("Back")}
      `)}

      ${he(3,s("logicStep3"),`
        <p class="logic-lead">${n(s("logicStep3Lead"))}</p>
        ${E("Xq")}
        <p class="logic-jump"><button type="button" class="logic-link-btn" data-jump="strategies">${n(s("logicOpenStrategies"))}</button></p>
      `)}

      ${he(4,s("logicStep4"),`
        <p class="logic-lead">${n(s("logicStep4Lead"))}</p>
        ${E("Rank")}
        ${E("Hot")}
        ${E("Firm")}
        ${E("Panic")}
        ${E("Count")}
      `)}

      ${he(5,s("logicStep5"),`
        <p class="logic-lead">${n(s("logicStep5Lead"))}</p>
        ${E("Why")}
      `)}

      ${he(6,s("logicStep6"),`
        <p class="logic-lead">${n(s("logicStep6Lead"))}</p>
        ${E("Buy")}
        ${E("Sell")}
        <p class="logic-jump"><button type="button" class="logic-link-btn" data-jump="paper">${n(s("logicOpenPaper"))}</button></p>
      `)}
    </div>

    <p class="logic-footnote" role="note">${n(s("logicFootnote"))}</p>
  `}const qs="./data/strategy-screener.json",Ua="jml-watchlist",Gt=new Set(["inst-sync","margin-up","earnings-steady","low-pe-small","peter-lynch","warren-buffett","michael-murphy","kenneth-fisher","mark-minervini","michael-price","benjamin-graham","james-oshaughnessy","ultra-short","ma-tangle-break","new-high-momentum","short-roc","day-up-5","pct5d-10","near-high","chip-main-force","chip-branch","chip-large-holders","gooaye-tw-semicon-chain","gooaye-tw-vol-breakout"]),Ia=["大師","基本","籌碼","技術","綜合","週期"],ia={精選:"綜合",價量:"技術",財務:"基本",技術:"技術",基本:"基本",籌碼:"籌碼",大師:"大師",週期:"週期",綜合:"綜合"};function ci(e){const t=ia[e]||e;return s(`cat${t}`,t)}function di(e){try{return new Date(e).toLocaleString(R(),{timeZone:"Asia/Taipei",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1})+s("taipei")}catch{return e||"—"}}function m(e,t=2){return e==null||Number.isNaN(e)?"—":Number(e).toLocaleString(R(),{minimumFractionDigits:t,maximumFractionDigits:t})}function M(e){return e==null||Number.isNaN(e)?"flat":e>0?"up":e<0?"down":"flat"}function O(e){return e==null||Number.isNaN(e)?"—":`${e>0?"+":""}${e.toFixed(2)}%`}function Wa(e){const t=e.categoryGroup||e.category||"綜合";return ia[t]||t}function ui(e){let t=n(e);return t=t.replace(/本益比/g,()=>b("pe",s("pe"))),t=t.replace(/營益率/g,()=>b("opMargin",s("opMargin"))),t=t.replace(/毛利率/g,()=>b("grossMargin",s("grossMargin"))),t=t.replace(/外資/g,()=>b("foreignInv",s("foreignInv"))),t=t.replace(/投信/g,()=>b("trustInv",s("trustInv"))),t=t.replace(/自營商/g,()=>b("dealerInv",s("dealerInv"))),t=t.replace(/均線多頭/g,()=>b("maBull",s("maBull"))),t=t.replace(/RSI/g,()=>b("rsi",s("rsi"))),t=t.replace(/振幅/g,()=>b("amplitude",s("amplitude"))),t=t.replace(/(\d+)\s*張/g,(a,i)=>`${i}${b("zhang",s("zhang"))}`),t=t.replace(/＞\s*(\d+)\s*張/g,(a,i)=>`＞ ${i}${b("zhang",s("zhang"))}`),t}function pi(e){return e==="skip"?`<span class="xq-cond-st skip">${n(s("condSkip"))}</span>`:e==="fail"?`<span class="xq-cond-st fail">${n(s("condFail"))}</span>`:`<span class="xq-cond-st pass">${n(s("condPass"))}</span>`}function hi(e){switch(e){case"ma-bull":return[{key:"price",label:s("metricPrice"),fmt:t=>m(t.price)},{key:"dayPct",label:s("metricDayPct"),fmt:t=>O(t.dayPct),cls:t=>M(t.dayPct)},{key:"sma5",label:"SMA5",fmt:t=>m(t.sma5)},{key:"sma10",label:"SMA10",fmt:t=>m(t.sma10)},{key:"sma20",label:"SMA20",fmt:t=>m(t.sma20)},{key:"sma60",label:"SMA60",fmt:t=>m(t.sma60)},{key:"volRatioYday",label:s("metricVolRatioYday"),fmt:t=>t.volRatioYday!=null?m(t.volRatioYday)+"×":"—"},{key:"volTodayZhang",label:s("metricVolToday"),fmt:t=>t.volTodayZhang!=null?m(t.volTodayZhang,1):t.volToday!=null?m(t.volToday,0):"—"}];case"peter-lynch":return[{key:"pe",label:b("pe",s("pe")),fmt:t=>m(t.pe,2),rawLabel:!0},{key:"revGrowth2yAvgPct",label:"2年營收成長均%",fmt:t=>t.revGrowth2yAvgPct!=null?m(t.revGrowth2yAvgPct,1)+"%":"—"},{key:"pretaxGrowth5yAvgPct",label:"5年稅前成長均%",fmt:t=>t.pretaxGrowth5yAvgPct!=null?m(t.pretaxGrowth5yAvgPct,1)+"%":"—"},{key:"debtRatioPct",label:s("metricDebt"),fmt:t=>t.debtRatioPct!=null?m(t.debtRatioPct,1)+"%":"—"},{key:"price",label:s("metricPrice"),fmt:t=>m(t.price)},{key:"avgVol5Zhang",label:"5日均量(張)",fmt:t=>t.avgVol5Zhang!=null?m(t.avgVol5Zhang,1):"—"},{key:"dayPct",label:s("metricDayPct"),fmt:t=>O(t.dayPct),cls:t=>M(t.dayPct)}];case"chip-main-force":return[{key:"instNet1dZhang",label:"法人1日(張)",fmt:t=>m(t.instNet1dZhang,1)},{key:"instNet5dZhang",label:"法人5日(張)",fmt:t=>m(t.instNet5dZhang,1)},{key:"foreignNet5dZhang",label:s("foreign5d"),fmt:t=>m(t.foreignNet5dZhang,1)},{key:"trustNet5dZhang",label:s("trust5d"),fmt:t=>m(t.trustNet5dZhang,1)},{key:"dealerNet5dZhang",label:s("dealer5d"),fmt:t=>m(t.dealerNet5dZhang,1)}];case"chip-branch":return[{key:"foreignBuyStreakDays",label:"外資連買日",fmt:t=>t.foreignBuyStreakDays!=null?String(t.foreignBuyStreakDays):"—"},{key:"foreignNet1dZhang",label:s("foreign1d"),fmt:t=>m(t.foreignNet1dZhang,1),rawLabel:!0},{key:"foreignNet5dZhang",label:s("foreign5d"),fmt:t=>m(t.foreignNet5dZhang,1)},{key:"instNet5dZhang",label:"法人5日(張)",fmt:t=>m(t.instNet5dZhang,1)}];case"chip-large-holders":return[{key:"megaHolderPct",label:"大戶>100萬股%",fmt:t=>t.megaHolderPct!=null?m(t.megaHolderPct,1)+"%":"—"},{key:"largeHolderPct",label:"分級12–15%",fmt:t=>t.largeHolderPct!=null?m(t.largeHolderPct,1)+"%":"—"},{key:"megaHolderCount",label:">100萬股人數",fmt:t=>t.megaHolderCount!=null?m(t.megaHolderCount,0):"—"},{key:"major10pctCount",label:"逾10%大股東家數",fmt:t=>t.major10pctCount!=null?m(t.major10pctCount,0):"—"},{key:"tdccAsOf",label:"集保日",fmt:t=>t.tdccAsOf||"—"}];case"inst-sync":return[{key:"foreignNet1dZhang",label:s("foreign1d"),fmt:t=>m(t.foreignNet1dZhang,1),rawLabel:!0},{key:"trustNet1dZhang",label:s("trust1d"),fmt:t=>m(t.trustNet1dZhang,1),rawLabel:!0},{key:"dealerNet1dZhang",label:s("dealer1d"),fmt:t=>m(t.dealerNet1dZhang,1),rawLabel:!0},{key:"foreignNet5dZhang",label:s("foreign5d"),fmt:t=>m(t.foreignNet5dZhang,1)},{key:"trustNet5dZhang",label:s("trust5d"),fmt:t=>m(t.trustNet5dZhang,1)},{key:"dealerNet5dZhang",label:s("dealer5d"),fmt:t=>m(t.dealerNet5dZhang,1)}];case"ultra-short":return[{key:"price",label:s("metricPrice"),fmt:t=>m(t.price)},{key:"dayPct",label:s("metricDayPct"),fmt:t=>O(t.dayPct),cls:t=>M(t.dayPct)},{key:"rsi",label:b("rsi",s("rsi")),fmt:t=>m(t.rsi,2),rawLabel:!0},{key:"rsiPrev",label:"RSI昨",fmt:t=>m(t.rsiPrev,2)},{key:"ampPct",label:b("amplitude",s("amplitude")),fmt:t=>t.ampPct!=null?m(t.ampPct,2)+"%":"—",rawLabel:!0},{key:"avgVol5Zhang",label:"5日均量(張)",fmt:t=>t.avgVol5Zhang!=null?m(t.avgVol5Zhang,1):"—"}];case"michael-price":return[{key:"pb",label:"P/B",fmt:t=>m(t.pb,2)},{key:"directorHoldPct",label:s("metricDirector"),fmt:t=>t.directorHoldPct!=null?m(t.directorHoldPct,1)+"%":"—"},{key:"debtRatioPct",label:s("metricDebt"),fmt:t=>t.debtRatioPct!=null?m(t.debtRatioPct,1)+"%":"—"},{key:"price",label:s("metricPrice"),fmt:t=>m(t.price)},{key:"avgVol5Zhang",label:"5日均量(張)",fmt:t=>m(t.avgVol5Zhang,1)}];case"michael-sivy":case"mark-minervini":return[{key:"pe",label:b("pe",s("pe")),fmt:t=>m(t.pe,2),rawLabel:!0},{key:"roe4qPct",label:"4季ROE合計%",fmt:t=>t.roe4qPct!=null?m(t.roe4qPct,1)+"%":"—"},{key:"debtRatioPct",label:s("metricDebt"),fmt:t=>t.debtRatioPct!=null?m(t.debtRatioPct,1)+"%":"—"},{key:"revGrowth3y",label:"3年營收成長%",fmt:t=>Array.isArray(t.revGrowth3y)?t.revGrowth3y.map(a=>a!=null?a+"%":"—").join(" → "):"—"},{key:"price",label:s("metricPrice"),fmt:t=>m(t.price)},{key:"avgVol5Zhang",label:"5日均量(張)",fmt:t=>m(t.avgVol5Zhang,1)}];case"kenneth-fisher":return[{key:"revGrowth5yAvgPct",label:"5年營收成長均%",fmt:t=>t.revGrowth5yAvgPct!=null?m(t.revGrowth5yAvgPct,1)+"%":"—"},{key:"pretaxGrowth5yAvgPct",label:"5年稅前成長均%",fmt:t=>t.pretaxGrowth5yAvgPct!=null?m(t.pretaxGrowth5yAvgPct,1)+"%":"—"},{key:"debtRatioPct",label:s("metricDebt"),fmt:t=>t.debtRatioPct!=null?m(t.debtRatioPct,1)+"%":"—"},{key:"price",label:s("metricPrice"),fmt:t=>m(t.price)},{key:"avgVol5Zhang",label:"5日均量(張)",fmt:t=>m(t.avgVol5Zhang,1)}];case"michael-murphy":return[{key:"roe4qPct",label:"4季ROE合計%",fmt:t=>t.roe4qPct!=null?m(t.roe4qPct,1)+"%":"—"},{key:"opMargin1qPct",label:s("metricOpQ"),fmt:t=>t.opMargin1qPct!=null?m(t.opMargin1qPct,1)+"%":"—"},{key:"opMargin3y",label:"3年營益率%",fmt:t=>Array.isArray(t.opMargin3y)?t.opMargin3y.map(a=>a!=null?a+"%":"—").join(" → "):"—"},{key:"revGrowth3yAvgPct",label:"3年營收成長均%",fmt:t=>t.revGrowth3yAvgPct!=null?m(t.revGrowth3yAvgPct,1)+"%":"—"},{key:"price",label:s("metricPrice"),fmt:t=>m(t.price)}];case"benjamin-graham":return[{key:"pe",label:b("pe",s("pe")),fmt:t=>m(t.pe,2),rawLabel:!0},{key:"pb",label:"P/B",fmt:t=>m(t.pb,2)},{key:"debtRatioPct",label:s("metricDebt"),fmt:t=>t.debtRatioPct!=null?m(t.debtRatioPct,1)+"%":"—"},{key:"price",label:s("metricPrice"),fmt:t=>m(t.price)},{key:"avgVol5Zhang",label:"5日均量(張)",fmt:t=>m(t.avgVol5Zhang,1)}];case"warren-buffett":return[{key:"roe4qPct",label:"4季ROE合計%",fmt:t=>t.roe4qPct!=null?m(t.roe4qPct,1)+"%":"—"},{key:"opMargin1qPct",label:s("metricOpQ"),fmt:t=>t.opMargin1qPct!=null?m(t.opMargin1qPct,1)+"%":"—"},{key:"debtRatioPct",label:s("metricDebt"),fmt:t=>t.debtRatioPct!=null?m(t.debtRatioPct,1)+"%":"—"},{key:"price",label:s("metricPrice"),fmt:t=>m(t.price)},{key:"avgVol5Zhang",label:"5日均量(張)",fmt:t=>m(t.avgVol5Zhang,1)}];case"james-oshaughnessy":return[{key:"pe",label:b("pe",s("pe")),fmt:t=>m(t.pe,2),rawLabel:!0},{key:"roe4qPct",label:"4季ROE合計%",fmt:t=>t.roe4qPct!=null?m(t.roe4qPct,1)+"%":"—"},{key:"roeGrowthPct",label:"ROE成長%",fmt:t=>t.roeGrowthPct!=null?m(t.roeGrowthPct,1)+"%":"—"},{key:"epsGrowthStreak",label:"EPS連季>10%",fmt:t=>t.epsGrowthStreak!=null?String(t.epsGrowthStreak):"—"},{key:"price",label:s("metricPrice"),fmt:t=>m(t.price)},{key:"avgVol5Zhang",label:"5日均量(張)",fmt:t=>m(t.avgVol5Zhang,1)}];case"margin-up":return[{key:"yoyPairs",label:"YoY配對",fmt:t=>Array.isArray(t.yoyPairs)?t.yoyPairs.join("；"):"—"},{key:"yoyOmPct",label:"YoY營益成長%",fmt:t=>Array.isArray(t.yoyOmPct)?t.yoyOmPct.map(a=>a!=null?a+"%":"—").join(" → "):"—"},{key:"yoyGmPct",label:"YoY毛利成長%",fmt:t=>Array.isArray(t.yoyGmPct)?t.yoyGmPct.map(a=>a!=null?a+"%":"—").join(" → "):"—"},{key:"opMargins",label:b("opMargin",s("opMargin")),fmt:t=>Array.isArray(t.opMargins)?t.opMargins.slice(-4).map(a=>a!=null?a+"%":"—").join(" → "):"—",rawLabel:!0},{key:"source",label:s("metricSource"),fmt:t=>t.source||"—"}];case"kostolany-cycle":return[{key:"price",label:s("metricPrice"),fmt:t=>m(t.price)},{key:"dayPct",label:s("metricDayPct"),fmt:t=>O(t.dayPct),cls:t=>M(t.dayPct)},{key:"pct5d",label:"5日%",fmt:t=>O(t.pct5d),cls:t=>M(t.pct5d)},{key:"pct1m",label:"1月%",fmt:t=>O(t.pct1m),cls:t=>M(t.pct1m)},{key:"volRatio",label:s("volRatio"),fmt:t=>t.volRatio!=null?m(t.volRatio)+"×":"—"},{key:"psychologyPhase",label:s("psychologyPhase"),fmt:t=>t.psychologyPhase?G(t.psychologyPhase):"—"},{key:"cycleStance",label:s("cycleStance"),fmt:t=>t.cycleStance?G(t.cycleStance):"—"},{key:"liquidityBias",label:s("liquidityBias"),fmt:t=>t.liquidityBias?G(t.liquidityBias):"—"},{key:"tags",label:s("regimeTags"),fmt:t=>t.tags||"—"},{key:"sizeMult",label:s("sizeMult"),fmt:t=>t.sizeMult!=null?m(t.sizeMult,2)+"×":"—"}];case"ma-tangle-break":return[{key:"price",label:s("metricPrice"),fmt:t=>m(t.price)},{key:"dayPct",label:s("metricDayPct"),fmt:t=>O(t.dayPct),cls:t=>M(t.dayPct)},{key:"smaSpreadPct",label:"均線糾結%",fmt:t=>t.smaSpreadPct!=null?m(t.smaSpreadPct,2)+"%":"—"},{key:"volRatioYday",label:s("metricVolRatioYday"),fmt:t=>t.volRatioYday!=null?m(t.volRatioYday)+"×":"—"},{key:"sma5",label:"SMA5",fmt:t=>m(t.sma5)},{key:"sma20",label:"SMA20",fmt:t=>m(t.sma20)}];case"new-high-momentum":case"near-high":return[{key:"price",label:s("metricPrice"),fmt:t=>m(t.price)},{key:"dayPct",label:s("metricDayPct"),fmt:t=>O(t.dayPct),cls:t=>M(t.dayPct)},{key:"pct5d",label:"5日%",fmt:t=>O(t.pct5d),cls:t=>M(t.pct5d)},{key:"high20",label:"20日高",fmt:t=>m(t.high20)},{key:"distHigh20Pct",label:"距高%",fmt:t=>t.distHigh20Pct!=null?m(t.distHigh20Pct,2)+"%":"—"},{key:"volRatioYday",label:s("metricVolRatioYday"),fmt:t=>t.volRatioYday!=null?m(t.volRatioYday)+"×":"—"}];case"short-roc":return[{key:"price",label:s("metricPrice"),fmt:t=>m(t.price)},{key:"dayPct",label:s("metricDayPct"),fmt:t=>O(t.dayPct),cls:t=>M(t.dayPct)},{key:"roc10",label:"ROC10%",fmt:t=>t.roc10!=null?m(t.roc10,2)+"%":"—",cls:t=>M(t.roc10)},{key:"pct5d",label:"5日%",fmt:t=>O(t.pct5d),cls:t=>M(t.pct5d)},{key:"avgVol5Zhang",label:"5日均量(張)",fmt:t=>t.avgVol5Zhang!=null?m(t.avgVol5Zhang,1):"—"}];case"day-up-5":case"pct5d-10":return[{key:"price",label:s("metricPrice"),fmt:t=>m(t.price)},{key:"dayPct",label:s("metricDayPct"),fmt:t=>O(t.dayPct),cls:t=>M(t.dayPct)},{key:"pct5d",label:"5日%",fmt:t=>O(t.pct5d),cls:t=>M(t.pct5d)},{key:"volRatioYday",label:s("metricVolRatioYday"),fmt:t=>t.volRatioYday!=null?m(t.volRatioYday)+"×":"—"},{key:"avgVol5Zhang",label:"5日均量(張)",fmt:t=>t.avgVol5Zhang!=null?m(t.avgVol5Zhang,1):"—"}];case"earnings-steady":return[{key:"yoyOmPct",label:"YoY營益成長%",fmt:t=>Array.isArray(t.yoyOmPct)?t.yoyOmPct.map(a=>a!=null?a+"%":"—").join(" → "):"—"},{key:"opMargins",label:b("opMargin",s("opMargin")),fmt:t=>Array.isArray(t.opMargins)?t.opMargins.slice(-4).map(a=>a!=null?a+"%":"—").join(" → "):"—",rawLabel:!0},{key:"source",label:s("metricSource"),fmt:t=>t.source||"—"}];case"low-pe-small":return[{key:"pe",label:b("pe",s("pe")),fmt:t=>m(t.pe,2),rawLabel:!0},{key:"price",label:s("metricPrice"),fmt:t=>m(t.price)},{key:"marketCapHint",label:"市值代理",fmt:t=>t.marketCapHint||"—"},{key:"avgVol5Zhang",label:"5日均量(張)",fmt:t=>t.avgVol5Zhang!=null?m(t.avgVol5Zhang,1):"—"}];case"gooaye-tw-semicon-chain":case"gooaye-tw-vol-breakout":case"gooaye-us-risk-on":case"gooaye-us-fomo-filter":return[{key:"price",label:s("metricPrice"),fmt:t=>m(t.price)},{key:"dayPct",label:s("metricDayPct"),fmt:t=>O(t.dayPct),cls:t=>M(t.dayPct)},{key:"pct5d",label:"5日%",fmt:t=>O(t.pct5d),cls:t=>M(t.pct5d)},{key:"pct1m",label:"1月%",fmt:t=>O(t.pct1m),cls:t=>M(t.pct1m)},{key:"volRatio",label:s("metricVolRatioYday"),fmt:t=>t.volRatio!=null?m(t.volRatio)+"×":"—"},{key:"aboveSma50",label:"＞SMA50",fmt:t=>t.aboveSma50?"Y":"N"}];default:return[{key:"price",label:s("metricPrice"),fmt:t=>m(t.price)},{key:"dayPct",label:s("metricDayPct"),fmt:t=>O(t.dayPct),cls:t=>M(t.dayPct)}]}}function gi(e){const t=e.calibrationNotes;if(!t||typeof t!="object")return"";const a=Array.isArray(t.matchedXq)?t.matchedXq.map(l=>n(l)).join(" · "):"",i=Array.isArray(t.stillDiffers)?t.stillDiffers.map(l=>n(l)).join(" · "):"",r=t.unitsNote||t.units||"",o=[];return a&&o.push(`<span class="xq-cal-m">對齊 XQ：${a}</span>`),i&&o.push(`<span class="xq-cal-d">仍差異：${i}</span>`),r&&o.push(`<span class="xq-cal-u">${n(String(r))}</span>`),o.length?`<p class="xq-calibration" title="${s("calibTitle")}">${o.join("<br/>")}</p>`:""}function fi(e){return`<ol class="xq-cond-list">${(e.conditions||[]).map((a,i)=>{const r=a.status||"pass";return`<li class="xq-cond ${r}">
        <span class="xq-cond-num">${i+1}</span>
        <span class="xq-cond-text">${ui(a.text)}</span>
        ${pi(r)}
      </li>`}).join("")}</ol>`}function ra(e,t){return!t||t==="ALL"?e||[]:(e||[]).filter(a=>{const i=String(a.market||"").toUpperCase();if(i===t)return!0;const r=String(a.ticker||"").toUpperCase().endsWith(".TW");return i?!1:t==="TW"?r:!r})}function mi(e,t="TW"){const a=e.hits||[],i=ra(a,t),r=s(t==="US"?"usStock":"twStock");if(e.incomplete&&!a.length){const d=n(e.incompleteLabel||s("dataInsufficient")),p=(e.blockers||[]).map(h=>`<li>${n(h)}</li>`).join("");return`<div class="xq-incomplete" role="status">
      <div class="xq-incomplete-badge">${d}</div>
      <ul>${p}</ul>
    </div>`}if(!i.length)return`<div class="xq-empty"><p>${n(r)} · ${n(s("noHits"))}</p></div>`;const o=hi(e.id),l=o.map(d=>`<th>${d.rawLabel?d.label:n(d.label)}</th>`).join(""),c=i.map(d=>{const p=d.metrics||{},h=o.map(g=>`<td class="num ${g.cls?g.cls(p):""}">${g.fmt(p)}</td>`).join("");return`<tr>
        <td><span class="ticker">${n(d.ticker)}</span></td>
        <td class="name-cell">${n(d.name||"")}${d.ohlcvBarDate?`<div class="xq-bar-date">K ${n(d.ohlcvBarDate)}</div>`:""}
          <button type="button" class="xq-btn xq-btn-sm xq-watch-inline" data-xq-watch="${n(d.ticker)}" data-xq-watch-name="${n(d.name||"")}">${n(s("addWatchlist"))}</button>
        </td>
        ${h}
      </tr>`}).join(""),u=i.map(d=>{const p=d.metrics||{},h=o.map(g=>{const f=g.cls?g.cls(p):"";return`<div class="xq-m"><span class="xq-ml">${g.rawLabel?g.label:n(g.label)}</span><span class="xq-mv ${f}">${g.fmt(p)}</span></div>`}).join("");return`<article class="xq-hit-card">
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
        <div class="xq-hit-metrics">${h}</div>
      </article>`}).join("");return`
    <div class="xq-market-block" data-market="${n(t)}">
      <h5 class="xq-market-title">${r}（${i.length}）</h5>
      <div class="table-wrap xq-table-wrap">
        <table class="stock-table xq-table">
          <thead><tr><th>代碼</th><th>名稱</th>${l}</tr></thead>
          <tbody>${c}</tbody>
        </table>
      </div>
      <div class="xq-mobile-cards">${u}</div>
    </div>`}function yi(e,t,a="TW"){var d,p,h,g;const i=e.hits||[],o=ra(i,a).length,l=(e.unchecked||[]).map(f=>`<li class="xq-unchecked">${n(f)}</li>`).join(""),c=(e.notes||[]).map(f=>`<li>${n(f)}</li>`).join(""),u=!e.incomplete&&(e.blockers||[]).length?`<ul class="xq-blockers">${(e.blockers||[]).map(f=>`<li>${n(f)}</li>`).join("")}</ul>`:"";return`
    <div class="xq-panel" data-strategy-id="${n(e.id)}">
      <div class="xq-panel-head">
        <div>
          <h3 class="xq-strategy-name">${n(e.name)}</h3>
          <div class="xq-tags">
            ${(e.xqTags||[e.category]).map(f=>`<span class="xq-tag">${n(f)}</span>`).join("")}
          </div>
        </div>
        <div class="xq-hit-count" title="${s("hitTitle")}">
          <span class="xq-hit-num">${o}</span>
          <span class="xq-hit-label">${n(s("hitCount"))}</span>
        </div>
      </div>
      ${e.description?`<details class="fold-block"><summary>${n(s("strategyDetails"))}</summary><p class="xq-desc fold-p">${n(e.description)}</p></details>`:""}
      <div class="xq-meta-row">
        <span>${n(s("sessionTwse"))} ${n(t.sessionDate||"—")}</span>
        <span>${n(s("ohlcvBar"))} ${n(((d=e.ohlcvBarDates)==null?void 0:d[0])||t.ohlcvBarDate||"—")}</span>
        <span>${n(s("generated"))} ${di(t.asOf)}</span>
        <span>${n(s("universeTw"))} ${((p=t.universe)==null?void 0:p.tw)??"—"}</span>
        <span>${n(s("universeUs"))} ${((h=t.universe)==null?void 0:h.us)??"—"}</span>
      </div>
      <h4 class="xq-sub">${n(s("conditions"))}</h4>
      ${fi(e)}
      ${gi(e)}
      ${(g=e.incompleteFilters)!=null&&g.length?`<p class="xq-incomplete-filters">${n(s("incompleteFilters"))}${n(e.incompleteFilters.join("、"))}</p>`:""}
      ${l?`<ul class="xq-unchecked-list">${l}</ul>`:""}
      ${e.regimeSnapshot?`<div class="xq-regime-box" role="status">
        <div class="xq-regime-title">${n(s("regimeToday"))}</div>
        <div class="xq-regime-grid">
          ${["us","tw"].map(f=>{const k=e.regimeSnapshot[f];if(!k)return"";const T=k.psychologyPhase?G(k.psychologyPhase):s("dataInsufficient"),w=k.cycleStance,j=k.liquidityBias?G(k.liquidityBias):s("dataInsufficient"),z=Array.isArray(k.dataGaps)&&k.dataGaps.length?`<div class="xq-regime-gaps">${n(s("dataGaps"))}：${n(k.dataGaps.join(", "))}</div>`:"";return`<div class="xq-regime-card">
                <div class="xq-regime-mkt">${n(f.toUpperCase())}</div>
                <div class="xq-regime-stance">${na(w)}</div>
                <div class="xq-regime-metrics">
                  <div><span class="k">${n(s("psychologyPhase"))}</span><strong>${n(T)}</strong></div>
                  <div><span class="k">${n(s("liquidityBias"))}</span><strong>${n(j)}</strong></div>
                  <div><span class="k">${n(s("temperatureScore"))}</span><strong>${n(k.temperatureScore==null?s("dataInsufficient"):String(k.temperatureScore))}</strong></div>
                </div>
                ${z}
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
          <a class="xq-btn xq-btn-link" href="${qs}" download="strategy-screener.json">${n(s("exportJson"))}</a>
          <button type="button" class="xq-btn" disabled title="${n(s("backtestHint"))}">${n(s("backtestSoon"))}</button>
        </div>
      </div>
      ${e.twOnly||Gt.has(e.id)?`<div class="xq-market-tabs"><span class="xq-mkt-hint">${n(s("twOnlyHint"))}</span></div>`:`<div class="xq-market-tabs" role="tablist" aria-label="${n(s("hitMarket"))}">
        <button type="button" class="xq-mkt-btn${a==="TW"?" active":""}" data-xq-market="TW" aria-pressed="${a==="TW"}">${n(s("twStock"))}</button>
        <button type="button" class="xq-mkt-btn${a==="US"?" active":""}" data-xq-market="US" aria-pressed="${a==="US"}">${n(s("usStock"))}</button>
      </div>`}
      ${mi(e,e.twOnly||Gt.has(e.id)?"TW":a)}
    </div>
  `}function vi(e=!0){return`
    <section class="section xq-section" id="strategies">
      <h2 class="section-title">${b("strategyScreen",s("strategyScreen"))}</h2>
      <p class="view-lead-tight">${n(s("strategyLead"))}</p>
      <div id="xq-root" class="xq-root" aria-label="${n(s("strategyScreen"))}">
        ${e?`<p class="xq-loading">${n(s("strategyLoading"))}</p>`:""}
      </div>
    </section>
  `}async function $i(e=qs){const t=await fetch(e,{cache:"no-cache"});if(!t.ok)throw new Error(`strategy-screener ${t.status}`);return t.json()}function bi(e,t){var L,P;const a=typeof e=="string"?document.querySelector(e):e;if(!a||!((L=t==null?void 0:t.strategies)!=null&&L.length)){a&&(a.innerHTML=`<div class="xq-empty"><p>${n(s("strategyEmpty"))}</p></div>`);return}const i=[...Ia];for(const v of t.categoryOrder||[]){const y=ia[v]||v;i.includes(y)||i.push(y)}const r=new Map(i.map(v=>[v,[]]));for(const v of t.strategies){const y=Wa(v);r.has(y)||(r.set(y,[]),i.push(y)),r.get(y).push(v)}for(const[v,y]of r)!y.length&&Ia.includes(v);let o=i.find(v=>(r.get(v)||[]).length)||i[0],l=((P=(r.get(o)||[])[0])==null?void 0:P.id)||t.strategies[0].id,c="TW";const u=(v,y)=>v.map(S=>{const x=(S.hits||[]).length,q=S.incomplete?" incomplete":"";return`<button type="button" class="xq-chip${S.id===y?" active":""}${q}" data-xq-id="${n(S.id)}" aria-pressed="${S.id===y}">
          <span class="xq-chip-name">${n(S.name)}</span>
          <span class="xq-chip-n">${S.incomplete?n(s("incomplete")):n(s("hitsTotal",{n:x}))}</span>
        </button>`}).join(""),d=()=>i.map(v=>{const y=r.get(v)||[];return y.length?`<button type="button" class="xq-tab${v===o?" active":""}" data-xq-tab="${n(v)}" role="tab" aria-selected="${v===o}">
          <span>${n(ci(v))}</span>
          <span class="xq-tab-n">${y.length}</span>
        </button>`:""}).join(""),p=()=>t.strategies.map(v=>{const y=(v.hits||[]).length,S=v.id===l?" active":"",x=v.incomplete?" incomplete":"";return`<button type="button" class="xq-side-item${S}${x}" data-xq-id="${n(v.id)}">
          <span>${n(v.name)}</span>
          <span class="xq-side-n">${v.incomplete?n(s("incomplete")):n(s("hitsTotal",{n:y}))}</span>
        </button>`}).join(""),h=()=>{const v=r.get(o)||[],y=t.strategies.find(S=>S.id===l)||v[0]||t.strategies[0];l=y.id,a.innerHTML=`
      <div class="xq-layout">
        <aside class="xq-sidebar" aria-label="${n(s("strategyList"))}">
          <div class="xq-side-title">${n(s("navStrategies"))}</div>
          ${p()}
        </aside>
        <div class="xq-main">
          <div class="xq-tabs" role="tablist" aria-label="${n(s("strategyCat"))}">${d()}</div>
          <div class="xq-chips" aria-label="${n(s("strategyList"))}">
            <div class="xq-chip-row">${u(v,l)}</div>
          </div>
          <div class="xq-panel-host">${yi(y,t,c)}</div>
        </div>
      </div>
      <p class="xq-foot">${n((t.disclaimer||"").split("。")[0]+(t.disclaimer?"。":""))}</p>
      <div class="xq-toast" id="xq-toast" hidden role="status"></div>
    `},g=v=>{const y=t.strategies.find(x=>x.id===v);if(!y)return;l=v;const S=Wa(y);S!==o&&(o=S),h()},f=v=>{const y=r.get(v)||[];y.length&&(o=v,y.some(S=>S.id===l)||(l=y[0].id),h())},k=(v,y=2200)=>{const S=a.querySelector("#xq-toast");S&&(S.hidden=!1,S.textContent=v,clearTimeout(k._t),k._t=setTimeout(()=>{S.hidden=!0},y))},T=async v=>{var y;try{if((y=navigator.clipboard)!=null&&y.writeText)return await navigator.clipboard.writeText(v),!0}catch{}try{const S=document.createElement("textarea");S.value=v,S.setAttribute("readonly",""),S.style.position="fixed",S.style.left="-9999px",S.style.top="0",document.body.appendChild(S),S.select();const x=document.execCommand("copy");return document.body.removeChild(S),x}catch{return!1}},w=(v,y,S)=>{const x=new Blob([y],{type:S});try{const q=document.createElement("a");return q.href=URL.createObjectURL(x),q.download=v,q.rel="noopener",document.body.appendChild(q),q.click(),q.remove(),setTimeout(()=>URL.revokeObjectURL(q.href),2e3),!0}catch{try{const q=`data:${S||"text/plain"};charset=utf-8,${encodeURIComponent(y)}`,I=document.createElement("a");return I.href=q,I.download=v,document.body.appendChild(I),I.click(),I.remove(),!0}catch{return!1}}},j=()=>{try{const v=localStorage.getItem(Ua),y=v?JSON.parse(v):[];return Array.isArray(y)?y:[]}catch{return[]}},z=v=>{try{localStorage.setItem(Ua,JSON.stringify(v.slice(0,200)))}catch{}},U=(v,y)=>{if(!v)return;const S=j();if(S.some(x=>x.ticker===v)){k(s("watchlistExists",{ticker:v}));return}S.unshift({ticker:v,name:y||v,addedAt:new Date().toISOString()}),z(S),k(s("watchlistAdded",{ticker:v}))};a.onclick=async v=>{var Pa;const y=v.target,S=y&&typeof y.closest=="function"?y:y&&y.parentElement&&typeof y.parentElement.closest=="function"?y.parentElement:null;if(!S)return;const x=S.closest("[data-xq-tab]");if(x&&a.contains(x)){v.preventDefault(),f(x.getAttribute("data-xq-tab"));return}const q=S.closest("[data-xq-id]");if(q&&a.contains(q)){v.preventDefault(),g(q.getAttribute("data-xq-id"));return}const I=S.closest("[data-xq-market]");if(I&&a.contains(I)){v.preventDefault(),c=I.getAttribute("data-xq-market")||"TW",h();return}const Ta=S.closest("[data-xq-copy]");if(Ta&&a.contains(Ta)){v.preventDefault();const Ht=await T(JSON.stringify(t,null,2));k(s(Ht?"copied":"copyFailed"));return}const wa=S.closest("[data-xq-csv]");if(wa&&a.contains(wa)){v.preventDefault();const Ht=((Pa=a.querySelector(".xq-panel"))==null?void 0:Pa.getAttribute("data-strategy-id"))||l,pe=t.strategies.find(_t=>_t.id===Ht);if(!pe)return;const cn=ra(pe.hits||[],pe.twOnly||Gt.has(pe.id)?"TW":c),xa=ki({...pe,hits:cn});if(!xa){k(s("noHitsExport"));return}const La="\uFEFF"+xa;if(w(`${pe.id}-hits.csv`,La,"text/csv;charset=utf-8"))k(s("csvDownloaded"));else{const _t=`data:text/csv;charset=utf-8,${encodeURIComponent(La)}`;k(s("csvBlocked"));try{window.open(_t,"_blank")}catch{}}return}const Ie=S.closest("[data-xq-watch]");Ie&&a.contains(Ie)&&(v.preventDefault(),U(Ie.getAttribute("data-xq-watch"),Ie.getAttribute("data-xq-watch-name")))},h()}function ki(e){const t=e.hits||[];if(!t.length)return"";const a=[...new Set(t.flatMap(l=>Object.keys(l.metrics||{})))],i=["ticker","name","market","ohlcvBarDate",...a],r=l=>{const c=l==null?"":String(l);return/[",\n]/.test(c)?`"${c.replace(/"/g,'""')}"`:c},o=t.map(l=>{const c=l.metrics||{};return[l.ticker,l.name,l.market,l.ohlcvBarDate||"",...a.map(u=>{const d=c[u];return Array.isArray(d)?d.join("|"):d})].map(r).join(",")});return[i.join(","),...o].join(`
`)}async function Si(e="#xq-root"){const t=()=>typeof e=="string"?document.querySelector(e):e;try{let a=t();if(a||(await new Promise(r=>requestAnimationFrame(r)),a=t()),!a)return console.warn("initStrategies: #xq-root missing"),{ok:!1,error:new Error("xq-root missing")};const i=await $i();return a=t(),a?(bi(a,i),{ok:!0,data:i}):{ok:!1,error:new Error("xq-root gone after fetch")}}catch(a){const i=t();return i&&(i.innerHTML=`<div class="xq-empty"><p>${n(s("strategyLoadError",{msg:a.message}))}</p></div>`),{ok:!1,error:a}}}function Ti(){return`
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
    </section>`}function wi(){return`
    <section class="section options-section" aria-label="${n(s("optionsTitle"))}">
      <header class="view-header">
        <h2 class="view-title">${n(s("optionsTitle"))}</h2>
        <p class="view-lead">${n(s("optionsLead"))}</p>
      </header>
      <p class="uo-disclaimer uo-disclaimer-top" role="note">${n(s("optionsDisclaimer"))}</p>
      <div id="uo-root" class="uo-root">
        <p class="uo-loading">${n(s("loading"))}</p>
      </div>
    </section>`}function Pi(){return`
    <section class="section earnings-section" aria-label="${n(s("earningsTitle"))}">
      <header class="view-header">
        <h2 class="view-title">${n(s("earningsTitle"))}</h2>
        <p class="view-lead">${n(s("earningsLead"))}</p>
      </header>
      <p class="er-disclaimer er-disclaimer-top" role="note">${n(s("earningsDisclaimer"))}</p>
      <div id="er-root" class="er-root">
        <p class="er-loading">${n(s("loading"))}</p>
      </div>
    </section>`}function xi(){return`
    <section class="section soxl-section" aria-label="${n(s("soxlTitle"))}">
      <header class="view-header">
        <h2 class="view-title">${n(s("soxlTitle"))}</h2>
        <p class="view-lead">${n(s("soxlLead"))}</p>
      </header>
      <p class="sx-disclaimer sx-disclaimer-top" role="note">${n(s("soxlDisclaimer"))}</p>
      <div id="sx-root" class="sx-root">
        <p class="sx-loading">${n(s("loading"))}</p>
      </div>
    </section>`}function Li(){return`
    <section class="section txf-section" aria-label="${n(s("txfTitle"))}">
      <header class="view-header">
        <h2 class="view-title">${n(s("txfTitle"))}</h2>
        <p class="view-lead">${n(s("txfLead"))}</p>
      </header>
      <p class="txf-disclaimer txf-disclaimer-top" role="note">${n(s("txfDisclaimer"))}</p>
      <div id="txf-root" class="txf-root">
        <p class="txf-loading">${n(s("loading"))}</p>
      </div>
    </section>`}const Ms="./data/research-library.json",Ns="./covers/placeholder-book.svg",Rs="./covers/placeholder-paper.svg",Os="./covers/placeholder-podcast.svg",ji={candidate:"rl-status-candidate",deferred:"rl-status-deferred",adopted:"rl-status-adopted",rejected:"rl-status-rejected"},Ci={yes:"rl-cand-yes",no:"rl-cand-no",watch:"rl-cand-watch"};function zi(e){return{candidate:s("researchStatusCandidate"),deferred:s("researchStatusDeferred"),adopted:s("researchStatusAdopted"),rejected:s("researchStatusRejected")}[e]||e}function Ai(e){return{yes:s("researchCandYes"),no:s("researchCandNo"),watch:s("researchCandWatch")}[e]||e}function Ei(e){return e==="US"?s("usStock"):e==="TW"?s("twStock"):e==="BOTH"?s("researchMarketBoth"):e}function Bs(e){return s(e==="paper"?"researchTypePaper":e==="podcast"?"researchTypePodcast":"researchTypeBook")}function rt(e,t={}){var r;if(!e)return s("researchShelfAdjacent");const a=(r=t==null?void 0:t.shelfLabels)==null?void 0:r[e];if(a&&typeof a=="object")return Ot(a,e);const i={core_investing:"researchShelfCoreInvesting",value_investing:"researchShelfValueInvesting",business_management:"researchShelfBusiness",life_partner_wisdom:"researchShelfLifePartner",options:"researchShelfOptions",recent_reads:"researchShelfRecentReads",fi_concepts:"researchShelfFiConcepts",money_values:"researchShelfMoneyValues",investing_basics:"researchShelfInvestingBasics",asset_allocation:"researchShelfAssetAllocation",financials:"researchShelfFinancials",market_analysis:"researchShelfMarketAnalysis",econ_analysis:"researchShelfEconAnalysis",psych_randomness:"researchShelfPsych",biographies:"researchShelfBiographies",adjacent:"researchShelfAdjacent"}[e];return i?s(i):e}function Di(e={}){return(Array.isArray(e.shelves)?e.shelves:null)||["core_investing","value_investing","business_management","life_partner_wisdom","options","recent_reads","fi_concepts","money_values","investing_basics","asset_allocation","financials","market_analysis","econ_analysis","psych_randomness","biographies","adjacent"]}function Ot(e,t){if(!e||typeof e!="object")return t;const a=Dt();return e[a]||e.en||e["zh-Hant"]||t}function Hs(e){return Ot(e.titleLocalized,e.title)||""}function qi(e){return Ot(e.summaryLocalized,e.summary)||""}function Mi(e,t){return e.coverUrl?e.coverUrl:e.cover?e.cover:e.type==="paper"?(t==null?void 0:t.defaultCoverPaper)||Rs:e.type==="podcast"?(t==null?void 0:t.defaultCoverPodcast)||Os:(t==null?void 0:t.defaultCoverBook)||Ns}function Ni(e,t){return e.coverFallback?e.coverFallback:e.type==="paper"?(t==null?void 0:t.defaultCoverPaper)||Rs:e.type==="podcast"?(t==null?void 0:t.defaultCoverPodcast)||Os:(t==null?void 0:t.defaultCoverBook)||Ns}function Ri(e){const t=e==null?void 0:e.plainTakeawaysLocalized;if(t&&typeof t=="object"){const a=Dt(),i=t[a]||t["zh-Hant"]||t.en;if(Array.isArray(i)&&i.length)return i}return Array.isArray(e==null?void 0:e.plainTakeaways)&&e.plainTakeaways.length?e.plainTakeaways:[]}function Oi(e){const t=Ri(e);return t.length?`<div class="rl-block">
    <h4 class="rl-h">${n(s("researchTakeaways"))}</h4>
    <ul class="rl-takeaways">${t.map(a=>`<li>${n(a)}</li>`).join("")}</ul>
  </div>`:""}function Bi(e){if(!Array.isArray(e)||!e.length)return"";const t=e.filter(i=>/^https?:\/\//i.test(String(i)));if(!t.length)return"";const a=t.map(i=>`<a href="${n(i)}" target="_blank" rel="noopener noreferrer">${n(i)}</a>`).join(" · ");return`<div class="rl-sources"><span class="rl-k">${n(s("researchSources"))}</span> ${a}</div>`}function Hi(e,t){const a=Mi(e,t),i=Ni(e,t),r=Hs(e)||Bs(e.type);return`
    <div class="rl-cover-wrap">
      <img
        class="rl-cover"
        src="${n(a)}"
        alt="${n(r)}"
        loading="lazy"
        decoding="async"
        data-rl-fallback="${n(i)}"
      />
    </div>`}function _i(e){e.querySelectorAll("img.rl-cover[data-rl-fallback]").forEach(t=>{t.addEventListener("error",()=>{const a=t.dataset.rlFallback;a&&t.getAttribute("src")!==a?t.setAttribute("src",a):t.classList.add("is-broken")})})}function Se(e,t={}){const a=e.status||"candidate",i=e.strategyCandidate||"watch",r=e.year!=null?String(e.year):"—",o=(e.authors||[]).join(", ")||"—";return`
    <article class="rl-card" data-rl-id="${n(e.id)}" data-rl-market="${n(e.market)}" data-rl-type="${n(e.type)}" data-rl-shelf="${n(e.shelf||"adjacent")}">
      ${Hi(e,t)}
      <div class="rl-card-body">
        <header class="rl-card-head">
          <div class="rl-badges">
            <span class="rl-badge rl-type">${n(Bs(e.type))}</span>
            <span class="rl-badge rl-shelf">${n(rt(e.shelf,t))}</span>
            <span class="rl-badge rl-market">${n(Ei(e.market))}</span>
            <span class="rl-badge ${ji[a]||""}">${n(zi(a))}</span>
            <span class="rl-badge ${Ci[i]||""}" title="${n(s("researchStrategy"))}">${n(Ai(i))}</span>
          </div>
          <h3 class="rl-title">${n(Hs(e))}</h3>
          <p class="rl-meta">${n(o)} · ${n(r)}</p>
        </header>
        <p class="rl-summary">${n(qi(e))}</p>
        ${Oi(e)}
        ${Bi(e.sources)}
      </div>
    </article>`}function Ui(e=!0){return`
    <section class="section research-section" aria-labelledby="research-heading">
      <header class="view-header view-header-tight">
        <h2 class="view-title" id="research-heading">${n(s("researchTitle"))}</h2>
        <p class="view-lead view-lead-tight">${n(s("researchLead"))}</p>
      </header>
      <p class="rl-banner" role="note">${n(s("researchMathGateBanner"))}</p>
      <div id="rl-root" class="rl-root" data-placeholder="${e?"1":"0"}">
        <p class="rl-loading">${n(s("loading"))}</p>
      </div>
    </section>`}function lt(e,{market:t,type:a,shelf:i,status:r,candidate:o}){return e.filter(l=>a&&a!=="all"&&l.type!==a||i&&i!=="all"&&(l.shelf||"adjacent")!==i||r&&r!=="all"&&(l.status||"candidate")!==r||o&&o!=="all"&&(l.strategyCandidate||"watch")!==o?!1:!t||t==="all"?!0:t==="US"?l.market==="US"||l.market==="BOTH":t==="TW"?l.market==="TW"||l.market==="BOTH":!0)}function Ii(e){var a,i,r;const t=(a=e==null?void 0:e.meta)==null?void 0:a.mathGateLocalized;return t&&typeof t=="object"?Ot(t,(i=e==null?void 0:e.meta)==null?void 0:i.mathGate)||s("researchMathGateBanner"):((r=e==null?void 0:e.meta)==null?void 0:r.mathGate)||s("researchMathGateBanner")}const Bt=[{id:"book",titleKey:"researchCatBooks",type:"book"},{id:"paper",titleKey:"researchCatPapers",type:"paper"},{id:"podcast",titleKey:"researchCatPodcasts",type:"podcast"},{id:"us",titleKey:"researchCatUs",market:"US"},{id:"tw",titleKey:"researchCatTw",market:"TW"},{id:"candidate",titleKey:"researchCatCandidate",status:"candidate"},{id:"watch",titleKey:"researchCatWatch",candidate:"watch"}],Fa={menu:"menu",all:"menu",index:"menu",book:"book",books:"book",paper:"paper",papers:"paper",podcast:"podcast",podcasts:"podcast",us:"us",tw:"tw",candidate:"candidate",watch:"watch",watching:"watch"};let Jt=null,Yt=null,ee={category:"menu",market:"all",type:"all",shelf:"all",status:"all",candidate:"all"};function la(e){if(e==null||e==="")return"menu";const a=String(e).trim().toLowerCase();return Fa[a]?Fa[a]:Bt.some(i=>i.id===a)?a:"menu"}function oa(e,t){const a=Bt.find(i=>i.id===t);return e.category=a?t:"menu",e.market="all",e.type="all",e.shelf="all",e.status="all",e.candidate="all",a&&(a.type&&(e.type=a.type),a.market&&(e.market=a.market),a.status&&(e.status=a.status),a.candidate&&(e.candidate=a.candidate)),e}function Wi(e,t){return lt(e,{market:t.market||"all",type:t.type||"all",shelf:"all",status:t.status||"all",candidate:t.candidate||"all"}).length}function Fi(e){return!e||e.category==="menu"?"#research":e.shelf&&e.shelf!=="all"?`#research/shelf/${encodeURIComponent(e.shelf)}`:`#research/${e.category}`}function _s(e){const t=Fi(e);location.hash!==t&&history.replaceState(null,"",t)}function Va(e){return[{id:"menu",label:s("researchCatMenu")},...Bt.map(a=>({id:a.id,label:s(a.titleKey)}))].map(a=>`<button type="button" class="rl-tab${a.id===e.category?" is-active":""}" data-rl-cat="${n(a.id)}" role="tab" aria-selected="${a.id===e.category}">${n(a.label)}</button>`).join("")}function Vi(e){const t=Bt.map(a=>{const i=Wi(e,a);return`
      <button type="button" class="rl-menu-card" data-rl-cat="${n(a.id)}" aria-label="${n(s(a.titleKey))}">
        <h3 class="rl-menu-title">${n(s(a.titleKey))}</h3>
        <p class="rl-menu-count">${i}</p>
        <span class="rl-menu-cta">${n(s("researchOpenCategory"))}</span>
      </button>`}).join("");return`
    <div class="rl-menu" role="group" aria-label="${n(s("researchCategories"))}">
      <p class="rl-menu-lead">${n(s("researchMenuLead"))}</p>
      <div class="rl-menu-grid">${t}</div>
    </div>`}function me(e,t,a,{syncUrl:i=!0}={}){const r=Array.isArray(t==null?void 0:t.items)?t.items:[],o=(t==null?void 0:t.meta)||{},l=Di(o);if(i&&_s(a),a.category==="menu"){e.innerHTML=`
      <div class="rl-tabs-wrap">
        <div class="rl-tabs" role="tablist" aria-label="${n(s("researchCategories"))}">
          ${Va(a)}
        </div>
      </div>
      ${Vi(r)}`,Ga(e,t,a);return}const c=lt(r,a),u=c.filter(P=>P.type==="book"),d=c.filter(P=>P.type==="paper"),p=c.filter(P=>P.type==="podcast"),h=o.mathGate?`<p class="rl-meta-line">${n(Ii(t))}</p>`:"",g=[`<button type="button" class="rl-filter rl-shelf-chip${a.shelf==="all"?" is-active":""}" data-rl-shelf="all">${n(s("researchFilterAll"))}</button>`,...l.map(P=>{const v=lt(r,{...a,shelf:P}).length;return v?`<button type="button" class="rl-filter rl-shelf-chip${a.shelf===P?" is-active":""}" data-rl-shelf="${n(P)}">${n(rt(P,o))} <span class="rl-chip-count">${v}</span></button>`:""})].join(""),f=[["all",s("researchFilterAll")],["candidate",s("researchStatusCandidate")],["deferred",s("researchStatusDeferred")],["adopted",s("researchStatusAdopted")],["rejected",s("researchStatusRejected")]].map(([P,v])=>{const y=lt(r,{...a,status:P==="all"?"all":P}).length;return P!=="all"&&!r.some(S=>(S.status||"candidate")===P)?"":`<button type="button" class="rl-filter${a.status===P?" is-active":""}" data-rl-status="${P}">${n(v)}${P==="all"?"":` <span class="rl-chip-count">${y}</span>`}</button>`}).join("");function k(P){if(!P.length)return`<p class="rl-empty">${n(s("researchEmpty"))}</p>`;if(a.shelf&&a.shelf!=="all")return`<div class="rl-grid">${P.map(y=>Se(y,o)).join("")}</div>`;const v=l.filter(y=>P.some(S=>(S.shelf||"adjacent")===y));return v.length?v.map(y=>{const S=P.filter(x=>(x.shelf||"adjacent")===y);return`<section class="rl-shelf-group" data-shelf="${n(y)}" aria-label="${n(rt(y,o))}">
          <h4 class="rl-shelf-title">${n(rt(y,o))} <span class="rl-list-count">(${S.length})</span></h4>
          <div class="rl-grid">${S.map(x=>Se(x,o)).join("")}</div>
        </section>`}).join(""):`<div class="rl-grid">${P.map(y=>Se(y,o)).join("")}</div>`}const T=a.type==="all"||a.type==="book",w=a.type==="all"||a.type==="paper",j=a.type==="all"||a.type==="podcast",z=[];T&&z.push(`<section class="rl-list" aria-label="${n(s("researchTypeBook"))}">
        <h3 class="rl-list-title">${n(s("researchTypeBook"))} <span class="rl-list-count">(${u.length})</span></h3>
        ${k(u)}
      </section>`),w&&z.push(`<section class="rl-list" aria-label="${n(s("researchTypePaper"))}">
        <h3 class="rl-list-title">${n(s("researchTypePaper"))} <span class="rl-list-count">(${d.length})</span></h3>
        <div class="rl-grid">
          ${d.length?d.map(P=>Se(P,o)).join(""):`<p class="rl-empty">${n(s("researchEmpty"))}</p>`}
        </div>
      </section>`),j&&z.push(`<section class="rl-list" aria-label="${n(s("researchTypePodcast"))}">
        <h3 class="rl-list-title">${n(s("researchTypePodcast"))} <span class="rl-list-count">(${p.length})</span></h3>
        <div class="rl-grid">
          ${p.length?p.map(P=>Se(P,o)).join(""):`<p class="rl-empty">${n(s("researchEmpty"))}</p>`}
        </div>
      </section>`);const U=a.category==="us"||a.category==="tw"?"":`<div class="rl-filter-group" role="group" aria-label="${n(s("market"))}">
        <button type="button" class="rl-filter${a.market==="all"?" is-active":""}" data-rl-market="all">${n(s("researchFilterAll"))}</button>
        <button type="button" class="rl-filter${a.market==="US"?" is-active":""}" data-rl-market="US">${n(s("usStock"))}</button>
        <button type="button" class="rl-filter${a.market==="TW"?" is-active":""}" data-rl-market="TW">${n(s("twStock"))}</button>
      </div>`,L=a.category==="candidate"||a.category==="watch"?"":`<div class="rl-filter-group" role="group" aria-label="${n(s("researchStatusFilters"))}">
        ${f}
      </div>`;e.innerHTML=`
    <div class="rl-tabs-wrap">
      <div class="rl-tabs" role="tablist" aria-label="${n(s("researchCategories"))}">
        ${Va(a)}
      </div>
    </div>
    <div class="rl-toolbar" role="toolbar" aria-label="${n(s("researchFilters"))}">
      ${U}
      ${L}
    </div>
    <div class="rl-shelf-scroll" role="group" aria-label="${n(s("researchShelfFilters"))}">
      ${g}
    </div>
    ${h}
    <p class="rl-counts">${n(s("researchCounts",{books:u.length,papers:d.length,podcasts:p.length,total:c.length}))}</p>
    <div class="rl-lists">
      ${z.join("")}
    </div>`,_i(e),Ga(e,t,a)}function Ga(e,t,a){e.querySelectorAll("[data-rl-cat]").forEach(i=>{i.addEventListener("click",()=>{oa(a,i.dataset.rlCat),me(e,t,a,{syncUrl:!0})})}),e.querySelectorAll("[data-rl-market]").forEach(i=>{i.addEventListener("click",()=>{a.market=i.dataset.rlMarket,me(e,t,a,{syncUrl:!1})})}),e.querySelectorAll("[data-rl-status]").forEach(i=>{i.addEventListener("click",()=>{a.status=i.dataset.rlStatus,me(e,t,a,{syncUrl:!1})})}),e.querySelectorAll("[data-rl-shelf]").forEach(i=>{i.addEventListener("click",()=>{a.shelf=i.dataset.rlShelf,_s(a),me(e,t,a,{syncUrl:!1})})})}async function Gi(e=Ms){const t=await fetch(e);if(!t.ok)throw new Error(`HTTP ${t.status}`);return t.json()}function Ji(e,{syncUrl:t=!0,shelf:a=null}={}){return!Jt||!Yt?{ok:!1,reason:"not-ready"}:(oa(ee,la(e)),a&&(ee.shelf=a),me(Jt,Yt,ee,{syncUrl:t}),{ok:!0,category:ee.category,state:{...ee}})}async function Yi(e="#rl-root",t=Ms,a={}){const i=typeof e=="string"?document.querySelector(e):e;if(!i)return{ok:!1,reason:"missing-root"};Jt=i;try{const r=await Gi(t);return Yt=r,ee={category:"menu",market:"all",type:"all",shelf:"all",status:"all",candidate:"all"},oa(ee,la(a.category??"menu")),a.shelf&&(ee.shelf=a.shelf),me(i,r,ee,{syncUrl:a.syncUrl!==!1}),{ok:!0,data:r}}catch(r){return i.innerHTML=`<p class="rl-error">${n(s("researchLoadError",{msg:r.message}))}</p>`,{ok:!1,error:r}}}const Ki="https://r.jina.ai/",ca="",Zi=new Set(["query1.finance.yahoo.com","query2.finance.yahoo.com","mis.twse.com.tw"]),Xi=6e3,Qi=1e4;function er(e,t=ca){if(!t)return null;let a;try{const i=new URL(e);if(i.protocol!=="https:")return null;a=i.hostname}catch{return null}return Zi.has(a)?`${String(t).replace(/\/+$/,"")}/?url=${encodeURIComponent(e)}`:null}function tr(e,{backupBase:t=ca,primaryTimeoutMs:a=18e3}={}){const i=er(e,t),r=[{via:"jina",url:`${Ki}${e}`,timeoutMs:i?Math.min(a,Xi):a}];return i&&r.push({via:"backup",url:i,timeoutMs:Qi}),r}async function ar(e,{fetchText:t,parse:a,backupBase:i=ca,primaryTimeoutMs:r=18e3,onError:o,only:l}={}){const c=[];for(const u of tr(e,{backupBase:i,primaryTimeoutMs:r}))if(!(l&&!l.includes(u.via)))try{const d=await t(u.url,{timeoutMs:u.timeoutMs}),p=a(d);if(p)return{ok:!0,data:p,via:u.via,errors:c};c.push(`${u.via}: parse`)}catch(d){o&&o(d,u),c.push(`${u.via}: ${(d==null?void 0:d.message)||d}`)}return{ok:!1,data:null,via:null,errors:c}}const sr=["https://query2.finance.yahoo.com","https://query1.finance.yahoo.com"],nr="https://mis.twse.com.tw/stock/api/getStockInfo.jsp?json=1&delay=0&ex_ch=",ir={tw:"^TWII",spx:"^GSPC",nasdaq:"^IXIC",sox:"^SOX",usdTwd:"USDTWD=X"},rr={tw:"tse_t00.tw",otc:"otc_o00.tw"},lr=14,or=2e4,Us=5*6e4;let ot=null,Ja=!1,bt=new Map,ce=null,ke=!1,Ue=!1,C=null;function Ya(e){if(!e)return null;const t=String(e).trim();if(t.startsWith("{")||t.startsWith("["))try{return JSON.parse(t)}catch{}const a=t.match(/Markdown Content:\s*(\{[\s\S]*|\[[\s\S]*)/i),i=a?a[1].trim():t,r=i.search(/[\{\[]/);if(r<0)return null;const o=i.slice(r);for(let l=o.length;l>2;l--){try{return JSON.parse(o.slice(0,l))}catch{}const c=Math.max(o.lastIndexOf("}",l-2),o.lastIndexOf("]",l-2));if(c<8)break;l=c+2}return null}async function Ka(e,{timeoutMs:t=14e3}={}){const a=typeof AbortController<"u"?new AbortController:null,i=a?setTimeout(()=>a.abort(),t):null;try{const r=await fetch(e,{signal:a==null?void 0:a.signal,headers:{Accept:"application/json,text/plain,*/*"},cache:"no-store"});if(!r.ok)throw new Error(`HTTP ${r.status}`);return await r.text()}finally{i&&clearTimeout(i)}}async function Is(e){const t=[];try{const i=await Ka(e,{timeoutMs:1e4}),r=Ya(i);if(r)return{ok:!0,data:r,via:"direct"};t.push("direct: non-json")}catch(i){t.push(`direct: ${i.message||i}`)}const a=await ar(e,{fetchText:Ka,parse:Ya,primaryTimeoutMs:2e4});return a.ok?{ok:!0,data:a.data,via:a.via}:(t.push(...a.errors),{ok:!1,data:null,via:null,error:t.slice(0,3).join(" · ")})}function cr(e){return typeof CSS<"u"&&typeof CSS.escape=="function"?CSS.escape(e):String(e).replace(/\\/g,"\\\\").replace(/"/g,'\\"')}function dr(e,t){const a=[];for(let i=0;i<e.length;i+=t)a.push(e.slice(i,i+t));return a}function oe(e){return e==null||Number.isNaN(e)?"flat":e>0?"up":e<0?"down":"flat"}function Q(e,t=2){return e==null||Number.isNaN(e)?"—":Number(e).toLocaleString(R(),{minimumFractionDigits:t,maximumFractionDigits:t})}function ue(e,t=2){return e==null||Number.isNaN(e)?"—":`${e>0?"+":""}${Number(e).toFixed(t)}%`}function Za(e,t){if(e==null||Number.isNaN(e))return"—";const a=t==="TWD"&&e>=100?0:2;return`${t==="USD"?"$":t==="TWD"?"NT$":""}${Q(e,a)}`}function Ws(e,t){return e==null||Number.isNaN(e)?"—":`${t==="USD"?"US$":t==="TWD"?"NT$":""}${Q(e,t==="TWD"?0:2)}`}function Kt(e,t){if(e==null||Number.isNaN(e))return"—";const a=t==="TWD"?0:2,i=t==="USD"?"US$":t==="TWD"?"NT$":"",r=Q(Math.abs(e),a);return r===Q(0,a)?`${i}${r}`:`${e>0?"+":"−"}${i}${r}`}function ur(e,t){if(e==null||Number.isNaN(e))return"—";const a=t==="TWD"&&e>=100?0:2;return`${t==="USD"?"US$":t==="TWD"?"NT$":""}${Q(e,a)}`}function Fs(e=new Date){const t=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Taipei",year:"numeric",month:"2-digit",day:"2-digit",weekday:"short",hour:"2-digit",minute:"2-digit",hour12:!1}).formatToParts(e),a=i=>{var r;return(r=t.find(o=>o.type===i))==null?void 0:r.value};return{ymd:`${a("year")}-${a("month")}-${a("day")}`,weekday:a("weekday"),hour:Number(a("hour")),minute:Number(a("minute"))}}function pr(e=Fs()){return!["Sat","Sun"].includes(e.weekday)}function Vs(e=new Date){const t=Fs(e),a=t.hour*60+t.minute,i=pr(t),r=i&&a>=540&&a<=815,o=i&&(a>=1260||a<=315),l=t.weekday==="Sat"&&a<=315,c=t.weekday==="Sun"&&a>=1260;return{twOpen:r,usOpen:o||l||c,weekday:i,parts:t}}function hr(){const{twOpen:e,usOpen:t}=Vs();return e||t?or:Us}function gr(e){try{return new Date(e).toLocaleString(R(),{timeZone:"Asia/Taipei",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1})+s("taipei")}catch{return"—"}}function Gs(e){const t=String(e||"").trim().toUpperCase();return t?/^\d{4}\.(TW|TWO)$/.test(t)?t:/^\d{4}$/.test(t)?`${t}.TW`:t.replace(/\./g,"-"):null}function fr(e){const t=String(e||"").toUpperCase(),a=t.match(/^(\d{4})\.(TW|TWO)$/)||t.match(/^(\d{4})$/);if(!a)return null;const i=a[1];return/\.TWO$/.test(t)?`otc_${i}.tw`:`tse_${i}.tw`}function mr(e,t){!e||(t==null?void 0:t.price)==null||Number.isNaN(t.price)||bt.set(e,{...t,asOfMs:t.asOfMs||Date.now()})}function yr(e){var i,r;const t=(i=e==null?void 0:e.spark)==null?void 0:i.result;if(!Array.isArray(t))return[];const a=[];for(const o of t){const l=o==null?void 0:o.symbol,c=((r=((o==null?void 0:o.response)||[{}])[0])==null?void 0:r.meta)||{},u=c.regularMarketPrice;if(u==null||Number.isNaN(Number(u)))continue;const d=c.chartPreviousClose??c.previousClose??null;let p=null,h=null;d!=null&&d!==0&&(h=Number(u)-Number(d),p=h/Number(d)*100);const g=typeof c.regularMarketTime=="number"?c.regularMarketTime*(c.regularMarketTime<1e12?1e3:1):Date.now();a.push({symbol:l,price:Number(u),prev:d!=null?Number(d):null,change:h,changePct:p,currency:c.currency||null,asOfMs:g,source:"yahoo-spark"})}return a}async function vr(e){const t=[...new Set(e.filter(Boolean))];if(!t.length)return{ok:!0,quotes:[],via:null};const a=[];let i=null,r=!1,o=null;for(const l of dr(t,lr)){const c=`/v7/finance/spark?symbols=${encodeURIComponent(l.join(","))}&range=1d&interval=5m`;let u=null;for(const d of sr){const p=await Is(`${d}${c}`);if(p.ok){u=p;break}o=p.error}u!=null&&u.ok&&(r=!0,i=u.via,a.push(...yr(u.data)))}return{ok:r,quotes:a,via:i,error:r?null:o}}function Te(e){if(e==null||e===""||e==="-"||e==="—"||e==="null")return null;const t=Number(String(e).replace(/,/g,""));return Number.isFinite(t)?t:null}function $r(e){const t=e==null?void 0:e.msgArray;if(!Array.isArray(t))return[];const a=[];for(const i of t){const r=i==null?void 0:i.c;if(!r)continue;const o=Te(i.z)??Te(i.pz)??Te(i.o),l=Te(i.y);if(o==null)continue;let c=null,u=null;l!=null&&l!==0&&(u=o-l,c=u/l*100);const d=i.ex==="otc"?"otc":"tse";let p;r==="t00"?p="__MIS_TWII":r==="o00"?p="__MIS_OTC":p=`${r}.${d==="otc"?"TWO":"TW"}`;const h=Te(i.tlong);a.push({symbol:p,price:o,prev:l,change:u,changePct:c,currency:"TWD",asOfMs:h||Date.now(),source:"twse-mis",misCode:r,misEx:d})}return a}async function br(e){const t=[...new Set(e.filter(Boolean))];if(!t.length)return{ok:!0,quotes:[],via:null};const a=`${nr}${t.join("|")}`,i=await Is(a);return i.ok?{ok:!0,quotes:$r(i.data),via:i.via}:{ok:!1,quotes:[],via:null,error:i.error}}function kr(e){const t=new Set(Object.values(ir));t.add("SOXL");const a=new Set(Object.values(rr));return e.querySelectorAll("[data-lq-sym]").forEach(i=>{const r=i.getAttribute("data-lq-sym"),o=Gs(r);o&&t.add(o);const l=fr(r);l&&a.add(l)}),{yahoo:[...t],mis:[...a]}}function kt(e,t){if(!e)return;e.classList.remove("up","down","flat","lk-up","lk-down","lk-flat","sx-up","sx-down","sx-flat");const a=oe(t);e.classList.add(a)}function Sr(e){e&&(e.classList.remove("lq-flash"),e.offsetWidth,e.classList.add("lq-flash"),window.setTimeout(()=>{e.classList.remove("lq-flash")},700))}function A(e,t,{flash:a=!1}={}){e&&e.textContent!==t&&(e.textContent=t,a&&Sr(e))}function Tr(e=Date.now()){try{return new Date(e).toLocaleTimeString("en-GB",{timeZone:"Asia/Taipei",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1})}catch{return"—"}}function ge(e,t,a,i){const r=e.querySelectorAll(`[data-lq-key="${t}"]`);if(!r.length||!a||a.price==null)return;const o=t==="usdTwd"?3:2;r.forEach(l=>{l.classList.remove("incomplete");const c=l.querySelector("[data-lq-field='value'], .value");A(c,Q(a.price,o),{flash:!0});const u=l.querySelector("[data-lq-field='date']");if(u&&a.asOfMs)try{const p=new Date(a.asOfMs).toLocaleDateString("en-US",{timeZone:"Asia/Taipei",month:"2-digit",day:"2-digit"});u.textContent=p}catch{}let d=l.querySelector("[data-lq-field='dayPct'], .pct");if(t==="usdTwd"){if(d&&i){const p=i.taipeiClose!=null?Q(i.taipeiClose,3):"—";d.className="pct flat",d.style.fontSize="0.7rem",d.textContent=`${s("taipeiClose")} ${p} · Yahoo ${Q(a.price,3)}`}}else a.changePct!=null&&(d||(d=document.createElement("div"),d.className="pct",d.setAttribute("data-lq-field","dayPct"),l.appendChild(d)),d.className=`pct ${oe(a.changePct)}`,d.setAttribute("data-lq-field","dayPct"),A(d,ue(a.changePct),{flash:!0}))})}function wr(e,t,a){if(!a||a.price==null)return;const i=a.currency||(/\.(TW|TWO)$/i.test(t)?"TWD":"USD");e.querySelectorAll(`[data-lq-sym="${cr(t)}"]`).forEach(o=>{const l=o.getAttribute("data-lq");if(l==="soxl")return;if(l==="pos"){Pr(o,a,i);return}const c=o.querySelectorAll("[data-lq-field='price']"),u=o.querySelectorAll("[data-lq-field='dayPct']");if(c.length||u.length){c.forEach(h=>A(h,Za(a.price,i),{flash:!0})),u.forEach(h=>{kt(h,a.changePct),A(h,ue(a.changePct),{flash:!0})});return}const d=o.querySelector(".price"),p=o.querySelector(".day-pct");d&&A(d,Za(a.price,i),{flash:!0}),p&&(kt(p,a.changePct),A(p,ue(a.changePct),{flash:!0}))})}function Pr(e,t,a){const i=Number(e.getAttribute("data-lq-qty")),r=Number(e.getAttribute("data-lq-avg")),o=e.getAttribute("data-lq-ccy")||a,l=t.price,c=t.changePct,u=e.querySelectorAll("td");if(!(u.length<10)){if(A(u[2],ur(l,o),{flash:!0}),Number.isFinite(i)){const d=l*i;A(u[3],Ws(d,o));const p=c!=null&&Number.isFinite(c)?l*i*c/100:null;if(u[4].className=`num ${oe(p)}`,A(u[4],p==null?"—":Kt(p,o)),Number.isFinite(r)){const h=(l-r)*i,g=r?(l-r)/r*100:0;u[6].className=`num ${oe(h)}`,A(u[6],Kt(h,o)),u[7].className=`num ${oe(g)}`,A(u[7],ue(g))}}u[5].className=`num ${oe(c)}`,A(u[5],ue(c),{flash:!0}),e.setAttribute("data-lq-mark",String(l)),c!=null&&e.setAttribute("data-lq-daypct",String(c))}}function xr(e){e.querySelectorAll("[data-lq-book]").forEach(t=>{const a=t.getAttribute("data-lq-book"),i=Number(t.getAttribute("data-lq-cash")),r=Number(t.getAttribute("data-lq-start")),o=t.getAttribute("data-lq-ccy")||(a==="TW"?"TWD":"USD");if(!Number.isFinite(i))return;let l=0;t.querySelectorAll(".pos-row[data-lq-sym]").forEach(k=>{const T=Number(k.getAttribute("data-lq-qty")),w=Number(k.getAttribute("data-lq-mark"));Number.isFinite(T)&&Number.isFinite(w)&&(l+=T*w)});const c=l;t.querySelectorAll(".pos-row[data-lq-sym]").forEach(k=>{const T=Number(k.getAttribute("data-lq-qty")),w=Number(k.getAttribute("data-lq-mark")),j=k.querySelectorAll("td");if(j.length>=11&&Number.isFinite(T)&&Number.isFinite(w)&&c>0){const z=w*T/c*100;A(j[10],`${z.toFixed(2)}%`)}});const u=i+l,d=Number.isFinite(r)?u-r:null,p=Number.isFinite(r)&&r!==0?(u-r)/r*100:null,h=t.querySelector("[data-lq-kpi='equity']"),g=t.querySelector("[data-lq-kpi='pnl']"),f=t.querySelector("[data-lq-kpi='pnlPct']");h&&A(h,Ws(u,o)),g&&d!=null&&(kt(g,d),A(g,Kt(d,o))),f&&p!=null&&(kt(f,p),A(f,ue(p)))})}function Lr(e,t){if(!t||t.price==null)return;const a=e.querySelector("#sx-root .sx-price"),i=e.querySelector("#sx-root .sx-chg"),r=e.querySelector("#sx-root .sx-chgp"),o=e.querySelector("#sx-root .sx-price-row"),l=e.querySelector("#sx-root .sx-session");if(a&&A(a,`$${Q(t.price,2)}`,{flash:!0}),i)if(t.change==null||Number.isNaN(t.change))A(i,"—");else{const c=t.change>0?"+":"";A(i,`${c}${Q(t.change,2)}`)}if(r&&A(r,ue(t.changePct),{flash:!0}),o){o.classList.remove("sx-up","sx-down","sx-flat");const c=oe(t.changePct??t.change);o.classList.add(c==="up"?"sx-up":c==="down"?"sx-down":"sx-flat")}if(l){const c=gr(t.asOfMs||Date.now());A(l,`live · ${s("dataAsOf")} ${c}`)}}function jr(e,t){const a=Gs(t);if(a&&e.has(a))return e.get(a);if(a&&a.endsWith(".TW")){const i=a.replace(/\.TW$/,".TWO");if(e.has(i))return e.get(i)}if(a&&a.endsWith(".TWO")){const i=a.replace(/\.TWO$/,".TW");if(e.has(i))return e.get(i)}return null}function St(e,{ok:t,stale:a}){const i=e.querySelector("#lq-live-suffix");if(!i)return;const r=ce?Tr(ce):"",{twOpen:o,usOpen:l}=Vs();if(!o&&!l){i.hidden=!1,i.dataset.state="closed",i.title=s("liveQuotesClosedTitle"),i.textContent=` · ${s("liveQuotesClosed")}`;return}t&&!a&&r?(i.hidden=!1,i.dataset.state="live",i.removeAttribute("title"),i.textContent=` · ${s("liveQuotesLive")} ${r}`):ce?(i.hidden=!1,i.dataset.state="stale",i.title=s("liveQuotesStale"),i.textContent=r?` · ${s("liveQuotesStaleShort")} ${r}`:` · ${s("liveQuotesStaleShort")}`):t?(i.hidden=!0,i.dataset.state="pending",i.removeAttribute("title"),i.textContent=""):(i.hidden=!1,i.dataset.state="stale",i.title=s("liveQuotesStale"),i.textContent=` · ${s("liveQuotesStaleShort")}`)}function Js(...e){const t=new Map(bt);for(const a of e)for(const i of a)!(i!=null&&i.symbol)||i.price==null||(mr(i.symbol,i),t.set(i.symbol,bt.get(i.symbol)));if(t.has("__MIS_TWII")){const a=t.get("__MIS_TWII");t.set("^TWII",a)}return t}async function da(){if(!C||document.visibilityState==="hidden")return;const{yahoo:e,mis:t}=kr(C),[a,i]=await Promise.all([vr(e),br(t)]),r=Js(a.quotes||[],i.quotes||[]),o=a.ok||i.ok;o?(ce=Date.now(),ke=!0):ke=!1,Ys(r,o)}function Ys(e,t){if(!C)return;const a=e.get("__MIS_TWII")||e.get("^TWII"),i=e.get("__MIS_OTC");ge(C,"tw",a),ge(C,"otc",i),ge(C,"spx",e.get("^GSPC")),ge(C,"nasdaq",e.get("^IXIC")),ge(C,"sox",e.get("^SOX"));const r=e.get("USDTWD=X"),o=C.querySelector("[data-lq-key='usdTwd']"),l=o==null?void 0:o.getAttribute("data-lq-taipei-close"),c=l!=null&&l!==""?Number(l):null;ge(C,"usdTwd",r,{taipeiClose:Number.isFinite(c)?c:null});const u=new Set;C.querySelectorAll("[data-lq-sym]").forEach(p=>{const h=p.getAttribute("data-lq-sym");if(!h||u.has(h))return;u.add(h);const g=jr(e,h);g&&wr(C,h,g)}),Lr(C,e.get("SOXL")),xr(C);const d=ce?Date.now()-ce:1/0;St(C,{ok:t,stale:!t||d>Us})}function ua(){ot&&(clearTimeout(ot),ot=null)}function pa(){if(ua(),!Ue)return;const e=hr();ot=window.setTimeout(async()=>{try{await da()}catch{ke=!1,C&&St(C,{ok:!1,stale:!0})}pa()},e)}function Cr(){if(Ue){if(document.visibilityState==="hidden"){ua();return}da().finally(()=>pa())}}async function zr(e){if(Ks(),C=e,!C)return{ok:!1};Ue=!0,Ja||(document.addEventListener("visibilitychange",Cr),Ja=!0),St(C,{ok:!1,stale:!1});try{await da()}catch{ke=!1,St(C,{ok:!1,stale:!0})}return pa(),{ok:ke,lastSuccessAt:ce}}function Ar(){return!Ue||!C||bt.size===0?!1:(Ys(Js(),ke),!0)}function Ks(){Ue=!1,ua(),C=null}const Xa="./data/us-macro-calendar.json",Er=900*1e3,Dr=2160*60*1e3;let Je=null;function qr(e){const t=e!=null&&e.eventKey?`macroEvent_${e.eventKey}`:null;if(t){const a=s(t,"");if(a&&a!==t)return a}return(e==null?void 0:e.shortName)||(e==null?void 0:e.eventName)||"—"}function Mr(e,t){const a=new Intl.DateTimeFormat("en-CA",{timeZone:t,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(e),i=r=>{var o;return(o=a.find(l=>l.type===r))==null?void 0:o.value};return`${i("year")}-${i("month")}-${i("day")}`}function Nr(e,t){try{const a=new Date(e),i=a.toLocaleDateString(R(),{timeZone:t,month:"numeric",day:"numeric",weekday:"short"}),r=a.toLocaleTimeString(R(),{timeZone:t,hour:"2-digit",minute:"2-digit",hour12:!1});return{datePart:i,timePart:r}}catch{return{datePart:"—",timePart:""}}}function Rr(e){try{return new Date(e).toLocaleString(R(),{timeZone:"Asia/Taipei",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1})}catch{return e||"—"}}function Or(e,t){let a=null;for(const i of e)if(i.dayEt>=t){a=i.id;break}return a}function Br(e,{todayEt:t,nextId:a,timeZone:i}){const r=n(qr(e)),{datePart:o,timePart:l}=Nr(e.scheduledAt,i),c=e.dayEt===t,u=e.id===a,d=e.dayEt<t,p=["macro-chip",e.highImpact||e.importance==="high"?"macro-chip--high":"",c?"macro-chip--today":"",u&&!c?"macro-chip--next":"",d?"macro-chip--past":""].filter(Boolean).join(" "),h=[];c?h.push(`<span class="macro-chip-tag">${n(s("macroToday"))}</span>`):u&&h.push(`<span class="macro-chip-tag macro-chip-tag--next">${n(s("macroNext"))}</span>`),(e.highImpact||e.importance==="high")&&h.push(`<span class="macro-chip-tag macro-chip-tag--high">${n(s("macroHighImpact"))}</span>`);const g=[e.eventName,e.periodLabel,`${e.dayEt} ${l} ET`,e.officialUrl?"↗ official":null].filter(Boolean).join(" · "),k=`
      <span class="macro-chip-when">${l?`${n(o)} ${n(l)}`:n(o)}</span>
      <span class="macro-chip-name">${r}</span>
      ${h.length?`<span class="macro-chip-tags">${h.join("")}</span>`:""}`,T=typeof e.officialUrl=="string"&&/^https?:\/\//i.test(e.officialUrl)?e.officialUrl:null;return T?`
    <a class="${p}" href="${n(T)}" target="_blank" rel="noopener noreferrer"
       title="${n(g)}" data-event-id="${n(e.id)}">${k}
    </a>`:`
    <span class="${p}" title="${n(g)}" data-event-id="${n(e.id)}">${k}
    </span>`}function Hr(e){const t=e.querySelector(".index-marquee");if(!t||t.dataset.marqueeBound==="1")return;t.dataset.marqueeBound="1";const a=()=>t.classList.add("is-paused"),i=()=>t.classList.remove("is-paused");t.addEventListener("pointerdown",a),t.addEventListener("pointerup",i),t.addEventListener("pointercancel",i),t.addEventListener("pointerleave",i),t.addEventListener("touchstart",a,{passive:!0}),t.addEventListener("touchend",i,{passive:!0}),t.addEventListener("touchcancel",i,{passive:!0})}function _r(e,t){if(!e)return;const a=(t==null?void 0:t.timezone)||"America/New_York",i=Mr(new Date,a),r=Array.isArray(t==null?void 0:t.events)?t.events:[],o=Or(r,i),l=(t==null?void 0:t.asOf)||null,c=l?Date.now()-Date.parse(l):NaN,u=!!(t!=null&&t.stale)||!Number.isNaN(c)&&c>Dr;let d=`${n(s("macroTzEt"))}`;if(l&&(d+=` · ${n(s("macroAsOf"))} ${n(Rr(l))}`),u&&(d+=` · ${n(s("macroStale"))}`),!r.length){e.innerHTML=`
      <div class="macro-strip" role="region" aria-label="${n(s("macroTitle"))}">
        <div class="macro-strip-side">
          <span class="macro-strip-label">${n(s("macroTitle"))}</span>
          <span class="macro-strip-meta">${d}</span>
        </div>
        <p class="macro-strip-empty">${n(s("macroEmpty"))}</p>
      </div>`;return}const p=r.map(f=>Br(f,{todayEt:i,nextId:o,timeZone:a})),h=`<div class="index-marquee-group">${p.join("")}</div>`,g=`<div class="index-marquee-group index-marquee-group--clone" aria-hidden="true" inert>${p.join("").replace(/<a /g,'<a tabindex="-1" ')}</div>`;e.innerHTML=`
    <div class="macro-strip" role="region" aria-label="${n(s("macroTitle"))}">
      <div class="macro-strip-side">
        <span class="macro-strip-label">${n(s("macroTitle"))}</span>
        <span class="macro-strip-meta" title="${d}">${d}</span>
      </div>
      <div class="index-strip index-strip--marquee macro-strip-marquee">
        <div class="index-marquee" tabindex="0">
          <div class="index-marquee-track">
            ${h}
            ${g}
          </div>
        </div>
      </div>
    </div>`,Hr(e)}function Ur(){return'<div id="us-macro-strip" class="us-macro-strip-host" aria-live="polite"></div>'}async function Ir(e=!1){const t=e?`${Xa}?t=${Date.now()}`:Xa,a=await fetch(t,{cache:e?"no-store":"default"});if(!a.ok)throw new Error(`HTTP ${a.status}`);return a.json()}async function Wr(e="#us-macro-strip"){const t=typeof e=="string"?document.querySelector(e):e;if(!t)return{ok:!1};const a=async r=>{try{const o=await Ir(r);return _r(t,o),{ok:!0,data:o}}catch(o){return t.innerHTML=`
        <div class="macro-strip macro-strip--error" role="status">
          <div class="macro-strip-side">
            <span class="macro-strip-label">${n(s("macroTitle"))}</span>
          </div>
          <p class="macro-strip-empty">${n(s("macroLoadError",{msg:o.message||String(o)}))}</p>
        </div>`,{ok:!1,error:o}}},i=await a(!1);return Je&&(window.clearInterval(Je),Je=null),Je=window.setInterval(()=>{a(!0)},Er),i}const Qa="./data/tw-macro-calendar.json",Fr=900*1e3,Vr=2160*60*1e3;let Ye=null;function Gr(e){const t=e!=null&&e.eventKey?`twMacroEvent_${e.eventKey}`:null;if(t){const a=s(t,"");if(a&&a!==t)return a}return(e==null?void 0:e.shortName)||(e==null?void 0:e.eventName)||"—"}function Jr(e,t){const a=new Intl.DateTimeFormat("en-CA",{timeZone:t,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(e),i=r=>{var o;return(o=a.find(l=>l.type===r))==null?void 0:o.value};return`${i("year")}-${i("month")}-${i("day")}`}function Yr(e,t){try{const a=new Date(e),i=a.toLocaleDateString(R(),{timeZone:t,month:"numeric",day:"numeric",weekday:"short"}),r=a.toLocaleTimeString(R(),{timeZone:t,hour:"2-digit",minute:"2-digit",hour12:!1});return{datePart:i,timePart:r}}catch{return{datePart:"—",timePart:""}}}function Kr(e){try{return new Date(e).toLocaleString(R(),{timeZone:"Asia/Taipei",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1})}catch{return e||"—"}}function Zr(e,t){let a=null;for(const i of e)if(i.dayTw>=t){a=i.id;break}return a}function Xr(e,{todayTw:t,nextId:a,timeZone:i}){const r=n(Gr(e)),{datePart:o,timePart:l}=Yr(e.scheduledAt,i),c=e.dayTw===t,u=e.id===a,d=e.dayTw<t,p=["macro-chip",e.highImpact||e.importance==="high"?"macro-chip--high":"",c?"macro-chip--today":"",u&&!c?"macro-chip--next":"",d?"macro-chip--past":""].filter(Boolean).join(" "),h=[];c?h.push(`<span class="macro-chip-tag">${n(s("macroToday"))}</span>`):u&&h.push(`<span class="macro-chip-tag macro-chip-tag--next">${n(s("macroNext"))}</span>`),(e.highImpact||e.importance==="high")&&h.push(`<span class="macro-chip-tag macro-chip-tag--high">${n(s("macroHighImpact"))}</span>`);const g=[e.eventName,e.periodLabel,`${e.dayTw} ${l} 台北`,e.officialUrl?"↗ official":null].filter(Boolean).join(" · "),k=`
      <span class="macro-chip-when">${l?`${n(o)} ${n(l)}`:n(o)}</span>
      <span class="macro-chip-name">${r}</span>
      ${h.length?`<span class="macro-chip-tags">${h.join("")}</span>`:""}`,T=typeof e.officialUrl=="string"&&/^https?:\/\//i.test(e.officialUrl)?e.officialUrl:null;return T?`
    <a class="${p}" href="${n(T)}" target="_blank" rel="noopener noreferrer"
       title="${n(g)}" data-event-id="${n(e.id)}">${k}
    </a>`:`
    <span class="${p}" title="${n(g)}" data-event-id="${n(e.id)}">${k}
    </span>`}function Qr(e){const t=e.querySelector(".index-marquee");if(!t||t.dataset.marqueeBound==="1")return;t.dataset.marqueeBound="1";const a=()=>t.classList.add("is-paused"),i=()=>t.classList.remove("is-paused");t.addEventListener("pointerdown",a),t.addEventListener("pointerup",i),t.addEventListener("pointercancel",i),t.addEventListener("pointerleave",i),t.addEventListener("touchstart",a,{passive:!0}),t.addEventListener("touchend",i,{passive:!0}),t.addEventListener("touchcancel",i,{passive:!0})}function el(e,t){if(!e)return;const a=(t==null?void 0:t.timezone)||"Asia/Taipei",i=Jr(new Date,a),r=Array.isArray(t==null?void 0:t.events)?t.events:[],o=Zr(r,i),l=(t==null?void 0:t.asOf)||null,c=l?Date.now()-Date.parse(l):NaN,u=!!(t!=null&&t.stale)||!Number.isNaN(c)&&c>Vr;let d=`${n(s("twMacroTz"))}`;if(l&&(d+=` · ${n(s("macroAsOf"))} ${n(Kr(l))}`),u&&(d+=` · ${n(s("macroStale"))}`),!r.length){e.innerHTML=`
      <div class="macro-strip" role="region" aria-label="${n(s("twMacroTitle"))}">
        <div class="macro-strip-side">
          <span class="macro-strip-label">${n(s("twMacroTitle"))}</span>
          <span class="macro-strip-meta">${d}</span>
        </div>
        <p class="macro-strip-empty">${n(s("twMacroEmpty"))}</p>
      </div>`;return}const p=r.map(f=>Xr(f,{todayTw:i,nextId:o,timeZone:a})),h=`<div class="index-marquee-group">${p.join("")}</div>`,g=`<div class="index-marquee-group index-marquee-group--clone" aria-hidden="true" inert>${p.join("").replace(/<a /g,'<a tabindex="-1" ')}</div>`;e.innerHTML=`
    <div class="macro-strip" role="region" aria-label="${n(s("twMacroTitle"))}">
      <div class="macro-strip-side">
        <span class="macro-strip-label">${n(s("twMacroTitle"))}</span>
        <span class="macro-strip-meta" title="${d}">${d}</span>
      </div>
      <div class="index-strip index-strip--marquee macro-strip-marquee">
        <div class="index-marquee" tabindex="0">
          <div class="index-marquee-track">
            ${h}
            ${g}
          </div>
        </div>
      </div>
    </div>`,Qr(e)}function tl(){return'<div id="tw-macro-strip" class="tw-macro-strip-host" aria-live="polite"></div>'}async function al(e=!1){const t=e?`${Qa}?t=${Date.now()}`:Qa,a=await fetch(t,{cache:e?"no-store":"default"});if(!a.ok)throw new Error(`HTTP ${a.status}`);return a.json()}async function sl(e="#tw-macro-strip"){const t=typeof e=="string"?document.querySelector(e):e;if(!t)return{ok:!1};const a=async r=>{try{const o=await al(r);return el(t,o),{ok:!0,data:o}}catch(o){return t.innerHTML=`
        <div class="macro-strip macro-strip--error" role="status">
          <div class="macro-strip-side">
            <span class="macro-strip-label">${n(s("twMacroTitle"))}</span>
          </div>
          <p class="macro-strip-empty">${n(s("twMacroLoadError",{msg:o.message||String(o)}))}</p>
        </div>`,{ok:!1,error:o}}},i=await a(!1);return Ye&&(window.clearInterval(Ye),Ye=null),Ye=window.setInterval(()=>{a(!0)},Fr),i}const nl="https://www.youtube.com/watch?v=7n-e5pe6z4U",il=[1,2,3,4,5,6,7,8,9,10],rl=[1,2,3,4,5,6],ll=[1,2,3,4],ol=[1,2,3];function cl(){return`
    <div class="gz-badges" role="list">
      <span class="gz-badge gz-badge-candidate" role="listitem">${n(s("godzillaBadgeCandidate"))}</span>
      <span class="gz-badge gz-badge-watch" role="listitem">${n(s("godzillaBadgeWatch"))}</span>
      <span class="gz-badge gz-badge-us" role="listitem">${n(s("godzillaUsFocus"))}</span>
      <span class="gz-badge gz-badge-self" role="listitem">${n(s("godzillaSelfReport"))}</span>
      <span class="gz-badge gz-badge-listened" role="listitem">${n(s("godzillaListenedBadge"))}</span>
    </div>`}function dl(){return il.map(e=>{const t=s(`godzillaThesis${e}Title`),a=s(`godzillaThesis${e}Body`);return`
      <article class="gz-card" data-thesis="${e}">
        <div class="gz-card-num" aria-hidden="true">${e}</div>
        <div class="gz-card-body">
          <h3 class="gz-card-title">${n(t)}</h3>
          <p class="gz-card-text">${n(a)}</p>
        </div>
      </article>`}).join("")}function ul(){return`
    <ul class="gz-check-list">
      ${rl.map(e=>`<li class="gz-check-item">
          <span class="gz-check-mark" aria-hidden="true">✓</span>
          <span>${n(s(`godzillaCheck${e}`))}</span>
        </li>`).join("")}
    </ul>`}function pl(){return`
    <ul class="gz-bullet-list">
      ${ll.map(e=>`<li>${n(s(`godzillaOpt${e}`))}</li>`).join("")}
    </ul>`}function hl(){return`
    <ul class="gz-bullet-list">
      ${ol.map(e=>`<li>${n(s(`godzillaRsu${e}`))}</li>`).join("")}
    </ul>`}function gl(e){e.innerHTML=`
    <section class="gz-hero" aria-label="${n(s("godzillaHeroLabel"))}">
      <div class="gz-hero-main">
        <h3 class="gz-hero-kicker">${n(s("godzillaKicker"))}</h3>
        <p class="gz-hero-tagline">${n(s("godzillaTagline"))}</p>
        ${cl()}
        <p class="gz-source">
          <span class="gz-source-label">${n(s("godzillaSourceLabel"))}</span>
          <a class="gz-yt" href="${nl}" target="_blank" rel="noopener noreferrer">${n(s("godzillaYoutube"))}</a>
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
        ${dl()}
      </div>
    </section>

    <section class="gz-panel" aria-label="${n(s("godzillaChecklistTitle"))}">
      <h3 class="gz-h3">${n(s("godzillaChecklistTitle"))}</h3>
      <p class="gz-panel-lead">${n(s("godzillaChecklistLead"))}</p>
      ${ul()}
    </section>

    <div class="gz-two-col">
      <section class="gz-panel" aria-label="${n(s("godzillaOptionsTitle"))}">
        <h3 class="gz-h3">${n(s("godzillaOptionsTitle"))}</h3>
        <p class="gz-panel-lead">${n(s("godzillaOptionsLead"))}</p>
        ${pl()}
      </section>
      <section class="gz-panel" aria-label="${n(s("godzillaRsuTitle"))}">
        <h3 class="gz-h3">${n(s("godzillaRsuTitle"))}</h3>
        <p class="gz-panel-lead">${n(s("godzillaRsuLead"))}</p>
        ${hl()}
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
  `}function fl(e="#gz-root"){const t=typeof e=="string"?document.querySelector(e):e;return t?(gl(t),{ok:!0}):{ok:!1}}const ze={id:"Xn1EsFe7snQ",watchUrl:"https://www.youtube.com/watch?v=Xn1EsFe7snQ",thumbUrl:"https://i.ytimg.com/vi/Xn1EsFe7snQ/hqdefault.jpg"},ml="https://ecorner.stanford.edu",yl=[1,2,3,4,5];function vl(){return`
    <div class="jh-badges" role="list">
      <span class="jh-badge jh-badge-candidate" role="listitem">${n(s("godzillaBadgeCandidate"))}</span>
      <span class="jh-badge jh-badge-watch" role="listitem">${n(s("godzillaBadgeWatch"))}</span>
      <span class="jh-badge jh-badge-us" role="listitem">${n(s("jensenUsFocus"))}</span>
      <span class="jh-badge jh-badge-talk" role="listitem">${n(s("jensenTalkBadge"))}</span>
      <span class="jh-badge jh-badge-listened" role="listitem">${n(s("jensenListenedBadge"))}</span>
    </div>`}function $l(){return yl.map(e=>{const t=s(`jensenH${e}Title`),a=s(`jensenH${e}Body`);return`
      <article class="jh-card" data-highlight="${e}">
        <div class="jh-card-num" aria-hidden="true">${e}</div>
        <div class="jh-card-body">
          <h4 class="jh-card-title">${n(t)}</h4>
          <p class="jh-card-text">${n(a)}</p>
        </div>
      </article>`}).join("")}function bl(){const e=s("jensenEmbedTitle");return`
    <div class="jh-yt-card" data-yt-id="${n(ze.id)}" data-embed-allowed="false">
      <a class="jh-yt-card-media" href="${ze.watchUrl}" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true">
        <img
          class="jh-yt-card-thumb"
          src="${ze.thumbUrl}"
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
          href="${ze.watchUrl}"
          target="_blank"
          rel="noopener noreferrer"
        >${n(s("jensenWatchCta"))}</a>
      </div>
    </div>`}function kl(){return bl()}function Sl(e){e.innerHTML=`
    <section class="jh-hero" aria-label="${n(s("jensenHeroLabel"))}">
      <div class="jh-hero-main">
        <h3 class="jh-hero-kicker">${n(s("jensenKicker"))}</h3>
        <p class="jh-hero-tagline">${n(s("jensenTagline"))}</p>
        ${vl()}
        <p class="jh-meta">${n(s("jensenMeta"))}</p>
        <p class="jh-source">
          <span class="jh-source-label">${n(s("godzillaSourceLabel"))}</span>
          <a class="jh-yt" href="${ze.watchUrl}" target="_blank" rel="noopener noreferrer">${n(s("jensenYoutube"))}</a>
          <span class="jh-source-cite">· ${n(s("jensenSourceCite"))}</span>
        </p>
        <p class="jh-source jh-source-alt">
          <a class="jh-yt" href="${ml}" target="_blank" rel="noopener noreferrer">${n(s("jensenEcorner"))}</a>
        </p>
      </div>
    </section>

    ${kl()}


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
        ${$l()}
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
  `}function Tl(e="#jh-root"){const t=typeof e=="string"?document.querySelector(e):e;return t?(Sl(t),{ok:!0}):{ok:!1}}const wl="./data/gooaye-episodes.json",qe=25,Pl="#research/podcast",es="https://podcasts.apple.com/tw/podcast/gooaye-%E8%82%A1%E7%99%8C/id1500839292";let Ke=null,we=null,ct=qe,Tt="";async function xl(){return Ke||we||(we=(async()=>{const e=await fetch(wl,{cache:"no-cache"});if(!e.ok)throw new Error(`HTTP ${e.status}`);return Ke=await e.json(),Ke})().catch(e=>{throw we=null,e}),we)}function Ll(e){if(!e)return"";try{const t=new Date(e);return Number.isNaN(t.getTime())?e:new Intl.DateTimeFormat(void 0,{timeZone:"Asia/Taipei",year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(t)}catch{return e}}function jl(e){return(e==null?void 0:e.notesQuality)==="listened"&&Array.isArray(e.stockAnalysis)&&e.stockAnalysis.length>0}function Cl(e){const t=(e==null?void 0:e.episodes)||[],a=Tt.trim().toLowerCase();return a?t.filter(i=>[i.title,i.subtitle,i.ep!=null?`ep${i.ep}`:"",i.ep!=null?String(i.ep):"",...i.stockAnalysis||[],...i.keyPoints||[],...i.rssTeaser||[]].filter(Boolean).join(`
`).toLowerCase().includes(a)):t}function zl(e){const t=jl(e),a=e.ep!=null?`<span class="gy-ep-num">EP${n(String(e.ep))}</span>`:"",i=e.pubDateTw?`<time class="gy-ep-date" datetime="${n(e.pubDateIso||e.pubDateTw)}">${n(e.pubDateTw)}</time>`:"",r=t?`<span class="gy-ep-badge gy-ep-badge-listened">${n(s("gooayeBadgeListened"))}</span>`:`<span class="gy-ep-badge gy-ep-badge-rss">${n(s("gooayeBadgeRssOnly"))}</span>`,o=e.title||(e.ep!=null?`EP${e.ep}`:s("gooayeUntitled"));let l="";if(t){const u=(e.stockAnalysis||[]).filter(Boolean);l+=`<p class="gy-ep-kicker gy-ep-kicker-stock">${n(s("gooayeStockAnalysis"))}</p>`,l+=`<ul class="gy-ep-points gy-ep-stock">${u.map(p=>`<li>${n(p)}</li>`).join("")}</ul>`;const d=(e.rssTeaser||e.keyPoints||[]).filter(Boolean);if(d.length&&(l+=`<details class="gy-ep-rss-details"><summary>${n(s("gooayeRssTeaserToggle"))}</summary>`,l+=`<ul class="gy-ep-points gy-ep-rss">${d.map(p=>`<li>${n(p)}</li>`).join("")}</ul></details>`),e.listenedAt||e.transcriptSource){const p=[];e.listenedAt&&p.push(s("gooayeListenedAt",{date:String(e.listenedAt).slice(0,16).replace("T"," ")})),e.transcriptSource&&p.push(String(e.transcriptSource)),l+=`<p class="gy-ep-source-note">${n(p.join(" · "))}</p>`}}else{const u=(e.keyPoints||[]).filter(Boolean),d=e.notesQuality==="teaser"&&u.length>0&&u.length<=2;l+=`<p class="gy-ep-kicker">${n(s(d?"gooayeTeaserKicker":"gooayeKeyPoints"))}</p>`,u.length?l+=`<ul class="gy-ep-points">${u.map(h=>`<li>${n(h)}</li>`).join("")}</ul>`:l+=`<p class="gy-ep-empty">${n(s("gooayeNotesThin"))}</p>`;const p=e.notesQuality==="teaser"||e.notesQuality==="title-only"||!u.length?`<p class="gy-ep-source-note">${n(s("gooayeTeaserNote"))}</p>`:`<p class="gy-ep-source-note">${n(s("gooayeRssOnlyNote"))}</p>`;l+=p}const c=e.link?`<a class="gy-ep-link" href="${n(e.link)}" target="_blank" rel="noopener noreferrer">${n(s("gooayeListen"))}</a>`:"";return`
    <article class="gy-ep${t?" gy-ep-listened":" gy-ep-rss-only"}" data-ep="${n(String(e.ep??""))}" data-quality="${n(t?"listened":"rss-only")}">
      <header class="gy-ep-head">
        <div class="gy-ep-meta">${a}${r}${i}</div>
        <h4 class="gy-ep-title">${n(o)}</h4>
      </header>
      <div class="gy-ep-body">
        ${l}
        <div class="gy-ep-actions">${c}</div>
      </div>
    </article>`}function wt(e,t,{error:a}={}){var h;if(a){e.innerHTML=`
      <div class="gy-error" role="alert">
        <p>${n(s("gooayeLoadError",{msg:String(a.message||a)}))}</p>
        <a class="pc-link pc-link-ext" href="${es}" target="_blank" rel="noopener noreferrer">${n(s("podcastsGooayeApple"))}</a>
      </div>`;return}const i=Cl(t),r=(t.episodes||[]).length,o=i.slice(0,ct),l=Math.max(0,i.length-o.length),c=Ll(t.asOf),u=t.counts||{};e.innerHTML=`
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
          value="${n(Tt)}" autocomplete="off" />
      </label>
    </div>

    <p class="gy-source-line">
      ${n(s("gooayeSourceLine"))}
      <a class="pc-link pc-link-ext" href="${n(((h=t.show)==null?void 0:h.feedUrl)||"")}" target="_blank" rel="noopener noreferrer">SoundOn RSS</a>
      ·
      <a class="pc-link pc-link-ext" href="${es}" target="_blank" rel="noopener noreferrer">${n(s("podcastsGooayeApple"))}</a>
      ·
      <a class="pc-link" href="${Pl}">${n(s("podcastsGotoResearch"))}</a>
    </p>

    <div class="gy-list" role="list">
      ${o.length?o.map(zl).join(""):`<p class="gy-empty">${n(s("gooayeNoResults"))}</p>`}
    </div>

    <div class="gy-pager">
      ${l>0?`<button type="button" class="gy-load-more" data-gy-more>
              ${n(s("gooayeLoadMore",{n:String(Math.min(qe,l)),left:String(l)}))}
            </button>`:i.length?`<p class="gy-pager-done">${n(s("gooayeShowingAll",{n:String(i.length)}))}</p>`:""}
    </div>`;const d=e.querySelector("[data-gy-search]");if(d){let g=null;d.addEventListener("input",()=>{clearTimeout(g),g=setTimeout(()=>{Tt=d.value||"",ct=qe,wt(e,t)},180)})}const p=e.querySelector("[data-gy-more]");p&&p.addEventListener("click",()=>{ct+=qe,wt(e,t)})}function Al(){return`
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
    </article>`}function El(){return Al()}async function Dl(e="#gy-root"){var a;const t=typeof e=="string"?document.querySelector(e):e;if(!t)return{ok:!1,reason:"missing-root"};ct=qe,Tt="";try{const i=await xl();return t.setAttribute("aria-busy","false"),wt(t,i),{ok:!0,count:((a=i.episodes)==null?void 0:a.length)||0}}catch(i){return t.setAttribute("aria-busy","false"),wt(t,null,{error:i}),{ok:!1,reason:String((i==null?void 0:i.message)||i)}}}const ql="./data/xiaojun-episodes.json",Me=25,Ml="#research/podcast",ts="https://podcasts.apple.com/tw/podcast/%E5%BC%A0%E5%B0%8F%E7%8F%BAj%C3%B9n-%E5%95%86%E4%B8%9A%E8%AE%BF%E8%B0%88%E5%BD%95/id1634356920";let Ze=null,Pe=null,dt=Me,Pt="";async function Nl(){return Ze||Pe||(Pe=(async()=>{const e=await fetch(ql,{cache:"no-cache"});if(!e.ok)throw new Error(`HTTP ${e.status}`);return Ze=await e.json(),Ze})().catch(e=>{throw Pe=null,e}),Pe)}function Rl(e){if(!e)return"";try{const t=new Date(e);return Number.isNaN(t.getTime())?e:new Intl.DateTimeFormat(void 0,{timeZone:"Asia/Taipei",year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(t)}catch{return e}}function Ol(e){return(e==null?void 0:e.notesQuality)==="listened"&&Array.isArray(e.stockAnalysis)&&e.stockAnalysis.length>0}function Bl(e){const t=(e==null?void 0:e.episodes)||[],a=Pt.trim().toLowerCase();return a?t.filter(i=>[i.title,i.subtitle,i.ep!=null?`ep${i.ep}`:"",i.ep!=null?String(i.ep):"",...i.stockAnalysis||[],...i.keyPoints||[],...i.rssTeaser||[]].filter(Boolean).join(`
`).toLowerCase().includes(a)):t}function Hl(e){const t=Ol(e),a=e.ep!=null?`<span class="xj-ep-num">EP${n(String(e.ep))}</span>`:"",i=e.pubDateTw?`<time class="xj-ep-date" datetime="${n(e.pubDateIso||e.pubDateTw)}">${n(e.pubDateTw)}</time>`:"",r=t?`<span class="xj-ep-badge xj-ep-badge-listened">${n(s("xiaojunBadgeListened"))}</span>`:`<span class="xj-ep-badge xj-ep-badge-rss">${n(s("xiaojunBadgeRssOnly"))}</span>`,o=e.title||(e.ep!=null?`EP${e.ep}`:s("xiaojunUntitled"));let l="";if(t){const u=(e.stockAnalysis||[]).filter(Boolean);l+=`<p class="xj-ep-kicker xj-ep-kicker-stock">${n(s("xiaojunStockAnalysis"))}</p>`,l+=`<ul class="xj-ep-points xj-ep-stock">${u.map(p=>`<li>${n(p)}</li>`).join("")}</ul>`;const d=(e.rssTeaser||e.keyPoints||[]).filter(Boolean);if(d.length&&(l+=`<details class="xj-ep-rss-details"><summary>${n(s("xiaojunRssTeaserToggle"))}</summary>`,l+=`<ul class="xj-ep-points xj-ep-rss">${d.map(p=>`<li>${n(p)}</li>`).join("")}</ul></details>`),e.listenedAt||e.transcriptSource){const p=[];e.listenedAt&&p.push(s("xiaojunListenedAt",{date:String(e.listenedAt).slice(0,16).replace("T"," ")})),e.transcriptSource&&p.push(String(e.transcriptSource)),l+=`<p class="xj-ep-source-note">${n(p.join(" · "))}</p>`}}else{const u=(e.keyPoints||[]).filter(Boolean);l+=`<p class="xj-ep-kicker">${n(s("xiaojunKeyPoints"))}</p>`,u.length?l+=`<ul class="xj-ep-points">${u.map(p=>`<li>${n(p)}</li>`).join("")}</ul>`:l+=`<p class="xj-ep-empty">${n(s("xiaojunNotesThin"))}</p>`;const d=e.notesQuality==="teaser"||e.notesQuality==="title-only"||!u.length?`<p class="xj-ep-source-note">${n(s("xiaojunTeaserNote"))}</p>`:`<p class="xj-ep-source-note">${n(s("xiaojunRssOnlyNote"))}</p>`;l+=d}const c=e.link?`<a class="xj-ep-link" href="${n(e.link)}" target="_blank" rel="noopener noreferrer">${n(s("xiaojunListen"))}</a>`:"";return`
    <article class="xj-ep${t?" xj-ep-listened":" xj-ep-rss-only"}" data-ep="${n(String(e.ep??""))}" data-quality="${n(t?"listened":"rss-only")}">
      <header class="xj-ep-head">
        <div class="xj-ep-meta">${a}${r}${i}</div>
        <h4 class="xj-ep-title">${n(o)}</h4>
      </header>
      <div class="xj-ep-body">
        ${l}
        <div class="xj-ep-actions">${c}</div>
      </div>
    </article>`}function xt(e,t,{error:a}={}){var h;if(a){e.innerHTML=`
      <div class="xj-error" role="alert">
        <p>${n(s("xiaojunLoadError",{msg:String(a.message||a)}))}</p>
        <a class="pc-link pc-link-ext" href="${ts}" target="_blank" rel="noopener noreferrer">${n(s("podcastsXiaojunApple"))}</a>
      </div>`;return}const i=Bl(t),r=(t.episodes||[]).length,o=i.slice(0,dt),l=Math.max(0,i.length-o.length),c=Rl(t.asOf),u=t.counts||{};e.innerHTML=`
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
          value="${n(Pt)}" autocomplete="off" />
      </label>
    </div>

    <p class="xj-source-line">
      ${n(s("xiaojunSourceLine"))}
      <a class="pc-link pc-link-ext" href="${n(((h=t.show)==null?void 0:h.feedUrl)||"")}" target="_blank" rel="noopener noreferrer">SoundOn RSS</a>
      ·
      <a class="pc-link pc-link-ext" href="${ts}" target="_blank" rel="noopener noreferrer">${n(s("podcastsXiaojunApple"))}</a>
      ·
      <a class="pc-link" href="${Ml}">${n(s("podcastsGotoResearch"))}</a>
    </p>

    <div class="xj-list" role="list">
      ${o.length?o.map(Hl).join(""):`<p class="xj-empty">${n(s("xiaojunNoResults"))}</p>`}
    </div>

    <div class="xj-pager">
      ${l>0?`<button type="button" class="xj-load-more" data-xj-more>
              ${n(s("xiaojunLoadMore",{n:String(Math.min(Me,l)),left:String(l)}))}
            </button>`:i.length?`<p class="xj-pager-done">${n(s("xiaojunShowingAll",{n:String(i.length)}))}</p>`:""}
    </div>`;const d=e.querySelector("[data-xj-search]");if(d){let g=null;d.addEventListener("input",()=>{clearTimeout(g),g=setTimeout(()=>{Pt=d.value||"",dt=Me,xt(e,t)},180)})}const p=e.querySelector("[data-xj-more]");p&&p.addEventListener("click",()=>{dt+=Me,xt(e,t)})}function _l(){return`
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
    </article>`}function Ul(){return _l()}async function Il(e="#xj-root"){var a;const t=typeof e=="string"?document.querySelector(e):e;if(!t)return{ok:!1,reason:"missing-root"};dt=Me,Pt="";try{const i=await Nl();return t.setAttribute("aria-busy","false"),xt(t,i),{ok:!0,count:((a=i.episodes)==null?void 0:a.length)||0}}catch(i){return t.setAttribute("aria-busy","false"),xt(t,null,{error:i}),{ok:!1,reason:String((i==null?void 0:i.message)||i)}}}const Wl="./data/whynottv-episodes.json",Ne=25,Fl="#research/podcast",as="https://podcasts.apple.com/tw/podcast/whynottv-podcast/id1824936911";let Xe=null,xe=null,ut=Ne,Lt="";async function Vl(){return Xe||xe||(xe=(async()=>{const e=await fetch(Wl,{cache:"no-cache"});if(!e.ok)throw new Error(`HTTP ${e.status}`);return Xe=await e.json(),Xe})().catch(e=>{throw xe=null,e}),xe)}function Gl(e){if(!e)return"";try{const t=new Date(e);return Number.isNaN(t.getTime())?e:new Intl.DateTimeFormat(void 0,{timeZone:"Asia/Taipei",year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(t)}catch{return e}}function Jl(e){return(e==null?void 0:e.notesQuality)==="listened"&&Array.isArray(e.stockAnalysis)&&e.stockAnalysis.length>0}function Yl(e){const t=(e==null?void 0:e.episodes)||[],a=Lt.trim().toLowerCase();return a?t.filter(i=>[i.title,i.subtitle,i.ep!=null?`ep${i.ep}`:"",i.ep!=null?String(i.ep):"",...i.stockAnalysis||[],...i.keyPoints||[],...i.rssTeaser||[]].filter(Boolean).join(`
`).toLowerCase().includes(a)):t}function Kl(e){const t=Jl(e),a=e.ep!=null?`<span class="wn-ep-num">EP${n(String(e.ep))}</span>`:"",i=e.pubDateTw?`<time class="wn-ep-date" datetime="${n(e.pubDateIso||e.pubDateTw)}">${n(e.pubDateTw)}</time>`:"",r=t?`<span class="wn-ep-badge wn-ep-badge-listened">${n(s("whynottvBadgeListened"))}</span>`:`<span class="wn-ep-badge wn-ep-badge-rss">${n(s("whynottvBadgeRssOnly"))}</span>`,o=e.title||(e.ep!=null?`EP${e.ep}`:s("whynottvUntitled"));let l="";if(t){const u=(e.stockAnalysis||[]).filter(Boolean);l+=`<p class="wn-ep-kicker wn-ep-kicker-stock">${n(s("whynottvStockAnalysis"))}</p>`,l+=`<ul class="wn-ep-points wn-ep-stock">${u.map(p=>`<li>${n(p)}</li>`).join("")}</ul>`;const d=(e.rssTeaser||e.keyPoints||[]).filter(Boolean);if(d.length&&(l+=`<details class="wn-ep-rss-details"><summary>${n(s("whynottvRssTeaserToggle"))}</summary>`,l+=`<ul class="wn-ep-points wn-ep-rss">${d.map(p=>`<li>${n(p)}</li>`).join("")}</ul></details>`),e.listenedAt||e.transcriptSource){const p=[];e.listenedAt&&p.push(s("whynottvListenedAt",{date:String(e.listenedAt).slice(0,16).replace("T"," ")})),e.transcriptSource&&p.push(String(e.transcriptSource)),l+=`<p class="wn-ep-source-note">${n(p.join(" · "))}</p>`}}else{const u=(e.keyPoints||[]).filter(Boolean);l+=`<p class="wn-ep-kicker">${n(s("whynottvKeyPoints"))}</p>`,u.length?l+=`<ul class="wn-ep-points">${u.map(p=>`<li>${n(p)}</li>`).join("")}</ul>`:l+=`<p class="wn-ep-empty">${n(s("whynottvNotesThin"))}</p>`;const d=e.notesQuality==="teaser"||e.notesQuality==="title-only"||!u.length?`<p class="wn-ep-source-note">${n(s("whynottvTeaserNote"))}</p>`:`<p class="wn-ep-source-note">${n(s("whynottvRssOnlyNote"))}</p>`;l+=d}const c=e.link?`<a class="wn-ep-link" href="${n(e.link)}" target="_blank" rel="noopener noreferrer">${n(s("whynottvListen"))}</a>`:"";return`
    <article class="wn-ep${t?" wn-ep-listened":" wn-ep-rss-only"}" data-ep="${n(String(e.ep??""))}" data-quality="${n(t?"listened":"rss-only")}">
      <header class="wn-ep-head">
        <div class="wn-ep-meta">${a}${r}${i}</div>
        <h4 class="wn-ep-title">${n(o)}</h4>
      </header>
      <div class="wn-ep-body">
        ${l}
        <div class="wn-ep-actions">${c}</div>
      </div>
    </article>`}function jt(e,t,{error:a}={}){var h;if(a){e.innerHTML=`
      <div class="wn-error" role="alert">
        <p>${n(s("whynottvLoadError",{msg:String(a.message||a)}))}</p>
        <a class="pc-link pc-link-ext" href="${as}" target="_blank" rel="noopener noreferrer">${n(s("podcastsWhynottvApple"))}</a>
      </div>`;return}const i=Yl(t),r=(t.episodes||[]).length,o=i.slice(0,ut),l=Math.max(0,i.length-o.length),c=Gl(t.asOf),u=t.counts||{};e.innerHTML=`
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
          value="${n(Lt)}" autocomplete="off" />
      </label>
    </div>

    <p class="wn-source-line">
      ${n(s("whynottvSourceLine"))}
      <a class="pc-link pc-link-ext" href="${n(((h=t.show)==null?void 0:h.feedUrl)||"")}" target="_blank" rel="noopener noreferrer">SoundOn RSS</a>
      ·
      <a class="pc-link pc-link-ext" href="${as}" target="_blank" rel="noopener noreferrer">${n(s("podcastsWhynottvApple"))}</a>
      ·
      <a class="pc-link" href="${Fl}">${n(s("podcastsGotoResearch"))}</a>
    </p>

    <div class="wn-list" role="list">
      ${o.length?o.map(Kl).join(""):`<p class="wn-empty">${n(s("whynottvNoResults"))}</p>`}
    </div>

    <div class="wn-pager">
      ${l>0?`<button type="button" class="wn-load-more" data-wn-more>
              ${n(s("whynottvLoadMore",{n:String(Math.min(Ne,l)),left:String(l)}))}
            </button>`:i.length?`<p class="wn-pager-done">${n(s("whynottvShowingAll",{n:String(i.length)}))}</p>`:""}
    </div>`;const d=e.querySelector("[data-wn-search]");if(d){let g=null;d.addEventListener("input",()=>{clearTimeout(g),g=setTimeout(()=>{Lt=d.value||"",ut=Ne,jt(e,t)},180)})}const p=e.querySelector("[data-wn-more]");p&&p.addEventListener("click",()=>{ut+=Ne,jt(e,t)})}function Zl(){return`
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
    </article>`}function Xl(){return Zl()}async function Ql(e="#wn-root"){var a;const t=typeof e=="string"?document.querySelector(e):e;if(!t)return{ok:!1,reason:"missing-root"};ut=Ne,Lt="";try{const i=await Vl();return t.setAttribute("aria-busy","false"),jt(t,i),{ok:!0,count:((a=i.episodes)==null?void 0:a.length)||0}}catch(i){return t.setAttribute("aria-busy","false"),jt(t,null,{error:i}),{ok:!1,reason:String((i==null?void 0:i.message)||i)}}}const eo="./data/zhang-junan-posts.json",re=25,ss="https://et220870.blogspot.com/",to="https://www.pttweb.cc/user/et220870";let Qe=null,Le=null,fe=re,Ct="",ve="all",$e="all";async function ao(){return Qe||Le||(Le=(async()=>{const e=await fetch(eo,{cache:"no-cache"});if(!e.ok)throw new Error(`HTTP ${e.status}`);return Qe=await e.json(),Qe})().catch(e=>{throw Le=null,e}),Le)}function so(e){if(!e)return"";try{const t=new Date(e);return Number.isNaN(t.getTime())?e:new Intl.DateTimeFormat(void 0,{timeZone:"Asia/Taipei",year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(t)}catch{return e}}function no(e){if(!e)return"";try{const t=new Date(e);return Number.isNaN(t.getTime())?String(e).slice(0,10):new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Taipei",year:"numeric",month:"2-digit",day:"2-digit"}).format(t)}catch{return String(e).slice(0,10)}}function io(e){return(e==null?void 0:e.analysisQuality)==="analyzed"&&Array.isArray(e.analysis)&&e.analysis.length>0}function ro(e,t){const a=new Set;for(const i of e)t!=="all"&&i.source!==t||i.series&&a.add(i.series);return["all",...[...a].sort((i,r)=>i.localeCompare(r,"zh-Hant"))]}function lo(e){const t=(e==null?void 0:e.posts)||[],a=Ct.trim().toLowerCase();return t.filter(i=>ve!=="all"&&i.source!==ve||$e!=="all"&&i.series!==$e?!1:a?[i.title,i.series,i.board,i.source,...i.analysis||[],i.commentSummary||""].filter(Boolean).join(`
`).toLowerCase().includes(a):!0)}function oo(e){const t=io(e),a=no(e.publishedAt),i=a?`<time class="zj-ep-date" datetime="${n(e.publishedAt||a)}">${n(a)}</time>`:"",r=t?`<span class="zj-ep-badge zj-ep-badge-analyzed">${n(s("zhangJunanBadgeAnalyzed"))}</span>`:`<span class="zj-ep-badge zj-ep-badge-title">${n(s("zhangJunanBadgeTitleOnly"))}</span>`,o=e.source==="blog"?`<span class="zj-ep-badge">${n(s("zhangJunanSourceBlog"))}</span>`:`<span class="zj-ep-badge">${n(s("zhangJunanSourcePtt"))}</span>`,l=e.source==="ptt"&&e.board?`<span class="zj-ep-board">[${n(e.board)}]</span>`:"",c=e.series?`<span class="zj-ep-badge">${n(e.series)}</span>`:"";let u="";u+=`<p class="zj-ep-kicker zj-ep-kicker-stock">${n(s(t?"zhangJunanStockAnalysis":"zhangJunanKeyPoints"))}</p>`;const d=(e.analysis||[]).filter(Boolean);d.length?u+=`<ul class="zj-ep-points${t?" zj-ep-stock":""}">${d.map(g=>`<li>${n(g)}</li>`).join("")}</ul>`:u+=`<p class="zj-ep-empty">${n(s("zhangJunanNotesThin"))}</p>`,t||(u+=`<p class="zj-ep-source-note">${n(s("zhangJunanTitleOnlyNote"))}</p>`),e.commentSummary&&(u+=`<div class="zj-ep-comments"><div class="zj-ep-comments-label">${n(s("zhangJunanCommentSummary"))}</div><div>${n(e.commentSummary)}</div></div>`);const p=e.source==="blog"?s("zhangJunanOpenBlog"):s("zhangJunanOpenPtt"),h=e.url?`<a class="zj-ep-link" href="${n(e.url)}" target="_blank" rel="noopener noreferrer">${n(p)}</a>`:"";return`
    <article class="zj-ep${t?" zj-ep-listened":" zj-ep-rss-only"}" data-id="${n(e.id)}" data-quality="${n(t?"analyzed":"title-only")}">
      <header class="zj-ep-head">
        <div class="zj-ep-meta">${o}${c}${r}${i}</div>
        <h4 class="zj-ep-title">${l}${n(e.title||s("zhangJunanUntitled"))}</h4>
      </header>
      <div class="zj-ep-body">
        ${u}
        <div class="zj-ep-actions">${h}</div>
      </div>
    </article>`}function ye(e,t,{error:a}={}){var k;if(a){e.innerHTML=`
      <div class="zj-error" role="alert">
        <p>${n(s("zhangJunanLoadError",{msg:String(a.message||a)}))}</p>
        <a class="pc-link pc-link-ext" href="${ss}" target="_blank" rel="noopener noreferrer">${n(s("zhangJunanOpenBlog"))}</a>
      </div>`;return}const i=lo(t),r=(t.posts||[]).length,o=i.slice(0,fe),l=Math.max(0,i.length-o.length),c=so(t.asOf),u=t.counts||{},d=ro(t.posts||[],ve),p=[{id:"all",label:s("zhangJunanFilterAll")},{id:"blog",label:s("zhangJunanFilterBlog")},{id:"ptt",label:s("zhangJunanFilterPtt")}].map(T=>`<button type="button" class="zj-subtab${ve===T.id?" is-active":""}" data-zj-source="${T.id}">${n(T.label)}</button>`).join(""),h=d.map(T=>{const w=T==="all"?s("zhangJunanFilterSeriesAll"):T;return`<button type="button" class="zj-series-tab${$e===T?" is-active":""}" data-zj-series="${n(T)}">${n(w)}</button>`}).join("");e.innerHTML=`
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
          value="${n(Ct)}" autocomplete="off" />
      </label>
    </div>

    <div class="zj-subtabs" role="tablist" aria-label="${n(s("zhangJunanSourceFilters"))}">${p}</div>
    <div class="zj-series-tabs" role="tablist" aria-label="${n(s("zhangJunanSeriesFilters"))}">${h}</div>

    <p class="zj-source-line">
      ${n(s("zhangJunanSourceLine"))}
      <a class="pc-link pc-link-ext" href="${ss}" target="_blank" rel="noopener noreferrer">Blogspot</a>
      ·
      <a class="pc-link pc-link-ext" href="${to}" target="_blank" rel="noopener noreferrer">PTT ${n(((k=t.person)==null?void 0:k.pttId)||"et220870")}</a>
    </p>

    <div class="zj-list" role="list">
      ${o.length?o.map(oo).join(""):`<p class="zj-empty">${n(s("zhangJunanNoResults"))}</p>`}
    </div>

    <div class="zj-pager">
      ${l>0?`<button type="button" class="zj-load-more" data-zj-more>
              ${n(s("zhangJunanLoadMore",{n:String(Math.min(re,l)),left:String(l)}))}
            </button>`:i.length?`<p class="zj-pager-done">${n(s("zhangJunanShowingAll",{n:String(i.length)}))}</p>`:""}
    </div>`;const g=e.querySelector("[data-zj-search]");if(g){let T=null;g.addEventListener("input",()=>{clearTimeout(T),T=setTimeout(()=>{Ct=g.value||"",fe=re,ye(e,t)},180)})}e.querySelectorAll("[data-zj-source]").forEach(T=>{T.addEventListener("click",()=>{ve=T.getAttribute("data-zj-source")||"all",$e="all",fe=re,ye(e,t)})}),e.querySelectorAll("[data-zj-series]").forEach(T=>{T.addEventListener("click",()=>{$e=T.getAttribute("data-zj-series")||"all",fe=re,ye(e,t)})});const f=e.querySelector("[data-zj-more]");f&&f.addEventListener("click",()=>{fe+=re,ye(e,t)})}function co(){return`
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
    </article>`}function uo(){return co()}async function po(e="#zj-root"){var a;const t=typeof e=="string"?document.querySelector(e):e;if(!t)return{ok:!1,reason:"missing-root"};fe=re,Ct="",ve="all",$e="all";try{const i=await ao();return t.setAttribute("aria-busy","false"),ye(t,i),{ok:!0,count:((a=i.posts)==null?void 0:a.length)||0}}catch(i){return t.setAttribute("aria-busy","false"),ye(t,null,{error:i}),{ok:!1,reason:String((i==null?void 0:i.message)||i)}}}const ha=[{id:"godzilla",titleKey:"godzillaTitle",handleKey:"podcastsGodzillaHandle",blurbKey:"godzillaLead",marketKey:"godzillaUsFocus",market:"US",featured:!0},{id:"jensen",titleKey:"jensenTitle",handleKey:"jensenHandle",blurbKey:"jensenLead",marketKey:"jensenUsFocus",market:"US",featured:!0},{id:"gooaye",titleKey:"podcastsGooayeTitle",handleKey:null,blurbKey:"podcastsGooayeLead",marketKey:"podcastsGooayeMarket",market:"TW",featured:!1},{id:"xiaojun",titleKey:"podcastsXiaojunTitle",handleKey:"podcastsXiaojunHandle",blurbKey:"podcastsXiaojunLead",marketKey:"podcastsXiaojunMarket",market:"CN",featured:!1},{id:"whynottv",titleKey:"podcastsWhynottvTitle",handleKey:"podcastsWhynottvHandle",blurbKey:"podcastsWhynottvLead",marketKey:"podcastsWhynottvMarket",market:"CN",featured:!1},{id:"zhang-junan",titleKey:"podcastsZhangJunanTitle",handleKey:"podcastsZhangJunanHandle",blurbKey:"podcastsZhangJunanLead",marketKey:"podcastsZhangJunanMarket",market:"TW",featured:!1}],et={godzilla:"godzilla","godzilla-playbook":"godzilla",playbook:"godzilla",哥吉拉:"godzilla",哥吉拉心法:"godzilla",jensen:"jensen",huang:"jensen","jensen-huang":"jensen",nvidia:"jensen","jen-hsun":"jensen",etl:"jensen",黃仁勳:"jensen",黄仁勋:"jensen",gooaye:"gooaye",股癌:"gooaye",xiaojun:"xiaojun",張小珺:"xiaojun",张小珺:"xiaojun",whynottv:"whynottv",whynot:"whynottv",WhynotTV:"whynottv","zhang-junan":"zhang-junan",zhangjunan:"zhang-junan",張濬安:"zhang-junan",张浚安:"zhang-junan",menu:"menu",all:"menu",index:"menu","":"menu"},ho=new Set(["gooaye","xiaojun","whynottv","zhang-junan"]),go="./data/podcast-latest.json",fo=7;let tt=null;function mo(){return tt||(tt=fetch(go,{cache:"no-cache"}).then(e=>e.ok?e.json():null).catch(()=>null).then(e=>(e||(tt=null),e))),tt}function yo(e){const t=/^(\d{4})-(\d{2})-(\d{2})$/.exec(e||"");return t?`${t[1]}/${t[2]}/${t[3]}`:""}function vo(e){const t=Date.parse(`${e}T00:00:00+08:00`);if(!Number.isFinite(t))return!1;const a=(Date.now()-t)/864e5;return a>=-1&&a<=fo}async function $o(e){const t=await mo(),a=t==null?void 0:t.shows;a&&e.querySelectorAll("[data-pc-latest]").forEach(i=>{const r=a[i.dataset.pcLatest],o=yo(r==null?void 0:r.latestDate);if(!r||!r.latestTitle||!o||!Number.isFinite(r.count))return;const l=r.kind==="posts",c=!l&&vo(r.latestDate);i.innerHTML=`
      <p class="pc-menu-latest-title">${c?`<span class="pc-menu-new">${n(s("podcastsNewBadge"))}</span>`:""}${n(s(l?"podcastsLatestPost":"podcastsLatestEpisode",{title:r.latestTitle}))}</p>
      <p class="pc-menu-latest-meta">${n(s(l?"podcastsLatestMetaPosts":"podcastsLatestMeta",{date:o,n:String(r.count)}))}</p>`,i.hidden=!1})}let ga="menu",Zt=null;function fa(e){if(e==null||e==="")return"menu";const t=String(e).trim(),a=t.toLowerCase();return et[a]?et[a]:et[t]?et[t]:ha.some(i=>i.id===a)?a:"menu"}function bo(){return`
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
    </article>`}function ko(){return`
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
    </article>`}function So(){return ha.map(e=>{const t=e.market==="TW"?"pc-badge-tw":e.market==="CN"?"pc-badge-cn":"pc-badge-us",a=e.featured?`<span class="pc-card-badge pc-badge-featured">${n(s("podcastsFeatured"))}</span>`:e.id==="gooaye"||e.id==="xiaojun"||e.id==="whynottv"||e.id==="zhang-junan"?`<span class="pc-card-badge pc-badge-library">${n(s(e.id==="gooaye"?"gooayeLibraryBadge":e.id==="xiaojun"?"xiaojunLibraryBadge":e.id==="whynottv"?"whynottvLibraryBadge":"zhangJunanLibraryBadge"))}</span>`:`<span class="pc-card-badge pc-badge-stub">${n(s("podcastsStubBadge"))}</span>`,i=e.handleKey?`<p class="pc-menu-handle">${n(s(e.handleKey))}</p>`:"";return`
      <button type="button" class="pc-menu-card" data-pc-cat="${n(e.id)}" aria-label="${n(s(e.titleKey))}">
        <div class="pc-menu-badges">
          ${a}
          <span class="pc-card-badge ${t}">${n(s(e.marketKey))}</span>
          <span class="pc-card-badge pc-badge-candidate">${n(s("godzillaBadgeCandidate"))}</span>
        </div>
        <h3 class="pc-menu-title">${n(s(e.titleKey))}</h3>
        ${i}
        <p class="pc-menu-blurb">${n(s(e.blurbKey))}</p>
        ${ho.has(e.id)?`<div class="pc-menu-latest" data-pc-latest="${n(e.id)}" hidden></div>`:""}
        <span class="pc-menu-cta">${n(s("podcastsOpenCategory"))}</span>
      </button>`}).join("")}function To(e){return[{id:"menu",label:s("podcastsCatMenu")},...ha.map(a=>({id:a.id,label:s(a.titleKey)}))].map(a=>`<button type="button" class="pc-tab${a.id===e?" is-active":""}" data-pc-cat="${n(a.id)}" role="tab" aria-selected="${a.id===e}">${n(a.label)}</button>`).join("")}function wo(e){return e==="godzilla"?bo():e==="jensen"?ko():e==="gooaye"?El():e==="xiaojun"?Ul():e==="whynottv"?Xl():e==="zhang-junan"?uo():`
    <div class="pc-menu" role="group" aria-label="${n(s("podcastsCatMenu"))}">
      <p class="pc-menu-lead">${n(s("podcastsMenuLead"))}</p>
      <div class="pc-menu-grid">${So()}</div>
    </div>`}function Po(e){return!e||e==="menu"?"#podcasts":`#podcasts/${e}`}function xo(e){const t=Po(e);location.hash!==t&&history.replaceState(null,"",t)}function ma(e,t,{syncUrl:a=!0}={}){const i=fa(t);ga=i,a&&xo(i),e.innerHTML=`
    <div class="pc-tabs-wrap">
      <div class="pc-tabs" role="tablist" aria-label="${n(s("podcastsCategories"))}">
        ${To(i)}
      </div>
    </div>
    <div class="pc-panel" role="tabpanel" data-pc-panel="${n(i)}">
      ${wo(i)}
    </div>`,e.querySelectorAll("[data-pc-cat]").forEach(r=>{r.addEventListener("click",()=>{ma(e,r.dataset.pcCat,{syncUrl:!0})})}),i==="menu"&&$o(e),i==="godzilla"&&fl("#gz-root"),i==="jensen"&&Tl("#jh-root"),i==="gooaye"&&Dl("#gy-root"),i==="xiaojun"&&Il("#xj-root"),i==="whynottv"&&Ql("#wn-root"),i==="zhang-junan"&&po("#zj-root")}function Lo(){return`
    <section class="section podcasts-section" aria-label="${n(s("podcastsTitle"))}">
      <header class="view-header">
        <h2 class="view-title">${n(s("podcastsTitle"))}</h2>
        <p class="view-lead">${n(s("podcastsLead"))}</p>
      </header>
      <p class="pc-disclaimer" role="note">${n(s("podcastsDisclaimer"))}</p>
      <div id="pc-root" class="pc-root"></div>
    </section>`}function jo(e,{syncUrl:t=!0}={}){return Zt?(ma(Zt,e,{syncUrl:t}),{ok:!0,category:ga}):{ok:!1,reason:"missing-root"}}function Co(e="#pc-root",t={}){const i=(typeof e=="string"?document.querySelector(e):e)||document.querySelector("#pc-root");if(!i)return{ok:!1,reason:"missing-root"};Zt=i;const r=fa(t.category??"menu");return ma(i,r,{syncUrl:t.syncUrl!==!1}),{ok:!0,category:ga}}const zo="./data/berkshire-letters.json",Zs=[{id:"early",labelKey:"lettersCatEarly"},{id:"nineties",labelKey:"lettersCat90"},{id:"twothousands",labelKey:"lettersCat00"},{id:"tens",labelKey:"lettersCat10"},{id:"recent",labelKey:"lettersCat20"},{id:"special",labelKey:"lettersCatSpecial"}],ns={menu:"menu",early:"early",1977:"early",nineties:"nineties","1990s":"nineties",twothousands:"twothousands","2000s":"twothousands",tens:"tens","2010s":"tens",recent:"recent","2020s":"recent",special:"special"};let W=null,Z="menu",ae=null,Re=null;function Xt(e){if(e==null||e==="")return"menu";const a=String(e).trim().toLowerCase();if(ns[a])return ns[a];if(/^\d{4}$/.test(a)){const i=Number(a);if(i>=1977&&i<=1989)return"early";if(i>=1990&&i<=1999)return"nineties";if(i>=2e3&&i<=2009)return"twothousands";if(i>=2010&&i<=2019)return"tens";if(i>=2020&&i<=2025)return"recent"}return"menu"}function Ao(e,t){return t==="special"?"#letters/special":t&&/^\d{4}$/.test(String(t))?`#letters/${t}`:!e||e==="menu"?"#letters":`#letters/${e}`}function Xs(e){return((W==null?void 0:W.letters)||[]).filter(t=>t.category===e)}function Eo(e){const a=Xs(e).filter(i=>i.access!=="link-only").reduce((i,r)=>!i||r.year>i.year?r:i,null);return a?String(a.year):null}function Do(e){if(e==="special")return((W==null?void 0:W.letters)||[]).find(a=>a.access==="link-only")||null;if(e==null||!/^\d{4}$/.test(String(e)))return null;const t=Number(e);return((W==null?void 0:W.letters)||[]).find(a=>a.year===t&&a.access!=="link-only")||null}function zt(e,{syncUrl:t=!0,year:a}={}){const i=e==null||e===""?"menu":String(e).trim(),r=/^\d{4}$/.test(i)?i:null,o=i.toLowerCase()==="special",l=a!=null&&a!==""?String(a):r;if(l==="special"||o&&!r&&l==null?(Z="special",ae="special"):l&&/^\d{4}$/.test(l)?(Z=Xt(l),ae=l):(Z=Xt(i),Z==="menu"?ae=null:Z==="special"?ae="special":ae=Eo(Z)),t){const c=Ao(Z,ae);location.hash!==c&&history.replaceState(null,"",c)}Bo()}function qo(e){return e.title?e.title:String(e.year)}function Mo(e){const t=e.filter(i=>i.access!=="link-only");if(t.length<2)return"";const a=t.slice().sort((i,r)=>r.year-i.year).map(i=>{const r=String(i.year)===String(ae);return`<button type="button" class="lt-year-chip${r?" is-on":""}" data-letter-year="${i.year}" aria-pressed="${r?"true":"false"}">${i.year}</button>`}).join("");return`
    <div class="lt-year-rail" role="group" aria-label="${n(s("lettersYearRail"))}">
      ${a}
    </div>`}function No(e){if(!e)return`<p class="lt-note">${n(s("lettersMissing"))}</p>`;const t=e.access==="read",a=s(t?"lettersReadBadge":"lettersLinkBadge"),i=t?"pc-badge-featured":"pc-badge-stub",r=t?`<ul class="lt-points">${e.bullets.map(u=>`<li>${n(u)}</li>`).join("")}</ul>`:`<p class="lt-linkonly">${n(s("lettersLinkOnlyNote"))}</p>`,o=String(e.url||"").toLowerCase().endsWith(".pdf"),l=s(o?"lettersReaderOpenPdf":"lettersReaderOpen");return`
    <article class="lt-reader" id="${e.access==="link-only"?`letter-${e.year}-special`:`letter-${e.year}`}">
      <header class="lt-reader-head">
        <span class="pc-card-badge ${i}">${n(a)}</span>
        <h3 class="lt-reader-title">${n(qo(e))}</h3>
        <p class="lt-reader-by">${n(s("lettersAuthor"))}：${n(e.author)}</p>
      </header>
      ${r}
      <div class="lt-reader-stage" role="region" aria-label="${n(s("lettersReaderRegion"))}">
        <p class="lt-reader-note">${n(s("lettersReaderNote"))}</p>
        <a class="lt-reader-open" href="${n(e.url)}" target="_blank" rel="noopener noreferrer">${n(l)}</a>
        <p class="lt-reader-src">${n(s("lettersOfficialHost"))}</p>
      </div>
    </article>`}function Ro(){const e={};for(const a of(W==null?void 0:W.letters)||[])e[a.category]=(e[a.category]||0)+1;const t=Zs.map(a=>{const i=e[a.id]||0;return`
      <button type="button" class="pc-menu-card" data-letter-cat="${a.id}">
        <span class="pc-menu-title">${n(s(a.labelKey))}</span>
        <span class="pc-menu-blurb">${i}</span>
        <span class="pc-menu-cta">${n(s("lettersOpen"))}</span>
      </button>`}).join("");return`
    <div class="pc-menu" role="group">
      <p class="pc-menu-lead">${n(s("lettersMenuLead"))}</p>
      <div class="pc-menu-grid">${t}</div>
    </div>`}function Oo(){const e=Xs(Z),t=Zs.find(i=>i.id===Z),a=Do(ae);return`
    <button type="button" class="lt-back" data-letter-cat="menu">${n(s("lettersBack"))}</button>
    <h3 class="lt-cat-title">${n(s((t==null?void 0:t.labelKey)||"lettersTitle"))}</h3>
    ${Mo(e)}
    ${No(a)}`}function Bo(){const e=Re==null?void 0:Re.querySelector("#lt-host");!e||!W||(e.innerHTML=Z==="menu"?Ro():Oo(),e.querySelectorAll("[data-letter-cat]").forEach(t=>{t.addEventListener("click",()=>zt(t.dataset.letterCat))}),e.querySelectorAll("[data-letter-year]").forEach(t=>{t.addEventListener("click",()=>zt(t.dataset.letterYear))}))}function Ho(){return`
    <section class="section letters-section" aria-label="${n(s("lettersTitle"))}">
      <header class="view-header">
        <h2 class="view-title">${n(s("lettersTitle"))}</h2>
        <p class="view-lead">${n(s("lettersLead"))}</p>
      </header>
      <p class="pc-disclaimer" role="note">${n(s("lettersDisclaimer"))}</p>
      <div id="lt-root"><div id="lt-host"></div></div>
    </section>`}async function _o(e,{category:t="menu",year:a,syncUrl:i=!1}={}){if(Re=document.querySelector(e),!!Re){if(!W){const r=await fetch(zo);if(!r.ok)throw new Error(`letters HTTP ${r.status}`);W=await r.json()}zt(t,{syncUrl:i,year:a})}}const Uo="./data/manbao.json",Qs=[{id:"about",labelKey:"manbaoCatAbout"},{id:"public",labelKey:"manbaoCatPublic"},{id:"decode",labelKey:"manbaoCatDecode"},{id:"tech",labelKey:"manbaoCatTech"},{id:"giants",labelKey:"manbaoCatGiants"},{id:"club",labelKey:"manbaoCatClub"}],is={menu:"menu",about:"about",public:"public",essay:"public",decode:"decode",tech:"tech",giants:"giants",club:"club"};let D=null,te="menu",Oe=null;function ya(e){if(e==null||e==="")return"menu";const a=String(e).trim().toLowerCase();return is[a]?is[a]:"menu"}function en(e){return!e||e==="menu"?"#manbao":`#manbao/${e}`}function tn(e,{syncUrl:t=!0}={}){if(te=ya(e),t){const a=en(te);location.hash!==a&&history.replaceState(null,"",a)}an()}function Io(){var a;const e={about:4,public:((a=D==null?void 0:D.essays)==null?void 0:a.length)||0};for(const i of(D==null?void 0:D.posts)||[])e[i.category]=(e[i.category]||0)+1;const t=Qs.map(i=>{const r=e[i.id]||0;return`
      <button type="button" class="pc-menu-card" data-manbao-cat="${i.id}">
        <span class="pc-menu-title">${n(s(i.labelKey))}</span>
        <span class="pc-menu-blurb">${r}</span>
        <span class="pc-menu-cta">${n(s("manbaoOpen"))}</span>
      </button>`}).join("");return`
    <div class="pc-menu" role="group">
      <p class="pc-menu-lead">${n(s("manbaoMenuLead"))}</p>
      <p class="lt-note">${n((D==null?void 0:D.indexNote)||"")}</p>
      <div class="pc-menu-grid">${t}</div>
    </div>`}function Wo(){const e=[[D.officialSite,"manny-li.com"],[D.essayIndex,"essay"],[D.proHome,"pro.manny-li.com"],[D.proJoin,"join"],[D.proPosts,"posts"]];return`
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
    </div>`}function Fo(){const e=D.essays||[];return`
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
    </div>`}function Vo(){const e=Qs.find(o=>o.id===te),t=(D.posts||[]).filter(o=>o.category===te),a=new Map;for(const o of t){const l=(o.date||"").slice(0,4)||"—";a.has(l)||a.set(l,[]),a.get(l).push(o)}const r=[...a.keys()].map(o=>{const l=a.get(o).map(c=>`
        <li class="lt-pro-row">
          <a href="${n(c.url)}" target="_blank" rel="noopener noreferrer">${n(c.title)}</a>
          <span class="lt-pro-meta">${n(c.date)} · ${n(s("manbaoPaywallBadge"))}</span>
        </li>`).join("");return`<section class="lt-year"><h4>${n(o)}</h4><ul class="lt-pro-list">${l}</ul></section>`}).join("");return`
    <button type="button" class="lt-back" data-manbao-cat="menu">${n(s("manbaoBack"))}</button>
    <h3 class="lt-cat-title">${n(s((e==null?void 0:e.labelKey)||"manbaoTitle"))}</h3>
    <p class="lt-note">${n(s("manbaoPaywallBadge"))} · ${t.length}</p>
    ${r}`}function an(){const e=Oe==null?void 0:Oe.querySelector("#mb-host");if(!e||!D)return;let t=Io();te==="about"?t=Wo():te==="public"?t=Fo():te!=="menu"&&(t=Vo()),e.innerHTML=t,e.querySelectorAll("[data-manbao-cat]").forEach(a=>{a.addEventListener("click",()=>tn(a.dataset.manbaoCat))})}function Go(){return`
    <section class="section manbao-section" aria-label="${n(s("manbaoTitle"))}">
      <header class="view-header">
        <h2 class="view-title">${n(s("manbaoTitle"))}</h2>
        <p class="view-lead">${n(s("manbaoLead"))}</p>
      </header>
      <p class="pc-disclaimer" role="note">${n(s("manbaoDisclaimer"))}</p>
      <div id="mb-root"><div id="mb-host"></div></div>
    </section>`}async function Jo(e,{category:t="menu",syncUrl:a=!1}={}){if(Oe=document.querySelector(e),!!Oe){if(!D){const i=await fetch(Uo);if(!i.ok)throw new Error(`manbao HTTP ${i.status}`);D=await i.json()}if(te=ya(t),a){const i=en(te);location.hash!==i&&history.replaceState(null,"",i)}an()}}const Yo="./data/latest.json";function F(e){return e==null||Number.isNaN(e)?"flat":e>0?"up":e<0?"down":"flat"}function H(e,t=2){return e==null||Number.isNaN(e)?"—":`${e>0?"+":""}${e.toFixed(t)}%`}function X(e,t=2){return e==null||Number.isNaN(e)?"—":Number(e).toLocaleString(R(),{minimumFractionDigits:t,maximumFractionDigits:t})}function va(e,t){if(e==null||Number.isNaN(e))return"—";const a=t==="TWD"&&e>=100?0:2;return`${t==="USD"?"$":t==="TWD"?"NT$":""}${X(e,a)}`}function Ko(e){try{return new Date(e).toLocaleString(R(),{timeZone:"Asia/Taipei",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1})+s("taipei")}catch{return e}}function $a(e){const t=e.aboveSma20?`<span class="badge sma-on">${b("sma20","SMA20")}↑</span>`:`<span class="badge sma-off">${b("sma20","SMA20")}↓</span>`,a=e.aboveSma50?`<span class="badge sma-on">${b("sma50","SMA50")}↑</span>`:`<span class="badge sma-off">${b("sma50","SMA50")}↓</span>`;return t+a}function ba(e){return e!=null&&e.length?e.map(t=>{const a=String(t);return a==="A"?`<span class="badge screen">${b("screenA","A")}</span>`:a==="B"?`<span class="badge screen">${b("screenB","B")}</span>`:a==="C"?`<span class="badge screen">${b("screenC","C")}</span>`:a==="observe"?`<span class="badge screen">${n(s("observe"))}</span>`:`<span class="badge screen">${n(a)}</span>`}).join(""):""}const rs={tw:"https://www.twse.com.tw/zh/indices/taiex/mi-5min-indices.html",otc:"https://www.tpex.org.tw/zh-tw/mainboard/trading/info/daily-indices.html",spx:"https://www.spglobal.com/spdji/en/indices/equity/sp-500/",nasdaq:"https://www.nasdaq.com/market-activity/index/comp",sox:"https://www.nasdaq.com/market-activity/index/sox",usdTwd:"https://www.cbc.gov.tw/tw/lp-645-1.html"};function Zo(e){var r,o,l,c,u;const t=[],a=(d,p,h)=>{if(!h)return;const g=h.incomplete,f=h.value!=null?X(h.value,2):"—",k=h.date&&/^\d{4}-\d{2}-\d{2}$/.test(h.date)?`<span class="asof-tag" data-lq-field="date">${h.date.slice(5,7)}/${h.date.slice(8,10)}</span>`:"",T=h.dayPct!=null?`<div data-lq-field="dayPct" class="pct ${F(h.dayPct)}">${H(h.dayPct)}</div>`:"",w=h.session==="intraday"?` · ${b("intraday",s("intraday"))}`:"",j=rs[d],z=[h.name||d,h.date?`${s("dataAsOf")} ${h.date}${h.stale?"（上次成功值）":""}`:null,h.source||null,"official ↗"].filter(Boolean).join(" · "),U=j?`title="${n(z)}"`:"",L=`
        <div class="label">${p}${w}${k}</div>
        <div class="value" data-lq-field="value">${f}</div>
        ${T}`;j?t.push(`
      <a class="index-chip ${g&&h.value==null?"incomplete":""}" data-lq="index" data-lq-key="${n(d)}" href="${n(j)}"
         target="_blank" rel="noopener noreferrer" ${U}>${L}
      </a>`):t.push(`
      <div class="index-chip ${g?"incomplete":""}" data-lq="index" data-lq-key="${n(d)}">${L}
      </div>`)};if(a("tw",b("taiex",((r=e.tw)==null?void 0:r.name)||s("taiex")),e.tw),a("otc",b("otc",((o=e.otc)==null?void 0:o.name)||s("otc")),e.otc),a("spx",b("spx",((l=e.spx)==null?void 0:l.name)||s("spx")),e.spx),a("nasdaq",b("nasdaq",((c=e.nasdaq)==null?void 0:c.name)||s("nasdaq")),e.nasdaq),a("sox",b("sox",((u=e.sox)==null?void 0:u.name)||s("sox")),e.sox),e.usdTwd){const d=e.usdTwd,p=d.taipeiClose??d.yahoo,h=rs.usdTwd,g=["USD/TWD",s("taipeiClose")+(d.taipeiClose!=null?` ${X(d.taipeiClose,3)}`:" —"),d.yahoo!=null?`Yahoo ${X(d.yahoo,3)}`:null,"CBC / 台北外匯 official ↗"].filter(Boolean).join(" · ");t.push(`
      <a class="index-chip" data-lq="index" data-lq-key="usdTwd"
         data-lq-taipei-close="${d.taipeiClose!=null?n(String(d.taipeiClose)):""}"
         href="${n(h)}" target="_blank" rel="noopener noreferrer"
         title="${n(g)}">
        <div class="label">${b("usdtwd",s("usdtwd"))}</div>
        <div class="value" data-lq-field="value">${X(p,3)}</div>
        <div class="pct flat" data-lq-field="dayPct" style="font-size:0.7rem">
          ${n(s("taipeiClose"))} ${d.taipeiClose!=null?X(d.taipeiClose,3):"—"}
          · Yahoo ${d.yahoo!=null?X(d.yahoo,3):"—"}
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
    </div>`:'<div class="index-strip index-strip--marquee"></div>'}function Xo(e,t){const a=e.market==="TW"?b("twStock",s("twStock")):e.market==="US"?b("usStock",s("usStock")):n(e.market||""),i=e.rsVsIndexPp!=null?`<div class="metric"><div class="m-label">${b("rs","RS")}</div><div class="m-val ${F(e.rsVsIndexPp)}">${H(e.rsVsIndexPp)}</div></div>`:e.priorClosePct!=null?`<div class="metric"><div class="m-label">${b("priorClose",s("priorCloseFull"))}</div><div class="m-val ${F(e.priorClosePct)}">${H(e.priorClosePct)}</div></div>`:`<div class="metric"><div class="m-label">${b("rs","RS")}</div><div class="m-val">—</div></div>`;return`
    <article class="pick-card" data-lq="pick" data-lq-sym="${n(e.ticker)}">
      <div class="rank">TOP ${t}</div>
      <div class="head">
        <div class="ticker-block">
          <div class="ticker">${n(e.ticker)}</div>
          <div class="name">${n(e.name||"")}</div>
        </div>
        <div class="price-block">
          <div class="price" data-lq-field="price">${va(e.price,e.currency)}</div>
          <div class="day-pct ${F(e.dayPct)}" data-lq-field="dayPct">${H(e.dayPct)}</div>
        </div>
      </div>
      <div class="flags">
        <span class="badge market">${a}</span>
        ${ba(e.screens)}
        ${$a(e)}
      </div>
      <div class="metrics">
        ${i}
        <div class="metric"><div class="m-label">${b("pct5d",s("pct5d"))}</div><div class="m-val ${F(e.pct5d)}">${H(e.pct5d)}</div></div>
        <div class="metric"><div class="m-label">${b("pct1m",s("pct1m"))}</div><div class="m-val ${F(e.pct1m)}">${H(e.pct1m)}</div></div>
        <div class="metric"><div class="m-label">${b("volRatio",s("volRatio"))}</div><div class="m-val">${e.volRatio!=null?X(e.volRatio,2)+"×":"—"}</div></div>
      </div>
      ${e.business||e.why||e.risk?`<details class="fold-block card-fold"><summary>${n(s("details"))}</summary>
        ${e.business?`<p class="card-text"><strong>${n(s("business"))}</strong>　${n(e.business)}</p>`:""}
        ${e.why?`<div class="card-text"><strong>${n(s("reason"))}</strong>${sa(e.why,n)}</div>`:""}
        ${e.risk?`<p class="card-text risk"><strong>${n(s("risk"))}</strong>　${sn(e.risk)}</p>`:""}
      </details>`:""}
    </article>
  `}function sn(e){let t=n(e);return t=t.replace(/漲停/g,b("limitUp",s("limitUp"))),t=t.replace(/動能/g,b("momentum",s("momentum"))),t}function ls(e){return e.map(t=>{const a=t.rsVsIndexPp??t.priorClosePct,i=t.rsVsIndexPp!=null?H(t.rsVsIndexPp):t.priorClosePct!=null?H(t.priorClosePct):"—";return`
      <tr data-lq="pick" data-lq-sym="${n(t.ticker)}">
        <td><span class="ticker">${n(t.ticker)}</span></td>
        <td class="name-cell">${n(t.name||"")}</td>
        <td class="num" data-lq-field="price">${va(t.price,t.currency)}</td>
        <td class="num ${F(t.dayPct)}" data-lq-field="dayPct">${H(t.dayPct)}</td>
        <td class="num ${F(a)}">${i}</td>
        <td class="num ${F(t.pct5d)}">${H(t.pct5d)}</td>
        <td class="num ${F(t.pct1m)}">${H(t.pct1m)}</td>
        <td class="num">${t.volRatio!=null?X(t.volRatio,2)+"×":"—"}</td>
        <td>${$a(t)}</td>
        <td>${ba(t.screens)}</td>
        <td class="why-cell">${sa(t.why,n)}</td>
      </tr>`}).join("")}function os(e){return e.map(t=>{const a=t.rsVsIndexPp!=null?`<span class="${F(t.rsVsIndexPp)}">${b("rs","RS")} ${H(t.rsVsIndexPp)}</span>`:t.priorClosePct!=null?`<span class="${F(t.priorClosePct)}">${b("priorClose",s("priorClose"))} ${H(t.priorClosePct)}</span>`:"";return`
      <div class="list-card" data-lq="pick" data-lq-sym="${n(t.ticker)}">
        <div class="lc-head">
          <div>
            <span class="ticker" style="font-family:var(--mono);font-weight:600">${n(t.ticker)}</span>
            <span style="color:var(--text-muted);font-size:0.85rem;margin-left:0.35rem">${n(t.name||"")}</span>
          </div>
          <div style="text-align:right">
            <div style="font-family:var(--mono)" data-lq-field="price">${va(t.price,t.currency)}</div>
            <div class="${F(t.dayPct)}" data-lq-field="dayPct" style="font-family:var(--mono);font-weight:600">${H(t.dayPct)}</div>
          </div>
        </div>
        <div class="lc-metrics">
          ${a}
          <span class="${F(t.pct5d)}">${b("pct5d","5d")} ${H(t.pct5d)}</span>
          <span class="${F(t.pct1m)}">${b("pct1m","1m")} ${H(t.pct1m)}</span>
          <span>${b("volRatio",s("volRatio"))} ${t.volRatio!=null?X(t.volRatio,2)+"×":"—"}</span>
        </div>
        <div class="flags" style="margin-bottom:0.4rem">${$a(t)}${ba(t.screens)}</div>
        ${t.why?`<div class="lc-why">${sa(t.why,n)}</div>`:""}
        ${t.risk&&t.risk!=="—"?`<p class="lc-why lc-risk">${n(s("risk"))}：${sn(t.risk)}</p>`:""}
      </div>`}).join("")}function Qo(){return`
    <tr>
      <th>${b("ticker",s("ticker"))}</th>
      <th>${n(s("name"))}</th>
      <th>${n(s("price"))}</th>
      <th>${b("dayPct",s("dayPct"))}</th>
      <th>${b("rs","RS")}／${b("priorClose",s("priorClose"))}</th>
      <th>${b("pct5d",s("pct5d"))}</th>
      <th>${b("pct1m",s("pct1m"))}</th>
      <th>${b("volRatio",s("volRatio"))}</th>
      <th>${n(s("ma"))}</th>
      <th>${b("screening",s("screening"))}</th>
      <th>${n(s("reason"))}</th>
    </tr>`}function cs(e){return e?e.market==="TW"||e.market==="US"?e.market:String(e.ticker||"").toUpperCase().endsWith(".TW")?"TW":"US":"US"}function ds(e,t){return e.length?`<div class="top5-grid">${e.map((a,i)=>Xo(a,i+1)).join("")}</div>`:`<div class="empty-state">${n(s("emptyTop",{market:t}))}</div>`}function ka(){return[{id:"today",label:s("navToday"),hash:"today"},{id:"logic",label:s("navLogic"),hash:"logic"},{id:"research",label:s("navResearch"),hash:"research"},{id:"strategies",label:s("navStrategies"),hash:"strategies"},{id:"options",label:s("navOptions"),hash:"options"},{id:"earnings",label:s("navEarnings"),hash:"earnings"},{id:"lookup",label:s("navLookup"),hash:"lookup"},{id:"soxl",label:s("navSoxl"),hash:"soxl"},{id:"txf",label:s("navTxf"),hash:"txf"},{id:"podcasts",label:s("navPodcasts"),hash:"podcasts"},{id:"letters",label:s("navLetters"),hash:"letters"},{id:"manbao",label:s("navManbao"),hash:"manbao"},{id:"paper",label:s("navPaper"),hash:"paper"}]}const ec=["today","strategies","paper","research"],nn=["logic","options","earnings","lookup","soxl","txf","podcasts","letters","manbao"],_e={today:"today",logic:"logic",research:"research",strategies:"strategies",options:"options",earnings:"earnings",lookup:"lookup",quote:"lookup",soxl:"soxl",txf:"txf","futures-tw":"txf",台指期:"txf",臺指期:"txf","tx-futures":"txf",podcasts:"podcasts",podcast:"podcasts",名人podcast:"podcasts","celebrity-podcasts":"podcasts",godzilla:"podcasts",jensen:"podcasts",xiaojun:"podcasts",whynottv:"podcasts","zhang-junan":"podcasts",zhangjunan:"podcasts",張濬安:"podcasts",whynot:"podcasts",huang:"podcasts","jensen-huang":"podcasts",黃仁勳:"podcasts",nvidia:"podcasts",letters:"letters",berkshire:"letters",buffett:"letters",股東信:"letters",股东信:"letters",巴菲特:"letters",manbao:"manbao","mann-pro":"manbao",曼報:"manbao",曼报:"manbao",曼報pro:"manbao",曼報Pro:"manbao",paper:"paper",social:"today",danmaku:"today","social-digest":"today",giscus:"today",help:"logic",glossary:"logic",bookshelf:"research",library:"research",研究:"research","us-options":"options",選擇權:"options",美股選擇權:"options",mcmillan:"options",讀財報:"earnings",reports:"earnings","us-earnings":"earnings",財報:"earnings",查股:"lookup",個股:"lookup","stock-lookup":"lookup","us-quote":"lookup","tw-quote":"lookup","soxl-desk":"soxl",semiconductor:"soxl",半導體:"soxl",三倍半導體:"soxl",台指期貨:"txf",臺股期貨:"txf",哥吉拉:"podcasts",哥吉拉心法:"podcasts","godzilla-playbook":"podcasts",playbook:"podcasts",黃仁勳:"podcasts","jen-hsun":"podcasts",etl:"podcasts",method:"logic",邏輯:"logic"},Qt={today:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 2h2v2h6V2h2v2h3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3V2zm12 8H5v10h14V10zm-2-5H7v2h10V5z"/></svg>',logic:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 2h2v2h-2v-2zm3 0h2v2h-2v-2zm-3 3h2v2h-2v-2zm3 0h2v2h-2v-2zm3-3h2v5h-2v-5z"/></svg>',research:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm8 1.5V8h4.5L14 3.5zM8 12h8v1.5H8V12zm0 3.5h8V17H8v-1.5zm0 3.5h5V20.5H8V19z"/></svg>',strategies:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 19h16v2H4v-2zm2.5-3.5 4-4 3 3L21 6.5 19.5 5l-6 7.5-3-3L4 14.5l2.5 1z"/></svg>',options:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 12a8 8 0 1 1 16 0H4zm8-6a6 6 0 0 0-5.65 4h11.3A6 6 0 0 0 12 6zm0 12a6 6 0 0 0 5.65-4H6.35A6 6 0 0 0 12 18z"/></svg>',earnings:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 3h14a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm2 4v2h10V7H7zm0 4v2h10v-2H7zm0 4v2h6v-2H7z"/></svg>',lookup:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10 3a7 7 0 0 1 5.47 11.34l4.1 4.09-1.42 1.42-4.09-4.1A7 7 0 1 1 10 3zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/></svg>',soxl:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 17.25 9.5 9l3.5 4.5L17 8l4 9.25H3zM5 19h14v2H5v-2z"/></svg>',txf:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 18h16v2H4v-2zm1.5-3.5 3.2-4.2 2.8 3.3L16 8l4 6.5H5.5zM7 4h2v2H7V4zm4 0h2v2h-2V4zm4 0h2v2h-2V4z"/></svg>',podcasts:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3a9 9 0 0 0-9 9v7a2 2 0 0 0 2 2h3v-8H7v-1a5 5 0 0 1 10 0v1h-1v8h3a2 2 0 0 0 2-2v-7a9 9 0 0 0-9-9zm-4 11v5H5v-5h3zm11 5h-3v-5h3v5zM12 7a3 3 0 0 0-3 3v1h6v-1a3 3 0 0 0-3-3z"/></svg>',letters:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm8 8.2L5.2 6.5 4 7.9l8 6.2 8-6.2-1.2-1.4L12 12.2z"/></svg>',manbao:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 3h11l4 4v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm10 1.5V8h3.5L15 4.5zM7 11h10v1.6H7V11zm0 3.4h10v1.6H7v-1.6zM7 18h6v1.6H7V18z"/></svg>',paper:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 14.93V17h-2v-.07A8.01 8.01 0 0 1 5.07 13H7v-2H5.07A8.01 8.01 0 0 1 11 5.07V7h2V5.07A8.01 8.01 0 0 1 18.93 11H17v2h1.93A8.01 8.01 0 0 1 13 16.93z"/></svg>',more:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 10h4v4H5v-4zm5 0h4v4h-4v-4zm5 0h4v4h-4v-4z"/></svg>'},at={godzilla:"godzilla","godzilla-playbook":"godzilla",playbook:"godzilla",哥吉拉:"godzilla",哥吉拉心法:"godzilla",jensen:"jensen",huang:"jensen","jensen-huang":"jensen",nvidia:"jensen","jen-hsun":"jensen",etl:"jensen",黃仁勳:"jensen",黄仁勋:"jensen",gooaye:"gooaye",股癌:"gooaye",xiaojun:"xiaojun",張小珺:"xiaojun",张小珺:"xiaojun",whynottv:"whynottv",whynot:"whynottv",WhynotTV:"whynottv","zhang-junan":"zhang-junan",zhangjunan:"zhang-junan",張濬安:"zhang-junan",张浚安:"zhang-junan"};function At(){const a=(location.hash||"").replace(/^#/,"").split(/[/?&]/).filter(Boolean).map(d=>{try{return decodeURIComponent(d)}catch{return d}}),i=a[0]||"",r=i.toLowerCase();if(at[r]||at[i])return{view:"podcasts",sub:at[r]||at[i],parts:a.slice(1)};const o=_e[r]||_e[i]||"today",l=a.slice(1);let c=l[0]||null;o==="podcasts"&&c&&(c=fa(c));let u=null;if(o==="letters"){const d=l.find(g=>/^\d{4}$/.test(g)),p=l.some(g=>String(g).toLowerCase()==="special");p?u="special":d&&(u=d);const h=p?"special":d||c;h&&(c=Xt(h))}if(o==="manbao"&&c&&(c=ya(c)),o==="research"&&c){if(c.toLowerCase()==="shelf"&&l[1])return{view:o,sub:"menu",shelf:l[1],parts:l};c=la(c)}return{view:o,sub:c,parts:l,shelf:null,letterYear:u}}function tc(){return At().view}function rn(e,t){const a=Qt[e.id]||"";return`
      <button type="button"
        class="nav-item"
        data-nav="${e.id}"
        data-variant="${t}"
        aria-label="${n(e.label)}"
        aria-current="false">
        <span class="nav-icon">${a}</span>
        <span class="nav-label">${n(e.label)}</span>
      </button>`}function ac(e){return ka().map(t=>rn(t,e)).join("")}function sc(){const e=Object.fromEntries(ka().map(r=>[r.id,r])),t=ec.map(r=>rn(e[r],"mobile")).join(""),a=`
      <button type="button"
        class="nav-item nav-more-btn"
        data-nav-more
        data-variant="mobile"
        aria-label="${n(s("navMore"))}"
        aria-haspopup="dialog"
        aria-expanded="false"
        aria-controls="nav-more-sheet"
        aria-current="false">
        <span class="nav-icon">${Qt.more}</span>
        <span class="nav-label">${n(s("navMore"))}</span>
      </button>`,i=nn.map(r=>{const o=e[r],l=Qt[r]||"";return`
        <button type="button"
          class="nav-more-item"
          data-nav="${o.id}"
          aria-label="${n(o.label)}"
          aria-current="false">
          <span class="nav-icon">${l}</span>
          <span class="nav-label">${n(o.label)}</span>
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
    </div>`}function nc(e,t){const a=e.top5||[],i=e.us||[],r=e.tw||[],o=n(s("disclaimer")),l=Qo();return`
    <a class="skip-link" href="#main-content">${n(s("skipToContent"))}</a>
    <header class="site-chrome">
      <div class="chrome-row">
        <div class="chrome-brand">
          <img class="brand-mark" src="/just-math-and-luck/logo.svg?v=5" width="40" height="40" alt="每日數學選股" decoding="async" />
          <div class="brand-text">
            <h1>${n(s("siteTitle"))}</h1>
            <p class="brand-meta"><span id="brand-asof">${n(s("dataAsOf"))} ${Ko(e.asOf)}</span><span id="lq-live-suffix" class="lq-live-suffix" hidden aria-live="polite"></span></p>
          </div>
        </div>
        <div class="chrome-actions">
          ${vn()}
          <nav class="nav-desktop" aria-label="${n(s("navMain"))}">
            ${ac("desktop")}
          </nav>
        </div>
      </div>
      <p class="disclaimer-line" role="note">${o}</p>
      <div class="market-strip-wrap" aria-label="${n(s("marketQuotes"))}">
        <span class="market-strip-label">${n(s("hot"))}</span>
        ${Zo(e.indices||{})}
      </div>
      ${Ur()}
      ${tl()}
    </header>

    <main class="view-host" id="main-content" tabindex="-1">
      <div class="view" id="view-today" data-view="today" hidden>
        <span id="today" class="view-anchor" tabindex="-1"></span>
        <header class="view-header view-header-tight">
          <h2 class="view-title">${n(s("todayPicks"))}</h2>
        </header>
        ${ri(e.marketRegime)}
        <div class="tabs market-tabs" role="tablist" aria-label="${n(s("market"))}">
          <button type="button" class="tab-btn active" data-tab="us" role="tab" aria-selected="true">${b("usStock",s("usStock"))}（${i.length}）</button>
          <button type="button" class="tab-btn" data-tab="tw" role="tab" aria-selected="false">${b("twStock",s("twStock"))}（${r.length}）</button>
        </div>
        <div class="panel active" id="panel-us" role="tabpanel">
          <section class="section">
            <h2 class="section-title">${n(s("usTop"))}</h2>
            ${ds(a.filter(u=>cs(u)==="US"),s("usStock"))}
          </section>
          <section class="section">
            <h2 class="section-title">${n(s("usList"))}</h2>
            <div class="table-wrap">
              <table class="stock-table">
                <thead>${l}</thead>
                <tbody>${ls(i)}</tbody>
              </table>
            </div>
            <div class="mobile-list">${os(i)}</div>
          </section>
        </div>
        <div class="panel" id="panel-tw" role="tabpanel">
          <section class="section">
            <h2 class="section-title">${n(s("twTop"))}</h2>
            ${ds(a.filter(u=>cs(u)==="TW"),s("twStock"))}
          </section>
          <section class="section">
            <h2 class="section-title">${n(s("twList"))}</h2>
            <div class="table-wrap">
              <table class="stock-table">
                <thead>${l}</thead>
                <tbody>${ls(r)}</tbody>
              </table>
            </div>
            <div class="mobile-list">${os(r)}</div>
          </section>
        </div>
      </div>
      <div class="view" id="view-logic" data-view="logic" hidden>
        <span id="logic" class="view-anchor" tabindex="-1"></span>
        ${oi(e)}
      </div>

      <div class="view" id="view-research" data-view="research" hidden>
        <span id="research" class="view-anchor" tabindex="-1"></span>
        ${Ui()}
      </div>

      <div class="view" id="view-strategies" data-view="strategies" hidden>
        <span id="strategies" class="view-anchor" tabindex="-1"></span>
        ${vi()}
      </div>

      <div class="view" id="view-options" data-view="options" hidden>
        <span id="options" class="view-anchor" tabindex="-1"></span>
        ${wi()}
      </div>

      <div class="view" id="view-earnings" data-view="earnings" hidden>
        <span id="earnings" class="view-anchor" tabindex="-1"></span>
        ${Pi()}
      </div>

      <div class="view" id="view-lookup" data-view="lookup" hidden>
        <span id="lookup" class="view-anchor" tabindex="-1"></span>
        <span id="quote" class="view-anchor" tabindex="-1"></span>
        ${Ti()}
      </div>

      <div class="view" id="view-soxl" data-view="soxl" hidden>
        <span id="soxl" class="view-anchor" tabindex="-1"></span>
        ${xi()}
      </div>

      <div class="view" id="view-txf" data-view="txf" hidden>
        <span id="txf" class="view-anchor" tabindex="-1"></span>
        <span id="futures-tw" class="view-anchor" tabindex="-1"></span>
        ${Li()}
      </div>

      <div class="view" id="view-podcasts" data-view="podcasts" hidden>
        <span id="podcasts" class="view-anchor" tabindex="-1"></span>
        <span id="godzilla" class="view-anchor" tabindex="-1"></span>
        <span id="jensen" class="view-anchor" tabindex="-1"></span>
        <span id="xiaojun" class="view-anchor" tabindex="-1"></span>
        <span id="whynottv" class="view-anchor" tabindex="-1"></span>
        <span id="zhang-junan" class="view-anchor" tabindex="-1"></span>
        ${Lo()}
      </div>

      <div class="view" id="view-letters" data-view="letters" hidden>
        <span id="letters" class="view-anchor" tabindex="-1"></span>
        ${Ho()}
      </div>

      <div class="view" id="view-manbao" data-view="manbao" hidden>
        <span id="manbao" class="view-anchor" tabindex="-1"></span>
        ${Go()}
      </div>

      <div class="view" id="view-paper" data-view="paper" hidden>
        <span id="paper" class="view-anchor" tabindex="-1"></span>
        ${Dn(t)}
      </div>
    </main>

    ${sc()}

    <footer class="site-footer">${n(s("footer"))}</footer>
  `}let je=null;function ic(){try{return typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches}catch{return!1}}function pt(e,t){const a=e.querySelector("#nav-more-sheet"),i=e.querySelector("[data-nav-more]");if(!a||!i)return;if(je&&(clearTimeout(je),je=null),t){a.hidden=!1,requestAnimationFrame(()=>{requestAnimationFrame(()=>{a.hidden||a.classList.add("is-open")})}),i.setAttribute("aria-expanded","true"),document.body.classList.add("nav-more-open");return}const r=a.classList.contains("is-open")||!a.hidden;if(a.classList.remove("is-open"),i.setAttribute("aria-expanded","false"),document.body.classList.remove("nav-more-open"),!r||ic()){a.hidden=!0;return}je=setTimeout(()=>{a.hidden=!0,je=null},340)}function rc(e,t){const a=nn.includes(t);e.querySelectorAll(".nav-item[data-nav]").forEach(r=>{const o=r.dataset.nav===t;r.classList.toggle("is-active",o),r.setAttribute("aria-current",o?"page":"false")});const i=e.querySelector("[data-nav-more]");i&&(i.classList.toggle("is-active",a),i.setAttribute("aria-current",a?"true":"false")),e.querySelectorAll(".nav-more-item").forEach(r=>{const o=r.dataset.nav===t;r.classList.toggle("is-active",o),r.setAttribute("aria-current",o?"page":"false")})}function lc(e){const t=s("siteTitle"),a=ka().find(i=>i.id===e);document.title=a!=null&&a.label?`${a.label} · ${t}`:t}function oc(e){var a;const t=(a=e==null?void 0:e.querySelector)==null?void 0:a.call(e,"#main-content");if(t)try{t.focus({preventScroll:!0})}catch{t.focus()}}function ht(e,t,{updateHash:a=!0,scrollTop:i=!0}={}){const r=_e[t]||"today";if(e.querySelectorAll(".view").forEach(o=>{const l=o.dataset.view===r;o.hidden=!l,o.classList.toggle("is-active",l)}),rc(e,r),pt(e,!1),lc(r),a){const o=`#${r}`;location.hash!==o&&history.replaceState(null,"",o)}return i&&(window.scrollTo(0,0),oc(e)),r}let st=null,nt=null,it=null;function cc(e){const t=(o,l)=>{const c=ht(e,o,l);return Et(c),c};e.querySelectorAll(".nav-item[data-nav], .nav-more-item[data-nav]").forEach(o=>{o.addEventListener("click",()=>t(o.dataset.nav))}),it&&e.removeEventListener("click",it),it=o=>{var c,u;const l=(u=(c=o.target)==null?void 0:c.closest)==null?void 0:u.call(c,"[data-jump]");l&&e.contains(l)&&t(l.dataset.jump)},e.addEventListener("click",it);const a=e.querySelector("[data-nav-more]");a&&a.addEventListener("click",()=>{const o=a.getAttribute("aria-expanded")==="true";pt(e,!o)}),e.querySelectorAll("[data-more-close]").forEach(o=>{o.addEventListener("click",()=>pt(e,!1))}),nt&&window.removeEventListener("keydown",nt),nt=o=>{o.key==="Escape"&&pt(e,!1)},window.addEventListener("keydown",nt),st&&window.removeEventListener("hashchange",st),st=()=>{const o=At(),l=ht(e,o.view,{updateHash:!1});Et(l,o).then(()=>dc(o))},window.addEventListener("hashchange",st);const i=At(),r=!!(i.sub||i.shelf);return ht(e,i.view,{updateHash:!r,scrollTop:!1}),{go:t}}function dc(e){e&&(e.view==="podcasts"&&jo(e.sub||"menu",{syncUrl:!1}),e.view==="research"&&Ji(e.sub||"menu",{syncUrl:!1,shelf:e.shelf||null}),e.view==="letters"&&zt(e.sub||"menu",{syncUrl:!1,year:e.letterYear}),e.view==="manbao"&&tn(e.sub||"menu",{syncUrl:!1}))}function uc(e){const t=e.querySelector(".index-marquee");if(!t||t.dataset.marqueeBound==="1")return;t.dataset.marqueeBound="1";const a=()=>t.classList.add("is-paused"),i=()=>t.classList.remove("is-paused");t.addEventListener("pointerdown",a),t.addEventListener("pointerup",i),t.addEventListener("pointercancel",i),t.addEventListener("pointerleave",i),t.addEventListener("touchstart",a,{passive:!0}),t.addEventListener("touchend",i,{passive:!0}),t.addEventListener("touchcancel",i,{passive:!0})}function pc(e){const t=e.querySelectorAll(".tab-btn");t.forEach(a=>{a.addEventListener("click",()=>{const i=a.dataset.tab;t.forEach(r=>{const o=r.dataset.tab===i;r.classList.toggle("active",o),r.setAttribute("aria-selected",o?"true":"false")}),e.querySelectorAll(".panel").forEach(r=>{r.classList.toggle("active",r.id===`panel-${i}`)})})})}let Sa=null,ln=null;async function on(e){const t=Sa,a=ln,i=tc();e.innerHTML=nc(t,a),Ae=new Map,document.title=s("siteTitle"),It(),cc(e);const r=At(),o=!!(r.sub||r.shelf);ht(e,i,{updateHash:!o,scrollTop:!1}),pc(e),uc(e),await Wr("#us-macro-strip"),await sl("#tw-macro-strip"),qn(e),a&&await Vt(e,a),$n(e),await Et(r.view,r),zr(e),gc()}let Ae=new Map;const hc={strategies:()=>Si("#xq-root"),research:e=>Yi("#rl-root",void 0,{category:e.view==="research"&&e.sub||"menu",shelf:e.view==="research"?e.shelf:null,syncUrl:!1}),options:()=>se(()=>import("./options-CP8F-3Tl.js"),[]).then(e=>e.initOptions("#uo-root")),earnings:()=>se(()=>import("./earnings-Bvolx_Fn.js"),[]).then(e=>e.initEarnings("#er-root")),lookup:()=>se(()=>import("./lookup-DjA7jNjP.js"),[]).then(e=>e.initLookup("#lk-root")),soxl:()=>se(()=>import("./soxl-Br-FRdMu.js"),[]).then(e=>e.initSoxl("#sx-root")),txf:()=>se(()=>import("./txf-DNoAxEZw.js"),[]).then(e=>e.initTxf("#txf-root")),podcasts:e=>Co("#pc-root",{category:e.view==="podcasts"&&e.sub||"menu",syncUrl:!1}),letters:e=>_o("#lt-root",{category:e.view==="letters"&&e.sub||"menu",year:e.view==="letters"?e.letterYear:void 0,syncUrl:!1}),manbao:e=>Jo("#mb-root",{category:e.view==="manbao"&&e.sub||"menu",syncUrl:!1})};function Et(e,t=null){const a=_e[e]||e,i=hc[a];if(!i)return Promise.resolve(!1);if(Ae.has(a))return Ae.get(a);const r=t&&(_e[t.view]||t.view)===a?t:{view:a},o=Promise.resolve().then(()=>i(r)).then(()=>(Ar(),!0)).catch(l=>(console.warn(`section ${a} init failed`,l),Ae.delete(a),!1));return Ae.set(a,o),o}function gc(){const e=()=>{for(const t of["strategies","earnings","txf","soxl"])Et(t)};"requestIdleCallback"in window?window.requestIdleCallback(e,{timeout:4e3}):window.setTimeout(e,2500)}async function fc(){const e=document.getElementById("app");!e||!Sa||(Ks(),await on(e))}async function ea(){const e=document.getElementById("app"),t=mn();It();const a=document.getElementById("loading");a&&(a.textContent=s("loading"));try{const i=await fetch(Yo);if(!i.ok)throw new Error(`HTTP ${i.status}`);Sa=await i.json(),ln=await Mn(),await t,It(),await on(e),ea._langHooked||(ea._langHooked=!0,gn(()=>{fc()}))}catch(i){e.innerHTML=`<div class="error">${n(s("loadError",{msg:i.message}))}</div>`}}function mc(){if(!("serviceWorker"in navigator))return;const e="/just-math-and-luck/",t=`${e}sw.js`,a="jml-sw-controller-reload";navigator.serviceWorker.addEventListener("controllerchange",()=>{try{if(sessionStorage.getItem(a)==="1"){sessionStorage.removeItem(a);return}sessionStorage.setItem(a,"1")}catch{}window.location.reload()}),window.addEventListener("load",()=>{navigator.serviceWorker.register(t,{scope:e}).catch(()=>{})})}const us="jml-pwa-hint-dismissed";function yc(){try{if(window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===!0)return!0}catch{}return!1}function vc(){return/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent||"")}function $c(){var r;if(yc()||!vc())return;try{if(localStorage.getItem(us)==="1")return}catch{return}if(document.getElementById("pwa-install-hint"))return;const e=document.createElement("div");e.id="pwa-install-hint",e.className="pwa-install-hint",e.setAttribute("role","status");const a=/iPhone|iPad|iPod/i.test(navigator.userAgent||"")?"可「分享 → 加入主畫面」離線開啟":"可加入主畫面，離線也能開";e.innerHTML=`<span class="pwa-install-hint__text">${a}</span><button type="button" class="pwa-install-hint__close" aria-label="關閉">×</button>`,document.body.appendChild(e);const i=()=>{e.remove();try{localStorage.setItem(us,"1")}catch{}};(r=e.querySelector(".pwa-install-hint__close"))==null||r.addEventListener("click",i),window.setTimeout(()=>{e.isConnected&&e.classList.add("pwa-install-hint--fade")},8e3),window.setTimeout(()=>{e.isConnected&&i()},12e3)}mc();ea();window.setTimeout(()=>{try{$c()}catch{}},2500);export{Pi as a,Ti as b,xi as c,Li as d,n as e,ar as f,Dt as g,R as n,wi as r,s as t};
