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
  berries:{name:'Raspberries',price:30,w:0,bio:['wild']},blackberries:{name:'Blackberries',price:35,w:0,bio:['wild']},huckleberries:{name:'Huckleberries',price:30,w:0,bio:['wild']},redcurrants:{name:'Red Currants',price:40,w:0,bio:['wild']},gooseberries:{name:'Gooseberries',price:35,w:0,bio:['wild']},cloudberries:{name:'Cloudberries',price:90,w:0,bio:['wild']},clover4:{name:'Four-leaf Clover',price:250,w:0,bio:['wild']},apple:{name:'Apple',price:35,w:0,bio:['wild']},pear:{name:'Pear',price:40,w:0,bio:['wild']},peach:{name:'Peach',price:45,w:0,bio:['wild']},cherries:{name:'Cherries',price:30,w:0,bio:['wild']},
  clam:{name:'Clam',price:45,w:0,bio:['wild']},geode:{name:'Geode',price:220,w:0,bio:['wild']},oldcoin:{name:'Old Coin',price:400,w:0,bio:['wild']},
  truffle:{name:'Truffle',price:600,w:0,bio:['wild']}});
// dig spots and clam bubbles live among the finds (so they're saved and drawn the same way) but aren't items themselves:
// they're kept out of the Islandex and item lists by being non-enumerable
// (and so are the island's little curiosities: something glinting in the grass, a tuft of long grass rustling on its own)
for(const [k,v] of [['dig',{name:'Dig Spot',price:0,w:0,bio:[]}],['bubbles',{name:'Bubbles',price:0,w:0,bio:[]}],['glint',{name:'Something glinting',price:0,w:0,bio:[]}],['tuft',{name:'Rustling grass',price:0,w:0,bio:[]}]])Object.defineProperty(FINDS,k,{value:v,enumerable:false});
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

// ---- berries: six kinds, each bush patch bearing its own (berryKindAt); a shaken bush sprays them out and they settle
// into a little heap on the grass, the heap being the find you pick up (BERRY_PILE: the same berries, where they land)
const BERRY_KINDS={berries:{col:0xe03a5a,dk:0xa81c3c,lit:0xf27a8e,dr:1},blackberries:{col:0x3a1e44,dk:0x1a0e22,lit:0x6a4a80,dr:1},cloudberries:{col:0xf4a03a,dk:0xd06a1e,lit:0xffd078,dr:1},
  huckleberries:{col:0x5a64b8,dk:0x2a2c6a,lit:0x9aa2e0},redcurrants:{col:0xe8202e,dk:0x9a0e1e,lit:0xff8a8a,cur:1},gooseberries:{col:0xb8d86a,dk:0x7a9a3a,lit:0xe8f4b0,goose:1}};
const BERRY_ORDER=[['berries',0.24],['blackberries',0.22],['huckleberries',0.2],['redcurrants',0.14],['gooseberries',0.12],['cloudberries',0.08]];
// bushes grow in patches of one kind (the patch: a few tiles across)
function berryKindAt(x,z){let h=hash(Math.floor(x/5)+((S.worldSeed|0)%977),Math.floor(z/5)-((S.worldSeed|0)%613));for(const [k,w] of BERRY_ORDER){if(h<w)return k;h-=w;}return'berries';}
// one berry, centred on (x,y,z), turned by a about its stem, scaled s: drupelet berries (raspberry, blackberry,
// cloudberry) a soft core studded with little beads, a tiny star of sepals on top; blueberry-like ones smooth with a
// crown; currants a glossy trio on a thread of stem; gooseberries big, pale and veined
function berryOne(k,p,x,y,z,s=1,a=0){const B=BERRY_KINDS[k]||BERRY_KINDS.berries,c=Math.cos(a),n=Math.sin(a),at=(dx,dy,dz)=>[x+(dx*c+dz*n)*s,y+dy*s,z+(-dx*n+dz*c)*s];
  if(B.dr){p.push(PG(SPH_LO,B.col,B.dk,...at(0,0,0),0,0,0,0.1*s,0.115*s,0.1*s));
    for(let i=0;i<14;i++){const t=Math.acos(1-2*(i+0.5)/14),f=i*2.4,r=0.052;if(t<0.5)continue;p.push(P(SPH_XS,i%3?B.col:B.lit,...at(Math.sin(t)*Math.cos(f)*r,Math.cos(t)*r*1.1,Math.sin(t)*Math.sin(f)*r),0,0,0,0.04*s,0.04*s,0.04*s));}
    for(let i=0;i<5;i++){const q=i*1.257;p.push(P(BOX,0x5a8a34,...at(Math.cos(q)*0.025,0.058,Math.sin(q)*0.025),0,-q-a,0.35,0.045*s,0.008*s,0.016*s));}return;}
  if(B.cur){p.push(P(CYL5,0x5a7a2a,...at(0,0.045,0),0,0,1.3,0.008*s,0.13*s,0.008*s));
    for(const [dx,dy,dz,r] of [[-0.04,0,0,0.05],[0.035,0.005,0.02,0.046],[0.005,0.01,-0.04,0.042]])p.push(PG(SPH_LO,B.lit,B.col,...at(dx,dy-0.01,dz),0,0,0,r*s,r*s,r*s),P(SPH_XS,0xffffff,...at(dx-0.012,dy+0.008,dz+0.012),0,0,0,0.014*s,0.014*s,0.014*s));return;}
  if(B.goose){p.push(PG(SPH_LO,B.lit,B.col,...at(0,0,0),0,a,0,0.12*s,0.11*s,0.105*s));for(let i=0;i<4;i++)p.push(P(BOX,B.dk,...at(0,0,0),0,a+i*0.785,0,0.122*s,0.112*s,0.004*s));
    p.push(P(CYL5,0x6a4a2a,...at(0,0.06,0),0,0,0,0.008*s,0.02*s,0.008*s));return;}
  p.push(PG(SPH_LO,B.lit,B.dk,...at(0,0,0),0,0,0,0.11*s,0.1*s,0.11*s),P(SPH_XS,0x2a2c4a,...at(0,0.046,0),0,0,0,0.035*s,0.014*s,0.035*s),P(SPH_XS,lerpHex(B.lit,0xffffff,0.5),...at(-0.025,0.03,0.02),0,0,0,0.03*s,0.02*s,0.03*s));}
// a heap of berries: five round the bottom, two resting on top ([x, centre height, z, turn])
const BERRY_PILE=[[0.075,0.05,0,0.3],[0.023,0.05,0.071,1.9],[-0.061,0.05,0.044,3.1],[-0.061,0.05,-0.044,4.2],[0.023,0.05,-0.071,5.4],[0.012,0.125,0.025,0.8],[-0.02,0.12,-0.03,2.6]];

// the 3D models for the new finds (findGroup, 74-life, falls back to these)
function forageParts(k,p){switch(k){
  case'mushroom':for(const [x,z,s] of [[0,0,1],[0.14,0.08,0.7],[-0.1,0.12,0.55]]){p.push(P(CYL6,0xf4ecd8,x,0.06*s,z,0,0,0,0.07*s,0.12*s,0.07*s),PG(SPH_LO,0xe84a3a,0xb02a24,x,0.14*s,z,0,0,0,0.26*s,0.14*s,0.26*s));
      for(let i=0;i<3;i++){const a=i*2.1+x*9;p.push(P(SPH_XS,0xffffff,x+Math.cos(a)*0.06*s,0.19*s,z+Math.sin(a)*0.06*s,0,0,0,0.05*s,0.03*s,0.05*s));}}break;
  case'acorn':for(const [x,z] of [[0,0],[0.12,0.07]]){p.push(PG(SPH_LO,0xc88a4a,0x8a5a2a,x,0.07,z,0,0,0,0.12,0.14,0.12),PG(SPH_LO,0x7a5230,0x5a3a22,x,0.13,z,0,0,0,0.13,0.06,0.13),P(CYL5,0x5a3a22,x,0.17,z,0,0,0,0.015,0.04,0.015));}break;
  case'pinecone':p.push(PG(SPH_LO,0xa87444,0x6a4428,0,0.08,0,1.3,0.4,0,0.14,0.24,0.14));for(let i=0;i<5;i++)p.push(P(CONE5,0x8a5a30,-0.06+i*0.03,0.1,0,1.3,0.4,0,0.1-i*0.01,0.05,0.1-i*0.01));break;
  case'berries':case'blackberries':case'huckleberries':case'redcurrants':case'gooseberries':case'cloudberries':for(const [x,y,z,a] of BERRY_PILE)berryOne(k,p,x,y,z,1,a);break;
  case'clover4':for(let i=0;i<4;i++){const a=i*1.571+0.4;p.push(P(SPH_LO,0x4fa84a,Math.cos(a)*0.06,0.08,Math.sin(a)*0.06,0,a,0,0.1,0.02,0.07));}p.push(P(CYL5,0x3d7a2c,0,0.04,0,0,0,0,0.012,0.08,0.012));
    p.push(P(SPH_XS,0xfff6c0,0,0.09,0,0,0,0,0.03,0.03,0.03));break;
  case'apple':case'pear':case'peach':case'cherries':{const q=fruitModel(k,null);for(const o of q)o.y+=k==='pear'?0.19:0.145;/* lying on the grass */p.push(...q);break;}
  case'clam':p.push(PG(SPH_LO,0xe8e0d4,0xa8a098,0,0.04,0,0,0,0,0.2,0.08,0.16));break;
  case'geode':p.push(PG(SPH,0xa8a4b4,0x6a6874,0,0.08,0,0,0,0,0.24,0.16,0.22),P(OCT,0xb88ae8,0.02,0.14,0.04,0.3,0.5,0,0.08,0.1,0.08));break;
  case'oldcoin':p.push(P(CYL8,0xe0b040,0,0.02,0,0,0,0,0.16,0.02,0.16),P(CYL8,0xc8952a,0,0.035,0,0,0,0,0.1,0.01,0.1));break;
  case'truffle':p.push(PG(SPH_LO,0x6a4a38,0x3a2a22,0,0.06,0,0,0,0,0.16,0.12,0.15));break;
  case'dig':for(let i=0;i<4;i++){const a=i*1.571+0.3;p.push(P(BOX,0x5a3a26,Math.cos(a)*0.08,0.012,Math.sin(a)*0.08,0,-a,0,0.16,0.012,0.035));}p.push(P(SPH_XS,0x6a4a30,0,0.012,0,0,0,0,0.1,0.02,0.1));break;
  case'glint':p.push(P(OCT,0xfff4c0,0,0.1,0,0,0.4,0,0.05,0.16,0.05),P(OCT,0xfff4c0,0,0.1,0,0,0.4,1.571,0.05,0.16,0.05),P(ICO2,0xfffbe8,0,0.1,0,0,0,0,0.07,0.07,0.07));break;
  case'tuft':for(let i=0;i<9;i++){const a=i*0.7,r=0.04+(i%3)*0.05;p.push(P(CONE5,i%2?0x7fbf4a:0x5f9f3a,Math.cos(a)*r,0.2+(i%3)*0.04,Math.sin(a)*r,Math.cos(a)*0.3,0,Math.sin(a)*0.3,0.07,0.42+(i%3)*0.08,0.07));}break;
  case'bubbles':for(const [x,z,s] of [[0,0,1],[0.1,0.06,0.6],[-0.07,0.09,0.5]])p.push(P(CYL8,0xf4f8fa,x,0.01,z,0,0,0,0.1*s,0.01,0.1*s),P(CYL8,0xc8a878,x,0.012,z,0,0,0,0.06*s,0.01,0.06*s));break;
  default:if(FINDS[k]&&FINDS[k].tpl)tplParts(FINDS[k],p);/* the Islandex extras (11-dex, 22b-dexart) */}}

// ---- where forage turns up ----
const CURIO=new Set(['dig','bubbles','glint','tuft']);
const forageOf=f=>f&&!FINDS[f.k]?.bio.includes('any')&&FINDS[f.k]?.bio.includes('wild')||f&&CURIO.has(f.k);
function forageSpawn(quiet,n=1){const isl=islands[0];if(!isl||!S.wild)return;const home=S.finds.filter(f=>forageOf(f));if(home.length>=36)return;
  const s=season(),R=Math.random,trees=S.debris.filter(d=>d.k==='tree'),bushes=S.debris.filter(d=>d.k==='bush');
  const openBy=(x,z)=>{for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){const a=x+dx,b=z+dz;if(landMap.get(K(a,b))==='grass'&&freeTile(a,b))return[a,b];}return null;};
  for(let i=0;i<n;i++){const r=R();let k=null,at=null;
    if(R()<0.22){const ex=FORAGE_EXTRA.filter(q=>dexOk(FINDS[q],isl)&&(!FINDS[q].rare||R()<0.25));if(ex.length){k=pickR(ex);if(FINDS[k].at==='tree'&&trees.length){const t=pickR(trees);at=openBy(t.x,t.z);}else{const c=pickR(isl.grass);if(c&&freeTile(...c)&&!TOWN.path.has(K(...c)))at=c;}
      if(k&&at&&!findAt(...at))S.finds.push({k,x:at[0],z:at[1],shiny:R()<0.05?1:undefined});continue;}}
    if(r<0.24&&trees.length&&s!=='winter'){const t=pickR(trees);at=openBy(t.x,t.z);k=R()<(s==='autumn'?0.5:0.8)?'mushroom':null;}
    else if(r<0.42&&trees.length){const t=pickR(trees);at=openBy(t.x,t.z);k=treeSp(t.v).con?'pinecone':'acorn';}
    else if(r<0.54&&bushes.length&&s!=='winter'){const b=pickR(bushes.filter(q=>q.v===2).length?bushes.filter(q=>q.v===2):bushes);at=openBy(b.x,b.z);k=berryKindAt(b.x,b.z);}
    else if(r<0.74){const c=pickR(isl.grass);if(c&&freeTile(...c)&&!TOWN.path.has(K(...c)))at=c;{const q=R();k=q<0.05?'clover4':q<0.4?'dig':q<0.7?'tuft':'glint';}}
    else{const c=pickR(isl.sand);if(c&&freeTile(...c))at=c;k='bubbles';}
    if(!k||!at||findAt(...at))continue;S.finds.push({k,x:at[0],z:at[1],shiny:!CURIO.has(k)&&R()<0.07?1:undefined});}
  if(S.finds.length>60)S.finds.splice(0,S.finds.length-60);
  if(!quiet)syncLife();}

// ---- shaking trees, rustling bushes, digging ----
const shakeLeft=(x,z)=>{const k='f'+K(x,z),sh=S.shook[k]||{d:-1,n:0};if(sh.d!==S.day){sh.d=S.day;sh.n=0;}S.shook[k]=sh;return sh;};
function dropFind(k,x,z){const at=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1]].map(([a,b])=>[x+a,z+b]).find(([a,b])=>isLand(a,b)&&freeTile(a,b));if(!at)return false;
  S.finds.push({k,x:at[0],z:at[1]});syncLife();for(let i=0;i<4;i++)sparkle(at[0],topY(...at)+0.3,at[1],0xfff6e2);return true;}
function spawnBugAt(x,z,crawl){const isl=curIsl();if(!isl)return;const ids=Object.keys(BUGS).filter(k=>(BUGS[k].kind==='crawl')===crawl&&BUGS[k].time!=='night'&&BUGS[k].bio.includes(isl.biome));if(!ids.length)return;
  const id=pickR(ids),g=bugGroup(BUGS[id]);g.scale.setScalar(BUG_SCALE);scene.add(g);g.position.set(x,topY(x,z)+(crawl?0:1.2),z);bugs.push({id,g,hx:x,hz:z,t:0,life:30+Math.random()*20,ph:Math.random()*6.28,out:0,isl:isl.id,crawl});}
function shakeTree(d){const x=d.x,z=d.z,y=topY(x,z),m=debMesh.get(K(x,z));if(m)m.shake=0.6;SFX.pop();noise(0.25,0.05,1400);
  const s=season(),sp=treeSp(d.v),con=sp.con,cols=con?[0x3e8a44,0x2a6a34]:s==='autumn'?[0xe8803a,0xf4a444]:s==='spring'&&(sp.id==='cherry'||sp.id==='peach')?[0xf8c8d8,0xffe4ee]:[0x6ab84a,0x4a9a3a];
  for(let i=0;i<10;i++)emit(x+(Math.random()-0.5)*1.2,y+1.4+Math.random()*0.5,z+(Math.random()-0.5)*1.2,{vx:(Math.random()-0.5)*0.6,vy:-0.3,vz:(Math.random()-0.5)*0.6,life:1.4,max:1.4,size:0.06,color:cols[i%2],g:0.6});
  if(fruitOn(d)&&m){dropTreeFruit(d,m);jrNote('shake');return;}// down comes the fruit
  const sh=shakeLeft(x,z);if(sh.n>=2){floatText(x,y+1.4,z,'rustle…');return;}sh.n++;jrNote('shake');
  const r=Math.random(),pine=con;
  if(r<0.3){dropFind(pine?'pinecone':'acorn',x,z);floatText(x,y+1.4,z,pine?'A pinecone!':'An acorn!');}
  else if(r<0.45){gain('m:wood');floatText(x,y+1.4,z,'+1 Wood (a branch)');}
  else if(r<0.72){spawnBugAt(x+(Math.random()-0.5),z+(Math.random()-0.5),true);floatText(x,y+1.4,z,'Something fell out!');}
  else if(r<0.84){critterAt('bird',x,z,true);floatText(x,y+1.4,z,'Tweet!');}
  else floatText(x,y+1.4,z,'rustle…');}
// fruit shaken loose: each one drops from where it hung, bounces once and rolls out onto a free tile round the tree,
// where it lies as a find to pick up. The tree grows new fruit a few days later (fruitOn, 74-life)
const fallers=[];
// where a find on (x,z) is drawn (syncLife, 74-life): nudged off the tile centre and turned, by the tile
const findPose=(x,z)=>[x+(hash(x,z)-0.5)*0.3,z+(hash(z,x)-0.5)*0.3,hash(x,z)*6.28];
// a falling piece: its mesh sits inside a pivot at its own centre (so it tumbles about itself) and lands exactly where,
// and as, the find it becomes is drawn; when every piece of a find has settled, the find takes its place in the same
// frame, so what fell is what you pick up. Pieces with nowhere to land roll a little way and fade.
function addFaller(o){const g=new T.Group(),m=M(o.parts);m.position.y=-o.cy;g.add(m);g.position.set(o.x,o.y,o.z);scene.add(g);
  const f=Object.assign({g,m,vx:0,vy:0,vz:0,st:0,t:0},o);delete f.parts;fallers.push(f);return f;}
function dropTreeFruit(d,e){const sp=treeSp(d.v),k=sp.fruit,x=d.x,z=d.z,sc=e.sc,w=e.vr?e.vr.w:1,h=e.vr?e.vr.h:1,c=Math.cos(e.r),s=Math.sin(e.r);
  (S.fruitT||(S.fruitT={}))[K(x,z)]=S.day;debLOD(e.gr);
  const tiles=shuffle([[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]].map(([a,b])=>[x+a,z+b]).filter(([a,b])=>isLand(a,b)&&freeTile(a,b)&&!findAt(a,b)&&!debrisAt(a,b)),Math.random);
  const slots=fruitSlots(d.v),R=mulberry(hi(d.v,93,S.worldSeed|0)),lift=k==='pear'?0.19:0.145,cy=k==='pear'?0.11:0.075;let n=0,nf=0;
  for(const [lx,ly,lz] of slots){const px=lx*sc*w,pz=lz*sc*w,wx=e.x+px*c+pz*s,wz=e.z-px*s+pz*c,wy=e.y+(ly+0.05)*sc*h;
    // the very fruit that hung there (its colour too), modelled as it will lie on the grass
    const r0=R(),fv=r0<0.35&&r0>=0.345?0.34:r0>=0.35&&r0<0.355?0.36:Math.round(r0*100)/100,parts=fruitModel(k,()=>fv);for(const o of parts)o.y+=lift;
    const t=tiles.length?tiles.shift():null,fp=t?findPose(t[0],t[1]):null;let tx,tz;if(fp){tx=fp[0];tz=fp[1];nf++;}else{const a=Math.random()*6.283;tx=wx+Math.cos(a)*0.4;tz=wz+Math.sin(a)*0.4;}
    addFaller({parts,cy:lift-cy,x:wx,y:wy-cy,z:wz,tx,tz,ty:lift-cy,ry:fp?fp[2]:Math.random()*6.28,find:t?{k,x:t[0],z:t[1],fv}:null,
      wait:0.05+n*0.12+Math.random()*0.1,spin:(Math.random()-0.5)*8,tb:0.34});n++;}
  floatText(x,topY(x,z)+1.6,z,nf?(nf>1?nf+' '+FINDS[k].name.toLowerCase()+(k==='cherries'?'':'s')+'!':'A '+FINDS[k].name.toLowerCase()+'!'):'The fruit rolled away…',nf?'gold':'');}
function updateFallers(dt){for(let i=fallers.length-1;i>=0;i--){const f=fallers[i],g=f.g;
  if(f.wait>0){f.wait-=dt;if(!f.berry)g.rotation.z=Math.sin(f.wait*40)*0.2;else g.visible=false;continue;}g.visible=true;// a wobble on its stem, then it lets go
  if(f.st<2){f.t+=dt;
    // the ground under it, plus how high its centre sits when it's lying where it'll stay
    const gy=topY(Math.round(f.x),Math.round(f.z))+f.ty;f.vy-=9.8*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.z+=f.vz*dt;
    if(f.st===0)g.rotation.x+=f.spin*dt;
    else{/* the bounce: turning to rest as it comes down */const q=Math.min(1,(f.t-f.t1)/f.tb);g.rotation.x=f.rx0*(1-q);g.rotation.z=f.rz0*(1-q);g.rotation.y=f.ry0+(f.ry-f.ry0)*q;}
    if(f.y<=gy){f.y=gy;
      if(f.st===0){f.st=1;f.t1=f.t;tone(420+Math.random()*120,0.05,'sine',0.05);burst(f.x,gy-f.ty,f.z,0x7aa84a,3,0.6,0.04);
        // bounce once, aimed so it comes down again just where it'll lie
        const tb=f.tb,ty=topY(Math.round(f.tx),Math.round(f.tz))+f.ty;f.vy=(ty-f.y)/tb+9.8*tb/2;f.vx=(f.tx-f.x)/tb;f.vz=(f.tz-f.z)/tb;
        const wrap=v=>Math.atan2(Math.sin(v),Math.cos(v));f.rx0=wrap(g.rotation.x);f.rz0=wrap(g.rotation.z);f.ry0=g.rotation.y;f.ry=f.ry0+wrap(f.ry-f.ry0);}
      else if(f.st===1&&f.t-f.t1>f.tb*0.5){f.st=2;f.vx=f.vy=f.vz=0;f.x=f.tx;f.z=f.tz;g.rotation.set(0,f.ry,0);tone(360,0.04,'sine',0.03);}}
    g.position.set(f.x,f.y,f.z);}
  if(f.st===2){
    if(!f.find){f.t2=(f.t2||0)+dt;g.scale.setScalar(Math.max(0.01,1-f.t2*2));if(f.t2>0.5){scene.remove(g);fallers.splice(i,1);}continue;}
    // the find appears the moment its last piece settles, and the pieces go in the same frame
    const q=f.find;if(fallers.some(o=>o.find===q&&o.st<2))continue;
    if(!findAt(q.x,q.z)){S.finds.push(q);syncLife();}
    for(let j=fallers.length-1;j>=0;j--)if(fallers[j].find===q){scene.remove(fallers[j].g);fallers.splice(j,1);}i=Math.min(i,fallers.length);}}}
// berries shaken loose: a little spray of them pops up out of the bush, falls, bounces once and settles into one or
// two heaps beside it (BERRY_PILE), each berry landing in its own place in the heap you then pick up
function dropBerries(x,z,k=berryKindAt(x,z)){const y=topY(x,z),tiles=shuffle([[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]].map(([a,b])=>[x+a,z+b]).filter(([a,b])=>isLand(a,b)&&freeTile(a,b)&&!findAt(a,b)&&!debrisAt(a,b)),Math.random).slice(0,Math.random()<0.45?2:1);
  if(!tiles.length)return 0;let i=0;
  for(const [a,b] of tiles){const find={k,x:a,z:b},[px,pz,pr]=findPose(a,b),c=Math.cos(pr),s=Math.sin(pr);
    for(const [bx,by,bz,ba] of BERRY_PILE){const parts=[];berryOne(k,parts,0,0,0,1,ba);
      const tx=px+bx*c+bz*s,tz=pz-bx*s+bz*c,an=Math.random()*6.283,sx=x+Math.cos(an)*0.25,sz=z+Math.sin(an)*0.25;
      const f=addFaller({parts,cy:0,x:sx,y:y+0.55,z:sz,tx,tz,ty:by,ry:pr,find,wait:i*0.05,spin:(Math.random()-0.5)*12,tb:0.26,berry:1});
      f.vx=(tx-sx)*0.9+(Math.random()-0.5)*0.6;f.vy=2.6+Math.random()*1.4;f.vz=(tz-sz)*0.9+(Math.random()-0.5)*0.6;i++;}}
  pluck(880,0.03,0.5);setTimeout(()=>pluck(1175,0.03,0.6),90);return tiles.length;}
function rustleBush(d){const x=d.x,z=d.z,y=topY(x,z),m=debMesh.get(K(x,z));if(m)m.shake=0.5;noise(0.2,0.05,1800);
  for(let i=0;i<6;i++)emit(x+(Math.random()-0.5)*0.6,y+0.5,z+(Math.random()-0.5)*0.6,{vx:(Math.random()-0.5)*0.8,vy:0.6,vz:(Math.random()-0.5)*0.8,life:0.8,max:0.8,size:0.05,color:0x5aa84a,g:2});
  const sh=shakeLeft(x,z);if(sh.n>=2){floatText(x,y+0.9,z,'rustle…');return;}sh.n++;jrNote('rustle');const s=season(),r=Math.random();
  if(d.v===2&&s!=='winter'&&r<0.85){const n=dropBerries(x,z);floatText(x,y+0.9,z,n?'Berries!':'The berries rolled away…',n?'gold':'');}
  else if(r<0.45){spawnBugAt(x,z,false);floatText(x,y+0.9,z,'A butterfly!');}
  else if(r<0.65&&s!=='winter'){critterAt(Math.random()<0.5?'frog':'rabbit',x,z,true);floatText(x,y+0.9,z,'Hop!');}
  else floatText(x,y+0.9,z,'rustle…');}
// what's under a dig spot or clam bubbles
function digSpot(f){S.finds=S.finds.filter(q=>q!==f);syncLife();jrNote('dig');const x=f.x,z=f.z,y=topY(x,z);SFX.till();burst(x,y+0.2,z,f.k==='bubbles'?0xe8d4a8:0x6a4a30,10,1.2,0.07);
  let k;const r=Math.random();
  if(f.map){k=pickR(['fossil','oldcoin','geode','arrowhead','sharktooth']);setTimeout(()=>stamp('Treasure!',`${FINDS[k].name} · the map was right`,true),600);}
  else if(f.k==='bubbles')k=r<0.05?'pearl':'clam';
  else k=r<0.26?'fossil':r<0.46?'geode':r<0.58?'oldcoin':r<0.66?'truffle':r<0.82?'clay':'seeds';
  if(k==='seeds'){const id=pickR(CROP_IDS.filter(i=>CROPS[i].lvl<=level()));S.free[id]=(S.free[id]||0)+2;floatText(x,y+0.9,z,'+2 '+CROPS[id].name+' seeds','gold');SFX.pop();return;}
  if(k==='clay'){gain('m:stone');floatText(x,y+0.9,z,'+1 Stone');SFX.pop();return;}
  const I=FINDS[k],key='g:'+k,first=gain(key);popHold(findGroup(k,x*7+z),x,z,1.4,y-0.12);/* up out of the hole */floatText(x,y+0.9,z,'+ '+I.name,I.price>=200?'gold':'');
  if(I.price>=200){SFX.rare();if(!first)toast(`You dug up ${/^[aeiou]/i.test(I.name)?'an':'a'} <b>${I.name}</b>!`,'rare',ICON[key]);}else SFX.harvest();}
let leafT=0;
function driftLeaves(dt){leafT-=dt;if(leafT>0)return;leafT=0.35+Math.random()*0.5;const s=season();if(s==='winter')return;
  const near=S.debris.filter(d=>d.k==='tree'&&Math.abs(d.x-vil.x)<11&&Math.abs(d.z-vil.z)<9);if(!near.length)return;const t=pickR(near),y=topY(t.x,t.z)+1.3*(t.sc||1);
  const col=s==='autumn'?pickR([0xe8803a,0xf4a444,0xc8402a]):s==='spring'&&(treeSp(t.v).id==='cherry'||treeSp(t.v).id==='peach')?pickR([0xf8c8d8,0xffe4ee]):pickR([0x6ab84a,0x8ad05a,0x4a9a3a]);
  emit(t.x+(Math.random()-0.5)*0.9,y,t.z+(Math.random()-0.5)*0.9,{vx:0.15,vy:-0.28,vz:0.05,life:5,max:5,size:0.055,color:col,g:0,sw:0.9,ph:Math.random()*6.28,spin:1});}
let forageT=5;
let forageOff=false; // (tests switch it off so nothing appears under their taps)
function updateForage(dt){updateTapRing(dt);if(!S.wild||S.sea||forageOff)return;driftLeaves(dt);forageT-=dt;if(forageT<=0){forageT=9+Math.random()*9;forageSpawn(false,1);}
  // bubbles fizz and dig spots glint now and then, so you notice them
  for(const f of S.finds){if(!CURIO.has(f.k))continue;if(Math.abs(f.x-vil.x)>18||Math.abs(f.z-vil.z)>18)continue;
    if(f.k==='bubbles'&&Math.random()<dt*1.5)emit(f.x+(Math.random()-0.5)*0.2,topY(f.x,f.z)+0.05,f.z+(Math.random()-0.5)*0.2,{vx:0,vy:0.5,vz:0,life:0.4,max:0.4,size:0.04,color:0xffffff,g:0});
    if(f.k==='dig'&&Math.random()<dt*0.25)sparkle(f.x,topY(f.x,f.z)+0.1,f.z,0xfff0c0);
    if(f.k==='glint'&&Math.random()<dt*0.9)sparkle(f.x+(Math.random()-0.5)*0.2,topY(f.x,f.z)+0.12+Math.random()*0.1,f.z+(Math.random()-0.5)*0.2,0xfff6c8);/* it catches the light */
    if(f.k==='tuft'&&Math.random()<dt*0.7)emit(f.x+(Math.random()-0.5)*0.3,topY(f.x,f.z)+0.35,f.z+(Math.random()-0.5)*0.3,{vx:(Math.random()-0.5)*0.6,vy:0.5,vz:(Math.random()-0.5)*0.6,life:0.6,max:0.6,size:0.04,color:0x7fbf4a,g:1.5});}}/* something's moving in there */
// tapping a curiosity: a glint turns out to be a little treasure; a rustling tuft hides a bug, a creature or a find
const GLINT_POOL=[['feather',22],['glass',16],['acorn',10],['oldcoin',10],['geode',9],['amber',8],['clover4',7],['starfrag',5],['pearl',3]];
function openGlint(f){S.finds=S.finds.filter(q=>q!==f);syncLife();let r=Math.random()*GLINT_POOL.reduce((a,q)=>a+q[1],0),k='feather';for(const [q,w] of GLINT_POOL){if(FINDS[q]&&(r-=w)<=0){k=q;break;}}
  pluck(1568,0.03,0.5);collectFind({k,x:f.x,z:f.z});}
function rustleTuft(f){S.finds=S.finds.filter(q=>q!==f);syncLife();const x=f.x,z=f.z,y=topY(x,z),r=Math.random();noise(0.25,0.05,2200);walkTo(x,z);
  for(let i=0;i<10;i++)emit(x+(Math.random()-0.5)*0.5,y+0.3,z+(Math.random()-0.5)*0.5,{vx:(Math.random()-0.5)*1.4,vy:1.2,vz:(Math.random()-0.5)*1.4,life:0.9,max:0.9,size:0.05,color:i%2?0x7fbf4a:0x5f9f3a,g:2.2});
  if(r<0.38&&season()!=='winter'){spawnBugAt(x,z,Math.random()<0.5);floatText(x,y+0.9,z,'Something was hiding!','gold');}
  else if(r<0.58&&season()!=='winter'){critterAt(pickR(['rabbit','frog','squirrel']),x,z,true);floatText(x,y+0.9,z,'Hop!');}
  else if(r<0.9){const k=pickR(['feather','clover4','mushroom','acorn','berries','glass']);if(FINDS[k])collectFind({k,x,z});}
  else floatText(x,y+0.9,z,'Just the wind…');}

// your first steps ashore: a glint, a rustling tuft and a dig spot a few paces from the landing beach, so there's
// something to wonder about straight away
function curioTrail(){if(S.trail||!S.wild)return;S.trail=1;const isl=islands[0],c=isl.grass.filter(([x,z])=>{const d=Math.hypot(x-DOCK.x,z-(DOCK.z-3));return d>2.5&&d<9&&freeTile(x,z)&&!findAt(x,z)&&!TOWN.path.has(K(x,z));});
  for(const k of ['glint','tuft','dig','glint']){if(!c.length)break;const [x,z]=c.splice(Math.floor(Math.random()*c.length),1)[0];S.finds.push({k,x,z});}}

// your first days: a soft ring pulses on the ground under the nearest thing you could tap (a find, a curiosity, a bush
// with berries, a tree with fruit, a bug), whenever you stand still, so it's clear the island is full of them
let tapRing=null;const _tr={x:0,z:0,a:0};
function updateTapRing(dt){if(!tapRing){tapRing=new T.Mesh(new T.RingGeometry(0.3,0.5,40).rotateX(-Math.PI/2),new T.MeshBasicMaterial({color:0xfffbe6,transparent:true,opacity:0,depthWrite:false,fog:false,blending:T.AdditiveBlending}));tapRing.renderOrder=4;scene.add(tapRing);}
  let best=null,bd=7.5;const idle=(vil.spd||0)<0.25&&!vil.path;
  if(S.day<=2&&S.wild&&!S.sea&&!inside&&!caught&&!S.sea&&idle&&!document.body.classList.contains('chatting')){
    const near=(x,z,y)=>{const d=Math.hypot(x-vil.x,z-vil.z);if(d>1.2&&d<bd){bd=d;best=[x,z,y];}};
    for(const f of S.finds)near(f.x,f.z);
    for(const d of S.debris){if(Math.abs(d.x-vil.x)>8||Math.abs(d.z-vil.z)>8)continue;if(d.k==='bush'&&d.v===2&&shakeLeft(d.x,d.z).n<2||d.k==='tree'&&fruitOn(d))near(d.x,d.z);}
    for(const b of bugs){const p=b.g.position;near(p.x,p.z);}if(S.bench&&craftableN())near(S.bench.x,S.bench.z);}
  const want=best?0.85:0;_tr.a+=(want-_tr.a)*Math.min(1,dt*4);
  if(best){if(_tr.a<0.05){_tr.x=best[0];_tr.z=best[1];}_tr.x+=(best[0]-_tr.x)*Math.min(1,dt*8);_tr.z+=(best[1]-_tr.z)*Math.min(1,dt*8);}
  const t=performance.now()/1000,p=0.5+0.5*Math.sin(t*3.2);tapRing.visible=_tr.a>0.02;tapRing.material.opacity=_tr.a*(0.5+0.5*p);
  tapRing.scale.setScalar(0.9+p*0.25);tapRing.position.set(_tr.x,topY(Math.round(_tr.x),Math.round(_tr.z))+0.04,_tr.z);}
