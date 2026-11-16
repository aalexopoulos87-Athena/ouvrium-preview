(function(){"use strict";const O=window.OUV,$=O.$,$$=O.$$,LS=O.LS;
document.addEventListener("DOMContentLoaded",()=>{
const root=$("#su");if(!root)return;
let s=LS.get("ouv_signup",{step:0,startedAt:Date.now()});
const steps=$$("[data-s]",root);
function mask(e){const [u,d]=e.split("@");return d?u.slice(0,1)+"•••@"+d:""}
function show(){steps.forEach(el=>el.hidden=+el.dataset.s!==s.step);$("#suBar").style.width=(s.step/4*100)+"%";
 $("#suStep").textContent=s.step<4?O.t(`Step ${s.step+1} of 4 · saved in this browser`,`Étape ${s.step+1} sur 4 · sauvegardé dans ce navigateur`):O.t("Done","Terminé");
 $("#suBack").style.visibility=s.step>0&&s.step<4?"visible":"hidden";$("#suNext").style.display=s.step<4?"":"none";
 if(s.masked)$("#suEmail").placeholder=s.masked;$("#suCasl").checked=!!s.casl;if(s.prov)$("#suProv").value=s.prov;if(s.year)$("#suYear").value=s.year;
 (s.games||[]).forEach(g=>{const c=$(`[data-s="2"] input[value="${g}"]`);if(c)c.checked=true});if(s.limit)$("#suLimit").value=s.limit;if(s.per){const r=$(`input[name=per][value=${s.per}]`);if(r)r.checked=true}
 $("#suConsentNote").style.borderLeft=s.casl?"3px solid var(--neon)":"3px solid #6b531f";$("#suConsentNote").style.paddingLeft="10px";
}
function save(){LS.set("ouv_signup",s)}
$("#suNext").onclick=()=>{
 if(s.step===0){const e=$("#suEmail").value.trim();if(!s.masked&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)){O.toast(O.t("Enter an email address (demo: it is never sent).","Entre un courriel (démo : il n'est jamais envoyé)."));return}if(e)s.masked=mask(e);s.casl=$("#suCasl").checked;$("#suEmail").value=""}
 if(s.step===1){const p=$("#suProv").value,y=+$("#suYear").value;const min=O.minAge(p);const age=new Date().getFullYear()-y;
  if(!p||!y){$("#suAgeMsg").textContent=O.t("Choose your province and year of birth.","Choisis ta province et ton année de naissance.");return}
  if(age<min){$("#suAgeMsg").textContent=O.t(`Sorry, you need to be ${min}+ in ${p}.`,`Désolé, il faut avoir ${min} ans et plus (${p}).`);return}
  $("#suAgeMsg").textContent="";s.prov=p;s.year=y}
 if(s.step===2){s.games=$$('[data-s="2"] input:checked').map(i=>i.value)}
 if(s.step===3){const v=+$("#suLimit").value;if(!(v>=5)){O.toast(O.t("Set a limit of at least $5.","Fixe une limite d'au moins 5 $."));return}s.limit=v;s.per=($("input[name=per]:checked")||{}).value||"week";s.done=true}
 s.step=Math.min(4,s.step+1);save();show();
};
$("#suBack").onclick=()=>{s.step=Math.max(0,s.step-1);save();show()};
$("#suReset").onclick=()=>{LS.del("ouv_signup");s={step:0,startedAt:Date.now()};$$("input",root).forEach(i=>{if(i.type==="checkbox"||i.type==="radio")i.checked=false;else if(i.id!=="suLimit")i.value=""});show();O.toast(O.t("Sign-up demo cleared.","Inscription démo effacée."))};
document.addEventListener("ouv:lang",show);show();
});})();
