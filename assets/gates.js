/* Age gate (first visit) + cookie banner (tracking off by default). Draft texts pending legal review. */
(function(){
"use strict";const O=window.OUV,$=O.$,LS=O.LS;
const T=(en,fr)=>`<span data-l="en">${en}</span><span data-l="fr">${fr}</span>`;
const DRAFT=`<span class="pill a">${T("Draft, pending legal review","Ébauche, en attente de révision juridique")}</span>`;
const AGE19=["BC","NB","NL","NS","NT","NU","YT","ON"];
const PROVS=["AB","BC","MB","NB","NL","NS","NT","NU","ON","PE","QC","SK","YT"];
O.minAge=p=>AGE19.includes(p)?19:18;
function ageGate(){
  if(LS.get("ouv_age",null)?.ok)return;
  const bg=document.createElement("div");bg.className="modal-bg open";bg.id="ageGate";bg.setAttribute("role","dialog");bg.setAttribute("aria-modal","true");
  bg.innerHTML=`<div class="modal"><img src="assets/logo.svg" alt="" style="width:46px"><h2 style="margin:10px 0">${T("Are you of age?","As-tu l'âge requis?")}</h2>
  <p class="small">${T("You must be of the age of majority in your province (18, or 19 in BC, NB, NL, NS, NT, NU and YT) to create an account or buy packs on Ouvrium. [Ouvrium sets 19+ in Ontario and BC — counsel to confirm.] We verify age before your first purchase.","Vous devez avoir atteint l'âge de la majorité dans votre province (18 ans, ou 19 ans en C.-B., au N.-B., à T.-N.-L., en N.-É., aux T.N.-O., au Nunavut et au Yukon) pour créer un compte ou acheter des paquets sur Ouvrium. Nous vérifions l'âge avant votre premier achat.")}</p>
  <label for="agProv">${T("Province or territory","Province ou territoire")}</label><select id="agProv">${PROVS.map(p=>`<option${p==="ON"?" selected":""}>${p}</option>`).join("")}</select>
  <div class="cta-row"><button class="btn gold" id="agYes">${T("I am of age in my province","J'ai l'âge requis")}</button><button class="btn ghost" id="agNo">${T("I am not","Je n'ai pas l'âge requis")}</button></div>
  <div id="agMsg" class="small"></div><p class="small muted">${DRAFT} ${T("Preview: your answer is stored only in this browser.","Aperçu : ta réponse reste dans ce navigateur.")}</p>
  <button class="lang" style="margin-top:6px" id="agLang">${O.lang()==="fr"?"English":"Français"}</button></div>`;
  document.body.appendChild(bg);O.applyLang(O.lang(),false);
  $("#agLang").onclick=()=>{O.applyLang(O.lang()==="fr"?"en":"fr",true);$("#agLang").textContent=O.lang()==="fr"?"English":"Français"};
  $("#agYes").onclick=()=>{LS.set("ouv_age",{ok:true,prov:$("#agProv").value,ts:Date.now()});bg.remove();cookies()};
  $("#agNo").onclick=()=>{$("#agMsg").innerHTML=`<p style="color:#ffd37a">${T(`Sorry, Ouvrium is only for adults (${O.minAge($("#agProv").value)}+ in your province). Come visit the game room at Carta Magica for events instead.`,`Désolé, Ouvrium est réservé aux adultes (${O.minAge($("#agProv").value)} ans et plus dans ta province). Viens plutôt aux événements de la salle de jeu Carta Magica.`)}</p>`;O.applyLang(O.lang(),false)};
}
function cookies(force){
  if(!force&&LS.get("ouv_cookies",null))return;if(!LS.get("ouv_age",null)?.ok&&!force)return;
  let el=$("#cookieBar");if(el)el.remove();
  el=document.createElement("div");el.id="cookieBar";el.setAttribute("role","region");el.setAttribute("aria-label","Cookies");
  el.style.cssText="position:fixed;left:12px;right:12px;bottom:12px;z-index:80;max-width:760px;margin:0 auto;background:#111729;border:1px solid #26304D;border-radius:16px;padding:14px 16px;box-shadow:0 20px 60px rgba(0,0,0,.5)";
  const c=LS.get("ouv_cookies",{analytics:false,ads:false});
  el.innerHTML=`<p class="small" style="margin:0 0 8px">${DRAFT} ${T("We use essential cookies to run Ouvrium. With your permission, we'd also use analytics and advertising cookies to improve the site and show you relevant ads. These stay off unless you turn them on.","Nous utilisons des témoins (cookies) essentiels au fonctionnement d'Ouvrium. Avec votre permission, nous utiliserions aussi des témoins d'analyse et de publicité pour améliorer le site et vous présenter des publicités pertinentes. Ils restent désactivés à moins que vous ne les activiez.")} <a href="${(window.OUV&&OUV.root)||""}privacy.html">${T("Privacy Policy","Politique de confidentialité")}</a>. ${T("(This preview sets no analytics or ad cookies at all.)","(Cet aperçu n'utilise aucun témoin d'analyse ni de publicité.)")}</p>
  <div id="ckSet" hidden class="small" style="margin:8px 0"><label style="display:flex;gap:8px"><input type="checkbox" checked disabled style="width:auto"> ${T("Essential (always on)","Essentiels (toujours actifs)")}</label><label style="display:flex;gap:8px"><input id="ckA" type="checkbox" style="width:auto"${c.analytics?" checked":""}> ${T("Analytics","Analyse")}</label><label style="display:flex;gap:8px"><input id="ckAd" type="checkbox" style="width:auto"${c.ads?" checked":""}> ${T("Advertising","Publicité")}</label><button class="btn gold sm" id="ckSave">${T("Save choices","Enregistrer")}</button></div>
  <div class="cta-row" style="margin:6px 0 0"><button class="btn ghost sm" id="ckAll">${T("Accept all","Tout accepter")}</button><button class="btn ghost sm" id="ckNo">${T("Refuse non-essential","Refuser les non essentiels")}</button><button class="btn ghost sm" id="ckS">${T("Settings","Paramètres")}</button></div>`;
  document.body.appendChild(el);O.applyLang(O.lang(),false);
  const save=v=>{LS.set("ouv_cookies",{...v,ts:Date.now()});el.remove()};
  $("#ckAll").onclick=()=>save({analytics:true,ads:true});$("#ckNo").onclick=()=>save({analytics:false,ads:false});
  $("#ckS").onclick=()=>{$("#ckSet").hidden=false};$("#ckSave").onclick=()=>save({analytics:$("#ckA").checked,ads:$("#ckAd").checked});
}
document.addEventListener("DOMContentLoaded",()=>{ageGate();cookies();document.querySelectorAll("[data-cookie-settings]").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();cookies(true)}))});
})();
