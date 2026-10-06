/* =========================================================
   Digging: the shovel opens a hole in any open grass on your island, and fills it back in to grass.
   - dig where wild flowers grow and they come up roots and all, into your bag as a clump to plant somewhere else
     (BUILD 'wf<n>', one per wild flower kind and colour in 54b-flora: placed, it's that same clump; S.dugFlora remembers
     where they came from, so the meadow stays dug)
   - dig on a planted crop (after a quick "are you sure") and it's gone, leaving a hole
   - tilled soil with nothing in it is filled straight back to grass (as before)
   Holes are S.holes (tile keys); they hide the grass and flowers there (42-grass) and block tilling, building and
   spawning until filled. Drawn as one merged mesh (syncHoles): a dark pit, a crumbly rim and a heap of dug-out earth.
   ========================================================= */
const isHole=(x,z)=>!!(S.holes&&S.holes[K(x,z)]);
// the wild flowers, as things you can hold and plant: "Pink Tulips", "White Daisies"…
const FLOWER_NAME={tulip:'Tulips',rose:'Roses',cosmos:'Cosmos',pansy:'Pansies',lily:'Lilies',lupine:'Lupins',daisy:'Daisies',crocus:'Crocuses'};
const FLOWER_COL={0xe8453a:'Red',0xf6d04a:'Yellow',0xf2a6c8:'Pink',0xffffff:'White',0x9a6ad0:'Purple',0xd8303a:'Red',0xf8f4ee:'White',0xe86a8a:'Rose',0xf6a830:'Orange',
  0x7a5ad0:'Violet',0x8ac8f0:'Blue',0xf08a2a:'Orange',0x8a6ae0:'Purple',0x6a7ae0:'Blue',0xf6e6f0:'Blush',0xb8a0ee:'Lilac',0xb48ee8:'Lilac',0xf6f2fa:'White',0xf6c440:'Yellow'};
{let i=0;for(const sp in FLOWER_SP)FLOWER_SP[sp].forEach(c=>{const k='wf'+i++;BUILD[k]={name:`${FLOWER_COL[c]||'Wild'} ${FLOWER_NAME[sp]||sp}`,cost:0,lvl:1,craft:true,multi:true,wildflower:1,
  desc:'Wild flowers you dug up with the shovel, roots and all. Plant them wherever you like.'};OBJ_H[k]=0.3;WALK_OVER.add(k);DC_GARDEN.add(k);});}
const WF_MAT=toon({vertexColors:true,side:T.DoubleSide});/* (its own: the meadow's flowerMat is built for instancing) */
// a placed clump: the meadow's own flowers (objGroup's default, 50-objects)
function wildflowerParts(kind,g){if(!/^wf\d+$/.test(kind))return false;const i=+kind.slice(2),geo=FLORA_GEOS[i];if(!geo)return false;
  const m=new T.Mesh(geo.clone(),WF_MAT);m.castShadow=true;m.receiveShadow=true;g.add(m);return true;}

// ---- the holes ----
const holeRoot=new T.Group();scene.add(holeRoot);
function syncHoles(){while(holeRoot.children.length){const c=holeRoot.children.pop();c.geometry.dispose();}
  const p=[],keys=Object.keys(S.holes||{});
  for(const k of keys){const [x,z]=k.split(',').map(Number),y=topY(x,z),R=mulberry(hi(x,z,77)),a=R()*6.28,ca=Math.cos(a),sa=Math.sin(a);
    p.push(P(CYL12,0x3a2818,x,y+0.008,z,0,R()*3,0,0.66,0.02,0.6),P(CYL12,0x22160e,x,y+0.012,z,0,R()*3,0,0.44,0.02,0.4));/* the pit, darker at its heart */
    for(let i=0;i<9;i++){const b=i/9*6.283+R()*0.3,r=0.32+R()*0.04;p.push(P(SPH_LO,i%2?0x6a4a30:0x5a3e28,x+Math.cos(b)*r,y+0.025,z+Math.sin(b)*r*0.92,0,R()*3,0,0.12+R()*0.05,0.05+R()*0.02,0.1+R()*0.04));}/* a crumbly rim */
    p.push(PG(SPH_LO,0x8a6040,0x5a3e28,x+ca*0.36,y+0.05,z+sa*0.36,0,a,0,0.3,0.14,0.22),PG(SPH_LO,0x7a5638,0x553a24,x+ca*0.3-sa*0.14,y+0.03,z+sa*0.3+ca*0.14,0,a,0,0.16,0.09,0.14));}/* the heap dug out of it */
  if(p.length){const m=M(p);m.castShadow=false;m.receiveShadow=true;holeRoot.add(m);}}
// open grass you can put a spade in: not path, soil, buildings, decor, rocks, trees, finds or an old hole
function canDig(x,z){const k=K(x,z);return landMap.get(k)==='grass'&&!TOWN.path.has(k)&&!S.tiles[k]&&!isHole(x,z)&&!objAt(x,z)&&!floorAt(x,z)&&!fixedAt(x,z)&&!debrisAt(x,z)&&!findAt(x,z)&&!weedAt(x,z);}
const floraHere=k=>TOWN.flora&&TOWN.flora.has(k)&&!(S.dugFlora&&S.dugFlora[k])&&!(TOWN.fHid&&TOWN.fHid.get(k));
function digHole(x,z){if(!canDig(x,z))return false;const k=K(x,z),y=topY(x,z);S.holes=S.holes||{};
  if(floraHere(k)){const fk='wf'+floraIndex(x,z);(S.dugFlora||(S.dugFlora={}))[k]=1;S.store[fk]=(S.store[fk]||0)+1;
    floatText(x,y+0.9,z,'+ '+BUILD[fk].name,'gold');for(let i=0;i<8;i++)emit(x,y+0.3,z,{vx:(Math.random()-0.5)*1.4,vy:1.4+Math.random(),vz:(Math.random()-0.5)*1.4,life:0.8,max:0.8,size:0.05,color:pickR([0xf6d04a,0xf2a6c8,0xffffff,0x6ab84a]),g:4});
    if(!S.dugTip){S.dugTip=1;setTimeout(()=>toast(`The <b>${BUILD[fk].name}</b> came up roots and all. They're in your Bag (Decor) to plant wherever you like.`,'',THUMB[fk]),700);}}
  S.holes[k]=1;syncHoles();refreshHomeGrass();digFx(x,z);return true;}
function fillHole(x,z){const k=K(x,z);if(!isHole(x,z))return false;delete S.holes[k];syncHoles();refreshHomeGrass();noise(0.08,0.04,700);burst(x,topY(x,z)+0.2,z,0x6ab84a,8,1.0,0.06);vil.hop=0.2;return true;}
function digFx(x,z){const y=topY(x,z);SFX.till();burst(x,y+0.15,z,0x6a4a30,12,1.4,0.07);vil.hop=0.25;}
// a crop: dig it up (it's lost) after a check, leaving a hole
function digCrop(x,z){const k=K(x,z),t=S.tiles[k];if(!t||!t.crop)return;const C=CROPS[t.crop.t]||{name:'crop'};
  setAction(`Dig up your <b>${C.name.toLowerCase()}</b>? It'll be gone, and leave a hole.`,[{label:'Dig it up',cls:'go',fn:()=>{clearAction();actAt(x,z,()=>{
      const tt=S.tiles[k];if(!tt||!tt.crop)return;delete S.tiles[k];if(typeof syncCrop==='function')try{syncCrop(k);}catch(e){}rebuildSoil();S.holes=S.holes||{};S.holes[k]=1;syncHoles();refreshHomeGrass();digFx(x,z);
      burst(x,topY(x,z)+0.3,z,0x6ab84a,10,1.4,0.06);floatText(x,topY(x,z)+0.9,z,'Dug up');save();});}},{label:'Leave it',fn:clearAction}],'Shovel');}
// what the shovel does on your island (from toolTap): fill a hole or empty soil, dig up a crop, or dig a new hole
function shovelTap(x,z){const k=K(x,z),t=S.tiles[k];
  if(isHole(x,z)){actAt(x,z,()=>fillHole(x,z));return true;}
  if(t&&!t.crop){actAt(x,z,()=>fillAt(x,z));return true;}
  if(t&&t.crop){digCrop(x,z);return true;}
  if(canDig(x,z)){actAt(x,z,()=>digHole(x,z));return true;}
  return false;}
setTimeout(syncHoles,0);/* (once the island is laid out) */
