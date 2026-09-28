/* =========================================================
   Settling a wild island (S.scratch): you choose where everything goes.
   Blueprints: your tent, and each kit the Island Heart gives you (store, museum, café, town hall, a neighbour's plot).
   Each takes a 2×2 patch of clear, level grass, with room at the door. You tap to move the outline, then place it;
   buildings go up overnight (S.builds, finished by morningMoveIn). Pitching your tent is also when you name the island.
   Also here: finding the Island Heart (walk close to it) and reviving it (water it).
   ========================================================= */
const BP_NAME=k=>k==='tent'?'your tent':((HEART_UNLOCKS.find(u=>u.k===k)||{}).name||k).toLowerCase();
function bpFree(x,z){const k=K(x,z);return landMap.get(k)==='grass'&&onHome(x,z)&&farmQ(x,z)>1.15&&!debrisAt(x,z)&&!objAt(x,z)&&!fixedAt(x,z)&&!S.tiles[k]&&!findAt(x,z)&&!weedAt(x,z);}
function bpOk(x,z){const l=lvlMap.get(K(x,z))||0;for(let dx=0;dx<2;dx++)for(let dz=0;dz<2;dz++){if(!bpFree(x+dx,z+dz)||(lvlMap.get(K(x+dx,z+dz))||0)!==l)return false;}
  for(let dx=0;dx<2;dx++){const k=K(x+dx,z+2);if(!walkable(x+dx,z+2)||debrisAt(x+dx,z+2)||fixedAt(x+dx,z+2))return false;}return true;}
function bpGhost(k){if(k==='tent'){const g=houseGroup(0);return g;}
  const t=k.startsWith('vh')?'vh':k,b={t,n:t==='vh'?+k.slice(2):0,x:0,z:0},g=new T.Group();
  const q=t==='vh'?{p:plotParts(b,true),gl:[]}:townBuilding(b,mulberry(3));g.add(M(q.p));if(q.gl.length)g.add(M(q.gl));
  const w=new T.Group();g.position.set(0.5,0,0.5);w.add(g);return w;}
function startBlueprint(k){if(S.sea||inside){toast('Head back to your island first.');return;}closeSheet();clearAction();if(placing)endPlace();
  // start from the nearest good spot to where you're standing
  const px=Math.round(vil.x),pz=Math.round(vil.z);let best=null,bd=1e9;
  for(let r=0;r<16&&!best;r++)for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){if(Math.max(Math.abs(dx),Math.abs(dz))!==r)continue;const x=px+dx,z=pz+dz-2;if(bpOk(x,z)){const d=dx*dx+dz*dz;if(d<bd){bd=d;best=[x,z];}}}
  if(!best){toast(`There's no clear, level patch nearby for ${BP_NAME(k)}. Clear some ground (axe and shovel) or walk somewhere more open.`);return;}
  placing={bp:k,kind:k,rot:0,x:best[0],z:best[1]};ghost=bpGhost(k);ghost.traverse(o=>{if(o.isMesh){o.material=ghostMat;o.castShadow=false;}});scene.add(ghost);bpMove(best[0],best[1]);}
function bpMove(x,z){placing.x=x;placing.z=z;const y=Math.min(topY(x,z),topY(x+1,z+1))||0.5;ghost.position.set(placing.bp==='tent'?x+0.5:x,y,placing.bp==='tent'?z+0.5:z);
  const ok=bpOk(x,z);ghostMat.color.set(ok?0xffffff:0xff6a5a);cursorAt(x,z+2,ok?0xfff6e2:0xff6a5a);cursorT=1e9;
  setAction(`<b>Place ${BP_NAME(placing.bp)}</b><br><small>${ok?'Tap the ground to move it. The door faces you.':'Needs a clear, level 2×2 patch of grass with room at the door.'}</small>`,
    [{label:'Place here',cls:'go',disabled:!ok,fn:bpPlace},{label:'Later',fn:endPlace}]);}
function bpPlace(){const {bp:k,x,z}=placing;if(!bpOk(x,z))return;endPlace();SFX.place();
  if(k==='tent'){S.homeAt={x,z};rebuildHome();syncObjs();burst(x+0.5,topY(x,z)+0.6,z+0.5,0xf6eedb,24,2,0.1);nameIsland();return;}
  const t=k.startsWith('vh')?'vh':k;S.builds=S.builds||[];S.builds.push({t,n:t==='vh'?+k.slice(2):undefined,x,z,day:S.day});delete S.kits[k];
  rebuildHome();burst(x+1,topY(x,z)+0.6,z+1,0xf6eedb,20,2,0.1);updateHUD();
  toast(t==='vh'?'Plot marked out. Your new neighbour will arrive with their house tomorrow morning!':`Building work has started on the ${BP_NAME(k)}. It'll be finished tomorrow morning.`,'',ICON.hammer);}

// the moment you settle: name the place you've chosen
function nameIsland(){const el=document.createElement('div');el.id='heartUp';const sug=S.islandName||TOWN_NAMES[0][Math.floor(Math.random()*TOWN_NAMES[0].length)]+TOWN_NAMES[1][Math.floor(Math.random()*TOWN_NAMES[1].length)];
  el.innerHTML=`<div class="hu"><h2>Home, for now</h2><p class="husub">Your tent is up. Every island deserves a name. What will you call this one?</p>
    <label class="pkname"><span>Island name</span><input id="pkName" maxlength="16" value="${sug}" autocomplete="off"></label><button class="pbtn go" id="huOk">That's the one</button></div>`;
  document.body.appendChild(el);const done=()=>{S.islandName=(el.querySelector('#pkName').value||'').trim().slice(0,16)||sug;TOWN.name=S.islandName;el.remove();updateHUD();save();
    setTimeout(()=>toast(`Welcome to <b>${S.islandName}</b>. Somewhere inland, an old trail leads to the heart of the island.`,'',ICON.sprout),500);};
  el.querySelector('#huOk').onclick=done;el.querySelector('#pkName').onkeydown=e=>{if(e.key==='Enter')done();};}

// walking near the heart finds it; watering it brings it back to life
function heartWatch(){if(!S.scratch)return;S.heart=S.heart||{};const [hx,hz]=TOWN.plaza;
  if(!S.heart.found&&Math.hypot(vil.x-hx,vil.z-hz)<5){S.heart.found=1;SFX.discover&&SFX.discover();
    toast("An enormous old tree, grey and withered, stands alone in the clearing. This is the island's heart. It's thirsty.",'rare',ICON.sprout);updateHUD();}}
function reviveHeart(){const [hx,hz]=TOWN.plaza,y=topY(hx,hz);S.heart=S.heart||{};S.heart.found=1;S.heart.revived=S.day;SFX.splash&&SFX.splash();
  for(let i=0;i<50;i++)sparkle(hx+(Math.random()-0.5)*3,y+0.3+Math.random()*3,hz+(Math.random()-0.5)*3,[0xc8fff0,0xfff0c0,0xa8ec84][i%3]);
  const f=$('fade');f.classList.add('on');setTimeout(()=>{rebuildHome();f.classList.remove('on');updateHUD();
    toast('Colour runs up the old trunk and new leaves unfurl. The Island Heart is alive again, and it will grow as your island thrives.','rare',ICON.sprout);
    if(level()>1)setTimeout(()=>heartLevelUp(1,level()),2200);},650);}
