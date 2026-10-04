/* =========================================================
   Inside the shop and the café (buildRoom, 56-interiors, hands these kinds here): two cosy rooms, lit low and warm by
   their own lamps (room.light dims the room's daylight; warm point lights do the rest), laid out around a clear path
   from the door, with a camera that follows you close (room.cam; a wider lens on a phone held upright).
   - Hazel's General Store, a country store: honey floorboards, tall shelves of jars, tins and baskets with a ladder,
     dried herbs hanging from a beam, sacks of grain and barrels of apples, crates of fresh produce, buckets of flowers
     under the window, a rustic table of decor, hanging lanterns, and a cat asleep on a cushion by the counter. Talk to
     Hazel at the counter (deals, seeds, decor, or sell); the seed rack, the decor table and the deals sign open the
     shop at their stock.
   - The Harbour Café: walnut floor, sage panelling, beams strung with fairy lights; a butcher-block counter backed by
     shelves of mugs and jars, a pastry case and an espresso machine under brass pendants; a window seat with cushions;
     a wood stove glowing beside two armchairs and a bookshelf; little candlelit tables with steaming mugs; a chalkboard
     sign by the door. Order at the counter (cafeMenu), curl up by the stove, or read the board. Neighbours who are out
     may be sitting at the tables or by the fire.
   ========================================================= */
function staff(sp,col,shirt,outfit){const g=npcModel(sp,col,shirt,'',outfit);g.scale.setScalar(0.95);return g;}
// shared pieces
const COZY={plaster:0xe9dcc4,beam:0x5a3e2a,dark:0x4a3424,trim:0x6a4a32};
function cozyFloor(p,RW,RD,cols){const w=0.4;for(let i=0;i<Math.round(RW/w);i++){const x=-RW/2+w/2+i*w;let z=-RD/2;const R=mulberry(i*17+3);
    while(z<RD/2){const L=Math.min(RD/2-z,1.2+R()*1.6);p.push(P(BOX,cols[(i+Math.floor(z*3))%cols.length],x,-0.05,z+L/2,0,0,0,w-0.012,0.1,L-0.012));z+=L;}}}
// walls: wainscot panelling below a rail, plaster above, a beam along the top, posts at the corners
function cozyWalls(p,RW,RD,pane,paneD,plaster){const H=2.9,wy=1.0;
  for(const [x,z,w,d,ax] of [[0,-RD/2-0.05,RW+0.2,0.1,'x'],[-RW/2-0.05,0,0.1,RD+0.1,'z'],[RW/2+0.05,0,0.1,RD+0.1,'z']]){
    p.push(P(BOX,plaster,x,H/2,z,0,0,0,w,H,d),P(BOX,pane,x+(ax==='z'?(x<0?0.03:-0.03):0),wy/2,z+(ax==='x'?0.03:0),0,0,0,ax==='x'?w:0.06,wy,ax==='x'?0.06:d));
    const n=Math.round((ax==='x'?w:d)/0.6);for(let i=0;i<n;i++){const t=-((ax==='x'?w:d)/2)+0.3+i*0.6;/* raised panels */
      p.push(P(BOX,paneD,ax==='x'?x+t:x+(x<0?0.065:-0.065),wy*0.5,ax==='x'?z+0.065:z+t,0,0,0,ax==='x'?0.46:0.01,0.66,ax==='x'?0.01:0.46));}
    p.push(P(BOX,COZY.trim,x+(ax==='z'?(x<0?0.07:-0.07):0),wy,z+(ax==='x'?0.07:0),0,0,0,ax==='x'?w:0.06,0.07,ax==='x'?0.06:d),P(BOX,COZY.beam,x+(ax==='z'?(x<0?0.1:-0.1):0),H-0.1,z+(ax==='x'?0.1:0),0,0,0,ax==='x'?w:0.16,0.2,ax==='x'?0.16:d));}
  for(const sx of [-1,1])p.push(P(BOX,COZY.beam,sx*(RW/2-0.08),H/2,-RD/2+0.08,0,0,0,0.18,H,0.18));
  for(const x of [-RW/4,RW/4])p.push(P(BOX,COZY.beam,x,H/2,-RD/2+0.08,0,0,0,0.14,H,0.12));}
function cozyWindow(p,x,y,RD,w=1.3,h=1.0){const z=-RD/2+0.02;p.push(P(BOX,COZY.trim,x,y,z,0,0,0,w+0.14,h+0.14,0.06),P(BOX,COZY.trim,x,y,z+0.05,0,0,0,0.05,h,0.02),P(BOX,COZY.trim,x,y,z+0.05,0,0,0,w,0.05,0.02),P(BOX,COZY.trim,x,y-h/2-0.08,z+0.1,0,0,0,w+0.3,0.06,0.2));
  return new T.Mesh(merge([P(BOX,0xffffff,x,y,z+0.04,0,0,0,w-0.04,h-0.04,0.01)]),roomWinMat);}
function rug(p,x,z,w,d,c,b,round){if(round){p.push(P(CYL12,b,x,0.012,z,0,0,0,w,0.012,d),P(CYL12,c,x,0.02,z,0,0,0,w-0.18,0.012,d-0.18),P(CYL12,b,x,0.024,z,0,0,0,(w-0.18)*0.62,0.008,(d-0.18)*0.62));return;}
  p.push(P(BOX,b,x,0.012,z,0,0,0,w,0.012,d),P(BOX,c,x,0.02,z,0,0,0,w-0.16,0.012,d-0.16));for(let i=0;i<5;i++)p.push(P(BOX,b,x,0.026,z-d/2+0.2+i*(d-0.4)/4,0,0,0,w-0.4,0.006,0.03));
  for(let i=0;i<Math.round(w/0.08);i++)for(const s of [-1,1])p.push(P(BOX,0xe8dcc0,x-w/2+0.04+i*0.08,0.01,z+s*(d/2+0.04),0,0,0,0.02,0.006,0.08));}
function plantPot(p,x,z,s=1,pot=0xb8704a,big){p.push(P(CYL12,pot,x,0.2*s,z,0,0,0,0.38*s,0.4*s,0.38*s),P(CYL12,0x4a3424,x,0.4*s,z,0,0,0,0.33*s,0.02,0.33*s));const q=[];
  for(let i=0;i<(big?14:9);i++)lf(q,[0x4f7a44,0x5f8a4e,0x3e6a3a,0x6f9a5a][i%4],0,0.4*s,0,i*0.73,0.6+(i%3)*0.22,(big?0.7:0.42)*s,(big?0.26:0.17)*s);p.push(...shift(q,x,0,z,0));}
// string lights: a sagging line of warm bulbs between two points
function stringLights(p,gl,a,b,n=12,sag=0.25){for(let i=0;i<=n;i++){const t=i/n,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t-Math.sin(t*Math.PI)*sag,z=a[2]+(b[2]-a[2])*t;
  if(i<n){const t2=(i+1)/n,x2=a[0]+(b[0]-a[0])*t2,y2=a[1]+(b[1]-a[1])*t2-Math.sin(t2*Math.PI)*sag,z2=a[2]+(b[2]-a[2])*t2;limb3(p,0x2a2420,[x,y,z],[x2,y2,z2],0.006);}
  if(i%1===0&&i>0&&i<n)gl.push(P(SPH_XS,i%3?0xffd890:0xffc070,x,y-0.06,z,0,0,0,0.07,0.09,0.07));}}
function warmLight(g,x,y,z,c=0xffb870,i=0.7,d=5){const l=new T.PointLight(c,i,d,2);l.position.set(x,y,z);g.add(l);return l;}
// a camera close behind you, a wider lens on a tall phone, kept inside the room
function cozyCam(I,dt){const R=I.room,port=camera.aspect<0.8,hx=R.RW/2-(port?1.5:2.3),hz=R.RD/2;
  const cx=clamp(I.x,-Math.max(0,hx),Math.max(0,hx)),cz=clamp(I.z,-hz+2.1,hz-1.3);I.cx=I.cx===undefined?cx:lerp(I.cx,cx,Math.min(1,dt*3));I.cz=I.cz===undefined?cz:lerp(I.cz,cz,Math.min(1,dt*3));
  roomCam.fov=port?56:42;roomCam.position.set(I.cx,port?6.2:5.6,I.cz+(port?5.6:5.2));roomCam.lookAt(I.cx,0.7,I.cz-1.0);if(R.bg!==undefined)roomScene.background.setHex(R.bg);}
// steam: little puffs rising off cups and fading (rebuilt each frame from a few loops)
function steamFx(g,spots){const m=new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.3,depthWrite:false}),puffs=[];
  for(const [x,y,z] of spots)for(let i=0;i<3;i++){const s=new T.Mesh(SPH_LO,m.clone());s.scale.setScalar(0.06);g.add(s);puffs.push({s,x,y,z,ph:i/3+Math.random()*0.1});}
  return tt=>{for(const q of puffs){const t=(tt*0.35+q.ph)%1;q.s.position.set(q.x+Math.sin(t*6+q.ph*9)*0.03,q.y+t*0.45,q.z);q.s.scale.setScalar(0.04+t*0.07);q.s.material.opacity=0.32*Math.sin(t*Math.PI);}};}

// ---- Hazel's General Store ----
function buildShop(){const RW=6.2,RD=6.4,p=[],gl=[],g=new T.Group(),props=[{x:0,z:RD/2-0.35,w:1.1,d:0.7,label:'exit'}];
  cozyFloor(p,RW,RD,[0xb08050,0xa47446,0xba8a58,0xaa7c4c]);cozyWalls(p,RW,RD,0x6a4a30,0x5e4028,0xe8d8b8);
  rug(p,0,1.3,1.8,2.6,0x8a4a3a,0xd8b888);p.push(P(BOX,0x6a5038,0,0.02,RD/2-0.35,0,0,0,1.1,0.02,0.55),P(BOX,0x8a6a48,0,0.026,RD/2-0.35,0,0,0,0.9,0.01,0.38));
  // the back wall: two tall shelves of jars, tins, sacks and baskets; a ladder leans on one
  const shelfAt=(x)=>{const z=-RD/2+0.28,W=1.5;p.push(P(BOX,0x55361f,x,1.15,z-0.19,0,0,0,W,2.3,0.04),P(BOX,0x6a4428,x-W/2+0.03,1.15,z,0,0,0,0.06,2.3,0.42),P(BOX,0x6a4428,x+W/2-0.03,1.15,z,0,0,0,0.06,2.3,0.42),P(BOX,0x6a4428,x,2.32,z,0,0,0,W+0.06,0.06,0.46),P(BOX,0x7a5230,x,2.4,z+0.18,0,0,0,W+0.12,0.1,0.06));
    for(let i=0;i<4;i++){const y=0.22+i*0.55;p.push(P(BOX,0x7a5230,x,y,z+0.02,0,0,0,W-0.08,0.04,0.4));const R=mulberry(x*13+i*7+5);
      for(let j=0;j<6;j++){const xx=x-W/2+0.2+j*0.22,k=i===3?3:Math.floor(R()*3);
        if(k===0){const c=[0xd8a040,0xc87a4a,0xa8b070,0xe8c890][j%4];p.push(P(CYL8,0xe8eaec,xx,y+0.13,z+0.05,0,0,0,0.15,0.22,0.15),P(CYL8,c,xx,y+0.1,z+0.05,0,0,0,0.13,0.16,0.13),P(CYL8,[0xa86a4a,0xd8c8a0,0x7a8a5a][j%3],xx,y+0.25,z+0.05,0,0,0,0.16,0.04,0.16));}/* jars of honey, jam, pickles */
        else if(k===1){const c=[0x8a6a4a,0x6a7a5a,0xa85a3a,0xd8c8a0,0x5a6a7a][(i+j)%5];p.push(P(CYL8,c,xx,y+0.1,z+0.05,0,0,0,0.15,0.18,0.15),P(CYL8,0xc8c4b8,xx,y+0.195,z+0.05,0,0,0,0.15,0.012,0.15),P(BOX,0xf0e6d0,xx,y+0.1,z+0.125,0,0,0,0.1,0.07,0.004));}/* tins */
        else if(k===2){p.push(PG(SPH_LO,0xd8c09a,0xb8986a,xx,y+0.12,z+0.04,0,0,0,0.19,0.22,0.17),P(CYL8,0xb8986a,xx,y+0.24,z+0.04,0,0,0,0.08,0.04,0.08));}/* a little sack */
        else{if(j%2)continue;p.push(PG(CYL12,0xc8a062,0xa07a40,xx+0.1,y+0.11,z+0.04,0,0,0,0.36,0.2,0.3),PG(SPH_LO,[0xd84a3a,0xe8c04a,0x9a6ad0][j%3],[0xa83a2a,0xb8902a,0x6a4aa0][j%3],xx+0.1,y+0.23,z+0.04,0,0,0,0.28,0.08,0.22));}/* baskets on top */}}};
  shelfAt(-2.2);shelfAt(-0.5);
  limb3(p,0x8a5a3a,[-1.15,0.02,-RD/2+0.75],[-1.35,2.3,-RD/2+0.5],0.03);limb3(p,0x8a5a3a,[-0.85,0.02,-RD/2+0.75],[-1.05,2.3,-RD/2+0.5],0.03);for(let i=1;i<8;i++){const t=i/8;limb3(p,0x7a4a2a,[-1.15-0.2*t,0.02+2.28*t,-RD/2+0.75-0.25*t],[-0.85-0.2*t,0.02+2.28*t,-RD/2+0.75-0.25*t],0.018);}/* the ladder */
  const win=cozyWindow(p,1.75,1.65,RD,1.5,1.05);
  // flowers in buckets on a low bench under the window
  p.push(P(BOX,0x7a5230,1.75,0.3,-RD/2+0.4,0,0,0,1.7,0.06,0.45));for(const [x,z] of [[-0.62,-0.25],[0.62,-0.25]])p.push(P(BOX,0x6a4428,1.75+x,0.15,-RD/2+0.4+z+0.25,0,0,0,0.06,0.3,0.4));
  [[1.15,0xe8a0a8],[1.55,0xf2d07a],[1.95,0xf4f0e6],[2.35,0xb89ad8]].forEach(([x,c],i)=>{p.push(P(CYL12,0x8a9aa8,x,0.45,-RD/2+0.4,0,0,0,0.26,0.3,0.26));
    for(let k=0;k<7;k++){const a=k*0.9,r=0.06+(k%2)*0.04;limb3(p,0x5a7a3a,[x,0.5,-RD/2+0.4],[x+Math.cos(a)*r,0.85+(k%3)*0.06,-RD/2+0.4+Math.sin(a)*r],0.008);p.push(PG(SPH_LO,c,lerpHex(c,0x5a3a3a,0.3),x+Math.cos(a)*r,0.87+(k%3)*0.06,-RD/2+0.4+Math.sin(a)*r,0,0,0,0.1,0.08,0.1));}});
  // the counter, facing the door, Hazel behind it on a step, the window at her back
  const cz=-1.25,cx=1.55;p.push(P(BOX,0x7a5230,cx,0.48,cz,0,0,0,2.3,0.96,0.62),P(BOX,0xc8955c,cx,0.98,cz,0,0,0,2.42,0.06,0.74));for(let i=0;i<6;i++)p.push(P(BOX,0x6a4428,cx-1.0+i*0.4,0.48,cz+0.315,0,0,0,0.3,0.78,0.01));
  p.push(P(BOX,0x6a5040,cx+0.65,1.13,cz,-0.25,0,0,0.44,0.24,0.32),P(BOX,0x3a3028,cx+0.65,1.25,cz-0.07,-0.25,0,0,0.38,0.06,0.18),P(BOX,0xc8a062,cx+0.6,1.09,cz+0.13,-0.6,0,0,0.3,0.02,0.1));/* an old till */
  p.push(P(CYL12,0xc8a062,cx-0.1,1.03,cz+0.1,0,0,0,0.14,0.04,0.14),P(ICO2,0xd8b062,cx-0.1,1.07,cz+0.1,0,0,0,0.12,0.09,0.12));/* the bell */
  p.push(P(CYL8,0xeaeae6,cx-0.65,1.12,cz,0,0,0,0.2,0.26,0.2),P(CYL8,0x8a6a4a,cx-0.65,1.27,cz,0,0,0,0.21,0.04,0.21));for(let i=0;i<9;i++)p.push(P(ICO,[0xe8a0a8,0xf2d07a,0xa8c8e8,0xb8d890][i%4],cx-0.65+(Math.sin(i*2.1))*0.05,1.04+i*0.02,cz+(Math.cos(i*2.1))*0.05,0,0,0,0.045,0.045,0.045));/* a jar of sweets */
  p.push(P(BOX,0xd8c098,cx+0.18,1.06,cz-0.12,0,0.2,0,0.32,0.12,0.24));/* paper bags */
  p.push(P(BOX,0x5e4028,cx,0.2,cz-0.62,0,0,0,1.6,0.4,0.55));const keeper=staff('otter',0xa8784e,0x6a8a5a,'apron');keeper.position.set(cx,0.4,cz-0.62);keeper.scale.setScalar(1.08);g.add(keeper);
  // the cat, asleep on a cushion by the counter
  const cat=new T.Group();cat.add(M([PG(CYL12,0xb85a4a,0x8a3a2a,0,0.05,0,0,0,0.6,0.1,0.5),PG(SPH_LO,0xe89a5a,0xc87a3a,0,0.18,0,0,0,0.42,0.2,0.32),PG(SPH_LO,0xe89a5a,0xc87a3a,0.16,0.21,0.06,0,0,0,0.2,0.16,0.18),
    P(CONE4,0xe89a5a,0.13,0.31,0.03,0,0,0.2,0.06,0.08,0.05),P(CONE4,0xe89a5a,0.22,0.3,0.1,0,0,-0.2,0.06,0.08,0.05),P(BOX,0x3a2a24,0.22,0.22,0.15,0,0,0,0.05,0.008,0.004),P(BOX,0x3a2a24,0.14,0.22,0.15,0,0,0,0.05,0.008,0.004),
    PG(SPH_LO,0xe89a5a,0xc87a3a,-0.12,0.13,0.17,0,0.6,0,0.3,0.08,0.08)]));cat.position.set(cx-1.45,0,cz+0.55);cat.rotation.y=0.6;g.add(cat);
  // the left wall: the seed rack, sacks of grain, a barrel of apples; dried herbs hanging from a beam above
  const sx=-RW/2+0.3;p.push(P(BOX,0x6a4428,sx,0.85,-0.4,0,0,0,0.12,1.7,1.0));for(let i=0;i<5;i++)for(let j=0;j<4;j++){const c=[0xd89a8a,0xe8c87a,0x9ab88a,0xc8a8d8,0xe8a870,0x8ab8c8][(i*4+j)%6];
    p.push(P(BOX,c,sx+0.07,0.42+i*0.27,-0.75+j*0.23,0,1.571,0.1,0.17,0.22,0.02),P(BOX,0xfaf2e2,sx+0.083,0.45+i*0.27,-0.75+j*0.23,0,1.571,0.1,0.11,0.09,0.004));}
  p.push(P(BOX,0xf2e6cc,sx+0.08,1.82,-0.4,0,1.571,0,0.8,0.18,0.02),P(BOX,0x6a8a5a,sx+0.09,1.82,-0.4,0,1.571,0,0.55,0.05,0.005));
  {const o=new T.Group();produceDisplay(o,'psack',mulberry(11),'wheat|normal');o.position.set(-RW/2+0.45,0,0.75);o.scale.setScalar(0.9);g.add(o);}
  {const o=new T.Group();produceDisplay(o,'psack',mulberry(12),'corn|normal');o.position.set(-RW/2+0.5,0,1.4);o.rotation.y=0.4;o.scale.setScalar(0.85);g.add(o);}
  {const bx=-RW/2+0.5,bz=2.2;p.push(PG(CYL12,0x8a5a34,0x6a4428,bx,0.32,bz,0,0,0,0.6,0.64,0.6));for(const y of [0.1,0.55])p.push(P(CYL12,0x4a4a4a,bx,y,bz,0,0,0,0.62,0.04,0.62));
    for(let i=0;i<9;i++){const a=i*0.75,r=i?0.16:0;p.push(PG(SPH_LO,0xd8453a,0x8a1e22,bx+Math.cos(a)*r,0.68+(i?0:0.05),bz+Math.sin(a)*r,0,0,0,0.13,0.12,0.13));}}
  limb3(p,COZY.beam,[-RW/2+0.1,2.35,-1.3],[-RW/2+0.1,2.35,1.8],0.05);for(let i=0;i<7;i++){const z=-1.1+i*0.45,c=[0x8a9a5a,0x9a8a5a,0x7a8a6a,0xa89a6a][i%4];
    limb3(p,0xb8a888,[-RW/2+0.12,2.32,z],[-RW/2+0.14,2.0,z],0.006);p.push(PG(CONE5,c,lerpHex(c,0x4a3a2a,0.3),-RW/2+0.14,1.88,z,Math.PI,0,0,0.12,0.3,0.12),P(CYL5,0xb84a3a,-RW/2+0.14,2.02,z,0,0,0,0.05,0.03,0.05));}/* bundles of dried herbs */
  // the decor table, with a "deals" sign, and the produce stand by the door
  {const tx=-1.15,tz=0.5;p.push(P(BOX,0x8a5a34,tx,0.62,tz,0,0,0,1.4,0.07,0.85),P(BOX,0xe8dcc0,tx,0.66,tz,0,0,0,1.0,0.01,0.85));for(const [x,z] of [[-0.62,-0.36],[0.62,-0.36],[-0.62,0.36],[0.62,0.36]])p.push(P(BOX,0x6a4428,tx+x,0.3,tz+z,0,0,0,0.08,0.6,0.08));
    for(const [k,x,z,s] of [['lantern',-0.45,-0.12,0.42],['flowerpot',0.05,0.12,0.5],['gnome',0.45,-0.08,0.5]]){const o=objGroup(k,3,0.3);o.scale.setScalar(s);o.position.set(tx+x,0.66,tz+z);g.add(o);}
    p.push(P(CYL8,0xf4ead8,tx-0.15,0.72,tz+0.3,0,0,0,0.08,0.1,0.08));gl.push(P(CONE4,0xffd070,tx-0.15,0.8,tz+0.3,0,0,0,0.03,0.06,0.03));}
  {const ax=-0.55,az=2.2;/* the chalk A-frame: today's deals */for(const s of [-1,1])p.push(P(BOX,0xa87848,ax,0.5,az+s*0.12,-s*0.24,0,0,0.6,0.95,0.04),P(BOX,0x3e4a44,ax,0.52,az+s*0.142,-s*0.24,0,0,0.5,0.78,0.012));
    for(let i=0;i<4;i++)p.push(P(BOX,[0xf2e8d8,0xe8b8a0,0xf2e8d8,0xc8d8b0][i],ax-0.04+(i%2)*0.05,0.78-i*0.15,az+0.17+i*0.037,-0.24,0,0,0.36-(i%2)*0.1,0.045,0.006));p.push(P(BOX,0xe8604a,ax,0.86,az+0.15,-0.24,0,0,0.2,0.05,0.006));}
  {let i=0;for(const [k,f] of [['pcrate','g:apple'],['pbasket','g:berries'],['pcrate','pumpkin|normal'],['pbasket','g:mushroom']]){const o=new T.Group();produceDisplay(o,k,mulberry(5+i),f);o.scale.setScalar(0.8);o.position.set(1.2+(i%2)*0.72,0,1.25+Math.floor(i/2)*0.72);o.rotation.y=-0.2;g.add(o);i++;}}
  plantPot(p,RW/2-0.4,RD/2-0.5,1.2,0x9a6a4a,true);plantPot(p,-RW/2+0.4,-RD/2+0.5+1.0,0.8,0xb8704a);
  // hanging lanterns, the room's warm light
  const lamps=[];for(const [x,z] of [[-1.3,-0.4],[1.55,-0.6],[0.3,1.6]]){limb3(p,0x2a2420,[x,2.9,z],[x,2.15,z],0.01);p.push(P(CYL8,0x3a3028,x,2.12,z,0,0,0,0.26,0.05,0.26),P(CYL8,0x3a3028,x,1.82,z,0,0,0,0.22,0.04,0.22));
    for(let k=0;k<4;k++){const a=k*1.571+0.785;p.push(P(BOX,0x3a3028,x+Math.cos(a)*0.1,1.97,z+Math.sin(a)*0.1,0,0,0,0.02,0.3,0.02));}gl.push(P(CYL8,0xffd890,x,1.97,z,0,0,0,0.17,0.26,0.17));lamps.push(warmLight(g,x,1.85,z,0xffb468,0.85,5.5));}
  stringLights(p,gl,[-RW/2+0.2,2.6,-RD/2+0.15],[RW/2-0.2,2.6,-RD/2+0.15],18,0.18);
  const counterUse=()=>setAction(`<b>Hazel</b>: “${pickR(['Welcome in, love! Anything catch your eye?','Kettle’s on. Have a browse.','Fresh deals on the board today!'])}”`,[{label:'Today’s deals',cls:'go',fn:()=>{clearAction();openSheet('shop','deals');}},{label:'Seeds',cls:'go',fn:()=>{clearAction();openSheet('shop','seeds');}},{label:'Decor',cls:'go',fn:()=>{clearAction();openSheet('shop','decor');}},
    {label:'Sell',cls:'go',fn:()=>{clearAction();openSheet('bag','all','trader');}},{label:'Bye!',fn:clearAction}],'General Store');
  props.push({x:cx,z:cz,w:2.4,d:0.8,label:'counter',info:()=>{tone(1568,0.12,'sine',0.03);counterUse();}},
    {x:-RW/2+0.3,z:-0.4,w:0.5,d:1.1,label:'seeds',info:()=>openSheet('shop','seeds')},{x:-1.15,z:0.5,w:1.4,d:0.9,label:'decor',info:()=>openSheet('shop','decor')},{x:-0.55,z:2.2,w:0.6,d:0.4,label:'deals',info:()=>openSheet('shop','deals')},
    {x:-1.35,z:-RD/2+0.3,w:3.4,d:0.5,label:'shelves',info:()=>toast(pickR(['Jars of honey, damson jam and pickled radish.','Tins of everything. One just says “Mystery”.','Hazel’s own blackberry jam. The label says so.']))},
    {x:cx-1.45,z:cz+0.55,w:0.6,d:0.5,label:'cat',info:()=>{hearts(vil.x,1,vil.z);toast('Biscuit the cat opens one eye, purrs, and goes back to sleep.');}},
    {x:1.55,z:1.6,w:1.6,d:1.4,label:'produce',info:()=>toast('Fresh from around the island.')},{x:1.75,z:-RD/2+0.4,w:1.7,d:0.5,label:'flowers',info:()=>toast('Buckets of cut flowers, still wet from the garden.')});
  g.add(M(p));if(gl.length){const m=M(gl,glowMat);m.castShadow=false;g.add(m);}g.add(win);
  return{g,props,RW,RD,title:'The General Store',cam:cozyCam,bg:0x1c1410,light:[0.36,0.16,0xffe2c0,0x4a3424],
    tick:(dt,tt)=>{keeper.position.y=0.4+Math.abs(Math.sin(tt*1.6))*0.012;keeper.rotation.y=Math.sin(tt*0.4)*0.25;cat.scale.y=1+Math.sin(tt*1.7)*0.03;
      lamps.forEach((l,i)=>l.intensity=0.85+Math.sin(tt*3.1+i*2)*0.03);}};}

// ---- the Harbour Café ----
function buildCafe(){const RW=6.2,RD=6.4,p=[],gl=[],g=new T.Group(),props=[{x:0,z:RD/2-0.35,w:1.1,d:0.7,label:'exit'}];
  cozyFloor(p,RW,RD,[0x7e5234,0x6e4a2e,0x8a5a3a,0x744c30]);cozyWalls(p,RW,RD,0x6f7f62,0x62725a,0xeadcc4);
  rug(p,0.3,0.9,2.2,1.7,0x9a5a44,0xe2cfa8);p.push(P(BOX,0x5a4030,0,0.02,RD/2-0.35,0,0,0,1.1,0.02,0.55),P(BOX,0x7a5a40,0,0.026,RD/2-0.35,0,0,0,0.9,0.01,0.38));
  // the counter along the back, butcher-block top, panelled front; shelves of mugs and jars behind
  const cz=-1.9,cx=1.25,W=3.0;p.push(P(BOX,0x5e4028,cx,0.48,cz,0,0,0,W,0.96,0.62),P(BOX,0xc89a64,cx,0.98,cz,0,0,0,W+0.1,0.07,0.72));
  for(let i=0;i<7;i++)p.push(P(BOX,0x6a4a30,cx-W/2+0.25+i*0.42,0.48,cz+0.315,0,0,0,0.34,0.74,0.01),P(BOX,0x55381f,cx-W/2+0.25+i*0.42,0.48,cz+0.32,0,0,0,0.26,0.62,0.006));
  for(const y of [1.55,2.05]){p.push(P(BOX,0x6a4428,cx,y,-RD/2+0.2,0,0,0,W,0.05,0.3));for(const x of [-W/2+0.15,W/2-0.15])p.push(P(BOX,0x3a3028,cx+x,y-0.1,-RD/2+0.12,0,0,0,0.04,0.2,0.12));
    for(let j=0;j<9;j++){const x=cx-W/2+0.25+j*0.32,k=(j+(y>2?1:0))%3;
      if(k===0)p.push(P(CYL12,[0xeadcc4,0x8a9a7a,0xc8806a,0xd8c8a8][j%4],x,y+0.08,-RD/2+0.22,0,0,0,0.13,0.13,0.13),P(BOX,[0xeadcc4,0x8a9a7a,0xc8806a][j%3],x+0.08,y+0.08,-RD/2+0.22,0,0,0,0.03,0.07,0.02));/* mugs */
      else if(k===1)p.push(P(CYL8,0xe8eaec,x,y+0.13,-RD/2+0.22,0,0,0,0.16,0.24,0.16),P(CYL8,0x5a3a24,x,y+0.1,-RD/2+0.22,0,0,0,0.14,0.18,0.14),P(CYL8,0xb8986a,x,y+0.27,-RD/2+0.22,0,0,0,0.17,0.04,0.17));/* jars of beans */
      else{const q=[];for(let i=0;i<6;i++)lf(q,[0x4f7a44,0x5f8a4e][i%2],0,0.08,0,i*1.05,-0.6-(i%2)*0.5,0.3,0.1);p.push(P(CYL8,0xb8704a,x,y+0.06,-RD/2+0.22,0,0,0,0.14,0.12,0.14),...shift(q,x,y,-RD/2+0.22,0));}/* trailing plants */}}
  // the espresso machine (copper and cream), a grinder, a pastry case with a warm light inside
  {const ex=cx+1.0;p.push(P(BOX,0xe8dcc4,ex,1.3,cz-0.1,0,0,0,0.62,0.56,0.4),P(BOX,0xb8784a,ex,1.6,cz-0.1,0,0,0,0.66,0.05,0.44),P(CYL8,0xb8784a,ex,1.66,cz-0.1,0,0,0,0.12,0.06,0.12),P(BOX,0xb8784a,ex,1.15,cz+0.12,0,0,0,0.5,0.04,0.12));
    for(const s of [-1,1])p.push(P(CYL8,0x3a3028,ex+s*0.14,1.08,cz+0.14,0,0,0,0.07,0.1,0.07),P(CYL12,0xf2ead8,ex+s*0.14,1.06,cz+0.18,0,0,0,0.1,0.07,0.1));gl.push(P(SPH_XS,0xffb070,ex-0.2,1.45,cz+0.11,0,0,0,0.04,0.04,0.02));
    p.push(P(CYL8,0x3a3028,ex-0.55,1.2,cz-0.05,0,0,0,0.16,0.36,0.16),P(CONE5,0xe8dcc4,ex-0.55,1.45,cz-0.05,Math.PI,0,0,0.2,0.16,0.2));}
  {const px=cx-0.9;p.push(P(BOX,0x5e4028,px,1.03,cz,0,0,0,1.0,0.04,0.56),P(BOX,0x5e4028,px,1.55,cz,0,0,0,1.0,0.04,0.56));for(const s of [-1,1])p.push(P(BOX,0x5e4028,px+s*0.48,1.29,cz,0,0,0,0.04,0.52,0.56));
    gl.push(P(BOX,0xc89a68,px,1.29,cz+0.27,0,0,0,0.92,0.48,0.01));
    for(let s=0;s<2;s++)for(let i=0;i<4;i++){const x=px-0.33+i*0.22,y=1.06+s*0.24,k=(i+s)%3;
      if(k===0)p.push(PG(SPH_LO,0xe8b070,0xb87a3a,x,y+0.05,cz,0,0,0,0.15,0.09,0.13),P(SPH_XS,0xf4ead8,x,y+0.09,cz,0,0,0,0.08,0.02,0.07));
      else if(k===1)p.push(PG(SPH_LO,0xe8b870,0xb8783a,x,y+0.04,cz,0,0,0.4,0.17,0.07,0.08));
      else p.push(P(CYL12,0xd8a868,x,y+0.03,cz,0,0,0,0.14,0.05,0.14),P(CYL12,[0x9a3a3a,0x6a4a7a][s],x,y+0.06,cz,0,0,0,0.11,0.02,0.11));}}
  p.push(P(BOX,0x5e4028,cx,0.2,cz-0.62,0,0,0,W-0.6,0.4,0.55));const barista=staff('cat',0xd8a878,0x6a7a5a,'apron');barista.position.set(cx,0.4,cz-0.62);barista.scale.setScalar(1.08);g.add(barista);
  // brass pendants over the counter, the main warm light
  const lights=[];for(const x of [cx-1.0,cx+0.1,cx+1.1]){limb3(p,0x2a2420,[x,2.9,cz+0.1],[x,2.2,cz+0.1],0.01);p.push(PG(CONE12,0xb8945a,0x8a6a3a,x,2.12,cz+0.1,0,0,0,0.36,0.2,0.36));gl.push(P(SPH_LO,0xffe0a8,x,2.0,cz+0.1,0,0,0,0.14,0.1,0.14));}
  lights.push(warmLight(g,cx,1.95,cz+0.4,0xffb468,0.9,6));
  // the window seat on the back left: a window, a cushioned bench, pillows, a lamp, a little table
  const win=cozyWindow(p,-1.7,1.7,RD,1.6,1.05);
  {const bx=-1.7,bz=-RD/2+0.35;p.push(P(BOX,0x6a4a30,bx,0.22,bz,0,0,0,1.9,0.44,0.6),P(BOX,0xc8a8a0,bx,0.5,bz,0,0,0,1.84,0.12,0.56));
    for(const [x,c] of [[-0.6,0xe8d8c0],[-0.2,0xa8b890],[0.55,0xd8a888]])p.push(PG(SPH_LO,c,lerpHex(c,0x5a4030,0.25),bx+x,0.68,bz-0.12,0.35,0,0,0.38,0.3,0.14));
    p.push(P(BOX,0xa8b0a0,bx+0.2,0.57,bz+0.05,0,0.3,0,0.6,0.03,0.4));/* a folded blanket */
    p.push(P(CYL12,0x6a4428,bx,0.5,bz+0.95,0,0,0,0.6,0.04,0.6),P(CYL8,0x4a3424,bx,0.25,bz+0.95,0,0,0,0.06,0.5,0.06),P(CYL12,0x4a3424,bx,0.02,bz+0.95,0,0,0,0.3,0.03,0.3));
    p.push(P(CYL12,0xeadcc4,bx+0.12,0.57,bz+0.9,0,0,0,0.12,0.1,0.12),P(CYL12,0x5a3a24,bx+0.12,0.615,bz+0.9,0,0,0,0.1,0.01,0.1),P(BOX,0x8a5a4a,bx-0.15,0.54,bz+1.02,0,0.4,0,0.22,0.04,0.16),P(BOX,0x6a7a5a,bx-0.15,0.58,bz+1.02,0,0.5,0,0.2,0.04,0.15));
    p.push(P(CYL8,0xf4ead8,bx-0.05,0.58,bz+0.8,0,0,0,0.06,0.1,0.06));gl.push(P(CONE4,0xffd070,bx-0.05,0.66,bz+0.8,0,0,0,0.025,0.05,0.025));}
  // the wood stove on the right wall, logs stacked beside it, two armchairs with blankets, a side table, a bookshelf
  const sx=RW/2-0.45,sz=0.2;p.push(P(BOX,0x8a7a6a,sx+0.1,0.03,sz,0,0,0,1.0,0.06,1.1),P(CYL12,0x2a2624,sx,0.4,sz,0,0,0,0.56,0.6,0.56),P(CYL12,0x3a3430,sx,0.72,sz,0,0,0,0.6,0.05,0.6),P(CYL8,0x2a2624,sx+0.05,1.8,sz,0,0,0,0.12,2.1,0.12));
  for(const [x,z] of [[-0.18,-0.18],[0.18,-0.18],[-0.18,0.18],[0.18,0.18]])p.push(P(CYL5,0x2a2624,sx+x,0.07,sz+z,0,0,0,0.05,0.14,0.05));
  gl.push(P(BOX,0xff8a3a,sx-0.28,0.42,sz,0,0,0,0.02,0.22,0.26),P(BOX,0xffc060,sx-0.285,0.38,sz,0,0,0,0.01,0.1,0.16));
  for(let i=0;i<7;i++){const y=0.08+Math.floor(i/3)*0.14,z=sz+0.75+(i%3)*0.14-(i>=6?0.05:0);p.push(P(CYL8,0x8a5a34,sx+0.05,y,z,1.571,0,0,0.13,0.5,0.13),P(CYL8,0xd8b080,sx-0.2,y,z,1.571,0,0,0.11,0.01,0.11));}
  const fire=warmLight(g,sx-0.5,0.55,sz,0xff8a3a,1.1,5);lights.push(fire);
  rug(p,sx-1.3,sz,1.8,2.0,0x7a5a4a,0xc8a888,true);
  const chairs=[[sx-1.25,sz-0.65,0.5],[sx-1.25,sz+0.75,-0.5+Math.PI]];for(const [x,z,ry] of chairs){const f=furn('armchair',0xb88a4a);p.push(...shift(f.p,x,0,z,ry+Math.PI/2));p.push(...shift([P(BOX,0x8a9a7a,0.15,0.45,0.05,0,0,0.3,0.4,0.03,0.6)],x,0,z,ry+Math.PI/2));}
  p.push(P(CYL12,0x6a4428,sx-1.15,0.45,sz+0.05,0,0,0,0.4,0.04,0.4),P(CYL8,0x4a3424,sx-1.15,0.22,sz+0.05,0,0,0,0.05,0.44,0.05),P(CYL8,0xf4ead8,sx-1.15,0.53,sz+0.05,0,0,0,0.07,0.12,0.07));gl.push(P(CONE4,0xffd070,sx-1.15,0.63,sz+0.05,0,0,0,0.025,0.05,0.025));
  {const bx=RW/2-0.25,bz=-1.25,books=[0x8a4a3a,0x5a6a4a,0xc8a868,0x4a5a6a,0x9a7a5a,0x7a5a6a];p.push(P(BOX,0x5e4028,bx,0.9,bz,0,0,0,0.36,1.8,1.0));
    for(let i=0;i<3;i++){const y=0.3+i*0.55;p.push(P(BOX,0x6a4428,bx-0.02,y,bz,0,0,0,0.34,0.03,0.94));for(let j=0;j<8;j++){const h=0.3+((i+j)%3)*0.05;p.push(P(BOX,books[(i*3+j)%6],bx-0.03,y+h/2+0.015,bz-0.4+j*0.11,0,0,(j%5===4?0.25:0),0.26,h,0.09));}}
    plantPot(p,bx-0.05,bz,0.45);}
  // little tables, candles and mugs, the chairs round them
  const seats=[],cups=[];
  for(const [x,z] of [[-1.55,0.55],[-0.35,1.85],[-1.75,2.1]]){p.push(P(CYL12,0x8a5a3a,x,0.7,z,0,0,0,0.72,0.05,0.72),P(CYL8,0x4a3424,x,0.35,z,0,0,0,0.07,0.7,0.07),P(CYL12,0x4a3424,x,0.02,z,0,0,0,0.38,0.04,0.38));
    p.push(P(CYL12,0xeadcc4,x+0.15,0.76,z+0.05,0,0,0,0.12,0.09,0.12),P(CYL12,0x5a3a24,x+0.15,0.805,z+0.05,0,0,0,0.1,0.01,0.1),P(CYL8,0xd8e0e0,x-0.12,0.78,z-0.08,0,0,0,0.1,0.12,0.1),P(CYL8,0xf4ead8,x-0.12,0.78,z-0.08,0,0,0,0.06,0.1,0.06));
    gl.push(P(CONE4,0xffd070,x-0.12,0.87,z-0.08,0,0,0,0.025,0.05,0.025));cups.push([x+0.15,0.82,z+0.05]);
    for(const s of [-1,1]){const chx=x+s*0.6,f=furn('chair',0x7a5a3a);p.push(...shift(f.p,chx,0,z,s>0?-1.571:1.571));seats.push([chx,z,s>0?-1.571:1.571]);}}
  cups.push([cx+0.86,1.12,cz+0.18],[-1.58,0.63,-RD/2+1.25]);
  lights.push(warmLight(g,-1.6,1.2,1.2,0xffc080,0.55,4.5));
  // the chalkboard sign by the door, plants in the corners, fairy lights along the beams
  {const ax=1.0,az=2.3;for(const s of [-1,1])p.push(P(BOX,0x5e4028,ax,0.5,az+s*0.12,s*0.24,0,0,0.62,0.95,0.04),P(BOX,0x2e3430,ax,0.52,az+s*0.135,s*0.24,0,0,0.52,0.75,0.01));
    for(let i=0;i<5;i++)p.push(P(BOX,[0xf2e8d8,0xe8c8a0,0xf2e8d8,0xc8d8b0,0xe8b8b0][i],ax-0.04+(i%2)*0.05,0.8-i*0.12,az+0.17+i*0.03,-0.24,0,0,0.36-(i%2)*0.1,0.04,0.006));}
  plantPot(p,-RW/2+0.4,-0.6,1.15,0xb8704a,true);plantPot(p,RW/2-0.45,RD/2-0.5,1.0,0x9a7a5a,true);
  stringLights(p,gl,[-RW/2+0.2,2.65,-RD/2+0.15],[RW/2-0.2,2.65,-RD/2+0.15],20,0.2);stringLights(p,gl,[-RW/2+0.15,2.65,-RD/2+0.2],[-RW/2+0.15,2.6,RD/2-0.4],14,0.2);
  const steam=steamFx(g,cups);
  // neighbours who are out and about may be here: at a table, or curled up by the fire
  const out=npcs.filter(n=>n.state!=='home'),sat=[],spots=[...chairs.map(([x,z,ry])=>[x,z,ry-Math.PI/2+Math.PI]),...seats];
  for(let i=0;i<Math.min(3,out.length);i++){const n=out[(S.day+i*3)%out.length];if(sat.includes(n))continue;sat.push(n);const s=spots[(i*2+(S.day%2))%spots.length],w=n.g.clone(true);
    w.visible=true;w.position.set(s[0],0.14,s[1]);w.rotation.y=s[2];w.scale.setScalar(0.82);g.add(w);
    props.push({x:s[0],z:s[1],w:0.6,d:0.6,label:'friend',info:()=>showTalk(n,pickR(['Fancy meeting you here! Pull up a chair.','I come here every afternoon. Don’t tell anyone.','Best spot on the island, right by the fire.','The cinnamon buns are still warm. Just saying.']))});}
  props.push({x:cx,z:cz,w:W+0.1,d:0.8,label:'counter',info:()=>{tone(1320,0.1,'sine',0.03);cafeMenu();}},{x:1.0,z:2.3,w:0.65,d:0.4,label:'menu',info:()=>toast(CAFE.map(c=>`${c.name} · ${c.cost} shells`).join(' · '))},
    {x:sx-1.2,z:sz,w:1.6,d:1.9,label:'fire',info:()=>{hearts(vil.x,1,vil.z);toast(pickR(['You curl up by the stove. The fire pops and crackles.','Warm hands, warm mug, warm heart.','You could stay here all afternoon.']));}},
    {x:-1.7,z:-RD/2+0.4,w:1.9,d:0.7,label:'window seat',info:()=>{hearts(vil.x,1,vil.z);toast('You sink into the cushions and watch the boats in the harbour.');}},
    {x:RW/2-0.25,z:-1.25,w:0.5,d:1.0,label:'books',info:()=>toast(pickR(['“A Field Guide to Island Moths.” Well-thumbed.','A book of sea shanties, with doodles in the margins.','“Baking by Lamplight.” Someone has dog-eared the cinnamon buns.']))});
  for(const [x,z] of [[-1.55,0.55],[-0.35,1.85],[-1.75,2.1]])props.push({x,z,w:0.8,d:0.8,label:'table',info:()=>{hearts(vil.x,1,vil.z);toast(pickR(['You sit a while with a warm mug.','The candle flickers. The coffee is perfect.','Someone’s left half a croissant. You resist. Mostly.']));}});
  g.add(M(p));if(gl.length){const m=M(gl,glowMat);m.castShadow=false;g.add(m);}g.add(win);
  return{g,props,RW,RD,title:'The Harbour Café',cam:cozyCam,bg:0x1a120e,light:[0.3,0.12,0xffdcb8,0x3a2a20],
    tick:(dt,tt)=>{barista.position.x=cx+Math.sin(tt*0.45)*0.7;barista.rotation.y=Math.cos(tt*0.45)>0?0.35:-0.35;steam(tt);
      fire.intensity=1.0+Math.sin(tt*7)*0.08+Math.sin(tt*13.3)*0.06;lights[2].intensity=0.55+Math.sin(tt*5.3)*0.04;}};}
