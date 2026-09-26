/* =========================================================
   The long voyage: driftseeds, island restoration, residents and trade, and the tides.
   - Driftseeds wash ashore at dawn (and now and then on wild shores).
   - Every wild island has a withered heart tree. Plant three driftseeds in it and it grows back (sprout, sapling, heart
     tree); the island's faded grass comes back to life and a new resident sails in to live there.
   - Residents ask for a daily trade (a crop, at twice the market price): a reason to sail your harvest across the sea.
   - The tide rises and falls twice a day; low tide uncovers tide-pool creatures on the beaches.
   S.restore[islandId] = stage 0..3.
   ========================================================= */
const RESTORE_N=3;
const stageOf2=isl=>(S.restore&&S.restore[isl.id])||0;
const restored=isl=>isl.home||stageOf2(isl)>=RESTORE_N;
// wild islands look washed-out until their heart tree is restored
function islandBiome(isl){const B=BIOMES[isl.biome];if(restored(isl))return B;return Object.assign({},B,{grass:B.grass.map(c=>lerpHex(c,0xa0a08e,0.42))});}

/* ---- heart trees ---- */
function pickHeart(isl,blocked){let best=null,bd=1e9;for(const [x,z] of isl.grass){if(blocked.has(K(x,z)))continue;const d=Math.hypot(x-isl.cx,z-isl.cz);if(d<bd){bd=d;best=[x,z];}}
  if(best){isl.heart=best;blocked.add(K(...best));}}
function heartParts(stage,R){const p=[],gl=[];
  if(stage===0){p.push(P(CYL8,0x8a7a6a,0,0.3,0,0,0,0,0.42,0.6,0.42),P(CYL8,0x7a6a5a,0,0.02,0,0,0,0,0.7,0.06,0.7));for(let i=0;i<4;i++){const a=i*1.6+0.3;p.push(P(CYL6,0x7a6a5a,Math.cos(a)*0.2,0.72,Math.sin(a)*0.2,Math.sin(a)*0.9,0,-Math.cos(a)*0.9,0.06,0.5,0.06));}
    gl.push(P(ICO2,0x9ae8d0,0,0.64,0.2,0,0,0,0.08,0.08,0.05));}
  else if(stage===1){p.push(P(CYL8,0x8a6a4a,0,0.02,0,0,0,0,0.7,0.06,0.7));for(let i=0;i<5;i++)lf(p,[0x7ad8a0,0x5ab888][i%2],0,0.05,0,i*1.25,1.1,0.26,0.1);gl.push(P(ICO2,0xb8f8e0,0,0.24,0,0,0,0,0.12,0.12,0.12));}
  else if(stage===2){p.push(P(CYL8,0x8a6a4a,0,0.35,0,0,0,0,0.14,0.7,0.14));canopy(p,R,[0x9ae8b8,0x6ac898,0x3a8a6a],0,0.95,0,0.28);gl.push(P(ICO2,0xc8fff0,0.1,0.8,0.2,0,0,0,0.1,0.1,0.1));}
  else{p.push(P(TRUNK,0x9a7858,0,0.7,0,0,0,0,0.5,1.4,0.5));for(let i=0;i<5;i++){const a=i*1.26;p.push(P(CYL6,0x8a6848,Math.cos(a)*0.28,0.08,Math.sin(a)*0.28,Math.sin(a)*1.2,0,-Math.cos(a)*1.2,0.1,0.4,0.1));}
    canopy(p,R,[0xa8f0c8,0x7ad0a8,0x3a9a78],0,1.9,0,0.62);canopy(p,R,[0xf8c8e0,0xe8a0c8,0x9a6a9a],0.35,2.3,0.2,0.26);
    for(let i=0;i<9;i++){const a=i*0.7,r=0.5+(i%3)*0.18;gl.push(P(ICO2,[0xc8fff0,0xfff0c0,0xffd0e8][i%3],Math.cos(a)*r,1.6+(i%4)*0.25,Math.sin(a)*r,0,0,0,0.1,0.1,0.1));}}
  return{p,gl};}
function buildHeart(isl){if(!isl.heart||!isl.group)return;if(isl.heartG){isl.group.remove(isl.heartG);isl.heartG.traverse(o=>{if(o.geometry)o.geometry.dispose();});}
  const [x,z]=isl.heart,g=new T.Group(),st=stageOf2(isl),{p,gl}=heartParts(st,mulberry(hi(isl.id,st,5)));g.add(M(p));if(gl.length){const m=M(gl,lumMat);m.castShadow=false;g.add(m);}
  g.position.set(x,topY(x,z),z);isl.group.add(g);isl.heartG=g;
  if(st>=RESTORE_N)buildResident(isl);}

/* ---- the resident who moves in once an island is restored ---- */
function residentPlan(isl){const R=mulberry(hi(isl.id,S.worldSeed|0,17)),spk=Object.keys(SPECIES),sp=spk[Math.floor(R()*spk.length)],S0=SPECIES[sp],pk=Object.keys(PERS),pers=pk[Math.floor(R()*pk.length)],st=STYLE[pers];
  return{sp,pers,name:S0.names[Math.floor(R()*S0.names.length)]+(R()<0.5?'':' the '+PERS[pers].label),col:S0.col[Math.floor(R()*S0.col.length)],shirt:[0x6ab8a8,0xe8866a,0xd8b84a,0x9a8ad8][Math.floor(R()*4)],outfit:st.o[0],acc:st.a[0]};}
function buildResident(isl){if(isl.residentG)return;const v=residentPlan(isl),g=npcModel(v.sp,v.col,v.shirt,v.acc,v.outfit);g.scale.setScalar(0.92);
  const [hx,hz]=isl.heart,x=hx+1.1,z=hz+0.9;g.position.set(x,surfY(x,z),z);isl.group.add(g);isl.residentG=g;isl.residentPlan=v;}
function tradeOf(isl){const R=mulberry(hi(isl.id,S.day,23)),un=CROP_IDS.filter(id=>CROPS[id].lvl<=level()),id=un[Math.floor(R()*un.length)],n=3+Math.floor(R()*4);return{id,n,pay:Math.round(CROPS[id].price*n*2)};}
function cropCount(id){let n=0;for(const k in S.inv)if(k.split('|')[0]===id)n+=S.inv[k];return n;}
function takeCrops(id,n){for(const v of ['normal',...VARIANTS.map(q=>q.id).filter(q=>q!=='normal')]){const k=id+'|'+v;while(n>0&&S.inv[k]>0){S.inv[k]--;n--;if(!S.inv[k])delete S.inv[k];}}}
function residentTalk(isl){const v=isl.residentPlan,t=tradeOf(isl),have=cropCount(t.id),done=S.traded&&S.traded[isl.id]===S.day;
  const hello={sailor:'The sea brought me here, and your heart tree kept me.',dreamer:'This island sings now. Can you hear it?',tinkerer:'Everything here works again. Even me!',homebody:'I’ve made this little island my home. Thank you, dear.',explorer:'Best island I’ve found yet. And I’ve found a lot.',scholar:'The heart tree is a remarkable specimen. I’m taking notes.'}[v.pers];
  setAction(`<b>${v.name}:</b> ${hello}<br>${done?'Thanks for today’s trade! Come back tomorrow.':`Today I’m trading for <b>${t.n}× ${CROPS[t.id].name}</b>: <b>${fmt(t.pay)} shells</b>, twice the market price. You have ${have}.`}`,
    [...(done?[]:[{label:'Trade',cls:'go',disabled:have<t.n,fn:()=>{takeCrops(t.id,t.n);S.shells+=t.pay;S.traded=S.traded||{};S.traded[isl.id]=S.day;addXP(6);SFX.coin();logEvent('trade',{name:isl.name});clearAction();toast(`Traded ${t.n}× ${CROPS[t.id].name} for <b>${fmt(t.pay)} shells</b>.`,'',seedIcon(t.id));updateHUD();}}]),{label:'Bye',fn:clearAction}],isl.name);}

/* ---- tapping the heart tree ---- */
function heartTap(isl){const st=stageOf2(isl),n=S.inv['g:driftseed']||0;
  if(st>=RESTORE_N){if(isl.residentG)residentTalk(isl);else toast(`${isl.name}’s heart tree glows softly.`);return;}
  if(!n){toast(st?`The heart tree is waking… ${RESTORE_N-st} more Driftseed${RESTORE_N-st>1?'s':''} will restore it. Look for them on the beach at dawn.`:'A withered old tree at the heart of the island. It seems to be waiting for something… (Driftseeds wash ashore at dawn.)','',ICON['g:driftseed']);return;}
  setAction(`Plant a <b>Driftseed</b> at ${isl.name}’s heart tree? (${st}/${RESTORE_N} planted, you have ${n})`,[{label:'Plant',cls:'go',fn:()=>{clearAction();plantDriftseed(isl);}},{label:'Not yet',fn:clearAction}],'Heart Tree');}
function plantDriftseed(isl){S.inv['g:driftseed']--;if(!S.inv['g:driftseed'])delete S.inv['g:driftseed'];S.restore=S.restore||{};S.restore[isl.id]=stageOf2(isl)+1;
  const [x,z]=isl.heart,y=topY(x,z);for(let i=0;i<24;i++)sparkle(x+(Math.random()-0.5)*1.4,y+0.3+Math.random()*1.6,z+(Math.random()-0.5)*1.4,[0xc8fff0,0xfff0c0,0xffd0e8][i%3]);SFX.rare();addXP(10);
  if(stageOf2(isl)>=RESTORE_N){buildIsland(isl);if(isl.pgroup&&typeof syncPlants==='function')syncPlants(isl);cullIslands();const pay=800+islands.filter(i=>!i.home&&restored(i)).length*200;S.shells+=pay;logEvent('restore',{name:isl.name});
    setTimeout(()=>{SFX.discover();toast(`${isl.name} is restored! Colour floods back across the island, and a new resident, <b>${isl.residentPlan.name}</b>, has moved in. +${fmt(pay)} shells`,'rare',ICON.star);},500);}
  else{buildHeart(isl);toast(stageOf2(isl)===1?'A tiny glowing sprout pushes up through the old stump!':'The heart tree grows into a sapling. One more Driftseed…','',ICON['g:driftseed']);}
  updateHUD();}
const nearHeart=(isl,x,z)=>isl&&isl.heart&&Math.abs(x-isl.heart[0])<=1&&Math.abs(z-isl.heart[1])<=1;

/* ---- driftseeds washing ashore ---- */
function spawnDriftseed(isl,quiet){if(!isl)return;if(S.finds.some(f=>f.k==='driftseed'&&islMap.get(K(f.x,f.z))===isl.id))return;
  const c=isl.sand.filter(([x,z])=>freeTile(x,z)&&!(isl.blocked&&isl.blocked.has(K(x,z))));if(!c.length)return;const [x,z]=pickR(c);S.finds.push({k:'driftseed',x,z});if(!quiet){syncLife();for(let i=0;i<8;i++)sparkle(x,0.4,z,0xc8fff0);}}
function driftseedFound(first){if(first)setTimeout(()=>setAction('A glowing <b>Driftseed</b>! Old sailors say they wake sleeping islands. Every wild island has a withered heart tree at its centre: plant three Driftseeds there to bring it back to life.',[{label:'Got it',cls:'go',fn:clearAction}],'Driftseed'),400);}

/* ---- tides: two highs and two lows a day; low tide uncovers tide-pool creatures ---- */
let tideY=0,lowTide=null;
const tideAt=h=>0.045*Math.cos((h-3)/12.4*Math.PI*2)-0.03;
function updateTides(){tideY=tideAt(S.hour);const low=tideY<-0.055;
  water.position.y=tideY;for(const isl of islands)if(isl.flats&&isl.group&&isl.group.visible)for(const m of isl.flats)m.position.y=tideY;
  if(low!==lowTide){lowTide=low;const isl=S.sea?null:curIsl();
    if(low&&isl){const edge=isl.sand.filter(([x,z])=>{const c=SAND_CH.get(K(x,z));return c&&Math.min(...c)<0.1&&freeTile(x,z);});for(let i=0;i<3&&edge.length;i++){const [x,z]=edge.splice(Math.floor(Math.random()*edge.length),1)[0];S.finds.push({k:pickR(['hermit','anemone','star']),x,z,tide:1});}
      syncLife();if(!S.tipTide){S.tipTide=1;toast('Low tide! Creatures are hiding in the tide pools along the beach.','',ICON['g:hermit']);}}
    else if(!low&&S.finds.some(f=>f.tide)){S.finds=S.finds.filter(f=>!f.tide);syncLife();}}}
