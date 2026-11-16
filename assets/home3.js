/* Home v3: real dates on the date tiles (no countdowns), scroll reveal, gentle parallax + tilt. Off under prefers-reduced-motion. */
(function(){
  var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fr=function(){return (document.documentElement.lang||'en').slice(0,2)==='fr'};
  var WD={en:['SUN','MON','TUE','WED','THU','FRI','SAT'],fr:['DIM','LUN','MAR','MER','JEU','VEN','SAM']};
  var MO={en:['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'],fr:['JANV','FÉVR','MARS','AVR','MAI','JUIN','JUIL','AOÛT','SEPT','OCT','NOV','DÉC']};
  function dates(){
    var L=fr()?'fr':'en', now=new Date(), q=function(s){return document.querySelector(s)};
    if(q('[data-today-d]')){q('[data-today-wd]').textContent=(L==='fr'?"AUJ. ":"TODAY · ")+WD[L][now.getDay()];q('[data-today-d]').textContent=now.getDate();q('[data-today-m]').textContent=MO[L][now.getMonth()]+' '+now.getFullYear();}
    var mon=new Date(now); mon.setHours(12,0,0,0); mon.setDate(now.getDate()-((now.getDay()+6)%7));
    document.querySelectorAll('.wk').forEach(function(el){
      var i=+el.getAttribute('data-dow'), d=new Date(mon); d.setDate(mon.getDate()+i);
      el.querySelector('[data-wd]').textContent=WD[L][d.getDay()]; el.querySelector('[data-day]').textContent=d.getDate(); el.querySelector('[data-mon]').textContent=MO[L][d.getMonth()];
      el.classList.toggle('today',d.toDateString()===now.toDateString());
    });
  }
  /* Spotlight (16 Nov 2026): one brand per weekday, picked from the visitor's own clock (getDay: Sun=0 .. Sat=6).
     Day buttons only preview another day's panel; nothing is timed, nothing expires. */
  var spSel=null;
  function spot(){
    var L=fr()?'fr':'en', now=new Date(), td=now.getDay(), d=spSel===null?td:spSel;
    var mon=new Date(now); mon.setHours(12,0,0,0); mon.setDate(now.getDate()-((now.getDay()+6)%7));
    document.querySelectorAll('.sp').forEach(function(el){
      var k=+el.getAttribute('data-sp'), on=k===d; el.hidden=!on; el.classList.toggle('is-today',k===td);
      if(on){var dt=new Date(mon); dt.setDate(mon.getDate()+((k+6)%7));
        el.querySelector('[data-sp-d]').textContent=dt.getDate(); el.querySelector('[data-sp-m]').textContent=MO[L][dt.getMonth()];
        var em=el.querySelector('.sp-stub em'); if(em) em.textContent=k===td?(L==='fr'?"AUJOURD'HUI":'TODAY'):(L==='fr'?'APERÇU':'PREVIEW');}
    });
    document.querySelectorAll('[data-sp-btn]').forEach(function(b){var k=+b.getAttribute('data-sp-btn');b.classList.toggle('today',k===td);b.setAttribute('aria-pressed',String(k===d))});
    document.querySelectorAll('.bc').forEach(function(b){b.classList.toggle('today',+b.getAttribute('data-dow')===td)});
  }
  document.querySelectorAll('[data-sp-btn]').forEach(function(b){b.addEventListener('click',function(){spSel=+b.getAttribute('data-sp-btn');spot()})});
  spot();
  dates();
  new MutationObserver(function(){dates();spot()}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  var rv=document.querySelectorAll('.rv');
  if(RM||!('IntersectionObserver' in window)){rv.forEach(function(e){e.classList.add('in')});return;}
  document.documentElement.classList.add('h3js');
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.08});
  rv.forEach(function(e){io.observe(e)});
  var hp=[].slice.call(document.querySelectorAll('.hp')), tick=false;
  function par(){tick=false;var y=window.scrollY;hp.forEach(function(el,i){var a=el.querySelector('.hp-art');if(a)a.style.translate='0 '+(-y*(0.04+i*0.02)).toFixed(1)+'px'})}
  window.addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(par)}},{passive:true});
  if(matchMedia('(hover:hover)').matches) hp.forEach(function(el,i){
    var base=i===1?'translateY(-26px) ':'';
    el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transform=base+'perspective(700px) rotateY('+(x*12).toFixed(1)+'deg) rotateX('+(-y*12).toFixed(1)+'deg)'});
    el.addEventListener('pointerleave',function(){el.style.transform=''});
  });
})();
