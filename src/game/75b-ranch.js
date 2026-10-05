/* =========================================================
   The ranch: farm animals, what they give, and a pet.
   - Buildings (decor you place: BUILD coop / barn, 4 animals each). Tap one to see who lives there, collect eggs
     and buy more animals (the 'ranch' sheet).
   - Animals (RANCH): chickens and ducks live in a coop; cows, goats, sheep and pigs in a barn. By day (fair weather)
     they wander out round their building, never through a fence; at night and in rain or snow they stay inside.
   - Care, each day: pet each one (tap it) and see they're fed. On fair days outside winter they graze; otherwise they
     eat hay from your bag at dawn (wheat gives hay when you harvest it; or make it from fiber at the Workbench).
     Petting raises friendship (♥ 0-5); a hungry or ignored animal's friendship slips.
   - Produce at dawn, if fed: eggs and duck eggs are laid in the coop (tap the coop), cows and goats are ready to milk
     and sheep to shear (tap them; a bubble shows it's ready), pigs dig up truffles round the barn on fair days.
     Happier animals give Large eggs and milk more often; a very happy duck sometimes leaves a feather.
   - Artisan goods at the Workbench (58b recipes): Mayonnaise, Duck Mayonnaise, Cheese, Goat Cheese, Cloth, Truffle
     Oil, and an Omelette to eat. All sell well.
   - A pet (dog or cat): a stray turns up by your home on day 2; tap it to adopt it and name it. It follows you about,
     sits when you stop, loves being petted, and when it's happy it brings you little things it found.
   Saved in S.ranch: animals [{id,k,name,home,f,pet,n,ready,v}], eggs {buildingId:[keys]}, pet {k,v,name,f,pet,stray}.
   ========================================================= */
const RANCH={
  chicken:{name:'Chicken',home:'coop',cost:800,lvl:2,prod:'egg',big:'legg',every:1,sound:[[1100,0.05],[1400,0.06]],desc:'Lays an egg every day.'},
  duck:{name:'Duck',home:'coop',cost:1200,lvl:3,prod:'duckegg',every:2,sound:[[520,0.08],[480,0.08]],desc:'Lays a duck egg every other day. Very happy ducks drop feathers.'},
  cow:{name:'Cow',home:'barn',cost:1500,lvl:3,prod:'milk',big:'lmilk',every:1,sound:[[150,0.5,95]],desc:'Ready to milk every day.'},
  goat:{name:'Goat',home:'barn',cost:2000,lvl:4,prod:'goatmilk',every:2,sound:[[420,0.12,380],[420,0.12,360]],desc:'Ready to milk every other day.'},
  sheep:{name:'Sheep',home:'barn',cost:4000,lvl:4,prod:'wool',every:3,sound:[[330,0.25,300]],desc:'Ready to shear every third day.'},
  pig:{name:'Pig',home:'barn',cost:8000,lvl:5,prod:'truffle',every:1,sound:[[180,0.1,140],[160,0.12,120]],desc:'Snuffles up truffles round the barn on fair days (not in winter).'}};
const RANCH_CAP=4,RANCH_NAMES=['Daisy','Clover','Biscuit','Maple','Pepper','Hazel','Button','Pudding','Mochi','Peanut','Bramble','Waffles','Dot','Nutmeg','Sprout','Pippin','Tofu','Juniper','Bean','Marigold','Honey','Pebble','Rosie','Barley'];
const PET_KINDS={dog:{name:'Dog',coats:[0xd8904a,0xe8c070,0x7a5034,0x3a3436],cn:['Shiba','Golden','Chocolate','Black']},cat:{name:'Cat',coats:[0xe8944a,0x9a9aa4,0x2e2c30,0xf0e0c4],cn:['Ginger','Grey','Black','Cream']}};
Object.assign(BUILD,{
  coop:{name:'Chicken Coop',cost:4000,lvl:2,rot:true,desc:'A cosy coop for up to four chickens or ducks. Tap it to buy birds and collect eggs.'},
  barn:{name:'Barn',cost:6000,lvl:3,rot:true,desc:'A big red barn for up to four cows, goats, sheep or pigs. Tap it to buy animals.'}});
Object.assign(OBJ_H,{coop:1.3,barn:1.8});
Object.assign(CONSUM,{
  egg:{name:'Egg',price:50,sell:1,cat:'farm',desc:'Fresh from the coop.'},legg:{name:'Large Egg',price:95,sell:1,cat:'farm',desc:'From a very happy hen.'},
  duckegg:{name:'Duck Egg',price:95,sell:1,cat:'farm',desc:'A big pale-green duck egg.'},dfeather:{name:'Duck Feather',price:250,sell:1,cat:'farm',desc:'Soft and shimmering. Only very happy ducks leave one.'},
  milk:{name:'Milk',price:125,sell:1,cat:'farm',desc:'Fresh, creamy milk.'},lmilk:{name:'Large Milk',price:190,sell:1,cat:'farm',desc:'From a very happy cow.'},
  goatmilk:{name:'Goat Milk',price:225,sell:1,cat:'farm',desc:'Rich and a little tangy.'},wool:{name:'Wool',price:340,sell:1,cat:'farm',desc:'A soft fleece, fresh from shearing.'},
  hay:{name:'Hay',price:10,sell:1,cat:'farm',desc:'Animals eat it on rainy days and in winter (from your bag, at dawn).'},
  mayo:{name:'Mayonnaise',price:190,sell:1,cat:'artisan',desc:'Whipped up from an egg.'},dmayo:{name:'Duck Mayonnaise',price:375,sell:1,cat:'artisan',desc:'Rich and golden.'},
  cheese:{name:'Cheese',price:230,sell:1,cat:'artisan',desc:'A wheel of mild cheese.'},gcheese:{name:'Goat Cheese',price:400,sell:1,cat:'artisan',desc:'Soft, white and tangy.'},
  cloth:{name:'Cloth',price:470,sell:1,cat:'artisan',desc:'Woven from wool.'},toil:{name:'Truffle Oil',price:1065,sell:1,cat:'artisan',desc:'A gourmet oil. Worth a fortune.'},
  omelette:{name:'Omelette',price:240,sell:1,cat:'treat',desc:'Eat it for a hearty breakfast: you work faster today.'}});
Object.assign(ANY,{egg:{name:'Any egg',keys:()=>['x:egg','x:legg'],icon:'x:egg'},milk:{name:'Any milk',keys:()=>['x:milk','x:lmilk'],icon:'x:milk'}});
RECIPES.push({out:['b','coop',1],in:{'m:wood':40,'m:stone':10,'m:fiber':10},lvl:2},{out:['b','barn',1],in:{'m:wood':80,'m:stone':30,'m:fiber':20},lvl:3},
  {out:['x','hay',5],in:{'m:fiber':2},lvl:1},{out:['x','mayo',1],in:{'any:egg':1},lvl:2},{out:['x','dmayo',1],in:{'x:duckegg':1},lvl:3},{out:['x','cheese',1],in:{'any:milk':1},lvl:3},
  {out:['x','gcheese',1],in:{'x:goatmilk':1},lvl:4},{out:['x','cloth',1],in:{'x:wool':1},lvl:4},{out:['x','toil',1],in:{'g:truffle':1},lvl:5},{out:['x','omelette',1],in:{'any:egg':1,'any:milk':1},lvl:2});
function RS(){if(!S.ranch)S.ranch={animals:[],eggs:{},pet:null};if(!S.ranch.eggs)S.ranch.eggs={};return S.ranch;}/* (made on first use, so a new game or a dev island starts with none) */

// ---- icons for the new things (drawn once, smooth, like the others)
(function ranchIcons(){const mk=f=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.lineJoin=x.lineCap='round';f(x);return c.toDataURL();};
  const egg=(x,col,sp,big)=>{const s=big?1.12:1;const g=x.createRadialGradient(26,22,4,32,34,26*s);g.addColorStop(0,'#fff');g.addColorStop(0.35,col);g.addColorStop(1,sp);x.fillStyle=g;x.beginPath();x.ellipse(32,35,17*s,22*s,0,0,6.283);x.fill();x.strokeStyle='rgba(60,40,20,.35)';x.lineWidth=2;x.stroke();};
  const bottle=(x,cap,fill,star)=>{x.fillStyle='#e8eef2';x.strokeStyle='#8a98a4';x.lineWidth=2.5;x.beginPath();x.moveTo(24,14);x.lineTo(40,14);x.lineTo(40,22);x.quadraticCurveTo(48,26,48,34);x.lineTo(48,54);x.quadraticCurveTo(48,58,44,58);x.lineTo(20,58);x.quadraticCurveTo(16,58,16,54);x.lineTo(16,34);x.quadraticCurveTo(16,26,24,22);x.closePath();x.fill();x.stroke();
    x.fillStyle=fill;x.fillRect(18,34,28,22);x.fillStyle=cap;x.fillRect(22,8,20,8);x.strokeRect(22,8,20,8);x.fillStyle='rgba(255,255,255,.7)';x.fillRect(21,36,4,16);if(star){x.fillStyle='#f6c840';x.font='bold 18px sans-serif';x.fillText('★',38,30);}};
  const jar=(x,lid,fill)=>{x.fillStyle=fill;x.strokeStyle='#8a7a5a';x.lineWidth=2.5;x.beginPath();x.roundRect?x.roundRect(16,20,32,36,7):x.rect(16,20,32,36);x.fill();x.stroke();x.fillStyle=lid;x.fillRect(14,12,36,10);x.strokeRect(14,12,36,10);x.fillStyle='#fffbe8';x.fillRect(22,32,20,14);x.fillStyle='rgba(255,255,255,.6)';x.fillRect(19,24,4,26);};
  const set=(k,d)=>{try{Object.defineProperty(ICON,'x:'+k,{value:d,writable:true,configurable:true,enumerable:true});}catch(e){ICON['x:'+k]=d;}};
  set('egg',mk(x=>egg(x,'#fbf2e0','#d8c2a0')));set('legg',mk(x=>{egg(x,'#e8b880','#a8744a',1);x.fillStyle='#f6c840';x.font='bold 16px sans-serif';x.fillText('★',40,20);}));
  set('duckegg',mk(x=>egg(x,'#dcefe4','#9ab8a8',1)));
  set('dfeather',mk(x=>{x.save();x.translate(32,34);x.rotate(-0.6);const g=x.createLinearGradient(-8,0,8,0);g.addColorStop(0,'#6ab0c8');g.addColorStop(1,'#e8f4f8');x.fillStyle=g;x.beginPath();x.ellipse(0,0,9,24,0,0,6.283);x.fill();x.strokeStyle='#4a7a8a';x.lineWidth=2;x.beginPath();x.moveTo(0,-22);x.lineTo(0,28);x.stroke();x.restore();}));
  set('milk',mk(x=>bottle(x,'#4a8ad0','#fbfbf6')));set('lmilk',mk(x=>bottle(x,'#d84a4a','#fbfbf6',1)));set('goatmilk',mk(x=>bottle(x,'#b8946a','#f8f4ea')));
  set('wool',mk(x=>{x.fillStyle='#f6f2ea';x.strokeStyle='#b8b0a0';x.lineWidth=2;for(const [a,b,r] of [[24,36,12],[40,36,12],[32,26,12],[22,26,9],[42,26,9],[32,42,11]]){x.beginPath();x.arc(a,b,r,0,6.283);x.fill();x.stroke();}x.fillStyle='rgba(255,255,255,.8)';x.beginPath();x.arc(28,24,4,0,6.283);x.fill();}));
  set('hay',mk(x=>{x.strokeStyle='#c8a040';x.lineWidth=3;for(let i=0;i<14;i++){x.beginPath();x.moveTo(18+i*2,56);x.lineTo(14+i*3,10+(i%3)*4);x.stroke();}x.strokeStyle='#e8c860';for(let i=0;i<10;i++){x.beginPath();x.moveTo(22+i*2,56);x.lineTo(20+i*3,14+(i%2)*5);x.stroke();}x.fillStyle='#a8743a';x.fillRect(14,36,36,6);}));
  set('mayo',mk(x=>jar(x,'#f0c840','#fbf3d0')));set('dmayo',mk(x=>jar(x,'#6aa86a','#f6e8a8')));
  set('cheese',mk(x=>{x.fillStyle='#f6c84a';x.strokeStyle='#b88a2a';x.lineWidth=2.5;x.beginPath();x.moveTo(8,44);x.lineTo(56,30);x.lineTo(56,48);x.lineTo(8,56);x.closePath();x.fill();x.stroke();x.fillStyle='#fbe08a';x.beginPath();x.moveTo(8,44);x.lineTo(56,30);x.lineTo(40,20);x.closePath();x.fill();x.stroke();x.fillStyle='#d8a838';for(const [a,b,r] of [[20,50,3],[34,46,4],[48,42,2.5]]){x.beginPath();x.arc(a,b,r,0,6.283);x.fill();}}));
  set('gcheese',mk(x=>{x.fillStyle='#f8f6ee';x.strokeStyle='#a8a090';x.lineWidth=2.5;x.beginPath();x.ellipse(32,40,22,10,0,0,6.283);x.fill();x.stroke();x.fillRect(10,28,44,12);x.beginPath();x.ellipse(32,28,22,10,0,0,6.283);x.fill();x.stroke();x.fillStyle='#8ab46a';x.beginPath();x.arc(36,26,3,0,6.283);x.arc(28,30,2.5,0,6.283);x.fill();}));
  set('cloth',mk(x=>{for(let i=0;i<3;i++){x.fillStyle=['#d8c0e8','#a8d0e8','#f4d0a8'][i];x.strokeStyle='#7a6a8a';x.lineWidth=2;x.beginPath();x.roundRect?x.roundRect(12,40-i*10,40,12,3):x.rect(12,40-i*10,40,12);x.fill();x.stroke();}}));
  set('toil',mk(x=>{x.fillStyle='#3a3a2a';x.strokeStyle='#1a1a10';x.lineWidth=2.5;x.beginPath();x.moveTo(26,10);x.lineTo(38,10);x.lineTo(38,24);x.lineTo(46,32);x.lineTo(46,56);x.lineTo(18,56);x.lineTo(18,32);x.lineTo(26,24);x.closePath();x.fill();x.stroke();x.fillStyle='#d8b850';x.fillRect(20,38,24,12);x.fillStyle='#6a4a30';x.beginPath();x.arc(32,44,4,0,6.283);x.fill();x.fillStyle='#a87a3a';x.fillRect(25,4,14,7);}));
  set('omelette',mk(x=>{x.fillStyle='#f4f0e8';x.strokeStyle='#a8a090';x.lineWidth=2;x.beginPath();x.ellipse(32,40,26,14,0,0,6.283);x.fill();x.stroke();x.fillStyle='#f6d050';x.strokeStyle='#c8a030';x.beginPath();x.ellipse(32,36,17,9,0,0,6.283);x.fill();x.stroke();x.fillStyle='#6aa84a';x.beginPath();x.arc(26,33,2.5,0,6.283);x.arc(36,35,2,0,6.283);x.fill();}));
})();

// ---- models: small, round, chibi animals, rigged so they can move: the rig (scale, hops) holds the legs (pivoting at
// the hip) and the body (bobs, sways, sits back), which holds the head (pecks, grazes, looks at you), the tail and wings
const ANIM_SCALE={chicken:0.6,duck:0.6,cow:0.68,goat:0.66,sheep:0.68,pig:0.66,dog:0.62,cat:0.6};
function animalModel(k,v,acc){v=v|0;const g=new T.Group(),rig=new T.Group(),body=new T.Group(),head=new T.Group(),tail=new T.Group();g.add(rig);rig.add(body);body.add(head,tail);
  const p=[],hp=[],tp=[],legs=[],wings=[],dk=(c,f=0.8)=>lerpHex(c,0x000000,1-f),lt=(c,f=0.25)=>lerpHex(c,0xffffff,f),R=mulberry(v*7+3);
  const eye=(x,y,z,s=0.034)=>hp.push(P(SPH,0x2a2230,x,y,z,0,0,0,s,s*1.15,s*0.8),P(SPH_XS,0xffffff,x+s*0.22,y+s*0.3,z+s*0.32,0,0,0,s*0.42,s*0.42,s*0.3),P(SPH_XS,0xffffff,x-s*0.15,y-s*0.2,z+s*0.34,0,0,0,s*0.18,s*0.18,s*0.15));
  const blush=(x,y,z,s=0.04)=>hp.push(P(SPH_XS,0xf6a0a8,x,y,z,0,0,0,s,s*0.6,s*0.3));
  // a leg: a little tapered post hanging from the hip, with a hoof, paw or bird's foot at the bottom
  const leg=(col,foot,x,z,h,r,toes)=>{const q=[PG(CYL8,col,dk(col,0.9),0,-h/2,0,0,0,0,r,h,r)];
    if(toes){for(const a of [-0.5,0,0.5])q.push(P(BOX,foot,Math.sin(a)*r*1.4,-h,r*0.9*Math.cos(a)+r*0.4,0,a,0,r*0.5,r*0.4,r*2.4));}else q.push(P(CYL8,foot,0,-h+r*0.35,r*0.1,0,0,0,r*1.12,r*0.7,r*1.12));
    const L=new T.Group();L.add(M(q));L.position.set(x,h,z);legs.push(L);rig.add(L);};
  const wing=(col,side,x,y,z,sx,sy,sz)=>{const W=new T.Group();W.add(M([PG(SPH,col,dk(col,0.82),side*sx*0.35,0,0,0,0,0,sx,sy,sz)]));W.position.set(x*side,y,z);wings.push(W);body.add(W);};
  let H=0.5,sitDrop=0.06,lieDrop=0.1;
  switch(k){
    case'chicken':{const C=[0xfbf8f0,0xc8783a,0x3a3434,0xe8d0a0][v%4],D=dk(C,0.85);
      p.push(PG(SPH,C,D,0,0.26,0,0,0,0,0.34,0.32,0.4),PG(SPH,lt(C,0.15),C,0,0.24,0.1,0,0,0,0.3,0.28,0.26),PG(SPH,C,C,0,0.36,0.08,0,0,0,0.18,0.2,0.18));
      for(const [rz,dy] of [[-0.45,0],[0,0.03],[0.45,0]])tp.push(PG(SPH,dk(C,0.92),C,0,0.08+dy,-0.02,-0.55,0,rz,0.07,0.22,0.12));tail.position.set(0,0.3,-0.16);
      wing(dk(C,0.92),1,0.165,0.27,-0.02,0.07,0.17,0.26);wing(dk(C,0.92),-1,0.165,0.27,-0.02,0.07,0.17,0.26);
      hp.push(PG(SPH,C,D,0,0,0,0,0,0,0.21,0.22,0.21));for(const [z,y,s2] of [[0.05,0.11,0.045],[0,0.13,0.055],[-0.05,0.11,0.045]])hp.push(P(SPH,0xe8403a,0,y,z,0,0,0,0.035,s2*1.5,s2*1.1));
      hp.push(P(CONE4,0xf2b440,0,-0.01,0.12,1.57,0.785,0,0.05,0.08,0.05),P(SPH,0xe8403a,0,-0.07,0.085,0,0,0,0.035,0.06,0.03));eye(0.068,0.025,0.075);eye(-0.068,0.025,0.075);blush(0.08,-0.02,0.07,0.03);blush(-0.08,-0.02,0.07,0.03);
      head.position.set(0,0.47,0.14);for(const x of [-0.07,0.07])leg(0xf0a83a,0xf0a83a,x,0.02,0.13,0.022,1);H=0.6;sitDrop=0.08;break;}
    case'duck':{const mal=v%2===0,C=mal?0xa88a5a:0xfbf8f0,HC=mal?0x2e7a4a:0xfbf8f0;
      p.push(PG(SPH,C,dk(C,0.85),0,0.21,-0.02,0,0,0,0.32,0.25,0.46),PG(SPH,lt(C,0.1),C,0,0.2,0.1,0,0,0,0.28,0.22,0.26),PG(SPH,mal?0xfbf8f0:C,C,0,0.31,0.12,0,0,0,0.12,0.16,0.12));
      tp.push(PG(CONE8,dk(C,0.9),C,0,0.04,-0.04,-0.9,0,0,0.12,0.16,0.08));tail.position.set(0,0.26,-0.22);
      wing(dk(C,0.9),1,0.15,0.23,-0.04,0.06,0.13,0.3);wing(dk(C,0.9),-1,0.15,0.23,-0.04,0.06,0.13,0.3);
      hp.push(PG(SPH,HC,dk(HC,0.85),0,0,0,0,0,0,0.19,0.19,0.2),P(SPH,0xf09a30,0,-0.025,0.12,0,0,0,0.12,0.045,0.13));if(mal)hp.push(P(CYL12,0xfbf8f0,0,-0.08,0,0,0,0,0.15,0.025,0.15));
      eye(0.07,0.03,0.06);eye(-0.07,0.03,0.06);head.position.set(0,0.42,0.17);
      for(const x of [-0.07,0.07])leg(0xf09a30,0xf09a30,x,0,0.1,0.024,1);H=0.55;sitDrop=0.07;break;}
    case'cow':{const C=[0xfbf8f0,0xb87a4a,0x6a4a3a][v%3],S2=v%3===0?0x2e2a2c:v%3===1?0xfbf8f0:0x3a2a24,D=dk(C,0.88);
      p.push(PG(SPH,C,D,0,0.5,0,0,0,0,0.56,0.46,0.8));
      for(let i=0;i<6;i++){const sd=i%2?1:-1,z=(R()-0.5)*0.5,y=0.42+R()*0.18,rz=0.27*Math.sqrt(Math.max(0.15,1-(z/0.4)**2-((y-0.5)/0.23)**2));p.push(P(SPH,S2,sd*rz,y,z,0,0,sd*0.15,0.06,0.15+R()*0.08,0.18+R()*0.1));}p.push(P(SPH,S2,0.04,0.72,-0.1,0,0.3,0,0.2,0.05,0.22));
      p.push(PG(SPH,0xf6b8c0,0xe8909a,0,0.3,-0.14,0,0,0,0.2,0.12,0.2));for(const [x,z] of [[-0.04,-0.1],[0.04,-0.1],[-0.04,-0.18],[0.04,-0.18]])p.push(P(CYL6,0xe8909a,x,0.24,z,0,0,0,0.025,0.06,0.025));
      tp.push(P(CYL6,C,0,-0.12,-0.02,0.2,0,0,0.03,0.26,0.03),P(SPH,S2===0xfbf8f0?0x5a3a2a:S2,0,-0.27,-0.05,0,0,0,0.07,0.1,0.07));tail.position.set(0,0.62,-0.38);
      hp.push(PG(SPH,C,D,0,0,0,0,0,0,0.36,0.32,0.34),PG(SPH,0xf6c4bc,0xe8a8a0,0,-0.08,0.14,0,0,0,0.3,0.18,0.18),P(SPH_XS,0x8a4a4a,0.05,-0.08,0.225,0,0,0,0.03,0.03,0.02),P(SPH_XS,0x8a4a4a,-0.05,-0.08,0.225,0,0,0,0.03,0.03,0.02));
      for(const sd of [-1,1])hp.push(PG(SPH,C,D,sd*0.2,0.04,-0.03,0,0,sd*0.35,0.16,0.05,0.09),P(SPH,0xf6b8c0,sd*0.205,0.04,-0.02,0,0,sd*0.35,0.1,0.03,0.05),P(CONE8,0xf2ead8,sd*0.09,0.16,-0.05,0,0,-sd*0.5,0.045,0.12,0.045));
      hp.push(P(SPH,v%3===0?S2:dk(C,0.85),0,0.15,0.04,0,0,0,0.12,0.06,0.1));eye(0.1,0.04,0.13,0.04);eye(-0.1,0.04,0.13,0.04);blush(0.13,-0.04,0.12);blush(-0.13,-0.04,0.12);head.position.set(0,0.66,0.42);
      for(const [x,z] of [[-0.15,0.24],[0.15,0.24],[-0.15,-0.24],[0.15,-0.24]])leg(C,0x3a3434,x,z,0.3,0.085);H=1;sitDrop=0.12;lieDrop=0.2;break;}
    case'goat':{const C=[0xf2ece0,0xb08a5a,0x6a5a4a][v%3],D=dk(C,0.88);
      p.push(PG(SPH,C,D,0,0.43,0,0,0,0,0.38,0.36,0.6),PG(SPH,C,C,0,0.55,0.22,0,0,0,0.16,0.2,0.18));
      tp.push(PG(CONE8,C,D,0,0.05,0,-0.6,0,0,0.07,0.14,0.06));tail.position.set(0,0.56,-0.28);
      hp.push(PG(SPH,C,D,0,0,0,0,0,0,0.22,0.24,0.26),PG(SPH,lt(C,0.1),C,0,-0.05,0.1,0,0,0,0.15,0.13,0.16),P(SPH_XS,0x3a3030,0,-0.05,0.18,0,0,0,0.04,0.025,0.025),PG(CONE8,lt(C,0.2),C,0,-0.15,0.08,3.14,0,0,0.05,0.11,0.05));
      for(const sd of [-1,1]){for(let i=0;i<4;i++){const t=i/3;hp.push(P(SPH,0x9a8a78,sd*(0.06+t*0.03),0.12+Math.sin(t*2)*0.06,-0.02-t*0.1,0,0,0,0.045-t*0.008,0.045-t*0.008,0.06));}
        hp.push(PG(SPH,C,D,sd*0.14,0.03,-0.02,0,0,sd*0.5,0.12,0.04,0.07));}
      eye(0.075,0.035,0.09);eye(-0.075,0.035,0.09);blush(0.09,-0.02,0.09,0.03);blush(-0.09,-0.02,0.09,0.03);head.position.set(0,0.64,0.32);
      for(const [x,z] of [[-0.1,0.18],[0.1,0.18],[-0.1,-0.18],[0.1,-0.18]])leg(C,0x4a3a30,x,z,0.27,0.055);H=0.85;sitDrop=0.1;lieDrop=0.17;break;}
    case'sheep':{const W=[0xf6f2ea,0xe8dccb,0x5a5050][v%3],F=v%3===2?0x2a2224:0x3a3438;
      for(let i=0;i<18;i++){const a=i*2.39996,y=(i/17-0.5)*0.9,r=Math.sqrt(1-y*y);p.push(PG(SPH,i%3?W:lt(W,0.06),dk(W,0.9),Math.cos(a)*r*0.2,0.44+y*0.18,Math.sin(a)*r*0.26,0,0,0,0.22,0.2,0.22));}
      tp.push(P(SPH,W,0,0,0,0,0,0,0.1,0.1,0.1));tail.position.set(0,0.46,-0.3);
      hp.push(PG(SPH,F,dk(F,0.8),0,0,0,0,0,0,0.19,0.23,0.22));for(const [x,y,z] of [[0,0.11,-0.02],[0.06,0.1,-0.04],[-0.06,0.1,-0.04]])hp.push(P(SPH,W,x,y,z,0,0,0,0.11,0.09,0.11));
      for(const sd of [-1,1])hp.push(P(SPH,F,sd*0.13,0.02,-0.02,0,0,sd*0.5,0.12,0.04,0.07),P(SPH,0xf6a0a8,sd*0.135,0.02,-0.01,0,0,sd*0.5,0.07,0.025,0.04));
      hp.push(P(SPH_XS,0xffffff,0.055,0.03,0.09,0,0,0,0.04,0.045,0.025),P(SPH_XS,0xffffff,-0.055,0.03,0.09,0,0,0,0.04,0.045,0.025),P(SPH_XS,0x1a1a1a,0.055,0.03,0.105,0,0,0,0.022,0.026,0.012),P(SPH_XS,0x1a1a1a,-0.055,0.03,0.105,0,0,0,0.022,0.026,0.012));
      head.position.set(0,0.52,0.32);for(const [x,z] of [[-0.1,0.14],[0.1,0.14],[-0.1,-0.14],[0.1,-0.14]])leg(F,0x1a1a1a,x,z,0.24,0.045);H=0.8;sitDrop=0.1;lieDrop=0.16;break;}
    case'pig':{const C=[0xf29aa6,0xe88894,0xf2b49a][v%3],D=dk(C,0.88);
      p.push(PG(SPH,C,D,0,0.32,0,0,0,0,0.46,0.4,0.62));if(v%3===2)for(let i=0;i<3;i++)p.push(P(SPH,0x5a4040,(R()-0.5)*0.3,0.38+R()*0.1,(R()-0.5)*0.4,0,0,0,0.12,0.1,0.12));
      for(let i=0;i<7;i++){const a=i*1.1;tp.push(P(SPH,C,Math.cos(a)*0.035,i*0.012,-Math.sin(a)*0.035-i*0.01,0,0,0,0.035,0.035,0.035));}tail.position.set(0,0.38,-0.31);
      hp.push(PG(SPH,C,D,0,0,0,0,0,0,0.33,0.3,0.29),PG(CYL12,lt(C,0.1),dk(C,0.95),0,-0.03,0.155,1.57,0,0,0.13,0.06,0.1),P(SPH_XS,0x8a4a4a,0.028,-0.03,0.188,0,0,0,0.022,0.028,0.012),P(SPH_XS,0x8a4a4a,-0.028,-0.03,0.188,0,0,0,0.022,0.028,0.012));
      for(const sd of [-1,1])hp.push(PG(CONE4,C,D,sd*0.1,0.13,0.03,0.6,0.785,-sd*0.3,0.1,0.12,0.06));
      eye(0.08,0.05,0.12);eye(-0.08,0.05,0.12);blush(0.11,-0.02,0.11,0.045);blush(-0.11,-0.02,0.11,0.045);head.position.set(0,0.38,0.34);
      for(const [x,z] of [[-0.12,0.18],[0.12,0.18],[-0.12,-0.18],[0.12,-0.18]])leg(C,dk(C,0.75),x,z,0.17,0.065);H=0.6;sitDrop=0.06;lieDrop=0.1;break;}
    case'dog':{const C=PET_KINDS.dog.coats[v%4],W=0xfbf6ea,D=dk(C,0.88);
      p.push(PG(SPH,C,D,0,0.3,0,0,0,0,0.28,0.28,0.46),PG(SPH,W,lt(W,0),0,0.28,0.13,0,0,0,0.2,0.22,0.2),P(CYL12,0xd8403a,0,0.42,0.17,0.5,0,0,0.19,0.035,0.19),P(SPH_XS,0xf6c840,0,0.37,0.26,0,0,0,0.04,0.045,0.02));
      for(let i=0;i<6;i++){const t=i/5,a=t*3.4;tp.push(P(SPH,i>3?W:C,0,Math.sin(a)*0.1+0.02,-Math.cos(a)*0.06+0.02,0,0,0,0.07,0.07,0.07));}tail.position.set(0,0.4,-0.22);
      hp.push(PG(SPH,C,D,0,0,0,0,0,0,0.32,0.29,0.29),PG(SPH,W,W,0,-0.055,0.12,0,0,0,0.17,0.12,0.15),P(SPH,0x2a2230,0,-0.02,0.19,0,0,0,0.045,0.035,0.03),P(SPH,W,0.09,-0.05,0.08,0,0,0,0.1,0.08,0.08),P(SPH,W,-0.09,-0.05,0.08,0,0,0,0.1,0.08,0.08));
      for(const sd of [-1,1])hp.push(PG(CONE4,C,D,sd*0.095,0.15,-0.01,0,0.785,-sd*0.2,0.09,0.13,0.05),P(CONE4,0xf6c0b8,sd*0.093,0.14,0.005,0,0.785,-sd*0.2,0.05,0.08,0.02));
      eye(0.07,0.035,0.115,0.036);eye(-0.07,0.035,0.115,0.036);blush(0.1,-0.03,0.1);blush(-0.1,-0.03,0.1);head.position.set(0,0.5,0.24);
      for(const [x,z] of [[-0.08,0.14],[0.08,0.14],[-0.08,-0.14],[0.08,-0.14]])leg(C,W,x,z,0.17,0.05);H=0.7;sitDrop=0.05;lieDrop=0.1;break;}
    default:{/* cat */const C=PET_KINDS.cat.coats[v%4],D=dk(C,0.86),W=v%4===2?0xf4f0e8:lt(C,0.45);
      p.push(PG(SPH,C,D,0,0.24,0,0,0,0,0.24,0.24,0.42),PG(SPH,W,W,0,0.24,0.12,0,0,0,0.17,0.19,0.16),P(CYL12,0x4a7ad0,0,0.35,0.15,0.5,0,0,0.16,0.03,0.16),P(SPH_XS,0xf6c840,0,0.31,0.22,0,0,0,0.035,0.035,0.035));
      if(v%4===0||v%4===1)for(let i=0;i<3;i++)p.push(P(SPH,D,0,0.34,-0.08+i*0.08,0,0,0,0.2,0.03,0.04));
      for(let i=0;i<8;i++){const t=i/7;tp.push(P(SPH,i===7?(v%4===2?C:W):C,0,t*0.3,-Math.sin(t*2.6)*0.07-t*0.04,0,0,0,0.055,0.06,0.055));}tail.position.set(0,0.28,-0.2);
      hp.push(PG(SPH,C,D,0,0,0,0,0,0,0.29,0.25,0.25),PG(SPH,W,W,0,-0.05,0.09,0,0,0,0.15,0.1,0.12),P(SPH_XS,0xf2a0a8,0,-0.025,0.14,0,0,0,0.03,0.02,0.02));
      for(const sd of [-1,1]){hp.push(PG(CONE4,C,D,sd*0.085,0.13,0,0,0.785,-sd*0.15,0.09,0.12,0.05),P(CONE4,0xf6c0c8,sd*0.083,0.12,0.012,0,0.785,-sd*0.15,0.05,0.07,0.02));for(const dy of [-0.01,0.01])hp.push(P(BOX,0xfbf8f0,sd*0.12,-0.04+dy*2,0.1,0,0,sd*dy*8,0.1,0.006,0.006));}
      if(v%4===0)for(let i=0;i<3;i++)hp.push(P(SPH,D,(i-1)*0.04,0.11,0.06,0,0,0,0.025,0.02,0.05));
      eye(0.065,0.02,0.1,0.034);eye(-0.065,0.02,0.1,0.034);blush(0.09,-0.035,0.09,0.035);blush(-0.09,-0.035,0.09,0.035);head.position.set(0,0.4,0.19);
      for(const [x,z] of [[-0.065,0.12],[0.065,0.12],[-0.065,-0.12],[0.065,-0.12]])leg(C,W,x,z,0.13,0.042);H=0.6;sitDrop=0.04;lieDrop=0.08;}}
  if(acc)hp.push(...accParts(acc,k));/* a bow, crown, hat, bandana or bell (75c) */
  body.add(M(p));head.add(M(hp));if(tp.length)tail.add(M(tp));rig.scale.setScalar(ANIM_SCALE[k]||0.65);
  g.traverse(o=>{if(o.isMesh)o.castShadow=true;});g.userData={k,rig,body,head,tail,legs,wings,H:H*(ANIM_SCALE[k]||0.65),sitDrop,lieDrop,cy:legs.length?legs[0].position.y+0.12:0.3,bird:k==='chicken'||k==='duck'};return g;}
// the pose, every frame: walk cycle (diagonal pairs; birds waddle; pets gallop when running), breathing, peck and
// graze, a look towards you, tail and wings, a happy hop, and pets sitting and lying down
function animRig(e,dt,tt,o){const U=e.g.userData,k=U.k,bird=U.bird,seed=e.seed||(e.seed=Math.random()*9);
  e.spd=(e.spd||0)+((o.moving?1:0)-(e.spd||0))*Math.min(1,dt*7);const s=e.spd,ph=e.walk||0,sit=e.sit||0,lie=e.lie||0;
  U.legs.forEach((L,i)=>{let a=bird?Math.sin(ph+(i?Math.PI:0))*0.75*s:o.gallop?Math.sin(ph+(i<2?0:2.2))*0.95*s:Math.sin(ph+((i===0||i===3)?0:Math.PI))*0.6*s;
    const sa0=sit*(1-lie);if(!bird){if(i>=2)a+=-0.95*sa0;a+=(i<2?-1.35:1.35)*lie;}else a*=1-sit;L.rotation.x=a;
    if(!bird&&i<2){const h0=L.userData.h||(L.userData.h=L.position.y),st=1+0.9*sa0;L.scale.y=st;L.position.y=h0*st;}});/* sitting: the front legs straighten up to the raised chest */
  const B=U.body;B.position.y=Math.abs(Math.sin(ph))*(bird?0.03:0.045)*s+Math.sin(tt*2.3+seed)*0.008-U.sitDrop*sit*(1-lie)-U.lieDrop*lie;
  B.rotation.z=(bird?Math.sin(ph)*0.16:Math.sin(ph)*0.05)*s;const sa=sit*(1-lie),pit=bird?0:-sa*0.55;B.rotation.x=pit+(o.gallop?Math.sin(ph)*0.08*s:0);B.position.z=0;
  if(pit){/* sitting up: the body pivots at the hips, so the chest rises over the front legs and the haunches stay put */const Py=U.legs[2].position.y,Pz=U.legs[2].position.z,c=Math.cos(pit),sn=Math.sin(pit);B.position.y+=Py-(Py*c-Pz*sn);B.position.z=Pz-(Py*sn+Pz*c);}
  if(e.happy>0){e.happy-=dt;U.rig.position.y=Math.abs(Math.sin(e.happy*11))*0.12*Math.min(1,e.happy*2);}else U.rig.position.y=0;
  let hx=bird?Math.sin(ph*2)*0.14*s:0,hy=0;
  if(e.act==='peck')hx+=Math.max(0,Math.sin((e.actT||0)*8))**3*1.0;
  if(e.act==='graze')hx+=Math.min(0.85,(e.actT||0)*2)+Math.sin(tt*7)*0.04;
  if(o.look!=null&&s<0.3&&!e.act)hy=clamp(o.look,-0.85,0.85);
  hx+=lie*0.3-sit*0.15;U.head.rotation.x+=(hx-U.head.rotation.x)*Math.min(1,dt*10);U.head.rotation.y+=(hy-U.head.rotation.y)*Math.min(1,dt*5);
  U.head.rotation.z=o.tilt?Math.sin(tt*2)*0.12:U.head.rotation.z*0.9;
  const Tl=U.tail;if(Tl){if(k==='dog'){Tl.rotation.z=Math.sin(tt*(o.excited?20:8))*(o.excited?0.55:0.22);Tl.rotation.x=0;}
    else if(k==='cat'){Tl.rotation.z=Math.sin(tt*1.4+seed)*0.4;Tl.rotation.x=-0.2+Math.sin(tt*0.9+seed)*0.2-lie*0.6;}
    else if(k==='cow'){Tl.rotation.z=Math.sin(tt*1.7+seed)*0.4;Tl.rotation.x=0.1;}
    else if(bird)Tl.rotation.x=Math.sin(tt*4+seed)*0.08+s*Math.sin(ph*2)*0.1;
    else Tl.rotation.z=Math.sin(tt*(o.excited?16:5)+seed)*(o.excited?0.4:0.18);}
  if(U.wings.length){e.flap=Math.max(0,(e.flap||0)-dt);const f=e.flap>0?Math.abs(Math.sin(e.flap*24))*1.15:0.06*s;U.wings[0].rotation.z=f;U.wings[1].rotation.z=-f;}}
// ---- the buildings
function ranchBld(g,kind){const p=[],gl=[];
  if(kind==='coop'){const W=0xb8583e,T2=0xf4ece0;for(const [x,z] of [[-0.42,-0.36],[0.42,-0.36],[-0.42,0.36],[0.42,0.36]])p.push(P(CYL6,0x6a4a30,x,0.12,z,0,0,0,0.06,0.24,0.06));
    p.push(P(BOX,W,0,0.56,0,0,0,0,1.0,0.64,0.86));for(let i=0;i<6;i++)p.push(P(BOX,lerpHex(W,0x000000,0.15),0,0.3+i*0.1,0.435,0,0,0,1.0,0.012,0.01));
    p.push(P(PRISM,T2,0,0.88+0.2,0,0,1.5708,0,0.9/1.732,0.4/1.5,1.12),P(PRISM,0x6a7a8a,0,0.9+0.21,0,0,1.5708,0,1.0/1.732,0.42/1.5,1.16));
    p.push(P(BOX,0x5a3a28,0.18,0.42,0.44,0,0,0,0.26,0.3,0.02),P(BOX,T2,0.18,0.42,0.445,0,0,0,0.3,0.34,0.01),P(BOX,0x8a6a44,0.18,0.14,0.68,-0.75,0,0,0.24,0.02,0.5));for(let i=0;i<4;i++)p.push(P(BOX,0x6a4a30,0.18,0.06+i*0.07,0.86-i*0.07,0,0,0,0.24,0.015,0.02));
    gl.push(P(CYL12,0xffe0a0,-0.24,0.62,0.44,1.57,0,0,0.16,0.02,0.16));p.push(P(CYL12,T2,-0.24,0.62,0.435,1.57,0,0,0.22,0.02,0.22));
    p.push(P(BOX,0xf6d04a,-0.36,0.98,0.47,0,0,0,0.2,0.1,0.02));}
  else{const W=0xb8403a,T2=0xf6f0e6,RF=0x4a4a52;p.push(P(BOX,0x8a8078,0,0.04,0,0,0,0,1.42,0.08,1.22),P(BOX,W,0,0.5,0,0,0,0,1.34,0.84,1.14));
    for(let i=0;i<8;i++)p.push(P(BOX,lerpHex(W,0x000000,0.12),-0.6+i*0.17,0.5,0.575,0,0,0,0.012,0.84,0.01));
    // a gambrel roof: steep lower slopes, shallow upper ones, over a stepped gable wall
    for(const s of [-1,1])p.push(P(BOX,RF,s*0.585,1.11,0,0,0,-s*0.9,0.52,0.06,1.3),P(BOX,RF,s*0.215,1.39,0,0,0,-s*0.36,0.47,0.06,1.3));
    p.push(P(BOX,W,0,0.98,0,0,0,0,1.26,0.13,1.12),P(BOX,W,0,1.11,0,0,0,0,1.02,0.13,1.12),P(BOX,W,0,1.24,0,0,0,0,0.78,0.13,1.12),P(PRISM,W,0,1.3+0.05,0,0,0,0,0.8/1.732,0.15/1.5,1.12),P(BOX,lerpHex(RF,0x000000,0.2),0,1.47,0,0,0,0,0.1,0.05,1.32));
    p.push(P(BOX,T2,0,0.42,0.58,0,0,0,0.62,0.7,0.02),P(BOX,W,0,0.4,0.585,0,0,0,0.52,0.62,0.02));for(const s of [-1,1])p.push(P(BOX,T2,0,0.4,0.595,0,0,s*0.86,0.035,0.78,0.01));p.push(P(BOX,T2,0,0.4,0.596,0,0,0,0.035,0.62,0.01));
    gl.push(P(BOX,0xffe0a0,0,1.16,0.56,0,0,0,0.22,0.18,0.02));p.push(P(BOX,T2,0,1.16,0.555,0,0,0,0.28,0.24,0.02),P(BOX,T2,0,1.16,0.565,0,0,0,0.02,0.18,0.01),P(BOX,T2,0,1.16,0.565,0,0,0,0.22,0.02,0.01));
    p.push(P(CYL12,0x8a8a92,0.86,0.75,-0.28,0,0,0,0.42,1.5,0.42),P(CONE12,0x6a6a72,0.86,1.62,-0.28,0,0,0,0.48,0.26,0.48));/* the silo */
    for(const [x,z] of [[-0.82,0.48],[-0.72,0.66]])p.push(P(CYL8,0xe8c860,x,0.16,z,0,0,1.57,0.3,0.3,0.3));}
  g.add(M(p));if(gl.length)g.add(M(gl,glowMat));}

// ---- running animals and the pet
const herd=[];let petR=null;
function ranchHomes(){return S.objs.filter(o=>o.k==='coop'||o.k==='barn');}
function animalsOf(o){return RS().animals.filter(a=>a.home===o.id);}
function ranchSpace(type){for(const o of ranchHomes())if(o.k===type&&animalsOf(o).length<RANCH_CAP)return o;return null;}
function syncRanch(){const was=new Map(herd.map(h=>[h.a,h]));for(const h of herd)scene.remove(h.g);herd.length=0;const homes=new Map(ranchHomes().map(o=>[o.id,o]));
  for(const a of RS().animals){if(!homes.has(a.home)){const o=ranchSpace(RANCH[a.k].home);if(o)a.home=o.id;else continue;}const o=homes.get(a.home)||S.objs.find(q=>q.id===a.home);if(!o)continue;
    const g=animalModel(a.k,a.v||0,a.acc);if(isBaby(a))g.scale.setScalar(0.6);/* a baby (75c) */g.visible=false;scene.add(g);const w=was.get(a);herd.push(w&&w.o===o?{a,g,o,x:w.x,z:w.z,tx:w.tx,tz:w.tz,t:w.t,ph:w.ph,out:w.out,walk:w.walk}:{a,g,o,x:o.x,z:o.z+0.9,tx:o.x,tz:o.z+0.9,t:Math.random()*3,ph:Math.random()*6,out:false,walk:0});/* (keep where they were) */}}
function ranchOutside(){return !S.sea&&!inside&&S.hour>=6&&S.hour<19&&!S.rain&&S.wx!=='snow'&&S.wx!=='storm';}
// can an animal stand here, and walk straight here from where it is? (never through fences, decor or trees)
function ranchFree(x,z){const k=K(Math.round(x),Math.round(z));const t=landMap.get(k);if(t!=='grass'&&t!=='sand'&&t!=='bridge')return false;return !solidR(Math.round(x),Math.round(z));}
function ranchLine(x0,z0,x1,z1){const n=Math.ceil(Math.hypot(x1-x0,z1-z0)/0.4);for(let i=1;i<=n;i++){const t=i/n;if(!ranchFree(x0+(x1-x0)*t,z0+(z1-z0)*t))return false;}return true;}
function updateRanch(dt,tt){const out=ranchOutside();
  for(const h of herd){const o=h.o,door=[o.x,o.z+0.95];
    if(out!==h.out){h.out=out;if(out){h.x=door[0];h.z=door[1];h.tx=h.x;h.tz=h.z;}}
    h.g.visible=out;if(!out)continue;
    h.t-=dt;if(h.t<=0){h.t=2+Math.random()*5;for(let i=0;i<8;i++){const a=Math.random()*6.283,r=0.8+Math.random()*3.2,x=o.x+Math.cos(a)*r,z=o.z+0.6+Math.sin(a)*r;if(ranchFree(x,z)&&ranchLine(h.x,h.z,x,z)){h.tx=x;h.tz=z;break;}}}
    const dx=h.tx-h.x,dz=h.tz-h.z,d=Math.hypot(dx,dz),bird=h.a.k==='chicken'||h.a.k==='duck',sp=bird?0.55:0.38,moving=d>0.05;
    if(moving){h.act=null;const s=Math.min(d,sp*dt);h.x+=dx/d*s;h.z+=dz/d*s;h.walk+=dt*sp*(bird?22:15);const yaw=Math.atan2(dx,dz);let dy=yaw-h.g.rotation.y;dy=Math.atan2(Math.sin(dy),Math.cos(dy));h.g.rotation.y+=dy*Math.min(1,dt*5);}
    else{// idle: peck, graze, flap, or just stand and breathe
      if(h.act){h.actT+=dt;if(h.actT>(h.act==='graze'?4.5:1.6))h.act=null;}
      else if(Math.random()<dt*(bird?0.7:0.25)){h.act=bird?'peck':'graze';h.actT=0;}
      if(bird&&Math.random()<dt*0.06)h.flap=0.6;}
    const pd=Math.hypot(vil.x-h.x,vil.z-h.z);let look=null;if(pd<3){look=Math.atan2(vil.x-h.x,vil.z-h.z)-h.g.rotation.y;look=Math.atan2(Math.sin(look),Math.cos(look));}
    animRig(h,dt,tt,{moving,look});
    h.g.position.set(h.x,topY(Math.round(h.x),Math.round(h.z)),h.z);
    // the "ready" bubble: milk, wool, or wanting a pat today
    const want=h.a.ready||h.a.pet!==S.day;if(want&&Math.random()<dt*0.8)emit(h.x,topY(Math.round(h.x),Math.round(h.z))+h.g.userData.H+0.15,h.z,{vy:0.4,life:1,max:1,size:0.07,color:h.a.ready?0xfff0a0:0xffa8c8,g:-0.1});}
  updatePet(dt,tt);}
function updatePet(dt,tt){const P0=RS().pet;if(!P0){if(petR){scene.remove(petR.g);petR=null;}return;}
  if(!petR||petR.k!==P0.k+P0.v+(P0.acc||'')){if(petR)scene.remove(petR.g);const g=animalModel(P0.k,P0.v,P0.acc);scene.add(g);petR={k:P0.k+P0.v+(P0.acc||''),g,x:P0.x!=null?P0.x:HOUSE_AT.x+0.5,z:P0.z!=null?P0.z:HOUSE_AT.z+2.4,walk:0,sit:0,ph:0};}
  const r=petR,g=r.g;g.visible=!inside&&!S.sea&&!(swim&&swim.on);if(!g.visible)return;
  let tx=r.x,tz=r.z;const ph0=!P0.stray&&(S.hour>=20.5||S.hour<6)&&petHouse();if(ph0){tx=ph0.x;tz=ph0.z+0.75;}/* bedtime: off to its own bed (75c) */
  else if(!P0.stray){const dist=Math.hypot(vil.x-r.x,vil.z-r.z);if(dist>14){r.x=vil.x-1;r.z=vil.z-1;}
    const back=villager.rotation.y+Math.PI+0.6;tx=vil.x+Math.sin(back)*1.1;tz=vil.z+Math.cos(back)*1.1;if(Math.hypot(tx-r.x,tz-r.z)<0.5){tx=r.x;tz=r.z;}}
  else{r.ph+=dt;if(r.ph>3){r.ph=0;const a=Math.random()*6.28;const x=HOUSE_AT.x+0.5+Math.cos(a)*2,z=HOUSE_AT.z+2.6+Math.sin(a)*1.2;if(ranchFree(x,z)){r.tx=x;r.tz=z;}}if(r.tx!=null){tx=r.tx;tz=r.tz;}}
  const dx=tx-r.x,dz=tz-r.z,d=Math.hypot(dx,dz),run=d>2.6,sp=d>4?4:run?2.8:1.3,moving=d>0.08;
  if(moving){const s=Math.min(d,sp*dt);r.x+=dx/d*s;r.z+=dz/d*s;r.walk+=dt*sp*(run?11:15);const yaw=Math.atan2(dx,dz);let dy=yaw-g.rotation.y;dy=Math.atan2(Math.sin(dy),Math.cos(dy));g.rotation.y+=dy*Math.min(1,dt*9);r.idle=0;r.sit=Math.max(0,(r.sit||0)-dt*5);r.lie=Math.max(0,(r.lie||0)-dt*5);}
  else{r.idle=(r.idle||0)+dt;if(r.idle>0.5)r.sit=Math.min(1,(r.sit||0)+dt*2.5);if(r.idle>10&&!P0.stray)r.lie=Math.min(1,(r.lie||0)+dt*1.2);
    if(!P0.stray){const ty=Math.atan2(vil.x-r.x,vil.z-r.z);let dy=ty-g.rotation.y;dy=Math.atan2(Math.sin(dy),Math.cos(dy));if(Math.abs(dy)>0.9)g.rotation.y+=dy*Math.min(1,dt*1.5);}}
  const pd=Math.hypot(vil.x-r.x,vil.z-r.z);let look=null;if(pd<4){look=Math.atan2(vil.x-r.x,vil.z-r.z)-g.rotation.y;look=Math.atan2(Math.sin(look),Math.cos(look));}
  r.excite=Math.max(0,(r.excite||0)-dt);const vm=Math.hypot(vil.tx-vil.x,vil.tz-vil.z)>0.2;
  animRig(r,dt,tt,{moving,gallop:run,look,excited:r.excite>0||(vm&&!P0.stray),tilt:!moving&&r.idle>2&&r.idle<6});
  g.position.set(r.x,topY(Math.round(r.x),Math.round(r.z)),r.z);P0.x=r.x;P0.z=r.z;}

// ---- tapping an animal or the pet
function ranchTap(cx,cy){let best=null,bd=46;
  for(const h of herd){if(!h.g.visible)continue;const s=toScreen(h.x,h.g.position.y+0.35,h.z);const d=Math.hypot(s[0]-cx,s[1]-cy);if(d<bd){bd=d;best={h};}}
  if(petR&&petR.g.visible){const s=toScreen(petR.x,petR.g.position.y+0.3,petR.z);const d=Math.hypot(s[0]-cx,s[1]-cy);if(d<bd){bd=d;best={pet:1};}}
  if(!best)return false;
  if(best.pet){const P0=RS().pet;goTo(petR.x+0.6,petR.z+0.6,()=>{villager.rotation.y=Math.atan2(petR.x-vil.x,petR.z-vil.z);petTap();});return true;}
  const h=best.h;goTo(h.x+0.7,h.z+0.5,()=>{villager.rotation.y=Math.atan2(h.x-vil.x,h.z-vil.z);animalTap(h);});return true;}
function hrt(f){const n=Math.min(5,Math.floor((f||0)/200));return'♥'.repeat(n)+'♡'.repeat(5-n);}
function sayAnimal(k){for(const [i,s] of (RANCH[k]?RANCH[k].sound:k==='dog'?[[620,0.07,520],[680,0.08,560]]:[[880,0.18,700]]).entries())setTimeout(()=>tone(s[0],s[1],'triangle',0.035,s[2]),i*110);}
function animalTap(h){const a=h.a,R0=RANCH[a.k],y=h.g.position.y+0.6;
  if(a.ready){const key=a.ready;a.ready=null;gain('x:'+key);a.f=Math.min(1000,(a.f||0)+5);SFX.coin();floatText(h.x,y+0.4,h.z,'+ '+CONSUM[key].name,key.startsWith('l')?'gold':'');burst(h.x,y,h.z,a.k==='sheep'?0xf6f2ea:0xffffff,10,1.2,0.07);
    if(a.pet!==S.day){a.pet=S.day;hearts(h.x,y,h.z);}save();updateHUD();return;}
  h.happy=0.9;if(h.a.k==='chicken'||h.a.k==='duck')h.flap=0.6;
  if(a.pet!==S.day){a.pet=S.day;a.f=Math.min(1000,(a.f||0)+10);hearts(h.x,y,h.z);sayAnimal(a.k);floatText(h.x,y+0.4,h.z,`${a.name} ♥`);save();return;}
  sayAnimal(a.k);careCard(h);}/* brush, treat, dress up (75c) */
function petTap(){const P0=RS().pet;if(!P0)return;const y=petR.g.position.y+0.5;
  if(P0.stray){setAction(`A little ${PET_KINDS[P0.k].cn[P0.v%4].toLowerCase()} ${P0.k} has been hanging about your home. It looks hungry, and very hopeful.`,[{label:'Adopt it',cls:'go',fn:()=>{const n=prompt(`What will you call your ${P0.k}?`,P0.k==='dog'?'Biscuit':'Mochi');P0.name=(n&&n.trim()||(P0.k==='dog'?'Biscuit':'Mochi')).slice(0,14);P0.stray=0;P0.f=200;P0.pet=S.day;SFX.rare();hearts(petR.x,y,petR.z);sayAnimal(P0.k);toast(`<b>${P0.name}</b> is part of the family! Pet ${P0.k==='dog'?'him':'her'} every day.`,'rare',ICON.star);save();clearAction();}},{label:'Not now',fn:clearAction}],'Stray');return;}
  sayAnimal(P0.k);hearts(petR.x,y,petR.z);petR.sit=0;petR.lie=0;petR.idle=0;petR.happy=1;petR.excite=2.5;
  if(P0.pet!==S.day){P0.pet=S.day;P0.f=Math.min(1000,(P0.f||0)+12);floatText(petR.x,y+0.4,petR.z,`${P0.name} ♥`);save();}
  else setAction(`<b>${P0.name}</b> · <span class="hearts">${hrt(P0.f)}</span><br><small>${P0.k==='dog'?'Tail going like a windmill.':'Purring like a little engine.'} Happy pets bring you things they find${petHouse()?'':', and more often with a bed of their own (a Doghouse or Cat Bed)'}.</small>`,[{label:'Dress up',fn:()=>{const i=(ACCS.indexOf(P0.acc||null)+1)%ACCS.length;P0.acc=ACCS[i];if(!P0.acc)delete P0.acc;save();toast(P0.acc?`${P0.name} is wearing ${ACC_N[P0.acc]}!`:`${P0.name}'s dressed down.`);}},{label:'Rename',fn:()=>{const n=prompt(`A new name for ${P0.name}?`,P0.name);if(n&&n.trim()){P0.name=n.trim().slice(0,14);save();}clearAction();}},{label:'Close',fn:clearAction}],PET_KINDS[P0.k].name);}

// ---- dawn: feeding, friendship, produce; the pet's gifts; a stray turns up
function ranchDawn(quiet){const R=RS(),fair=!S.rain&&S.wx!=='snow'&&S.wx!=='storm'&&season()!=='winter',prev=S.day-1;let eggs=0,ready=[],hungry=[],truffles=0;
  for(const a of R.animals){const o=S.objs.find(q=>q.id===a.home);if(!o)continue;const R0=RANCH[a.k];
    let fed=fair;if(!fed&&takeHay())fed=true;/* troughs first, then your bag (75c) */a.hungry=!fed;
    a.f=Math.max(0,Math.min(1000,(a.f||0)+(a.pet===prev?15:-6)+(fed?0:-10)));
    if(!fed){hungry.push(a.name);continue;}if(isBaby(a))continue;/* too young yet */
    a.n=(a.n||0)+1;if(a.n<R0.every)continue;a.n=0;
    const big=R0.big&&a.f>=400&&Math.random()<a.f/1400,key=big?R0.big:R0.prod;
    if(a.k==='chicken'||a.k==='duck'){const L=R.eggs[o.id]||(R.eggs[o.id]=[]);if(L.length<16){L.push(key);eggs++;}if(a.k==='duck'&&a.f>=700&&Math.random()<0.12)L.push('dfeather');}
    else if(a.k==='pig'){if(fair){const n=1+(a.f>=500&&Math.random()<0.5?1:0);for(let i=0;i<n;i++){for(let t=0;t<20;t++){const x=o.x+Math.round((Math.random()-0.5)*7),z=o.z+Math.round((Math.random()-0.5)*7);if(freeTile(x,z)&&landMap.get(K(x,z))==='grass'){S.finds.push({k:'truffle',x,z});truffles++;break;}}}}}
    else{a.ready=key;ready.push(a.name);}}
  // the pet
  const P0=R.pet;if(P0&&!P0.stray){P0.f=Math.max(0,Math.min(1000,(P0.f||0)+(P0.pet===prev?12:-5)));
    if(P0.pet===prev&&Math.random()<0.25+P0.f/2000+(petHouse()?0.15:0)){const G=['g:shell','g:acorn','g:mushroom','g:feather','g:pinecone','g:oldcoin','g:geode','g:button','g:arrowhead','g:robinegg'].filter(k=>FINDS[k.slice(2)]),k=pickR(G);gain(k);if(!quiet)setTimeout(()=>toast(`<b>${P0.name}</b> brought you a ${nameOf(k).toLowerCase()} this morning!`,'',iconOf(k)),2600);}}
  if(!P0&&S.day>=2&&S.wild!==undefined){const k=Math.random()<0.5?'dog':'cat';R.pet={k,v:Math.floor(Math.random()*4),name:'',f:0,pet:0,stray:1};if(!quiet)setTimeout(()=>toast(`A stray ${k} is hanging about by your home… go and say hello.`,'',ICON.star),3200);}
  try{farmDawn(quiet);}catch(e){console.error(e);}/* babies, births, the incubator (75c) */
  if(!quiet&&(eggs||ready.length||hungry.length||truffles))setTimeout(()=>toast([eggs?`${eggs} egg${eggs>1?'s':''} in the coop`:'',ready.length?`${ready.slice(0,3).join(', ')} ${ready.length>1?'are':'is'} ready`:'',truffles?`truffles by the barn`:'',hungry.length?`${hungry.slice(0,2).join(' and ')} went hungry (no hay)`:''].filter(Boolean).join(' · '),hungry.length?'':'',ICON['x:egg']),2000);}

// ---- the coop / barn sheet: who lives here, eggs, and buying animals
function ranchBldTap(o){walkTo(o.x,o.z);openSheet('ranch',null,o);}
const animalThumbs={};function animalThumb(k,v=0){const id=k+v;if(!animalThumbs[id]){const g=animalModel(k,v);g.rotation.y=0.7;animalThumbs[id]=snapThumb(g,72);}return animalThumbs[id];}
function ranchSheet(body){const o=sheet.ctx;if(!o||!S.objs.includes(o)){closeSheet();return;}const B=BUILD[o.k],list=animalsOf(o),eggs=RS().eggs[o.id]||[];
  $('sheetTitle').textContent=B.name;$('sheetTabs').innerHTML='';let h='';
  if(o.k==='coop')h+=eggs.length?`<div class="sellall"><button class="pbtn go" data-rcollect="1">Collect ${eggs.length} egg${eggs.length>1?'s':''}</button></div>`:`<p class="note">No eggs yet. Hens lay overnight when they've been fed.</p>`;
  if(o.k==='coop'){const inc=(RS().inc||{})[o.id],eg=['x:egg','x:legg','x:duckegg'].filter(k=>S.inv[k]>0);h+=inc?`<p class="note">An egg is warming in the incubator: it hatches ${inc.day-S.day>1?'in '+(inc.day-S.day)+' days':'tomorrow'}.</p>`:`<div class="card wide"><span class="grow"><span class="nm">Incubator</span><br><span class="sub">Put in an egg and a chick (or duckling) hatches in 2 days, if there's room.</span></span>${eg.slice(0,2).map(k=>`<button class="pbtn go" data-rinc="${k}" ${list.length>=RANCH_CAP?'disabled':''}>${nameOf(k)}</button>`).join('')||'<span class="sub">No eggs in your bag</span>'}</div>`;}
  h+=`<h3 class="sech">Living here (${list.length}/${RANCH_CAP})</h3>`;
  h+=list.length?`<div class="grid">${list.map(a=>`<div class="card wide"><img src="${animalThumb(a.k,a.v||0)}" alt=""><span class="grow"><span class="nm">${a.name}</span> <span class="hearts">${hrt(a.f)}</span><br><span class="sub">${isBaby(a)?'Baby '+BABY[a.k]+' · grows up in '+(GROW[a.k]-(S.day-a.born))+'d':RANCH[a.k].name} · ${a.pet===S.day?'petted today':'wants a pat today'}${a.ready?' · <b>ready!</b>':''}</span></span></div>`).join('')}</div>`:`<p class="note">Nobody lives here yet.</p>`;
  h+=`<p class="note">Animals graze outside on fair days. On rainy, snowy and winter days they eat <b>hay</b> from your bag at dawn (you have ${S.inv['x:hay']||0}). Harvesting wheat gives hay, or make it from fiber at the Workbench.</p>`;
  h+=`<h3 class="sech">Buy animals</h3><div class="grid">`;const lv=level();
  for(const [k,R0] of Object.entries(RANCH)){if(R0.home!==o.k)continue;const lock=R0.lvl>lv,full=list.length>=RANCH_CAP,poor=S.shells<R0.cost;
    h+=`<div class="card wide ${lock?'lock':''}"><img src="${animalThumb(k,0)}" alt=""><span class="grow"><span class="nm">${R0.name}</span><br><span class="sub">${lock?'Unlocks at Lv '+R0.lvl:R0.desc}</span></span><button class="pbtn go" data-rbuy="${k}" ${lock||full||poor?'disabled':''}>${fmt(R0.cost)}</button></div>`;}
  body.innerHTML=h+'</div>';}
function ranchClick(d){const o=sheet.ctx;
  if(d.rinc){const k=d.rinc;if(!(S.inv[k]>0))return true;S.inv[k]--;if(!S.inv[k])delete S.inv[k];const R0=RS();R0.inc=R0.inc||{};R0.inc[o.id]={k:k==='x:duckegg'?'duck':'chicken',day:S.day+2};SFX.place();toast('The egg is warm and snug. It hatches in 2 days.','',ICON[k]);save();renderSheet();return true;}
  if(d.rcollect){const L=RS().eggs[o.id]||[];const n=L.length;for(const k of L)gain('x:'+k);RS().eggs[o.id]=[];SFX.coin();if(n)floatText(o.x,1.4,o.z,`+${n} egg${n>1?'s':''}`);save();updateHUD();renderSheet();return true;}
  if(d.rbuy){const R0=RANCH[d.rbuy];if(S.shells<R0.cost||animalsOf(o).length>=RANCH_CAP)return true;S.shells-=R0.cost;const used=new Set(RS().animals.map(a=>a.name));const name=pickR(RANCH_NAMES.filter(n=>!used.has(n)))||R0.name;
    RS().animals.push({id:(S.nextId++),k:d.rbuy,name,home:o.id,f:100,pet:0,n:0,ready:null,v:Math.floor(Math.random()*3),born:S.day});SFX.coin();toast(`Welcome, <b>${name}</b> the ${R0.name.toLowerCase()}! Tap ${name} to pet them every day.`,'rare',animalThumb(d.rbuy,0));syncRanch();save();updateHUD();renderSheet();return true;}
  return false;}
