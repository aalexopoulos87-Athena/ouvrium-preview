(function(){"use strict";const O=window.OUV,$=O.$,LS=O.LS;
document.addEventListener("DOMContentLoaded",()=>{
function render(){
 const v=O.vault();const kept=v.filter(c=>c.status!=="sold");
 $("#vCount").textContent=kept.length;$("#vValue").textContent=O.money(kept.reduce((a,c)=>a+c.value,0),2);$("#vCredit").textContent=O.money(O.credit(),2);$("#vStreak").textContent=Math.min(O.daily().streak||0,7);
 $("#vEmpty").style.display=v.length?"none":"";
 $("#vGrid").innerHTML=v.slice(0,60).map(c=>`<div>${O.cardHTML(c)}<div class="small muted" style="margin-top:4px">${O.esc(c.pack||"")}${c.status==="sold"?" · "+O.t("sold back","revendue"):""}</div></div>`).join("");
 const tiers=new Set(v.map(c=>c.tier));const names=new Set(v.map(c=>c.name));
 const pk8=window.OUV_SETS.pk8;const have8=pk8.filter(n=>names.has(n)).length;
 const games=new Set(v.map(c=>c.game));
 const sets=[[O.t("Rarity ladder: one card from each of the 9 tiers","Échelle de rareté : une carte de chacun des 9 paliers"),[...tiers].length,9],
  [O.t("Ottawa Pokémon crown six (the 6 Pokémon cards worth $500+ in stock)","Les six couronnes Pokémon d'Ottawa (6 cartes de 500 $ et +)"),have8,6],
  [O.t("Multi-game collector: cards from 4 different games","Collection multijeux : cartes de 4 jeux différents"),Math.min(games.size,4),4],
  [O.t("7-day reveal streak badge","Badge de série de 7 jours"),Math.min(O.daily().best||0,7),7]];
 $("#sets").innerHTML=sets.map(([n,h,t])=>`<div class="card"><b>${n}</b><div class="bar" style="margin:10px 0"><i style="width:${h/t*100}%"></i></div><span class="small muted">${h}/${t}</span></div>`).join("");
}
render();document.addEventListener("ouv:lang",render);
document.querySelector("[data-claim]")?.addEventListener("click",()=>setTimeout(render,50));
$("#vClear").onclick=()=>{["ouv_vault","ouv_credit","ouv_daily","ouv_session","ouv_signup","ouv_credit_hist","ouv_cart","ouv_orders","ouv_shop_sold","ouv_lastpay"].forEach(k=>LS.del(k));render();O.toast(O.t("Demo data cleared.","Données démo effacées."))};
});})();
