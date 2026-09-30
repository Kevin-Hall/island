/* =========================================================
   Furniture and garden pieces for making the land your own: seating, shade, lamps, water features, floors and
   borders. Each is one tile, faces +z (turnable where BUILD says rot), and is built from plain parts so the decor
   batch in syncObjs (58-crafting) merges it with everything else. Painted pieces pick a colour from their id, so a
   row of chairs or a set of rugs comes out gently mixed.
   ========================================================= */
const PAINT=[0x7ac0d8,0xf2c35a,0xe88a8a,0xf4f0e6,0x8ac48a,0xb8a0e0];
const FW=0xb88452,FW_D=0x7a5230,FWHITE=0xf4efe6,FST=0xb4b0a6,FST_D=0x96928a,FIRON=0x2e3838;
// one tile's worth of parts for a furniture piece; returns false for a kind it doesn't know
function furnParts(kind,g,R,seed){let p=[];const paint=PAINT[seed%PAINT.length];
  switch(kind){
    case'picnic':{// a trestle table with benches either side, a gingham cloth and a little lunch
      p.push(P(BOX,FW,0,0.44,0,0,0,0,0.92,0.06,0.5));
      for(const sx of [-0.34,0.34])for(const sz of [-1,1])p.push(P(BOX,FW_D,sx,0.22,sz*0.14,sz*0.5,0,0,0.06,0.46,0.06));
      for(const sz of [-0.4,0.4])p.push(P(BOX,FW,0,0.24,sz,0,0,0,0.9,0.05,0.18),P(BOX,FW_D,-0.34,0.11,sz,0,0,0,0.05,0.22,0.12),P(BOX,FW_D,0.34,0.11,sz,0,0,0,0.05,0.22,0.12));
      p.push(P(BOX,0xe0584a,0,0.475,0,0,0.12,0,0.5,0.01,0.4));for(let i=-1;i<=1;i++)p.push(P(BOX,0xf8f0e8,i*0.13,0.482,0,0,0.12,0,0.04,0.01,0.4),P(BOX,0xf8f0e8,0,0.483,i*0.1,0,0.12,0,0.5,0.01,0.03));
      p.push(P(CYL12,0xc89858,-0.12,0.53,0.02,0,0,0,0.16,0.1,0.12),P(ICO2,0xe84a3a,-0.14,0.6,0.02,0,0,0,0.06,0.06,0.06),P(ICO2,0xf6d04a,-0.08,0.6,0.04,0,0,0,0.06,0.06,0.06),
        P(CYL12,0xf0e8e0,0.2,0.48,-0.02,0,0,0,0.18,0.02,0.18),P(CYL12,0xd88a4a,0.2,0.51,-0.02,0,0,0,0.13,0.05,0.13),P(CYL8,0x8ac8e8,0.28,0.53,0.14,0,0,0,0.06,0.12,0.06));break;}
    case'parasol':{// a striped garden parasol on a heavy base
      const c1=[0xf2a64a,0x6ab0d8,0xe86a7a,0x7ac47a][seed%4];
      p.push(P(CYL12,FST_D,0,0.04,0,0,0,0,0.4,0.08,0.4),P(CYL8,FWHITE,0,0.8,0,0,0,0,0.05,1.6,0.05));
      p.push(P(CONE12,c1,0,1.5,0,0,0,0,1.25,0.32,1.25));for(let i=0;i<8;i++){const a=i/8*6.283;p.push(P(BOX,FWHITE,Math.cos(a)*0.31,1.52,Math.sin(a)*0.31,0,-a,-0.47,0.66,0.02,0.07));}
      p.push(P(ICO2,FWHITE,0,1.72,0,0,0,0,0.06,0.06,0.06));
      for(let i=0;i<8;i++){const a=(i+0.5)/8*6.283;p.push(P(ICO2,i%2?c1:FWHITE,Math.cos(a)*0.6,1.34,Math.sin(a)*0.58,0,0,0,0.07,0.05,0.07));}break;}
    case'chair':{// a slatted garden chair with wide arms
      p.push(P(BOX,paint,0,0.26,0.02,-0.08,0,0,0.5,0.05,0.44));
      for(let i=-2;i<=2;i++)p.push(P(BOX,paint,i*0.1,0.56,-0.24,-0.28,0,0,0.08,0.62,0.04));
      p.push(P(BOX,paint,0,0.78,-0.3,-0.28,0,0,0.5,0.06,0.04));
      for(const sx of [-0.28,0.28])p.push(P(BOX,paint,sx,0.42,0.02,0,0,0,0.1,0.04,0.5),P(BOX,paint,sx,0.2,0.2,0,0,0,0.05,0.42,0.05),P(BOX,paint,sx,0.16,-0.16,0,0,0,0.05,0.34,0.05));
      p.push(P(BOX,0xf8f0e0,0,0.3,0.04,-0.08,0,0,0.42,0.05,0.36));break;}
    case'arbor':{// a white arch with climbing roses
      for(const sx of [-0.44,0.44])for(const sz of [-0.14,0.14])p.push(P(BOX,FWHITE,sx,0.8,sz,0,0,0,0.06,1.6,0.06));
      for(const sx of [-0.44,0.44])for(let i=0;i<5;i++)p.push(P(BOX,FWHITE,sx,0.25+i*0.28,0,0,0,0,0.03,0.03,0.3));
      for(let i=0;i<9;i++){const a=i/8*Math.PI,x=-Math.cos(a)*0.44,y=1.6+Math.sin(a)*0.22;p.push(P(BOX,FWHITE,x,y,0,0,0,-Math.atan2(0.44*Math.sin(a),0.22*Math.cos(a)),0.05,0.2,0.34));}
      const rose=[0xf28aa8,0xe85a7a,0xfbd0dc,0xf6f0f0][seed%4];
      for(let i=0;i<56;i++){const t=R(),side=R()<0.5?-1:1,top=t>0.62,a=top?(t-0.62)/0.38*Math.PI:0,x=top?-Math.cos(a)*0.44:side*0.44,y=top?1.6+Math.sin(a)*0.22:0.15+t*1.5,z=(R()-0.5)*0.36;
        lf(p,GREENS[i%4],x+(R()-0.5)*0.14,y,z,R()*6.28,0.4,0.2,0.13);if(i%3<2)bloom(p,rose,0xf6d04a,x+(R()-0.5)*0.12,y+0.04,z+(R()<0.5?-0.13:0.13),0.08);}break;}
    case'lamppost':{// a tall street lamp: iron post, four-pane lamp, a little crown
      p.push(P(CYL8,FIRON,0,0.06,0,0,0,0,0.26,0.12,0.26),P(CYL8,FIRON,0,0.18,0,0,0,0,0.16,0.14,0.16),P(CYL8,FIRON,0,0.9,0,0,0,0,0.07,1.5,0.07),P(CYL8,FIRON,0,1.64,0,0,0,0,0.14,0.04,0.14),
        P(CONE4,FIRON,0,2.06,0,0,Math.PI/4,0,0.36,0.2,0.36),P(ICO2,0xd8b050,0,2.2,0,0,0,0,0.06,0.08,0.06));
      for(const [x,z] of [[-0.12,-0.12],[0.12,-0.12],[-0.12,0.12],[0.12,0.12]])p.push(P(BOX,FIRON,x,1.83,z,0,0,0,0.025,0.34,0.025));
      g.add(M(p));const lamp=M([P(BOX,0xfff0b8,0,1.83,0,0,0,0,0.22,0.3,0.22)],glowMat);lamp.castShadow=false;g.add(lamp);g.add(pool(0.04,1.25));return true;}
    case'fountain':{// a round stone fountain: basin, pedestal, a bowl, and a jet that bubbles and falls back
      for(let i=0;i<14;i++){const a=i/14*6.283;p.push(P(BOX,i%2?FST:FST_D,Math.cos(a)*0.47,0.16,Math.sin(a)*0.47,0,-a,0,0.12,0.32,0.23));}
      p.push(P(CYL12,FST_D,0,0.04,0,0,0,0,0.96,0.08,0.96),P(CYL12,0x5aa8d0,0,0.25,0,0,0,0,0.86,0.02,0.86),P(CYL8,FST,0,0.46,0,0,0,0,0.14,0.5,0.14),
        P(CYL12,FST,0,0.72,0,0,0,0,0.46,0.06,0.46),P(CYL12,FST_D,0,0.67,0,0,0,0,0.3,0.06,0.3),P(CYL12,0x7ac8e8,0,0.755,0,0,0,0,0.4,0.02,0.4),P(CYL8,FST,0,0.82,0,0,0,0,0.08,0.14,0.08));
      g.add(M(p));const jet=M([P(CONE8,0xd8f2fc,0,0.13,0,0,0,0,0.1,0.26,0.1),P(ICO2,0xeaf8ff,0,0.26,0,0,0,0,0.12,0.08,0.12)],lumMat);jet.castShadow=false;jet.position.y=0.86;g.add(jet);
      const drops=M([0,1,2,3,4,5].map(i=>{const a=i/6*6.283;return P(ICO2,0xd8f2fc,Math.cos(a)*0.22,0,Math.sin(a)*0.22,0,0,0,0.05,0.07,0.05);}),lumMat);drops.castShadow=false;g.add(drops);
      g.userData.anim=t=>{jet.scale.y=0.85+Math.sin(t*6+seed)*0.15;const u=(t*0.9)%1;drops.position.y=0.95-u*u*0.2;drops.scale.setScalar(0.6+u*0.7);drops.rotation.y=t*0.4;};return true;}
    case'hammock':{// a striped hammock slung between two posts
      const c1=[0xe86a5a,0x5aa0d0,0xf2b84a][seed%3];
      for(const sx of [-0.5,0.5])p.push(P(CYL8,FW_D,sx,0.5,0,0,0,0,0.09,1.0,0.09),P(CYL8,FW,sx,1.02,0,0,0,0,0.11,0.04,0.11));
      const N=7;for(let i=0;i<N;i++){const u=(i+0.5)/N,x=-0.4+u*0.8,y=0.4+(2*u-1)**2*0.3,sl=Math.atan(1.5*(2*u-1));
        p.push(P(BOX,i%2?FWHITE:c1,x,y,0,0,0,sl,0.8/N+0.01,0.03,0.46));}
      for(const sx of [-1,1])p.push(P(BOX,0xe8dcc0,sx*0.45,0.8,0,0,0,sx*0.9,0.02,0.24,0.02));
      p.push(P(BOX,0xf8f0e0,-0.24,0.5,0,0,0,0.25,0.18,0.08,0.28));break;}
    case'mailbox':{// a mailbox on a post with its little red flag up
      p.push(P(BOX,FW_D,0,0.4,0,0,0,0,0.08,0.8,0.08),P(BOX,paint,0,0.86,0,0,0,0,0.24,0.18,0.36),P(CYL12,paint,0,0.95,0,Math.PI/2,0,0,0.24,0.36,0.14),
        P(BOX,0x2e2a2a,0,0.86,0.182,0,0,0,0.18,0.12,0.01),P(BOX,0xd8453a,0.13,1.0,-0.06,0,0,0,0.02,0.2,0.04),P(BOX,0xd8453a,0.13,1.08,0.0,0,0,0,0.02,0.08,0.12));break;}
    case'stall':{// a market stall: a counter of crates under a striped awning
      const c1=[0xe86a5a,0x5aa0d0,0x7ab85a][seed%3];
      p.push(P(BOX,FW,0,0.3,0.1,0,0,0,0.96,0.6,0.4),P(BOX,0xa87848,0,0.62,0.1,0,0,0,1.0,0.04,0.46));
      for(const sx of [-0.46,0.46])for(const sz of [-0.3,0.3])p.push(P(BOX,FW_D,sx,0.72,sz,0,0,0,0.06,1.44,0.06));
      for(let i=0;i<6;i++)p.push(P(BOX,i%2?FWHITE:c1,-0.42+i*0.168,1.42,0.02,0.3,0,0,0.17,0.03,0.8));
      for(let i=0;i<6;i++)p.push(P(PRISM,i%2?FWHITE:c1,-0.42+i*0.168,1.26,0.44,0,0,Math.PI,0.085,0.08,0.02));
      const fr=[0xe84a3a,0xf6a830,0x8ac850,0xf6d04a,0x9a5ac0];for(let c=0;c<3;c++){const cx=-0.3+c*0.3;p.push(P(BOX,0xc89858,cx,0.7,0.14,0,0,0,0.26,0.1,0.26));
        for(let k=0;k<5;k++)p.push(P(ICO2,fr[(c*2+seed)%5],cx+(k%3-1)*0.07,0.78+Math.floor(k/3)*0.04,0.14+(k%2?0.05:-0.05),0,0,0,0.08,0.08,0.08));}
      p.push(P(BOX,0xf4ead0,0,0.44,0.31,0,0,0,0.5,0.18,0.01));break;}
    case'topiary':{// a clipped three-ball topiary in a square planter
      p.push(P(BOX,FWHITE,0,0.16,0,0,0,0,0.44,0.32,0.44),P(BOX,0xe8e0d0,0,0.33,0,0,0,0,0.5,0.04,0.5),P(BOX,0x5a3a2a,0,0.34,0,0,0,0,0.4,0.02,0.4),P(CYL6,FW_D,0,0.8,0,0,0,0,0.04,0.9,0.04));
      for(const [y,s] of [[0.58,0.36],[0.95,0.3],[1.26,0.24]])p.push(PG(SPH_LO,0x5aa840,0x3a7a30,0,y,0,0,R()*3,0,s,s*0.95,s));break;}
    case'birdbath':{// a stone bird bath with a bird on the rim
      p.push(P(CYL8,FST_D,0,0.04,0,0,0,0,0.34,0.08,0.34),P(TOWER,FST,0,0.32,0,0,0,0,0.14,0.52,0.14),P(CYL12,FST,0,0.6,0,0,0,0,0.6,0.08,0.6),P(CYL12,FST_D,0,0.54,0,0,0,0,0.36,0.06,0.36),P(CYL12,0x7ac8e8,0,0.645,0,0,0,0,0.5,0.01,0.5));
      const bc=[0x5a8ae0,0xe86a4a,0xf6d04a][seed%3];p.push(P(ICO2,bc,0.26,0.72,0,0,0,0,0.1,0.08,0.14),P(ICO2,bc,0.26,0.78,0.05,0,0,0,0.07,0.07,0.07),P(CONE4,0xf6a830,0.26,0.78,0.1,Math.PI/2,0,0,0.03,0.05,0.03),P(BOX,bc,0.26,0.74,-0.09,0.4,0,0,0.05,0.02,0.08));break;}
    case'urn':{// a stone urn spilling over with flowers
      p.push(P(CYL12,FST_D,0,0.05,0,0,0,0,0.3,0.1,0.3),P(TOWER,FST,0,0.18,0,Math.PI,0,0,0.22,0.18,0.22),P(TOWER,FST,0,0.36,0,0,0,0,0.44,0.22,0.44),P(CYL12,FST_D,0,0.48,0,0,0,0,0.48,0.04,0.48));
      const fl=[];wildflowers(fl,R,[0xf28aa8,0xffffff,0xb8a8f2,0xf6d04a,0xe86a5a],8,0.16);p.push(...shift(fl,0,0.48,0));for(let i=0;i<8;i++){const a=i/8*6.283;lf(p,GREENS[i%4],Math.cos(a)*0.2,0.46,Math.sin(a)*0.2,a+Math.PI/2,-0.5,0.2,0.08);}break;}
    case'picket':{// a white picket fence panel
      for(let i=0;i<5;i++){const x=-0.4+i*0.2;p.push(P(BOX,FWHITE,x,0.27,0,0,0,0,0.1,0.54,0.035),P(CONE4,FWHITE,x,0.58,0,0,Math.PI/4,0,0.1,0.08,0.05));}
      p.push(P(BOX,0xe8e2d6,0,0.4,-0.03,0,0,0,1.0,0.06,0.03),P(BOX,0xe8e2d6,0,0.16,-0.03,0,0,0,1.0,0.06,0.03));break;}
    case'sundial':{// a sundial on a carved pedestal
      p.push(P(BOX,FST_D,0,0.05,0,0,0,0,0.4,0.1,0.4),P(CYL8,FST,0,0.38,0,0,0,0,0.2,0.56,0.2),P(BOX,FST_D,0,0.68,0,0,0,0,0.34,0.06,0.34),P(CYL12,0xc89a48,0,0.73,0,0,0,0,0.4,0.03,0.4));
      for(let i=0;i<12;i++){const a=i/12*6.283;p.push(P(BOX,0x6a4a20,Math.cos(a)*0.16,0.748,Math.sin(a)*0.16,0,-a,0,0.04,0.005,0.01));}p.push(P(PRISM,0xb88a38,0,0.79,0,0,Math.PI/2,0,0.12,0.08,0.02));break;}
    case'swing':{// a garden swing seat under an A-frame, gently rocking
      for(const sx of [-0.5,0.5])for(const sz of [-1,1])p.push(P(BOX,FW_D,sx,0.72,sz*0.2,sz*-0.28,0,0,0.07,1.5,0.07));
      p.push(P(BOX,FW,0,1.44,0,0,0,0,1.1,0.08,0.1));g.add(M(p));
      const seat=M([P(BOX,0xe8dcc0,-0.34,-0.46,0,0,0,0,0.02,0.92,0.02),P(BOX,0xe8dcc0,0.34,-0.46,0,0,0,0,0.02,0.92,0.02),P(BOX,paint,0,-0.92,0,0,0,0,0.76,0.05,0.3),P(BOX,paint,0,-0.74,-0.14,-0.2,0,0,0.76,0.32,0.04),
        P(BOX,0xf8f0e0,-0.18,-0.86,0,0,0,0,0.22,0.08,0.22)]);seat.position.y=1.4;g.add(seat);g.userData.anim=t=>{seat.rotation.x=Math.sin(t*1.3+seed)*0.12;};return true;}
    default:return false;}
  g.add(M(p));return true;}
