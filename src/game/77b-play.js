/* =========================================================
   Play: things to muck about with for no reason at all.
   - A beach ball by your camp. Walk into it to dribble it, tap it to run up and give it a proper kick; it rolls over the
     grass and sand, bounces off trees, rocks and buildings, drops off cliffs, and if it lands in the water it bobs about
     and drifts back to shore. Saved where it stops (S.ball).
   - Seasonal piles to scuff through: heaps of fallen leaves under the trees in autumn, snow drifts in winter, drifts of
     blossom petals in spring, dandelion clocks in summer. Walk (or roll the ball) through one and it bursts; now and then
     something was hiding inside. They come back each morning (scuffPiles, from dawn).
   - Tap your own character for a little flourish (their spin or cheer, or a happy hop).
   ========================================================= */
const BALL_R=0.2;let ball=null;
// six coloured panels round a sphere (white between them and at the poles), painted per vertex by longitude
function ballModel(){const geo=new T.SphereGeometry(BALL_R,24,16),pos=geo.attributes.position,c=[],cols=[0xf25a5a,0xf6c84a,0x4aa8e8],q=new T.Color();
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),seg=Math.floor(((Math.atan2(z,x)+Math.PI)/(2*Math.PI))*6)%6;
    q.setHex(Math.abs(y)>BALL_R*0.82||seg%2?0xfff8ee:cols[seg>>1]);c.push(q.r,q.g,q.b);}
  geo.setAttribute('color',new T.Float32BufferAttribute(c,3));geo.userData.smooth=true;const m=new T.Mesh(geo,vcMat);m.castShadow=true;m.receiveShadow=true;
  const g=new T.Group();g.add(m);return g;}
function ballGround(x,z){const tx=Math.round(x),tz=Math.round(z),k=K(tx,tz),t=landMap.get(k);
  if(riverSurf.has(k))return{y:riverSurf.get(k),wet:true};if(isLandT(t))return{y:surfY(x,z),wet:false,t};return{y:tideY,wet:true};}
// is the tile a wall for the ball (a tree, rock, building, placed thing, or a cliff face higher than it is)?
function ballWall(x,z,y){const tx=Math.round(x),tz=Math.round(z);if(debrisAt(tx,tz)){const d=debrisAt(tx,tz);if(d.k!=='weed')return true;}
  const o=objAt(tx,tz);if(o&&!WALK_OVER.has(o.k))return true;if(fixedAt(tx,tz)&&fixedAt(tx,tz)!=='path')return true;
  const t=landMap.get(K(tx,tz));if(isLandT(t)&&topY(tx,tz)>y+0.25)return true;return false;}
function placeBall(){const h=islands[0];if(!h)return;const at=S.homeAt||{x:Math.round(vil.x),z:Math.round(vil.z)};
  let best=null,bd=1e9;for(const [x,z] of h.grass.concat(h.sand)){const d=Math.hypot(x-at.x-2,z-at.z-1.5);if(d<bd&&d>1.2&&freeTile(x,z)){bd=d;best=[x,z];}}
  if(best)S.ball={x:best[0],z:best[1]};}
function playInit(){if(ball){scene.remove(ball.g);ball=null;}if(!S.ball||!isFinite(S.ball.x))placeBall();if(!S.ball)return;
  const g=ballModel();g.traverse(o=>{if(o.isMesh)o.castShadow=true;});scene.add(g);const G=ballGround(S.ball.x,S.ball.z);
  ball={g,x:S.ball.x,z:S.ball.z,y:G.y+BALL_R,vx:0,vy:0,vz:0,sleep:0};g.position.set(ball.x,ball.y,ball.z);scuffPiles();}
// a kick: off it goes, away from you (dx,dz) at speed sp with a lift of up
function kickBall(dx,dz,sp,up){const d=Math.hypot(dx,dz)||1;ball.vx=dx/d*sp;ball.vz=dz/d*sp;ball.vy=Math.max(ball.vy,up);ball.sleep=0;
  tone(320+sp*30,0.08,'sine',0.06,520+sp*40);noise(0.04,0.03,2400);}
// tapped: run round behind it and boot it the way you were facing it
function tapBall(){const b=ball,dx=b.x-vil.x,dz=b.z-vil.z,d=Math.hypot(dx,dz)||1,ux=dx/d,uz=dz/d;
  const go=()=>{if(!ball)return;let kx=ball.x-vil.x,kz=ball.z-vil.z;if(Math.hypot(kx,kz)<0.3){kx=ux;kz=uz;}/* (right on top of it: boot it the way you came) */villager.rotation.y=Math.atan2(kx,kz);vil.hop=0.25;kickBall(kx,kz,5.5+Math.random()*1.5,3.4+Math.random());floatText(ball.x,ball.y+0.6,ball.z,pickR(['Boing!','Wheee!','Goal?','Boing!']));};
  if(d<1.1)go();else goTo(b.x-ux*0.7,b.z-uz*0.7,go);}
let pvx=0,pvz=0,plx=null,plz=null;
function updateBall(dt){const b=ball;if(!b||inside)return;
  // how fast you're moving, to dribble the ball when you walk into it
  if(plx!==null&&dt>0){pvx=lerp(pvx,(vil.x-plx)/dt,Math.min(1,dt*10));pvz=lerp(pvz,(vil.z-plz)/dt,Math.min(1,dt*10));}plx=vil.x;plz=vil.z;
  const dx=b.x-vil.x,dz=b.z-vil.z,d=Math.hypot(dx,dz),ps=Math.hypot(pvx,pvz);
  if(!S.sea&&!swim.on&&d<BALL_R+0.24&&b.y-villager.position.y<0.6){const ux=dx/(d||1),uz=dz/(d||1);
    if(ps>0.4&&(pvx*ux+pvz*uz)>0){kickBall(ux+pvx/ps*0.6,uz+pvz/ps*0.6,ps*1.35+0.8,ps>2.5?2.2:1.1);}
    else{b.x=vil.x+ux*(BALL_R+0.25);b.z=vil.z+uz*(BALL_R+0.25);b.sleep=0;}}
  if(b.sleep>2&&Math.hypot(b.x-vil.x,b.z-vil.z)>1.5)return;
  const G0=ballGround(b.x,b.z);
  // roll: friction on the ground, a slow drift back to the beach on the water
  b.vy-=9.8*dt;let nx=b.x+b.vx*dt,nz=b.z+b.vz*dt;
  // (only a tile it's rolling into can stop it, never the one it's already on)
  const same=(x,z)=>Math.round(x)===Math.round(b.x)&&Math.round(z)===Math.round(b.z);
  if(!same(nx,b.z)&&ballWall(nx,b.z,b.y-BALL_R)){b.vx=-b.vx*0.6;nx=b.x;if(Math.abs(b.vx)>0.6)tone(200,0.05,'sine',0.04);}
  if(!same(b.x,nz)&&ballWall(b.x,nz,b.y-BALL_R)){b.vz=-b.vz*0.6;nz=b.z;if(Math.abs(b.vz)>0.6)tone(200,0.05,'sine',0.04);}
  b.x=nx;b.z=nz;b.y+=b.vy*dt;const G=ballGround(b.x,b.z),floor=G.y+(G.wet?BALL_R*0.55:BALL_R);
  if(b.y<=floor){if(G.wet){if(b.vy<-2.5){for(let i=0;i<8;i++)emit(b.x,G.y+0.05,b.z,{vx:(Math.random()-0.5)*1.4,vy:1.2+Math.random()*1.2,vz:(Math.random()-0.5)*1.4,life:0.6,max:0.6,size:0.06,color:0xd8f0ff,g:5});noise(0.12,0.04,900);}
      b.y=floor+Math.sin(tt*2.2)*0.025;b.vy=0;const f=Math.exp(-0.9*dt);b.vx*=f;b.vz*=f;
      // the current brings it home: toward the middle of the island
      const h=islands[0];if(h&&landMap.get(K(Math.round(b.x),Math.round(b.z)))!=='river'){const cx=h.cx-b.x,cz=h.cz-b.z,cd=Math.hypot(cx,cz)||1;b.vx+=cx/cd*0.35*dt;b.vz+=cz/cd*0.35*dt;}
      if(landMap.get(K(Math.round(b.x),Math.round(b.z)))==='river'){b.vx+=(Math.random()-0.5)*0.4*dt;b.vz+=(Math.random()-0.5)*0.4*dt;}}
    else{if(b.vy<-1.6){tone(260,0.05,'sine',0.035,180);b.vy=-b.vy*0.45;}else b.vy=0;b.y=Math.max(b.y,floor);if(b.vy===0){const f=Math.exp(-(G.t==='sand'?2.2:1.3)*dt);b.vx*=f;b.vz*=f;}}}
  const sp=Math.hypot(b.vx,b.vz);
  if(sp>0.01){_v.set(b.vz,0,-b.vx).normalize();_q.setFromAxisAngle(_v,sp*dt/BALL_R);b.g.quaternion.premultiply(_q);}
  b.sleep=sp<0.05&&Math.abs(b.vy)<0.05&&!G.wet?b.sleep+dt:0;
  b.g.position.set(b.x,b.y,b.z);
  // a ball rolling through a pile scatters it too
  if(sp>0.6)for(const p of piles)if(!p.gone&&Math.abs(p.x-b.x)<0.5&&Math.abs(p.z-b.z)<0.5)burstPile(p,true);
  // lost far out to sea: it turns up by camp again
  if(Math.hypot(b.x-(islands[0]?islands[0].cx:0),b.z-(islands[0]?islands[0].cz:0))>90){S.ball=null;playInit();return;}
  S.ball={x:+b.x.toFixed(2),z:+b.z.toFixed(2)};}

// ---- seasonal piles ----
const piles=[];
function pileParts(k,R){const p=[];
  switch(k){
    case'leaves':{const cols=[0xe8803a,0xd8502e,0xf2b13c,0xb8642a,0xe89a3c];p.push(PG(SPH_LO,0xc8742e,0x8a4a22,0,0.03,0,0,0,0,0.6,0.12,0.5));
      for(let i=0;i<22;i++){const a=R()*6.283,r=Math.sqrt(R())*0.27,y=0.05+(0.3-r)*0.32*R();p.push(P(LEAF0,cols[i%5],Math.cos(a)*r,y,Math.sin(a)*r,(R()-0.5)*1.2,R()*6.283,(R()-0.5)*1.2,0.1,0.014,0.14));}break;}
    case'snow':p.push(PG(SPH_LO,0xffffff,0xd6e4f2,0,0.05,0,0,0,0,0.62,0.24,0.5),PG(SPH_LO,0xffffff,0xdce8f4,0.14,0.09,0.06,0,0,0,0.34,0.2,0.3),PG(SPH_LO,0xffffff,0xdce8f4,-0.12,0.08,-0.08,0,0,0,0.3,0.16,0.28));break;
    case'petals':{p.push(PG(SPH_LO,0x86c85a,0x5a9a3e,0,0.01,0,0,0,0,0.5,0.04,0.44));for(let i=0;i<26;i++){const a=R()*6.283,r=Math.sqrt(R())*0.26;p.push(P(SPH_XS,[0xf8c8d8,0xffffff,0xf6a8c0,0xffe8f0][i%4],Math.cos(a)*r,0.03+R()*0.04,Math.sin(a)*r,0,R()*6,0,0.08,0.015,0.06));}break;}
    case'clocks':for(let i=0;i<3;i++){const a=i*2.1+R(),r=i?0.13:0,x=Math.cos(a)*r,z=Math.sin(a)*r,h=0.22+R()*0.1;
        p.push(P(CYL5,0x6a9a3a,x,h/2,z,0,0,(R()-0.5)*0.2,0.014,h,0.014),P(ICO,0xf8f8f0,x,h+0.05,z,0,0,0,0.13,0.13,0.13));for(let j=0;j<10;j++){const u=R()*6.283,v=Math.acos(R()*2-1);p.push(P(SPH_XS,0xffffff,x+Math.sin(v)*Math.cos(u)*0.07,h+0.05+Math.cos(v)*0.07,z+Math.sin(v)*Math.sin(u)*0.07,0,0,0,0.02,0.02,0.02));}}
      p.push(P(LEAF0,0x5a9a3a,0.06,0.01,0,0,0.4,0,0.06,0.01,0.16),P(LEAF0,0x5a9a3a,-0.05,0.01,0.04,0,2.4,0,0.06,0.01,0.15));break;}
  return p;}
const PILE_KIND={autumn:'leaves',winter:'snow',spring:'petals',summer:'clocks'};
function scuffPiles(){for(const p of piles)if(p.g)scene.remove(p.g);piles.length=0;const h=islands[0];if(!h||!S.wild)return;
  const k=PILE_KIND[season()]||'leaves',trees=S.debris.filter(d=>d.k==='tree'),R=mulberry(hi(S.day|0,71,S.worldSeed|0)),used=new Set();
  const spots=[];
  if(k==='leaves')for(const t of trees)for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]])spots.push([t.x+a,t.z+b]);
  else for(let i=0;i<200;i++){const c=h.grass[Math.floor(R()*h.grass.length)];if(c)spots.push(c);}
  for(let i=spots.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[spots[i],spots[j]]=[spots[j],spots[i]];}
  for(const [x,z] of spots){if(piles.length>=12)break;const kk=K(x,z);if(used.has(kk)||landMap.get(kk)!=='grass'||!freeTile(x,z)||S.tiles[kk])continue;
    let near=false;for(const q of piles)if(Math.abs(q.x-x)<3&&Math.abs(q.z-z)<3)near=true;if(near)continue;used.add(kk);
    const g=new T.Group();g.add(M(pileParts(k,mulberry(hi(x,z,33)))));const ox=(hash(x,z)-0.5)*0.3,oz=(hash(z,x)-0.5)*0.3;g.position.set(x+ox,topY(x,z),z+oz);g.rotation.y=hash(x+1,z)*6.28;scene.add(g);
    piles.push({x:x+ox,z:z+oz,tx:x,tz:z,k,g,gone:false});}}
function burstPile(p,byBall){if(p.gone)return;p.gone=true;const x=p.x,z=p.z,y=topY(p.tx,p.tz);p.t=0;
  const wx=0.35,wz=0.15;/* a breath of wind carries it off */
  if(p.k==='leaves'){const cols=[0xe8803a,0xd8502e,0xf2b13c,0xb8642a];for(let i=0;i<22;i++)emit(x+(Math.random()-0.5)*0.4,y+0.1,z+(Math.random()-0.5)*0.4,{vx:(Math.random()-0.5)*1.6+wx,vy:1.6+Math.random()*2,vz:(Math.random()-0.5)*1.6+wz,life:1.8+Math.random(),max:2.6,size:0.07,color:cols[i%4],g:1.4,sw:0.9,ph:Math.random()*6,spin:1});
    noise(0.3,0.06,2200,0.8);setTimeout(()=>noise(0.2,0.03,3200,0.8),120);}
  else if(p.k==='snow'){for(let i=0;i<20;i++)emit(x+(Math.random()-0.5)*0.4,y+0.15,z+(Math.random()-0.5)*0.4,{vx:(Math.random()-0.5)*1.6,vy:1.2+Math.random()*1.6,vz:(Math.random()-0.5)*1.6,life:1,max:1,size:0.08,color:0xffffff,g:4});noise(0.25,0.05,700,0.6);}
  else if(p.k==='petals'){const cols=[0xf8c8d8,0xffffff,0xf6a8c0];for(let i=0;i<20;i++)emit(x,y+0.1,z,{vx:(Math.random()-0.5)*1.2+wx,vy:1.4+Math.random()*1.4,vz:(Math.random()-0.5)*1.2+wz,life:2.2,max:2.2,size:0.06,color:cols[i%3],g:0.8,sw:1.1,ph:Math.random()*6,spin:1});tone(1320,0.06,'sine',0.025);tone(1760,0.08,'sine',0.02);}
  else{for(let i=0;i<30;i++)emit(x+(Math.random()-0.5)*0.3,y+0.3,z+(Math.random()-0.5)*0.3,{vx:(Math.random()-0.5)*0.5+wx*1.5,vy:0.4+Math.random()*0.6,vz:(Math.random()-0.5)*0.5+wz*1.5,life:3+Math.random()*1.5,max:4.5,size:0.035,color:0xffffff,g:-0.05,sw:0.6,ph:Math.random()*6});
    [1047,1319,1568].forEach((f,i)=>setTimeout(()=>tone(f,0.1,'sine',0.02),i*70));}
  // now and then something was hiding in there
  if(!byBall&&Math.random()<0.14){const gift={leaves:['acorn','mushroom','acorn','oldcoin'],snow:['pinecone','clam'],petals:['clover4','acorn'],clocks:['clover4','glint']}[p.k],k=pickR(gift);
    if(FINDS[k]&&!findAt(p.tx,p.tz)){S.finds.push({k,x:p.tx,z:p.tz});syncLife();sparkle(p.tx,y+0.3,p.tz,0xfff0c0);floatText(p.tx,y+0.9,p.tz,'Something was hiding in there!','gold');}}}
function updatePiles(dt){for(let i=piles.length-1;i>=0;i--){const p=piles[i];
  if(p.gone){p.t+=dt;const s=Math.max(0,1-p.t*4);p.g.scale.set(1+p.t*2,s,1+p.t*2);if(s<=0){scene.remove(p.g);piles.splice(i,1);}continue;}
  if(!S.sea&&!inside&&Math.abs(p.x-vil.x)<0.45&&Math.abs(p.z-vil.z)<0.45){burstPile(p,false);}}}

// ---- tap yourself ----
let selfT=0;
function tapSelf(cx,cy){if(S.sea||swim.on||fishing||selfT>0)return false;const y0=villager.position.y,s=toScreen(vil.x,y0+0.5,vil.z),top=toScreen(vil.x,y0+0.9,vil.z),bot=toScreen(vil.x,y0+0.1,vil.z),h=Math.abs(bot[1]-top[1]);
  /* right on your body (its upper half and head, so taps on the ground at your feet still go to the ground) */if(Math.abs(cx-s[0])>Math.max(12,h*0.4)||cy<top[1]-h*0.2||cy>s[1]+h*0.1)return false;
  selfT=1.4;const an=villager.children[0]&&villager.children[0].userData.anim;
  if(an&&an.em&&Object.keys(an.em).length){selfT=1.8;playerEmote((S.emoteN=(S.emoteN|0)+1)%2?'spin':'flip');}else vil.hop=0.35;
  hearts(vil.x,villager.position.y+1,vil.z);[784,988,1175].forEach((f,i)=>setTimeout(()=>tone(f,0.09,'triangle',0.03),i*90));return true;}
let playReady=false;
// set up on the first frame out on the island (once it's built and you're standing on it)
function updatePlay(dt){if(!playReady){if(S.sea||inside||!islands[0]||!S.farmInit&&!S.wild)return;playReady=true;playInit();}if(selfT>0)selfT-=dt;updateBall(dt);updatePiles(dt);}
function playTap(cx,cy){if(ball&&!S.sea&&!inside){const s=toScreen(ball.x,ball.y,ball.z);const e=toScreen(ball.x+BALL_R,ball.y,ball.z),r=Math.hypot(e[0]-s[0],e[1]-s[1]);if(Math.hypot(s[0]-cx,s[1]-cy)<Math.max(18,r*1.6)){tapBall();return true;}}return tapSelf(cx,cy);}
