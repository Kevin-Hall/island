/* =========================================================
   Your home, decorated
   ========================================================= */
// Inside your own home (56b's diorama) everything is yours to arrange. S.room holds each placed piece ({id,k,x,z,r,lv,c}:
// kind, spot, turn, floor or loft, colour), S.rinv what you own but haven't put out, S.rlook the room itself (wallpaper,
// floor, rug, roof style, fairy lights, island) and S.rown the looks you've bought. Decorate mode (deco) opens a tray at
// the bottom: your things, the catalogue (RI, some pieces unlocked by cosiness stars), and the room's looks. Tap a piece
// to pick it up, drag it (or tap where it should go), turn it, repaint it or put it away.
// Cosiness (cosyScore) adds up what's out, variety, plants, lights, matching colours and a styled room. Sleeping at home
// wakes you Well rested (S.rest: more XP all day, and a gift of shells), and each new star brings a present.
const TINTS=[0xe85a5a,0xf0a040,0xf6d04a,0x6ab84a,0x3ab8a8,0x4a90d8,0x6a5ad8,0xa86ad8,0xf39ab0,0xf4f0ea,0x8a8a98,0x5a4a3a];
// the catalogue: name, price, cosy points, takes a colour (tint), gives light, stars needed, is part of the house (fixed)
const RI={
  bed:{n:'Bed',cost:600,pts:6,tint:1,fixed:1},workbench:{n:'Workbench',cost:500,pts:3,fixed:1},
  table:{n:'Round Table',cost:180,pts:4},chair:{n:'Chair',cost:90,pts:3,tint:1},lamp:{n:'Floor Lamp',cost:150,pts:3,light:1},
  plant:{n:'House Plant',cost:80,pts:3,plant:1},shelf:{n:'Bookshelf',cost:320,pts:5},armchair:{n:'Armchair',cost:340,pts:5,tint:1},
  beanbag:{n:'Beanbag',cost:160,pts:4,tint:1},sofa:{n:'Sofa',cost:480,pts:6,tint:1},dresser:{n:'Dresser',cost:300,pts:4,tint:1},
  tv:{n:'Television',cost:420,pts:4},stereo:{n:'Stereo',cost:360,pts:4},counter:{n:'Kitchen Counter',cost:380,pts:4},
  fridge:{n:'Fridge',cost:420,pts:4,tint:1},stove:{n:'Stove',cost:400,pts:4},vanity:{n:'Vanity',cost:340,pts:4},
  fireplace:{n:'Fireplace',cost:900,pts:8,light:1},fishtank:{n:'Fish Tank',cost:700,pts:6},weights:{n:'Weights',cost:200,pts:3},
  bag:{n:'Punching Bag',cost:260,pts:3},piano:{n:'Piano',cost:1200,pts:8},bathtub:{n:'Clawfoot Tub',cost:800,pts:6},
  bookstack:{n:'Pile of Books',cost:60,pts:2},candles:{n:'Candles',cost:90,pts:3,light:1},teddy:{n:'Teddy Bear',cost:120,pts:3,tint:1},
  catbed:{n:'Cat on a Cushion',cost:450,pts:6,tint:1},globe:{n:'Globe',cost:260,pts:4},telescope:{n:'Telescope',cost:520,pts:5},
  easel:{n:'Easel',cost:280,pts:4},guitar:{n:'Guitar',cost:340,pts:4},clock:{n:'Grandfather Clock',cost:640,pts:6},
  lavalamp:{n:'Lava Lamp',cost:220,pts:4,light:1,tint:1,star:1},drums:{n:'Drum Kit',cost:900,pts:6,star:2},
  arcade:{n:'Arcade Cabinet',cost:1500,pts:8,light:1,tint:1,star:2},jukebox:{n:'Jukebox',cost:1800,pts:8,light:1,star:3},
  discoball:{n:'Disco Ball',cost:2400,pts:9,light:1,star:4},throne:{n:'Shell Throne',cost:5000,pts:12,star:5},
  lantern:{n:'Lantern',cost:160,pts:3,light:1},gnome:{n:'Garden Gnome',cost:140,pts:3},flowerpot:{n:'Flower Pot',cost:70,pts:2,plant:1}};
const FURN_K=new Set(['bed','table','chair','lamp','plant','shelf','tv','beanbag','armchair','weights','bag','counter','piano','stereo','vanity','fireplace','fishtank','workbench']);
const BUILD_K=new Set(['lantern','gnome','flowerpot']);
// potted plants (50d) go in the catalogue too
for(const [k,name,cost] of POT_PLANTS)RI['pot_'+k]={n:name,cost:Math.round(cost*0.8),pts:3,plant:1};
// the room's looks: wallpaper, floor, rug, overhead style, fairy lights and the island it floats on
const RLOOK={
  wall:{cream:{n:'Cream',c:0xf4e6c8,cost:0},mint:{n:'Mint',c:0xcfeede,cost:200},sky:{n:'Sky Blue',c:0xcfe4f6,cost:200},lilac:{n:'Lilac',c:0xe2d6f4,cost:200},
    peach:{n:'Peach',c:0xf8d8c0,cost:200},rose:{n:'Rose',c:0xf6cad4,cost:200},sage:{n:'Sage',c:0xc8d8b4,cost:200},navy:{n:'Midnight',c:0x2e3a5a,cost:400},
    stripe:{n:'Candy Stripe',c:0xfbeef0,c2:0xf2a6bc,pat:'stripe',cost:500},sailor:{n:'Sailor Stripe',c:0xf4f4f0,c2:0x4a78b8,pat:'stripe',cost:500},
    dots:{n:'Polka Dots',c:0xfff0c8,c2:0xe86a5a,pat:'dots',cost:600},wood:{n:'Log Cabin',c:0xb8834e,c2:0xa0703e,pat:'planks',cost:700},
    brick:{n:'Red Brick',c:0xb85a44,c2:0xe8d8c8,pat:'brick',cost:800},stars:{n:'Starry Night',c:0x1e2448,c2:0xfff4c0,pat:'stars',cost:1200},
    leaf:{n:'Jungle',c:0x3a7a48,c2:0x6ab85a,pat:'dots',cost:900}},
  floor:{oak:{n:'Oak Planks',c:[0xc8905a,0xb8804a],cost:0},birch:{n:'Birch',c:[0xe8d0a8,0xdcc298],cost:250},walnut:{n:'Walnut',c:[0x7a5236,0x6a4428],cost:250},
    check:{n:'Checkerboard',c:[0xf4f0ea,0x2e2a34],pat:'tiles',cost:500},mint:{n:'Mint Tiles',c:[0xd4f0e4,0xaadcc8],pat:'tiles',cost:450},
    stone:{n:'Flagstone',c:[0xa8a4a0,0x8e8a88],pat:'tiles',cost:450},carpet:{n:'Blue Carpet',c:[0x6a8ad0,0x6484c8],pat:'tiles',cost:400},
    pink:{n:'Pink Carpet',c:[0xf0a8c0,0xeaa0b8],pat:'tiles',cost:400},grass:{n:'Indoor Meadow',c:[0x7cc05a,0x70b450],pat:'tiles',cost:700},
    rainbow:{n:'Rainbow Boards',c:[0xf07a7a,0xf0b060,0xf0e070,0x7ad07a,0x7ab0f0,0xb08ae0],cost:1500},cloud:{n:'Cloud Floor',c:[0xffffff,0xe0ecfa],pat:'tiles',cost:2000,star:3}},
  rug:{green:{n:'Green Rug',c:0x5fae44,cost:0},none:{n:'Bare Floor',c:null,cost:0},red:{n:'Red Rug',c:0xd8453a,cost:150},blue:{n:'Blue Rug',c:0x3a6ab8,cost:150},
    purple:{n:'Purple Rug',c:0x8a5ac8,cost:150},gold:{n:'Gold Rug',c:0xe0a830,cost:200},pink:{n:'Pink Rug',c:0xf28aa8,cost:150},rainbow:{n:'Rainbow Rug',c:0xf07a7a,pat:'rainbow',cost:800}},
  style:{tree:{n:'Great Tree',cost:0},hull:{n:'Ship’s Hull',cost:800},dome:{n:'Star Dome',cost:1200},pipes:{n:'Workshop',cost:1000},
    thatch:{n:'Thatch',cost:600},tent:{n:'Circus Tent',cost:900},books:{n:'Library',cost:1400},none:{n:'Open Sky',cost:0}},
  lights:{warm:{n:'Warm',c:0xffd890,cost:0},white:{n:'Moonlight',c:0xf0f4ff,cost:100},pink:{n:'Pink',c:0xff9ac8,cost:150},blue:{n:'Blue',c:0x8ac8ff,cost:150},
    green:{n:'Firefly',c:0xc8ff8a,cost:150},rainbow:{n:'Rainbow',c:'rainbow',cost:500},none:{n:'None',c:null,cost:0}},
  base:{meadow:{n:'Meadow',c:0x6ab04a,cost:0},spring:{n:'Blossom',c:0x8ac860,fl:[0xf8b8d0,0xffffff],cost:300},autumn:{n:'Autumn',c:0xc88a3a,fl:[0xe86a3a,0xf6d04a],cost:300},
    snow:{n:'Snowy',c:0xe8f0f6,fl:[0xc8e0ff,0xffffff],cost:400},sand:{n:'Beach',c:0xe8d098,fl:[0xf6f0e0,0xf0a080],cost:400},candy:{n:'Candy',c:0xf6a6c8,fl:[0xffffff,0xa8e8ff],cost:800},
    moss:{n:'Mossy',c:0x4a7a3a,fl:[0xb8ff8a,0xf6d04a],cost:300}}};
const RLOOK_TABS=[['wall','Walls'],['floor','Floor'],['rug','Rug'],['style','Roof'],['lights','Lights'],['base','Island']];
function roomLook(){const L=S.rlook||(S.rlook={});for(const [t] of RLOOK_TABS)if(!RLOOK[t][L[t]])L[t]=Object.keys(RLOOK[t])[0];return L;}
const lookOwned=(t,id)=>!RLOOK[t][id].cost||(S.rown||[]).includes(t+':'+id);
// the home's style for the diorama, from its looks
function homeLookStyle(){const L=roomLook(),w=RLOOK.wall[L.wall],f=RLOOK.floor[L.floor],r=RLOOK.rug[L.rug],li=RLOOK.lights[L.lights],b=RLOOK.base[L.base];
  return Object.assign({},DIO_STYLE.home,{wall:w.c,wall2:w.c2,wallPat:w.pat,trim:w.pat==='stars'||L.wall==='navy'?0x8a7ac8:DIO_STYLE.home.trim,floor:f.c,floorPat:f.pat,rug:r.c,rugPat:r.pat,deco:L.style,lights:li.c,grass:b.c,flowers:b.fl});}

/* ---- the new pieces ---- */
function indoorParts(k,c){const p=[],gl=[],lum=[],L=t=>lerpHex(c,0xffffff,t),D=t=>lerpHex(c,0x1a1420,t);
  switch(k){
    case'sofa':p.push(P(BOX,c,0,0.24,0,0,0,0,1.5,0.3,0.66),P(BOX,c,0,0.55,-0.26,0,0,0,1.5,0.56,0.16));for(const s of [-1,1])p.push(P(BOX,D(0.1),s*0.7,0.42,0,0,0,0,0.14,0.36,0.66));
      for(const s of [-1,1])p.push(P(BOX,L(0.25),s*0.31,0.43,0.04,0,0,0,0.6,0.1,0.52),P(BOX,L(0.2),s*0.31,0.66,-0.16,0.2,0,0,0.58,0.36,0.1));p.push(P(ICO2,0xf6d04a,-0.45,0.56,0.02,0.3,0.4,0,0.26,0.24,0.1));
      for(const [x,z] of [[-0.66,-0.26],[0.66,-0.26],[-0.66,0.26],[0.66,0.26]])p.push(P(CYL8,0x5a3a2a,x,0.04,z,0,0,0,0.07,0.1,0.07));break;
    case'dresser':p.push(P(BOX,c,0,0.45,0,0,0,0,1.0,0.9,0.46));for(let i=0;i<3;i++){p.push(P(BOX,L(0.2),0,0.2+i*0.27,0.235,0,0,0,0.9,0.22,0.02));for(const s of [-1,1])p.push(P(ICO2,0xe0b050,s*0.22,0.2+i*0.27,0.25,0,0,0,0.05,0.05,0.04));}
      p.push(P(CYL12,0xf6f0e0,0.28,0.98,0,0,0,0,0.16,0.14,0.16),P(ICO2,0xf39ab0,0.28,1.08,0,0,0,0,0.14,0.1,0.14));break;
    case'fridge':p.push(P(BOX,c,0,0.78,0,0,0,0,0.72,1.56,0.62),P(BOX,D(0.25),0,1.04,0.315,0,0,0,0.7,0.02,0.02),P(BOX,0xc8c8d0,0.28,1.25,0.33,0,0,0,0.04,0.3,0.04),P(BOX,0xc8c8d0,0.28,0.7,0.33,0,0,0,0.04,0.36,0.04));
      for(let i=0;i<4;i++)p.push(P(BOX,TINTS[i*2],-0.2+(i%2)*0.14,1.3-Math.floor(i/2)*0.16,0.32,0,0,(i-1.5)*0.2,0.1,0.1,0.02));break;
    case'stove':p.push(P(BOX,0xf4f0ea,0,0.4,0,0,0,0,0.8,0.8,0.62),P(BOX,0x2e2a34,0,0.81,0,0,0,0,0.8,0.02,0.62),P(BOX,0x2e2a34,0,0.36,0.315,0,0,0,0.56,0.34,0.02));
      for(const [x,z] of [[-0.2,-0.14],[0.2,-0.14],[-0.2,0.14],[0.2,0.14]])p.push(P(CYL12,0x5a5a66,x,0.83,z,0,0,0,0.22,0.02,0.22));p.push(P(CYL12,0xd8453a,0.2,0.9,-0.14,0,0,0,0.26,0.14,0.26),P(BOX,0x3a3440,0.36,0.94,-0.14,0,0,0,0.2,0.03,0.04));
      gl.push(P(CYL12,0xff7a3a,-0.2,0.835,0.14,0,0,0,0.18,0.01,0.18));break;
    case'bathtub':p.push(P(CYL12,0xf8f6f2,0,0.36,0,0,0,0,1.4,0.5,0.72),P(CYL12,0xf8f6f2,0,0.62,0,0,0,0,1.5,0.06,0.8));lum.push(P(CYL12,0x9adcf0,0,0.6,0,0,0,0,1.3,0.02,0.62));
      for(let i=0;i<9;i++)p.push(P(SPH_LO,0xffffff,-0.45+i*0.11,0.64+(i%3)*0.04,(i%2-0.5)*0.3,0,0,0,0.14+(i%3)*0.04,0.12,0.14));for(const [x,z] of [[-0.55,-0.22],[0.55,-0.22],[-0.55,0.22],[0.55,0.22]])p.push(P(SPH_LO,0xe0b050,x,0.08,z,0,0,0,0.1,0.16,0.1));
      p.push(P(ICO2,0xf6d04a,0.35,0.7,0.1,0,0.6,0,0.14,0.12,0.18),P(ICO2,0xf08a2a,0.43,0.73,0.12,0,0,0,0.05,0.03,0.04));break;
    case'bookstack':for(let i=0;i<5;i++)p.push(P(BOX,TINTS[(i*5)%TINTS.length],(i%2-0.5)*0.04,0.05+i*0.09,0,0,i*0.3,0,0.42,0.085,0.3));p.push(P(CYL12,0xf6f0e0,0.02,0.52,0,0,0,0,0.12,0.1,0.12));break;
    case'candles':for(const [x,z,h] of [[-0.1,0,0.34],[0.08,0.06,0.24],[0.02,-0.1,0.16]]){p.push(P(CYL12,0xf6ecd0,x,h/2,z,0,0,0,0.1,h,0.1));lum.push(P(CONE8,0xffc860,x,h+0.05,z,0,0,0,0.06,0.1,0.06));}
      p.push(P(CYL12,0xc8a050,0,0.01,0,0,0,0,0.44,0.02,0.44));break;
    case'teddy':p.push(P(SPH,c,0,0.2,0,0,0,0,0.36,0.4,0.3),P(SPH,c,0,0.5,0.02,0,0,0,0.3,0.28,0.28),P(SPH_LO,L(0.35),0,0.47,0.14,0,0,0,0.12,0.09,0.08),P(SPH_XS,0x2a2020,0,0.5,0.18,0,0,0,0.04,0.03,0.03));
      for(const s of [-1,1])p.push(P(SPH_LO,c,s*0.12,0.63,0,0,0,0,0.1,0.1,0.06),P(SPH_LO,c,s*0.2,0.25,0.08,0,0,s*0.5,0.1,0.2,0.1),P(SPH_LO,c,s*0.1,0.05,0.12,0,0,0,0.12,0.1,0.16),P(SPH_XS,0x2a2020,s*0.06,0.54,0.14,0,0,0,0.03,0.03,0.02));
      p.push(P(BOX,0xd8453a,0,0.38,0.12,0,0,0.5,0.12,0.05,0.02));break;
    case'catbed':p.push(P(CYL12,c,0,0.08,0,0,0,0,0.9,0.16,0.9),P(CYL12,L(0.3),0,0.15,0,0,0,0,0.72,0.06,0.72));
      p.push(P(SPH,0xf0a050,0,0.28,0,0,0.5,0,0.5,0.24,0.4),P(SPH,0xf0a050,0.2,0.34,0.14,0,0,0,0.24,0.2,0.22),P(SPH_LO,0xf6e0c0,0.26,0.31,0.22,0,0,0,0.1,0.07,0.06));
      for(const s of [-1,1])p.push(P(CONE5,0xf0a050,0.2+s*0.08,0.46,0.13,0,0,s*0.3,0.07,0.1,0.05));for(let i=0;i<3;i++)p.push(P(BOX,0xd07a30,-0.1+i*0.08,0.4,0,0,0.5,0,0.03,0.02,0.3));
      p.push(P(CYL8,0xf0a050,-0.22,0.24,0.2,1.3,0,0.6,0.07,0.4,0.07));break;
    case'globe':p.push(P(CYL12,0x6a4428,0,0.03,0,0,0,0,0.4,0.06,0.4),P(CYL8,0x6a4428,0,0.25,0,0,0,0,0.05,0.4,0.05),P(SPH,0x4a8ad8,0,0.68,0,0.4,0,0,0.5,0.5,0.5));
      for(let i=0;i<7;i++){const a=i*0.9,b=0.3+(i%3)*0.4;p.push(P(SPH_LO,0x6ab84a,Math.cos(a)*Math.sin(b)*0.24,0.68+Math.cos(b)*0.22,Math.sin(a)*Math.sin(b)*0.24,0,0,0,0.14,0.08,0.12));}
      for(let i=0;i<12;i++){const a=i/12*6.28;p.push(P(BOX,0xe0b050,Math.sin(a)*0.29,0.68+Math.cos(a)*0.29,0,0,0,-a,0.04,0.16,0.03));}break;
    case'telescope':for(const a of [0,2.1,4.2])limb(p,0x6a4428,Math.sin(a)*0.3,0,Math.cos(a)*0.3,0,0.8,0,0.05);p.push(P(CYL12,0xe0b050,0,1.0,0.05,0.8,0,0,0.16,0.9,0.16),P(CYL12,0x3a3440,0,1.32,0.4,0.8,0,0,0.2,0.08,0.2),P(CYL8,0x3a3440,0,0.72,-0.3,0.8,0,0,0.08,0.14,0.08));break;
    case'easel':limb(p,0x8a5a3a,-0.3,0,0.1,0,1.5,0,0.05);limb(p,0x8a5a3a,0.3,0,0.1,0,1.5,0,0.05);limb(p,0x8a5a3a,0,0,-0.35,0,1.4,-0.05,0.05);p.push(P(BOX,0x8a5a3a,0,0.62,0.1,0,0,0,0.7,0.04,0.12));
      p.push(P(BOX,0xfbf8f0,0,0.98,0.12,-0.12,0,0,0.66,0.66,0.03));for(let i=0;i<6;i++)p.push(P(SPH_LO,TINTS[(i*3)%TINTS.length],-0.18+(i%3)*0.18,0.84+Math.floor(i/3)*0.26,0.15,0,0,0,0.16+(i%2)*0.06,0.12,0.02));break;
    case'guitar':limb(p,0x5a3a2a,-0.2,0,0.1,0,0.5,-0.05,0.04);limb(p,0x5a3a2a,0.2,0,0.1,0,0.5,-0.05,0.04);
      p.push(P(SPH,0xd88a3a,0,0.3,0.08,0,0,0,0.44,0.44,0.12),P(SPH,0xd88a3a,0,0.62,0.06,0,0,0,0.34,0.32,0.11),P(CYL12,0x2a2020,0,0.46,0.14,1.57,0,0,0.12,0.02,0.12),P(BOX,0x5a3a2a,0,1.0,0.04,0,0,0,0.07,0.6,0.04),P(BOX,0x3a2a20,0,1.36,0.03,0,0,0,0.12,0.16,0.04));break;
    case'clock':p.push(P(BOX,0x7a4a2a,0,0.95,0,0,0,0,0.54,1.9,0.36),P(BOX,0x5a3420,0,1.95,0,0,0,0,0.62,0.12,0.42),P(CYL12,0xf8f4e8,0,1.55,0.19,1.57,0,0,0.38,0.02,0.38),P(BOX,0x2a2020,0,1.58,0.2,0,0,0.5,0.02,0.14,0.01),P(BOX,0x2a2020,0.03,1.55,0.2,0,0,-1.1,0.02,0.1,0.01));
      p.push(P(BOX,0x3a2a20,0,0.8,0.185,0,0,0,0.3,0.8,0.01));gl.push(P(CYL12,0xe0b050,0,0.6,0.19,1.57,0,0,0.16,0.02,0.16));break;
    case'lavalamp':p.push(P(CONE8,0x5a5a66,0,0.12,0,0,0,0,0.3,0.24,0.3),P(CONE8,0x5a5a66,0,0.82,0,Math.PI,0,0,0.2,0.14,0.2));lum.push(P(CYL12,L(0.3),0,0.48,0,0,0,0,0.22,0.5,0.22));
      for(const [y,s] of [[0.36,0.12],[0.55,0.09],[0.66,0.07]])lum.push(P(SPH_LO,c,0,y,0,0,0,0,s,s*1.2,s));break;
    case'drums':p.push(P(CYL12,0xd8453a,0,0.36,-0.1,1.57,0,0,0.66,0.34,0.66),P(CYL12,0xf6f0e0,0,0.36,0.08,1.57,0,0,0.58,0.01,0.58));
      for(const [x,y,z,s] of [[-0.5,0.55,0.2,0.34],[0.2,0.78,-0.05,0.28],[-0.2,0.8,-0.05,0.28]])p.push(P(CYL12,0xd8453a,x,y,z,0.2,0,0,s,0.18,s),P(CYL12,0xf6f0e0,x,y+0.09,z,0.2,0,0,s*0.92,0.01,s*0.92));
      for(const [x,z] of [[0.55,0.1],[-0.65,-0.25]]){limb(p,0x8a8e98,x,0,z,x,1.0,z,0.03);p.push(P(CYL12,0xe8c050,x,1.02,z,0.15,0,0,0.5,0.015,0.5));}p.push(P(CYL12,0x3a3440,0.1,0.28,0.55,0,0,0,0.34,0.08,0.34),P(CYL8,0x5a5a66,0.1,0.13,0.55,0,0,0,0.06,0.26,0.06));break;
    case'arcade':p.push(P(BOX,c,0,0.75,0,0,0,0,0.66,1.5,0.6),P(BOX,D(0.35),0,0.86,0.29,-0.5,0,0,0.6,0.08,0.26),P(BOX,D(0.2),0,0.4,0.31,0,0,0,0.5,0.6,0.02));
      lum.push(P(BOX,0x6af0ff,0,1.12,0.26,-0.18,0,0,0.5,0.38,0.02),P(BOX,0xff6ad0,0,1.42,0.28,0,0,0,0.6,0.14,0.04));for(let i=0;i<4;i++)lum.push(P(SPH_XS,TINTS[i*3],0.04+i*0.07,0.9,0.36,0,0,0,0.05,0.03,0.05));p.push(P(CYL8,0x2a2020,-0.16,0.94,0.34,0,0,0,0.02,0.12,0.02),P(SPH_XS,0xd8453a,-0.16,1.0,0.34,0,0,0,0.06,0.06,0.06));break;
    case'jukebox':p.push(P(BOX,0x8a4a2a,0,0.5,0,0,0,0,0.8,1.0,0.46),P(BOX,0x3a2a20,0,0.3,0.24,0,0,0,0.52,0.36,0.02));
      [0xff5a6a,0xffb03a,0xf6e04a,0x6ae08a,0x6ab0ff].forEach((cc,i)=>lum.push(P(CYL12,cc,0,1.0,0,Math.PI/2,0,0,0.8-i*0.12,0.46-i*0.02,0.8-i*0.12)));lum.push(P(BOX,0xfff4d0,0,0.7,0.235,0,0,0,0.5,0.18,0.02));break;
    case'discoball':limb(p,0x8a8e98,0,0,0,0,1.8,0,0.04);p.push(P(CYL12,0x5a5a66,0,0.03,0,0,0,0,0.5,0.06,0.5));lum.push(P(ICO,0xdce4f4,0,2.05,0,0,0,0,0.52,0.52,0.52));
      for(let i=0;i<10;i++){const a=i*0.63,r=0.6+(i%3)*0.3;lum.push(P(CYL8,TINTS[(i*2)%TINTS.length],Math.cos(a)*r,0.015,Math.sin(a)*r,0,0,0,0.26,0.01,0.26));}break;
    case'throne':p.push(P(BOX,0xe0b050,0,0.3,0,0,0,0,0.9,0.5,0.8),P(BOX,0xd8453a,0,0.57,0.04,0,0,0,0.74,0.06,0.64));for(let i=0;i<7;i++){const a=-1.2+i*0.4;p.push(P(SPH,[0xf8c8d8,0xf6e0c0][i%2],Math.sin(a)*0.5,1.0+Math.cos(a)*0.55,-0.36,0.3,0,a,0.34,0.6,0.12));}
      for(const s of [-1,1])p.push(P(BOX,0xe0b050,s*0.48,0.72,0,0,0,0,0.12,0.3,0.7),P(SPH_LO,0xf6f0e0,s*0.48,0.9,0.3,0,0,0,0.14,0.14,0.14));lum.push(P(ICO2,0x9af0ff,0,1.62,-0.34,0,0,0,0.16,0.16,0.1));break;}
  return{p,gl,lum};}
// one placed piece, as a group standing at its own origin
function roomItemGroup(k,c,seed=1){if(BUILD_K.has(k)||k.startsWith('pot_'))return objGroup(k,seed,0);const g=new T.Group();
  const {p,gl,lum}=FURN_K.has(k)?Object.assign({lum:[]},furn(k,c)):indoorParts(k,c);if(p.length)g.add(M(p));
  if(gl&&gl.length){const m=M(gl,glowMat);m.castShadow=false;g.add(m);}if(lum.length){const m=M(lum,lumMat);m.castShadow=false;m.userData.lum=1;g.add(m);}return g;}
const itemTint=it=>it.c??(RI[it.k]&&RI[it.k].tint?TINTS[(hash(it.id||1,3)*TINTS.length)|0]:0x9ad0a0);

/* ---- your room's pieces ---- */
// the first time: the furniture the house always had, laid out as before
function roomInit(){if(S.room)return;const R=2.5+(S.house||0)*0.22;let id=1;const add=(k,x,z,r,lv,c)=>S.room.push({id:id++,k,x,z,r,lv,c});S.room=[];S.rinv=S.rinv||{};
  add('bed',-R*0.4,-R+0.66,Math.PI/2,1,0x5a8ae0);add('table',-0.55,0.55,0,0);add('chair',-1.25,0.55,1.57,0,0xc8905a);add('plant',-R+0.55,0.9,0,0);add('lamp',R-0.55,1.15,0,0);
  add('workbench',-R+0.75,-0.35,1.2,0);if(S.house>=1)add('fishtank',R-0.8,0.85,-1.3,0);if(S.house>=2)add('fireplace',-R*0.72,-R*0.42,0.75,0);S.roomId=id;}
// (re)build the pieces in the room, and their tap targets
function syncRoomItems(){const I=inside;if(!I||I.kind!=='home')return;const R=I.room,D=R.dio;
  if(R.itemsG){R.g.remove(R.itemsG);R.itemsG.traverse(o=>{if(o.isMesh&&!o.geometry.userData.keep)o.geometry.dispose();});}
  const G=new T.Group();R.itemsG=G;R.g.add(G);R.byId=new Map();R.props=R.props.filter(q=>q.label==='exit');
  for(const it of S.room){[it.x,it.z]=dioClamp(D,it.lv,it.x,it.z);const g=roomItemGroup(it.k,itemTint(it),it.id);g.position.set(it.x,it.lv?D.LY:0,it.z);g.rotation.y=it.r||0;g.userData.it=it;G.add(g);R.byId.set(it.id,g);
    R.props.push({x:it.x,y:(it.lv?D.LY:0)+0.45,z:it.z,w:1,d:1,label:it.k,k:it.k,lv:it.lv,id:it.id});}
  if(deco&&deco.sel&&!R.byId.has(deco.sel))deco.sel=null;decoMark();}
// cosiness: what's out, how varied, plants, lights, colours that go together, and a room with a style of its own
function cosyScore(){const items=S.room||[],kinds=new Set(items.map(i=>i.k));let s=0,plants=0,lights=0;const cols={};
  for(const it of items){const r=RI[it.k]||{pts:3};s+=r.pts||3;if(r.plant)plants++;if(r.light)lights++;if(r.tint){const c=itemTint(it);cols[c]=(cols[c]||0)+1;}}
  s+=kinds.size*2+Math.min(plants,6)*2+Math.min(lights,5)*3;const match=Math.max(0,...Object.values(cols))>=3;if(match)s+=10;
  const L=roomLook();let styled=0;for(const [t] of RLOOK_TABS)if(L[t]!==Object.keys(RLOOK[t])[0])styled++;s+=styled*4;
  let crowd=0;for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++)if(items[i].lv===items[j].lv&&Math.hypot(items[i].x-items[j].x,items[i].z-items[j].z)<0.45)crowd++;s-=crowd*4;
  const score=clamp(Math.round(s*0.62),0,100),stars=score>=90?5:score>=70?4:score>=50?3:score>=30?2:score>=12?1:0;
  const tip=!lights?'A lamp or some candles would warm it up.':plants<2?'Plants make a home feel alive.':!match?'Three pieces in the same colour look great together.':styled<3?'Try new wallpaper, a floor or a roof style.':crowd?'A few pieces are squashed together.':kinds.size<10?'More different pieces, more cosy!':'It’s wonderful in here.';
  return{score,stars,tip,match};}
const starStr=n=>'★'.repeat(n)+'☆'.repeat(5-n);
// a new star: a present and something new in the catalogue
function cosyCheck(){const c=cosyScore();if(c.stars<=(S.cosyMax||0))return c;const prev=S.cosyMax||0;S.cosyMax=c.stars;
  if(c.stars>prev){const gift=c.stars*150;S.shells+=gift;const neu=Object.keys(RI).filter(k=>RI[k].star&&RI[k].star>prev&&RI[k].star<=c.stars).map(k=>RI[k].n);
    toast(`Your home is ${starStr(c.stars)} cosy! +${gift} shells${neu.length?`. New in the catalogue: <b>${neu.join(', ')}</b>`:''}`,'rare',ICON.star);SFX.level();updateHUD();}return c;}

/* ---- decorate mode ---- */
let deco=null;const decoThumbs={};
function decoOpen(){if(!inside||inside.kind!=='home')return;inside.path=null;deco={sel:null,tab:'mine',sub:'wall'};$('decoTray').hidden=false;renderDeco();updateCtx();SFX.ui();}
function decoClose(){if(!deco)return;deco=null;$('decoTray').hidden=true;$('decoSel').hidden=true;decoMark();roomView(0);save();ctxSig='';updateCtx();cosyCheck();}
// the room slides up above the tray while you decorate
let roomReserve=0;
function roomView(px){roomReserve=px||0;if(!px){roomCam.clearViewOffset();return;}const W=window.innerWidth,H=window.innerHeight;roomCam.setViewOffset(W,H,0,px/2,W,H);}
function decoMark(){const I=inside;if(!I||!I.room.itemsG)return;const R=I.room;if(R.mark){R.g.remove(R.mark);R.mark=null;}if(!deco||!deco.sel)return;const g=R.byId.get(deco.sel);if(!g)return;
  const m=new T.Mesh(merge([P(CYL12,0xffe070,0,0.02,0,0,0,0,1.1,0.02,1.1)]),lumMat);m.userData.pulse=1;m.position.copy(g.position);R.g.add(m);R.mark=m;}
function decoItemAt(cx,cy){const I=inside,R=I.room;let best=null,bd=1e9;
  for(const g of R.itemsG.children){const it=g.userData.it;_pv.set(g.position.x,g.position.y+0.4-curveDropFor(roomCam,g.position.x,g.position.z),g.position.z).project(roomCam);
    const d=Math.hypot((_pv.x+1)/2*window.innerWidth-cx,(1-_pv.y)/2*window.innerHeight-cy);if(d<bd){bd=d;best=it;}}
  const pxu=window.innerHeight/(2*Math.tan(roomCam.fov*Math.PI/360)*roomCam.position.length());return best&&bd<Math.max(30,pxu*0.6)?best:null;}
// the spot under your finger: the loft if you're pointing at it, otherwise the floor
function decoSpotAt(cx,cy){const D=inside.room.dio,up=roomPoint(cx,cy,D.LY);if(up&&up.z<D.ZL&&Math.hypot(up.x,up.z)<D.R)return{lv:1,x:up.x,z:up.z};const pt=roomPoint(cx,cy,0);return pt?{lv:0,x:pt.x,z:pt.z}:null;}
function decoMoveTo(it,s){const D=inside.room.dio;const [x,z]=dioClamp(D,s.lv,Math.round(s.x*10)/10,Math.round(s.z*10)/10);it.x=x;it.z=z;it.lv=s.lv;const g=inside.room.byId.get(it.id);
  if(g){g.position.set(x,s.lv?D.LY:0,z);}const pr=inside.room.props.find(q=>q.id===it.id);if(pr){pr.x=x;pr.z=z;pr.lv=s.lv;pr.y=(s.lv?D.LY:0)+0.45;}if(inside.room.mark&&g)inside.room.mark.position.copy(g.position);}
function decoTap(cx,cy){const it=decoItemAt(cx,cy);if(it&&deco.grabbed===it.id){deco.grabbed=null;return;}/* just picked up by the press */
  if(it){deco.sel=deco.sel===it.id?null:it.id;decoMark();renderDecoSel();SFX.ui();return;}
  if(deco.sel){const s=decoSpotAt(cx,cy),sel=S.room.find(i=>i.id===deco.sel);if(s&&sel){decoMoveTo(sel,s);SFX.pop();renderDeco();}}}
// dragging a piece round the room
function decoGrab(cx,cy){if(!deco)return false;const it=decoItemAt(cx,cy);if(!it)return false;const was=deco.sel===it.id;deco.sel=it.id;deco.grabbed=was?null:it.id;deco.drag=true;decoMark();renderDecoSel();return true;}
function decoDrag(cx,cy){const sel=S.room.find(i=>i.id===deco.sel),s=decoSpotAt(cx,cy);if(sel&&s)decoMoveTo(sel,s);}
function decoDrop(moved){if(!deco)return;deco.drag=false;if(moved){deco.grabbed=null;SFX.pop();renderDeco();}}
// somewhere free to put a new piece: the middle of the floor if it's clear, otherwise the nearest clear spot
function decoFreeSpot(){const D=inside.room.dio;for(let r=0;r<D.R-0.4;r+=0.35)for(let a=0;a<6.28;a+=0.5){const x=Math.cos(a)*r,z=0.4+Math.sin(a)*r*0.8,[cx,cz]=dioClamp(D,0,x,z);
    if(!S.room.some(i=>i.lv===0&&Math.hypot(i.x-cx,i.z-cz)<0.7))return{x:cx,z:cz};if(!r)break;}return{x:0,z:0.4};}
function decoPlace(k){if((S.rinv[k]||0)<1)return;S.rinv[k]--;if(!S.rinv[k])delete S.rinv[k];const s=decoFreeSpot(),id=S.roomId=(S.roomId||S.room.length+1)+1;
  const it={id,k,x:s.x,z:s.z,r:0,lv:0,c:RI[k]&&RI[k].tint?TINTS[(Math.random()*TINTS.length)|0]:undefined};S.room.push(it);syncRoomItems();deco.sel=id;decoMark();
  const g=inside.room.byId.get(id);if(g)burst(g.position.x,0.6,g.position.z,0xfff0c0,10,1.2,0.06);SFX.place();renderDeco();}
function decoBuy(k){const r=RI[k];if(!r)return;if(r.star&&(S.cosyMax||0)<r.star){toast(`Make your home ${starStr(r.star)} cosy to unlock the ${r.n}.`);return;}
  if(S.shells<r.cost){toast(`The ${r.n} costs ${r.cost} shells.`);SFX.no&&SFX.no();return;}S.shells-=r.cost;S.rinv[k]=(S.rinv[k]||0)+1;SFX.coin();updateHUD();decoPlace(k);}
function decoAct(a){const it=S.room.find(i=>i.id===deco.sel);if(!it)return;const g=inside.room.byId.get(it.id);
  if(a==='rot'){it.r=((it.r||0)+Math.PI/4)%(Math.PI*2);if(g)g.rotation.y=it.r;SFX.ui();}
  if(a==='col'){const i=TINTS.indexOf(itemTint(it));it.c=TINTS[(i+1)%TINTS.length];syncRoomItems();deco.sel=it.id;decoMark();SFX.pop();}
  if(a==='store'){if(RI[it.k]&&RI[it.k].fixed){toast(it.k==='bed'?'You need somewhere to sleep!':'Your workbench stays: it’s where you craft.');return;}
    S.room.splice(S.room.indexOf(it),1);S.rinv[it.k]=(S.rinv[it.k]||0)+1;deco.sel=null;syncRoomItems();SFX.pop();}
  if(a==='done'){deco.sel=null;decoMark();}
  renderDeco();}
function decoLook(t,id){const o=RLOOK[t][id];if(o.star&&(S.cosyMax||0)<o.star){toast(`Make your home ${starStr(o.star)} cosy to unlock ${o.n}.`);return;}
  if(!lookOwned(t,id)){if(S.shells<o.cost){toast(`${o.n} costs ${o.cost} shells.`);return;}S.shells-=o.cost;(S.rown||(S.rown=[])).push(t+':'+id);SFX.coin();updateHUD();}
  roomLook()[t]=id;rebuildHomeRoom();SFX.pop();renderDeco();}
// rebuild the room's shell around you after a change of look, keeping you, your pieces and your place
function rebuildHomeRoom(){const I=inside;if(!I||I.kind!=='home')return;const old=I.room;old.g.remove(I.me);roomScene.remove(old.g);old.g.traverse(o=>{if(o.isMesh&&!o.geometry.userData.keep)o.geometry.dispose();});
  const r=buildRoom('home');roomScene.add(r.g);r.g.add(I.me);I.room=r;syncRoomItems();}
function thumbOf(k){if(decoThumbs[k])return decoThumbs[k];try{decoThumbs[k]=snapThumb(roomItemGroup(k,RI[k]&&RI[k].tint?TINTS[(k.length*5)%TINTS.length]:0x9ad0a0,3),64);}catch(e){decoThumbs[k]='';}return decoThumbs[k];}
const hexc=c=>'#'+(c>>>0).toString(16).padStart(6,'0');
function swatch(t,o){if(t==='style')return`<i class="sw roof r-${Object.keys(RLOOK.style).find(k=>RLOOK.style[k]===o)}"></i>`;
  if(t==='floor')return`<i class="sw" style="background:repeating-linear-gradient(90deg,${o.c.map((c,i)=>`${hexc(c)} ${i*10}px ${(i+1)*10}px`).join(',')})"></i>`;
  if(t==='lights')return o.c==='rainbow'?'<i class="sw" style="background:conic-gradient(#f77,#fb6,#fe6,#7d7,#7bf,#b8f,#f77)"></i>':`<i class="sw" style="background:${o.c==null?'repeating-linear-gradient(45deg,#eee 0 6px,#ccc 6px 12px)':hexc(o.c)}"></i>`;
  if(o.c==null)return'<i class="sw" style="background:repeating-linear-gradient(45deg,#eee 0 6px,#ccc 6px 12px)"></i>';
  if(o.pat==='rainbow')return'<i class="sw" style="background:radial-gradient(circle,#b8f 0 20%,#7bf 20% 40%,#7d7 40% 60%,#fb6 60% 80%,#f77 80%)"></i>';
  return`<i class="sw" style="background:${o.c2?`radial-gradient(circle at 30% 30%,${hexc(o.c2)} 0 22%,transparent 23%),linear-gradient(90deg,${hexc(o.c)} 50%,${hexc(o.c2)} 50%)`:hexc(o.c)}"></i>`;}
function renderDeco(){if(!deco)return;const c=cosyCheck(),tabs=[['mine','My things'],['shop','Catalogue'],['look','Room']];
  let h=`<div class="dtop"><span class="stars" title="Cosiness">${starStr(c.stars)}</span><span class="tip">${c.tip}</span><button class="pbtn go" data-d="close">Done</button></div>`;
  h+=`<div class="dtabs">${tabs.map(([k,n])=>`<button class="${deco.tab===k?'on':''}" data-dt="${k}">${n}</button>`).join('')}</div>`;
  if(deco.tab==='look')h+=`<div class="dtabs sub">${RLOOK_TABS.map(([k,n])=>`<button class="${deco.sub===k?'on':''}" data-ds="${k}">${n}</button>`).join('')}</div>`;
  h+='<div class="drow">';
  if(deco.tab==='mine'){const ks=Object.keys(S.rinv||{});if(!ks.length)h+=`<p class="dnote">Everything you own is out. Buy more in the Catalogue, or tap a piece in the room to move it.</p>`;
    for(const k of ks)h+=`<button class="dcard" data-place="${k}"><img src="${thumbOf(k)}" alt=""><span>${RI[k]?RI[k].n:k}</span><b>×${S.rinv[k]}</b></button>`;}
  else if(deco.tab==='shop'){for(const k of Object.keys(RI)){const r=RI[k],lock=r.star&&(S.cosyMax||0)<r.star,own=(S.rinv[k]||0)+S.room.filter(i=>i.k===k).length;
      h+=`<button class="dcard${lock?' lock':''}" data-buy="${k}"><img src="${thumbOf(k)}" alt=""><span>${r.n}</span><b>${lock?starStr(r.star).replace(/☆/g,''):r.cost+' 🐚'}</b>${own?`<em>${own}</em>`:''}</button>`;}}
  else{const t=deco.sub,L=roomLook();for(const id of Object.keys(RLOOK[t])){const o=RLOOK[t][id],own=lookOwned(t,id),lock=o.star&&(S.cosyMax||0)<o.star;
      h+=`<button class="dcard look${L[t]===id?' on':''}${lock?' lock':''}" data-look="${t}:${id}">${swatch(t,o)}<span>${o.n}</span><b>${L[t]===id?'In use':own?'Owned':lock?starStr(o.star).replace(/☆/g,''):o.cost+' 🐚'}</b></button>`;}}
  h+='</div>';$('decoTray').innerHTML=h;renderDecoSel();requestAnimationFrame(()=>roomView($('decoTray').offsetHeight));}
function renderDecoSel(){const el=$('decoSel');const it=deco&&deco.sel&&S.room.find(i=>i.id===deco.sel);if(!it){el.hidden=true;return;}const r=RI[it.k]||{};
  el.hidden=false;el.innerHTML=`<span class="nm">${r.n||it.k}</span><button data-da="rot">⟳ Turn</button>${r.tint?'<button data-da="col">🎨 Colour</button>':''}${r.fixed?'':'<button data-da="store">Put away</button>'}<button data-da="done">✓</button>`;
  el.style.bottom=($('decoTray').offsetHeight+10)+'px';}
$('decoTray').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!deco)return;const d=b.dataset;
  if(d.d==='close'){decoClose();return;}if(d.dt){deco.tab=d.dt;SFX.ui();renderDeco();return;}if(d.ds){deco.sub=d.ds;SFX.ui();renderDeco();return;}
  if(d.place){decoPlace(d.place);return;}if(d.buy){decoBuy(d.buy);return;}if(d.look){const [t,id]=d.look.split(':');decoLook(t,id);}});
$('decoSel').addEventListener('click',e=>{const b=e.target.closest('button');if(b&&deco)decoAct(b.dataset.da);});
// the pieces that move: the disco ball turns, the lava lamp bubbles, the marker under what you've picked up pulses
function decoTick(dt,tt){const R=inside&&inside.room;if(!R||!R.itemsG)return;if(R.mark)R.mark.scale.setScalar(1+Math.sin(tt*6)*0.08);
  for(const g of R.itemsG.children){const k=g.userData.it.k;if(k==='discoball')g.children.forEach(m=>{if(m.userData.lum)m.rotation.y=tt*0.8;});
    if(deco&&g.userData.it.id===deco.sel)g.position.y=(g.userData.it.lv?R.dio.LY:0)+0.06+Math.abs(Math.sin(tt*5))*0.05;else g.position.y=g.userData.it.lv?R.dio.LY:0;}}
// sleeping at home: the cosier it is, the better you sleep
function restAtHome(){const c=cosyScore();S.rest={d:S.day,n:c.stars};const gift=c.stars*40;S.shells+=gift;
  setTimeout(()=>toast(c.stars?`Well rested ${starStr(c.stars)}: <b>+${c.stars*10}% XP</b> all today${gift?`, and ${gift} shells turned up under your pillow`:''}.`:'You slept… okay. A cosier home means a better night’s sleep.',c.stars?'rare':'',ICON.star),2600);}
const restMul=()=>S.rest&&S.rest.d===S.day?1+0.1*S.rest.n:1;
