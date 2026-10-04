/* =========================================================
   Wild tree species. The home island's woods mix ten kinds (a debris tree's v: species = v%10, shape = floor(v/10)):
   0 oak, 1 pine, 2 maple, 3 cherry, 4 apple, 5 pear, 6 peach, 7 birch, 8 spruce, 9 poplar. The broadleaf kinds come in
   two crown shapes, and every tree also gets its own size, width, lean of colour and turn (TREE_VAR, per instance), so a
   grove never repeats. Fruit trees blossom in spring and carry fruit in season: the fruit is a separate batch drawn over
   the tree (fruitParts), so shaking one can knock its fruit off (77-forage) until it grows back a few days later.
   ========================================================= */
const TREE_NS=10;
const TREE_SP=[
  {id:'oak',name:'Oak',shapes:2},{id:'pine',name:'Pine',shapes:1,con:1},{id:'maple',name:'Maple',shapes:2},{id:'cherry',name:'Cherry',shapes:1,fruit:'cherries',fs:['summer']},
  {id:'apple',name:'Apple',shapes:2,fruit:'apple',fs:['summer','autumn']},{id:'pear',name:'Pear',shapes:1,fruit:'pear',fs:['summer','autumn']},
  {id:'peach',name:'Peach',shapes:1,fruit:'peach',fs:['summer']},{id:'birch',name:'Birch',shapes:2},{id:'spruce',name:'Spruce',shapes:1,con:1},{id:'poplar',name:'Poplar',shapes:1}];
const treeSp=v=>TREE_SP[(v|0)%TREE_NS],treeShape=v=>Math.floor((v|0)/TREE_NS)%2;
// leaf colours [light, mid, dark] by season
const SP_COLS={
  oak:{spring:[0x8ed06a,0x5aa846,0x356e32],summer:[0x64ae44,0x3e8634,0x21562a],autumn:[0xf4a444,0xe8803a,0xc85e24]},
  maple:{spring:[0x82c460,0x4f9a40,0x2e662e],summer:[0x589e3e,0x347630,0x1c4c28],autumn:[0xec6a4a,0xc8402a,0x982a22]},
  cherry:{spring:[0xffd8e6,0xf4a8c4,0xd07a9a],summer:[0x6eb44a,0x428c36,0x245c2a],autumn:[0xf6d060,0xe0b040,0xb08a28]},
  apple:{spring:[0x9ad870,0x62ac48,0x3a7234],summer:[0x74b84c,0x4a9038,0x285e2a],autumn:[0xc8c050,0x9aa03a,0x6a7a2a]},
  pear:{spring:[0x94d06c,0x5ea446,0x366c32],summer:[0x6aae48,0x44883a,0x245a2c],autumn:[0xe89a3a,0xc8602a,0x8a3a22]},
  peach:{spring:[0xffc0cc,0xf08aa4,0xc05a7a],summer:[0x86c054,0x5a9a3e,0x346a2e],autumn:[0xe8b848,0xc88a30,0x8a5a22]},
  birch:{spring:[0xc0e88a,0x8ecc5e,0x5a9a40],summer:[0x9ad464,0x6cb048,0x3e7a34],autumn:[0xfae070,0xf0c040,0xc08a20]},
  poplar:{spring:[0x9ad46a,0x68aa48,0x3c7434],summer:[0x6aac4a,0x46883a,0x265a2c],autumn:[0xf6d25a,0xe0aa38,0xa87a24]}};
{const c=new T.Color(),h={};for(const k in SP_COLS)SP_COLS[k].autumn=SP_COLS[k].autumn.map(v=>{c.setHex(v).getHSL(h);return c.setHSL(h.h,h.s*0.84,h.l*0.97).getHex();});}/* autumn, muted to sit together */
// scale a set of parts about a point (for stretching a crown taller or wider)
function stretchParts(p,from,sx,sy,sz,cx,cy,cz){for(let i=from;i<p.length;i++){const q=p[i];q.x=cx+(q.x-cx)*sx;q.y=cy+(q.y-cy)*sy;q.z=cz+(q.z-cz)*sz;q.sx*=sx;q.sy*=sy;q.sz*=sz;}}
function blossom(p,R,n,cx,cy,cz,rad,cols){dots(p,R,n,cx,cy+rad*0.2,cz,rad*1.7,rad*1.5,cols,0xf6d04a,0.075);}
// a branch from (x0,y0,z0) to (x1,y1,z1)
function limb(p,col,x0,y0,z0,x1,y1,z1,w){const dx=x1-x0,dy=y1-y0,dz=z1-z0,L=Math.hypot(dx,dy,dz);
  p.push(P(CYL6,col,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2,Math.atan2(Math.hypot(dx,dz),dy),Math.atan2(dx,dz),0,w,L,w));}
// builds one species; returns the crowns [cx,cy,cz,rad] that fruit hangs from
function speciesParts(v,s,R,p){const sp=treeSp(v),sh=treeShape(v),id=sp.id,C=SP_COLS[id]&&SP_COLS[id][s],cr=[];
  const bare=s==='winter';
  switch(id){
    case'oak':case'maple':{if(bare){bareTree(p,R,true);break;}
      if(sh===0){trunkP(p,R,0x7a5230,0.62,0.12,0x5e3e24);const n=p.length;canopy(p,R,C,0,1.08,0,0.42);if(id==='maple')stretchParts(p,n,0.92,1.18,0.92,0,1.08,0);cr.push([0,1.08,0,0.42]);}
      else{// a broad old tree: the trunk forks into two big limbs, each under its own crown
        trunkP(p,R,0x74502e,0.5,0.14,0x5a3a22);limb(p,0x6a4428,0,0.7,0,-0.3,1.05,0.05,0.09);limb(p,0x6a4428,0,0.7,0,0.28,1.15,-0.05,0.085);
        canopy(p,R,C,-0.3,1.12,0.05,0.36);canopy(p,R,C,0.3,1.28,-0.05,0.34);canopy(p,R,C,0,1.45,0.02,0.24);cr.push([-0.3,1.12,0.05,0.36],[0.3,1.28,-0.05,0.34]);}
      if(s==='spring'&&id==='oak'&&sh===0)dots(p,R,8,0,1.28,0,0.6,0.4,[0xffffff,0xfbe0ea],0xf6d04a,0.06);
      if(s==='autumn')for(let i=0;i<6;i++)p.push(P(SPH_XS,C[i%3],(R()-0.5)*1.6,0.02,(R()-0.5)*1.6,0,R()*3,0,0.16,0.02,0.11));break;}
    case'cherry':{if(bare){bareTree(p,R,true);break;}trunkP(p,R,0x6a4436,0.62,0.12,0x4e3228);canopy(p,R,C,0,1.08,0,0.42);cr.push([0,1.08,0,0.42]);
      if(s==='spring')for(let i=0;i<6;i++)lf(p,[0xf8c8d8,0xffe4ee][i%2],(R()-0.5)*1.5,0.02,(R()-0.5)*1.5,R()*6.28,0,0.1,0.08,0.02);/* petals on the grass */break;}
    case'apple':{if(bare){bareTree(p,R,true);break;}// short and spreading: a low, wide, flattened crown on a stout, leaning trunk
      const lean=(R()-0.5)*0.16;trunkP(p,R,0x6e4a30,0.4,0.13,0x523622);limb(p,0x62422a,0,0.55,0,lean-0.25,0.85,0.1,0.08);limb(p,0x62422a,0,0.55,0,lean+0.25,0.9,-0.08,0.08);
      const n=p.length,cy=sh?1.02:0.96;canopy(p,R,C,lean,cy,0,sh?0.4:0.46);stretchParts(p,n,sh?1.05:1.18,sh?0.9:0.74,sh?1.05:1.18,lean,cy,0);cr.push([lean,cy,0,sh?0.4:0.46,sh?0.9:0.74,sh?1.05:1.18]);
      if(s==='spring')blossom(p,R,26,lean,cy,0,sh?0.42:0.52,[0xffffff,0xffe8f0,0xfad0dc]);break;}
    case'pear':{if(bare){bareTree(p,R,true);break;}// upright, with a tall teardrop crown
      trunkP(p,R,0x5e4232,0.78,0.11,0x463024);const n=p.length;canopy(p,R,C,0,1.3,0,0.38);stretchParts(p,n,0.9,1.35,0.9,0,1.3,0);cr.push([0,1.3,0,0.38,1.35,0.9]);
      if(s==='spring')blossom(p,R,24,0,1.36,0,0.36,[0xffffff,0xf4f4ea]);break;}
    case'peach':{if(bare){bareTree(p,R,true);break;}// a little open-centred tree: three slim stems in a vase, each with a small crown
      p.push(PG(SPH_LO,0x5a3a2c,0x6a4636,0,0.05,0,0,0,0,0.36,0.22,0.36));const a0=R()*6.283;
      for(let i=0;i<3;i++){const a=a0+i*2.094+(R()-0.5)*0.4,x=Math.cos(a)*0.34,z=Math.sin(a)*0.34,y=0.98+R()*0.14;limb(p,0x6a4436,Math.cos(a)*0.05,0.05,Math.sin(a)*0.05,x*0.9,y-0.14,z*0.9,0.075);canopy(p,R,C,x,y,z,0.26);cr.push([x,y,z,0.26]);}
      if(s==='spring')for(const c of cr)blossom(p,R,9,c[0],c[1],c[2],0.26,[0xffc4d4,0xf8a0b8,0xffe0e8]);break;}
    case'birch':{// slender white trunks with dark marks and a light, airy crown of small clumps
      const stems=sh?2:1;for(let k=0;k<stems;k++){const ox=stems>1?(k?0.14:-0.12):0,lean=stems>1?(k?0.1:-0.1):0,h=sh?(k?1.25:1.05):1.2;
        p.push(PG(STRUNK,0xf4f0e8,0xc8c0b4,ox+lean*h*0.5,h/2,0,0,0,-lean,0.14,h,0.14));
        for(let i=0;i<5;i++){const y=0.15+i*h/5.5+R()*0.08,a=R()*6.283;p.push(P(BOX,0x3a3434,ox+lean*y+Math.cos(a)*0.055,y,Math.sin(a)*0.055,0,-a,0,0.045,0.025,0.06));}
        if(bare){for(let i=0;i<4;i++){const a=i*1.57+R(),y=h*0.7+i*0.1;limb(p,0x6a5a52,ox+lean*y,y,0,ox+lean*y+Math.cos(a)*0.32,y+0.28,Math.sin(a)*0.32,0.025);p.push(P(SPH_LO,0xf4f8fa,ox+lean*y+Math.cos(a)*0.32,y+0.3,Math.sin(a)*0.32,0,0,0,0.1,0.05,0.1));}continue;}
        for(let i=0;i<9;i++){const a=R()*6.283,r=0.1+R()*0.2,y=h*0.6+R()*0.62,rad=0.17+R()*0.07;const cx=ox+lean*y+Math.cos(a)*r,cz=Math.sin(a)*r;
          p.push(PG(SPH_LO,i%2?C[0]:C[1],C[2],cx,y,cz,0,a,0,rad*2.4,rad*2,rad*2.4));}
        p.push(PG(SPH_LO,C[0],C[1],ox+lean*(h+0.3),h+0.32,0,0,0,0,0.26,0.3,0.26));}break;}
    case'spruce':{const sn=bare,tip=0x7ab87a,mid=0x2e6e4a,base=0x163a2c;// tall and narrow: many tiers tapering to a spire
      p.push(PG(STRUNK,0x6a4430,0x4e3022,0,0.3,0,0,0,0,0.24,0.6,0.24));
      for(let i=0;i<6;i++){const t=i/5,y=0.4+i*0.36,rad=0.62-t*0.46,h=0.6-t*0.12,top=lerpHex(mid,tip,0.2+t*0.45),bot=lerpHex(base,mid,t*0.35);
        p.push(PG(SCONE,top,bot,0,y+h/2,0,0,R(),0,rad*2,h,rad*2));if(sn)p.push(PG(SCONE,0xffffff,0xdce8f2,0,y+h*0.68,0,0,R(),0,rad*1.6,h*0.62,rad*1.6));}
      p.push(P(CONE5,sn?0xffffff:tip,0,2.55,0,0,0,0,0.14,0.34,0.14));break;}
    case'poplar':{if(bare){trunkP(p,R,0x6a5a48,1.1,0.1,0x4e4234);for(let i=0;i<8;i++){const a=i*0.8,y=0.8+i*0.16;limb(p,0x5e5044,Math.cos(a)*0.04,y,Math.sin(a)*0.04,Math.cos(a)*0.2,y+0.45,Math.sin(a)*0.2,0.025);}break;}
      trunkP(p,R,0x6a5a48,0.42,0.1,0x4e4234);const n=p.length;canopy(p,R,C,0,1.42,0,0.34);stretchParts(p,n,0.74,2.2,0.74,0,1.42,0);break;}
  }
  return cr;}
const PINE_TREE=(s,R)=>treeParts(s==='winter'?'snowpine':'pine',R,0x9a9ea8).map(q=>Object.assign(q,{x:q.x*0.78,y:q.y*0.78,z:q.z*0.78,sx:q.sx*0.78,sy:q.sy*0.78,sz:q.sz*0.78}));

// ---- fruit: realistic little models hanging from the crown ----
// each fruit model sits with its stem end at the origin, hanging down (so it can be dropped as a mesh on its own too)
function fruitModel(k,R,p=[],x=0,y=0,z=0){const r=R?R():0.5;
  switch(k){
    case'apple':{const warm=r<0.35;// a red apple with a yellow-green shoulder, a dimple, a stem and a leaf
      p.push(PG(SPH,warm?0xf0b850:0xe0483a,warm?0xd0342a:0xa4202a,x,y-0.075,z,0,r*6,0,0.15,0.135,0.15),P(SPH_XS,0x5a2a1a,x,y-0.012,z,0,0,0,0.04,0.02,0.04),
        P(CYL5,0x5a3a22,x,y+0.012,z,0,0,0.25,0.012,0.05,0.012),P(LEAF0,0x4e9a3a,x+0.035,y+0.02,z,0,r*6,0.9,0.05,0.012,0.09));break;}
    case'pear':{const bl=r<0.4;
      p.push(PG(SPH,bl?0xe0c050:0xc8d050,bl?0xc07a30:0x98a838,x,y-0.12,z,0,0,0,0.15,0.14,0.15),PG(SPH_LO,bl?0xe8cc5a:0xd0d858,bl?0xe0c050:0xc8d050,x,y-0.05,z,0,0,0,0.095,0.12,0.095),
        P(CYL5,0x5a3a22,x+0.008,y+0.005,z,0,0,0.3,0.012,0.05,0.012));break;}
    case'peach':p.push(PG(SPH,0xf8b070,0xe0584a,x,y-0.075,z,0,r*6,0,0.15,0.145,0.145),P(LEAF0,0x5a9a3e,x-0.03,y+0.005,z,0,r*6,-0.7,0.045,0.012,0.11),P(LEAF0,0x4a8a36,x+0.03,y+0.005,z,0,r*6+2,0.7,0.04,0.012,0.1));break;
    case'cherries':// a pair on two stems joined at the top
      p.push(P(CYL5,0x4e7a2e,x-0.025,y-0.045,z,0,0,-0.5,0.008,0.1,0.008),P(CYL5,0x4e7a2e,x+0.025,y-0.045,z,0,0,0.5,0.008,0.1,0.008),
        PG(SPH_LO,0xd8283a,0x7a0e1a,x-0.05,y-0.11,z,0,0,0,0.075,0.07,0.075),PG(SPH_LO,0xd8283a,0x7a0e1a,x+0.05,y-0.1,z,0,0,0,0.075,0.07,0.075),P(LEAF0,0x4e9a3a,x,y+0.005,z,0,r*6,0.3,0.045,0.01,0.09));break;
  }
  return p;}
const FRUIT_N={apple:4,pear:4,peach:4,cherries:5};
// where a tree's fruit hangs (tree-local): spread round the lower half of its crowns, poking out of the foliage
function fruitSlots(v){const sp=treeSp(v),s=season();if(!sp.fruit)return[];const R=mulberry(hi(v,91,S.worldSeed|0)),cr=speciesParts(v,s,mulberry(hi(v,31,S.worldSeed|0)),[]);
  if(!cr.length)return[];const n=FRUIT_N[sp.fruit],out=[],a0=R()*6.283;
  for(let i=0;i<n;i++){const c=cr[i%cr.length],[cx,cy,cz,rad]=c,sy=c[4]||1,sx=c[5]||1,a=a0+i/n*6.283*(cr.length>1?cr.length:1)+(R()-0.5)*0.6,h=-0.55+R()*0.5;
    // on the skin of the crown's lower half, just proud of the leaves
    const rr=rad*1.62*sx*Math.sqrt(1-h*h*0.6);out.push([cx+Math.cos(a)*rr,cy+h*rad*1.2*sy,cz+Math.sin(a)*rr]);}
  return out;}
function fruitParts(v){const sp=treeSp(v),R=mulberry(hi(v,93,S.worldSeed|0)),p=[];for(const [x,y,z] of fruitSlots(v))fruitModel(sp.fruit,R,p,x,y+0.05,z);return p;}
// does this species carry fruit right now?
const fruitSeason=v=>{const sp=treeSp(v);return !!(sp.fruit&&sp.fs.includes(season()));};

// ---- per-tree variance, drawn from the tile so it's stable (and needs nothing saved) ----
function treeVar(d){const h1=hash(d.x*1.31+7,d.z*0.77-3),h2=hash(d.z*1.13+1,d.x*0.91+5),h3=hash(d.x+d.z*3.1,d.z-d.x);
  const con=treeSp(d.v).con;return{w:(con?0.88:0.86)+h1*(con?0.2:0.3),h:0.9+h2*0.22,tint:[0.9+h3*0.18,0.94+h1*0.1,0.9+h2*0.14]};}
// fruit is drawn with the same gentle wind sway as the leaves it hangs among (so it never drifts off its branch)
const fruitMat=new T.MeshToonMaterial({gradientMap:grad,vertexColors:true});
fruitMat.onBeforeCompile=sh=>{sh.uniforms.uT=leafU.uT;sh.uniforms.uWind=leafU.uWind;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uT;uniform float uWind;')
    .replace('#include <begin_vertex>','#include <begin_vertex>\n{vec4 lp=vec4(transformed,1.);\n#ifdef USE_INSTANCING\nlp=instanceMatrix*lp;\n#endif\nvec3 wp=(modelMatrix*lp).xyz;\nfloat hh=max(0.,transformed.y-.45),gu=.6+.4*sin(uT*.35+wp.x*.08+wp.z*.05);\ntransformed.x+=sin(uT*1.6+wp.x*.7+wp.z*.4)*.028*hh*gu*uWind;transformed.z+=cos(uT*1.3+wp.z*.6)*.022*hh*gu*uWind;}');};
