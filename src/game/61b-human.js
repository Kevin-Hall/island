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
const HDEF={boy:{g:'boy',skin:2,hair:'short',hairC:1,eye:0,top:'tee',topC:0x5a8ae0,bot:'shorts',botC:0x3a4a7a,shoe:0xf4f0ea,hat:'none',glasses:0,blush:1,freckles:0},
  girl:{g:'girl',skin:1,hair:'ponytail',hairC:2,eye:1,top:'dress',topC:0xf39ab0,bot:'skirt',botC:0x5a8ae0,shoe:0xd8453a,hat:'bow',glasses:0,blush:1,freckles:0}};
// The model is sculpted, not stacked: the head is a sphere pushed out towards a rounded cube (HEAD_R, squircle), the
// hair one shell over it with the face cut out under a blunt fringe (hairGeo: each style is a fringe line, a hem,
// a volume and, for long hair, a pull downwards), and the body, arms and legs are turned on a lathe (latheGeo).
// Eyes, cheeks and mouth sit on the head's own surface (onHead), so the face is drawn on, not stuck on.
const HEAD_R=[0.31,0.28,0.27],HEAD_Y=0.71,HSQ=2.5,_hgeo=new Map();
const squ=(x,y,z)=>1/Math.pow(Math.abs(x)**HSQ+Math.abs(y)**HSQ+Math.abs(z)**HSQ,1/HSQ);
// a point on the head (or r× out from it) in the direction (u,v) across the face
function onHead(u,v,r=1){const w=Math.sqrt(Math.max(0,1-u*u-v*v)),s=squ(u,v,w)*r;return[u*s*HEAD_R[0],HEAD_Y+v*s*HEAD_R[1],w*s*HEAD_R[2],Math.atan2(u,w),-Math.asin(clamp(v,-1,1))];}
function headGeo(){if(_hgeo.has('head'))return _hgeo.get('head');const g=new T.SphereGeometry(1,40,30),a=g.attributes.position;
  for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i),z=a.getZ(i),s=squ(x,y,z);a.setXYZ(i,x*s*HEAD_R[0],y*s*HEAD_R[1],z*s*HEAD_R[2]);}
  g.computeVertexNormals();smoothG(g);_hgeo.set('head',g);return g;}
const HAIR_CUT={short:{f:0.3,hem:-0.1,back:-0.55},side:{f:'side',hem:-0.1,back:-0.55},spiky:{f:0.32,hem:-0.12,back:-0.5},buzz:{f:0.5,hem:-0.18,back:-0.5,r:1.025,top:0.01},
  curly:{f:0.34,hem:-0.15,back:-0.55,curl:1},mohawk:{f:0.55,hem:-0.2,back:-0.5,r:1.02,top:0},bob:{f:0.3,hem:-0.55,back:-0.6,side:0.6,pull:0.2},
  long:{f:0.3,hem:-0.55,back:-0.95,side:0.6,pull:0.95},ponytail:{f:0.3,hem:-0.12,back:-0.6},pigtails:{f:0.3,hem:-0.15,back:-0.6},bun:{f:0.3,hem:-0.12,back:-0.6},afro:{f:0.38,hem:-0.3,back:-0.6,r:1.38,top:0.12}};
function hairGeo(st){if(_hgeo.has(st))return _hgeo.get(st);const C=HAIR_CUT[st]||HAIR_CUT.short,g=new T.SphereGeometry(1,56,42),a=g.attributes.position;
  const fr=x=>C.f==='side'?0.42-0.36*clamp((x+0.55)/1.1,0,1):C.f+0.03*Math.cos(x*22);
  // how far a direction is inside the bare part (the face under the fringe, and below the hem): the hair dips under the
  // skin there, so its edge is where the two surfaces meet, a clean curve whatever the mesh
  const bare=(x,y,z)=>{const W=C.side||0.7,face=Math.min(fr(x)-y,W-Math.abs(x),(z-0.02)*1.5);
    const lock=C.side&&z>-0.1&&Math.abs(x)>=C.side-0.02&&y>C.hem-0.05,hem=lock?-1:(z<-0.25?C.back:z<0?lerp(C.hem,C.back,-z/0.25):C.hem)-y;return Math.max(face,hem,-0.9-y);};
  for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i),z=a.getZ(i);
    let r=(C.r||1.075)+(C.top??0.06)*Math.max(0,y);if(C.curl)r+=0.035*Math.sin(7*Math.atan2(z,x))*Math.sin(6*y+1);if(C.side&&Math.abs(x)>0.5)r+=0.03;
    if(st==='afro')r-=0.22*Math.max(0,z)*Math.max(0,-y+0.3);
    const d=bare(x,y,z),k=clamp((d+0.03)/0.07,0,1);r=lerp(r,0.9,k*k*(3-2*k));
    const s=squ(x,y,z)*r;let X=x*s*HEAD_R[0],Y=y*s*HEAD_R[1],Z=z*s*HEAD_R[2];
    if(C.pull&&y<-0.1&&z<0.45&&d<0){const q=(-0.1-y)*C.pull*(1.1-Math.max(0,z));Y-=q*0.42;X*=1-q*0.12;}
    a.setXYZ(i,X,Y,Z);}
  g.computeVertexNormals();smoothG(g);_hgeo.set(st,g);return g;}
// a shape turned on a lathe from a profile of [radius, height] points
function latheGeo(key,pts,seg=20){if(_hgeo.has(key))return _hgeo.get(key);const g=new T.LatheGeometry(pts.map(([r,y])=>new T.Vector2(r,y)),seg);g.computeVertexNormals();smoothG(g);_hgeo.set(key,g);return g;}
const capsule=(k,r,l)=>latheGeo('cap'+k,[...Array(7)].map((_,i)=>{const a=-Math.PI/2+i/6*Math.PI/2;return[Math.cos(a)*r,Math.sin(a)*r];}).concat([...Array(7)].map((_,i)=>{const a=i/6*Math.PI/2;return[Math.cos(a)*r,l+Math.sin(a)*r];})),14);
const tear=k=>latheGeo('tear'+k,[...Array(11)].map((_,i)=>{const t=i/10;return[Math.max(0.001,Math.sin(Math.PI*t)**0.75*(1-t*0.35)*0.5),t];}),16);
const hairMat=toon({vertexColors:true,side:T.DoubleSide});
function humanModel(h0){const h=Object.assign({},HDEF.boy,h0),g=new T.Group(),p=[],hp=[],sk=HSKIN[h.skin]??HSKIN[2],hc=HHAIR[h.hairC]??HHAIR[1],ec=HEYES[h.eye]??HEYES[0],tc=h.topC,bc=h.botC,girl=h.g==='girl';
  const dk=(c,t)=>lerpHex(c,0x1a1420,t),lt=(c,t)=>lerpHex(c,0xffffff,t),dress=h.top==='dress',legH=0.17,bodyY=legH-0.01;
  // body: a soft bell, shirt above the waist and shorts, trousers or skirt below it (or one dress all the way down)
  const topCol=h.top==='overalls'?tc:tc,shirt=latheGeo('shirt',[[0,0],[0.15,0],[0.16,0.04],[0.155,0.11],[0.13,0.17],[0.09,0.205],[0.03,0.22],[0,0.22]]);
  p.push(P(shirt,topCol,0,bodyY+0.08,0,0,0,0,1,1,0.86));
  if(h.top==='stripe')for(let i=0;i<3;i++)p.push(P(latheGeo('band',[[0.158,0],[0.162,0.01],[0.158,0.022]]),0xf8f6f0,0,bodyY+0.1+i*0.045,0,0,0,0,1-i*0.06,1,0.86-i*0.05));
  if(dress)p.push(P(latheGeo('dress',[[0.001,0.2],[0.13,0.2],[0.16,0.14],[0.2,0.04],[0.22,0],[0.2,-0.012],[0.001,-0.012]]),tc,0,bodyY-0.04,0,0,0,0,1,1,0.88),P(latheGeo('hemband',[[0.215,0],[0.222,0.012],[0.214,0.022]]),lt(tc,0.4),0,bodyY-0.035,0,0,0,0,1,1,0.88));
  else if(h.bot==='skirt')p.push(P(latheGeo('skirt',[[0.001,0.13],[0.15,0.13],[0.19,0.03],[0.2,0],[0.001,0]]),bc,0,bodyY-0.01,0,0,0,0,1,1,0.88));
  else p.push(P(latheGeo('shorts',[[0.001,0],[0.15,0],[0.16,0.05],[0.155,0.11],[0.001,0.11]]),bc,0,bodyY,0,0,0,0,1,1,0.86));
  if(h.top==='overalls'){p.push(P(latheGeo('bib',[[0.001,0],[0.152,0],[0.15,0.06],[0.001,0.06]]),bc,0,bodyY+0.1,0,0,0,0,1,1,0.88),P(BOX,bc,0,bodyY+0.2,0.11,-0.12,0,0,0.13,0.1,0.02));
    for(const s of [-1,1])p.push(P(BOX,bc,s*0.07,bodyY+0.24,0.06,-0.5,0,0,0.035,0.13,0.02),P(SPH_LO,0xf6d04a,s*0.055,bodyY+0.235,0.115,0,0,0,0.025,0.025,0.012));}
  if(h.top==='hoodie'){p.push(P(SPH_LO,dk(tc,0.12),0,bodyY+0.27,-0.1,0,0,0,0.22,0.1,0.12),P(BOX,dk(tc,0.1),0,bodyY+0.12,0.125,-0.1,0,0,0.13,0.06,0.02));for(const s of [-1,1])p.push(P(CYL8,0xf4f0ea,s*0.03,bodyY+0.2,0.12,0,0,0,0.012,0.07,0.012));}
  if(h.top==='sweater')p.push(P(latheGeo('collar',[[0.07,0],[0.095,0.012],[0.075,0.03]]),dk(tc,0.12),0,bodyY+0.27,0,0,0,0,1,1,0.9));
  if(h.top==='jacket'){p.push(P(BOX,0xf4f0ea,0,bodyY+0.17,0.115,-0.1,0,0,0.08,0.18,0.03));for(const s of [-1,1])p.push(P(BOX,dk(tc,0.15),s*0.05,bodyY+0.22,0.11,-0.2,0,s*0.35,0.035,0.1,0.02));}
  if(h.top==='tank'||h.top==='dress')p.push(P(latheGeo('neck',[[0.001,0],[0.07,0],[0.07,0.03],[0.001,0.03]]),sk,0,bodyY+0.28,0,0,0,0,1,1,0.9));
  // head, and a face drawn on it
  p.push(P(headGeo(),sk,0,HEAD_Y,0));
  const feat=(geo,col,u,v,sx,sy,sz,r=1.0,into=p)=>{const [x,y,z,ry,rx]=onHead(u,v,r);into.push(P(geo,col,x,y,z,rx,ry,0,sx,sy,sz));};
  if(h.blush)for(const s of [-1,1])feat(SPH_LO,0xf6a0a4,s*0.5,-0.24,0.085,0.05,0.02,0.985);
  if(h.freckles)for(const s of [-1,1])for(let i=0;i<3;i++)feat(SPH_XS,dk(sk,0.32),s*(0.38+i*0.06),-0.14-(i%2)*0.04,0.014,0.014,0.008,1.0);
  const showBrow=['buzz','mohawk','afro','side'].includes(h.hair);if(showBrow)for(const s of [-1,1])feat(BOX,dk(hc,0.1),s*0.3,0.2,0.07,0.014,0.012,1.005);
  const hairShell=hairGeo(h.hair);hp.push(P(hairShell,h.hair==='mohawk'?dk(hc,0.45):hc,0,HEAD_Y,0));
  // the extras some styles have
  const [tx,ty,tz]=onHead(0,0.7,1.1);
  switch(h.hair){
    case'spiky':for(let i=0;i<9;i++){const a=i/9*6.283,[x,y,z]=onHead(Math.cos(a)*0.4,0.82,1.06);hp.push(P(CONE8,hc,x,y,z,Math.sin(a)*0.55,0,-Math.cos(a)*0.55,0.09,0.15,0.09));}break;
    case'mohawk':for(let i=0;i<6;i++){const v=0.95-Math.abs(i-2.5)*0.05,zz=0.55-i*0.22,[x,y,z]=onHead(0,Math.sqrt(Math.max(0,1-zz*zz))*Math.sign(1),1.0);hp.push(P(CONE8,hc,0,HEAD_Y+HEAD_R[1]*0.95+0.04,zz*HEAD_R[2],-0.6+i*0.24,0,0,0.07,0.16,0.12));}break;
    case'ponytail':hp.push(P(SPH_LO,0xd8453a,0,HEAD_Y+0.13,-HEAD_R[2]*1.12,0,0,0,0.08,0.08,0.06),P(tear('pt'),hc,0,HEAD_Y+0.14,-HEAD_R[2]*1.18,Math.PI-0.65,0,0,0.3,0.42,0.26));break;
    case'pigtails':for(const s of [-1,1])hp.push(P(SPH_LO,0xf39ab0,s*HEAD_R[0]*1.12,HEAD_Y+0.03,-0.05,0,0,0,0.07,0.07,0.07),P(tear('pg'),hc,s*HEAD_R[0]*1.16,HEAD_Y+0.03,-0.05,Math.PI,0,s*0.45,0.26,0.4,0.24));break;
    case'bun':hp.push(P(SPH,hc,0,HEAD_Y+HEAD_R[1]*1.2,-0.07,0,0,0,0.22,0.2,0.22),P(latheGeo('bunring',[[0.07,0],[0.08,0.012],[0.07,0.022]]),0xf39ab0,0,HEAD_Y+HEAD_R[1]*1.0,-0.06));break;}
  if(girl&&!['buzz','mohawk'].includes(h.hair))for(const s of [-1,1])feat(BOX,0x1e1620,s*0.36,0.06,0.03,0.008,0.008,1.01);/* lashes */
  // something on your head (sat on the hair)
  const hy=HEAD_Y+HEAD_R[1]*(h.hair==='afro'?1.45:h.hair==='bun'?1.25:1.08);
  switch(h.hat){
    case'cap':hp.push(P(latheGeo('capdome',[[0.001,0.2],[0.12,0.19],[0.25,0.12],[0.34,0],[0.001,0]]),tc,0,hy-0.17,0,0,0,0,1.14,0.95,1.12),P(CYL12,tc,0,hy-0.15,0.27,0.1,0,0,0.38,0.02,0.24),P(SPH_XS,lt(tc,0.4),0,hy+0.0,0,0,0,0,0.05,0.04,0.05));break;
    case'beanie':hp.push(P(latheGeo('beanie',[[0.001,0.26],[0.16,0.24],[0.3,0.13],[0.35,0.02],[0.355,-0.06],[0.001,-0.06]]),bc,0,hy-0.14,-0.01,0,0,0,1.1,1.05,1.05),P(SPH_LO,lt(bc,0.5),0,hy+0.13,-0.01,0,0,0,0.12,0.12,0.12));break;
    case'sunhat':hp.push(P(CYL12,0xe8d090,0,hy-0.1,0,0,0,0,0.98,0.025,0.94),P(latheGeo('sunhat',[[0.001,0.16],[0.2,0.15],[0.26,0.05],[0.27,0],[0.001,0]]),0xe8d090,0,hy-0.1,0),P(latheGeo('hatband',[[0.262,0],[0.266,0.02],[0.258,0.04]]),tc,0,hy-0.1,0));break;
    case'bow':for(const s of [-1,1])hp.push(P(ICO2,tc,0.14+s*0.06,hy-0.02,0.02,0,s*0.3,s*0.5,0.11,0.08,0.05));hp.push(P(ICO2,dk(tc,0.15),0.14,hy-0.02,0.03,0,0,0,0.045,0.045,0.045));break;
    case'flower':for(let k=0;k<2;k++){const cx=0.17+k*0.07,cy=hy-0.05-k*0.035;for(let i=0;i<5;i++){const a=i/5*6.283;hp.push(P(SPH_LO,0xfff0a0,cx+Math.cos(a)*0.035,cy+Math.sin(a)*0.035,0.13,0,0,a,0.05,0.035,0.02));}hp.push(P(SPH_LO,0xf0a030,cx,cy,0.14,0,0,0,0.03,0.03,0.02));}break;
    case'headband':hp.push(P(latheGeo('hband',[[0.335,0],[0.34,0.02],[0.335,0.04]]),tc,0,HEAD_Y+HEAD_R[1]*0.55,-0.02,-0.3,0,0,1,1,0.92));break;
    case'band':hp.push(P(latheGeo('bandana',[[0.33,0],[0.338,0.03],[0.33,0.06]]),tc,0,HEAD_Y+HEAD_R[1]*0.42,-0.01,-0.18,0,0,1,1,0.92),P(ICO2,tc,0.05,HEAD_Y+0.1,-0.29,0.4,0,0.6,0.07,0.12,0.03),P(ICO2,tc,-0.04,HEAD_Y+0.08,-0.29,0.3,0,-0.5,0.06,0.11,0.03));break;}
  if(h.glasses){for(const s of [-1,1]){feat(latheGeo('lens',[[0.04,0],[0.05,0.004],[0.04,0.008]]),0x2a2026,s*0.3,-0.05,1,1,1,1.03,hp);}const [x,y,z]=onHead(0,-0.04,1.04);hp.push(P(BOX,0x2a2026,x,y,z,0,0,0,0.05,0.01,0.01));}
  g.add(M(p));if(hp.length){const hm=M(hp,hairMat);g.add(hm);}
  // eyes: small dark ovals set wide, a glint in each; closed and happy versions; a little smile
  const fp={open:[],blink:[],happy:[],smile:[],talk:[]};
  for(const s of [-1,1]){const u=s*0.31,v=-0.07;feat(SPH_LO,0x1a1218,u,v,0.058,0.082,0.025,1.0,fp.open);feat(SPH_LO,ec,u,v-0.035,0.03,0.035,0.02,1.012,fp.open);feat(SPH_XS,0xffffff,u+0.03,v+0.06,0.018,0.022,0.01,1.025,fp.open);
    feat(BOX,0x1a1218,u,v-0.02,0.055,0.012,0.012,1.01,fp.blink);feat(BOX,0x1a1218,u-0.035,v,0.035,0.011,0.011,1.01,fp.happy);fp.happy[fp.happy.length-1].rz=0.6;feat(BOX,0x1a1218,u+0.035,v,0.035,0.011,0.011,1.01,fp.happy);fp.happy[fp.happy.length-1].rz=-0.6;}
  const smile=latheGeo('smileL',[[0.001,0],[0.03,0],[0.03,0.004],[0.001,0.004]],10);
  feat(new T.TorusGeometry(0.028,0.006,5,12,Math.PI),0x7a2a34,0,-0.27,1,1,1,1.0,fp.smile);fp.smile[0].rz=Math.PI;
  feat(SPH_LO,0x6a2030,0,-0.3,0.05,0.04,0.02,0.995,fp.talk);feat(SPH_LO,0xf39ab0,0,-0.34,0.03,0.015,0.012,1.0,fp.talk);
  const face={};for(const k in fp){const m=M(fp[k]);m.castShadow=false;m.visible=k==='open'||k==='smile';g.add(m);face[k]=m;}g.userData.face=face;
  // arms: soft tubes with a sleeve and a mitten hand, on shoulder pivots; legs: little tubes with round shoes
  const longS=['hoodie','sweater','jacket'].includes(h.top),noS=h.top==='tank'||h.top==='overalls'&&false,arm=capsule('arm',0.042,0.11);
  for(const [nm,s] of [['armL',-1],['armR',1]]){const pv=new T.Group();pv.name=nm;pv.position.set(s*0.14,bodyY+0.25,0);pv.rotation.z=s*0.35;
    const ap=[P(arm,longS?tc:sk,0,-0.16,0,0,0,0)];if(!noS&&h.top!=='tank'&&h.top!=='dress')ap.push(P(latheGeo('sleeve'+(longS?'L':'S'),longS?[[0.05,0],[0.054,0.1],[0.048,0.13]]:[[0.052,0],[0.058,0.05],[0.05,0.07]]),h.top==='overalls'?tc:tc,0,longS?-0.13:-0.065,0));
    ap.push(P(SPH,sk,0,-0.17,0.005,0,0,0,0.1,0.1,0.095));pv.add(M(ap));g.add(pv);}
  const leg=capsule('leg',0.045,0.08),legC=dress||h.bot!=='trousers'?sk:bc;
  for(const [nm,s] of [['footL',-1],['footR',1]]){const pv=new T.Group();pv.name=nm;pv.position.set(s*0.065,legH+0.02,0);
    const lp=[P(leg,legC,0,-0.14,0,0,0,0),P(SPH,h.shoe,0,-0.15,0.02,0,0,0,0.11,0.08,0.15),P(CYL12,lt(h.shoe,0.5),0,-0.185,0.02,0,0,0,0.105,0.012,0.14)];
    if(h.top!=='dress'&&h.bot==='shorts')lp.push(P(SPH_XS,0xf6f2ea,0,-0.11,0,0,0,0,0.095,0.02,0.095));/* socks */
    pv.add(M(lp));g.add(pv);}
  return g;}
/* ---- the editor ---- */
let charEd=null;
const H_TABS=[['look','Look'],['hair','Hair'],['face','Face'],['top','Top'],['bot','Bottoms'],['hat','Hats']];
function curHuman(){if(!S.look.h)S.look.h=Object.assign({},HDEF.boy);return S.look.h;}
function openCharEd(){closeSheet&&closeSheet();if(inside||S.sea)return toast('Step outside onto dry land to change your look.');
  if(S.look.sp!=='human'){S.look.prev=S.look.sp;S.look.sp='human';curHuman();applyLook();}
  introCam=null;charEd={tab:'look',spin:0,saved:{dist:cam.dist,pitch:cam.pitch,yaw:cam.yaw}};vil.tx=vil.x;vil.tz=vil.z;vil.path=null;
  document.body.classList.add('chatting','chared');$('charEd').hidden=false;renderCharEd();SFX.ui();}
function closeCharEd(){if(!charEd)return;chatBack={...charEd.saved,t:0};charEd=null;camera.clearViewOffset();$('charEd').hidden=true;document.body.classList.remove('chatting','chared');save();ctxSig='';updateCtx();updateHUD();hearts(vil.x,1.2,vil.z);SFX.level();}
function setH(ch){Object.assign(curHuman(),ch);applyLook();renderCharEd();SFX.pop();}
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
  requestAnimationFrame(()=>{if(charEd){const W=window.innerWidth,H=window.innerHeight,px=$('charEd').offsetHeight;camera.setViewOffset(W,H,0,px*0.32,W,H);}});}
$('charEd').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!charEd)return;const d=b.dataset;
  if(d.ha==='done'){closeCharEd();return;}if(d.ha==='shuffle'){shuffleH();return;}if(d.ha==='animal'){S.look.sp=S.look.prev||'bunny';applyLook();closeCharEd();return;}
  if(d.htab){charEd.tab=d.htab;SFX.ui();renderCharEd();return;}
  if(d.hg){const keep=curHuman();if(keep.g!==d.hg){const D=HDEF[d.hg];setH({g:d.hg,hair:D.hair,top:D.top,bot:D.bot,hat:D.hat,topC:D.topC});}return;}
  if(d.hs){setH({[d.hk]:d.hs});return;}if(d.hv!==undefined){setH({[d.hk]:+d.hv});return;}if(d.ht){setH({[d.ht]:curHuman()[d.ht]?0:1});return;}});
// the camera: close and level, facing you; drag sideways to turn round
function updateCharEd(dt,tt){if(!charEd)return;const s=charEd.saved,k=Math.min(1,dt*3);
  camera.fov+=(CHAT_FOV-camera.fov)*k;camera.updateProjectionMatrix();
  const dist=(camera.aspect<0.8?7.2:5.4)*Math.tan(FOV0*Math.PI/360)/Math.tan(CHAT_FOV*Math.PI/360);cam.dist+=(dist-cam.dist)*k;cam.pitch+=(0.26-cam.pitch)*k;
  villager.rotation.y=cam.yaw+charEd.spin+Math.sin(tt*0.8)*0.06;if(Math.random()<dt*0.3)vil.hop=0.25;}
const charEdFocus=()=>[vil.x-Math.sin(cam.yaw)*0.2,vil.z-Math.cos(cam.yaw)*0.2];
