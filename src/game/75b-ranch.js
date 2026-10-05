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

// ---- models: soft rounded animals, legs separate so they can walk
function animalModel(k,v){const g=new T.Group(),p=[],legs=[],head=new T.Group();const R=mulberry((v|0)*7+3);
  const eye=(q,x,y,z,s=0.03)=>q.push(P(SPH_XS,0x2a2230,x,y,z,0,0,0,s,s*1.1,s),P(SPH_XS,0xffffff,x+s*0.25,y+s*0.3,z+s*0.35,0,0,0,s*0.4,s*0.4,s*0.4));
  const leg=(col,x,z,h,r)=>{const m=M([P(CYL8,col,0,-h/2,0,0,0,0,r,h,r)]);m.position.set(x,h,z);legs.push(m);g.add(m);};
  let hp=[];
  switch(k){
    case'chicken':{const C=[0xfbf8f0,0xc87a3a,0x3a3434][v%3];p.push(PG(SPH_LO,C,lerpHex(C,0x000000,0.15),0,0.24,0,0,0,0,0.3,0.26,0.36),PG(SCONE,C,lerpHex(C,0x000000,0.2),0,0.32,-0.2,-0.9,0,0,0.16,0.18,0.12));
      hp.push(PG(SPH_LO,C,lerpHex(C,0x000000,0.1),0,0,0,0,0,0,0.17,0.18,0.17),P(BOX,0xe8403a,0,0.1,0.01,0,0,0,0.03,0.07,0.09),P(BOX,0xe8403a,0,0.115,-0.03,0,0,0,0.03,0.06,0.06),P(CONE4,0xf2b440,0,-0.01,0.1,1.57,0,0,0.05,0.07,0.05),P(SPH_XS,0xe8403a,0,-0.06,0.07,0,0,0,0.035,0.05,0.03));
      eye(hp,0.06,0.02,0.06);eye(hp,-0.06,0.02,0.06);head.position.set(0,0.4,0.15);for(const x of [-0.06,0.06])leg(0xe8a040,x,0,0.12,0.025);break;}
    case'duck':{const C=v%2?0xfbf8f0:0xa88a5a;p.push(PG(SPH_LO,C,lerpHex(C,0x000000,0.15),0,0.2,0,0,0,0,0.3,0.22,0.42),PG(SCONE,C,C,0,0.26,-0.24,-1.2,0,0,0.12,0.12,0.1));
      hp.push(PG(SPH_LO,v%2?C:0x3a7a4a,C,0,0,0,0,0,0,0.16,0.16,0.17),P(BOX,0xf09a30,0,-0.02,0.11,0,0,0,0.09,0.03,0.1));eye(hp,0.055,0.03,0.05);eye(hp,-0.055,0.03,0.05);head.position.set(0,0.38,0.17);
      for(const x of [-0.07,0.07])leg(0xf09a30,x,0,0.1,0.025);break;}
    case'cow':{const C=v%2?0x8a5a3a:0xfbf8f0,S2=v%2?0xfbf8f0:0x2e2a2c;p.push(PG(SPH_LO,C,lerpHex(C,0x000000,0.12),0,0.52,0,0,0,0,0.52,0.46,0.86));
      for(let i=0;i<5;i++){const a=R()*6.28,y=0.48+R()*0.18;p.push(P(SPH_LO,S2,Math.cos(a)*0.24,y,(R()-0.5)*0.6,0,0,0,0.04+R()*0.06,0.16+R()*0.1,0.18+R()*0.12));}
      p.push(P(SPH_LO,0xf2a8b0,0,0.3,-0.18,0,0,0,0.16,0.1,0.18),PG(CYL6,C,C,0,0.62,-0.45,0.6,0,0,0.04,0.3,0.04));
      hp.push(PG(SPH_LO,C,lerpHex(C,0x000000,0.1),0,0,0,0,0,0,0.3,0.3,0.32),P(SPH_LO,0xf2c0b8,0,-0.07,0.14,0,0,0,0.22,0.15,0.12),P(SPH_XS,0x6a4a4a,0.04,-0.06,0.2,0,0,0,0.025,0.025,0.02),P(SPH_XS,0x6a4a4a,-0.04,-0.06,0.2,0,0,0,0.025,0.025,0.02),
        P(CONE4,0xf2ead8,0.1,0.15,-0.02,0,0,-0.5,0.04,0.12,0.04),P(CONE4,0xf2ead8,-0.1,0.15,-0.02,0,0,0.5,0.04,0.12,0.04),P(SPH_XS,C,0.16,0.06,-0.04,0,0,0,0.12,0.05,0.08),P(SPH_XS,C,-0.16,0.06,-0.04,0,0,0,0.12,0.05,0.08));
      eye(hp,0.09,0.05,0.11,0.035);eye(hp,-0.09,0.05,0.11,0.035);head.position.set(0,0.7,0.46);for(const [x,z] of [[-0.14,0.26],[0.14,0.26],[-0.14,-0.26],[0.14,-0.26]])leg(C,x,z,0.3,0.09);break;}
    case'goat':{const C=[0xf2ece0,0xb08a5a,0x6a5a4a][v%3];p.push(PG(SPH_LO,C,lerpHex(C,0x000000,0.15),0,0.42,0,0,0,0,0.36,0.34,0.62),PG(CONE4,C,C,0,0.5,-0.32,-0.8,0,0,0.06,0.12,0.06));
      hp.push(PG(SPH_LO,C,lerpHex(C,0x000000,0.1),0,0,0,0,0,0,0.2,0.22,0.26),P(SPH_XS,0x3a3030,0,-0.05,0.13,0,0,0,0.04,0.03,0.03),P(CONE8,0x8a7a6a,0.06,0.14,-0.06,-0.6,0,-0.3,0.04,0.18,0.04),P(CONE8,0x8a7a6a,-0.06,0.14,-0.06,-0.6,0,0.3,0.04,0.18,0.04),
        P(CONE4,lerpHex(C,0xffffff,0.3),0,-0.15,0.08,3.14,0,0,0.05,0.1,0.05),P(SPH_XS,C,0.13,0.03,-0.02,0,0,0.4,0.1,0.04,0.06),P(SPH_XS,C,-0.13,0.03,-0.02,0,0,-0.4,0.1,0.04,0.06));
      eye(hp,0.07,0.03,0.08);eye(hp,-0.07,0.03,0.08);head.position.set(0,0.62,0.32);for(const [x,z] of [[-0.1,0.18],[0.1,0.18],[-0.1,-0.18],[0.1,-0.18]])leg(C,x,z,0.26,0.06);break;}
    case'sheep':{for(let i=0;i<14;i++){const a=i*2.4,y=0.36+(i%3)*0.08;p.push(P(SPH_LO,i%4?0xf6f2ea:0xe8e2d6,Math.cos(a)*0.14,y,Math.sin(a)*0.22,0,0,0,0.24,0.22,0.24));}
      hp.push(P(SPH_LO,0x3a3438,0,0,0,0,0,0,0.18,0.2,0.22),P(SPH_LO,0xf6f2ea,0,0.09,-0.02,0,0,0,0.16,0.08,0.14),P(SPH_XS,0x3a3438,0.12,0.02,-0.02,0,0,0.5,0.1,0.04,0.06),P(SPH_XS,0x3a3438,-0.12,0.02,-0.02,0,0,-0.5,0.1,0.04,0.06));
      hp.push(P(SPH_XS,0xffffff,0.05,0.03,0.09,0,0,0,0.03,0.035,0.02),P(SPH_XS,0xffffff,-0.05,0.03,0.09,0,0,0,0.03,0.035,0.02),P(SPH_XS,0x1a1a1a,0.05,0.03,0.1,0,0,0,0.018,0.02,0.015),P(SPH_XS,0x1a1a1a,-0.05,0.03,0.1,0,0,0,0.018,0.02,0.015));
      head.position.set(0,0.5,0.3);for(const [x,z] of [[-0.1,0.14],[0.1,0.14],[-0.1,-0.14],[0.1,-0.14]])leg(0x3a3438,x,z,0.24,0.05);break;}
    case'pig':{const C=v%2?0xf4b0b0:0xe89a9a;p.push(PG(SPH_LO,C,lerpHex(C,0x000000,0.12),0,0.32,0,0,0,0,0.44,0.38,0.62));for(let i=0;i<5;i++){const a=i*1.3;p.push(P(CYL6,C,Math.cos(a)*0.03,0.42+i*0.015,-0.32-Math.sin(a)*0.03,1.57,0,0,0.015,0.03,0.015));}
      hp.push(PG(SPH_LO,C,lerpHex(C,0x000000,0.1),0,0,0,0,0,0,0.3,0.28,0.28),P(CYL12,lerpHex(C,0xff8080,0.2),0,-0.03,0.15,1.57,0,0,0.12,0.06,0.1),P(SPH_XS,0x8a4a4a,0.025,-0.03,0.185,0,0,0,0.02,0.025,0.015),P(SPH_XS,0x8a4a4a,-0.025,-0.03,0.185,0,0,0,0.02,0.025,0.015),
        P(CONE4,C,0.1,0.13,0,0.4,0,-0.3,0.08,0.1,0.05),P(CONE4,C,-0.1,0.13,0,0.4,0,0.3,0.08,0.1,0.05));eye(hp,0.07,0.05,0.12);eye(hp,-0.07,0.05,0.12);head.position.set(0,0.38,0.36);
      for(const [x,z] of [[-0.12,0.18],[0.12,0.18],[-0.12,-0.18],[0.12,-0.18]])leg(C,x,z,0.16,0.07);break;}
    case'dog':{const C=PET_KINDS.dog.coats[v%4],W=v%4===3?0xf4f0e8:0xfbf6ea;p.push(PG(SPH_LO,C,lerpHex(C,0x000000,0.15),0,0.3,0,0,0,0,0.28,0.28,0.48),P(SPH_LO,W,0,0.28,0.12,0,0,0,0.2,0.22,0.22));
      for(let i=0;i<4;i++){const a=i*0.7;p.push(P(SPH_XS,i?C:W,0,0.42+Math.sin(a)*0.08,-0.22-Math.cos(a)*0.06+0.06,0,0,0,0.09,0.09,0.09));}
      hp.push(PG(SPH_LO,C,lerpHex(C,0x000000,0.1),0,0,0,0,0,0,0.26,0.24,0.24),P(SPH_LO,W,0,-0.04,0.1,0,0,0,0.15,0.11,0.13),P(SPH_XS,0x2a2230,0,-0.01,0.17,0,0,0,0.04,0.03,0.03),P(CONE4,C,0.08,0.14,0,0,0.785,-0.2,0.07,0.12,0.05),P(CONE4,C,-0.08,0.14,0,0,0.785,0.2,0.07,0.12,0.05));
      eye(hp,0.06,0.04,0.1);eye(hp,-0.06,0.04,0.1);head.position.set(0,0.48,0.24);for(const [x,z] of [[-0.08,0.14],[0.08,0.14],[-0.08,-0.14],[0.08,-0.14]])leg(C,x,z,0.16,0.055);break;}
    default:{/* cat */const C=PET_KINDS.cat.coats[v%4];p.push(PG(SPH_LO,C,lerpHex(C,0x000000,0.15),0,0.22,0,0,0,0,0.22,0.22,0.38));
      for(let i=0;i<7;i++){const t=i/6;p.push(P(SPH_XS,C,0,0.24+Math.sin(t*2.2)*0.2,-0.2-t*0.2,0,0,0,0.06,0.06,0.07));}
      hp.push(PG(SPH_LO,C,lerpHex(C,0x000000,0.1),0,0,0,0,0,0,0.22,0.2,0.2),P(SPH_XS,0xf2a8b0,0,-0.02,0.1,0,0,0,0.025,0.02,0.02),P(CONE4,C,0.07,0.11,0,0,0.785,-0.15,0.07,0.1,0.04),P(CONE4,C,-0.07,0.11,0,0,0.785,0.15,0.07,0.1,0.04));
      eye(hp,0.05,0.02,0.085,0.028);eye(hp,-0.05,0.02,0.085,0.028);head.position.set(0,0.38,0.18);for(const [x,z] of [[-0.06,0.11],[0.06,0.11],[-0.06,-0.11],[0.06,-0.11]])leg(C,x,z,0.12,0.045);}}
  const body=M(p);g.add(body);head.add(M(hp));g.add(head);g.traverse(o=>{if(o.isMesh)o.castShadow=true;});g.userData={legs,head};return g;}

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
function syncRanch(){for(const h of herd)scene.remove(h.g);herd.length=0;const homes=new Map(ranchHomes().map(o=>[o.id,o]));
  for(const a of RS().animals){if(!homes.has(a.home)){const o=ranchSpace(RANCH[a.k].home);if(o)a.home=o.id;else continue;}const o=homes.get(a.home)||S.objs.find(q=>q.id===a.home);if(!o)continue;
    const g=animalModel(a.k,a.v||0);g.visible=false;scene.add(g);herd.push({a,g,o,x:o.x,z:o.z+0.9,tx:o.x,tz:o.z+0.9,t:Math.random()*3,ph:Math.random()*6,out:false,walk:0});}}
function ranchOutside(){return !S.sea&&!inside&&S.hour>=6&&S.hour<19&&!S.rain&&S.wx!=='snow'&&S.wx!=='storm';}
// can an animal stand here, and walk straight here from where it is? (never through fences, decor or trees)
function ranchFree(x,z){const k=K(Math.round(x),Math.round(z));const t=landMap.get(k);if(t!=='grass'&&t!=='sand'&&t!=='bridge')return false;return !solidR(Math.round(x),Math.round(z));}
function ranchLine(x0,z0,x1,z1){const n=Math.ceil(Math.hypot(x1-x0,z1-z0)/0.4);for(let i=1;i<=n;i++){const t=i/n;if(!ranchFree(x0+(x1-x0)*t,z0+(z1-z0)*t))return false;}return true;}
function updateRanch(dt,tt){const out=ranchOutside();
  for(const h of herd){const o=h.o,door=[o.x,o.z+0.95];
    if(out!==h.out){h.out=out;if(out){h.x=door[0];h.z=door[1];h.tx=h.x;h.tz=h.z;}}
    h.g.visible=out;if(!out)continue;
    h.t-=dt;if(h.t<=0){h.t=2+Math.random()*5;for(let i=0;i<8;i++){const a=Math.random()*6.283,r=0.8+Math.random()*3.2,x=o.x+Math.cos(a)*r,z=o.z+0.6+Math.sin(a)*r;if(ranchFree(x,z)&&ranchLine(h.x,h.z,x,z)){h.tx=x;h.tz=z;break;}}}
    const dx=h.tx-h.x,dz=h.tz-h.z,d=Math.hypot(dx,dz),sp=h.a.k==='chicken'||h.a.k==='duck'?0.7:0.45;
    if(d>0.05){const s=Math.min(d,sp*dt);h.x+=dx/d*s;h.z+=dz/d*s;h.walk+=dt*sp*9;const yaw=Math.atan2(dx,dz);let dy=yaw-h.g.rotation.y;dy=Math.atan2(Math.sin(dy),Math.cos(dy));h.g.rotation.y+=dy*Math.min(1,dt*6);}
    const moving=d>0.05,U=h.g.userData;U.legs.forEach((l,i)=>{l.rotation.x=moving?Math.sin(h.walk+(i%2?Math.PI:0)+(i>1?Math.PI/2:0))*0.5:0;});
    if(U.head){const peck=(h.a.k==='chicken'||h.a.k==='duck')&&!moving?Math.max(0,Math.sin(tt*3+h.ph))**8*0.9:(!moving?Math.max(0,Math.sin(tt*0.7+h.ph))**6*0.5:0);U.head.rotation.x=peck;}
    h.g.position.set(h.x,topY(Math.round(h.x),Math.round(h.z))+(moving&&(h.a.k==='chicken')?Math.abs(Math.sin(h.walk))*0.03:0),h.z);
    // the "ready" bubble: milk, wool, or wanting a pat today
    const want=h.a.ready||h.a.pet!==S.day;if(want&&Math.random()<dt*0.8)emit(h.x,topY(Math.round(h.x),Math.round(h.z))+(OBJ_H[h.a.k]||0.9)+0.25,h.z,{vy:0.4,life:1,max:1,size:0.07,color:h.a.ready?0xfff0a0:0xffa8c8,g:-0.1});}
  updatePet(dt,tt);}
function updatePet(dt,tt){const P0=RS().pet;if(!P0){if(petR){scene.remove(petR.g);petR=null;}return;}
  if(!petR||petR.k!==P0.k+P0.v){if(petR)scene.remove(petR.g);const g=animalModel(P0.k,P0.v);scene.add(g);petR={k:P0.k+P0.v,g,x:P0.x!=null?P0.x:HOUSE_AT.x+0.5,z:P0.z!=null?P0.z:HOUSE_AT.z+2.4,walk:0,sit:0,ph:0};}
  const r=petR,g=r.g;g.visible=!inside&&!S.sea&&!(swim&&swim.on);if(!g.visible)return;
  let tx=r.x,tz=r.z;if(!P0.stray){const dist=Math.hypot(vil.x-r.x,vil.z-r.z);if(dist>14){r.x=vil.x-1;r.z=vil.z-1;}
    const back=villager.rotation.y+Math.PI+0.6;tx=vil.x+Math.sin(back)*1.1;tz=vil.z+Math.cos(back)*1.1;if(Math.hypot(tx-r.x,tz-r.z)<0.5){tx=r.x;tz=r.z;}}
  else{r.ph+=dt;if(r.ph>3){r.ph=0;const a=Math.random()*6.28;const x=HOUSE_AT.x+0.5+Math.cos(a)*2,z=HOUSE_AT.z+2.6+Math.sin(a)*1.2;if(ranchFree(x,z)){r.tx=x;r.tz=z;}}if(r.tx!=null){tx=r.tx;tz=r.tz;}}
  const dx=tx-r.x,dz=tz-r.z,d=Math.hypot(dx,dz),sp=d>3?4.2:d>1.2?2.6:1.2,moving=d>0.08;
  if(moving){const s=Math.min(d,sp*dt);r.x+=dx/d*s;r.z+=dz/d*s;r.walk+=dt*sp*7;const yaw=Math.atan2(dx,dz);let dy=yaw-g.rotation.y;dy=Math.atan2(Math.sin(dy),Math.cos(dy));g.rotation.y+=dy*Math.min(1,dt*8);r.sit=Math.max(0,r.sit-dt*4);}
  else{r.sit=Math.min(1,r.sit+dt*1.5);const ty=Math.atan2(vil.x-r.x,vil.z-r.z);if(!P0.stray){let dy=ty-g.rotation.y;dy=Math.atan2(Math.sin(dy),Math.cos(dy));g.rotation.y+=dy*Math.min(1,dt*2);}}
  const U=g.userData;U.legs.forEach((l,i)=>{l.rotation.x=moving?Math.sin(r.walk+(i%2?Math.PI:0)+(i>1?Math.PI/2:0))*0.7:(i>1?-r.sit*0.9:0);});
  if(U.head)U.head.rotation.x=moving?0:Math.sin(tt*1.3)*0.08-r.sit*0.1;
  g.rotation.x=-r.sit*0.18;g.position.set(r.x,topY(Math.round(r.x),Math.round(r.z))+(moving?Math.abs(Math.sin(r.walk))*0.04:0)-r.sit*0.04,r.z);P0.x=r.x;P0.z=r.z;}

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
  if(a.pet!==S.day){a.pet=S.day;a.f=Math.min(1000,(a.f||0)+10);hearts(h.x,y,h.z);sayAnimal(a.k);floatText(h.x,y+0.4,h.z,`${a.name} ♥`);save();return;}
  sayAnimal(a.k);const next=Math.max(1,R0.every-(a.n||0));
  setAction(`<b>${a.name}</b> the ${R0.name.toLowerCase()} · <span class="hearts">${hrt(a.f)}</span><br><small>Petted today. ${a.k==='pig'?'Finds truffles on fair days.':`Next ${CONSUM[R0.prod]?CONSUM[R0.prod].name.toLowerCase():R0.prod} ${next>1?'in '+next+' days':'tomorrow'}, if fed.`} ${S.inv['x:hay']?`Hay in your bag: ${S.inv['x:hay']}.`:'No hay in your bag for rainy days.'}</small>`,
    [{label:'Rename',fn:()=>{const n=prompt(`A new name for ${a.name}?`,a.name);if(n&&n.trim()){a.name=n.trim().slice(0,14);save();}clearAction();}},{label:'Close',fn:clearAction}],R0.name);}
function petTap(){const P0=RS().pet;if(!P0)return;const y=petR.g.position.y+0.5;
  if(P0.stray){setAction(`A little ${PET_KINDS[P0.k].cn[P0.v%4].toLowerCase()} ${P0.k} has been hanging about your home. It looks hungry, and very hopeful.`,[{label:'Adopt it',cls:'go',fn:()=>{const n=prompt(`What will you call your ${P0.k}?`,P0.k==='dog'?'Biscuit':'Mochi');P0.name=(n&&n.trim()||(P0.k==='dog'?'Biscuit':'Mochi')).slice(0,14);P0.stray=0;P0.f=200;P0.pet=S.day;SFX.rare();hearts(petR.x,y,petR.z);sayAnimal(P0.k);toast(`<b>${P0.name}</b> is part of the family! Pet ${P0.k==='dog'?'him':'her'} every day.`,'rare',ICON.star);save();clearAction();}},{label:'Not now',fn:clearAction}],'Stray');return;}
  sayAnimal(P0.k);hearts(petR.x,y,petR.z);petR.sit=0;
  if(P0.pet!==S.day){P0.pet=S.day;P0.f=Math.min(1000,(P0.f||0)+12);floatText(petR.x,y+0.4,petR.z,`${P0.name} ♥`);save();}
  else setAction(`<b>${P0.name}</b> · <span class="hearts">${hrt(P0.f)}</span><br><small>${P0.k==='dog'?'Tail going like a windmill.':'Purring like a little engine.'} Happy pets bring you things they find.</small>`,[{label:'Rename',fn:()=>{const n=prompt(`A new name for ${P0.name}?`,P0.name);if(n&&n.trim()){P0.name=n.trim().slice(0,14);save();}clearAction();}},{label:'Close',fn:clearAction}],PET_KINDS[P0.k].name);}

// ---- dawn: feeding, friendship, produce; the pet's gifts; a stray turns up
function ranchDawn(quiet){const R=RS(),fair=!S.rain&&S.wx!=='snow'&&S.wx!=='storm'&&season()!=='winter',prev=S.day-1;let eggs=0,ready=[],hungry=[],truffles=0;
  for(const a of R.animals){const o=S.objs.find(q=>q.id===a.home);if(!o)continue;const R0=RANCH[a.k];
    let fed=fair;if(!fed&&S.inv['x:hay']>0){S.inv['x:hay']--;if(!S.inv['x:hay'])delete S.inv['x:hay'];fed=true;}
    a.f=Math.max(0,Math.min(1000,(a.f||0)+(a.pet===prev?15:-6)+(fed?0:-10)));
    if(!fed){hungry.push(a.name);continue;}
    a.n=(a.n||0)+1;if(a.n<R0.every)continue;a.n=0;
    const big=R0.big&&a.f>=400&&Math.random()<a.f/1400,key=big?R0.big:R0.prod;
    if(a.k==='chicken'||a.k==='duck'){const L=R.eggs[o.id]||(R.eggs[o.id]=[]);if(L.length<16){L.push(key);eggs++;}if(a.k==='duck'&&a.f>=700&&Math.random()<0.12)L.push('dfeather');}
    else if(a.k==='pig'){if(fair){const n=1+(a.f>=500&&Math.random()<0.5?1:0);for(let i=0;i<n;i++){for(let t=0;t<20;t++){const x=o.x+Math.round((Math.random()-0.5)*7),z=o.z+Math.round((Math.random()-0.5)*7);if(freeTile(x,z)&&landMap.get(K(x,z))==='grass'){S.finds.push({k:'truffle',x,z});truffles++;break;}}}}}
    else{a.ready=key;ready.push(a.name);}}
  // the pet
  const P0=R.pet;if(P0&&!P0.stray){P0.f=Math.max(0,Math.min(1000,(P0.f||0)+(P0.pet===prev?12:-5)));
    if(P0.pet===prev&&Math.random()<0.25+P0.f/2000){const G=['g:shell','g:acorn','g:mushroom','g:feather','g:pinecone','g:oldcoin','g:geode','g:button','g:arrowhead','g:robinegg'].filter(k=>FINDS[k.slice(2)]),k=pickR(G);gain(k);if(!quiet)setTimeout(()=>toast(`<b>${P0.name}</b> brought you a ${nameOf(k).toLowerCase()} this morning!`,'',iconOf(k)),2600);}}
  if(!P0&&S.day>=2&&S.wild!==undefined){const k=Math.random()<0.5?'dog':'cat';R.pet={k,v:Math.floor(Math.random()*4),name:'',f:0,pet:0,stray:1};if(!quiet)setTimeout(()=>toast(`A stray ${k} is hanging about by your home… go and say hello.`,'',ICON.star),3200);}
  if(!quiet&&(eggs||ready.length||hungry.length||truffles))setTimeout(()=>toast([eggs?`${eggs} egg${eggs>1?'s':''} in the coop`:'',ready.length?`${ready.slice(0,3).join(', ')} ${ready.length>1?'are':'is'} ready`:'',truffles?`truffles by the barn`:'',hungry.length?`${hungry.slice(0,2).join(' and ')} went hungry (no hay)`:''].filter(Boolean).join(' · '),hungry.length?'':'',ICON['x:egg']),2000);}

// ---- the coop / barn sheet: who lives here, eggs, and buying animals
function ranchBldTap(o){walkTo(o.x,o.z);openSheet('ranch',null,o);}
const animalThumbs={};function animalThumb(k,v=0){const id=k+v;if(!animalThumbs[id]){const g=animalModel(k,v);g.rotation.y=0.7;animalThumbs[id]=snapThumb(g,72);}return animalThumbs[id];}
function ranchSheet(body){const o=sheet.ctx;if(!o||!S.objs.includes(o)){closeSheet();return;}const B=BUILD[o.k],list=animalsOf(o),eggs=RS().eggs[o.id]||[];
  $('sheetTitle').textContent=B.name;$('sheetTabs').innerHTML='';let h='';
  if(o.k==='coop')h+=eggs.length?`<div class="sellall"><button class="pbtn go" data-rcollect="1">Collect ${eggs.length} egg${eggs.length>1?'s':''}</button></div>`:`<p class="note">No eggs yet. Hens lay overnight when they've been fed.</p>`;
  h+=`<h3 class="sech">Living here (${list.length}/${RANCH_CAP})</h3>`;
  h+=list.length?`<div class="grid">${list.map(a=>`<div class="card wide"><img src="${animalThumb(a.k,a.v||0)}" alt=""><span class="grow"><span class="nm">${a.name}</span> <span class="hearts">${hrt(a.f)}</span><br><span class="sub">${RANCH[a.k].name} · ${a.pet===S.day?'petted today':'wants a pat today'}${a.ready?' · <b>ready!</b>':''}</span></span></div>`).join('')}</div>`:`<p class="note">Nobody lives here yet.</p>`;
  h+=`<p class="note">Animals graze outside on fair days. On rainy, snowy and winter days they eat <b>hay</b> from your bag at dawn (you have ${S.inv['x:hay']||0}). Harvesting wheat gives hay, or make it from fiber at the Workbench.</p>`;
  h+=`<h3 class="sech">Buy animals</h3><div class="grid">`;const lv=level();
  for(const [k,R0] of Object.entries(RANCH)){if(R0.home!==o.k)continue;const lock=R0.lvl>lv,full=list.length>=RANCH_CAP,poor=S.shells<R0.cost;
    h+=`<div class="card wide ${lock?'lock':''}"><img src="${animalThumb(k,0)}" alt=""><span class="grow"><span class="nm">${R0.name}</span><br><span class="sub">${lock?'Unlocks at Lv '+R0.lvl:R0.desc}</span></span><button class="pbtn go" data-rbuy="${k}" ${lock||full||poor?'disabled':''}>${fmt(R0.cost)}</button></div>`;}
  body.innerHTML=h+'</div>';}
function ranchClick(d){const o=sheet.ctx;
  if(d.rcollect){const L=RS().eggs[o.id]||[];const n=L.length;for(const k of L)gain('x:'+k);RS().eggs[o.id]=[];SFX.coin();if(n)floatText(o.x,1.4,o.z,`+${n} egg${n>1?'s':''}`);save();updateHUD();renderSheet();return true;}
  if(d.rbuy){const R0=RANCH[d.rbuy];if(S.shells<R0.cost||animalsOf(o).length>=RANCH_CAP)return true;S.shells-=R0.cost;const used=new Set(RS().animals.map(a=>a.name));const name=pickR(RANCH_NAMES.filter(n=>!used.has(n)))||R0.name;
    RS().animals.push({id:(S.nextId++),k:d.rbuy,name,home:o.id,f:100,pet:0,n:0,ready:null,v:Math.floor(Math.random()*3)});SFX.coin();toast(`Welcome, <b>${name}</b> the ${R0.name.toLowerCase()}! Tap ${name} to pet them every day.`,'rare',animalThumb(d.rbuy,0));syncRanch();save();updateHUD();renderSheet();return true;}
  return false;}
