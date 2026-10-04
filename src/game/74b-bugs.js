/* =========================================================
   Bugs, modelled from life (bugGroup). Every species is drawn from its BUGS entry (colours col/dk, kind, name) as one of
   a handful of real body plans:
   - butterflies: a slim furry body, clubbed antennae, and four painted wings (one canvas per species, bugWingTex: the
     fore- and hindwing of one side, veined, with that species' margins, spots, eyespots, tips or tails; the other side
     is the same picture mirrored); moths get a fat furry body, feathery antennae and swept-back wings; skippers a stout
     body; a bee a fuzzy striped body and glassy wings; a firefly a beetle's body with a lamp for a tail
   - dragonflies, damselflies, mayflies: big eyes, a long segmented abdomen and two pairs of glassy, netted wings
   - crawlers: beetles (head, pronotum, split wing cases, jointed legs, antennae; a stag's jaws, a rhino's horn, a
     longhorn's antennae, a weevil's snout, a ladybird's spots), and their own plans for ants, a snail, a caterpillar, a
     pill bug, grasshoppers and crickets, a mantis, a walking leaf, a glowworm, scorpions and a snow flea.
   The API is unchanged: a flyer's wings are userData.wl / wr (flapped about the body's long axis, +z forward), a
   dragonfly's also .drag, a crawler's .crawl.
   ========================================================= */
const BUG_TEX={};
const hexS=c=>typeof c==='string'?parseInt(c.slice(1),16):c;
const cssOf=(c,a=1)=>{const n=hexS(c);return`rgba(${n>>16&255},${n>>8&255},${n&255},${a})`;};
const mixC=(a,b,t)=>lerpHex(hexS(a),hexS(b),t);
// a limb from a to b, radius r (a cylinder stood on the line between them)
const _ly=new T.Vector3(0,1,0),_ld=new T.Vector3(),_lq=new T.Quaternion(),_le=new T.Euler();
function limb3(p,col,a,b,r){_ld.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]);const L=_ld.length()||1e-4;_ld.multiplyScalar(1/L);_lq.setFromUnitVectors(_ly,_ld);_le.setFromQuaternion(_lq,'YXZ');
  p.push(P(CYL5,col,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,_le.x,_le.y,_le.z,r*2,L,r*2));}
// six legs: each a thigh out and up from the body's side, then a shin down to the ground
function sixLegs(p,col,bw,y0,zs,reach,r=0.006){zs.forEach((z,i)=>{for(const sd of [-1,1]){const fw=i===0?1:i===2?-1:0,kx=sd*(bw+reach*0.45),ky=y0+reach*0.25,kz=z+fw*reach*0.25;
  limb3(p,col,[sd*bw*0.7,y0,z],[kx,ky,kz],r);limb3(p,col,[kx,ky,kz],[sd*(bw+reach*0.85),0.004,z+fw*reach*0.6],r*0.8);}});}
function antennae(p,col,base,len,spread,lift,r=0.0035,club=0){for(const sd of [-1,1]){const a=[sd*0.008+base[0],base[1],base[2]],m=[a[0]+sd*spread*0.5,a[1]+lift*0.6,a[2]+len*0.55],b=[a[0]+sd*spread,a[1]+lift,a[2]+len];
  limb3(p,col,a,m,r);limb3(p,col,m,b,r*0.9);if(club)p.push(P(SPH_XS,col,b[0],b[1],b[2],0,0,0,club,club,club*1.4));}}

// ---- wing pictures ----
// one side's wings on a 128² canvas: hinge down the left edge, the front of the animal at the top
function bugWingTex(B,plan){const key=B.name+plan;if(BUG_TEX[key])return BUG_TEX[key];const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),R=mulberry(hi(B.name.length,B.price|0,7)),N=B.name;
  const col=cssOf(B.col),dk=cssOf(B.dk),wingPath=(fore)=>{x.beginPath();
    if(plan==='moth'){if(fore){x.moveTo(1,40);x.quadraticCurveTo(40,2,124,30);x.quadraticCurveTo(122,52,100,66);x.lineTo(1,58);}else{x.moveTo(1,56);x.bezierCurveTo(60,54,92,70,80,92);x.quadraticCurveTo(50,108,14,96);x.quadraticCurveTo(2,84,1,62);}}
    else if(plan==='drag'){if(fore){x.moveTo(1,44);x.quadraticCurveTo(60,30,126,40);x.quadraticCurveTo(128,48,120,52);x.quadraticCurveTo(60,58,1,54);}else{x.moveTo(1,60);x.quadraticCurveTo(60,58,122,70);x.quadraticCurveTo(126,78,116,82);x.quadraticCurveTo(50,84,1,72);}}
    else if(plan==='bee'){if(fore){x.moveTo(1,48);x.quadraticCurveTo(50,30,110,42);x.quadraticCurveTo(116,54,100,60);x.lineTo(1,58);}else{x.moveTo(1,60);x.quadraticCurveTo(50,60,80,72);x.quadraticCurveTo(70,84,1,72);}}
    else{const tail=/Swallowtail|Birdwing|Luna|Comma/.test(N);
      if(fore){x.moveTo(1,56);x.quadraticCurveTo(26,2,112,6);x.quadraticCurveTo(126,32,94,62);x.lineTo(1,64);}
      else{x.moveTo(1,62);x.bezierCurveTo(70,56,112,78,94,104);if(tail&&!/Comma/.test(N)){x.quadraticCurveTo(84,110,82,126);x.quadraticCurveTo(70,124,66,114);}x.quadraticCurveTo(46,124,18,112);x.quadraticCurveTo(2,96,1,68);}}};
  const glassy=plan==='drag'||plan==='bee'||/Glasswing/.test(N);
  for(const fore of [false,true]){x.save();wingPath(fore);x.clip();
    // ground colour: darker at the root, the species' colour across the wing
    const g=x.createLinearGradient(0,0,128,0);
    if(glassy){g.addColorStop(0,'rgba(220,235,245,0.55)');g.addColorStop(1,'rgba(235,245,255,0.35)');}else{g.addColorStop(0,cssOf(mixC(B.col,B.dk,0.45)));g.addColorStop(0.35,col);g.addColorStop(1,col);}
    x.fillStyle=g;x.fillRect(0,0,128,128);
    if(plan==='drag'||plan==='bee'){x.strokeStyle='rgba(40,40,50,0.45)';x.lineWidth=0.8;for(let i=0;i<7;i++){x.beginPath();x.moveTo(0,fore?46+i*1.4:62+i*1.6);x.lineTo(124,fore?40+i*2:68+i*2);x.stroke();}
      for(let i=1;i<14;i++){x.beginPath();x.moveTo(i*9,0);x.lineTo(i*9+3,128);x.stroke();}
      if(plan==='drag'){x.fillStyle=dk;x.fillRect(fore?104:100,fore?40:68,8,5);}/* the pterostigma */
      if(plan==='drag'&&!/Mayfly/.test(N)){x.fillStyle=cssOf(B.col,0.25);x.fillRect(0,0,18,128);}x.restore();continue;}
    // patterns, by species
    const dot=(cx,cy,r,c)=>{x.fillStyle=c;x.beginPath();x.arc(cx,cy,r,0,6.283);x.fill();};
    const eye=(cx,cy,r)=>{dot(cx,cy,r,'#f6d04a');dot(cx,cy,r*0.75,'#2b1e2e');dot(cx,cy,r*0.5,'#4a6ad8');dot(cx-r*0.2,cy-r*0.2,r*0.18,'#ffffff');};
    if(/Monarch/.test(N)){x.strokeStyle='#1e1416';x.lineWidth=3.2;for(let i=0;i<7;i++){x.beginPath();x.moveTo(2,fore?60:66);x.quadraticCurveTo(50,fore?40+i*3:70+i*4,fore?60+i*9:30+i*10,fore?8+i*8:100+i*2);x.stroke();}}
    else if(/Swallowtail/.test(N)){x.fillStyle='#1e1416';for(let i=0;i<4;i++){x.beginPath();x.moveTo(10+i*22,0);x.lineTo(18+i*22,0);x.lineTo(6+i*18,70);x.lineTo(1+i*16,70);x.fill();}if(!fore){dot(84,104,6,'#4a7ad8');dot(84,110,4,'#e8503a');}}
    else if(/Peacock|Emperor|Meadow Brown|Wood Nymph|Owlet/.test(N)){eye(fore?92:62,fore?24:88,fore?11:10);}
    else if(/Admiral/.test(N)){if(fore){x.fillStyle='#e8503a';x.save();x.translate(64,34);x.rotate(0.5);x.fillRect(-36,-5,72,11);x.restore();for(const [a,b] of [[96,16],[104,26],[86,12]])dot(a,b,3,'#ffffff');}else{x.fillStyle='#e8503a';x.fillRect(0,96,100,12);}}
    else if(/Orange-Tip/.test(N)&&fore){x.fillStyle='#f08a2a';x.beginPath();x.arc(112,22,34,0,6.283);x.fill();x.fillStyle='#2b1e2e';dot(70,30,3,'#2b1e2e');}
    else if(/Cabbage White/.test(N)&&fore){x.fillStyle='#3a3440';x.beginPath();x.arc(116,10,22,0,6.283);x.fill();dot(68,34,4,'#3a3440');}
    else if(/Painted Lady/.test(N)){x.fillStyle='#2b1e2e';if(fore){x.fillRect(70,0,60,40);for(const [a,b] of [[100,14],[112,24],[92,26]])dot(a,b,3.5,'#ffffff');}else for(let i=0;i<4;i++)dot(40+i*14,100,3,'#2b1e2e');}
    else if(/Morpho|Common Blue|Dewdrop|Hairstreak/.test(N)){const r=x.createRadialGradient(10,60,4,10,60,90);r.addColorStop(0,cssOf(mixC(B.col,0xffffff,0.35)));r.addColorStop(1,cssOf(B.col,0));x.fillStyle=r;x.fillRect(0,0,128,128);}
    else if(/Luna|Atlas|Rosy Maple|Elephant/.test(N)){if(/Luna/.test(N))dot(fore?60:58,fore?30:84,5,'#c8a040');if(/Atlas/.test(N)){x.fillStyle='rgba(255,246,220,0.9)';x.beginPath();x.moveTo(50,fore?30:80);x.lineTo(66,fore?20:76);x.lineTo(60,fore?38:94);x.fill();}
      if(/Rosy Maple/.test(N)){x.fillStyle='#f6d04a';x.fillRect(20,fore?20:70,60,fore?24:20);}if(/Elephant/.test(N)){x.fillStyle='#e87aa8';x.fillRect(0,fore?48:60,128,10);}}
    else if(/Tiger Moth/.test(N)){if(fore){x.fillStyle='#4a3022';for(let i=0;i<7;i++)dot(20+R()*90,14+R()*44,6+R()*5,'#4a3022');}else{x.fillStyle='#e8603a';x.fillRect(0,56,128,72);for(let i=0;i<4;i++)dot(30+R()*50,70+R()*25,5,'#1e1416');}}
    else if(/Marbled White/.test(N)){x.fillStyle='#2b1e2e';for(let i=0;i<10;i++)x.fillRect(R()*110,R()*120,8+R()*10,6+R()*8);}
    else if(/Brimstone|Clouded|Sulphur/.test(N)){dot(fore?58:52,fore?34:84,3,'#e0803a');}
    else{/* everything else: a few spots in its darker colour */for(let i=0;i<(plan==='moth'?6:3);i++)dot(30+R()*70,fore?18+R()*36:72+R()*24,2.5+R()*3,cssOf(B.dk,0.8));}
    // veins, then the dark margin round the edge, with pale dots in it
    x.strokeStyle=cssOf(B.dk,plan==='moth'?0.3:0.45);x.lineWidth=1.2;for(let i=0;i<6;i++){x.beginPath();x.moveTo(1,fore?58:64);x.quadraticCurveTo(50,fore?44+i*2:68+i*3,fore?70+i*10:24+i*14,fore?6+i*10:108-i*2);x.stroke();}
    wingPath(fore);x.strokeStyle=dk;x.lineWidth=/Morpho|Monarch|Swallowtail|Birdwing|Common Blue|Orange-Tip/.test(N)?12:plan==='moth'?3:7;x.stroke();
    if(/Monarch|Painted|Swallowtail|Birdwing|Mourning|Admiral/.test(N)){x.fillStyle=/Mourning/.test(N)?'#f6e0a0':'#ffffff';for(let i=0;i<8;i++){const t=i/8;dot(fore?86+t*30:84-t*60,fore?12+t*44:100+t*12,1.8,x.fillStyle);}}
    x.restore();}
  // a soft fringe of light on the outer edge
  const tex=new T.CanvasTexture(c);tex.anisotropy=2;return BUG_TEX[key]=tex;}
const _wingMats={};
function wingMat(B,plan){const k=B.name+plan;if(_wingMats[k])return _wingMats[k];const map=bugWingTex(B,plan),glassy=plan==='drag'||plan==='bee'||/Glasswing/.test(B.name);
  return _wingMats[k]=toon({map,transparent:glassy,alphaTest:glassy?0.05:0.5,side:T.DoubleSide,depthWrite:!glassy,emissive:B.glow?0xffffff:0x000000,emissiveMap:B.glow?map:null,emissiveIntensity:B.glow?0.5:0});}
// one side's wings: a flat card from the hinge outward, w wide and d long, centred a little behind the hinge at dz
const _wingGeo=new T.PlaneGeometry(1,1).rotateX(Math.PI/2).translate(0.5,0,0);
function wingSide(B,plan,sd,w,d,dz){const m=new T.Mesh(_wingGeo,wingMat(B,plan));m.scale.set(w,1,d);m.position.z=dz;m.castShadow=true;if(sd<0){m.scale.x=-w;}const g=new T.Group();g.add(m);return g;}

// ---- the body plans ----
function bugGroup(B){const g=new T.Group(),kind=B.kind||'fly',N=B.name,col=hexS(B.col),dk=hexS(B.dk),bm=B.glow?lumMat:vcMat,p=[];
  if(kind==='crawl'){crawlerParts(B,p);g.add(M(p,bm));if(/Glowworm|Firefly|Starlight/.test(N)){const t=[];t.push(P(SPH_LO,0xe8ff9a,0,0.03,-0.1,0,0,0,0.07,0.05,0.09));g.add(M(t,lumMat));}g.userData={crawl:true};return g;}
  if(kind==='drag'){const damsel=/Damsel|Mayfly/.test(N),sk=/Skater/.test(N),L=damsel?0.32:0.4,s=1;
    // head with big round eyes, a chunky thorax, and a long, slim, ringed abdomen
    p.push(P(SPH_LO,dk,0,0,0.11,0,0,0,0.05,0.045,0.04),P(SPH_LO,mixC(col,0x2a3a4a,0.2),-0.026,0.008,0.12,0,0,0,0.04,0.045,0.045),P(SPH_LO,mixC(col,0x2a3a4a,0.2),0.026,0.008,0.12,0,0,0,0.04,0.045,0.045),
      PG(SPH_LO,col,dk,0,0,0.055,0,0,0,0.055,0.06,0.09));
    for(let k=0;k<9;k++){const z=0.01-k*(L/9),w=(damsel?0.022:0.03)*(k<2?1.1:k>7?0.8:1);p.push(PG(SPH_XS,k%2?col:mixC(col,dk,0.5),dk,0,0,z,0,0,0,w,w*0.95,L/9*1.25));}
    if(/Mayfly/.test(N))for(const sd of [-1,0,1])limb3(p,dk,[0,0,0.01-L],[sd*0.03,0.02,-L-0.16],0.002);
    if(sk){sixLegs(p,dk,0.02,0.01,[0.06,0.03,-0.01],0.22,0.003);}else sixLegs(p,dk,0.02,-0.01,[0.08,0.06,0.04],0.04,0.003);
    g.add(M(p,bm));
    const wing=sd=>{const gg=new T.Group();const plan='drag';if(!sk){const f=wingSide(B,plan,sd,damsel?0.26:0.34,0.4,0.03);gg.add(f);}return gg;};
    const wl=wing(-1),wr=wing(1);g.add(wl,wr);g.userData={wl,wr,drag:true};return g;}
  const s=B.small?0.6:0.85,moth=/Moth|Owlet/.test(N)||B.time==='night'&&!/Firefly/.test(N),bee=/Bee|Bumble/.test(N),fire=/Firefly/.test(N),skip=/Skipper|Hawk/.test(N);
  if(bee){// a round fuzzy bumblebee: black and yellow bands, a white tail, glassy wings
    p.push(P(SPH_LO,0x1e1a1e,0,0,0.075*s,0,0,0,0.07*s,0.065*s,0.06*s),PG(SPH_LO,col,mixC(col,0x8a6a2a,0.3),0,0.005,0.02*s,0,0,0,0.12*s,0.11*s,0.1*s));
    for(const [z,c,w] of [[-0.04,0x1e1a1e,0.13],[-0.08,col,0.12],[-0.115,0x1e1a1e,0.1],[-0.145,0xf6f0e6,0.07]])p.push(P(SPH_LO,c,0,0,z*s,0,0,0,w*s,w*0.9*s,0.07*s));
    for(let i=0;i<10;i++)p.push(P(SPH_XS,i%2?col:0x2a2420,(R1(i)-0.5)*0.08*s,0.04*s,(0.04-i*0.016)*s,0,0,0,0.03*s,0.02*s,0.03*s));
    antennae(p,0x1e1a1e,[0,0.02*s,0.1*s],0.05*s,0.02*s,0.03*s,0.003);sixLegs(p,0x1e1a1e,0.03*s,-0.03*s,[0.04*s,0.01*s,-0.02*s],0.05*s,0.004);
    g.add(M(p,bm));const wl=wingSide(B,'bee',-1,0.2*s,0.22*s,0.01*s),wr=wingSide(B,'bee',1,0.2*s,0.22*s,0.01*s);g.add(wl,wr);g.userData={wl,wr};return g;}
  if(fire){// a firefly: a soft-bodied beetle, its wing cases parted in flight, the end of its tail alight
    p.push(PG(SPH_LO,0xe86a4a,0x8a3a2a,0,0.005,0.07*s,0,0,0,0.06*s,0.04*s,0.05*s),P(SPH_LO,0x2b2420,0,0,0.1*s,0,0,0,0.035*s,0.03*s,0.03*s),PG(SPH_LO,0x3a3430,0x1e1a18,0,0,-0.01*s,0,0,0,0.07*s,0.05*s,0.14*s));
    antennae(p,0x2b2420,[0,0.01*s,0.11*s],0.07*s,0.03*s,0.02*s,0.003);g.add(M(p,vcMat));g.add(M([P(SPH_LO,0xf0ff9a,0,-0.004,-0.075*s,0,0,0,0.065*s,0.045*s,0.08*s)],lumMat));
    const el=sd=>M([PG(SPH_LO,0x4a4038,0x2a2420,sd*0.03*s,0.02*s,0,0,sd*0.3,0,0.04*s,0.015*s,0.12*s)],vcMat);
    const wl=wingSide(B,'bee',-1,0.13*s,0.2*s,-0.02*s),wr=wingSide(B,'bee',1,0.13*s,0.2*s,-0.02*s);wl.add(el(-1));wr.add(el(1));g.add(wl,wr);g.userData={wl,wr};return g;}
  // butterflies and moths: head, furry thorax, abdomen; antennae clubbed (butterflies) or feathered (moths)
  const fat=moth||skip?1.45:1,fur=moth?mixC(col,0xd8c8b0,0.4):mixC(dk,0x3a3440,0.4);
  p.push(P(SPH_LO,fur,0,0,0.075*s,0,0,0,0.04*s*fat,0.04*s*fat,0.035*s*fat),PG(SPH_LO,fur,mixC(fur,0x1e1a1e,0.4),0,0,0.035*s,0,0,0,0.05*s*fat,0.05*s*fat,0.08*s),
    PG(SPH_LO,mixC(fur,col,0.25),mixC(fur,0x1e1a1e,0.35),0,-0.004,-0.05*s,0,0,0,0.038*s*fat,0.034*s*fat,0.15*s));
  for(let k=0;k<4;k++)p.push(P(SPH_XS,mixC(fur,0x1e1a1e,0.4),0,-0.003,(-0.02-k*0.025)*s,0,0,0,0.04*s*fat,0.035*s*fat,0.006));
  p.push(P(SPH_XS,0x1e1a1e,-0.016*s*fat,0.006,0.088*s,0,0,0,0.018*s,0.02*s,0.018*s),P(SPH_XS,0x1e1a1e,0.016*s*fat,0.006,0.088*s,0,0,0,0.018*s,0.02*s,0.018*s));
  if(moth)for(const sd of [-1,1]){p.push(P(LEAF0,mixC(fur,0x6a5a4a,0.3),sd*0.03*s,0.03*s,0.12*s,-0.5,sd*0.5,0,0.03*s,0.004,0.09*s));}
  else antennae(p,0x1e1a1e,[0,0.015*s,0.09*s],0.12*s,0.035*s,0.06*s,0.0025,0.008*s);
  sixLegs(p,0x2b2430,0.015*s,-0.02*s,[0.05*s,0.035*s,0.02*s],0.04*s,0.0025);
  g.add(M(p,bm));
  const plan=moth?'moth':'fly',w=0.34*s*(/Atlas|Birdwing|Emperor/.test(N)?1.35:skip?0.8:1),d=0.34*s*(/Atlas|Birdwing/.test(N)?1.35:1);
  const wl=wingSide(B,plan,-1,w,d,0.005*s),wr=wingSide(B,plan,1,w,d,0.005*s);g.add(wl,wr);g.userData={wl,wr};return g;}
const R1=i=>{const h=Math.sin(i*12.9898)*43758.5453;return h-Math.floor(h);};

// crawlers, by kind (y up from the ground, +z forward)
function crawlerParts(B,p){const N=B.name,col=hexS(B.col),dk=hexS(B.dk),leg=mixC(dk,0x1e1a1e,0.4),s=0.9;
  if(/Snail/.test(N)){// a coiled shell on a soft foot, with two eye stalks
    p.push(PG(SPH_LO,0xd8c8b0,0xa89880,0,0.025,0.02,0,0,0,0.09,0.05,0.3),P(SPH_LO,0xd8c8b0,0,0.04,0.15,0,0,0,0.06,0.06,0.07));
    for(const sd of [-1,1]){limb3(p,0xc8b8a0,[sd*0.015,0.06,0.16],[sd*0.03,0.13,0.2],0.006);p.push(P(SPH_XS,0x2b1e2e,sd*0.03,0.135,0.2,0,0,0,0.016,0.016,0.016));}
    for(let i=0;i<14;i++){const a=i*0.55,r=0.11*Math.pow(0.88,i);p.push(PG(SPH_LO,i%2?col:mixC(col,dk,0.4),dk,0,0.13+Math.sin(a)*0.05*(1-i/16),-0.03+Math.cos(a)*0.05*(1-i/16),0,0,0,0.11*r/0.11+0.02,r*1.7,r*1.7));}return;}
  if(/Caterpillar/.test(N)){for(let i=0;i<9;i++){const z=0.16-i*0.04,y=0.035+Math.sin(i*0.9)*0.008;p.push(PG(SPH_LO,col,mixC(col,0x3a5a2a,0.4),0,y,z,0,0,0,0.065,0.065,0.05));p.push(P(SPH_XS,dk,0.022,y+0.02,z,0,0,0,0.015,0.015,0.015),P(SPH_XS,dk,-0.022,y+0.02,z,0,0,0,0.015,0.015,0.015));
      if(i>1&&i<7)for(const sd of [-1,1])p.push(P(SPH_XS,mixC(col,0x3a5a2a,0.5),sd*0.025,0.008,z,0,0,0,0.018,0.018,0.018));}
    p.push(P(SPH_LO,mixC(col,0x6a4a2a,0.5),0,0.04,0.2,0,0,0,0.06,0.06,0.05),P(SPH_XS,0x1e1a1e,0.018,0.05,0.22,0,0,0,0.01,0.01,0.01),P(SPH_XS,0x1e1a1e,-0.018,0.05,0.22,0,0,0,0.01,0.01,0.01));return;}
  if(/Pill Bug/.test(N)){for(let i=0;i<8;i++){const z=0.1-i*0.028;p.push(PG(SPH_LO,mixC(col,0xffffff,i%2?0.08:0),dk,0,0.03,z,0,0,0,0.11-(Math.abs(i-3.5)*0.008),0.07,0.04));}
    antennae(p,dk,[0,0.02,0.12],0.04,0.03,0.0,0.003);sixLegs(p,leg,0.04,0.012,[0.07,0.02,-0.03],0.02,0.003);return;}
  if(/Ant\b|Ant$/.test(N)){// three parts on a pinched waist, elbowed antennae
    p.push(PG(SPH_LO,col,dk,0,0.04,0.1,0,0,0,0.05,0.045,0.05),PG(SPH_LO,col,dk,0,0.04,0.045,0,0,0,0.035,0.035,0.07),P(SPH_XS,dk,0,0.035,0.005,0,0,0,0.02,0.02,0.02),PG(SPH_LO,col,dk,0,0.045,-0.05,0,0,0,0.07,0.06,0.09));
    for(const sd of [-1,1]){limb3(p,leg,[sd*0.01,0.05,0.12],[sd*0.025,0.08,0.13],0.003);limb3(p,leg,[sd*0.025,0.08,0.13],[sd*0.04,0.07,0.17],0.003);}
    sixLegs(p,leg,0.015,0.035,[0.06,0.045,0.03],0.07,0.003);if(/Leafcutter/.test(N))p.push(P(LEAF0,0x6ab84a,0,0.09,0.14,0.6,0,0,0.08,0.006,0.1));return;}
  if(/Grasshopper|Cricket/.test(N)){// a long body, big folded jumping legs, long feelers
    p.push(PG(SPH_LO,col,dk,0,0.05,0.09,0,0,0,0.06,0.07,0.06),PG(SPH_LO,col,dk,0,0.05,0.035,0,0,0,0.07,0.065,0.08),PG(SPH_LO,mixC(col,dk,0.2),dk,0,0.045,-0.06,0,0,0,0.06,0.055,0.16),
      PG(SPH_LO,mixC(col,0xffffff,0.1),dk,0,0.07,-0.02,-0.05,0,0,0.065,0.02,0.2),P(SPH_XS,0x1e1a1e,0.022,0.065,0.1,0,0,0,0.02,0.02,0.02),P(SPH_XS,0x1e1a1e,-0.022,0.065,0.1,0,0,0,0.02,0.02,0.02));
    for(const sd of [-1,1]){limb3(p,mixC(col,dk,0.2),[sd*0.03,0.04,0.0],[sd*0.06,0.11,-0.08],0.012);limb3(p,dk,[sd*0.06,0.11,-0.08],[sd*0.065,0.006,-0.13],0.005);}
    sixLegs(p,dk,0.02,0.04,[0.07,0.04],0.06,0.004);antennae(p,dk,[0,0.07,0.11],0.18,0.05,0.04,0.0025);return;}
  if(/Mantis/.test(N)){p.push(PG(SPH_LO,col,dk,0,0.05,-0.04,0,0,0,0.07,0.06,0.18));limb3(p,col,[0,0.06,0.04],[0,0.14,0.1],0.016);
    p.push(PG(SPH_LO,col,dk,0,0.15,0.11,0,0,0,0.06,0.04,0.045));for(const sd of [-1,1]){p.push(P(SPH_XS,mixC(col,0x8a6a9a,0.4),sd*0.026,0.155,0.12,0,0,0,0.022,0.024,0.022));
      limb3(p,col,[sd*0.012,0.12,0.09],[sd*0.03,0.1,0.15],0.008);limb3(p,col,[sd*0.03,0.1,0.15],[sd*0.022,0.13,0.13],0.006);
      for(const z of [-0.08,-0.12])p.push(P(LEAF0,mixC(col,0xffffff,0.2),sd*0.05,0.012,z,0,sd*0.6,0,0.06,0.006,0.05));}
    sixLegs(p,mixC(col,dk,0.2),0.02,0.05,[0.0,-0.06],0.08,0.004);return;}
  if(/Walking Leaf/.test(N)){p.push(PG(SPH_LO,col,dk,0,0.025,-0.01,0,0,0,0.16,0.02,0.24),P(BOX,dk,0,0.036,-0.01,0,0,0,0.006,0.004,0.22),P(SPH_LO,col,0,0.03,0.12,0,0,0,0.05,0.03,0.05));
    for(let i=0;i<4;i++)for(const sd of [-1,1])p.push(P(BOX,mixC(col,dk,0.5),sd*0.035,0.036,0.06-i*0.05,0,sd*0.7,0,0.003,0.003,0.07));sixLegs(p,mixC(col,dk,0.3),0.03,0.02,[0.08,0.0,-0.06],0.05,0.006);return;}
  if(/Glowworm/.test(N)){for(let i=0;i<8;i++){const z=0.12-i*0.032;p.push(PG(SPH_LO,i>5?0xe8ff9a:col,dk,0,0.03,z,0,0,0,0.06-Math.abs(i-3)*0.003,0.04,0.04));}sixLegs(p,leg,0.02,0.02,[0.1,0.08,0.06],0.03,0.003);return;}
  if(/Scorpion/.test(N)){p.push(PG(SPH_LO,col,dk,0,0.03,0.04,0,0,0,0.09,0.035,0.14));for(let i=0;i<6;i++){const a=i*0.45,z=-0.04-Math.sin(a)*0.07,y=0.03+(1-Math.cos(a))*0.07;p.push(PG(SPH_XS,col,dk,0,y,z,0,0,0,0.035,0.035,0.04));}
    p.push(P(CONE5,dk,0,0.15,-0.03,-2.2,0,0,0.015,0.04,0.015));for(const sd of [-1,1]){limb3(p,col,[sd*0.03,0.03,0.1],[sd*0.07,0.03,0.15],0.008);p.push(PG(SPH_LO,col,dk,sd*0.08,0.03,0.18,0,0,0,0.04,0.025,0.06));}
    sixLegs(p,leg,0.035,0.025,[0.05,0.02,-0.01],0.05,0.004);return;}
  if(/Snow Flea/.test(N)){p.push(PG(SPH_LO,col,dk,0,0.025,0,0,0,0,0.06,0.05,0.09));antennae(p,dk,[0,0.03,0.04],0.04,0.02,0.02,0.003);sixLegs(p,dk,0.02,0.02,[0.03,0.0,-0.02],0.03,0.003);return;}
  // beetles: head, pronotum, two domed wing cases split down the middle, jointed legs, antennae
  const lady=/Ladybug/.test(N),shield=/Shield/.test(N),stag=/Stag/.test(N),rhino=/Rhino/.test(N),weevil=/Weevil/.test(N),long=/Sawyer/.test(N),diving=/Diving/.test(N);
  const bw=lady?0.09:shield?0.1:0.075,bl=lady?0.1:shield?0.11:0.13,h=lady?0.075:0.05,shine=mixC(col,0xffffff,0.35);
  p.push(PG(SPH_LO,dk,mixC(dk,0x000000,0.3),0,0.035,bl+0.035,0,0,0,bw*0.7,0.04,0.05),PG(SPH_LO,lady?0x1e1a1e:mixC(col,dk,0.35),dk,0,0.045,bl-0.01,0,0,0,bw*1.5,h*0.9,0.06));
  for(const sd of [-1,1])p.push(PG(SPH_LO,col,mixC(col,dk,0.6),sd*bw*0.36,0.04,-0.02,0,0,sd*0.08,bw*0.82,h*1.5,bl*2));
  p.push(P(BOX,mixC(dk,0x000000,0.3),0,0.04+h*0.74,-0.02,0,0,0,0.004,0.004,bl*1.8),P(SPH_XS,shine,-bw*0.25,0.04+h*0.6,0.02,0,0,0,bw*0.35,0.012,bl*0.5));/* the seam, and a glint */
  if(lady)for(const [a,b] of [[0.035,0.04],[-0.035,0.04],[0.05,-0.03],[-0.05,-0.03],[0.02,-0.08],[-0.02,-0.08]])p.push(P(SPH_XS,0x1e1a1e,a,0.04+h*0.74,b,0,0,0,0.032,0.014,0.032));
  if(lady)for(const sd of [-1,1])p.push(P(SPH_XS,0xffffff,sd*0.03,0.05,bl+0.01,0,0,0,0.025,0.02,0.02));
  if(shield)p.push(P(PRISM,mixC(col,dk,0.3),0,0.04+h*0.7,0.02,0,0,0,0.12,0.01,0.1));
  if(stag)for(const sd of [-1,1]){limb3(p,dk,[sd*0.025,0.035,bl+0.06],[sd*0.06,0.04,bl+0.13],0.008);limb3(p,dk,[sd*0.06,0.04,bl+0.13],[sd*0.02,0.04,bl+0.16],0.006);}
  if(rhino){limb3(p,dk,[0,0.05,bl+0.06],[0,0.1,bl+0.11],0.012);limb3(p,dk,[0,0.1,bl+0.11],[0,0.15,bl+0.08],0.007);}
  if(weevil)limb3(p,dk,[0,0.035,bl+0.06],[0,0.012,bl+0.14],0.008);
  antennae(p,leg,[0,0.045,bl+0.06],long?0.3:stag||rhino?0.05:0.08,long?0.15:0.04,long?0.02:0.03,long?0.003:0.0028,long?0:0.006);
  sixLegs(p,diving?mixC(col,dk,0.4):leg,bw*0.8,0.03,[bl*0.75,bl*0.25,-bl*0.45],diving?0.12:0.08,0.005);}
