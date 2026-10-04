/* =========================================================
   Every neighbour's house a little different (houseVariance, called after a villager house is built in 55-town).
   - Colour: each house picks one of a few schemes for its style, by recolouring the style's own walls, roof, door
     and trim (swapCols matches a colour and its lighter or darker shades, so planks and brick courses follow). The
     storybook cottage (villager homes on a wild island) picks a wall colour, a door colour, and maybe shutters, a
     striped porch awning over the door or ivy climbing a corner.
   - Yard: two or three little extras round the sides and corners, different for each house: a potted plant, a small
     blossom or fruit tree, a bench, a lamp post, a washing line, a log pile, a bird bath, a flower bed, a barrel, a
     bicycle, a mailbox, a rain barrel.
   All of it is seeded by the house number and the world, so each house always looks the same.
   ========================================================= */
// recolour parts from s0 on: any part whose colour is `from` (or a uniform shade of it) becomes `to`, shade kept
function swapCols(p,s0,map){const ent=Object.entries(map).map(([a,b])=>[new T.Color(+a),new T.Color(b)]);const c=new T.Color();
  for(let i=s0;i<p.length;i++){const q=p[i];for(const k of ['color','c2']){if(q[k]===undefined)continue;c.set(q[k]);
    for(const [a,b] of ent){const r=[c.r/Math.max(a.r,1e-3),c.g/Math.max(a.g,1e-3),c.b/Math.max(a.b,1e-3)],m=(r[0]+r[1]+r[2])/3;
      if(m>0.84&&m<1.16&&Math.abs(r[0]-m)<0.03&&Math.abs(r[1]-m)<0.03&&Math.abs(r[2]-m)<0.03){q[k]=new T.Color(b).multiplyScalar(m).getHex();break;}}}}}
const HOUSE_SCHEMES={
  sailor:[{},{0x7a98b0:0xc8a0a0,0x3e5064:0x6a3a3a,0x2f4f7a:0x6a3a3a},{0x7a98b0:0x8ab4a4,0x3e5064:0x3a5a4a,0x2f4f7a:0x2a5a4a},{0x7a98b0:0xd8c8a0,0x3e5064:0x8a5a3a,0x2f4f7a:0xc8604a}],
  dreamer:[{},{0xf4ecdc:0xf4dce2,0x8a7ac8:0xd86a8a},{0xf4ecdc:0xe0f0e4,0x8a7ac8:0x4a9a8a},{0xf4ecdc:0xf8ecc4,0x8a7ac8:0x5a7ad8}],
  tinkerer:[{},{0xb86a4a:0x8a8a9a,0xa05a3e:0x74748a,0x8aa0a8:0xb8603a},{0xb86a4a:0x7a9a6a,0xa05a3e:0x648a58,0x8aa0a8:0x8a6a4a},{0xb86a4a:0xd8c0a0,0xa05a3e:0xc0a888,0x8aa0a8:0x4a6a8a}],
  homebody:[{},{0xd8604a:0x4a7ab8,0xa84a3a:0x3a5a90},{0xd8604a:0xe8b040,0xa84a3a:0xb88a30},{0xd8604a:0x8a5ad0,0xa84a3a:0x6a44a8}],
  explorer:[{},{0x6a8a5a:0x8a5a3a,0xd86a3a:0x3a7aa8},{0x6a8a5a:0x4a5a7a,0xd86a3a:0x6aa84a},{0x6a8a5a:0xa84a3a,0xd86a3a:0xe8b040}],
  scholar:[{},{0x3a4a6a:0x5a3a2a,0xd8453a:0x3a6a8a,0x6a3a3a:0x2a4a6a},{0x3a4a6a:0x3a5a3a,0xd8453a:0xe8a040,0x6a3a3a:0x3a5a3a},{0x3a4a6a:0x6a3a5a,0xd8453a:0x8a5ac8,0x6a3a3a:0x5a3a6a}]};
const COTTAGE_WALLS=[0xf3e6cc,0xa8c4e0,0xb4cc9c,0xe8a8a0,0xf0d488,0xc4b4e0,0xf0b888,0xf6f2ea],COTTAGE_DOORS=[0x8a5a3a,0x4a6a8a,0x5a7a4a,0xa84a4a,0x3a3a44,0xd8a040,0x6a4a8a];
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
const YARD_KEYS=Object.keys(YARD);
function houseVariance(kind,n,p,gl,s0){const R=mulberry(hi(n+1,977,(S.worldSeed|0)%100003));for(let i=0;i<4;i++)R();/* (the first draws of nearby seeds are alike) */
  if(kind==='cottage'){const wall=COTTAGE_WALLS[Math.floor(R()*COTTAGE_WALLS.length)],door=COTTAGE_DOORS[Math.floor(R()*COTTAGE_DOORS.length)];swapCols(p,s0,{0xf3e6cc:wall,0x8a5a3a:door});
    if(R()<0.6)for(const sx of [-1,1])p.push(P(BOX,door,0.38+sx*0.25,0.58,0.67,0,0,0,0.08,0.34,0.03),P(BOX,new T.Color(door).multiplyScalar(0.8).getHex(),0.38+sx*0.25,0.58,0.69,0,0,0,0.05,0.28,0.01));/* shutters */
    if(R()<0.45){const c=pickR([0xd8453a,0x4a7ab8,0x6ab85a,0xe8b040,0x8a6ad0]);for(let i=0;i<5;i++)p.push(P(BOX,i%2?0xfbf8f0:c,-0.3-0.2+i*0.1,0.86,0.78,0.5,0,0,0.1,0.02,0.3));/* a striped porch awning */}
    else if(R()<0.4)for(let i=0;i<12;i++){const t=i/12;lf(p,[0x4f9a3a,0x3a7a30,0x6ab84a][i%3],-0.76+Math.sin(i*2.3)*0.04,0.1+t*0.95,0.64,i*1.3,0.3,0.14,0.08);}/* ivy up the corner */}
  else if(HOUSE_SCHEMES[kind]){const sc=HOUSE_SCHEMES[kind][Math.floor(R()*HOUSE_SCHEMES[kind].length)];swapCols(p,s0,sc);}
  // the yard: two or three extras round the sides and back corners (and a mailbox at the front side)
  const slots=kind==='cottage'?[[-0.92,-0.25],[0.92,-0.2],[-0.86,-0.86],[0.86,-0.86],[0.86,0.88]]:[[-0.98,-0.1],[0.98,-0.1],[-0.86,-0.88],[0.86,-0.88]];
  const keys=YARD_KEYS.slice(),n2=2+(R()<0.5?1:0);for(let i=0;i<n2&&slots.length;i++){const s=slots.splice(Math.floor(R()*slots.length),1)[0],k=keys.splice(Math.floor(R()*keys.length),1)[0];YARD[k](p,s[0],s[1],R,gl);}}
