/* ---- villagers: generated neighbours with personalities, routines, friendship and daily wishes ---- */
const SPECIES={cat:{names:['Mochi','Tabby','Olive','Miso','Pumpkin'],col:[0xf0b070,0x9a9aa8,0xf4f0ea,0x3a3440]},dog:{names:['Biscuit','Waffles','Maple','Rufus','Goldie'],col:[0xd8a868,0xf4ecd8,0x8a6040]},
  bear:{names:['Bruno','Honey','Teddy','Barley'],col:[0xa87450,0xd8b890,0x6a4a38]},rabbit:{names:['Clover','Bunnie','Mira','Coco'],col:[0xf4f0ea,0xe8c8d8,0xc8a888]},
  frog:{names:['Ribbot','Lily','Puddle','Jeremiah'],col:[0x7cc458,0x5aa0a0,0xa8c850]},duck:{names:['Pip','Quill','Daisy','Ketchup'],col:[0xf4f0ea,0xf6d04a,0xa8c8e8]},
  penguin:{names:['Flurry','Tux','Wade','Aurora'],col:[0x3a4a6a,0x5a6a8a]},squirrel:{names:['Hazel','Acorn','Nutmeg','Poppy'],col:[0xd87a3a,0xa89a8a,0xe8a860]},
  sheep:{names:['Wooly','Dolly','Muffin'],col:[0xf8f4ee,0xe8d8f0,0xf0e0c8]},koala:{names:['Eucy','Nibbs','Gum'],col:[0xa8a8b8,0xc8c0d0]}};
const PERS={peppy:{cp:['sparkle','yippee','twinkle'],lines:['Oh my gosh, hiii! Isn’t today just the BEST?','I practised my dance moves by the town tree all morning!','Have you seen the butterflies? They’re like tiny confetti!','Let’s be best friends forever, okay? Okay!']},
  lazy:{cp:['snooze','nom nom','zzz'],lines:['I was gonna do something today… then I found a comfy patch of grass.','Do you think fish get sleepy? I do. All the time.','I dreamed I was a sandwich. It was great.','If you find any snacks out there, I know a guy. It’s me.']},
  cranky:{cp:['harrumph','grr','hmph'],lines:['Hmph. Kids these days, sailing off to who-knows-where.','Back in my day we walked to other islands. Uphill. In the rain.','That crow on your farm is a menace, I tell ya.','…Fine. It’s a nice day. Don’t tell anyone I said so.']},
  jock:{cp:['hustle','flex','hut hut'],lines:['I just did forty laps around the plaza! Feel the burn!','Fishing is basically arm day. Respect.','Carrying crops is great cardio, you know!','Protein! Have you been eating your pumpkins?']},
  normal:{cp:['teehee','sweetie','la la'],lines:['I baked cookies this morning. The whole house smells lovely!','The flowers by the town tree are blooming so nicely.','Have you visited the museum lately? It’s getting so full!','I love how quiet it is in the evenings here.']},
  snooty:{cp:['darling','ahem','simply'],lines:['One simply must dress for the occasion. Every day is an occasion.','Your garden is… charming. In a rustic sort of way.','I only drink tea brewed from island rainwater, naturally.','Do try to keep the shells out of the plaza, won’t you?']}};
const npcs=[];
function npcModel(sp,col,shirt,acc){const p=[],dk=new T.Color(col).multiplyScalar(0.75).getHex(),hi=new T.Color(col).lerp(new T.Color(0xffffff),0.45).getHex(),sdk=new T.Color(shirt).multiplyScalar(0.78).getHex();
  p.push(P(ICO2,col,0,0.52,0,0,0,0,0.5,0.44,0.46),P(CYL12,shirt,0,0.17,0,0,0,0,0.3,0.22,0.26),P(CYL12,sdk,0,0.075,0,0,0,0,0.31,0.03,0.27),P(CYL12,0xfbf8f0,0,0.285,0,0,0,0,0.24,0.03,0.21),
    P(ICO2,0xfbf8f0,0,0.21,0.13,0,0,0,0.035,0.035,0.02),P(ICO2,0xfbf8f0,0,0.14,0.13,0,0,0,0.035,0.035,0.02),
    P(ICO2,0x2b1e2e,-0.1,0.54,0.21,0,0,0,0.055,0.075,0.03),P(ICO2,0x2b1e2e,0.1,0.54,0.21,0,0,0,0.055,0.075,0.03),
    P(ICO2,0xffffff,-0.09,0.565,0.228,0,0,0,0.022,0.028,0.01),P(ICO2,0xffffff,0.11,0.565,0.228,0,0,0,0.022,0.028,0.01),P(ICO2,0xf39ab0,-0.17,0.46,0.19,0,0,0,0.07,0.04,0.03),P(ICO2,0xf39ab0,0.17,0.46,0.19,0,0,0,0.07,0.04,0.03));
  if(sp!=='duck'&&sp!=='penguin')p.push(P(ICO2,0x7a2a3a,0,0.415,0.215,0,0,0,0.05,0.022,0.02));
  switch(sp){
    case'cat':p.push(P(CONE4,col,-0.15,0.8,0,0,0.785,0.2,0.12,0.18,0.08),P(CONE4,col,0.15,0.8,0,0,0.785,-0.2,0.12,0.18,0.08),P(CONE4,0xf3a6b6,-0.15,0.79,0.02,0,0.785,0.2,0.06,0.1,0.04),P(CONE4,0xf3a6b6,0.15,0.79,0.02,0,0.785,-0.2,0.06,0.1,0.04),
      P(ICO2,hi,0,0.47,0.2,0,0,0,0.14,0.08,0.06),P(ICO2,0xe07a8a,0,0.5,0.235,0,0,0,0.03,0.025,0.02),P(CYL6,col,0,0.22,-0.2,1.1,0,0,0.04,0.34,0.04),P(ICO2,dk,0,0.36,-0.33,0,0,0,0.05,0.05,0.05));
      for(const sd of [-1,1])for(let i=0;i<2;i++)p.push(P(BOX,dk,sd*0.2,0.47+i*0.03,0.16,0,sd*0.5,sd*(0.1-i*0.15),0.1,0.008,0.008));break;
    case'dog':p.push(P(ICO2,dk,-0.24,0.58,0,0,0,0.5,0.09,0.2,0.08),P(ICO2,dk,0.24,0.58,0,0,0,-0.5,0.09,0.2,0.08),P(ICO2,hi,0,0.46,0.2,0,0,0,0.16,0.1,0.08),P(ICO2,0x2b1e2e,0,0.49,0.26,0,0,0,0.045,0.035,0.03),P(ICO2,col,0,0.2,-0.18,0.9,0,0,0.05,0.14,0.05),P(ICO2,dk,0.08,0.62,0.2,0,0,0,0.1,0.08,0.03));break;
    case'bear':case'koala':{const e=sp==='koala'?0.14:0.09;p.push(P(ICO2,col,-0.2,0.78,0,0,0,0,e,e,0.05),P(ICO2,col,0.2,0.78,0,0,0,0,e,e,0.05),P(ICO2,hi,-0.2,0.78,0.02,0,0,0,e*0.55,e*0.55,0.03),P(ICO2,hi,0.2,0.78,0.02,0,0,0,e*0.55,e*0.55,0.03),
      P(ICO2,hi,0,0.46,0.2,0,0,0,0.14,0.1,0.07),P(ICO2,0x2b1e2e,0,0.49,0.26,0,0,0,sp==='koala'?0.06:0.035,sp==='koala'?0.05:0.03,0.03),P(ICO2,col,0,0.14,-0.16,0,0,0,0.06,0.06,0.06));break;}
    case'rabbit':p.push(P(ICO2,col,-0.1,0.85,0,0,0,0.12,0.08,0.26,0.07),P(ICO2,col,0.1,0.85,0,0,0,-0.12,0.08,0.26,0.07),P(ICO2,0xf3a6b6,-0.1,0.85,0.03,0,0,0.12,0.04,0.18,0.03),P(ICO2,0xf3a6b6,0.1,0.85,0.03,0,0,-0.12,0.04,0.18,0.03),P(ICO2,0xffffff,0,0.2,-0.18,0,0,0,0.1,0.1,0.1),P(ICO2,0xe07a8a,0,0.48,0.23,0,0,0,0.03,0.025,0.02));break;
    case'frog':p.push(P(ICO2,col,-0.13,0.74,0.08,0,0,0,0.12,0.12,0.12),P(ICO2,col,0.13,0.74,0.08,0,0,0,0.12,0.12,0.12),P(ICO2,0xffffff,-0.13,0.76,0.13,0,0,0,0.08,0.08,0.06),P(ICO2,0xffffff,0.13,0.76,0.13,0,0,0,0.08,0.08,0.06),P(ICO2,0x2b1e2e,-0.13,0.76,0.16,0,0,0,0.04,0.05,0.03),P(ICO2,0x2b1e2e,0.13,0.76,0.16,0,0,0,0.04,0.05,0.03),P(ICO2,hi,0,0.44,0.16,0,0,0,0.34,0.14,0.2));break;
    case'duck':p.push(P(ICO2,0xf6a830,0,0.46,0.24,0,0,0,0.16,0.06,0.12),P(ICO2,0xe0902a,0,0.43,0.23,0,0,0,0.13,0.035,0.1),P(ICO2,col,0,0.8,-0.02,0,0,0,0.06,0.1,0.05),P(CONE4,col,0,0.14,-0.2,-1.2,0.785,0,0.1,0.14,0.05));break;
    case'penguin':p.push(P(ICO2,0xf4f0ea,0,0.47,0.14,0,0,0,0.36,0.3,0.24),P(ICO2,0xf6a830,0,0.47,0.26,0,0,0,0.08,0.05,0.08),P(ICO2,0xf6d04a,-0.18,0.62,0.16,0,0,0.4,0.06,0.02,0.02),P(ICO2,0xf6d04a,0.18,0.62,0.16,0,0,-0.4,0.06,0.02,0.02));break;
    case'squirrel':p.push(P(CONE4,col,-0.15,0.78,0,0,0.785,0.2,0.09,0.14,0.06),P(CONE4,col,0.15,0.78,0,0,0.785,-0.2,0.09,0.14,0.06),P(ICO2,hi,0,0.46,0.2,0,0,0,0.12,0.08,0.06),P(ICO2,0x2b1e2e,0,0.49,0.245,0,0,0,0.03,0.025,0.02),
      P(ICO2,col,0,0.42,-0.3,0.3,0,0,0.2,0.46,0.16),P(ICO2,hi,0,0.6,-0.34,0.3,0,0,0.12,0.2,0.1),P(ICO2,dk,0,0.26,-0.3,0.3,0,0,0.14,0.12,0.12));break;
    case'sheep':for(let i=0;i<11;i++){const a=i/11*6.283;p.push(P(ICO2,0xfbf8f2,Math.cos(a)*0.24,0.62+Math.sin(a)*0.18,-0.04,0,0,0,0.16,0.16,0.16));}p.push(P(ICO2,0x6a5a5a,-0.24,0.55,0.05,0,0,0.9,0.05,0.12,0.04),P(ICO2,0x6a5a5a,0.24,0.55,0.05,0,0,-0.9,0.05,0.12,0.04),P(ICO2,0xfbf8f2,0,0.8,0.08,0,0,0,0.2,0.1,0.14));break;}
  // accessories
  const AC=[0xd8453a,0x5a8ae0,0xf6d04a,0x6ab84a,0xf39ab0][Math.floor(hash(col%97,shirt%89)*5)];
  if(acc==='cap')p.push(P(ICO2,AC,0,0.74,-0.02,0,0,0,0.36,0.16,0.36),P(CYL12,AC,0,0.7,0.16,0.2,0,0,0.3,0.02,0.2));
  else if(acc==='beret')p.push(P(ICO2,AC,0.04,0.76,-0.02,0,0,0.2,0.4,0.1,0.38),P(CYL6,AC,0.04,0.82,-0.02,0,0,0,0.02,0.06,0.02));
  else if(acc==='flower')bloom(p,0xf2a6c8,0xf6d04a,0.18,0.72,0.12,0.08,6,1.2);
  else if(acc==='bow')p.push(P(ICO2,AC,0.1,0.74,0.08,0,0,0.5,0.1,0.07,0.05),P(ICO2,AC,0.22,0.74,0.08,0,0,-0.5,0.1,0.07,0.05),P(ICO2,new T.Color(AC).multiplyScalar(0.8).getHex(),0.16,0.74,0.1,0,0,0,0.04,0.04,0.04));
  else if(acc==='scarf')p.push(P(CYL12,AC,0,0.3,0,0,0,0,0.29,0.06,0.26),P(BOX,AC,0.08,0.2,0.14,0.2,0,0.2,0.07,0.16,0.03));
  const g=new T.Group();g.add(M(p));
  // limbs on pivots so they can swing when walking
  for(const [nm,x] of [['armL',-0.2],['armR',0.2]]){const pv=new T.Group();pv.name=nm;pv.position.set(x,0.27,0.02);pv.rotation.z=x<0?-0.35:0.35;pv.add(M([P(ICO2,shirt,0,-0.05,0,0,0,0,0.1,0.12,0.1),P(ICO2,col,0,-0.15,0,0,0,0,0.075,0.085,0.075)]));g.add(pv);}
  for(const [nm,x] of [['footL',-0.08],['footR',0.08]]){const pv=new T.Group();pv.name=nm;pv.position.set(x,0.08,0.02);pv.add(M([P(ICO2,dk,0,-0.04,0.03,0,0,0,0.12,0.07,0.16)]));g.add(pv);}
  return g;}
function limbsOf(g){return['armL','armR','footL','footR'].map(n=>g.getObjectByName(n));}
function swingLimbs(L,ph,amt){if(!L[0])return;const s=Math.sin(ph)*amt;L[0].rotation.x=s;L[1].rotation.x=-s;L[2].rotation.x=-s*0.8;L[3].rotation.x=s*0.8;}
function initNPCs(){for(const n of npcs)scene.remove(n.g);npcs.length=0;const R=mulberry((S.worldSeed|0)^0x5eed);const used=new Set(),spk=Object.keys(SPECIES),pk=Object.keys(PERS);
  for(const b of TOWN.bld.filter(b=>b.t==='vh')){let sp;do{sp=spk[Math.floor(R()*spk.length)];}while(used.has(sp)&&used.size<spk.length);used.add(sp);const S0=SPECIES[sp];
    const name=S0.names[Math.floor(R()*S0.names.length)],pers=pk[Math.floor(R()*pk.length)],cp=PERS[pers].cp[Math.floor(R()*PERS[pers].cp.length)];
    const col=S0.col[Math.floor(R()*S0.col.length)],shirt=[0xd8453a,0x5a8ae0,0x6ab84a,0xf6d04a,0xf39ab0,0x9a6ad0,0xf08a2a][Math.floor(R()*7)];
    const acc=['none','cap','beret','flower','bow','scarf','none'][Math.floor(R()*7)];const g=npcModel(sp,col,shirt,acc);g.scale.setScalar(0.92);scene.add(g);const i=npcs.length;if(!S.npc[i])S.npc[i]={f:0,talk:0,wish:null,gift5:0,gift10:0};
    const n={i,name,sp,pers,cp,b,g,limbs:limbsOf(g),x:b.door[0]+0.5,z:b.door[1]+0.3,y:topY(b.door[0],b.door[1]),path:null,state:'idle',wait:R()*4,t:0,face:0};g.position.set(n.x,n.y,n.z);npcs.push(n);}}
const npcBlock=(x,z)=>!!S.tiles[K(x,z)]||(!!objAt(x,z)&&objAt(x,z).k!=='stonepath')||(x>=HOUSE_AT.x&&x<=HOUSE_AT.x+1&&z>=HOUSE_AT.z&&z<=HOUSE_AT.z+1)||(TOWN.fixed.has(K(x,z))&&TOWN.fixed.get(K(x,z))!=='board');
function npcGo(n,tx,tz){const p=landPath(Math.round(n.x),Math.round(n.z),tx,tz,{block:npcBlock,cost:(x,z)=>TOWN.path.has(K(x,z))?0.45:1,max:3000});if(!p||p.length<2)return false;n.path=p.slice(1);n.state='walk';return true;}
function updateNPCs(dt,tt){if(!npcs.length)return;const near=Math.hypot(cam.tx,cam.tz)<70;const night=S.hour>=21||S.hour<6.5;
  for(const n of npcs){if(!near){n.g.visible=false;continue;}
    if(n.state==='home'){n.g.visible=false;if(!night){n.state='idle';n.wait=1+Math.random()*3;n.x=n.b.door[0]+0.5;n.z=n.b.door[1]+0.3;}continue;}
    n.g.visible=true;n.t+=dt;
    if(n.state==='talk'){n.face=Math.atan2(vil.x-n.x,vil.z-n.z);if(n.t>12||Math.hypot(vil.x-n.x,vil.z-n.z)>4){n.state='idle';n.wait=2;}}
    else if(n.state==='walk'){const w=n.path&&n.path[0];if(!w){n.state=night?'goinghome':'idle';n.wait=2+Math.random()*5;}
      else{const tx=w[0]+(w===n.path[n.path.length-1]?0:0),dx=tx-n.x,dz=w[1]-n.z,d=Math.hypot(dx,dz);if(d<0.06)n.path.shift();else{const sp=Math.min(d,dt*1.25);n.x+=dx/d*sp;n.z+=dz/d*sp;n.face=Math.atan2(dx,dz);}}}
    else if(n.state==='goinghome'){if(Math.hypot(n.x-n.b.door[0]-0.5,n.z-n.b.door[1])<1.2){n.state='home';burst(n.x,n.y+0.4,n.z,0xfff6e2,5,0.6,0.05);}else if(!npcGo(n,n.b.door[0],n.b.door[1]))n.state='home';}
    else{n.wait-=dt;if(night){if(!npcGo(n,n.b.door[0],n.b.door[1]))n.state='home';else n.state='walk';}
      else if(n.wait<=0){n.wait=3+Math.random()*6;const r=Math.random();let t=null;const pc=TOWN.plaza;
        if(r<0.4)t=[pc[0]+Math.round((Math.random()-0.5)*4),pc[1]+Math.round((Math.random()-0.5)*4)];
        else if(r<0.75){const ks=[...TOWN.path.keys()];const k=ks[Math.floor(Math.random()*ks.length)];t=k.split(',').map(Number);}
        else if(r<0.88)t=n.b.door;else t=[Math.round(vil.x+(Math.random()-0.5)*3),Math.round(vil.z+(Math.random()-0.5)*3)];
        if(t&&walkable(t[0],t[1])&&onHome(t[0],t[1]))npcGo(n,t[0],t[1]);
        if(Math.random()<0.25)floatText(n.x,n.y+1.1,n.z,['♪','…','♥','!'][Math.floor(Math.random()*4)]);}}
    const ty=topY(Math.round(n.x),Math.round(n.z))||0.3;n.y=lerp(n.y,ty,Math.min(1,dt*8));
    const walking=n.state==='walk'||n.state==='goinghome';swingLimbs(n.limbs,tt*9+n.i,walking?0.7:0);n.g.position.set(n.x,n.y+(walking?Math.abs(Math.sin(tt*9+n.i))*0.05:Math.sin(tt*2+n.i)*0.01),n.z);
    n.g.rotation.y+=angDiff(n.g.rotation.y,n.face)*Math.min(1,dt*6);}}
function npcWish(n){const d=S.npc[n.i];if(d.wish&&d.wish.day===S.day)return d.wish;const R=mulberry(hi(S.worldSeed|0,S.day,n.i));const lv=level();let k;
  const r=R();if(r<0.5){const un=CROP_IDS.filter(id=>CROPS[id].lvl<=lv);k='c:'+un[Math.floor(R()*un.length)];}
  else{const bios=new Set(['home','any',...islands.filter(i=>S.disc[i.id]&&!i.home).map(i=>i.biome)]);const pool=[];
    for(const [pre,tab] of [['f:',FISH],['b:',BUGS],['p:',PLANTS]])for(const id in tab){const I=tab[id];if(I.junk||I.w<8)continue;if(I.bio.some(b=>bios.has(b)))pool.push(pre+id);}
    k=pool.length?pool[Math.floor(R()*pool.length)]:'c:turnip';}
  d.wish={k,day:S.day,done:false};return d.wish;}
function invFor(k){if(k.startsWith('c:')){const id=k.slice(2);return Object.keys(S.inv).find(q=>q.split('|')[0]===id&&S.inv[q]>0)||null;}return S.inv[k]>0?k:null;}
function npcLine(n){const P0=PERS[n.pers],h=S.hour;const ctx=[];
  if(S.rain)ctx.push('This rain is perfect for the flowers. And for naps.');if(h<9)ctx.push('Good morning! The early bird catches the… well, bugs, I suppose.');if(h>=18)ctx.push('The lanterns look so pretty this time of evening.');
  ctx.push(`I heard ${CROPS[S.demand].name.toLowerCase()} is selling for a fortune today!`);const d=S.npc[n.i];if(d.f>=5)ctx.push('I’m really glad you moved to '+TOWN.name+', you know?');
  const all=[...P0.lines,...ctx];return all[Math.floor(Math.random()*all.length)]+` ${n.cp[0].toUpperCase()+n.cp.slice(1)}!`;}
function talkTo(n){if(n.state==='home')return;n.state='talk';n.t=0;n.path=null;walkTo(n.x,n.z);SFX.ui();const d=S.npc[n.i];
  if(d.talk!==S.day){d.talk=S.day;d.f=Math.min(10,d.f+1);hearts(n.x,n.y+1,n.z);}
  setTimeout(()=>showTalk(n,npcLine(n)),0);}
function showTalk(n,line){const d=S.npc[n.i],w=npcWish(n),btns=[];
  let msg=`<b>${n.name}:</b> ${line}`;
  if(!w.done){const have=invFor(w.k);msg+=`<br><small>${n.name} is hoping for ${/^[aeiou]/i.test(nameOf(w.k))?'an':'a'} <b>${nameOf(w.k)}</b> today.</small>`;
    btns.push({label:have?'Give '+nameOf(have):'Need one',cls:'go',disabled:!have,fn:()=>giveWish(n,have)});}
  btns.push({label:'Chat',fn:()=>{SFX.ui();showTalk(n,npcLine(n));}},{label:'Bye',fn:()=>{clearAction();n.state='idle';n.wait=1.5;}});
  setAction(msg,btns,`${n.name} · ${n.pers} ${n.sp} · ♥ ${d.f}/10`);}
function giveWish(n,key){const d=S.npc[n.i];if(!key||!S.inv[key])return;S.inv[key]--;if(!S.inv[key])delete S.inv[key];d.wish.done=true;d.f=Math.min(10,d.f+3);
  const pay=Math.round(priceOf(key)*2+60);S.shells+=pay;SFX.rare();hearts(n.x,n.y+1,n.z);addXP(8);let extra='';
  if(Math.random()<0.4){const ks=Object.keys(BUILD).filter(k=>BUILD[k].lvl<=level());const k=pickR(ks);S.store[k]=(S.store[k]||0)+1;extra=` and a <b>${BUILD[k].name}</b> (in your storage)`;}
  else{const id=pickR(CROP_IDS.filter(i=>CROPS[i].lvl<=level()));S.free[id]=(S.free[id]||0)+3;extra=` and <b>3 ${CROPS[id].name} seeds</b>`;}
  if(d.f>=5&&!d.gift5){d.gift5=1;S.store.lantern=(S.store.lantern||0)+1;S.shells+=500;extra+=`. ${n.name} also slips you a Lantern and 500 shells — “for being such a good friend!”`;}
  if(d.f>=10&&!d.gift10){d.gift10=1;S.store.clover=(S.store.clover||0)+1;extra+=`. Best friends! ${n.name} gives you a Lucky Clover.`;}
  setAction(`<b>${n.name}:</b> Oh, a ${nameOf(key)}! You’re the best, ${n.cp}! Here, take this: <b>${fmt(pay)} shells</b>${extra}.`,[{label:'Aw, thanks!',cls:'go',fn:()=>{clearAction();n.state='idle';n.wait=2;}}],`${n.name} · ♥ ${d.f}/10`);updateHUD();}

