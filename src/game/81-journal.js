/* =========================================================
   Journal: today's little tasks, the discovery card, the bedtime diary, resting by the fire, and the title screen
   ========================================================= */
// --- today's tasks: four small things to do each day, ticked off as you play, each paying a few shells ---
const JR_TASKS={
  bug:{t:n=>`Catch ${n} bug${n>1?'s':''}`,n:[2,3],pay:90,ico:'net'},
  find:{t:n=>`Forage ${n} treasures`,n:[3,5],pay:80,ico:'bag'},
  shake:{t:n=>`Shake ${n} trees`,n:[2,4],pay:60,ico:'axe',ok:()=>S.debris.some(d=>d.k==='tree')},
  rustle:{t:n=>`Rustle ${n} bushes`,n:[2,3],pay:60,ico:'sprout',ok:()=>S.debris.some(d=>d.k==='bush')},
  dig:{t:()=>'Dig up something buried',n:[1,1],pay:110,ico:'shovel'},
  fish:{t:n=>`Catch ${n} fish`,n:[1,2],pay:120,ico:'rod'},
  wood:{t:n=>`Gather ${n} wood`,n:[3,5],pay:70,ico:'m:wood'},
  water:{t:n=>`Water ${n} crops`,n:[3,5],pay:60,ico:'can',ok:()=>Object.values(S.tiles).some(t=>t.crop)},
  harvest:{t:n=>`Harvest ${n} crops`,n:[2,4],pay:90,ico:'sprout',ok:()=>Object.values(S.tiles).some(t=>t.crop)},
  talk:{t:n=>`Chat with ${n} neighbour${n>1?'s':''}`,n:[1,2],pay:70,ico:'star',ok:()=>npcs.length>0,cap:()=>npcs.length},
  fire:{t:()=>'Warm up by the campfire',n:[1,1],pay:50,ico:'star',ok:()=>!!campfire()},
  fresh:{t:()=>'Discover something new',n:[1,1],pay:150,ico:'dex'},
  tent:{t:()=>'Pitch your tent',n:[1,1],pay:100,ico:'star',chk:()=>!!S.homeAt},
};
function jrMake(){const R=mulberry(S.worldSeed+S.day*977),pick=k=>{const T=JR_TASKS[k];let n=T.n[0]+Math.floor(R()*(T.n[1]-T.n[0]+1));if(T.cap)n=Math.min(n,T.cap());return{k,n,have:0,done:0};};
  let keys;if(S.day===1&&S.scratch)keys=[S.homeAt?'shake':'tent','bug','find','fire'];/* a gentle first day */
  else{const pool=Object.keys(JR_TASKS).filter(k=>k!=='tent'&&(!JR_TASKS[k].ok||JR_TASKS[k].ok()));keys=[];while(keys.length<4&&pool.length)keys.push(pool.splice(Math.floor(R()*pool.length),1)[0]);}
  S.jr={day:S.day,tasks:keys.map(pick),all:0};}
function jrNote(k,n=1){if(!S.jr||S.jr.day!==S.day)return;const t=S.jr.tasks.find(q=>q.k===k&&!q.done);if(!t)return;t.have=Math.min(t.n,t.have+n);if(t.have>=t.n)jrDone(t);else jrChip(true);}
function jrDone(t){t.done=1;const T=JR_TASKS[t.k],pay=T.pay+t.n*10;S.shells+=pay;addXP(4);
  setTimeout(()=>{SFX.level();stamp(`${T.t(t.n)}`,`+${pay} shells`);flyShells(6);jrChip(true);
    if(S.jr.tasks.every(q=>q.done)&&!S.jr.all){S.jr.all=1;setTimeout(()=>{const b=250+S.day*10;S.shells+=b;addXP(10);SFX.discover();stamp('A perfect day!',`Every task done · +${b} shells`,true);flyShells(12);
      for(let i=0;i<24;i++)sparkle(vil.x+(Math.random()-0.5)*2,1+Math.random(),vil.z+(Math.random()-0.5)*2,pickR([0xfff0a0,0xffc8e0,0xbff4ff]));},2600);}},500);}
// everything you pick up counts towards the day's tasks and diary; a first-ever catch or find gets the discovery card
function jrGain(key,n,first){todayNote(key,n,first);const c=key.slice(0,2);if(/^[bfgpm]:/.test(key)||key.includes('|')){streakBump();flyItem(key);}/* 87b */
  if(c==='b:')jrNote('bug',n);else if(c==='f:'){if(!FISH[key.slice(2)].junk)jrNote('fish',n);}else if(c==='g:')jrNote('find',n);else if(key==='m:wood')jrNote('wood',n);else if(key.includes('|'))jrNote('harvest',n);
  if(first&&/^[bfgp]:/.test(key)){jrNote('fresh');reveal(key);}}
// tasks that finish by reaching a state rather than by an action (like pitching your tent)
function jrCheck(){if(!S.jr||S.jr.day!==S.day)jrMake();for(const t of S.jr.tasks){const c=JR_TASKS[t.k].chk;if(c&&!t.done&&c()){t.have=t.n;jrDone(t);}}jrChip();}
const BOOK_SVG='<svg viewBox="0 0 32 32"><path d="M4 7c4-2 8-2 12 1v18c-4-3-8-3-12-1z" fill="#f7e4c0" stroke="#b07a4a" stroke-width="1.6" stroke-linejoin="round"/><path d="M28 7c-4-2-8-2-12 1v18c4-3 8-3 12-1z" fill="#fff4dc" stroke="#b07a4a" stroke-width="1.6" stroke-linejoin="round"/><path d="M7 11c2-.6 4-.5 6 .5M7 15c2-.6 4-.5 6 .5M19 11.5c2-1 4-1.1 6-.5" stroke="#d8b07a" stroke-width="1.3" stroke-linecap="round"/><path d="M22 4v9l2-1.6 2 1.6V4z" fill="#f08878"/></svg>';
let jrSig='';
function jrChip(bump){const el=$('jrChip');if(!el||!S.jr){return;}const d=S.jr.tasks.filter(q=>q.done).length,n=S.jr.tasks.length;
  const sig=S.jr.day+':'+S.jr.tasks.map(q=>q.k+q.have).join(),changed=sig!==jrSig;if(changed){jrSig=sig;el.innerHTML=`<img class="pix" src="${PIX.book}" alt=""><em>${d===n?'✓':`${d}/${n}`}</em>`;}
  el.hidden=false;el.classList.toggle('done',d===n);if(bump){el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump');}
  if(changed&&$('jrCard'))jrRender();/* only when something changed: rebuilding it would replay its pop-in */}
function jrOpen(){SFX.ui();let c=$('jrCard');if(c){c.remove();return;}c=document.createElement('div');c.id='jrCard';c.className='jrcard';c.innerHTML='<div class="fncard"></div>';document.body.appendChild(c);
  c.onclick=e=>{if(e.target===c||e.target.closest('.x')){SFX.ui();c.classList.add('out');setTimeout(()=>c.remove(),220);}};jrRender();}
function jrRender(){const c=$('jrCard');if(!c||!S.jr)return;const s=season();
  // a field-notes index card: the day's number, where and when, and the four tasks on ruled lines, stamped when done
  const no=String(S.day).padStart(3,'0'),done=S.jr.tasks.filter(q=>q.done).length;
  c.firstChild.innerHTML=`<i class="clip"></i><button class="x" aria-label="Close">×</button>
  <div class="fn-top"><span>Field Notes</span><span>No. ${no}</span></div>
  <div class="fn-grid"><div><label>Date sighted</label><b>${s[0].toUpperCase()+s.slice(1)} · Day ${S.day}</b></div><div><label>Station</label><b>${TOWN.name||'The island'}</b></div></div>
  ${(()=>{const g=nextGoal();return g?`<div class="fn-next"><label>Next up</label><b>${g.name}</b></div>`:'';})()}
  <div class="fn-subj"><label>Subject</label><h3>Today's Tasks</h3></div>
  <ol class="fn-list">${S.jr.tasks.map((q,i)=>{const T=JR_TASKS[q.k],ic=ICON[T.ico]||ICON.star;return`<li class="${q.done?'done':''}"><span class="n">${['I','II','III','IV','V'][i]}.</span><img class="px" src="${ic}" alt=""><span class="t">${T.t(q.n)}</span><span class="c">${q.done?'':q.n>1?`${q.have}/${q.n}`:''}</span><span class="r">+${T.pay+q.n*10}</span>${q.done?'<u>Done</u>':''}</li>`;}).join('')}</ol>
  <div class="fn-foot"><span>${S.jr.all?'A perfect day. Filed with pride.':`${done} of ${S.jr.tasks.length} complete · all four earn a bonus`}</span><span>Form ${no}-${S.jr.tasks.length} · Rev. ${s}</span></div>`;}
// a big stamp across the top when a task is done
function stamp(title,sub,big){const el=document.createElement('div');el.className='stamp'+(big?' big':'');el.innerHTML=`<i>✓</i><span><b>${title}</b><small>${sub}</small></span>`;document.body.appendChild(el);
  setTimeout(()=>el.classList.add('out'),big?3200:2400);setTimeout(()=>el.remove(),big?3700:2900);}
// little shells flying up into your purse
function flyShells(n){const to=$('icoShell');if(!to)return;const r=to.getBoundingClientRect(),cx=innerWidth/2,cy=innerHeight*0.2;
  for(let i=0;i<n;i++){const s=document.createElement('img');s.src=ICON.shell;s.className='flyshell';s.style.left=(cx+(Math.random()-0.5)*80)+'px';s.style.top=(cy+(Math.random()-0.5)*30)+'px';document.body.appendChild(s);
    setTimeout(()=>{s.style.transform=`translate(${r.left+r.width/2-parseFloat(s.style.left)-11}px,${r.top+r.height/2-parseFloat(s.style.top)-11}px) scale(.6)`;s.style.opacity='0.2';},40+i*70);
    setTimeout(()=>{s.remove();if(i%2===0)tone(1200+i*60,0.04,'triangle',0.02);const ch=to.closest('.chip');if(ch){ch.classList.remove('bump');void ch.offsetWidth;ch.classList.add('bump');}},700+i*70);}}

// --- the discovery card: a first-ever catch or find is held up in the middle of the screen, with a little line about it ---
const REVEAL_LINES={
  b:['It fluttered right into my net!','Gotcha! Careful now… careful…','Look at those little legs!','It tickles!','Quiet as a whisper, and I still got it!'],
  g:['Ooh, into the pocket it goes!','What a lucky find!','The island is full of surprises.','I\'ll treasure this one.','Finders keepers!'],
  p:['It smells wonderful.','Picked with care.','Such a pretty little thing.','The meadow gave me this.'],
};
const revQ=[];let revOn=false;
function reveal(key){if(!/^[bgp]:/.test(key))return;const I=itemInfo(key);if(I&&I.w>=5){const [dg,dt]=dexCount();say(`<b>New!</b> ${I.name} <small>· Islandex ${Math.floor(dg/dt*100)}%</small>`,ICON[key]);pluck(1318.5,0.025,0.6);setTimeout(()=>pluck(1568,0.025,0.8),110);return;}/* everyday firsts: a caption; the card is for rare ones */revQ.push(key);if(!revOn)revNext();}
function revNext(){const key=revQ.shift();if(!key){revOn=false;return;}revOn=true;const I=itemInfo(key);if(!I){revNext();return;}
  const L=REVEAL_LINES[key[0]],line=L[(hash(key.length*7,key.charCodeAt(2)+key.charCodeAt(key.length-1)*13)*L.length|0)%L.length];
  const cat={b:'Bug',g:'Treasure',p:'Wild plant'}[key[0]],el=document.createElement('div');el.className='reveal'+(I.w<5?' rare':'');
  el.innerHTML=`<div class="rays"></div><div class="rv"><small>New discovery</small><img class="px" src="${ICON[key]}" alt=""><b>${I.name}</b><em>${cat}${I.w?' · '+rarity(I.w):''}</em><p>“${line}”</p><u>Islandex ${(([g,t])=>Math.floor(g/t*100))(dexCount())}% complete</u></div>`;
  document.body.appendChild(el);SFX.discover();requestAnimationFrame(()=>el.classList.add('on'));
  setTimeout(()=>el.classList.add('out'),2900);setTimeout(()=>{el.remove();setTimeout(revNext,250);},3400);}

// --- the day's diary: everything you did, written up when you go to sleep ---
function todayNote(key,n,first){if(!S.today||S.today.d!==S.day)S.today={d:S.day,got:{},nw:[]};S.today.got[key]=(S.today.got[key]||0)+n;if(first&&/^[bfgp]:/.test(key))S.today.nw.push(key);}
function diaryLine(t){const sum=p=>Object.keys(t.got).filter(k=>k.startsWith(p)).reduce((s,k)=>s+t.got[k],0),bits=[];
  const b=sum('b:'),f=sum('f:'),g=sum('g:'),w=sum('m:'),c=Object.keys(t.got).filter(k=>k.includes('|')).reduce((s,k)=>s+t.got[k],0);
  if(b)bits.push(`caught ${b} bug${b>1?'s':''}`);if(f)bits.push(`reeled in ${f} fish`);if(g)bits.push(`found ${g} treasure${g>1?'s':''}`);if(c)bits.push(`harvested ${c} crop${c>1?'s':''}`);if(w)bits.push(`gathered ${w} material${w>1?'s':''}`);
  if(!bits.length)return'A slow, quiet day. I listened to the waves and let the island be.';
  const last=bits.pop();return'Today I '+(bits.length?bits.join(', ')+' and '+last:last)+'.'+(t.nw.length?` I saw ${t.nw.length===1?'something':t.nw.length+' things'} I'd never seen before!`:'');}
function showDiary(then){const t=S.today&&S.today.d===S.day?S.today:{got:{},nw:[]},jr=S.jr&&S.jr.day===S.day?S.jr:null;
  const keys=Object.keys(t.got).sort((a,b)=>(t.nw.includes(b)-t.nw.includes(a))||t.got[b]-t.got[a]).slice(0,12);
  const el=document.createElement('div');el.id='diary';el.className='diary';
  // a page torn from the field notebook: the day in handwriting, what you collected in little specimen frames, and
  // tomorrow's forecast on a tag clipped to the page
  el.innerHTML=`<div class="page"><div class="perf"></div><div class="nhd"><h4>Notes</h4><span>Comments, statements</span><em>Day ${String(S.day).padStart(3,'0')} · ${season()}</em></div>
    <p class="hand">Dear diary, ${diaryLine(t).replace(/^T/,'t')}</p>
    ${keys.length?`<div class="grid">${keys.map(k=>`<span class="${t.nw.includes(k)?'nw':''}"><img class="px" src="${ICON[k]||ICON.star}" alt=""><i>×${t.got[k]}</i></span>`).join('')}</div>`:''}
    ${jr?`<div class="tasks"><label>Tasks</label>${jr.tasks.map(q=>`<b class="${q.done?'on':''}">${q.done?'✓':''}</b>`).join('')}<span>${jr.tasks.filter(q=>q.done).length} of ${jr.tasks.length}</span></div>`:''}
    <div class="tmw"><label>Forecast · tomorrow</label>${tomorrowLines().map(l=>`<span>${l}</span>`).join('')}</div>
    <button class="pbtn go">Lights out</button></div>`;
  document.body.appendChild(el);requestAnimationFrame(()=>el.classList.add('on'));el.querySelector('button').onclick=()=>{SFX.ui();el.classList.remove('on');setTimeout(()=>el.remove(),400);then();};}

// --- resting by the campfire: sit on the bench, the camera leans in, and time can slip by ---
let rest=null;
// the campfire: Acornfield's own, or the bonfire in front of your tent (a tile to its front-left, see houseGroup)
function campfire(){if(S.home&&S.home.fire)return S.home.fire;return S.scratch&&S.homeAt&&!S.house?[HOUSE_AT.x-1,HOUSE_AT.z+2]:null;}
function isFire(x,z){const f=campfire();return !!f&&Math.abs(x-f[0])<=0.5&&Math.abs(z-f[1])<=0.5;}
function isTent(x,z){const t=S.home&&S.home.tent;return !!t&&x>=t[0]&&x<=t[0]+1&&z>=t[1]&&z<=t[1]+1;}
// a tap close to the flames on screen (the tent stands behind the fire, so the tile under your finger is often the tent's)
function fireTap(cx,cy){const f=campfire();if(!f||rest)return false;const s=toScreen(f[0],topY(f[0],f[1])+0.25,f[1]);if(Math.hypot(s[0]-cx,s[1]-cy)>Math.max(18,24*40/cam.dist))return false;clearAction();restByFire();return true;}
function restByFire(){const [fx,fz]=campfire();goTo(fx+0.05,fz+1.0,()=>{rest={fx,fz,t:0,d0:cam.dist};vil.idle=0;jrNote('fire');SFX.place();
  const night=S.hour>=19||S.hour<5;setAction(night?'The fire crackles and the stars come out. Sleep until morning?':'You sit down by the fire. Warm hands, a crackle, the sea somewhere below.',
    night?[{label:'Sleep',cls:'go',fn:()=>{standUp();sleep();}},{label:'Stay up',fn:standUp}]:[{label:S.hour<17?'Wait till sunset':'Wait till dark',cls:'go',fn:()=>waitFire(S.hour<17?18.2:20)},{label:'Get up',fn:standUp}],'Campfire');});}
function standUp(){if(!rest)return;rest=null;clearAction();}
function waitFire(to){clearAction();$('fade').classList.add('on');setTimeout(()=>{const h=Math.max(0,to-S.hour);S.toff=(S.toff||0)+h;simulate(h*3600);afterRest();$('fade').classList.remove('on');},650);}
function afterRest(){rebuildSoil();syncAllCrops();syncLife();toast('The afternoon drifts by. The sky turns gold.','',ICON.star);}
function tentTap(){if(S.hour>=19||S.hour<5)setAction('Crawl into your tent and sleep until morning?',[{label:'Sleep',cls:'go',fn:sleep},{label:'Stay up',fn:clearAction}],'Tent');
  else toast('Your little tent. Come back when it gets dark to sleep, or sit by the fire for a while.');}
function updateJournal(dt,tt){
  if(rest){rest.t+=dt;if(Math.hypot(vil.tx-vil.x,vil.tz-vil.z)>0.05||vil.path&&vil.path.length){rest=null;if(!$('actionBar').hidden)clearAction();}
    else{vil.idle=0;villager.rotation.y=Math.atan2(rest.fx-vil.x,rest.fz-vil.z);villager.position.y-=0.1;const body=villager.children[0];if(body)body.scale.set(1.04,0.93+Math.sin(tt*1.6)*0.012,1.04);
      if(!drag&&!pinch)cam.dist=lerp(cam.dist,Math.max(12,rest.d0*0.55),Math.min(1,dt*0.8));
      if(Math.random()<dt*6)emit(rest.fx+(Math.random()-0.5)*0.2,topY(rest.fx,rest.fz)+0.5,rest.fz+(Math.random()-0.5)*0.2,{vx:(Math.random()-0.5)*0.3,vy:0.9+Math.random()*0.6,life:1.4,max:1.4,size:0.035,color:pickR([0xffc860,0xff9a40,0xfff0b0]),g:-0.2});
      if(Math.random()<dt*0.9)noise(0.05,0.03,2400+Math.random()*1600,2);}}
  if(titleCam){const c=titleCam;if(c.out>=0){c.out+=dt;const u=smooth(0,1,c.out/2.2);cam.dist=lerp(c.fd,c.d,u);cam.pitch=lerp(c.fp,c.p,u);cam.yaw=lerp(c.fy,c.y,u);if(u>=1)titleCam=null;}
    else{cam.yaw+=dt*0.045;cam.pitch=lerp(cam.pitch,0.3,Math.min(1,dt));}}}

// --- the title screen when you come back: the island turns slowly behind the name until you tap ---
let titleCam=null;
function showTitle(){const q=new URLSearchParams(location.search);if(q.has('debug')&&!q.has('title'))return;titleCam={d:cam.dist,p:cam.pitch,y:cam.yaw,out:-1};cam.dist*=0.8;
  const el=document.createElement('div');el.id='title';const s=season();
  el.innerHTML=`<div class="logo"><small>~ a cozy island life ~</small><h1>Driftseed<br>Isle</h1></div><div class="save"><b>${TOWN.name||'Your island'}</b><span>Day ${S.day} · ${s[0].toUpperCase()+s.slice(1)} · Lv ${level()}</span></div><p>Tap to continue</p>`;
  document.body.appendChild(el);document.body.classList.add('titling');requestAnimationFrame(()=>el.classList.add('on'));
  el.onclick=()=>{ac();SFX.discover();el.classList.add('out');document.body.classList.remove('titling');const c=titleCam;if(c){c.out=0;c.fd=cam.dist;c.fp=cam.pitch;c.fy=cam.yaw;/* turn back the short way round */c.y=c.fy+((c.y-c.fy+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;}setTimeout(()=>el.remove(),900);};}
