/* =========================================================
   More to the farm (builds on the ranch, 75b).
   Caring for animals
   - Babies: animals you buy arrive young (chicks, ducklings, calves, kids, lambs, piglets: small, and too young to
     give anything) and grow up in a few days. Happy barn animals sometimes have a baby of their own (if there's room),
     and the coop has an incubator: put an egg in it and it hatches in two days.
   - Each day, besides a pat: Brush them (a little more friendship and a shine), and give them a Treat of their
     favourite crop (much more friendship, and a happy hop). The card shows their mood and today's checklist.
   - Dress up: a bow, a flower crown, a bandana, a bell or a straw hat (a.acc), for pets too.
   Farm pieces (decor you buy or make)
   - Feed Trough: fill it with hay from your bag; animals eat from troughs before your bag on rainy and winter days.
   - Water Trough: animals living nearby are happier (friendship every morning).
   - Doghouse / Cat Bed: your pet sleeps there at night, and a pet with its own bed brings gifts more often.
   - Duck Pond: ducks near one are happier. Plus a pet bowl, milk churns, a nesting box, a hay stack, a farm cart, a
     tractor, a farm sign, a white rail fence and a dry-stone wall.
   Machines (artisan goods take time now, like a real farm): put something in and come back later.
     Mayonnaise Machine (eggs, 3h) · Cheese Press (milk, 4h) · Loom (wool, 6h) · Oil Maker (truffles, 6h)
     Preserves Jar (berries or fruit → jam, 1 day) · Keg (fruit → cider, grapes → grape juice, 2 days)
     Compost Bin (any crop → 2 fertiliser, 1 day). A light shows when one is working, and it sparkles when ready.
   ========================================================= */
const FAV={chicken:['corn','wheat'],duck:['peas','lettuce'],cow:['carrot','cabbage'],goat:['lettuce','strawberry'],sheep:['wheat','turnip'],pig:['pumpkin','potato']};
const GROW={chicken:3,duck:3,cow:5,goat:5,sheep:5,pig:5},BABY={chicken:'chick',duck:'duckling',cow:'calf',goat:'kid',sheep:'lamb',pig:'piglet'};
const ACCS=[null,'bow','crown','bandana','bell','hat'],ACC_N={bow:'a bow',crown:'a flower crown',bandana:'a bandana',bell:'a bell',hat:'a straw hat'};
const isBaby=a=>a.born!=null&&S.day-a.born<(GROW[a.k]||4);
Object.assign(CONSUM,{cider:{name:'Cider',price:420,sell:1,cat:'artisan',desc:'Sweet, cloudy apple-and-pear cider.'},grapejuice:{name:'Grape Juice',price:900,sell:1,cat:'artisan',desc:'Rich, dark and fragrant.'}});
(function(){const mk=f=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');f(x);return c.toDataURL();};
  const bot=(x,glass,fill,label)=>{x.fillStyle=glass;x.strokeStyle='#4a3a2a';x.lineWidth=2.5;x.beginPath();x.moveTo(27,6);x.lineTo(37,6);x.lineTo(37,20);x.quadraticCurveTo(46,24,46,34);x.lineTo(46,56);x.lineTo(18,56);x.lineTo(18,34);x.quadraticCurveTo(18,24,27,20);x.closePath();x.fill();x.stroke();
    x.fillStyle=fill;x.fillRect(20,36,24,18);x.fillStyle=label;x.fillRect(21,38,22,10);x.fillStyle='rgba(255,255,255,.5)';x.fillRect(22,24,3,28);x.fillStyle='#a87a3a';x.fillRect(26,2,12,6);};
  for(const [k,f] of [['cider',x=>bot(x,'#f0c870','#e8a840','#fbf3d8')],['grapejuice',x=>bot(x,'#7a3a6a','#5a2a5a','#e8d8f0')]])try{Object.defineProperty(ICON,'x:'+k,{value:mk(f),writable:true,configurable:true,enumerable:true});}catch(e){}})();
// ---- new farm pieces
Object.assign(BUILD,{
  trough:{name:'Feed Trough',cost:600,lvl:2,rot:true,desc:'Fill it with hay. Animals eat from it on rainy and winter days, before your bag.'},
  watertrough:{name:'Water Trough',cost:700,lvl:2,rot:true,desc:'Animals that live nearby are happier.'},
  doghouse:{name:'Doghouse',cost:1200,lvl:1,rot:true,desc:'Your pet sleeps here at night, and brings you gifts more often.'},
  catbed:{name:'Cat Bed',cost:900,lvl:1,rot:true,desc:'A cushioned basket. Your pet sleeps here at night.'},
  petbowl:{name:'Pet Bowl',cost:150,lvl:1,desc:'A bowl with your pet’s name on it.'},
  churns:{name:'Milk Churns',cost:300,lvl:2,desc:'Old milk churns, for the look of a dairy.'},
  nestbox:{name:'Nesting Box',cost:350,lvl:2,rot:true,desc:'Straw-lined boxes for hens.'},
  haystack:{name:'Hay Stack',cost:400,lvl:1,desc:'A tall golden stack of hay.'},
  farmcart:{name:'Farm Cart',cost:1500,lvl:2,rot:true,desc:'A wooden cart piled with sacks.'},
  tractor:{name:'Little Tractor',cost:8000,lvl:4,rot:true,desc:'A cheerful red tractor.'},
  farmsign:{name:'Farm Sign',cost:300,lvl:1,rot:true,desc:'A sign with your farm’s name.'},
  duckpond:{name:'Duck Pond',cost:2000,lvl:3,desc:'A little pond with reeds. Ducks nearby are happier.'},
  railfence:{name:'Rail Fence',cost:40,lvl:1,multi:true,rot:true,desc:'A white rail fence, ranch style.'},
  stonewall:{name:'Stone Wall',cost:60,lvl:1,multi:true,rot:true,desc:'A dry-stone wall, mossy on top.'},
  // machines
  mayomaker:{name:'Mayonnaise Machine',cost:2000,lvl:2,rot:true,desc:'Put in an egg: mayonnaise in 3 hours.'},
  cheesepress:{name:'Cheese Press',cost:3000,lvl:3,rot:true,desc:'Put in milk: cheese in 4 hours.'},
  loom:{name:'Loom',cost:4000,lvl:4,rot:true,desc:'Put in wool: cloth in 6 hours.'},
  oilmaker:{name:'Oil Maker',cost:5000,lvl:5,rot:true,desc:'Put in a truffle: truffle oil in 6 hours.'},
  presjar:{name:'Preserves Jar',cost:1200,lvl:2,desc:'Berries or fruit become jam by tomorrow.'},
  keg:{name:'Keg',cost:2500,lvl:3,rot:true,desc:'Fruit becomes cider, grapes become grape juice, in 2 days.'},
  compost:{name:'Compost Bin',cost:500,lvl:1,rot:true,desc:'Any crop becomes two fertiliser by tomorrow.'}});
Object.assign(OBJ_H,{trough:0.4,watertrough:0.4,doghouse:0.8,catbed:0.3,petbowl:0.15,churns:0.5,nestbox:0.6,haystack:0.9,farmcart:0.8,tractor:0.9,farmsign:0.9,duckpond:0.2,railfence:0.5,stonewall:0.45,
  mayomaker:0.8,cheesepress:0.8,loom:1.0,oilmaker:0.9,presjar:0.6,keg:0.7,compost:0.7});
// the machines: what each takes and makes, and how many hours it takes
const MACH={
  mayomaker:{h:3,take:{'x:egg':['mayo',1],'x:legg':['mayo',2],'x:duckegg':['dmayo',1]}},
  cheesepress:{h:4,take:{'x:milk':['cheese',1],'x:lmilk':['cheese',2],'x:goatmilk':['gcheese',1]}},
  loom:{h:6,take:{'x:wool':['cloth',1]}},
  oilmaker:{h:6,take:{'g:truffle':['toil',1]}},
  presjar:{h:24,take:k=>/^g:(berries|blackberries|huckleberries|redcurrants|gooseberries|cloudberries|apple|pear|peach|cherries)$/.test(k)?['jam',1]:/^(strawberry|blueberry)\|/.test(k)?['jam',1]:null},
  keg:{h:48,take:k=>/^g:(apple|pear|peach|cherries)$/.test(k)?['cider',1]:/^grape\|/.test(k)?['grapejuice',1]:null},
  compost:{h:24,take:k=>k.includes('|')?['fert',2]:null}};
// the instant artisan recipes give way to the machines (the treats and the omelette stay)
for(let i=RECIPES.length-1;i>=0;i--){const r=RECIPES[i];if(r.out[0]==='x'&&/^(mayo|dmayo|cheese|gcheese|cloth|toil)$/.test(r.out[1]))RECIPES.splice(i,1);}
RECIPES.push(
  {out:['b','mayomaker',1],in:{'m:wood':15,'m:stone':10},lvl:2},{out:['b','cheesepress',1],in:{'m:wood':20,'m:stone':20},lvl:3},{out:['b','loom',1],in:{'m:wood':30,'m:fiber':30},lvl:4},
  {out:['b','oilmaker',1],in:{'m:wood':20,'m:stone':30,'g:truffle':1},lvl:5},{out:['b','presjar',1],in:{'m:wood':10,'m:stone':6},lvl:2},{out:['b','keg',1],in:{'m:wood':30},lvl:3},{out:['b','compost',1],in:{'m:wood':12},lvl:1},
  {out:['b','trough',1],in:{'m:wood':10},lvl:2},{out:['b','watertrough',1],in:{'m:stone':12},lvl:2},{out:['b','doghouse',1],in:{'m:wood':20},lvl:1},{out:['b','catbed',1],in:{'m:fiber':15},lvl:1},
  {out:['b','petbowl',1],in:{'m:stone':4},lvl:1},{out:['b','churns',1],in:{'m:stone':6},lvl:2},{out:['b','nestbox',1],in:{'m:wood':6,'m:fiber':4},lvl:2},{out:['b','haystack',1],in:{'x:hay':20},lvl:1},
  {out:['b','farmcart',1],in:{'m:wood':25},lvl:2},{out:['b','farmsign',1],in:{'m:wood':6},lvl:1},{out:['b','duckpond',1],in:{'m:stone':20},lvl:3},{out:['b','railfence',4],in:{'m:wood':2},lvl:1},{out:['b','stonewall',4],in:{'m:stone':3},lvl:1});
const FARM_DECOR=new Set(['trough','watertrough','doghouse','catbed','petbowl','churns','nestbox','haystack','farmcart','tractor','farmsign','duckpond','railfence','stonewall',...Object.keys(MACH)]);
const gameT=()=>S.day*24+S.hour;
function farmObjAt(){return objCtx?objAt(objCtx.x,objCtx.z):null;}

// ---- the models
function farmDecor(kind,g){if(!FARM_DECOR.has(kind))return false;const p=[],gl=[],o=farmObjAt(),W=0x9a6a3e,WD=0x6e4a2a,ST=0xa8a49c,dk=(c,f=0.8)=>lerpHex(c,0x000000,1-f);
  const box=(c,x,y,z,w,h,d,rx=0,ry=0,rz=0)=>p.push(P(BOX,c,x,y,z,rx,ry,rz,w,h,d));
  switch(kind){
    case'trough':{for(const sx of [-1,1])box(WD,sx*0.36,0.1,0,0.06,0.2,0.36);box(W,0,0.2,0,0.84,0.06,0.36);for(const sz of [-1,1])box(W,0,0.28,sz*0.16,0.84,0.18,0.04,sz*0.25);for(const sx of [-1,1])box(W,sx*0.42,0.28,0,0.04,0.16,0.32);
      if(o&&o.hay>0){const f=Math.min(1,o.hay/30);for(let i=0;i<10;i++)p.push(P(SPH_LO,i%2?0xe8c860:0xd8b040,-0.32+i*0.07,0.26+f*0.08,(i%3-1)*0.06,0,i,0,0.12,0.06+f*0.06,0.12));}break;}
    case'watertrough':{box(ST,0,0.18,0,0.8,0.3,0.42);box(0x4aa0d0,0,0.32,0,0.68,0.02,0.3);gl.push(P(BOX,0x7ac8f0,0.1,0.335,0,0,0,0,0.3,0.005,0.12));for(let i=0;i<4;i++)box(dk(ST,0.9),-0.3+i*0.2,0.12,0.215,0.02,0.2,0.01);break;}
    case'doghouse':{box(0xc8503a,0,0.3,0,0.62,0.6,0.62);p.push(P(PRISM,0x5a6a8a,0,0.6+0.12,0,0,0,0,0.78/1.732,0.36/1.5,0.72));box(0x2a2026,0,0.24,0.315,0.26,0.34,0.01);p.push(P(A_HALF,0x2a2026,0,0.41,0.315,0,0,0,0.26,0.26,0.01));
      box(0xf4ece0,0,0.58,0.32,0.3,0.08,0.01);p.push(P(SPH_XS,0xf6d04a,0.22,0.08,0.4,0,0,0,0.12,0.04,0.08));break;}
    case'catbed':{p.push(PG(CYL12,0xb07a4a,dk(0xb07a4a),0,0.08,0,0,0,0,0.62,0.16,0.62),P(CYL12,0xe8b0b8,0,0.14,0,0,0,0,0.5,0.06,0.5),P(SPH_LO,0xf4d0d8,0,0.15,0,0,0,0,0.4,0.08,0.4));break;}
    case'petbowl':{p.push(PG(CYL12,0xd8483e,0xa8302a,0,0.05,0,0,0,0,0.3,0.1,0.3),P(CYL12,0xc89a5a,0,0.1,0,0,0,0,0.22,0.02,0.22));for(let i=0;i<6;i++)p.push(P(SPH_XS,0x8a5a3a,(i%3-1)*0.05,0.115,(i>2?0.03:-0.03),0,0,0,0.04,0.025,0.04));break;}
    case'churns':{for(const [x,z,s] of [[-0.14,0,1],[0.16,0.08,0.85],[0.06,-0.18,0.9]]){p.push(PG(CYL12,0xc8ccd0,0x8a8e94,x,0.2*s,z,0,0,0,0.2*s,0.4*s,0.2*s),P(CYL12,0xb0b4ba,x,0.42*s,z,0,0,0,0.12*s,0.06*s,0.12*s),P(CYL12,0x9a9ea4,x,0.46*s,z,0,0,0,0.15*s,0.03*s,0.15*s),P(CYL12,0x5a6a8a,x,0.25*s,z,0,0,0,0.205*s,0.04*s,0.205*s));}break;}
    case'nestbox':{for(const sx of [-1,1])box(WD,sx*0.36,0.2,0,0.05,0.4,0.36);box(W,0,0.42,0,0.8,0.04,0.38);box(W,0,0.04,0,0.8,0.04,0.38);box(W,0,0.42,-0.17,0.8,0.4,0.03);box(W,0,0.24,0,0.03,0.4,0.36);
      p.push(P(PRISM,0xb8583e,0,0.44+0.06,0,0,1.5708,0,0.42/1.732,0.18/1.5,0.86));for(const sx of [-1,1]){for(let i=0;i<5;i++)p.push(P(SPH_LO,0xe8c860,sx*0.18+(i-2)*0.05,0.1,0.03,0,i,0,0.08,0.05,0.08));p.push(P(SPH_LO,0xfbf2e0,sx*0.18,0.14,0.04,0,0,0,0.09,0.11,0.09));}break;}
    case'haystack':{p.push(PG(SPH_LO,0xf0d070,0xc8a040,0,0.32,0,0,0,0,0.8,0.7,0.8),PG(CONE12,0xf0d070,0xd8b050,0,0.72,0,0,0,0,0.5,0.4,0.5));for(let i=0;i<14;i++){const a=i*0.45;p.push(P(BOX,0xe8c860,Math.cos(a)*0.38,0.3+(i%3)*0.12,Math.sin(a)*0.38,0.3,a,0.4,0.02,0.18,0.02));}break;}
    case'farmcart':{box(W,0,0.34,0,0.9,0.06,0.56);for(const sz of [-1,1])box(WD,0,0.44,sz*0.27,0.9,0.16,0.04);box(WD,-0.43,0.44,0,0.04,0.16,0.56);
      for(const sz of [-1,1]){p.push(P(CYL12,0x5a3a24,0.1,0.22,sz*0.32,1.5708,0,0,0.42,0.05,0.42),P(CYL12,0x8a6a44,0.1,0.22,sz*0.34,1.5708,0,0,0.1,0.06,0.1));}
      box(WD,0.62,0.3,0.12,0.5,0.04,0.04,0,0,-0.2);box(WD,0.62,0.3,-0.12,0.5,0.04,0.04,0,0,-0.2);for(const [x,c] of [[-0.2,0xd8c8a0],[0.12,0xc8b890],[-0.05,0xe8c860]])p.push(P(SPH_LO,c,x,0.48,0,0,0,0,0.3,0.26,0.36));break;}
    case'tractor':{const R=0xd8403a;box(R,0.1,0.42,0,0.6,0.32,0.42);box(R,-0.18,0.62,0,0.3,0.36,0.38);gl.push(P(BOX,0x8ab8d0,-0.18,0.68,0,0,0,0,0.31,0.2,0.3));box(dk(R,0.8),-0.18,0.82,0,0.4,0.04,0.46);
      box(0x3a3a3e,0.3,0.7,0,0.06,0.3,0.06);for(const sz of [-1,1]){p.push(P(CYL12,0x2a2a2e,-0.22,0.32,sz*0.28,1.5708,0,0,0.64,0.14,0.64),P(CYL12,0xf6d04a,-0.22,0.32,sz*0.36,1.5708,0,0,0.3,0.02,0.3),P(CYL12,0x2a2a2e,0.36,0.18,sz*0.24,1.5708,0,0,0.36,0.12,0.36),P(CYL12,0xf6d04a,0.36,0.18,sz*0.31,1.5708,0,0,0.16,0.02,0.16));}
      gl.push(P(CYL12,0xfff0b8,0.41,0.46,0.12,0,0,1.5708,0.08,0.02,0.08),P(CYL12,0xfff0b8,0.41,0.46,-0.12,0,0,1.5708,0.08,0.02,0.08));break;}
    case'farmsign':{for(const sx of [-1,1])box(WD,sx*0.34,0.36,0,0.06,0.72,0.06);box(W,0,0.68,0,0.82,0.3,0.05);box(0xf4ece0,0,0.68,0.03,0.72,0.2,0.01);
      for(let i=0;i<5;i++)box([0x4a7a3a,0x8a5a3a,0xd8483e,0x4a7a3a,0x8a5a3a][i],-0.24+i*0.12,0.68,0.04,0.07,0.08,0.005);for(let i=0;i<4;i++)bloom(p,[0xf2a6c8,0xf6d04a,0xffffff,0xe86a5a][i],0xf6d04a,-0.3+i*0.2,0.06,0.12,0.06);break;}
    case'duckpond':{p.push(PG(CYL12,0xa8a49c,0x8a8680,0,0.04,0,0,0,0,0.98,0.08,0.88),P(CYL12,0x5aa8c8,0,0.075,0,0,0,0,0.82,0.02,0.72));gl.push(P(CYL12,0x8ad0e8,0.12,0.088,-0.1,0,0,0,0.3,0.003,0.2));
      for(const [x,z] of [[-0.4,-0.2],[0.38,0.24]])for(let i=0;i<5;i++)p.push(P(CYL6,0x5a8a3a,x+(i%3-1)*0.04,0.18,z+(i>2?0.04:-0.03),0.1*(i-2),0,0,0.012,0.3,0.012),P(CYL6,0x7a4a2a,x+(i%3-1)*0.04,0.33,z,0,0,0,0.025,0.06,0.025));
      p.push(P(CYL12,0x4a9a4a,0.15,0.09,0.18,0,0,0,0.18,0.01,0.18),P(SPH_XS,0xf2a6c8,0.16,0.1,0.2,0,0,0,0.06,0.04,0.06));break;}
    case'railfence':{for(const sx of [-1,1])box(0xf4f0e8,sx*0.45,0.26,0,0.08,0.52,0.08);for(const y of [0.2,0.42])box(0xf4f0e8,0,y,0,1.0,0.07,0.04);box(0xd8d4cc,0,0.53,0,0.1,0.02,0.1);break;}
    case'stonewall':{for(let r=0;r<3;r++)for(let i=0;i<4;i++){const x=-0.38+i*0.25+(r%2)*0.12;if(x>0.48)continue;p.push(PG(SPH_LO,lerpHex(ST,0x8a7a6a,((i+r)%3)/4),dk(ST,0.8),x,0.08+r*0.13,(i%2-0.5)*0.03,0,i,0,0.28,0.15,0.3));}for(let i=0;i<4;i++)p.push(P(SPH_LO,0x6a9a4a,-0.33+i*0.22,0.44,0,0,0,0,0.16,0.05,0.2));break;}
    // machines: the light shows working (amber) or ready (green)
    default:{const J=o&&o.job,ready=J&&gameT()>=J.at,lc=ready?0x7ae07a:J?0xffb040:0x5a5a60;
      if(kind==='mayomaker'){box(0xe8e0d0,0,0.32,0,0.5,0.56,0.42);box(0xd8483e,0,0.64,0,0.54,0.08,0.46);p.push(PG(CONE12,0xc8ccd0,0x9aa0a8,0,0.78,0,3.14,0,0,0.3,0.22,0.3));box(0x5a5a60,0,0.2,0.215,0.3,0.14,0.02);}
      else if(kind==='cheesepress'){box(W,0,0.18,0,0.62,0.12,0.5);for(const sx of [-1,1])box(WD,sx*0.26,0.5,0,0.06,0.72,0.06);box(W,0,0.86,0,0.62,0.08,0.16);p.push(P(CYL8,0x8a8e94,0,0.7,0,0,0,0,0.06,0.3,0.06),P(CYL12,0xf6d04a,0,0.33,0,0,0,0,0.36,0.18,0.36),P(BOX,0x8a8e94,0,0.92,0,0,0,0,0.5,0.03,0.03));}
      else if(kind==='loom'){for(const sx of [-1,1])for(const sz of [-1,1])box(WD,sx*0.36,0.48,sz*0.22,0.05,0.96,0.05);box(W,0,0.92,0,0.78,0.05,0.5);box(W,0,0.42,0.22,0.78,0.05,0.05);
        for(let i=0;i<10;i++)box(i%2?0xe8dccb:0xa8c4e0,-0.3+i*0.066,0.62,0,0.012,0.56,0.4,0.6);box(0xd8c0e8,0,0.5,0.05,0.62,0.1,0.3);}
      else if(kind==='oilmaker'){p.push(PG(CYL12,0xb8a88a,0x8a7a5a,0,0.3,0,0,0,0,0.5,0.6,0.5),P(CYL12,0x6a5a4a,0,0.62,0,0,0,0,0.56,0.06,0.56),P(CYL8,0x8a8e94,0.32,0.3,0,0,0,1.5708,0.08,0.18,0.08),P(SPH_XS,0xd8b850,0.42,0.25,0,0,0,0,0.06,0.08,0.06));}
      else if(kind==='presjar'){p.push(P(CYL12,0xc8403a,0,0.21,0,0,0,0,0.42,0.38,0.42),P(CYL12,0xe8f0f4,0,0.43,0,0,0,0,0.4,0.08,0.4),P(CYL12,0xd8b850,0,0.5,0,0,0,0,0.44,0.06,0.44),P(CYL12,0xf4ece0,0,0.55,0,0,0,0,0.3,0.03,0.3),P(BOX,0xf4ece0,0,0.24,0.21,0,0,0,0.2,0.14,0.01));}
      else if(kind==='keg'){p.push(PG(CYL12,0x9a6a3e,0x6e4a2a,0,0.34,0,0,0,0,0.5,0.62,0.5),P(CYL12,0x4a4a4e,0,0.12,0,0,0,0,0.52,0.04,0.52),P(CYL12,0x4a4a4e,0,0.56,0,0,0,0,0.52,0.04,0.52),P(CYL12,0x6e4a2a,0,0.66,0,0,0,0,0.44,0.03,0.44),P(CYL8,0x8a8e94,0,0.2,0.27,1.5708,0,0,0.05,0.1,0.05));}
      else{/* compost */box(0x5a8a4a,0,0.32,0,0.62,0.6,0.56);for(let i=0;i<5;i++)box(dk(0x5a8a4a,0.85),-0.24+i*0.12,0.32,0.285,0.02,0.58,0.01);box(dk(0x5a8a4a,0.75),0,0.64,0,0.66,0.06,0.6);}
      gl.push(P(SPH_XS,lc,kind==='presjar'?0.18:0.2,kind==='loom'?0.96:kind==='presjar'?0.55:0.68,kind==='presjar'?0.12:0.2,0,0,0,0.07,0.07,0.07));
      if(ready)g.userData.sparkle=true;}}
  g.add(M(p));if(gl.length)g.add(M(gl,glowMat));return true;}

// ---- machines
function machineTap(o){const Mc=MACH[o.k],B=BUILD[o.k];walkTo(o.x,o.z);const J=o.job;
  if(J){if(gameT()>=J.at){gain('x:'+J.out,J.n);SFX.coin();floatText(o.x,topY(o.x,o.z)+1,o.z,`+${J.n>1?J.n+'× ':''}${CONSUM[J.out].name}`);burst(o.x,topY(o.x,o.z)+0.6,o.z,0xfff0a0,12,1.2,0.07);o.job=null;syncObjs();save();updateHUD();return;}
    const left=J.at-gameT(),hh=Math.floor(left),mm=Math.round((left-hh)*60);toast(`${B.name}: ${CONSUM[J.out].name} ready in ${hh?hh+'h ':''}${mm}m.`,'',ICON['x:'+J.out]);return;}
  const take=typeof Mc.take==='function'?Mc.take:k=>Mc.take[k]||null;const ks=Object.keys(S.inv).filter(k=>S.inv[k]>0&&take(k)).slice(0,4);
  if(!ks.length){toast(`${B.name}: ${B.desc}`,'',THUMB[o.k]);return;}
  setAction(`<b>${B.name}</b> · what goes in?`,[...ks.map(k=>({label:nameOf(k).replace(/^(.{14}).+$/,'$1…'),cls:'go',fn:()=>{const [out,n]=take(k);S.inv[k]--;if(!S.inv[k])delete S.inv[k];o.job={out,n,at:gameT()+Mc.h};SFX.place();
    toast(`${CONSUM[out].name} will be ready in ${Mc.h>=24?Math.round(Mc.h/24)+' day'+(Mc.h>=48?'s':''):Mc.h+' hours'}.`,'',ICON['x:'+out]);syncObjs();save();clearAction();updateHUD();}})),{label:'Close',fn:clearAction}],B.name);}
let machT=0,machSig='';
function updateFarm(dt){machT-=dt;if(machT>0)return;machT=2;const t=gameT();let sig='';for(const o of S.objs)if(o.job)sig+=o.id+(t>=o.job.at?'r':'w');if(sig!==machSig){const was=machSig;machSig=sig;if(was)syncObjs();}}
// ---- troughs: filling them, and the hay animals eat from
function troughTap(o){walkTo(o.x,o.z);const have=S.inv['x:hay']||0,cap=40,h=o.hay||0;
  setAction(`<b>Feed Trough</b> · ${h}/${cap} hay<br><small>Animals eat from troughs on rainy and winter days, before the hay in your bag.</small>`,[{label:`Fill (${Math.min(have,cap-h)})`,cls:'go',disabled:!have||h>=cap,fn:()=>{const n=Math.min(have,cap-h);o.hay=h+n;S.inv['x:hay']-=n;if(!S.inv['x:hay'])delete S.inv['x:hay'];SFX.place();syncObjs();save();clearAction();}},{label:'Close',fn:clearAction}],'Trough');}
function takeHay(){for(const o of S.objs)if(o.k==='trough'&&o.hay>0){o.hay--;return true;}if(S.inv['x:hay']>0){S.inv['x:hay']--;if(!S.inv['x:hay'])delete S.inv['x:hay'];return true;}return false;}
const nearObj=(k,x,z,r)=>S.objs.some(o=>o.k===k&&Math.abs(o.x-x)<=r&&Math.abs(o.z-z)<=r);

// ---- caring for an animal: the card (after the first pat of the day), with brushing, treats and dressing up
function moodOf(a){const n=(a.pet===S.day)+(a.brush===S.day)+(a.treat===S.day);return a.hungry?'Hungry':n>=3?'Over the moon':n===2?'Very happy':n===1?'Happy':'A bit lonely';}
function careCard(h){const a=h.a,R0=RANCH[a.k],baby=isBaby(a),fav=FAV[a.k]||[],ft=Object.keys(S.inv).find(k=>S.inv[k]>0&&fav.includes(k.split('|')[0]));
  const left=baby?(GROW[a.k]-(S.day-a.born)):0,next=Math.max(1,R0.every-(a.n||0));
  const chk=(on,t)=>`<span style="opacity:${on?1:0.45}">${on?'✓':'○'} ${t}</span>`;
  const info=baby?`A baby ${BABY[a.k]}: grows up in ${left} day${left>1?'s':''}.`:a.k==='pig'?'Finds truffles on fair days.':`Next ${CONSUM[R0.prod]?CONSUM[R0.prod].name.toLowerCase():R0.prod} ${next>1?'in '+next+' days':'tomorrow'}, if fed.`;
  setAction(`<b>${a.name}</b> the ${baby?BABY[a.k]:R0.name.toLowerCase()} · <span class="hearts">${hrt(a.f)}</span> · ${moodOf(a)}<br><small>${chk(a.pet===S.day,'pat')} ${chk(a.brush===S.day,'brush')} ${chk(a.treat===S.day,'treat')} · ${info} Loves ${fav.map(f=>CROPS[f]?CROPS[f].name.toLowerCase():f).join(' and ')}.</small>`,
    [...(a.brush!==S.day?[{label:'Brush',cls:'go',fn:()=>{a.brush=S.day;a.f=Math.min(1000,(a.f||0)+8);h.happy=0.6;for(let i=0;i<10;i++)sparkle(h.x+(Math.random()-0.5)*0.5,h.g.position.y+0.25+Math.random()*0.3,h.z+(Math.random()-0.5)*0.5,0xfff6c0);tone(1320,0.05,'triangle',0.03);setTimeout(()=>tone(1560,0.06,'triangle',0.03),80);save();careCard(h);}}]:[]),
     ...(a.treat!==S.day&&ft?[{label:`Treat: ${CROPS[ft.split('|')[0]].name}`,cls:'go',fn:()=>{S.inv[ft]--;if(!S.inv[ft])delete S.inv[ft];a.treat=S.day;a.f=Math.min(1000,(a.f||0)+20);h.happy=1.2;if(h.a.k==='chicken'||h.a.k==='duck')h.flap=0.8;hearts(h.x,h.g.position.y+0.5,h.z);floatText(h.x,h.g.position.y+0.9,h.z,'Yum!');sayAnimal(a.k);save();updateHUD();careCard(h);}}]:[]),
     {label:'Dress up',fn:()=>{const i=(ACCS.indexOf(a.acc||null)+1)%ACCS.length;a.acc=ACCS[i];if(!a.acc)delete a.acc;syncRanch();save();toast(a.acc?`${a.name} is wearing ${ACC_N[a.acc]}!`:`${a.name}'s dressed down.`);careCard(herd.find(q=>q.a===a)||h);}},
     {label:'Rename',fn:()=>{const n=prompt(`A new name for ${a.name}?`,a.name);if(n&&n.trim()){a.name=n.trim().slice(0,14);save();}clearAction();}},{label:'Close',fn:clearAction}],baby?'Baby':R0.name);}
// accessories: drawn on the head (bow, crown, hat) or round the neck (bandana, bell); hr is the head's radius
const HEAD_R={chicken:0.11,duck:0.1,cow:0.18,goat:0.125,sheep:0.12,pig:0.165,dog:0.16,cat:0.145};
function accParts(acc,k){const r=HEAD_R[k]||0.13,q=[];
  if(acc==='bow'){const bx=r*0.62,by=r*0.72;for(const s of [-1,1])q.push(P(SPH,0xf06aa0,bx+s*r*0.3,by+s*r*0.12,0,0,0,s*0.5+0.4,r*0.48,r*0.3,r*0.22));q.push(P(SPH,0xd8488a,bx,by,0,0,0,0,r*0.2,r*0.2,r*0.2));}
  else if(acc==='crown'){for(let i=0;i<9;i++){const a=i/9*6.283;q.push(P(SPH,[0xf6d04a,0xf2a6c8,0xffffff][i%3],Math.cos(a)*r*0.66,r*1.0,Math.sin(a)*r*0.66-r*0.05,0,0,0,r*0.3,r*0.24,r*0.3));if(i%3===0)q.push(P(SPH_XS,0x6aa84a,Math.cos(a+0.35)*r*0.66,r*0.83,Math.sin(a+0.35)*r*0.66-r*0.05,0,0,0,r*0.16,r*0.08,r*0.12));}}
  else if(acc==='hat'){q.push(PG(CYL12,0xe8c870,0xc8a050,0,r*0.95,-r*0.05,0,0,0,r*2.1,r*0.08,r*2.1),PG(CYL12,0xe8c870,0xd8b060,0,r*1.18,-r*0.05,0,0,0,r*1.0,r*0.45,r*1.0),P(CYL12,0xd8483e,0,r*1.02,-r*0.05,0,0,0,r*1.04,r*0.12,r*1.04));}
  else if(acc==='bandana'){q.push(P(CYL12,0xd8403a,0,-r*0.85,0,0.3,0,0,r*1.6,r*0.25,r*1.5),P(CONE4,0xd8403a,0,-r*1.15,r*0.78,0.45,0.785,0,r*0.75,r*0.75,r*0.3));for(let i=0;i<3;i++)q.push(P(SPH_XS,0xffffff,(i-1)*r*0.3,-r*1.0,r*0.86,0,0,0,r*0.1,r*0.1,r*0.05));}
  else if(acc==='bell'){q.push(P(CYL12,0x4a7ad0,0,-r*0.85,-r*0.1,0.3,0,0,r*1.45,r*0.18,r*1.35),PG(SPH,0xf6d04a,0xc89a2a,0,-r*1.12,r*0.52,0,0,0,r*0.32,r*0.32,r*0.32));}
  return q;}

// ---- dawn: babies grow up, births, the incubator, troughs and water, and the pet's bed
function farmDawn(quiet){const R=RS();let msg=[];
  for(const a of R.animals){if(a.born!=null&&S.day-a.born===(GROW[a.k]||4)){msg.push(`${a.name} is all grown up!`);}
    const o=S.objs.find(q=>q.id===a.home);if(o&&nearObj('watertrough',o.x,o.z,6))a.f=Math.min(1000,(a.f||0)+3);if(o&&a.k==='duck'&&nearObj('duckpond',o.x,o.z,6))a.f=Math.min(1000,(a.f||0)+4);
    if(a.brush===S.day-1)a.f=Math.min(1000,(a.f||0)+4);}
  // births: a very happy grown-up barn animal, with room in the barn
  if(season()!=='winter')for(const a of R.animals.slice()){if(!['cow','goat','sheep','pig'].includes(a.k)||isBaby(a)||(a.f||0)<800||Math.random()>0.05)continue;const o=S.objs.find(q=>q.id===a.home);if(!o||animalsOf(o).length>=RANCH_CAP)continue;
    const used=new Set(R.animals.map(q=>q.name)),name=pickR(RANCH_NAMES.filter(n=>!used.has(n)))||'Little '+a.name;R.animals.push({id:S.nextId++,k:a.k,name,home:o.id,f:300,pet:0,n:0,ready:null,v:a.v||0,born:S.day});msg.push(`${a.name} had a baby ${BABY[a.k]}, ${name}!`);}
  // the incubator in each coop
  R.inc=R.inc||{};for(const [id,e] of Object.entries(R.inc)){if(S.day<e.day)continue;const o=S.objs.find(q=>q.id===+id);if(!o||animalsOf(o).length>=RANCH_CAP){continue;}
    const used=new Set(R.animals.map(q=>q.name)),name=pickR(RANCH_NAMES.filter(n=>!used.has(n)))||'Chick';R.animals.push({id:S.nextId++,k:e.k,name,home:o.id,f:300,pet:0,n:0,ready:null,v:Math.floor(Math.random()*3),born:S.day});delete R.inc[id];msg.push(`A ${BABY[e.k]} hatched! Say hello to ${name}.`);}
  if(msg.length){syncRanch();if(!quiet)setTimeout(()=>toast(msg.slice(0,2).join(' '),'rare',ICON.star),3800);}}
function petHouse(){const P0=RS().pet;if(!P0)return null;return S.objs.find(o=>o.k===(P0.k==='dog'?'doghouse':'catbed'))||S.objs.find(o=>o.k==='doghouse'||o.k==='catbed')||null;}
