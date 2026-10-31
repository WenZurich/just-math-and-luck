import{e as s,t as n,n as C}from"./index-DrW8AN06.js";import{c as ns}from"./index-DrW8AN06.js";const G="./data/soxl-desk.json";function I(o){try{return new Date(o).toLocaleString(C(),{timeZone:"Asia/Taipei",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1})+n("taipei")}catch{return o||"—"}}function a(o,e=2){return o==null||Number.isNaN(o)?null:Number(o).toLocaleString(C(),{minimumFractionDigits:e,maximumFractionDigits:e})}function p(o,e=2){return o==null||Number.isNaN(o)?null:`${o>0?"+":""}${Number(o).toFixed(e)}%`}function $(o,e=2){return o==null||Number.isNaN(o)?null:`${o>0?"+":(o<0,"")}${a(o,e)}`}function c(o){return o==null||Number.isNaN(o)||o===0?"sx-flat":o>0?"sx-up":"sx-down"}function J(o){return/overnight|extended|Blue Ocean|盤後|夜盤/i.test(String(o||""))}function Q(o,e){var w,A,P;const i=(e==null?void 0:e.quote)||{},t=i.regularClose,r=(t==null?void 0:t.price)!=null&&J(i.session),x=r?{price:t.price,change:t.change,changePct:t.changePct,session:t.session||n("soxlRegularClose")}:{price:i.price,change:i.change,changePct:i.changePct,session:i.session},g=x.change,m=x.changePct,H=c(m??g),O=r?`<p class="sx-regular sx-overnight">${s(n("soxlOvernight"))}: $${s(a(i.price,2)||"—")}
        <span class="${c(i.changePct)}">${s($(i.change,2)||"")} (${s(p(i.changePct,2)||"")})</span>
        ${i.session?` · ${s(i.session)}`:""}</p>`:(t==null?void 0:t.price)!=null?`<p class="sx-regular">${s(n("soxlRegularClose"))}: $${s(a(t.price,2))}
          <span class="${c(t.changePct)}">${s($(t.change,2)||"")} (${s(p(t.changePct,2)||"")})</span>
          ${t.session?` · ${s(t.session)}`:""}</p>`:"",S=`
    <section class="sx-hero" aria-label="${s(n("soxlHeroLabel"))}">
      <div class="sx-hero-main">
        <div class="sx-symbol-row">
          <span class="sx-symbol">SOXL</span>
          <span class="sx-badge">3×</span>
          <span class="sx-fund">${s((e==null?void 0:e.fundName)||n("soxlFundFallback"))}</span>
        </div>
        <div class="sx-price-row ${H}"${r?"":' data-lq="soxl" data-lq-sym="SOXL"'}>
          <span class="sx-price"${r?"":' data-lq-field="price"'}>$${s(a(x.price,2)||"—")}</span>
          <span class="sx-chg">${s($(g,2)||"—")}</span>
          <span class="sx-chgp"${r?"":' data-lq-field="dayPct"'}>${s(p(m,2)||"—")}</span>
        </div>
        <p class="sx-session">${s(x.session||"")} · ${s(n("dataAsOf"))} ${s(I(e==null?void 0:e.asOf))}</p>
        ${O}
      </div>
      <div class="sx-hero-side">
        <p class="sx-lev">${s(n("soxlLeverageNote"))}</p>
        <p class="sx-hold-date"><strong>${s(n("soxlHoldingsAsOf"))}</strong> ${s((e==null?void 0:e.holdingsAsOf)||"—")}
          <span class="sx-muted">（${s(n("soxlHoldingsNotSameDay"))}）</span></p>
      </div>
    </section>`,h=Array.isArray(e==null?void 0:e.events)?e.events:[],L=h.length?`<section class="sx-events" aria-label="${s(n("soxlEventsTitle"))}">
        <h3 class="sx-h3">${s(n("soxlEventsTitle"))}</h3>
        <ul class="sx-event-list">
          ${h.map(l=>`<li class="sx-event sx-sev-${s(l.severity||"info")}">
              <div class="sx-event-title">${s(l.title||"")}</div>
              <p class="sx-event-detail">${s(l.detail||"")}</p>
            </li>`).join("")}
        </ul>
      </section>`:"",d=Array.isArray(e==null?void 0:e.news)?e.news:[],D=`
    <section class="sx-news" aria-label="${s(n("soxlNewsTitle"))}">
      <h3 class="sx-h3">${s(n("soxlNewsTitle"))}</h3>
      <div class="sx-news-list">
        ${d.length?d.map(l=>`<a class="sx-news-card" href="${s(l.url||"#")}" target="_blank" rel="noopener noreferrer">
              <div class="sx-news-title">${s(l.title||"")}</div>
              ${l.published?`<div class="sx-news-meta">${s(l.published)}</div>`:""}
              ${l.summary?`<p class="sx-news-sum">${s(l.summary)}</p>`:""}
            </a>`).join(""):`<p class="sx-empty">${s(n("soxlNewsEmpty"))}</p>`}
      </div>
    </section>`,y=Array.isArray(e==null?void 0:e.holdings)?e.holdings:[],R={equity:"soxlTypeEquity",cash_equivalent:"soxlTypeCash",swap:"soxlTypeSwap"},v=l=>n(R[l]||"soxlTypeOther"),k=l=>/^\d{4}-(\d{2})-(\d{2})$/.test(l||"")?`${Number(l.slice(5,7))}/${Number(l.slice(8,10))}`:l||"",q=((w=y.find(l=>l.changePctAsOf))==null?void 0:w.changePctAsOf)||null,E=y.map(l=>{const X=l.instrumentType==="equity",Y=l.ticker||v(l.instrumentType),B=c(l.changePct),K=c(l.contributionPct),Z=Array.isArray(l.reasons)?l.reasons:[],N=Array.isArray(l.sources)?l.sources:[],T=X?"—":n("soxlNoDailyMove");return`<tr class="sx-row sx-row-${s(l.instrumentType||"other")}">
        <td class="sx-cell-name">
          <div class="sx-tk">${s(String(Y))}</div>
          <div class="sx-name">${s(l.name||"")}</div>
          ${l.instrumentType&&l.ticker?`<span class="sx-itype">${s(v(l.instrumentType))}</span>`:""}
        </td>
        <td class="sx-num" data-label="${s(n("soxlColWeight"))}">${l.weightPct!=null?s(a(l.weightPct,2))+"%":"—"}</td>
        <td class="sx-num ${B}" data-label="${s(n("soxlColReturn"))}">${l.changePct!=null?`${s(p(l.changePct,2))}${l.changePctAsOf?`<span class="sx-asof">${s(n("soxlReturnAsOf",{date:k(l.changePctAsOf)}))}</span>`:""}`:`<span class="sx-na">${s(T)}</span>`}</td>
        <td class="sx-num ${K}" data-label="${s(n("soxlColContrib"))}" title="${s(n("soxlContributionHint"))}">
          ${l.contributionPct!=null?`${s($(l.contributionPct,3))} <span class="sx-unit">${s(n("soxlPp"))}</span>*`:`<span class="sx-na">${s(T)}</span>`}
        </td>
        <td class="sx-reasons" data-label="${s(n("soxlColReasons"))}">
          <ul>${Z.map(u=>`<li>${s(u)}</li>`).join("")}</ul>
          ${N.length?`<div class="sx-srcs">${N.slice(0,3).map((u,z)=>`<a href="${s(u)}" target="_blank" rel="noopener noreferrer">${s(n("soxlSourceN",{n:String(z+1)}))}</a>`).join(" · ")}</div>`:""}
        </td>
      </tr>`}).join(""),j=e!=null&&e.holdingsAsOf?n("soxlHoldingsLeadDated",{date:e.holdingsAsOf,day:q||"—"}):n("soxlHoldingsLead"),f=((A=e==null?void 0:e.holdingsSource)==null?void 0:A.index_url)||((P=e==null?void 0:e.holdingsSource)==null?void 0:P.url),M=`
    <section class="sx-holdings" aria-label="${s(n("soxlHoldingsTitle"))}">
      <h3 class="sx-h3">${s(n("soxlHoldingsTitle"))}</h3>
      <p class="sx-panel-lead">${s(j)}${f?` <a href="${s(f)}" target="_blank" rel="noopener noreferrer">SEC N-PORT</a>`:""}</p>
      <div class="sx-table-wrap">
        <table class="sx-table">
          <caption class="sx-sr-only">${s(n("soxlHoldingsTitle"))}</caption>
          <thead>
            <tr>
              <th scope="col">${s(n("soxlColName"))}</th>
              <th scope="col">${s(n("soxlColWeight"))}</th>
              <th scope="col">${s(n("soxlColReturn"))}</th>
              <th scope="col">${s(n("soxlColContrib"))}</th>
              <th scope="col">${s(n("soxlColReasons"))}</th>
            </tr>
          </thead>
          <tbody>${E||`<tr><td colspan="5">${s(n("soxlHoldingsEmpty"))}</td></tr>`}</tbody>
        </table>
      </div>
      <p class="sx-footnote">* ${s(n("soxlContributionHint"))}</p>
    </section>`,_=Array.isArray(e==null?void 0:e.overallUpReasons)?e.overallUpReasons:[],F=Array.isArray(e==null?void 0:e.overallDownReasons)?e.overallDownReasons:[],U=`
    <section class="sx-overall" aria-label="${s(n("soxlOverallTitle"))}">
      <h3 class="sx-h3">${s(n("soxlOverallTitle"))}</h3>
      <div class="sx-overall-grid">
        <article class="sx-card sx-card-up">
          <h4>${s(n("soxlWhyUp"))}</h4>
          <ul>${_.map(l=>`<li>${s(l)}</li>`).join("")||`<li>${s(n("earningsDataMissing"))}</li>`}</ul>
        </article>
        <article class="sx-card sx-card-down">
          <h4>${s(n("soxlWhyDown"))}</h4>
          <ul>${F.map(l=>`<li>${s(l)}</li>`).join("")||`<li>${s(n("earningsDataMissing"))}</li>`}</ul>
        </article>
      </div>
    </section>`,b=Array.isArray(e==null?void 0:e.disclaimers)?e.disclaimers:[],W=b.length?`<ul class="sx-disc-list">${b.map(l=>`<li>${s(l)}</li>`).join("")}</ul>`:`<p>${s(n("soxlDisclaimer"))}</p>`;o.innerHTML=`
    ${S}
    ${L}
    ${D}
    ${M}
    ${U}
    <div class="sx-disclaimer" role="note">${W}</div>
  `}async function ss(o="#sx-root"){const e=typeof o=="string"?document.querySelector(o):o;if(!e)return{ok:!1};try{const i=await fetch(G);if(!i.ok)throw new Error(`HTTP ${i.status}`);const t=await i.json();return Q(e,t),{ok:!0,data:t}}catch(i){return e.innerHTML=`
      <div class="sx-empty" role="status">
        <p>${s(n("soxlLoadError",{msg:i.message||String(i)}))}</p>
      </div>`,{ok:!1,error:i}}}export{ss as initSoxl,ns as renderSoxlSection};
