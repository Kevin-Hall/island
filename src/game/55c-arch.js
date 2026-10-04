/* =========================================================
   Neighbours' houses in real architectural styles (archHouse, called by townBuilding in 55-town for every villager
   home). Twelve styles, each drawn with the details that make it read as itself, in two to four palettes:
     modern       flat-roofed white and charcoal volumes, a cantilevered upper storey, a glass pavilion, cedar slats
     french       limestone with quoins, a slate mansard with arched dormers, shuttered French windows, balconettes
     tudor        a brick ground floor under a jettied, half-timbered upper storey, a steep cross gable, leaded panes
     scandi       board-clad (black, Falu red or pale), a steep gable with no fuss, big glazing and a timber deck
     craftsman    a low wide gable with rafter tails, a porch on tapered columns over stone piers, lap siding
     med          white or ochre stucco, a terracotta barrel-tile roof, arched windows with iron grilles, a vine pergola
     victorian    a tall painted lady: a turret, fish-scale gable bands, a spindled porch, hooded windows
     capecod      cedar shingles, a steep side-gabled roof with two dormers, a centre door, shutters and hydrangeas
     japanese     a raised timber frame with shoji, an engawa veranda, an irimoya roof with upturned eaves, a maple
     farmhouse    white board-and-batten, black standing-seam roofs, a front gable bay and a porch
     georgian     symmetrical brick, sash windows with keystones, a columned portico with a fanlight, end chimneys
     aframe       a cabin under one great A roof, its gable all glass, a deck in front
   Each island shuffles the twelve (by its seed) and its neighbours take them in turn, so no two houses on an island
   share a style; the palette is picked per house. All of it fits the 2x2 plot, the front door facing +z.
   ========================================================= */
const A_HIP=new T.ConeGeometry(0.7071,1,4,1).rotateY(Math.PI/4).translate(0,0.5,0);/* a square pyramid, base 1×1 on y=0 */
const A_MANS=new T.CylinderGeometry(0.7071*0.6,0.7071,1,4,1).rotateY(Math.PI/4).translate(0,0.5,0);/* its frustum: a mansard */
const A_TAPER=new T.CylinderGeometry(0.35,0.5,1,4,1).rotateY(Math.PI/4);/* a tapered square column */
const A_HALF=new T.CylinderGeometry(0.5,0.5,1,14,1,false,-Math.PI/2,Math.PI).rotateX(-Math.PI/2);/* a half disc (arches), flat side down */
const aDk=(c,f=0.82)=>new T.Color(c).multiplyScalar(f).getHex(),aLt=(c,f=0.25)=>lerpHex(c,0xffffff,f);
const A_GLASS=0x46546a;

// a pitched roof of two slabs (real eaves, with thickness) over a gable wall; ridge along local z, then turned by ry.
// W span, H rise, L length of the walls under it; o: ov eave overhang, oe end overhang, th thickness, fill gable wall
// colour, trim fascia/barge boards, lines (+n) shingle courses, seams (+ns) standing seams
function aGable(p,col,x,y,z,W,H,L,ry=0,o={}){const q=[],ov=o.ov??0.1,oe=o.oe??0.06,th=o.th??0.05,ang=Math.atan2(H,W/2),s=Math.hypot(H,W/2),sl=s+ov,LL=L+oe*2,ca=Math.cos(ang),sa=Math.sin(ang);
  if(o.fill!==undefined)q.push(P(PRISM,o.fill,0,y+H/3,0,0,0,0,W/1.732,H/1.5,L));
  for(const sd of [-1,1]){const at=f=>[sd*ca*f,y+H-sa*f],nx=sd*sa*th/2,ny=ca*th/2,[cx,cy]=at(sl/2);
    q.push(P(BOX,col,cx+nx,cy+ny,0,0,0,-sd*ang,sl,th,LL));
    if(o.lines!==undefined){const n=o.n||4;for(let i=1;i<=n;i++){const [lx,ly]=at(i/(n+1)*sl);q.push(P(BOX,o.lines,lx+nx*2.1,ly+ny*2.1,0,0,0,-sd*ang,0.025,0.02,LL+0.005));}}
    if(o.seams!==undefined){const ns=o.ns||8;for(let j=0;j<ns;j++)q.push(P(BOX,o.seams,cx+nx*2.1,cy+ny*2.1,-LL/2+(j+0.5)*LL/ns,0,0,-sd*ang,sl,0.02,0.018));}
    if(o.trim!==undefined){const [ex,ey]=at(sl);q.push(P(BOX,o.trim,ex+nx,ey-0.01,0,0,0,0,0.035,0.08,LL+0.01));for(const e of [-1,1])q.push(P(BOX,o.trim,cx+nx,cy+ny-0.012,e*(LL/2+0.006),0,0,-sd*ang,sl,0.08,0.025));}}
  q.push(P(BOX,o.ridge??aDk(col,0.78),0,y+H+th*0.75,0,0,0,0,0.09,0.05,LL+0.01));
  p.push(...shift(q,x,0,z,ry));}
// a hipped roof (solid): base W (x) by D (z), rise H; o: eave band colour, courses (horizontal lines), tubes (barrel
// tiles running down every face, for terracotta or temple roofs)
function aHip(p,col,x,y,z,W,H,D,o={}){const long=W>=D,a=long?W:D,b=long?D:W,run=a-b;
  for(const e of run>0.01?[-1,1]:[0]){const ex=long?e*run/2:0,ez=long?0:e*run/2;p.push(P(A_HIP,col,x+ex,y,z+ez,0,0,0,b,H,b));}
  if(run>0.01)p.push(P(PRISM,col,x,y+H/3,z,0,long?Math.PI/2:0,0,b/1.732,H/1.5,run));
  if(o.eave!==undefined)p.push(P(BOX,o.eave,x,y-0.025,z,0,0,0,W+0.01,0.05,D+0.01));
  if(o.courses!==undefined)for(let k=1;k<=3;k++){const t=k/4,yy=y+H*t+0.004,w=W-b*t,d=D-b*t;
    for(const s of [-1,1]){p.push(P(BOX,o.courses,x,yy,z+s*d/2,0,0,0,w,0.018,0.025),P(BOX,o.courses,x+s*w/2,yy,z,0,0,0,0.025,0.018,d));}}
  if(o.tubes!==undefined){const n=Math.hypot(H,b/2),th=Math.atan2(b/2,H),step=o.step||0.11;
    // the long faces (front and back, or the sides when D>W)
    for(const s of [-1,1])for(let u=-a/2+step/2;u<a/2;u+=step){const tm=Math.min(1,(a/2-Math.abs(u))/(b/2));if(tm<0.15)continue;const L=n*tm,c=tm/2,yy=y+H*c+0.02,vv=s*(b/2)*(1-c);
      p.push(long?P(CYL6,o.tubes,x+u,yy,z+vv,-s*th,0,0,0.045,L,0.045):P(CYL6,o.tubes,x+vv,yy,z+u,0,0,s*th,0.045,L,0.045));}
    // the hipped ends
    for(const s of [-1,1])for(let u=-b/2+step/2;u<b/2;u+=step){const tm=1-Math.abs(u)/(b/2);if(tm<0.15)continue;const L=n*tm,c=tm/2,yy=y+H*c+0.02,vv=s*((a/2)-(b/2)*c);
      p.push(long?P(CYL6,o.tubes,x+vv,yy,z+u,0,0,s*th,0.045,L,0.045):P(CYL6,o.tubes,x+u,yy,z+vv,-s*th,0,0,0.045,L,0.045));}}}
// a window on a wall facing local +z at (x,y,z), turned by ry: frame, glazing bars (m: cross, v, grid c×r, craft, none),
// and extras: arch top, sill, shutters, flower box, lintel/keystone, hood, balconette, iron grille
function aWin(p,gl,x,y,z,w,h,o={},ry=0){const q=[],g=[],f=o.frame??0xfbf8f0,t=o.ft??0.035,mc=o.mc??f,mt=0.016,fz=0.014;
  g.push(P(BOX,o.glass??A_GLASS,0,y,0,0,0,0,w,h,0.02));
  q.push(P(BOX,f,0,y-h/2-t/2,fz,0,0,0,w+t*2,t,0.03),P(BOX,f,-w/2-t/2,y,fz,0,0,0,t,h,0.03),P(BOX,f,w/2+t/2,y,fz,0,0,0,t,h,0.03));
  if(o.arch){g.push(P(A_HALF,o.glass??A_GLASS,0,y+h/2,0,0,0,0,w,w,0.02));q.push(P(A_HALF,f,0,y+h/2,-0.004,0,0,0,w+t*2,w+t*2,0.024),P(BOX,f,0,y+h/2,fz,0,0,0,w,mt*1.4,0.025));}
  else q.push(P(BOX,f,0,y+h/2+t/2,fz,0,0,0,w+t*2,t,0.03));
  const m=o.m||'cross',bars=(c,r)=>{for(let i=1;i<c;i++)q.push(P(BOX,mc,-w/2+i*w/c,y,fz,0,0,0,mt,h,0.02));for(let j=1;j<r;j++)q.push(P(BOX,mc,0,y-h/2+j*h/r,fz,0,0,0,w,mt,0.02));};
  if(m==='cross')bars(2,2);else if(m==='v')bars(2,1);else if(m==='grid')bars(o.c||3,o.r||3);
  else if(m==='craft'){for(let i=1;i<3;i++)q.push(P(BOX,mc,-w/2+i*w/3,y+h*0.3,fz,0,0,0,mt,h*0.4,0.02));q.push(P(BOX,mc,0,y+h*0.1,fz,0,0,0,w,mt*1.4,0.02));}
  if(o.sill!==false)q.push(P(BOX,o.sillC??f,0,y-h/2-t-0.012,0.035,0,0,0,w+0.1,0.03,0.07));
  if(o.sh!==undefined)for(const sd of [-1,1]){const sx=sd*(w/2+t+w*0.26),n=Math.max(3,Math.round(h/0.05));q.push(P(BOX,o.sh,sx,y+(o.arch?w*0.15:0),0.01,0,0,0,w*0.5,h+t+(o.arch?w*0.3:0),0.025));
    for(let k=0;k<n;k++)q.push(P(BOX,aDk(o.sh,0.8),sx,y-h/2+(k+0.5)*h/n,0.024,0,0,0,w*0.4,0.01,0.006));}
  if(o.box){const by=y-h/2-t-0.06;q.push(P(BOX,o.boxC??0x8a5a3a,0,by,0.07,0,0,0,w+0.08,0.08,0.11));const fc=o.flowers||[0xe8453a,0xf2a6c8,0xffffff,0xe8453a];
    for(let i=0;i<6;i++){const fx=-w/2+(i+0.5)*w/6;q.push(P(SPH_XS,GREENS[i%3],fx,by+0.05,0.08,0,0,0,0.08,0.06,0.08),P(SPH_XS,fc[i%fc.length],fx+0.01,by+0.08,0.1,0,0,0,0.05,0.045,0.05));}}
  if(o.lin!==undefined)q.push(P(BOX,o.lin,0,y+h/2+t+0.025,0.008,0,0,0,w+0.12,0.05,0.03));
  if(o.key)q.push(P(BOX,o.keyC??o.lin??f,0,y+h/2+t+0.035,0.02,0,0,0,0.06,0.08,0.035));
  if(o.hood!==undefined){q.push(P(BOX,o.hood,0,y+h/2+t+0.015,0.02,0,0,0,w+0.14,0.025,0.06),P(PRISM,o.hood,0,y+h/2+t+0.03+0.022,0.02,0,0,0,(w+0.12)/1.732,0.066/1.5,0.05));}
  if(o.bal!==undefined){const by=y-h/2;q.push(P(BOX,o.bal,0,by+0.16,0.06,0,0,0,w+0.1,0.014,0.014),P(BOX,o.bal,0,by+0.01,0.06,0,0,0,w+0.1,0.014,0.03));
    for(let i=0;i<=6;i++)q.push(P(BOX,o.bal,-w/2-0.04+i*(w+0.08)/6,by+0.085,0.06,0,0,0,0.008,0.15,0.008));q.push(P(CYL8,o.bal,0,by+0.09,0.06,1.57,0,0,0.07,0.008,0.07));}
  if(o.grille!==undefined){for(let i=1;i<5;i++)q.push(P(BOX,o.grille,-w/2+i*w/5,y,0.04,0,0,0,0.01,h+0.02,0.01));q.push(P(BOX,o.grille,0,y-h/4,0.04,0,0,0,w+0.02,0.01,0.01),P(BOX,o.grille,0,y+h/4,0.04,0,0,0,w+0.02,0.01,0.01));}
  p.push(...shift(q,x,0,z,ry));gl.push(...shift(g,x,0,z,ry));}
// a front door on a wall facing +z: frame, leaf (or double leaves), panels or glass, handle, and extras: arch top,
// transom, fanlight, sidelights, pediment, iron straps, a lamp
function aDoor(p,gl,x,y,z,col,o={},ry=0){const q=[],g=[],w=o.w??0.28,h=o.h??0.58,f=o.frame??0xfbf8f0,t=0.04;
  q.push(P(BOX,f,-w/2-t/2,y+h/2,0.006,0,0,0,t,h,0.03),P(BOX,f,w/2+t/2,y+h/2,0.006,0,0,0,t,h,0.03));if(!o.arch)q.push(P(BOX,f,0,y+h+t/2,0.006,0,0,0,w+t*2,t,0.03));
  q.push(P(BOX,col,0,y+h/2,0,0,0,0,w,h,0.03));
  if(o.arch){q.push(P(A_HALF,col,0,y+h,0,0,0,0,w,w,0.03),P(A_HALF,f,0,y+h,-0.004,0,0,0,w+t*2,w+t*2,0.034));if(o.glass)g.push(P(A_HALF,A_GLASS,0,y+h,0.018,0,0,0,w*0.7,w*0.7,0.01));}
  if(o.dbl)q.push(P(BOX,aDk(col,0.7),0,y+h/2,0.017,0,0,0,0.012,h,0.01));
  if(o.glass){const gw=o.dbl?w*0.36:w*0.6;for(const gx of o.dbl?[-w/4,w/4]:[0]){g.push(P(BOX,A_GLASS,gx,y+h*(o.glass==='top'?0.76:0.6),0.018,0,0,0,gw,h*(o.glass==='top'?0.28:0.6),0.01));
      if(o.glass!=='top')for(let j=1;j<3;j++)q.push(P(BOX,col,gx,y+h*0.3+j*h*0.2,0.022,0,0,0,gw,0.012,0.008));}}
  else{const pc=aLt(col,0.12);for(const [py,ph] of [[0.74,0.3],[0.3,0.36]])for(const px of o.panels===6?[-w/4,w/4]:[0])q.push(P(BOX,pc,px,y+h*py,0.018,0,0,0,o.panels===6?w*0.36:w*0.62,h*ph,0.01));}
  q.push(P(ICO2,o.knob??0xd8b050,(o.dbl?0.03:w*0.32),y+h*0.48,0.03,0,0,0,0.035,0.035,0.03));
  if(o.pull)q.push(P(BOX,0xc8c8cc,w*0.3,y+h*0.5,0.035,0,0,0,0.02,h*0.4,0.02));
  if(o.straps)for(const sy of [0.25,0.7])q.push(P(BOX,0x2a2a2e,-w*0.1,y+h*sy,0.02,0,0,0,w*0.75,0.025,0.01));
  if(o.transom){g.push(P(BOX,A_GLASS,0,y+h+t+0.06,0.0,0,0,0,w,0.1,0.02));q.push(P(BOX,f,0,y+h+t+0.13,0.006,0,0,0,w+t*2,t,0.03),P(BOX,f,-w/2-t/2,y+h+t+0.06,0.006,0,0,0,t,0.12,0.03),P(BOX,f,w/2+t/2,y+h+t+0.06,0.006,0,0,0,t,0.12,0.03));}
  if(o.fan){g.push(P(A_HALF,A_GLASS,0,y+h+t,0,0,0,0,w,w,0.02));q.push(P(A_HALF,f,0,y+h+t,-0.004,0,0,0,w+t*2,w+t*2,0.024));for(let i=1;i<4;i++)q.push(P(BOX,f,Math.cos(i*Math.PI/4)*w*0.25,y+h+t+Math.sin(i*Math.PI/4)*w*0.25,0.012,0,0,Math.PI/2-i*Math.PI/4,0.01,w*0.5,0.01));}
  if(o.side)for(const sd of [-1,1]){g.push(P(BOX,A_GLASS,sd*(w/2+t+0.05),y+h*0.55,0,0,0,0,0.08,h*0.7,0.02));q.push(P(BOX,f,sd*(w/2+t+0.1+t/2),y+h/2,0.006,0,0,0,t,h,0.03));for(let j=1;j<4;j++)q.push(P(BOX,f,sd*(w/2+t+0.05),y+h*0.2+j*h*0.175,0.012,0,0,0,0.08,0.01,0.01));}
  if(o.pedi!==undefined){const pw=w+(o.side?0.36:0.16);q.push(P(BOX,o.pedi,0,y+h+t+0.02,0.02,0,0,0,pw,0.04,0.06),P(PRISM,o.pedi,0,y+h+t+0.04+0.1/3,0.02,0,0,0,pw/1.732,0.1/1.5,0.05));}
  if(o.lamp)for(const sd of o.lamp===2?[-1,1]:[1]){const lx=sd*(w/2+(o.side?0.24:0.12));q.push(P(BOX,0x2a2a2e,lx,y+h*0.82,0.03,0,0,0,0.07,0.12,0.06),P(CONE4,0x2a2a2e,lx,y+h*0.82+0.09,0.03,0,0.785,0,0.1,0.06,0.1));g.push(P(BOX,0xffe0a0,lx,y+h*0.82,0.035,0,0,0,0.05,0.09,0.05));}
  p.push(...shift(q,x,0,z,ry));gl.push(...shift(g,x,0,z,ry));}
// cladding lines on the front and both side walls of a box (x0..x1, z0..z1, from y0 up h): lap/shingle courses run
// across, boards and battens run up
function aClad(p,col,x0,x1,z0,z1,y0,h,kind,step){const W=x1-x0,D=z1-z0,cx=(x0+x1)/2,cz=(z0+z1)/2;
  if(kind==='lap'||kind==='brick'){for(let yy=y0+step;yy<y0+h-0.005;yy+=step){p.push(P(BOX,col,cx,yy,z1+0.004,0,0,0,W,kind==='brick'?0.01:0.014,0.01),P(BOX,col,x0-0.004,yy,cz,0,0,0,0.01,kind==='brick'?0.01:0.014,D),P(BOX,col,x1+0.004,yy,cz,0,0,0,0.01,kind==='brick'?0.01:0.014,D));}}
  else{for(let xx=x0+step;xx<x1-0.01;xx+=step)p.push(P(BOX,col,xx,y0+h/2,z1+0.004,0,0,0,0.016,h,0.01));for(let zz=z0+step;zz<z1-0.01;zz+=step)for(const xx of [x0-0.004,x1+0.004])p.push(P(BOX,col,xx,y0+h/2,zz,0,0,0,0.01,h,0.016));}}
// a straight timber between two points on a wall facing z (x,y), or on a side wall facing x (z,y)
function aBeam(p,col,a0,b0,a1,b1,c,face='z',t=0.04){const L=Math.hypot(a1-a0,b1-b0),r=Math.atan2(a1-a0,b1-b0);
  p.push(face==='z'?P(BOX,col,(a0+a1)/2,(b0+b1)/2,c,0,0,-r,t,L,0.02):P(BOX,col,c,(b0+b1)/2,(a0+a1)/2,r,0,0,0.02,L,t));}
// garden things the styles share
function aShrub(p,x,z,s,col=0x4f8a3a){p.push(PG(SPH_LO,aLt(col,0.18),aDk(col,0.8),x,s*0.42,z,0,0,0,s,s*0.85,s));}
function aBlooms(p,x,z,s,cols,R){aShrub(p,x,z,s,0x4a7a3a);for(let i=0;i<7;i++){const a=i*2.4,r=s*0.32;p.push(P(SPH_XS,cols[i%cols.length],x+Math.cos(a)*r,s*(0.5+(i%3)*0.13),z+Math.sin(a)*r*0.8+s*0.12,0,0,0,s*0.34,s*0.3,s*0.34));}}
function aPot(p,x,z,pot,kind,col=0x3a7a30){p.push(PG(CYL12,pot,aDk(pot,0.8),x,0.11,z,0,0,0,0.2,0.22,0.2));
  if(kind==='ball')p.push(P(CYL6,0x6a4a30,x,0.3,z,0,0,0,0.03,0.2,0.03),PG(SPH_LO,aLt(col,0.15),aDk(col,0.8),x,0.46,z,0,0,0,0.26,0.24,0.26));
  else if(kind==='cone')p.push(PG(CONE12,aLt(col,0.1),aDk(col,0.75),x,0.42,z,0,0,0,0.24,0.46,0.24));
  else if(kind==='lemon'){p.push(P(CYL6,0x6a4a30,x,0.32,z,0,0,0,0.03,0.24,0.03),PG(SPH_LO,0x6aa84a,0x3a7a30,x,0.52,z,0,0,0,0.3,0.26,0.3));for(let i=0;i<5;i++)p.push(P(SPH_XS,0xf6d040,x+Math.cos(i*1.3)*0.12,0.5+(i%2)*0.06,z+Math.sin(i*1.3)*0.12,0,0,0,0.05,0.05,0.05));}
  else{for(let i=0;i<8;i++)lf(p,GREENS[i%4],x,0.22,z,i*0.8,0.6+(i%3)*0.2,0.24,0.1);}}
function aTree(p,x,z,top,bot,h=0.9,trunk=0x6a4a30){p.push(P(CYL8,trunk,x,h*0.3,z,0,0,0,0.07,h*0.6,0.07),PG(SPH_LO,top,bot,x,h*0.72,z,0,0,0,h*0.55,h*0.45,h*0.55),PG(SPH_LO,top,bot,x+h*0.1,h*0.88,z-h*0.06,0,0,0,h*0.36,h*0.3,h*0.36));}
function aClimber(p,x,y0,y1,z,bloom,R){for(let i=0;i<14;i++){const t=i/13,yy=y0+(y1-y0)*t,xx=x+Math.sin(i*1.9)*0.06;lf(p,GREENS[i%3],xx,yy,z,i*1.3,0.3,0.12,0.07);if(i%2)p.push(P(SPH_XS,bloom,xx+0.02,yy+0.02,z+0.03,0,0,0,0.06,0.05,0.05));}}

const ARCH={
  modern:{pals:[{w:0xf2f0ea,d:0x34363c,wood:0xb07a4a,c:0xb8b6b0},{w:0xdad8d2,d:0x26282c,wood:0xc89462,c:0x9a9890},{w:0xf4f2ee,d:0x5a4a3c,wood:0x8a5a3a,c:0xc8c4bc}],
    build(p,gl,c){const G=0x5a6a7e;
      p.push(P(BOX,c.c,0,0.04,0.05,0,0,0,1.9,0.08,1.6));
      p.push(P(BOX,c.w,-0.27,0.48,-0.12,0,0,0,1.26,0.8,1.16));/* the ground floor; front at z .46 */
      // a glass pavilion on the right, dark posts and mullions
      gl.push(P(BOX,G,0.62,0.48,-0.07,0,0,0,0.5,0.78,1.0));
      for(const [x,z] of [[0.36,0.44],[0.88,0.44],[0.88,-0.58],[0.36,-0.58]])p.push(P(BOX,c.d,x,0.48,z,0,0,0,0.04,0.8,0.04));
      for(const x of [0.53,0.71])p.push(P(BOX,c.d,x,0.48,0.435,0,0,0,0.018,0.78,0.018));for(const z of [-0.24,0.1])p.push(P(BOX,c.d,0.885,0.48,z,0,0,0,0.018,0.78,0.018));
      p.push(P(BOX,c.wood,0.62,0.095,0.66,0,0,0,0.56,0.03,0.4));for(let i=1;i<5;i++)p.push(P(BOX,aDk(c.wood,0.8),0.62,0.112,0.46+i*0.08,0,0,0,0.56,0.004,0.008));
      p.push(P(BOX,c.w,0,0.9,-0.08,0,0,0,1.88,0.07,1.3));/* the slab between floors */
      p.push(P(BOX,c.d,0.22,1.24,-0.15,0,0,0,1.4,0.6,1.0),P(BOX,c.w,0.22,1.57,-0.15,0,0,0,1.5,0.06,1.1));/* the upper storey, cantilevered over the pavilion */
      gl.push(P(BOX,G,0.26,1.24,0.355,0,0,0,1.12,0.3,0.02));for(const x of [-0.12,0.26,0.64])p.push(P(BOX,aLt(c.d,0.3),x,1.24,0.365,0,0,0,0.02,0.3,0.02));
      p.push(P(BOX,aLt(c.d,0.3),0.26,1.4,0.365,0,0,0,1.16,0.02,0.02),P(BOX,aLt(c.d,0.3),0.26,1.08,0.365,0,0,0,1.16,0.02,0.02));
      // cedar slats beside the door, the door with a long pull, a picture window, a canopy
      for(let i=0;i<7;i++)p.push(P(BOX,c.wood,-0.86+i*0.055,0.48,0.47,0,0,0,0.036,0.8,0.02));
      aDoor(p,gl,-0.38,0.08,0.465,c.d,{w:0.26,h:0.66,frame:c.d,pull:1,lamp:1});
      aWin(p,gl,0.04,0.5,0.465,0.36,0.6,{frame:c.d,m:'v',sill:false});
      p.push(P(BOX,c.d,-0.38,0.86,0.6,0,0,0,0.5,0.03,0.28));
      // a concrete planter of grasses and a step
      p.push(P(BOX,c.c,-0.66,0.12,0.78,0,0,0,0.5,0.14,0.18));for(let i=0;i<12;i++)lf(p,[0x8aa060,0xb0b878,0x6a8a4a][i%3],-0.88+i*0.04,0.18,0.78,i*1.7,1.1,0.24,0.035);
      p.push(P(BOX,c.c,-0.38,0.05,0.62,0,0,0,0.4,0.04,0.24));aPot(p,0.88,0.82,c.d,'cone',0x4a7a3a);}},
  french:{pals:[{s:0xeee2c8,q:0xf8f0dc,sh:0x7a98b0,r:0x56606e,d:0x4a5a6a},{s:0xf2e6d2,q:0xfbf4e4,sh:0x6a8a70,r:0x4c5462,d:0x3a5a44},{s:0xe8d8bc,q:0xf4ead6,sh:0xa8b8c8,r:0x5a6270,d:0x7a3a3a}],
    build(p,gl,c,R){const Z=0.63;
      p.push(P(BOX,aDk(c.s,0.78),0,0.05,0,0,0,0,1.74,0.1,1.42),P(BOX,c.s,0,0.6,-0.02,0,0,0,1.66,1.0,1.3));
      for(let i=1;i<4;i++)p.push(P(BOX,aDk(c.s,0.9),0,0.1+i*0.1,Z+0.002,0,0,0,1.66,0.012,0.01));
      for(let r=0;r<5;r++){const y=0.2+r*0.19,a=r%2?0.2:0.13;for(const sx of [-1,1])p.push(P(BOX,c.q,sx*(0.83-a/2+0.004),y,Z+0.004,0,0,0,a,0.085,0.02),P(BOX,c.q,sx*0.834,y,Z-(r%2?0.13:0.2)/2,0,0,0,0.02,0.085,r%2?0.13:0.2));}
      p.push(P(BOX,c.q,0,1.08,-0.02,0,0,0,1.7,0.04,1.34),P(BOX,c.q,0,1.12,-0.02,0,0,0,1.78,0.05,1.42));
      // the mansard, its courses, a zinc ridge
      p.push(P(A_MANS,c.r,0,1.14,-0.02,0,0,0,1.74,0.46,1.4),P(A_HIP,c.r,0,1.6,-0.02,0,0,0,1.044,0.16,0.84),P(BOX,0x8a929c,0,1.765,-0.02,0,0,0,0.3,0.03,0.04));
      for(let k=1;k<=3;k++){const t=k/4;p.push(P(BOX,aDk(c.r,0.84),0,1.14+0.46*t,-0.02,0,0,0,1.74-0.696*t+0.012,0.014,1.4-0.56*t+0.012));}
      // arched dormers
      for(const x of [-0.42,0.42]){p.push(P(BOX,c.q,x,1.36,0.5,0,0,0,0.3,0.32,0.28),P(A_HALF,c.r,x,1.52,0.5,0,0,0,0.38,0.24,0.32));
        aWin(p,gl,x,1.32,0.642,0.15,0.18,{frame:0xfbf8f0,m:'cross',sill:false,arch:1});}
      for(const x of [-0.62,0.62]){p.push(P(BOX,c.q,x,1.72,-0.4,0,0,0,0.18,0.56,0.24),P(BOX,c.s,x,2.01,-0.4,0,0,0,0.22,0.04,0.28));for(const dz of [-0.05,0.05])p.push(P(CYL8,0xc8704a,x,2.08,-0.4+dz,0,0,0,0.06,0.11,0.06));}
      // French doors under an arch, tall shuttered windows with balconettes, keystones
      aDoor(p,gl,0,0.1,Z+0.002,c.d,{w:0.36,h:0.56,dbl:1,glass:1,arch:1,frame:c.q,lamp:2});
      for(const x of [-0.54,0.54])aWin(p,gl,x,0.5,Z+0.002,0.24,0.52,{frame:0xfbf8f0,m:'grid',c:2,r:3,sh:c.sh,bal:0x2a2a30,lin:c.q,key:1});
      p.push(P(BOX,c.q,0,0.06,Z+0.1,0,0,0,0.5,0.04,0.2));
      // clipped box balls in white Versailles planters, and wisteria over the left corner
      for(const x of [-0.3,0.3]){p.push(P(BOX,0xf4f0e8,x,0.12,Z+0.22,0,0,0,0.18,0.2,0.18),PG(SPH_LO,0x5a9a44,0x2f6a2a,x,0.34,Z+0.22,0,0,0,0.24,0.22,0.24));}
      for(let i=0;i<10;i++){const x=-0.8+i*0.05;p.push(P(SPH_XS,i%3?0xb89ad8:0x9a7ac8,x,0.98-(i%3)*0.07,Z+0.05,0,0,0,0.07,0.14,0.06));lf(p,GREENS[i%3],x+0.02,1.04,Z+0.04,i,0.4,0.1,0.06);}}},
  tudor:{pals:[{b:0xa8583e,s:0xf2ead8,t:0x3a2a22,r:0x6a4a3a},{b:0x9a5a44,s:0xf0e2c4,t:0x4a3426,r:0x55585e},{b:0xb06a4a,s:0xf4ecdc,t:0x2e2420,r:0x7a5a40}],
    build(p,gl,c,R){
      p.push(P(BOX,0x8a8078,0,0.04,0,0,0,0,1.66,0.08,1.36),P(BOX,c.b,0,0.33,0,0,0,0,1.5,0.5,1.2));aClad(p,aDk(c.b,0.82),-0.75,0.75,-0.6,0.6,0.08,0.5,'brick',0.06);
      p.push(P(BOX,c.s,0,0.85,0.03,0,0,0,1.6,0.54,1.3),P(BOX,c.t,0,0.6,0.03,0,0,0,1.62,0.05,1.32));/* the jettied upper storey */
      const zf=0.682;for(const x of [-0.79,-0.45,0.79])aBeam(p,c.t,x,0.6,x,1.12,zf);aBeam(p,c.t,-0.8,1.1,0.8,1.1,zf);aBeam(p,c.t,-0.79,0.62,-0.45,1.1,zf);
      for(const x of [-0.801,0.801]){for(const z of [-0.6,-0.15,0.3])aBeam(p,c.t,z,0.6,z,1.12,x,'x');aBeam(p,c.t,-0.6,0.62,-0.15,1.1,x,'x');aBeam(p,c.t,0.3,0.62,-0.15,1.1,x,'x');}
      aGable(p,c.r,0,1.12,0.03,1.3,0.78,1.6,Math.PI/2,{ov:0.12,oe:0.08,fill:c.s,trim:c.t,lines:aDk(c.r,0.82),n:5});
      // the cross gable: a bay that juts out, its gable half-timbered
      p.push(P(BOX,c.s,0.38,0.85,0.66,0,0,0,0.72,0.54,0.2));
      aGable(p,c.r,0.38,1.12,0.3,0.72,0.66,0.9,0,{ov:0.08,oe:0.06,fill:c.s,trim:c.t,lines:aDk(c.r,0.82),n:3});
      const zb=0.762;for(const x of [0.03,0.73])aBeam(p,c.t,x,0.6,x,1.12,zb);aBeam(p,c.t,0.02,1.12,0.74,1.12,zb);aBeam(p,c.t,0.38,1.12,0.38,1.7,zb+0.002);aBeam(p,c.t,0.17,1.33,0.59,1.33,zb+0.002);
      aBeam(p,c.t,0.03,0.62,0.18,0.8,zb);aBeam(p,c.t,0.73,0.62,0.58,0.8,zb);
      aWin(p,gl,0.38,0.88,zb,0.36,0.22,{frame:c.t,m:'grid',c:4,r:2,mc:0x3a3a3a,sill:false});
      aWin(p,gl,0.38,1.22,0.75,0.16,0.14,{frame:c.t,m:'grid',c:2,r:2,mc:0x3a3a3a,sill:false});
      aWin(p,gl,-0.62,0.86,zf,0.2,0.22,{frame:c.t,m:'grid',c:2,r:3,mc:0x3a3a3a,sill:false});
      // a low arched oak door with iron straps, a mullioned window, a tall brick chimney, a climbing rose
      aDoor(p,gl,-0.36,0.08,0.602,0x6a4a30,{w:0.26,h:0.34,arch:1,frame:0xc8bca4,straps:1});
      aWin(p,gl,0.36,0.33,0.602,0.44,0.22,{frame:0xd8ccb4,m:'grid',c:4,r:2,mc:0x3a3a3a,sillC:0xd8ccb4});
      p.push(P(BOX,c.b,-0.66,1.45,-0.25,0,0,0,0.22,1.3,0.26),P(BOX,aDk(c.b,0.8),-0.66,2.12,-0.25,0,0,0,0.26,0.05,0.3));for(const dx of [-0.05,0.05])p.push(P(CYL8,0xb86a4a,-0.66+dx,2.2,-0.25,0,0,0,0.07,0.14,0.07));
      aClimber(p,-0.58,0.1,0.56,0.62,0xe86a8a,R);aShrub(p,0.8,0.82,0.3);aShrub(p,-0.8,0.84,0.26,0x5a8a3a);}},
  scandi:{pals:[{w:0x2e3034,t:0xf4f2ec,r:0x26282c,k:0xb89a72},{w:0x9a3226,t:0xf4f2ec,r:0x2e3034,k:0xa88a62},{w:0xe6e4de,t:0x2e3034,r:0x3a3c42,k:0xc0a27a},{w:0x4a5a4c,t:0xf0ece2,r:0x2e3034,k:0xb89a72}],
    build(p,gl,c){const line=c.w===0xe6e4de?aDk(c.w,0.86):aLt(c.w,0.14),Z=0.55;
      p.push(P(BOX,0x6a6a6a,0,0.04,-0.1,0,0,0,1.3,0.08,1.36),P(BOX,c.w,0,0.53,-0.1,0,0,0,1.2,0.9,1.3));aClad(p,line,-0.6,0.6,-0.75,Z,0.08,0.9,'board',0.08);
      aGable(p,c.r,0,0.98,-0.1,1.2,0.84,1.3,0,{ov:0.05,oe:0.04,th:0.05,fill:c.w,trim:c.t,seams:aLt(c.r,0.12),ns:10});
      for(let x=-0.52;x<0.55;x+=0.08){const hh=0.84*(1-Math.abs(x)/0.6)-0.02;if(hh>0.02)p.push(P(BOX,line,x,0.98+hh/2,Z+0.004,0,0,0,0.014,hh,0.01));}
      for(const sx of [-1,1])p.push(P(BOX,c.t,sx*0.585,0.53,Z-0.01,0,0,0,0.05,0.9,0.03));
      aWin(p,gl,0.2,0.5,Z+0.004,0.42,0.6,{frame:c.t,m:'cross',sill:false});aWin(p,gl,0,1.26,Z+0.004,0.28,0.34,{frame:c.t,m:'v',sill:false});
      aWin(p,gl,0.604,0.56,-0.3,0.3,0.36,{frame:c.t,m:'v',sill:false},Math.PI/2);
      aDoor(p,gl,-0.3,0.1,Z+0.004,0xb07a4a,{w:0.24,h:0.6,frame:c.t,glass:1,lamp:1});
      // a timber deck and steps, a black flue, a stack of logs, a birch
      p.push(P(BOX,c.k,0,0.1,0.75,0,0,0,1.4,0.06,0.4));for(let i=1;i<6;i++)p.push(P(BOX,aDk(c.k,0.82),-0.7+i*0.233,0.132,0.75,0,0,0,0.008,0.004,0.4));
      p.push(P(CYL8,0x2a2a2e,-0.3,1.5,-0.4,0,0,0,0.09,0.7,0.09),P(CYL8,0x2a2a2e,-0.3,1.86,-0.4,0,0,0,0.13,0.04,0.13));
      YARD.logs(p,-0.84,-0.2);
      {const bx=-0.84,bz=0.76;p.push(P(CYL8,0xf2f0ea,bx,0.5,bz,0,0,0,0.06,1.0,0.06));for(let i=0;i<6;i++)p.push(P(BOX,0x2a2a2e,bx,0.12+i*0.15,bz+0.03,0,0,0,0.045,0.014,0.01));p.push(PG(SPH_LO,0xc8d870,0x7aa040,bx,1.12,bz,0,0,0,0.34,0.5,0.34));}}},
  craftsman:{pals:[{w:0x8a9a74,t:0xf0e8d4,r:0x5a4a40,s:0x9a8a78,d:0x7a4a2a},{w:0x6a7c8a,t:0xf2ecdc,r:0x4a4a4e,s:0x8a847a,d:0xa8543a},{w:0xc8a878,t:0x6a4a34,r:0x6a3a2a,s:0x8a7a6a,d:0x3a5a4a}],
    build(p,gl,c){const Z=0.33;
      p.push(P(BOX,c.s,0,0.06,-0.15,0,0,0,1.66,0.12,1.2),P(BOX,c.w,0,0.52,-0.2,0,0,0,1.56,0.8,1.06));aClad(p,aDk(c.w,0.84),-0.78,0.78,-0.73,Z,0.12,0.78,'lap',0.07);
      p.push(P(BOX,c.t,0,0.9,-0.2,0,0,0,1.58,0.06,1.08));for(const sx of [-1,1])p.push(P(BOX,c.t,sx*0.775,0.52,Z-0.01,0,0,0,0.05,0.8,0.03));
      aGable(p,c.r,0,0.92,-0.2,1.08,0.42,1.56,Math.PI/2,{ov:0.2,oe:0.16,fill:c.w,trim:c.t,lines:aDk(c.r,0.84),n:3});
      const ang=Math.atan2(0.42,0.54);for(let x=-0.86;x<=0.87;x+=0.144)p.push(P(BOX,c.t,x,0.86,0.42,ang,0,0,0.035,0.035,0.16));
      // the porch: stone piers, tapered columns, its own low gable with a beam and knee braces
      p.push(P(BOX,0x9a8478,0.22,0.12,0.6,0,0,0,1.0,0.1,0.56));
      for(const x of [-0.24,0.68]){p.push(P(BOX,c.s,x,0.3,0.8,0,0,0,0.16,0.3,0.16),P(A_TAPER,c.t,x,0.65,0.8,0,0,0,0.13,0.42,0.13),P(BOX,c.t,x,0.875,0.8,0,0,0,0.12,0.03,0.12));}
      aGable(p,c.r,0.22,0.9,0.56,1.04,0.36,0.62,0,{ov:0.08,oe:0.06,fill:aLt(c.w,0.18),trim:c.t,lines:aDk(c.r,0.84),n:2});
      p.push(P(BOX,c.t,0.22,0.9,0.87,0,0,0,1.04,0.06,0.05));for(const x of [-0.12,0.56])p.push(P(PRISM,c.t,x,1.0,0.88,0,0,Math.PI,0.05,0.06,0.03));
      aDoor(p,gl,0.4,0.17,Z+0.004,c.d,{w:0.24,h:0.56,frame:c.t,glass:'top',lamp:1});
      aWin(p,gl,-0.02,0.52,Z+0.004,0.3,0.36,{frame:c.t,m:'craft'});aWin(p,gl,-0.56,0.52,Z+0.004,0.26,0.36,{frame:c.t,m:'craft',box:1,boxC:c.t});
      p.push(P(BOX,c.s,0.22,0.05,0.94,0,0,0,0.44,0.06,0.14));aPot(p,0.66,0.98,0xb8704a,'fern');aShrub(p,-0.7,0.6,0.28);aShrub(p,-0.4,0.62,0.22,0x5a8a3a);}},
  med:{pals:[{w:0xf6f2ea,r:0xc8643a,d:0x2a5a9a},{w:0xf0d4a0,r:0xb85a34,d:0x3a6a4a},{w:0xf2c8b8,r:0xc0603a,d:0x2a7a7a}],
    build(p,gl,c,R){const Z=0.55,TC=0xc8704a;
      p.push(P(BOX,aDk(c.w,0.85),0,0.04,0,0,0,0,1.86,0.08,1.4),P(BOX,c.w,-0.22,0.58,-0.05,0,0,0,1.3,1.0,1.2));
      aHip(p,c.r,-0.22,1.08,-0.05,1.52,0.36,1.4,{eave:aDk(c.w,0.9),tubes:aDk(c.r,0.86),step:0.1});
      p.push(P(BOX,c.w,-0.6,1.42,-0.3,0,0,0,0.16,0.3,0.16));aHip(p,c.r,-0.6,1.57,-0.3,0.24,0.08,0.24);
      aDoor(p,gl,-0.3,0.08,Z+0.002,c.d,{w:0.3,h:0.42,arch:1,frame:aDk(c.w,0.9),straps:1});
      for(const x of [-0.72,0.18])aWin(p,gl,x,0.56,Z+0.002,0.2,0.26,{arch:1,frame:aDk(c.w,0.9),m:'v',sh:c.d,sillC:TC,grille:0x2a2a2e});
      aWin(p,gl,0.452,0.62,-0.2,0.18,0.24,{arch:1,frame:aDk(c.w,0.9),m:'v',sillC:TC},Math.PI/2);
      // bougainvillea arching over the door
      for(let i=0;i<16;i++){const a=i/15*Math.PI,x=-0.3+Math.cos(a)*0.26,y=0.6+Math.sin(a)*0.3;p.push(P(SPH_XS,i%4?0xd84a9a:0xe86ab0,x,y,Z+0.05,0,0,0,0.11,0.1,0.08));if(i%2)lf(p,GREENS[i%3],x,y-0.03,Z+0.04,i,0.2,0.1,0.06);}
      // a pergola over a terrace on the right, with a vine and a little table
      p.push(P(BOX,0xd8c8a8,0.7,0.09,0.15,0,0,0,0.5,0.02,1.0));for(const [x,z] of [[0.92,0.6],[0.92,-0.3],[0.48,0.6]])p.push(P(BOX,0x8a6a44,x,0.5,z,0,0,0,0.06,0.84,0.06));
      for(const z of [0.6,-0.3])p.push(P(BOX,0x8a6a44,0.7,0.94,z,0,0,0,0.56,0.05,0.05));for(let z=-0.36;z<0.7;z+=0.12)p.push(P(BOX,0x7a5a3a,0.7,0.98,z,0,0,0,0.56,0.03,0.03));
      for(let i=0;i<12;i++){const z=-0.3+i*0.08;p.push(PG(SPH_LO,0x6aa84a,0x3a7a30,0.7+Math.sin(i*2.1)*0.18,1.02,z,0,0,0,0.2,0.08,0.16));if(i%3===0)p.push(P(SPH_XS,0x6a3a7a,0.66+Math.sin(i)*0.1,0.94,z,0,0,0,0.06,0.09,0.06));}
      p.push(P(CYL12,0xf4f0e8,0.7,0.3,0.2,0,0,0,0.26,0.03,0.26),P(CYL6,0x2a2a2e,0.7,0.17,0.2,0,0,0,0.03,0.26,0.03));
      aPot(p,0.05,Z+0.2,TC,'lemon');aPot(p,-0.62,Z+0.22,TC,'fern');p.push(P(BOX,0x2a5a9a,0.0,0.74,Z+0.004,0,0,0,0.09,0.09,0.01),P(BOX,0xfbf8f0,0.0,0.74,Z+0.01,0,0,0,0.06,0.06,0.006));}},
  victorian:{pals:[{w:0xc4b0d8,t:0xf8f4ee,a:0x7a5a9a,r:0x5a4a6a},{w:0xb8dcc8,t:0xfbf8f2,a:0xd86a8a,r:0x4a5a5a},{w:0xf2dc98,t:0xfbf8f2,a:0x4a7aa8,r:0x6a4a4a},{w:0xf0bcb0,t:0xfbf8f2,a:0x5a8a7a,r:0x4a4a58}],
    build(p,gl,c){const Z=0.4;
      p.push(P(BOX,0x9a8a80,-0.1,0.06,-0.1,0,0,0,1.6,0.12,1.3),P(BOX,c.w,-0.18,0.78,-0.15,0,0,0,1.24,1.32,1.1));aClad(p,aDk(c.w,0.86),-0.8,0.44,-0.7,Z,0.12,1.32,'lap',0.07);
      p.push(P(BOX,c.t,-0.18,0.8,-0.15,0,0,0,1.27,0.05,1.13));
      aGable(p,c.r,-0.18,1.44,-0.15,1.24,0.74,1.1,0,{ov:0.08,oe:0.08,fill:c.w,trim:c.t,lines:aDk(c.r,0.84),n:4});
      for(let k=0;k<4;k++){const y=1.5+k*0.13,hw=0.62*(1-(y-1.44)/0.74)-0.04;if(hw>0.04)p.push(P(BOX,k%2?c.a:c.t,-0.18,y,Z+0.006,0,0,0,hw*2,0.05,0.012));}
      gl.push(P(CYL12,A_GLASS,-0.18,1.63,Z+0.01,1.57,0,0,0.14,0.02,0.14));p.push(P(CYL12,c.t,-0.18,1.63,Z+0.004,1.57,0,0,0.2,0.02,0.2));
      // the turret
      p.push(P(CYL12,c.w,0.55,0.87,0.22,0,0,0,0.58,1.5,0.58));for(const y of [0.8,1.6])p.push(P(CYL12,c.t,0.55,y,0.22,0,0,0,0.62,0.05,0.62));
      p.push(PG(CONE12,aLt(c.r,0.08),aDk(c.r,0.85),0.55,2.02,0.22,0,0,0,0.72,0.82,0.72),P(CYL6,0x3a3a3a,0.55,2.5,0.22,0,0,0,0.02,0.2,0.02),P(ICO2,0xd8b050,0.55,2.56,0.22,0,0,0,0.06,0.06,0.06));
      for(const a of [0.3,1.3])for(const y of [0.48,1.2])aWin(p,gl,0.55+Math.sin(a)*0.292,y,0.22+Math.cos(a)*0.292,0.12,0.3,{frame:c.t,m:'v',sill:false,hood:c.a},a);
      // the porch: spindles, gingerbread brackets, a striped fascia
      p.push(P(BOX,0x9aa0a8,-0.22,0.15,0.65,0,0,0,1.38,0.06,0.5));p.push(P(BOX,c.r,-0.22,0.88,0.64,0.14,0,0,1.44,0.04,0.58),P(BOX,c.a,-0.22,0.84,0.93,0,0,0,1.44,0.05,0.02));
      for(const x of [-0.86,-0.42,0.0,0.42]){p.push(P(CYL8,c.t,x,0.5,0.88,0,0,0,0.05,0.66,0.05));for(const sd of [-1,1])p.push(P(PRISM,c.t,x+sd*0.06,0.78,0.88,0,0,Math.PI,0.05,0.07,0.015));}
      p.push(P(BOX,c.t,-0.64,0.38,0.88,0,0,0,0.44,0.025,0.025),P(BOX,c.t,0.2,0.38,0.88,0,0,0,0.42,0.025,0.025));
      for(let x=-0.84;x<0.42;x+=0.07){if(x>-0.42&&x<0)continue;p.push(P(CYL6,c.t,x,0.27,0.88,0,0,0,0.018,0.22,0.018));}
      aDoor(p,gl,-0.2,0.18,Z+0.004,c.a,{w:0.24,h:0.52,frame:c.t,glass:1,transom:1});
      aWin(p,gl,-0.6,0.5,Z+0.004,0.18,0.4,{frame:c.t,m:'v',hood:c.a});for(const x of [-0.56,0.18])aWin(p,gl,x,1.12,Z+0.004,0.16,0.36,{frame:c.t,m:'cross',hood:c.a});
      p.push(P(BOX,0xa85a40,-0.62,1.85,-0.5,0,0,0,0.18,0.9,0.22),P(BOX,0x8a4a3a,-0.62,2.32,-0.5,0,0,0,0.24,0.05,0.28));
      for(const x of [-0.64,0.2])p.push(PG(SPH_LO,0x6aa84a,0x3a7a30,x,0.7,0.88,0,0,0,0.14,0.12,0.14));aBlooms(p,0.86,0.82,0.26,[0xf2a6c8,0xffffff]);}},
  capecod:{pals:[{w:0xa8a49c,t:0xfbf8f2,d:0xa8343a,r:0x5a5a60,sh:0x2a3a5a},{w:0xf4f2ec,t:0xfbf8f2,d:0x2a3a5a,r:0x60646c,sh:0x2a3a5a},{w:0xb8c8d8,t:0xfbf8f2,d:0xe8b040,r:0x4a4e58,sh:0x4a5a6a}],
    build(p,gl,c){const Z=0.56;
      p.push(P(BOX,0x9a948a,0,0.05,-0.05,0,0,0,1.84,0.1,1.32),P(BOX,c.w,0,0.52,-0.05,0,0,0,1.76,0.84,1.22));aClad(p,aDk(c.w,0.86),-0.88,0.88,-0.66,Z,0.1,0.84,'lap',0.055);
      for(const sx of [-1,1])p.push(P(BOX,c.t,sx*0.865,0.52,Z-0.01,0,0,0,0.05,0.84,0.03));
      aGable(p,c.r,0,0.94,-0.05,1.22,0.82,1.76,Math.PI/2,{ov:0.08,oe:0.05,fill:c.w,trim:c.t,lines:aDk(c.r,0.84),n:5});
      for(const x of [-0.48,0.48]){p.push(P(BOX,c.w,x,1.16,0.225,0,0,0,0.34,0.32,0.46));aGable(p,c.r,x,1.32,0.22,0.34,0.2,0.48,0,{ov:0.05,oe:0.03,fill:c.w,trim:c.t});aWin(p,gl,x,1.16,0.456,0.18,0.2,{frame:c.t,m:'grid',c:2,r:2,sill:false});}
      p.push(P(BOX,0xa85a40,0,1.72,-0.05,0,0,0,0.26,0.5,0.26),P(BOX,0x8a4a3a,0,1.98,-0.05,0,0,0,0.3,0.04,0.3));
      aDoor(p,gl,0,0.1,Z+0.004,c.d,{w:0.24,h:0.56,frame:c.t,side:1,pedi:c.t,panels:6});
      for(const x of [-0.56,0.56])aWin(p,gl,x,0.52,Z+0.004,0.24,0.34,{frame:c.t,m:'grid',c:3,r:4,sh:c.sh,box:1,boxC:c.t,flowers:[0xf2a6c8,0xffffff]});
      p.push(P(BOX,0xb8b0a4,0,0.04,Z+0.12,0,0,0,0.5,0.04,0.2));
      for(const [x,cl] of [[-0.82,0x6a8ad8],[-0.3,0x8aa0e8],[0.3,0xd88ab8],[0.82,0x6a8ad8]])aBlooms(p,x,Z+0.3,0.26,[cl,aLt(cl,0.3)]);}},
  japanese:{pals:[{t:0x4a3428,s:0xf2ece0,r:0x4a4e56,k:0xb08a5a},{t:0x6a4a32,s:0xf4eee2,r:0x3a3e46,k:0xc09a6a},{t:0x2a2624,s:0xe8e2d4,r:0x5a5e66,k:0xa07a52}],
    build(p,gl,c){const Z=0.35,SH=0xf6ecd0;
      p.push(P(BOX,0x8a8680,0,0.08,-0.15,0,0,0,1.6,0.16,1.12),P(BOX,c.k,0,0.24,0.62,0,0,0,1.66,0.05,0.42));for(let i=1;i<5;i++)p.push(P(BOX,aDk(c.k,0.84),0,0.268,0.41+i*0.084,0,0,0,1.66,0.004,0.008));
      for(const x of [-0.78,0,0.78])p.push(P(BOX,0x8a8680,x,0.1,0.78,0,0,0,0.1,0.2,0.1));
      p.push(P(BOX,c.s,0,0.66,-0.15,0,0,0,1.46,0.8,1.0));
      for(const x of [-0.73,-0.25,0.25,0.73])p.push(P(BOX,c.t,x,0.66,Z+0.01,0,0,0,0.06,0.82,0.06));for(const x of [-0.8,0.8])p.push(P(BOX,c.t,x,0.62,0.8,0,0,0,0.06,0.8,0.06));
      for(const x of [-0.735,0.735])for(const z of [-0.2,-0.64])p.push(P(BOX,c.t,x,0.66,z,0,0,0,0.06,0.82,0.06));
      p.push(P(BOX,c.t,0,1.04,Z+0.01,0,0,0,1.5,0.06,0.05),P(BOX,c.t,0,0.84,Z+0.01,0,0,0,1.5,0.04,0.04),P(BOX,c.t,0,1.0,0.8,0,0,0,1.66,0.05,0.05));
      // shoji in every bay, the middle pair a sliding door under a noren
      for(const [x,w] of [[-0.49,0.42],[0,0.44],[0.49,0.42]]){const h=x===0?0.56:0.36,y=x===0?0.55:0.64;gl.push(P(BOX,SH,x,y,Z,0,0,0,w,h,0.02));
        for(let i=1;i<4;i++)p.push(P(BOX,c.t,x-w/2+i*w/4,y,Z+0.014,0,0,0,0.012,h,0.01));for(let j=1;j<(x===0?6:4);j++)p.push(P(BOX,c.t,x,y-h/2+j*h/(x===0?6:4),Z+0.014,0,0,0,w,0.012,0.01));
        if(x)p.push(P(BOX,c.t,x,0.42,Z+0.01,0,0,0,w,0.08,0.03));}
      p.push(P(BOX,0x2a3a6a,0,0.77,Z+0.03,0,0,0,0.42,0.16,0.01));for(const x of [-0.07,0.07])p.push(P(BOX,0x1a2a4a,x,0.75,Z+0.036,0,0,0,0.012,0.12,0.004));p.push(P(CYL12,0xfbf8f0,0.14,0.8,Z+0.04,1.57,0,0,0.06,0.006,0.06));
      // the irimoya roof: a wide hipped skirt with tiles running down it, a gable above, upturned corners, ridge ends
      aHip(p,c.r,0,1.06,-0.05,2.0,0.38,1.84,{eave:c.t,tubes:aDk(c.r,0.8),step:0.12});
      aGable(p,c.r,0,1.3,-0.05,0.86,0.36,1.16,Math.PI/2,{ov:0.06,oe:0.06,fill:c.s,trim:c.t,lines:aDk(c.r,0.8),n:3});
      for(const sx of [-1,1]){p.push(P(BOX,c.r,sx*0.66,1.72,-0.05,0,0,-sx*0.3,0.1,0.16,0.14));for(const sz of [-1,1])p.push(P(BOX,c.r,sx*0.97,1.1,-0.05+sz*0.89,sz*0.4,0,-sx*0.4,0.18,0.04,0.18));}
      // a stone lantern, stepping stones and a red maple
      p.push(P(BOX,0xa8a49c,0.84,0.1,0.92,0,0,0,0.14,0.2,0.14),P(BOX,0xb8b4ac,0.84,0.27,0.92,0,0,0,0.16,0.12,0.16),P(A_HIP,0x9a968e,0.84,0.33,0.92,0,0,0,0.26,0.1,0.26));gl.push(P(BOX,0xffe0a0,0.84,0.27,0.93,0,0,0,0.08,0.06,0.17));
      for(let i=0;i<2;i++)p.push(P(CYL12,0xb8b4ac,-0.1+i*0.18,0.02,0.94-i*0.02,0,0,0,0.18,0.03,0.14));
      p.push(P(CYL8,0x4a3428,-0.86,0.35,0.84,0,0,0.2,0.06,0.7,0.06));for(const [dx,dy,s] of [[0,0.72,0.42],[0.12,0.86,0.3],[-0.1,0.6,0.32]])p.push(PG(SPH_LO,0xe8603a,0xb03a2a,-0.86+dx,dy,0.84,0,0,0,s,s*0.6,s));}},
  farmhouse:{pals:[{w:0xf6f6f2,k:0x2a2c30,wood:0xb07a4a},{w:0xe8e2d6,k:0x34383c,wood:0x9a6a40},{w:0x4a5048,k:0x1e2024,wood:0xc08a54}],
    build(p,gl,c){const Z=0.43,line=c.w===0x4a5048?aLt(c.w,0.1):aDk(c.w,0.9);
      p.push(P(BOX,0x8a8884,0,0.05,-0.1,0,0,0,1.76,0.1,1.3),P(BOX,c.w,0,0.58,-0.15,0,0,0,1.66,0.96,1.16));aClad(p,line,-0.83,0.83,-0.73,Z,0.1,0.96,'board',0.1);
      aGable(p,c.k,0,1.06,-0.15,1.16,0.66,1.66,Math.PI/2,{ov:0.07,oe:0.05,fill:c.w,trim:c.k,seams:aLt(c.k,0.14),ns:14});
      p.push(P(BOX,c.w,0.42,0.58,0.31,0,0,0,0.68,0.96,0.42));aClad(p,line,0.08,0.76,0.1,0.52,0.1,0.96,'board',0.1);
      aGable(p,c.k,0.42,1.06,0.12,0.68,0.6,0.82,0,{ov:0.06,oe:0.05,fill:c.w,trim:c.k,seams:aLt(c.k,0.14),ns:5});
      aWin(p,gl,0.42,1.3,0.526,0.18,0.22,{frame:c.k,m:'cross',sill:false});aWin(p,gl,0.42,0.56,0.526,0.42,0.52,{frame:c.k,m:'grid',c:2,r:2,sill:false});
      // a porch with a black metal roof on timber posts; a glazed black door with lanterns either side
      p.push(P(BOX,c.wood,-0.38,0.13,0.62,0,0,0,0.92,0.06,0.4),P(BOX,c.k,-0.38,0.86,0.62,0.16,0,0,1.0,0.035,0.5));for(const x of [-0.8,0.02])p.push(P(BOX,c.wood,x,0.5,0.8,0,0,0,0.06,0.7,0.06));
      aDoor(p,gl,-0.4,0.16,Z+0.004,c.k,{w:0.26,h:0.58,frame:c.k,glass:1,lamp:2});aWin(p,gl,-0.74,0.98,Z+0.004,0.12,0.12,{frame:c.k,m:'none',sill:false});
      aPot(p,-0.74,0.78,c.k,'fern');aPot(p,-0.08,0.78,c.k,'fern');aPot(p,0.84,0.76,0xd8d0c4,'ball',0x6a9a5a);
      p.push(P(BOX,c.wood,-0.38,0.06,0.9,0,0,0,0.36,0.05,0.16));}},
  georgian:{pals:[{b:0xa85a40,t:0xfbf8f2,r:0x4a4e58,d:0x26282c,st:0xe8dcc4},{b:0x8a4a3a,t:0xfbf8f2,r:0x50545e,d:0x2a4a3a,st:0xe8dcc4},{b:0xe8dcc4,t:0xfbf8f2,r:0x50545e,d:0x6a2a3a,st:0xf4ecdc}],
    build(p,gl,c){const Z=0.57;
      p.push(P(BOX,0xc8c0b0,0,0.06,-0.05,0,0,0,1.78,0.12,1.34),P(BOX,c.b,0,0.72,-0.05,0,0,0,1.7,1.2,1.24));aClad(p,aDk(c.b,c.b===0xe8dcc4?0.9:0.84),-0.85,0.85,-0.67,Z,0.12,1.2,'brick',c.b===0xe8dcc4?0.12:0.06);
      p.push(P(BOX,c.t,0,0.74,-0.05,0,0,0,1.72,0.04,1.26),P(BOX,c.t,0,1.34,-0.05,0,0,0,1.82,0.06,1.36));for(let x=-0.84;x<=0.85;x+=0.07)p.push(P(BOX,c.t,x,1.29,Z+0.012,0,0,0,0.03,0.03,0.03));
      aHip(p,c.r,0,1.37,-0.05,1.8,0.5,1.34,{courses:aDk(c.r,0.84)});
      for(const x of [-0.72,0.72]){p.push(P(BOX,c.b,x,1.72,-0.05,0,0,0,0.2,0.8,0.36),P(BOX,c.t,x,2.12,-0.05,0,0,0,0.24,0.04,0.4));for(const dz of [-0.09,0,0.09])p.push(P(CYL8,0xb86a4a,x,2.19,-0.05+dz,0,0,0,0.06,0.1,0.06));}
      const o={frame:c.t,m:'grid',c:3,r:4,mc:c.t,lin:c.st,key:1};for(const x of [-0.56,0.56])aWin(p,gl,x,0.44,Z+0.004,0.22,0.34,o);for(const x of [-0.56,0,0.56])aWin(p,gl,x,1.06,Z+0.004,0.22,0.3,o);
      aDoor(p,gl,0,0.15,Z+0.004,c.d,{w:0.24,h:0.46,frame:c.t,fan:1,panels:6});
      for(const x of [-0.2,0.2])p.push(P(CYL12,c.t,x,0.45,0.8,0,0,0,0.07,0.58,0.07),P(BOX,c.t,x,0.17,0.8,0,0,0,0.1,0.04,0.1));
      p.push(P(BOX,c.t,0,0.76,0.7,0,0,0,0.56,0.06,0.28),P(PRISM,c.t,0,0.79+0.06,0.7,0,0,0,0.6/1.732,0.18/1.5,0.28));
      p.push(P(BOX,0xd8d0c4,0,0.04,0.84,0,0,0,0.62,0.08,0.22),P(BOX,0xd8d0c4,0,0.11,0.75,0,0,0,0.52,0.06,0.16));
      for(const x of [-0.5,0.5]){p.push(P(BOX,0x4a4e52,x,0.1,0.82,0,0,0,0.18,0.18,0.18));p.push(PG(CONE12,0x4a8a3a,0x2a5a2a,x,0.42,0.82,0,0,0,0.22,0.48,0.22));}}},
  aframe:{pals:[{r:0x3a3634,w:0xb07a4a,t:0xd8b080},{r:0x3a4a3a,w:0xa87448,t:0xd8b080},{r:0x6a3a2a,w:0xc08a58,t:0xe0c098}],
    build(p,gl,c){const W=1.56,H=1.9,y=0.1,zc=-0.15,L=1.3,Z=zc+L/2;
      p.push(P(BOX,0x7a7068,0,0.05,-0.12,0,0,0,1.6,0.1,1.42));
      aGable(p,c.r,0,y,zc,W,H,L,0,{ov:0.1,oe:0.07,th:0.07,fill:c.w,trim:c.t,lines:aDk(c.r,0.78),n:8});
      // the glazed gable: glass in a timber grid, the door at its foot
      const gw=W*0.84,gh=H*0.84;gl.push(P(PRISM,0x5a6a7e,0,y+gh/3,Z+0.006,0,0,0,gw/1.732,gh/1.5,0.02));
      for(const x of [-0.36,0,0.36]){const h=gh*(1-Math.abs(x)/(gw/2));p.push(P(BOX,c.t,x,y+h/2,Z+0.02,0,0,0,0.035,h,0.02));}
      for(const yy of [0.8,1.3]){const w=gw*(1-(yy-y)/gh);p.push(P(BOX,c.t,0,yy,Z+0.02,0,0,0,w,0.035,0.02));}
      aDoor(p,gl,0,0.12,Z+0.02,c.w,{w:0.3,h:0.6,frame:c.t,glass:1});
      // the deck with a rail, a stovepipe through the roof, pines behind, a lantern
      p.push(P(BOX,c.t,0,0.12,0.78,0,0,0,1.56,0.05,0.36));for(let i=1;i<7;i++)p.push(P(BOX,aDk(c.t,0.84),-0.78+i*0.223,0.146,0.78,0,0,0,0.008,0.004,0.36));
      for(const x of [-0.76,-0.3,0.3,0.76])p.push(P(BOX,c.w,x,0.3,0.94,0,0,0,0.04,0.32,0.04));for(const x of [-0.53,0.53])p.push(P(BOX,c.w,x,0.44,0.94,0,0,0,0.5,0.03,0.04));
      p.push(P(CYL8,0x2a2a2e,0.38,1.45,-0.45,0,0,0,0.08,0.9,0.08),P(CONE8,0x2a2a2e,0.38,1.94,-0.45,0,0,0,0.16,0.08,0.16));
      for(const [x,z] of [[-0.88,-0.7],[0.9,-0.55]])for(let i=0;i<3;i++)p.push(PG(CONE12,0x4a8a5a,0x2a5a3a,x,0.5+i*0.32,z,0,0,0,0.5-i*0.12,0.5,0.5-i*0.12));
      YARD.logs(p,0.88,0.3);gl.push(P(BOX,0xffe0a0,0.6,0.32,0.94,0,0,0,0.06,0.08,0.06));}}};
const ARCH_STYLES=Object.keys(ARCH);
// this island's order of styles, and which one house n takes
function archFor(n){const R=mulberry(hi(977,(S.worldSeed|0)%100003,31)),l=ARCH_STYLES.slice();for(let i=0;i<4;i++)R();for(let i=l.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[l[i],l[j]]=[l[j],l[i]];}return l[(n|0)%l.length];}
function archHouse(n,p,gl,style,pal){const st=style||archFor(n),A=ARCH[st],R=mulberry(hi((n|0)+3,(S.worldSeed|0)%100003,57));for(let i=0;i<4;i++)R();
  A.build(p,gl,A.pals[pal!==undefined?pal%A.pals.length:Math.floor(R()*A.pals.length)],R);return st;}
