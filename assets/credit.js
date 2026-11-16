/* Ouvrium DEMO store-credit wallet. Preview only: lives in this browser (localStorage), no real money, no payment fields.
   Credit is earned only from 90% buybacks; it spends 1:1 on packs (full or partial) and on shop singles at shelf price.
   It can never be withdrawn, transferred or exchanged for money. */
(function(){
"use strict";
const O=window.OUV;if(!O)return;const LS=O.LS;
const T=(en,fr)=>`<span data-l="en">${en}</span><span data-l="fr">${fr}</span>`;
const r2=x=>Math.round(x*100)/100;
O.T=O.T||T;O.r2=r2;
O.creditHist=()=>LS.get("ouv_credit_hist",[]);
function log(type,amt,en,fr,extra){const h=O.creditHist();h.unshift(Object.assign({ts:Date.now(),type,amt:r2(amt),en,fr,bal:O.credit()},extra||{}));LS.set("ouv_credit_hist",h.slice(0,300))}
// one-time: give earlier demo buybacks (made before history existed) an opening line
if(O.credit()>0&&!O.creditHist().length)log("earn",O.credit(),"Opening balance (earlier demo buybacks)","Solde d'ouverture (rachats démo précédents)");
function changed(){badge();document.dispatchEvent(new CustomEvent("ouv:credit",{detail:O.credit()}))}
O.creditEarn=(amt,en,fr)=>{amt=r2(amt);if(!(amt>0))return;LS.set("ouv_credit",r2(O.credit()+amt));log("earn",amt,en||"Buyback at 90%",fr||"Rachat à 90 %");changed()};
O.creditSpend=(amt,en,fr,extra)=>{amt=r2(amt);if(!(amt>0))return true;if(amt>O.credit()+1e-9)return false;LS.set("ouv_credit",r2(O.credit()-amt));log("spend",-amt,en,fr,extra);changed();return true};
O.addCredit=x=>O.creditEarn(x); // older callers (buyback in the reveal)

/* ---------- wallet badge in the header ---------- */
function badge(){
  const links=document.querySelector("header .nav .links");if(!links)return;
  let b=document.getElementById("walletBadge");
  if(!b){b=document.createElement("a");b.id="walletBadge";b.className="wallet-badge";const lb=document.getElementById("langBtn");links.insertBefore(b,lb||null)}
  b.href=(O.root||"")+"credit/";b.title="Demo store credit";
  b.innerHTML=`<span aria-hidden="true">◈</span> ${T("Credit","Crédit")} <b>${O.money(O.credit(),2)}</b>`;
  b.setAttribute("aria-label",O.t(`Demo store credit: ${O.money(O.credit(),2)}`,`Crédit démo : ${O.money(O.credit(),2)}`));
}
O.creditBadge=badge;
badge();document.addEventListener("ouv:lang",badge);
window.addEventListener("storage",e=>{if(e.key==="ouv_credit")changed()});

/* ---------- Path 1: pay for a pack with credit (full or partial) ---------- */
O.payPanel=function(el,pack){
  if(!el)return null;
  let mode="checkout",amt=0,locked=false,paid=null;const P=r2(pack.price);
  function render(){
    if(!el.isConnected&&locked)return;
    const bal=O.credit(),max=r2(Math.min(bal,P));
    if(locked){
      el.innerHTML=`<div class="paybox-in paid"><b>${T("Paid","Payé")}:</b> ${paid.credit>0?`${O.money(paid.credit,2)} ${T("credit","crédit")}`:""}${paid.credit>0&&paid.rest>0?" + ":""}${paid.rest>0?`${O.money(paid.rest,2)} ${T("at checkout (preview: nothing charged)","au paiement (aperçu : rien n'est facturé)")}`:""} <span class="muted">· ${T("credit left","crédit restant")} ${O.money(bal,2)}</span></div>`;
      O.applyLang(O.lang(),false);return}
    if(mode==="credit"&&bal<P)mode=bal>0?"part":"checkout";
    if(mode==="part"&&!(bal>0))mode="checkout";
    if(mode==="part")amt=r2(Math.min(amt,max));
    el.innerHTML=`<div class="paybox-in">
  <div class="pay-h"><b>${T("Pay for this pack","Payer ce paquet")} · ${O.money(P,P%1?2:0)}</b><a class="small" href="${O.root||""}credit/">${T("Credit balance","Solde de crédit")}: <b data-bal>${O.money(bal,2)}</b></a></div>
  <div class="pay-opts" role="radiogroup" aria-label="${O.t("Payment","Paiement")}">
   <label><input type="radio" name="paym" value="checkout" ${mode==="checkout"?"checked":""}> ${T("Pay at checkout","Payer au paiement")} <span class="muted small">${T("(preview: nothing is charged)","(aperçu : rien n'est facturé)")}</span></label>
   <label class="${bal>=P?"":"dis"}"><input type="radio" name="paym" value="credit" id="payCredit" ${mode==="credit"?"checked":""} ${bal>=P?"":"disabled"}> ${T("Pay with credit","Payer avec mon crédit")} · ${O.money(P,2)}${bal>=P?"":` <span class="muted small">${T(`needs ${O.money(r2(P-bal),2)} more`,`il manque ${O.money(r2(P-bal),2)}`)}</span>`}</label>
   <label class="${bal>0?"":"dis"}"><input type="radio" name="paym" value="part" id="payPart" ${mode==="part"?"checked":""} ${bal>0?"":"disabled"}> ${T("Use part of my credit","Utiliser une partie de mon crédit")}</label>
   ${mode==="part"?`<div class="pay-part"><input type="range" id="payAmt" min="0" max="${max}" step="0.01" value="${amt}" aria-label="${O.t("Credit to apply","Crédit à utiliser")}"><span><b data-amt>${O.money(amt,2)}</b> ${T("credit","crédit")} + <b data-rest>${O.money(r2(P-amt),2)}</b> ${T("at checkout","au paiement")}</span></div>`:""}
  </div>
  <p class="small muted" style="margin:6px 0 0">${T("Credit comes from 90% buybacks, spends 1:1 and can't be cashed out.","Le crédit vient des rachats à 90 %, s'utilise 1:1 et n'est pas monnayable.")} <a href="${O.root||""}credit/">${T("How credit works","Fonctionnement du crédit")}</a></p></div>`;
    O.applyLang(O.lang(),false);
    el.querySelectorAll('input[name=paym]').forEach(i=>i.onchange=()=>{mode=i.value;if(mode==="part")amt=r2(Math.min(O.credit(),P)/2);render()});
    const rg=el.querySelector("#payAmt");if(rg)rg.oninput=()=>{amt=r2(+rg.value);el.querySelector("[data-amt]").textContent=O.money(amt,2);el.querySelector("[data-rest]").textContent=O.money(r2(P-amt),2)};
  }
  function split(){const bal=O.credit();let c=mode==="credit"?P:mode==="part"?Math.min(amt,bal,P):0;c=r2(Math.max(0,c));return {credit:c,rest:r2(P-c),mode}}
  const api={split,
    set(m,a){mode=m;if(a!=null)amt=r2(a);render()},
    commit(){if(locked)return paid;const s=split();if(s.credit>0&&!O.creditSpend(s.credit,`Pack: ${pack.name} (${O.money(P,P%1?2:0)})`,`Paquet : ${pack.name} (${O.money(P,P%1?2:0)})`,{kind:"pack",pack:pack.id})){s.credit=0;s.rest=P}paid=s;locked=true;O.LS.set("ouv_lastpay",{pack:pack.id,credit:s.credit,rest:s.rest,ts:Date.now()});render();return s},
    refresh(){locked=false;paid=null;if(mode!=="part")amt=0;render()}};
  render();
  document.addEventListener("ouv:credit",()=>{if(!locked&&el.isConnected)render()});
  return api;
};
})();
