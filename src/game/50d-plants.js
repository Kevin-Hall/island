/* =========================================================
   Potted plants: a set of houseplants and garden pots to dot around the island (and your porch), in the muted,
   earthy greens of a hand-painted plant sheet. Each is one tile, built from plain parts in its own kind of pot
   (terracotta, stone, glazed white, charcoal, sage green, clay, cream) with a saucer and a disc of soil, so it merges
   into the decor batch like everything else. furnParts (50b) hands any "pot_" kind here. They're sold on the Shop's
   Plants tab (BUILD[k].plant).
   ========================================================= */
const POTS={terra:[0xc07a52,0x8a4e34,0xd0906a],stone:[0xa8a298,0x74706a,0xbab4aa],white:[0xece6da,0xb4ac9e,0xf8f4ec],dark:[0x40363a,0x221c20,0x54484c],
  green:[0x6a8a62,0x3e5a40,0x7e9c74],clay:[0x8a6c5c,0x5a4438,0x9c7e6c],cream:[0xd8ccb4,0xa89c86,0xe6dcc6]};
const PGR=[0x2e4628,0x40602e,0x56783a,0x6c8e44,0x86a452,0xa4b868];/* leaf greens, dark to light */
const POT_GEO=new T.CylinderGeometry(0.5,0.38,1,12),POT_BOWL=new T.CylinderGeometry(0.5,0.3,1,12);
// a pot with its rim, soil and saucer; returns the height of the soil
function pot(p,st,r,h,bowl){const [c,d,l]=POTS[st];p.push(PG(bowl?POT_BOWL:POT_GEO,c,d,0,h/2,0,0,0,0,r*2,h,r*2),PG(CYL12,l,c,0,h-0.012,0,0,0,0,r*2.1,0.055,r*2.1),
  P(CYL12,0x4a3626,0,h+0.01,0,0,0,0,r*1.84,0.02,r*1.84),P(CYL12,d,0,0.012,0,0,0,0,r*1.75,0.024,r*1.75));return h+0.02;}
// a leaf from (x,y,z) heading `a` round and `up` above level, len long, wid wide (a flattened diamond, dark at its root)
function pleaf(p,col,x,y,z,a,up,len,wid,th=0.02){const c=Math.cos(up);p.push(PG(LEAF0,col,lerpHex(col,0x1a2a14,0.35),x+Math.sin(a)*len*0.45*c,y+Math.sin(up)*len*0.45,z+Math.cos(a)*len*0.45*c,-up,a,0,wid,th,len));}
function stalk(p,col,x0,y0,z0,x1,y1,z1,w){limb(p,col,x0,y0,z0,x1,y1,z1,w);}
function potPlant(kind,p,seed){const R=mulberry(hi(kind.length,seed|0,41));
  switch(kind){
    case'pot_monstera':{const y=pot(p,'terra',0.2,0.26);// big split leaves on long stems, fanning out
      for(let i=0;i<10;i++){const a=i/10*6.283+R()*0.4,up=0.3+R()*0.7,L=0.2+R()*0.18,sx=Math.sin(a)*L*Math.cos(up),sz=Math.cos(a)*L*Math.cos(up),sy=y+Math.sin(up)*L+0.12;
        stalk(p,0x5a7a36,0,y,0,sx,sy,sz,0.018);const col=PGR[i%3];pleaf(p,col,sx,sy,sz,a,-0.2+R()*0.3,0.34,0.3,0.025);
        for(const s of [-1,1])p.push(P(BOX,lerpHex(col,0x1a2a14,0.5),sx+Math.sin(a)*0.1+Math.cos(a)*s*0.06,sy-0.03,sz+Math.cos(a)*0.1-Math.sin(a)*s*0.06,0,a+s*0.9,0,0.012,0.012,0.09));}/* the splits */
      return true;}
    case'pot_snake':{const y=pot(p,'stone',0.17,0.34);// tall stiff blades with yellow edges
      for(let i=0;i<8;i++){const a=i/8*6.283+R()*0.5,r=0.04+R()*0.06,h=0.42+R()*0.3,up=1.3+R()*0.2;
        pleaf(p,0xc8c060,Math.sin(a)*r,y,Math.cos(a)*r,a,up,h,0.1,0.018);pleaf(p,i%2?PGR[1]:PGR[2],Math.sin(a)*r*1.02,y+0.01,Math.cos(a)*r*1.02,a,up,h*0.97,0.085,0.026);}
      return true;}
    case'pot_fiddle':{const y=pot(p,'cream',0.18,0.3);// a slim trunk with big fiddle-shaped leaves up its top half
      stalk(p,0x6a5038,0,y,0,0.02,y+0.72,0.01,0.035);
      for(let i=0;i<15;i++){const t=i/14,a=i*2.4,yy=y+0.26+t*0.5;pleaf(p,PGR[1+(i%3)],0.01,yy,0,a,0.3-t*0.3,0.3,0.24,0.025);}
      return true;}
    case'pot_paradise':{const y=pot(p,'dark',0.2,0.36);// tall stems each ending in a long paddle leaf
      for(let i=0;i<8;i++){const a=i/8*6.283+R()*0.3,lean=0.12+R()*0.12,h=0.5+R()*0.45,tx=Math.sin(a)*lean,tz=Math.cos(a)*lean;stalk(p,0x5a7a3a,0,y,0,tx,y+h,tz,0.018);
        pleaf(p,PGR[1+(i%3)],tx,y+h-0.06,tz,a,0.95+R()*0.3,0.52,0.2,0.022);}
      return true;}
    case'pot_fern':{const y=pot(p,'stone',0.19,0.24);// a fountain of arching fronds
      for(let i=0;i<22;i++){const a=i/22*6.283+R()*0.3,up=0.15+R()*0.7,L=0.32+R()*0.14;const col=PGR[1+(i%3)];
        pleaf(p,col,0,y+0.02,0,a,up,L*0.6,0.1);const ex=Math.sin(a)*L*0.55*Math.cos(up),ez=Math.cos(a)*L*0.55*Math.cos(up),ey=y+0.02+Math.sin(up)*L*0.55;pleaf(p,col,ex,ey,ez,a,up-0.8,L*0.55,0.09);}
      return true;}
    case'pot_pothos':{const y=pot(p,'white',0.16,0.24,true);// heart leaves, and vines trailing over the rim to the ground
      for(let i=0;i<20;i++){const a=R()*6.283,r=Math.sqrt(R())*0.15,yy=y+0.03+(1-r/0.15)*0.1;pleaf(p,[0x5e8a3a,0x7ea246,0x96b24e][i%3],Math.sin(a)*r,yy,Math.cos(a)*r,a,0.1+R()*0.4,0.16,0.14);}
      for(let v=0;v<5;v++){const a=v*1.26+R()*0.5;let x=Math.sin(a)*0.16,z=Math.cos(a)*0.16,yy=y;
        for(let k=0;k<5;k++){const nx=x+Math.sin(a)*0.06,nz=z+Math.cos(a)*0.06,ny=Math.max(0.03,yy-0.07-k*0.01);stalk(p,0x5e7e36,x,yy,z,nx,ny,nz,0.01);pleaf(p,k%2?0x6e9a40:0x8eac4c,nx,ny,nz,a+(k%2?0.9:-0.9),-0.3,0.12,0.1);x=nx;z=nz;yy=ny;}}
      return true;}
    case'pot_succulent':{const y=pot(p,'terra',0.13,0.14,true);// an echeveria rosette, blue-green with blushing tips
      for(let ring=0;ring<3;ring++){const n=8-ring*2,rr=0.1-ring*0.03,up=0.35+ring*0.35;
        for(let i=0;i<n;i++){const a=i/n*6.283+ring*0.4;p.push(PG(SPH_LO,ring===2?0xb0d0b8:0x9cc0a8,0x6a8a78,Math.sin(a)*rr*0.6,y+0.03+ring*0.02,Math.cos(a)*rr*0.6,-up,a,0,0.06,0.03,0.12),
          P(SPH_XS,0xd88a9a,Math.sin(a)*rr*1.15,y+0.04+ring*0.03+Math.sin(up)*0.04,Math.cos(a)*rr*1.15,0,0,0,0.025,0.02,0.025));}}
      return true;}
    case'pot_jade':{const y=pot(p,'clay',0.16,0.18,true);// a little jade tree: stout branches and plump round leaves
      stalk(p,0x7a6a4a,0,y,0,0,y+0.14,0,0.05);
      for(let i=0;i<6;i++){const a=i*1.05+R()*0.4,ex=Math.sin(a)*0.14,ez=Math.cos(a)*0.14,ey=y+0.22+R()*0.12;stalk(p,0x8a7a52,0,y+0.12,0,ex,ey,ez,0.028);
        for(let k=0;k<10;k++){const b=R()*6.283,r=0.02+R()*0.07;p.push(PG(SPH_LO,k%2?0x6e9a4a:0x86ac5a,0x4a6a32,ex+Math.sin(b)*r,ey+0.02+R()*0.05,ez+Math.cos(b)*r,0,b,0.5,0.06,0.035,0.07));}}
      return true;}
    case'pot_rubber':{const y=pot(p,'dark',0.17,0.3);// dark, glossy oval leaves up a single stem
      stalk(p,0x5a4a3a,0,y,0,0,y+0.6,0,0.03);
      for(let i=0;i<12;i++){const a=i*2.3,yy=y+0.1+i*0.045;pleaf(p,i%2?0x3a4e2e:0x2e4228,0,yy,0,a,0.4-i*0.03,0.28,0.15,0.028);}
      p.push(P(SPH_XS,0xb04a3a,0,y+0.64,0,0,0,0,0.03,0.07,0.03));/* the red new-leaf sheath */return true;}
    case'pot_pilea':{const y=pot(p,'white',0.15,0.18);// coin leaves on thin stalks
      for(let i=0;i<18;i++){const a=R()*6.283,up=0.4+R()*1,L=0.1+R()*0.16,x=Math.sin(a)*L*Math.cos(up),z=Math.cos(a)*L*Math.cos(up),yy=y+Math.sin(up)*L+0.06;
        stalk(p,0x7a9a4a,0,y+0.04,0,x,yy,z,0.008);p.push(PG(CYL8,i%2?0x7aa04a:0x5e8a3c,0x3e6030,x,yy,z,0.5-up*0.3,a,0,0.12,0.012,0.12));}
      return true;}
    case'pot_money':{const y=pot(p,'white',0.19,0.26);// a braided trunk and hands of glossy leaves
      for(let s=0;s<3;s++){let px=0,pz=0;for(let k=0;k<5;k++){const a=s*2.09+k*1.2,nx=Math.sin(a)*0.03,nz=Math.cos(a)*0.03;stalk(p,0x9a7a52,px,y+k*0.11,pz,nx,y+(k+1)*0.11,nz,0.024);px=nx;pz=nz;}}
      for(let i=0;i<9;i++){const a=i/9*6.283+R()*0.3,rr=0.1+R()*0.08,cx=Math.sin(a)*rr,cz=Math.cos(a)*rr,cy=y+0.56+R()*0.16;stalk(p,0x6a8a3a,0,y+0.55,0,cx,cy,cz,0.012);
        for(let k=0;k<6;k++)pleaf(p,PGR[1+(k%3)],cx,cy,cz,a+(k-2.5)*0.55,0.15,0.18,0.08);}
      return true;}
    case'pot_spider':{const y=pot(p,'terra',0.15,0.2);// arching striped leaves, with a baby plant dangling on a runner
      for(let i=0;i<14;i++){const a=i/14*6.283+R()*0.3,up=0.3+R()*0.6;pleaf(p,0x7ea24a,0,y+0.02,0,a,up,0.3,0.05);pleaf(p,0xf0f0d8,0,y+0.025,0,a,up,0.28,0.018,0.03);}
      for(let b=0;b<2;b++){const a=b*3+1,x=Math.sin(a)*0.3,z=Math.cos(a)*0.3;stalk(p,0x9ab060,Math.sin(a)*0.12,y+0.05,Math.cos(a)*0.12,x,y-0.1,z,0.008);
        for(let k=0;k<5;k++)pleaf(p,0x8eb454,x,y-0.1,z,k*1.26,0.4,0.1,0.03);}
      return true;}
    case'pot_cactus':{const y=pot(p,'terra',0.14,0.18);// a ribbed column with two arms and a pink flower
      p.push(PG(SPH,0x5e8a4a,0x3e6036,0,y+0.2,0,0,0,0,0.17,0.46,0.17));for(let i=0;i<6;i++){const a=i/6*6.283;p.push(P(BOX,0x4a7038,Math.sin(a)*0.078,y+0.2,Math.cos(a)*0.078,0,a,0,0.01,0.34,0.012));}
      for(const s of [-1,1]){p.push(PG(SPH_LO,0x5e8a4a,0x3e6036,s*0.11,y+0.2+s*0.04,0,0,0,0,0.08,0.08,0.08),PG(SPH_LO,0x5e8a4a,0x3e6036,s*0.14,y+0.28+s*0.04,0,0,0,0,0.075,0.18,0.075));}
      p.push(P(SPH_XS,0xf08aa8,0,y+0.44,0,0,0,0,0.07,0.04,0.07),P(SPH_XS,0xf6d04a,0,y+0.46,0,0,0,0,0.025,0.02,0.025));return true;}
    case'pot_zz':{const y=pot(p,'green',0.16,0.24);// upright stems lined with small glossy leaflets
      for(let i=0;i<6;i++){const a=i/6*6.283+R()*0.3,lean=0.08+R()*0.06,h=0.36+R()*0.18,tx=Math.sin(a)*lean,tz=Math.cos(a)*lean;stalk(p,0x4e6a34,0,y,0,tx,y+h,tz,0.014);
        for(let k=1;k<6;k++){const t=k/6,x=tx*t,z=tz*t,yy=y+h*t;for(const s of [-1,1])pleaf(p,k%2?0x3e5a2c:0x4e7036,x,yy,z,a+s*1.3,0.4,0.08,0.045);}}
      return true;}
    case'pot_calathea':{const y=pot(p,'cream',0.18,0.26);// broad oval leaves painted light and dark
      for(let i=0;i<8;i++){const a=i/8*6.283+R()*0.3,up=0.55+R()*0.4,L=0.14+R()*0.1,x=Math.sin(a)*L*Math.cos(up),z=Math.cos(a)*L*Math.cos(up),yy=y+Math.sin(up)*L+0.05;
        stalk(p,0x7a4a5a,0,y,0,x,yy,z,0.012);pleaf(p,0x3e5a34,x,yy,z,a,0.2,0.26,0.16,0.022);pleaf(p,0x8eb060,x,yy+0.006,z,a,0.2,0.2,0.07,0.024);}
      return true;}
    case'pot_herbs':{const y=pot(p,'terra',0.16,0.16,true);// a bushy pot of basil
      p.push(P(SPH,0x4e8a34,0,y+0.08,0,0,0,0,0.28,0.2,0.28));/* a leafy core so the dome reads solid */
      for(let i=0;i<34;i++){const a=R()*6.283,r=Math.sqrt(R())*0.16,yy=y+0.03+Math.sqrt(Math.max(0,1-(r/0.17)**2))*0.16;pleaf(p,[0x4e8a34,0x62a03e,0x78b04a][i%3],Math.sin(a)*r,yy,Math.cos(a)*r,a,0.1+R()*0.5,0.1,0.08,0.02);}
      return true;}
    case'pot_palm':{const y=pot(p,'clay',0.18,0.28);// a parlour palm: feathery fronds on slim stems
      for(let i=0;i<5;i++){const a=i/5*6.283+R()*0.4,lean=0.1+R()*0.12,h=0.4+R()*0.25,tx=Math.sin(a)*lean,tz=Math.cos(a)*lean;stalk(p,0x6a7a3a,0,y,0,tx,y+h,tz,0.013);
        for(let k=0;k<7;k++){const t=k/7,x=tx+Math.sin(a)*t*0.22,z=tz+Math.cos(a)*t*0.22,yy=y+h+0.04-t*t*0.18;for(const s of [-1,1])pleaf(p,PGR[2+(k%2)],x,yy,z,a+s*1.2,-0.2,0.12-t*0.05,0.03);}}
      return true;}
    case'pot_olive':{const y=pot(p,'green',0.2,0.26);// a little olive tree: a twisting trunk and a cloud of silvery leaves
      let px=0,pz=0,py=y;for(let k=0;k<4;k++){const nx=(R()-0.5)*0.12,nz=(R()-0.5)*0.12,ny=py+0.14;stalk(p,0x8a7458,px,py,pz,nx,ny,nz,0.035-k*0.005);px=nx;pz=nz;py=ny;}
      for(let c=0;c<7;c++){const a=c*0.9+R(),cx=px+Math.sin(a)*0.16,cz=pz+Math.cos(a)*0.14,cy=py+0.06+R()*0.1;stalk(p,0x8a7458,px,py-0.02,pz,cx,cy,cz,0.015);
        for(let k=0;k<12;k++){const b=R()*6.283;pleaf(p,k%2?0x9aa87a:0x7a8c5e,cx+Math.sin(b)*0.07,cy+(R()-0.3)*0.06,cz+Math.cos(b)*0.05,b,0.3,0.1,0.035);}}
      return true;}
    case'pot_grass':{const y=pot(p,'terra',0.15,0.22);// a pot of fine ornamental grass
      for(let i=0;i<22;i++){const a=R()*6.283,r=R()*0.06,up=1.1+R()*0.35;pleaf(p,i%3?0x8aa488:0x6e8c6a,Math.sin(a)*r,y,Math.cos(a)*r,a,up,0.34+R()*0.2,0.025,0.012);}
      return true;}
  }
  return false;}
// the shop's plant list: key, name, price, level, height (for tapping), description
const POT_PLANTS=[['monstera','Monstera',420,2,0.7,'Big split leaves, a jungle in a pot.'],['snake','Snake Plant',220,1,0.9,'Tall striped blades. Impossible to kill.'],
  ['fiddle','Fiddle-leaf Fig',520,3,1.1,'A slender trunk and big, fiddle-shaped leaves.'],['paradise','Bird of Paradise',680,3,1.3,'Tall paddle leaves on long stems.'],
  ['fern','Boston Fern',260,1,0.6,'A fountain of soft, arching fronds.'],['pothos','Pothos',180,1,0.5,'Heart-shaped leaves trailing over the rim.'],
  ['succulent','Echeveria',120,1,0.3,'A little blue-green rosette with blushing tips.'],['jade','Jade Plant',300,2,0.6,'A tiny tree of plump, round leaves.'],
  ['rubber','Rubber Plant',360,2,0.9,'Dark, glossy leaves up a single stem.'],['pilea','Pilea',200,1,0.5,'Round coin leaves on thin stalks.'],
  ['money','Money Tree',480,3,1.0,'A braided trunk and hands of glossy leaves.'],['spider','Spider Plant',180,1,0.5,'Arching striped leaves, with a baby plant dangling.'],
  ['cactus','Cactus',150,1,0.6,'A ribbed column with a pink flower on top.'],['zz','ZZ Plant',280,2,0.7,'Upright stems lined with glossy leaflets.'],
  ['calathea','Calathea',340,2,0.6,'Broad leaves painted light and dark.'],['herbs','Basil Pot',90,1,0.35,'A bushy pot of basil for the kitchen window.'],
  ['palm','Parlour Palm',400,2,0.8,'Feathery fronds on slim stems.'],['olive','Olive Tree',640,4,1.0,'A twisting little tree with silvery leaves.'],
  ['grass','Ornamental Grass',160,1,0.6,'Fine blue-green blades that sway.']];
for(const [k,name,cost,lvl,h,desc] of POT_PLANTS){BUILD['pot_'+k]={name,cost,lvl,multi:true,plant:true,desc};OBJ_H['pot_'+k]=h;}
