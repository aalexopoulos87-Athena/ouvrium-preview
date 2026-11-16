/* Ouvrium DEMO shop: singles from Carta Magica Ottawa stock at shelf price, bought with store credit (path 2).
   Preview only: cart, orders and stock changes live in this browser; nothing is charged; no payment fields. */
(function(){
"use strict";
const O=window.OUV,S=window.OUV_SHOP,$=O.$,LS=O.LS;if(!S||!document.getElementById("slist"))return;
const T=(en,fr)=>`<span data-l="en">${en}</span><span data-l="fr">${fr}</span>`;
const r2=x=>Math.round(x*100)/100,fr=()=>O.lang()==="fr";
const byId={};S.cards.forEach(c=>byId[c[5]]=c);
const norm=s=>s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const IDX=S.cards.map(c=>norm(c[0]+" "+c[1]));
const BANDS=[["any",0,1e9,"Any price","Tous les prix"],["u5",0,5,"Under $5","Moins de 5 $"],["5-25",5,25,"$5–25","5–25 $"],["25-100",25,100,"$25–100","25–100 $"],["100-500",100,500,"$100–500","100–500 $"],["500",500,1e9,"$500 and up","500 $ et plus"]];
const SORTS=[["pd","Price: high to low","Prix : décroissant"],["pa","Price: low to high","Prix : croissant"],["nm","Name A–Z","Nom A–Z"],["st","Most in stock","Plus en stock"]];
let f=Object.assign({g:"all",set:"",band:"any",q:"",sort:"pd"},LS.get("ouv_shop_f",{}));f.q="";
const FALL=(O.root||"../")+"assets/cardback-ouvrium.svg";
const art=c=>c[6]>=0&&S.hosts?S.hosts[c[6]]+c[7]:FALL;
const inStock=gi=>S.cards.reduce((a,c)=>a+(c[2]===gi&&stockN(c)>0?1:0),0);
let shown=48,sheetOpen=false;
const cart=()=>Object.assign({items:{},ful:"pickup",credit:null,step:"cart",last:null},LS.get("ouv_cart",{}));
const saveCart=c=>LS.set("ouv_cart",c);
const sold=()=>LS.get("ouv_shop_sold",{});
const stock=id=>Math.max(0,(byId[id]?byId[id][4]:0)-(sold()[id]||0));
const stockN=c=>stock(c[5]);
const gname=i=>S.games[i].name;

function chips(){
  $("#gameChips").innerHTML=[["all",T("All games","Tous les jeux"),S.cards.length]].concat(S.games.map((g,i)=>[String(i),g.name,inStock(i)])).map(([k,l,n])=>`<button class="chip${f.g===k?" on":""}" data-g="${k}" aria-pressed="${f.g===k}">${l} <span class="cnt">${n.toLocaleString(fr()?"fr-CA":"en-CA")}</span></button>`).join("");
  $("#gameChips").querySelectorAll("button").forEach(b=>b.onclick=()=>{f.g=b.dataset.g;f.set="";shown=48;LS.set("ouv_shop_f",f);chips();list()});
  const ss=$("#sset");if(ss){const sets=f.g==="all"?[]:(S.sets[+f.g]||[]);ss.style.display=sets.length?"":"none";ss.innerHTML=`<option value="">${O.t("All sets","Toutes les séries")}</option>`+sets.map(x=>`<option value="${O.esc(x)}"${f.set===x?" selected":""}>${O.esc(x)}</option>`).join("");ss.onchange=e=>{f.set=e.target.value;shown=48;LS.set("ouv_shop_f",f);list()}}
  $("#sprice").innerHTML=BANDS.map(b=>`<option value="${b[0]}"${f.band===b[0]?" selected":""}>${fr()?b[4]:b[3]}</option>`).join("");
  $("#ssort").innerHTML=SORTS.map(s=>`<option value="${s[0]}"${f.sort===s[0]?" selected":""}>${fr()?s[2]:s[1]}</option>`).join("");
}
function filtered(){
  const b=BANDS.find(x=>x[0]===f.band)||BANDS[0],q=norm(f.q.trim()),terms=q?q.split(/\s+/):[];
  let out=[];for(let i=0;i<S.cards.length;i++){const c=S.cards[i];
    if(f.g!=="all"&&String(c[2])!==f.g)continue;if(f.set&&c[1]!==f.set)continue;if(c[3]<b[1]||c[3]>=b[2])continue;
    if(terms.length&&!terms.every(t=>IDX[i].includes(t)))continue;if(stock(c[5])<=0)continue;out.push(c)}
  if(f.sort==="pa")out.sort((a,b)=>a[3]-b[3]);else if(f.sort==="nm")out.sort((a,b)=>a[0].localeCompare(b[0]));else if(f.sort==="st")out.sort((a,b)=>stock(b[5])-stock(a[5])||b[3]-a[3]);
  return out;
}
function list(){
  const all=filtered(),c=cart(),rows=all.slice(0,shown);
  $("#scount").innerHTML=T(`Showing ${Math.min(shown,all.length).toLocaleString("en-CA")} of ${all.length.toLocaleString("en-CA")} singles in stock`,`${Math.min(shown,all.length).toLocaleString("fr-CA")} sur ${all.length.toLocaleString("fr-CA")} cartes en stock`);
  $("#slist").innerHTML=rows.length?rows.map(x=>{const st=stock(x[5]),inC=c.items[x[5]]||0,left=st-inC;
    return `<div class="sitem"><div class="si-art"><img src="${O.esc(art(x))}" alt="${O.esc(x[0])}" loading="lazy" decoding="async" referrerpolicy="no-referrer" width="245" height="342" onerror="this.onerror=null;this.src='${FALL}';this.classList.add('fb')"></div><div class="si-main"><div class="si-name">${O.esc(x[0])}</div><div class="small muted">${O.esc(x[1])} · ${gname(x[2])}</div>
    <div class="small"><span class="stock${st===1?" last":""}">${st===1?T("Last one in stock","Dernière en stock"):T(`${st} in stock`,`${st} en stock`)}</span>${inC?` · <b class="gold-t">${T(`${inC} in cart`,`${inC} au panier`)}</b>`:""}</div></div>
    <div class="si-buy"><div class="si-price">${O.money(x[3],2)}</div><button class="btn gold sm" data-add="${x[5]}" ${left>0?"":"disabled"}>${left>0?T("Buy with credit","Acheter avec mon crédit"):T("All in cart","Tout au panier")}</button></div></div>`}).join("")
    :`<p class="muted">${T("No singles match. Try another game, price or search.","Aucune carte ne correspond. Essaie un autre jeu, prix ou recherche.")}</p>`;
  $("#smore").style.display=all.length>shown?"":"none";
  $("#slist").querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>add(+b.dataset.add));
  O.applyLang(O.lang(),false);
}
function add(id){const c=cart();const n=(c.items[id]||0)+1;if(n>stock(id))return;c.items[id]=n;c.step="cart";saveCart(c);
  O.toast(O.t(`Added to cart: ${byId[id][0].split(" - ")[0]}`,`Ajoutée au panier : ${byId[id][0].split(" - ")[0]}`));list();renderCart()}
function totals(c){const lines=Object.entries(c.items).filter(([id,q])=>byId[id]&&q>0).map(([id,q])=>({c:byId[id],q:Math.min(q,stock(+id))}));
  const sub=r2(lines.reduce((a,l)=>a+l.c[3]*l.q,0)),ship=c.ful==="ship"&&lines.length?S.ship:0,total=r2(sub+ship),bal=O.credit(),max=r2(Math.min(bal,total));
  let cr=c.credit==null?max:Math.min(c.credit,max);cr=r2(Math.max(0,cr));return {lines,sub,ship,total,bal,max,cr,rest:r2(total-cr),n:lines.reduce((a,l)=>a+l.q,0)}}
function handle(t){return `<button class="sheet-handle" id="cartBtn" aria-expanded="${sheetOpen}">${T("Cart","Panier")} · ${t.n} · ${O.money(t.total,2)} ${sheetOpen?"▼":"▲"}</button>`}
function renderCart(){
  const c=cart(),t=totals(c),el=$("#cart");el.classList.toggle("open",sheetOpen);
  if(c.step==="done"&&c.last){const o=(LS.get("ouv_orders",[]).find(x=>x.id===c.last));if(o){el.innerHTML=handle(t)+doneHTML(o);wire();return}}
  if(c.step==="review"&&t.lines.length){el.innerHTML=handle(t)+reviewHTML(c,t);wire();return}
  el.innerHTML=handle(t)+`<h3 style="margin-top:4px">${T("Your cart","Ton panier")}</h3>
  ${t.lines.length?`<div class="cart-lines">${t.lines.map(l=>`<div class="cl"><div><div class="cl-n">${O.esc(l.c[0].split(" - ").slice(0,2).join(" - "))}</div><div class="small muted">${O.money(l.c[3],2)} · ${gname(l.c[2])}</div></div>
   <div class="qty"><button aria-label="${O.t("One less","Un de moins")}" data-dec="${l.c[5]}">−</button><b>${l.q}</b><button aria-label="${O.t("One more","Un de plus")}" data-inc="${l.c[5]}" ${l.q>=stock(l.c[5])?"disabled":""}>+</button></div></div>`).join("")}</div>`
   :`<p class="muted small">${T("Your cart is empty. Press “Buy with credit” on any card.","Ton panier est vide. Appuie sur « Acheter avec mon crédit » sur une carte.")}</p>`}
  <h4>${T("Delivery","Livraison")}</h4>
  <div class="pay-opts">
   <label><input type="radio" name="ful" value="pickup" ${c.ful==="pickup"?"checked":""}> ${T("Pick up at Carta Magica Ottawa · free","Ramasser chez Carta Magica Ottawa · gratuit")}<div class="small muted">1179 St. Laurent Blvd, Ottawa ON K1K 3B7</div></label>
   <label><input type="radio" name="ful" value="ship" ${c.ful==="ship"?"checked":""}> ${T(`Ship in Canada, tracked · ${O.money(S.ship,2)}`,`Expédier au Canada, avec suivi · ${O.money(S.ship,2)}`)}<div class="small muted">${T("Sleeved and toploaded. Demo rate, final rate to be set.","En pochette et toploader. Tarif démo, tarif final à fixer.")}</div></label>
  </div>
  ${sumHTML(t)}
  ${t.lines.length?`<div class="credit-apply"><div class="small">${T("Credit balance","Solde de crédit")}: <b>${O.money(t.bal,2)}</b> · <a href="../credit/">${T("history","historique")}</a></div>
   ${t.max>0?`<label class="small" for="crAmt">${T("Credit to use","Crédit à utiliser")}</label><input type="range" id="crAmt" min="0" max="${t.max}" step="0.01" value="${t.cr}"><div class="small"><b data-cr>${O.money(t.cr,2)}</b> ${T("credit","crédit")} + <b data-rest>${O.money(t.rest,2)}</b> ${T("at checkout","au paiement")}</div>`
   :`<div class="small muted">${T("No credit yet. Sell a pulled card back to earn 90% credit, or pay the whole order at checkout.","Pas encore de crédit. Revends une carte tirée pour obtenir 90 % en crédit, ou paie toute la commande au paiement.")}</div>`}</div>`:""}
  <button class="btn gold" id="toReview" style="width:100%;margin-top:10px" ${t.lines.length?"":"disabled"}>${T("Review demo order","Vérifier la commande démo")}</button>
  <p class="small muted" style="margin:8px 0 0">${T("Credit spends 1:1 at shelf price on cards and shipping. It can't be cashed out.","Le crédit s'utilise 1:1 au prix affiché sur les cartes et la livraison. Il n'est pas monnayable.")}</p>`;
  wire();
}
function sumHTML(t){return `<div class="sum-lines">
  <div class="bld-kv"><span>${T("Cards","Cartes")} (${t.n})</span><b>${O.money(t.sub,2)}</b></div>
  <div class="bld-kv"><span>${T("Delivery","Livraison")}</span><b>${t.ship?O.money(t.ship,2):T("Free pickup","Ramassage gratuit")}</b></div>
  <div class="bld-kv"><span>${T("Taxes","Taxes")}</span><b class="muted">${T("not calculated in preview","non calculées (aperçu)")}</b></div>
  <div class="bld-kv tot"><span>${T("Total","Total")}</span><b>${O.money(t.total,2)}</b></div></div>`}
function reviewHTML(c,t){return `<div class="eyebrow">${T("Demo checkout","Paiement démo")}</div><h3 style="margin-top:4px">${T("Review your order","Vérifie ta commande")}</h3>
  <div class="cart-lines">${t.lines.map(l=>`<div class="cl"><div><div class="cl-n">${O.esc(l.c[0].split(" - ").slice(0,2).join(" - "))}</div><div class="small muted">${l.q} × ${O.money(l.c[3],2)}</div></div><b>${O.money(r2(l.q*l.c[3]),2)}</b></div>`).join("")}</div>
  <div class="small" style="margin:8px 0">${c.ful==="ship"?T("<b>Ship in Canada</b>, tracked. Address is collected at the real checkout (not in this preview).","<b>Expédition au Canada</b>, avec suivi. L'adresse est demandée au vrai paiement (pas dans cet aperçu)."):T("<b>Pickup</b> at Carta Magica Ottawa, 1179 St. Laurent Blvd, during store hours. Bring your order number.","<b>Ramassage</b> chez Carta Magica Ottawa, 1179, boul. St-Laurent, aux heures d'ouverture. Apporte ton numéro de commande.")}</div>
  ${sumHTML(t)}
  <div class="bld-kv"><span>${T("Paid with store credit","Payé en crédit")}</span><b class="gold-t">−${O.money(t.cr,2)}</b></div>
  <div class="bld-kv tot"><span>${T("Rest at checkout","Reste au paiement")}</span><b>${O.money(t.rest,2)}</b></div>
  <p class="small muted">${t.rest>0?T("Preview: the rest would be paid at the real checkout. Nothing is charged here and no payment details are collected.","Aperçu : le reste serait payé au vrai paiement. Rien n'est facturé ici et aucune donnée de paiement n'est demandée."):T("Fully covered by your credit.","Entièrement couvert par ton crédit.")} ${T(`Credit after this order: ${O.money(r2(t.bal-t.cr),2)}.`,`Crédit après cette commande : ${O.money(r2(t.bal-t.cr),2)}.`)}</p>
  <button class="btn gold" id="placeOrder" style="width:100%">${T("Place demo order","Passer la commande démo")}</button>
  <button class="btn ghost sm" id="backCart" style="width:100%;margin-top:8px">${T("Back to cart","Retour au panier")}</button>`}
function doneHTML(o){return `<div class="eyebrow">${T("Demo order placed","Commande démo passée")}</div><h3 style="margin-top:4px">${o.id}</h3>
  <div class="cart-lines">${o.lines.map(l=>`<div class="cl"><div class="cl-n">${O.esc(l.n)}</div><b>${l.q} × ${O.money(l.p,2)}</b></div>`).join("")}</div>
  <div class="bld-kv"><span>${T("Delivery","Livraison")}</span><b>${o.ful==="ship"?T(`Ship · ${O.money(o.ship,2)}`,`Expédition · ${O.money(o.ship,2)}`):T("Pickup, Ottawa","Ramassage, Ottawa")}</b></div>
  <div class="bld-kv"><span>${T("Total","Total")}</span><b>${O.money(o.total,2)}</b></div>
  <div class="bld-kv"><span>${T("Paid with credit","Payé en crédit")}</span><b class="gold-t">${O.money(o.credit,2)}</b></div>
  <div class="bld-kv"><span>${T("Rest at checkout (preview)","Reste au paiement (aperçu)")}</span><b>${O.money(o.rest,2)}</b></div>
  <p class="small muted">${T("Demo only: nothing was bought, reserved or charged. Stock counts in this browser went down.","Démo seulement : rien n'a été acheté, réservé ni facturé. Le stock a baissé dans ce navigateur.")} ${T("Credit left","Crédit restant")}: <b>${O.money(O.credit(),2)}</b>.</p>
  <div class="cta-row"><button class="btn gold sm" id="contShop">${T("Keep shopping","Continuer")}</button><a class="btn ghost sm" href="../credit/">${T("Credit history","Historique du crédit")}</a></div>`}
function wire(){
  const el=$("#cart");O.applyLang(O.lang(),false);
  const hb=$("#cartBtn");if(hb)hb.onclick=()=>{sheetOpen=!sheetOpen;renderCart()};
  el.querySelectorAll("[data-inc]").forEach(b=>b.onclick=()=>add(+b.dataset.inc));
  el.querySelectorAll("[data-dec]").forEach(b=>b.onclick=()=>{const c=cart(),id=b.dataset.dec;c.items[id]=(c.items[id]||0)-1;if(c.items[id]<=0)delete c.items[id];saveCart(c);list();renderCart()});
  el.querySelectorAll("input[name=ful]").forEach(i=>i.onchange=()=>{const c=cart();c.ful=i.value;saveCart(c);renderCart()});
  const rg=$("#crAmt");if(rg){rg.oninput=()=>{const c=cart();c.credit=r2(+rg.value);saveCart(c);const t=totals(c);el.querySelector("[data-cr]").textContent=O.money(t.cr,2);el.querySelector("[data-rest]").textContent=O.money(t.rest,2)}}
  const tr=$("#toReview");if(tr)tr.onclick=()=>{const c=cart();c.step="review";saveCart(c);renderCart();el.scrollTop=0};
  const bc=$("#backCart");if(bc)bc.onclick=()=>{const c=cart();c.step="cart";saveCart(c);renderCart()};
  const po=$("#placeOrder");if(po)po.onclick=place;
  const cs=$("#contShop");if(cs)cs.onclick=()=>{const c=cart();c.step="cart";c.last=null;saveCart(c);renderCart()};
}
function place(){
  const c=cart(),t=totals(c);if(!t.lines.length)return;
  const id="OUV-DEMO-"+String(Date.now()).slice(-6);
  if(t.cr>0&&!O.creditSpend(t.cr,`Shop order ${id}: ${t.n} card${t.n>1?"s":""}${t.ship?" + shipping":""}`,`Commande ${id} : ${t.n} carte${t.n>1?"s":""}${t.ship?" + livraison":""}`,{kind:"shop",order:id})){O.toast(O.t("Not enough credit.","Crédit insuffisant."));renderCart();return}
  const s=sold();t.lines.forEach(l=>s[l.c[5]]=(s[l.c[5]]||0)+l.q);LS.set("ouv_shop_sold",s);
  const o={id,ts:Date.now(),lines:t.lines.map(l=>({id:l.c[5],n:l.c[0].split(" - ").slice(0,2).join(" - "),q:l.q,p:l.c[3]})),ful:c.ful,ship:t.ship,sub:t.sub,total:t.total,credit:t.cr,rest:t.rest};
  const os=LS.get("ouv_orders",[]);os.unshift(o);LS.set("ouv_orders",os.slice(0,50));
  saveCart({items:{},ful:c.ful,credit:null,step:"done",last:id});
  O.toast(O.t(`Demo order ${id} placed.`,`Commande démo ${id} passée.`));list();renderCart();
}
let qt=null;
$("#sq").addEventListener("input",e=>{clearTimeout(qt);qt=setTimeout(()=>{f.q=e.target.value;shown=48;list()},120)});
$("#sprice").onchange=e=>{f.band=e.target.value;shown=48;LS.set("ouv_shop_f",f);list()};
$("#ssort").onchange=e=>{f.sort=e.target.value;LS.set("ouv_shop_f",f);list()};
$("#smore").onclick=()=>{shown+=48;list()};
document.addEventListener("ouv:lang",()=>{chips();list();renderCart()});
document.addEventListener("ouv:credit",()=>renderCart());
chips();list();renderCart();
O.shopAdd=add; // used by tests
})();
