/* =========================================================
   New game: arriving by sea. You drift on a raft past islands the currents bring you to; each one is generated in
   full (coastline, cliffs, rivers and waterfalls, forests and meadows, its style) and shown from the water in a slow
   flyover, with a few words about what's there. Keep drifting until one feels like home, then make landfall: the game
   boots on that island (bootGame(true) in 90-main), with you on its beach and nothing built.
   A candidate: seed (world and cliffs), style (HOME_STYLES), coastline wobble and carved coves, cliff layout, wildness.
   ========================================================= */
// every home island shares one temperate style (the seasons change it); its character (ISLE_KINDS, 85b) and the land
// make it unique, and the current never brings the same kind of island twice running
function islandCandidate(prev){const r=Math.random,style='meadow',ks=Object.keys(ISLE_KINDS).filter(k=>k!==prev),kind=ks[Math.floor(r()*ks.length)],Kd=ISLE_KINDS[kind],sh=isleShape(Kd,r);
  const rv=r(),riv=kind==='meadow'?(rv<0.5?0:1):kind==='pinewood'?(rv<0.45?2:1):rv<0.15?0:rv<0.4?2:1;
  return{seed:Math.floor(r()*1e9),style,kind,form:sh.t,riv,ra:(r()-0.5)*0.9,scale:1.3+r()*0.25,shape:sh.shape,coves:sh.coves,cliff:[0.12+r()*0.32,r()<0.6?1:0],wild:Kd.wild[0]+r()*(Kd.wild[1]-Kd.wild[0]),hour:[6.5,8.2,10,16.9][Math.floor(r()*4)]};}
const homeOf=c=>({style:c.style,kind:c.kind,riv:c.riv,ra:c.ra,shape:c.shape,coves:c.coves,cliff:c.cliff,wild:c.wild,scale:c.scale});

// tear down every island (only before the game has booted: nothing else lives in the world yet)
function clearWorld(){for(const isl of islands){if(isl.group){scene.remove(isl.group);isl.group.traverse(o=>{if(o.isInstancedMesh)o.dispose();
      else if(o.geometry&&!Object.values(RTILE).includes(o.geometry)&&o.geometry!==TILE_PLANE&&o.geometry!==BOX&&o.geometry!==POOL_GEO&&o.geometry!==BLADES)o.geometry.dispose();});}
    if(isl.pgroup)scene.remove(isl.pgroup);}
  for(const m of [landMap,islMap,lvlMap,riverSurf,bridgeY,SAND_CH])m.clear();islands=[];}
// build a candidate's whole world, wild growth and all, and describe what's on it
function buildCandidate(c){S.worldSeed=c.seed;S.home=homeOf(c);S.scratch=1;S.wild=1;S.debris=[];S.paths={};S.homeAt=null;S.heartAt=null;S.builds=[];S.heart={};S.islandName=null;
  const st=applyHomeStyle();clearWorld();genIslands();for(const isl of islands)buildIsland(isl);rebuildSeaGrid();genWild();
  const Kd=ISLE_KINDS[c.kind];S.home.marks=placeMarks(Kd);S.home.suggest=Kd.names[Math.floor(Math.random()*Kd.names.length)];buildIsland(islands[0]);syncDebris();
  const h=islands[0],trees=S.debris.filter(d=>d.k==='tree').length,g=h.grass.length,high=[...lvlMap.values()].filter(v=>v>0).length;
  const riv=(h.rtiles||[]).length>0,falls=(h.falls||[]).length,near=islands.filter(i=>!i.home&&Math.hypot(i.cx,i.cz)<70).length;
  const bits=[];
  bits.push(trees>g*0.22?'deep forest':trees>g*0.12?'woods and open meadows':'wide open meadows');
  if(riv)bits.push(falls>1?`a river tumbling over ${falls} waterfalls`:falls?'a river with a waterfall':'a winding stream');
  bits.push(c.cliff[1]&&high>250?'two tiers of cliffs':high>200?'cliffs to the north':'gentle, low hills');
  const cv=c.coves.slice().sort((a,b)=>b[1]-a[1])[0],dirs=['east','south-east','south','south-west','west','north-west','north','north-east'];
  bits.push(`a ${cv[1]>0.27?'deep bay':'sheltered cove'} to the ${dirs[Math.round(((cv[0]+6.283)%6.283)/0.785)%8]}`);
  // named for what stands out most about the land itself
  // what you can make out from the raft: the land, its landmarks, and a sign of who lives there
  const sees=[...S.home.marks.map(m=>`${MARKS[m.k].say} ${markWhere(m)}`),Kd.hints[Math.floor(Math.random()*Kd.hints.length)]];
  const land=(riv?(c.riv>1?'Two rivers':falls>1?`A river over ${falls} waterfalls`:falls?'A river and a waterfall':'A winding stream'):'Still ponds, no river')+`, ${cv[1]>0.27?'a deep bay':'a sheltered cove'} to the ${dirs[Math.round(((cv[0]+6.283)%6.283)/0.785)%8]}`+(c.cliff[1]&&high>250?', two tiers of cliffs':'')+'.';
  return{title:Kd.name,line:Kd.line,land,sees,near};}

let arriving=null;
function showArrival(){$('boot').style.display='none';/* clouds would sit between the camera and the island */document.body.classList.add('arriving');villager.visible=false;npcBoat.visible=false;resize();S.hour=7.4;applyTime();
  const el=document.createElement('div');el.id='arrive';document.body.appendChild(el);
  arriving={el,t:0,last:performance.now(),n:0};
  const show=()=>{const c=islandCandidate(arriving.c&&arriving.c.kind);arriving.c=c;arriving.n++;const d=buildCandidate(c);cam.yaw=Math.random()*6.28;S.hour=c.hour;applyTime();
    {const isl=islands[0];let cx=0,cz=0;for(const [x,z] of isl.grass){cx+=x;cz+=z;}arriving.cx=cx/(isl.grass.length||1);arriving.cz=cz/(isl.grass.length||1);arriving.fx=arriving.cx;arriving.fz=arriving.cz;arriving.t=0;let rr=0;for(const [x,z] of [...isl.grass,...isl.sand])rr=Math.max(rr,Math.hypot(x-arriving.cx,z-arriving.cz));arriving.far=Math.max(64,rr*1.75);arriving.dd=arriving.far;}
    el.innerHTML=`<div class="arr"><small>${arriving.n===1?'Day 1 · adrift':'The current carries you on…'}</small><h2>${d.title}</h2><p class="arline">${d.line}</p><p class="arland">${d.land}${d.near?` ${d.near===1?'Another island':d.near+' more'} within sailing distance.`:''}</p>
      <div class="arsee"><div class="archart"></div><div><b>From the raft you can make out</b><ul>${d.sees.map(t=>`<li>${t.charAt(0).toUpperCase()+t.slice(1)}</li>`).join('')}</ul></div></div>
      <div class="pkrow"><button class="pbtn" id="arMore">Keep drifting</button><button class="pbtn go" id="arLand">Make landfall</button></div></div>`;
    el.querySelector('.archart').appendChild(isleChart(84,84));
    el.querySelector('#arMore').onclick=()=>{SFX.ui();fadeThen(show);};
    el.querySelector('#arLand').onclick=()=>{SFX.ui();fadeThen(()=>{el.remove();arriving=null;landfallWords(()=>{camera.clearViewOffset();cam.pitch=0.5;document.body.classList.remove('arriving');villager.visible=true;npcBoat.visible=true;S.hour=7.2;bootGame(true);
      setTimeout(()=>$('fade').classList.remove('on'),300);
      // what you saw from the raft is out there somewhere: go and find it
      const ms=S.home.marks||[];if(ms.length)setTimeout(()=>toast(`From the raft you glimpsed ${ms.map(m=>MARKS[m.k].say).join(' and ')}. They're out there somewhere.`,'rare',ICON.star),5200);});},true);};};
  show();requestAnimationFrame(arrivalFrame);}
// coming ashore: a few words in the dark before the island is yours (a tap hurries them on)
function landfallWords(done){const lines=['The raft scrapes on sand. You wade the last few steps ashore.','Birdsong. Wind in the grass. Nobody here but you.','Whatever you make of this place, it\u2019s yours.'];
  const el=document.createElement('div');el.id='landfall';document.body.appendChild(el);let i=0,t=null;
  const next=()=>{clearTimeout(t);if(i>=lines.length){el.classList.add('out');setTimeout(()=>{el.remove();done();},500);return;}el.innerHTML=`<p>${lines[i++]}</p>`;t=setTimeout(next,2300);};
  el.onclick=next;next();}
function fadeThen(fn,keep){const f=$('fade');f.classList.add('on');setTimeout(()=>{fn();if(!keep)setTimeout(()=>f.classList.remove('on'),120);},650);}
// a slow circle around the island from out at sea
function arrivalFrame(now){if(!arriving)return;const dt=Math.min(0.1,(now-arriving.last)/1000);arriving.last=now;arriving.t+=dt;tt+=dt;
  // a slow circle from out at sea, the view drifting in toward each landmark in turn, then back to the whole island
  {const ms=S.home&&S.home.marks||[],ph=Math.floor(arriving.t/7)%(ms.length+1),m=ph?ms[ph-1]:null,k=Math.min(1,dt*0.5);
    arriving.fx+=((m?m.x:arriving.cx)-arriving.fx)*k;arriving.fz+=((m?m.z:arriving.cz)-arriving.fz)*k;arriving.dd+=((m?52:arriving.far)-arriving.dd)*k;}
  cam.yaw+=dt*0.05;cam.tx=arriving.fx;cam.tz=arriving.fz;cam.dist=arriving.dd;cam.pitch=0.62;applyCam();
  {const W=innerWidth,H=innerHeight,cd=arriving.el.firstElementChild,ch=cd?cd.offsetHeight:0;camera.setViewOffset(W,H,0,ch*0.45,W,H);}/* (the island framed in the sky above the card) */cullIslands();
  scene.fog.near=camD()+18;scene.fog.far=camD()+150;grassU.uTime.value=tt;riverU.uTime.value=tt;waterU.uT.value=tt;waterU.uCam.value.copy(camera.position);if(depthDirty)buildDepthTex();water.position.set(Math.round(cam.tx/10)*10,tideY,Math.round(cam.tz/10)*10);
  updateSky(dt,tt);updateSkyDome();renderer.setRenderTarget(rt);renderer.render(skyScene,post.cam);renderer.autoClear=false;renderer.clearDepth();renderer.shadowMap.needsUpdate=true;renderer.render(scene,camera);renderer.autoClear=true;bloomPass();
  renderer.setRenderTarget(null);renderer.render(post.scene,post.cam);requestAnimationFrame(arrivalFrame);}
