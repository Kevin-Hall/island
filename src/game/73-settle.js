/* =========================================================
   Settling a wild island (S.scratch): you choose where everything goes.
   Blueprints: your tent, and each kit the Island Heart gives you (store, museum, café, town hall, a neighbour's plot).
   Each takes a 2×2 patch of clear, level grass, with room at the door. You tap to move the outline, then place it;
   buildings go up overnight (S.builds, finished by morningMoveIn). Pitching your tent is also when you name the island.
   Your driftseed is placed the same way (one tile, with open ground round it): it becomes the Island Heart.
   ========================================================= */
const BP_NAME=k=>k==='tent'?'your tent':k==='seed'?'your driftseed':((HEART_UNLOCKS.find(u=>u.k===k)||{}).name||k).toLowerCase();
function bpFree(x,z){const k=K(x,z);return landMap.get(k)==='grass'&&onHome(x,z)&&farmQ(x,z)>1.15&&!debrisAt(x,z)&&!objAt(x,z)&&!floorAt(x,z)&&!fixedAt(x,z)&&!S.tiles[k]&&!findAt(x,z)&&!weedAt(x,z);}
// everything a tent brings with it: the tent (2x2) and the ground at its door, and the camp at its front-left (the
// bonfire, a bench on either side of it) and the crate at its back-right. See houseGroup(0) in 50-objects.
function campTiles(x,z){const t=[];for(let dx=0;dx<2;dx++)for(let dz=0;dz<3;dz++)t.push([x+dx,z+dz]);t.push([x-1,z+1],[x-1,z+2],[x-1,z+3],[x-2,z+2],[x-2,z+3],[x+2,z]);return t;}
// room for all of it: level open grass, nothing growing or lying there, well clear of the driftseed, and no tree close
// enough for its crown to hang into the tent or the fire
// (loose: ignore what's growing there, for when the tent is pitched for you and clears its own space; see clearCamp)
function campOk(x,z,loose){const l=lvlMap.get(K(x,z))||0,ts=campTiles(x,z);
  for(const [a,b] of ts){const k=K(a,b);if(loose?landMap.get(k)!=='grass'||!onHome(a,b)||farmQ(a,b)<=1.15||objAt(a,b)||fixedAt(a,b)||S.tiles[k]:(b===z+2&&a>=x&&a<=x+1)?!walkable(a,b)||debrisAt(a,b)||fixedAt(a,b):!bpFree(a,b))return false;
    if((lvlMap.get(k)||0)!==l)return false;if(S.heartAt&&Math.abs(a-S.heartAt.x)<=2&&Math.abs(b-S.heartAt.z)<=2)return false;}
  for(const [a,b] of [[x,z],[x+1,z],[x,z+1],[x+1,z+1],[x-1,z+2]])for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){if(TOWN.res.get(K(a+dx,b+dz))==='tree')return false;/* palms and the like can't be cleared */if(loose)continue;const d=debrisAt(a+dx,b+dz);if(d&&d.k==='tree')return false;}
  return true;}
// clear the camp's ground, and any tree close enough to hang into the tent or the fire
function clearCamp(x,z){const ts=campTiles(x,z),core=[[x,z],[x+1,z],[x,z+1],[x+1,z+1],[x-1,z+2]],n0=S.debris.length;
  S.debris=S.debris.filter(d=>!(ts.some(([c,e])=>c===d.x&&e===d.z)||d.k==='tree'&&core.some(([c,e])=>Math.abs(c-d.x)<=1&&Math.abs(e-d.z)<=1)));
  S.finds=S.finds.filter(f=>!ts.some(([c,e])=>c===f.x&&e===f.z));return S.debris.length!==n0;}
function bpOk(x,z){if(placing&&placing.bp==='seed')return seedOk(x,z);if(placing&&placing.bp==='tent')return campOk(x,z);const l=lvlMap.get(K(x,z))||0;for(let dx=0;dx<2;dx++)for(let dz=0;dz<2;dz++){if(!bpFree(x+dx,z+dz)||(lvlMap.get(K(x+dx,z+dz))||0)!==l)return false;}
  for(let dx=0;dx<2;dx++){const k=K(x+dx,z+2);if(!walkable(x+dx,z+2)||debrisAt(x+dx,z+2)||fixedAt(x+dx,z+2))return false;}return true;}
// the driftseed needs a tile with open, level grass all round it (the tree will spread), clear of your tent
function seedOk(x,z){const l=lvlMap.get(K(x,z))||0;for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const a=x+dx,b=z+dz;
    if(!bpFree(a,b)||(lvlMap.get(K(a,b))||0)!==l||(S.homeAt&&campTiles(S.homeAt.x,S.homeAt.z).some(([c,e])=>Math.abs(c-a)<=1&&Math.abs(e-b)<=1)))return false;}return true;}/* clear of the tent and its camp */
function bpGhost(k){if(k==='tent'){const g=houseGroup(0);return g;}
  if(k==='seed'){const q=seedTreeParts(1),g=new T.Group();g.add(M([...q.p,...q.gl]));return g;}
  const t=k.startsWith('vh')?'vh':k,b={t,n:t==='vh'?+k.slice(2):0,x:0,z:0},g=new T.Group();
  const q=t==='vh'?{p:plotParts(b,true),gl:[]}:townBuilding(b,mulberry(3));g.add(M(q.p));if(q.gl.length)g.add(M(q.gl));
  const w=new T.Group();g.position.set(0.5,0,0.5);w.add(g);return w;}
function startBlueprint(k){if(S.sea||inside){toast('Head back to your island first.');return;}closeSheet();clearAction();if(placing)endPlace();
  // start from the nearest good spot to where you're standing
  const px=Math.round(vil.x),pz=Math.round(vil.z),sd=k==='seed',ok=sd?seedOk:k==='tent'?campOk:bpOk;let best=null,bd=1e9;
  for(let r=0;r<16&&!best;r++)for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){if(Math.max(Math.abs(dx),Math.abs(dz))!==r)continue;const x=px+dx,z=pz+dz-(sd?1:2);if(ok(x,z)){const d=dx*dx+dz*dz;if(d<bd){bd=d;best=[x,z];}}}
  if(!best){toast(sd?"There's no open, level grass nearby for your driftseed. Clear some ground (axe and shovel) or walk somewhere more open."
    :`There's no clear, level patch nearby for ${BP_NAME(k)}. Clear some ground (axe and shovel) or walk somewhere more open.`);return;}
  placing={bp:k,kind:k,rot:0,x:best[0],z:best[1]};ghost=bpGhost(k);ghost.traverse(o=>{if(o.isMesh){if(o.material===firePoolMat)o.visible=false;o.material=ghostMat;o.castShadow=false;}});scene.add(ghost);bpMove(best[0],best[1]);}
function bpMove(x,z){placing.x=x;placing.z=z;const sd=placing.bp==='seed',c=placing.bp==='tent',y=sd?topY(x,z):Math.min(topY(x,z),topY(x+1,z+1))||0.5;ghost.position.set(c?x+0.5:x,y,c?z+0.5:z);
  const ok=bpOk(x,z);ghostMat.color.set(ok?0xffffff:0xff6a5a);cursorAt(x,sd?z:z+2,ok?0xfff6e2:0xff6a5a);cursorT=1e9;
  setAction(sd?`<b>Plant your driftseed</b><br><small>${ok?'Tap the ground to choose the spot. It will grow into your Island Heart, right here.':'Needs open, level grass with a clear tile all round it.'}</small>`
      :`<b>Place ${BP_NAME(placing.bp)}</b><br><small>${ok?'Tap the ground to move it. The door faces you.':'Needs a clear, level 2×2 patch of grass with room at the door.'}</small>`,
    [{label:sd?'Plant here':'Place here',cls:'go',disabled:!ok,fn:bpPlace},{label:'Later',fn:endPlace}]);}
function bpPlace(){const {bp:k,x,z}=placing;if(!bpOk(x,z))return;endPlace();SFX.place();
  if(k==='seed'){plantSeed(x,z);return;}
  if(k==='tent'){pitchTent(x,z);return;}
  const t=k.startsWith('vh')?'vh':k;S.builds=S.builds||[];S.builds.push({t,n:t==='vh'?+k.slice(2):undefined,x,z,day:S.day});delete S.kits[k];
  rebuildHome();burst(x+1,topY(x,z)+0.6,z+1,0xf6eedb,20,2,0.1);updateHUD();
  toast(t==='vh'?'Plot marked out. Your new neighbour will arrive with their house tomorrow morning!':`Building work has started on the ${BP_NAME(k)}. It'll be finished tomorrow morning.`,'',ICON.hammer);}

// pitching your tent: the camera leans in, the bundle thumps down, three pegs knock in as the canvas rises and pops taut,
// then the bonfire catches, and you name the island. Only one tap to place; the rest just happens.
let pitch=null;
function pitchTent(x,z){S.homeAt={x,z};clearCamp(x,z);rebuildHome();syncObjs();const tm=houseMesh&&houseMesh.userData.tent;
  const fl=[...fires].find(f=>f.parent===houseMesh);if(fl)fl.userData.hold=0;/* the fire stays dark until it's lit */
  const ic=introCam;introCam=null;/* the opening shot hands over to this one */
  pitch={x,z,t:0,t0:performance.now(),step:0,tm,fl,sy:0.02,vy:0,ty:0.02,lit:false,d0:ic?ic.d:cam.dist,p0:ic?ic.p:cam.pitch,end:-1};if(tm)tm.scale.set(0.8,0.02,0.8);
  document.body.classList.add('cine');goTo(x+0.5,z+2.3,()=>{villager.rotation.y=Math.PI;});
  const y=topY(x,z);noise(0.25,0.12,260,0.8);burst(x+0.5,y+0.1,z+0.5,0xc8b08a,16,1.4,0.09,4);}
function updatePitch(dt){const p=pitch;if(!p)return;p.t=(performance.now()-p.t0)/1000;/* the clock, not frames, so a slow phone still gets there on time */const y=topY(p.x,p.z);
  if(p.end<0){if(!drag&&!pinch){cam.dist=lerp(cam.dist,Math.max(11,p.d0*0.5),Math.min(1,dt*1.5));cam.pitch=lerp(cam.pitch,0.34,Math.min(1,dt*1.5));}}
  else{if(!p.e0)p.e0=performance.now();const u=smooth(0,1,(performance.now()-p.e0)/1600);if(!drag&&!pinch){cam.dist=lerp(p.cd,p.d0,u);cam.pitch=lerp(p.cp,p.p0,u);}if(u>=1){pitch=null;return;}}
  // the three pegs, one corner at a time, each raising the canvas a little
  const pegs=[[0.55,p.x,p.z],[1.05,p.x+1,p.z+1],[1.55,p.x+1,p.z]];
  if(p.step<3&&p.t>=pegs[p.step][0]){const [,px,pz]=pegs[p.step];p.step++;p.ty=0.2+p.step*0.2;vil.hop=0.18;
    tone(250,0.05,'square',0.05);noise(0.05,0.07,1900,1.4);setTimeout(()=>tone(230,0.04,'square',0.04),90);burst(px,y+0.05,pz,0xa8906a,6,0.9,0.06,4);}
  if(p.step===3&&p.t>=2.1){p.step=4;p.ty=1;p.vy=2.6;SFX.place();noise(0.35,0.05,900,0.6);burst(p.x+0.5,y+0.8,p.z+0.5,0xf6eedb,18,1.6,0.08,3);}
  if(p.step===4&&p.t>=2.9){p.step=5;p.lit=true;if(p.fl)delete p.fl.userData.hold;}
  if(p.step===5&&p.t>=4.0){p.step=6;SFX.discover();nameIsland();}
  // a springy canvas: it overshoots and settles when it pops up
  for(let i=0;i<4;i++){const h=Math.min(dt,0.1)/4;p.vy+=((p.ty-p.sy)*60-p.vy*9)*h;p.sy+=p.vy*h;}if(p.tm){const k=clamp(p.sy,0.02,1.3);p.tm.scale.set(0.8+0.2*Math.min(1,k),k,0.8+0.2*Math.min(1,k));}}
function pitchDone(){if(!pitch)return;pitch.end=0;pitch.cd=cam.dist;pitch.cp=cam.pitch;pitch.lit=false;if(pitch.tm)pitch.tm.scale.set(1,1,1);document.body.classList.remove('cine');}

// the moment you settle: name the place you've chosen
function nameIsland(){const el=document.createElement('div');el.id='heartUp';const sug=S.islandName||(S.home&&S.home.suggest)||TOWN_NAMES[0][Math.floor(Math.random()*TOWN_NAMES[0].length)]+TOWN_NAMES[1][Math.floor(Math.random()*TOWN_NAMES[1].length)];
  el.innerHTML=`<div class="hu"><h2>Home, for now</h2><p class="husub">The tent's up and the fire is crackling. The sea hushes somewhere below. Every island deserves a name: what will you call this one?</p>
    <label class="pkname"><span>Island name</span><input id="pkName" maxlength="16" value="${sug}" autocomplete="off"></label><button class="pbtn go" id="huOk">That's the one</button></div>`;
  document.body.appendChild(el);const done=()=>{S.islandName=(el.querySelector('#pkName').value||'').trim().slice(0,16)||sug;TOWN.name=S.islandName;el.remove();pitchDone();updateHUD();save();
    setTimeout(()=>say(`<b>${S.islandName}</b>. It suits it.`),700);};/* the driftseed waits in the goal chip: no prompt pushed on you */
  el.querySelector('#huOk').onclick=done;el.querySelector('#pkName').onkeydown=e=>{if(e.key==='Enter')done();};}

// a camp pitched before the camp had its footprint (the sprout in the fire, a tree through the tent): put it right
function fixCamp(){if(!S.homeAt||!S.scratch||S.house)return false;/* (only a tent has the camp) */const {x,z}=S.homeAt,ts=campTiles(x,z);let ch=false;
  const near=(a,b,r)=>ts.some(([c,e])=>Math.abs(c-a)<=r&&Math.abs(e-b)<=r);
  if(clearCamp(x,z))ch=true;
  if(S.heartAt&&near(S.heartAt.x,S.heartAt.z,1)){const hx=S.heartAt.x,hz=S.heartAt.z;S.heartAt=null;TOWN.fixed.delete(K(hx,hz));let best=null,bd=1e9;
    for(let dx=-9;dx<=9;dx++)for(let dz=-9;dz<=9;dz++){const a=hx+dx,b=hz+dz;if(!seedOk(a,b))continue;const d=dx*dx+dz*dz;if(d<bd){bd=d;best=[a,b];}}
    S.heartAt=best?{x:best[0],z:best[1]}:{x:hx,z:hz};ch=true;}
  return ch;}
// planting your driftseed: it takes root on the spot and becomes the Island Heart, growing with your level from now on
function plantSeed(x,z){const y=topY(x,z);S.heartAt={x,z};S.heart=Object.assign(S.heart||{},{planted:S.day,revived:S.day});SFX.splash&&SFX.splash();
  for(let i=0;i<40;i++)sparkle(x+(Math.random()-0.5)*1.6,y+0.2+Math.random()*1.4,z+(Math.random()-0.5)*1.6,[0xc8fff0,0xfff0c0,0xa8ec84][i%3]);
  rebuildHome();syncObjs();updateHUD();save();buzz(20);
  setTimeout(()=>say('It took root. What will it grow into?'),600);
  // the first time: your tent goes up right beside the sprout
  if(!S.homeAt){const t=tentBeside(x,z)||tentBeside(x,z,true);if(t)setTimeout(()=>{if(!S.homeAt)pitchTent(t[0],t[1]);},2600);else setTimeout(()=>startBlueprint('tent'),2600);}
  else if(level()>1)setTimeout(()=>heartLevelUp(1,level()),2200);}
// a clear 2x2 spot for the tent a few steps from the sprout (outside its ring), nearest you
function tentBeside(sx,sz,loose){let best=null,bd=1e9;for(let dx=-8;dx<=7;dx++)for(let dz=-8;dz<=7;dz++){const x=sx+dx,z=sz+dz;
    if(!campOk(x,z,loose))continue;/* (campOk keeps the whole camp clear of the sprout) */const d=Math.hypot(x+0.5-sx,z+0.5-sz)*2+Math.hypot(x-vil.x,z-vil.z)+(loose?S.debris.filter(q=>Math.abs(q.x-x-0.5)<2.5&&Math.abs(q.z-z-1)<2.5).length*3:0);/* (loose: the fewer things to clear the better) */if(d<bd){bd=d;best=[x,z];}}return best;}
