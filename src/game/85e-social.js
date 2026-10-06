/* =========================================================
   Friends: visit each other's islands, leave a like, and silly leaderboards.
   Runs on the published page's shared database (the `db` and `user` capabilities, declared when the page is
   published); anywhere else (a local copy, a viewer who can't use it) the Friends button simply stays hidden.
   Shared documents, one of each per player and each written only by its player (rules at publish):
     islands/<id>  {name, t, snap}  a snapshot of your home island (your save minus bag, dex and the like)
     stats/<id>    {isl, lvl, t, d, w, m, all}  your counts for today / this week / this month / ever (UTC)
     likes/<id>    {at: {<island owner id>: [days you liked it]}}  one like per island per day
   Visiting: your save is backed up (HOME_KEY), the friend's snapshot is loaded in its place with S.visit set (look,
   don't touch: tools, the boat and decorating are off, and nothing is saved), and Go home puts yours back.
   Counts (S.social) tick up from gain() (fish, bugs, forage, boots), harvests, shells earned, steps walked,
   weeds and clutter cleared, animals watched and islands visited.
   ========================================================= */
const HOME_KEY=SAVE_KEY+'-home';
const SOC={db:null,user:null,me:null,ok:false,ro:false,stats:[],likes:[],mine:null,names:{},loaded:0,busy:false};
const STATS=[// id, title, what, icon
  ['likes','Most Loved Island','likes received','heart'],
  ['crops','Green Thumb','crops harvested','sprout'],
  ['shells','Shell Tycoon','shells earned','shell'],
  ['fish','Master Angler','fish caught','f:mackerel'],
  ['boots','Boot Collector','old boots fished up','f:boot'],
  ['bugs','Bug Buddy','bugs caught','b:monarch'],
  ['forage','Forager Supreme','things foraged','g:mushroom'],
  ['watch','Wildlife Whisperer','animals watched','w:fox'],
  ['tidy','Weed Warrior','weeds and clutter cleared','g:clover4'],
  ['steps','Marathon Bunny','steps taken','star'],
  ['visits','Social Butterfly','islands visited','chart']];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const socIcon=k=>k==='heart'?HEART_ICO:ICON[k]||ICON.star;
const HEART_ICO=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.fillStyle='#f0507a';x.strokeStyle='#a8264a';x.lineWidth=3;
  x.beginPath();x.moveTo(32,54);x.bezierCurveTo(4,36,8,10,24,12);x.bezierCurveTo(30,13,32,18,32,20);x.bezierCurveTo(32,18,34,13,40,12);x.bezierCurveTo(56,10,60,36,32,54);x.closePath();x.fill();x.stroke();
  x.fillStyle='rgba(255,255,255,.6)';x.beginPath();x.ellipse(21,22,5,3,-0.6,0,6.283);x.fill();return c.toDataURL();})();

// ---- days, weeks and months (UTC, so everyone shares the same boards) ----
function perKeys(t=Date.now()){const d=new Date(t),day=d.toISOString().slice(0,10);
  const w=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())),dn=w.getUTCDay()||7;w.setUTCDate(w.getUTCDate()+4-dn);
  const wk=Math.ceil(((w-Date.UTC(w.getUTCFullYear(),0,1))/864e5+1)/7);return{d:day,w:w.getUTCFullYear()+'-W'+String(wk).padStart(2,'0'),m:day.slice(0,7)};}
const dayKeys=day=>perKeys(Date.parse(day+'T12:00:00Z'));

// ---- counting ----
function statBumpOn(st,stat,n=1){if(!(n>0))return;const P=perKeys();st.social=st.social||{};const so=st.social;
  for(const p of ['d','w','m']){if(!so[p]||so[p].k!==P[p])so[p]={k:P[p],v:{}};so[p].v[stat]=(so[p].v[stat]||0)+n;}
  so.all=so.all||{v:{}};so.all.v[stat]=(so.all.v[stat]||0)+n;so.dirty=1;}
function statBump(stat,n=1){if(S.visit)return;statBumpOn(S,stat,Math.round(n));}
function statGain(key,n){if(key==='f:boot')statBump('boots',n);if(key.startsWith('f:')||key.startsWith('s:'))statBump('fish',n);else if(key.startsWith('b:'))statBump('bugs',n);
  else if(key.startsWith('g:')||key.startsWith('p:'))statBump('forage',n);}
let socShells=null,socHarv=null,socPos=null,socStep=0,socPubT=20,socIslT=0;
function updateSocial(dt){
  if(S.visit){visitBar();return;}
  if(socShells==null){socShells=S.shells;socHarv=S.harvested||0;}
  if(S.shells>socShells)statBump('shells',S.shells-socShells);socShells=S.shells;
  if((S.harvested||0)>socHarv)statBump('crops',S.harvested-socHarv);socHarv=S.harvested||0;
  if(!S.sea&&!inside){if(socPos){socStep+=Math.min(1,Math.hypot(vil.x-socPos[0],vil.z-socPos[1]));if(socStep>=1){statBump('steps',Math.floor(socStep));socStep%=1;}}socPos=[vil.x,vil.z];}else socPos=null;
  socPubT-=dt;if(socPubT<=0){socPubT=120;socialPublish(false);}}

// ---- the shared database ----
(async()=>{try{if(!window.claude||typeof claude.use!=='function')return;
  const [db,user]=await Promise.all([claude.use('db'),claude.use('user')]);if(!db||!user)return;
  const me=await user.id();if(!me)return;SOC.db=db;SOC.user=user;SOC.me=me;SOC.ok=true;$('bSocial').hidden=false;
  if(S.visit){visitBar();loadMyLikes();return;}
  await socialPublish(true);await socialRefresh();
  const mine=likeTally()[me],tot=mine?mine.all:0;if(tot>(S.likesSeen||0)){const n=tot-(S.likesSeen||0);S.likesSeen=tot;save();
    setTimeout(()=>{SFX.discover();toast(`Your island got <b>${n}</b> new like${n>1?'s':''} while you were away!`,'rare',HEART_ICO);},3000);}
}catch(e){}})();
document.addEventListener('visibilitychange',()=>{if(document.hidden)socialPublish(false);});

// a copy of your island for visitors: everything that draws it, nothing private
const SNAP_SKIP=['inv','alm','almR','dexR','jr','orders','log','eco','free','social','store','mail','isleNodes','isleMarks','shook','picked','likesSeen','visit','ranchLog'];
function islandSnap(){const o={};for(const k in S)if(!SNAP_SKIP.includes(k))o[k]=S[k];return JSON.stringify(o);}
let lastSnap='';
async function socialPublish(force){if(!SOC.ok||SOC.ro||S.visit||SOC.busy)return;SOC.busy=true;
  try{const P=perKeys(),so=S.social||{},cur=p=>so[p]&&so[p].k===P[p]?so[p]:{k:P[p],v:{}};
    if(force||so.dirty||!SOC.loaded){await SOC.db.doc('stats/'+SOC.me).set({isl:String(S.islandName||'A little island').slice(0,40),lvl:level(),t:Date.now(),d:cur('d'),w:cur('w'),m:cur('m'),all:so.all||{v:{}}});if(S.social)S.social.dirty=0;}
    socIslT-=1;const snap=islandSnap();
    if(snap!==lastSnap&&(force||socIslT<=0)){await SOC.db.doc('islands/'+SOC.me).set({name:String(S.islandName||'A little island').slice(0,40),t:Date.now(),snap});lastSnap=snap;socIslT=4;}
  }catch(e){if(e&&e.code==='invalid_argument')SOC.ro=true;}finally{SOC.busy=false;}}
async function socialRefresh(){if(!SOC.ok)return;try{const [st,lk]=await Promise.all([SOC.db.collection('stats').get(),SOC.db.collection('likes').get()]);
    SOC.stats=st.docs.filter(d=>d.exists).map(d=>({id:d.id,...d.data()}));SOC.likes=lk.docs.filter(d=>d.exists).map(d=>({id:d.id,...d.data()}));
    SOC.mine=(SOC.likes.find(l=>l.id===SOC.me)||{}).at||{};SOC.loaded=Date.now();
    const ps=await SOC.user.profiles(SOC.stats.map(s=>s.id));for(const id in ps)SOC.names[id]=ps[id].name||'';}catch(e){}
  if(sheet&&sheet.kind==='social')renderSheet();}
async function loadMyLikes(){try{const d=await SOC.db.doc('likes/'+SOC.me).get();SOC.mine=(d.exists&&d.data().at)||{};}catch(e){SOC.mine={};}visitBar();}
// likes received by each island: all time and for each period
function likeTally(){const P=perKeys(),out={};
  for(const l of SOC.likes)for(const [owner,days] of Object.entries(l.at||{})){if(owner===l.id||!Array.isArray(days))continue;const o=out[owner]||(out[owner]={all:0,d:0,w:0,m:0});
    for(const day of days){o.all++;const k=dayKeys(day);if(k.d===P.d)o.d++;if(k.w===P.w)o.w++;if(k.m===P.m)o.m++;}}
  return out;}

// ---- visiting ----
async function visitIsland(id){if(!SOC.ok||id===SOC.me)return;toast('Sailing over…');
  let d;try{const s=await SOC.db.doc('islands/'+id).get();if(!s.exists){toast("That island hasn't been shared yet.");return;}d=s.data();}catch(e){toast('The sea is too rough to visit right now. Try again in a moment.');return;}
  let snap;try{snap=JSON.parse(d.snap);}catch(e){toast("That island couldn't be loaded.");return;}
  if(!S.visit){statBump('visits');try{localStorage.setItem(HOME_KEY,JSON.stringify(S));}catch(e){toast('Could not back up your save, so the visit was cancelled.');return;}}
  else{try{const h=JSON.parse(localStorage.getItem(HOME_KEY));if(h){statBumpOn(h,'visits');localStorage.setItem(HOME_KEY,JSON.stringify(h));}}catch(e){}}
  snap.look=S.look;/* (you stay yourself) */snap.v=1;snap.visit={o:id,n:String(d.name||'an island').slice(0,40)};snap.sea=false;snap.boat=null;snap.inv={};snap.t=Date.now();
  resetting=true;try{localStorage.setItem(SAVE_KEY,JSON.stringify(snap));}catch(e){resetting=false;toast("That island couldn't be loaded.");return;}location.reload();}
function goHome(){let s=null;try{s=localStorage.getItem(HOME_KEY);}catch(e){}resetting=true;
  try{if(s)localStorage.setItem(SAVE_KEY,s);else{const v=JSON.parse(localStorage.getItem(SAVE_KEY));if(v)delete v.visit;localStorage.setItem(SAVE_KEY,JSON.stringify(v));}localStorage.removeItem(HOME_KEY);}catch(e){}location.reload();}
function visitNo(){toast(`You're visiting <b>${esc(S.visit.n)}</b>. Look around, leave a like, and head home when you're ready.`,'',HEART_ICO);}
async function likeIsland(){const o=S.visit&&S.visit.o;if(!o||!SOC.ok)return;const today=perKeys().d,mine=SOC.mine||{},days=(mine[o]||[]).slice();
  if(days.includes(today)){toast('You already liked this island today. Come back tomorrow!','',HEART_ICO);return;}
  days.push(today);const next={...mine,[o]:days.slice(-60)};
  try{await SOC.db.doc('likes/'+SOC.me).set({at:next});SOC.mine=next;}catch(e){toast(e&&e.code==='invalid_argument'?'Your access to this page is view-only, so you can look but not leave likes.':"The like didn't send. Try again in a moment.");return;}
  SFX.discover();for(let i=0;i<3;i++)setTimeout(()=>hearts(vil.x,villager.position.y+1.1,vil.z),i*180);toast(`You liked <b>${esc(S.visit.n)}</b>!`,'rare',HEART_ICO);visitBar();}
let vbEl=null,vbKey='';
function visitBar(){if(!S.visit)return;if(!vbEl){vbEl=document.createElement('div');vbEl.className='visitbar';document.body.appendChild(vbEl);
    vbEl.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.vb==='like')likeIsland();else if(b.dataset.vb==='home')goHome();});}
  const liked=((SOC.mine||{})[S.visit.o]||[]).includes(perKeys().d),key=liked+'|'+SOC.ok;if(key===vbKey)return;vbKey=key;
  vbEl.innerHTML=`<span class="vt"><img src="${HEART_ICO}" alt="">Visiting <b>${esc(S.visit.n)}</b></span>${SOC.ok?`<button data-vb="like" class="${liked?'on':''}">${liked?'Liked ♥':'♥ Like'}</button>`:''}<button data-vb="home">Go home</button>`;}

// ---- the Friends sheet ----
function socName(id){return id===SOC.me?'You':SOC.names[id]||'A friend';}
function socialSheet(body){$('sheetTitle').textContent='Friends';tabs([['islands','Islands'],['d','Today'],['w','This week'],['m','This month']]);
  if(!sheet.tab)sheet.tab='islands';if(!SOC.ok){body.innerHTML='<p class="note">Friends works on the shared page, where everyone you share the game with can visit each other.</p>';return;}
  if(!SOC.loaded||Date.now()-SOC.loaded>60000){if(!sheet.asked){sheet.asked=1;socialPublish(true).then(socialRefresh);}}
  const L=likeTally(),P=perKeys();let h='';
  if(sheet.tab==='islands'){const me=L[SOC.me]||{all:0,d:0};
    h+=`<p class="note"><img class="px" src="${HEART_ICO}" alt="" style="width:20px;vertical-align:-4px"> Your island has <b>${me.all}</b> like${me.all===1?'':'s'}${me.d?` (<b>${me.d}</b> today)`:''}. Visit a friend's island and leave them a like, once a day each.${SOC.ro?' <b>Your access to this page is view-only, so your island isn\'t shared and you can\'t leave likes.</b>':''}</p>`;
    const others=SOC.stats.filter(s=>s.id!==SOC.me).sort((a,b)=>((L[b.id]||{}).all||0)-((L[a.id]||{}).all||0)||(b.t||0)-(a.t||0));
    if(!others.length)h+=`<p class="note">${SOC.loaded?'No one else has shared their island yet. Share this page with friends (as Contributors) and their islands will appear here.':'Looking for islands…'}</p>`;
    h+='<div class="grid">';for(const s of others){const lk=(L[s.id]||{}).all||0,ago=s.t?Math.max(0,Math.round((Date.now()-s.t)/36e5)):null;
      h+=`<div class="card"><img class="px" src="${ICON.sprout}" alt=""><span class="grow"><span class="nm">${esc(s.isl||'An island')}</span><br><span class="sub">${esc(socName(s.id))} · Lv ${s.lvl||1} · ♥ ${lk}${ago!=null?` · ${ago<1?'just now':ago<48?ago+'h ago':Math.round(ago/24)+'d ago'}`:''}</span></span><button class="buy" data-visit="${esc(s.id)}">Visit</button></div>`;}
    h+='</div>';}
  else{const p=sheet.tab,label={d:'today',w:'this week',m:'this month'}[p];
    h+=`<p class="note">Who did the most ${label}? The boards reset every ${({d:'day',w:'Monday',m:'month'})[p]} (UTC).</p>`;
    for(const [id,title,what,ic] of STATS){const rows=SOC.stats.map(s=>({id:s.id,isl:s.isl,v:id==='likes'?(L[s.id]||{})[p]||0:(s[p]&&s[p].k===P[p]&&s[p].v&&s[p].v[id])||0})).filter(r=>r.v>0).sort((a,b)=>b.v-a.v);
      const mine=rows.findIndex(r=>r.id===SOC.me);
      h+=`<div class="ldb"><div class="ldbh"><img class="px" src="${socIcon(ic)}" alt=""><span><b>${title}</b><br><small>most ${what}</small></span></div>`;
      if(!rows.length)h+='<div class="ldbr none">No one yet. It could be you!</div>';
      rows.slice(0,5).forEach((r,i)=>{h+=`<div class="ldbr ${r.id===SOC.me?'me':''}"><span class="rk">${['🥇','🥈','🥉'][i]||i+1}</span><span class="who">${esc(r.isl||'An island')}<small>${esc(socName(r.id))}</small></span><span class="v">${fmt(Math.round(r.v))}</span></div>`;});
      if(mine>=5)h+=`<div class="ldbr me"><span class="rk">${mine+1}</span><span class="who">${esc(rows[mine].isl||'Your island')}<small>You</small></span><span class="v">${fmt(Math.round(rows[mine].v))}</span></div>`;
      h+='</div>';}}
  h+=`<p class="note"><button class="buy" data-socref="1">Refresh</button></p>`;body.innerHTML=h;}
function socialClick(d){if(d.visit){closeSheet();visitIsland(d.visit);return true;}if(d.socref){SOC.loaded=0;sheet.asked=0;socialPublish(true).then(socialRefresh);return true;}return false;}
$('bSocial').onclick=()=>openSheet('social',sheet&&sheet.kind==='social'?sheet.tab:'islands');
$('icoSocial').src=HEART_ICO;
