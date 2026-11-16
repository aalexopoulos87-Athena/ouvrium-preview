(function(){"use strict";const O=window.OUV,$=O.$;
const TAX={ON:[["HST",.13]],NS:[["HST",.14]],NB:[["HST",.15]],NL:[["HST",.15]],PE:[["HST",.15]],QC:[["GST/TPS",.05],["QST/TVQ",.09975]],BC:[["GST",.05],["PST",.07]],SK:[["GST",.05],["PST",.06]],MB:[["GST",.05],["RST",.07]]};
document.addEventListener("DOMContentLoaded",()=>{
 const q=new URLSearchParams(location.search).get("pack");if(q)$("#ckPack").value=q;
 function draw(){const p=window.OUV_DATA.packs.find(x=>x.slug===$("#ckPack").value);const n=Math.max(1,Math.min(5,+$("#ckQty").value||1));const sub=p.price*n;const taxes=TAX[$("#ckProv").value]||[["GST",.05]];
  let rows=`<tr><td>${p.name} × ${n}</td><td class="num">${O.money(sub,2)}</td></tr><tr><td>${O.t("Shipping","Livraison")}</td><td class="num">${$("#ckShip").value==="ship"?O.t("$[x] (only if you ship)","[x] $ (si expédié)"):O.t("Free pickup, Ottawa","Cueillette gratuite, Ottawa")}</td></tr>`;
  let tot=sub;taxes.forEach(([k,r])=>{const t=Math.round(sub*r*100)/100;tot+=t;rows+=`<tr><td>${k} (${(r*100).toFixed(r*100%1?3:0)}%)</td><td class="num">${O.money(t,2)}</td></tr>`});
  rows+=`<tr><td><b>Total</b></td><td class="num"><b>${O.money(tot,2)} CAD</b>${$("#ckShip").value==="ship"?" + "+O.t("shipping","livraison"):""}</td></tr>`;
  $("#ckSum").innerHTML=`<div class="tbl-wrap"><table class="tbl">${rows}</table></div><p class="small muted">${O.t(`Expected card value: ${O.money(p.ev*n,2)} (${Math.round(p.ev/p.price*100)}% of price). Most pulls are worth less than the pack price. Tax shown is illustrative, by delivery/pickup province.`,`Valeur attendue : ${O.money(p.ev*n,2)} (${Math.round(p.ev/p.price*100)} % du prix). La plupart des cartes valent moins que le prix du paquet. Taxes indicatives selon la province.`)} <a href="pack-${p.slug}.html#odds">${O.t("See the odds","Voir les probabilités")}</a></p>`;
  const pay=$("#ckPay");pay.innerHTML=O.t(`Pay ${O.money(tot,2)} (disabled in preview)`,`Payer ${O.money(tot,2)} (désactivé dans l'aperçu)`)}
 ["ckPack","ckQty","ckProv","ckShip"].forEach(i=>$("#"+i).addEventListener("input",draw));document.addEventListener("ouv:lang",draw);draw();
});})();
