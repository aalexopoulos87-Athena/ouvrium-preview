/* Ouvrium build-your-own-pack solver (DEMO). Shared by the /build page and the spec page examples (run in Node at build time).
   A built pack holds 1 card. Odds: each picked hit contributes an equal share of EV (p_hit = SH*r*P / (n*value));
   the supporting "medium" and "low" tiers are solved so EV / price = r exactly. Price comes from the ladder. */
(function(g){
"use strict";
const LADDER=[5,10,15,20,25,30,40,50,75,100,150,200,250,300,400,500];
const MED={m1:{lo:3,hi:10},m2:{lo:10,hi:25},m3:{lo:25,hi:50},m4:{lo:50,hi:100},m5:{lo:100,hi:250}};
const LOW={l1:{lo:1,hi:3},l2:{lo:3,hi:10},l3:{lo:10,hi:25}};
const SH=0.35,MAX_HITS=5,HIT_MIN_X=2,FLOOR_X=0.2,FLOOR_MIN=0.5,MIN_SERIES=10,TARGET_HIT=40;
const tierOfX=x=>x>=5?"prism":x>=2?"gold":x>=1?"purple":x>=.6?"blue":"grey";
function solveAt(P,st,pool,byId){
  const fail=why=>({ok:false,P,why});
  const hits=st.hits.map(h=>({h,c:byId[h.id]})).filter(x=>x.c);
  if(!hits.length)return fail("nohits");
  if(hits.some(x=>x.c[3]<HIT_MIN_X*P))return fail("hitlow");
  const floor=Math.max(FLOOR_MIN,FLOOR_X*P);
  const hitIds=new Set(hits.map(x=>x.c[5]));
  const bands=new Set(hits.map(x=>x.h.med||"auto"));
  const inMed=v=>[...bands].some(b=>b==="auto"?(v>=.6*P&&v<2*P):(v>=MED[b].lo&&v<MED[b].hi));
  const lb=st.low==="auto"||!LOW[st.low]?{lo:floor,hi:.6*P}:{lo:Math.max(floor,LOW[st.low].lo),hi:LOW[st.low].hi};
  const med=[],low=[];
  for(const c of pool){
    if(hitIds.has(c[5])||c[3]<floor)continue;
    if(c[3]>=lb.lo&&c[3]<lb.hi)low.push(c);else if(inMed(c[3]))med.push(c);
  }
  if(!low.length)return fail("nolow");
  if(!med.length)return fail("nomed");
  const qty=a=>a.reduce((s,c)=>s+c[4],0),mean=a=>a.reduce((s,c)=>s+c[3]*c[4],0)/qty(a);
  const mL=mean(low),mM=mean(med);
  if(mM<=mL)return fail("medlow");
  const rP=st.r*P,n=hits.length;
  hits.forEach(x=>{x.p=SH*rP/(n*x.c[3])});
  const pH=hits.reduce((s,x)=>s+x.p,0),evH=SH*rP;
  if(pH>0.25)return fail("hitsrich");
  const pM=(rP-evH-(1-pH)*mL)/(mM-mL),pL=1-pH-pM;
  if(pM<0.03)return fail("toorich");
  if(pM>0.6||pL<0.25)return fail("toopoor");
  const qM=qty(med),qL=qty(low);
  const rows=[];
  hits.forEach(x=>rows.push({c:x.c,p:x.p,src:"hit"}));
  med.forEach(c=>rows.push({c,p:pM*c[4]/qM,src:"med"}));
  low.forEach(c=>rows.push({c,p:pL*c[4]/qL,src:"low"}));
  let series=Infinity;rows.forEach(r=>{series=Math.min(series,r.c[4]/r.p)});series=Math.floor(series);
  if(series<MIN_SERIES)return fail("stock");
  const ev=rows.reduce((s,r)=>s+r.p*r.c[3],0);
  const pChase=rows.filter(r=>r.c[3]>=5*P).reduce((s,r)=>s+r.p,0);
  const tiers={grey:0,blue:0,purple:0,gold:0,prism:0};rows.forEach(r=>{r.tier=tierOfX(r.c[3]/P);tiers[r.tier]+=r.p});
  return {ok:true,P,r:st.r,floor,hits,med:{n:med.length,copies:qM,mean:mM,p:pM,band:lb},low:{n:low.length,copies:qL,mean:mL,p:pL,band:lb},pH,pM,pL,rows,series,ev,pChase,tiers,
    ptc:pChase>0?1/pChase:null,cost:pChase>0?P/pChase:null,pthit:1/pH};
}
function solve(st,pool){
  const byId={};pool.forEach(c=>{byId[c[5]]=c});
  const all=LADDER.map(P=>solveAt(P,st,pool,byId));
  const ok=all.filter(s=>s.ok);
  let pick=null;
  if(st.price!=="auto")pick=ok.find(s=>s.P===+st.price)||null;
  const priceFallback=!!(st.price!=="auto"&&!pick);
  if(!pick&&ok.length)pick=ok.slice().sort((a,b)=>Math.abs(Math.log(a.pthit/TARGET_HIT))-Math.abs(Math.log(b.pthit/TARGET_HIT)))[0];
  const why=ok.length?null:(all.find(s=>s.why!=="hitlow")||all[0]).why;
  return {pick,ok,all,why,byId,priceFallback};
}
/* Auto-fill: keeps the player's hits and their medium choices, never exceeds stock, fills what is missing. */
function autofill(st,pool){
  const out=JSON.parse(JSON.stringify(st));
  out.low="auto";out.price="auto";
  if(!(out.r>=.85&&out.r<=.92))out.r=.90;
  if(!out.hits.length){
    const cands=pool.filter(c=>c[3]>=100&&c[3]<=1000&&c[4]>=1).sort((a,b)=>b[3]-a[3]);
    const pickFrom=cands.length>=3?cands:pool.slice().sort((a,b)=>b[3]-a[3]);
    const seen=new Set();
    for(const c of pickFrom){const k=c[0].split(" - ")[0];if(seen.has(k))continue;seen.add(k);out.hits.push({id:c[5],med:"auto",fmt:"raw"});if(out.hits.length>=3)break}
  }
  out.hits.forEach(h=>{if(!h.med)h.med="auto";if(!h.fmt)h.fmt="raw"});
  // if nothing is feasible, relax only what auto-fill owns: try each medium band that is still "auto"
  let s=solve(out,pool);
  if(!s.pick){for(const b of ["m2","m3","m1","m4","m5"]){const t=JSON.parse(JSON.stringify(out));t.hits.forEach(h=>{if(h.med==="auto")h.med=b});const s2=solve(t,pool);if(s2.pick){return {st:t,s:s2}}}}
  return {st:out,s};
}
/* Turn a solution into a pack object for the shared reveal engine; weights are the published per-card odds. */
function toPack(sol,theme,meta){
  const own={grey:[],blue:[],purple:[],gold:[],prism:[]};
  sol.rows.forEach(r=>own[r.tier].push([r.c[0],r.c[1],r.c[2],r.c[3],r.p*1e9,r.c[5]]));
  const probs={};Object.keys(own).forEach(k=>{if(own[k].length)probs[k]=own[k].reduce((s,c)=>s+c[4],0)/1e9});
  return {id:"custom",name:"Custom pack $"+sol.P,short:"Custom",theme,price:sol.P,pool:"theme",cards:1,fixed:{},probs,ev:sol.ev,stage:meta.stage,foil:meta.foil,motif:meta.motif,series:sol.series,own};
}
const api={LADDER,MED,LOW,SH,MAX_HITS,HIT_MIN_X,FLOOR_X,FLOOR_MIN,MIN_SERIES,TARGET_HIT,solve,solveAt,autofill,toPack,tierOfX};
if(typeof module!=="undefined"&&module.exports)module.exports=api;else g.OUVB=api;
})(typeof window!=="undefined"?window:globalThis);
