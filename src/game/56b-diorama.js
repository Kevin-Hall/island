/* =========================================================
   Homes inside: floating dioramas
   ========================================================= */
// A home isn't a box with three walls: it's a round room cut open like a dollhouse, sitting on its own little chunk of
// island (grass rim, layered earth, dangling roots) that floats in the sky of the hour. A curved wall wraps the back,
// with porthole windows, a door and fairy lights along its top; ribs arch overhead in the owner's style (a sailor's
// upturned hull, a dreamer's star dome, a tinkerer's copper pipes...). A loft runs round the back with the bed up
// there, reached by a ladder you climb. The camera frames the whole diorama for the screen's shape (fitRoomCam), so a
// tall phone sees all of it, loft to roots.
const DIO={LY:2.05};
const DIO_STYLE={
  home:    {wall:0xf4e6c8,trim:0xb07a4a,floor:[0xc8905a,0xb8804a],rug:0x5fae44,rib:0x9a6a3a,grass:0x6ab04a,deco:'tree',  lights:0xffd890},
  sailor:  {wall:0xdce8f2,trim:0x2f4f7a,floor:[0xb8905e,0xa8804e],rug:0x2f4f7a,rib:0x8a5a3a,grass:0x5aa84a,deco:'hull',  lights:0xfff0c0},
  dreamer: {wall:0xe4dcf4,trim:0x8a7ac8,floor:[0xe8dcc8,0xdccfb8],rug:0x9a8ad8,rib:0xc8b8f0,grass:0x7ab85a,deco:'dome',  lights:0xc8b8ff},
  tinkerer:{wall:0xe8dcc4,trim:0x8a5a2a,floor:[0x8a6040,0x7a5236],rug:0xd8903a,rib:0xc87a3a,grass:0x6a9a44,deco:'pipes', lights:0xffc070},
  homebody:{wall:0xf6ecd8,trim:0xd8b088,floor:[0xd8b088,0xc8a078],rug:0x9ad0a0,rib:0xd8b860,grass:0x78b850,deco:'thatch',lights:0xffe0a0},
  explorer:{wall:0xdcecd8,trim:0x5a8a5a,floor:[0xc8a878,0xb89868],rug:0xd86a3a,rib:0xe8d8b0,grass:0x5aa048,deco:'tent',  lights:0xfff4d0},
  scholar: {wall:0xe8d8c8,trim:0x6a3a3a,floor:[0x7a5236,0x6a4428],rug:0x8a3a4a,rib:0x5a3a2a,grass:0x5a9a4a,deco:'books', lights:0xffe8b0}};
function buildDiorama(kind,n){const home=kind==='home',st=home?homeLookStyle():DIO_STYLE[n.pers]||DIO_STYLE.home,R=home?2.5+(S.house||0)*0.22:2.7,LY=DIO.LY,WH=LY+1.45;
  const p=[],gl=[],lum=[],sway=[],R0=mulberry(home?S.worldSeed|0:hi(n.i,7,11));const light=(c,t)=>lerpHex(c,0xffffff,t),dark=(c,t)=>lerpHex(c,0x1a1420,t);
  // floor: planks across a disc, on a slab with a trim edge
  const fc=st.floor,fN=fc.length;
  if(st.floorPat==='tiles'){for(let x=-R+0.25;x<R;x+=0.5)for(let z=-R+0.25;z<R;z+=0.5){if(Math.hypot(x,z)>R-0.18)continue;p.push(P(BOX,fc[(Math.round((x+R)/0.5)+Math.round((z+R)/0.5))%fN],x,-0.05,z,0,0,0,0.49,0.1,0.49));}
    p.push(P(CYL12,fc[0],0,-0.08,0,0,0,0,R*2-0.02,0.08,R*2-0.02));}
  else for(let x=-R+0.2;x<R;x+=0.4){const L=2*Math.sqrt(Math.max(0,R*R-x*x))-0.04;if(L>0.1)p.push(P(BOX,fc[Math.round((x+R)/0.4)%fN],x,-0.05,0,0,0,0,0.39,0.1,L));}
  p.push(P(CYL12,st.trim,0,-0.2,0,0,0,0,R*2+0.14,0.22,R*2+0.14));
  // the island chunk underneath: a grass rim, then earth in bands narrowing to a rocky point, roots and stones in it
  p.push(P(CYL12,st.grass,0,-0.4,0,0,0,0,R*2+0.7,0.3,R*2+0.7),P(CYL12,dark(st.grass,0.25),0,-0.56,0,0,0,0,R*2+0.62,0.06,R*2+0.62));
  [[0x8a5a3a,1.0,-0.9,0.7],[0x7a4a30,0.86,-1.55,0.7],[0x6a6070,0.68,-2.15,0.6],[0x5a5262,0.46,-2.65,0.5]].forEach(([c,f,y,h])=>p.push(P(CYL12,c,0,y,0,0,R0()*3,0,(R+0.3)*2*f,h,(R+0.3)*2*f)));
  p.push(P(CONE12,0x4a4252,0,-3.3,0,Math.PI,0,0,(R+0.3)*0.9,0.8,(R+0.3)*0.9));
  for(let i=0;i<9;i++){const a=R0()*6.28,y=-0.8-R0()*1.3,rr=(R+0.3)*(1-(-0.8-y)/2.2*0.6);p.push(P(ICO,[0x9a8a7a,0xb0a090,0x7a6a5a][i%3],Math.cos(a)*rr,y,Math.sin(a)*rr,R0(),R0(),R0(),0.28,0.2,0.24));}
  for(let i=0;i<6;i++){const a=R0()*6.28,rr=R*0.9,x0=Math.cos(a)*rr,z0=Math.sin(a)*rr,pts=[[x0,-0.7,z0]];let x=x0,z=z0,y=-0.7;for(let k=0;k<4;k++){x+=(R0()-0.5)*0.3+Math.cos(a)*0.12;z+=(R0()-0.5)*0.3+Math.sin(a)*0.12;y-=0.35+R0()*0.2;pts.push([x,y,z]);}
    for(let k=0;k<pts.length-1;k++)limb(p,0x6a4a30,...pts[k],...pts[k+1],0.07-k*0.012);}
  // grass tufts and flowers round the front of the rim
  for(let i=0;i<22;i++){const a=-0.4+R0()*(Math.PI+0.8),rr=R+0.12+R0()*0.2,x=Math.cos(a)*rr,z=Math.sin(a)*rr;if(z<-0.3&&Math.abs(x)<R*0.7)continue;
    p.push(P(CONE5,light(st.grass,0.15),x,-0.2,z,0,R0()*3,0,0.12,0.22,0.12));if(R0()<0.45)p.push(P(ICO0,(st.flowers||[0xf6d04a,0xf39ab0,0xffffff,0xb89aff])[i%(st.flowers?st.flowers.length:4)],x,-0.08,z,0,0,0,0.1,0.08,0.1));}
  // the curved wall round the back: tall behind the loft, sweeping down towards the open front
  const segs=26,a0=-0.28,a1=Math.PI+0.28,wallH=a=>{const s=Math.sin(clamp(a,0,Math.PI));return 0.7+(WH-0.7)*Math.pow(s,0.55);};
  p.push(P(arcWall(R,R+0.14,a0,a1,wallH,40),st.wall),P(arcWall(R-0.03,R+0.15,a0,a1,()=>0.9,40),dark(st.trim,0.1)),P(arcWall(R-0.04,R+0.2,a0,a1,a=>wallH(a)+0.08,40,wallH),st.trim));
  for(let i=0;i<segs;i++){const a=a0+(i+0.5)/segs*(a1-a0),h=wallH(a),x=Math.cos(a)*(R-0.02),z=-Math.sin(a)*(R-0.02);
    const lc=st.lights==='rainbow'?TINTS[i%8]:st.lights;if(i%2===0&&lc!=null)lum.push(P(ICO0,lc,x,h-0.08,z,0,0,0,0.09,0.09,0.09));/* fairy lights along the top */
    if(i%3===1&&!st.wallPat)p.push(P(BOX,light(st.wall,0.18),x*0.998,(h+0.9)/2,z*0.998,0,Math.PI/2-a,0,0.05,h-0.9,0.02));/* a thin panel line */}
  // wallpaper patterns
  if(st.wallPat){const pat=st.wallPat,c2=st.wall2,ry=a=>Math.PI/2-a,at=(a,r,y)=>[Math.cos(a)*r,y,-Math.sin(a)*r];
    if(pat==='stripe')for(let i=0;i<36;i+=2){const a=a0+(i+0.5)/36*(a1-a0),h=wallH(a);p.push(P(BOX,c2,...at(a,R-0.012,(h+0.9)/2),0,ry(a),0,R*(a1-a0)/36,h-0.9,0.02));}
    if(pat==='planks')for(let y=1.1;y<WH;y+=0.3)p.push(P(arcWall(R-0.012,R-0.005,a0,a1,a=>Math.min(y+0.03,wallH(a)),40,a=>Math.min(y,wallH(a))),c2));
    if(pat==='brick')for(let r=0,y=1.0;y<WH;y+=0.22,r++){p.push(P(arcWall(R-0.012,R-0.006,a0,a1,a=>Math.min(y+0.02,wallH(a)),40,a=>Math.min(y,wallH(a))),c2));
      for(let a=a0+(r%2?0.06:0.12);a<a1;a+=0.12)if(wallH(a)>y+0.22)p.push(P(BOX,c2,...at(a,R-0.012,y+0.11),0,ry(a),0,0.02,0.2,0.02));}
    if(pat==='dots'||pat==='stars')for(let i=0;i<70;i++){const a=a0+R0()*(a1-a0),h=wallH(a),y=1.0+R0()*(h-1.1);if(y>h-0.1)continue;
      (pat==='stars'?lum:p).push(P(pat==='stars'?ICO0:CYL12,c2,...at(a,R-0.015,y),Math.PI/2,ry(a),0,pat==='stars'?0.06:0.14,0.02,pat==='stars'?0.06:0.14));}}
  // porthole windows, and the door you leave by
  const winP=[];for(const a of [0.62,Math.PI-0.62]){const x=Math.cos(a)*(R-0.01),z=-Math.sin(a)*(R-0.01),ry=Math.PI/2-a;
    p.push(P(CYL12,st.trim,x,1.35,z,Math.PI/2,ry,0,0.86,0.1,0.86));winP.push(P(CYL12,0xffffff,x*0.985,1.35,z*0.985,Math.PI/2,ry,0,0.66,0.02,0.66));
    p.push(P(BOX,st.trim,x*0.975,1.35,z*0.975,0,ry,0,0.66,0.05,0.04),P(BOX,st.trim,x*0.975,1.35,z*0.975,0,ry,0,0.05,0.66,0.04));}
  const da=0.28,dx=Math.cos(da)*(R-0.02),dz=-Math.sin(da)*(R-0.02),dry=Math.PI/2-da;
  p.push(P(BOX,dark(st.rib,0.2),dx,0.62,dz,0,dry,0,0.84,1.24,0.1),P(CYL12,dark(st.rib,0.2),dx,1.24,dz,Math.PI/2,dry,0,0.84,0.1,0.84),P(BOX,st.rib,dx*0.985,0.6,dz*0.985,0,dry,0,0.7,1.16,0.05),P(ICO2,0xf6d04a,dx*0.975+Math.cos(dry)*0.22,0.62,dz*0.975-Math.sin(dry)*0.22,0,0,0,0.08,0.08,0.08));
  // the loft round the back: planks on beams, a rail, and a ladder up the right-hand side
  const ZL=-R+1.3,LX=R*0.5;
  for(let x=-R+0.2;x<R;x+=0.4){const zb=-Math.sqrt(Math.max(0,R*R-x*x));if(zb>ZL-0.1)continue;const L=ZL-zb;p.push(P(BOX,st.floor[Math.round((x+R)/0.4)%2],x,LY-0.05,(ZL+zb)/2,0,0,0,0.39,0.1,L));}
  {const xe=Math.sqrt(R*R-ZL*ZL);p.push(P(BOX,dark(st.floor[0],0.2),0,LY-0.16,ZL-0.05,0,0,0,xe*2,0.16,0.14));
    for(let x=-xe+0.25;x<xe-0.1;x+=0.42){if(Math.abs(x-LX)<0.35)continue;p.push(P(CYL6,st.trim,x,LY+0.25,ZL-0.05,0,0,0,0.05,0.5,0.05));}
    for(const [x0,x1] of [[-xe+0.1,LX-0.32],[LX+0.32,xe-0.1]])p.push(P(BOX,st.trim,(x0+x1)/2,LY+0.5,ZL-0.05,0,0,0,x1-x0,0.06,0.07));
    for(const x of [-xe*0.55,xe*0.1])p.push(P(CYL8,dark(st.floor[0],0.25),x,LY/2-0.1,ZL-0.2,0,0,0,0.14,LY-0.2,0.14));}
  const LB=[LX,ZL+0.55],LT=[LX,ZL-0.35];/* ladder foot (floor) and head (loft) */
  for(const s of [-0.24,0.24])limb(p,0x8a5a3a,LX+s,0,ZL+0.55,LX+s,LY+0.55,ZL-0.02,0.07);
  for(let k=1;k<7;k++){const t=k/7;p.push(P(BOX,0xa87444,LX,t*(LY+0.4),ZL+0.55-t*0.55,0,0,0,0.5,0.05,0.07));}
  // ribs arching overhead in the owner's style
  const ribs=(n,col,w,rise,reach)=>{for(let i=0;i<n;i++){const a=0.25+i/(n-1)*(Math.PI-0.5),x=Math.cos(a)*R,z=-Math.sin(a)*R,h=wallH(a),pts=[];
      for(let k=0;k<=5;k++){const t=k/5;pts.push([x*(1-t*reach),h+Math.sin(t*Math.PI*0.62)*rise,z*(1-t*reach)]);}for(let k=0;k<5;k++)limb(p,col,...pts[k],...pts[k+1],w);}};
  switch(st.deco){
    case'hull':ribs(7,st.rib,0.13,1.25,0.97);limb(p,dark(st.rib,0.15),0,WH+1.2,-R*0.9,0,WH+1.25,R*0.2,0.18);/* the keel */p.push(P(CYL12,0x8a5a3a,-R*0.45,1.4,-R*0.72,Math.PI/2,0.6,0,0.7,0.06,0.7));for(let i=0;i<8;i++){const b=i/8*6.28;p.push(P(BOX,0x6a4428,-R*0.45+Math.cos(b)*0.36*0.8,1.4+Math.sin(b)*0.36,-R*0.72+Math.cos(b)*0.36*0.6,0,0.6,b,0.05,0.34,0.05));}
      for(let i=0;i<5;i++){const a=0.5+i*0.5;limb(p,0xd8c8a0,Math.cos(a)*R*0.9,WH-0.1,-Math.sin(a)*R*0.9,Math.cos(a+0.5)*R*0.9,WH-0.35,-Math.sin(a+0.5)*R*0.9,0.03);}break;
    case'dome':ribs(9,st.rib,0.06,1.4,0.9);for(let i=0;i<14;i++){const a=0.3+R0()*(Math.PI-0.6),t=R0()*0.8;lum.push(P(ICO0,[0xfff4c0,0xc8b8ff,0xa8e8ff][i%3],Math.cos(a)*R*(1-t*0.9),WH+Math.sin(t*Math.PI*0.62)*1.3,-Math.sin(a)*R*(1-t*0.9),0,0,0,0.1,0.1,0.1));}
      lum.push(P(SPH,0xf6f0d0,-R*0.3,WH+0.9,-R*0.4,0,0,0,0.42,0.42,0.42));break;
    case'pipes':for(let i=0;i<3;i++){const y=1.0+i*0.55;const pts=[];for(let k=0;k<=10;k++){const a=0.15+k/10*(Math.PI-0.3);pts.push([Math.cos(a)*(R-0.12),y,-Math.sin(a)*(R-0.12)]);}for(let k=0;k<10;k++)limb(p,[0xc87a3a,0xa8a8b8,0xc8a03a][i],...pts[k],...pts[k+1],0.08);}
      for(const [a,s] of [[1.2,0.5],[1.9,0.36]]){const x=Math.cos(a)*(R-0.1),z=-Math.sin(a)*(R-0.1);for(let t=0;t<10;t++){const b=t/10*6.28;p.push(P(BOX,0xc8a03a,x+Math.cos(b)*s*Math.sin(a),WH-0.5+Math.sin(b)*s,z+Math.cos(b)*s*Math.cos(a),0,Math.PI/2-a,b,0.12,0.14,0.06));}p.push(P(CYL12,0xb8903a,x,WH-0.5,z,Math.PI/2,Math.PI/2-a,0,s*1.6,0.08,s*1.6));}
      ribs(5,0x7a7a88,0.1,0.8,0.6);break;
    case'thatch':for(let i=0;i<16;i++){const a=0.55+i/15*(Math.PI-1.1),x=Math.cos(a)*R,z=-Math.sin(a)*R,h=wallH(a);limb(p,i%2?0xd8b860:0xc8a450,x*1.02,h,z*1.02,x*0.2,h+1.5,z*0.55,0.3);}
      for(let i=0;i<5;i++){const a=0.9+i*0.35;p.push(P(SPH_LO,[0xd84a4a,0xf6d04a,0xf6f0e0][i%3],Math.cos(a)*R*0.45,WH+0.9-i*0.05,-Math.sin(a)*R*0.62,0,0,0,0.16,0.2,0.16));}/* drying flowers hung under the eaves */break;
    case'tent':ribs(5,0xa8a8b0,0.05,1.2,0.85);for(let i=0;i<8;i++){const a=0.3+i/7*(Math.PI-0.6),b=a+0.34;p.push(P(BOX,i%2?0xd86a3a:0xf6ecd8,Math.cos(a+0.17)*R*0.6,WH+0.75,-Math.sin(a+0.17)*R*0.6,0.5,Math.PI/2-a-0.17,0,R*0.45,0.04,R*0.8));}
      for(let i=0;i<7;i++){const a=0.4+i*0.35;lum.push(P(ICO0,[0xff6a6a,0xffd04a,0x6ad0ff,0x9aff6a][i%4],Math.cos(a)*R*0.7,WH+0.3,-Math.sin(a)*R*0.7,0,0,0,0.14,0.2,0.04));}break;
    case'books':for(let i=0;i<9;i++){const a=0.35+i/8*(Math.PI-0.7),x=Math.cos(a)*(R-0.16),z=-Math.sin(a)*(R-0.16),ry=Math.PI/2-a;if(Math.abs(a-0.62)<0.3||Math.abs(a-(Math.PI-0.62))<0.3)continue;
        for(let r=0;r<4;r++){p.push(P(BOX,0x5a3a2a,x,0.55+r*0.52+(r>1?0.35:0),z,0,ry,0,0.7,0.04,0.28));for(let j=0;j<5;j++)p.push(P(BOX,[0xd8453a,0x5a8ae0,0x6ab84a,0xf6d04a,0x9a6ad0,0x8a3a4a][(i+j+r)%6],x+Math.cos(ry)*(-0.24+j*0.12),0.7+r*0.52+(r>1?0.35:0),z-Math.sin(ry)*(-0.24+j*0.12),0,ry,0,0.09,0.26,0.2));}}
      ribs(6,st.rib,0.1,0.9,0.7);break;
    case'none':break;
    default:{/* your own home: the trunk of a great tree grows up through the middle of the back wall, branches spreading overhead */
      const tx=R*0.12,tz=-R+0.3;p.push(PG(STRUNK,0x8a5a36,0x6a4428,tx,WH/2+0.4,tz,0,0,0,0.9,WH+0.9,0.9));
      for(const [a,l] of [[0.5,1.6],[1.4,1.8],[2.4,1.5],[3.0,1.3]]){const x1=tx+Math.cos(a)*l,z1=tz+Math.abs(Math.sin(a))*l*0.9,y1=WH+0.6+R0()*0.5;limb(p,0x7a5030,tx,WH,tz,x1,y1,z1,0.18);
        for(let k=0;k<4;k++)sway.push(P(SPH,[0x6cb04a,0x5a9e3e,0x7cc05a][k%3],x1+(R0()-0.5)*0.9,y1+0.2+R0()*0.4,z1+(R0()-0.5)*0.7,0,0,0,0.9+R0()*0.4,0.6+R0()*0.3,0.8+R0()*0.3));}
      for(let i=0;i<10;i++){const a=0.4+i*0.25;lum.push(P(ICO0,st.lights,Math.cos(a)*R*0.6,WH+0.25-Math.sin(i*0.7)*0.12,-Math.sin(a)*R*0.5,0,0,0,0.09,0.09,0.09));}}}
  // a big round rug in the middle, and a hanging lamp over it
  if(st.rugPat==='rainbow')[0xf07a7a,0xf0b060,0xf0e070,0x7ad07a,0x7ab0f0,0xb08ae0].forEach((c,i)=>p.push(P(CYL12,c,0,0.01+i*0.004,0.35,0,0,0,2.4-i*0.36,0.02,2.0-i*0.3)));
  else if(st.rug!=null)p.push(P(CYL12,st.rug,0,0.01,0.35,0,0,0,2.4,0.02,2.0),P(CYL12,light(st.rug,0.35),0,0.02,0.35,0,0,0,1.6,0.02,1.3),P(CYL12,st.rug,0,0.03,0.35,0,0,0,0.8,0.02,0.64));
  // furniture: the bed up in the loft, the rest round the floor
  const props=[],put=(k,x,z,ry,label,c,y=0,lv=0)=>{const f=furn(k,c||st.rug);p.push(...shift(f.p,x,y,z,ry));gl.push(...shift(f.gl,x,y,z,ry));props.push({x,y:y+0.45,z,w:1.0,d:1.0,label,k,lv});};
  if(!home){/* (your own home is furnished by you: 56c) */put('bed',-R*0.4,-R+0.66,Math.PI/2,'bed',st.rug,LY,1);
  put('lamp',R*0.1,-R+0.45,0,'lamp',null,LY,1);
  put('table',-0.55,0.55,0,'table');put('chair',-1.25,0.55,1.57,'chair',st.trim);
  put('plant',-R+0.55,0.9,0,'plant');put('lamp',R-0.55,1.15,0,'lamp');
  {const extra={sailor:['fishtank','armchair'],dreamer:['stereo','beanbag'],tinkerer:['workbench','shelf'],homebody:['counter','fireplace'],explorer:['bag','tv'],scholar:['shelf','piano']}[n.pers]||['armchair','plant'];
    put(extra[0],R-0.8,0.85,-1.3,extra[0]);put(extra[1],-R+0.78,-0.4,1.1,extra[1]);}}
  props.push({x:dx,y:0.62,z:dz,w:1,d:1,label:'exit',lv:0});
  const g=new T.Group();g.add(M(p));if(gl.length){const m=M(gl,glowMat);m.castShadow=false;g.add(m);}if(lum.length){const m=M(lum,lumMat);m.castShadow=false;g.add(m);}
  if(sway.length)g.add(M(sway,leafMat));g.add(new T.Mesh(merge(winP),roomWinMat));
  // clouds drifting past behind, and the odd one below
  const clouds=new T.Group();for(let i=0;i<6;i++){const c=[],cx=(R0()-0.5)*14,cy=-2+R0()*6,cz=-6-R0()*5;for(let k=0;k<4;k++)c.push(P(SPH_LO,0xffffff,cx+(k-1.5)*0.7,cy+R0()*0.3,cz,0,0,0,1.1+R0()*0.6,0.7+R0()*0.3,0.8));const m=M(c,lumMat);m.castShadow=m.receiveShadow=false;m.userData.v=0.15+R0()*0.2;clouds.add(m);}
  g.add(clouds);
  const stars=[];for(let i=0;i<40;i++)stars.push(P(ICO0,i%5?0xfff8e0:0xc8d8ff,(R0()-0.5)*18,-3+R0()*10,-8-R0()*4,0,0,0,0.07,0.07,0.07));const sm=M(stars,lumMat);sm.castShadow=sm.receiveShadow=false;sm.visible=false;g.add(sm);
  return{g,props,RW:R*2,RD:R*2,dio:{R,LY,ZL,LB,LT,clouds},tick:(dt)=>{const night=nightF>0.5;sm.visible=night;clouds.visible=!night;for(const c of clouds.children){c.position.x+=c.userData.v*dt;if(c.position.x>9)c.position.x-=18;}}};}
// a curved band of wall between radii r0 and r1, from angle a0 to a1 (0 = +x, π/2 = the back), top height top(a), bottom
// at bot(a) (or the floor): its inner face, top and outer face, as plain triangles
function arcWall(r0,r1,a0,a1,top,N,bot){const v=[],q=(a,r,y)=>[Math.cos(a)*r,y,-Math.sin(a)*r];
  const quad=(A,B,C,D)=>v.push(...A,...B,...C,...A,...C,...D);
  for(let i=0;i<N;i++){const a=a0+i/N*(a1-a0),b=a0+(i+1)/N*(a1-a0),ta=top(a),tb=top(b),ba=bot?bot(a):0,bb=bot?bot(b):0;
    quad(q(a,r0,ba),q(a,r0,ta),q(b,r0,tb),q(b,r0,bb));quad(q(a,r0,ta),q(a,r1,ta),q(b,r1,tb),q(b,r0,tb));quad(q(b,r1,bb),q(b,r1,tb),q(a,r1,ta),q(a,r1,ba));
    if(i===0)quad(q(a,r1,ba),q(a,r1,ta),q(a,r0,ta),q(a,r0,ba));if(i===N-1)quad(q(b,r0,bb),q(b,r0,tb),q(b,r1,tb),q(b,r1,bb));}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));return g;}
// where you can stand: the floor inside the wall, or the loft behind its rail
function dioClamp(D,lv,x,z){if(lv){z=clamp(z,-D.R+0.35,D.ZL-0.3);const m=Math.sqrt(Math.max(0,(D.R-0.4)**2-z*z));return[clamp(x,-m,m),z];}
  const r=Math.hypot(x,z),m=D.R-0.4;if(r>m){x*=m/r;z*=m/r;}if(z<D.ZL+0.3&&Math.abs(x-D.LB[0])>0.3)z=Math.max(z,D.ZL+0.3);/* the loft's posts */return[x,z];}
// a walk from where you are to (x,z) on level lv, by the ladder if it means changing level
function dioRoute(I,lv,x,z){const D=I.room.dio,[tx,tz]=dioClamp(D,lv,x,z),path=[];
  if(lv!==I.lv){if(I.lv===0){path.push([D.LB[0],0,D.LB[1]],[D.LT[0],D.LY,D.LT[1]]);}else{path.push([D.LT[0],D.LY,D.LT[1]],[D.LB[0],0,D.LB[1]]);}}
  path.push([tx,lv?D.LY:0,tz]);I.path=path;I.tlv=lv;}
// frame the whole diorama for the screen: as wide as the room on a tall phone, as tall as it on a wide screen
function fitRoomCam(D){const asp=camera.aspect,tv=Math.tan(roomCam.fov*Math.PI/360),th=tv*asp,hw=D.R+0.6,hv=asp<0.8?3.9:4.4,d=Math.max(hw/th,hv/(tv*(1-roomReserve/window.innerHeight)))*1.03,pitch=0.4,ty=asp<0.8?0.55:0.75;
  roomCam.position.set(0,ty+Math.sin(pitch)*d,Math.cos(pitch)*d);const drop=d*d*CURVE;roomCam.lookAt(0,ty-drop*0.9,0);}
