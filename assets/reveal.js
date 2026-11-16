/* Ouvrium DEMO reveal. Rules from the research: no roulette strip, no autoplay/turbo, no countdowns,
   celebration only when total value >= pack price, Skip always available, reduced-motion respected. */
(function(){
"use strict";
const O=window.OUV,D=window.OUV_DATA,$=O.$,$$=O.$$;
const root=document.getElementById("reveal");if(!root)return;
const pack=D.packs.find(p=>p.id===root.dataset.pack);
const T=(en,fr)=>`<span data-l="en">${en}</span><span data-l="fr">${fr}</span>`;
root.innerHTML=`
<div class="stage" id="stage" style="--s1:${pack.stage[0]};--s2:${pack.stage[1]}">
  <div class="bar-top">
    <button class="ic" id="mute" aria-pressed="false"></button>
    <span class="ic" title="Session clock" id="clock">⏱ 0:00</span>
    <span class="ic" id="sess"></span>
    <span class="sp"></span>
    <button class="ic" id="skip">${T("Skip ⏭","Passer ⏭")}</button>
  </div>
  <canvas id="fx"></canvas><div class="burst" id="burst"></div>
  <div class="tear-hint" id="hint">${T("Drag the glowing tab across to tear the foil","Glisse l'onglet lumineux pour déchirer l'emballage")}</div>
  <div class="packwrap" id="packwrap">
    <div class="pack" id="pack" style="--p1:${pack.foil[0]};--p2:${pack.foil[1]};--p3:${pack.foil[2]}">
      <div class="strip" id="strip"></div><div class="cut"></div><div class="grip" id="grip" aria-hidden="true">➜</div>
      <div class="body"><div class="pwm">OUVRIUM</div><div class="pname">${pack.name}</div><div class="pprice">${O.money(pack.price,0)} CAD</div><div class="small" style="margin-top:6px">${pack.cards} ${pack.cards>1?T("cards","cartes"):T("card","carte")}</div><div class="pser">Series 1 · Carta Magica Ottawa</div></div>
      <div class="sheen"></div>
    </div>
  </div>
  <div class="cards" id="cards"></div>
  <div class="result" id="result"><span class="verdict" id="verdict"></span></div>
  <div class="controls" id="controls">
    <button class="btn neon" id="tearBtn">${T("Tear pack (demo)","Déchirer le paquet (démo)")}</button>
  </div>
</div>
<div class="small muted" style="margin-top:10px" id="fair"></div>
<div class="after" id="after"></div>`;
O.applyLang(O.lang(),false);

const stage=$("#stage"),packEl=$("#pack"),wrap=$("#packwrap"),cardsEl=$("#cards"),controls=$("#controls"),fx=$("#fx"),ctx2=fx.getContext("2d");
let state="sealed",cards=[],flipped=0,session=O.LS.get("ouv_session",{opened:0,spend:0}),t0=Date.now(),seed=null;
const reduced=O.reduced;

/* ---------- session clock (no countdowns, only elapsed time) ---------- */
const sessEl=$("#sess");
function drawSess(){sessEl.innerHTML=T(`Demo packs: ${session.opened} · demo spend ${O.money(session.spend,0)}`,`Paquets démo : ${session.opened} · dépense démo ${O.money(session.spend,0)}`)}
drawSess();document.addEventListener("ouv:lang",drawSess);
setInterval(()=>{const s=Math.floor((Date.now()-t0)/1000);$("#clock").textContent="⏱ "+Math.floor(s/60)+":"+String(s%60).padStart(2,"0")},1000);

/* ---------- sound (WebAudio, mute toggle) ---------- */
let ac=null,muted=O.LS.get("ouv_mute",true);
const muteBtn=$("#mute");
function drawMute(){muteBtn.textContent=muted?"🔇 "+O.t("Sound off","Son coupé"):"🔊 "+O.t("Sound on","Son activé");muteBtn.setAttribute("aria-pressed",muted)}
drawMute();document.addEventListener("ouv:lang",drawMute);
muteBtn.onclick=()=>{muted=!muted;O.LS.set("ouv_mute",muted);drawMute()};
function A(){if(muted)return null;if(!ac){try{ac=new (window.AudioContext||window.webkitAudioContext)()}catch(e){return null}}if(ac.state==="suspended")ac.resume();return ac}
function noise(dur,f0,f1,gain){const a=A();if(!a)return;const n=a.createBuffer(1,a.sampleRate*dur,a.sampleRate),d=n.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);const s=a.createBufferSource();s.buffer=n;const bp=a.createBiquadFilter();bp.type="bandpass";bp.Q.value=1.2;bp.frequency.setValueAtTime(f0,a.currentTime);bp.frequency.exponentialRampToValueAtTime(f1,a.currentTime+dur);const g=a.createGain();g.gain.value=gain;s.connect(bp).connect(g).connect(a.destination);s.start()}
function tone(freq,t,dur,gain,type){const a=A();if(!a)return;const o=a.createOscillator(),g=a.createGain();o.type=type||"sine";o.frequency.value=freq;g.gain.setValueAtTime(0,a.currentTime+t);g.gain.linearRampToValueAtTime(gain,a.currentTime+t+.02);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+t+dur);o.connect(g).connect(a.destination);o.start(a.currentTime+t);o.stop(a.currentTime+t+dur+.05)}
const snd={
  rip:(p)=>noise(.08+.05*p,1800+2400*p,5000,.25),
  tear:()=>{noise(.45,900,6000,.5);tone(220,0,.3,.05,"triangle")},
  flip:()=>noise(.22,3000,600,.25),
  tick:()=>tone(660,0,.08,.06,"triangle"),
  hum:(lvl)=>{const a=A();if(!a)return;const o=a.createOscillator(),g=a.createGain();o.type="sawtooth";o.frequency.setValueAtTime(70,a.currentTime);o.frequency.exponentialRampToValueAtTime(120+lvl*60,a.currentTime+1.4);const lp=a.createBiquadFilter();lp.type="lowpass";lp.frequency.value=500+lvl*200;g.gain.setValueAtTime(.0001,a.currentTime);g.gain.exponentialRampToValueAtTime(.05+lvl*.015,a.currentTime+1.2);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+1.6);o.connect(lp).connect(g).connect(a.destination);o.start();o.stop(a.currentTime+1.7)},
  chime:(lvl)=>{const base=[523.25,659.25,783.99,1046.5,1318.5,1568];for(let i=0;i<Math.min(3+lvl,6);i++)tone(base[i],i*.09,.9+lvl*.1,.09,"sine");if(lvl>=3)tone(2093,.6,1.4,.05,"triangle")},
  plain:()=>tone(440,0,.18,.05,"sine")
};

/* ---------- particles / confetti ---------- */
let parts=[],raf=null;
function sizeFx(){const r=stage.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);fx.width=r.width*dpr;fx.height=r.height*dpr;ctx2.setTransform(dpr,0,0,dpr,0,0)}
sizeFx();addEventListener("resize",sizeFx);
function loop(){ctx2.clearRect(0,0,fx.width,fx.height);parts=parts.filter(p=>p.life>0);for(const p of parts){p.vy+=p.g;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.life-=1;p.rot+=p.vr;ctx2.save();ctx2.globalAlpha=Math.max(0,Math.min(1,p.life/40));ctx2.translate(p.x,p.y);ctx2.rotate(p.rot);ctx2.fillStyle=p.c;if(p.k==="c")ctx2.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);else{ctx2.beginPath();ctx2.arc(0,0,p.s,0,7);ctx2.fill()}ctx2.restore()}if(parts.length)raf=requestAnimationFrame(loop);else raf=null}
function emit(n,x,y,opts){if(reduced)return;for(let i=0;i<n;i++){const a=(opts.spread||Math.PI*2)*Math.random()+(opts.angle||0),v=(opts.v||4)*(.4+Math.random());parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(opts.up||0),g:opts.g||.08,life:60+Math.random()*60,s:opts.s||2+Math.random()*2,c:opts.colors[i%opts.colors.length],k:opts.k||"s",rot:Math.random()*6,vr:(Math.random()-.5)*.3})}if(!raf)loop()}
function confetti(color){const r=stage.getBoundingClientRect();emit(160,r.width/2,r.height*.35,{v:9,up:4,g:.18,k:"c",s:9,colors:["#F6E3A1","#D4AF37","#ffffff",color,"#3DFFB0"]})}

/* ---------- pointer / gyro tilt + holo ---------- */
function tilt(el,x,y){el.style.setProperty("--ry",((x-.5)*24)+"deg");el.style.setProperty("--rx",((.5-y)*20)+"deg");el.style.setProperty("--mx",(x*100)+"%");el.style.setProperty("--my",(y*100)+"%")}
stage.addEventListener("pointermove",e=>{if(reduced)return;const tgt=state==="sealed"?packEl:$(".flip.open .tcard",cardsEl);if(!tgt)return;const r=tgt.getBoundingClientRect();tilt(tgt,Math.min(1,Math.max(0,(e.clientX-r.left)/r.width)),Math.min(1,Math.max(0,(e.clientY-r.top)/r.height)))});
let gyroOn=false;function gyro(){if(gyroOn||reduced)return;gyroOn=true;addEventListener("deviceorientation",e=>{if(e.gamma==null)return;const tgt=state==="sealed"?packEl:$(".flip.open .tcard",cardsEl);if(!tgt)return;tilt(tgt,Math.min(1,Math.max(0,.5+e.gamma/60)),Math.min(1,Math.max(0,.5+(e.beta-40)/80)))})}
function askGyro(){try{if(window.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission==="function"){DeviceOrientationEvent.requestPermission().then(s=>{if(s==="granted")gyro()}).catch(()=>{})}else gyro()}catch(e){}}

/* ---------- provably-fair demo seed ---------- */
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");
async function newSeed(){
  const sv=new Uint8Array(32);crypto.getRandomValues(sv);const server=hex(sv);const cl=new Uint8Array(8);crypto.getRandomValues(cl);const client=hex(cl);const nonce=session.opened+1;
  let hash="(SHA-256 unavailable)";
  if(crypto.subtle){hash=hex(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(server)))}
  seed={server,client,nonce,hash};drawFair(false);
}
async function rollsFor(s){
  if(!crypto.subtle){const r=O.rng(Date.now());return{r,first:"n/a"}}
  const k=await crypto.subtle.importKey("raw",new TextEncoder().encode(s.server),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const dig=new Uint8Array(await crypto.subtle.sign("HMAC",k,new TextEncoder().encode(s.client+":"+s.nonce)));
  let i=0;const r=()=>{const v=((dig[i]<<24)|(dig[i+1]<<16)|(dig[i+2]<<8)|dig[i+3])>>>0;i=(i+4)%32;return v/4294967296};
  return{r,first:hex(dig).slice(0,16)};
}
function drawFair(revealed){const f=$("#fair");if(!seed){f.textContent="";return}
  f.innerHTML=T("Provably fair (demo): before you tear, the server seed is locked by its SHA-256 hash ","Équité prouvable (démo) : avant la déchirure, la graine serveur est verrouillée par son empreinte SHA-256 ")+`<span class="kbd">${seed.hash}</span>`+
  (revealed?`<br>${T("Revealed server seed","Graine serveur révélée")}: <span class="kbd">${seed.server}</span> · client <span class="kbd">${seed.client}</span> · nonce ${seed.nonce}. <a href="fairness.html#verify">${T("How to verify","Comment vérifier")}</a>`:"")}
newSeed();

/* ---------- tear interaction ---------- */
const grip=$("#grip");let dragging=false,startX=0,prog=0,lastRip=0;
function setTear(p){prog=p;packEl.style.setProperty("--tear",(p*100)+"%");const now=performance.now();if(now-lastRip>55&&p>0){snd.rip(p);lastRip=now;const r=packEl.getBoundingClientRect(),sr=stage.getBoundingClientRect();emit(4,r.left-sr.left+r.width*p,r.top-sr.top+46,{v:2.5,colors:["#fff6d0","#F6E3A1",pack.foil[1]],g:.12})}}
grip.addEventListener("pointerdown",e=>{if(state!=="sealed")return;dragging=true;startX=e.clientX-prog*packEl.offsetWidth;grip.setPointerCapture(e.pointerId);A();askGyro();e.preventDefault()});
grip.addEventListener("pointermove",e=>{if(!dragging)return;const p=Math.max(0,Math.min(1,(e.clientX-startX)/packEl.offsetWidth));setTear(p);if(p>.82){dragging=false;tearOff()}});
grip.addEventListener("pointerup",()=>{dragging=false;if(state==="sealed"&&prog<.82){const step=()=>{if(prog>0&&state==="sealed"){setTear(Math.max(0,prog-.06));requestAnimationFrame(step)}};step()}});
$("#tearBtn").onclick=()=>{if(state!=="sealed")return;A();askGyro();if(reduced){tearOff();return}let p=prog;const step=()=>{p+=.07;setTear(Math.min(1,p));if(p<1)requestAnimationFrame(step);else tearOff()};step()};

async function tearOff(){
  if(state!=="sealed")return;state="opening";
  const {r}=await rollsFor(seed);cards=O.openPack(pack,r);
  session.opened++;session.spend+=pack.price;O.LS.set("ouv_session",session);drawSess();
  packEl.classList.add("torn");$("#strip").classList.add("off");$("#hint").style.display="none";snd.tear();
  const b=$("#burst");b.classList.remove("go");void b.offsetWidth;b.classList.add("go");
  const sr=stage.getBoundingClientRect(),pr=packEl.getBoundingClientRect();emit(70,pr.left-sr.left+pr.width/2,pr.top-sr.top+46,{v:6,colors:["#fff","#F6E3A1","#D4AF37",pack.foil[1]],g:.1});
  if(navigator.vibrate)try{navigator.vibrate(18)}catch(e){}
  setTimeout(()=>{wrap.classList.add("gone");dealCards()},reduced?0:650);
}

/* ---------- deal + flip ---------- */
const priceOK=()=>cards.reduce((a,c)=>a+c.value,0)>=pack.price;
function tierIdx(k){return D.tiers.findIndex(t=>t.k===k)}
function dealCards(){
  state="reveal";cardsEl.innerHTML="";
  cards.forEach((c,i)=>{const hit=i===cards.length-1;const t=O.tierOf(c.tier);const el=document.createElement("div");el.className="flip"+(hit?" hit":"");el.style.setProperty("--ac",t.color);el.style.setProperty("--ai",(.35+tierIdx(c.tier)*.08).toFixed(2));
    el.innerHTML=`<div class="aura"></div><div class="backf"><div class="tcard back"></div></div><div class="face">${O.cardHTML(c)}</div>`;el.setAttribute("role","button");el.tabIndex=0;
    el.setAttribute("aria-label",hit?O.t("Hit card, face down","Carte vedette, face cachée"):O.t("Card, face down. Tap to turn over","Carte face cachée. Touche pour retourner"));
    cardsEl.appendChild(el);setTimeout(()=>el.classList.add("in"),reduced?0:120+i*160);
    el.addEventListener("click",()=>onCard(i));el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();onCard(i)}});
  });
  flipped=0;nextControls();
}
function nextControls(){
  const nCommons=cards.length-1;
  if(flipped<nCommons){controls.innerHTML=`<button class="btn ghost" id="nx">${T(`Turn over card ${flipped+1} of ${nCommons}`,`Retourner la carte ${flipped+1} sur ${nCommons}`)}</button>`;$("#nx").onclick=()=>onCard(flipped)}
  else if(flipped===nCommons){const hitEl=cardsEl.children[nCommons];setTimeout(()=>{hitEl.classList.add("charge");snd.hum(Math.max(0,tierIdx(cards[nCommons].tier)-2))},reduced?0:250);
    controls.innerHTML=`<button class="btn gold" id="flipBtn">${T("Flip the hit card","Retourner la carte vedette")}</button>`;$("#flipBtn").onclick=()=>onCard(nCommons)}
  O.applyLang(O.lang(),false);
}
function onCard(i){
  if(state!=="reveal"||i!==flipped)return;const el=cardsEl.children[i];const c=cards[i];const hit=i===cards.length-1;
  if(!hit){el.classList.add("open");snd.flip();flipped++;nextControls();return}
  const big=tierIdx(c.tier)>=6||c.value>=pack.price*3;
  controls.innerHTML="";
  if(big&&!reduced){el.classList.add("slow");stage.classList.add("dim")}
  el.classList.add("open");snd.flip();
  setTimeout(()=>{stage.classList.remove("dim");el.classList.remove("charge");finish(false)},reduced?50:(big?1950:650));
  flipped++;
}
$("#skip").onclick=()=>{
  if(state==="sealed"){A();tearOffSkip();return}
  if(state==="reveal"){[...cardsEl.children].forEach(e=>{e.classList.remove("slow","charge");e.classList.add("in","open")});flipped=cards.length;finish(true)}
};
async function tearOffSkip(){state="opening";const {r}=await rollsFor(seed);cards=O.openPack(pack,r);session.opened++;session.spend+=pack.price;O.LS.set("ouv_session",session);drawSess();wrap.classList.add("gone");$("#hint").style.display="none";state="reveal";dealCards();[...cardsEl.children].forEach(e=>e.classList.add("in","open"));flipped=cards.length;finish(true)}

/* ---------- result: honest verdict, celebration only when value >= price ---------- */
function finish(skipped){
  if(state==="done")return;state="done";
  const total=cards.reduce((a,c)=>a+c.value,0),hit=cards[cards.length-1],win=total>=pack.price;
  const v=$("#verdict");$("#result").classList.add("show");
  $$(".flip.open .tcard",cardsEl).forEach(e=>e.style.setProperty("--holo",win?".9":".35"));
  if(win){
    const lvl=Math.min(4,Math.floor(Math.log2(total/pack.price))+1);
    v.className="verdict win";v.innerHTML=T(`Hit: ${O.money(total,2)} in cards from a ${O.money(pack.price,0)} pack`,`Belle prise : ${O.money(total,2)} en cartes pour un paquet de ${O.money(pack.price,0)}`);
    if(!skipped){confetti(O.tierOf(hit.tier).color);snd.chime(lvl)}
    if(navigator.vibrate)try{navigator.vibrate(lvl>=3?[60,40,120,40,200]:[50,30,90])}catch(e){}
  }else{
    v.className="verdict";v.innerHTML=T(`${O.money(total,2)} in cards · pack price ${O.money(pack.price,0)}`,`${O.money(total,2)} en cartes · prix du paquet ${O.money(pack.price,0)}`);
    snd.plain();
  }
  drawFair(true);
  const credit=Math.round(total*0.9*100)/100;
  const after=$("#after");after.classList.add("show");
  after.innerHTML=`<div class="card"><h3>${T("What do you want to do with it?","Que veux-tu en faire ?")}</h3>
  <div class="tbl-wrap" style="margin:10px 0"><table class="tbl"><tr><th>${T("Card","Carte")}</th><th>${T("Tier","Palier")}</th><th class="num">${T("Store value","Valeur en magasin")}</th></tr>
  ${cards.map(c=>`<tr><td>${O.esc(c.name)}<div class="small muted">${O.esc(c.set)}</div></td><td><span class="rc" style="--c:${O.tierOf(c.tier).color}">${c.tier}</span></td><td class="num">${O.money(c.value,2)}</td></tr>`).join("")}
  <tr><td colspan="2"><b>${T("Total vs pack price","Total vs prix du paquet")}</b></td><td class="num"><b>${O.money(total,2)}</b> / ${O.money(pack.price,0)}</td></tr></table></div>
  <div class="choice" id="choice">
   <button data-c="keep"><b>${T("Keep in my vault","Garder dans mon coffre")}</b>${T("Free, insured storage. Decide later.","Entreposage gratuit et assuré. Décide plus tard.")}</button>
   <button data-c="sell"><b>${T("Sell back: ","Revendre : ")}${O.money(credit,2)} ${T("credit","de crédit")}</b>${T("90% of store value in Carta Magica credit. Open for 7 days, no fee.","90 % de la valeur en crédit Carta Magica. Offre ouverte 7 jours, sans frais.")}</button>
   <button data-c="ship"><b>${T("Ship it in Canada","Expédier au Canada")}</b>${T("Sleeved, toploaded, tracked. No customs. Rates TBD.","Pochette, toploader, suivi. Aucune douane. Tarifs à venir.")}</button>
   <button data-c="pickup"><b>${T("Pick up in Ottawa","Ramasser à Ottawa")}</b>${T("1179 St. Laurent Blvd, during store hours.","1179, boul. St-Laurent, aux heures d'ouverture.")}</button>
  </div>
  <div class="cta-row"><button class="btn ghost sm" id="share">${T("Share this pull (image)","Partager cette carte (image)")}</button><button class="btn ghost sm" id="again">${T("Reset demo","Réinitialiser la démo")}</button><a class="btn ghost sm" href="#odds">${T("See the odds","Voir les probabilités")}</a></div>
  <p class="small muted">${T("Demo only. No card, credit or money changes hands. Values are Carta Magica Ottawa store prices (10 Nov 2026 export). Low tiers draw from a sample of the pool.","Démo seulement. Aucune carte, aucun crédit ni argent n'est échangé. Valeurs : prix en magasin Carta Magica Ottawa (export du 10 nov. 2026). Les paliers bas utilisent un échantillon du stock.")}</p></div>`;
  O.applyLang(O.lang(),false);
  $$("#choice button").forEach(b=>b.onclick=()=>{$$("#choice button").forEach(x=>x.classList.remove("sel"));b.classList.add("sel");const c=b.dataset.c;
    cards.forEach(cd=>O.vaultAdd({...cd,pack:pack.name}));
    if(c==="sell"){O.addCredit(credit);const v=O.vault();for(let i=0;i<cards.length;i++)v[i].status="sold";O.LS.set("ouv_vault",v);O.toast(O.t(`Demo: ${O.money(credit,2)} store credit added. You have 7 days to change your mind.`,`Démo : ${O.money(credit,2)} de crédit ajouté. Tu as 7 jours pour changer d'idée.`))}
    else O.toast(O.t("Demo: saved to your demo vault.","Démo : ajouté à ton coffre démo."));
    $$("#choice button").forEach(x=>x.disabled=true)});
  $("#share").onclick=()=>shareImage(hit,total);
  $("#again").onclick=reset;
  // spending-limit reminder, set by the user in the demo sign-up (never a re-buy nudge)
  const s=O.LS.get("ouv_signup",null);if(s&&s.limit&&session.spend>=s.limit)O.toast(O.t(`You've reached the demo limit you set (${O.money(s.limit,0)}). Time for a break?`,`Tu as atteint la limite démo que tu as fixée (${O.money(s.limit,0)}). Une pause ?`));
  controls.innerHTML="";
}
function reset(){state="sealed";cards=[];cardsEl.innerHTML="";const vd=$("#verdict");vd.className="verdict";vd.innerHTML="";$$(".flip").forEach(e=>e.remove());$("#result").classList.remove("show");$("#after").classList.remove("show");wrap.classList.remove("gone");packEl.classList.remove("torn");$("#strip").classList.remove("off");setTear(0);$("#hint").style.display="";controls.innerHTML=`<button class="btn neon" id="tearBtn">${T("Tear pack (demo)","Déchirer le paquet (démo)")}</button>`;O.applyLang(O.lang(),false);$("#tearBtn").onclick=()=>{A();let p=0;const step=()=>{p+=.07;setTear(Math.min(1,p));if(p<1&&!reduced)requestAnimationFrame(step);else tearOff()};step()};newSeed();stage.scrollIntoView({behavior:reduced?"auto":"smooth",block:"center"})}

/* ---------- share-your-pull image ---------- */
function shareImage(c,total){
  const W=1080,H=1350,cv=document.createElement("canvas");cv.width=W;cv.height=H;const g=cv.getContext("2d");const t=O.tierOf(c.tier);
  const bg=g.createRadialGradient(W/2,200,50,W/2,500,1100);bg.addColorStop(0,pack.stage[0]);bg.addColorStop(.6,pack.stage[1]);bg.addColorStop(1,"#05060b");g.fillStyle=bg;g.fillRect(0,0,W,H);
  g.fillStyle="#F6E3A1";g.font="48px Georgia";g.textAlign="center";g.fillText("O U V R I U M",W/2,110);
  g.save();g.shadowColor=t.color;g.shadowBlur=80;g.fillStyle="#111729";rr(g,290,180,500,700,36);g.fill();g.restore();
  g.lineWidth=10;g.strokeStyle=t.color;rr(g,290,180,500,700,36);g.stroke();
  g.fillStyle=t.color;g.font="bold 40px system-ui";g.fillText(c.tier+" · "+c.game,W/2,260);
  g.fillStyle="#fff";g.font="56px Georgia";wrapText(g,c.name.split(" - ")[0],W/2,560,440,64);
  g.fillStyle="#F6E3A1";g.font="bold 64px system-ui";g.fillText(O.money(c.value,2),W/2,820);
  g.fillStyle="#fff";g.font="40px system-ui";g.fillText(pack.name+" "+O.money(pack.price,0)+" CAD",W/2,990);
  g.fillStyle="#9AA3B8";g.font="32px system-ui";g.fillText(O.t("DEMO PULL · Ouvrium preview · not a real award","TIRAGE DÉMO · aperçu Ouvrium · aucun prix réel"),W/2,1200);
  g.fillText("Powered by Carta Magica · Ottawa & Montréal",W/2,1260);
  cv.toBlob(async b=>{const f=new File([b],"ouvrium-demo-pull.png",{type:"image/png"});
    try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:"Ouvrium demo pull"});return}}catch(e){}
    const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="ouvrium-demo-pull.png";document.body.appendChild(a);a.click();a.remove();O.toast(O.t("Image saved: ouvrium-demo-pull.png","Image enregistrée : ouvrium-demo-pull.png"))},"image/png");
}
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function wrapText(g,s,x,y,mw,lh){const w=s.split(" ");let line="",yy=y;for(const word of w){const test=line?line+" "+word:word;if(g.measureText(test).width>mw&&line){g.fillText(line,x,yy);line=word;yy+=lh}else line=test}g.fillText(line,x,yy)}
})();
