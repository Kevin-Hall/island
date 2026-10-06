/* =========================================================
   Island ecosystems: every kind of island is its own little world, alive with things to find.
   - its own animals (ECO[kind].crit, read by critWant in 75-critters): sea turtles and parrots on tropical isles,
     penguins and arctic foxes in the snow, fire lizards on the volcano, ducks and frogs in the swamp, hedgehogs
     snuffling about at night, glowing snails among the giant mushrooms… New models here (turtle, penguin, fox,
     hedgehog, lizard, duck, snail; ECO_CRIT, ecoCritModel, ecoRig), the rest borrowed and recoloured (ecoMark).
     A few are rare (a golden hare, a white stag, an emperor penguin…) and sparkle so you notice them.
   - the Wildlife log: tap an animal to watch it quietly (obsTap, from tapLife). It goes in the Islandex's
     Wildlife tab (WILD, 'w:' keys; icons are little renders of the models), and now and then it leaves you a
     gift (GIFT).
   - forage that restocks every day (ecoStock): berries, nuts and mushrooms by the trees, feathers and eggs in the
     grass, treasures on the sand, dig spots, glints and rustling tufts; each kind of island has its own mix,
     including the new finds in 11-dex. They live in S.finds (tagged eco: island id) while you're there; S.eco
     remembers each island's list for the day and what you've already picked.
   - undergrowth (ecoFlora, from buildIsland): ferns, flowers, reeds, leaf litter, mushrooms, crystals, lollipops,
     drawn into one merged mesh per island so the ground is never bare.
   - things drifting in the air (ECO_MOTE): pollen, falling leaves, snow, embers, spores, petals, sparkles.
   ========================================================= */

// ---- the new animals: how they behave and where they live ----
Object.assign(CRIT,{turtle:{n:[0,0],flee:1.8,sp:0.22},penguin:{n:[0,0],flee:2.6,sp:0.45},fox:{n:[0,0],flee:4.5,sp:0.9},
  hedgehog:{n:[0,0],flee:1.8,sp:0.35},lizard:{n:[0,0],flee:2.4,sp:0.7},duck:{n:[0,0],flee:2.6,sp:0.5},snail:{n:[0,0],flee:1.2,sp:0.06}});
const isleBlocked=(x,z)=>{const i=islandAt(x,z);return !!(i&&!i.home&&i.blocked&&i.blocked.has(K(x,z)));};
const onSand=(x,z)=>landMap.get(K(x,z))==='sand'&&!objAt(x,z)&&!isleBlocked(x,z);
const nearSand=(x,z)=>[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>landMap.get(K(x+a,z+b))==='sand');
const ECO_CRIT={
  turtle:{hab:(x,z)=>onSand(x,z)||critGround(x,z)&&!!nearWater(x,z,1),flee:'hide'},
  penguin:{hab:(x,z)=>onSand(x,z)||critGround(x,z),flee:'run',run:2.2},
  fox:{hab:(x,z)=>critGround(x,z),flee:'run',run:4.2},
  hedgehog:{hab:(x,z)=>critGround(x,z),flee:'hide'},
  lizard:{hab:(x,z)=>critGround(x,z)||onSand(x,z),flee:'run',run:3.6},
  duck:{hab:(x,z)=>critGround(x,z)&&(!!nearWater(x,z,1)||nearSand(x,z)),flee:'run',run:1.6},
  snail:{hab:(x,z)=>critGround(x,z),flee:'hide'}};

// ---- each kind of island: who lives there ([by day, by night] near you), what grows, what drifts in the air ----
// forage: [find, weight, where] (t: by the trees, g: in the grass, s: on the sand, w: by the water)
const ECO={
  meadow:{birds:[0,1,2],rare:'rabbit',crit:{bird:[4,0],rabbit:[3,1],bee:[4,0],frog:[1,2],hedgehog:[0,2],fox:[0,1],duck:[2,0],snail:[1,1],squirrel:[1,0]},
    forage:[['berries',5,'g'],['puffball',3,'g'],['honeycomb',3,'t'],['wildgarlic',3,'t'],['larkegg',1,'g'],['clover4',1,'g'],['glint',2,'g'],['tuft',3,'g'],['dig',1,'g']],
    flora:['flowers','flowers','tall','fern'],fcol:[0xf6d04a,0xf4f4f0,0xe86a8a,0x9a7ae0],sand:['shells','beachgrass'],mote:'pollen'},
  tropic:{birds:[3,3,8],rareBird:4,crit:{bird:[4,0],crab:[4,3],turtle:[2,1],frog:[1,2],lizard:[2,0]},
    forage:[['mango',4,'t'],['parrotfeather',3,'t'],['seabean',3,'s'],['cowrie',3,'s'],['coralbranch',2,'s'],['bubbles',3,'s'],['glint',1,'g'],['dig',1,'g']],
    flora:['fern','fern','flowers','tall'],fcol:[0xf04a6a,0xf6a03a,0xf6e04a],sand:['shells','coralbits','beachgrass']},
  pine:{birds:[0,1,2],rare:'deer',crit:{bird:[3,0],squirrel:[3,0],deer:[1,0],fox:[1,1],hedgehog:[0,1],rabbit:[1,1]},
    forage:[['pinecone',5,'t'],['morel',3,'t'],['jayfeather',2,'t'],['lingonberry',4,'g'],['owlfeather',1,'t'],['truffle',1,'t'],['tuft',3,'g'],['dig',1,'g']],
    flora:['fern','fern','mush','rock'],fcol:[0xe84a3a],sand:['rocks']},
  autumn:{birds:[1,0],rare:'deer',crit:{bird:[3,0],squirrel:[2,0],fox:[1,1],hedgehog:[2,2],rabbit:[1,0],deer:[1,0]},
    forage:[['chestnut',4,'t'],['hazelnut',4,'t'],['mapleleaf',3,'t'],['chanterhome',2,'t'],['acorn',3,'t'],['goldleaf',1,'t'],['tuft',2,'g'],['dig',1,'g']],
    flora:['leaves','leaves','mush','tall'],fcol:[0xe8603a,0xf6a03a,0xc8402a],sand:['rocks'],mote:'leaf'},
  snow:{birds:[5,5,8],rare:'penguin',crit:{bird:[2,0],penguin:[4,2],rabbit:[2,1],fox:[1,1]},
    forage:[['icicle',3,'g'],['snowberry',4,'g'],['snowfeather',3,'g'],['snowquartz',2,'s'],['frostshell',2,'s'],['glint',2,'g'],['dig',1,'g']],
    flora:['snow','snow','rock','tall'],fcol:[0xd8303a],sand:['ice'],mote:'snow'},
  volcano:{birds:[6],rare:'lizard',crit:{bird:[2,0],lizard:[4,1],crab:[2,1]},
    forage:[['sulfur',4,'g'],['firepepper',4,'g'],['pumice',3,'s'],['obsidianshard',3,'s'],['glint',2,'g'],['dig',2,'g']],
    flora:['ember','rock','ash'],fcol:[0xff7a2a],sand:['rocks'],mote:'ember'},
  swamp:{birds:[0,2],rare:'frog',crit:{frog:[4,4],duck:[3,0],snail:[2,2],bird:[2,0],turtle:[1,0]},
    forage:[['bogmyrtle',4,'w'],['heronfeather',3,'w'],['snailshell',3,'g'],['bogoak',2,'s'],['bubbles',2,'s'],['mushroom',2,'g'],['tuft',3,'g']],
    flora:['reed','reed','fern','mush'],fcol:[0xf6d04a,0xe8e0f0],sand:['reeds'],mote:'midge'},
  crystal:{birds:[5],crit:{lizard:[3,1],snail:[1,1],bird:[2,0]},
    forage:[['prismshard',5,'g'],['geode',3,'g'],['dewpearl',1,'g'],['snowquartz',2,'s'],['glint',3,'g'],['dig',1,'g']],
    flora:['crystal','crystal','tall'],fcol:[0xc8a8ff,0x8ae0f0,0xf0b8f0],sand:['crystal'],mote:'sparkle'},
  shroom:{birds:[2],crit:{snail:[3,3],frog:[2,2],hedgehog:[1,2],rabbit:[1,0]},
    forage:[['glowspore',4,'g'],['mushroom',4,'g'],['truffle',2,'g'],['puffball',3,'g'],['morel',2,'g'],['tuft',2,'g']],
    flora:['mush','mush','fern','glowmush'],fcol:[0xb070e0,0xf06a8a,0xf6c040],sand:['rocks'],mote:'spore'},
  candy:{birds:[7],crit:{rabbit:[3,1],snail:[2,1],bird:[3,0],bee:[3,0]},
    forage:[['wildgumdrop',5,'g'],['peppermint',4,'g'],['honeycomb',2,'g'],['glint',3,'g'],['dig',1,'g']],
    flora:['lolly','lolly','flowers'],fcol:[0xf870a8,0x7ad8f0,0xf6e060,0xa0f0b0],sand:['sprinkles'],mote:'sugar'},
  bloom:{birds:[1,2,7],rare:'rabbit',crit:{bee:[6,0],bird:[3,0],rabbit:[2,1],hedgehog:[1,1],snail:[1,1]},
    forage:[['rosepetal',4,'g'],['nectar',4,'g'],['honeycomb',3,'g'],['clover4',1,'g'],['berries',3,'g'],['tuft',2,'g']],
    flora:['flowers','flowers','flowers','tall'],fcol:[0xf870a8,0xf6d04a,0xffffff,0xa070e0,0xf08a3a],sand:['shells'],mote:'petal'},
  coral:{birds:[8,8,3],rare:'crab',crit:{crab:[5,3],turtle:[3,1],bird:[3,0]},
    forage:[['coralbranch',4,'s'],['pinkpearl',1,'s'],['cowrie',3,'s'],['scallop',3,'s'],['bubbles',3,'s'],['seabean',2,'s'],['glint',1,'g']],
    flora:['coralbush','fern','tall'],fcol:[0xf07aa0,0xf6a0b8,0xf6c0a0],sand:['coralbits','shells']},
  neon:{birds:[6],crit:{frog:[3,3],lizard:[2,1],bird:[2,0]},
    forage:[['glowpebble',5,'g'],['voltberry',4,'g'],['marble',1,'g'],['glint',3,'g'],['dig',1,'g']],
    flora:['neongrass','neongrass','crystal'],fcol:[0xff40d0,0x40f0ff,0xb060ff],sand:['crystal'],mote:'sparkle'}};
// birds: more colourings for the songbird model (75-critters), by palette index
CRIT_COLS.bird.push([0xe0402a,0xf6c83a,0x2a5ac0],[0x4ac04a,0xf08a2a,0x3a4ae0],[0xf4f4f0,0xffffff,0x3a3a40],[0x2a2a34,0x3a3a48,0x14141a],[0xf8a0c8,0xfff0f8,0xc86a9a],[0xf4f4f4,0xffffff,0x8a8a9a]);
const BIRD_SP=['sparrow','robin','bluebird','macaw','lorikeet','bunting','raven','sugarfinch','gull'];

// ---- the wildlife log (an Islandex category) ----
const WILD={
  sparrow:{name:'House Sparrow',k:'bird',v:0,w:20,bio:['home','meadow','pine','swamp']},
  robin:{name:'Robin',k:'bird',v:1,w:16,bio:['home','meadow','pine','autumn','bloom']},
  bluebird:{name:'Bluebird',k:'bird',v:2,w:14,bio:['home','meadow','pine','swamp','shroom','bloom']},
  macaw:{name:'Scarlet Macaw',k:'bird',v:3,w:12,bio:['tropic','coral']},
  lorikeet:{name:'Rainbow Lorikeet',k:'bird',v:4,w:2,bio:['tropic'],rare:1},
  bunting:{name:'Snow Bunting',k:'bird',v:5,w:14,bio:['snow','crystal']},
  raven:{name:'Raven',k:'bird',v:6,w:12,bio:['volcano','neon']},
  sugarfinch:{name:'Sugar Finch',k:'bird',v:7,w:12,bio:['candy','bloom']},
  gull:{name:'Seagull',k:'bird',v:8,w:16,bio:['tropic','snow','coral']},
  rabbit:{name:'Wild Rabbit',k:'rabbit',v:0,w:18,bio:['home','meadow','pine','autumn','shroom','bloom']},
  snowhare:{name:'Snowshoe Hare',k:'rabbit',v:0,w:12,bio:['snow'],rec:'white'},
  goldhare:{name:'Golden Hare',k:'rabbit',v:99,w:2,bio:['meadow','bloom'],rec:'gold',rare:1},
  candybunny:{name:'Cotton Candy Bunny',k:'rabbit',v:1,w:10,bio:['candy'],rec:'pink'},
  squirrel:{name:'Red Squirrel',k:'squirrel',v:0,w:16,bio:['home','meadow','pine','autumn']},
  deer:{name:'Roe Deer',k:'deer',v:0,w:8,bio:['home','pine','autumn']},
  whitestag:{name:'White Stag',k:'deer',v:99,w:1.5,bio:['pine','autumn'],rec:'white',rare:1},
  frog:{name:'Green Frog',k:'frog',v:0,w:16,bio:['home','meadow','tropic','swamp','shroom']},
  dartfrog:{name:'Blue Dart Frog',k:'frog',v:99,w:2,bio:['swamp'],rec:'blue',rare:1},
  neonfrog:{name:'Neon Frog',k:'frog',v:1,w:10,bio:['neon'],rec:'neon'},
  crab:{name:'Shore Crab',k:'crab',v:0,w:18,bio:['home','tropic','volcano','coral']},
  goldcrab:{name:'Golden Crab',k:'crab',v:99,w:2,bio:['coral'],rec:'gold',rare:1},
  bee:{name:'Honeybee',k:'bee',v:0,w:18,bio:['home','meadow','candy','bloom']},
  turtle:{name:'Sea Turtle',k:'turtle',v:0,w:10,bio:['tropic','coral','swamp']},
  penguin:{name:'Little Penguin',k:'penguin',v:0,w:14,bio:['snow']},
  emperor:{name:'Emperor Penguin',k:'penguin',v:99,w:2,bio:['snow'],rare:1},
  fox:{name:'Red Fox',k:'fox',v:0,w:8,bio:['meadow','pine','autumn']},
  arcticfox:{name:'Arctic Fox',k:'fox',v:0,w:8,bio:['snow']},
  hedgehog:{name:'Hedgehog',k:'hedgehog',v:0,w:10,bio:['meadow','pine','autumn','shroom','bloom']},
  gecko:{name:'Day Gecko',k:'lizard',v:0,w:12,bio:['tropic']},
  firelizard:{name:'Fire Lizard',k:'lizard',v:0,w:12,bio:['volcano']},
  salamander:{name:'Ember Salamander',k:'lizard',v:99,w:2,bio:['volcano'],rare:1},
  crystalizard:{name:'Crystal Lizard',k:'lizard',v:0,w:10,bio:['crystal']},
  neongecko:{name:'Neon Gecko',k:'lizard',v:0,w:10,bio:['neon']},
  duck:{name:'Mallard',k:'duck',v:0,w:14,bio:['meadow','swamp']},
  snail:{name:'Garden Snail',k:'snail',v:0,w:14,bio:['meadow','swamp','crystal','bloom']},
  glowsnail:{name:'Glow Snail',k:'snail',v:0,w:10,bio:['shroom']},
  candysnail:{name:'Candy Snail',k:'snail',v:0,w:10,bio:['candy']}};
DEX_CATS.splice(DEX_CATS.findIndex(c=>c[0]==='finds'),0,['wild','Wildlife','w:',WILD]);
// what each one might leave behind when you've watched it
const GIFT={sparrow:['gullfeather'],robin:['jayfeather'],bluebird:['jayfeather'],macaw:['parrotfeather'],lorikeet:['parrotfeather','pinkpearl'],bunting:['snowfeather'],
  raven:['oldcoin','button','marble'],sugarfinch:['peppermint'],gull:['gullfeather','shell'],rabbit:['clover4','wildgarlic'],snowhare:['snowberry'],goldhare:['clover4','goldleaf'],
  candybunny:['wildgumdrop'],squirrel:['acorn','hazelnut','chestnut'],deer:['antler'],whitestag:['antler','dewpearl'],frog:['bogmyrtle','dewpearl'],dartfrog:['dewpearl'],
  neonfrog:['glowpebble'],crab:['cowrie','scallop'],goldcrab:['pearl','pinkpearl'],bee:['honeycomb'],turtle:['scute'],penguin:['frostshell'],emperor:['snowquartz','frostshell'],
  fox:['oldcoin','button','marble'],arcticfox:['snowquartz','button'],hedgehog:['mushroom','truffle'],gecko:['seabean'],firelizard:['obsidianshard','pumice'],
  salamander:['sulfur','obsidianshard'],crystalizard:['prismshard'],neongecko:['glowpebble'],duck:['duckfeather'],snail:['snailshell'],glowsnail:['glowspore'],candysnail:['peppermint']};

let ECO_FORCE;/* (a kind of island to draw the animals for, when making the log's pictures) */
const ecoKindHere=()=>{if(ECO_FORCE!==undefined)return ECO_FORCE;const i=S.sea?null:curIsl();return i?isleKindOf(i):null;};
function ecoRoster(){const k=ecoKindHere();return k&&ECO[k]?ECO[k].crit:null;}
// a new animal's variant: its island's birds; now and then the rare one (99)
function ecoV(k){const kind=ecoKindHere(),E=kind&&ECO[kind];
  if(k==='bird'){if(!E)return Math.floor(Math.random()*3);if(E.rareBird!=null&&Math.random()<0.06)return E.rareBird;return pickR(E.birds);}
  if(E&&E.rare===k&&Math.random()<0.07)return 99;return Math.floor(Math.random()*3);}
function ecoSpecies(k,v,kind){const rare=v===99;
  switch(k){
    case'bird':return BIRD_SP[v]||'sparrow';
    case'rabbit':return kind==='snow'?'snowhare':kind==='candy'?'candybunny':rare?'goldhare':'rabbit';
    case'deer':return rare?'whitestag':'deer';
    case'frog':return kind==='neon'?'neonfrog':rare?'dartfrog':'frog';
    case'crab':return rare?'goldcrab':'crab';
    case'penguin':return rare?'emperor':'penguin';
    case'fox':return kind==='snow'?'arcticfox':'fox';
    case'lizard':return kind==='volcano'?(rare?'salamander':'firelizard'):kind==='crystal'?'crystalizard':kind==='neon'?'neongecko':'gecko';
    case'snail':return kind==='shroom'?'glowsnail':kind==='candy'?'candysnail':'snail';
    default:return k;}}
// recolour a borrowed model for its island (a white hare in the snow, a golden one, a blue dart frog…)
const _rc=new T.Color(),_rh={};
const RECOL={gold:h=>{h.h=0.12;h.s=0.85;h.l=Math.min(0.68,h.l*0.7+0.22);},white:h=>{h.s*=0.12;h.l=0.72+h.l*0.26;},pink:h=>{h.h=0.93;h.s=Math.max(h.s,0.55);h.l=h.l*0.5+0.4;},
  blue:h=>{h.h=0.58;h.s=0.85;h.l=Math.max(0.35,h.l);},neon:h=>{h.h=h.l>0.6?0.85:0.47;h.s=0.9;h.l=Math.min(0.62,Math.max(0.45,h.l));}};
function ecoRecolor(g,rec){const f=RECOL[rec];if(!f)return;g.traverse(o=>{const a=o.isMesh&&o.geometry&&o.geometry.attributes.color;if(!a)return;
  o.geometry=o.geometry.clone();const c=o.geometry.attributes.color;
  for(let i=0;i<c.count;i++){_rc.setRGB(c.getX(i),c.getY(i),c.getZ(i)).getHSL(_rh);if(_rh.l<0.16||(_rh.s<0.12&&_rh.l>0.9))continue;/* eyes and highlights stay */f(_rh);_rc.setHSL(_rh.h,_rh.s,_rh.l);c.setXYZ(i,_rc.r,_rc.g,_rc.b);}
  c.needsUpdate=true;});}
// a freshly spawned animal: what it is, dressed for its island
function ecoMark(c){const kind=ecoKindHere();c.sp=ecoSpecies(c.k,c.v,kind);const W=WILD[c.sp];if(!W)return;
  if(W.rec&&!ECO_CRIT[c.k])ecoRecolor(c.g,W.rec);if(W.rare)c.rare=1;if(c.sp==='emperor')c.sc*=1.3;}

// ---- the models (built facing +z, feet at y=0) ----
function ecoCritModel(k,v){const g=new T.Group(),kind=ecoKindHere(),sp=ecoSpecies(k,v,kind),p=[],gl=[];
  const eye=(q,x,y,z,s)=>q.push(P(SPH_XS,0x2a2230,x,y,z,0,0,0,s,s,s),P(SPH_XS,0xffffff,x+s*0.2,y+s*0.25,z+s*0.3,0,0,0,s*0.35,s*0.35,s*0.35));
  const U={rig:1};
  switch(k){
    case'turtle':{const sh=0x6a8a4a,dk=0x3a5a2a,sk=0x9ab87a;
      p.push(PG(SPH,sh,dk,0,0.12,0,0,0,0,0.38,0.22,0.46),P(CYL12,dk,0,0.06,0,0,0,0,0.42,0.04,0.5));
      for(const [x,z] of [[0,0],[0.09,0.09],[-0.09,0.09],[0.09,-0.09],[-0.09,-0.09]])p.push(P(SPH_LO,0x8aa85a,x,0.2+(x||z?-0.02:0.01),z,0,0,0,0.11,0.04,0.11));
      for(const sx of [-1,1])for(const sz of [-1,1])p.push(P(SPH_LO,sk,sx*0.2,0.04,sz*0.14,0,sx*sz*0.5,0,0.16,0.04,0.08));
      p.push(P(CONE4,sk,0,0.05,-0.25,-1.57,0,0,0.04,0.08,0.04));
      const hq=[PG(SPH_LO,sk,0x6a8a5a,0,0.1,0.29,0,0,0,0.13,0.11,0.15)];eye(hq,0.045,0.13,0.34,0.022);eye(hq,-0.045,0.13,0.34,0.022);
      U.head=rpiv(g,0,0.1,0.22,hq);break;}
    case'penguin':{const bk=0x2a2e3a,dk=0x14161e,bl=0xf6f4ee,emp=v===99;
      p.push(PG(SPH,bk,dk,0,0.22,0,0,0,0,0.26,0.4,0.24),P(SPH_LO,bl,0,0.2,0.05,0,0,0,0.21,0.32,0.19),P(SPH,bk,0,0.44,0.02,0,0,0,0.2,0.19,0.19),
        P(SPH_LO,bl,0,0.43,0.07,0,0,0,0.13,0.1,0.12),P(CONE5,0xf0a030,0,0.43,0.15,1.57,0,0,0.035,0.08,0.03));
      eye(p,0.045,0.46,0.11,0.02);eye(p,-0.045,0.46,0.11,0.02);
      for(const s of [-1,1])p.push(P(BOX,0xf0a030,s*0.05,0.01,0.06,0,0,0,0.07,0.02,0.09));
      if(emp)for(const s of [-1,1])p.push(P(SPH_LO,0xf6c040,s*0.08,0.38,0.07,0,0,0,0.06,0.08,0.05));
      U.wings=[-1,1].map(s=>rpiv(g,s*0.12,0.32,0,[PG(SPH_LO,bk,dk,s*0.14,0.22,0,0,0,0,0.05,0.24,0.12)]));break;}
    case'fox':{const arc=sp==='arcticfox',c=arc?0xf2f2f6:0xd8682a,dk=arc?0xb8bccc:0x8a3a1a,w=arc?0xffffff:0xf4ece0,lg=arc?0xc8ccd8:0x3a2420;
      p.push(PG(SPH,c,dk,0,0.19,0,0,0,0,0.21,0.2,0.38),P(SPH_LO,w,0,0.17,0.13,0,0,0,0.14,0.14,0.15),P(SPH_LO,w,0,0.13,0,0,0,0,0.15,0.08,0.26));
      const hq=[PG(SPH_LO,c,dk,0,0.31,0.22,0,0,0,0.16,0.14,0.15),P(CONE5,w,0,0.29,0.32,1.57,0,0,0.06,0.12,0.05),P(SPH_XS,0x2a2230,0,0.29,0.385,0,0,0,0.03,0.025,0.025)];
      for(const s of [-1,1])hq.push(P(CONE4,c,s*0.055,0.4,0.2,0,0,-s*0.2,0.05,0.1,0.03),P(CONE4,lg,s*0.055,0.4,0.212,0,0,-s*0.2,0.025,0.06,0.01));
      eye(hq,0.05,0.33,0.285,0.02);eye(hq,-0.05,0.33,0.285,0.02);U.head=rpiv(g,0,0.27,0.16,hq);
      U.legs=[[0.07,0.12],[-0.07,0.12],[0.07,-0.12],[-0.07,-0.12]].map(([x,z])=>rpiv(g,x,0.13,z,[P(SCYL,lg,x,0.06,z,0,0,0,0.06,0.12,0.06),P(SPH_XS,lg,x,0.01,z+0.02,0,0,0,0.065,0.03,0.08)]));
      U.tail=rpiv(g,0,0.22,-0.16,[PG(SPH_LO,c,dk,0,0.24,-0.31,0.4,0,0,0.1,0.1,0.24),P(SPH_LO,w,0,0.28,-0.44,0.4,0,0,0.07,0.07,0.08)]);break;}
    case'hedgehog':{const sp0=0x8a6a4a,dk=0x4a3424,fc=0xe8d0b0;
      p.push(PG(SPH,sp0,dk,0,0.1,-0.02,0,0,0,0.26,0.18,0.3));
      for(let j=0;j<4;j++)for(let i=-2;i<=2;i++){const x=i*0.05,z=0.06-j*0.06,y=0.17-Math.abs(i)*0.025-j*0.012;if(Math.abs(i)===2&&j===0)continue;
        p.push(P(CONE4,j%2?dk:0x6a5038,x,y,z,-1.05,0,-x*5,0.05,0.13,0.05));}
      p.push(P(SPH_LO,fc,0,0.08,0.13,0,0,0,0.15,0.11,0.13),P(CONE5,fc,0,0.07,0.21,1.57,0,0,0.06,0.08,0.05),P(SPH_XS,0x2a2230,0,0.07,0.25,0,0,0,0.03,0.025,0.025));
      eye(p,0.04,0.11,0.18,0.018);eye(p,-0.04,0.11,0.18,0.018);
      for(const s of [-1,1])for(const z of [0.08,-0.1])p.push(P(SPH_XS,dk,s*0.08,0.015,z,0,0,0,0.05,0.03,0.06));break;}
    case'lizard':{const pal={gecko:[0x5ac84a,0x2a7a2a,0xf04a3a],firelizard:[0xe86a2a,0x3a2020,0xf6c040],salamander:[0xf03a2a,0x1a1418,0xf6e040],
        crystalizard:[0x9a8af0,0x5a4ab0,0x8ae0f0],neongecko:[0x40d8f0,0x2a2a5a,0xff40d0]}[sp]||[0x5ac84a,0x2a7a2a,0xf04a3a],[c,dk,b]=pal,glow=sp==='salamander'||sp==='neongecko';
      p.push(PG(SPH,c,dk,0,0.06,0,0,0,0,0.13,0.08,0.32),P(SPH_LO,c,0,0.07,0.21,0,0,0,0.11,0.07,0.13));eye(p,0.045,0.1,0.23,0.018);eye(p,-0.045,0.1,0.23,0.018);
      for(const s of [-1,1])for(const z of [0.09,-0.08])p.push(P(SPH_LO,c,s*0.1,0.03,z,0,0,0,0.07,0.04,0.05),P(SPH_XS,dk,s*0.13,0.01,z+0.015,0,0,0,0.045,0.02,0.045));
      for(let i=0;i<4;i++)(glow?gl:p).push(P(SPH_XS,b,(i%2?0.03:-0.03),0.1,0.1-i*0.07,0,0,0,0.035,0.02,0.035));
      U.tail=rpiv(g,0,0.05,-0.14,[PG(CONE5,c,dk,0,0.05,-0.33,-1.57,0,0,0.07,0.38,0.05)]);break;}
    case'duck':{const b=0x9a8a78,dk=0x6a5a4a,h=0x2a7a4a;
      p.push(PG(SPH,b,dk,0,0.14,0,0,0,0,0.24,0.19,0.34),P(CONE4,dk,0,0.18,-0.18,-2.2,0,0,0.08,0.12,0.06),P(CYL8,0xffffff,0,0.24,0.11,0.3,0,0,0.11,0.02,0.11));
      for(const s of [-1,1])p.push(P(SPH_LO,0x7a6a5a,s*0.1,0.17,-0.02,0,0,0,0.06,0.1,0.22),P(SPH_LO,0x3a5ac0,s*0.125,0.17,-0.06,0,0,0,0.02,0.04,0.06),P(BOX,0xf0a030,s*0.05,0.01,0.03,0,0,0,0.06,0.02,0.08));
      const hq=[PG(SPH_LO,h,0x1a4a2a,0,0.32,0.15,0,0,0,0.15,0.15,0.15),P(BOX,0xf0b030,0,0.3,0.25,0,0,0,0.08,0.03,0.1)];eye(hq,0.05,0.34,0.2,0.02);eye(hq,-0.05,0.34,0.2,0.02);
      U.head=rpiv(g,0,0.25,0.12,hq);break;}
    case'snail':{const pal={glowsnail:[0x9a6af0,0x5a3ab0,0xa0d0f0],candysnail:[0xf870a8,0xf8e8f0,0xa8f0d0]}[sp]||[0xc8905a,0x7a4a2a,0xb8a890],[sh,dk,bd]=pal,glow=sp==='glowsnail';
      p.push(P(SPH_LO,bd,0,0.035,0.03,0,0,0,0.12,0.06,0.32),P(SPH_LO,bd,0,0.06,0.16,0,0,0,0.08,0.08,0.08));
      for(const s of [-1,1])p.push(P(CYL5,bd,s*0.025,0.11,0.17,0.3,0,-s*0.2,0.012,0.08,0.012),P(SPH_XS,0x2a2230,s*0.035,0.15,0.18,0,0,0,0.025,0.025,0.025));
      (glow?gl:p).push(PG(SPH,sh,dk,0,0.13,-0.04,0,0,0,0.12,0.2,0.2));
      for(const s of [-1,1])p.push(P(CYL8,dk,s*0.062,0.13,-0.04,0,0,1.57,0.13,0.008,0.13),P(SPH_LO,lerpHex(sh,0xffffff,0.3),s*0.064,0.135,-0.035,0,0,0,0.02,0.07,0.07));break;}
  }
  g.add(M(p));if(gl.length)g.add(M(gl,lumMat));g.userData=U;return rigDone(g);}

// ---- how they move ----
function ecoRig(c,dt,tt){const g=c.g,u=g.userData,k=c.k,T0=c.t,E=ECO_CRIT[k];let hop=0,sq=1;
  if(c.state==='idle'){c.wait-=dt;if(c.wait<=0)critWander(c);}
  if(c.state==='move'){const dx=c.tx-c.x,dz=c.tz-c.z,d=Math.hypot(dx,dz);
    if(d<0.05){c.state='idle';c.wait=1.5+Math.random()*4;c.bt=0;}
    else{turnTo(g,Math.atan2(dx,dz),k==='lizard'?18:6,dt);const st=Math.min(d,CRIT[k].sp*dt);c.x+=dx/d*st;c.z+=dz/d*st;c.wp=(c.wp||0)+dt*(k==='snail'?3:10);c.y=critY(c.x,c.z);}}
  else if(c.state==='flee'){
    if(E.flee==='hide'){c.hid=Math.min(1,(c.hid||0)+dt*5);if(T0>3.5){c.state='idle';c.wait=2;c.calm=1.5;}}// tucks in and waits for you to go
    else{const go=!(k==='penguin'&&T0<0.35);if(k==='penguin'&&T0>0.35)c.slide=Math.min(1,(c.slide||0)+dt*5);// a penguin flops onto its belly and toboggans off
      turnTo(g,Math.atan2(c.fx,c.fz),10,dt);if(go){const sp=E.run*(c.slide?1.6:1);c.x+=c.fx*sp*dt;c.z+=c.fz*sp*dt;}c.wp=(c.wp||0)+dt*16;c.y=critY(c.x,c.z);
      if(k==='duck'&&T0>0.7){c.fly=(c.fly||0)+dt;c.y+=c.fly*c.fly*2;}// and takes off
      if(T0>(k==='lizard'?1.1:k==='duck'?2:2.4))c.state='gone';}}
  if(c.state!=='flee'&&c.hid>0)c.hid=Math.max(0,c.hid-dt*2);
  const mv=c.state==='move'||c.state==='flee'&&E.flee!=='hide',ph=c.wp||0,hid=c.hid||0,idle=c.state==='idle';
  if(idle){c.bt=(c.bt||0)-dt;if(c.bt<=0){c.bt=1+Math.random()*3;c.beh=Math.random();c.ly=(Math.random()-0.5)*1.4;}}
  switch(k){
    case'turtle':u.head.scale.setScalar(Math.max(0.2,1-hid*0.8));dmp(u.head.rotation,'x',idle?Math.sin(tt*1.3+c.ph)*0.15:0,4,dt);sq=1-hid*0.12;hop=mv?Math.abs(Math.sin(ph))*0.012:0;break;
    case'penguin':dmp(g.rotation,'z',mv&&!c.slide?Math.sin(ph)*0.2:0,14,dt);dmp(g.rotation,'x',(c.slide||0)*1.35,10,dt);hop=mv&&!c.slide?Math.abs(Math.sin(ph))*0.03:-(c.slide||0)*0.06;
      u.wings.forEach((w,i)=>{const sd=i?1:-1,flap=c.slide||idle&&c.beh>0.7;w.rotation.z=sd*(0.15+(flap?0.5+Math.sin(tt*24)*0.4:0));});break;
    case'fox':u.legs.forEach((l,i)=>dmp(l.rotation,'x',mv?Math.sin(ph*(c.state==='flee'?1.6:1)+(i%2?Math.PI:0)+(i<2?0:Math.PI/2))*0.7:0,20,dt));
      u.tail.rotation.y=Math.sin(tt*(mv?9:2.5)+c.ph)*(mv?0.2:0.35);dmp(u.head.rotation,'y',idle&&c.beh>0.5?c.ly:0,5,dt);dmp(u.head.rotation,'x',idle&&c.beh<0.25?0.6:0,5,dt);
      hop=mv?Math.abs(Math.sin(ph))*0.03:0;break;
    case'hedgehog':sq=1-hid*0.28;dmp(g.rotation,'x',hid*0.5,8,dt);hop=mv?Math.abs(Math.sin(ph*1.5))*0.01:idle&&c.beh>0.6?Math.max(0,Math.sin(tt*14))*0.008:0;break;
    case'lizard':u.tail.rotation.y=Math.sin(ph*1.4)*(mv?0.55:0.08);g.rotation.z=mv?Math.sin(ph*1.4)*0.06:0;
      hop=idle&&c.beh>0.6?Math.max(0,Math.sin(tt*9+c.ph))*0.025:0;break;// little push-ups
    case'duck':dmp(g.rotation,'z',mv&&!c.fly?Math.sin(ph)*0.16:0,14,dt);dmp(u.head.rotation,'x',idle&&c.beh>0.6?0.9:0,6,dt);hop=mv&&!c.fly?Math.abs(Math.sin(ph))*0.02:0;break;
    case'snail':sq=mv?1+Math.sin(ph)*0.05:1-hid*0.15;break;}
  return[hop,sq];}

// ---- watching an animal: the Wildlife log ----
function obsTap(cx,cy){let best=null,bd=46;
  for(const c of critters){if(c.state==='gone'||c.climb)continue;const s=toScreen(c.x,c.y+0.15,c.z),d=Math.hypot(s[0]-cx,s[1]-cy);if(d<bd){bd=d;best=c;}}
  if(!best)return false;const c=best;c.calm=Math.max(c.calm||0,6);
  const d=Math.hypot(c.x-vil.x,c.z-vil.z),near=Math.max((CRIT[c.k]||{flee:2}).flee+0.6,2);
  if(d>near+4){const dx=c.x-vil.x,dz=c.z-vil.z;goTo(c.x-dx/d*(near+0.5),c.z-dz/d*(near+0.5),()=>ecoWatch(c));}else ecoWatch(c);
  return true;}
function ecoWatch(c){if(!critters.includes(c)||c.state==='gone'){say('It slipped away…');return;}
  villager.rotation.y=Math.atan2(c.x-vil.x,c.z-vil.z);c.calm=4;
  const sp=c.sp||(c.sp=ecoSpecies(c.k,c.v,ecoKindHere())),W=WILD[sp];if(!W)return;const key='w:'+sp,first=!S.alm[key];S.alm[key]=(S.alm[key]||0)+1;statBump('watch');
  for(let i=0;i<6;i++)sparkle(c.x,c.y+0.2,c.z,W.rare?0xfff0a0:0xfffbe8);
  floatText(c.x,c.y+0.7,c.z,first?'New! '+W.name:W.name,first||W.rare?'gold':'');
  if(first){SFX.discover();toast(`You watched ${/^[aeiou]/i.test(W.name)?'an':'a'} <b>${W.name}</b>${W.rare?', a rare sight':''}! It's in your Islandex now, under Wildlife.`,W.rare?'rare':'',ICON[key]);addXP(W.rare?40:8);setTimeout(()=>checkDex(key),500);}
  else{SFX.pop();addXP(1);}
  if(!c.gifted&&Math.random()<(first?0.6:0.3)){c.gifted=1;const gk=pickR((GIFT[sp]||[]).filter(q=>FINDS[q]));
    if(gk)setTimeout(()=>{if(dropFind(gk,Math.round(c.x),Math.round(c.z)))floatText(c.x,c.y+0.9,c.z,'It left you something!','gold');},900);}
  save();updateHUD();}
// the log's pictures: little renders of the animals themselves
for(const k in WILD)Object.defineProperty(ICON,'w:'+k,{configurable:true,enumerable:true,get(){const W=WILD[k];
  ECO_FORCE=W.bio[0]==='home'?null:W.bio[0];let g;try{g=critModel(W.k,W.v);}finally{ECO_FORCE=undefined;}if(W.rec&&!ECO_CRIT[W.k])ecoRecolor(g,W.rec);
  const w=new T.Group();w.add(g);g.rotation.y=0.6;const v=snapThumb(w,64);Object.defineProperty(ICON,'w:'+k,{value:v,writable:true,configurable:true,enumerable:true});return v;}});
// for the chart and the landing toast
const ecoSpeciesOf=kind=>Object.keys(WILD).filter(s=>WILD[s].bio.includes(kind));
function ecoLine(isl){const kind=isleKindOf(isl);if(!kind)return'';const L=ecoSpeciesOf(kind);return `wildlife ${L.filter(s=>S.alm['w:'+s]).length}/${L.length}`;}
function ecoBlurb(isl){const kind=isleKindOf(isl);if(!kind)return'';const L=ecoSpeciesOf(kind).filter(s=>!WILD[s].rare).slice(0,3).map(s=>{const n=WILD[s].name;return(/^[aeiou]/i.test(n)?'an ':'a ')+n;});
  return L.length?`You might spot ${L.length>1?L.slice(0,-1).join(', ')+' or '+L[L.length-1]:L[0]} here.`:'';}

// ---- forage that restocks every day ----
function ecoForage(isl){const kind=isleKindOf(isl),E=ECO[kind];if(!E)return[];const R=mulberry(hi(isl.seed,S.day,77));
  const spots=new Set((isl.spots||[]).map(([x,z])=>K(x,z))),nodes=new Set((isl.nodes||[]).map(n=>K(n.x,n.z)));
  const ok=(x,z)=>freeTile(x,z)&&!isleBlocked(x,z)&&!spots.has(K(x,z))&&!nodes.has(K(x,z));
  const grass=isl.grass.filter(([x,z])=>ok(x,z)),sand=isl.sand.filter(([x,z])=>ok(x,z));
  const byTree=grass.filter(([x,z])=>nearTree(x,z,1)),byWater=grass.filter(([x,z])=>nearWater(x,z,1)||nearSand(x,z));
  const n=Math.max(6,Math.min(isl.grand?20:14,Math.round((grass.length+sand.length)*0.07))),tot=E.forage.reduce((a,f)=>a+f[1],0),out=[],used=new Set();
  for(let i=0;i<n*4&&out.length<n;i++){let r=R()*tot,f=E.forage[0];for(const q of E.forage)if((r-=q[1])<=0){f=q;break;}
    if((f[0]==='dig'||f[0]==='larkegg'||f[0]==='pinkpearl')&&out.some(o=>o[0]===f[0]))continue;/* (one of each of those a day) */
    const pool=f[2]==='t'?(byTree.length?byTree:grass):f[2]==='s'?(sand.length?sand:grass):f[2]==='w'?(byWater.length?byWater:grass):grass;if(!pool.length)continue;
    const [x,z]=pool[Math.floor(R()*pool.length)];if(used.has(K(x,z)))continue;used.add(K(x,z));out.push([f[0],x,z]);}
  return out;}
let ecoAt=null,ecoSyncT=0;
function ecoStock(isl){S.eco=S.eco||{};let e=S.eco[isl.id];if(!e||e.d!==S.day)e=S.eco[isl.id]={d:S.day,list:null,got:[]};
  S.finds=S.finds.filter(f=>f.eco==null);if(!e.list)e.list=ecoForage(isl);
  e.list.forEach(([k,x,z],i)=>{if(!e.got.includes(i)&&FINDS[k]&&!findAt(x,z))S.finds.push({k,x,z,eco:isl.id,ei:i});});
  ecoAt=isl.id;syncLife();
  if(!S.ecoTip&&e.list.length){S.ecoTip=1;setTimeout(()=>toast('Every island has its own forage, restocked each morning, and its own animals. Tap an animal to watch it quietly.','',ICON.dex),2500);}}
function ecoSync(){if(ecoAt==null)return;const e=S.eco&&S.eco[ecoAt];if(!e||!e.list)return;const here=new Set(S.finds.filter(f=>f.eco===ecoAt).map(f=>f.ei));
  e.list.forEach((_,i)=>{if(!here.has(i)&&!e.got.includes(i))e.got.push(i);});}

// ---- undergrowth ----
function floraParts(t,R,cols,p,gl){const col=()=>cols.length?cols[Math.floor(R()*cols.length)]:0xf6d04a,gr=[0x5a9a3a,0x4a8a34,0x6aa844][Math.floor(R()*3)];
  const frond=(a,len,c)=>p.push(...shift([PG(SPH_LO,c,lerpHex(c,0x1a3a1a,0.4),0,0.06,len*0.5,-0.35,0,0,0.07,0.02,len)],0,0,0,a));
  switch(t){
    case'flowers':{const n=3+Math.floor(R()*3),c=col();for(let i=0;i<n;i++){const x=(R()-0.5)*0.4,z=(R()-0.5)*0.4,h=0.1+R()*0.1;
      p.push(P(CYL5,0x4a8a3a,x,h/2,z,0,0,0,0.014,h,0.014),P(ICO0,i%3===2?col():c,x,h,z,0,R()*3,0,0.08,0.035,0.08),P(SPH_XS,0xf6e080,x,h+0.02,z,0,0,0,0.025,0.02,0.025));}break;}
    case'tall':for(let i=0;i<5;i++){const a=R()*6.28,r=R()*0.1;p.push(P(CONE4,i%2?gr:lerpHex(gr,0xd8e080,0.3),Math.cos(a)*r,0.15+R()*0.06,Math.sin(a)*r,(R()-0.5)*0.4,a,(R()-0.5)*0.4,0.05,0.32+R()*0.14,0.04));}break;
    case'fern':{const n=5+Math.floor(R()*2),c=lerpHex(gr,0x2a6a2a,0.3);for(let i=0;i<n;i++)frond(i/n*6.28+R()*0.3,0.18+R()*0.08,c);break;}
    case'mush':{const c=col();for(let i=0;i<2+Math.floor(R()*2);i++){const x=(R()-0.5)*0.35,z=(R()-0.5)*0.35,s=0.6+R()*0.6;
      p.push(P(CYL6,0xf4ecd8,x,0.04*s,z,0,0,0,0.04*s,0.08*s,0.04*s),PG(SPH_LO,c,lerpHex(c,0x000000,0.3),x,0.09*s,z,0,0,0,0.13*s,0.07*s,0.13*s),P(SPH_XS,0xffffff,x+0.02*s,0.12*s,z,0,0,0,0.025*s,0.015*s,0.025*s));}break;}
    case'glowmush':{const c=col();for(let i=0;i<3;i++){const x=(R()-0.5)*0.35,z=(R()-0.5)*0.35,s=0.6+R()*0.5;
      p.push(P(CYL6,0xe8e0f0,x,0.05*s,z,0,0,0,0.04*s,0.1*s,0.04*s));gl.push(P(SPH_LO,c,x,0.11*s,z,0,0,0,0.14*s,0.07*s,0.14*s));}break;}
    case'rock':p.push(PG(ICO0,0x9a9ea8,0x6a6e78,0,0.05,0,R(),R(),0,0.24,0.14,0.2),P(SPH_LO,0x5a8a3a,0,0.11,0,0,0,0,0.14,0.03,0.12));if(R()<0.5)p.push(P(ICO0,0x8a8e98,0.14,0.03,0.08,R(),R(),0,0.1,0.07,0.09));break;
    case'leaves':for(let i=0;i<5;i++)p.push(P(BOX,col(),(R()-0.5)*0.5,0.012,(R()-0.5)*0.5,(R()-0.5)*0.3,R()*3,0,0.09,0.01,0.06));break;
    case'snow':p.push(P(SPH_LO,0xf4f8ff,0,0.03,0,0,0,0,0.3,0.08,0.24));for(let i=0;i<2;i++)p.push(P(CYL5,0x6a5040,(R()-0.5)*0.2,0.1,(R()-0.5)*0.2,(R()-0.5)*0.6,0,(R()-0.5)*0.6,0.012,0.2,0.012));
      if(R()<0.4)p.push(P(SPH_XS,col(),0.05,0.09,0.03,0,0,0,0.035,0.035,0.035),P(SPH_XS,col(),0.08,0.08,0,0,0,0,0.03,0.03,0.03));break;
    case'ember':p.push(PG(ICO0,0x3a3036,0x1e1a1e,0,0.05,0,R(),R(),0,0.22,0.12,0.2));gl.push(P(BOX,0xff6a2a,0,0.1,0,0,R()*3,0,0.16,0.012,0.02));break;
    case'ash':for(let i=0;i<4;i++){const a=R()*6.28;p.push(P(CONE4,0x8a8078,Math.cos(a)*0.08,0.08,Math.sin(a)*0.08,(R()-0.5)*0.4,a,(R()-0.5)*0.4,0.04,0.16,0.035));}break;
    case'reed':for(let i=0;i<3;i++){const x=(R()-0.5)*0.25,z=(R()-0.5)*0.25,h=0.4+R()*0.2;p.push(P(CYL5,0x5a8a3a,x,h/2,z,0,0,0,0.015,h,0.015),P(CYL6,0x7a4a2a,x,h-0.04,z,0,0,0,0.035,0.1,0.035));}
      p.push(P(CONE4,gr,0.06,0.12,0.05,0.2,0,-0.3,0.04,0.26,0.03));break;
    case'crystal':for(let i=0;i<2+Math.floor(R()*2);i++){const a=R()*6.28,h=0.14+R()*0.16,c=col();p.push(PG(CONE4,c,lerpHex(c,0x4a3a8a,0.4),Math.cos(a)*0.08,h/2,Math.sin(a)*0.08,(R()-0.5)*0.5,a,(R()-0.5)*0.5,0.07,h,0.07));}break;
    case'lolly':{const c=col(),h=0.22+R()*0.12;p.push(P(CYL5,0xf8f4ee,0,h/2,0,0,0,0,0.015,h,0.015),P(CYL12,c,0,h+0.05,0,1.57,R()*3,0,0.13,0.025,0.13),P(CYL12,0xffffff,0,h+0.05,0.014,1.57,0,0,0.06,0.01,0.06));break;}
    case'coralbush':{const c=col();for(let i=0;i<5;i++){const a=i*1.3+R();p.push(P(CYL5,c,Math.sin(a)*0.06,0.1,Math.cos(a)*0.06,Math.cos(a)*0.5,0,Math.sin(a)*0.5,0.03,0.22,0.03),P(SPH_XS,lerpHex(c,0xffffff,0.3),Math.sin(a)*0.11,0.2,Math.cos(a)*0.11,0,0,0,0.04,0.04,0.04));}break;}
    case'neongrass':for(let i=0;i<4;i++){const a=R()*6.28;gl.push(P(CONE4,col(),Math.cos(a)*0.08,0.12,Math.sin(a)*0.08,(R()-0.5)*0.4,a,(R()-0.5)*0.4,0.035,0.24+R()*0.1,0.03));}break;
    // on the sand
    case'shells':for(let i=0;i<2;i++)p.push(P(SPH_LO,[0xf6d6d0,0xf4e8d8,0xe8c0a0][Math.floor(R()*3)],(R()-0.5)*0.4,0.02,(R()-0.5)*0.4,0,R()*3,0,0.09,0.03,0.08));break;
    case'beachgrass':for(let i=0;i<4;i++){const a=R()*6.28;p.push(P(CONE4,0xb8c870,Math.cos(a)*0.06,0.14,Math.sin(a)*0.06,(R()-0.5)*0.5,a,(R()-0.5)*0.5,0.035,0.3,0.03));}break;
    case'coralbits':for(let i=0;i<3;i++)p.push(P(CYL5,[0xf07aa0,0xf6a0b8,0xf6c0a0][i],(R()-0.5)*0.3,0.04,(R()-0.5)*0.3,(R()-0.5),0,(R()-0.5),0.025,0.1,0.025));break;
    case'rocks':for(let i=0;i<2;i++)p.push(PG(ICO0,0x9a9ea8,0x6a6e78,(R()-0.5)*0.3,0.03,(R()-0.5)*0.3,R(),R(),0,0.1+R()*0.06,0.06,0.09));break;
    case'ice':p.push(PG(ICO0,0xc8e8f8,0x8ab8e0,0,0.03,0,R(),R(),0,0.2,0.06,0.16));break;
    case'reeds':return floraParts('reed',R,cols,p,gl);
    case'sprinkles':for(let i=0;i<6;i++)p.push(P(BOX,[0xf870a8,0x7ad8f0,0xf6e060,0xa0f0b0][i%4],(R()-0.5)*0.4,0.012,(R()-0.5)*0.4,0,R()*3,0,0.06,0.015,0.015));break;}}
function ecoFlora(isl,g,blocked){const kind=isleKindOf(isl),E=ECO[kind];if(!E)return;const R=mulberry(hi(isl.seed,0xf10a)),p=[],gl=[];
  const spots=new Set((isl.spots||[]).map(([x,z])=>K(x,z)));
  const put=(t,x,z)=>{const q=[],qg=[];floraParts(t,R,E.fcol||[],q,qg);const ox=x+(R()-0.5)*0.6,oz=z+(R()-0.5)*0.6,y=topY(x,z),a=R()*6.28;p.push(...shift(q,ox,y,oz,a));if(qg.length)gl.push(...shift(qg,ox,y,oz,a));};
  for(const [x,z] of isl.grass){const k=K(x,z);if(blocked.has(k)||spots.has(k))continue;if(R()<(isl.grand?0.22:0.3))put(E.flora[Math.floor(R()*E.flora.length)],x,z);}
  if(E.sand)for(const [x,z] of isl.sand){if(blocked.has(K(x,z)))continue;if(R()<0.16)put(E.sand[Math.floor(R()*E.sand.length)],x,z);}
  if(p.length){const m=M(p);m.castShadow=false;m.receiveShadow=true;g.add(m);}if(gl.length){const m=M(gl,lumMat);m.castShadow=false;g.add(m);}}

// ---- things drifting in the air ----
const ECO_MOTE={// rate per second, and one mote
  pollen:[5,(x,y,z)=>emit(x,y,z,{vy:0.04,life:4,max:4,size:0.035,color:0xfff2a0,spin:1,sw:0.4,ph:Math.random()*6})],
  leaf:[4,(x,y,z,c)=>emit(x,y+2.5,z,{vy:-0.35,life:6,max:6,size:0.07,color:c,spin:1,sw:1.3,ph:Math.random()*6})],
  snow:[14,(x,y,z)=>emit(x,y+3.5,z,{vy:-0.45,life:7,max:7,size:0.045,color:0xf8fbff,sw:0.6,ph:Math.random()*6})],
  ember:[7,(x,y,z)=>emit(x,y,z,{vy:0.55,life:2.6,max:2.6,size:0.04,color:Math.random()<0.5?0xff8a3a:0xffc04a,spin:1,sw:0.5,ph:Math.random()*6})],
  spore:[7,(x,y,z,c)=>emit(x,y,z,{vy:0.15,life:4,max:4,size:0.04,color:Math.random()<0.5?0xd0a8f8:0xa0e8f0,spin:1,sw:0.5,ph:Math.random()*6})],
  petal:[5,(x,y,z,c)=>emit(x,y+2.5,z,{vy:-0.25,life:7,max:7,size:0.07,color:c,spin:1,sw:1.5,ph:Math.random()*6})],
  sparkle:[8,(x,y,z,c)=>emit(x,y,z,{vy:0.08,life:1.3,max:1.3,size:0.05,color:c,spin:1})],
  sugar:[5,(x,y,z,c)=>emit(x,y,z,{vy:0.06,life:1.6,max:1.6,size:0.045,color:c,spin:1})],
  midge:[6,(x,y,z)=>emit(x,y-0.3,z,{vy:0,life:2,max:2,size:0.02,color:0x3a3a2a,sw:2.2,ph:Math.random()*6})]};
const MOTE_DAY=new Set(['pollen','leaf','petal','midge','sugar']);
let moteAcc=0;
function ecoMotes(dt,isl){const E=ECO[isleKindOf(isl)];if(!E||!E.mote)return;const M0=ECO_MOTE[E.mote];if(!M0)return;
  if(isNight()&&MOTE_DAY.has(E.mote))return;if(S.rain&&E.mote!=='snow'&&E.mote!=='ember')return;
  moteAcc+=dt*M0[0];while(moteAcc>=1){moteAcc--;const a=Math.random()*6.283,r=1+Math.random()*7,x=cam.tx+Math.cos(a)*r,z=cam.tz+Math.sin(a)*r;
    if(!isLand(Math.round(x),Math.round(z))&&E.mote!=='snow')continue;const y=(topY(Math.round(x),Math.round(z))||0.3)+0.3+Math.random()*1.6;
    M0[1](x,y,z,E.fcol&&E.fcol.length?pickR(E.fcol):0xffffff);}}

// ---- each frame ----
function updateEco(dt,tt){const isl=S.sea||inside?null:curIsl();
  // the island you're on is stocked for today; leaving it puts its forage away
  if(!isl||isl.home||!ECO[isleKindOf(isl)]){if(ecoAt!=null){ecoSync();S.finds=S.finds.filter(f=>f.eco==null);ecoAt=null;syncLife();}}
  else if(ecoAt!==isl.id||!S.eco||!S.eco[isl.id]||S.eco[isl.id].d!==S.day){if(ecoAt!=null)ecoSync();ecoStock(isl);}
  ecoSyncT-=dt;if(ecoSyncT<=0){ecoSyncT=1;ecoSync();}
  for(const c of critters){if(c.calm>0)c.calm-=dt;
    if(c.rare&&c.state!=='gone'){if(Math.random()<dt*2.5)sparkle(c.x,c.y+0.25,c.z,0xfff0a0);
      if(!c.told&&Math.hypot(c.x-vil.x,c.z-vil.z)<10){c.told=1;const W=WILD[c.sp];if(W)say(`Look! ${/^[aeiou]/i.test(W.name)?'An':'A'} ${W.name}… tap it to watch quietly.`);}}}
  if(isl&&!isl.home)ecoMotes(dt,isl);}
