/* =========================================================
   Soil (tilled tiles)
   ========================================================= */
const SOIL_GEO=merge([P(BOX,0xd8d8d8,0,0,0,0,0,0,0.9,0.06,0.9),P(BOX,0xffffff,0,0.04,-0.26,0,0,0,0.8,0.05,0.13),P(BOX,0xffffff,0,0.04,0,0,0,0,0.8,0.05,0.13),P(BOX,0xffffff,0,0.04,0.26,0,0,0,0.8,0.05,0.13)]);
let soilIM=null;
function rebuildSoil(){
  if(soilIM){scene.remove(soilIM);soilIM.dispose();}
  const keys=Object.keys(S.tiles);
  soilIM=new T.InstancedMesh(SOIL_GEO,vcMat,Math.max(1,keys.length));soilIM.count=keys.length;soilIM.receiveShadow=true;soilIM.frustumCulled=false;
  keys.forEach((k,i)=>{const [x,z]=k.split(',').map(Number);_m.makeTranslation(x,topY(x,z)+0.03,z);soilIM.setMatrixAt(i,_m);soilIM.setColorAt(i,_c.set(S.tiles[k].w?0x5e3c2a:0x9a6a44));});
  if(!keys.length)soilIM.setColorAt(0,_c.set(0));
  scene.add(soilIM);refreshHomeGrass();
}

/* =========================================================
   Crop models
   ========================================================= */
function stageOf(p){return p>=1?3:p>=0.5?2:p>=0.12?1:0;}
/* ---- vegetation building blocks: many small leaves and petals, read as pixel art once rendered ---- */
const LEAF0=new T.IcosahedronGeometry(0.5,0);
const GREENS=[0x4f9a3a,0x6ab84a,0x3a7a30,0x7cc458];
// a flattened leaf whose base sits at (x,y,z), pointing out along azimuth ry and tilted up by `tilt`
function lf(p,col,x,y,z,ry,tilt,len,wid,th=0.035){const c=Math.cos(tilt);p.push(P(LEAF0,col,x+Math.sin(ry)*len*0.45*c,y+Math.sin(tilt)*len*0.45,z+Math.cos(ry)*len*0.45*c,-tilt,ry,0,wid,th,len));}
function rosette(p,R,n,len,wid,y,tilt,cols=GREENS){for(let i=0;i<n;i++){const a=i/n*6.283+R()*0.45,l=len*(0.8+R()*0.4);lf(p,cols[i%cols.length],0,y+R()*0.03,0,a,tilt+R()*0.25,l,wid);}}
function stemP(p,col,x,z,h,y0=0){p.push(P(CYL6,col,x,y0+h/2,z,0,0,0,0.035,h,0.035));}
function bloom(p,col,cc,x,y,z,r,n=5,tilt=0.25){for(let i=0;i<n;i++)lf(p,i%2&&n>5?cc:col,x,y,z,i/n*6.283,tilt,r,r*0.62,0.03);p.push(P(ICO,cc,x,y+0.015,z,0,0,0,r*0.5,r*0.35,r*0.5));}
function spike(p,col,dk,x,y,z,r){for(let k=0;k<6;k++){const rr=r*(1-k*0.13);p.push(P(ICO,k%2?dk:col,x+(k%2?0.015:-0.015),y+k*r*0.75,z,0,k,0,rr,rr*0.9,rr));}}
function berries(p,col,dk,x,y,z,r,n,R){for(let i=0;i<n;i++){const bx=x+(R()-0.5)*r*2.2,by=y+(R()-0.5)*r*1.6,bz=z+(R()-0.5)*r*2.2;
  p.push(P(ICO,i%3===2?dk:col,bx,by,bz,0,R()*3,0,r,r,r),P(LEAF0,0xffffff,bx+r*0.28,by+r*0.3,bz+r*0.28,0,0,0,r*0.32,r*0.28,r*0.32));}}
function wildflowers(p,R,cols,n,spread=0.32){for(let s=0;s<n;s++){const x=(R()-0.5)*spread*2,z=(R()-0.5)*spread*2,h=0.16+R()*0.24,c=cols[Math.floor(R()*cols.length)];
  stemP(p,0x4f8a34,x,z,h);lf(p,GREENS[s%4],x,h*0.35,z,R()*6.28,0.35,0.12,0.07);lf(p,GREENS[(s+1)%4],x,h*0.6,z,R()*6.28,0.4,0.1,0.06);
  if(R()<0.3)spike(p,c,0xffffff,x,h,z,0.04);else bloom(p,c,R()<0.5?0xf6d04a:0xffffff,x,h,z,0.085);}}

function cropParts(type,stage,seed=1){
  const C=CROPS[type],R=mulberry(seed),leaf=[],fruit=[];const G1=0x4f9a3a,G2=0x6ab84a,G3=0x3a7a30,GL=0x8cc85a;
  if(stage===0){for(let i=0;i<4;i++)leaf.push(P(ICO,0x4a3020,(R()-0.5)*0.3,0.02,(R()-0.5)*0.3,0,R()*3,0,0.09,0.04,0.09));leaf.push(P(LEAF0,GL,0,0.05,0,0,0,0,0.04,0.07,0.04));return{leaf,fruit};}
  if(stage===1){stemP(leaf,G2,0,0,0.13);lf(leaf,GL,0,0.12,0,0.3,0.35,0.16,0.1);lf(leaf,G2,0,0.12,0,0.3+Math.PI,0.35,0.16,0.1);lf(leaf,GL,0,0.13,0,1.8,0.9,0.08,0.05);return{leaf,fruit};}
  const b=stage===3?1:0.65,ripe=stage===3;
  switch(type){
    case'turnip':rosette(leaf,R,8,0.42*b,0.16*b,0.02,1.0);
      if(ripe)fruit.push(P(ICO,C.col,0,0.1,0,0,0,0,0.32,0.28,0.32),P(ICO,C.top,0,0.19,0,0,0,0,0.29,0.12,0.29),P(CONE8,C.col,0,-0.03,0,Math.PI,0,0,0.08,0.12,0.08),P(ICO,0xffffff,0.09,0.15,0.1,0,0,0,0.06,0.05,0.05));break;
    case'carrot':for(let i=0;i<10;i++)lf(leaf,GREENS[i%4],0,0.04,0,i/10*6.283+R()*0.3,1.1+R()*0.25,0.48*b,0.07*b);
      if(ripe)fruit.push(P(CONE8,C.col,0,0.03,0,Math.PI,0,0,0.2,0.1,0.2),P(CYL8,0xd8741e,0,0.075,0,0,0,0,0.19,0.02,0.19));break;
    case'potato':rosette(leaf,R,9,0.3*b,0.17*b,0.05,0.45);rosette(leaf,R,6,0.24*b,0.15*b,0.13*b,0.95);
      if(ripe){for(let i=0;i<3;i++){const a=i*2.1+R();bloom(leaf,0xf4eefa,0xf6d04a,Math.sin(a)*0.12,0.3,Math.cos(a)*0.12,0.06);}
        fruit.push(P(ICO,C.col,0.22,0.04,0.12,0,1,0,0.2,0.14,0.16),P(ICO,C.col,-0.16,0.03,0.2,0,2,0,0.16,0.12,0.14));}break;
    case'strawberry':for(let i=0;i<5;i++){const a=i/5*6.283+R()*0.3,px=Math.sin(a)*0.14*b,pz=Math.cos(a)*0.14*b;leaf.push(P(CYL6,G2,px/2,0.06,pz/2,Math.cos(a)*0.8,0,-Math.sin(a)*0.8,0.02,0.16,0.02));
        for(let j=0;j<3;j++)lf(leaf,GREENS[(i+j)%4],px,0.1*b,pz,a+(j-1)*0.65,0.2,0.15*b,0.12*b);}
      if(ripe){for(let i=0;i<4;i++){const a=i*1.57+0.6,x=Math.sin(a)*0.24,z=Math.cos(a)*0.24;fruit.push(P(CONE8,C.col,x,0.07,z,Math.PI,0,0,0.13,0.15,0.13),P(LEAF0,0xffffff,x+0.03,0.1,z+0.03,0,0,0,0.03,0.03,0.03));
          leaf.push(P(ICO,G2,x,0.15,z,0,0,0,0.08,0.03,0.08));}bloom(leaf,0xffffff,0xf6d04a,0,0.2,0,0.07);}break;
    case'tomato':leaf.push(P(BOX,0x9a7a4a,0.05,0.45*b,0.05,0,0,0,0.03,0.9*b,0.03));stemP(leaf,G1,0,0,0.8*b);
      for(let i=0;i<7;i++)lf(leaf,GREENS[i%4],0,0.12+i*0.1*b,0,i*2.4,0.3,0.28*b,0.15*b);
      if(ripe)for(let i=0;i<5;i++){const a=i*1.26+0.3,y=0.25+i*0.1,x=Math.sin(a)*0.15,z=Math.cos(a)*0.15;
        fruit.push(P(ICO,C.col,x,y,z,0,0,0,0.15,0.13,0.15),P(LEAF0,0xffffff,x+0.04,y+0.04,z+0.04,0,0,0,0.035,0.03,0.035));leaf.push(P(LEAF0,G3,x,y+0.07,z,0,a,0,0.07,0.02,0.07));}break;
    case'corn':leaf.push(P(CYL6,G1,0,0.55*b,0,0,0,0,0.06,1.1*b,0.06));
      for(let i=0;i<7;i++)lf(leaf,GREENS[i%4],0,(0.15+i*0.13)*b,0,i*2.25,0.35,0.52*b,0.09*b);
      if(ripe){for(let i=0;i<6;i++)leaf.push(P(BOX,0xd8b060,Math.sin(i)*0.05,1.15,Math.cos(i)*0.05,Math.sin(i)*0.4,0,Math.cos(i)*0.4,0.015,0.16,0.015));
        for(const [a,y] of [[0.6,0.5],[3.4,0.66]]){const x=Math.sin(a)*0.1,z=Math.cos(a)*0.1;fruit.push(P(ICO,C.col,x,y,z,0,0,Math.sin(a)*0.3,0.1,0.3,0.1));lf(leaf,GL,x,y-0.12,z,a,1.3,0.26,0.1);lf(leaf,G2,x,y-0.12,z,a+0.6,1.2,0.24,0.09);}}break;
    case'sunflower':{const h=1.05*b;stemP(leaf,G1,0,0,h);for(let i=0;i<5;i++)lf(leaf,GREENS[i%4],0,0.15+i*0.16*b,0,i*2.5,0.2,0.3*b,0.22*b);
      if(ripe){const y=h+0.05;for(let k=0;k<14;k++){const a=k/14*6.283;fruit.push(P(ICO,k%2?C.col:0xf0a020,Math.cos(a)*0.2,y+Math.sin(a)*0.2,0.03,0,0,a,0.18,0.08,0.03));}
        fruit.push(P(CYL8,C.center,0,y,0.05,Math.PI/2,0,0,0.26,0.06,0.26),P(CYL8,0x3a2418,0,y,0.07,Math.PI/2,0,0,0.16,0.04,0.16));}break;}
    case'pumpkin':for(let i=0;i<7;i++){const a=i/7*6.283+R()*0.4,r=0.28+R()*0.1;lf(leaf,GREENS[i%4],Math.sin(a)*0.08,0.04,Math.cos(a)*0.08,a,0.15,0.3*b,0.28*b,0.04);
        leaf.push(P(BOX,0x7ab84a,Math.sin(a+0.5)*r,0.03,Math.cos(a+0.5)*r,0,a,0,0.03,0.03,0.2));}
      if(ripe){for(let i=0;i<6;i++){const a=i/6*6.283;fruit.push(P(ICO,i%2?C.col:0xe07818,Math.sin(a)*0.1,0.2,Math.cos(a)*0.1,0,a,0,0.22,0.38,0.34));}
        leaf.push(P(CYL6,0x6a4a2a,0,0.42,0,0,0,0.3,0.05,0.14,0.05));fruit.push(P(LEAF0,0xffffff,0.12,0.3,0.14,0,0,0,0.06,0.04,0.04));}break;
    case'moonflower':stemP(leaf,G1,0,0,0.6*b);for(let i=0;i<5;i++)lf(leaf,GREENS[i%4],0,0.08+i*0.1*b,0,i*2.4,0.2,0.2*b,0.17*b);
      if(ripe){const y=0.62;for(let k=0;k<5;k++)lf(fruit,C.col,0,y,0,k/5*6.283,0.3,0.2,0.13,0.03);fruit.push(P(ICO,C.center,0,y+0.02,0,0,0,0,0.08,0.05,0.08));}break;
    case'radish':rosette(leaf,R,7,0.34*b,0.15*b,0.02,0.9);
      if(ripe)fruit.push(P(ICO2,C.col,0,0.09,0,0,0,0,0.26,0.24,0.26),P(CONE8,0xf6f0f0,0,-0.03,0,Math.PI,0,0,0.07,0.12,0.07),P(ICO,0xffffff,0.07,0.15,0.08,0,0,0,0.05,0.04,0.04));break;
    case'lettuce':rosette(leaf,R,10,0.3*b,0.24*b,0.02,0.35,[0x8cc85a,0x9ad060,0x7cc050,0xa8d870]);rosette(leaf,R,7,0.24*b,0.2*b,0.05,0.95,[0xa8d870,0x9ad060,0x8cc85a]);
      if(ripe){leaf.push(P(ICO2,0xb8e080,0,0.14,0,0,0,0,0.24,0.2,0.24));rosette(leaf,R,6,0.16,0.16,0.1,1.25,[0xc0e490,0xa8d870]);}break;
    case'onion':for(let i=0;i<6;i++)lf(leaf,GREENS[i%4],(R()-0.5)*0.04,0.1,(R()-0.5)*0.04,i/6*6.283+R()*0.4,1.25+R()*0.2,0.5*b,0.05);
      if(ripe)fruit.push(P(ICO2,C.col,0,0.1,0,0,0,0,0.28,0.24,0.28),P(ICO2,0xc86aa8,-0.05,0.14,0.06,0,0,0,0.14,0.12,0.12),P(CONE8,C.col,0,0.24,0,0,0,0,0.08,0.1,0.08),P(ICO,0xffffff,0.07,0.15,0.08,0,0,0,0.04,0.04,0.04));break;
    case'cabbage':rosette(leaf,R,9,0.36*b,0.28*b,0.02,0.2,[0x6ab84a,0x7cc458,0x5aa040]);
      if(ripe){leaf.push(P(ICO2,C.col,0,0.18,0,0,R()*3,0,0.4,0.34,0.4));for(let i=0;i<7;i++)lf(leaf,i%2?0x9ad080:0xb8e0a0,0,0.06,0,i/7*6.283,1.05,0.28,0.26,0.03);}break;
    case'wheat':{const col=ripe?0xd8b050:0x7cb84a,hd=ripe?C.col:0x9ad060;for(let i=0;i<11;i++){const a=R()*6.283,r=Math.sqrt(R())*0.24,x=Math.cos(a)*r,z=Math.sin(a)*r,h=(0.55+R()*0.2)*b;
        leaf.push(P(CYL6,col,x,h/2,z,(R()-0.5)*0.12,0,(R()-0.5)*0.12,0.025,h,0.025));lf(leaf,col,x,h*0.4,z,R()*6.28,0.5,0.18*b,0.04);
        if(stage>=2)for(let k=0;k<5;k++)(ripe?fruit:leaf).push(P(ICO,k%2?hd:0xf0d078,x+(k%2?0.018:-0.018),h+k*0.035,z,0,k,0.3,0.035,0.05,0.035));}break;}
    case'peas':{for(const sx of [-0.2,0.2])leaf.push(P(BOX,0x9a7a4a,sx,0.4*b,0,0,0,0,0.03,0.8*b,0.03));leaf.push(P(BOX,0x9a7a4a,0,0.78*b,0,0,0,0,0.44,0.025,0.025));
      for(let i=0;i<9;i++){const y=(0.1+i*0.08)*b,x=Math.sin(i*1.3)*0.14;leaf.push(P(CYL6,0x6ab84a,x,y,0.02,0,0,0.5*Math.cos(i),0.02,0.1,0.02));lf(leaf,GREENS[i%4],x,y,0.02,i*2.3,0.25,0.14*b,0.1*b);}
      if(ripe){for(let i=0;i<5;i++){const x=-0.16+i*0.08,y=0.3+(i%3)*0.14;fruit.push(P(ICO2,C.col,x,y,0.07,0,0,0.25*(i%2?1:-1),0.07,0.2,0.07),P(ICO,0xa8e070,x,y+0.02,0.1,0,0,0,0.03,0.05,0.02));}
        for(let i=0;i<3;i++)bloom(leaf,[0xf2a6c8,0xffffff,0xb8a8f2][i],0xf6d04a,-0.12+i*0.12,0.6+i*0.05,0.06,0.05);}break;}
    case'pepper':stemP(leaf,G1,0,0,0.5*b);for(let i=0;i<9;i++)lf(leaf,GREENS[i%4],0,0.1+i*0.05*b,0,i*2.4,0.35,0.24*b,0.16*b);
      if(ripe)for(let i=0;i<3;i++){const a=i*2.1+0.4,x=Math.sin(a)*0.15,z=Math.cos(a)*0.15,y=0.24+i*0.06;
        fruit.push(P(ICO2,i===1?0xe8453a:C.col,x,y,z,0,a,0,0.17,0.2,0.17),P(ICO2,i===1?0xe8453a:C.col,x,y-0.07,z,0,a,0,0.12,0.1,0.12),P(LEAF0,0xffffff,x+0.05,y+0.05,z+0.04,0,0,0,0.04,0.035,0.035));leaf.push(P(CYL6,G3,x,y+0.11,z,0,0,0,0.03,0.06,0.03));}break;
    case'tulip':for(let i=0;i<3;i++){const a=i*2.1+R(),x=Math.sin(a)*0.1,z=Math.cos(a)*0.1,h=(0.36+R()*0.1)*b;stemP(leaf,G1,x,z,h);lf(leaf,GREENS[i],x,0.02,z,a,1.0,0.28*b,0.1*b);lf(leaf,GREENS[i+1],x,0.02,z,a+2.8,1.1,0.24*b,0.09*b);
        if(ripe){const c=[C.col,0xf6d04a,0xe8453a][i];for(let k=0;k<5;k++)lf(fruit,k%2?c:new T.Color(c).multiplyScalar(0.85).getHex(),x,h-0.03,z,k/5*6.283,1.2,0.2,0.12,0.035);fruit.push(P(ICO2,c,x,h+0.02,z,0,0,0,0.11,0.12,0.11));}}break;
    case'eggplant':stemP(leaf,G1,0,0,0.5*b);for(let i=0;i<7;i++)lf(leaf,[0x4f8a3a,0x5f9a44,0x3e7a30][i%3],0,0.12+i*0.06*b,0,i*2.4,0.3,0.3*b,0.22*b);
      if(ripe)for(let i=0;i<3;i++){const a=i*2.1+0.3,x=Math.sin(a)*0.17,z=Math.cos(a)*0.17,y=0.2+i*0.03;
        fruit.push(P(ICO2,C.col,x,y,z,Math.cos(a)*0.4,0,-Math.sin(a)*0.4,0.13,0.3,0.13),P(LEAF0,0xffffff,x+0.04,y+0.06,z+0.04,0,0,0,0.035,0.05,0.03));leaf.push(P(ICO,0x3e7a30,x,y+0.14,z,0,a,0,0.1,0.05,0.1));}break;
    case'blueberry':leaf.push(P(ICO2,0x3e7a30,0,0.26*b,0,0,0,0,0.5*b,0.42*b,0.5*b));for(let i=0;i<26;i++){const a=R()*6.283,e=R()*1.2;lf(leaf,GREENS[i%4],Math.sin(a)*0.22*b*Math.cos(e),(0.22+Math.sin(e)*0.2)*b,Math.cos(a)*0.22*b*Math.cos(e),a,0.2+e*0.5,0.14*b,0.09*b);}
      if(ripe)for(let i=0;i<5;i++){const a=i*1.26;berries(fruit,C.col,0x2a3a8a,Math.sin(a)*0.24,0.22+R()*0.14,Math.cos(a)*0.24,0.045,4,R);}break;
    case'lavender':for(let i=0;i<9;i++){const a=R()*6.283,r=Math.sqrt(R())*0.18,x=Math.cos(a)*r,z=Math.sin(a)*r,h=(0.34+R()*0.14)*b;leaf.push(P(CYL6,0x6a9a4a,x,h/2,z,(R()-0.5)*0.2,0,(R()-0.5)*0.2,0.02,h,0.02));
        lf(leaf,0x7aa860,x,0.03,z,R()*6.28,0.9,0.18*b,0.05);if(ripe)spike(fruit,C.col,0x6a4ab0,x,h,z,0.05);}break;
    case'watermelon':for(let i=0;i<7;i++){const a=i/7*6.283+R()*0.4,r=0.3+R()*0.1;lf(leaf,GREENS[i%4],Math.sin(a)*0.08,0.04,Math.cos(a)*0.08,a,0.15,0.3*b,0.24*b,0.04);
        leaf.push(P(BOX,0x7ab84a,Math.sin(a+0.5)*r,0.03,Math.cos(a+0.5)*r,0,a,0,0.03,0.03,0.22));}
      if(ripe){for(let i=0;i<10;i++){const a=i/10*6.283;fruit.push(P(ICO2,i%2?C.col:0x2a5a2a,Math.sin(a)*0.06,0.19,Math.cos(a)*0.06*1.3,0,a,0,0.2,0.36,0.44));}
        fruit.push(P(LEAF0,0xffffff,0.1,0.34,0.14,0,0,0,0.07,0.04,0.05));leaf.push(P(CYL6,0x6a8a3a,0,0.38,0.05,0.4,0,0,0.03,0.1,0.03));}break;
    case'grape':{for(const sx of [-0.34,0.34])leaf.push(P(CYL6,0x7a5a3a,sx,0.45*b,0,0,0,0,0.05,0.9*b,0.05));leaf.push(P(BOX,0x8a6a44,0,0.88*b,0,0,0,0,0.76,0.035,0.035),P(CYL6,0x6a4a30,0,0.45*b,0,0,0,0.12,0.05,0.9*b,0.05));
      for(let i=0;i<14;i++){const x=-0.34+i/13*0.68;lf(leaf,GREENS[i%4],x,0.86*b,0,i*2.1,0.1,0.18*b,0.16*b);}
      if(ripe)for(const bx of [-0.2,0.02,0.22]){for(let row=0;row<4;row++){const n=4-row;for(let k=0;k<n;k++){const a=k/n*6.283+row;fruit.push(P(ICO2,k%3===2?0x5a2a8a:C.col,bx+Math.cos(a)*0.02*n,0.72-row*0.075,Math.sin(a)*0.02*n+0.06,0,0,0,0.07,0.07,0.07));}}
        fruit.push(P(LEAF0,0xffffff,bx+0.03,0.74,0.1,0,0,0,0.03,0.03,0.03));}break;}
    case'peach':trunkP(leaf,R,0x7a5230,0.62*b,0.07);canopy(leaf,R,[0x7cc050,0x5f9e3a,0x467e2c],0,0.9*b,0,0.34*b,9,0.38*b);
      if(ripe)for(const [x,y,z] of [[0.32,0.72,0.12],[-0.3,0.8,0.14],[0.06,0.66,0.36],[-0.1,0.86,-0.34],[0.24,0.96,-0.2]])fruit.push(P(ICO2,C.col,x,y,z,0,0,0,0.17,0.17,0.17),P(ICO2,0xe8604a,x+0.04,y+0.02,z+0.05,0,0,0,0.1,0.1,0.1),P(LEAF0,0xffffff,x+0.05,y+0.06,z+0.05,0,0,0,0.035,0.03,0.03));break;
    case'dragonfruit':{const cc=[0x5aa84a,0x4a9040];leaf.push(P(CYL6,cc[0],0,0.3*b,0,0,0,0,0.13,0.6*b,0.13));
      for(let i=0;i<3;i++){const a=i*2.1+R(),x=Math.sin(a)*0.16,z=Math.cos(a)*0.16;leaf.push(P(CYL6,cc[i%2],x*0.6,0.3*b,z*0.6,Math.cos(a)*0.9,0,-Math.sin(a)*0.9,0.09,0.3*b,0.09),P(CYL6,cc[(i+1)%2],x*1.4,0.52*b,z*1.4,0,0,0,0.09,0.36*b,0.09));
        for(let k=0;k<3;k++)leaf.push(P(CONE4,0xf6f0d0,x*1.4+0.04,(0.38+k*0.1)*b,z*1.4,0,k,1.57,0.02,0.05,0.02));
        if(ripe){const fy=0.76*b;fruit.push(P(ICO2,C.col,x*1.4,fy,z*1.4,0,0,0,0.17,0.2,0.17));for(let k=0;k<5;k++)lf(fruit,0x8ad050,x*1.4,fy-0.02,z*1.4,k/5*6.283,0.9,0.1,0.05,0.02);}
        else if(stage===2)bloom(leaf,0xfff8e8,0xf6d04a,x*1.4,0.74*b,z*1.4,0.09,6,0.9);}break;}
    case'starfruit':leaf.push(P(TRUNK,0x7a5230,0,0.33*b,0,0,0,0,0.12,0.66*b,0.12));
      for(let i=0;i<6;i++){const a=i/6*6.283;leaf.push(P(ICO,GREENS[i%4],Math.sin(a)*0.22*b,(0.82+(i%2)*0.14)*b,Math.cos(a)*0.22*b,0,a,0,0.42*b,0.34*b,0.42*b));}
      leaf.push(P(ICO,G2,0,1.06*b,0,0,0,0,0.44*b,0.34*b,0.44*b));
      if(ripe)for(const [x,y,z] of [[0.3,0.66,0.1],[-0.26,0.72,0.14],[0.05,0.62,0.32],[-0.1,0.74,-0.3]])fruit.push(P(OCT,C.col,x,y,z,0,x*5,0.4,0.2,0.24,0.14),P(LEAF0,0xffffff,x+0.04,y+0.05,z+0.04,0,0,0,0.04,0.03,0.03));break;
  }
  return{leaf,fruit};
}
const cropRoot=new T.Group();scene.add(cropRoot);
const cropMeshes=new Map();
function syncCrop(k){
  const old=cropMeshes.get(k);if(old){cropRoot.remove(old.g);old.g.traverse(o=>{if(o.geometry)o.geometry.dispose();});cropMeshes.delete(k);}
  const t=S.tiles[k];if(!t||!t.crop)return;const c=t.crop;
  const [x,z]=k.split(',').map(Number);const st=stageOf(c.p);
  const {leaf,fruit}=cropParts(c.t,st,x*73856093^z*19349663);const g=new T.Group();
  if(leaf.length)g.add(M(leaf));
  if(fruit.length){const v=c.v&&c.v!=='normal'&&c.v!=='giant'?c.v:null;g.add(M(fruit,v?VMAT[v]:vcMat));}
  g.scale.setScalar(st===3&&c.v==='giant'?1.2:0.8);
  g.position.set(x,topY(x,z)+0.06,z);g.rotation.y=CROPS[c.t].kind==='flower'?cam.yaw:hash(x,z)*6.28;
  g.userData.tile={x,z};g.userData.ph=hash(z,x)*6;
  cropRoot.add(g);cropMeshes.set(k,{g,s:st,v:c.v});
}
function syncAllCrops(){for(const k of [...cropMeshes.keys()])syncCrop(k);for(const k in S.tiles)syncCrop(k);}

