/* =========================================================
   Little yard pieces the house styles share (55c): a log pile, a bike, a rain barrel and the like.
   ========================================================= */
// the little extras round a house
const YARD={
  pot:(p,x,z,R)=>{p.push(P(CYL12,0xc8704a,x,0.12,z,0,0,0,0.24,0.24,0.24),P(CYL12,0x4a3424,x,0.24,z,0,0,0,0.2,0.02,0.2));const q=[];for(let i=0;i<8;i++)lf(q,GREENS[i%4],0,0.24,0,i*0.8,0.7+(i%3)*0.2,0.26,0.11);p.push(...shift(q,x,0,z,0));
    if(R()<0.5)for(let i=0;i<3;i++)p.push(P(SPH_XS,[0xf2a6c8,0xf6d04a,0xffffff][i],x+Math.cos(i*2)*0.08,0.42,z+Math.sin(i*2)*0.08,0,0,0,0.08,0.06,0.08));},
  tree:(p,x,z,R)=>{const c=pickR([[0xf6c8d8,0xe8a8c0],[0x6ab84a,0x4a9a3a],[0x8ac85a,0x5aa844]]);p.push(P(CYL8,0x6a4a30,x,0.3,z,0,0,0,0.08,0.6,0.08),PG(SPH_LO,c[0],c[1],x,0.75,z,0,0,0,0.5,0.42,0.5),PG(SPH_LO,c[0],c[1],x+0.1,0.92,z-0.05,0,0,0,0.32,0.28,0.32));
    if(c[0]===0x6ab84a)for(let i=0;i<4;i++)p.push(P(SPH_XS,0xe8453a,x+Math.cos(i*1.6)*0.2,0.7+(i%2)*0.12,z+Math.sin(i*1.6)*0.2,0,0,0,0.07,0.07,0.07));},
  bench:(p,x,z)=>{p.push(P(BOX,0x8a5a3a,x,0.22,z,0,1.571,0,0.6,0.05,0.22),P(BOX,0x8a5a3a,x+(x<0?-0.09:0.09),0.36,z,0,1.571,0,0.6,0.2,0.04));for(const s of [-1,1])p.push(P(BOX,0x5a3a2a,x,0.1,z+s*0.24,0,0,0,0.2,0.2,0.04));},
  lamp:(p,x,z,R,gl)=>{p.push(P(CYL8,0x3a3a44,x,0.45,z,0,0,0,0.05,0.9,0.05),P(CYL8,0x3a3a44,x,0.03,z,0,0,0,0.16,0.06,0.16),P(CONE5,0x3a3a44,x,1.02,z,0,0,0,0.18,0.1,0.18));gl.push(P(BOX,0xffe0a0,x,0.93,z,0,0,0,0.11,0.13,0.11));},
  wash:(p,x,z,R)=>{for(const dz of [-0.35,0.35])p.push(P(CYL6,0x7a5a3a,x,0.4,z+dz,0,0,0,0.04,0.8,0.04));p.push(P(CYL5,0xe8e0d0,x,0.76,z,1.571,0,0,0.01,0.7,0.01));
    for(let i=0;i<3;i++){const c=[0xf2a6c8,0x7ab4e8,0xf6e08a,0xffffff,0x9ad08a][(i+Math.floor(R()*5))%5];p.push(P(BOX,c,x,0.62,z-0.2+i*0.2,0,1.571,0,0.16,0.24,0.01));}},
  logs:(p,x,z)=>{for(let i=0;i<6;i++){const y=0.07+Math.floor(i/3)*0.13,dz=(i%3)*0.13-0.13+(i>=3?0.06:0);if(i===5)continue;p.push(P(CYL8,0x8a5a34,x,y,z+dz,0,0,1.571,0.12,0.42,0.12),P(CYL8,0xd8b080,x+0.21,y,z+dz,0,0,1.571,0.1,0.01,0.1));}},
  bath:(p,x,z)=>{p.push(P(CYL8,0xb8b4ac,x,0.22,z,0,0,0,0.1,0.44,0.1),P(CYL12,0xc8c4bc,x,0.46,z,0,0,0,0.42,0.06,0.42),P(CYL12,0x7ac0e0,x,0.49,z,0,0,0,0.34,0.01,0.34));},
  bed:(p,x,z,R)=>{p.push(P(BOX,0x8a6a4a,x,0.06,z,0,0,0,0.3,0.12,0.6),P(BOX,0x5a3a24,x,0.12,z,0,0,0,0.26,0.02,0.56));for(let i=0;i<4;i++)bloom(p,[0xf2a6c8,0xffffff,0xf6d04a,0xb8a8f2,0xe86a5a][(i+Math.floor(R()*5))%5],0xf6d04a,x,0.2,z-0.21+i*0.14,0.06);},
  barrel:(p,x,z)=>{p.push(PG(CYL12,0x8a5a34,0x6a4428,x,0.2,z,0,0,0,0.34,0.4,0.34),P(CYL12,0x4a4a4a,x,0.08,z,0,0,0,0.355,0.03,0.355),P(CYL12,0x4a4a4a,x,0.32,z,0,0,0,0.355,0.03,0.355),P(CYL12,0x5a8ab0,x,0.4,z,0,0,0,0.28,0.01,0.28));},
  bike:(p,x,z,R)=>{const c=pickR([0xd8453a,0x4a7ab8,0x6ab85a,0xe8b040]);for(const dz of [-0.2,0.2])p.push(P(CYL12,0x2a2a30,x,0.17,z+dz,0,0,1.571,0.32,0.03,0.32),P(CYL12,0xc8c8cc,x,0.17,z+dz,0,0,1.571,0.06,0.04,0.06));
    limb3(p,c,[x,0.17,z-0.2],[x,0.3,z],0.018);limb3(p,c,[x,0.3,z],[x,0.17,z+0.2],0.018);limb3(p,c,[x,0.3,z],[x,0.42,z-0.08],0.018);limb3(p,c,[x,0.3,z],[x,0.44,z+0.16],0.018);
    p.push(P(BOX,0x3a3028,x,0.45,z-0.09,0,0,0,0.06,0.03,0.12),P(BOX,0x3a3028,x,0.46,z+0.17,0,0,0,0.2,0.02,0.02),P(BOX,0xc8a062,x,0.38,z+0.24,0,0,0,0.14,0.08,0.1));},
  mail:(p,x,z,R)=>{const c=pickR([0xd8453a,0x4a7ab8,0x6ab85a,0xf6d04a,0x8a6ad0]);p.push(P(BOX,0x7a5a3a,x,0.26,z,0,0,0,0.05,0.52,0.05),P(BOX,c,x,0.56,z,0,0,0,0.14,0.14,0.24),P(CYL8,c,x,0.63,z,1.571,0,0,0.14,0.24,0.14),P(BOX,0xd8453a,x+0.08,0.66,z-0.06,0,0,0,0.02,0.1,0.06));},
  rain:(p,x,z)=>{p.push(PG(CYL12,0x6a8a9a,0x4a6a7a,x,0.22,z,0,0,0,0.34,0.44,0.34),P(CYL12,0x3a4a5a,x,0.45,z,0,0,0,0.36,0.03,0.36),P(CYL12,0x7ab4d8,x,0.44,z,0,0,0,0.3,0.01,0.3));}};
