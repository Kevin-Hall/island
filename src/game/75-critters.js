/* =========================================================
   Critters (not saved): the small animals that make the island feel lived in. Songbirds hop and peck in the grass,
   rabbits nibble at the meadow edges, squirrels scamper round the trees, frogs sit by the river, crabs scuttle on the
   sand, bees drift between flowers, and now and then a deer steps out of the woods. They come and go around you with the
   time of day and the season, and each one bolts in its own way if you get too close: birds fly off, rabbits and deer
   bound away into the undergrowth, squirrels dash up a tree, frogs plop into the water and crabs dig into the sand.
   They're scenery, not catches (the net is for bugs, 74-life).
   ========================================================= */
const critters=[];let critT=1;
// kind: habitat, how many near you at once (by time of day), flee distance, walking speed
const CRIT={
  bird:{n:[5,0],flee:2.6,sp:1.1},rabbit:{n:[2,1],flee:3,sp:1.3},squirrel:{n:[2,0],flee:2.5,sp:1.8},
  frog:{n:[2,2],flee:2,sp:1.2},crab:{n:[3,2],flee:2.2,sp:0.7},bee:{n:[3,0],flee:0,sp:1},deer:{n:[1,0],flee:5,sp:1.1}};
const critSeason=()=>{const i=S.sea?null:curIsl();return i&&i.home?season():'summer';};
function critWant(k){const night=isNight(),s=critSeason(),n=CRIT[k].n[night?1:0];
  if(s==='winter'&&(k==='frog'||k==='bee'))return 0;if(s==='winter'&&k==='bird')return 2;if(s==='autumn'&&k==='bee')return 1;
  if(S.rain&&(k==='bee'||k==='bird'))return 0;return n;}

// ---- the models: soft, round little animals (built facing +z) ----
const CRIT_COLS={bird:[[0x9a6a44,0xe8d8b8,0x7a5234],[0x8a6048,0xe8703a,0x5a4034],[0x5a8ae0,0xf0e4d0,0x3a64b0]]};
function critModel(k,v){const g=new T.Group(),p=[],e=(x,y,z,s=0.035)=>p.push(P(SPH_XS,0x2a2230,x,y,z,0,0,0,s,s,s),P(SPH_XS,0xffffff,x+s*0.2,y+s*0.25,z+s*0.3,0,0,0,s*0.35,s*0.35,s*0.35));
  let wings=null,tail=null;const wint=critSeason()==='winter';
  switch(k){
    case'bird':{const [b,bl,dk]=CRIT_COLS.bird[v%3];p.push(PG(SPH,b,dk,0,0.12,0,0,0,0,0.2,0.17,0.26),P(SPH_LO,bl,0,0.1,0.05,0,0,0,0.15,0.12,0.16),PG(SPH_LO,b,dk,0,0.21,0.1,0,0,0,0.15,0.14,0.15),
        P(CONE5,0xf0b040,0,0.2,0.19,1.57,0,0,0.04,0.07,0.035),P(BOX,dk,0,0.14,-0.14,-0.35,0,0,0.07,0.015,0.12),P(CYL5,0xe0a040,0.04,0.03,0,0,0,0,0.012,0.06,0.012),P(CYL5,0xe0a040,-0.04,0.03,0,0,0,0,0.012,0.06,0.012));
      e(0.055,0.23,0.15,0.025);e(-0.055,0.23,0.15,0.025);
      const w=sd=>{const m=M([PG(SPH_LO,b,dk,sd*0.06,0,0,0,0,0,0.12,0.03,0.18)]);m.position.set(sd*0.07,0.14,-0.01);return m;};wings=[w(-1),w(1)];break;}
    case'rabbit':{const c=wint?0xf4f2ee:[0xc8a888,0x9a8272,0xd8c0a0][v%3],dk=lerpHex(c,0x5a4a40,0.35);
      p.push(PG(SPH,c,dk,0,0.15,-0.02,0,0,0,0.26,0.24,0.32),PG(SPH,c,dk,0,0.25,0.14,0,0,0,0.2,0.19,0.19),P(SPH_LO,0xffffff,0,0.17,-0.18,0,0,0,0.1,0.1,0.1),P(SPH_XS,0xf4a0b0,0,0.24,0.235,0,0,0,0.04,0.03,0.03));
      for(const sd of [-1,1])p.push(PG(SPH_LO,c,dk,sd*0.05,0.4,0.11,-0.2,0,sd*0.18,0.06,0.22,0.045),P(SPH_XS,0xf0b0bc,sd*0.05,0.4,0.125,-0.2,0,sd*0.18,0.03,0.16,0.02),P(SPH_LO,c,sd*0.08,0.05,0.1,0,0,0,0.07,0.06,0.11));
      e(0.075,0.28,0.2,0.03);e(-0.075,0.28,0.2,0.03);break;}
    case'squirrel':{const c=0xc0662e,dk=0x8a4420;
      p.push(PG(SPH,c,dk,0,0.12,0,0,0,0,0.16,0.2,0.22),P(SPH_LO,0xf0dcc0,0,0.12,0.06,0,0,0,0.11,0.15,0.1),PG(SPH_LO,c,dk,0,0.24,0.08,0,0,0,0.14,0.13,0.14),P(SPH_XS,0x2a2230,0,0.23,0.155,0,0,0,0.025,0.02,0.02));
      for(const sd of [-1,1])p.push(P(CONE5,c,sd*0.04,0.32,0.07,0,0,sd*0.2,0.035,0.06,0.03));
      e(0.05,0.26,0.13,0.022);e(-0.05,0.26,0.13,0.022);
      tail=M([PG(SPH_LO,0xd87838,dk,0,0.12,0,0,0,0,0.12,0.26,0.12),PG(SPH_LO,0xe08a44,c,0,0.26,0.04,0.5,0,0,0.11,0.16,0.1)]);tail.position.set(0,0.06,-0.1);tail.rotation.x=-0.3;break;}
    case'frog':{const c=[0x6ab84a,0x5aa848,0x8ac04a][v%3],dk=lerpHex(c,0x1a3a1a,0.45);
      p.push(PG(SPH,c,dk,0,0.07,0,0,0,0,0.22,0.13,0.24),P(SPH_LO,0xe8f0b8,0,0.05,0.05,0,0,0,0.16,0.08,0.14));
      for(const sd of [-1,1])p.push(PG(SPH_LO,c,dk,sd*0.06,0.13,0.06,0,0,0,0.08,0.08,0.08),P(SPH_LO,dk,sd*0.1,0.03,-0.06,0,0,0,0.09,0.05,0.13),P(SPH_XS,dk,sd*0.08,0.02,0.1,0,0,0,0.06,0.03,0.06));
      e(0.075,0.155,0.085,0.03);e(-0.075,0.155,0.085,0.03);break;}
    case'crab':{const c=0xe0603a,dk=0xa83a24;
      p.push(PG(SPH,c,dk,0,0.07,0,0,0,0,0.24,0.1,0.18));
      for(const sd of [-1,1]){p.push(PG(SPH_LO,c,dk,sd*0.13,0.07,0.1,0,sd*0.4,0,0.08,0.06,0.1),P(CYL5,dk,sd*0.03,0.12,0.06,0,0,0,0.012,0.06,0.012));e(sd*0.03,0.16,0.06,0.022);
        for(let i=0;i<3;i++)p.push(P(CYL5,dk,sd*0.13,0.03,-0.04+i*0.05,0,0,sd*1.1,0.015,0.1,0.015));}break;}
    case'bee':{p.push(P(SPH_LO,0xf6c83a,0,0,0,0,0,0,0.07,0.07,0.1),P(SCYL,0x2a2230,0,0,-0.012,1.57,0,0,0.072,0.02,0.072),P(SCYL,0x2a2230,0,0,-0.04,1.57,0,0,0.06,0.016,0.06),P(SPH_XS,0x2a2230,0,0.005,0.05,0,0,0,0.045,0.045,0.04));
      const w=sd=>{const m=M([P(SPH_XS,0xf4f8ff,sd*0.04,0,0,0,0,0,0.08,0.012,0.05)]);m.position.set(sd*0.01,0.035,0);return m;};wings=[w(-1),w(1)];break;}
    case'deer':{const c=0xb07a4a,dk=0x7a5030,lg=0x8a5a36;
      p.push(PG(SPH,c,dk,0,0.5,0,0,0,0,0.3,0.28,0.58),P(SPH_LO,0xf4ead8,0,0.46,0.02,0,0,0,0.22,0.18,0.4),PG(SCYL,c,dk,0,0.66,0.24,-0.5,0,0,0.1,0.28,0.1),PG(SPH_LO,c,dk,0,0.8,0.33,0,0,0,0.16,0.16,0.2),
        PG(SPH_LO,c,dk,0,0.76,0.43,0,0,0,0.1,0.09,0.12),P(SPH_XS,0x2a2230,0,0.77,0.49,0,0,0,0.04,0.03,0.03),P(SPH_LO,0xffffff,0,0.56,-0.28,0,0,0,0.08,0.1,0.06));
      for(const sd of [-1,1])p.push(P(SPH_LO,c,sd*0.09,0.9,0.3,0,0,sd*0.7,0.05,0.13,0.03));
      for(const [x,z] of [[0.08,0.18],[-0.08,0.18],[0.08,-0.18],[-0.08,-0.18]])p.push(P(SCYL,lg,x,0.2,z,0,0,0,0.075,0.4,0.075),P(SPH_XS,0x4a3020,x,0.02,z,0,0,0,0.08,0.05,0.09));
      for(let i=0;i<6;i++)p.push(P(SPH_XS,0xf4ead8,(i%2?0.08:-0.08)+(i%3)*0.02,0.6,-0.18+i*0.07,0,0,0,0.035,0.02,0.035));
      e(0.065,0.83,0.4,0.028);e(-0.065,0.83,0.4,0.028);break;}
  }
  const body=M(p);g.add(body);if(wings)g.add(...wings);if(tail)g.add(tail);g.userData={body,wings,tail};return g;}

// ---- where each kind lives ----
function critGround(x,z){const k=K(x,z);return landMap.get(k)==='grass'&&!debrisAt(x,z)&&!objAt(x,z)&&!fixedAt(x,z)&&!riverSurf.has(k);}
function nearTree(x,z,r){for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){const d=debrisAt(x+dx,z+dz);if(d&&d.k==='tree')return[x+dx,z+dz];}return null;}
function nearWater(x,z,r){for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++)if(riverSurf.has(K(x+dx,z+dz)))return[x+dx,z+dz];return null;}
function critHabitat(k,x,z){
  switch(k){
    case'crab':return landMap.get(K(x,z))==='sand'&&!objAt(x,z);
    case'frog':return critGround(x,z)&&!!nearWater(x,z,1);
    case'squirrel':return critGround(x,z)&&!!nearTree(x,z,1);
    case'deer':return critGround(x,z)&&!!nearTree(x,z,2)&&!nearWater(x,z,1);
    case'bee':return critGround(x,z)||(TOWN.flora&&TOWN.flora.has(K(x,z)));
    default:return critGround(x,z)&&!S.tiles[K(x,z)];}}
const critY=(x,z)=>surfY(x,z)||topY(Math.round(x),Math.round(z))||0.3;
const critLvl=(x,z)=>lvlMap.get(K(Math.round(x),Math.round(z)))||0;

function spawnCritter(k){const a=Math.random()*6.283,d=(k==='deer'?8:4)+Math.random()*(k==='deer'?4:8);
  for(let it=0;it<14;it++){const x=Math.round(vil.x+Math.cos(a+it*0.45)*d),z=Math.round(vil.z+Math.sin(a+it*0.45)*d);if(!critHabitat(k,x,z))continue;
    const n=k==='bird'?1+Math.floor(Math.random()*3):1;
    for(let i=0;i<n;i++){const v=Math.floor(Math.random()*3),g=critModel(k,k==='bird'&&i>0?critters[critters.length-1].v:v),cx=x+(Math.random()-0.5)*0.8,cz=z+(Math.random()-0.5)*0.8;
      const c={k,v,g,x:cx,z:cz,y:critY(cx,cz),state:'idle',t:Math.random()*2,wait:1+Math.random()*3,tx:cx,tz:cz,ph:Math.random()*6.28,out:0,hx:x,hz:z,sc:k==='deer'?1:1.1};
      g.position.set(cx,c.y,cz);g.rotation.y=Math.random()*6.28;g.scale.setScalar(0.01);scene.add(g);critters.push(c);}
    if(k==='deer'&&!S.sawDeer){S.sawDeer=1;setTimeout(()=>say('A deer! Shh…'),600);}
    return true;}
  return false;}
// a critter bursting out of a tree or bush where you shook it (runs or flies off at once)
function critterAt(k,x,z,flee){const g=critModel(k,Math.floor(Math.random()*3)),c={k,v:0,g,x,z,y:critY(x,z)+(k==='bird'?1.2:0),state:'idle',t:0.5,wait:1,tx:x,tz:z,ph:Math.random()*6.28,out:0,hx:x,hz:z,sc:1.1};
  g.position.set(x,c.y,z);scene.add(g);critters.push(c);if(flee)critFlee(c);return c;}
function dropCritter(i){const c=critters[i];scene.remove(c.g);c.g.traverse(o=>{if(o.geometry)o.geometry.dispose();});critters.splice(i,1);}

// pick somewhere nearby of the same kind of ground to wander to
function critWander(c){const r=c.k==='deer'?3:c.k==='crab'?1.5:2;for(let it=0;it<8;it++){const x=c.hx+(Math.random()-0.5)*2*r,z=c.hz+(Math.random()-0.5)*2*r,rx=Math.round(x),rz=Math.round(z);
    if(critHabitat(c.k,rx,rz)&&critLvl(rx,rz)===critLvl(c.x,c.z)){c.tx=x;c.tz=z;c.state='move';c.t=0;return;}}c.wait=1+Math.random()*2;}
function critFlee(c){c.state='flee';c.t=0;const a=Math.atan2(c.z-vil.z,c.x-vil.x);c.fx=Math.cos(a);c.fz=Math.sin(a);
  if(c.k==='squirrel'){const t=nearTree(Math.round(c.x),Math.round(c.z),2);if(t){c.tree=t;}
    if(Math.random()<0.4&&freeTile(Math.round(c.x),Math.round(c.z))){dropFind('acorn',Math.round(c.x),Math.round(c.z));floatText(c.x,c.y+0.6,c.z,'It dropped something!');}}/* startled, it lets go of its acorn */
  if(c.k==='frog'){const w=nearWater(Math.round(c.x),Math.round(c.z),2);if(w)c.water=w;}}

function updateCritters(dt,tt){
  // keep a lively population around you
  critT-=dt;if(critT<=0){critT=1.2;if(!S.sea&&!inside){const ks=Object.keys(CRIT).filter(k=>critters.filter(c=>c.k===k).length<critWant(k));
      if(ks.length){const k=ks[Math.floor(Math.random()*ks.length)];if(k!=='deer'||Math.random()<0.15)spawnCritter(k);}}}
  for(let i=critters.length-1;i>=0;i--){const c=critters[i],g=c.g,u=g.userData;c.t+=dt;
    const far=Math.hypot(c.x-vil.x,c.z-vil.z);if(far>26||S.sea){dropCritter(i);continue;}
    if(c.state!=='flee'&&c.state!=='gone'&&c.k!=='bee'&&far<CRIT[c.k].flee*(vil.idle>1.5?0.6:1))critFlee(c);
    let hop=0,sq=1;
    if(c.k==='bee'){// drifts in lazy loops round its flowers, wings a blur
      const a=c.t*0.9+c.ph;c.x=c.hx+Math.cos(a)*0.7+Math.sin(c.t*2.1)*0.2;c.z=c.hz+Math.sin(a*1.3)*0.6;c.y=critY(c.hx,c.hz)+0.35+Math.sin(c.t*3)*0.08;
      g.rotation.y=a+Math.PI/2;const f=Math.sin(tt*60)*0.6;u.wings[0].rotation.z=f;u.wings[1].rotation.z=-f;if(c.t>40)c.state='gone';}
    else if(c.state==='idle'){c.wait-=dt;
      if(c.k==='bird'){const pk=Math.sin(c.t*5+c.ph)>0.7;u.body.rotation.x=pk?0.45:0;if(Math.random()<dt*0.4)g.rotation.y+=(Math.random()-0.5)*2;}
      if(c.k==='rabbit'){u.body.rotation.x=Math.sin(c.t*9)>0.8?0.15:0;}
      if(c.k==='squirrel'){u.tail.rotation.x=-0.3+Math.sin(c.t*6)*0.25;}
      if(c.k==='frog'){sq=1+Math.sin(c.t*4)*0.06;}
      if(c.k==='deer'){u.body.rotation.x=Math.sin(c.t*0.6+c.ph)>0.2?0.35:0;}
      if(c.wait<=0)critWander(c);}
    else if(c.state==='move'){const dx=c.tx-c.x,dz=c.tz-c.z,d=Math.hypot(dx,dz),sp=CRIT[c.k].sp*(c.k==='bird'?0.6:1);u.body.rotation.x=0;
      if(d<0.05){c.state='idle';c.wait=1+Math.random()*(c.k==='deer'?6:4);}
      else{const st=Math.min(d,sp*dt);c.x+=dx/d*st;c.z+=dz/d*st;
        g.rotation.y=c.k==='crab'?Math.atan2(dx,dz)+Math.PI/2:Math.atan2(dx,dz);
        if(c.k==='bird'||c.k==='rabbit'||c.k==='frog')hop=Math.abs(Math.sin(c.t*(c.k==='bird'?14:8)))*(c.k==='rabbit'?0.16:0.07);
        if(c.k==='squirrel')hop=Math.abs(Math.sin(c.t*12))*0.05;if(c.k==='deer')hop=Math.abs(Math.sin(c.t*5))*0.03;}
      c.y=critY(c.x,c.z);}
    else if(c.state==='flee'){const T0=c.t;
      if(c.k==='bird'){// up and away
        c.x+=c.fx*dt*3;c.z+=c.fz*dt*3;c.y+=dt*(1.5+T0*1.5);g.rotation.y=Math.atan2(c.fx,c.fz);const f=Math.sin(tt*30)*0.9;u.wings[0].rotation.z=f;u.wings[1].rotation.z=-f;if(T0>3)c.state='gone';}
      else if(c.k==='squirrel'&&c.tree){const [tx,tz]=c.tree,dx=tx-c.x,dz=tz-c.z,d=Math.hypot(dx,dz);
        if(d>0.15){c.x+=dx/d*dt*3.5;c.z+=dz/d*dt*3.5;g.rotation.y=Math.atan2(dx,dz);c.y=critY(c.x,c.z);hop=Math.abs(Math.sin(c.t*16))*0.05;}
        else{c.y+=dt*1.6;g.rotation.x=-1.3;if(c.y>critY(tx,tz)+1.1)c.state='gone';}}
      else if(c.k==='frog'&&c.water){const [wx,wz]=c.water,dx=wx-c.x,dz=wz-c.z,d=Math.hypot(dx,dz);
        if(d>0.2){c.x+=dx/d*dt*2.5;c.z+=dz/d*dt*2.5;g.rotation.y=Math.atan2(dx,dz);c.y=critY(c.x,c.z);hop=Math.abs(Math.sin(c.t*9))*0.18;}
        else{burst(c.x,c.y+0.05,c.z,0xbfe6ff,10,1.2,0.05);c.state='gone';c.out=1;}}
      else if(c.k==='crab'){// scuttles off sideways and digs in
        if(T0<0.8){c.x+=c.fx*dt*1.8;c.z+=c.fz*dt*1.8;g.rotation.y=Math.atan2(c.fx,c.fz)+Math.PI/2;c.y=critY(c.x,c.z);}
        else{c.y-=dt*0.35;if(Math.random()<dt*10)emit(c.x,c.y+0.12,c.z,{vx:(Math.random()-0.5),vy:0.8,vz:(Math.random()-0.5),life:0.4,max:0.4,size:0.04,color:0xe8d4a8,g:3});if(T0>1.4)c.state='gone';}}
      else{// rabbits, deer and cornered critters: bound away and slip into the undergrowth
        const sp=c.k==='deer'?4.5:3.5;c.x+=c.fx*dt*sp;c.z+=c.fz*dt*sp;g.rotation.y=Math.atan2(c.fx,c.fz);c.y=critY(c.x,c.z);
        hop=Math.abs(Math.sin(c.t*(c.k==='deer'?7:11)))*(c.k==='deer'?0.35:0.22);if(T0>2.2)c.state='gone';}}
    if(c.state==='gone'){c.out+=dt*3;if(c.out>=1){dropCritter(i);continue;}}
    // fade in when they arrive, shrink away when they leave
    const vis=c.state==='gone'?1-c.out:Math.min(1,c.t*2+(c.state==='idle'?0:1));g.scale.set(c.sc*vis,c.sc*vis*sq,c.sc*vis);
    g.position.set(c.x,c.y+hop,c.z);}}
