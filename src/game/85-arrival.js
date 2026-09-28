/* =========================================================
   New game: arriving by sea. You drift on a raft past islands the currents bring you to; each one is generated in
   full (coastline, cliffs, rivers and waterfalls, forests and meadows, its style) and shown from the water in a slow
   flyover, with a few words about what's there. Keep drifting until one feels like home, then make landfall: the game
   boots on that island (bootGame(true) in 90-main), with you on its beach and nothing built.
   A candidate: seed (world and cliffs), style (HOME_STYLES), coastline wobble and carved coves, cliff layout, wildness.
   ========================================================= */
function islandCandidate(){const r=Math.random,style='meadow'; // every home island shares one temperate style; the seasons change it, the land makes it unique
  const coves=[];for(let i=0,n=1+(r()<0.5);i<n;i++){let a;do a=r()*6.283;while(Math.abs(Math.atan2(Math.sin(a-Math.PI),Math.cos(a-Math.PI)))<0.6);coves.push([a,0.16+r()*0.2,0.18+r()*0.22]);}
  return{seed:Math.floor(r()*1e9),style,shape:[0.02+r()*0.12,r()*0.1,r()*0.06,r()*6.283,r()*6.283,r()*6.283,2.8+r()*2.2],coves,cliff:[0.12+r()*0.32,r()<0.6?1:0],wild:0.3+r()*0.55};}
const homeOf=c=>({style:c.style,shape:c.shape,coves:c.coves,cliff:c.cliff,wild:c.wild});

// tear down every island (only before the game has booted: nothing else lives in the world yet)
function clearWorld(){for(const isl of islands){if(isl.group){scene.remove(isl.group);isl.group.traverse(o=>{if(o.isInstancedMesh)o.dispose();
      else if(o.geometry&&!Object.values(RTILE).includes(o.geometry)&&o.geometry!==TILE_PLANE&&o.geometry!==BOX&&o.geometry!==POOL_GEO&&o.geometry!==BLADES)o.geometry.dispose();});}
    if(isl.pgroup)scene.remove(isl.pgroup);}
  for(const m of [landMap,islMap,lvlMap,riverSurf,bridgeY,SAND_CH])m.clear();islands=[];}
// build a candidate's whole world, wild growth and all, and describe what's on it
function buildCandidate(c){S.worldSeed=c.seed;S.home=homeOf(c);S.scratch=1;S.wild=1;S.debris=[];S.paths={};S.homeAt=null;S.heartAt=null;S.builds=[];S.heart={};S.islandName=null;
  const st=applyHomeStyle();clearWorld();genIslands();for(const isl of islands)buildIsland(isl);rebuildSeaGrid();genWild();buildIsland(islands[0]);syncDebris();
  const h=islands[0],trees=S.debris.filter(d=>d.k==='tree').length,g=h.grass.length,high=[...lvlMap.values()].filter(v=>v>0).length;
  const riv=(h.rtiles||[]).length>0,falls=(h.falls||[]).length,near=islands.filter(i=>!i.home&&Math.hypot(i.cx,i.cz)<70).length;
  const bits=[];
  bits.push(trees>g*0.22?'deep forest':trees>g*0.12?'woods and open meadows':'wide open meadows');
  if(riv)bits.push(falls>1?`a river tumbling over ${falls} waterfalls`:falls?'a river with a waterfall':'a winding stream');
  bits.push(c.cliff[1]&&high>250?'two tiers of cliffs':high>200?'cliffs to the north':'gentle, low hills');
  const cv=c.coves.slice().sort((a,b)=>b[1]-a[1])[0],dirs=['east','south-east','south','south-west','west','north-west','north','north-east'];
  bits.push(`a ${cv[1]>0.27?'deep bay':'sheltered cove'} to the ${dirs[Math.round(((cv[0]+6.283)%6.283)/0.785)%8]}`);
  // named for what stands out most about the land itself
  const title=falls>2?'An island of waterfalls':trees>g*0.22?'A deep-forest island':c.cliff[1]&&high>250?'A cliff-top island':riv?'A river island':cv[1]>0.27?'An island with a deep bay':'A meadow island';
  return{title,text:bits.slice(0,-1).join(', ')+' and '+bits[bits.length-1]+'.',near};}

let arriving=null;
function showArrival(){$('boot').style.display='none';for(const c of clouds)c.visible=false;/* clouds would sit between the camera and the island */document.body.classList.add('arriving');villager.visible=false;npcBoat.visible=false;resize();S.hour=7.4;applyTime();
  const el=document.createElement('div');el.id='arrive';document.body.appendChild(el);
  arriving={el,t:0,last:performance.now(),n:0};
  const show=()=>{const c=islandCandidate();arriving.c=c;arriving.n++;const d=buildCandidate(c);cam.yaw=Math.random()*6.28;
    el.innerHTML=`<div class="arr"><small>${arriving.n===1?'Day 1 · adrift':'The current carries you on…'}</small><h2>${d.title}</h2><p>${d.text}${d.near?` ${d.near===1?'Another island':d.near+' other islands'} lie within sailing distance.`:''}</p>
      <div class="pkrow"><button class="pbtn" id="arMore">Keep drifting</button><button class="pbtn go" id="arLand">Make landfall</button></div></div>`;
    el.querySelector('#arMore').onclick=()=>{SFX.ui();fadeThen(show);};
    el.querySelector('#arLand').onclick=()=>{SFX.ui();fadeThen(()=>{el.remove();arriving=null;cam.pitch=0.5;document.body.classList.remove('arriving');villager.visible=true;npcBoat.visible=true;S.hour=7.2;bootGame(true);setTimeout(()=>$('fade').classList.remove('on'),300);},true);};};
  show();requestAnimationFrame(arrivalFrame);}
function fadeThen(fn,keep){const f=$('fade');f.classList.add('on');setTimeout(()=>{fn();if(!keep)setTimeout(()=>f.classList.remove('on'),120);},650);}
// a slow circle around the island from out at sea
function arrivalFrame(now){if(!arriving)return;const dt=Math.min(0.1,(now-arriving.last)/1000);arriving.last=now;arriving.t+=dt;tt+=dt;
  cam.yaw+=dt*0.06;cam.tx=-9;cam.tz=1;cam.dist=60;cam.pitch=0.6;applyCam();cullIslands();
  scene.fog.near=camD()+18;scene.fog.far=camD()+150;grassU.uTime.value=tt;riverU.uTime.value=tt;water.position.set(Math.round(cam.tx/10)*10,tideY,Math.round(cam.tz/10)*10);
  updateSkyDome();renderer.setRenderTarget(rt);renderer.render(skyScene,post.cam);renderer.autoClear=false;renderer.clearDepth();renderer.render(scene,camera);renderer.autoClear=true;
  renderer.setRenderTarget(null);renderer.render(post.scene,post.cam);requestAnimationFrame(arrivalFrame);}
