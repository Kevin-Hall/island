/* =========================================================
   UI helpers
   ========================================================= */
function toast(html,cls='',icon,variant){const el=document.createElement('div');el.className='toast '+cls;
  el.innerHTML=(icon?`<img class="px v-${variant||'normal'}" src="${icon}" alt="">`:'')+`<span>${html}</span>`;
  const box=$('toasts');box.appendChild(el);while(box.children.length>3)box.firstChild.remove();
  setTimeout(()=>{el.classList.add('out');setTimeout(()=>el.remove(),300);},cls==='rare'?4200:2800);}
function floatText(x,y,z,text,cls=''){const [sx,sy]=toScreen(x,y,z);
  const el=document.createElement('div');el.className='float '+cls;el.textContent=text;el.style.left=sx+'px';el.style.top=sy+'px';$('floats').appendChild(el);setTimeout(()=>el.remove(),1250);}
function setAction(msg,btns,tag='',onTap=null){const ab=$('actionBar');$('abMsg').innerHTML=msg;$('abTag').textContent=tag;ab.classList.toggle('tapnext',!!onTap);ab.onclick=onTap?(e=>{if(!e.target.closest('button'))onTap();}):null;
  ab.style.animation='none';void ab.offsetWidth;ab.style.animation='';const row=$('abRow');row.innerHTML='';
  for(const b of btns){const e=document.createElement('button');e.className='pbtn '+(b.cls||'');e.textContent=b.label;if(b.disabled)e.disabled=true;e.onclick=()=>{SFX.ui();b.fn&&b.fn();};row.appendChild(e);}
  ab.hidden=false;updateCtx();}
function clearAction(){const ab=$('actionBar');ab.hidden=true;ab.onclick=null;ab.classList.remove('tapnext');updateCtx();}
let shownShells=S.shells;
function dexCount(){let got=0,tot=0;for(const [,,pre,tab] of DEX_CATS){for(const k in tab){tot++;if(S.alm[pre+k])got++;}}return[got,tot];}
function locName(){if(inside)return inside.title;if(S.sea){const [isl,d]=nearestIsland(vil.x,vil.z);return d<9&&S.disc[isl.id]?'Near '+isl.name:d<9?'Uncharted waters':'Open sea';}
  const isl=curIsl()||nearestIsland(vil.x,vil.z)[0];return isl?(isl.home?(farmQ(vil.x,vil.z)<1.1?'Farm':TOWN.name):isl.name):'';}
function updateHUD(){
  const lv=level();$('lvlTxt').textContent='Lv '+lv;
  const a=LV[lv-1]||0,b=LV[lv];$('xpFill').style.width=(b?clamp((S.xp-a)/(b-a),0,1)*100:100)+'%';
  {const [hm,ap]=clockStr(S.hour).split(' ');$('timeTxt').innerHTML=`${hm}<small>${ap.toUpperCase()}</small>`;}$('dayTxt').textContent=`Day ${S.day} · ${timeName(S.hour)}${S.rain?' · rain':''}`;$('locTxt').textContent=locName();
  refreshMuseumShow();$('bTask').classList.toggle('ready',ordersReady());$('bMenu').classList.toggle('ready',ordersReady());
  const [g,t]=dexCount();$('dexTxt').textContent=`Dex ${Math.floor(g/t*100)}%`;$('locTxt').hidden=!$('locTxt').textContent;
  updateCtx();
}
function tickShells(dt){if(shownShells!==S.shells){const d=S.shells-shownShells;shownShells+=Math.sign(d)*Math.max(1,Math.abs(d)*Math.min(1,dt*8));if(Math.abs(S.shells-shownShells)<1)shownShells=S.shells;$('shellTxt').textContent=fmt(shownShells);}}
function addXP(n){const before=level();S.xp+=n;const after=level();if(after>before){SFX.level();
  const un=[...CROP_IDS.filter(id=>CROPS[id].lvl===after).map(id=>CROPS[id].name),...Object.keys(BUILD).filter(k=>BUILD[k].lvl===after).map(k=>BUILD[k].name)];
  if(after===MYSTERY.lvl)un.push('Mystery Seeds');
  toast(`Level ${after}!${un.length?' New: '+un.join(', '):''}`,'rare',ICON.star);}}

let ctxSig='';
function updateCtx(){
  $('tools').hidden=!!(inside||S.sea||S.mode==='edit'||placing);
  const box=$('ctx');let st='';
  if(!sheet&&$('actionBar').hidden){
    if(inside)st='inside';else if(S.mode==='edit')st='edit';else if(fishing)st='';else if(S.sea)st=sail?'sailing':'sea';else if(boatNear())st='board';}
  const farHome=S.sea&&Math.hypot(vil.x,vil.z)>14;
  const sig=st+'|'+(sail&&sail.name||'')+'|'+farHome;
  if(sig===ctxSig)return;ctxSig=sig;let h='';
  if(st==='inside')h=`<button class="pbtn go" data-c="leave">Go outside</button>`;
  else if(st==='edit')h=`<span class="msg">Editing: tap decor to move or store it</span><button class="pbtn go" data-c="doneEdit">Done</button>`;
  else if(st==='sailing')h=`<span class="msg">Sailing${sail.name?' to '+sail.name:''}…</span><button class="pbtn" data-c="stop">Stop</button>`;
  else if(st==='sea')h=`<span class="msg">Tap the sea to steer · tap land to go ashore</span><button class="pbtn sea" data-c="cast">Cast line</button>${farHome?'<button class="pbtn" data-c="home">Sail home</button>':''}`;
  else if(st==='board')h=`<button class="pbtn sea" data-c="board">Board boat</button>`;
  box.innerHTML=h;
}
$('ctx').addEventListener('click',e=>{const b=e.target.closest('[data-c]');if(!b)return;SFX.ui();const c=b.dataset.c;
  if(c==='doneEdit'){S.mode='farm';updateCtx();}
  if(c==='stop'){sail=null;ctxSig='';updateCtx();}
  if(c==='cast')startBoatFishing();
  if(c==='home'){SFX.horn();sailHome();}
  if(c==='board')boardBoat();
  if(c==='leave')leaveHouse();});

/* =========================================================
   Items & dex helpers
   ========================================================= */
const rarity=w=>w>=15?'Common':w>=6?'Uncommon':w>=2.5?'Rare':'Legendary';
function itemInfo(key){const pre=key.slice(0,2),id=key.slice(2);if(pre==='f:')return FISH[id];if(pre==='b:')return BUGS[id];if(pre==='g:')return FINDS[id];if(pre==='p:')return PLANTS[id];if(pre==='m:')return MATS[id];if(pre==='x:')return CONSUM[id];return null;}
function nameOf(key){const I=itemInfo(key);if(I)return I.name;if(key.startsWith('c:'))return CROPS[key.slice(2)].name;const [t,v]=key.split('|');return(VAR[v].name?VAR[v].name+' ':'')+CROPS[t].name;}
function iconOf(key){if(key.startsWith('c:'))return seedIcon(key.slice(2));if(key.includes(':'))return ICON[key];return seedIcon(key.split('|')[0]);}
function varOf(key){return key.includes(':')?'normal':key.split('|')[1];}
function gain(key,n=1){S.inv[key]=(S.inv[key]||0)+n;const first=!S.alm[key];S.alm[key]=(S.alm[key]||0)+n;if(first&&key.includes(':'))setTimeout(()=>checkDex(key),600);return first;}
function checkDex(key){const cat=DEX_CATS.find(c=>key.startsWith(c[2]));if(!cat)return;const [id,label,pre,tab]=cat;
  if(!S.dexR[id]&&Object.keys(tab).every(k=>S.alm[pre+k])){S.dexR[id]=1;const r=5000;S.shells+=r;SFX.discover();toast(`Islandex: every ${label.toLowerCase()} recorded! +${fmt(r)} shells`,'rare',ICON.dex);}
  const [g,t]=dexCount();if(g===t&&!S.dexR.all){S.dexR.all=1;setTimeout(()=>{SFX.discover();toast('You completed the Islandex! Every creature, plant and treasure of the archipelago is yours.','rare',ICON.star);for(let i=0;i<40;i++)sparkle(vil.x+(Math.random()-0.5)*4,1,vil.z+(Math.random()-0.5)*4,0xfff0a0);},1500);}}
function priceOf(key){const I=itemInfo(key);if(I)return I.price;const [t,v]=key.split('|');return Math.round(CROPS[t].price*VAR[v].mult*(S.demand===t?1.5:1));}
function sell(key,n){const have=S.inv[key]||0;n=Math.min(n,have);if(!n)return 0;const g=priceOf(key)*n;S.inv[key]=have-n;if(!S.inv[key])delete S.inv[key];S.shells+=g;S.earned+=g;return g;}

