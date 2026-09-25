/* =========================================================
   Object models (decor, house, bin)
   ========================================================= */
function pickR2(a,R){return a[Math.floor(R()*a.length)];}
function objGroup(kind,seed=1,rot=0){
  const g=new T.Group(),R=mulberry(seed*7919+13);let p=[];
  switch(kind){
    case'pine':case'oak':case'palm':g.add(M(treeParts(kind,R,0x9a9ea8)));break;
    case'flowers':{wildflowers(p,R,[0xf7f2e8,0xf2a6c8,0xf6d04a,0xb8a8f2,0xe86a5a,0xd06aa8],9,0.36);for(let i=0;i<8;i++)lf(p,GREENS[i%4],(R()-0.5)*0.5,0.02,(R()-0.5)*0.5,R()*6.28,0.2,0.18,0.09);
      g.add(M(p));break;}
    case'cattail':for(let i=0;i<6;i++){const x=(R()-0.5)*0.6,z=(R()-0.5)*0.6,h=0.5+R()*0.35;
        p.push(P(BOX,0x5a8a34,x,h/2,z,0,0,0,0.04,h,0.04),P(BOX,0x7a4a2a,x,h-0.06,z,0,0,0,0.09,0.2,0.09),P(BOX,0x6a9a3a,x+0.06,h*0.35,z,0,0,-0.3,0.03,h*0.7,0.06));}
      g.add(M(p));break;
    case'rock':p.push(P(ICO,0x8e929c,0,0.16,0,0,R()*3,0,0.72,0.46,0.62),P(ICO,0x7a7e88,0.24,0.1,0.16,0,R()*3,0,0.4,0.3,0.4),P(ICO,0x6a9a4a,-0.05,0.33,-0.03,0,R()*3,0,0.46,0.12,0.4));
      g.add(M(p));break;
    case'fence':p.push(P(CYL12,0xa8845a,-0.42,0.3,0,0,0,0,0.11,0.6,0.11),P(CYL12,0xa8845a,0.42,0.3,0,0,0,0,0.11,0.6,0.11),P(CONE12,0x94704a,-0.42,0.64,0,0,0,0,0.12,0.08,0.12),P(CONE12,0x94704a,0.42,0.64,0,0,0,0,0.12,0.08,0.12),P(BOX,0xc49a66,0,0.44,0,0,0,0,1.0,0.07,0.05),P(BOX,0xc49a66,0,0.22,0,0,0,0,1.0,0.07,0.05));
      g.add(M(p));break;
    case'lantern':p.push(P(BOX,0x3e3444,0,0.04,0,0,0,0,0.24,0.08,0.24),P(BOX,0x3e3444,0,0.45,0,0,0,0,0.08,0.9,0.08),P(BOX,0x3e3444,0,1.1,0,0,0,0,0.3,0.05,0.3),P(CONE4,0x3e3444,0,1.2,0,0,Math.PI/4,0,0.36,0.16,0.36));
      g.add(M(p));{const lamp=M([P(BOX,0xfff0b8,0,0.97,0,0,0,0,0.2,0.22,0.2)],glowMat);lamp.castShadow=false;g.add(lamp);}
      g.add(pool(0.04,1));break;
    case'bench':for(const [x,z] of [[-0.38,-0.1],[0.38,-0.1],[-0.38,0.12],[0.38,0.12]])p.push(P(BOX,0x5a3a2a,x,0.12,z,0,0,0,0.06,0.24,0.06));
      p.push(P(BOX,0xb07a44,0,0.26,0,0,0,0,0.9,0.06,0.34),P(BOX,0xb07a44,0,0.52,-0.16,0,0,0,0.9,0.18,0.05),P(BOX,0x5a3a2a,-0.38,0.42,-0.16,0,0,0,0.06,0.34,0.06),P(BOX,0x5a3a2a,0.38,0.42,-0.16,0,0,0,0.06,0.34,0.06));
      g.add(M(p));break;
    case'scarecrow':p.push(P(BOX,0x8a6a3a,0,0.55,0,0,0,0,0.08,1.1,0.08),P(BOX,0x8a6a3a,0,0.8,0,0,0,0,0.8,0.06,0.06),P(BOX,0x6a8ac0,0,0.7,0,0,0,0,0.34,0.36,0.2),
        P(BOX,0x6a8ac0,-0.26,0.8,0,0,0,0,0.2,0.14,0.14),P(BOX,0x6a8ac0,0.26,0.8,0,0,0,0,0.2,0.14,0.14),P(BOX,0xe8c878,-0.42,0.78,0,0,0,0.3,0.08,0.12,0.08),P(BOX,0xe8c878,0.42,0.78,0,0,0,-0.3,0.08,0.12,0.08),
        P(BOX,0xe8c878,0,1.06,0,0,0,0,0.26,0.26,0.24),P(BOX,0x2b1e2e,-0.06,1.08,0.125,0,0,0,0.04,0.04,0.02),P(BOX,0x2b1e2e,0.06,1.08,0.125,0,0,0,0.04,0.04,0.02),
        P(BOX,0x8a5a3a,0,1.2,0,0,0,0,0.46,0.04,0.46),P(BOX,0x8a5a3a,0,1.29,0,0,0,0,0.24,0.16,0.24),P(BOX,0xd8453a,0,1.23,0,0,0,0,0.25,0.04,0.25));
      g.add(M(p));break;
    case'sprinkler':{p.push(P(CYL8,0x8a8e98,0,0.05,0,0,0,0,0.3,0.1,0.3),P(CYL8,0xa0a4ae,0,0.2,0,0,0,0,0.06,0.3,0.06));g.add(M(p));
      const head=M([P(BOX,0x5a8ae0,0,0,0,0,0,0,0.3,0.05,0.06),P(BOX,0x5a8ae0,0,0,0,0,Math.PI/2,0,0.3,0.05,0.06),P(CYL8,0x3a5ab0,0,0.03,0,0,0,0,0.1,0.08,0.1)]);
      head.position.y=0.37;g.add(head);g.userData.anim=(t,dt)=>{head.rotation.y+=dt*(sprayT>0?9:0.6);};break;}
    case'beehive':{for(const [x,z] of [[-0.2,-0.18],[0.2,-0.18],[-0.2,0.18],[0.2,0.18]])p.push(P(BOX,0x6a4a30,x,0.1,z,0,0,0,0.06,0.2,0.06));
      p.push(P(BOX,0xf0cf78,0,0.3,0,0,0,0,0.5,0.2,0.45),P(BOX,0xe2b95a,0,0.5,0,0,0,0,0.5,0.2,0.45),P(BOX,0xf0cf78,0,0.7,0,0,0,0,0.5,0.2,0.45),P(BOX,0x9a6a3a,0,0.84,0,0,0,0,0.6,0.08,0.55),P(BOX,0x3a2a20,0,0.26,0.23,0,0,0,0.16,0.05,0.02));
      g.add(M(p));const bees=[];for(let i=0;i<3;i++){const b=M([P(BOX,0xf6d04a,0,0,0,0,0,0,0.07,0.06,0.09),P(BOX,0x2b1e2e,0,0,0,0,0,0,0.075,0.065,0.03)]);b.castShadow=false;g.add(b);bees.push(b);}
      g.userData.anim=(t)=>{bees.forEach((b,i)=>{const a=t*(1.6+i*0.4)+i*2;b.position.set(Math.cos(a)*(0.45+i*0.1),0.6+Math.sin(t*3+i)*0.15,Math.sin(a)*(0.45+i*0.1));b.rotation.y=-a;});};break;}
    case'clover':{for(let i=0;i<6;i++){const cx=(R()-0.5)*0.7,cz=(R()-0.5)*0.7;for(let j=0;j<3;j++){const a=j/3*6.28+R();p.push(P(BOX,j%2?0x4f9a3a:0x5fae44,cx+Math.cos(a)*0.06,0.04,cz+Math.sin(a)*0.06,0,a,0,0.1,0.04,0.1));}}
      g.add(M(p));const gc=[P(BOX,0x4f8a34,0,0.08,0,0,0,0,0.03,0.16,0.03)];for(let j=0;j<4;j++){const a=j/4*6.28;gc.push(P(BOX,0xf5c542,Math.cos(a)*0.07,0.17,Math.sin(a)*0.07,0,a,0,0.11,0.04,0.11));}
      g.add(M(gc,goldMat));g.userData.sparkle=true;break;}
    case'stonepath':for(let i=0;i<5;i++){const a=i*1.3+R(),r=i?0.28:0;p.push(P(ICO,[0x9a968e,0x8a867e,0xaaa69e][i%3],Math.cos(a)*r,0.02,Math.sin(a)*r,0,R()*3,0,0.36+R()*0.1,0.06,0.3+R()*0.1));}g.add(M(p));break;
    case'flowerpot':p.push(P(CYL12,0xc8704a,0,0.14,0,0,0,0,0.34,0.28,0.34),P(CYL12,0xb0603a,0,0.29,0,0,0,0,0.4,0.05,0.4),P(CYL12,0x5a3a2a,0,0.3,0,0,0,0,0.32,0.02,0.32));wildflowers(p,R,[0xf2a6c8,0xf6d04a,0xffffff,0xe86a5a],5,0.1);g.add(M(shift(p.slice(3),0,0.3,0).concat(p.slice(0,3))));break;
    case'planter':{p.push(P(BOX,0x9a6a3a,0,0.15,0,0,0,0,0.92,0.3,0.36),P(BOX,0x7a5230,0,0.31,0,0,0,0,0.96,0.04,0.4),P(BOX,0x5a3a2a,0,0.3,0,0,0,0,0.86,0.02,0.3));const q=[];
      for(let i=0;i<5;i++){const x=-0.34+i*0.17,c=[0xf2789a,0xf6d04a,0xe8453a,0xffffff,0xb8a8f2][i];stemP(q,0x4f9a3a,x,0,0.26,0.3);lf(q,GREENS[i%4],x,0.32,0,i,1.0,0.16,0.06);for(let k=0;k<5;k++)lf(q,c,x,0.55,0,k/5*6.283,1.2,0.12,0.07,0.03);}p.push(...q);g.add(M(p));break;}
    case'signpost':p.push(P(CYL8,0x7a5230,0,0.5,0,0,0,0,0.07,1.0,0.07),P(BOX,0xc8905a,0.18,0.82,0,0,0,0,0.5,0.16,0.04),P(CONE4,0xc8905a,0.46,0.82,0,0,0.785,-1.57,0.16,0.1,0.16),P(BOX,0xb8804a,-0.14,0.6,0,0,0.3,0,0.44,0.14,0.04),P(CONE4,0xb8804a,-0.38,0.6,-0.07,0,0.3+0.785,1.57,0.14,0.1,0.14));g.add(M(p));break;
    case'haybale':p.push(P(CYL12,0xe8c860,0,0.2,0,0,0,1.57,0.4,0.62,0.4),P(CYL12,0xd8b050,0.311,0.2,0,0,0,1.57,0.36,0.01,0.36),P(CYL12,0xd8b050,-0.311,0.2,0,0,0,1.57,0.36,0.01,0.36),P(CYL12,0x9a6a3a,0.15,0.2,0,0,0,1.57,0.41,0.03,0.41),P(CYL12,0x9a6a3a,-0.15,0.2,0,0,0,1.57,0.41,0.03,0.41));for(let i=0;i<6;i++)p.push(P(BOX,0xf0d878,(R()-0.5)*0.5,0.4,(R()-0.5)*0.3,R(),R()*3,R(),0.02,0.02,0.14));g.add(M(p));break;
    case'birdhouse':p.push(P(CYL8,0x7a5230,0,0.45,0,0,0,0,0.07,0.9,0.07),P(BOX,0xf2d8b0,0,0.98,0,0,0,0,0.3,0.28,0.28),P(PRISM,0xd8604a,0,1.16,0,0,0,0,0.2,0.1,0.34),P(CYL12,0x3a2a2a,0,1.0,0.141,1.57,0,0,0.09,0.01,0.09),P(CYL6,0x7a5230,0,0.92,0.18,1.57,0,0,0.02,0.1,0.02),P(ICO2,0x5a8ae0,0.02,1.24,0.02,0,0,0,0.1,0.08,0.12),P(CONE4,0xf6a830,0.02,1.24,0.09,1.57,0,0,0.03,0.05,0.03));g.add(M(p));break;
    case'hedge':p.push(P(BOX,0x3e7a30,0,0.25,0,0,0,0,0.92,0.5,0.5),P(ICO2,0x4a8a38,0,0.48,0,0,0,0,0.94,0.14,0.5));for(let i=0;i<22;i++){const x=(R()-0.5)*0.9,y=0.1+R()*0.45,sd=R()<0.5?-1:1;lf(p,GREENS[i%4],x,y,sd*0.24,sd>0?0:3.14,0.3,0.14,0.1);}if(R()<0.5)for(let i=0;i<4;i++)bloom(p,0xffffff,0xf6d04a,(R()-0.5)*0.8,0.52,(R()-0.5)*0.3,0.05);g.add(M(p));break;
    case'chime':{p.push(P(CYL8,0x7a5230,0,0.5,0,0,0,0,0.06,1.0,0.06),P(BOX,0x7a5230,0.15,0.98,0,0,0,0,0.36,0.05,0.05));g.add(M(p));const hang=[];for(let i=0;i<4;i++){hang.push(P(BOX,0xe8e0d0,0.05+i*0.07,0.85,0,0,0,0,0.005,0.24,0.005),P(ICO2,[0xf6e0e8,0xf8f4ee,0xe8d4a8,0xd8ecf4][i],0.05+i*0.07,0.72-(i%2)*0.05,0,0,i,0,0.07,0.06,0.03));}
      const hm=M(hang);g.add(hm);g.userData.anim=(t)=>{hm.rotation.z=Math.sin(t*2.3+seed)*0.08;};break;}
    case'gnome':p.push(P(ICO2,0x5a8ae0,0,0.14,0,0,0,0,0.3,0.28,0.26),P(ICO2,0xf4c8a8,0,0.32,0,0,0,0,0.2,0.18,0.18),P(ICO2,0xffffff,0,0.24,0.06,0,0,0,0.2,0.2,0.12),P(CONE12,0xd8453a,0,0.5,-0.01,-0.15,0,0,0.22,0.34,0.22),P(ICO2,0xf39ab0,0,0.31,0.1,0,0,0,0.05,0.04,0.04),
      P(ICO2,0x2b1e2e,-0.05,0.35,0.085,0,0,0,0.025,0.025,0.02),P(ICO2,0x2b1e2e,0.05,0.35,0.085,0,0,0,0.025,0.025,0.02),P(ICO2,0x6a4428,-0.07,0.02,0.04,0,0,0,0.1,0.05,0.14),P(ICO2,0x6a4428,0.07,0.02,0.04,0,0,0,0.1,0.05,0.14));g.add(M(p));break;
    case'well':p.push(P(CYL12,0xa8a49c,0,0.25,0,0,0,0,0.8,0.5,0.8),P(CYL12,0x3a4a6a,0,0.49,0,0,0,0,0.62,0.02,0.62),P(CYL12,0x8a867e,0,0.5,0,0,0,0,0.84,0.04,0.84));for(let i=0;i<10;i++){const a=i/10*6.283;p.push(P(BOX,i%2?0x98948c:0xb8b4ac,Math.cos(a)*0.38,0.25+((i%2)-0.5)*0.12,Math.sin(a)*0.38,0,-a,0,0.18,0.1,0.06));}
      for(const x of [-0.36,0.36])p.push(P(BOX,0x7a5230,x,0.75,0,0,0,0,0.06,1.0,0.06));p.push(P(PRISM,0xd8604a,0,1.32,0,0,1.57,0,0.34,0.2,0.94),P(CYL8,0x6a4428,0,1.08,0,0,0,1.57,0.04,0.74,0.04),P(BOX,0xe8e0d0,0,0.95,0,0,0,0,0.005,0.24,0.005),P(CYL12,0x9a6a3a,0,0.78,0,0,0,0,0.14,0.14,0.14));g.add(M(p));break;
    case'windmill':{p.push(P(TOWER,0xf2ead8,0,0.95,0,0,0,0,1,1.9,1),P(CYL8,0x9a6a3a,0,0.08,0,0,0,0,1.06,0.16,1.06),P(CONE8,0xc4553c,0,2.15,0,0,0,0,0.9,0.6,0.9),P(BOX,0x5a3a2a,0,0.26,0.47,0,0,0,0.24,0.44,0.05));
      g.add(M(p));g.add(M([P(BOX,0x404a60,0,1.35,0.39,0,0,0,0.16,0.18,0.04)],glowMat));
      const bl=[P(BOX,0x6a4a30,0,0,0,0,0,0,0.16,0.16,0.12)];for(let k=0;k<4;k++){const a=k*Math.PI/2;bl.push(P(BOX,0xe8dcc0,-Math.sin(a)*0.58,Math.cos(a)*0.58,0,0,0,a,0.2,0.95,0.03),P(BOX,0x7a5a3a,-Math.sin(a)*0.5,Math.cos(a)*0.5,0.02,0,0,a,0.04,1.05,0.03));}
      const blades=M(bl);blades.position.set(0,1.95,0.5);g.add(blades);g.userData.anim=(t,dt)=>{blades.rotation.z-=dt*1.1;};break;}
  }
  g.rotation.y=rot;return g;
}
const OBJ_H={pine:1.6,oak:1.1,palm:1.4,windmill:1.4,lantern:0.9,scarecrow:0.9,beehive:0.6,bench:0.4,well:1.0,birdhouse:1.1,signpost:0.9,gnome:0.5,hedge:0.5,chime:1.0,planter:0.4,flowerpot:0.4,haybale:0.5};
function roof(p,col,gable,W,Hr,D,y,x=0,z=0){const sx=W/1.732,sy=Hr/1.5;
  p.push(P(PRISM,col,x,y+0.5*sy,z,0,0,0,(W+0.28)/1.732,sy*1.04,D+0.12));
  if(gable)p.push(P(PRISM,gable,x,y+0.5*sy*0.94,z,0,0,0,sx*0.96,sy*0.94,D+0.16));
  // shingle rows and a ridge cap
  const dk=new T.Color(col).multiplyScalar(0.8).getHex(),hw=(W+0.28)/2,ang=Math.atan2(Hr,hw),nl=Math.hypot(Hr,hw);
  for(const sd of [-1,1])for(let i=1;i<=4;i++){const t=i/5;p.push(P(BOX,dk,x+sd*(hw*(1-t)+Hr/nl*0.025),y+Hr*t+hw/nl*0.025,z,0,0,-sd*ang,0.07,0.03,D+0.14));}
  p.push(P(BOX,dk,x,y+Hr+0.015,z,0,0,0,0.14,0.06,D+0.18));}
function houseGroup(lv){
  const g=new T.Group(),p=[],gl=[];
  if(lv===0){const sx=1.5/1.732,sy=1.0/1.5;
    p.push(P(PRISM,0xf2e8d2,0,0.5*sy,0,0,0,0,sx,sy,1.5),P(PRISM,0xd05a4a,0,0.5*sy*1.02,0,0,0,0,sx*1.03,sy*1.03,0.34),P(PRISM,0x3a2a30,0,0.5*sy*0.5,0.02,0,0,0,sx*0.42,sy*0.5,1.52));
    for(let i=0;i<6;i++){const a=i/6*6.28;p.push(P(BOX,0x8a8e98,0.62+Math.cos(a)*0.2,0.05,0.8+Math.sin(a)*0.2,0,a,0,0.1,0.08,0.1));}
    p.push(P(BOX,0x6a4228,0.62,0.07,0.8,0,0.5,0,0.3,0.06,0.07),P(BOX,0x6a4228,0.62,0.07,0.8,0,-0.5,0,0.3,0.06,0.07));
    for(let i=0;i<4;i++)p.push(P(BOX,i%3?0xf4f0ea:0xd8453a,-0.72+(i%2)*0.3,0.02,0.62+Math.floor(i/2)*0.3,0,0,0,0.3,0.03,0.3));
    gl.push(P(CONE4,0xffa040,0.62,0.2,0.8,0,0.5,0,0.16,0.26,0.16),P(CONE4,0xffe070,0.62,0.18,0.8,0,0,0,0.08,0.16,0.08));
    g.add(pool(0.03,0.9).translateX(0.62).translateZ(0.8));
  }else if(lv===1){
    p.push(P(BOX,0x9c6b40,0,0.5,0,0,0,0,1.5,1.0,1.3));for(let i=0;i<4;i++)p.push(P(BOX,0x7c5230,0,0.12+i*0.25,0,0,0,0,1.53,0.04,1.33));
    roof(p,0x5b3b3b,0x9c6b40,1.6,0.8,1.3,1.0);p.push(P(BOX,0x4a3024,-0.2,0.32,0.66,0,0,0,0.32,0.62,0.04),P(BOX,0x8a8a92,0.45,1.6,-0.2,0,0,0,0.2,0.5,0.2));
    gl.push(P(BOX,0x404a60,0.38,0.55,0.66,0,0,0,0.3,0.26,0.03),P(BOX,0x404a60,0.76,0.55,0,0,0,0,0.03,0.26,0.3));
    g.add(pool(0.03,0.8).translateZ(1.0));
  }else{
    const W=lv===2?1.7:1.8,Hh=lv===2?1.1:1.35,D=lv===2?1.5:1.6,x0=lv===3?-0.1:0;
    p.push(P(BOX,0xf1e3c6,x0,Hh/2,0,0,0,0,W,Hh,D),P(BOX,0xb8ae9a,x0,0.08,0,0,0,0,W+0.04,0.16,D+0.04));
    roof(p,0xc4583a,0xf1e3c6,W+0.1,0.85,D,Hh,x0);
    p.push(P(BOX,0x6a4a3a,x0-0.3,0.36,D/2+0.01,0,0,0,0.32,0.64,0.04),P(BOX,0xa0523a,x0+0.5,Hh+0.75,-0.25,0,0,0,0.2,0.55,0.2));
    for(const wx of [x0+0.3,x0+0.66]){gl.push(P(BOX,0x404a60,wx,Hh*0.55,D/2+0.01,0,0,0,0.22,0.26,0.03));p.push(P(BOX,0x4f7a4a,wx-0.15,Hh*0.55,D/2+0.02,0,0,0,0.06,0.28,0.03),P(BOX,0x4f7a4a,wx+0.15,Hh*0.55,D/2+0.02,0,0,0,0.06,0.28,0.03));}
    p.push(P(BOX,0x8a5a3a,x0+0.48,Hh*0.3,D/2+0.08,0,0,0,0.6,0.1,0.1));for(let i=0;i<4;i++)p.push(P(BOX,i%2?0xe8453a:0xf6d04a,x0+0.26+i*0.15,Hh*0.3+0.08,D/2+0.08,0,0,0,0.08,0.08,0.08));
    if(lv===3){p.push(P(BOX,0xf1e3c6,0.62,1.3,-0.5,0,0,0,0.72,2.6,0.72),P(BOX,0xb8ae9a,0.62,0.08,-0.5,0,0,0,0.76,0.16,0.76),P(CONE4,0xc4583a,0.62,2.95,-0.5,0,Math.PI/4,0,1.12,0.7,1.12),P(BOX,0xf6d04a,0.62,3.35,-0.5,0,0,0,0.05,0.14,0.05));
      gl.push(P(BOX,0x404a60,0.62,2.2,-0.13,0,0,0,0.2,0.3,0.03),P(BOX,0x404a60,0.99,1.6,-0.5,0,0,0,0.03,0.3,0.2));
      p.push(P(BOX,0xa27a50,x0-0.35,0.06,D/2+0.35,0,0,0,0.7,0.06,0.5));}
    g.add(pool(0.03,1).translateZ(D/2+0.5));
  }
  if(lv>=1){const D=lv===1?1.3:lv===2?1.5:1.6,R=mulberry(lv*31+7);
    for(const sx of [-0.68,0.72]){const q=[];q.push(P(ICO2,0x4a8a34,0,0.18,0,0,0,0,0.42,0.32,0.34));for(let i=0;i<16;i++){const a=R()*6.28,e=R()*1.1;lf(q,GREENS[i%4],Math.sin(a)*0.2*Math.cos(e),0.16+Math.sin(e)*0.14,Math.cos(a)*0.17*Math.cos(e),a,0.2+e*0.5,0.16,0.1);}
      for(let i=0;i<4;i++){const a=R()*6.28;bloom(q,[0xf2a6c8,0xffffff,0xf6d04a][i%3],0xf6d04a,Math.sin(a)*0.18,0.28+R()*0.06,Math.cos(a)*0.15,0.05);}p.push(...shift(q,sx,0,D/2+0.28));}
    p.push(P(BOX,0xb8ae9a,-0.2,0.03,D/2+0.2,0,0,0,0.44,0.06,0.24),P(ICO2,0xf6d04a,-0.08,0.34,D/2+0.035,0,0,0,0.04,0.04,0.03));
    const mb=[P(BOX,0x6a4a30,0,0.25,0,0,0,0,0.06,0.5,0.06),P(BOX,0x5a8ae0,0,0.56,0,0,0,0,0.2,0.16,0.26),P(CYL12,0x5a8ae0,0,0.64,0,1.57,0,1.57,0.2,0.26,0.2),P(BOX,0xe8453a,0.11,0.66,0.06,0,0,0,0.02,0.14,0.04)];
    p.push(...shift(mb,1.15,0,D/2+0.1));}
  g.add(M(p));if(gl.length){const m=M(gl,glowMat);m.castShadow=false;g.add(m);}
  return g;
}
function binGroup(){const g=new T.Group();g.add(M([P(BOX,0x8a5a36,0,0.22,0,0,0,0,0.7,0.44,0.55),P(BOX,0x5a3a26,0,0.1,0,0,0,0,0.72,0.05,0.57),P(BOX,0x5a3a26,0,0.34,0,0,0,0,0.72,0.05,0.57),P(BOX,0x6e4428,0,0.48,-0.02,0,0,0,0.76,0.07,0.6),P(BOX,0xf6d04a,0,0.3,0.28,0,0,0,0.16,0.1,0.02)]));return g;}

