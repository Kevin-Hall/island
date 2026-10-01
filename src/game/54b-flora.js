/* =========================================================
   Wild flowers: tulips, roses, cosmos, pansies, lilies, lupins, daisies and crocuses, built from smooth petal cards
   (30c-cards), each petal shaded from a deeper base to a bright tip, on slender leaning stems with their own leaves:
   strap leaves for tulips, fans of leaflets for lupins, grassy blades for crocuses and lilies.
   One clump of three flowers per species and colour, instanced over the town's grass (55-town layoutTown), plus a light
   twin of each for when you're zoomed out (no leaves, two-triangle petals; cullIslands in 44-terrain swaps them).
   ========================================================= */
const FLOWER_SP={tulip:[0xe8453a,0xf6d04a,0xf2a6c8,0xffffff,0x9a6ad0],rose:[0xd8303a,0xf8f4ee,0xf6d04a,0xf2a6c8],cosmos:[0xf2a6c8,0xf8f4ee,0xe86a8a,0xf6a830],
  pansy:[0x7a5ad0,0xf6d04a,0xe8453a,0x8ac8f0],lily:[0xf8f4ee,0xf08a2a,0xf2a6c8],lupine:[0x8a6ae0,0xf2a6c8,0x6a7ae0],daisy:[0xffffff,0xf6e6f0,0xb8a0ee],crocus:[0xb48ee8,0xf6f2fa,0xf6c440]};
const dkc=(c,f=0.78)=>new T.Color(c).multiplyScalar(f).getHex();
// the deeper colour at the base of a petal: white flowers go a soft yellow-green there, coloured ones a richer, darker shade
function petalBase(c,f=0.68){const k=new T.Color(c);if(Math.min(k.r,k.g,k.b)>0.85)return mixc(c,0xc4d488,0.55);const h={};k.getHSL(h);k.setHSL(h.h,Math.min(1,h.s*1.12),h.l*f);return k.getHex();}
const PT={tulip:cardGeo([[0,0],[0.36,0.4],[0.76,0.5],[1,0]],{cup:0.34,curl:-0.16}),round:cardGeo([[0,0],[0.3,0.42],[0.72,0.5],[1,0]],{cup:0.24}),
  fan:cardGeo([[0,0],[0.4,0.34],[0.86,0.5],[1,0.3]],{cup:0.14}),ray:cardGeo([[0,0],[0.18,0.5],[0.84,0.42],[1,0]],{mid:false}),
  lily:cardGeo([[0,0],[0.3,0.42],[0.6,0.5],[1,0]],{cup:0.3,curl:0.9}),rose:cardGeo([[0,0],[0.3,0.44],[0.7,0.5],[1,0]],{cup:0.42,curl:-0.22}),bell:cardGeo([[0,0],[0.55,0.5],[1,0]],{cup:0.45}),lo:cardGeo([[0,0],[0.55,0.5],[1,0]],{mid:false})};
const LF={strap:cardGeo([[0,0.3],[0.45,0.46],[0.8,0.32],[1,0]],{cup:0.32,curl:1.1}),oval:cardGeo([[0,0],[0.35,0.46],[0.75,0.4],[1,0]],{cup:0.26,curl:0.3}),
  blade:cardGeo([[0,0.42],[0.6,0.34],[1,0]],{mid:false,curl:2}),leaflet:cardGeo([[0,0],[0.5,0.5],[1,0]],{cup:0.3,curl:0.4})};
const STEM=tubeGeo(3,0.65),DOME=domeGeo(6);
// heads: (x,y,z) is the top of the stem and d its direction; R is drawn the same number of times near and far, so the two
// versions of a clump match
const FLOWER_HEAD={
  tulip(p,c,x,y,z,R,lo){const a0=R()*6.283,base=petalBase(c),g=lo?PT.lo:PT.tulip;
    for(let k=0;k<6;k++){const a=a0+k*1.0472,o=k%2===0;cardP(p,g,o?ltc(c,0.18):ltc(c,0.06),base,x+Math.sin(a)*0.008,y,z+Math.cos(a)*0.008,a,o?0.26:0.12,0.115,o?0.095:0.08);}},
  // a rose: a cup of five broad petals round four more and a tight bud at the heart
  rose(p,c,x,y,z,R,lo){const a0=R()*6.283,base=petalBase(c,0.6),g=lo?PT.lo:PT.rose;
    for(let k=0;k<5;k++)cardP(p,g,ltc(c,0.14),base,x+Math.sin(a0+k*1.2566)*0.01,y,z+Math.cos(a0+k*1.2566)*0.01,a0+k*1.2566,0.62,0.08,0.085);
    for(let k=0;k<4;k++)cardP(p,g,ltc(c,0.04),base,x,y+0.008,z,a0+0.6+k*1.5708,0.28,0.068,0.07);
    if(!lo)for(let k=0;k<3;k++)cardP(p,PT.bell,dkc(c,0.88),base,x,y+0.016,z,a0+k*2.094,0.06,0.05,0.045);},
  cosmos(p,c,x,y,z,R,lo){const a0=R()*6.283,base=petalBase(c,0.82);
    for(let k=0;k<8;k++)cardP(p,lo?PT.lo:PT.fan,ltc(c,0.18),base,x,y,z,a0+k*0.7854,1.2,0.1,0.055);
    p.push(PG(DOME,0xf6c030,0xc08018,x,y-0.004,z,0,0,0,0.045,0.03,0.045));},
  // two upper petals behind, two at the sides and a broad one in front; the lower three carry the pansy's dark face
  pansy(p,c,x,y,z,R,lo){const a0=R()*6.283,g=lo?PT.lo:PT.round,face=mixc(c,0x2a1838,0.85),up=dkc(c,0.82);
    for(const [da,l,w,col,b] of [[2.6,0.075,0.08,up,dkc(c,0.6)],[-2.6,0.075,0.08,up,dkc(c,0.6)],[1.25,0.07,0.07,c,face],[-1.25,0.07,0.07,c,face],[0,0.078,0.088,ltc(c,0.1),face]])
      cardP(p,g,col,b,x,y,z,a0+da,1.15,l,w);
    p.push(PG(DOME,0xf6d04a,0xe0a020,x,y+0.004,z,0,0,0,0.022,0.016,0.022));},
  lily(p,c,x,y,z,R,lo){const a0=R()*6.283,throat=mixc(c,0xe8f0a0,0.45);
    for(let k=0;k<6;k++)cardP(p,lo?PT.lo:PT.lily,ltc(c,0.1),throat,x,y,z,a0+k*1.0472,k%2?0.62:0.78,0.13,0.05,0.05);
    if(!lo)for(let k=0;k<3;k++){const a=a0+k*2.094+0.5;p.push(PG(STEM,0xb8c860,0xd8e090,x,y,z,0.35,a,0,0.006,0.09,0.006),PG(DOME,0xc8601a,0xe07a2a,x+Math.sin(a)*0.031,y+0.083,z+Math.cos(a)*0.031,0,0,0,0.016,0.012,0.016));}},
  // a spike of little pea-flowers, dark below and paling to buds at the tip, up the leaning stem
  lupine(p,c,x,y,z,R,lo,d){const a0=R()*6.283,lv=lo?4:7,H=0.15;
    for(let i=0;i<lv;i++){const t=i/(lv-1),s=1-t*0.5,col=mixc(dkc(c,0.8),ltc(c,0.42),t),n=i===lv-1?2:3,cx=x+d[0]*t*H,cy=y+d[1]*t*H,cz=z+d[2]*t*H;
      for(let k=0;k<n;k++){const a=a0+k*6.283/n+i*1.1;cardP(p,lo?PT.lo:PT.bell,col,dkc(col,0.7),cx+Math.sin(a)*0.01*s,cy,cz+Math.cos(a)*0.01*s,a,1.05-t*0.5,0.042*s,0.036*s);}}},
  daisy(p,c,x,y,z,R,lo){const a0=R()*6.283,n=lo?8:13,base=mixc(petalBase(c,0.85),0xf6e6a0,0.25);
    for(let k=0;k<n;k++)cardP(p,lo?PT.lo:PT.ray,ltc(c,0.12),base,x,y,z,a0+k*6.283/n,1.3,0.078,0.024);
    p.push(PG(DOME,0xf6d04a,0xd8a020,x,y-0.003,z,0,0,0,0.04,0.026,0.04));},
  crocus(p,c,x,y,z,R,lo){const a0=R()*6.283,base=c===0xf6c440?0xd88a20:mixc(c,0x5a2aa0,0.6),g=lo?PT.lo:PT.tulip;
    for(let k=0;k<6;k++){const a=a0+k*1.0472;cardP(p,g,ltc(c,0.22),base,x+Math.sin(a)*0.005,y,z+Math.cos(a)*0.005,a,k%2?0.36:0.5,0.085,0.058);}
    p.push(PG(DOME,0xf08a2a,0xf6c030,x,y+0.012,z,0,0,0,0.018,0.03,0.018));}};
// leaves, from the foot of the stem at (x,z) (or up it, to height h); r: three random numbers for this flower
const FLOWER_LEAVES={
  tulip(p,x,z,h,a,r,g){for(let k=0;k<2;k++)cardP(p,LF.strap,ltc(g,0.1),dkc(g,0.7),x,0.004,z,a+k*3.1+r[k]*0.8,0.42+r[2]*0.3,0.17,0.06);},
  rose(p,x,z,h,a,r,g){for(let k=0;k<2;k++)cardP(p,LF.oval,ltc(g,0.08),dkc(g,0.72),x,h*(0.38+k*0.22),z,a+k*2.9+r[k],0.95,0.075,0.05);},
  cosmos(p,x,z,h,a,r,g){for(let k=0;k<3;k++)cardP(p,LF.blade,ltc(g,0.1),dkc(g,0.75),x,h*(0.2+k*0.18),z,a+k*2.2+r[k],0.75,0.09,0.018);},
  pansy(p,x,z,h,a,r,g){for(let k=0;k<3;k++)cardP(p,LF.oval,ltc(g,0.08),dkc(g,0.7),x,0.01,z,a+k*2.1+r[k]*0.5,1.15,0.08,0.055);},
  lily(p,x,z,h,a,r,g){for(let k=0;k<3;k++)cardP(p,LF.blade,ltc(g,0.1),dkc(g,0.72),x,h*(0.15+k*0.22),z,a+k*2.3+r[k],0.8,0.12,0.022);},
  lupine(p,x,z,h,a,r,g){for(let k=0;k<6;k++)cardP(p,LF.leaflet,ltc(g,0.1),dkc(g,0.72),x,0.035,z,a+k*1.047+r[0],1.25,0.07,0.024);},
  daisy(p,x,z,h,a,r,g){for(let k=0;k<2;k++)cardP(p,LF.oval,ltc(g,0.08),dkc(g,0.7),x,0.008,z,a+k*3.1+r[k]*0.6,1.1,0.075,0.045);cardP(p,LF.oval,ltc(g,0.08),dkc(g,0.72),x,h*0.45,z,a+1.5,0.9,0.055,0.032);},
  crocus(p,x,z,h,a,r,g){for(let k=0;k<3;k++)cardP(p,LF.blade,ltc(g,0.12),dkc(g,0.7),x,0.002,z,a+k*2.1+r[k]*0.6,0.22+r[2]*0.2,0.12,0.016);}};
// stem heights: knee-high to the villager (~0.9 tall), the lupin's spike and the crocus's cup sitting low
const FLOWER_H={tulip:0.19,rose:0.16,cosmos:0.23,pansy:0.075,lily:0.2,lupine:0.11,daisy:0.15,crocus:0.025};
function floraClump(sp,c,seed,lo){const R=mulberry(seed),p=[],n=sp==='crocus'?4:3;
  for(let s=0;s<n;s++){const a=s*2.1+R(),r=s?0.13+R()*0.07:0.02,x=Math.cos(a)*r,z=Math.sin(a)*r,h=FLOWER_H[sp]*(0.85+R()*0.3),la=R()*6.283,lean=0.04+R()*0.12,lr=[R(),R(),R()],g=GREENS[s%4];
    const d=[Math.sin(la)*Math.sin(lean),Math.cos(lean),Math.cos(la)*Math.sin(lean)],ax=sp==='lupine'?0.15:0;
    p.push(PG(STEM,0x62a444,0x3a6a28,x,0,z,lean,la,0,0.026,h+ax,0.026));if(!lo)FLOWER_LEAVES[sp](p,x,z,h,a,lr,g);
    FLOWER_HEAD[sp](p,c,x+d[0]*h,d[1]*h,z+d[2]*h,R,lo,d);}
  return merge(p);}
const FLORA_KEYS=[],FLORA_GEOS=[],FLORA_LO=[];
for(const sp in FLOWER_SP)FLOWER_SP[sp].forEach((c,ci)=>{const seed=hi(sp.length,ci,31);FLORA_KEYS.push(sp+ci);FLORA_GEOS.push(floraClump(sp,c,seed,false));FLORA_LO.push(floraClump(sp,c,seed,true));});
// which clump grows at (x,z): one species per 5x5 patch, one colour per 3x3
function floraIndex(x,z){const sps=Object.keys(FLOWER_SP),sp=sps[Math.floor(hash(Math.floor(x/5)+11,Math.floor(z/5)-3)*sps.length)],cols=FLOWER_SP[sp];
  const ci=Math.floor(hash(Math.floor(x/3)-5,Math.floor(z/3)+9)*cols.length);return FLORA_KEYS.indexOf(sp+ci);}
// clover: round three-part leaves lying flat, and a white clover flower
const CLOVER_GEO=(()=>{const R=mulberry(5),p=[],lf3=cardGeo([[0,0],[0.45,0.5],[0.85,0.42],[1,0.12]],{mid:false});
  for(let i=0;i<7;i++){const cx=(R()-0.5)*0.55,cz=(R()-0.5)*0.55,y=0.03+R()*0.04,r0=R()*6.28,g=GREENS[i%4];
    for(let j=0;j<3;j++)cardP(p,lf3,ltc(g,0.1),dkc(g,0.72),cx,y,cz,r0+j*2.094,1.3,0.085,0.075);
    if(i===2)p.push(PG(STEM,0x62a444,0x3a6a28,cx,0,cz,0.1,r0,0,0.018,y+0.05,0.018),PG(DOME,0xffffff,0xf2c8d8,cx,y+0.045,cz,0,0,0,0.055,0.05,0.055));}
  return merge(p);})();
