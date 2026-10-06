/* =========================================================
   Every island worth the trip: what only it has.
   Each kind of island (its biome, or its frontier style) has
   - a material that grows only there (ISLE_X[kind].mat), on a few nodes round the island (an old stump with amber in
     it, a wild bee skep, a maple with a tap, an ice crystal, an obsidian outcrop, glowcaps…). Tap one to gather it; it
     regrows after a day (S.isleNodes[id] = the day each node was picked).
   - a landmark (ISLE_X[kind].mark) somewhere on the land: a shipwreck, a hermit's cabin, a giant hollow oak, a frozen
     statue, an ancient forge, a sunken shrine, a fairy ring, a crystal geode, a gingerbread hut… Find it and open its
     chest (once: S.isleMarks[id]) for a haul of the island's material, shells and something rare.
   - its own decor set (ISLE_SETS), made at the Workbench only from that material: pieces nobody else's island has.
   Landing on an island tells you what it holds; the chart's island card lists it too (isleBlurb).
   ========================================================= */
const ISLE_X={
  meadow:{mat:'honey',node:'skep',mark:'fairyring',markN:'a fairy ring'},
  tropic:{mat:'coconut',node:'coconuts',mark:'wreck',markN:'a shipwreck'},
  pine:{mat:'amber',node:'amberstump',mark:'cabin',markN:'a hermit’s cabin'},
  autumn:{mat:'syrup',node:'maple',mark:'hollowoak',markN:'a giant hollow oak'},
  snow:{mat:'ice',node:'icecrystal',mark:'frozen',markN:'a frozen statue'},
  volcano:{mat:'obsidian',node:'obsidian',mark:'forge',markN:'an ancient forge'},
  swamp:{mat:'glowcap',node:'glowcaps',mark:'shrine',markN:'a sunken shrine'},
  crystal:{mat:'prism',node:'prism',mark:'geode',markN:'a giant geode'},
  shroom:{mat:'spore',node:'spore',mark:'shroomhouse',markN:'a mushroom house'},
  candy:{mat:'sugar',node:'sugar',mark:'ginger',markN:'a gingerbread hut'},
  bloom:{mat:'pollen',node:'pollen',mark:'giantbloom',markN:'a giant flower'},
  coral:{mat:'pinkcoral',node:'pinkcoral',mark:'coralarch',markN:'a coral arch'},
  neon:{mat:'neon',node:'neon',mark:'monolith',markN:'a neon monolith'}};
Object.assign(MATS,{
  honey:{name:'Wild Honey',price:30,desc:'Golden honey from wild bee skeps on meadow islands.'},coconut:{name:'Coconut',price:30,desc:'From the palm groves of tropical islands.'},
  amber:{name:'Amber',price:40,desc:'Old resin, glowing like honey, from pine island stumps.'},syrup:{name:'Maple Syrup',price:35,desc:'Tapped from the maples of autumn islands.'},
  ice:{name:'Ice Crystal',price:40,desc:'Never melts. From the snowy islands.'},obsidian:{name:'Obsidian',price:45,desc:'Black volcanic glass, from the volcanic islands.'},
  glowcap:{name:'Glowcap',price:40,desc:'A softly glowing mushroom from the swamp islands.'},prism:{name:'Prism Shard',price:80,desc:'A rainbow crystal from the crystal isles of Strange Waters.'},
  spore:{name:'Giant Spore',price:70,desc:'From the mushroom isles of Strange Waters.'},sugar:{name:'Rock Sugar',price:70,desc:'Sweet crystals from the candy isles.'},
  pollen:{name:'Golden Pollen',price:70,desc:'From the giant flowers of the bloom isles.'},pinkcoral:{name:'Pink Coral',price:70,desc:'From the coral isles.'},
  neon:{name:'Neon Shard',price:120,desc:'It hums. From the neon isles of the Weird Sea.'}});
const isleKindOf=isl=>{if(!isl||isl.home)return null;if(isl.style&&ISLE_X[isl.style])return isl.style;if(isl.style&&FSTY[isl.style]&&FSTY[isl.style].like)return FSTY[isl.style].like;return ISLE_X[isl.biome]?isl.biome:'meadow';};
// ---- the decor sets: one or two pieces per island kind, made only from its material
const ISLE_SETS={
  meadow:[['beeskep','Bee Skep','A straw bee skep on a little stand.',{'m:honey':4,'m:fiber':4}],['wildarch','Wildflower Arch','An arch woven with wildflowers.',{'m:honey':2,'m:wood':6,'m:fiber':6}]],
  tropic:[['tikitorch','Tiki Torch','A bamboo torch with a flickering flame.',{'m:coconut':2,'m:wood':4}],['surfboard','Surfboard','A painted surfboard stood in the sand.',{'m:coconut':3,'m:wood':6}]],
  pine:[['amberlamp','Amber Lantern','Light glowing through amber.',{'m:amber':3,'m:stone':3}],['totem','Carved Totem','A tall totem of carved pine.',{'m:amber':2,'m:wood':10}]],
  autumn:[['jacklamp','Pumpkin Lantern','A carved pumpkin with a candle inside.',{'m:syrup':2,'m:fiber':3}],['leafwreath','Harvest Wreath','Autumn leaves and berries on a stand.',{'m:syrup':2,'m:wood':3,'m:fiber':4}]],
  snow:[['icesculpt','Ice Sculpture','A swan carved from ice that never melts.',{'m:ice':5}],['snowglobe','Snow Globe Lamp','A glowing globe of swirling snow.',{'m:ice':3,'m:stone':2}]],
  volcano:[['obelisk','Obsidian Obelisk','A tall black obelisk, glassy and sharp.',{'m:obsidian':5,'m:stone':4}],['lavalamp','Lava Lamp','A lamp of warm, slow-rising light.',{'m:obsidian':3,'m:stone':2}]],
  swamp:[['glowlamp','Glowcap Lamp','A cluster of glowing mushrooms in a jar.',{'m:glowcap':3,'m:stone':2}],['frogstatue','Frog Statue','A mossy stone frog, very wise.',{'m:glowcap':2,'m:stone':6}]],
  crystal:[['crystalspire','Crystal Spire','A spire of rainbow crystal.',{'m:prism':4}]],shroom:[['shroomlamp','Spore Lamp','A giant toadstool that glows at night.',{'m:spore':3,'m:wood':2}]],
  candy:[['candycane','Candy Cane','A giant striped candy cane.',{'m:sugar':3}],['gumdrop','Gumdrop Tree','A little tree hung with gumdrops.',{'m:sugar':4,'m:wood':2}]],
  bloom:[['petalseat','Petal Seat','A seat made from a giant petal.',{'m:pollen':3,'m:fiber':4}]],coral:[['coralarch','Coral Arch','A little arch of pink coral.',{'m:pinkcoral':5}]],
  neon:[['neonsign','Neon Sign','A buzzing neon sign shaped like a star.',{'m:neon':2,'m:stone':4}]]};
const ISLE_DECOR=new Set();
for(const [kind,list] of Object.entries(ISLE_SETS))for(const [k,name,desc,inp] of list){BUILD[k]={name,cost:0,lvl:1,craft:true,rot:true,desc:desc+' (Only from '+MATS[ISLE_X[kind].mat].name.toLowerCase()+'.)'};OBJ_H[k]=0.9;ISLE_DECOR.add(k);RECIPES.push({out:['b',k,1],in:inp,lvl:1});}

// ---- icons for the materials
(function(){const mk=f=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.lineJoin=x.lineCap='round';f(x);return c.toDataURL();};
  const gem=(x,c1,c2,n=6)=>{x.fillStyle=c1;x.strokeStyle=c2;x.lineWidth=2.5;x.beginPath();for(let i=0;i<n;i++){const a=i/n*6.283-1.57,r=i%2?16:24;x.lineTo(32+Math.cos(a)*r,34+Math.sin(a)*r);}x.closePath();x.fill();x.stroke();x.fillStyle='rgba(255,255,255,.55)';x.beginPath();x.moveTo(26,22);x.lineTo(32,14);x.lineTo(34,26);x.closePath();x.fill();};
  const blob=(x,c1,c2,rx=20,ry=18)=>{const g=x.createRadialGradient(26,26,3,32,34,26);g.addColorStop(0,'#fff');g.addColorStop(0.3,c1);g.addColorStop(1,c2);x.fillStyle=g;x.beginPath();x.ellipse(32,35,rx,ry,0,0,6.283);x.fill();x.strokeStyle='rgba(40,30,20,.4)';x.lineWidth=2;x.stroke();};
  const D={honey:x=>{x.fillStyle='#e8a830';x.strokeStyle='#8a5a1a';x.lineWidth=2.5;x.beginPath();x.moveTo(18,22);x.lineTo(46,22);x.lineTo(44,56);x.lineTo(20,56);x.closePath();x.fill();x.stroke();x.fillStyle='#f6d070';x.fillRect(16,14,32,9);x.strokeRect(16,14,32,9);x.fillStyle='#fff3c0';x.fillRect(22,28,5,20);},
    coconut:x=>{blob(x,'#8a5a34','#4a2e1a',20,20);x.fillStyle='#2a1a10';for(const [a,b] of [[27,30],[37,30],[32,38]]){x.beginPath();x.arc(a,b,3,0,6.283);x.fill();}},
    amber:x=>blob(x,'#f0a838','#a8581a',18,22),syrup:x=>{x.fillStyle='#b8601a';x.strokeStyle='#5a2a0a';x.lineWidth=2.5;x.beginPath();x.moveTo(24,8);x.lineTo(40,8);x.lineTo(40,20);x.quadraticCurveTo(50,26,48,40);x.quadraticCurveTo(46,58,32,58);x.quadraticCurveTo(18,58,16,40);x.quadraticCurveTo(14,26,24,20);x.closePath();x.fill();x.stroke();x.fillStyle='#f6e8c8';x.fillRect(22,34,20,12);x.fillStyle='#d84a2a';x.beginPath();x.moveTo(32,36);x.lineTo(36,42);x.lineTo(28,42);x.closePath();x.fill();},
    ice:x=>gem(x,'#bfe8f8','#5a9ac0'),obsidian:x=>gem(x,'#3a3044','#120c18',5),glowcap:x=>{x.fillStyle='#e8f0d8';x.fillRect(28,34,8,20);x.fillStyle='#7af0c0';x.beginPath();x.ellipse(32,32,20,13,0,3.14,6.283);x.fill();x.fillStyle='#d8fff0';for(const [a,b] of [[24,26],[36,24],[42,30]]){x.beginPath();x.arc(a,b,3,0,6.283);x.fill();}},
    prism:x=>{gem(x,'#f0b8f0','#8a5ab8');x.globalAlpha=0.5;x.fillStyle='#8ae0f0';x.beginPath();x.moveTo(32,10);x.lineTo(50,40);x.lineTo(32,58);x.closePath();x.fill();x.globalAlpha=1;},
    spore:x=>{x.fillStyle='#f4ece0';x.fillRect(28,34,8,20);x.fillStyle='#a87ad8';x.beginPath();x.ellipse(32,32,22,15,0,3.14,6.283);x.fill();x.fillStyle='#f6e8ff';for(const [a,b] of [[22,26],[34,22],[42,28]]){x.beginPath();x.arc(a,b,3.5,0,6.283);x.fill();}},
    sugar:x=>gem(x,'#ffc8e0','#d06a9a',8),pollen:x=>{for(let i=0;i<7;i++){x.fillStyle=i%2?'#f6d040':'#f8e070';x.beginPath();x.arc(32+Math.cos(i)*12*(i?1:0),34+Math.sin(i)*12*(i?1:0),9,0,6.283);x.fill();}},
    pinkcoral:x=>{x.strokeStyle='#f07aa0';x.lineWidth=7;for(const [a,b,c,d] of [[32,58,32,30],[32,40,20,20],[32,36,44,16],[22,26,14,18],[42,22,50,12]]){x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke();}},
    neon:x=>{x.shadowColor='#e040ff';x.shadowBlur=10;gem(x,'#b060ff','#ff40d0',4);}};
  for(const [k,f] of Object.entries(D))try{Object.defineProperty(ICON,'m:'+k,{value:mk(f),writable:true,configurable:true,enumerable:true});}catch(e){}})();

// ---- models: the nodes (whole and picked), the landmarks, the decor sets
function nodeParts(kind,full,R){const p=[],gl=[],X=ISLE_X[kind]||ISLE_X.meadow,n=X.node;
  switch(n){
    case'skep':p.push(P(CYL8,0x6a4a30,0,0.15,0,0,0,0,0.38,0.3,0.38));if(full){for(let i=0;i<4;i++)p.push(PG(CYL12,0xe0b860,0xb88a3a,0,0.34+i*0.08,0,0,0,0,0.36-i*0.07,0.08,0.36-i*0.07));p.push(P(CYL8,0x3a2a1a,0,0.36,0.17,1.57,0,0,0.06,0.02,0.06));for(let i=0;i<3;i++)p.push(P(SPH_XS,0xf6d040,0.2-i*0.1,0.6+i*0.05,0.15,0,0,0,0.04,0.03,0.04));}break;
    case'coconuts':if(full)for(let i=0;i<4;i++)p.push(PG(SPH,0x8a5a34,0x4a2e1a,(i%2-0.5)*0.22,0.1+(i>2?0.12:0),(i<2?-0.08:0.1),0,0,0,0.2,0.2,0.2));else p.push(P(SPH,0x6a4a30,0,0.04,0,0,0,0,0.2,0.06,0.18));p.push(P(BOX,0x5a8a3a,0.15,0.03,0.2,0,0.6,0,0.3,0.02,0.08));break;
    case'amberstump':p.push(PG(CYL8,0x8a6a44,0x5a4430,0,0.17,0,0,0,0,0.42,0.34,0.42),P(CYL8,0xc8a878,0,0.345,0,0,0,0,0.38,0.01,0.38));if(full)for(let i=0;i<3;i++)gl.push(P(ICO,0xf0a838,Math.cos(i*2)*0.15,0.36+i*0.04,Math.sin(i*2)*0.15,0,i,0,0.1,0.12,0.1));break;
    case'maple':p.push(P(CYL8,0x6a4a30,0,0.4,0,0,0,0,0.14,0.8,0.14),PG(SPH_LO,0xe86a3a,0xb03a1a,0,0.95,0,0,0,0,0.7,0.55,0.7),P(CYL8,0x8a8e94,0,0.36,0.1,1.57,0,0,0.03,0.08,0.03));if(full)p.push(P(CYL12,0x9aa0a8,0,0.28,0.16,0,0,0,0.12,0.14,0.12),P(CYL12,0xb8601a,0,0.34,0.16,0,0,0,0.1,0.01,0.1));break;
    case'icecrystal':case'prism':{const c=n==='ice'||n==='icecrystal'?[0x9ad4f0,0x5a8ac8]:[0xe08ae8,0x7a5ad0];for(let i=0;i<(full?5:2);i++){const a=i*1.3,h=full?0.4+(i%3)*0.18:0.12;p.push(PG(CONE4,c[0],c[1],Math.cos(a)*0.12,h/2,Math.sin(a)*0.12,Math.sin(a)*0.3,a,Math.cos(a)*0.3,0.14,h,0.14));}break;}
    case'obsidian':for(let i=0;i<(full?4:2);i++){const a=i*1.6;p.push(PG(ICO0,0x3a3044,0x120c18,Math.cos(a)*0.14,0.12+(full?i%2*0.1:0),Math.sin(a)*0.14,a,a,0,0.24,full?0.34:0.12,0.22));}if(full)gl.push(P(ICO0,0xff6a2a,0,0.05,0,0,0,0,0.14,0.04,0.14));break;
    case'glowcaps':case'spore':{const cc=n==='spore'?0x9a5ad8:0x3ad8a0;for(let i=0;i<(full?4:1);i++){const a=i*1.7,s=full?0.7+(i%2)*0.4:0.5,x=Math.cos(a)*0.15,z=Math.sin(a)*0.15;p.push(P(CYL8,0xf4ece0,x,0.1*s,z,0,0,0,0.06*s,0.2*s,0.06*s));gl.push(P(SPH_LO,cc,x,0.22*s,z,0,0,0,0.26*s,0.14*s,0.26*s));}break;}
    case'sugar':for(let i=0;i<(full?3:1);i++)p.push(P(ICO0,[0xf88ab8,0x7ac8f0,0xf6d04a][i],(i-1)*0.16,0.14+(i===1?0.06:0),0,i,i,0,0.24,0.26,0.24));break;
    case'pollen':p.push(P(CYL8,0x5a9a3a,0,0.35,0,0,0,0,0.06,0.7,0.06));if(full){for(let i=0;i<8;i++){const a=i/8*6.283;p.push(P(SPH_LO,0xf8e070,Math.cos(a)*0.2,0.72,Math.sin(a)*0.2,0,a,0,0.24,0.06,0.14));}gl.push(P(SPH_LO,0xf6c030,0,0.74,0,0,0,0,0.18,0.08,0.18));}break;
    case'pinkcoral':for(let i=0;i<(full?5:2);i++){const a=i*1.25;p.push(P(CYL6,0xf07aa0,Math.cos(a)*0.08,0.18,Math.sin(a)*0.08,Math.sin(a)*0.5,0,Math.cos(a)*0.5,0.05,full?0.4:0.12,0.05));}break;
    case'neon':for(let i=0;i<(full?3:1);i++)gl.push(P(CONE4,i%2?0xff40d0:0x9a60ff,(i-1)*0.14,full?0.28:0.08,0,0,i,0.2*(i-1),0.14,full?0.56:0.14,0.14));p.push(P(CYL8,0x1e1a2a,0,0.03,0,0,0,0,0.5,0.06,0.5));break;}
  return{p,gl};}
function markParts(kind,R){const p=[],gl=[],X=ISLE_X[kind]||ISLE_X.meadow;
  const chest=(x,z,ry=0)=>{const q=[P(BOX,0x8a5a34,0,0.14,0,0,0,0,0.42,0.26,0.3),PG(CYL12,0x9a6a3e,0x6e4a2a,0,0.27,0,0,0,1.5708,0.3,0.42,0.3),P(BOX,0xd8b050,0,0.14,0,0,0,0,0.44,0.04,0.32),P(BOX,0xd8b050,0,0.2,0.155,0,0,0,0.08,0.08,0.02)];p.push(...shift(q,x,0,z,ry));};
  switch(X.mark){
    case'fairyring':for(let i=0;i<9;i++){const a=i/9*6.283;p.push(PG(SPH_LO,0xa8a49c,0x7a7670,Math.cos(a)*1.3,0.3,Math.sin(a)*1.3,0,a,0,0.28,0.65,0.28));if(i%2)p.push(P(CYL8,0xf4ece0,Math.cos(a+0.35)*1.05,0.08,Math.sin(a+0.35)*1.05,0,0,0,0.05,0.16,0.05),P(SPH_LO,0xe8403a,Math.cos(a+0.35)*1.05,0.18,Math.sin(a+0.35)*1.05,0,0,0,0.2,0.1,0.2));}for(let i=0;i<6;i++)gl.push(P(SPH_XS,0xfff6c0,Math.cos(i)*0.5,0.5+i*0.08,Math.sin(i*1.7)*0.5,0,0,0,0.05,0.05,0.05));chest(0,0);break;
    case'wreck':{const q=[];q.push(PG(SPH_LO,0x7a5234,0x4a3020,0,0.35,0,0,0,0,1.0,0.7,2.4),P(BOX,0x6a4428,0,0.62,0,0,0,0,0.9,0.06,2.0));for(let i=0;i<6;i++)q.push(P(BOX,0x5a3a24,0.48,0.42,-0.9+i*0.36,0,0,0.3,0.04,0.5,0.3));q.push(P(CYL8,0x6a4a30,0,1.2,0.2,0.15,0,0.12,0.08,1.6,0.08),P(BOX,0xe8dcc0,0.1,1.4,0.25,0,0,0.12,0.03,0.8,0.7),P(BOX,0x4a3020,0,0.3,-1.25,0.6,0,0,0.7,0.4,0.3));p.push(...shift(q,0,0,0,0.6));p[0].rz=0.2;chest(1.1,0.8,-0.4);break;}
    case'cabin':{for(let i=0;i<6;i++){p.push(P(CYL8,0x8a5a34,0,0.1+i*0.17,0.55,0,0,1.5708,0.16,1.3,0.16),P(CYL8,0x7a4a2a,0,0.1+i*0.17,-0.55,0,0,1.5708,0.16,1.3,0.16),P(CYL8,0x8a5a34,0.6,0.1+i*0.17,0,1.5708,0,0,0.16,1.2,0.16),P(CYL8,0x7a4a2a,-0.6,0.1+i*0.17,0,1.5708,0,0,0.16,1.2,0.16));}
      p.push(P(PRISM,0x4a5a3a,0,1.05+0.25,0,0,0,0,1.6/1.732,0.75/1.5,1.5),P(BOX,0x3a2a1a,0,0.35,0.64,0,0,0,0.36,0.6,0.04),P(BOX,0x6a6a6a,0.4,1.4,-0.2,0,0,0,0.22,0.6,0.22));gl.push(P(BOX,0xffd890,-0.35,0.6,0.64,0,0,0,0.24,0.2,0.02));chest(0.9,0.8,-0.3);break;}
    case'hollowoak':{p.push(PG(CYL12,0x7a5a3a,0x4a3420,0,1.0,0,0,0,0,1.3,2.0,1.3),P(BOX,0x2a1a10,0,0.45,0.6,0,0,0,0.5,0.8,0.12),P(A_HALF,0x2a1a10,0,0.85,0.62,0,0,0,0.5,0.5,0.12));
      for(let i=0;i<7;i++){const a=i*0.9;p.push(PG(SPH_LO,i%2?0xe8803a:0xd8602a,0xa8401a,Math.cos(a)*1.0,2.4+Math.sin(i)*0.3,Math.sin(a)*1.0,0,0,0,1.5,1.1,1.5));}for(let i=0;i<4;i++){const a=i*1.57+0.4;p.push(P(CYL8,0x5a4030,Math.cos(a)*0.75,0.1,Math.sin(a)*0.75,Math.sin(a)*1.2,0,-Math.cos(a)*1.2,0.18,0.9,0.18));}chest(0,0.45,0);break;}
    case'frozen':{p.push(PG(CYL12,0xc8d4e0,0x9aa6b8,0,0.15,0,0,0,0,1.2,0.3,1.2));p.push(PG(SPH_LO,0xa8d8f4,0x6aa0d0,0,0.8,0,0,0,0,0.7,0.9,0.6),PG(SPH_LO,0xa8d8f4,0x6aa0d0,0,1.4,0.15,0,0,0,0.45,0.45,0.45),PG(CONE4,0xc0e4f8,0x6aa0d0,0.3,0.9,0,0,0,-0.6,0.15,0.7,0.15),PG(CONE4,0xc0e4f8,0x6aa0d0,-0.3,0.9,0,0,0,0.6,0.15,0.7,0.15));chest(0.9,0.6,-0.4);break;}
    case'forge':{for(let i=0;i<8;i++){const a=i/8*6.283;p.push(PG(BOX,0x6a6068,0x3a3238,Math.cos(a)*0.6,0.5,Math.sin(a)*0.6,0,-a,0,0.45,1.0,0.3));}p.push(P(CONE8,0x4a4048,0,1.3,0,0,0,0,1.4,0.6,1.4),P(CYL8,0x4a4048,0,1.9,0,0,0,0,0.3,0.8,0.3),P(BOX,0x3a3238,0.9,0.35,0.3,0,0,0,0.5,0.5,0.5));gl.push(P(CYL12,0xff7a2a,0,1.02,0,0,0,0,0.9,0.05,0.9),P(BOX,0xffa040,0,0.4,0.62,0,0,0,0.4,0.3,0.02));chest(-0.9,0.9,0.3);break;}
    case'shrine':{p.push(PG(BOX,0x7a8a6a,0x4a5a40,0,0.35,0,0,0,0,1.2,0.7,1.0),P(PRISM,0x5a6a4a,0,0.7+0.17,0,0,0,0,1.4/1.732,0.5/1.5,1.2),P(BOX,0x3a4a30,0,0.35,0.51,0,0,0,0.4,0.5,0.02));for(let i=0;i<5;i++)p.push(P(SPH_LO,0x4a7a3a,(i-2)*0.25,0.75+(i%2)*0.1,0.45,0,0,0,0.3,0.15,0.2));
      for(const s of [-1,1]){p.push(P(BOX,0x8a9a7a,s*0.9,0.4,0.5,0,0,0,0.16,0.8,0.16));gl.push(P(SPH_XS,0x9af0c0,s*0.9,0.9,0.5,0,0,0,0.16,0.16,0.16));}chest(0,1.0,0);break;}
    case'geode':{p.push(PG(SPH_LO,0x7a6a8a,0x4a3a5a,0,0.5,0,0,0,0,1.6,1.1,1.4),P(SPH_LO,0x2a2030,0,0.55,0.35,0,0,0,1.1,0.8,0.8));for(let i=0;i<9;i++){const a=i*0.7;gl.push(P(CONE4,[0xf0b8f0,0x8ae0f0,0xc8a8ff][i%3],Math.cos(a)*0.35,0.55+Math.sin(a)*0.25,0.55,0.3,a,0,0.14,0.4,0.14));}chest(1.1,0.7,-0.4);break;}
    case'shroomhouse':{p.push(PG(CYL12,0xf4ece0,0xd8ccb8,0,0.55,0,0,0,0,0.9,1.1,0.9),P(BOX,0x6a4a30,0,0.35,0.44,0,0,0,0.3,0.5,0.03));gl.push(P(CYL12,0xfff0b8,0.28,0.7,0.42,1.57,0,0,0.16,0.02,0.16));p.push(PG(SPH_LO,0xa87ad8,0x7a4ab0,0,1.25,0,0,0,0,2.0,0.9,2.0));for(let i=0;i<6;i++){const a=i*1.05;p.push(P(SPH_LO,0xf6e8ff,Math.cos(a)*0.6,1.55,Math.sin(a)*0.6,0,0,0,0.25,0.1,0.25));}chest(1.0,0.6,-0.3);break;}
    case'ginger':{p.push(PG(BOX,0xb8743a,0x8a5028,0,0.45,0,0,0,0,1.2,0.9,1.0),P(PRISM,0xf8f4ee,0,0.9+0.22,0,0,0,0,1.4/1.732,0.66/1.5,1.1),P(BOX,0xf06aa0,0,0.35,0.51,0,0,0,0.3,0.5,0.02));for(let i=0;i<6;i++)p.push(P(SPH_XS,[0xf06aa0,0x7ad8f0,0xf6d04a][i%3],-0.5+i*0.2,0.92,0.52,0,0,0,0.08,0.08,0.06));for(const s of [-1,1])p.push(P(CYL8,0xf8f4ee,s*0.75,0.4,0.6,0,0,0,0.06,0.8,0.06),P(CYL8,0xe8403a,s*0.75,0.4,0.6,0,0,0,0.065,0.1,0.065));chest(0,1.0,0);break;}
    case'giantbloom':{p.push(P(CYL8,0x5a9a3a,0,1.0,0,0,0,0.1,0.18,2.0,0.18));for(let i=0;i<10;i++){const a=i/10*6.283;p.push(PG(SPH_LO,0xf6a0c8,0xe070a8,Math.cos(a)*0.7,2.05,Math.sin(a)*0.7,0,a,0,0.9,0.12,0.45));}gl.push(P(SPH_LO,0xf6d040,0,2.1,0,0,0,0,0.6,0.25,0.6));for(const s of [-1,1])p.push(P(SPH_LO,0x5aa040,s*0.5,0.6,0,0,0,s*0.6,0.7,0.1,0.35));chest(0.9,0.7,-0.4);break;}
    case'coralarch':{for(let i=0;i<14;i++){const t=i/13,a=t*Math.PI;p.push(P(SPH_LO,i%2?0xf07aa0:0xf4a0b8,Math.cos(a)*1.0,Math.sin(a)*1.4+0.1,0,0,0,0,0.38,0.38,0.34));}for(let i=0;i<6;i++)p.push(P(CYL6,0xf6c0a0,(i-2.5)*0.3,0.2,0.5,0.3,0,0.2*(i-2.5),0.05,0.4,0.05));chest(0,0.4,0);break;}
    case'monolith':{p.push(P(BOX,0x1e1a2a,0,1.2,0,0,0,0,0.6,2.4,0.3));gl.push(P(BOX,0xff40d0,0,1.2,0.16,0,0,0,0.08,2.0,0.02),P(BOX,0x9a60ff,0,1.6,0.16,0,0,0,0.4,0.06,0.02),P(BOX,0x40f0ff,0,0.8,0.16,0,0,0,0.3,0.06,0.02));chest(0.9,0.6,-0.3);break;}}
  return{p,gl};}
function isleDecorParts(kind,g){if(!ISLE_DECOR.has(kind))return false;const p=[],gl=[];
  switch(kind){
    case'beeskep':p.push(P(CYL8,0x6a4a30,0,0.2,0,0,0,0,0.08,0.4,0.08),P(CYL12,0x8a6a44,0,0.4,0,0,0,0,0.5,0.04,0.5));for(let i=0;i<5;i++)p.push(PG(CYL12,0xe0b860,0xb88a3a,0,0.46+i*0.08,0,0,0,0,0.44-i*0.07,0.08,0.44-i*0.07));p.push(P(CYL8,0x3a2a1a,0,0.48,0.2,1.57,0,0,0.07,0.02,0.07));break;
    case'wildarch':for(let i=0;i<16;i++){const t=i/15,a=t*Math.PI;p.push(P(SPH_LO,GREENS[i%3],Math.cos(a)*0.45,Math.sin(a)*1.1+0.1,0,0,0,0,0.18,0.18,0.14),P(SPH_XS,[0xf2a6c8,0xf6d04a,0xffffff,0xb8a8f2][i%4],Math.cos(a)*0.45,Math.sin(a)*1.1+0.14,0.07,0,0,0,0.09,0.08,0.06));}break;
    case'tikitorch':p.push(P(CYL8,0xc8a060,0,0.55,0,0,0,0,0.06,1.1,0.06),P(CYL8,0x8a6a3a,0,1.12,0,0,0,0,0.14,0.16,0.14));gl.push(P(CONE8,0xffa040,0,1.3,0,0,0,0,0.12,0.24,0.12));for(let i=0;i<3;i++)p.push(P(CYL8,0x6a4a2a,0,0.4+i*0.25,0,0,0,0,0.075,0.03,0.075));break;
    case'surfboard':p.push(PG(SPH_LO,0x4ab8d8,0x2a88b0,0,0.7,0,0.15,0,0,0.42,1.4,0.08),P(BOX,0xf6d04a,0,0.7,0.045,0.15,0,0,0.06,1.2,0.005),P(BOX,0xf06a5a,0,0.9,0.045,0.15,0,0,0.3,0.06,0.005));break;
    case'amberlamp':p.push(P(CYL8,0x4a4048,0,0.1,0,0,0,0,0.3,0.2,0.3),P(CYL8,0x4a4048,0,0.75,0,0,0,0,0.32,0.06,0.32));gl.push(P(ICO,0xf0a838,0,0.48,0,0,0,0,0.3,0.4,0.3));break;
    case'totem':for(let i=0;i<4;i++){const y=0.2+i*0.38,c=[0x9a6a3e,0x8a5a34,0xa87a4a,0x9a6a3e][i];p.push(PG(CYL8,c,lerpHex(c,0x000000,0.3),0,y,0,0,0,0.34,0.38,0.34),P(SPH_XS,0xf6f0e0,0.07,y+0.06,0.16,0,0,0,0.06,0.06,0.03),P(SPH_XS,0xf6f0e0,-0.07,y+0.06,0.16,0,0,0,0.06,0.06,0.03),P(BOX,[0xd8403a,0x3a7ab8,0xf6c840,0x4a9a5a][i],0,y-0.08,0.17,0,0,0,0.14,0.04,0.02));}p.push(P(BOX,0xd8403a,0,1.45,0,0,0,0,0.9,0.08,0.14));break;
    case'jacklamp':p.push(PG(SPH_LO,0xf08a2a,0xc8601a,0,0.2,0,0,0,0,0.5,0.4,0.5),P(CYL6,0x5a8a3a,0,0.44,0,0,0,0,0.05,0.1,0.05));gl.push(P(BOX,0xffd060,0.08,0.24,0.24,0,0,0,0.06,0.06,0.02),P(BOX,0xffd060,-0.08,0.24,0.24,0,0,0,0.06,0.06,0.02),P(BOX,0xffd060,0,0.12,0.25,0,0,0,0.2,0.04,0.02));break;
    case'leafwreath':p.push(P(CYL8,0x6a4a30,0,0.4,0,0,0,0,0.05,0.8,0.05));for(let i=0;i<14;i++){const a=i/14*6.283;p.push(P(SPH_LO,[0xe86a3a,0xd8a030,0xb03a1a][i%3],Math.cos(a)*0.28,0.95+Math.sin(a)*0.28,0,0,0,0,0.14,0.14,0.08));}for(let i=0;i<4;i++)p.push(P(SPH_XS,0x8a1a2a,Math.cos(i*1.6)*0.28,0.95+Math.sin(i*1.6)*0.28,0.06,0,0,0,0.06,0.06,0.06));break;
    case'icesculpt':p.push(P(BOX,0xc8d4e0,0,0.1,0,0,0,0,0.6,0.2,0.4));p.push(PG(SPH_LO,0xb0dcf4,0x9ac8e8,0,0.42,0,0,0,0,0.42,0.3,0.6),P(CYL8,0xa0d0f0,0,0.65,0.14,-0.3,0,0,0.07,0.4,0.07),P(SPH_LO,0xb0dcf4,0,0.86,0.2,0,0,0,0.14,0.12,0.14));for(const s of [-1,1])p.push(P(SPH_LO,0xa0d0f0,s*0.2,0.5,-0.05,0,0,s*0.6,0.08,0.3,0.36));break;
    case'snowglobe':p.push(P(CYL12,0x8a5a34,0,0.1,0,0,0,0,0.36,0.2,0.36));p.push(P(SPH,0xa8d8f0,0,0.42,0,0,0,0,0.5,0.5,0.5));for(let i=0;i<6;i++)p.push(P(SPH_XS,0xffffff,Math.cos(i)*0.12,0.4+(i%3)*0.08,Math.sin(i)*0.12,0,0,0,0.04,0.04,0.04));p.push(P(CONE8,0x3a7a4a,0,0.38,0,0,0,0,0.14,0.2,0.14));break;
    case'obelisk':p.push(P(BOX,0x2a2430,0,0.08,0,0,0,0,0.5,0.16,0.5),PG(BOX,0x3a3044,0x14101a,0,0.7,0,0,0.785,0,0.28,1.1,0.28),P(CONE4,0x3a3044,0,1.38,0,0,0.785,0,0.4,0.26,0.4));gl.push(P(BOX,0xff6a2a,0,0.7,0.141,0,0,0,0.03,0.8,0.005));break;
    case'lavalamp':p.push(P(CONE8,0x3a3044,0,0.1,0,0,0,0,0.3,0.2,0.3),P(CONE8,0x3a3044,0,0.78,0,3.14,0,0,0.22,0.12,0.22));gl.push(PG(CYL12,0xff8a3a,0xd8402a,0,0.45,0,0,0,0,0.26,0.5,0.26),P(SPH_LO,0xffd060,0.03,0.4,0,0,0,0,0.12,0.14,0.12),P(SPH_LO,0xffd060,-0.03,0.6,0,0,0,0,0.1,0.1,0.1));break;
    case'glowlamp':p.push(P(CYL12,0x8ab8a8,0,0.3,0,0,0,0,0.42,0.6,0.42),P(CYL12,0x6a5a40,0,0.62,0,0,0,0,0.44,0.06,0.44));for(let i=0;i<3;i++)gl.push(P(SPH_LO,0x3ad8a0,(i-1)*0.1,0.25+i*0.08,0,0,0,0,0.16,0.1,0.16));break;
    case'frogstatue':p.push(PG(SPH_LO,0x7a8a6a,0x4a5a40,0,0.3,0,0,0,0,0.6,0.5,0.6),PG(SPH_LO,0x7a8a6a,0x4a5a40,0,0.6,0.1,0,0,0,0.44,0.34,0.4));for(const s of [-1,1])p.push(P(SPH_LO,0x8a9a7a,s*0.13,0.75,0.16,0,0,0,0.14,0.14,0.14),P(SPH_XS,0x2a2a2a,s*0.13,0.76,0.22,0,0,0,0.06,0.06,0.04));p.push(P(SPH_LO,0x4a7a3a,0.1,0.82,0,0,0,0,0.2,0.06,0.2));break;
    case'crystalspire':for(let i=0;i<5;i++){const a=i*1.3,h=0.6+(i===0?0.8:(i%3)*0.25);p.push(PG(CONE4,[0xe08ae8,0x5ac8e8,0xa080f0][i%3],0x7a6ab8,i?Math.cos(a)*0.16:0,h/2,i?Math.sin(a)*0.16:0,i?Math.sin(a)*0.25:0,a,i?Math.cos(a)*0.25:0,0.2,h,0.2));}break;
    case'shroomlamp':p.push(P(CYL8,0xf4ece0,0,0.35,0,0,0,0,0.14,0.7,0.14));p.push(PG(SPH_LO,0xb070e0,0x6a3aa8,0,0.78,0,0,0,0,0.8,0.36,0.8));for(let i=0;i<5;i++)gl.push(P(SPH_XS,0xffd0ff,Math.cos(i*1.3)*0.24,0.9,Math.sin(i*1.3)*0.24,0,0,0,0.1,0.04,0.1));break;
    case'candycane':for(let i=0;i<10;i++)p.push(P(CYL8,i%2?0xffffff:0xe8303a,0,0.06+i*0.12,0,0,0,0,0.14,0.12,0.14));for(let i=0;i<6;i++){const a=i/5*Math.PI;p.push(P(SPH_LO,i%2?0xffffff:0xe8303a,Math.cos(a)*0.16-0.16,1.22+Math.sin(a)*0.16,0,0,0,0,0.15,0.15,0.15));}break;
    case'gumdrop':p.push(P(CYL8,0x8a5a34,0,0.35,0,0,0,0,0.08,0.7,0.08),PG(SPH_LO,0x7ad08a,0x4a9a5a,0,0.85,0,0,0,0,0.7,0.6,0.7));for(let i=0;i<9;i++){const a=i*0.7;gl.push(P(SPH_XS,[0xf06aa0,0xf6d04a,0x6ab0f0][i%3],Math.cos(a)*0.32,0.78+(i%3)*0.12,Math.sin(a)*0.32,0,0,0,0.1,0.1,0.1));}break;
    case'petalseat':p.push(P(CYL8,0x5a9a3a,0,0.15,0,0,0,0,0.08,0.3,0.08),PG(SPH_LO,0xf6a0c8,0xe070a8,0,0.32,0,0.2,0,0,0.8,0.14,0.7),PG(SPH_LO,0xf6a0c8,0xe070a8,0,0.62,-0.28,-0.9,0,0,0.7,0.12,0.5));break;
    case'coralarch':for(let i=0;i<10;i++){const t=i/9,a=t*Math.PI;p.push(P(SPH_LO,i%2?0xf07aa0:0xf4a0b8,Math.cos(a)*0.4,Math.sin(a)*0.9+0.1,0,0,0,0,0.22,0.22,0.2));}break;
    case'neonsign':p.push(P(BOX,0x1e1a2a,0,0.6,0,0,0,0,0.06,1.2,0.06),P(BOX,0x2a2438,0,1.1,0,0,0,0,0.7,0.6,0.04));for(let i=0;i<5;i++){const a=i/5*6.283-1.57,b=a+6.283/5;gl.push(P(BOX,i%2?0xff40d0:0x40f0ff,(Math.cos(a)+Math.cos(b))*0.1,1.1+(Math.sin(a)+Math.sin(b))*0.1,0.03,0,0,(a+b)/2,0.03,0.2,0.01));}break;}
  g.add(M(p));if(gl.length)g.add(M(gl,glowMat));return true;}

// ---- placing them on each island (from buildIsland, after its trees and decor)
function isleExtras(isl,g,blocked){const kind=isleKindOf(isl);if(!kind)return;const R=mulberry(isl.seed^0x15e1),X=ISLE_X[kind];
  const free=[...isl.grass,...(kind==='tropic'||kind==='coral'?isl.sand:[])].filter(([x,z])=>!blocked.has(K(x,z))&&!blocked.has(K(x+1,z))&&!blocked.has(K(x,z+1)));const pick=shuffle(free.slice(),R);
  // the landmark: well inland, away from the heart tree
  isl.lmark=null;for(const [x,z] of pick){const d=Math.hypot(x-isl.cx,z-isl.cz);if(d<3||d>islR(isl)*0.7)continue;isl.lmark={x,z};break;}
  if(!isl.lmark&&pick.length)isl.lmark={x:pick[0][0],z:pick[0][1]};
  if(isl.lmark){const {x,z}=isl.lmark,ry=R()*6.28,m=markParts(kind,R);const mg=new T.Group();if(m.p.length)mg.add(M(m.p));if(m.gl.length)mg.add(M(m.gl,glowMat));mg.position.set(x,topY(x,z),z);mg.rotation.y=ry;mg.traverse(o=>{if(o.isMesh)o.castShadow=true;});g.add(mg);
    for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)blocked.add(K(x+dx,z+dz));}
  // the nodes
  isl.nodes=[];const nn=Math.min(isl.grand?8:5,Math.max(3,Math.round(pick.length*0.05)));
  for(const [x,z] of pick){if(isl.nodes.length>=nn)break;if(blocked.has(K(x,z))||isl.nodes.some(n=>Math.abs(n.x-x)<3&&Math.abs(n.z-z)<3))continue;isl.nodes.push({x,z,r:R()*6.28});blocked.add(K(x,z));}
  isl.nodeG=new T.Group();g.add(isl.nodeG);syncNodes(isl);}
function nodeFull(isl,i){const L=(S.isleNodes||{})[isl.id];return !L||L[i]==null||S.day-L[i]>=1;}
function syncNodes(isl){const G=isl.nodeG;if(!G)return;while(G.children.length){const c=G.children.pop();c.traverse(o=>{if(o.geometry)o.geometry.dispose();});}const kind=isleKindOf(isl),R=mulberry(isl.seed);
  isl.nodes.forEach((n,i)=>{const {p,gl}=nodeParts(kind,nodeFull(isl,i),R),ng=new T.Group();if(p.length)ng.add(M(p));if(gl.length)ng.add(M(gl,glowMat));ng.position.set(n.x,topY(n.x,n.z),n.z);ng.rotation.y=n.r;ng.traverse(o=>{if(o.isMesh)o.castShadow=true;});G.add(ng);});}
// ---- tapping: gather from a node, or find the landmark and open its chest
function isleTap(x,z){const isl=islandAt(x,z);if(!isl||isl.home)return false;const kind=isleKindOf(isl),X=ISLE_X[kind];
  const i=(isl.nodes||[]).findIndex(n=>n.x===x&&n.z===z);
  if(i>=0){const n=isl.nodes[i];goTo(n.x+0.6,n.z+0.6,()=>{villager.rotation.y=Math.atan2(n.x-vil.x,n.z-vil.z);
      if(!nodeFull(isl,i)){toast(`Picked clean. ${MATS[X.mat].name} grows back by tomorrow.`,'',ICON['m:'+X.mat]);return;}
      swingTool(()=>{const c=1+(Math.random()<0.4?1:0);gain('m:'+X.mat,c);S.isleNodes=S.isleNodes||{};(S.isleNodes[isl.id]=S.isleNodes[isl.id]||[])[i]=S.day;syncNodes(isl);SFX.pop();sparkle(n.x,topY(n.x,n.z)+0.4,n.z,0xfff0a0);
        floatText(n.x,topY(n.x,n.z)+1,n.z,`+${c} ${MATS[X.mat].name}`);if(!S.isleTip){S.isleTip=1;toast(`<b>${MATS[X.mat].name}</b> only grows on ${islKind(isl).toLowerCase()} islands. Make something from it at the Workbench: the <b>${(ISLE_SETS[kind]||[]).map(s=>s[1]).join('</b> and <b>')}</b>.`,'rare',ICON['m:'+X.mat]);}save();updateHUD();});});return true;}
  const L=isl.lmark;if(L&&Math.abs(L.x-x)<=1&&Math.abs(L.z-z)<=1){goTo(L.x+1.4,L.z+1.4,()=>{villager.rotation.y=Math.atan2(L.x-vil.x,L.z-vil.z);markOpen(isl);});return true;}
  return false;}
function markOpen(isl){const kind=isleKindOf(isl),X=ISLE_X[kind];S.isleMarks=S.isleMarks||{};const name=X.markN.replace(/^an? /,'');
  if(S.isleMarks[isl.id]){toast(`${isl.name}'s ${name}. You've already opened its chest.`);return;}
  S.isleMarks[isl.id]=1;const n=4+Math.floor(Math.random()*3),rare=pickR(['g:pearl','g:geode','g:oldcoin','g:fossil','g:starfrag','g:nautilus','g:amber'].filter(k=>FINDS[k.slice(2)])),sh=300+Math.floor(Math.random()*500)*(isl.fr?2:1);
  gain('m:'+X.mat,n);if(rare)gain(rare);S.shells+=sh;SFX.rare();for(let i=0;i<16;i++)sparkle(vil.x+(Math.random()-0.5),topY(Math.round(vil.x),Math.round(vil.z))+0.6+Math.random()*0.6,vil.z+(Math.random()-0.5),0xffe27a);
  logEvent('island',{name:isl.name+'’s '+name});addXP(25);
  toast(`You found <b>${X.markN}</b> on ${isl.name}! The chest holds ${n} ${MATS[X.mat].name.toLowerCase()}, ${rare?(/^[aeiou]/i.test(nameOf(rare))?'an ':'a ')+nameOf(rare).toLowerCase()+', ':''}and ${fmt(sh)} shells.`,'rare',ICON['m:'+X.mat]);save();updateHUD();}
// what an island holds, for the landing toast and the chart
function isleTag(isl){const kind=isleKindOf(isl);if(!kind)return'';const X=ISLE_X[kind];return `<br>${MATS[X.mat].name} · ${(S.isleMarks||{})[isl.id]?X.markN.replace(/^an? /,'')+' found ✓':'treasure to find'} · ${ecoLine(isl)}`;}
function isleBlurb(isl){const kind=isleKindOf(isl);if(!kind)return'';const X=ISLE_X[kind],seen=(S.isleMarks||{})[isl.id];
  return `${MATS[X.mat].name} grows here${seen?'':`, and somewhere there's ${X.markN}`}. ${ecoBlurb(isl)}`;}
