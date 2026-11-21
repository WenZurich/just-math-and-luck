import{e as t,t as s,n as d}from"./index-Dzn3jZxE.js";import{d as V}from"./index-Dzn3jZxE.js";const g="./data/txf-desk.json";function b(e){try{return new Date(e).toLocaleString(d(),{timeZone:"Asia/Taipei",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1})+s("taipei")}catch{return e||"—"}}function x(e,n=2){return e==null||Number.isNaN(e)?null:Number(e).toLocaleString(d(),{minimumFractionDigits:n,maximumFractionDigits:n})}function f(e){return e==null||Number.isNaN(e)?null:Number(e).toLocaleString(d(),{maximumFractionDigits:0})}function h(e,n=2){return e==null||Number.isNaN(e)?null:`${e>0?"+":""}${Number(e).toFixed(n)}%`}function m(e,n=2){return e==null||Number.isNaN(e)?null:`${e>0?"+":""}${x(e,n)}`}function $(e){return e==null||Number.isNaN(e)||e===0?"txf-flat":e>0?"txf-up":"txf-down"}function u(e){if(!e)return"—";const n=String(e);return/^\d{6}$/.test(n)?`${n.slice(0,4)}/${n.slice(4,6)}`:n}function T(e){var c,r,o;const n=(c=e==null?void 0:e.contracts)==null?void 0:c.TX,l=n==null?void 0:n.expiredOnSession,i=(r=e==null?void 0:e.calendar)==null?void 0:r.recentSettlement;if(!(l!=null&&l.month)||!((o=n==null?void 0:n.near)!=null&&o.month))return"";const a=i&&i.deliveryMonth===l.month&&i.finalSettlementPrice>0?x(i.finalSettlementPrice,0):null;return a?`<p class="txf-session txf-expired-note">${t(s("txfExpiredNote",{m:u(l.month),d:l.lastTradingDay||i.finalSettlementDay||"—",p:a,n:u(n.near.month)}))}</p>`:""}function N(e){var p;const n=(p=e==null?void 0:e.contracts)==null?void 0:p.TX,l=(n==null?void 0:n.near)||{},i=(e==null?void 0:e.spot)||{},a=(e==null?void 0:e.basis)||{},c=l.change,r=l.changePct,o=$(r??c);return`
    <section class="txf-hero" aria-label="${t(s("txfHeroLabel"))}">
      <div class="txf-hero-main">
        <div class="txf-symbol-row">
          <span class="txf-symbol">TX</span>
          <span class="txf-badge">${t(s("txfNearBadge"))}</span>
          <span class="txf-fund">${t((n==null?void 0:n.nameZh)||s("txfTitle"))} · ${t(u(l.month))}</span>
        </div>
        <div class="txf-price-row ${o}">
          <span class="txf-price">${t(x(l.last,0)||"—")}</span>
          <span class="txf-chg">${t(m(c,0)||"—")}</span>
          <span class="txf-chgp">${t(h(r,2)||"—")}</span>
        </div>
        <p class="txf-session">${t(s("txfSettle"))}: ${t(x(l.settle,0)||"—")}
          · ${t(s("txfVolume"))}: ${t(f(l.volume)||"—")}
          · ${t(s("txfOI"))}: ${t(f(l.openInterest)||"—")}
        </p>
        ${T(e)}
        <p class="txf-session">${t(s("dataAsOf"))} ${t(b(e==null?void 0:e.asOf))}
          · ${t(s("txfSessionDate"))}: ${t((e==null?void 0:e.sessionDate)||"—")}</p>
      </div>
      <div class="txf-hero-side">
        <div class="txf-side-row" data-lq-key="tw" data-lq-sym="^TWII">
          <span class="txf-side-label">${t(s("txfSpotLabel"))}</span>
          <span class="txf-side-val ${$(i.changePct)}" data-lq-field="value">${t(x(i.last,2)||"—")}</span>
          <span class="txf-side-chg ${$(i.changePct)}">${t(h(i.changePct,2)||"—")}</span>
        </div>
        <div class="txf-side-row">
          <span class="txf-side-label">${t(s("txfBasisLabel"))}</span>
          <span class="txf-side-val ${$(a.basisPoints)}">${t(m(a.basisPoints,1)||"—")}</span>
          <span class="txf-side-chg ${$(a.basisPct)}">${t(h(a.basisPct,3)||"—")}</span>
        </div>
        <p class="txf-side-note">${t(a.noteZh||s("txfBasisHint"))}</p>
        <p class="txf-side-note">${t(s("txfMultiplierShort",{n:String((n==null?void 0:n.multiplierTwdPerPoint)??200)}))}</p>
      </div>
    </section>`}function C(e){const n=[];return e!=null&&e.near&&n.push({tag:s("txfNearBadge"),c:e.near}),e!=null&&e.next&&n.push({tag:s("txfNextBadge"),c:e.next}),n.map(({tag:l,c:i})=>{const a=$(i.changePct??i.change),c=r=>t(s(r));return`<tr class="txf-row">
        <td class="txf-cell-month" data-label="${c("txfColMonth")}"><span class="txf-pill">${t(l)}</span> ${t(u(i.month))}</td>
        <td class="txf-num ${a}" data-label="${c("txfColLast")}">${t(x(i.last,0)||"—")}</td>
        <td class="txf-num" data-label="${c("txfColSettle")}">${t(x(i.settle,0)||"—")}</td>
        <td class="txf-num ${a}" data-label="${c("txfColChange")}">${t(m(i.change,0)||"—")} <span class="txf-chg-pct">(${t(h(i.changePct,2)||"—")})</span></td>
        <td class="txf-num" data-label="${c("txfColVolume")}">${t(f(i.volume)||"—")}</td>
        <td class="txf-num" data-label="${c("txfColOI")}">${t(f(i.openInterest)||"—")}</td>
        <td class="txf-num" data-label="${c("txfColLTD")}">${t(i.lastTradingDay||"—")}</td>
      </tr>`}).join("")}function y(e){var i,a,c;const l=[["TX",(i=e==null?void 0:e.contracts)==null?void 0:i.TX],["MTX",(a=e==null?void 0:e.contracts)==null?void 0:a.MTX],["TMF",(c=e==null?void 0:e.contracts)==null?void 0:c.TMF]].filter(([,r])=>r==null?void 0:r.near).map(([r,o])=>{const p=o.margin||{};return`
      <article class="txf-contract-card">
        <header class="txf-contract-head">
          <h4>${t(r)} · ${t(o.nameZh||"")}</h4>
          <p class="txf-muted">${t(s("txfMultLabel"))}: NT$${t(f(o.multiplierTwdPerPoint)||"—")}${t(s("txfPerPoint"))}
            · ${t(s("txfMarginInitial"))}: NT$${t(f(p.initial)||"—")}
            · ${t(s("txfMarginMaint"))}: NT$${t(f(p.maintenance)||"—")}</p>
        </header>
        <div class="txf-table-wrap" role="region" tabindex="0" aria-label="${t(r)} ${t(o.nameZh||"")}">
          <table class="txf-table">
            <thead>
              <tr>
                <th>${t(s("txfColMonth"))}</th>
                <th>${t(s("txfColLast"))}</th>
                <th>${t(s("txfColSettle"))}</th>
                <th>${t(s("txfColChange"))}</th>
                <th>${t(s("txfColVolume"))}</th>
                <th>${t(s("txfColOI"))}</th>
                <th>${t(s("txfColLTD"))}</th>
              </tr>
            </thead>
            <tbody>${C(o)}</tbody>
          </table>
        </div>
      </article>`}).join("");return`
    <section class="txf-panel" aria-label="${t(s("txfContractsTitle"))}">
      <h3 class="txf-h3">${t(s("txfContractsTitle"))}</h3>
      <p class="txf-panel-lead">${t(s("txfContractsLead"))}</p>
      ${l}
    </section>`}function v(e){const n=e==null?void 0:e.institutional;if(!(n!=null&&n.byContract))return"";const l=["TX","MTX","TMF"].filter(a=>(n.byContract[a]||[]).length);if(!l.length)return"";const i=l.map(a=>{const c=(n.byContract[a]||[]).map(r=>{const o=r.openInterestNet;return`<tr class="txf-row txf-row-inst">
            <td class="txf-cell-party" data-label="${t(s("txfColParty"))}">${t(r.partyZh||"—")}</td>
            <td class="txf-num" data-label="${t(s("txfColLongOI"))}">${t(f(r.openInterestLong)||"—")}</td>
            <td class="txf-num" data-label="${t(s("txfColShortOI"))}">${t(f(r.openInterestShort)||"—")}</td>
            <td class="txf-num ${$(o)}" data-label="${t(s("txfColNetOI"))}">${t(f(o)||"—")}</td>
            <td class="txf-num ${$(r.tradingVolumeNet)}" data-label="${t(s("txfColNetVol"))}">${t(f(r.tradingVolumeNet)||"—")}</td>
          </tr>`}).join("");return`
        <article class="txf-inst-card">
          <h4>${t(a)}</h4>
          <div class="txf-table-wrap" role="region" tabindex="0" aria-label="${t(a)}">
            <table class="txf-table">
              <thead>
                <tr>
                  <th>${t(s("txfColParty"))}</th>
                  <th>${t(s("txfColLongOI"))}</th>
                  <th>${t(s("txfColShortOI"))}</th>
                  <th>${t(s("txfColNetOI"))}</th>
                  <th>${t(s("txfColNetVol"))}</th>
                </tr>
              </thead>
              <tbody>${c}</tbody>
            </table>
          </div>
        </article>`}).join("");return`
    <section class="txf-panel" aria-label="${t(s("txfInstTitle"))}">
      <h3 class="txf-h3">${t(s("txfInstTitle"))}</h3>
      <p class="txf-panel-lead">${t(s("txfInstLead",{date:n.asOf||"—"}))}</p>
      <div class="txf-inst-grid">${i}</div>
      <p class="txf-footnote">${t(s("txfInstFoot"))}</p>
    </section>`}function P(e){const n=(e==null?void 0:e.calendar)||{},l=n.recentSettlement,i=e==null?void 0:e.putCallRatio;return`
    <section class="txf-panel" aria-label="${t(s("txfCalendarTitle"))}">
      <h3 class="txf-h3">${t(s("txfCalendarTitle"))}</h3>
      <div class="txf-cal-grid">
        <article class="txf-cal-card">
          <h4>${t(s("txfNextLTD"))}</h4>
          <p class="txf-cal-big">${t(n.nextNearLastTradingDay||"—")}</p>
          <p class="txf-muted">${t(s("txfNearMonth"))}: ${t(u(n.nextNearMonth))}
            · ${t(s("txfNextMonth"))}: ${t(u(n.nextNextMonth))}（${t(n.nextNextLastTradingDay||"—")}）</p>
          <p class="txf-muted">${t(n.ruleZh||s("txfLTDRule"))}</p>
        </article>
        <article class="txf-cal-card">
          <h4>${t(s("txfRecentSettle"))}</h4>
          <p class="txf-cal-big">${t(l?x(l.finalSettlementPrice,0):"—")}</p>
          <p class="txf-muted">${t((l==null?void 0:l.finalSettlementDay)||"—")} · ${t((l==null?void 0:l.deliveryMonth)||"")}</p>
          <p class="txf-muted">${t((l==null?void 0:l.contractName)||"")}</p>
        </article>
        ${i?`<article class="txf-cal-card">
          <h4>${t(s("txfPcrTitle"))}</h4>
          <p class="txf-cal-big">${t(x(i.putCallVolumeRatioPct,2)||"—")}%</p>
          <p class="txf-muted">${t(s("txfPcrVol"))}: P ${t(f(i.putVolume)||"—")} / C ${t(f(i.callVolume)||"—")}</p>
          <p class="txf-muted">${t(s("txfPcrOI"))}: ${t(x(i.putCallOIRatioPct,2)||"—")}% · ${t(s("dataAsOf"))} ${t(i.asOf||"—")}</p>
        </article>`:""}
      </div>
    </section>`}function S(){return`
    <section class="txf-panel" aria-label="${t(s("txfExplainTitle"))}">
      <h3 class="txf-h3">${t(s("txfExplainTitle"))}</h3>
      <ul class="txf-explain">
        <li>${t(s("txfExplain1"))}</li>
        <li>${t(s("txfExplain2"))}</li>
        <li>${t(s("txfExplain3"))}</li>
        <li>${t(s("txfExplain4"))}</li>
      </ul>
    </section>`}function L(e){const n=Array.isArray(e==null?void 0:e.sourcesDetail)?e.sourcesDetail:[];return n.length?`
    <section class="txf-panel txf-sources" aria-label="${t(s("txfSourcesTitle"))}">
      <h3 class="txf-h3">${t(s("txfSourcesTitle"))}</h3>
      <ul class="txf-src-list">
        ${n.map(l=>`<li><a href="${t(l.url)}" target="_blank" rel="noopener noreferrer">${t(l.label||l.url)}</a></li>`).join("")}
      </ul>
    </section>`:""}function I(e,n){const l=Array.isArray(n==null?void 0:n.disclaimers)?n.disclaimers:[],i=l.length?`<ul class="txf-disc-list">${l.map(a=>`<li>${t(a)}</li>`).join("")}</ul>`:`<p>${t(s("txfDisclaimer"))}</p>`;e.innerHTML=`
    ${N(n)}
    ${y(n)}
    ${v(n)}
    ${P(n)}
    ${S()}
    ${L(n)}
    <div class="txf-disclaimer" role="note">${i}</div>
  `}async function M(e="#txf-root"){const n=typeof e=="string"?document.querySelector(e):e;if(!n)return{ok:!1};try{const l=await fetch(g);if(!l.ok)throw new Error(`HTTP ${l.status}`);const i=await l.json();return I(n,i),{ok:!0,data:i}}catch(l){return n.innerHTML=`
      <div class="txf-empty" role="status">
        <p>${t(s("txfLoadError",{msg:l.message||String(l)}))}</p>
      </div>`,{ok:!1,error:l}}}export{M as initTxf,V as renderTxfSection};
