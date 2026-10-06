/* =========================================================
   The Nature Lodge and rewilding (in place of a museum): instead of putting what you catch on display, you let it go.
   At the lodge (a timber cabin with a lookout, a bird feeder and a pond) you release fish, bugs and sea creatures from
   your bag, and each kind you release comes to live on your island for good: fish swim in your rivers and shallows,
   butterflies and moths flutter about your flowers, beetles trundle round the trees (residents: real models near you,
   refreshResidents / updateResidents). Your island's tally of species (S.rewild, key → times released) earns
   milestones (REWILD_MS) and Heart XP. Releasing is a choice: you give up selling it.
   The kit is the Heart's level 5 unlock ('lodge'); older saves' museum becomes the lodge (S.builds, S.kits).
   ========================================================= */
// (older saves: the museum and its kit become the lodge)
for(const b of S.builds||[])if(b.t==='museum')b.t='lodge';if(S.kits&&S.kits.museum){S.kits.lodge=S.kits.museum;delete S.kits.museum;}
// what can be released: every fish but the junk, every bug, every sea creature
const REWILD_POOL=()=>[...Object.keys(FISH).filter(k=>!FISH[k].junk).map(k=>'f:'+k),...Object.keys(BUGS).map(k=>'b:'+k),...Object.keys(SEA).map(k=>'s:'+k)];
const REWILD_MS=[[5,400,'A few new neighbours'],[15,1200,'A lively island'],[30,2500,'Teeming with life'],[50,5000,'A wild haven'],[80,9000,'A living sanctuary'],[120,16000,'Every creature welcome']];
const rewildN=()=>Object.keys(S.rewild||{}).length;
const rewildOf=key=>key.startsWith('f:')?FISH[key.slice(2)]:key.startsWith('b:')?BUGS[key.slice(2)]:SEA[key.slice(2)];

// ---- the lodge itself (drawn by layoutTown, 55-town) ----
function lodgeParts(p,gl){const LOG=0x9a6a42,LOGD=0x7a5232,ROOF=0x4f7a4a,MOSS=0x6aa84a,CR=0xf2e6cc;
  p.push(P(BOX,0x8a7a6a,0,0.06,-0.1,0,0,0,2.0,0.12,1.6));/* a stone footing */
  for(let i=0;i<7;i++)p.push(P(CYL8,i%2?LOG:LOGD,0,0.2+i*0.15,-0.2,0,0,1.5708,0.16,1.74,0.16),P(CYL8,i%2?LOGD:LOG,0.86,0.2+i*0.15,-0.2,1.5708,0,0,0.15,1.16,0.15),P(CYL8,i%2?LOGD:LOG,-0.86,0.2+i*0.15,-0.2,1.5708,0,0,0.15,1.16,0.15));/* stacked log walls, ends crossing at the corners */
  p.push(P(BOX,0xb8885a,0,0.68,-0.2,0,0,0,1.62,1.0,1.02));
  for(const s of [-1,1])p.push(P(BOX,ROOF,s*0.5,1.48,-0.2,0,0,s*0.62,0.08,1.28,1.5));/* a steep roof, mossy along its ridge */
  p.push(P(PRISM,0xb8885a,0,1.38,0.53,0,0,0,1.5/1.732*1.1,0.55/1.5,0.04),P(SPH_LO,MOSS,0,1.92,-0.2,0,0,0,0.3,0.12,1.5));
  for(let i=0;i<4;i++)p.push(P(SPH_LO,MOSS,(i%2?0.3:-0.3)+(i*0.05),1.62-((i%2)*0.1),-0.6+i*0.3,0,0,0,0.22,0.08,0.22));
  // door, a round window with a leaf in it, a porch with rails
  p.push(P(BOX,0x6a4428,0,0.46,0.33,0,0,0,0.38,0.66,0.04),P(SPH_XS,0xd8b050,0.12,0.46,0.36,0,0,0,0.04,0.04,0.03),P(CYL12,CR,-0.55,0.86,0.32,1.5708,0,0,0.3,0.03,0.3));
  gl.push(P(CYL12,0x404a60,-0.55,0.86,0.33,1.5708,0,0,0.24,0.02,0.24));p.push(P(SPH_LO,0x6ab84a,-0.55,0.86,0.345,0,0,0.6,0.12,0.06,0.02));
  p.push(P(BOX,0x8a6040,0,0.12,0.62,0,0,0,1.7,0.06,0.5));for(const x of [-0.8,-0.4,0.4,0.8])p.push(P(CYL6,LOGD,x,0.36,0.85,0,0,0,0.05,0.48,0.05));
  for(const s of [-1,1])p.push(P(BOX,LOG,s*0.6,0.56,0.85,0,0,0,0.48,0.05,0.05));
  // a lookout on the right: four posts, a platform, a little roof
  const TX=1.05,TZ=-0.75;for(const [a,b] of [[-0.18,-0.18],[0.18,-0.18],[-0.18,0.18],[0.18,0.18]])p.push(P(CYL6,LOGD,TX+a,1.05,TZ+b,0,0,0,0.06,2.1,0.06));
  p.push(P(BOX,0x8a6040,TX,1.7,TZ,0,0,0,0.5,0.05,0.5),P(BOX,LOG,TX,1.86,TZ+0.24,0,0,0,0.5,0.05,0.03),P(BOX,LOG,TX+0.24,1.86,TZ,0,0,0,0.03,0.05,0.5),P(CONE4,ROOF,TX,2.3,TZ,0,0.785,0,0.62,0.4,0.62));
  // a sign with a leaf and a paw print, a bird feeder, and a pond with lily pads by the porch
  p.push(P(CYL6,LOGD,-1.05,0.4,0.9,0,0,0,0.05,0.8,0.05),P(BOX,CR,-1.05,0.82,0.92,0,0,0,0.5,0.28,0.04),P(SPH_LO,0x5a9a3a,-1.15,0.83,0.95,0,0,0.5,0.1,0.06,0.02),
    P(SPH_XS,0x7a5232,-0.95,0.82,0.95,0,0,0,0.05,0.05,0.02));for(const [a,b] of [[-0.06,0.05],[0,0.07],[0.06,0.05]])p.push(P(SPH_XS,0x7a5232,-0.95+a,0.82+b,0.95,0,0,0,0.022,0.022,0.02));
  p.push(P(CYL6,LOGD,-0.95,0.5,-0.9,0,0,0,0.04,1.0,0.04),P(BOX,0x8a6040,-0.95,1.0,-0.9,0,0,0,0.3,0.03,0.24),P(PRISM,ROOF,-0.95,1.14,-0.9,0,0,0,0.36/1.732*1.2,0.14/1.5,0.28),P(SPH_XS,0xe8c070,-0.95,1.04,-0.9,0,0,0,0.12,0.03,0.08));
  p.push(P(CYL12,0x8a7a6a,0.95,0.07,0.95,0,0,0,0.76,0.06,0.6),P(CYL12,0x4a9ad0,0.95,0.1,0.95,0,0,0,0.64,0.02,0.5));
  for(const [a,b] of [[-0.12,0.05],[0.14,-0.08],[0.05,0.15]])p.push(P(CYL8,0x5aa84a,0.95+a,0.115,0.95+b,0,0,0,0.12,0.01,0.12));p.push(P(SPH_XS,0xf6a0c0,1.0,0.13,1.1,0,0,0,0.05,0.04,0.05));
  for(let i=0;i<3;i++)p.push(P(CYL5,0x5a8a3a,1.28+i*0.04,0.25,0.75+i*0.06,0.1,0,-0.1,0.012,0.4,0.012),P(CYL6,0x7a4a2a,1.28+i*0.04,0.42,0.75+i*0.06,0,0,0,0.025,0.08,0.025));}
function lodgeTap(b){goTo(b.door[0]+0.5,b.door[1]+0.6,()=>{openSheet('lodge','release');});}

// ---- the sheet: release, and what lives here now ----
function lodgeSheet(body){$('sheetTitle').textContent='Nature Lodge';tabs([['release','Release'],['living','Living here']]);if(!sheet.tab)sheet.tab='release';
  const pool=REWILD_POOL(),n=rewildN();let h='';
  if(sheet.tab==='release'){const bag=Object.keys(S.inv).filter(k=>S.inv[k]>0&&pool.includes(k)).sort((a,b)=>(!!(S.rewild||{})[a])-(!!(S.rewild||{})[b])||nameOf(a).localeCompare(nameOf(b)));
    h+=`<p class="note">Let a creature go and it makes your island its home: fish swim in your rivers and shallows, bugs flutter and crawl about your garden. <b>${n}</b> of ${pool.length} kinds live here now.</p>`;
    if(!bag.length)h+='<p class="note">Nothing to release yet. Catch a fish, a bug or a sea creature and bring it here.</p>';
    h+='<div class="grid">';for(const k of bag){const fresh=!(S.rewild||{})[k],I=rewildOf(k);
      h+=`<div class="card"><img class="px" src="${ICON[k]}" alt=""><span class="grow"><span class="nm">${esc(nameOf(k))}${fresh?' <b style="color:#3a9a5a">· New!</b>':''}</span><br><span class="sub">×${S.inv[k]} in your bag${fresh?' · moves in for good':' · already lives here'}</span></span><button class="buy" data-free="${k}">Release</button></div>`;}
    h+='</div>';}
  else{const next=REWILD_MS.find(m=>n<m[0]);
    h+=`<p class="note"><b>${n}</b> of ${pool.length} kinds of creature live on your island.${next?` Next: <b>${next[2]}</b> at ${next[0]} kinds (+${fmt(next[1])} shells).`:' Every milestone reached!'}</p><div class="grid">`;
    for(const [m,r,t] of REWILD_MS)h+=`<div class="card"><img class="px" src="${n>=m?ICON.star:ICON.sprout}" alt=""><span class="grow"><span class="nm">${t}</span><br><span class="sub">${m} kinds · ${fmt(r)} shells${n>=m?' · reached ✓':''}</span></span></div>`;
    h+='</div><div class="grid">';for(const k of pool){const got=(S.rewild||{})[k];if(!got&&!S.alm[k])continue;
      h+=`<div class="card"><img class="px ${got?'':'sil'}" src="${ICON[k]}" alt=""><span class="grow"><span class="nm">${got?esc(nameOf(k)):'Not yet released'}</span><br><span class="sub">${got?'lives here':'caught, but not let go'}</span></span></div>`;}
    h+='</div>';}
  body.innerHTML=h;}
function lodgeClick(d){if(!d.free)return false;releaseOne(d.free);return true;}
function releaseOne(key){if(!(S.inv[key]>0))return;S.inv[key]--;if(!S.inv[key])delete S.inv[key];S.rewild=S.rewild||{};const fresh=!S.rewild[key];S.rewild[key]=(S.rewild[key]||0)+1;
  SFX.discover();for(let i=0;i<3;i++)setTimeout(()=>hearts(vil.x,villager.position.y+1,vil.z),i*160);
  if(fresh){addXP(15);logEvent('release',{name:nameOf(key)});toast(`You let the <b>${nameOf(key)}</b> go. It lives on your island now!`,'',ICON[key]);
    const n=rewildN(),m=REWILD_MS.find(q=>q[0]===n);if(m){S.shells+=m[1];setTimeout(()=>{SFX.rare();toast(`<b>${m[2]}!</b> ${n} kinds of creature live on your island. +${fmt(m[1])} shells`,'rare',ICON.star);},900);}}
  else toast(`Another <b>${nameOf(key)}</b> joins the others.`,'',ICON[key]);
  resid.t=0;save();updateHUD();renderSheet();}

// ---- the residents: the creatures you've let go, about the island near you ----
const resid={list:[],t:0,sig:''};
function residentSpots(kind){const cx=Math.round(vil.x),cz=Math.round(vil.z),out=[];
  for(let dx=-11;dx<=11;dx++)for(let dz=-11;dz<=11;dz++){const x=cx+dx,z=cz+dz,k=K(x,z);
    if(kind==='fish'){if(riverSurf.has(k)||(!isLand(x,z)&&![[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>isLand(x+a,z+b))&&[[2,0],[0,2],[-2,0],[0,-2]].some(([a,b])=>isLand(x+a,z+b))))out.push([x,z]);/* (rivers, or the shallows two tiles out, clear of the tide line) */}
    else if(kind==='fly'){if(TOWN.flora&&TOWN.flora.has(k)||(objAt(x,z)&&/flower|planter|wf\d/.test(objAt(x,z).k))||(S.tiles[k]&&S.tiles[k].crop))out.push([x,z]);}
    else{const d=debrisAt(x,z);if(d&&(d.k==='tree'||d.k==='stump'||d.k==='rock'))out.push([x,z]);}}
  return out;}
function clearResidents(){for(const r of resid.list){scene.remove(r.m);r.m.traverse(o=>{if(o.geometry&&o.geometry.userData&&!o.geometry.userData.keep)o.geometry.dispose();});}resid.list=[];}
function refreshResidents(){const isl=S.sea||inside?null:curIsl();clearResidents();if(!isl||!isl.home||S.visit||!S.rewild)return;
  const keys=Object.keys(S.rewild),night=isNight(),R=Math.random;
  const pickN=(arr,n)=>shuffle(arr.slice(),R).slice(0,n);
  const fish=pickN(keys.filter(k=>k.startsWith('f:')||k.startsWith('s:')),6),bugs=keys.filter(k=>k.startsWith('b:')&&BUGS[k.slice(2)]&&(!BUGS[k.slice(2)].time||(BUGS[k.slice(2)].time==='night')===night));
  const fly=pickN(bugs.filter(k=>(BUGS[k.slice(2)].kind||'fly')!=='crawl'),6),crawl=pickN(bugs.filter(k=>BUGS[k.slice(2)].kind==='crawl'),3);
  const fs=residentSpots('fish'),ls=residentSpots('fly'),cs=residentSpots('crawl');
  for(const k of fish){if(!fs.length)break;const [x,z]=pickR(fs),F=k.startsWith('f:')?FISH[k.slice(2)]:null;let m;
    if(F){m=fishModel(F);const s=0.32+F.size*0.1;m.scale.setScalar(Math.min(0.45,0.3/(s)));}else{m=seaModel(k.slice(2));m.scale.setScalar(0.35);}
    scene.add(m);resid.list.push({m,kind:'fish',x,z,y:waterY(x,z)-0.06,ph:R()*6.28,sp:0.4+R()*0.4,r:0.3+R()*0.35});}
  for(const k of fly){if(!ls.length)break;const [x,z]=pickR(ls),m=bugGroup(BUGS[k.slice(2)]);m.scale.setScalar(BUG_SCALE);scene.add(m);resid.list.push({m,kind:'fly',x,z,y:topY(x,z),ph:R()*6.28,sp:0.6+R()*0.4});}
  for(const k of crawl){if(!cs.length)break;const [x,z]=pickR(cs),m=bugGroup(BUGS[k.slice(2)]);m.scale.setScalar(BUG_SCALE);scene.add(m);resid.list.push({m,kind:'crawl',x:x+0.45,z:z+0.3,y:topY(x,z),ph:R()*6.28,sp:0.2+R()*0.15});}}
function updateResidents(dt,tt){resid.t-=dt;const sig=(curIsl()||{}).id+'|'+isNight()+'|'+!!inside+'|'+S.sea;
  if(resid.t<=0||sig!==resid.sig){resid.t=25;resid.sig=sig;refreshResidents();}
  for(const a of resid.list){const m=a.m,t=tt*a.sp+a.ph;
    if(a.kind==='fish'){const px=a.x+Math.cos(t)*a.r,pz=a.z+Math.sin(t)*a.r*0.8;m.position.set(px,a.y+Math.sin(tt*1.4+a.ph)*0.02,pz);m.rotation.y=Math.atan2(-Math.sin(t)*a.r,Math.cos(t)*a.r*0.8);}
    else if(a.kind==='fly'){const ox=m.position.x,oz=m.position.z,px=a.x+Math.sin(t)*0.7,pz=a.z+Math.sin(t*1.6+1)*0.6;m.position.set(px,a.y+0.45+Math.sin(t*2.3)*0.18,pz);
      if(Math.hypot(px-ox,pz-oz)>1e-4)m.rotation.y=Math.atan2(px-ox,pz-oz);const u=m.userData;if(u.wl){const f=Math.sin(tt*16+a.ph)*0.9;u.wl.rotation.z=f;u.wr.rotation.z=-f;}}
    else{const px=a.x+Math.sin(t)*0.18,pz=a.z+Math.cos(t*0.7)*0.12;m.rotation.y=Math.atan2(px-m.position.x,pz-m.position.z)||m.rotation.y;m.position.set(px,a.y+0.02,pz);}}}
