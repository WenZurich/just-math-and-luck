import{e as o,t as e,n as b,g}from"./index-Xx54odt8.js";import{r as x}from"./index-Xx54odt8.js";const B="./data/us-options-snapshot.json",R="book-mcmillan-options-handbook",h={"covered-call":["optionsSetupCoveredCall","optionsSetupCoveredCallBody","optionsSetupCoveredCallWarn"],"protective-put":["optionsSetupProtectivePut","optionsSetupProtectivePutBody","optionsSetupProtectivePutWarn"],"vertical-spread":["optionsSetupVertical","optionsSetupVerticalBody","optionsSetupVerticalWarn"],"calendar-diagonal":["optionsSetupCalendar","optionsSetupCalendarBody","optionsSetupCalendarWarn"],"straddle-strangle":["optionsSetupStraddle","optionsSetupStraddleBody","optionsSetupStraddleWarn"],butterfly:["optionsSetupButterfly","optionsSetupButterflyBody","optionsSetupButterflyWarn"]};function w(t,i){if(!t||typeof t!="object")return i;const s=g();return t[s]||t["zh-Hant"]||t.en||i}function L(t){return t&&w(t.titleLocalized,t.title)||""}function E(t){if(!t)return[];const i=t.plainTakeawaysLocalized;if(i&&typeof i=="object"){const s=g(),n=i[s]||i["zh-Hant"]||i.en;if(Array.isArray(n)&&n.length)return n}return Array.isArray(t.plainTakeaways)?t.plainTakeaways:[]}function D(t){try{return new Date(t).toLocaleString(b(),{timeZone:"Asia/Taipei",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1})+e("taipei")}catch{return t||"—"}}function c(t,i=2){return t==null||Number.isNaN(t)?null:Number(t).toLocaleString(b(),{minimumFractionDigits:i,maximumFractionDigits:i})}function S(t,i=1){return t==null||Number.isNaN(t)?null:`${(t*100).toFixed(i)}%`}function y(t){return t==null||Number.isNaN(t)?null:`${(t*100).toFixed(1)}%`}function r(t,i=""){return t==null||t===""?"—":`<span class="uo-val">${o(String(t))}${i?o(i):""}</span>`}function f(t){return t==="pass"?e("optionsGatePass"):t==="watch"?e("optionsGateWatch"):t==="fail"?e("optionsGateFail"):e("optionsGateIncomplete")}function k(t){return t==="pass"?"uo-gate-pass":t==="watch"?"uo-gate-watch":t==="fail"?"uo-gate-fail":"uo-gate-incomplete"}function $(t){if(!t||t.incomplete||t.label==null)return null;const i=Number(t.pct),s=t.pct!=null&&Number.isFinite(i),n=s?Math.abs(i).toFixed(2).replace(/\.?0+$/,""):"—";if(t.label==="up")return e("optionsTrendUp",{pct:n});if(t.label==="down")return e("optionsTrendDown",{pct:n});const l=s?`${i>0?"+":i<0?"−":""}${n}`:"—";return e("optionsTrendFlat",{pct:l})}function C(t){return t==null?null:t>1.2?e("optionsSkewPutHeavy"):t<.8?e("optionsSkewCallHeavy"):e("optionsSkewBalanced")}function T(t){return t==="iv_rich"?e("optionsRegimeIvRich"):t==="iv_cheap"?e("optionsRegimeIvCheap"):t==="iv_fair"?e("optionsRegimeIvFair"):t==="iv_only"?e("optionsRegimeIvOnly"):"—"}function N(t){return t!=null&&t.primaryBook?t.primaryBook:null}function q(t){const i=N(t),s=L(i)||e("optionsBookFallbackTitle"),n=E(i),l=n.length?`<ul class="uo-takeaways">${n.map(a=>`<li>${o(a)}</li>`).join("")}</ul>`:`<p class="uo-muted">${o(e("researchNoTakeaways"))}</p>`;return`
    <details class="uo-book" aria-label="${o(e("optionsBookCite"))}">
      <summary class="uo-book-head">
        <span class="uo-book-badge">${o(e("optionsBookBadge"))}</span>
        <span class="uo-book-title">${o(s)}</span>
        <span class="uo-book-more">${o(e("optionsBookMore"))}</span>
      </summary>
      <p class="uo-book-lead">${o(e("optionsBookLead"))}</p>
      ${l}
      <p class="uo-book-link">
        <button type="button" class="uo-link-btn" data-jump="research">${o(e("optionsGotoResearch"))}</button>
        <span class="uo-muted">· ${o(R)}</span>
      </p>
    </details>`}function H(t){const i=t.fundamentals||{},s=t.quality||{},n=i.trailingPE??i.forwardPE,l=i.trailingPE!=null?"":i.forwardPE!=null?` <span class="uo-hint">(${o(e("optionsForwardPe"))})</span>`:"";return`
    <tr data-uo-ticker="${o(t.ticker)}" class="uo-q-row">
      <td>
        <button type="button" class="uo-ticker-btn" data-uo-select="${o(t.ticker)}">
          <span class="uo-ticker">${o(t.ticker)}</span>
          <span class="uo-name">${o(t.name||"")}</span>
        </button>
      </td>
      <td class="num">${r(c(n,1))}${l}</td>
      <td class="num">${r(c(i.priceToBook,2))}</td>
      <td class="num">${r(c(i.debtToEquity,1))}</td>
      <td class="num">${r(S(i.roe))}</td>
      <td>${r($(i.revenueTrend))}</td>
      <td>${r($(i.earningsTrend))}</td>
      <td><span class="uo-gate ${k(s.gate)}">${o(f(s.gate))}</span></td>
    </tr>`}function I(t){return t.map(i=>{const s=i.fundamentals||{},n=i.quality||{},l=s.trailingPE??s.forwardPE;return`
      <article class="uo-q-card" data-uo-ticker="${o(i.ticker)}">
        <button type="button" class="uo-ticker-btn" data-uo-select="${o(i.ticker)}">
          <span class="uo-ticker">${o(i.ticker)}</span>
          <span class="uo-name">${o(i.name||"")}</span>
        </button>
        <div class="uo-metrics">
          <div><span class="m-l">${o(e("optionsPe"))}</span> ${r(c(l,1))}</div>
          <div><span class="m-l">${o(e("optionsPb"))}</span> ${r(c(s.priceToBook,2))}</div>
          <div><span class="m-l">${o(e("optionsDebt"))}</span> ${r(c(s.debtToEquity,1))}</div>
          <div><span class="m-l">${o(e("optionsRoe"))}</span> ${r(S(s.roe))}</div>
          <div><span class="m-l">${o(e("optionsRevTrend"))}</span> ${r($(s.revenueTrend))}</div>
          <div><span class="m-l">${o(e("optionsEarnTrend"))}</span> ${r($(s.earningsTrend))}</div>
        </div>
        <span class="uo-gate ${k(n.gate)}">${o(f(n.gate))}</span>
      </article>`}).join("")}function V(){return`
    <details class="uo-glossary fold-block">
      <summary>${o(e("optionsGlossaryTitle"))}</summary>
      <dl class="uo-dl">
        <div><dt>${o(e("optionsTermDelta"))}</dt><dd>${o(e("optionsDefDelta"))}</dd></div>
        <div><dt>${o(e("optionsTermIv"))}</dt><dd>${o(e("optionsDefIv"))}</dd></div>
        <div><dt>${o(e("optionsTermHv"))}</dt><dd>${o(e("optionsDefHv"))}</dd></div>
        <div><dt>${o(e("optionsTermAtm"))}</dt><dd>${o(e("optionsDefAtm"))}</dd></div>
        <div><dt>${o(e("optionsTermSkew"))}</dt><dd>${o(e("optionsDefSkew"))}</dd></div>
        <div><dt>${o(e("optionsTermProb"))}</dt><dd>${o(e("optionsDefProb"))}</dd></div>
      </dl>
    </details>`}function F(t){var a;const i=(t.setups||[]).filter(u=>h[u.id]);if(!i.length)return`<p class="uo-muted">${o(e("optionsNoSetups"))}</p>`;const s=i.filter(u=>u.volAligned).length,n=(a=i.find(u=>u.volRegime))==null?void 0:a.volRegime,l=e("optionsSetupsSummary",{ticker:t.ticker||"",regime:T(n),n:s,total:i.length});return`<p class="uo-setups-summary" role="note">${o(l)}</p>
  <div class="uo-setups">
    ${i.map(u=>{const[d,p,v]=h[u.id],m=u.volAligned?`<span class="uo-fit uo-fit-yes">${o(e("optionsSetupFitYes"))}</span>`:`<span class="uo-fit uo-fit-no">${o(e("optionsSetupFitNo"))}</span>`;return`
        <article class="uo-setup${u.volAligned?" is-aligned":""}">
          <div class="uo-setup-head"><h4>${o(e(d))}</h4>${m}</div>
          <p>${o(e(p))}</p>
          <p class="uo-risk-shape"><span class="uo-risk-k">${o(e("optionsRiskShape"))}</span>${o(e(v))}</p>
        </article>`}).join("")}
  </div>`}function j(t){var d,p;if(!t)return`<p class="uo-muted">${o(e("optionsPickTicker"))}</p>`;const i=t.options,s=t.blockers||[];if(!i)return`
      <div class="uo-blocker" role="status">
        <p><strong>${o(e("optionsChainBlocked"))}</strong></p>
        <p>${o(s.join(" · ")||e("optionsDataMissing"))}</p>
      </div>`;const n=C(i.putCallVolumeRatio),l=i.atmIv==null,a=i.historicalVol==null,u=l?"unknown":a?"iv_only":i.ivHvRatio>=1.25?"iv_rich":i.ivHvRatio<=.8?"iv_cheap":"iv_fair";return`
    <div class="uo-opt-head">
      <div>
        <div class="uo-ticker">${o(t.ticker)}</div>
        <div class="uo-name">${o(t.name||"")}</div>
      </div>
      <span class="uo-gate ${k((d=t.quality)==null?void 0:d.gate)}">${o(f((p=t.quality)==null?void 0:p.gate))}</span>
    </div>
    <p class="uo-opt-note">${o(e("optionsMcmillanFirst"))}</p>
    <div class="uo-opt-grid">
      <div class="uo-opt-metric">
        <div class="m-l">${o(e("optionsAtmIv"))}</div>
        <div class="m-v">${r(l?null:y(i.atmIv))}</div>
        <div class="uo-muted">${o(e("optionsExpiry"))}: ${o(i.expiration||"—")}</div>
      </div>
      <div class="uo-opt-metric">
        <div class="m-l">${o(e("optionsHv"))}</div>
        <div class="m-v">${r(a?null:y(i.historicalVol))}</div>
        <div class="uo-muted">${o(e("optionsIvHv"))}: ${i.ivHvRatio!=null?r(c(i.ivHvRatio,2)+"×"):r(null)}</div>
      </div>
      <div class="uo-opt-metric">
        <div class="m-l">${o(e("optionsVolRegime"))}</div>
        <div class="m-v">${o(T(u))}</div>
        <div class="uo-muted">${n?o(n):""}</div>
      </div>
      <div class="uo-opt-metric">
        <div class="m-l">${o(e("optionsCallPutVol"))}</div>
        <div class="m-v">${r(c(i.callVolume,0))} / ${r(c(i.putVolume,0))}</div>
        <div class="uo-muted">${o(e("optionsAtmStrike"))}: ${r(c(i.atmStrikeCall??i.atmStrikePut,1))}</div>
      </div>
    </div>
    ${(()=>{const v=s.filter(P=>!/atmIv|options fields incomplete/i.test(String(P))||i.historicalVol==null&&!(i.callVolume||i.putVolume)),m=v.length?v:[];return m.length?`<p class="uo-warn">${o(e("optionsPartialBlocker"))}: ${o(m.join(" · "))}</p>`:""})()}
    <h4 class="uo-h">${o(e("optionsEduSetups"))}</h4>
    <p class="uo-panel-lead">${o(e("optionsEduSetupsLead"))}</p>
    ${F(t)}
    <p class="uo-disclaimer" role="note">${o(e("optionsDisclaimer"))}</p>
    ${V()}
  `}function A(t,i,s){const n=Array.isArray(i==null?void 0:i.tickers)?i.tickers:[],l=n.find(a=>a.ticker===s.ticker)||n[0]||null;l&&(s.ticker=l.ticker),t.innerHTML=`
    ${q(i)}
    <p class="uo-meta">${o(e("dataAsOf"))} ${o(D(i==null?void 0:i.asOf))} · ${o(e("optionsUsOnly"))}</p>
        <div class="uo-panels">
      <section class="uo-panel uo-panel-opt" aria-label="${o(e("optionsViewTitle"))}">
        <h3 class="uo-panel-title">${o(e("optionsViewTitle"))}</h3>
        <p class="uo-panel-lead">${o(e("optionsViewLead"))}</p>
        <div class="uo-ticker-chips" role="tablist" aria-label="${o(e("ticker"))}">
          ${n.map(a=>`
            <button type="button" class="uo-chip${a.ticker===s.ticker?" is-active":""}" data-uo-select="${o(a.ticker)}" role="tab" aria-selected="${a.ticker===s.ticker?"true":"false"}">${o(a.ticker)}</button>`).join("")}
        </div>
        <div class="uo-detail" id="uo-detail">
          ${j(l)}
        </div>
      </section>
      <section class="uo-panel" aria-label="${o(e("optionsQualityTitle"))}">
        <h3 class="uo-panel-title">${o(e("optionsQualityTitle"))}</h3>
        <p class="uo-panel-lead">${o(e("optionsQualityLead"))}</p>
        <div class="table-wrap uo-table-wrap">
          <table class="stock-table uo-table">
            <thead>
              <tr>
                <th>${o(e("ticker"))}</th>
                <th>${o(e("optionsPe"))}</th>
                <th>${o(e("optionsPb"))}</th>
                <th>${o(e("optionsDebt"))}</th>
                <th>${o(e("optionsRoe"))}</th>
                <th>${o(e("optionsRevTrend"))}</th>
                <th>${o(e("optionsEarnTrend"))}</th>
                <th>${o(e("optionsGate"))}</th>
              </tr>
            </thead>
            <tbody>
              ${n.length?n.map(H).join(""):`<tr><td colspan="8">${o(e("optionsEmpty"))}</td></tr>`}
            </tbody>
          </table>
        </div>
        <div class="uo-mobile">${n.length?I(n):`<p class="uo-muted">${o(e("optionsEmpty"))}</p>`}</div>
      </section>
    </div>
  `,t.querySelectorAll("[data-uo-select]").forEach(a=>{a.addEventListener("click",()=>{s.ticker=a.getAttribute("data-uo-select");const u=a.classList.contains("uo-chip")?"uo-chip":a.closest(".uo-mobile")?"uo-mobile-btn":"uo-table-btn";A(t,i,s);const d=u==="uo-chip"?t.querySelectorAll(".uo-chip"):u==="uo-mobile-btn"?t.querySelectorAll(".uo-mobile [data-uo-select]"):t.querySelectorAll(".uo-table [data-uo-select]"),p=Array.from(d).find(v=>v.getAttribute("data-uo-select")===s.ticker);p&&typeof p.focus=="function"&&p.focus({preventScroll:!0})})}),t.querySelectorAll("[data-uo-ticker]").forEach(a=>{a.classList.toggle("is-selected",a.getAttribute("data-uo-ticker")===s.ticker)})}async function O(t="#uo-root"){var s,n;const i=typeof t=="string"?document.querySelector(t):t;if(!i)return{ok:!1};try{const l=await fetch(B);if(!l.ok)throw new Error(`HTTP ${l.status}`);const a=await l.json(),u={ticker:((n=(s=a==null?void 0:a.tickers)==null?void 0:s[0])==null?void 0:n.ticker)||null};return A(i,a,u),{ok:!0,data:a}}catch(l){return i.innerHTML=`
      <div class="uo-blocker" role="alert">
        <p>${o(e("optionsLoadError",{msg:l.message||String(l)}))}</p>
      </div>`,{ok:!1,error:l}}}export{O as initOptions,x as renderOptionsSection,$ as trendLabel};
