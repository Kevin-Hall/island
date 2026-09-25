/* =========================================================
   Beach finds & weeds (saved)
   ========================================================= */
const lifeRoot=new T.Group();scene.add(lifeRoot);
function findGroup(k,seed){const p=[],g=new T.Group();
  switch(k){
    case'shell':p.push(P(ICO,0xf6d6d0,0,0.05,0,0,0,0,0.28,0.09,0.26),P(BOX,0xf0a0a8,0,0.09,0,0,0,0,0.04,0.03,0.24),P(BOX,0xf0a0a8,0.08,0.08,0,0,0.3,0,0.03,0.03,0.2),P(BOX,0xf0a0a8,-0.08,0.08,0,0,-0.3,0,0.03,0.03,0.2));break;
    case'frostshell':p.push(P(ICO,0xd8f0ff,0,0.05,0,0,0,0,0.28,0.09,0.26),P(BOX,0x8ac8f0,0,0.09,0,0,0,0,0.04,0.03,0.24),P(BOX,0x8ac8f0,0.08,0.08,0,0,0.3,0,0.03,0.03,0.2),P(BOX,0x8ac8f0,-0.08,0.08,0,0,-0.3,0,0.03,0.03,0.2));break;
    case'conch':p.push(P(CONE6,0xf0d8c0,0,0.1,0,0,0,Math.PI/2,0.24,0.4,0.24),P(ICO,0xf39ab0,-0.1,0.09,0,0,0,0,0.16,0.12,0.16));break;
    case'dollar':p.push(P(CYL8,0xe8dcc0,0,0.02,0,0,0,0,0.32,0.03,0.32));for(let i=0;i<5;i++)p.push(P(BOX,0xc0ae88,Math.sin(i*1.256)*0.07,0.04,Math.cos(i*1.256)*0.07,0,i*1.256,0,0.03,0.01,0.08));break;
    case'star':for(let i=0;i<5;i++){const a=i/5*6.28;p.push(P(BOX,0xf08a4a,Math.sin(a)*0.11,0.03,Math.cos(a)*0.11,0,a,0,0.08,0.05,0.2));}p.push(P(BOX,0xe8703a,0,0.04,0,0,0,0,0.12,0.06,0.12));break;
    case'glass':p.push(P(OCT,0x7ae0c0,0,0.05,0,0.3,0.5,0,0.16,0.09,0.13),P(OCT,0x9ad8f0,0.12,0.04,0.07,0,1,0,0.11,0.07,0.09));break;
    case'drift':p.push(P(BOX,0xa89070,0,0.05,0,0,0.4,0,0.66,0.09,0.11),P(BOX,0x8a7258,0.12,0.06,0.1,0,-0.5,0,0.26,0.07,0.08));break;
    case'pearl':p.push(P(ICO,0xd0c0d0,0,0.03,0,0,0,0,0.3,0.05,0.28),P(ICO,0xd0c0d0,0,0.12,-0.1,-0.9,0,0,0.3,0.05,0.28),P(ICO,0xffffff,0,0.08,0.02,0,0,0,0.1,0.1,0.1));break;
    case'bottle':p.push(P(CYL8,0x7ab8a0,0,0.07,0,0,0,Math.PI/2,0.15,0.34,0.15),P(CYL8,0x7ab8a0,0.22,0.07,0,0,0,Math.PI/2,0.07,0.12,0.07),P(CYL8,0xa07a4a,0.3,0.07,0,0,0,Math.PI/2,0.07,0.05,0.07),P(BOX,0xf4ecd8,-0.02,0.07,0,0,0,0,0.16,0.07,0.07));break;
    case'coral':for(let i=0;i<5;i++){const a=i*1.3;p.push(P(BOX,i%2?0xf07a9a:0xf6a0b8,Math.sin(a)*0.08,0.12,Math.cos(a)*0.08,Math.cos(a)*0.4,0,Math.sin(a)*0.4,0.05,0.26,0.05));}break;
    case'obsidianshard':p.push(P(OCT,0x2b1e2e,0,0.08,0,0.4,0.5,0,0.18,0.18,0.12),P(OCT,0x4a3a6a,0.1,0.05,0.06,0,1,0,0.1,0.1,0.08));break;
    case'amber':p.push(P(OCT,0xf0a030,0,0.07,0,0.2,0.5,0,0.18,0.14,0.14));break;
    case'fossil':p.push(P(CYL8,0xb8b0a0,0,0.03,0,0,0,0,0.34,0.05,0.34),P(BOX,0x8a8478,0,0.07,0,0,0,0,0.2,0.02,0.04),P(BOX,0x8a8478,0,0.07,0,0,1.2,0,0.14,0.02,0.04),P(BOX,0x8a8478,0,0.07,0,0,2.4,0,0.1,0.02,0.04));break;
    case'starfrag':for(let i=0;i<5;i++){const a=i/5*6.28;p.push(P(OCT,0xffe070,Math.sin(a)*0.1,0.08,Math.cos(a)*0.1,0,a,Math.PI/2,0.1,0.18,0.1));}p.push(P(ICO,0xfff4b0,0,0.08,0,0,0,0,0.14,0.14,0.14));break;
    case'crate':p.push(P(BOX,0xa27a50,0,0.1,0,0,0,0,0.5,0.4,0.5),P(BOX,0x6a4a30,0,0.1,0,0,0,0,0.52,0.06,0.52),P(BOX,0x6a4a30,0,0.1,0,0,0,0,0.06,0.42,0.52));break;
    case'weed':{const R=mulberry(seed);for(let i=0;i<6;i++)p.push(P(BOX,i%2?0x3d6e2c:0x4f8a34,(R()-0.5)*0.34,0.1,(R()-0.5)*0.34,(R()-0.5)*0.6,R()*3,(R()-0.5)*0.6,0.05,0.2+R()*0.14,0.1));
      if(R()<0.4)p.push(P(BOX,0xf6d04a,(R()-0.5)*0.2,0.26,(R()-0.5)*0.2,0,0,0,0.07,0.05,0.07));break;}
  }
  g.add(M(p,k==='starfrag'?lumMat:vcMat));return g;}
function findAt(x,z){return S.finds.find(f=>f.x===x&&f.z===z)||null;}
function weedAt(x,z){return S.weeds.find(f=>f.x===x&&f.z===z)||null;}
let weedSlow=new Set();
/* ---- farm debris: weeds, twigs, bushes, rocks, stumps and boulders to clear (Stardew-style) ---- */
const DEBRIS={weed:{hp:1},twig:{hp:1},bush:{hp:2},rock:{hp:2},stump:{hp:3},boulder:{hp:4}};
const debGeo={},debMesh=new Map(),debrisRoot=new T.Group();scene.add(debrisRoot);
function debrisAt(x,z){return S.debris.find(d=>d.x===x&&d.z===z)||null;}
function debrisParts(k,R){const p=[];switch(k){
  case'weed':for(let i=0;i<10;i++)lf(p,[0x5a8a34,0x6a9a3a,0x4a7a2a][i%3],(R()-0.5)*0.3,0,(R()-0.5)*0.3,R()*6.28,1.0+R()*0.4,0.3+R()*0.15,0.06,0.025);
    if(R()<0.6)for(let i=0;i<2;i++)bloom(p,[0xf6d04a,0xffffff][i],0xf6d04a,(R()-0.5)*0.3,0.26,(R()-0.5)*0.3,0.05);break;
  case'twig':for(let i=0;i<3;i++)p.push(P(CYL6,i%2?0x7a5230:0x6a4428,(R()-0.5)*0.3,0.03,(R()-0.5)*0.3,1.57,R()*3,0,0.04,0.4+R()*0.2,0.04));lf(p,0x6a9a3a,0.05,0.04,0,R()*6,0.2,0.12,0.07);break;
  case'bush':p.push(P(ICO2,0x4a7a2e,0,0.22,0,0,R()*3,0,0.6,0.42,0.6));for(let i=0;i<20;i++){const a=R()*6.283,e=R()*1.1;lf(p,[0x4a7a2e,0x5a8a34,0x3a6a28][i%3],Math.sin(a)*0.28*Math.cos(e),0.2+Math.sin(e)*0.2,Math.cos(a)*0.28*Math.cos(e),a,0.2+e*0.5,0.2,0.12);}
    for(let i=0;i<4;i++){const a=R()*6.28;p.push(P(CYL6,0x6a4a2a,Math.sin(a)*0.25,0.36,Math.cos(a)*0.25,Math.cos(a)*0.8,0,-Math.sin(a)*0.8,0.02,0.26,0.02));}break;
  case'rock':rockP(p,R,0x9a9ea8,0.55);break;
  case'boulder':rockP(p,R,0x8e929c,1.05);p.push(P(ICO2,0x5a8a44,0.05,0.42,0,0,R()*3,0,0.5,0.1,0.42));break;
  case'stump':p.push(P(CYL12,0x7a5230,0,0.16,0,0,0,0,0.44,0.32,0.44),P(CYL12,0xd8b078,0,0.325,0,0,0,0,0.38,0.02,0.38),P(CYL12,0xb08a58,0,0.33,0,0,0,0,0.22,0.02,0.22),P(CYL12,0xd8b078,0,0.335,0,0,0,0,0.1,0.02,0.1));
    for(let i=0;i<4;i++){const a=i*1.57+R()*0.4;p.push(P(CYL6,0x6a4428,Math.cos(a)*0.22,0.05,Math.sin(a)*0.22,Math.sin(a)*1.1,0,-Math.cos(a)*1.1,0.08,0.26,0.08));}
    if(R()<0.5)p.push(P(CYL6,0xf2ead8,0.2,0.08,0.18,0,0,0,0.04,0.12,0.04),P(ICO2,0xd8453a,0.2,0.15,0.18,0,0,0,0.12,0.06,0.12));break;}
  return p;}
function debrisGeo(k,v){const id=k+v;if(!debGeo[id])debGeo[id]=merge(debrisParts(k,mulberry(hi(k.length,v,77))));return debGeo[id];}
function syncDebris(){while(debrisRoot.children.length)debrisRoot.remove(debrisRoot.children[0]);debMesh.clear();
  for(const d of S.debris){const m=new T.Mesh(debrisGeo(d.k,d.v),vcMat);m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;
    m.position.set(d.x,topY(d.x,d.z),d.z);m.rotation.y=d.r;m.userData.shake=0;debrisRoot.add(m);debMesh.set(K(d.x,d.z),m);}}
function newDebris(x,z,k){return{x,z,k,v:Math.floor(Math.random()*3),r:Math.random()*6.28,hp:DEBRIS[k].hp};}
function genDebris(){const R=mulberry(S.worldSeed^0xfa12);
  for(const [x,z] of islands[0].grass){if(farmQ(x,z)>1||Math.hypot(x-(FARM.x+5),z-(FARM.z-0.5))<2.4||!freeTile(x,z))continue;if(R()>0.68)continue;
    const r=R(),k=r<0.34?'weed':r<0.46?'twig':r<0.6?'bush':r<0.8?'rock':r<0.94?'stump':'boulder';const d=newDebris(x,z,k);d.v=Math.floor(R()*3);S.debris.push(d);}}
function regrowDebris(){if(!S.farmInit)return;const c=islands[0].grass.filter(([x,z])=>farmQ(x,z)<1&&freeTile(x,z));
  for(let i=0;i<3&&c.length&&S.debris.length<80;i++){const [x,z]=c.splice(Math.floor(Math.random()*c.length),1)[0];const r=Math.random();S.debris.push(newDebris(x,z,r<0.55?'weed':r<0.8?'twig':'rock'));}}
function hitDebris(d){walkTo(d.x,d.z);vil.hop=0.2;d.hp--;const m=debMesh.get(K(d.x,d.z));if(m)m.userData.shake=0.3;
  const wood=d.k==='stump'||d.k==='twig'||d.k==='bush',stone=d.k==='rock'||d.k==='boulder',y=topY(d.x,d.z)+0.3;
  if(stone){tone(190,0.06,'square',0.05);noise(0.05,0.05,2600);}else if(wood){tone(140,0.07,'triangle',0.06);noise(0.06,0.04,900);}else noise(0.1,0.04,1600);
  burst(d.x,y,d.z,stone?0xa4a4b4:wood?0x9a6a3a:0x6a9a3a,6,1.1,0.06);
  if(d.hp>0)return;
  S.debris=S.debris.filter(q=>q!==d);syncDebris();const got=[];const add=(k,n)=>{if(n>0){gain('m:'+k,n);got.push('+'+n+' '+MATS[k].name);}};const c=()=>Math.random()<0.5?1:0;
  switch(d.k){case'weed':add('fiber',1+c());break;case'twig':add('wood',1);break;case'bush':add('fiber',1);add('wood',1+c());break;
    case'rock':add('stone',1+c());break;case'stump':add('wood',3+c());break;case'boulder':add('stone',4+c());break;}
  if(Math.random()<(d.k==='boulder'?0.3:d.k==='rock'?0.06:0)){const n=40+Math.floor(Math.random()*(d.k==='boulder'?160:60));S.shells+=n;got.push('+'+n+' shells (an old coin!)');}
  if(Math.random()<(d.k==='weed'||d.k==='bush'?0.08:0)){const id=pickR(CROP_IDS.filter(i=>CROPS[i].lvl<=level()));S.free[id]=(S.free[id]||0)+1;got.push('+1 '+CROPS[id].name+' seed');}
  floatText(d.x,1.1,d.z,got.join(' · '),'gold');SFX.pop();addXP(d.k==='boulder'||d.k==='stump'?2:1);burst(d.x,y,d.z,stone?0xc4c4d0:wood?0xb08050:0x8aba5a,14,1.8,0.08);
  if(!S.farmClear&&!S.debris.some(q=>farmQ(q.x,q.z)<1.05)){S.farmClear=1;SFX.level();toast('The whole farm field is cleared. Room for a proper harvest!','rare',ICON.sprout);}}
function updateDebris(dt,tt){for(const m of debrisRoot.children){const u=m.userData;if(u.shake>0){u.shake-=dt;m.rotation.z=Math.sin(tt*60)*u.shake*0.35;if(u.shake<=0)m.rotation.z=0;}}}
function syncLife(){syncDebris();
  while(lifeRoot.children.length){const c=lifeRoot.children[0];lifeRoot.remove(c);c.traverse(o=>{if(o.geometry)o.geometry.dispose();});}
  S.finds=S.finds.filter(f=>isLand(f.x,f.z)&&FINDS[f.k]);S.weeds=S.weeds.filter(w=>isLand(w.x,w.z)&&!S.tiles[K(w.x,w.z)]);
  for(const f of S.finds){const g=findGroup(f.k);g.position.set(f.x+(hash(f.x,f.z)-0.5)*0.3,topY(f.x,f.z),f.z+(hash(f.z,f.x)-0.5)*0.3);g.rotation.y=hash(f.x,f.z)*6.28;lifeRoot.add(g);}
  weedSlow=new Set();
  for(const w of S.weeds){const g=findGroup('weed',w.x*31+w.z*7+99);g.position.set(w.x,topY(w.x,w.z),w.z);lifeRoot.add(g);
    for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)weedSlow.add(K(w.x+dx,w.z+dz));}
}
const freeTile=(x,z)=>!TOWN.path.has(K(x,z))&&!debrisAt(x,z)&&!objAt(x,z)&&!fixedAt(x,z)&&!findAt(x,z)&&!weedAt(x,z)&&!S.tiles[K(x,z)];
function spawnFind(quiet,isl){if(!isl)return;const here=S.finds.filter(f=>islMap.get(K(f.x,f.z))===isl.id);if(here.length>=5)return;
  if(S.finds.length>=16)S.finds.shift();
  const c=isl.sand.filter(([x,z])=>freeTile(x,z)&&!(isl.blocked&&isl.blocked.has(K(x,z))));if(!c.length)return;const [x,z]=pickR(c);
  const k=pickW(FINDS,k=>FINDS[k].w>0&&(FINDS[k].bio.includes('any')||FINDS[k].bio.includes(isl.biome)));S.finds.push({k,x,z});
  if(!quiet){syncLife();for(let i=0;i<5;i++)sparkle(x,0.4,z,0xe8f4ff);}}
function spawnWeed(quiet){if(S.weeds.length>=7)return;const c=islands[0].grass.filter(([x,z])=>freeTile(x,z));if(!c.length)return;const [x,z]=pickR(c);
  S.weeds.push({x,z});if(!quiet){syncLife();burst(x,0.6,z,0x4f8a34,4,0.6,0.05);}}
function pullWeed(w){S.weeds=S.weeds.filter(q=>q!==w);syncLife();walkTo(w.x,w.z);vil.hop=0.25;SFX.till();burst(w.x,0.6,w.z,0x4f8a34,10,1.3,0.07);addXP(1);
  if(Math.random()<0.3){const id=pickR(CROP_IDS.filter(i=>CROPS[i].lvl<=level()));S.free[id]=(S.free[id]||0)+1;floatText(w.x,1.1,w.z,'+1 '+CROPS[id].name+' seed','gold');SFX.pop();}
  else floatText(w.x,1,w.z,'pulled!');}
function collectFind(f){S.finds=S.finds.filter(q=>q!==f);syncLife();walkTo(f.x,f.z);vil.hop=0.25;
  if(f.k==='bottle'){const first=!S.alm['g:bottle'];S.alm['g:bottle']=(S.alm['g:bottle']||0)+1;if(first)setTimeout(()=>checkDex('g:bottle'),600);openBottle();return;}
  const I=FINDS[f.k],first=gain('g:'+f.k);burst(f.x,0.5,f.z,0xfff6e2,8,1,0.06);floatText(f.x,0.9,f.z,'+ '+I.name,I.w<5?'gold':'');
  if(I.w<5){SFX.rare();toast(`You found a <b>${I.name}</b>!${first?' <b>New!</b>':''}`,'rare',ICON['g:'+f.k]);}else{SFX.harvest();if(first)toast(`New in your Islandex: <b>${I.name}</b>`,'',ICON['g:'+f.k]);}addXP(2);}
function openBottle(){SFX.rare();const lv=level(),r=Math.random();let msg;
  const un=CROP_IDS.filter(i=>CROPS[i].lvl<=lv);
  if(r<0.3){const n=60+lv*60+Math.floor(Math.random()*100);S.shells+=n;msg=`“Whoever finds this — buy yourself something nice.” Tucked inside: <b>${fmt(n)} shells</b>.`;}
  else if(r<0.55){const id=pickR(un);S.free[id]=(S.free[id]||0)+3;msg=`“These grew beautifully on my island.” Inside: <b>3 ${CROPS[id].name} seeds</b>.`;}
  else if(r<0.72){S.free.mystery=(S.free.mystery||0)+1;msg=`“Plant this under a full moon.” Inside: <b>a Mystery Seed</b>.`;}
  else if(r<0.85){gain('g:pearl');msg=`“The sea gave me two. One is yours.” Inside: <b>a Pearl</b>!`;}
  else{const und=islands.filter(i=>!S.disc[i.id]);if(und.length){const isl=und.sort((a,b)=>Math.hypot(a.cx-vil.x,a.cz-vil.z)-Math.hypot(b.cx-vil.x,b.cz-vil.z))[0];S.disc[isl.id]=1;
      msg=`A torn sea chart! It marks <b>${isl.name}</b>, a ${BIOMES[isl.biome].name.toLowerCase()} island. It's on your Chart now.`;}
    else{const n=200+lv*80;S.shells+=n;msg=`An old captain's log and <b>${fmt(n)} shells</b>.`;}}
  setAction(msg,[{label:'Keep it',cls:'go',fn:clearAction}],'Message in a Bottle');}

/* =========================================================
   Wild plants on explored islands (regrow each morning and evening)
   ========================================================= */
function plantGroup(id,seed){const Pd=PLANTS[id],R=mulberry(seed),g=new T.Group(),p=[],f=[];const col=Pd.col,dk=Pd.dk,cc=Pd.c||'#f6d04a';
  switch(Pd.kind){
    case'berry':p.push(P(ICO,0x3a7a30,0,0.22,0,0,R()*3,0,0.62,0.42,0.62));
      for(let i=0;i<26;i++){const a=R()*6.283,e=R()*1.1,x=Math.sin(a)*0.3*Math.cos(e),y=0.2+Math.sin(e)*0.2,z=Math.cos(a)*0.3*Math.cos(e);lf(p,GREENS[i%4],x,y,z,a,0.2+e*0.5,0.2,0.13);}
      for(let c=0;c<4;c++){const a=c*1.57+R()*0.5;berries(f,col,dk,Math.sin(a)*0.28,0.24+R()*0.12,Math.cos(a)*0.28,0.06,3,R);}break;
    case'flower':
      if(id==='waterlily'){p.push(P(CYL8,0x4f9a3a,0,0.02,0,0,0,0,0.6,0.02,0.6),P(CYL8,0x6ab84a,0.28,0.025,0.15,0,0,0,0.34,0.02,0.34));bloom(f,col,cc,0,0.07,0,0.17,8,0.45);bloom(f,dk,cc,0.28,0.06,0.15,0.08,6,0.5);break;}
      for(let s=0;s<6;s++){const x=(R()-0.5)*0.5,z=(R()-0.5)*0.5,h=0.2+R()*0.25;stemP(p,0x4f8a34,x,z,h);lf(p,GREENS[s%4],x,h*0.3,z,R()*6.28,0.3,0.14,0.08);lf(p,GREENS[(s+2)%4],x,h*0.6,z,R()*6.28,0.35,0.12,0.07);
        if(['honeyclover','firelily','phoenixbloom'].includes(id))spike(f,col,dk,x,h,z,0.045);else bloom(f,s%2?col:dk,cc,x,h,z,0.1,id==='hibiscus'||id==='icelily'?5:6);}
      for(let i=0;i<6;i++)lf(p,GREENS[i%4],0,0.02,0,i*1.05+R(),0.25,0.22,0.1);break;
    case'clover':for(let i=0;i<16;i++){const cx=(R()-0.5)*0.75,cz=(R()-0.5)*0.75,y=0.04+R()*0.06,r0=R()*6.28;
        for(let j=0;j<3;j++)lf(p,GREENS[(i+j)%4],cx,y,cz,r0+j*2.09,0.12,0.1,0.09);}
      for(let j=0;j<4;j++)lf(f,col,0,0.14,0,j*1.571+0.3,0.15,0.13,0.11);f.push(P(ICO,cc,0,0.15,0,0,0,0,0.04,0.04,0.04));stemP(p,0x3d7a2c,0,0,0.14);break;
    case'mushroom':{const n=2+Math.floor(R()*3);
      for(let s=0;s<n;s++){const x=(R()-0.5)*0.42,z=(R()-0.5)*0.42,h=0.1+R()*0.16,r=0.13+R()*0.09;p.push(P(CYL8,0xf4ecd8,x,h/2,z,0,0,0,0.06+r*0.2,h,0.06+r*0.2));
        if(id==='morel'){for(let k=0;k<7;k++)f.push(P(ICO,k%2?col:dk,x+(R()-0.5)*0.06,h+k*0.035,z+(R()-0.5)*0.06,0,k,0,r*0.9-k*0.012,0.07,r*0.9-k*0.012));}
        else if(id==='chanterelle'){f.push(P(CONE8,col,x,h+0.02,z,Math.PI,0,0,r*1.8,0.12,r*1.8),P(CYL8,dk,x,h+0.08,z,0,0,0,r*1.8,0.02,r*1.8));}
        else{f.push(P(ICO,col,x,h+r*0.25,z,0,0,0,r*2,r*1.1,r*2),P(CYL8,dk,x,h+0.01,z,0,0,0,r*1.7,0.02,r*1.7));
          if(Pd.spots)for(let k=0;k<4;k++){const a=k*1.6+R();f.push(P(ICO,0xffffff,x+Math.sin(a)*r*0.5,h+r*0.7,z+Math.cos(a)*r*0.5,0,0,0,0.035,0.02,0.035));}}}
      for(let i=0;i<4;i++)lf(p,GREENS[i%4],0,0.02,0,i*1.6+R(),0.15,0.16,0.08);break;}
    case'fruit':p.push(P(TRUNK,0x7a5230,0,0.3,0,0,0,0,0.12,0.6,0.12));
      for(let i=0;i<5;i++){const a=i/5*6.283;p.push(P(ICO,GREENS[i%4],Math.sin(a)*0.2,0.72+(i%2)*0.1,Math.cos(a)*0.2,0,a,0,0.4,0.32,0.4));}p.push(P(ICO,0x6ab84a,0,0.92,0,0,0,0,0.42,0.3,0.42));
      for(let i=0;i<3;i++){const a=i*2.1+0.3;berries(f,col,dk,Math.sin(a)*0.32,0.58,Math.cos(a)*0.32,0.09,1,R);}break;
    case'ground':
      if(id==='pineapple'){for(let i=0;i<9;i++)lf(p,GREENS[i%4],0,0.03,0,i/9*6.283,0.55,0.3,0.07);f.push(P(ICO,col,0,0.2,0,0,0,0,0.24,0.34,0.24),P(ICO,dk,0.03,0.24,0.03,0,1,0,0.2,0.28,0.2));for(let i=0;i<6;i++)lf(p,0x4f9a3a,0,0.36,0,i*1.05,1.2,0.18,0.05);}
      else{for(let i=0;i<7;i++)lf(p,GREENS[i%4],0,0.02,0,i*0.9,0.2,0.24,0.12);for(let i=0;i<3;i++){const a=i*2.1;f.push(P(ICO,col,Math.sin(a)*0.12,0.08,Math.cos(a)*0.12,0,a,0,0.16,0.14,0.16),P(LEAF0,0xe8c898,Math.sin(a)*0.12,0.03,Math.cos(a)*0.12,0,0,0,0.1,0.04,0.1));}
        p.push(P(ICO,0x7ab84a,0.2,0.08,-0.1,0,0,0,0.18,0.14,0.18));for(let k=0;k<6;k++)p.push(P(CONE4,0x9ac86a,0.2+Math.sin(k)*0.09,0.1+Math.cos(k*2)*0.05,-0.1+Math.cos(k)*0.09,Math.cos(k),0,Math.sin(k),0.03,0.08,0.03));}break;
  }
  g.add(M(p));if(f.length){const m=M(f,Pd.glow?lumMat:vcMat);g.add(m);}return g;}
function plantEpoch(){return S.day*2+(isNight()?1:0);}
function spotPlant(isl,i){const ep=plantEpoch(),key=isl.id+':'+i;if(S.picked[key]===ep)return null;const R=mulberry(hi(isl.seed,i,ep));if(R()<0.22)return null;const night=isNight();
  return pickW(PLANTS,k=>{const p=PLANTS[k];return p.bio.includes(isl.biome)&&(!p.time||(p.time==='night')===night);},undefined,R);}
function syncPlants(isl){
  if(isl.pgroup){scene.remove(isl.pgroup);isl.pgroup.traverse(o=>{if(o.geometry)o.geometry.dispose();});isl.pgroup=null;}
  if(isl.home||!isl.spots)return;const g=new T.Group();
  isl.spots.forEach(([x,z],i)=>{const id=spotPlant(isl,i);if(!id)return;const m=plantGroup(id,hi(isl.seed,i));m.position.set(x,topY(x,z),z);m.rotation.y=hash(x,z)*6.28;m.userData={plant:{isl:isl.id,i,id},tile:{x,z}};g.add(m);});
  isl.pgroup=g;isl.pEpoch=plantEpoch();scene.add(g);}
function plantAt(x,z){const isl=islandAt(x,z);if(!isl||!isl.pgroup)return null;for(const m of isl.pgroup.children){const t=m.userData.tile;if(t.x===x&&t.z===z)return m.userData.plant;}return null;}
function pickPlant(pl){const isl=islands[pl.isl],[x,z]=isl.spots[pl.i],Pd=PLANTS[pl.id];S.picked[pl.isl+':'+pl.i]=plantEpoch();syncPlants(isl);walkTo(x,z);vil.hop=0.3;
  const first=gain('p:'+pl.id);burst(x,0.6,z,parseInt(Pd.col.slice(1),16),10,1.2,0.07);floatText(x,1.1,z,'+ '+Pd.name,Pd.w<5?'gold':'');addXP(Math.round(Pd.price/15)+2);
  if(Pd.w<5){SFX.rare();for(let i=0;i<10;i++)sparkle(x,0.6,z,0xfff0a0);toast(`You found a <b>${Pd.name}</b>! (${rarity(Pd.w)})${first?' <b>New!</b>':''}`,'rare',ICON['p:'+pl.id]);}
  else{SFX.harvest();if(first)toast(`New in your Islandex: <b>${Pd.name}</b>`,'',ICON['p:'+pl.id]);}}

/* =========================================================
   Bugs (not saved)
   ========================================================= */
const bugs=[];
function bugGroup(B){const g=new T.Group(),kind=B.kind||'fly',wm=B.glow?lumMat:vcMat;
  if(kind==='crawl'){const s=0.9,p=[P(ICO,B.col,0,0.07*s,0,0,0,0,0.2*s,0.12*s,0.26*s),P(BOX,B.dk,0,0.125*s,0,0,0,0,0.012,0.012,0.24*s),P(ICO,B.dk,0,0.06*s,0.15*s,0,0,0,0.11*s,0.08*s,0.09*s),
      P(LEAF0,0xffffff,0.05*s,0.12*s,0.04*s,0,0,0,0.05*s,0.02,0.07*s)];
    for(let i=0;i<3;i++)for(const sd of [-1,1])p.push(P(BOX,0x2b1e2e,sd*0.13*s,0.03,(i-1)*0.07*s,0,0,sd*0.5,0.12*s,0.012,0.012));
    if(B.name.includes('Rhino'))p.push(P(CONE6,B.dk,0,0.12*s,0.2*s,0.8,0,0,0.04,0.12*s,0.04));
    if(B.name.includes('Stag'))for(const sd of [-1,1])p.push(P(BOX,B.dk,sd*0.04*s,0.07*s,0.24*s,0,sd*0.4,0,0.02,0.02,0.1*s));
    if(B.name==='Ladybug')for(const [x,z] of [[0.05,0.03],[-0.05,0.03],[0.06,-0.07],[-0.06,-0.07]])p.push(P(ICO,0x2b1e2e,x*s,0.125*s,z*s,0,0,0,0.04*s,0.02,0.04*s));
    g.add(M(p,wm));g.userData={crawl:true};return g;}
  if(kind==='drag'){const body=[P(ICO,B.col,0,0,0.11,0,0,0,0.07,0.06,0.07),P(ICO,B.dk,0,0,0.04,0,0,0,0.05,0.05,0.08)];for(let k=0;k<5;k++)body.push(P(ICO,k%2?B.dk:B.col,0,0,-0.03-k*0.05,0,0,0,0.03,0.03,0.055));g.add(M(body));
    const wing=sd=>M([P(LEAF0,0xe8f4ff,sd*0.13,0.005,0.05,0,sd*0.12,0,0.24,0.01,0.05),P(LEAF0,0xe8f4ff,sd*0.12,0,-0.01,0,-sd*0.1,0,0.22,0.01,0.05),P(ICO,B.col,sd*0.24,0.008,0.055,0,0,0,0.02,0.01,0.015)],wm);
    const wl=wing(-1),wr=wing(1);g.add(wl,wr);g.userData={wl,wr,drag:true};return g;}
  const s=B.small?0.55:0.8;
  const body=[P(ICO,B.dk,0,0,0.05*s,0,0,0,0.05*s,0.05*s,0.05*s),P(ICO,B.dk,0,0,0,0,0,0,0.055*s,0.05*s,0.08*s),P(ICO,B.dk,0,-0.005,-0.09*s,0,0,0,0.045*s,0.04*s,0.13*s)];
  for(const sd of [-1,1])body.push(P(BOX,B.dk,sd*0.025*s,0.03*s,0.12*s,-0.6,sd*0.35,0,0.008,0.008,0.12*s),P(ICO,B.dk,sd*0.045*s,0.065*s,0.17*s,0,0,0,0.018*s,0.018*s,0.018*s));
  g.add(M(body,B.glow?lumMat:vcMat));
  const wing=sd=>M([P(ICO,B.col,sd*0.13*s,0,0.04*s,0,sd*0.35,0,0.22*s,0.012,0.16*s),P(ICO,B.col,sd*0.1*s,-0.002,-0.07*s,0,-sd*0.3,0,0.16*s,0.012,0.13*s),
    P(ICO,B.dk,sd*0.21*s,0.004,0.08*s,0,sd*0.35,0,0.08*s,0.012,0.07*s),P(ICO,B.dk,sd*0.15*s,0.004,-0.11*s,0,0,0,0.05*s,0.012,0.05*s),
    P(ICO,0xffffff,sd*0.22*s,0.007,0.1*s,0,0,0,0.02*s,0.01,0.02*s),P(ICO,0xffffff,sd*0.19*s,0.007,0.06*s,0,0,0,0.015*s,0.01,0.015*s)],wm);
  const wl=wing(-1),wr=wing(1);g.add(wl,wr);g.userData={wl,wr};return g;}
function spawnBug(){const isl=curIsl();if(!isl||!isl.grass.length)return;const night=isNight();if(S.rain&&!night)return;
  const near=bugs.filter(b=>b.isl===isl.id);if(near.length>=(night?3:5))return;
  const flowers=isl.home?S.objs.filter(o=>o.k==='flowers'):[];
  const id=pickW(BUGS,k=>(BUGS[k].time==='night')===night&&BUGS[k].bio.includes(isl.biome),(k,v)=>v.w*(v.w<5?0.45:1)*(v.w<10?1+flowers.length*0.2:1));if(!id)return;
  let hx,hz;if(flowers.length&&Math.random()<0.6){const f=pickR(flowers);hx=f.x;hz=f.z;}else[hx,hz]=pickR(isl.grass);
  const g=bugGroup(BUGS[id]);scene.add(g);g.position.set(hx,topY(hx,hz),hz);
  bugs.push({id,g,hx,hz,t:0,life:32+Math.random()*24,ph:Math.random()*6.28,out:0,isl:isl.id,crawl:BUGS[id].kind==='crawl'});}
function updateBugs(dt,tt){for(let i=bugs.length-1;i>=0;i--){const b=bugs[i];b.t+=dt;
    if(b.t>b.life||(isNight()!==(BUGS[b.id].time==='night')&&!b.out)||Math.hypot(b.hx-vil.x,b.hz-vil.z)>40)b.out=b.out||0.001;
    if(b.crawl){const x=b.hx+Math.sin(b.t*0.25+b.ph)*0.7,z=b.hz+Math.cos(b.t*0.2+b.ph*2)*0.7;const px=b.g.position.x,pz=b.g.position.z;
      b.g.position.set(x,(topY(Math.round(x),Math.round(z))||TOP.grass)+0.02,z);if(Math.hypot(x-px,z-pz)>1e-4)b.g.rotation.y=Math.atan2(x-px,z-pz);
      if(b.out){b.g.scale.setScalar(Math.max(0.01,1-b.out));b.out+=dt;if(b.out>1){scene.remove(b.g);bugs.splice(i,1);}}continue;}
    const x=b.hx+Math.sin(b.t*0.7+b.ph)*1.2+Math.sin(b.t*1.9)*0.3,z=b.hz+Math.cos(b.t*0.55+b.ph)*1.2;
    let y=(topY(Math.round(b.hx),Math.round(b.hz))||0.5)+0.55+Math.sin(b.t*2.3)*0.22;
    if(b.out){b.out+=dt;y+=b.out*b.out*2;if(b.out>3){scene.remove(b.g);bugs.splice(i,1);continue;}}
    const px=b.g.position.x,pz=b.g.position.z;b.g.position.set(x,y,z);if(Math.hypot(x-px,z-pz)>1e-4)b.g.rotation.y=Math.atan2(x-px,z-pz);
    const f=Math.sin(tt*(b.g.userData.drag?30:16)+b.ph)*(b.g.userData.drag?0.4:0.9);b.g.userData.wl.rotation.z=f;b.g.userData.wr.rotation.z=-f;}}
function catchBug(b){const B=BUGS[b.id];scene.remove(b.g);bugs.splice(bugs.indexOf(b),1);walkTo(b.g.position.x,b.g.position.z);vil.hop=0.3;
  const first=gain('b:'+b.id);burst(b.g.position.x,b.g.position.y,b.g.position.z,0xfff6e2,10,1.2,0.06,1);floatText(b.g.position.x,b.g.position.y+0.4,b.g.position.z,'+ '+B.name,B.w<5?'gold':'');
  addXP(Math.round(B.price/15)+1);if(B.w<5){SFX.rare();toast(`You caught a <b>${B.name}</b>! (${rarity(B.w)})${first?' <b>New!</b>':''}`,'rare',ICON['b:'+b.id]);}else if(first){SFX.catch();toast(`New in your Islandex: <b>${B.name}</b>`,'',ICON['b:'+b.id]);}else SFX.catch();}

/* =========================================================
   Crows (home only)
   ========================================================= */
let crow=null;
const crowG=new T.Group();
{crowG.add(M([P(BOX,0x1e1a26,0,0.12,0,0,0,0,0.16,0.14,0.28),P(BOX,0x1e1a26,0,0.24,0.15,0,0,0,0.13,0.12,0.13),P(BOX,0xe8b040,0,0.22,0.25,0,0,0,0.05,0.04,0.09),
  P(BOX,0xf4f0ea,0.066,0.26,0.18,0,0,0,0.01,0.03,0.03),P(BOX,0xf4f0ea,-0.066,0.26,0.18,0,0,0,0.01,0.03,0.03),P(BOX,0x2a2436,0,0.14,-0.2,0.3,0,0,0.12,0.03,0.14),
  P(BOX,0xe8b040,0.04,0.03,0,0,0,0,0.02,0.06,0.02),P(BOX,0xe8b040,-0.04,0.03,0,0,0,0,0.02,0.06,0.02)]));
  const wl=M([P(BOX,0x2a2436,-0.16,0,0,0,0,0,0.3,0.02,0.16)]),wr=M([P(BOX,0x2a2436,0.16,0,0,0,0,0,0.3,0.02,0.16)]);wl.position.y=wr.position.y=0.17;crowG.add(wl,wr);crowG.userData={wl,wr};crowG.scale.setScalar(1.4);crowG.visible=false;scene.add(crowG);}
function scared(x,z){return S.objs.some(o=>o.k==='scarecrow'&&Math.abs(o.x-x)<=3&&Math.abs(o.z-z)<=3);}
function spawnCrow(){if(crow||isNight()||fishing)return;const isl=curIsl();if(!isl||!isl.home)return;
  const c=Object.keys(S.tiles).filter(k=>{const t=S.tiles[k];if(!t.crop||t.crop.p>=1||t.crop.p<0.12)return false;const [x,z]=k.split(',').map(Number);return!scared(x,z);});
  if(c.length<2)return;const k=pickR(c);const [x,z]=k.split(',').map(Number);const a=Math.random()*6.28;
  crow={k,x,z,sx:x+Math.cos(a)*14,sz:z+Math.sin(a)*14,state:'in',t:0,warned:false};crowG.visible=true;SFX.caw();}
function updateCrow(dt,tt){if(!crow)return;crow.t+=dt;const {wl,wr}=crowG.userData;const y0=topY(crow.x,crow.z)+0.06;
  if(crow.state==='in'){const u=Math.min(1,crow.t/2.4);crowG.position.set(lerp(crow.sx,crow.x+0.2,u),lerp(7,y0+0.35,u)-Math.sin(u*Math.PI)*0.8*(1-u),lerp(crow.sz,crow.z+0.1,u));
    crowG.rotation.y=Math.atan2(crow.x-crow.sx,crow.z-crow.sz);const f=Math.sin(tt*14)*0.7;wl.rotation.z=f;wr.rotation.z=-f;if(u>=1){crow.state='peck';crow.t=0;}}
  else if(crow.state==='peck'){wl.rotation.z=0.1;wr.rotation.z=-0.1;const t=S.tiles[crow.k];
    crowG.position.y=y0+0.35+Math.abs(Math.sin(tt*9))*0.04;crowG.rotation.x=Math.sin(tt*9)>0.6?0.35:0;
    if(!crow.warned){crow.warned=true;SFX.caw();toast(`A crow is pecking at your ${t&&t.crop?CROPS[t.crop.t].name:'crops'} — tap it!`,'',ICON['g:feather']);}
    if(!t||!t.crop||t.crop.p>=1){crow.state='out';crow.t=0;}
    else if(crow.t>9){t.crop.p=Math.max(0.12,t.crop.p-0.25);syncCrop(crow.k);floatText(crow.x,1.1,crow.z,'-25% growth');SFX.caw();crow.state='out';crow.t=0;}}
  else{crowG.rotation.x=0;const u=crow.t/2.2;crowG.position.y+=dt*(2+u*6);crowG.position.x+=dt*4*Math.sin(crowG.rotation.y);crowG.position.z+=dt*4*Math.cos(crowG.rotation.y);
    const f=Math.sin(tt*16)*0.8;wl.rotation.z=f;wr.rotation.z=-f;if(u>=1){crow=null;crowG.visible=false;}}}
function shooCrow(){if(!crow||crow.state==='out')return;crow.state='out';crow.t=0;crowG.rotation.y+=Math.PI;SFX.caw();walkTo(crow.x,crow.z);vil.hop=0.3;
  burst(crowG.position.x,crowG.position.y,crowG.position.z,0x2a2436,8,1.4,0.07);floatText(crow.x,1.2,crow.z,'Shoo!');addXP(3);
  if(Math.random()<0.4){gain('g:feather');setTimeout(()=>floatText(crow.x,1.2,crow.z,'+ Crow Feather'),400);}}

