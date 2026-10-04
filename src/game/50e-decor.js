/* =========================================================
   More decor (objGroup tries moreDecor before the furniture set): eighteen new pieces for gardens, porches and paths.
   Washing Line, Bird Feeder (with a little bird that hops about), Flower Barrow, Stone Lantern (lit at night), Bicycle,
   Rowboat Planter, Fire Pit (a flickering fire), Bunting, Deck Chair, Toadstool Seat, Log Bench, Pumpkin Pile,
   Snowman, Koi Pond (fish circling under lily pads), Weather Vane (turning in the wind), Tea Table, Flower Cart and
   Telescope. All sold in the shop (and so in Hazel's deals); a few can also be made at the Workbench (58b).
   ========================================================= */
Object.assign(BUILD,{
  clothesline:{name:'Washing Line',cost:180,lvl:1,rot:true,desc:'Laundry drying in the sea breeze.'},
  feeder:{name:'Bird Feeder',cost:220,lvl:1,desc:'A little house of seeds. Someone always drops by.'},
  barrow:{name:'Flower Barrow',cost:260,lvl:2,rot:true,desc:'An old wheelbarrow, overflowing with flowers.'},
  stonelantern:{name:'Stone Lantern',cost:320,lvl:2,desc:'A mossy stone lantern that glows after dusk.'},
  bike:{name:'Bicycle',cost:450,lvl:3,rot:true,desc:'With a basket on the front, for picnics.'},
  boatplanter:{name:'Rowboat Planter',cost:520,lvl:3,rot:true,desc:'A retired rowboat, full of blooms.'},
  firepit:{name:'Fire Pit',cost:380,lvl:2,desc:'A ring of stones and a crackling fire.'},
  bunting:{name:'Bunting',cost:140,lvl:1,multi:true,rot:true,desc:'A string of little flags between two posts.'},
  deckchair:{name:'Deck Chair',cost:160,lvl:1,multi:true,rot:true,desc:'Striped canvas, perfect for doing nothing.'},
  toadstool:{name:'Toadstool Seat',cost:120,lvl:1,multi:true,desc:'A big spotted mushroom, just the right height to sit on.'},
  logbench:{name:'Log Bench',cost:140,lvl:1,multi:true,rot:true,desc:'A split log on two stumps.'},
  pumpkins:{name:'Pumpkin Pile',cost:200,lvl:2,multi:true,desc:'A cosy heap of pumpkins and gourds.'},
  snowman:{name:'Snowman',cost:150,lvl:1,desc:'Carrot nose, button eyes, a woolly scarf. Never melts.'},
  koipond:{name:'Koi Pond',cost:900,lvl:4,desc:'A little pond with lily pads and koi.'},
  vane:{name:'Weather Vane',cost:350,lvl:3,desc:'A copper rooster that turns with the wind.'},
  teaset:{name:'Tea Table',cost:300,lvl:2,rot:true,desc:'A little table laid for tea for two.'},
  flowercart:{name:'Flower Cart',cost:600,lvl:3,rot:true,desc:'A market cart of buckets and bouquets.'},
  telescope:{name:'Telescope',cost:700,lvl:4,rot:true,desc:'For stargazing, or spying on gulls.'}});
Object.assign(OBJ_H,{clothesline:0.8,feeder:1.1,barrow:0.5,stonelantern:0.9,bike:0.6,boatplanter:0.5,firepit:0.4,bunting:1.1,deckchair:0.6,toadstool:0.5,logbench:0.4,pumpkins:0.4,snowman:1.0,koipond:0.2,vane:1.5,teaset:0.6,flowercart:0.9,telescope:1.0});
function decoFlowers(p,x,y,z,n,R,spread=0.12){for(let i=0;i<n;i++){const a=R()*6.283,r=Math.sqrt(R())*spread;bloom(p,[0xf2a6c8,0xffffff,0xf6d04a,0xb8a8f2,0xe86a5a,0xf4b0a0][Math.floor(R()*6)],0xf6d04a,x+Math.cos(a)*r,y+R()*0.06,z+Math.sin(a)*r,0.05);}
  for(let i=0;i<n;i++){const a=R()*6.283,r=Math.sqrt(R())*spread;lf(p,GREENS[i%4],x+Math.cos(a)*r,y-0.04,z+Math.sin(a)*r,a,0.5,0.12,0.06);}}
function moreDecor(kind,g,R,seed){const p=[],gl=[];let anim=null;
  switch(kind){
    case'clothesline':{for(const x of [-0.45,0.45])p.push(P(CYL6,0x7a5a3a,x,0.45,0,0,0,0,0.05,0.9,0.05),P(BOX,0x7a5a3a,x,0.86,0,0,0,0,0.04,0.04,0.2));
      for(const z of [-0.07,0.07])p.push(P(CYL5,0xe8e0d0,0,0.85,z,0,0,1.571,0.01,0.9,0.01));
      [[-0.28,0xf2a6c8,'shirt'],[-0.04,0x7ab4e8,'sock'],[0.12,0xffffff,'towel'],[0.32,0xf6e08a,'shirt']].forEach(([x,c,k])=>{if(k==='shirt')p.push(P(BOX,c,x,0.7,0.07,0,0,0,0.2,0.24,0.01),P(BOX,c,x-0.12,0.78,0.07,0,0,0.6,0.08,0.06,0.01),P(BOX,c,x+0.12,0.78,0.07,0,0,-0.6,0.08,0.06,0.01));
        else if(k==='sock')p.push(P(BOX,c,x,0.75,-0.07,0,0,0,0.05,0.16,0.01),P(BOX,c,x+0.03,0.67,-0.07,0,0,0,0.08,0.04,0.01));else p.push(P(BOX,c,x,0.68,-0.07,0,0,0,0.18,0.32,0.01),P(BOX,0xe86a5a,x,0.6,-0.068,0,0,0,0.18,0.03,0.01));});break;}
    case'feeder':{p.push(P(CYL8,0x7a5a3a,0,0.5,0,0,0,0,0.05,1.0,0.05),P(BOX,0xc8a070,0,1.02,0,0,0,0,0.3,0.04,0.3),P(BOX,0xe8dcc0,0,1.1,0,0,0,0,0.22,0.14,0.22),P(CONE4,0xb8604a,0,1.26,0,0,0.785,0,0.4,0.18,0.4));
      for(let i=0;i<8;i++)p.push(P(SPH_XS,0xd8b878,(R()-0.5)*0.22,1.05,(R()-0.5)*0.22,0,0,0,0.03,0.02,0.03));
      const bird=M([PG(SPH_LO,0x8a6a5a,0x6a4a3a,0,0.06,0,0,0,0.1,0.09,0.13),P(SPH_LO,0xe8805a,0,0.07,0.04,0,0,0,0.07,0.06,0.05),P(SPH_LO,0x8a6a5a,0,0.12,0.05,0,0,0,0.07,0.07,0.07),P(CONE4,0xf6c050,0,0.12,0.1,1.571,0,0,0.02,0.04,0.02),P(BOX,0x6a4a3a,0,0.08,-0.08,-0.3,0,0,0.06,0.01,0.08)]);
      bird.position.set(0.1,1.04,0.05);g.add(bird);anim=t=>{const k=(t*0.5+seed)%6;const hop=k<0.3?Math.sin(k/0.3*Math.PI)*0.04:0;bird.position.y=1.04+hop;bird.rotation.y=Math.floor((t*0.5+seed)/2)*1.7;bird.rotation.x=k>3&&k<3.4?0.5:0;};break;}
    case'barrow':{p.push(P(BOX,0x6a8a9a,0,0.32,0.05,0.12,0,0,0.5,0.06,0.62),P(BOX,0x5a7a8a,0,0.4,0.36,0.6,0,0,0.5,0.22,0.04),P(BOX,0x5a7a8a,0,0.38,-0.25,-0.3,0,0,0.5,0.2,0.04));for(const s of [-1,1])p.push(P(BOX,0x5a7a8a,s*0.25,0.38,0.05,0.12,0,0,0.04,0.18,0.62));
      p.push(P(CYL12,0x3a3a40,0,0.14,0.45,0,0,1.571,0.28,0.06,0.28),P(CYL12,0x8a8a90,0,0.14,0.45,0,0,1.571,0.08,0.07,0.08));for(const s of [-1,1])p.push(P(CYL5,0x8a5a3a,s*0.2,0.33,-0.45,0.3,0,0,0.04,0.5,0.04),P(BOX,0x5a5a5a,s*0.2,0.14,-0.28,0,0,0,0.03,0.24,0.03));
      decoFlowers(p,0,0.48,0.05,10,R,0.18);break;}
    case'stonelantern':{p.push(P(BOX,0x9a9a94,0,0.06,0,0,0,0,0.42,0.12,0.42),P(CYL8,0xa4a49e,0,0.3,0,0,0,0,0.16,0.4,0.16),P(BOX,0x9a9a94,0,0.52,0,0,0,0,0.36,0.06,0.36),P(BOX,0xa4a49e,0,0.64,0,0,0,0,0.3,0.2,0.3),P(CONE4,0x8a8a84,0,0.84,0,0,0.785,0,0.56,0.22,0.56),P(SPH_XS,0x9a9a94,0,0.97,0,0,0,0,0.08,0.08,0.08));
      for(const [x,z] of [[-0.16,0.12],[0.14,-0.17]])p.push(P(SPH_XS,0x6a9a4a,x,0.86,z,0,0,0,0.12,0.04,0.1));gl.push(P(BOX,0xffd890,0,0.64,0.151,0,0,0,0.14,0.12,0.01),P(BOX,0xffd890,0.151,0.64,0,0,0,0,0.01,0.12,0.14),P(BOX,0xffd890,-0.151,0.64,0,0,0,0,0.01,0.12,0.14));break;}
    case'bike':{const c=[0xd8453a,0x4a7ab8,0x6ab85a,0xe8b040][seed%4];for(const z of [-0.28,0.28])p.push(P(CYL12,0x2a2a30,0,0.2,z,0,0,1.571,0.38,0.03,0.38),P(CYL12,0xd0d0d4,0,0.2,z,0,0,1.571,0.06,0.04,0.06));
      limb3(p,c,[0,0.2,-0.28],[0,0.36,0],0.02);limb3(p,c,[0,0.36,0],[0,0.2,0.28],0.02);limb3(p,c,[0,0.36,0],[0,0.52,-0.1],0.02);limb3(p,c,[0,0.2,0.28],[0,0.56,0.22],0.02);limb3(p,c,[0,0.36,0],[0,0.54,0.2],0.02);
      p.push(P(BOX,0x3a3028,0,0.55,-0.11,0,0,0,0.08,0.04,0.16),P(BOX,0x3a3028,0,0.58,0.22,0,0,0,0.3,0.02,0.03),P(BOX,0xc8a062,0,0.5,0.34,0,0,0,0.18,0.12,0.14));decoFlowers(p,0,0.58,0.34,3,R,0.05);
      p.push(P(BOX,0x7a7a80,0.03,0.1,-0.02,0,0,0.5,0.01,0.2,0.02));break;}
    case'boatplanter':{p.push(PG(SPH_LO,0x5a8ab0,0x3a6a90,0,0.16,0,0,0,0.56,0.3,0.96),P(BOX,0xe8dcc0,0,0.27,0,0,0,0,0.5,0.03,0.86),P(BOX,0x8a5a3a,0,0.25,0.15,0,0,0,0.46,0.03,0.08));
      for(const s of [-1,1])limb3(p,0x8a6a4a,[s*0.24,0.28,-0.1],[s*0.42,0.1,-0.45],0.02);decoFlowers(p,0,0.3,0,14,R,0.24);break;}
    case'firepit':{const c=campfireParts(0.75);p.push(...c.p);gl.push(...(c.gl||[]));
      const fl=M([P(CONE5,0xffa040,0,0.32,0,0,0,0,0.22,0.4,0.22),P(CONE5,0xffe070,0.03,0.28,0.02,0,0.5,0,0.12,0.26,0.12)],glowMat);g.add(fl);anim=t=>{fl.scale.set(1+Math.sin(t*9+seed)*0.08,0.85+Math.sin(t*13+seed*2)*0.15,1+Math.cos(t*8)*0.08);fl.rotation.y=t*0.8;};
      for(let i=0;i<3;i++){const a=i*2.1+0.5;p.push(P(CYL8,0x8a5a34,Math.cos(a)*0.52,0.1,Math.sin(a)*0.52,0,-a,1.571,0.12,0.36,0.12));}break;}
    case'bunting':{for(const x of [-0.46,0.46])p.push(P(CYL6,0x8a6a4a,x,0.55,0,0,0,0,0.05,1.1,0.05),P(SPH_XS,0xd8b878,x,1.12,0,0,0,0,0.07,0.07,0.07));
      for(let i=0;i<=8;i++){const t=i/8,x=-0.46+0.92*t,y=1.04-Math.sin(t*Math.PI)*0.16;if(i<8){const t2=(i+1)/8;limb3(p,0xe8e0d0,[x,y,0],[-0.46+0.92*t2,1.04-Math.sin(t2*Math.PI)*0.16,0],0.006);}
        if(i>0&&i<8)p.push(P(PRISM,[0xe86a5a,0xf6d04a,0x7ab4e8,0x9ad08a,0xf2a6c8][i%5],x,y-0.08,0,0,0,Math.PI/2,0.07,0.01,0.12));}break;}
    case'deckchair':{const c=[0x5a8ae0,0xe86a5a,0x6ab85a,0xe8b040][seed%4];limb3(p,0xc8a070,[-0.22,0,-0.3],[-0.22,0.62,0.2],0.025);limb3(p,0xc8a070,[0.22,0,-0.3],[0.22,0.62,0.2],0.025);
      limb3(p,0xc8a070,[-0.22,0,0.3],[-0.22,0.35,-0.15],0.025);limb3(p,0xc8a070,[0.22,0,0.3],[0.22,0.35,-0.15],0.025);
      for(let i=0;i<5;i++)p.push(P(BOX,i%2?0xfbf8f0:c,-0.16+i*0.08,0.36,-0.02,-0.95,0,0,0.08,0.01,0.6));break;}
    case'toadstool':{p.push(P(CYL12,0xf4ead8,0,0.18,0,0,0,0,0.26,0.36,0.26),PG(SPH_LO,0xd8453a,0xa83028,0,0.4,0,0,0,0.6,0.26,0.6),P(CYL12,0xf2e4cc,0,0.32,0,0,0,0,0.5,0.02,0.5));
      for(let i=0;i<6;i++){const a=i*1.1+0.3,e=0.5+(i%2)*0.4;p.push(P(SPH_XS,0xffffff,Math.cos(a)*0.26*Math.cos(e),0.42+Math.sin(e)*0.11,Math.sin(a)*0.26*Math.cos(e),0,0,0,0.08,0.03,0.08));}break;}
    case'logbench':{p.push(PG(CYL12,0x9a6a40,0x7a4e2c,0,0.3,0,0,0,1.571,0.32,0.95,0.32),P(BOX,0xd8b080,0,0.36,0,0,0,0,0.9,0.02,0.24));p.push(P(CYL12,0xd8b080,0.475,0.3,0,0,0,1.571,0.3,0.01,0.3),P(CYL12,0xd8b080,-0.475,0.3,0,0,0,1.571,0.3,0.01,0.3));
      for(const x of [-0.32,0.32])p.push(PG(CYL12,0x8a5a34,0x6a4428,x,0.08,0,0,0,0,0.28,0.16,0.28),P(CYL12,0xd8b080,x,0.165,0,0,0,0,0.24,0.01,0.24));break;}
    case'pumpkins':{for(const [x,z,s,c] of [[0,0,1,0xe8803a],[0.24,0.12,0.75,0xf0a04a],[-0.22,0.14,0.7,0xe0703a],[0.08,-0.2,0.6,0xf2e4c8],[-0.12,0.26,0.45,0x7a9a4a]]){
        p.push(PG(SPH_LO,c,lerpHex(c,0x5a2a1a,0.35),x,0.13*s,z,0,0,0,0.36*s,0.26*s,0.36*s));for(let i=0;i<4;i++)p.push(P(BOX,lerpHex(c,0x5a2a1a,0.3),x,0.13*s,z,0,i*0.785,0,0.365*s,0.24*s,0.012));p.push(P(CYL5,0x5a6a3a,x,0.27*s,z,0.2,0,0.2,0.03,0.08*s,0.03));}
      lf(p,0x5a8a3a,0.2,0.04,-0.15,1,0.2,0.2,0.12);lf(p,0x4a7a34,-0.25,0.04,-0.1,2.5,0.2,0.18,0.1);break;}
    case'snowman':{p.push(PG(SPH_LO,0xffffff,0xd8e4f0,0,0.24,0,0,0,0.52,0.48,0.52),PG(SPH_LO,0xffffff,0xd8e4f0,0,0.62,0,0,0,0.38,0.36,0.38),PG(SPH_LO,0xffffff,0xd8e4f0,0,0.92,0,0,0,0.28,0.27,0.28));
      p.push(P(CONE5,0xf08a2a,0,0.92,0.18,1.571,0,0,0.04,0.14,0.04),P(SPH_XS,0x2a2a30,-0.06,0.96,0.12,0,0,0,0.035,0.035,0.035),P(SPH_XS,0x2a2a30,0.06,0.96,0.12,0,0,0,0.035,0.035,0.035));
      for(let i=0;i<3;i++)p.push(P(SPH_XS,0x2a2a30,0,0.5+i*0.09,0.18,0,0,0,0.035,0.035,0.035));p.push(P(CYL12,0xd8453a,0,0.79,0,0,0,0,0.3,0.06,0.3),P(BOX,0xd8453a,0.1,0.68,0.12,0.2,0,0.2,0.06,0.2,0.03));
      p.push(P(CYL12,0x2a2a30,0,1.06,0,0,0,0,0.26,0.02,0.26),P(CYL12,0x2a2a30,0,1.15,0,0,0,0,0.17,0.17,0.17));limb3(p,0x6a4a30,[0.17,0.66,0],[0.42,0.84,0.02],0.015);limb3(p,0x6a4a30,[-0.17,0.66,0],[-0.4,0.78,0.04],0.015);break;}
    case'koipond':{for(let i=0;i<14;i++){const a=i/14*6.283;p.push(PG(SPH_LO,0x9a9a9e,0x6a6a70,Math.cos(a)*0.46,0.05,Math.sin(a)*0.42,0,-a,0,0.2,0.12,0.16));}
      p.push(P(CYL12,0x2a5a6a,0,0.02,0,0,0,0,0.86,0.02,0.78));gl.push(P(CYL12,0x4a9ab0,0,0.045,0,0,0,0,0.8,0.005,0.72));
      for(const [x,z,r] of [[0.18,-0.15,0.12],[-0.2,0.12,0.1],[0.05,0.22,0.08]])p.push(P(CYL8,0x5a9a4a,x,0.06,z,0,0,0,r*2,0.005,r*2));p.push(P(SPH_XS,0xf2a6c8,0.18,0.08,-0.15,0,0,0,0.07,0.05,0.07));
      const fish=[0xf08a2a,0xffffff,0xe8453a].map((c,i)=>{const f=M([PG(SPH_LO,c,i===1?0xe86a3a:lerpHex(c,0x5a2a1a,0.3),0,0,0,0,0,0,0.05,0.035,0.13),P(CONE4,c,0,0,-0.08,-1.571,0,0,0.05,0.05,0.02)]);f.position.y=0.035;g.add(f);return f;});
      anim=t=>{fish.forEach((f,i)=>{const a=t*(0.5+i*0.15)+i*2.1+seed,r=0.2+i*0.05;f.position.x=Math.cos(a)*r;f.position.z=Math.sin(a)*r*0.85;f.rotation.y=-a;});};break;}
    case'vane':{p.push(P(CYL6,0x5a5a60,0,0.7,0,0,0,0,0.04,1.4,0.04),P(CYL8,0x4a4a50,0,0.05,0,0,0,0,0.3,0.1,0.3));for(const [x,z,ch] of [[0.22,0,'E'],[-0.22,0,'W'],[0,0.22,'S'],[0,-0.22,'N']])p.push(P(BOX,0x5a5a60,x/2,1.15,z/2,0,0,0,x?0.44:0.02,0.02,z?0.44:0.02),P(BOX,0xb87a4a,x,1.15,z,0,0,0,0.05,0.07,0.02));
      const top=M([P(BOX,0xb87a4a,0,0,0,0,0,0,0.04,0.02,0.5),PG(SPH_LO,0xc8884a,0x8a5a3a,0,0.08,0.05,0,0,0,0.12,0.14,0.2),P(SPH_LO,0xc8884a,0,0.18,0.12,0,0,0,0.08,0.09,0.08),P(CONE4,0xd8453a,0,0.24,0.12,0,0,0,0.03,0.06,0.04),P(PRISM,0xb87a4a,0,0.1,-0.12,0,0,Math.PI/2,0.14,0.02,0.14),P(CONE4,0xb87a4a,0,0,0.27,1.571,0,0,0.06,0.08,0.02)]);
      top.position.y=1.42;g.add(top);anim=t=>{top.rotation.y=Math.sin(t*0.13+seed)*1.2+Math.sin(t*0.71)*0.15;};break;}
    case'teaset':{p.push(P(CYL12,0xf4ecdc,0,0.5,0,0,0,0,0.62,0.03,0.62),P(CYL12,0xf2a6c8,0,0.495,0,0,0,0,0.66,0.02,0.66),P(CYL8,0x8a6a4a,0,0.25,0,0,0,0,0.05,0.5,0.05),P(CYL12,0x8a6a4a,0,0.02,0,0,0,0,0.3,0.03,0.3));
      p.push(PG(SPH_LO,0xfbf8f0,0xd8d0c0,0,0.6,0,0,0,0.16,0.14,0.16),P(CYL8,0xfbf8f0,0,0.68,0,0,0,0,0.06,0.03,0.06),P(CONE4,0xfbf8f0,0.1,0.62,0,0,0,-0.9,0.03,0.1,0.03),P(BOX,0x7ab4e8,0,0.6,0.08,0,0,0,0.1,0.03,0.005));
      for(const [x,z] of [[0.18,0.12],[-0.18,-0.1]])p.push(P(CYL12,0xfbf8f0,x,0.53,z,0,0,0,0.14,0.02,0.14),P(CYL12,0xfbf8f0,x,0.56,z,0,0,0,0.08,0.06,0.08),P(CYL12,0x8a5a34,x,0.585,z,0,0,0,0.065,0.01,0.065));
      p.push(P(CYL12,0xfbf8f0,-0.05,0.53,0.2,0,0,0,0.18,0.02,0.18));for(let i=0;i<3;i++)p.push(P(CYL8,[0xf2a6c8,0xd8b070,0xfbf8f0][i],-0.05+(i-1)*0.05,0.555,0.2,0,0,0,0.05,0.03,0.05));
      for(const s of [-1,1]){const f=furn('chair',0xe8dcc0);p.push(...shift(f.p,s*0.55,0,0,s>0?-1.571:1.571));}break;}
    case'flowercart':{p.push(P(BOX,0x8a5a3a,0,0.42,0,0,0,0,0.9,0.06,0.5),P(BOX,0x9a6a40,0,0.5,0.24,0,0,0,0.9,0.14,0.03),P(BOX,0x9a6a40,0,0.5,-0.24,0,0,0,0.9,0.14,0.03));
      for(const s of [-1,1])p.push(P(CYL12,0x5a4030,s*0.32,0.2,0.3,1.571,0,0,0.4,0.04,0.4),P(CYL12,0x8a8a8a,s*0.32,0.2,0.32,1.571,0,0,0.06,0.04,0.06));
      limb3(p,0x8a5a3a,[0.45,0.42,0],[0.75,0.3,0],0.025);
      for(const x of [-0.3,0,0.3]){p.push(P(CYL12,0x8a9aa8,x,0.6,0,0,0,0,0.22,0.24,0.22));decoFlowers(p,x,0.78,0,6,R,0.08);}
      for(const x of [-0.4,0.4])p.push(P(CYL5,0x6a4a30,x,0.8,-0.22,0,0,0,0.03,0.7,0.03));for(let i=0;i<6;i++)p.push(P(BOX,i%2?0xfbf8f0:0x6ab85a,-0.4+i*0.16,1.16,-0.04,0.35,0,0,0.16,0.02,0.44));break;}
    case'telescope':{for(let i=0;i<3;i++){const a=i*2.094;limb3(p,0x8a6a4a,[Math.cos(a)*0.28,0,Math.sin(a)*0.28],[0,0.62,0],0.02);}
      const tube=M([PG(CYL12,0xc8984a,0x8a6a3a,0,0,0,1.571,0,0,0.12,0.7,0.12),P(CYL12,0x3a3a44,0,0,0.36,1.571,0,0,0.15,0.04,0.15),P(CYL12,0x9ab8d8,0,0,0.38,1.571,0,0,0.11,0.01,0.11),P(CYL8,0x8a6a3a,0,0,-0.4,1.571,0,0,0.07,0.14,0.07)]);
      tube.position.set(0,0.66,0);tube.rotation.x=-0.45;g.add(tube);anim=t=>{tube.rotation.y=Math.sin(t*0.1+seed)*0.4;};break;}
    default:return false;}
  g.add(M(p));if(gl.length){const m=M(gl,glowMat);m.castShadow=false;g.add(m);}if(anim)g.userData.anim=anim;return true;}
