import{e as t,t as n,n as d}from"./index-DrW8AN06.js";import{d as A}from"./index-DrW8AN06.js";const g="./data/txf-desk.json";function T(e){try{return new Date(e).toLocaleString(d(),{timeZone:"Asia/Taipei",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1})+n("taipei")}catch{return e||"—"}}function x(e,s=2){return e==null||Number.isNaN(e)?null:Number(e).toLocaleString(d(),{minimumFractionDigits:s,maximumFractionDigits:s})}function o(e){return e==null||Number.isNaN(e)?null:Number(e).toLocaleString(d(),{maximumFractionDigits:0})}function h(e,s=2){return e==null||Number.isNaN(e)?null:`${e>0?"+":""}${Number(e).toFixed(s)}%`}function m(e,s=2){return e==null||Number.isNaN(e)?null:`${e>0?"+":""}${x(e,s)}`}function $(e){return e==null||Number.isNaN(e)||e===0?"txf-flat":e>0?"txf-up":"txf-down"}function u(e){if(!e)return"—";const s=String(e);return/^\d{6}$/.test(s)?`${s.slice(0,4)}/${s.slice(4,6)}`:s}function N(e){var f,c,a;const s=(f=e==null?void 0:e.contracts)==null?void 0:f.TX,l=s==null?void 0:s.expiredOnSession,i=(c=e==null?void 0:e.calendar)==null?void 0:c.recentSettlement;if(!(l!=null&&l.month)||!((a=s==null?void 0:s.near)!=null&&a.month))return"";const r=i&&i.deliveryMonth===l.month&&i.finalSettlementPrice>0?x(i.finalSettlementPrice,0):null;return r?`<p class="txf-session txf-expired-note">${t(n("txfExpiredNote",{m:u(l.month),d:l.lastTradingDay||i.finalSettlementDay||"—",p:r,n:u(s.near.month)}))}</p>`:""}function b(e){var p;const s=(p=e==null?void 0:e.contracts)==null?void 0:p.TX,l=(s==null?void 0:s.near)||{},i=(e==null?void 0:e.spot)||{},r=(e==null?void 0:e.basis)||{},f=l.change,c=l.changePct,a=$(c??f);return`
    <section class="txf-hero" aria-label="${t(n("txfHeroLabel"))}">
      <div class="txf-hero-main">
        <div class="txf-symbol-row">
          <span class="txf-symbol">TX</span>
          <span class="txf-badge">${t(n("txfNearBadge"))}</span>
          <span class="txf-fund">${t((s==null?void 0:s.nameZh)||n("txfTitle"))} · ${t(u(l.month))}</span>
        </div>
        <div class="txf-price-row ${a}">
          <span class="txf-price">${t(x(l.last,0)||"—")}</span>
          <span class="txf-chg">${t(m(f,0)||"—")}</span>
          <span class="txf-chgp">${t(h(c,2)||"—")}</span>
        </div>
        <p class="txf-session">${t(n("txfSettle"))}: ${t(x(l.settle,0)||"—")}
          · ${t(n("txfVolume"))}: ${t(o(l.volume)||"—")}
          · ${t(n("txfOI"))}: ${t(o(l.openInterest)||"—")}
        </p>
        ${N(e)}
        <p class="txf-session">${t(n("dataAsOf"))} ${t(T(e==null?void 0:e.asOf))}
          · ${t(n("txfSessionDate"))}: ${t((e==null?void 0:e.sessionDate)||"—")}</p>
      </div>
      <div class="txf-hero-side">
        <div class="txf-side-row" data-lq-key="tw" data-lq-sym="^TWII">
          <span class="txf-side-label">${t(n("txfSpotLabel"))}</span>
          <span class="txf-side-val ${$(i.changePct)}" data-lq-field="value">${t(x(i.last,2)||"—")}</span>
          <span class="txf-side-chg ${$(i.changePct)}">${t(h(i.changePct,2)||"—")}</span>
        </div>
        <div class="txf-side-row">
          <span class="txf-side-label">${t(n("txfBasisLabel"))}</span>
          <span class="txf-side-val ${$(r.basisPoints)}">${t(m(r.basisPoints,1)||"—")}</span>
          <span class="txf-side-chg ${$(r.basisPct)}">${t(h(r.basisPct,3)||"—")}</span>
        </div>
        <p class="txf-side-note">${t(r.noteZh||n("txfBasisHint"))}</p>
        <p class="txf-side-note">${t(n("txfMultiplierShort",{n:String((s==null?void 0:s.multiplierTwdPerPoint)??200)}))}</p>
      </div>
    </section>`}function y(e){const s=[];return e!=null&&e.near&&s.push({tag:n("txfNearBadge"),c:e.near}),e!=null&&e.next&&s.push({tag:n("txfNextBadge"),c:e.next}),s.map(({tag:l,c:i})=>{const r=$(i.changePct??i.change);return`<tr>
        <td><span class="txf-pill">${t(l)}</span> ${t(u(i.month))}</td>
        <td class="txf-num ${r}">${t(x(i.last,0)||"—")}</td>
        <td class="txf-num">${t(x(i.settle,0)||"—")}</td>
        <td class="txf-num ${r}">${t(m(i.change,0)||"—")} (${t(h(i.changePct,2)||"—")})</td>
        <td class="txf-num">${t(o(i.volume)||"—")}</td>
        <td class="txf-num">${t(o(i.openInterest)||"—")}</td>
        <td class="txf-num">${t(i.lastTradingDay||"—")}</td>
      </tr>`}).join("")}function v(e){var i,r,f;const l=[["TX",(i=e==null?void 0:e.contracts)==null?void 0:i.TX],["MTX",(r=e==null?void 0:e.contracts)==null?void 0:r.MTX],["TMF",(f=e==null?void 0:e.contracts)==null?void 0:f.TMF]].filter(([,c])=>c==null?void 0:c.near).map(([c,a])=>{const p=a.margin||{};return`
      <article class="txf-contract-card">
        <header class="txf-contract-head">
          <h4>${t(c)} · ${t(a.nameZh||"")}</h4>
          <p class="txf-muted">${t(n("txfMultLabel"))}: NT$${t(o(a.multiplierTwdPerPoint)||"—")}${t(n("txfPerPoint"))}
            · ${t(n("txfMarginInitial"))}: NT$${t(o(p.initial)||"—")}
            · ${t(n("txfMarginMaint"))}: NT$${t(o(p.maintenance)||"—")}</p>
        </header>
        <div class="txf-table-wrap" role="region" tabindex="0" aria-label="${t(c)} ${t(a.nameZh||"")}">
          <table class="txf-table">
            <thead>
              <tr>
                <th>${t(n("txfColMonth"))}</th>
                <th>${t(n("txfColLast"))}</th>
                <th>${t(n("txfColSettle"))}</th>
                <th>${t(n("txfColChange"))}</th>
                <th>${t(n("txfColVolume"))}</th>
                <th>${t(n("txfColOI"))}</th>
                <th>${t(n("txfColLTD"))}</th>
              </tr>
            </thead>
            <tbody>${y(a)}</tbody>
          </table>
        </div>
      </article>`}).join("");return`
    <section class="txf-panel" aria-label="${t(n("txfContractsTitle"))}">
      <h3 class="txf-h3">${t(n("txfContractsTitle"))}</h3>
      <p class="txf-panel-lead">${t(n("txfContractsLead"))}</p>
      ${l}
    </section>`}function P(e){const s=e==null?void 0:e.institutional;if(!(s!=null&&s.byContract))return"";const l=["TX","MTX","TMF"].filter(r=>(s.byContract[r]||[]).length);if(!l.length)return"";const i=l.map(r=>{const f=(s.byContract[r]||[]).map(c=>{const a=c.openInterestNet;return`<tr>
            <td>${t(c.partyZh||"—")}</td>
            <td class="txf-num">${t(o(c.openInterestLong)||"—")}</td>
            <td class="txf-num">${t(o(c.openInterestShort)||"—")}</td>
            <td class="txf-num ${$(a)}">${t(o(a)||"—")}</td>
            <td class="txf-num ${$(c.tradingVolumeNet)}">${t(o(c.tradingVolumeNet)||"—")}</td>
          </tr>`}).join("");return`
        <article class="txf-inst-card">
          <h4>${t(r)}</h4>
          <div class="txf-table-wrap" role="region" tabindex="0" aria-label="${t(r)}">
            <table class="txf-table">
              <thead>
                <tr>
                  <th>${t(n("txfColParty"))}</th>
                  <th>${t(n("txfColLongOI"))}</th>
                  <th>${t(n("txfColShortOI"))}</th>
                  <th>${t(n("txfColNetOI"))}</th>
                  <th>${t(n("txfColNetVol"))}</th>
                </tr>
              </thead>
              <tbody>${f}</tbody>
            </table>
          </div>
        </article>`}).join("");return`
    <section class="txf-panel" aria-label="${t(n("txfInstTitle"))}">
      <h3 class="txf-h3">${t(n("txfInstTitle"))}</h3>
      <p class="txf-panel-lead">${t(n("txfInstLead",{date:s.asOf||"—"}))}</p>
      <div class="txf-inst-grid">${i}</div>
      <p class="txf-footnote">${t(n("txfInstFoot"))}</p>
    </section>`}function C(e){const s=(e==null?void 0:e.calendar)||{},l=s.recentSettlement,i=e==null?void 0:e.putCallRatio;return`
    <section class="txf-panel" aria-label="${t(n("txfCalendarTitle"))}">
      <h3 class="txf-h3">${t(n("txfCalendarTitle"))}</h3>
      <div class="txf-cal-grid">
        <article class="txf-cal-card">
          <h4>${t(n("txfNextLTD"))}</h4>
          <p class="txf-cal-big">${t(s.nextNearLastTradingDay||"—")}</p>
          <p class="txf-muted">${t(n("txfNearMonth"))}: ${t(u(s.nextNearMonth))}
            · ${t(n("txfNextMonth"))}: ${t(u(s.nextNextMonth))}（${t(s.nextNextLastTradingDay||"—")}）</p>
          <p class="txf-muted">${t(s.ruleZh||n("txfLTDRule"))}</p>
        </article>
        <article class="txf-cal-card">
          <h4>${t(n("txfRecentSettle"))}</h4>
          <p class="txf-cal-big">${t(l?x(l.finalSettlementPrice,0):"—")}</p>
          <p class="txf-muted">${t((l==null?void 0:l.finalSettlementDay)||"—")} · ${t((l==null?void 0:l.deliveryMonth)||"")}</p>
          <p class="txf-muted">${t((l==null?void 0:l.contractName)||"")}</p>
        </article>
        ${i?`<article class="txf-cal-card">
          <h4>${t(n("txfPcrTitle"))}</h4>
          <p class="txf-cal-big">${t(x(i.putCallVolumeRatioPct,2)||"—")}%</p>
          <p class="txf-muted">${t(n("txfPcrVol"))}: P ${t(o(i.putVolume)||"—")} / C ${t(o(i.callVolume)||"—")}</p>
          <p class="txf-muted">${t(n("txfPcrOI"))}: ${t(x(i.putCallOIRatioPct,2)||"—")}% · ${t(n("dataAsOf"))} ${t(i.asOf||"—")}</p>
        </article>`:""}
      </div>
    </section>`}function S(){return`
    <section class="txf-panel" aria-label="${t(n("txfExplainTitle"))}">
      <h3 class="txf-h3">${t(n("txfExplainTitle"))}</h3>
      <ul class="txf-explain">
        <li>${t(n("txfExplain1"))}</li>
        <li>${t(n("txfExplain2"))}</li>
        <li>${t(n("txfExplain3"))}</li>
        <li>${t(n("txfExplain4"))}</li>
      </ul>
    </section>`}function L(e){const s=Array.isArray(e==null?void 0:e.sourcesDetail)?e.sourcesDetail:[];return s.length?`
    <section class="txf-panel txf-sources" aria-label="${t(n("txfSourcesTitle"))}">
      <h3 class="txf-h3">${t(n("txfSourcesTitle"))}</h3>
      <ul class="txf-src-list">
        ${s.map(l=>`<li><a href="${t(l.url)}" target="_blank" rel="noopener noreferrer">${t(l.label||l.url)}</a></li>`).join("")}
      </ul>
    </section>`:""}function I(e,s){const l=Array.isArray(s==null?void 0:s.disclaimers)?s.disclaimers:[],i=l.length?`<ul class="txf-disc-list">${l.map(r=>`<li>${t(r)}</li>`).join("")}</ul>`:`<p>${t(n("txfDisclaimer"))}</p>`;e.innerHTML=`
    ${b(s)}
    ${v(s)}
    ${P(s)}
    ${C(s)}
    ${S()}
    ${L(s)}
    <div class="txf-disclaimer" role="note">${i}</div>
  `}async function D(e="#txf-root"){const s=typeof e=="string"?document.querySelector(e):e;if(!s)return{ok:!1};try{const l=await fetch(g);if(!l.ok)throw new Error(`HTTP ${l.status}`);const i=await l.json();return I(s,i),{ok:!0,data:i}}catch(l){return s.innerHTML=`
      <div class="txf-empty" role="status">
        <p>${t(n("txfLoadError",{msg:l.message||String(l)}))}</p>
      </div>`,{ok:!1,error:l}}}export{D as initTxf,A as renderTxfSection};
