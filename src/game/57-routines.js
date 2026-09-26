/* =========================================================
   Villager routines and memory.
   Each villager follows the clock: a morning stroll, their hobby (fishing from the shore, watering flowers, reading on a
   bench, tinkering on the doorstep, rambling the island, singing at the plaza), lunch on a bench, pair chats, an evening
   gathering, then home. They hold props for what they're doing, and remember what you've been up to (S.log), which their
   chat draws on.
   To add an activity: a case in chooseActivity (where and for how long), in actPose/actTick (how it looks), and ACT_LINES.
   ========================================================= */
const HOBBY_ACT={fish:'fish',garden:'water',read:'read',tinker:'tinker',wander:'wander',stargaze:'sing'};
const ACT_LINES={fish:['Shh… they’re biting.','Caught three this morning. Threw two back. Fair’s fair.','The trick is patience. And a good hat.'],
  water:['These flowers were thirsty!','A little water and a kind word. That’s all they need.','Look at this bloom. Isn’t she lovely?'],
  read:['Just getting to the good part of my book.','This bench is the best reading spot in town, you know.','Chapter nine. The lighthouse keeper has a secret…'],
  tinker:['Nearly got this gizmo working! Nearly.','Hand me that… oh, never mind, found it.','If it whirrs, it works. If it smokes, it doesn’t.'],
  wander:['What a view from up here!','I’m mapping every path on the island. Want a copy?','Found a shortcut! It took longer, but it was prettier.'],
  sing:['La la… oh! You heard that?','I’m working on a new song about the tides.','Hum along if you know it!'],
  chat:['We were just talking about you! All good things.','Oh, just catching up on town gossip.','You’re welcome to join us!'],
  coffee:['Best cocoa on the island, this.','Morning! Grab a cup and sit a while.','I can’t start the day without the café.'],
  bench:['Nothing like a sit in the sun.','Lunch with a view. Can’t beat it.','My feet needed a rest.'],
  stargaze:['Look, the first star is out.','Every night the sky looks a little different.','I think that one’s winking at us.']};

/* ---- memory: things you did that villagers can mention ---- */
function logEvent(t,data={}){if(!S.log)S.log=[];S.log.push({t,day:S.day,...data});if(S.log.length>30)S.log.splice(0,S.log.length-30);}
const MEM_TPL={
  catch:{sailor:n=>`Heard you landed a ${n}! Proper catch, that.`,scholar:n=>`A ${n}? Fascinating specimen. Did you donate it to the museum?`,dreamer:n=>`You caught a ${n}? I hope you told it something nice.`,_:n=>`I heard you caught a ${n}! Impressive!`},
  bug:{explorer:n=>`A ${n}! Where’d you find it? I want to go too!`,homebody:n=>`A ${n}? Keep it away from my garden, dear.`,_:n=>`You caught a ${n}? The museum will be thrilled.`},
  house:{homebody:()=>`Your new house is lovely! You’ll have to have me over for tea.`,tinkerer:()=>`Saw the work on your house. Solid joinery!`,_:()=>`Your house is looking so grand now!`},
  decor:{scholar:n=>`I noticed your new ${n}. An interesting choice.`,dreamer:n=>`Your ${n} makes the whole town feel dreamier.`,_:n=>`I love the ${n} you put up!`},
  island:{explorer:n=>`You made it to ${n}?! I’m so jealous. What was it like?`,sailor:n=>`${n}, eh? Tricky waters out that way. Well sailed.`,_:n=>`I heard you sailed to ${n}! Bring me back a story.`},
  rarecrop:{homebody:n=>`A ${n}! Your farm must be very happy.`,_:n=>`Everyone’s talking about your ${n}!`},
  museum:{scholar:()=>`I saw you at the museum. Grandpa Tully speaks very highly of you.`,_:()=>`Grandpa Tully says you’ve been a great help to the museum!`}};
// what's worth remembering when you pick something up: new or valuable catches, and special crops
function noteGain(key,first){if(key.startsWith('f:')||key.startsWith('b:')){const I=(key[0]==='f'?FISH:BUGS)[key.slice(2)];if(I&&!I.junk&&(first||I.price>=250))logEvent(key[0]==='f'?'catch':'bug',{name:I.name});}
  else if(key.includes('|')&&!key.endsWith('|normal'))logEvent('rarecrop',{name:nameOf(key)});}
function memoryLine(n){const recent=(S.log||[]).filter(e=>S.day-e.day<=2).slice(-8);if(!recent.length)return null;const e=recent[Math.floor(Math.random()*recent.length)],T0=MEM_TPL[e.t];if(!T0)return null;return(T0[n.pers]||T0._)(e.name||'');}
function neighbourLine(n){const o=npcs.filter(q=>q!==n&&q.act);if(!o.length)return null;const q=o[Math.floor(Math.random()*o.length)];
  const what={coffee:'at the café',fish:'fishing down by the shore',water:'fussing over the flowers',read:'with their nose in a book',tinker:'tinkering again',wander:'off exploring',sing:'singing at the plaza',bench:'having lunch on a bench',chat:'chatting away',stargaze:'watching the sky'}[q.act.k];
  return what?`Have you seen ${q.name}? ${what[0].toUpperCase()+what.slice(1)}, as usual.`:null;}

/* ---- props held in the right hand ---- */
function npcProps(n){const arm=n.limbs[1];if(!arm)return;const g=new T.Group();g.position.set(0,-0.17,0.04);arm.add(g);n.propG=g;n.props={};
  const add=(k,parts,rx=0)=>{const m=M(parts);m.castShadow=false;m.visible=false;m.rotation.x=rx;g.add(m);n.props[k]=m;};
  add('rod',[P(CYL6,0x9a7a4a,0,0.3,0,0,0,0,0.025,0.7,0.025),P(CYL12,0x5a5a6a,0,0.05,0.03,0,0,1.57,0.05,0.03,0.05)],1.1);
  add('can',[P(CYL12,0xe0883a,0,0,0.08,0,0,0,0.14,0.12,0.12),P(CYL6,0xe0883a,0,0.04,0.18,1.0,0,0,0.025,0.14,0.025)],0.2);
  add('book',[P(BOX,0x8a3a4a,0,0,0.1,0,0,0,0.16,0.02,0.12),P(BOX,0xf8f4ea,0,0.012,0.1,0,0,0,0.14,0.012,0.1)],-0.3);
  add('hammer',[P(CYL6,0x9a6a3a,0,0.08,0,0,0,0,0.025,0.2,0.025),P(BOX,0x8a8e98,0,0.18,0,0,0,0,0.1,0.05,0.05)],0.6);
  add('cup',[P(CYL12,0xfbf8f0,0,0,0.08,0,0,0,0.08,0.09,0.08),P(CYL12,0x7a4a2a,0,0.045,0.08,0,0,0,0.065,0.01,0.065)],-0.4);
  add('map',[P(BOX,0xf2e2b8,0,0,0.1,0,0,0,0.2,0.01,0.15),P(BOX,0xd8453a,0.03,0.008,0.12,0,0,0,0.02,0.01,0.02)],-0.4);}
function showProp(n,k){if(!n.props)return;for(const q in n.props)n.props[q].visible=q===k;}

/* ---- where to go next ---- */
let shoreSpots=null;
function homeShore(){if(shoreSpots)return shoreSpots;const pc=TOWN.plaza;shoreSpots=[];
  for(const [x,z] of islands[0].sand){const c=SAND_CH.get(K(x,z));if(!c||Math.min(...c)>0.1)continue;if(Math.hypot(x-pc[0],z-pc[1])>26)continue;
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]])if(isSeaT(landMap.get(K(x+dx,z+dz)))&&landMap.get(K(x-dx,z-dz))==='sand'){shoreSpots.push([x-dx,z-dz,Math.atan2(dx,dz)]);break;}}
  return shoreSpots;}
const nearTile=(x,z,r=1)=>{for(let i=0;i<12;i++){const tx=x+Math.round((Math.random()-0.5)*2*r),tz=z+Math.round((Math.random()-0.5)*2*r);if(walkable(tx,tz)&&onHome(tx,tz)&&!npcBlock(tx,tz))return[tx,tz];}return null;};
function chooseActivity(n){const h=S.hour,pc=TOWN.plaza,door=n.b.door,R=Math.random(),hob=HOBBY_ACT[PERS[n.pers].hobby]||'sing';
  let k;if(h<8.5)k=R<0.5&&TOWN.cafeSeats.length?'coffee':R<0.75?'stroll':'water';else if(h<11)k=hob;else if(h<13)k=R<0.55?'bench':'chat';else if(h<17)k=R<0.65?hob:R<0.85?'chat':'wander';
  else k=n.pers==='dreamer'&&h>=19?'stargaze':R<0.5?'sing':R<0.8?'chat':'bench';
  switch(k){
    case'fish':{const sh=homeShore();if(!sh.length)return chooseActivity2(n,'sing');const s=sh[(n.i*7+Math.floor(Math.random()*sh.length))%sh.length];return{k,to:[s[0],s[1]],face:s[2],dur:25+Math.random()*25,prop:'rod'};}
    case'water':{const t=nearTile(door[0],door[1]+1,2)||nearTile(pc[0],pc[1],3);return t&&{k,to:t,face:Math.random()*6.28,dur:12+Math.random()*10,prop:'can'};}
    case'read':case'bench':case'coffee':{const seats=k==='coffee'?TOWN.cafeSeats:TOWN.benches,free=seats.filter(b=>!npcs.some(q=>q!==n&&q.act&&q.act.seat&&q.act.seat[0]===b[0]&&q.act.seat[1]===b[1]));if(!free.length)return chooseActivity2(n,'sing');
      const b=free[Math.floor(Math.random()*free.length)];return{k,to:[b[0],b[1]+1],seat:b,face:0,dur:k==='read'?30+Math.random()*20:18+Math.random()*12,prop:k==='read'?'book':k==='coffee'?'cup':null};}
    case'tinker':{const t=[door[0],door[1]+1];return walkable(t[0],t[1])?{k,to:t,face:Math.PI,dur:20+Math.random()*15,prop:'hammer'}:chooseActivity2(n,'sing');}
    case'wander':{const gl=islands[0].grass;for(let i=0;i<10;i++){const [x,z]=gl[Math.floor(Math.random()*gl.length)];if(walkable(x,z)&&!npcBlock(x,z)&&Math.hypot(x-pc[0],z-pc[1])<30)return{k,to:[x,z],face:Math.random()*6.28,dur:6+Math.random()*6,prop:'map'};}return null;}
    case'chat':{const o=npcs.filter(q=>q!==n&&q.state!=='home'&&q.state!=='talk'&&!(q.act&&q.act.seat)&&(!q.act||q.act.k==='sing'||q.act.k==='chat'||q.state==='idle'));if(!o.length)return chooseActivity2(n,'sing');
      const q=o[Math.floor(Math.random()*o.length)];const t=nearTile(Math.round(q.x),Math.round(q.z),1);return t&&{k,to:t,with:q,dur:10+Math.random()*8};}
    case'stargaze':case'sing':{const t=nearTile(pc[0],pc[1]+1,3);return t&&{k,to:t,face:Math.random()*6.28,dur:14+Math.random()*10};}
    default:{const t=nearTile(door[0],door[1]+2,4)||nearTile(pc[0],pc[1],4);return t&&{k:'stroll',to:t,dur:2};}}}
function chooseActivity2(n,k){const t=nearTile(TOWN.plaza[0],TOWN.plaza[1]+1,3);return t&&{k,to:t,face:Math.random()*6.28,dur:12};}

/* ---- doing it ---- */
function startActivity(n){const a=n.act;n.state='act';n.actT=a.dur;n.t=0;showProp(n,a.prop);
  if(a.seat){n.x=a.seat[0]+0.5-0.5;n.z=a.seat[1]+0.08;n.face=0;n.sit=true;}else if(a.face!==undefined)n.face=a.face;
  if(a.k==='chat'&&a.with&&a.with.state!=='home'){const q=a.with;n.face=Math.atan2(q.x-n.x,q.z-n.z);if(q.state==='idle'||q.state==='act'&&!q.act.seat){q.act={k:'chat',with:n,dur:a.dur};q.state='act';q.actT=a.dur;q.face=Math.atan2(n.x-q.x,n.z-q.z);showProp(q,null);}}}
function endActivity(n){n.act=null;n.sit=false;showProp(n,null);n.state='idle';n.wait=1.5+Math.random()*3;const L=n.limbs;if(L[2]){L[2].rotation.x=0;L[3].rotation.x=0;}}
function actTick(n,dt,tt){const a=n.act,L=n.limbs;n.actT-=dt;
  if(n.sit&&L[2]){L[2].rotation.x=-1.35;L[3].rotation.x=-1.35;}
  switch(a.k){
    case'fish':if(L[1])L[1].rotation.x=-0.9+Math.sin(tt*1.2+n.i)*0.05;if(Math.random()<dt*0.05){floatText(n.x,n.y+1.2,n.z,Math.random()<0.5?'!':'Got one!');n.happyT=1.2;}break;
    case'water':if(L[1])L[1].rotation.x=-0.7;if(Math.random()<dt*8){const fx=n.x+Math.sin(n.face)*0.45,fz=n.z+Math.cos(n.face)*0.45;emit(fx,n.y+0.35,fz,{vy:-1,life:0.4,max:0.4,size:0.04,color:0x8ac4ff,g:6});}break;
    case'read':if(L[1])L[1].rotation.x=-1.0;if(L[0])L[0].rotation.x=-0.9;break;
    case'coffee':if(L[1])L[1].rotation.x=-0.6-Math.max(0,Math.sin(tt*0.8+n.i))*0.6;break;
    case'tinker':if(L[1])L[1].rotation.x=-0.6-Math.abs(Math.sin(tt*6+n.i))*0.9;if(Math.random()<dt*2)sparkle(n.x+Math.sin(n.face)*0.4,n.y+0.2,n.z+Math.cos(n.face)*0.4,0xffe08a);break;
    case'wander':n.face+=Math.sin(tt*0.7+n.i)*dt*0.8;if(L[1])L[1].rotation.x=-0.8;break;
    case'sing':case'stargaze':n.g.rotation.z=Math.sin(tt*2+n.i)*0.08;if(Math.random()<dt*0.6)floatText(n.x,n.y+1.2,n.z,a.k==='sing'?'♪':'✦');break;
    case'chat':if(a.with){n.face=Math.atan2(a.with.x-n.x,a.with.z-n.z);if(Math.random()<dt*0.7)floatText(n.x,n.y+1.2,n.z,['…','!','ha ha','♥','?'][Math.floor(Math.random()*5)]);if(Math.random()<dt*0.8)n.talkT=0.8;if(a.with.state==='home')n.actT=0;}break;}
  if(n.actT<=0){n.g.rotation.z=0;if(L[0])L[0].rotation.x=0;if(L[1])L[1].rotation.x=0;endActivity(n);}}
function activityLine(n){return n.act&&ACT_LINES[n.act.k]?pickR(ACT_LINES[n.act.k]):null;}
