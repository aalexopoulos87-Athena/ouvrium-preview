/* Ouvrium build-your-own-pack page (DEMO). Uses builder-core.js for every number shown and for the draw. */
(function(){
"use strict";
const O=window.OUV,BD=window.OUV_BUILD,C=window.OUVB,$=O.$,$$=O.$$;
const root=document.getElementById("builder");if(!root||!BD||!C)return;
const T=(en,fr)=>`<span data-l="en">${en}</span><span data-l="fr">${fr}</span>`;
const esc=O.esc,fr=()=>O.lang()==="fr";
const pc=(x,d=1)=>fr()?(x*100).toFixed(d).replace(".",",")+" %":(x*100).toFixed(d)+"%";
const oneIn=p=>{if(!p)return "—";const n=1/p,s=n>=100?Math.round(n).toLocaleString(fr()?"fr-CA":"en-CA"):n.toFixed(1).replace(".",fr()?",":".");return fr()?`1 sur ${s}`:`1 in ${s}`};
const THEMES=[{id:"all",name_en:"All games",name_fr:"Tous les jeux",stage:["#4a3a10","#070707"],foil:["#FFFFFF","#E9D38A","#D4AF37"],motif:null},...BD.themes];
const tmeta=id=>THEMES.find(t=>t.id===id)||THEMES[0];
const poolFor=id=>id==="all"?Object.values(BD.cards).flat():(BD.cards[id]||[]);
const MEDL={auto:["Auto","Auto"],m1:["$3–10","3–10 $"],m2:["$10–25","10–25 $"],m3:["$25–50","25–50 $"],m4:["$50–100","50–100 $"],m5:["$100–250","100–250 $"]};
const LOWL={auto:["Auto-fill (recommended)","Auto-remplissage (recommandé)"],l1:["$1–3","1–3 $"],l2:["$3–10","3–10 $"],l3:["$10–25","10–25 $"]};
const TCOL={grey:"#9AA3B5",blue:"#3D8BFF",purple:"#9B5CFF",gold:"#F2C14E",prism:"#F5D0FF"};
const TN={grey:["Grey","Gris"],blue:["Blue","Bleu"],purple:["Purple","Violet"],gold:["Gold","Or"],prism:["Prismatic","Prismatique"]};
const DEF={theme:"pokemon",hits:[],low:"auto",r:0.90,price:"auto",q:""};
let st=Object.assign({},DEF,O.LS.get("ouv_build",{}));if(!THEMES.some(t=>t.id===st.theme))st.theme="pokemon";
let sol=null,res=null,note="";
const save=()=>O.LS.set("ouv_build",{theme:st.theme,hits:st.hits,low:st.low,r:st.r,price:st.price});

root.innerHTML=`<div class="bld-grid">
<div class="bld-main">
 <div class="card step"><div class="sn">1</div><h3>${T("Choose a game","Choisis un jeu")}</h3><div class="chips" id="themeChips"></div><p class="small muted" style="margin:8px 0 0">${T("Filters the hits and supporting cards to that game's Ottawa stock. Fan-made themes.","Filtre les vedettes et les cartes de soutien selon le stock d'Ottawa de ce jeu. Thèmes non officiels.")}</p></div>
 <div class="card step"><div class="sn">2</div><h3>${T("Pick your hits (1–5)","Choisis tes vedettes (1–5)")}</h3>
  <div id="picked"></div>
  <input id="q" type="search" autocomplete="off" style="margin-top:10px">
  <div id="results" class="bld-results"></div></div>
 <div class="card step"><div class="sn">3</div><h3>${T("Low tier","Palier bas")}</h3><div id="lowOpts" class="bld-radios"></div><p class="small muted" style="margin:8px 0 0" id="floorNote"></p></div>
 <div class="card step"><div class="sn">4</div><h3>${T("Target return and price","Rendement visé et prix")}</h3>
  <label class="small" for="rng">${T("Expected value as % of price","Valeur attendue en % du prix")}: <b id="rngV"></b></label>
  <input id="rng" type="range" min="85" max="92" step="1" style="width:100%">
  <label class="small" for="priceSel" style="display:block;margin-top:8px">${T("Price","Prix")}</label><select id="priceSel"></select>
  <p class="small muted" style="margin:6px 0 0">${T("Price = EV ÷ target, on the $5–500 ladder. Supporting odds are re-solved so EV / price lands exactly on the target.","Prix = VA ÷ cible, sur l'échelle de 5 à 500 $. Les probabilités de soutien sont recalculées pour que VA / prix tombe exactement sur la cible.")}</p></div>
 <div class="cta-row"><button class="btn neon" id="autoBtn">${T("Auto-fill","Auto-remplir")}</button><button class="btn ghost" id="resetBtn">${T("Reset","Réinitialiser")}</button><a class="btn ghost" href="how-it-works/">${T("How it works","Comment ça marche")}</a></div>
 <p class="small" id="note" aria-live="polite"></p>
 <details id="allOdds" class="card"><summary><b>${T("Every card in this pack and its odds","Chaque carte du paquet et sa probabilité")}</b></summary><div id="allOddsBody"></div></details>
</div>
<aside class="bld-sum" id="sum" aria-label="Pack summary">
 <button class="sheet-handle" id="sheetBtn" aria-expanded="false"><i></i><span id="peek"></span></button>
 <div id="sumBody"></div>
 <button class="btn gold" id="openBtn" style="width:100%;margin-top:10px">${T("Open this pack (demo)","Ouvrir ce paquet (démo)")}</button>
 <p class="small muted" style="margin:6px 0 0">${T("Odds shown = odds the demo draw uses. Nothing is bought or reserved.","Probabilités affichées = probabilités du tirage démo. Rien n'est acheté ni réservé.")}</p>
</aside></div>`;

function themeChips(){$("#themeChips").innerHTML=THEMES.map(t=>`<button class="chip${t.id===st.theme?" on":""}" data-t="${t.id}">${T(esc(t.name_en.replace(/ Pack.*$/,"").replace(/^Yu-Gi-Oh! Arcane Duel/,"Yu-Gi-Oh!").replace(/ Wildlands| Treasure| Hangar/,"").replace(/^Anime Arena.*/,"Anime (Union Arena)")),esc(t.name_fr.replace(/^Paquet /,"").replace(/ Terres sauvages| Trésor| Hangar| Duel arcanique/,"").replace(/^Arène anime.*/,"Anime (Union Arena)").replace(/^Tous les jeux$/,"Tous les jeux")))}</button>`).join("");
  $$("#themeChips .chip").forEach(b=>b.onclick=()=>{st.theme=b.dataset.t;if(st.theme!=="all"){const ids=new Set(poolFor(st.theme).map(c=>c[5]));st.hits=st.hits.filter(h=>ids.has(h.id))}st.price="auto";note="";themeChips();update()})}
function lowOpts(){$("#lowOpts").innerHTML=Object.keys(LOWL).map(k=>`<label><input type="radio" name="low" value="${k}"${st.low===k?" checked":""}> ${T(LOWL[k][0],LOWL[k][1])}</label>`).join("");
  $$("#lowOpts input").forEach(i=>i.onchange=()=>{st.low=i.value;update()})}
function results(){
  const pool=poolFor(st.theme),q=($("#q").value||"").toLowerCase().trim(),picked=new Set(st.hits.map(h=>h.id));
  let l=pool.filter(c=>c[3]>=20);if(q)l=l.filter(c=>(c[0]+" "+c[1]).toLowerCase().includes(q));
  const tot=l.length;l=l.slice(0,40);
  $("#results").innerHTML=l.map(c=>`<div class="br"><div><b>${esc(c[0].split(" - ")[0])}</b><div class="small muted">${esc(c[1])} · ${esc(c[2])} · ${T(`${c[4]} in stock`,`${c[4]} en stock`)}</div></div><div class="num">${O.money(c[3],2)}</div><button class="btn sm ${picked.has(c[5])?"ghost":"gold"}" data-add="${c[5]}"${picked.has(c[5])||st.hits.length>=C.MAX_HITS?" disabled":""}>${picked.has(c[5])?T("Added","Ajoutée"):T("Add","Ajouter")}</button></div>`).join("")+`<p class="small muted">${T(`Showing ${l.length} of ${tot} in-stock cards worth $20+.`,`${l.length} sur ${tot} cartes en stock de 20 $ et plus.`)}</p>`;
  $$("#results [data-add]").forEach(b=>b.onclick=()=>{if(st.hits.length>=C.MAX_HITS)return;st.hits.push({id:+b.dataset.add,med:"auto",fmt:"raw"});st.price="auto";update()});
  O.applyLang(O.lang(),false);
}
function picked(){
  const by=res.byId;
  if(!st.hits.length){$("#picked").innerHTML=`<p class="small muted">${T("No hits yet. Search below, or press Auto-fill.","Aucune vedette. Cherche ci-dessous ou appuie sur Auto-remplir.")}</p>`;return}
  $("#picked").innerHTML=st.hits.map((h,i)=>{const c=by[h.id];if(!c)return "";const hp=sol&&sol.hits.find(x=>x.c[5]===h.id);
    return `<div class="ph"><div class="ph-n"><b>${esc(c[0].split(" - ")[0])}</b><div class="small muted">${esc(c[1])} · ${O.money(c[3],2)} · ${hp?`<b style="color:var(--gold-hi)">${oneIn(hp.p)}</b>`:"—"}</div></div>
    <label class="small">${T("Medium","Moyen")} <select data-med="${i}">${Object.keys(MEDL).map(k=>`<option value="${k}"${h.med===k?" selected":""}>${fr()?MEDL[k][1]:MEDL[k][0]}</option>`).join("")}</select></label>
    <label class="small">${T("Format","Format")} <select data-fmt="${i}"><option value="raw" selected>${fr()?"Brute":"Raw"}</option><option value="graded" disabled>${fr()?"Gradée (aucune en stock)":"Graded (none in stock)"}</option></select></label>
    <button class="x" data-rm="${i}" aria-label="Remove">×</button></div>`}).join("");
  $$("#picked [data-med]").forEach(s=>s.onchange=()=>{st.hits[+s.dataset.med].med=s.value;update()});
  $$("#picked [data-rm]").forEach(b=>b.onclick=()=>{st.hits.splice(+b.dataset.rm,1);st.price="auto";update()});
}
function summary(){
  const P=sol&&sol.P;
  if(!sol){
    const W={nohits:["Pick at least one hit, or press Auto-fill.","Choisis au moins une vedette ou appuie sur Auto-remplir."],hitlow:["Every hit must be worth at least 2× the pack price; no rung on the ladder works for these hits.","Chaque vedette doit valoir au moins 2 × le prix du paquet; aucun palier ne convient."],
      nolow:["Not enough low-tier cards at or above the minimum card value. Try Auto or another low band.","Pas assez de cartes basses au-dessus de la valeur minimale. Essaie Auto ou un autre palier."],nomed:["No supporting cards in the chosen medium bands. Try Auto or another band.","Aucune carte de soutien dans les paliers moyens choisis. Essaie Auto ou un autre palier."],
      medlow:["Medium cards must be worth more than low cards on average.","Les cartes moyennes doivent valoir plus que les basses en moyenne."],hitsrich:["Hits would land more than 1 time in 4. Pick bigger hits.","Les vedettes sortiraient plus d'une fois sur 4. Choisis de plus grosses vedettes."],
      toorich:["Supporting cards are too valuable for the target. Choose a lower medium band.","Cartes de soutien trop chères pour la cible. Choisis un palier moyen plus bas."],toopoor:["Supporting cards are too cheap to reach the target. Choose a higher medium band.","Cartes de soutien trop bon marché pour la cible. Choisis un palier plus haut."],
      stock:["Not enough stock to run this pack for 10 opens at these odds.","Pas assez de stock pour 10 ouvertures à ces probabilités."]}[res.why]||["Not feasible.","Non réalisable."];
    $("#sumBody").innerHTML=`<div class="eyebrow">${T("Your pack","Ton paquet")}</div><p class="bld-warn">${T(W[0],W[1])}</p>`;
    $("#peek").innerHTML=T("Your pack: not ready","Ton paquet : pas prêt");$("#openBtn").disabled=true;return}
  $("#openBtn").disabled=false;
  const ev=sol.ev,ben=bench(P);
  const tierRows=Object.keys(TCOL).filter(k=>sol.tiers[k]>0).map(k=>`<tr><td><span class="rc" style="--c:${TCOL[k]}">${T(TN[k][0],TN[k][1])}</span></td><td class="num">${pc(sol.tiers[k],2)}</td><td class="num">${oneIn(sol.tiers[k])}</td></tr>`).join("");
  const hitRows=sol.hits.map(x=>`<tr><td>${esc(x.c[0].split(" - ")[0])}<div class="small muted">${O.money(x.c[3],2)}</div></td><td class="num">${pc(x.p,3)}</td><td class="num">${oneIn(x.p)}</td></tr>`).join("");
  $("#sumBody").innerHTML=`<div class="eyebrow">${T("Your pack","Ton paquet")} · ${esc(fr()?tmeta(st.theme).name_fr:tmeta(st.theme).name_en)}</div>
  <div class="bld-price">${O.money(P,0)} <span class="small muted">CAD${res.priceFallback?" · "+T("your price wasn't feasible","ton prix n'était pas possible"):""}</span></div>
  <div class="bld-kv"><span>${T("Cards in the pool","Cartes du bassin")}</span><b>${sol.hits.length} ${sol.hits.length>1?T("hits","vedettes"):T("hit","vedette")} · ${sol.med.n} ${T("medium","moyennes")} · ${sol.low.n} ${T("low","basses")}</b></div>
  <div class="bld-kv"><span>${T("Expected value","Valeur attendue")}</span><b>${O.money(ev,2)} · ${pc(ev/P,0)}</b></div>
  <div class="bld-kv"><span>${T("90% credit buyback value","Valeur de rachat à 90 % en crédit")}</span><b>${O.money(ev*.9,2)} · ${pc(ev*.9/P,1)}</b></div>
  <div class="bld-kv"><span>${T("Packs to hit one of your picks","Paquets pour une de tes vedettes")}</span><b>${oneIn(sol.pH)}</b></div>
  <div class="bld-kv"><span>${T("Packs to hit a chase (5×+)","Paquets pour une vedette 5 ×+")}</span><b>${sol.ptc?oneIn(1/sol.ptc):T("no 5× card","aucune carte 5 ×")}</b></div>
  <div class="bld-kv"><span>${T("Average cost to hit a chase","Coût moyen pour une vedette")}</span><b>${sol.cost?O.money(sol.cost,0):"—"}</b></div>
  <div class="bld-kv muted small"><span>${T("Competitor median at this price","Médiane concurrents à ce prix")}${ben.fb?"*":""}</span><span>${ben.v?oneIn(1/ben.v):"—"}</span></div>
  <div class="bld-kv"><span>${T("Minimum card value","Valeur minimale par carte")}</span><b>${O.money(sol.floor,2)}</b></div>
  <div class="bld-kv"><span>${T("Series size (stock-limited)","Taille de série (selon le stock)")}</span><b>${sol.series.toLocaleString(fr()?"fr-CA":"en-CA")} ${T("opens","ouvertures")}</b></div>
  <h4>${T("Odds per hit","Probabilité par vedette")}</h4><table class="tbl sm">${hitRows}</table>
  <h4>${T("Odds per tier","Probabilité par palier")}</h4><table class="tbl sm"><tr><td>${T("Medium","Moyen")} <span class="small muted">${T("avg","moy.")} ${O.money(sol.med.mean,2)}</span></td><td class="num">${pc(sol.pM,2)}</td><td class="num">${oneIn(sol.pM)}</td></tr><tr><td>${T("Low","Bas")} <span class="small muted">${T("avg","moy.")} ${O.money(sol.low.mean,2)}</span></td><td class="num">${pc(sol.pL,2)}</td><td class="num">${oneIn(sol.pL)}</td></tr></table>
  <table class="tbl sm" style="margin-top:6px">${tierRows}</table>
  <p class="small muted" style="margin:6px 0 0">${T("Chase = card worth 5× the price or more, same as the themed pages.","Vedette = carte valant 5 × le prix ou plus, comme les pages thématiques.")}${ben.fb?" "+T("*Pokémon median used (no data for this game).","*Médiane Pokémon utilisée (aucune donnée pour ce jeu)."):""}</p>`;
  $("#peek").innerHTML=`${O.money(P,0)} · EV ${pc(ev/P,0)} · ${T("chase","vedette")} ${sol.ptc?oneIn(1/sol.ptc):"—"} <span class="muted">▲</span>`;
}
function bench(P){const b=BD.bench[st.theme==="all"?"pokemon":st.theme]||BD.bench.pokemon;const k=P<15?"0-15":P<40?"15-40":P<80?"40-80":P<180?"80-180":P<400?"180-400":"400-1000000000";return {v:b[k],fb:!!b.fallback||st.theme==="all"}}
function allOdds(){
  if(!sol){$("#allOddsBody").innerHTML="";return}
  const rows=sol.rows.slice().sort((a,b)=>b.c[3]-a.c[3]);
  $("#allOddsBody").innerHTML=`<div class="tbl-wrap" style="max-height:420px;overflow:auto;margin-top:10px"><table class="tbl"><tr><th>${T("Card","Carte")}</th><th>${T("Role","Rôle")}</th><th class="num">${T("Value","Valeur")}</th><th class="num">${T("Copies","Copies")}</th><th class="num">${T("Odds","Probabilité")}</th></tr>${rows.map(r=>`<tr><td>${esc(r.c[0])}<div class="small muted">${esc(r.c[1])}</div></td><td><span class="rc" style="--c:${TCOL[r.tier]}">${r.src==="hit"?T("Hit","Vedette"):r.src==="med"?T("Medium","Moyen"):T("Low","Bas")}</span></td><td class="num">${O.money(r.c[3],2)}</td><td class="num">${r.c[4]}</td><td class="num">${oneIn(r.p)}</td></tr>`).join("")}</table></div>`;
}
function update(){
  st.q=$("#q").value||"";
  res=C.solve(st,poolFor(st.theme));sol=res.pick;
  $("#rng").value=Math.round(st.r*100);$("#rngV").textContent=pc(st.r,0);
  $("#priceSel").innerHTML=`<option value="auto"${st.price==="auto"?" selected":""}>${fr()?"Auto":"Auto"}${sol&&st.price==="auto"?" ("+O.money(sol.P,0)+")":""}</option>`+res.ok.map(s=>`<option value="${s.P}"${String(st.price)===String(s.P)?" selected":""}>${O.money(s.P,0)}</option>`).join("");
  $("#floorNote").innerHTML=sol?T(`Minimum card value at ${O.money(sol.P,0)}: ${O.money(sol.floor,2)} (20% of price, at least $0.50). Low-tier cards below it are left out.`,`Valeur minimale à ${O.money(sol.P,0)} : ${O.money(sol.floor,2)} (20 % du prix, au moins 0,50 $). Les cartes basses sous ce seuil sont exclues.`):"";
  $("#note").innerHTML=note;
  picked();results();summary();allOdds();save();O.applyLang(O.lang(),false);
  $("#q").placeholder=O.t("Search hits by card or set","Chercher une vedette par carte ou extension");
}
themeChips();lowOpts();
$("#q").value=st.q||"";$("#q").addEventListener("input",()=>results());
$("#rng").addEventListener("input",e=>{st.r=+e.target.value/100;update()});
$("#priceSel").addEventListener("change",e=>{st.price=e.target.value;update()});
$("#autoBtn").onclick=()=>{const a=C.autofill(st,poolFor(st.theme));const added=a.st.hits.length-st.hits.length;st=Object.assign(st,a.st);lowOpts();
  note=a.s.pick?T(`Auto-filled: ${added>0?added+" hits added, ":""}low tier on auto, price ${O.money(a.s.pick.P,0)}. Your own picks and medium choices were kept.`,`Auto-rempli : ${added>0?added+" vedettes ajoutées, ":""}palier bas en auto, prix ${O.money(a.s.pick.P,0)}. Tes choix ont été conservés.`):T("Auto-fill could not make these picks work; try removing a hit or changing a medium band.","L'auto-remplissage n'a pas trouvé de solution; retire une vedette ou change un palier moyen.");update()};
$("#resetBtn").onclick=()=>{st=Object.assign({},DEF);note="";themeChips();lowOpts();$("#q").value="";update()};
$("#sheetBtn").onclick=()=>{const s=$("#sum");const o=s.classList.toggle("open");$("#sheetBtn").setAttribute("aria-expanded",o)};
$("#openBtn").onclick=()=>{if(!sol)return;const pk=C.toPack(sol,st.theme,tmeta(st.theme));pk.name=O.t(`Custom pack $${sol.P}`,`Paquet composé ${sol.P} $`);
  const r=document.getElementById("reveal");r.innerHTML="";O.mountReveal(r,pk);$("#sum").classList.remove("open");document.getElementById("demo").scrollIntoView({behavior:O.reduced?"auto":"smooth",block:"start"})};
document.addEventListener("ouv:lang",()=>{themeChips();lowOpts();update()});
update();
})();
