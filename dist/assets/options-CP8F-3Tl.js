import{e as o,t as i,n as y,g}from"./index-DrW8AN06.js";import{r as W}from"./index-DrW8AN06.js";const B="./data/us-options-snapshot.json",A="book-mcmillan-options-handbook",w={"covered-call":["optionsSetupCoveredCall","optionsSetupCoveredCallBody","optionsSetupCoveredCallWarn"],"protective-put":["optionsSetupProtectivePut","optionsSetupProtectivePutBody","optionsSetupProtectivePutWarn"],"vertical-spread":["optionsSetupVertical","optionsSetupVerticalBody","optionsSetupVerticalWarn"],"calendar-diagonal":["optionsSetupCalendar","optionsSetupCalendarBody","optionsSetupCalendarWarn"],"straddle-strangle":["optionsSetupStraddle","optionsSetupStraddleBody","optionsSetupStraddleWarn"],butterfly:["optionsSetupButterfly","optionsSetupButterflyBody","optionsSetupButterflyWarn"]};function R(t,e){if(!t||typeof t!="object")return e;const n=g();return t[n]||t["zh-Hant"]||t.en||e}function E(t){return t&&R(t.titleLocalized,t.title)||""}function L(t){if(!t)return[];const e=t.plainTakeawaysLocalized;if(e&&typeof e=="object"){const n=g(),s=e[n]||e["zh-Hant"]||e.en;if(Array.isArray(s)&&s.length)return s}return Array.isArray(t.plainTakeaways)?t.plainTakeaways:[]}function D(t){try{return new Date(t).toLocaleString(y(),{timeZone:"Asia/Taipei",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1})+i("taipei")}catch{return t||"—"}}function u(t,e=2){return t==null||Number.isNaN(t)?null:Number(t).toLocaleString(y(),{minimumFractionDigits:e,maximumFractionDigits:e})}function b(t,e=1){return t==null||Number.isNaN(t)?null:`${(t*100).toFixed(e)}%`}function h(t){return t==null||Number.isNaN(t)?null:`${(t*100).toFixed(1)}%`}function r(t,e=""){return t==null||t===""?"—":`<span class="uo-val">${o(String(t))}${e?o(e):""}</span>`}function v(t){return t==="pass"?i("optionsGatePass"):t==="watch"?i("optionsGateWatch"):t==="fail"?i("optionsGateFail"):i("optionsGateIncomplete")}function $(t){return t==="pass"?"uo-gate-pass":t==="watch"?"uo-gate-watch":t==="fail"?"uo-gate-fail":"uo-gate-incomplete"}function d(t){return!t||t.incomplete||t.label==null?null:t.label==="up"?i("optionsTrendUp",{pct:t.pct!=null?t.pct:"—"}):t.label==="down"?i("optionsTrendDown",{pct:t.pct!=null?t.pct:"—"}):i("optionsTrendFlat",{pct:t.pct!=null?t.pct:"—"})}function C(t){return t==null?null:t>1.2?i("optionsSkewPutHeavy"):t<.8?i("optionsSkewCallHeavy"):i("optionsSkewBalanced")}function S(t){return t==="iv_rich"?i("optionsRegimeIvRich"):t==="iv_cheap"?i("optionsRegimeIvCheap"):t==="iv_fair"?i("optionsRegimeIvFair"):t==="iv_only"?i("optionsRegimeIvOnly"):"—"}function V(t){return t!=null&&t.primaryBook?t.primaryBook:null}function H(t){const e=V(t),n=E(e)||i("optionsBookFallbackTitle"),s=L(e),l=s.length?`<ul class="uo-takeaways">${s.map(a=>`<li>${o(a)}</li>`).join("")}</ul>`:`<p class="uo-muted">${o(i("researchNoTakeaways"))}</p>`;return`
    <aside class="uo-book" aria-label="${o(i("optionsBookCite"))}">
      <div class="uo-book-head">
        <span class="uo-book-badge">${o(i("optionsBookBadge"))}</span>
        <h3 class="uo-book-title">${o(n)}</h3>
      </div>
      <p class="uo-book-lead">${o(i("optionsBookLead"))}</p>
      ${l}
      <p class="uo-book-link">
        <button type="button" class="uo-link-btn" data-jump="research">${o(i("optionsGotoResearch"))}</button>
        <span class="uo-muted">· ${o(A)}</span>
      </p>
    </aside>`}function I(t){const e=t.fundamentals||{},n=t.quality||{},s=e.trailingPE??e.forwardPE,l=e.trailingPE!=null?"":e.forwardPE!=null?` <span class="uo-hint">(${o(i("optionsForwardPe"))})</span>`:"";return`
    <tr data-uo-ticker="${o(t.ticker)}" class="uo-q-row">
      <td>
        <button type="button" class="uo-ticker-btn" data-uo-select="${o(t.ticker)}">
          <span class="uo-ticker">${o(t.ticker)}</span>
          <span class="uo-name">${o(t.name||"")}</span>
        </button>
      </td>
      <td class="num">${r(u(s,1))}${l}</td>
      <td class="num">${r(u(e.priceToBook,2))}</td>
      <td class="num">${r(u(e.debtToEquity,1))}</td>
      <td class="num">${r(b(e.roe))}</td>
      <td>${r(d(e.revenueTrend))}</td>
      <td>${r(d(e.earningsTrend))}</td>
      <td><span class="uo-gate ${$(n.gate)}">${o(v(n.gate))}</span></td>
    </tr>`}function N(t){return t.map(e=>{const n=e.fundamentals||{},s=e.quality||{},l=n.trailingPE??n.forwardPE;return`
      <article class="uo-q-card" data-uo-ticker="${o(e.ticker)}">
        <button type="button" class="uo-ticker-btn" data-uo-select="${o(e.ticker)}">
          <span class="uo-ticker">${o(e.ticker)}</span>
          <span class="uo-name">${o(e.name||"")}</span>
        </button>
        <div class="uo-metrics">
          <div><span class="m-l">${o(i("optionsPe"))}</span> ${r(u(l,1))}</div>
          <div><span class="m-l">${o(i("optionsPb"))}</span> ${r(u(n.priceToBook,2))}</div>
          <div><span class="m-l">${o(i("optionsDebt"))}</span> ${r(u(n.debtToEquity,1))}</div>
          <div><span class="m-l">${o(i("optionsRoe"))}</span> ${r(b(n.roe))}</div>
          <div><span class="m-l">${o(i("optionsRevTrend"))}</span> ${r(d(n.revenueTrend))}</div>
          <div><span class="m-l">${o(i("optionsEarnTrend"))}</span> ${r(d(n.earningsTrend))}</div>
        </div>
        <span class="uo-gate ${$(s.gate)}">${o(v(s.gate))}</span>
      </article>`}).join("")}function q(){return`
    <details class="uo-glossary fold-block">
      <summary>${o(i("optionsGlossaryTitle"))}</summary>
      <dl class="uo-dl">
        <div><dt>${o(i("optionsTermDelta"))}</dt><dd>${o(i("optionsDefDelta"))}</dd></div>
        <div><dt>${o(i("optionsTermIv"))}</dt><dd>${o(i("optionsDefIv"))}</dd></div>
        <div><dt>${o(i("optionsTermHv"))}</dt><dd>${o(i("optionsDefHv"))}</dd></div>
        <div><dt>${o(i("optionsTermAtm"))}</dt><dd>${o(i("optionsDefAtm"))}</dd></div>
        <div><dt>${o(i("optionsTermSkew"))}</dt><dd>${o(i("optionsDefSkew"))}</dd></div>
        <div><dt>${o(i("optionsTermProb"))}</dt><dd>${o(i("optionsDefProb"))}</dd></div>
      </dl>
    </details>`}function j(t){const e=t.setups||[];return e.length?`<div class="uo-setups">
    ${e.map(n=>{const s=w[n.id];if(!s)return"";const[l,a,c]=s,p=n.volAligned?i("optionsSetupVolAligned"):i("optionsSetupVolNotAligned");return`
        <article class="uo-setup${n.volAligned?" is-aligned":""}">
          <h4>${o(i(l))}</h4>
          <p>${o(i(a))}</p>
          <p class="uo-risk-shape">${o(i("optionsRiskShape"))}: ${o(i(c))}</p>
          <p class="uo-muted">${o(p)} · ${o(S(n.volRegime))}</p>
        </article>`}).join("")}
  </div>`:`<p class="uo-muted">${o(i("optionsNoSetups"))}</p>`}function _(t){var p,m;if(!t)return`<p class="uo-muted">${o(i("optionsPickTicker"))}</p>`;const e=t.options,n=t.blockers||[];if(!e)return`
      <div class="uo-blocker" role="status">
        <p><strong>${o(i("optionsChainBlocked"))}</strong></p>
        <p>${o(n.join(" · ")||i("optionsDataMissing"))}</p>
      </div>`;const s=C(e.putCallVolumeRatio),l=e.atmIv==null,a=e.historicalVol==null,c=l?"unknown":a?"iv_only":e.ivHvRatio>=1.25?"iv_rich":e.ivHvRatio<=.8?"iv_cheap":"iv_fair";return`
    <div class="uo-opt-head">
      <div>
        <div class="uo-ticker">${o(t.ticker)}</div>
        <div class="uo-name">${o(t.name||"")}</div>
      </div>
      <span class="uo-gate ${$((p=t.quality)==null?void 0:p.gate)}">${o(v((m=t.quality)==null?void 0:m.gate))}</span>
    </div>
    <p class="uo-opt-note">${o(i("optionsMcmillanFirst"))}</p>
    <div class="uo-opt-grid">
      <div class="uo-opt-metric">
        <div class="m-l">${o(i("optionsAtmIv"))}</div>
        <div class="m-v">${r(l?null:h(e.atmIv))}</div>
        <div class="uo-muted">${o(i("optionsExpiry"))}: ${o(e.expiration||"—")}</div>
      </div>
      <div class="uo-opt-metric">
        <div class="m-l">${o(i("optionsHv"))}</div>
        <div class="m-v">${r(a?null:h(e.historicalVol))}</div>
        <div class="uo-muted">${o(i("optionsIvHv"))}: ${e.ivHvRatio!=null?r(u(e.ivHvRatio,2)+"×"):r(null)}</div>
      </div>
      <div class="uo-opt-metric">
        <div class="m-l">${o(i("optionsVolRegime"))}</div>
        <div class="m-v">${o(S(c))}</div>
        <div class="uo-muted">${s?o(s):""}</div>
      </div>
      <div class="uo-opt-metric">
        <div class="m-l">${o(i("optionsCallPutVol"))}</div>
        <div class="m-v">${r(u(e.callVolume,0))} / ${r(u(e.putVolume,0))}</div>
        <div class="uo-muted">${o(i("optionsAtmStrike"))}: ${r(u(e.atmStrikeCall??e.atmStrikePut,1))}</div>
      </div>
    </div>
    ${(()=>{const f=n.filter(P=>!/atmIv|options fields incomplete/i.test(String(P))||e.historicalVol==null&&!(e.callVolume||e.putVolume)),k=f.length?f:[];return k.length?`<p class="uo-warn">${o(i("optionsPartialBlocker"))}: ${o(k.join(" · "))}</p>`:""})()}
    <h4 class="uo-h">${o(i("optionsEduSetups"))}</h4>
    <p class="uo-panel-lead">${o(i("optionsEduSetupsLead"))}</p>
    ${j(t)}
    <p class="uo-disclaimer" role="note">${o(i("optionsDisclaimer"))}</p>
    ${q()}
  `}function T(t,e,n){const s=Array.isArray(e==null?void 0:e.tickers)?e.tickers:[],l=s.find(a=>a.ticker===n.ticker)||s[0]||null;l&&(n.ticker=l.ticker),t.innerHTML=`
    ${H(e)}
    <p class="uo-meta">${o(i("dataAsOf"))} ${o(D(e==null?void 0:e.asOf))} · ${o(i("optionsUsOnly"))}</p>
        <div class="uo-panels">
      <section class="uo-panel uo-panel-opt" aria-label="${o(i("optionsViewTitle"))}">
        <h3 class="uo-panel-title">${o(i("optionsViewTitle"))}</h3>
        <p class="uo-panel-lead">${o(i("optionsViewLead"))}</p>
        <div class="uo-ticker-chips" role="tablist" aria-label="${o(i("ticker"))}">
          ${s.map(a=>`
            <button type="button" class="uo-chip${a.ticker===n.ticker?" is-active":""}" data-uo-select="${o(a.ticker)}" role="tab" aria-selected="${a.ticker===n.ticker?"true":"false"}">${o(a.ticker)}</button>`).join("")}
        </div>
        <div class="uo-detail" id="uo-detail">
          ${_(l)}
        </div>
      </section>
      <section class="uo-panel" aria-label="${o(i("optionsQualityTitle"))}">
        <h3 class="uo-panel-title">${o(i("optionsQualityTitle"))}</h3>
        <p class="uo-panel-lead">${o(i("optionsQualityLead"))}</p>
        <div class="table-wrap uo-table-wrap">
          <table class="stock-table uo-table">
            <thead>
              <tr>
                <th>${o(i("ticker"))}</th>
                <th>${o(i("optionsPe"))}</th>
                <th>${o(i("optionsPb"))}</th>
                <th>${o(i("optionsDebt"))}</th>
                <th>${o(i("optionsRoe"))}</th>
                <th>${o(i("optionsRevTrend"))}</th>
                <th>${o(i("optionsEarnTrend"))}</th>
                <th>${o(i("optionsGate"))}</th>
              </tr>
            </thead>
            <tbody>
              ${s.length?s.map(I).join(""):`<tr><td colspan="8">${o(i("optionsEmpty"))}</td></tr>`}
            </tbody>
          </table>
        </div>
        <div class="uo-mobile">${s.length?N(s):`<p class="uo-muted">${o(i("optionsEmpty"))}</p>`}</div>
      </section>
    </div>
  `,t.querySelectorAll("[data-uo-select]").forEach(a=>{a.addEventListener("click",()=>{n.ticker=a.getAttribute("data-uo-select"),T(t,e,n)})}),t.querySelectorAll("[data-uo-ticker]").forEach(a=>{a.classList.toggle("is-selected",a.getAttribute("data-uo-ticker")===n.ticker)})}async function O(t="#uo-root"){var n,s;const e=typeof t=="string"?document.querySelector(t):t;if(!e)return{ok:!1};try{const l=await fetch(B);if(!l.ok)throw new Error(`HTTP ${l.status}`);const a=await l.json(),c={ticker:((s=(n=a==null?void 0:a.tickers)==null?void 0:n[0])==null?void 0:s.ticker)||null};return T(e,a,c),{ok:!0,data:a}}catch(l){return e.innerHTML=`
      <div class="uo-blocker" role="alert">
        <p>${o(i("optionsLoadError",{msg:l.message||String(l)}))}</p>
      </div>`,{ok:!1,error:l}}}export{O as initOptions,W as renderOptionsSection};
