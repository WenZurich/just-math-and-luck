import{e as s,t as l,n as E}from"./index-Duer7o0E.js";import{c as ps}from"./index-Duer7o0E.js";const ss="./data/soxl-desk.json";function es(i){try{return new Date(i).toLocaleString(E(),{timeZone:"Asia/Taipei",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1})+l("taipei")}catch{return i||"—"}}function x(i,e=2){return i==null||Number.isNaN(i)?null:Number(i).toLocaleString(E(),{minimumFractionDigits:e,maximumFractionDigits:e})}function m(i,e=2){return i==null||Number.isNaN(i)?null:`${i>0?"+":""}${Number(i).toFixed(e)}%`}function d(i,e=2){return i==null||Number.isNaN(i)?null:`${i>0?"+":(i<0,"")}${x(i,e)}`}const v=6;function ns(i){return i.map((e,o)=>({n:e,i:o,d:/^\d{4}-\d{2}-\d{2}/.test((e==null?void 0:e.published)||"")?e.published.slice(0,10):""})).sort((e,o)=>e.d===o.d?e.i-o.i:e.d?o.d&&e.d<o.d?1:-1:1).map(e=>e.n)}function ls(i){try{return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Taipei"}).format(new Date(i))}catch{return null}}function is(i,e){const o=/^\d{4}-\d{2}-\d{2}/.test(i||"")?Date.parse(i.slice(0,10)+"T00:00:00Z"):NaN,t=/^\d{4}-\d{2}-\d{2}$/.test(e||"")?Date.parse(e+"T00:00:00Z"):NaN;return!Number.isFinite(o)||!Number.isFinite(t)?null:Math.max(0,Math.round((t-o)/864e5))}function p(i){return i==null||Number.isNaN(i)||i===0?"sx-flat":i>0?"sx-up":"sx-down"}function os(i){return/overnight|extended|Blue Ocean|盤後|夜盤/i.test(String(i||""))}function ts(i,e){var C,D,O;const o=(e==null?void 0:e.quote)||{},t=o.regularClose,a=(t==null?void 0:t.price)!=null&&os(o.session),$=a?{price:t.price,change:t.change,changePct:t.changePct,session:t.session||l("soxlRegularClose")}:{price:o.price,change:o.change,changePct:o.changePct,session:o.session},f=$.change,w=$.changePct,R=p(w??f),k=a?`<p class="sx-regular sx-overnight">${s(l("soxlOvernight"))}: $${s(x(o.price,2)||"—")}
        <span class="${p(o.changePct)}">${s(d(o.change,2)||"")} (${s(m(o.changePct,2)||"")})</span>
        ${o.session?` · ${s(o.session)}`:""}</p>`:(t==null?void 0:t.price)!=null?`<p class="sx-regular">${s(l("soxlRegularClose"))}: $${s(x(t.price,2))}
          <span class="${p(t.changePct)}">${s(d(t.change,2)||"")} (${s(m(t.changePct,2)||"")})</span>
          ${t.session?` · ${s(t.session)}`:""}</p>`:"",q=`
    <section class="sx-hero" aria-label="${s(l("soxlHeroLabel"))}">
      <div class="sx-hero-main">
        <div class="sx-symbol-row">
          <span class="sx-symbol">SOXL</span>
          <span class="sx-badge">3×</span>
          <span class="sx-fund">${s((e==null?void 0:e.fundName)||l("soxlFundFallback"))}</span>
        </div>
        <div class="sx-price-row ${R}"${a?"":' data-lq="soxl" data-lq-sym="SOXL"'}>
          <span class="sx-price"${a?"":' data-lq-field="price"'}>$${s(x($.price,2)||"—")}</span>
          <span class="sx-chg">${s(d(f,2)||"—")}</span>
          <span class="sx-chgp"${a?"":' data-lq-field="dayPct"'}>${s(m(w,2)||"—")}</span>
        </div>
        <p class="sx-session">${s($.session||"")} · ${s(l("dataAsOf"))} ${s(es(e==null?void 0:e.asOf))}</p>
        ${k}
      </div>
      <div class="sx-hero-side">
        <p class="sx-lev">${s(l("soxlLeverageNote"))}</p>
        <p class="sx-hold-date"><strong>${s(l("soxlHoldingsAsOf"))}</strong> ${s((e==null?void 0:e.holdingsAsOf)||"—")}
          <span class="sx-muted">（${s(l("soxlHoldingsNotSameDay"))}）</span></p>
      </div>
    </section>`,b=Array.isArray(e==null?void 0:e.events)?e.events:[],j=b.length?`<section class="sx-events" aria-label="${s(l("soxlEventsTitle"))}">
        <h3 class="sx-h3">${s(l("soxlEventsTitle"))}</h3>
        <ul class="sx-event-list">
          ${b.map(n=>`<li class="sx-event sx-sev-${s(n.severity||"info")}">
              <div class="sx-event-title">${s(n.title||"")}</div>
              <p class="sx-event-detail">${s(n.detail||"")}</p>
            </li>`).join("")}
        </ul>
      </section>`:"",u=ns(Array.isArray(e==null?void 0:e.news)?e.news:[]),F=ls(e==null?void 0:e.asOf),N=(n,c)=>{const r=is(n.published,F),g=r==null?"":r<=0?l("soxlNewsAgeToday"):l("soxlNewsAgeDays",{n:String(r)});return`<a class="sx-news-card${c===0?" sx-news-latest":""}" href="${s(n.url||"#")}" target="_blank" rel="noopener noreferrer">
              ${c===0&&r!=null&&r<=3?`<span class="sx-news-chip">${s(l("soxlNewsLatest"))}</span>`:""}
              <div class="sx-news-title">${s(n.title||"")}</div>
              ${n.published?`<div class="sx-news-meta"><time datetime="${s(n.published)}">${s(n.published)}</time>${g?` · ${s(g)}`:""}</div>`:""}
              ${n.summary?`<p class="sx-news-sum">${s(n.summary)}</p>`:""}
            </a>`},M=u.slice(0,v),h=u.slice(v),_=`
    <section class="sx-news" aria-label="${s(l("soxlNewsTitle"))}">
      <h3 class="sx-h3">${s(l("soxlNewsTitle"))}</h3>
      ${u.length?`<p class="sx-panel-lead sx-news-lead">${s(l("soxlNewsLead",{n:String(u.length)}))}</p>`:""}
      <div class="sx-news-list">
        ${u.length?M.map(N).join(""):`<p class="sx-empty">${s(l("soxlNewsEmpty"))}</p>`}
      </div>
      ${h.length?`<details class="sx-news-more">
        <summary>${s(l("soxlNewsOlder",{n:String(h.length)}))}</summary>
        <div class="sx-news-list">${h.map((n,c)=>N(n,c+v)).join("")}</div>
      </details>`:""}
    </section>`,A=Array.isArray(e==null?void 0:e.holdings)?e.holdings:[],U={equity:"soxlTypeEquity",cash_equivalent:"soxlTypeCash",swap:"soxlTypeSwap"},T=n=>l(U[n]||"soxlTypeOther"),W=n=>/^\d{4}-(\d{2})-(\d{2})$/.test(n||"")?`${Number(n.slice(5,7))}/${Number(n.slice(8,10))}`:n||"",Z=((C=A.find(n=>n.changePctAsOf))==null?void 0:C.changePctAsOf)||null,X=A.map(n=>{const c=n.instrumentType==="equity",r=n.ticker||T(n.instrumentType),g=p(n.changePct),J=p(n.contributionPct),Q=Array.isArray(n.reasons)?n.reasons:[],H=Array.isArray(n.sources)?n.sources:[],L=c?"—":l("soxlNoDailyMove");return`<tr class="sx-row sx-row-${s(n.instrumentType||"other")}">
        <td class="sx-cell-name">
          <div class="sx-tk">${s(String(r))}</div>
          <div class="sx-name">${s(n.name||"")}</div>
          ${n.instrumentType&&n.ticker?`<span class="sx-itype">${s(T(n.instrumentType))}</span>`:""}
        </td>
        <td class="sx-num" data-label="${s(l("soxlColWeight"))}">${n.weightPct!=null?s(x(n.weightPct,2))+"%":"—"}</td>
        <td class="sx-num ${g}" data-label="${s(l("soxlColReturn"))}">${n.changePct!=null?`${s(m(n.changePct,2))}${n.changePctAsOf?`<span class="sx-asof">${s(l("soxlReturnAsOf",{date:W(n.changePctAsOf)}))}</span>`:""}`:`<span class="sx-na">${s(L)}</span>`}</td>
        <td class="sx-num ${J}" data-label="${s(l("soxlColContrib"))}" title="${s(l("soxlContributionHint"))}">
          ${n.contributionPct!=null?`${s(d(n.contributionPct,3))} <span class="sx-unit">${s(l("soxlPp"))}</span>*`:`<span class="sx-na">${s(L)}</span>`}
        </td>
        <td class="sx-reasons" data-label="${s(l("soxlColReasons"))}">
          <ul>${Q.map(y=>`<li>${s(y)}</li>`).join("")}</ul>
          ${H.length?`<div class="sx-srcs">${H.slice(0,3).map((y,V)=>`<a href="${s(y)}" target="_blank" rel="noopener noreferrer">${s(l("soxlSourceN",{n:String(V+1)}))}</a>`).join(" · ")}</div>`:""}
        </td>
      </tr>`}).join(""),Y=e!=null&&e.holdingsAsOf?l("soxlHoldingsLeadDated",{date:e.holdingsAsOf,day:Z||"—"}):l("soxlHoldingsLead"),P=((D=e==null?void 0:e.holdingsSource)==null?void 0:D.index_url)||((O=e==null?void 0:e.holdingsSource)==null?void 0:O.url),B=`
    <section class="sx-holdings" aria-label="${s(l("soxlHoldingsTitle"))}">
      <h3 class="sx-h3">${s(l("soxlHoldingsTitle"))}</h3>
      <p class="sx-panel-lead">${s(Y)}${P?` <a href="${s(P)}" target="_blank" rel="noopener noreferrer">SEC N-PORT</a>`:""}</p>
      <div class="sx-table-wrap">
        <table class="sx-table">
          <caption class="sx-sr-only">${s(l("soxlHoldingsTitle"))}</caption>
          <thead>
            <tr>
              <th scope="col">${s(l("soxlColName"))}</th>
              <th scope="col">${s(l("soxlColWeight"))}</th>
              <th scope="col">${s(l("soxlColReturn"))}</th>
              <th scope="col">${s(l("soxlColContrib"))}</th>
              <th scope="col">${s(l("soxlColReasons"))}</th>
            </tr>
          </thead>
          <tbody>${X||`<tr><td colspan="5">${s(l("soxlHoldingsEmpty"))}</td></tr>`}</tbody>
        </table>
      </div>
      <p class="sx-footnote">* ${s(l("soxlContributionHint"))}</p>
    </section>`,I=Array.isArray(e==null?void 0:e.overallUpReasons)?e.overallUpReasons:[],K=Array.isArray(e==null?void 0:e.overallDownReasons)?e.overallDownReasons:[],z=`
    <section class="sx-overall" aria-label="${s(l("soxlOverallTitle"))}">
      <h3 class="sx-h3">${s(l("soxlOverallTitle"))}</h3>
      <div class="sx-overall-grid">
        <article class="sx-card sx-card-up">
          <h4>${s(l("soxlWhyUp"))}</h4>
          <ul>${I.map(n=>`<li>${s(n)}</li>`).join("")||`<li>${s(l("earningsDataMissing"))}</li>`}</ul>
        </article>
        <article class="sx-card sx-card-down">
          <h4>${s(l("soxlWhyDown"))}</h4>
          <ul>${K.map(n=>`<li>${s(n)}</li>`).join("")||`<li>${s(l("earningsDataMissing"))}</li>`}</ul>
        </article>
      </div>
    </section>`,S=Array.isArray(e==null?void 0:e.disclaimers)?e.disclaimers:[],G=S.length?`<ul class="sx-disc-list">${S.map(n=>`<li>${s(n)}</li>`).join("")}</ul>`:`<p>${s(l("soxlDisclaimer"))}</p>`;i.innerHTML=`
    ${q}
    ${j}
    ${_}
    ${B}
    ${z}
    <div class="sx-disclaimer" role="note">${G}</div>
  `}async function cs(i="#sx-root"){const e=typeof i=="string"?document.querySelector(i):i;if(!e)return{ok:!1};try{const o=await fetch(ss);if(!o.ok)throw new Error(`HTTP ${o.status}`);const t=await o.json();return ts(e,t),{ok:!0,data:t}}catch(o){return e.innerHTML=`
      <div class="sx-empty" role="status">
        <p>${s(l("soxlLoadError",{msg:o.message||String(o)}))}</p>
      </div>`,{ok:!1,error:o}}}export{v as SOXL_NEWS_HEAD,cs as initSoxl,is as newsAgeDays,ps as renderSoxlSection,ns as sortNewsNewestFirst};
