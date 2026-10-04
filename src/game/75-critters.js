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
// a pivot: a group placed at (x,y,z) inside its parent (whose own pivot is at `par`), holding parts written in the whole
// model's coordinates, so every joint can be turned on its own
function rpiv(parent,x,y,z,parts,par=[0,0,0]){const gg=new T.Group();gg.position.set(x-par[0],y-par[1],z-par[2]);if(parts&&parts.length)gg.add(M(shift(parts,-x,-y,-z)));parent.add(gg);return gg;}
// yaw first, then pitch, so a nose-up or nose-down tilt is always along the way the animal faces
function rigDone(g){g.rotation.order='YXZ';g.traverse(o=>{if(o.isGroup)o.rotation.order='YXZ';});return g;}
function critModel(k,v){const g=new T.Group(),p=[],e=(x,y,z,s=0.035)=>p.push(P(SPH_XS,0x2a2230,x,y,z,0,0,0,s,s,s),P(SPH_XS,0xffffff,x+s*0.2,y+s*0.25,z+s*0.3,0,0,0,s*0.35,s*0.35,s*0.35));
  let wings=null,tail=null;const wint=critSeason()==='winter';
  switch(k){
    case'bird':{const [b,bl,dk]=CRIT_COLS.bird[v%3];p.push(PG(SPH,b,dk,0,0.12,0,0,0,0,0.2,0.17,0.26),P(SPH_LO,bl,0,0.1,0.05,0,0,0,0.15,0.12,0.16),PG(SPH_LO,b,dk,0,0.21,0.1,0,0,0,0.15,0.14,0.15),
        P(CONE5,0xf0b040,0,0.2,0.19,1.57,0,0,0.04,0.07,0.035),P(BOX,dk,0,0.14,-0.14,-0.35,0,0,0.07,0.015,0.12),P(CYL5,0xe0a040,0.04,0.03,0,0,0,0,0.012,0.06,0.012),P(CYL5,0xe0a040,-0.04,0.03,0,0,0,0,0.012,0.06,0.012));
      e(0.055,0.23,0.15,0.025);e(-0.055,0.23,0.15,0.025);
      const w=sd=>{const m=M([PG(SPH_LO,b,dk,sd*0.06,0,0,0,0,0,0.12,0.03,0.18)]);m.position.set(sd*0.07,0.14,-0.01);return m;};wings=[w(-1),w(1)];break;}
    case'rabbit':{// a rig: body (hips pivot) › head (neck pivot) › ears; hind legs and front paws on their own pivots
      const c=wint?0xf4f2ee:[0xc8a888,0x9a8272,0xd8c0a0][v%3],dk=lerpHex(c,0x5a4a40,0.35);
      const body=rpiv(g,0,0.09,-0.1,[PG(SPH,c,dk,0,0.15,-0.02,0,0,0,0.26,0.24,0.32),P(SPH_LO,0xffffff,0,0.17,-0.18,0,0,0,0.1,0.1,0.1),P(SPH_LO,lerpHex(c,0xffffff,0.5),0,0.11,0.04,0,0,0,0.16,0.14,0.18)]);
      const head=rpiv(body,0,0.21,0.08,[PG(SPH,c,dk,0,0.25,0.14,0,0,0,0.2,0.19,0.19)],[0,0.09,-0.1]);
      e(0.075,0.28,0.2,0.03);e(-0.075,0.28,0.2,0.03);head.add(M(shift(p.splice(0),-0,-0.21,-0.08)));
      const nose=rpiv(head,0,0.24,0.235,[P(SPH_XS,0xf4a0b0,0,0.24,0.235,0,0,0,0.04,0.03,0.03)],[0,0.21,0.08]);
      const ears=[-1,1].map(sd=>rpiv(head,sd*0.05,0.32,0.11,[PG(SPH_LO,c,dk,sd*0.05,0.4,0.11,-0.2,0,sd*0.18,0.06,0.22,0.045),P(SPH_XS,0xf0b0bc,sd*0.05,0.4,0.125,-0.2,0,sd*0.18,0.03,0.16,0.02)],[0,0.21,0.08]));
      const hind=[-1,1].map(sd=>rpiv(g,sd*0.08,0.1,-0.06,[P(SPH_LO,c,sd*0.09,0.08,-0.06,0,0,0,0.08,0.1,0.12),P(SPH_LO,dk,sd*0.08,0.02,-0.02,0,0,0,0.07,0.04,0.15)]));
      const front=[-1,1].map(sd=>rpiv(g,sd*0.06,0.12,0.1,[P(SPH_LO,c,sd*0.07,0.05,0.12,0,0,0,0.06,0.09,0.07)]));
      g.userData={rig:1,body,head,nose,ears,hind,front};return rigDone(g);}
    case'squirrel':{const c=0xc0662e,dk=0x8a4420;
      const body=rpiv(g,0,0.06,-0.04,[PG(SPH,c,dk,0,0.12,0,0,0,0,0.16,0.2,0.22),P(SPH_LO,0xf0dcc0,0,0.12,0.06,0,0,0,0.11,0.15,0.1)]);
      e(0.05,0.26,0.13,0.022);e(-0.05,0.26,0.13,0.022);
      const head=rpiv(body,0,0.18,0.06,[PG(SPH_LO,c,dk,0,0.24,0.08,0,0,0,0.14,0.13,0.14),P(SPH_XS,0x2a2230,0,0.23,0.155,0,0,0,0.025,0.02,0.02),...p.splice(0),...[-1,1].map(sd=>P(CONE5,c,sd*0.04,0.32,0.07,0,0,sd*0.2,0.035,0.06,0.03))],[0,0.06,-0.04]);
      const tail=rpiv(g,0,0.08,-0.1,[PG(SPH_LO,0xd87838,dk,0,0.2,-0.12,-0.3,0,0,0.12,0.26,0.12),PG(SPH_LO,0xe08a44,c,0,0.34,-0.08,0.2,0,0,0.11,0.16,0.1)]);
      const paws=[-1,1].map(sd=>rpiv(body,sd*0.04,0.1,0.08,[P(SPH_XS,dk,sd*0.04,0.1,0.11,0,0,0,0.04,0.05,0.04)],[0,0.06,-0.04]));
      g.userData={rig:1,body,head,tail,paws};return rigDone(g);}
    case'frog':{const c=[0x6ab84a,0x5aa848,0x8ac04a][v%3],dk=lerpHex(c,0x1a3a1a,0.45);
      const body=rpiv(g,0,0.04,-0.06,[PG(SPH,c,dk,0,0.07,0,0,0,0,0.22,0.13,0.24),P(SPH_LO,0xe8f0b8,0,0.05,0.05,0,0,0,0.16,0.08,0.14),...[-1,1].map(sd=>P(SPH_XS,dk,sd*0.08,0.02,0.1,0,0,0,0.06,0.03,0.06))]);
      const eyes=[-1,1].map(sd=>{const gg=rpiv(body,sd*0.06,0.13,0.06,[PG(SPH_LO,c,dk,sd*0.06,0.13,0.06,0,0,0,0.08,0.08,0.08)],[0,0.04,-0.06]);
        const lid=rpiv(gg,sd*0.075,0.155,0.085,[P(SPH_XS,0x2a2230,sd*0.075,0.155,0.085,0,0,0,0.03,0.03,0.03),P(SPH_XS,0xffffff,sd*0.08,0.162,0.095,0,0,0,0.01,0.01,0.01)],[sd*0.06,0.13,0.06]);return lid;});
      const pouch=rpiv(body,0,0.04,0.1,[P(SPH_LO,0xf0f4c8,0,0.04,0.1,0,0,0,0.1,0.06,0.07)],[0,0.04,-0.06]);
      const tongue=rpiv(body,0,0.06,0.12,[P(CYL5,0xf07a8a,0,0.06,0.2,1.57,0,0,0.018,0.16,0.018)],[0,0.04,-0.06]);tongue.scale.set(1,1,0.01);
      const legs=[-1,1].map(sd=>rpiv(g,sd*0.09,0.05,-0.08,[P(SPH_LO,dk,sd*0.1,0.03,-0.08,0,0,0,0.09,0.05,0.13),P(SPH_XS,dk,sd*0.12,0.015,0.0,0,0,0,0.07,0.02,0.08)]));
      g.userData={rig:1,body,eyes,pouch,tongue,legs};return rigDone(g);}
    case'crab':{const c=0xe0603a,dk=0xa83a24;
      p.push(PG(SPH,c,dk,0,0.07,0,0,0,0,0.24,0.1,0.18));
      for(const sd of [-1,1]){p.push(PG(SPH_LO,c,dk,sd*0.13,0.07,0.1,0,sd*0.4,0,0.08,0.06,0.1),P(CYL5,dk,sd*0.03,0.12,0.06,0,0,0,0.012,0.06,0.012));e(sd*0.03,0.16,0.06,0.022);
        for(let i=0;i<3;i++)p.push(P(CYL5,dk,sd*0.13,0.03,-0.04+i*0.05,0,0,sd*1.1,0.015,0.1,0.015));}break;}
    case'bee':{p.push(P(SPH_LO,0xf6c83a,0,0,0,0,0,0,0.07,0.07,0.1),P(SCYL,0x2a2230,0,0,-0.012,1.57,0,0,0.072,0.02,0.072),P(SCYL,0x2a2230,0,0,-0.04,1.57,0,0,0.06,0.016,0.06),P(SPH_XS,0x2a2230,0,0.005,0.05,0,0,0,0.045,0.045,0.04));
      const w=sd=>{const m=M([P(SPH_XS,0xf4f8ff,sd*0.04,0,0,0,0,0,0.08,0.012,0.05)]);m.position.set(sd*0.01,0.035,0);return m;};wings=[w(-1),w(1)];break;}
    case'deer':{const c=0xb07a4a,dk=0x7a5030,lg=0x8a5a36;// a rig: body › neck (shoulder pivot) › head › ears; four legs from hips and shoulders; a tail
      const body=rpiv(g,0,0.5,0,[PG(SPH,c,dk,0,0.5,0,0,0,0,0.3,0.28,0.58),PG(SPH_LO,c,dk,0,0.56,0.17,0,0,0,0.24,0.2,0.24),P(SPH_LO,0xf4ead8,0,0.46,0.02,0,0,0,0.22,0.18,0.4),...[...Array(6)].map((_,i)=>P(SPH_XS,0xf4ead8,(i%2?0.08:-0.08)+(i%3)*0.02,0.6,-0.18+i*0.07,0,0,0,0.035,0.02,0.035))]);
      e(0.065,0.83,0.4,0.028);e(-0.065,0.83,0.4,0.028);
      const neck=rpiv(body,0,0.6,0.2,[/* the neck rises up and forward from the shoulders into the head, with a rounded base that stays sunk in the shoulders as it bends down to graze */PG(SPH_LO,c,dk,0,0.6,0.2,0,0,0,0.17,0.17,0.17),PG(SCYL,c,dk,0,0.7,0.265,0.5,0,0,0.12,0.32,0.11),PG(SPH_LO,c,dk,0,0.8,0.33,0,0,0,0.16,0.16,0.2),PG(SPH_LO,c,dk,0,0.76,0.43,0,0,0,0.1,0.09,0.12),P(SPH_XS,0x2a2230,0,0.77,0.49,0,0,0,0.04,0.03,0.03),...p.splice(0)],[0,0.5,0]);
      const ears=[-1,1].map(sd=>rpiv(neck,sd*0.055,0.84,0.31,[P(SPH_LO,c,sd*0.1,0.865,0.3,0,0,sd*1.0,0.055,0.14,0.035),P(SPH_XS,0xf3d0c0,sd*0.1,0.865,0.31,0,0,sd*1.0,0.03,0.09,0.02)],[0,0.6,0.2]));
      const tail=rpiv(body,0,0.64,-0.25,[P(SPH_LO,0xffffff,0,0.56,-0.29,0,0,0,0.08,0.1,0.06),P(SPH_XS,c,0,0.6,-0.29,0,0,0,0.06,0.05,0.05)],[0,0.5,0]);
      const legs=[[0.08,0.18],[-0.08,0.18],[0.08,-0.18],[-0.08,-0.18]].map(([x,z])=>rpiv(g,x,0.42,z,[P(SCYL,lg,x,0.22,z,0,0,0,0.075,0.42,0.075),P(SPH_XS,0x4a3020,x,0.02,z,0,0,0,0.08,0.05,0.09)]));
      g.userData={rig:1,body,neck,ears,tail,legs};return rigDone(g);}
  }
  const body=M(p);g.add(body);if(wings)g.add(...wings);if(tail)g.add(tail);g.userData={body,wings,tail};return g;}

// ---- where each kind lives ----
function critGround(x,z){const k=K(x,z);return landMap.get(k)==='grass'&&!debrisAt(x,z)&&!objAt(x,z)&&!floorAt(x,z)&&!fixedAt(x,z)&&!riverSurf.has(k);}
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
  if(c.k==='frog'){const w=nearWater(Math.round(c.x),Math.round(c.z),2);if(w)c.water=w;}
  c.hw=0;c.hp=0;}

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
    else if(u.rig)[hop,sq]=rigCritter(c,dt,tt);// rabbits, squirrels, frogs and deer have jointed bodies (below)
    else if(c.state==='idle'){c.wait-=dt;
      if(c.k==='bird'){const pk=Math.sin(c.t*5+c.ph)>0.7;u.body.rotation.x=pk?0.45:0;if(Math.random()<dt*0.4)g.rotation.y+=(Math.random()-0.5)*2;}
      if(c.wait<=0)critWander(c);}
    else if(c.state==='move'){const dx=c.tx-c.x,dz=c.tz-c.z,d=Math.hypot(dx,dz),sp=CRIT[c.k].sp*(c.k==='bird'?0.6:1);u.body.rotation.x=0;
      if(d<0.05){c.state='idle';c.wait=1+Math.random()*(c.k==='deer'?6:4);}
      else{const st=Math.min(d,sp*dt);c.x+=dx/d*st;c.z+=dz/d*st;
        g.rotation.y=c.k==='crab'?Math.atan2(dx,dz)+Math.PI/2:Math.atan2(dx,dz);
        if(c.k==='bird')hop=Math.abs(Math.sin(c.t*14))*0.07;}
      c.y=critY(c.x,c.z);}
    else if(c.state==='flee'){const T0=c.t;
      if(c.k==='bird'){// up and away
        c.x+=c.fx*dt*3;c.z+=c.fz*dt*3;c.y+=dt*(1.5+T0*1.5);g.rotation.y=Math.atan2(c.fx,c.fz);const f=Math.sin(tt*30)*0.9;u.wings[0].rotation.z=f;u.wings[1].rotation.z=-f;if(T0>3)c.state='gone';}
      else if(c.k==='crab'){// scuttles off sideways and digs in
        if(T0<0.8){c.x+=c.fx*dt*1.8;c.z+=c.fz*dt*1.8;g.rotation.y=Math.atan2(c.fx,c.fz)+Math.PI/2;c.y=critY(c.x,c.z);}
        else{c.y-=dt*0.35;if(Math.random()<dt*10)emit(c.x,c.y+0.12,c.z,{vx:(Math.random()-0.5),vy:0.8,vz:(Math.random()-0.5),life:0.4,max:0.4,size:0.04,color:0xe8d4a8,g:3});if(T0>1.4)c.state='gone';}}
      else{c.state='gone';}}
    if(c.state==='gone'){c.out+=dt*3;if(c.out>=1){dropCritter(i);continue;}}
    // fade in when they arrive, shrink away when they leave
    const vis=c.state==='gone'?1-c.out:Math.min(1,c.t*2+(c.state==='idle'?0:1));g.scale.set(c.sc*vis,c.sc*vis*sq,c.sc*vis);
    g.position.set(c.x,c.y+hop,c.z);}}

// ---- jointed animals: hops with a crouch, spring and landing; a deer's walk and gallop; little things to do when still ----
// a hop: [length of one hop (s), height, distance covered, shortest and longest pause between hops]
const HOP={rabbit:[.42,.15,.4,.15,.55],frog:[.5,.12,.32,.5,1.4],squirrel:[.24,.06,.34,0,.12]},
  HOPF={rabbit:[.34,.24,1,0,.03],frog:[.42,.2,.55,.02,.1],squirrel:[.2,.08,.6,0,0]};
const BEH={rabbit:['sit','sit','look','graze','graze','alert'],squirrel:['look','nibble','nibble','flick'],frog:['sit','sit','croak'],deer:['graze','graze','look','stand','alert']};
const dmp=(o,k,v,r,dt)=>{o[k]+=(v-o[k])*(1-Math.exp(-r*dt));};
function turnTo(g,a,r,dt){const d=Math.atan2(Math.sin(a-g.rotation.y),Math.cos(a-g.rotation.y));g.rotation.y+=d*Math.min(1,r*dt);}
function hopStep(c,dt,H){const o={mv:0,h:0,sq:1,pit:0,leg:0,air:0};
  if(c.hw>0){c.hw-=dt;return o;}
  c.hp=(c.hp||0)+dt/H[0];let p=c.hp;if(p>=1){c.hp=0;c.hw=H[3]+Math.random()*(H[4]-H[3]);p=0.999;}
  if(p<.15){const k=p/.15;o.sq=1-.2*k;o.pit=-.2*k;o.leg=-.25*k;}// crouch, rump down
  else if(p<.75){const a=(p-.15)/.6;o.air=1;o.mv=H[2]*dt/(H[0]*.6);o.h=H[1]*Math.sin(a*Math.PI);o.sq=1+.16*Math.max(0,1-a*2.5);// spring and fly: nose up, then down to land, back legs kicked out behind
    o.pit=-.25*Math.cos(a*Math.PI);o.leg=.3+.6*Math.cos(a*Math.PI);}
  else{const k=(p-.75)/.25;o.sq=1-.16*Math.sin(k*Math.PI);o.pit=.25*(1-k);o.leg=-.3*(1-k);}// land with a squash
  return o;}
function critBeh(c,dt){c.bt=(c.bt||0)-dt;if(c.bt<=0){const L=BEH[c.k];c.beh=L[Math.floor(Math.random()*L.length)];c.bt=1.2+Math.random()*2.8;c.ly=(Math.random()-.5)*1.4;}return c.beh;}
function earFlick(c,dt,ears,rate){if(!(c.ef>0)&&Math.random()<dt*rate){c.ef=0.3;c.ei=Math.random()<.5?0:1;}
  ears.forEach((e,i)=>{const sd=i?1:-1;if(c.ef>0&&c.ei===i)e.rotation.z=sd*Math.sin((1-c.ef/0.3)*Math.PI*2)*0.45;else dmp(e.rotation,'z',0,12,dt);});if(c.ef>0)c.ef-=dt;}
function rigCritter(c,dt,tt){const g=c.g,u=g.userData,k=c.k,T0=c.t;let hop=0,sq=1,o=null,gait=0;
  // ---- where it's going ----
  if(c.state==='idle'){c.wait-=dt;if(c.wait<=0)critWander(c);}
  if(c.state==='move'){const dx=c.tx-c.x,dz=c.tz-c.z,d=Math.hypot(dx,dz);
    if(d<0.06&&!c.hp){c.state='idle';c.wait=1+Math.random()*(k==='deer'?6:4);c.bt=0;}
    else{if(d>0.06)turnTo(g,Math.atan2(dx,dz),k==='deer'?3:14,dt);
      if(k==='deer'){gait=1;c.wp=(c.wp||0)+dt*6.5;const st=Math.min(d,CRIT.deer.sp*0.75*dt);c.x+=dx/d*st;c.z+=dz/d*st;}
      else{o=hopStep(c,dt,HOP[k]);if(d>0.01){const st=Math.min(d,o.mv);c.x+=dx/d*st;c.z+=dz/d*st;}}
      c.y=critY(c.x,c.z);}}
  else if(c.state==='flee'){let dx=c.fx,dz=c.fz,d=9;
    if(k==='squirrel'&&c.tree){dx=c.tree[0]-c.x;dz=c.tree[1]-c.z;d=Math.hypot(dx,dz);}
    if(k==='frog'&&c.water){dx=c.water[0]-c.x;dz=c.water[1]-c.z;d=Math.hypot(dx,dz);}
    if(c.climb){c.y+=dt*1.6;if(c.y>critY(c.tree[0],c.tree[1])+1.1)c.state='gone';}// up the trunk
    else if(k==='squirrel'&&c.tree&&d<=0.15)c.climb=1;
    else if(k==='frog'&&c.water&&d<=0.2){burst(c.x,c.y+0.05,c.z,0xbfe6ff,10,1.2,0.05);c.state='gone';c.out=1;}// plop
    else if(k==='deer'&&T0<0.35){}// freezes, head up, for a heartbeat before it bolts
    else{const n=Math.hypot(dx,dz)||1;turnTo(g,Math.atan2(dx,dz),k==='deer'?8:20,dt);
      if(k==='deer'){gait=2;c.wp=(c.wp||0)+dt*12;c.x+=dx/n*4.5*dt;c.z+=dz/n*4.5*dt;}
      else{o=hopStep(c,dt,HOPF[k]);const st=Math.min(d,o.mv);c.x+=dx/n*st;c.z+=dz/n*st;}
      c.y=critY(c.x,c.z);if(T0>(k==='frog'||k==='squirrel'?4:2.4))c.state='gone';}}
  // ---- how it moves ----
  const B=c.state==='idle'?critBeh(c,dt):'',R=o?40:8,pit=o?o.pit:0,leg=o?o.leg:0,air=o?o.air:0;if(o){hop=o.h;sq=o.sq;}
  switch(k){
    case'rabbit':{dmp(g.rotation,'x',pit,R,dt);
      u.hind.forEach(h=>dmp(h.rotation,'x',leg,R,dt));u.front.forEach(f=>dmp(f.rotation,'x',o?-leg*0.8:B==='alert'?0.4:0,R,dt));
      dmp(u.body.rotation,'x',B==='alert'?-0.5:B==='graze'?0.2:0,6,dt);
      dmp(u.head.rotation,'x',B==='graze'?0.75+Math.sin(tt*14)*0.07:B==='alert'?0.35:-pit*0.5,B==='graze'?14:8,dt);
      dmp(u.head.rotation,'y',B==='look'?c.ly||0:0,5,dt);
      u.ears.forEach(e=>dmp(e.rotation,'x',air?-0.7:B==='alert'?0.12:B==='graze'?-0.4:-0.1,air?16:6,dt));earFlick(c,dt,u.ears,0.5);
      const tw=c.state==='idle'&&Math.sin(tt*2.3+c.ph)>0.1?Math.sin(tt*40)*0.16:0;u.nose.scale.set(1+tw,1-tw,1);break;}// nose twitching
    case'squirrel':{if(c.climb){g.rotation.x=-1.3;u.body.rotation.z=Math.sin(tt*28)*0.15;u.tail.rotation.x=0.3+Math.sin(tt*20)*0.2;break;}
      dmp(g.rotation,'x',pit*1.2,R,dt);
      dmp(u.body.rotation,'x',B==='nibble'?-0.75:0,10,dt);
      dmp(u.head.rotation,'x',B==='nibble'?0.45+Math.sin(tt*22)*0.08:0,14,dt);
      if(B==='look'&&Math.random()<dt*2.5)c.ly=(Math.random()-.5)*1.6;dmp(u.head.rotation,'y',B==='look'?c.ly||0:0,25,dt);// quick little head jerks
      u.paws.forEach(p=>dmp(p.rotation,'x',B==='nibble'?-1:o?-leg:0,12,dt));
      dmp(u.tail.rotation,'x',o?-0.3+Math.sin((c.hp||0)*6.283)*0.35:-0.3+Math.sin(T0*2.5)*0.08+(B==='flick'?Math.sin(tt*24)*0.35:0),o?30:14,dt);break;}
    case'frog':{dmp(g.rotation,'x',pit*0.9,R,dt);
      u.legs.forEach(l=>{dmp(l.rotation,'x',o?Math.max(0,leg)*1.4:0,R,dt);l.scale.z=1+air*0.6;});// back legs kick straight out
      const croak=B==='croak'?Math.max(0,Math.sin(T0*6))*0.9:0;u.pouch.scale.setScalar(1+Math.max(0,Math.sin(tt*6+c.ph))*0.16+croak);// breathing throat, and a big puffed croak
      c.bk=(c.bk||2)-dt;if(c.bk<=0)c.bk=1.5+Math.random()*4;u.eyes.forEach(l=>l.scale.y=c.bk<0.14?0.15:1);// blink
      if(c.state==='idle'&&!(c.tg>0)&&Math.random()<dt*0.12)c.tg=0.3;// snap at a passing gnat
      if(c.tg>0){c.tg-=dt;const a=Math.sin(Math.max(0,1-c.tg/0.3)*Math.PI);u.tongue.scale.z=Math.max(0.01,a*1.3);u.body.rotation.x=a*0.15;}else{u.tongue.scale.z=0.01;u.body.rotation.x=0;}break;}
    case'deer':{const w=c.wp||0,frz=c.state==='flee'&&T0<0.35;
      if(gait===1){const a=Math.sin(w)*0.38;u.legs.forEach((l,i)=>dmp(l.rotation,'x',i===0||i===3?a:-a,30,dt));hop=Math.abs(Math.sin(w))*0.025;}// walk: diagonal pairs
      else if(gait===2){const L=[Math.sin(w),Math.sin(w-0.35),Math.sin(w+2.4),Math.sin(w+2.05)];u.legs.forEach((l,i)=>dmp(l.rotation,'x',L[i]*0.9,40,dt));hop=Math.max(0,Math.sin(w+0.9))*0.26;}// gallop: front pair, then back pair
      else u.legs.forEach(l=>dmp(l.rotation,'x',0,8,dt));
      dmp(g.rotation,'x',gait===2?Math.sin(w+2.2)*0.14:0,gait===2?30:6,dt);
      dmp(u.body.rotation,'x',B==='graze'?0.18:0,3,dt);
      dmp(u.neck.rotation,'x',gait===1?0.12+Math.sin(w*2)*0.04:gait===2?-0.25+Math.sin(w)*0.08:frz||B==='alert'?-0.4:B==='graze'?1.45+Math.sin(tt*9)*0.04:0,gait?20:B==='graze'?2.5:5,dt);
      dmp(u.neck.rotation,'y',B==='look'?(c.ly||0)*0.8:0,3,dt);
      u.ears.forEach(e=>dmp(e.rotation,'x',gait===2?-0.5:frz||B==='alert'?0.3:0,8,dt));earFlick(c,dt,u.ears,frz||B==='alert'?0:0.6);
      if(!(c.tf>0)&&Math.random()<dt*0.3)c.tf=0.5;if(c.tf>0)c.tf-=dt;// tail swish, and the white flag up when it runs
      dmp(u.tail.rotation,'x',gait===2||frz?-1.2:0,12,dt);u.tail.rotation.z=c.tf>0&&!gait?Math.sin(tt*25)*0.5:0;break;}
  }
  return [hop,sq];}
