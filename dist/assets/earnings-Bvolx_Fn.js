import{e as a,t as n,g as x,n as $}from"./index-DrW8AN06.js";import{a as j}from"./index-DrW8AN06.js";const b={AAPL:"蘋果：設計和銷售 iPhone、Mac、iPad、手錶耳機等裝置，也靠 App Store、iCloud 等服務收費。",MSFT:"微軟：Windows 和 Office（Microsoft 365）軟體、Azure 雲端服務，也經營 Xbox 遊戲和 LinkedIn。",NVDA:"輝達：設計 AI 和資料中心用的 GPU 晶片與整套伺服器系統，也賣遊戲顯示卡。",AMZN:"亞馬遜：全球大型網購平台，另有 AWS 雲端服務、廣告和 Prime 會員訂閱。",GOOGL:"Alphabet（Google 母公司）：Google 搜尋廣告、YouTube、Google Cloud 雲端和 Android。GOOGL 是有投票權的 A 股。",GOOG:"Alphabet（Google 母公司）：和 GOOGL 是同一家公司，GOOG 是沒有投票權的 C 股，財報一起公布。",META:"Meta：經營 Facebook、Instagram、WhatsApp，主要靠廣告賺錢，也投資 AI 和智慧眼鏡／VR。",TSLA:"特斯拉：電動車、儲能電池系統和太陽能，也在發展自動駕駛軟體。","BRK-B":"波克夏海瑟威：巴菲特長年經營的控股公司，旗下有保險（GEICO）、鐵路（BNSF）、能源等事業，也持有大量股票。",LLY:"禮來：大型藥廠，主力是糖尿病和減重藥（Mounjaro、Zepbound），也有癌症和免疫用藥。",AMD:"超微：設計電腦和伺服器用的 CPU、資料中心 AI 晶片，也做遊戲主機晶片。",XOM:"埃克森美孚：大型石油天然氣公司，從探勘、開採到煉油和化學品都有。",MA:"萬事達卡：信用卡／金融卡的刷卡網路，每筆交易收處理費，本身不借錢給持卡人。",ABBV:"艾伯維：生技藥廠，主力是免疫疾病藥（Skyrizi、Rinvoq），也有腫瘤、神經科學和醫美（肉毒桿菌素 Botox）。",INTC:"英特爾：電腦和伺服器 CPU，也在發展幫別家公司代工晶片的晶圓代工事業。",PLTR:"Palantir：大數據分析和 AI 軟體平台，客戶有美國政府、國防單位和大企業。",CSCO:"思科：網路設備（交換器、路由器）、資安和視訊會議軟體（Webex）。",AMAT:"應用材料：半導體設備大廠，賣晶圓廠用的薄膜沉積、蝕刻等製程機台。",CAT:"開拓重工（Caterpillar）：營建和礦業機具、柴油引擎和發電設備。",ITUB:"伊塔烏聯合銀行（Itaú Unibanco）：巴西最大的民營銀行，做存放款、信用卡、保險和資產管理。",NU:"Nu Holdings（Nubank）：巴西起家的純網路銀行，在巴西、墨西哥、哥倫比亞用手機 App 提供信用卡、帳戶和貸款。",CRWV:"CoreWeave：出租 AI 運算用的雲端 GPU 伺服器，客戶多是訓練和執行 AI 模型的大公司。",GRAB:"Grab：東南亞的超級 App，提供叫車、外送美食生鮮，也做電子支付和小額貸款。",SHOP:"Shopify：幫商家開網路商店的平台，提供金流、物流等工具，按月費和交易抽成收費。",QCOM:"高通：手機處理器（Snapdragon）和通訊晶片，也向手機廠收通訊專利授權費。",UBER:"Uber：叫車和外送（Uber Eats）平台，也有貨運媒合。",JPM:"摩根大通：美國最大銀行，做存放款、信用卡、投資銀行和資產管理。",V:"Visa：全球最大的刷卡網路，每筆交易收處理費，本身不借錢給持卡人。",AVGO:"博通：網通和客製化 AI 晶片，另有企業軟體（VMware）。",NFLX:"Netflix：線上影音串流訂閱服務，也開始賣廣告。",ORCL:"甲骨文：企業資料庫和雲端服務，近年大量蓋 AI 資料中心。",WMT:"沃爾瑪：美國最大連鎖量販店，也經營網購和會員倉儲 Sam's Club。",COST:"好市多：會員制倉儲量販店，主要靠會員年費賺錢。",KO:"可口可樂：飲料公司，賣濃縮液和品牌授權給各地裝瓶廠。",PEP:"百事：飲料（百事可樂）和零食（樂事洋芋片）公司。",JNJ:"嬌生：大型藥廠和醫療器材公司。",UNH:"聯合健康：美國最大健康保險公司，也經營診所和藥品福利管理。",MU:"美光：記憶體晶片（DRAM、NAND、AI 用 HBM）大廠。",TSM:"台積電 ADR：全球最大晶圓代工廠，幫蘋果、輝達等公司製造晶片。",ARM:"安謀：設計處理器架構，授權給手機和電腦晶片公司並收權利金。",CRM:"Salesforce：企業客戶管理（CRM）雲端軟體。",ADBE:"Adobe：Photoshop、Acrobat（PDF）等創作和文件軟體，按月訂閱收費。",IBM:"IBM：企業軟體、雲端和顧問服務，也研發量子電腦。",BA:"波音：民航客機和國防航太。",DIS:"迪士尼：主題樂園、電影和串流平台 Disney+。"};function M(e){const t=String(e||"").toUpperCase();return Object.prototype.hasOwnProperty.call(b,t)?b[t]:null}const N="./data/earnings-digest.json";function P(e){try{return new Date(e).toLocaleString($(),{timeZone:"Asia/Taipei",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1})+n("taipei")}catch{return e||"—"}}function d(e,t=2){return e==null||Number.isNaN(e)?null:Number(e).toLocaleString($(),{minimumFractionDigits:t,maximumFractionDigits:t})}function f(e,t=1){return e==null||Number.isNaN(e)?null:`${e>0?"+":""}${Number(e).toFixed(t)}%`}function p(e,t=""){return e==null||e===""?null:`<span class="er-val">${a(String(e))}${t?a(t):""}</span>`}function g(e,t){return t?`<div class="er-metric">
          <div class="m-l">${a(e)}</div>
          <div class="m-v">${t}</div>
        </div>`:""}function k(e){return e==="mega_cap_earnings_next_14d"?n("earningsTagPrimary"):e==="yahoo_most_actives_earnings_next_14d"?n("earningsTagActives"):e==="recently_reported"?n("earningsTagRecent"):e==="calendar_highlight_within_45d"?n("earningsTagFallback"):e||n("earningsTagOther")}function I(e){return e==="recently_reported"?"er-badge-recent":e==="calendar_highlight_within_45d"?"er-badge-fallback":e!=null&&e.includes("most_actives")?"er-badge-hot":""}function D(e=new Date){return new Intl.DateTimeFormat("en-CA",{timeZone:"America/New_York"}).format(e)}function A(e,t){const s=/^\d{4}-\d{2}-\d{2}$/;return!s.test(e||"")||!s.test(t||"")?null:Math.round((Date.parse(`${t}T00:00:00Z`)-Date.parse(`${e}T00:00:00Z`))/864e5)}function S(e,t=D()){const s=e==null?void 0:e.nextEarningsDate,r=A(t,s);return r==null?{state:"unknown",days:null}:r<0?{state:"reported",days:-r}:r===0?L(e)?{state:"reported",days:0}:{state:"today",days:0}:{state:"upcoming",days:r}}function L(e){const t=e==null?void 0:e.lastReport;if(!t||t.epsActual==null||!Number.isFinite(Number(t.epsActual)))return!1;const s=A(t.quarter,e.nextEarningsDate);return s!=null&&s>=0&&s<=75}function R(e,t=x()){if(t==="zh-Hant"){const s=M(e==null?void 0:e.ticker);if(s)return{text:s,zh:!0}}return{text:(e==null?void 0:e.whatItDoes)||"",zh:!1}}function O(e){const t=/^(\d{4})-(\d{2})-(\d{2})$/.exec(e||"");if(!t)return e||"";let s="";try{s=new Date(`${e}T12:00:00Z`).toLocaleDateString($(),{weekday:"short",timeZone:"UTC"})}catch{}return`${Number(t[2])}/${Number(t[3])}${s?`（${s}）`:""}`}function C(e,t=D()){const s=new Set,r=new Map,c=[];for(const i of e){if(!(i!=null&&i.ticker)||s.has(i.ticker))continue;s.add(i.ticker);const o=S(i,t);if(o.state==="reported")c.push(i);else if(o.state==="today"||o.state==="upcoming"){const l=i.nextEarningsDate;r.has(l)||r.set(l,{date:l,today:o.state==="today",days:o.days,rows:[]}),r.get(l).rows.push(i)}}const u=[...r.values()].sort((i,o)=>i.date<o.date?-1:i.date>o.date?1:0);return c.sort((i,o)=>i.nextEarningsDate<o.nextEarningsDate?1:-1),{groups:u,reported:c}}function E(e){return`er-c-${String(e).replace(/[^A-Za-z0-9-]/g,"")}`}function v(e){return`<button type="button" class="er-chip" data-er-jump="${a(E(e.ticker))}">${a(e.ticker)}</button>`}function G(e){const{groups:t,reported:s}=C(e);if(!t.length&&!s.length)return"";const r=t.map(c=>`<li class="er-sched-row${c.today?" is-today":""}">
        <span class="er-sched-date">${a(O(c.date))}${c.today?`<em>${a(n("earningsToday"))}</em>`:`<em>${a(n("earningsInDays",{n:c.days}))}</em>`}${c.rows.every(u=>u.nextEarningsDateIsEstimate)?`<em>${a(n("earningsEstimate"))}</em>`:""}</span>
        <span class="er-sched-chips">${c.rows.map(v).join("")}</span>
      </li>`);return s.length&&r.unshift(`<li class="er-sched-row is-done">
        <span class="er-sched-date">${a(n("earningsSchedDone"))}</span>
        <span class="er-sched-chips">${s.map(v).join("")}</span>
      </li>`),`<nav class="er-sched" aria-label="${a(n("earningsSchedTitle"))}">
      <h3 class="er-sched-title">${a(n("earningsSchedTitle"))}</h3>
      <p class="er-sched-lead">${a(n("earningsSchedLead"))}</p>
      <ul class="er-sched-list">${r.join("")}</ul>
    </nav>`}function B(e,t){const s=[],r=e.lastReport||{};if(t.state==="reported"){const c=A(r.quarter,e.nextEarningsDate);if(!(c!=null&&c>=0&&c<=100))return n("earningsReportedPending",{date:e.nextEarningsDate});if(s.push(n("earningsReportedHead",{date:e.nextEarningsDate,q:r.quarter})),r.epsActual!=null){let i=n("earningsReportedEps",{a:d(r.epsActual,2)});if(r.epsEstimate!=null&&r.epsSurprisePct!=null&&Number.isFinite(r.epsSurprisePct)){const o=r.epsSurprisePct>0?"earningsBeat":r.epsSurprisePct<0?"earningsMiss":"earningsInline";i+=n(o,{e:d(r.epsEstimate,2),p:Math.abs(r.epsSurprisePct).toFixed(1)}),r.epsGaap!=null&&Math.abs(Number(r.epsGaap)-Number(r.epsActual))>=.005&&(i+=n("earningsGaapNote",{g:d(r.epsGaap,2)}))}else r.epsBasis==="gaap-estimate-dropped"&&(i+=n("earningsNoSameBasis"));s.push(i)}return s.push(n("earningsNextUnknown")),s.join("")}if(t.state==="upcoming"||t.state==="today"){s.push(t.state==="today"?n("earningsWatchToday"):n("earningsWatchUpcoming",{date:e.nextEarningsDate,n:t.days})),e.consensusEpsNext!=null&&s.push(n("earningsWatchConsensus",{e:d(e.consensusEpsNext,2)}));const c=f(e.revenueYoYPct),u=f(e.epsYoYPct);return c&&u&&s.push(n("earningsWatchTrend",{rev:c,eps:u})),s.join("")}return e.whatToWatch||""}function T(e,{hot:t=!1}={}){var y;if(!e)return"";const s=S(e),r=s.state==="reported",c=e.nextEarningsDate==null?null:r?n("earningsReportedOn",{date:e.nextEarningsDate}):`${e.nextEarningsDate}${e.nextEarningsDateIsEstimate?` (${n("earningsEstimate")})`:""}`,u=s.state==="today"?n("earningsToday"):s.state==="upcoming"?n("earningsInDays",{n:s.days}):"",i=c?`${p(c)}${u?`<span class="er-sub">${a(u)}</span>`:""}`:null,o=B(e,s),l=R(e),h=((y=e.lastReport)==null?void 0:y.epsActual)!=null?`${d(e.lastReport.epsActual,2)}${e.lastReport.quarter?` · ${e.lastReport.quarter}`:""}`:null,m=r?`<span class="er-badge er-badge-recent">${a(n("earningsTagRecent"))}</span>`:t?`<span class="er-badge ${I(e.selectionTag)}">${a(k(e.selectionTag))}</span>`:`<span class="er-badge">${a(n("earningsMag7Badge"))}</span>`;return`
    <article class="er-card${r?" er-card-reported":""}" id="${a(E(e.ticker))}" tabindex="-1" data-ticker="${a(e.ticker)}">
      <div class="er-card-head">
        <div>
          <div class="er-ticker">${a(e.ticker)}</div>
          <div class="er-name">${a(e.name||"")}</div>
        </div>
        ${m}
      </div>
      <div>
        <div class="er-label">${a(n("earningsWhatItDoes"))}</div>
        <p class="er-does${l.zh?" er-does-zh":""}"${!l.zh&&l.text?` title="${a(l.text)}"`:""}${l.zh?"":' lang="en"'}>${l.text?a(l.text):""}</p>
      </div>
      <div class="er-metrics">
        ${g(r?n("earningsLatestDate"):n("earningsNextDate"),i)}
        ${g(n("earningsLastEps"),p(h))}
        ${g(n("earningsRevYoy"),p(f(e.revenueYoYPct)))}
        ${g(n("earningsEpsYoy"),p(f(e.epsYoYPct)))}
        ${g(n("earningsPe"),p(d(e.pe,1)))}
        ${g(n("earningsForwardPe"),p(d(e.forwardPe,1)))}
      </div>
      ${o?`<div>
        <div class="er-label">${a(r?n("earningsResultTitle"):n("earningsWhatToWatch"))}</div>
        <p class="er-watch">${a(o)}</p>
      </div>`:""}
      ${e.blocker?`<p class="er-miss">${a(n("earningsPartialBlocker"))}: ${a(e.blocker)}</p>`:""}
    </article>`}function _(e,t){const s=Array.isArray(t==null?void 0:t.mag7)?t.mag7:[],r=Array.isArray(t==null?void 0:t.watchlistHot)?t.watchlistHot:[];e.innerHTML=`
    <p class="er-meta">${a(n("dataAsOf"))} ${a(P(t==null?void 0:t.asOf))} · ${a(n("earningsUsFocus"))}</p>
    <p class="er-stub" role="note">${a(n("earningsTwStub"))}</p>
    ${G([...s,...r])}
    <div class="er-rule"><strong>${a(n("earningsSelectionTitle"))}</strong> ${a(n("earningsSelectionFallback"))}</div>
        <div class="er-panels">
      <section class="er-panel" aria-label="${a(n("earningsMag7Title"))}">
        <h3 class="er-panel-title">${a(n("earningsMag7Title"))}</h3>
        <p class="er-panel-lead">${a(n("earningsMag7Lead"))}</p>
        <div class="er-cards">
          ${s.length?s.map(c=>T(c,{hot:!1})).join(""):`<p class="er-empty">${a(n("earningsEmpty"))}</p>`}
        </div>
      </section>
      <section class="er-panel" aria-label="${a(n("earningsHotTitle"))}">
        <h3 class="er-panel-title">${a(n("earningsHotTitle"))}</h3>
        <p class="er-panel-lead">${a(n("earningsHotLead"))}</p>
        <div class="er-cards">
          ${r.length?r.map(c=>T(c,{hot:!0})).join(""):`<p class="er-empty">${a(n("earningsHotEmpty"))}</p>`}
        </div>
      </section>
    </div>
    <p class="er-disclaimer" role="note">${a(n("earningsDisclaimer"))}</p>
  `}async function U(e="#er-root"){const t=typeof e=="string"?document.querySelector(e):e;if(!t)return{ok:!1};try{const s=await fetch(N);if(!s.ok)throw new Error(`HTTP ${s.status}`);const r=await s.json();return _(t,r),t.dataset.jumpBound||(t.dataset.jumpBound="1",t.addEventListener("click",c=>{var l,h,m;const u=(h=(l=c.target).closest)==null?void 0:h.call(l,"[data-er-jump]");if(!u)return;const i=t.querySelector(`#${u.dataset.erJump}`);if(!i)return;const o=(m=window.matchMedia)==null?void 0:m.call(window,"(prefers-reduced-motion: reduce)").matches;i.scrollIntoView({behavior:o?"auto":"smooth",block:"start"}),i.focus({preventScroll:!0}),i.classList.remove("er-flash"),i.offsetWidth,i.classList.add("er-flash")})),{ok:!0,data:r}}catch(s){return t.innerHTML=`
      <div class="er-empty" role="status">
        <p>${a(n("earningsLoadError",{msg:s.message||String(s)}))}</p>
      </div>`,{ok:!1,error:s}}}export{A as daysBetweenYmd,S as earningsTiming,U as initEarnings,j as renderEarningsSection,L as sameDayResultIn,C as scheduleGroups,R as whatItDoesText};
