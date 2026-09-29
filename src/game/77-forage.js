/* =========================================================
   Foraging: the island is full of little things to find. Every morning (and now and then through the day) the land
   puts out forage where it belongs: mushrooms in the shade of the woods, acorns and pinecones under their trees, wild
   berries by the bushes, a four-leaf clover hiding in the meadow, cracked dig spots in the grass and clam bubbles on the
   sand. They're finds (S.finds), so tapping picks them up; dig spots and bubbles bring out the shovel instead.
   Tapping a wild tree with anything but the axe shakes it (AC style): leaves fall, and out might drop an acorn or a
   pinecone, a branch, an apple in summer, a beetle, or a startled bird. Tapping a bush rustles it: berries, a butterfly,
   or a frog hopping out. Each tree and bush gives a couple of surprises a day.
   ========================================================= */
Object.assign(FINDS,{
  mushroom:{name:'Forest Mushroom',price:40,w:0,bio:['wild']},acorn:{name:'Acorn',price:8,w:0,bio:['wild']},pinecone:{name:'Pinecone',price:10,w:0,bio:['wild']},
  berries:{name:'Wild Berries',price:30,w:0,bio:['wild']},clover4:{name:'Four-leaf Clover',price:250,w:0,bio:['wild']},apple:{name:'Apple',price:35,w:0,bio:['wild']},
  clam:{name:'Clam',price:45,w:0,bio:['wild']},geode:{name:'Geode',price:220,w:0,bio:['wild']},oldcoin:{name:'Old Coin',price:400,w:0,bio:['wild']},
  truffle:{name:'Truffle',price:600,w:0,bio:['wild']}});
// dig spots and clam bubbles live among the finds (so they're saved and drawn the same way) but aren't items themselves:
// they're kept out of the Islandex and item lists by being non-enumerable
for(const [k,v] of [['dig',{name:'Dig Spot',price:0,w:0,bio:[]}],['bubbles',{name:'Bubbles',price:0,w:0,bio:[]}]])Object.defineProperty(FINDS,k,{value:v,enumerable:false});
Object.assign(FIND_SPR,{
  'g:mushroom':['...rrrr...','..rwrrwr..','.rrrrrrwr.','.rwrrrrrr.','..RRRRRR..','....ww....','....ww....','...wwww...'],
  'g:acorn':['...BBBB...','..BbbbbB..','..BBBBBB..','...nnnn...','..nnnnnn..','..nnnnbn..','...nnbb...','....bb....'],
  'g:pinecone':['....G.....','...bnb....','..bnbnb...','..nbnbn...','..bnbnb...','..nbnbn...','...bnb....','....b.....'],
  'g:berries':['....g.....','...ggg....','..v.g.u...','.vVv.uUu..','.vvv.uuu..','..v.m.u...','...mMm....','...mmm....'],
  'g:clover4':['..ll.ll...','.lglglgl..','.lggGggl..','..lgGgl...','.lggGggl..','.lglglgl..','..ll.ll...','....G.....'],
  'g:apple':['.....G....','....bgg...','..rrbrr...','.rwrrrrr..','.rrrrrrr..','.rrrrrrR..','..rrrrR...','...RRR....'],
  'g:clam':['...eeee...','..eWWWWe..','.eWeWeWWe.','.eWeWeWeE.','.EEEEEEEE.','..EeeeeE..'],
  'g:geode':['...EEEE...','..EeeeeE..','.EemVmeeE.','.EmVcVmeE.','.EemVmeeE.','..EeeeeE..','...EEEE...'],
  'g:oldcoin':['...YYYY...','..YyyyyY..','.YyYYYYyY.','.YyYyyYyY.','.YyYYYYyY.','..YyyyyY..','...YYYY...'],
  'g:truffle':['...BBBB...','..BbBbbB..','.BbbbBbbB.','.BbBbbbBB.','.BBbbBbB..','..BBBBB...']});
for(const k of ['mushroom','acorn','pinecone','berries','clover4','apple','clam','geode','oldcoin','truffle'])ICON['g:'+k]=sprite(FIND_SPR['g:'+k]);

// the 3D models for the new finds (findGroup, 74-life, falls back to these)
function forageParts(k,p){switch(k){
  case'mushroom':for(const [x,z,s] of [[0,0,1],[0.14,0.08,0.7],[-0.1,0.12,0.55]]){p.push(P(CYL6,0xf4ecd8,x,0.06*s,z,0,0,0,0.07*s,0.12*s,0.07*s),PG(SPH_LO,0xe84a3a,0xb02a24,x,0.14*s,z,0,0,0,0.26*s,0.14*s,0.26*s));
      for(let i=0;i<3;i++){const a=i*2.1+x*9;p.push(P(SPH_XS,0xffffff,x+Math.cos(a)*0.06*s,0.19*s,z+Math.sin(a)*0.06*s,0,0,0,0.05*s,0.03*s,0.05*s));}}break;
  case'acorn':for(const [x,z] of [[0,0],[0.12,0.07]]){p.push(PG(SPH_LO,0xc88a4a,0x8a5a2a,x,0.07,z,0,0,0,0.12,0.14,0.12),PG(SPH_LO,0x7a5230,0x5a3a22,x,0.13,z,0,0,0,0.13,0.06,0.13),P(CYL5,0x5a3a22,x,0.17,z,0,0,0,0.015,0.04,0.015));}break;
  case'pinecone':p.push(PG(SPH_LO,0xa87444,0x6a4428,0,0.08,0,1.3,0.4,0,0.14,0.24,0.14));for(let i=0;i<5;i++)p.push(P(CONE5,0x8a5a30,-0.06+i*0.03,0.1,0,1.3,0.4,0,0.1-i*0.01,0.05,0.1-i*0.01));break;
  case'berries':bushClump(p,mulberry(7),[0x86c858,0x4a8a38,0x285a26],0.34);for(let i=0;i<7;i++){const a=i*0.9;p.push(P(SPH_XS,i%2?0x6a3a9a:0xd83848,Math.cos(a)*0.1,0.16+(i%3)*0.03,Math.sin(a)*0.1,0,0,0,0.06,0.06,0.06));}break;
  case'clover4':for(let i=0;i<4;i++){const a=i*1.571+0.4;p.push(P(SPH_LO,0x4fa84a,Math.cos(a)*0.06,0.08,Math.sin(a)*0.06,0,a,0,0.1,0.02,0.07));}p.push(P(CYL5,0x3d7a2c,0,0.04,0,0,0,0,0.012,0.08,0.012));
    p.push(P(SPH_XS,0xfff6c0,0,0.09,0,0,0,0,0.03,0.03,0.03));break;
  case'apple':p.push(PG(SPH_LO,0xe84a3a,0xa82a24,0,0.09,0,0,0,0,0.18,0.17,0.18),P(CYL5,0x6a4428,0,0.19,0,0,0,0.3,0.015,0.05,0.015),P(SPH_XS,0x5aa84a,0.03,0.2,0,0,0,0.6,0.06,0.02,0.04),P(SPH_XS,0xffffff,-0.04,0.13,0.05,0,0,0,0.04,0.03,0.03));break;
  case'clam':p.push(PG(SPH_LO,0xe8e0d4,0xa8a098,0,0.04,0,0,0,0,0.2,0.08,0.16));break;
  case'geode':p.push(PG(SPH,0xa8a4b4,0x6a6874,0,0.08,0,0,0,0,0.24,0.16,0.22),P(OCT,0xb88ae8,0.02,0.14,0.04,0.3,0.5,0,0.08,0.1,0.08));break;
  case'oldcoin':p.push(P(CYL8,0xe0b040,0,0.02,0,0,0,0,0.16,0.02,0.16),P(CYL8,0xc8952a,0,0.035,0,0,0,0,0.1,0.01,0.1));break;
  case'truffle':p.push(PG(SPH_LO,0x6a4a38,0x3a2a22,0,0.06,0,0,0,0,0.16,0.12,0.15));break;
  case'dig':for(let i=0;i<4;i++){const a=i*1.571+0.3;p.push(P(BOX,0x5a3a26,Math.cos(a)*0.08,0.012,Math.sin(a)*0.08,0,-a,0,0.16,0.012,0.035));}p.push(P(SPH_XS,0x6a4a30,0,0.012,0,0,0,0,0.1,0.02,0.1));break;
  case'bubbles':for(const [x,z,s] of [[0,0,1],[0.1,0.06,0.6],[-0.07,0.09,0.5]])p.push(P(CYL8,0xf4f8fa,x,0.01,z,0,0,0,0.1*s,0.01,0.1*s),P(CYL8,0xc8a878,x,0.012,z,0,0,0,0.06*s,0.01,0.06*s));break;}}

// ---- where forage turns up ----
const forageOf=f=>f&&!FINDS[f.k]?.bio.includes('any')&&FINDS[f.k]?.bio.includes('wild')||f&&(f.k==='dig'||f.k==='bubbles');
function forageSpawn(quiet,n=1){const isl=islands[0];if(!isl||!S.wild)return;const home=S.finds.filter(f=>forageOf(f));if(home.length>=26)return;
  const s=season(),R=Math.random,trees=S.debris.filter(d=>d.k==='tree'),bushes=S.debris.filter(d=>d.k==='bush');
  const openBy=(x,z)=>{for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){const a=x+dx,b=z+dz;if(landMap.get(K(a,b))==='grass'&&freeTile(a,b))return[a,b];}return null;};
  for(let i=0;i<n;i++){const r=R();let k=null,at=null;
    if(r<0.24&&trees.length&&s!=='winter'){const t=pickR(trees);at=openBy(t.x,t.z);k=R()<(s==='autumn'?0.5:0.8)?'mushroom':null;}
    else if(r<0.42&&trees.length){const t=pickR(trees);at=openBy(t.x,t.z);k=t.v%4===1?'pinecone':'acorn';}
    else if(r<0.54&&bushes.length&&s!=='winter'){const b=pickR(bushes);at=openBy(b.x,b.z);k='berries';}
    else if(r<0.74){const c=pickR(isl.grass);if(c&&freeTile(...c)&&!TOWN.path.has(K(...c)))at=c;k=R()<0.06?'clover4':'dig';}
    else{const c=pickR(isl.sand);if(c&&freeTile(...c))at=c;k='bubbles';}
    if(!k||!at||findAt(...at))continue;S.finds.push({k,x:at[0],z:at[1],shiny:k!=='dig'&&k!=='bubbles'&&R()<0.07?1:undefined});}
  if(S.finds.length>60)S.finds.splice(0,S.finds.length-60);
  if(!quiet)syncLife();}

// ---- shaking trees, rustling bushes, digging ----
const shakeLeft=(x,z)=>{const k='f'+K(x,z),sh=S.shook[k]||{d:-1,n:0};if(sh.d!==S.day){sh.d=S.day;sh.n=0;}S.shook[k]=sh;return sh;};
function dropFind(k,x,z){const at=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1]].map(([a,b])=>[x+a,z+b]).find(([a,b])=>isLand(a,b)&&freeTile(a,b));if(!at)return false;
  S.finds.push({k,x:at[0],z:at[1]});syncLife();for(let i=0;i<4;i++)sparkle(at[0],topY(...at)+0.3,at[1],0xfff6e2);return true;}
function spawnBugAt(x,z,crawl){const isl=curIsl();if(!isl)return;const ids=Object.keys(BUGS).filter(k=>(BUGS[k].kind==='crawl')===crawl&&BUGS[k].time!=='night'&&BUGS[k].bio.includes(isl.biome));if(!ids.length)return;
  const id=pickR(ids),g=bugGroup(BUGS[id]);g.scale.setScalar(BUG_SCALE);scene.add(g);g.position.set(x,topY(x,z)+(crawl?0:1.2),z);bugs.push({id,g,hx:x,hz:z,t:0,life:30+Math.random()*20,ph:Math.random()*6.28,out:0,isl:isl.id,crawl});}
function shakeTree(d){const x=d.x,z=d.z,y=topY(x,z),m=debMesh.get(K(x,z));if(m)m.shake=0.6;SFX.pop();noise(0.25,0.05,1400);
  const s=season(),cols=d.v%4===1?[0x3e8a44,0x2a6a34]:s==='autumn'?[0xe8803a,0xf4a444]:[0x6ab84a,0x4a9a3a];
  for(let i=0;i<10;i++)emit(x+(Math.random()-0.5)*1.2,y+1.4+Math.random()*0.5,z+(Math.random()-0.5)*1.2,{vx:(Math.random()-0.5)*0.6,vy:-0.3,vz:(Math.random()-0.5)*0.6,life:1.4,max:1.4,size:0.06,color:cols[i%2],g:0.6});
  const sh=shakeLeft(x,z);if(sh.n>=2){floatText(x,y+1.4,z,'rustle…');return;}sh.n++;jrNote('shake');
  const r=Math.random(),pine=d.v%4===1;
  if(r<0.3){dropFind(pine?'pinecone':'acorn',x,z);floatText(x,y+1.4,z,pine?'A pinecone!':'An acorn!');}
  else if(r<0.45){gain('m:wood');floatText(x,y+1.4,z,'+1 Wood (a branch)');}
  else if(r<0.58&&d.v%4===3&&s==='summer'){dropFind('apple',x,z);floatText(x,y+1.4,z,'An apple!','gold');}
  else if(r<0.72){spawnBugAt(x+(Math.random()-0.5),z+(Math.random()-0.5),true);floatText(x,y+1.4,z,'Something fell out!');}
  else if(r<0.84){critterAt('bird',x,z,true);floatText(x,y+1.4,z,'Tweet!');}
  else floatText(x,y+1.4,z,'rustle…');}
function rustleBush(d){const x=d.x,z=d.z,y=topY(x,z),m=debMesh.get(K(x,z));if(m)m.shake=0.5;noise(0.2,0.05,1800);
  for(let i=0;i<6;i++)emit(x+(Math.random()-0.5)*0.6,y+0.5,z+(Math.random()-0.5)*0.6,{vx:(Math.random()-0.5)*0.8,vy:0.6,vz:(Math.random()-0.5)*0.8,life:0.8,max:0.8,size:0.05,color:0x5aa84a,g:2});
  const sh=shakeLeft(x,z);if(sh.n>=2){floatText(x,y+0.9,z,'rustle…');return;}sh.n++;jrNote('rustle');const s=season(),r=Math.random();
  if(d.v===2&&s!=='winter'&&r<0.65){dropFind('berries',x,z);floatText(x,y+0.9,z,'Berries!','gold');}
  else if(r<0.45){spawnBugAt(x,z,false);floatText(x,y+0.9,z,'A butterfly!');}
  else if(r<0.65&&s!=='winter'){critterAt(Math.random()<0.5?'frog':'rabbit',x,z,true);floatText(x,y+0.9,z,'Hop!');}
  else floatText(x,y+0.9,z,'rustle…');}
// what's under a dig spot or clam bubbles
function digSpot(f){S.finds=S.finds.filter(q=>q!==f);syncLife();jrNote('dig');const x=f.x,z=f.z,y=topY(x,z);SFX.till();burst(x,y+0.2,z,f.k==='bubbles'?0xe8d4a8:0x6a4a30,10,1.2,0.07);
  let k;const r=Math.random();
  if(f.k==='bubbles')k=r<0.05?'pearl':'clam';
  else k=r<0.26?'fossil':r<0.46?'geode':r<0.58?'oldcoin':r<0.66?'truffle':r<0.82?'clay':'seeds';
  if(k==='seeds'){const id=pickR(CROP_IDS.filter(i=>CROPS[i].lvl<=level()));S.free[id]=(S.free[id]||0)+2;floatText(x,y+0.9,z,'+2 '+CROPS[id].name+' seeds','gold');SFX.pop();return;}
  if(k==='clay'){gain('m:stone');floatText(x,y+0.9,z,'+1 Stone');SFX.pop();return;}
  const I=FINDS[k],first=gain('g:'+k);popHold(findGroup(k,x*7+z),x,z,1.4,y-0.12);/* up out of the hole */floatText(x,y+0.9,z,'+ '+I.name,I.price>=200?'gold':'');
  if(I.price>=200){SFX.rare();if(!first)toast(`You dug up ${/^[aeiou]/i.test(I.name)?'an':'a'} <b>${I.name}</b>!`,'rare',ICON['g:'+k]);}else SFX.harvest();}
let leafT=0;
function driftLeaves(dt){leafT-=dt;if(leafT>0)return;leafT=0.35+Math.random()*0.5;const s=season();if(s==='winter')return;
  const near=S.debris.filter(d=>d.k==='tree'&&Math.abs(d.x-vil.x)<11&&Math.abs(d.z-vil.z)<9);if(!near.length)return;const t=pickR(near),y=topY(t.x,t.z)+1.3*(t.sc||1);
  const col=s==='autumn'?pickR([0xe8803a,0xf4a444,0xc8402a]):s==='spring'&&t.v%4===3?pickR([0xf8c8d8,0xffe4ee]):pickR([0x6ab84a,0x8ad05a,0x4a9a3a]);
  emit(t.x+(Math.random()-0.5)*0.9,y,t.z+(Math.random()-0.5)*0.9,{vx:0.15,vy:-0.28,vz:0.05,life:5,max:5,size:0.055,color:col,g:0,sw:0.9,ph:Math.random()*6.28,spin:1});}
let forageT=5;
let forageOff=false; // (tests switch it off so nothing appears under their taps)
function updateForage(dt){if(!S.wild||S.sea||forageOff)return;driftLeaves(dt);forageT-=dt;if(forageT<=0){forageT=9+Math.random()*9;forageSpawn(false,1);}
  // bubbles fizz and dig spots glint now and then, so you notice them
  for(const f of S.finds){if(f.k!=='bubbles'&&f.k!=='dig')continue;if(Math.abs(f.x-vil.x)>18||Math.abs(f.z-vil.z)>18)continue;
    if(f.k==='bubbles'&&Math.random()<dt*1.5)emit(f.x+(Math.random()-0.5)*0.2,topY(f.x,f.z)+0.05,f.z+(Math.random()-0.5)*0.2,{vx:0,vy:0.5,vz:0,life:0.4,max:0.4,size:0.04,color:0xffffff,g:0});
    if(f.k==='dig'&&Math.random()<dt*0.25)sparkle(f.x,topY(f.x,f.z)+0.1,f.z,0xfff0c0);}}
