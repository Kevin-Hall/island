/* =========================================================
   The Island Fair (the Heart's level 5 building): a striped pavilion that runs a different contest every day.
   Today's contest (fairToday: the same for everyone on the same day, so friends race each other) is one of FAIR:
   a Fishing Derby (your heaviest fish today), a Bug-Off, a Harvest Fair, a Forage Hunt, Market Day, Spring Clean,
   an Island Ramble or a Wildlife Watch, scored from what you do anyway (the day's counts in S.social, 85e; the
   derby's best weight from 76-fishing via fairFish). Reach its bronze, silver and gold marks and collect the
   ribbons at the pavilion (shells and Heart XP); three golds in a contest win its trophy, a cup to put on show
   (BUILD 'cup_<contest>'). S.fair: today's claims; S.ribbons: every ribbon you've won, by contest.
   Older saves' museum or lodge becomes the fair.
   ========================================================= */
for(const b of S.builds||[])if(b.t==='museum'||b.t==='lodge')b.t='fair';
if(S.kits)for(const k of ['museum','lodge'])if(S.kits[k]){S.kits.fair=S.kits[k];delete S.kits[k];}
// stat: the day's count it's scored on (S.social, 85e); unit: how its score reads; tiers: bronze, silver, gold
const FAIR=[
  {k:'derby',name:'Fishing Derby',desc:'Land the heaviest fish you can.',ico:'f:tuna',unit:'kg',tiers:[2,6,12],col:0x3a7ac0},
  {k:'bugoff',name:'Bug-Off',desc:'Catch as many bugs as you can.',ico:'b:monarch',stat:'bugs',unit:'bugs',tiers:[3,6,10],col:0x5aa04a},
  {k:'harvest',name:'Harvest Fair',desc:'Harvest as many crops as you can.',ico:'sprout',stat:'crops',unit:'crops',tiers:[5,15,30],col:0xd8902a},
  {k:'forage',name:'Forage Hunt',desc:'Forage as many things as you can.',ico:'g:mushroom',stat:'forage',unit:'finds',tiers:[4,10,18],col:0xa86a3a},
  {k:'market',name:'Market Day',desc:'Earn as many shells as you can.',ico:'shell',stat:'shells',unit:'shells',tiers:[500,2000,5000],col:0xe8b030},
  {k:'clean',name:'Spring Clean',desc:'Pull weeds and clear clutter.',ico:'g:clover4',stat:'tidy',unit:'cleared',tiers:[5,12,25],col:0x6ab0a0},
  {k:'ramble',name:'Island Ramble',desc:'Walk as far as you can.',ico:'star',stat:'steps',unit:'steps',tiers:[300,800,1600],col:0xc86a8a},
  {k:'watch',name:'Wildlife Watch',desc:'Watch as many animals as you can.',ico:'w:fox',stat:'watch',unit:'animals',tiers:[2,5,9],col:0x7a6ac8}];
const RIBBON=[{n:'Bronze',c:0xc8804a,shells:150,xp:10},{n:'Silver',c:0xb8c0cc,shells:400,xp:20},{n:'Gold',c:0xe8b830,shells:1000,xp:40}];
const fairDay=()=>new Date().toISOString().slice(0,10);
function fairToday(day=fairDay()){let h=0;for(const ch of day)h=(h*31+ch.charCodeAt(0))>>>0;return FAIR[h%FAIR.length];}
function fairTomorrow(){return fairToday(new Date(Date.now()+864e5).toISOString().slice(0,10));}
function fairState(){const d=fairDay();if(!S.fair||S.fair.d!==d)S.fair={d,got:[0,0,0],kg:0,told:[0,0,0]};return S.fair;}
function fairScore(C=fairToday()){const F=fairState();if(C.k==='derby')return F.kg||0;const so=S.social&&S.social.d;return so&&so.k===fairDay()?(so.v[C.stat]||0):0;}
function fairFish(kg){if(S.visit)return;const F=fairState();if(kg>(F.kg||0))F.kg=kg;}
// the trophies: one cup per contest, won with its third gold ribbon
for(const C of FAIR){BUILD['cup_'+C.k]={name:C.name+' Cup',cost:0,lvl:1,craft:true,desc:`Three gold ribbons in the ${C.name}. A cup to put on show.`};OBJ_H['cup_'+C.k]=0.7;}
function fairCupParts(kind,g){if(!kind.startsWith('cup_'))return false;const C=FAIR.find(q=>'cup_'+q.k===kind);if(!C)return false;const G=0xe8b830,GD=0xb8862a,p=[];
  p.push(P(BOX,0x6a4a30,0,0.08,0,0,0,0,0.36,0.16,0.36),P(BOX,C.col,0,0.1,0.185,0,0,0,0.26,0.08,0.01),P(CYL12,GD,0,0.2,0,0,0,0,0.12,0.06,0.12),P(CYL8,G,0,0.3,0,0,0,0,0.05,0.16,0.05),
    PG(SPH,G,GD,0,0.5,0,0,0,0,0.3,0.3,0.3),P(CYL12,G,0,0.6,0,0,0,0,0.3,0.04,0.3));
  for(const s of [-1,1])p.push(P(CYL8,G,s*0.17,0.52,0,0,0,1.5708,0.025,0.1,0.025),P(CYL8,G,s*0.21,0.48,0,0,0,0,0.025,0.1,0.025));
  p.push(P(SPH_XS,C.col,0,0.68,0,0,0,0,0.09,0.09,0.09));const m=M(p);m.castShadow=true;g.add(m);return true;}

// ---- the pavilion (drawn by layoutTown, 55-town) ----
function fairParts(p,gl){const R=0xd8453a,W=0xf6efe2,Y=0xf2c14e,WOOD=0x8a5a3a;
  p.push(P(CYL12,0xb8a888,0,0.05,-0.1,0,0,0,1.9,0.1,1.7));/* a round wooden floor */
  for(let i=0;i<12;i++){const a=i/12*6.283;p.push(P(BOX,i%2?R:W,Math.sin(a)*0.76,0.55,-0.1+Math.cos(a)*0.66,0,a,0,0.42,1.0,0.04));}/* striped walls */
  for(let i=0;i<12;i++){const a=(i+0.5)/12*6.283;p.push(P(CONE4,i%2?W:R,Math.sin(a)*0.38,1.42,-0.1+Math.cos(a)*0.33,Math.cos(a)*0.6,a,0,0.42,0.9,0.12));}/* a striped peaked roof */
  p.push(P(CONE12,R,0,1.42,-0.1,0,0,0,1.75,0.85,1.55),P(CYL6,WOOD,0,2.0,-0.1,0,0,0,0.03,0.5,0.03),P(PRISM,Y,0.12,2.18,-0.1,0,0,1.5708,0.2/1.732*1.2,0.18/1.5,0.02));/* (its pennant) */
  for(let i=0;i<12;i++){const a=i/12*6.283;p.push(P(CONE4,i%2?Y:W,Math.sin(a)*0.84,1.0,-0.1+Math.cos(a)*0.74,3.1416,a,0,0.18,0.14,0.04));}/* a scalloped valance */
  // the entrance: an open doorway with drawn-back flaps, and a ribbon board beside it
  p.push(P(BOX,0x4a2a20,0,0.45,0.58,0,0,0,0.42,0.8,0.02));for(const s of [-1,1])p.push(P(PRISM,R,s*0.28,0.55,0.62,0,0,s*0.2,0.14,0.62,0.03));
  p.push(P(CYL6,WOOD,0.95,0.45,0.75,0,0,0,0.05,0.9,0.05),P(BOX,W,0.95,0.92,0.78,0,0,0,0.52,0.4,0.04),P(BOX,R,0.95,1.14,0.79,0,0,0,0.52,0.08,0.03));
  for(const [x,c] of [[0.8,RIBBON[2].c],[0.95,RIBBON[1].c],[1.1,RIBBON[0].c]])p.push(P(CYL8,c,x,0.92,0.81,1.5708,0,0,0.09,0.02,0.09),P(BOX,c,x-0.025,0.82,0.81,0,0,0.25,0.04,0.12,0.01),P(BOX,c,x+0.025,0.82,0.81,0,0,-0.25,0.04,0.12,0.01));
  // bunting from the peak to two poles, and a pair of striped barrels
  for(const s of [-1,1]){p.push(P(CYL6,WOOD,s*1.2,0.6,0.7,0,0,0,0.04,1.2,0.04));for(let i=0;i<6;i++){const t=(i+0.5)/6,x=s*1.2*t,y=1.18-Math.sin(t*Math.PI)*0.1+ (1-t)*0.65,z=0.7*t-0.1*(1-t);
      p.push(P(CONE4,[R,Y,0x5a9ad8,0x6ab84a][i%4],x,y,z,3.1416,0,0,0.1,0.13,0.02));}}
  for(const x of [-0.95,-0.7])p.push(P(CYL8,0x9a6a3a,x,0.2,0.75,0,0,0,0.2,0.4,0.2),P(CYL8,R,x,0.32,0.75,0,0,0,0.21,0.05,0.21),P(CYL8,R,x,0.12,0.75,0,0,0,0.21,0.05,0.21));
  gl.push(P(SPH_XS,0xfff0b8,0,0.95,0.6,0,0,0,0.08,0.08,0.06));}
function fairTap(b){goTo(b.door[0]+0.5,b.door[1]+0.6,()=>openSheet('fair','today'));}

// ---- the sheet: today's contest, and your ribbons and cups ----
const ribbonIco=i=>`<span class="ribb" style="--rc:${hexCss(RIBBON[i].c)}"></span>`;
function fairSheet(body){$('sheetTitle').textContent='Island Fair';tabs([['today','Today'],['ribbons','Ribbons']]);if(!sheet.tab)sheet.tab='today';
  const C=fairToday(),F=fairState(),sc=fairScore(C),N=fmtN=>C.k==='derby'?fmtN.toFixed(1):fmt(Math.floor(fmtN));let h='';
  if(sheet.tab==='today'){
    h+=`<div class="fairhd" style="--fc:${hexCss(C.col)}"><img class="px" src="${ICON[C.ico]||ICON.star}" alt=""><div><b>Today: ${C.name}</b><br><span>${C.desc} Everyone on the islands gets the same contest today.</span></div></div>`;
    h+=`<p class="note">Your score today: <b>${N(sc)} ${C.unit}</b>${C.k==='derby'?' (your heaviest fish)':''}.</p><div class="grid">`;
    RIBBON.forEach((R,i)=>{const need=C.tiers[i],ok=sc>=need,got=F.got[i];
      h+=`<div class="card">${ribbonIco(i)}<span class="grow"><span class="nm">${R.n} ribbon</span><br><span class="sub">${N(need)} ${C.unit} · ${fmt(R.shells)} shells</span></span>${got?'<span class="price">Won ✓</span>':ok?`<button class="buy" data-ribbon="${i}">Collect</button>`:`<span class="price">${N(Math.max(0,need-sc))} to go</span>`}</div>`;});
    h+=`</div><p class="note">Tomorrow: <b>${fairTomorrow().name}</b>. Contests change at midnight (UTC).</p>`;}
  else{const R=S.ribbons||{};let tot=0;for(const k in R)tot+=(R[k][0]||0)+(R[k][1]||0)+(R[k][2]||0);
    h+=`<p class="note"><b>${tot}</b> ribbon${tot===1?'':'s'} won. Three golds in a contest win its cup, to put on show on your island.</p><div class="grid">`;
    for(const C2 of FAIR){const r=R[C2.k]||[0,0,0],cup=(r[2]||0)>=3;
      h+=`<div class="card"><img class="px" src="${ICON[C2.ico]||ICON.star}" alt=""><span class="grow"><span class="nm">${C2.name}${cup?' · Cup won ✓':''}</span><br><span class="sub">${RIBBON.map((q,i)=>`${q.n} ×${r[i]||0}`).join(' · ')}${cup?'':` · ${Math.max(0,3-(r[2]||0))} gold to the cup`}</span></span></div>`;}
    h+='</div>';}
  body.innerHTML=h;}
function fairClick(d){if(d.ribbon===undefined)return false;fairCollect(+d.ribbon);return true;}
function fairCollect(i){const C=fairToday(),F=fairState();if(F.got[i]||fairScore(C)<C.tiers[i])return;F.got[i]=1;const R=RIBBON[i];
  const rb=S.ribbons||(S.ribbons={}),r=rb[C.k]||(rb[C.k]=[0,0,0]);r[i]++;S.shells+=R.shells;addXP(R.xp);statBump('ribbons');SFX.discover();
  for(let j=0;j<3;j++)setTimeout(()=>sparkle(vil.x,villager.position.y+1,vil.z,R.c),j*120);
  toast(`<b>${R.n} ribbon</b> in today's ${C.name}! +${fmt(R.shells)} shells`,i===2?'rare':'',ICON[C.ico]);
  if(i===2)logEvent('ribbon',{name:C.name});
  if(i===2&&r[2]===3){const k='cup_'+C.k;S.store[k]=(S.store[k]||0)+1;setTimeout(()=>{SFX.rare();toast(`Your third gold! The <b>${BUILD[k].name}</b> is yours. It's in your Bag (Decor) to put on show.`,'rare',THUMB[k]);},900);}
  save();updateHUD();renderSheet();}
// a nudge when you pass a mark (once the fair is built): the ribbon is waiting at the pavilion
let fairT=3;
function updateFair(dt){fairT-=dt;if(fairT>0)return;fairT=2;if(S.visit||!built('fair')||!TOWN.bld.some(b=>b.t==='fair'))return;
  const C=fairToday(),F=fairState(),sc=fairScore(C);F.told=F.told||[0,0,0];
  for(let i=2;i>=0;i--)if(sc>=C.tiers[i]&&!F.got[i]&&!F.told[i]){for(let j=0;j<=i;j++)F.told[j]=1;toast(`You've reached <b>${RIBBON[i].n.toLowerCase()}</b> in today's ${C.name}! Collect your ribbon at the fair.`,'',ICON[C.ico]);break;}}
