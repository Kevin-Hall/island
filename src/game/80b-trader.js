/* =========================================================
   Marlo's boat: a trader who sails in to your dock every day (8am to 6pm, on a wild island before your store is
   built). You walk down and buy from the stall (a small stock that changes daily: seeds, bait, camp decor you then
   place, gear, a treasure map, a curio for the Islandex) or sell what you carry. The crate by your tent is the other
   way to sell: put things in, and Marlo collects it at dawn (the morning report says what it fetched).
   ========================================================= */
const TRADER={name:'Marlo',open:8,close:18};
const traderOn=()=>S.scratch&&!S.sea&&!inside&&S.homeAt&&S.hour>=TRADER.open&&S.hour<TRADER.close;
// the boat: a little hull with a striped awning over a counter, crates and a lantern, and Marlo the otter at the stall
const traderBoat=(()=>{const g=new T.Group(),p=[],gl=[];
  p.push(P(BOX,0x9a6a3a,0,0.12,0,0,0,0,0.9,0.24,1.7),P(BOX,0x7a4a2a,0,0.25,0,0,0,0,0.76,0.03,1.5),P(CONE4,0x9a6a3a,0,0.12,1.0,Math.PI/2,Math.PI/4,0,0.64,0.34,0.3),P(BOX,0x2a86a8,0,0.21,0,0,0,0,0.92,0.05,1.72));
  for(const [x,z] of [[-0.38,-0.55],[0.38,-0.55],[-0.38,0.45],[0.38,0.45]])p.push(P(CYL6,0x6a4630,x,0.75,z,0,0,0,0.05,1.0,0.05));
  for(let i=0;i<6;i++)p.push(P(BOX,i%2?0xf4efe6:0xe0503a,-0.4+i*0.16,1.28,-0.05,0,0,0.1,0.17,0.04,1.2));/* the striped awning */
  p.push(P(BOX,0xb8804a,-0.42,0.52,-0.05,0,0,0,0.12,0.3,1.0),P(BOX,0xd8a870,-0.42,0.68,-0.05,0,0,0,0.18,0.04,1.06));/* the counter, on the dock side */
  p.push(P(BOX,0xb07a44,0.2,0.38,0.5,0,0.3,0,0.3,0.26,0.3),P(BOX,0x8a5a30,0.2,0.52,0.5,0,0.3,0,0.32,0.03,0.32),P(CYL8,0x8a5a30,0.22,0.38,-0.6,0,0,0,0.26,0.3,0.26),P(CYL8,0x6a4630,0.22,0.5,-0.6,0,0,0,0.27,0.03,0.27));
  p.push(P(ICO2,0xe84a3a,-0.42,0.75,0.25,0,0,0,0.1,0.1,0.1),P(ICO2,0xf6c83a,-0.42,0.75,0.05,0,0,0,0.09,0.09,0.09),P(ICO2,0x7ab84a,-0.42,0.75,-0.18,0,0,0,0.1,0.08,0.1),P(ICO2,0xf39ab0,-0.42,0.75,-0.38,0,0,0,0.08,0.08,0.08));/* wares on the counter */
  p.push(P(CYL6,0x6a4630,0.36,1.45,0.55,0,0,0,0.03,0.4,0.03),P(BOX,0xf6d04a,0.36,1.62,0.65,0,0,0,0.02,0.18,0.22));/* a little flag */
  gl.push(P(BOX,0xfff0b8,-0.38,1.12,0.45,0,0,0,0.1,0.13,0.1));
  g.add(M(p));const lm=M(gl,glowMat);lm.castShadow=false;g.add(lm);
  const mar=npcModel('otter',0x8a6a4a,0x2a86a8,null,'tee');mar.scale.setScalar(0.95);mar.position.set(0.02,0.27,-0.05);mar.rotation.y=-Math.PI/2;g.add(mar);g.userData.marlo=mar;
  g.visible=false;scene.add(g);return g;})();
let trader={x:0,z:0,y:0,a:0,shown:false,come:0,seen:false};
function traderSpot(){const isl=islands[0];return{x:DOCK.x-1.3,z:(isl.dockZ||DOCK.z)+3.3};}
function updateTrader(dt,tt){const want=traderOn()?1:0;
  if(want&&!trader.shown){trader.shown=true;trader.come=0;const s=traderSpot();trader.x=s.x;trader.z=s.z;
    if(Math.hypot(vil.x-s.x,vil.z-s.z)<30){SFX.horn();say(S.metMarlo?`${TRADER.name}'s boat is in!`:'A little boat is mooring at your dock…');}}
  if(trader.shown){trader.come=clamp(trader.come+(want?dt:-dt)/3,0,1);if(!want&&trader.come<=0){trader.shown=false;traderBoat.visible=false;return;}
    const u=smooth(0,1,trader.come),off=(1-u)*14;/* sails in from the south, and back out at closing */
    traderBoat.visible=true;traderBoat.position.set(trader.x,tideY+Math.sin(tt*1.4)*0.03-0.02,trader.z+off);traderBoat.rotation.set(Math.sin(tt*1.1)*0.02,0.05,Math.sin(tt*0.9)*0.025);
    const m=traderBoat.userData.marlo;if(m)m.rotation.y=-Math.PI/2+Math.sin(tt*0.7)*0.25;}}
// a tap close to the boat on screen
function traderTap(cx,cy){if(!trader.shown||trader.come<0.9)return false;const s=toScreen(trader.x,tideY+0.7,trader.z);if(Math.hypot(s[0]-cx,s[1]-cy)>Math.max(26,40*40/cam.dist))return false;
  const isl=islands[0];let best=null,bd=1e9;for(const [x,z] of [...isl.sand,...isl.grass]){const d=(x-trader.x)**2+(z-trader.z)**2;if(d<bd){bd=d;best=[x,z];}}
  clearAction();goTo(best[0],best[1],()=>{villager.rotation.y=Math.atan2(trader.x-vil.x,trader.z-vil.z);traderHello();openSheet('trader','buy');});return true;}
const MARLO_HI=['Fresh off the tide today!','Ahoy! Have a look, have a look.','Mind the crates. What can I get you?','Found some lovely bits out on the reef.','Business is slow… on account of there being one customer.'];
function traderHello(){const first=!S.metMarlo;S.metMarlo=1;say(first?`I'm ${TRADER.name}! I sail these islands trading bits and bobs. Leave things in your crate and I'll collect them at dawn.`:`${TRADER.name}: “${MARLO_HI[(S.day+Math.floor(S.hour))%MARLO_HI.length]}”`);}

// ---- today's stock: a handful of things, the same all day, different tomorrow ----
function traderStock(){if(S.tstock&&S.tstock.day===S.day)return S.tstock.items;const R=mulberry((S.worldSeed|0)+S.day*7919),lv=level(),items=[];
  const crops=CROP_IDS.filter(id=>CROPS[id].lvl<=lv+1);for(let i=0;i<2&&crops.length;i++){const id=crops.splice(Math.floor(R()*crops.length),1)[0],C=CROPS[id];items.push({t:'seed',id,n:5,price:C.seed*5});}
  items.push({t:'bait',n:5,price:CONSUM.bait.price*5});
  const decor=Object.keys(BUILD).filter(k=>!BUILD[k].craft&&BUILD[k].lvl<=lv+1);for(let i=0;i<2&&decor.length;i++){const k=decor.splice(Math.floor(R()*decor.length),1)[0];items.push({t:'decor',id:k,price:BUILD[k].cost});}
  if(RODS[S.rod+1]&&R()<0.5)items.push({t:'rod',price:RODS[S.rod+1].cost});else if(CANS[S.can+1])items.push({t:'can',price:CANS[S.can+1].cost});
  items.push({t:'map',price:320});
  const cur=Object.keys(FINDS).filter(k=>FINDS[k].w>0&&FINDS[k].w<6&&!S.alm['g:'+k]);if(cur.length){const k=cur[Math.floor(R()*cur.length)];items.push({t:'curio',id:k,price:Math.round(FINDS[k].price*2.2)});}
  S.tstock={day:S.day,items:items.map((q,i)=>Object.assign(q,{i,sold:0}))};return S.tstock.items;}
function stockInfo(q){switch(q.t){
  case'seed':return{name:`${CROPS[q.id].name} seeds ×${q.n}`,icon:seedIcon(q.id),desc:'Plant them in tilled soil. These ones are free to plant.'};
  case'bait':return{name:`Fish bait ×${q.n}`,icon:ICON['x:bait']||ICON.rod,desc:'Cast anywhere and something will come for it.'};
  case'decor':return{name:BUILD[q.id].name,icon:THUMB[q.id]||ICON.star,desc:BUILD[q.id].desc+' You choose where it goes.'};
  case'rod':return{name:RODS[S.rod+1].name,icon:ICON.rod,desc:'A longer bite window, rarer fish and fewer boots.'};
  case'can':return{name:CANS[S.can+1].name,icon:ICON.can,desc:'Waters the eight tiles round the one you tap.'};
  case'map':return{name:'Treasure map',icon:ICON['g:oldcoin']||ICON.star,desc:'Marks a spot on your island where something good is buried.'};
  case'curio':return{name:FINDS[q.id].name,icon:ICON['g:'+q.id]||ICON.star,desc:'A curio from another shore, new to your Islandex.'};}}
function buyStock(i){const q=traderStock()[i];if(!q||q.sold)return;if(S.shells<q.price){SFX.no();say(`${TRADER.name}: “That one's ${fmt(q.price)} shells, friend.”`);return;}
  if(q.t==='decor'){closeSheet();startPlace(q.id,false);return;}/* placing it is when you pay (72-farming) */
  S.shells-=q.price;q.sold=1;SFX.coin();buzz(12);
  if(q.t==='seed')S.free[q.id]=(S.free[q.id]||0)+q.n;
  else if(q.t==='bait')S.inv['x:bait']=(S.inv['x:bait']||0)+q.n;
  else if(q.t==='rod'){S.rod++;setRod();}else if(q.t==='can')S.can++;
  else if(q.t==='map')buryTreasure();
  else if(q.t==='curio')gain('g:'+q.id);
  say(`${TRADER.name}: “${['Pleasure doing business!','A fine choice.','You won\'t regret it.'][q.i%3]}”`);renderSheet();updateHUD();}
// the map: a golden dig spot somewhere on your island with something rare underneath
function buryTreasure(){const isl=islands[0],c=isl.grass.filter(([x,z])=>freeTile(x,z)&&Math.hypot(x-vil.x,z-vil.z)>8);if(!c.length)return;const [x,z]=pickR(c);
  S.finds.push({k:'dig',x,z,map:1});syncLife();const dir=Math.abs(x-vil.x)>Math.abs(z-vil.z)?(x>vil.x?'east':'west'):(z>vil.z?'south':'north');
  setTimeout(()=>say(`The map shows an X to the <b>${dir}</b> of here. Look for the golden glint!`),900);}

// ---- the crate by your tent: sell by leaving things for Marlo ----
function cratePos(){return{x:HOUSE_AT.x+1.75,z:HOUSE_AT.z-0.05};}
function crateTap(cx,cy){if(!S.scratch||!S.homeAt||S.house)return false;const c=cratePos(),s=toScreen(c.x,topY(Math.round(c.x),Math.round(c.z))+0.3,c.z);
  if(Math.hypot(s[0]-cx,s[1]-cy)>Math.max(18,22*40/cam.dist))return false;clearAction();goTo(c.x+0.4,c.z+0.9,()=>{villager.rotation.y=Math.atan2(c.x-vil.x,c.z-vil.z);openSheet('bag','all','crate');});return true;}
function crateWorth(){return Object.entries(S.crate||{}).reduce((t,[k,n])=>t+priceOf(k)*n,0);}
function toCrate(key,n){const have=S.inv[key]||0;n=Math.min(n,have);if(!n)return 0;S.crate=S.crate||{};S.crate[key]=(S.crate[key]||0)+n;S.inv[key]=have-n;if(!S.inv[key])delete S.inv[key];
  noise(0.08,0.05,600);return n;}
// at dawn Marlo empties it and leaves the shells
function collectCrate(){const w=crateWorth();if(!w)return;S.shells+=w;S.earned=(S.earned||0)+w;S.crateLast=(S.crateLast||0)+w;S.crate={};}
