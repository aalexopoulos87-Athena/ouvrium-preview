/* /credit/ page: demo wallet balance and history. */
(function(){
"use strict";
const O=window.OUV,$=O.$;if(!document.getElementById("wallet"))return;
const T=(en,fr)=>`<span data-l="en">${en}</span><span data-l="fr">${fr}</span>`;
function sample(){const S=window.OUV_SHOP;if(!S)return null;const pool=S.cards.filter(c=>c[3]>=5&&c[3]<=80);return pool[Math.floor(Math.random()*pool.length)]}
function render(){
  const bal=O.credit(),h=O.creditHist(),earned=h.filter(x=>x.type==="earn").reduce((a,x)=>a+x.amt,0),spent=-h.filter(x=>x.type==="spend").reduce((a,x)=>a+x.amt,0);
  $("#wallet").innerHTML=`<div class="eyebrow">${T("Demo wallet","Portefeuille démo")}</div>
  <div class="bld-price" id="walletBal">${O.money(bal,2)} <span class="small muted">CAD ${T("store credit","crédit")}</span></div>
  <div class="bld-kv"><span>${T("Earned from buybacks","Gagné par rachats")}</span><b>${O.money(O.r2(earned),2)}</b></div>
  <div class="bld-kv"><span>${T("Spent on packs and cards","Dépensé en paquets et cartes")}</span><b>${O.money(O.r2(spent),2)}</b></div>
  <div class="cta-row"><a class="btn gold sm" href="../shop/">${T("Spend in the shop","Dépenser en boutique")}</a><a class="btn ghost sm" href="../packs.html">${T("Spend on a pack","Dépenser sur un paquet")}</a></div>
  <div class="cta-row" style="margin-top:4px"><button class="btn ghost sm" id="simBuyback">${T("Demo: sell back a sample pull","Démo : revendre un tirage exemple")}</button></div>
  <p class="small muted">${T("Preview only: this balance lives in your browser and is not money. The sample buyback credits 90% of a random Ottawa single worth $5–80, the same way the sell-back button after a pack does.","Aperçu seulement : ce solde reste dans ton navigateur et n'est pas de l'argent. Le rachat exemple crédite 90 % d'une carte d'Ottawa de 5–80 $, comme le bouton de revente après un paquet.")}</p>`;
  $("#hist").innerHTML=h.length?`<div class="tbl-wrap"><table class="tbl sm"><tr><th>${T("When","Quand")}</th><th>${T("What","Quoi")}</th><th class="num">${T("Amount","Montant")}</th><th class="num">${T("Balance","Solde")}</th></tr>${h.slice(0,40).map(x=>`<tr><td class="small">${new Date(x.ts).toLocaleString(O.lang()==="fr"?"fr-CA":"en-CA",{dateStyle:"short",timeStyle:"short"})}</td><td>${O.esc(O.lang()==="fr"?x.fr:x.en)}</td><td class="num ${x.amt>=0?"pos":"neg"}">${x.amt>=0?"+":"−"}${O.money(Math.abs(x.amt),2)}</td><td class="num">${O.money(x.bal,2)}</td></tr>`).join("")}</table></div>`
   :`<p class="muted small">${T("No credit activity yet. Open a demo pack and choose “Sell back”, or use the sample buyback.","Aucune activité. Ouvre un paquet démo et choisis « Revendre », ou utilise le rachat exemple.")}</p>`;
  O.applyLang(O.lang(),false);
  $("#simBuyback").onclick=()=>{const c=sample();if(!c)return;const v=O.r2(c[3]*0.9),nm=c[0].split(" - ")[0];O.creditEarn(v,`Buyback 90% (demo sample): ${nm} · ${O.money(c[3],2)}`,`Rachat 90 % (exemple démo) : ${nm} · ${O.money(c[3],2)}`);O.toast(O.t(`Demo: ${O.money(v,2)} credit added.`,`Démo : ${O.money(v,2)} de crédit ajouté.`))};
}
render();document.addEventListener("ouv:credit",render);document.addEventListener("ouv:lang",render);
})();
