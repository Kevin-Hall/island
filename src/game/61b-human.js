/* =========================================================
   Human characters, and the character editor
   ========================================================= */
// A human player (S.look.sp 'human', its choices in S.look.h) is built by humanModel: chibi proportions to stand
// with the villagers (a big round head, a small body), with the same named limb pivots (armL/armR/footL/footR) and
// face meshes (open/blink/happy, smile/talk) as npcModel, so walking, swimming, blinking and rooms all just work.
// The editor (openCharEd) zooms in on you in the world with a tray of choices: boy/girl, skin, hair style and colour,
// eyes, face details, top, bottoms, shoes and something to wear on your head. Drag to turn round, Shuffle for a surprise.
const HSKIN=[0xfde3cf,0xf6d2b4,0xeec09a,0xd9a27a,0xc08660,0xa06a48,0x7a4e34,0x5a3826];
const HHAIR=[0x2a2026,0x4a2e22,0x7a4a2a,0xb07a40,0xe0b860,0xf0dca0,0xc8502a,0xe8e4dc,0x8a8a98,0xf08ab0,0x6a9ae8,0x7ac87a,0xa87ad8];
const HEYES=[0x3a2a22,0x6a4a2a,0x3a6a9a,0x4a8a5a,0x7a7a8a,0x8a5ab8];
const HCLOTH=[0xd8453a,0xf08a3a,0xf6d04a,0x6ab84a,0x3ab8a8,0x5a8ae0,0x3a4a7a,0x9a6ad0,0xf39ab0,0xf4f0ea,0x8a8a98,0x3a3440,0x8a5a3a];
const HSTYLE={
  hair:[['short','Short'],['side','Side part'],['spiky','Spiky'],['buzz','Buzz'],['curly','Curly'],['mohawk','Mohawk'],['bob','Bob'],['long','Long'],['ponytail','Ponytail'],['pigtails','Pigtails'],['bun','Top bun'],['afro','Afro']],
  top:[['tee','T-shirt'],['stripe','Stripy tee'],['hoodie','Hoodie'],['sweater','Sweater'],['tank','Vest top'],['overalls','Overalls'],['dress','Dress'],['jacket','Jacket']],
  bot:[['shorts','Shorts'],['trousers','Trousers'],['skirt','Skirt']],
  hat:[['none','Nothing'],['cap','Cap'],['beanie','Beanie'],['sunhat','Sun hat'],['bow','Bow'],['flower','Flower'],['headband','Headband'],['band','Bandana']]};
const HDEF={boy:{g:'boy',skin:2,hair:'short',hairC:1,eye:3,top:'sweater',topC:0x4a8a4a,bot:'trousers',botC:0x6a4a34,shoe:0xf4f0ea,hat:'none',glasses:0,blush:1,freckles:0},
  girl:{g:'girl',skin:1,hair:'long',hairC:2,eye:1,top:'overalls',topC:0xf4f0ea,bot:'shorts',botC:0x7aa0d8,shoe:0xf6c84a,hat:'flower',glasses:0,blush:1,freckles:0}};
// The model is sculpted from shaped geometry, in the proportions of a young person drawn in a cosy pixel-art style:
// a head about a third of the height, egg-shaped (round cranium, narrower jaw and chin: headPt), ears and a nose;
// anime-style eyes (white, coloured iris, pupil, catchlights, a lash line) and brows drawn on the head's own surface
// (onHead); hair as a base shell over the head that dips under the skin across the face (hairGeo) with tapered locks
// on top (lock: a tousled crown, a fringe that falls in points, locks over the ears); a neck, a torso with shoulders,
// chest and waist; arms with an elbow and a hand; legs with thigh, knee, calf and a sneaker; all turned on a lathe.
const HEAD_R=[0.205,0.232,0.215],HEAD_Y=0.985,HUM_S=0.86,_hgeo=new Map();
// the head's shape: a sphere, a little squarer at the cheekbones, tapering to a soft chin below
function headPt(x,y,z){let X=x,Y=y,Z=z;if(y<0){const t=-y,k=1-0.34*Math.pow(t,1.6);X*=k;Z*=1-0.18*Math.pow(t,1.6);Y*=1.06;}else{X*=1+0.04*Math.sin(Math.PI*y);}
  if(z>0)Z*=0.95;return[X*HEAD_R[0],Y*HEAD_R[1],Z*HEAD_R[2]];}
// a point on (or r× out from) the head, in the direction (u,v) across the face, and the angles to face out from it there
function onHead(u,v,r=1){const w=Math.sqrt(Math.max(0,1-u*u-v*v)),[x,y,z]=headPt(u,v,w);return[x*r,HEAD_Y+y*r,z*r,Math.atan2(u,w),-Math.asin(clamp(v,-1,1))];}
function headGeo(){if(_hgeo.has('head2'))return _hgeo.get('head2');const g=new T.SphereGeometry(1,40,30),a=g.attributes.position;
  for(let i=0;i<a.count;i++){const [x,y,z]=headPt(a.getX(i),a.getY(i),a.getZ(i));a.setXYZ(i,x,y,z);}g.computeVertexNormals();smoothG(g);_hgeo.set('head2',g);return g;}
// each style's base: where the fringe line sits, the hem at the sides and back, its volume, and how far long hair falls
const HAIR_CUT={short:{f:0.42,hem:-0.05,back:-0.5},side:{f:'side',hem:-0.05,back:-0.5},spiky:{f:0.45,hem:-0.08,back:-0.5},buzz:{f:0.55,hem:-0.12,back:-0.45,r:1.03,top:0.01},
  curly:{f:0.42,hem:-0.1,back:-0.5,r:1.1},mohawk:{f:0.6,hem:-0.15,back:-0.45,r:1.02,top:0},bob:{f:0.4,hem:-0.62,back:-0.62,side:0.62,pull:0.15},
  long:{f:0.4,hem:-0.6,back:-0.95,side:0.62,pull:1.1},ponytail:{f:0.4,hem:-0.1,back:-0.55},pigtails:{f:0.4,hem:-0.1,back:-0.55},bun:{f:0.4,hem:-0.1,back:-0.55},afro:{f:0.45,hem:-0.3,back:-0.6,r:1.42,top:0.1}};
function hairGeo(st){const key='h2'+st;if(_hgeo.has(key))return _hgeo.get(key);const C=HAIR_CUT[st]||HAIR_CUT.short,g=new T.SphereGeometry(1,56,42),a=g.attributes.position;
  const fr=x=>C.f==='side'?0.5-0.32*clamp((x+0.55)/1.1,0,1):C.f+0.04*Math.cos(x*20);
  const bare=(x,y,z)=>{const W=C.side||0.72,face=Math.min(fr(x)-y,W-Math.abs(x),(z-0.02)*1.5);
    const lock=C.side&&z>-0.1&&Math.abs(x)>=C.side-0.02&&y>C.hem-0.05,hem=lock?-1:(z<-0.25?C.back:z<0?lerp(C.hem,C.back,-z/0.25):C.hem)-y;return Math.max(face,hem,-0.92-y);};
  for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i),z=a.getZ(i);
    let r=(C.r||1.08)+(C.top??0.08)*Math.max(0,y);if(C.side&&Math.abs(x)>0.5)r+=0.03;if(st==='afro')r-=0.25*Math.max(0,z)*Math.max(0,-y+0.35);
    const d=bare(x,y,z),k=clamp((d+0.03)/0.07,0,1);r=lerp(r,0.9,k*k*(3-2*k));
    let [X,Y,Z]=headPt(x,y,z);X*=r;Y*=r;Z*=r;if(C.pull&&y<-0.1&&z<0.45&&d<0){const q=(-0.1-y)*C.pull*(1.1-Math.max(0,z));Y-=q*0.2;X*=1-q*0.1;}
    a.setXYZ(i,X,Y,Z);}
  g.computeVertexNormals();smoothG(g);_hgeo.set(key,g);return g;}
function latheGeo(key,pts,seg=20){if(_hgeo.has(key))return _hgeo.get(key);const g=new T.LatheGeometry(pts.map(([r,y])=>new T.Vector2(Math.max(0.0005,r),y)),seg);g.computeVertexNormals();smoothG(g);_hgeo.set(key,g);return g;}
// a tapered limb segment from radius r0 (at 0) to r1 (at -len), with rounded ends
const seg2=(k,r0,r1,len)=>latheGeo('sg'+k,[[0.0005,0],...[...Array(5)].map((_,i)=>{const a=i/4*Math.PI/2;return[Math.sin(a)*r0,-r0+Math.cos(a)*r0];}),...[...Array(5)].map((_,i)=>{const a=i/4*Math.PI/2;return[Math.cos(a)*r1,-len+r1-Math.sin(a)*r1-r1];}),[0.0005,-len-r1]].map(([r,y])=>[r,y]).reverse(),14);
const tear=k=>latheGeo('tear'+k,[...Array(11)].map((_,i)=>{const t=i/10;return[Math.max(0.001,Math.sin(Math.PI*t)**0.75*(1-t*0.35)*0.5),t];}),16);
// a lock of hair: thick at the root, tapering to a point
const LOCK=latheGeo('lock',[[0.0005,0],[0.45,0.06],[0.5,0.2],[0.4,0.5],[0.22,0.8],[0.0005,1]],8);
function lock(p,col,root,tip,w){const dx=tip[0]-root[0],dy=tip[1]-root[1],dz=tip[2]-root[2],L=Math.hypot(dx,dy,dz);w*=1.22;p.push(P(LOCK,col,root[0],root[1],root[2],Math.atan2(Math.hypot(dx,dz),dy),Math.atan2(dx,dz),0,w,L,w*0.7));}
const hairMat=toon({vertexColors:true,side:T.DoubleSide});
function humanModel(h0){const h=Object.assign({},HDEF.boy,h0),g=new T.Group(),p=[],hp=[],sk=HSKIN[h.skin]??HSKIN[2],hc=HHAIR[h.hairC]??HHAIR[1],ec=HEYES[h.eye]??HEYES[0],tc=h.topC,bc=h.botC,girl=h.g==='girl';
  const dk=(c,t)=>lerpHex(c,0x1a1420,t),lt=(c,t)=>lerpHex(c,0xffffff,t),dress=h.top==='dress',W=girl?1.0:1.1,hipY=0.38,shY=0.68,zS=0.72,DY=-0.12;
  const longS=['hoodie','sweater','jacket'].includes(h.top),rib=h.top==='sweater'||h.top==='hoodie';
  // torso: hips, waist, chest and shoulders, flattened front to back
  const torso=latheGeo('torso'+(girl?'g':'b'),girl?[[0.0005,0.45],[0.12,0.45],[0.125,0.52],[0.105,0.6],[0.115,0.68],[0.13,0.74],[0.12,0.79],[0.06,0.83],[0.0005,0.84]]
    :[[0.0005,0.45],[0.12,0.45],[0.125,0.52],[0.118,0.6],[0.13,0.68],[0.145,0.75],[0.13,0.8],[0.06,0.84],[0.0005,0.85]],24);
  p.push(P(torso,h.top==='tank'?tc:tc,0,0,0,0,0,0,W,1,zS));
  if(rib)p.push(P(latheGeo('ribH',[[0.123,0],[0.129,0.012],[0.129,0.035],[0.123,0.045]]),dk(tc,0.08),0,0.45,0,0,0,0,W,1,zS*1.02),P(latheGeo('ribN',[[0.055,0],[0.064,0.012],[0.06,0.03]]),dk(tc,0.08),0,0.825,0,0,0,0,W,1,zS*1.2));
  if(h.top==='stripe')for(let i=0;i<4;i++)p.push(P(latheGeo('st2',[[0.128,0],[0.132,0.01],[0.128,0.02]]),0xf8f6f0,0,0.5+i*0.07,0,0,0,0,W*(i===3?1.08:1),1,zS*1.02));
  if(h.top==='hoodie'){p.push(P(SPH_LO,dk(tc,0.1),0,0.82,-0.07,0,0,0,0.2,0.09,0.11),P(BOX,dk(tc,0.08),0,0.56,0.085,-0.06,0,0,0.13,0.06,0.015));for(const s of [-1,1])p.push(P(CYL8,0xf4f0ea,s*0.025,0.72,0.09,0,0,0,0.008,0.07,0.008));}
  if(h.top==='jacket'){p.push(P(BOX,0xf4f0ea,0,0.66,0.087,-0.05,0,0,0.07,0.28,0.012));for(const s of [-1,1])p.push(P(BOX,dk(tc,0.15),s*0.045,0.76,0.082,-0.15,0,s*0.35,0.03,0.09,0.015));}
  if(h.top==='overalls'){p.push(P(latheGeo('ovb',[[0.0005,0],[0.128,0],[0.125,0.12],[0.0005,0.12]]),bc,0,0.46,0,0,0,0,W*1.02,1,zS*1.03),P(BOX,bc,0,0.66,0.085,-0.05,0,0,0.13,0.12,0.012));
    for(const s of [-1,1])p.push(P(BOX,bc,s*0.06,0.75,0.04,-0.6,0,0,0.03,0.12,0.012),P(SPH_LO,0xf0c040,s*0.055,0.71,0.09,0,0,0,0.018,0.018,0.01));}
  // the lower half: trousers or shorts on the hips, a skirt or a dress flaring out
  if(dress)p.push(P(latheGeo('dress2',[[0.0005,0.62],[0.11,0.62],[0.125,0.54],[0.17,0.4],[0.19,0.33],[0.0005,0.33]]),tc,0,0,0,0,0,0,W,1,0.85),P(latheGeo('dhem',[[0.188,0],[0.193,0.012],[0.186,0.024]]),lt(tc,0.4),0,0.33,0,0,0,0,W,1,0.85));
  else if(h.bot==='skirt')p.push(P(latheGeo('skirt2',[[0.0005,0.56],[0.125,0.56],[0.16,0.44],[0.175,0.39],[0.0005,0.39]]),bc,0,0,0,0,0,0,W,1,0.85));
  else if(h.top!=='overalls')p.push(P(latheGeo('pelvis',[[0.0005,0.42],[0.115,0.42],[0.125,0.48],[0.125,0.55],[0.0005,0.56]]),bc,0,0,0,0,0,0,W,1,zS*1.02),P(latheGeo('belt',[[0.126,0],[0.129,0.012],[0.126,0.022]]),dk(bc,0.35),0,0.535,0,0,0,0,W,1,zS*1.03));
  // neck and head
  p.push(P(latheGeo('neck2',[[0.0005,0],[0.045,0],[0.042,0.05],[0.045,0.1],[0.0005,0.1]]),sk,0,0.8,0,0,0,0,1,1,0.9));
  for(const q of p)q.y+=DY;/* the whole body sits lower: shorter legs */
  p.push(P(headGeo(),sk,0,HEAD_Y,0));
  const feat=(geo,col,u,v,sx,sy,sz,r=1.0,into=p,rz=0)=>{const [x,y,z,ry,rx]=onHead(u,v,r);into.push(P(geo,col,x,y,z,rx,ry,rz,sx,sy,sz));};
  for(const s of [-1,1]){const [x,y,z]=headPt(s*0.99,-0.06,-0.05);p.push(P(SPH_LO,sk,x,HEAD_Y+y,z,0,s*0.3,0,0.045,0.07,0.035),P(SPH_XS,dk(sk,0.15),x+s*0.004,HEAD_Y+y,z+0.008,0,0,0,0.022,0.04,0.015));}/* ears */
  feat(SPH_LO,sk,0,-0.22,0.034,0.05,0.04,1.0);feat(SPH_XS,dk(sk,0.16),0,-0.27,0.03,0.012,0.012,1.012);/* a nose, with a little shadow under it */
  if(h.blush)for(const s of [-1,1])feat(SPH_LO,girl?0xf6a0ac:0xf0a8a0,s*0.5,-0.3,0.05,0.03,0.012,0.99);
  if(h.freckles)for(const s of [-1,1])for(let i=0;i<4;i++)feat(SPH_XS,dk(sk,0.3),s*(0.2+i*0.07),-0.2-(i%2)*0.04,0.009,0.009,0.006,1.005);
  for(const s of [-1,1])feat(BOX,dk(hc,0.15),s*0.34,0.16,girl?0.058:0.064,girl?0.009:0.014,0.01,1.008,p,s*(girl?-0.15:-0.06));/* brows */
  // hair: the base, then locks
  hp.push(P(hairGeo(h.hair),h.hair==='mohawk'?dk(hc,0.45):hc,0,HEAD_Y,0));
  const R0=mulberry(hi(h.hair.length,h.hairC,7)),hl=lt(hc,0.08),hd=dk(hc,0.12),at=(u,v,r)=>{const [x,y,z]=onHead(u,v,r);return[x,y,z];};
  const fringe=(n,len,spread=0.85,v0=0.55)=>{for(let i=0;i<n;i++){const u=(i/(n-1)-0.5)*spread,root=at(u*0.8,v0+0.25,1.12),tip=at(u+(R0()-0.5)*0.08,v0-len,1.1);lock(hp,i%2?hc:hl,root,tip,0.05+R0()*0.015);}};
  const sph=(a,e,r)=>{const [x,y,z]=headPt(Math.sin(e)*Math.cos(a),Math.cos(e),Math.sin(e)*Math.sin(a));return[x*r,HEAD_Y+y*r,z*r];};
  const crown=(n,out=1.2)=>{for(let i=0;i<n;i++){const a=i/n*6.283+R0()*0.4,e=0.12+R0()*0.6;if(Math.sin(a)>0.55&&e>0.45)continue;/* (the fringe covers the front) */
    lock(hp,[hc,hl,hd][i%3],sph(a,e,1.04),sph(a+(R0()-0.5)*0.5,e+0.55+R0()*0.25,out),0.06+R0()*0.02);}};
  const sides=(len)=>{for(const s of [-1,1])for(let i=0;i<3;i++){const root=at(s*0.82,0.35-i*0.12,1.08),tip=at(s*(0.9+R0()*0.05),0.1-len-i*0.08,1.12);lock(hp,i%2?hc:hd,root,tip,0.045);}};
  switch(h.hair){
    case'short':crown(14,1.22);fringe(6,0.3);sides(0.12);break;
    case'side':crown(10,1.18);for(let i=0;i<7;i++){const u=-0.45+i*0.15,root=at(u-0.2,0.8,1.12),tip=at(u+0.25,0.42-i*0.025,1.12);lock(hp,i%2?hc:hl,root,tip,0.055);}sides(0.1);break;
    case'spiky':for(let i=0;i<16;i++){const a=i/16*6.283,e=0.3+(i%3)*0.18,u=Math.cos(a)*Math.sin(e),v=Math.cos(e),w=Math.sin(a)*Math.sin(e);lock(hp,i%2?hc:hl,[u*HEAD_R[0]*0.9,HEAD_Y+v*HEAD_R[1]*0.9,w*HEAD_R[2]*0.9],[u*HEAD_R[0]*1.5,HEAD_Y+(v*1.25+0.2)*HEAD_R[1]*1.3,w*HEAD_R[2]*1.5],0.06);}fringe(5,0.22);break;
    case'buzz':break;
    case'curly':for(let i=0;i<28;i++){const a=R0()*6.283,e=0.15+R0()*1.1,u=Math.cos(a)*Math.sin(e),v=Math.cos(e),w=Math.sin(a)*Math.sin(e);if(w>0.3&&v<0.5)continue;const [x,y,z]=headPt(u,v,w);hp.push(P(SPH_LO,[hc,hl,hd][i%3],x*1.12,HEAD_Y+y*1.12,z*1.12,0,0,0,0.07,0.07,0.07));}fringe(5,0.2);break;
    case'mohawk':for(let i=0;i<7;i++){const w=0.75-i*0.25,v=Math.sqrt(Math.max(0,1-w*w));lock(hp,i%2?hc:hl,[0,HEAD_Y+v*HEAD_R[1]*0.95,w*HEAD_R[2]*0.95],[0,HEAD_Y+(v+0.45)*HEAD_R[1]*1.1,(w-0.15)*HEAD_R[2]*1.2],0.07);}break;
    case'bob':crown(8,1.12);fringe(7,0.32,0.9);for(const s of [-1,1])for(let i=0;i<4;i++){const z0=0.3-i*0.3;lock(hp,i%2?hc:hd,at(s*0.9,0.4,1.1).map((c,j)=>j===2?z0*HEAD_R[2]:c),[s*HEAD_R[0]*1.12,HEAD_Y-HEAD_R[1]*0.8,z0*HEAD_R[2]*1.1],0.07);}break;
    case'long':crown(8,1.12);fringe(7,0.32,0.9);for(let i=0;i<9;i++){const a=Math.PI*0.08+i/8*Math.PI*0.84,x=Math.cos(a)*HEAD_R[0]*1.05,z=-Math.sin(a)*HEAD_R[2]*1.0+(Math.abs(Math.cos(a))>0.8?0.05:0);
        lock(hp,i%2?hc:hd,[x,HEAD_Y+HEAD_R[1]*0.6,z],[x*1.15,HEAD_Y-HEAD_R[1]*2.2,z*1.1-0.03],0.09);}break;
    case'ponytail':crown(8,1.12);fringe(6,0.3);hp.push(P(SPH_LO,0xd8453a,0,HEAD_Y+0.06,-HEAD_R[2]*1.06,0,0,0,0.05,0.05,0.04));for(let i=0;i<4;i++)lock(hp,i%2?hc:hd,[0,HEAD_Y+0.06,-HEAD_R[2]*1.1],[(i-1.5)*0.03,HEAD_Y-0.2,-HEAD_R[2]*1.5-i*0.01],0.08);break;
    case'pigtails':crown(8,1.12);fringe(6,0.3);for(const s of [-1,1]){hp.push(P(SPH_LO,0xf39ab0,s*HEAD_R[0]*1.05,HEAD_Y+0.01,-0.04,0,0,0,0.045,0.045,0.045));for(let i=0;i<3;i++)lock(hp,i%2?hc:hd,[s*HEAD_R[0]*1.08,HEAD_Y,-0.04],[s*(HEAD_R[0]*1.4+i*0.02),HEAD_Y-0.24,-0.05+i*0.02],0.075);}break;
    case'bun':crown(6,1.1);fringe(6,0.3);hp.push(P(SPH,hc,0,HEAD_Y+HEAD_R[1]*1.2,-0.04,0,0,0,0.15,0.13,0.15),P(latheGeo('bunr',[[0.05,0],[0.058,0.01],[0.05,0.02]]),0xf39ab0,0,HEAD_Y+HEAD_R[1]*1.08,-0.04));break;
    case'afro':for(let i=0;i<18;i++){const a=R0()*6.283,e=0.2+R0()*1.1,u=Math.cos(a)*Math.sin(e),v=Math.cos(e),w=Math.sin(a)*Math.sin(e);if(w>0.4&&v<0.45)continue;const [x,y,z]=headPt(u,v,w);hp.push(P(SPH_LO,[hc,hl][i%2],x*1.4,HEAD_Y+y*1.35+0.03,z*1.38,0,0,0,0.11,0.11,0.11));}break;}
  // something on your head
  const hy=HEAD_Y+HEAD_R[1]*(h.hair==='afro'?1.5:h.hair==='bun'?1.3:h.hair==='spiky'?1.25:1.12);
  switch(h.hat){
    case'cap':hp.push(P(latheGeo('cap2',[[0.0005,0.13],[0.08,0.125],[0.16,0.08],[0.21,0],[0.0005,0]]),tc,0,hy-0.12,0,0,0,0,1,1,1.03),P(CYL12,tc,0,hy-0.11,0.17,0.15,0,0,0.24,0.012,0.15),P(SPH_XS,lt(tc,0.4),0,hy+0.01,0,0,0,0,0.035,0.025,0.035));break;
    case'beanie':hp.push(P(latheGeo('bean2',[[0.0005,0.17],[0.1,0.16],[0.19,0.09],[0.215,0.01],[0.218,-0.04],[0.0005,-0.04]]),bc,0,hy-0.1,-0.01,0,0,0,1,1,1),P(SPH_LO,lt(bc,0.5),0,hy+0.08,-0.01,0,0,0,0.08,0.08,0.08));break;
    case'sunhat':hp.push(P(CYL12,0xe8d090,0,hy-0.07,0,0,0,0,0.62,0.016,0.6),P(latheGeo('sun2',[[0.0005,0.1],[0.12,0.095],[0.16,0.03],[0.17,0],[0.0005,0]]),0xe8d090,0,hy-0.07,0),P(latheGeo('sunb2',[[0.164,0],[0.168,0.013],[0.162,0.026]]),tc,0,hy-0.07,0));break;
    case'bow':for(const s of [-1,1])hp.push(P(ICO2,tc,0.09+s*0.04,hy-0.02,0.02,0,s*0.3,s*0.5,0.075,0.055,0.035));hp.push(P(ICO2,dk(tc,0.15),0.09,hy-0.02,0.025,0,0,0,0.03,0.03,0.03));break;
    case'flower':for(let k=0;k<2;k++){const cx=0.11+k*0.05,cy=hy-0.04-k*0.025;for(let i=0;i<5;i++){const a=i/5*6.283;hp.push(P(SPH_LO,0xfff0a0,cx+Math.cos(a)*0.024,cy+Math.sin(a)*0.024,0.09,0,0,a,0.034,0.024,0.014));}hp.push(P(SPH_LO,0xf0a030,cx,cy,0.096,0,0,0,0.02,0.02,0.014));}break;
    case'headband':hp.push(P(latheGeo('hb2',[[0.2,0],[0.204,0.014],[0.2,0.028]]),tc,0,HEAD_Y+HEAD_R[1]*0.55,-0.02,-0.3,0,0,0.98,1,1));break;
    case'band':hp.push(P(latheGeo('bd2',[[0.198,0],[0.203,0.02],[0.198,0.04]]),tc,0,HEAD_Y+HEAD_R[1]*0.4,-0.01,-0.18,0,0,0.98,1,1),P(ICO2,tc,0.03,HEAD_Y+0.06,-0.2,0.4,0,0.6,0.05,0.08,0.02));break;}
  if(h.glasses){for(const s of [-1,1])feat(latheGeo('lens2',[[0.03,0],[0.037,0.003],[0.03,0.006]]),0x2a2026,s*0.36,-0.06,1,1,1,1.06,hp);const [x,y,z]=onHead(0,-0.05,1.07);hp.push(P(BOX,0x2a2026,x,y,z,0,0,0,0.035,0.007,0.007));}
  g.add(M(p));g.add(M(hp,hairMat));
  // eyes: an almond white, a big coloured iris, a dark pupil, two catchlights and a lash line; closed and happy versions
  const fp={open:[],blink:[],happy:[],smile:[],talk:[]},lid=new T.TorusGeometry(0.03,0.006,4,12,Math.PI*0.75);
  for(const s of [-1,1]){const u=s*0.37,v=-0.07,sc=girl?1.1:1;
    feat(SPH_LO,0xfbf8f4,u,v,0.068*sc,0.052*sc,0.016,1.0,fp.open);feat(SPH_LO,ec,u+s*-0.01,v-0.005,0.04*sc,0.05*sc,0.014,1.01,fp.open);feat(SPH_LO,0x140c10,u+s*-0.01,v-0.005,0.02*sc,0.03*sc,0.012,1.018,fp.open);
    feat(SPH_XS,0xffffff,u+0.02,v+0.03,0.013,0.015,0.008,1.026,fp.open);feat(SPH_XS,0xffffff,u-0.015,v-0.035,0.007,0.007,0.006,1.026,fp.open);
    feat(lid,0x1a1218,u,v+0.012,(girl?1.25:1.12)*sc,1.05,1,1.016,fp.open,0.12*Math.PI);
    if(girl)feat(BOX,0x1a1218,u+s*0.075,v+0.05,0.026,0.006,0.006,1.018,fp.open,s*0.6);
    feat(BOX,0x1a1218,u,v-0.01,0.06,0.009,0.009,1.01,fp.blink,0);feat(BOX,0x1a1218,u-0.025,v,0.032,0.008,0.008,1.01,fp.happy,0.5);feat(BOX,0x1a1218,u+0.025,v,0.032,0.008,0.008,1.01,fp.happy,-0.5);}
  feat(new T.TorusGeometry(girl?0.026:0.03,girl?0.006:0.0055,5,12,Math.PI),girl?0xd06070:0x9a4a48,girl?0:0.012,-0.42,1,1,1,0.995,fp.smile,Math.PI+(girl?0:0.06));
  feat(SPH_LO,0x6a2030,0,-0.44,0.04,0.03,0.014,0.99,fp.talk);feat(SPH_LO,0xf39ab0,0,-0.48,0.024,0.012,0.01,0.995,fp.talk);
  const face={};for(const k in fp){const m=M(fp[k]);m.castShadow=false;m.visible=k==='open'||k==='smile';g.add(m);face[k]=m;}g.userData.face=face;
  // arms: shoulder, upper arm, elbow, forearm, hand (sleeves and cuffs per top)
  const upper=seg2('ua2'+(girl?'g':'b'),girl?0.042:0.048,girl?0.036:0.04,0.12),fore=seg2('fa2'+(girl?'g':'b'),girl?0.035:0.04,girl?0.03:0.033,0.11);
  const sleeveC=h.top==='tank'?sk:tc,foreC=longS?tc:sk;
  for(const [nm,s] of [['armL',-1],['armR',1]]){const pv=new T.Group();pv.name=nm;pv.position.set(s*0.14*W,shY-0.03,0);pv.rotation.z=s*0.12;
    const ap=[P(SPH_LO,sleeveC,0,0,0,0,0,0,0.1,0.09,0.09),P(upper,h.top==='dress'||h.top==='tank'?sk:sleeveC,0,0,0,0,0,0),P(fore,foreC,0,-0.125,0.0,-0.12,0,0)];
    if(!longS&&h.top!=='tank'&&h.top!=='dress')ap.push(P(latheGeo('slv3',[[0.054,0],[0.057,0.04],[0.05,0.08],[0.0005,0.085]]),sleeveC,0,-0.085,0));
    if(longS)ap.push(P(latheGeo('cuff2',[[0.035,0],[0.041,0.012],[0.041,0.03],[0.035,0.04]]),dk(tc,0.1),0,-0.245,0.015,-0.12,0,0));
    ap.push(P(SPH,sk,0,-0.275,0.02,0,0,0,0.07,0.08,0.052),P(SPH_LO,sk,s*-0.026,-0.26,0.038,0,0,s*0.5,0.026,0.04,0.026));/* hand and thumb */
    pv.add(M(ap));g.add(pv);}
  // legs: thigh, knee, calf, and a sneaker (sole, toe cap, laces)
  const thigh=seg2('th2',0.062,0.05,0.14),calf=seg2('cf2',0.05,0.038,0.15),legTop=!dress&&h.bot==='trousers'?bc:sk,legBot=legTop;
  for(const [nm,s] of [['footL',-1],['footR',1]]){const pv=new T.Group();pv.name=nm;pv.position.set(s*0.062*W,hipY,0);
    const lp=[P(thigh,legTop,0,0,0),P(calf,legBot,0,-0.15,0)];if(h.bot==='shorts'&&!dress)lp.push(P(latheGeo('shrt2',[[0.066,0],[0.07,0.05],[0.068,0.1],[0.0005,0.11]]),bc,0,-0.09,0));
    if(legBot===sk)lp.push(P(latheGeo('sock3',[[0.04,0],[0.043,0.02],[0.04,0.045]]),0xf6f2ea,0,-0.32,0));
    lp.push(P(SPH,lt(h.shoe,0.55),0,-0.365,0.022,0,0,0,0.095,0.038,0.16),P(SPH,h.shoe,0,-0.345,0.02,0,0,0,0.088,0.065,0.14),P(SPH_LO,lt(h.shoe,0.7),0,-0.35,0.08,0,0,0,0.06,0.032,0.045),P(BOX,0xf6f2ea,0,-0.318,0.045,0.5,0,0,0.04,0.004,0.045));
    pv.add(M(lp));g.add(pv);}
  g.children.forEach(c=>{c.position.multiplyScalar(HUM_S);c.scale.multiplyScalar(HUM_S);});
  return g;}
/* ---- the editor ---- */
let charEd=null;
const H_TABS=[['look','Look'],['hair','Hair'],['face','Face'],['top','Top'],['bot','Bottoms'],['hat','Hats']];
function curHuman(){if(!S.look.h)S.look.h=Object.assign({},HDEF.boy);return S.look.h;}
// the editor's own little studio: a soft backdrop and a round stage, so you can dress up anywhere (indoors, at sea…)
const edScene=new T.Scene(),edCam=new T.PerspectiveCamera(30,1,0.05,60);
{edScene.add(new T.HemisphereLight(0xf4f0ff,0x8a9ab0,0.5));const d=new T.DirectionalLight(0xfff0e0,0.55);d.position.set(1.5,4,3);edScene.add(d);const d2=new T.DirectionalLight(0xc8dcff,0.18);d2.position.set(-3,1.5,-2);edScene.add(d2);const d3=new T.DirectionalLight(0xfff4ea,0.32);d3.position.set(0,0.6,5);edScene.add(d3);/* a soft fill from the front, so the face is evenly lit */
  const bg=new T.SphereGeometry(20,24,16),c=[],a=bg.attributes.position;for(let i=0;i<a.count;i++){const t=clamp((a.getY(i)+6)/22,0,1);const q=new T.Color(0xe8d4c4).lerp(new T.Color(0x9cc4dc),t);c.push(q.r,q.g,q.b);}
  bg.setAttribute('color',new T.Float32BufferAttribute(c,3));edScene.add(new T.Mesh(bg,new T.MeshBasicMaterial({vertexColors:true,side:T.BackSide,fog:false})));
  const st=M([P(CYL12,0xe8dcc8,0,-0.05,0,0,0,0,1.5,0.1,1.5),P(CYL12,0xc8b498,0,-0.12,0,0,0,0,1.56,0.06,1.56),P(CYL12,0xe0b8a0,0,0.002,0,0,0,0,1.1,0.004,1.1)]);st.castShadow=false;edScene.add(st);
  for(let i=0;i<14;i++){const an=i/14*6.283,r=2.2+Math.random()*1.5;const m=M([P(SPH_LO,[0xf8c8d8,0xfff0b0,0xc8e8ff,0xd8f0c8][i%4],0,0,0,0,0,0,0.12,0.12,0.12)],lumMat);m.position.set(Math.cos(an)*r,0.3+Math.random()*1.6,Math.sin(an)*r-1.5);m.userData.ph=Math.random()*6;edScene.add(m);}}
let edModel=null;
function edRebuild(){if(edModel){edScene.remove(edModel);edModel.traverse(o=>{if(o.isMesh&&o.geometry&&!o.geometry.userData.smooth)o.geometry.dispose();});}edModel=humanModel(curHuman());edScene.add(edModel);}
function openCharEd(){closeSheet&&closeSheet();if(chat)chatEnd();if(deco)decoClose();
  if(S.look.sp!=='human'){S.look.prev=S.look.sp;S.look.sp='human';curHuman();applyLook();}
  charEd={tab:'look',spin:0,t:0};vil.tx=vil.x;vil.tz=vil.z;vil.path=null;edRebuild();
  document.body.classList.add('chatting','chared');$('charEd').hidden=false;renderCharEd();SFX.ui();}
function closeCharEd(){if(!charEd)return;charEd=null;edCam.clearViewOffset();if(inside&&inside.me){inside.me.clear();inside.me.add(villager.children[0].clone());}/* you, in the room you're in */$('charEd').hidden=true;document.body.classList.remove('chatting','chared');save();ctxSig='';updateCtx();updateHUD();hearts(vil.x,1.2,vil.z);SFX.level();}
function setH(ch){Object.assign(curHuman(),ch);applyLook();if(charEd){edRebuild();charEd.hop=0.3;}renderCharEd();SFX.pop();}
function shuffleH(){const R=Math.random,pk=a=>a[Math.floor(R()*a.length)],g=R()<0.5?'boy':'girl';
  setH({g,skin:Math.floor(R()*HSKIN.length),hair:pk(HSTYLE.hair)[0],hairC:Math.floor(R()*HHAIR.length),eye:Math.floor(R()*HEYES.length),top:pk(HSTYLE.top)[0],topC:pk(HCLOTH),bot:pk(HSTYLE.bot)[0],botC:pk(HCLOTH),shoe:pk(HCLOTH),hat:R()<0.5?'none':pk(HSTYLE.hat)[0],glasses:R()<0.2?1:0,blush:R()<0.6?1:0,freckles:R()<0.25?1:0});}
const hThumbs={};
function hThumb(ch){const h=Object.assign({},curHuman(),ch),k=JSON.stringify(h);if(hThumbs[k])return hThumbs[k];return hThumbs[k]=snapThumb(humanModel(h),96);}
function renderCharEd(){if(!charEd)return;const h=curHuman(),t=charEd.tab;const sw=(arr,key,cur,idx)=>`<div class="hsw">${arr.map((c,i)=>`<button class="sw ${(idx?i:c)===cur?'on':''}" data-hk="${key}" data-hv="${idx?i:c}" style="--sw:${hexCss(c)}"></button>`).join('')}</div>`;
  const tiles=(list,key)=>`<div class="htiles">${list.map(([id,n])=>`<button class="ht ${h[key]===id?'on':''}" data-hk="${key}" data-hs="${id}"><img src="${hThumb({[key]:id})}" alt=""><span>${n}</span></button>`).join('')}</div>`;
  let b='';
  if(t==='look')b=`<div class="hseg"><button class="${h.g==='boy'?'on':''}" data-hg="boy">Boy</button><button class="${h.g==='girl'?'on':''}" data-hg="girl">Girl</button></div><h4>Skin</h4>${sw(HSKIN,'skin',h.skin,1)}<h4>Eyes</h4>${sw(HEYES,'eye',h.eye,1)}<h4>Shoes</h4>${sw(HCLOTH,'shoe',h.shoe)}`;
  if(t==='hair')b=`${tiles(HSTYLE.hair,'hair')}<h4>Colour</h4>${sw(HHAIR,'hairC',h.hairC,1)}`;
  if(t==='face')b=`<div class="htog">${[['blush','Rosy cheeks'],['freckles','Freckles'],['glasses','Glasses']].map(([k,n])=>`<button class="${h[k]?'on':''}" data-ht="${k}">${n}</button>`).join('')}</div>`;
  if(t==='top')b=`${tiles(HSTYLE.top,'top')}<h4>Colour</h4>${sw(HCLOTH,'topC',h.topC)}`;
  if(t==='bot')b=h.top==='dress'?`<p class="hnote">You’re wearing a dress. Pick another top to choose bottoms.</p>`:`${tiles(HSTYLE.bot,'bot')}<h4>Colour</h4>${sw(HCLOTH,'botC',h.botC)}`;
  if(t==='hat')b=`${tiles(HSTYLE.hat,'hat')}<p class="hnote">Caps, bows and headbands take your top’s colour; beanies your bottoms’.</p>`;
  $('charEd').innerHTML=`<div class="htop"><b>Your character</b><button class="hbtn" data-ha="shuffle">🎲 Shuffle</button>${S.look.prev&&S.look.prev!=='human'?`<button class="hbtn" data-ha="animal">Be an animal</button>`:''}<button class="pbtn go" data-ha="done">Done</button></div>
    <div class="dtabs">${H_TABS.map(([k,n])=>`<button class="${t===k?'on':''}" data-htab="${k}">${n}</button>`).join('')}</div><div class="hbody">${b}</div>`;
  requestAnimationFrame(()=>{if(charEd){const W=window.innerWidth,H=window.innerHeight,px=$('charEd').offsetHeight;charEd.px=px;edCam.setViewOffset(W,H,0,px*0.5,W,H);}});}
$('charEd').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!charEd)return;const d=b.dataset;
  if(d.ha==='done'){closeCharEd();return;}if(d.ha==='shuffle'){shuffleH();return;}if(d.ha==='animal'){S.look.sp=S.look.prev||'bunny';applyLook();closeCharEd();return;}
  if(d.htab){charEd.tab=d.htab;SFX.ui();renderCharEd();return;}
  if(d.hg){const keep=curHuman();if(keep.g!==d.hg){const D=HDEF[d.hg];setH({g:d.hg,hair:D.hair,top:D.top,bot:D.bot,hat:D.hat,topC:D.topC});}return;}
  if(d.hs){setH({[d.hk]:d.hs});return;}if(d.hv!==undefined){setH({[d.hk]:+d.hv});return;}if(d.ht){setH({[d.ht]:curHuman()[d.ht]?0:1});return;}});
// the camera: close and level, facing you; drag sideways to turn round
// the studio camera: framed on you in the space above the tray; you turn slowly, sway, blink and bounce when something changes
function updateCharEd(dt,tt){if(!charEd||!edModel)return;charEd.t+=dt;const W=window.innerWidth,H=window.innerHeight,asp=W/H,f=1-(charEd.px||H*0.45)/H,tv=Math.tan(15*Math.PI/180);
  edCam.aspect=asp;const d=Math.max(0.64/(tv*f),0.5/(tv*asp))*1.05;edCam.position.set(0,0.6+d*0.1,d);edCam.lookAt(0,0.52,0);edCam.updateProjectionMatrix();
  charEd.hop=Math.max(0,(charEd.hop||0)-dt);edModel.position.y=Math.sin(Math.min(1,(0.3-charEd.hop)/0.3)*Math.PI)*(charEd.hop>0?0.08:0);
  edModel.rotation.y=charEd.spin+Math.sin(tt*0.6)*0.25;const L=limbsOf(edModel);if(L[0]){L[0].rotation.x=Math.sin(tt*1.6)*0.08;L[1].rotation.x=-Math.sin(tt*1.6)*0.08;L[1].rotation.z=charEd.hop>0?1.4:0.3;}
  const bl=(tt%3.6)<0.12;setFace(edModel,charEd.hop>0?'happy':bl?'blink':'open','smile');
  for(const m of edScene.children)if(m.userData.ph!==undefined)m.position.y+=Math.sin(tt+m.userData.ph)*dt*0.1;}
const charEdFocus=()=>chatFocus();
