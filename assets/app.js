/* Ouvrium preview — shared behaviour. Nothing here talks to a server. */
(function(){
"use strict";
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}},del(k){try{localStorage.removeItem(k)}catch(e){}}};
const SS={get(k){try{return sessionStorage.getItem(k)}catch(e){return null}},set(k,v){try{sessionStorage.setItem(k,v)}catch(e){}}};
const O=window.OUV=window.OUV||{};
O.root=((document.currentScript&&document.currentScript.src)||"").replace(/assets\/app\.js.*$/,"");
O.$=$;O.$$=$$;O.LS=LS;
O.lang=()=>document.documentElement.lang==="fr-CA"?"fr":"en";
O.t=(en,fr)=>O.lang()==="fr"?fr:en;
O.money=(v,dec)=>{const d=dec==null?(v<10?2:(v%1?2:0)):dec;return O.lang()==="fr"?v.toLocaleString("fr-CA",{minimumFractionDigits:d,maximumFractionDigits:d})+" $":"$"+v.toLocaleString("en-CA",{minimumFractionDigits:d,maximumFractionDigits:d})};
O.reduced=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- language ---------- */
function applyLang(l,push){
  const h=document.documentElement;h.lang=l==="fr"?"fr-CA":"en-CA";
  const tt=h.dataset["title"+(l==="fr"?"Fr":"En")];if(tt)document.title=tt;
  const md=$('meta[name="description"]');const dd=h.dataset["desc"+(l==="fr"?"Fr":"En")];if(md&&dd)md.setAttribute("content",dd);
  $$("[data-ph-en]").forEach(e=>e.placeholder=e.dataset[l==="fr"?"phFr":"phEn"]);
  $$("a[href]").forEach(a=>{const href=a.getAttribute("href");if(!href||/^(https?:|mailto:|tel:|#)/.test(href))return;const [p,hash]=href.split("#");const base=p.replace(/[?&]lang=fr/,"");a.setAttribute("href",(l==="fr"?base+(base.includes("?")?"&":"?")+"lang=fr":base)+(hash?"#"+hash:""))});
  const b=$("#langBtn");if(b){b.textContent=l==="fr"?"EN":"FR";b.setAttribute("aria-label",l==="fr"?"Switch to English":"Passer au français")}
  LS.set("ouv_lang",l);
  if(push){const u=new URL(location.href);if(l==="fr")u.searchParams.set("lang","fr");else u.searchParams.delete("lang");history.replaceState(null,"",u)}
  if(applyLang.busy)return;applyLang.busy=true;try{document.dispatchEvent(new CustomEvent("ouv:lang",{detail:l}))}finally{applyLang.busy=false}
}
O.applyLang=applyLang;
const qp=new URLSearchParams(location.search).get("lang");
applyLang(qp==="fr"?"fr":qp==="en"?"en":LS.get("ouv_lang","en"),false);

document.addEventListener("DOMContentLoaded",()=>{
  const lb=$("#langBtn");if(lb)lb.addEventListener("click",()=>applyLang(O.lang()==="fr"?"en":"fr",true));
  const bg=$(".burger");if(bg)bg.addEventListener("click",()=>{$(".links").classList.toggle("open");bg.setAttribute("aria-expanded",$(".links").classList.contains("open"))});
  applyLang(O.lang(),false);
  initFeed();initExit();initResume();initDaily();
  $$("[data-disabled-cta]").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();O.toast(O.t("Preview only: the waitlist isn't open yet and nothing is collected.","Aperçu seulement : la liste d'attente n'est pas encore ouverte et rien n'est recueilli."))}));
});

/* ---------- toast ---------- */
O.toast=(msg)=>{let t=$("#toast");if(!t){t=document.createElement("div");t.id="toast";t.className="toast";t.setAttribute("role","status");document.body.appendChild(t)}t.textContent=msg;t.classList.add("show");clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove("show"),4200)};

/* ---------- RNG + draw (demo) ---------- */
O.rng=(seed)=>{let s=seed>>>0||1;return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296}};
O.tierOf=k=>(window.OUV_DATA.tiers.find(t=>t.k===k));
O.pickTier=(probs,r)=>{let x=r(),acc=0;const ks=Object.keys(probs);for(const k of ks){acc+=probs[k];if(x<acc)return k}return ks[ks.length-1]};
O.pickCard=(tierK,poolName,r,pack)=>{
  const D=window.OUV_DATA;let list;
  if(pack&&pack.own){list=pack.own[tierK]||[]}else{list=D.pool[tierK];if(poolName==="Pokemon")list=list.filter(c=>c[2]==="Pokemon");if(!list.length)list=D.pool[tierK]}
  const tot=list.reduce((a,c)=>a+c[4],0);let x=r()*tot;for(const c of list){x-=c[4];if(x<=0)return {name:c[0],set:c[1],game:c[2],value:c[3],qty:c[4],id:c[5],tier:tierK}}
  const c=list[list.length-1];return {name:c[0],set:c[1],game:c[2],value:c[3],qty:c[4],id:c[5],tier:tierK};
};
O.openPack=(pack,r)=>{const cards=[];for(let i=0;i<((pack.fixed||{}).C||0);i++)cards.push(O.pickCard("C",pack.pool,r,pack));const tk=O.pickTier(pack.probs,r);cards.push(O.pickCard(tk,pack.pool,r,pack));return cards};
O.findPack=id=>(window.OUV_DATA.packs.find(p=>p.id===id)||((window.OUV_THEMES||{}).packs||[]).find(p=>p.id===id));
function esc(s){return String(s).replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]))}
O.esc=esc;
O.cardBack=()=>(O.root||"")+"assets/cardback-ouvrium.svg";
O.shopById=(function(){let map;return function(){if(map)return map;map=Object.create(null);const S=window.OUV_SHOP;if(S&&S.cards)for(const row of S.cards)map[row[5]]=row;return map}})();
/* Official card art from the shop catalog (host+path), looked up by Crystal Commerce product id.
   If the shop has no usable image (all Gundam, plus a few others, plus pool cards not in the shop),
   show the Ouvrium cardback — never a "?" monogram. Image pixels are unaltered. */
O.cardArtUrl=c=>{
  const S=window.OUV_SHOP,id=c&&c.id!=null?c.id:null,row=id!=null?O.shopById()[id]:null;
  const loc=S&&S.local&&id!=null&&(S.local[String(id)]||S.local[id]);
  if(loc) return (O.root||"")+loc;
  if(row&&row[6]>=0&&S&&S.hosts&&S.hosts[row[6]]){
    const h=S.hosts[row[6]];
    if(h==="local:"||h==="local") return (O.root||"")+row[7];
    return h+row[7];
  }
  return null;
};
O.cardHTML=(c,opts={})=>{
  const t=O.tierOf(c.tier)||{color:"#888",short:"",k:c.tier||""};
  const src=O.cardArtUrl(c)||O.cardBack(), fall=esc(O.cardBack());
  return `<div class="tcard tcard-art" style="--c:${t.color}"><img class="tcard-img" src="${esc(src)}" alt="${esc(c.name||"")}" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='${fall}';this.classList.add('fb')"><div class="tmeta"><div class="gm">${esc(c.game||"")} · ${esc(t.short||t.k)}</div><div class="nm">${esc(c.name||"")}</div>${opts.noValue?"":`<div class="vl">${O.money(c.value,2)}</div>`}</div></div>`;
};

/* ---------- live pull feed (DEMO data) ---------- */
function initFeed(){
  const el=$("#feed");if(!el||!window.OUV_DATA)return;
  const D=window.OUV_DATA;const r=O.rng(Date.now()&0xffffffff);const items=[];
  const cities=["Ottawa","Gatineau","Montréal","Laval","Kanata","Québec","Toronto","Orléans","Longueuil","Sherbrooke"];
  for(let i=0;i<18;i++){const p=D.packs[Math.floor(r()*D.packs.length)];const cs=O.openPack(p,r);const hit=cs[cs.length-1];const tot=cs.reduce((a,c)=>a+c.value,0);items.push({p,hit,tot,city:cities[Math.floor(r()*cities.length)]})}
  const html=items.map(x=>{const t=O.tierOf(x.hit.tier);return `<div class="fi" style="--c:${t.color}"><i></i><div><b>${esc(x.hit.name.split(" - ")[0])}</b><br><span class="muted">${x.p.name} ${O.money(x.p.price,0)} · ${O.money(x.tot,2)} · ${x.city}</span></div></div>`}).join("");
  el.innerHTML=`<div class="feed-track">${html}${html}</div>`;
  if(O.reduced)el.querySelector(".feed-track").style.animation="none";
}

/* ---------- exit intent: one modal per session ---------- */
function initExit(){
  const m=$("#exitModal");if(!m)return;
  if(SS.get("ouv_exit"))return;
  if(/signup\.html/.test(location.pathname))return;
  let armed=false;setTimeout(()=>armed=true,4000);
  const show=()=>{if(!armed||SS.get("ouv_exit")||!(LS.get("ouv_age",null)||{}).ok||document.getElementById("ageGate"))return;SS.set("ouv_exit","1");m.classList.add("open");const b=$("[data-close]",m);b&&b.focus()};
  const hide=()=>m.classList.remove("open");
  $$("[data-close]",m).forEach(b=>b.addEventListener("click",hide));
  m.addEventListener("click",e=>{if(e.target===m)hide()});
  document.addEventListener("keydown",e=>{if(e.key==="Escape")hide()});
  document.addEventListener("mouseout",e=>{if(!e.relatedTarget&&e.clientY<=0)show()});
  // mobile: fast back-scroll toward the top, or 45 s idle
  let lastY=scrollY,lastT=performance.now(),idle;
  const resetIdle=()=>{clearTimeout(idle);idle=setTimeout(()=>{if(matchMedia("(pointer:coarse)").matches)show()},45000)};
  addEventListener("scroll",()=>{const now=performance.now(),y=scrollY,v=(y-lastY)/Math.max(1,now-lastT);if(matchMedia("(pointer:coarse)").matches&&v<-2.2&&lastY>700)show();lastY=y;lastT=now;resetIdle()},{passive:true});
  ["touchstart","pointerdown","keydown"].forEach(ev=>addEventListener(ev,resetIdle,{passive:true}));resetIdle();
  O.showExit=()=>{armed=true;SS.set("ouv_exit","");show()};
}

/* ---------- resume signup chip ---------- */
function initResume(){
  const s=LS.get("ouv_signup",null);const el=$("#resume");if(!el||!s||s.done||/signup\.html/.test(location.pathname))return;
  const pct=Math.round((s.step/4)*100);$("i",$(".bar",el)).style.width=pct+"%";$("[data-pct]",el).textContent=pct+"%";el.classList.add("show");
  $("[data-dismiss]",el).addEventListener("click",()=>el.classList.remove("show"));
}

/* ---------- daily free reveal + streak (AMBER: capped, no purchase) ---------- */
O.today=()=>{const d=new Date();return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()};
O.daily=()=>LS.get("ouv_daily",{last:null,streak:0,best:0});
function dayDiff(a,b){const pa=a.split("-").map(Number),pb=b.split("-").map(Number);return Math.round((new Date(pb[0],pb[1]-1,pb[2])-new Date(pa[0],pa[1]-1,pa[2]))/864e5)}
function initDaily(){
  const box=$("#daily");if(!box||!window.OUV_DATA)return;
  const render=()=>{const d=O.daily();const done=d.last===O.today();
    $("[data-streak]",box).textContent=Math.min(d.streak,7);
    $$(".sd",box).forEach((e,i)=>e.classList.toggle("on",i<Math.min(d.streak,7)));
    const b=$("[data-claim]",box);b.disabled=done;b.innerHTML=done?O.t("Come back tomorrow","Reviens demain"):O.t("Reveal today's free card","Révéler la carte gratuite du jour")};
  render();document.addEventListener("ouv:lang",render);
  $("[data-claim]",box).addEventListener("click",()=>{
    const d=O.daily();const t=O.today();if(d.last===t)return;
    const gap=d.last?dayDiff(d.last,t):99;d.streak=gap===1?d.streak+1:1;if(d.streak>7)d.streak=1;d.best=Math.max(d.best||0,d.streak);d.last=t;LS.set("ouv_daily",d);
    // free reveal draws a common/uncommon from the demo pool only — no value, no purchase
    const r=O.rng((Date.now()^0x9e3779b9)>>>0);const k=r()<0.8?"C":"T1";const c=O.pickCard(k,"Pokemon",r);
    O.vaultAdd({...c,pack:"Daily",free:true});
    $("[data-out]",box).innerHTML=`<div style="max-width:150px">${O.cardHTML(c)}</div><p class="small muted">${O.t("Added to your demo vault. Free reveals are capped at one a day and never need a purchase. A missed day just restarts the count; nothing is lost.","Ajoutée à ton coffre démo. Une révélation gratuite par jour, sans achat. Un jour manqué recommence le compte, rien n'est perdu.")}</p>`;
    render();
  });
}

/* ---------- demo vault ---------- */
O.vault=()=>LS.get("ouv_vault",[]);
O.vaultAdd=(c)=>{const v=O.vault();v.unshift({...c,ts:Date.now(),status:"kept"});LS.set("ouv_vault",v.slice(0,200))};
O.credit=()=>LS.get("ouv_credit",0);
O.addCredit=(x)=>LS.set("ouv_credit",Math.round((O.credit()+x)*100)/100);

/* Transparent VP9 pack loops (Gundam). Safari/iOS cannot paint VP9 alpha, so
   those browsers keep the static PNG/WebP cutout. Chrome/Firefox/Edge get the
   webm. The source is injected only after the check so iOS never decodes a
   webm as an opaque box. */
function supportsWebmAlpha(){
  const ua=navigator.userAgent||"";
  if(/iP(hone|ad|od)/i.test(ua)) return false;
  if(/Safari/i.test(ua)&&!/Chrome|Chromium|Edg|OPR|Firefox|Android/i.test(ua)) return false;
  const v=document.createElement("video");
  return !!(v.canPlayType&&v.canPlayType('video/webm; codecs="vp9"'));
}
function initGdPackLoops(){
  if(!supportsWebmAlpha()) return;
  $$("video.gd-pack[data-webm]").forEach(vid=>{
    const src=document.createElement("source");
    src.src=vid.getAttribute("data-webm");
    src.type="video/webm; codecs=vp9";
    vid.appendChild(src);
    vid.hidden=false;
    const wrap=vid.parentElement;
    if(wrap){
      const pic=wrap.querySelector("picture");
      if(pic) pic.hidden=true;
    }
    const p=vid.play();
    if(p&&p.catch) p.catch(()=>{});
  });
}
initGdPackLoops();
})();
