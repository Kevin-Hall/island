/* =========================================================
   Debug / test API — only when the page is opened with ?debug
   Used by tools/smoke.mjs; handy from the browser console too (window.DS).
   ========================================================= */
if(/[?&]debug\b/.test(location.search)){
  const tileKeys=()=>islands[0].grass.map(([x,z])=>[x,z]);
  window.DS={
    state:()=>({day:S.day,hour:S.hour,shells:S.shells,sea:S.sea,loc:locName(),tiles:Object.keys(S.tiles).length,inv:{...S.inv},store:{...S.store},
      islands:islands.length,town:TOWN.name,buildings:TOWN.bld.filter(b=>!b.locked).map(b=>b.t),npcs:npcs.map(n=>n.name+' ('+n.pers+' '+n.sp+', '+n.state+(n.act?':'+n.act.k:'')+')'),px:PX,perfPx:PERF.px,inside:inside?inside.title:null}),
    hour:h=>{setHour(h);applyTime();},
    tp:(x,z)=>{S.sea=false;vil.x=vil.tx=x;vil.z=vil.tz=z;vil.path=null;cam.tx=x;cam.tz=z;},
    visit:id=>{const i=islands[id];S.disc[id]=1;const sp=(i.spots&&i.spots[1])||i.grass[0];DS.tp(sp[0]+0.6,sp[1]+0.6);},
    islands:()=>islands.map(i=>({id:i.id,biome:i.biome,name:i.name,x:i.cx,z:i.cz,r:Math.round(islR(i)),grand:!!i.grand,river:(i.rtiles||[]).length})),
    screen:(x,z)=>toScreen(x,topY(x,z),z),
    npcScreen:i=>{const n=npcs[i];return toScreen(n.x,n.y+0.5,n.z);},
    freeRow:(len=5)=>{for(const [x,z] of tileKeys()){let ok=true;for(let i=0;i<len&&ok;i++){const k=K(x+i,z);ok=canTill(x+i,z)&&farmQ(x+i,z)>1.3&&(lvlMap.get(k)||0)===(lvlMap.get(K(x,z))||0)&&!TOWN.bld.some(b=>Math.abs(b.x+0.5-(x+i))<4&&Math.abs(b.z+1-z)<4)&&!(S.boat&&Math.hypot(S.boat.x-(x+i),S.boat.z-z)<7);}if(ok)return[x,z];}return null;},
    give:(items)=>{Object.assign(S.inv,items||{'m:wood':14,'m:stone':11,'m:fiber':9,'g:shell':4,'f:sardine':2,'tomato|normal':3,'tomato|golden':1});updateHUD();},
    craft:i=>craft(i),sheet:(k,tab)=>openSheet(k,tab),closeSheet:()=>closeSheet(),
    enterHome:()=>enterHouse('home'),enterNpc:i=>{const n=npcs[i];enterHouse('vh',n.b,n);},leave:()=>leaveHouse(),
    // a demo row of crops (each id at growth p, 0..1) on free farm ground; returns the first tile
    farm:(ids,p=1,rows=1)=>{const r=DS.freeRow(ids.length);if(!r)return null;for(let j=0;j<rows;j++)ids.forEach((id,i)=>{const x=r[0]+i,z=r[1]+j,k=K(x,z);if(!S.tiles[k]&&!canTill(x,z))return;S.tiles[k]={w:1,crop:{t:id,p:Array.isArray(p)?p[j]:p,v:null,m:0}};});rebuildSoil();syncAllCrops();return r;},
    // drop sample models in a row for a close look: 'tree:bush', 'debris:bush', 'plant:blueberry', 'crop:tomato'
    specimen:(list,x,z)=>{list.forEach((w,i)=>{const [a,b]=w.split(':'),R=mulberry(i+7),X=x+i*1.3;let g;
      if(a==='tree')g=M(treeParts(b,R,0x9a9ea8));else if(a==='debris')g=M(debrisParts(b,R));else if(a==='plant')g=plantGroup(b,i+7);else{const c=cropParts(b,3,i+7);g=new T.Group();g.add(M(c.leaf));if(c.fruit.length)g.add(M(c.fruit));g.scale.setScalar(0.95);}
      g.position.set(X,topY(X,z),z);scene.add(g);});},
    // a text map of tiles: g grass, s sand, b bridge, r river, . sea; P town path, T tilled, O object, F fixed, D debris
    grid:(x0,z0,x1,z1)=>{const out=[];for(let z=z0;z<=z1;z++){let l='';for(let x=x0;x<=x1;x++){const k=K(x,z),t=landMap.get(k);l+=S.tiles[k]?'T':objAt(x,z)?'O':fixedAt(x,z)?'F':debrisAt(x,z)?'D':TOWN.path.has(k)?'P':t==='grass'?'g':t==='sand'?'s':t==='bridge'?'b':t==='river'?'r':t?t[0]:'.';}out.push(String(z).padStart(3)+' '+l);}return out.join('\n');},
    showcase:()=>loadShowcase(),
    // wild-island settling: the heart's spot, revive it, place a blueprint at a spot, finish tonight's building
    heartAt:()=>TOWN.plaza.slice(),revive:()=>{if(S.heartAt)return [S.heartAt.x,S.heartAt.z];startBlueprint('seed');if(!placing||placing.bp!=='seed')return null;const at=[placing.x,placing.z];bpPlace();return S.heartAt?at:null;},bp:(k,x,z)=>{startBlueprint(k);if(x!==undefined)bpMove(x,z);return placing&&bpOk(placing.x,placing.z)?[placing.x,placing.z]:null;},bpPlace:()=>{if(placing&&placing.bp)bpPlace();},goal:()=>{const g=nextGoal();return g&&g.name;},dawn:()=>{dawn(true);return S.day;},shoo:()=>{for(const n of npcs){n.x=n.b.door[0]+0.5;n.z=n.b.door[1]+0.3;n.path=null;n.state='idle';n.wait=30;n.act=null;}return npcs.length;},
    // place every earned kit wherever there's room (clearing a patch if it has to), finished at once
    buildAll:()=>{grantKits();for(const k of Object.keys(S.kits||{})){if(!S.kits[k])continue;let at=null;for(const [x,z] of islands[0].grass){if(farmQ(x,z)<1.3)continue;S.debris=S.debris.filter(d=>!(d.x>=x&&d.x<=x+1&&d.z>=z&&d.z<=z+2));if(bpOk(x,z)){at=[x,z];break;}}
      if(!at)continue;const t=k.startsWith('vh')?'vh':k;S.builds.push({t,n:t==='vh'?+k.slice(2):undefined,x:at[0],z:at[1],day:S.day-1});delete S.kits[k];rebuildHome();}syncDebris();morningMoveIn(true);return TOWN.bld.filter(b=>!b.locked).length;},paths:()=>TOWN.path.size,wild:()=>{const c={};for(const d of S.debris)c[d.k]=(c[d.k]||0)+1;return c;},
    // Island Heart: jump to a level (as if earned, without the card), and run a morning's move-in
    setLevel:n=>{S.xp=LV[n-1]||0;grantKits();rebuildHome();initNPCs();updateHUD();return level();},moveIn:()=>{morningMoveIn();return npcs.length;},
    next:()=>{const u=nextUnlock();return u&&u.name;},xp:n=>{addXP(n);return level();},plots:()=>TOWN.bld.map(b=>b.t+(b.t==='vh'?b.n:'')+(b.locked?':plot':'')),
    // every crop at one stage, rendered at the same scale on a patch of soil (data URLs), for eyeballing the models
    dock:()=>[DOCK.x,DOCK.z],nearDebris:k=>{const d=S.debris.filter(q=>q.k===k).sort((a,b)=>Math.hypot(a.x-vil.x,a.z-vil.z)-Math.hypot(b.x-vil.x,b.z-vil.z))[0];return d&&[d.x,d.z];},calm:()=>{forageOff=true;S.finds=S.finds.filter(f=>!forageOf(f));syncLife();for(const b of bugs)scene.remove(b.g);bugs.length=0;for(let i=critters.length-1;i>=0;i--)dropCritter(i);},homeAt:()=>S.homeAt&&[S.homeAt.x,S.homeAt.z],riverSpot:()=>{let best=null,bd=1e9;for(const [k] of riverSurf){const [x,z]=k.split(',').map(Number);if(islMap.get(k)!==0)continue;const d=Math.hypot(x-vil.x,z-vil.z);if(d<bd){bd=d;best=[x,z];}}return best;},noBugs:()=>{for(const b of bugs)scene.remove(b.g);bugs.length=0;for(let i=critters.length-1;i>=0;i--)dropCritter(i);},
    findList:()=>{const o={};for(const f of S.finds)o[f.k]=(o[f.k]||0)+1;return o;},
    goNearFind:k=>{const f=S.finds.filter(q=>q.k===k).sort((a,b)=>Math.hypot(a.x-vil.x,a.z-vil.z)-Math.hypot(b.x-vil.x,b.z-vil.z))[0];if(!f)return null;
      const sp=[[2,0],[-2,0],[0,2],[0,-2],[2,2],[-2,2]].map(([a,b])=>[f.x+a,f.z+b]).find(([a,b])=>walkable(a,b))||[f.x,f.z+1];vil.x=vil.tx=sp[0];vil.z=vil.tz=sp[1];vil.path=null;cam.tx=vil.x;cam.tz=vil.z;return[f.x,f.z];},
    goNearTree:()=>{const d=S.debris.filter(q=>q.k==='tree').sort((a,b)=>Math.hypot(a.x-vil.x,a.z-vil.z)-Math.hypot(b.x-vil.x,b.z-vil.z))[0];const sp=[[2,0],[-2,0],[0,2],[0,-2]].map(([a,b])=>[d.x+a,d.z+b]).find(([a,b])=>walkable(a,b));
      vil.x=vil.tx=sp[0];vil.z=vil.tz=sp[1];vil.path=null;cam.tx=vil.x;cam.tz=vil.z;return[d.x,d.z];},
    screenOf:(x,z,h=0.1)=>{const s=toScreen(x,topY(x,z)+h,z);return[s[0],s[1]];},invCount:()=>Object.values(S.inv).reduce((a,b)=>a+b,0),shookN:()=>Object.keys(S.shook||{}).length,
    ripeNear:(t='pumpkin')=>{const x=Math.round(vil.x)+1,z=Math.round(vil.z),k=K(x,z);S.debris=S.debris.filter(d=>!(d.x===x&&d.z===z));syncDebris();S.tiles[k]={w:1,crop:{t,p:1,v:'normal',m:0}};syncCrop(k);return[x,z];},
    harvestAt:(x,z)=>{harvest(K(x,z),x,z);},
    // a butterfly a couple of tiles from you; bugAt gives its screen position and how many bugs you've caught
    bugNear:()=>{const isl=curIsl(),id=Object.keys(BUGS).find(k=>BUGS[k].kind!=='crawl'&&BUGS[k].time!=='night'&&BUGS[k].bio.includes(isl.biome));const g=bugGroup(BUGS[id]);g.scale.setScalar(BUG_SCALE);scene.add(g);
      const hx=Math.round(vil.x)+2,hz=Math.round(vil.z)+1;g.position.set(hx,topY(hx,hz)+0.4,hz);bugs.push({id,g,hx,hz,t:0,life:999,ph:0,out:0,isl:isl.id,crawl:false,still:true});return id;},
    bugAt:()=>{const b=bugs[bugs.length-1];const caught=Object.keys(S.alm).filter(k=>k.startsWith('b:')).length;if(!b)return{caught};const s=toScreen(b.g.position.x,b.g.position.y,b.g.position.z);return{x:s[0],y:s[1],n:bugs.length,caught,tool:S.tool};},
    camInfo:()=>({dist:cam.dist,pitch:cam.pitch,fov:camera.fov,pos:camera.position.toArray(),W,H,PX,hy:skyMat.uniforms.hy.value}),
    critters:()=>{const o={};for(const c of critters)o[c.k]=(o[c.k]||0)+1;return o;},spawnCritter:k=>spawnCritter(k),
    treeGallery:(size=200)=>{const out=[],so=S.seasonOv;const add=(name,parts,sm)=>{const w=new T.Group();w.add(M(parts));const box=new T.Mesh(sm?new T.BoxGeometry(1.3,1.3,1.3):new T.BoxGeometry(2.4,3.4,2.4));box.position.y=sm?0.5:1.5;box.visible=false;w.add(box);w.add(M([P(BOX,0x6aa843,0,-0.03,0,0,0,0,2,0.06,2)]));out.push([name,snapThumb(w,size)]);};
      for(const k of ['oak','pine','maple','cherry','bush','snowpine'])add(k,treeParts(k,mulberry(7),0x9a9ea8));
      for(const se of ['spring','summer','autumn','winter']){S.seasonOv=se;for(const v of [0,2,3])add(se+' '+v,wildTreeParts(v));}
      for(const lv of [1,2,4,7,11]){const q=seedTreeParts(lv);add('heart '+lv,[...q.tp,...q.p,...q.gl]);}
      for(const se of ['spring','summer','autumn','winter']){S.seasonOv=se;for(const v of [0,1,2])add('bush '+se+' '+v,bushParts(v),1);}
      for(const v of [0,1,2])add('weed '+v,debrisParts('weed',mulberry(3+v),v),1);add('rock',debrisParts('rock',mulberry(3)),1);add('boulder',debrisParts('boulder',mulberry(4)),1);S.seasonOv=so;return out;},
    critGallery:(size=160)=>Object.keys(CRIT).map(k=>{const g=critModel(k,1),w=new T.Group();w.add(g);w.add(M([P(BOX,0x6aa843,0,-0.03,0,0,0,0,1.4,0.06,1.4)]));const s=k==='deer'?1.3:0.6,box=new T.Mesh(new T.BoxGeometry(s,s,s));box.position.y=s/2;box.visible=false;w.add(box);g.rotation.y=0.6;return [k,snapThumb(w,size)];}),
    cropGallery:(stage=3,size=160)=>CROP_IDS.map((id,i)=>{const c=cropParts(id,stage,i*97+5),g=new T.Group();if(c.leaf.length)g.add(M(c.leaf));if(c.fruit.length)g.add(M(c.fruit));g.scale.setScalar(0.95);
      const w=new T.Group();w.add(g);w.add(M([P(BOX,0x5e3c2a,0,-0.03,0,0,0,0,1,0.06,1)]));const box=new T.Mesh(new T.BoxGeometry(1.1,1.5,1.1));box.position.y=0.7;box.visible=false;w.add(box);return [id,snapThumb(w,size)];}),
    ripen:()=>{for(const k in S.tiles){const t=S.tiles[k];if(t.crop)t.crop.p=1;}syncAllCrops();},
    fish:()=>{const isl=curIsl();if(!isl)return false;const [x,z]=isl.sand[0];DS.tp(x,z);startFishing(x+3,z+3);return !!fishing;},
    fastTravel:id=>fastTravel(islands[id]),
    npcRouteOnLand:()=>{updateNpcBoat(0,0);const R=npcRoute;if(!R.pts)return -1;let n=0;for(let d=0;d<R.total;d+=0.25){R.d=d;updateNpcBoat(0,0);if(seaBlocked(Math.round(npcBoat.position.x),Math.round(npcBoat.position.z)))n++;}return n;},
    sailTo:id=>{const isl=islands[id];if(!S.sea){S.sea=true;const b=S.boat;vil.x=b.x;vil.z=b.z;}sailToIsland(isl);return !!sail;},
    pick:(cx,cy)=>pick(cx,cy),heart:id=>islands[id].heart,giveSeeds:n=>{S.inv['g:driftseed']=(S.inv['g:driftseed']||0)+n;},plantHeart:id=>{plantDriftseed(islands[id]);return stageOf2(islands[id]);},tide:()=>({tideY,lowTide,finds:S.finds.filter(f=>f.tide).length}),beam:()=>({has:!!beam,vis:beam&&beam.visible,op:beamMat.opacity,nightF,parentOk:beam&&beam.parent===islands[0].group,pos:beam&&beam.position.toArray(),grpVis:islands[0].group.visible}),spots:()=>({cafe:(TOWN.bld.find(b=>b.t==='cafe')||{}).x!==undefined?[TOWN.bld.find(b=>b.t==='cafe').x,TOWN.bld.find(b=>b.t==='cafe').z]:null,light:TOWN.light&&[TOWN.light.x,TOWN.light.z],shop:(b=>b&&[b.x,b.z])(TOWN.bld.find(b=>b.t==='shop'))}),view:(x,z,yaw,dist,pitch)=>{introCam=null;S.sea=false;vil.x=vil.tx=x;vil.z=vil.tz=z;vil.path=null;cam.tx=x;cam.tz=z;cam.yaw=yaw;cam.dist=dist;if(pitch)cam.pitch=pitch;},homes:()=>TOWN.bld.filter(b=>b.t==='vh').map(b=>[b.x,b.z,planVillagers()[b.n%6].pers]),plaza:()=>TOWN.plaza.slice(),lineup:(list)=>{const g=new T.Group();g.name='lineup';(list||Object.keys(SPECIES)).forEach((sp,i)=>{const L=Object.keys(STYLE),pe=L[i%L.length],st=STYLE[pe];const m=npcModel(sp,SPECIES[sp].col[0],[0x6ab8a8,0x5a8ae0,0xe8866a,0xd8b84a,0xf39ab0,0x9a8ad8][i%6],st.a[i%st.a.length],st.o[i%st.o.length]);const x=vil.x-3+(i%7)*1.0,z=vil.z-1-Math.floor(i/7)*1.4;m.position.set(x,surfY(x,z),z);g.add(m);});scene.add(g);return (list||Object.keys(SPECIES)).length;},npcAt:i=>{const n=npcs[i];return[n.x,n.z];},bldAt:t=>{const b=TOWN.bld.find(q=>q.t===t);return b?[b.x,b.z]:null;},calls:()=>{const out={};const names=new Map([[debrisRoot,'debris'],[lifeRoot,'life']]);try{names.set(cropRoot,'crops');}catch(e){}try{names.set(objRoot,'objs');}catch(e){}
      scene.traverseVisible(o=>{if(!(o.isMesh||o.isPoints||o.isLine))return;let p=o,k=null;while(p&&p!==scene){if(names.has(p)){k=names.get(p);break;}const ii=islands.findIndex(i=>i.group===p||i.pgroup===p);if(ii>=0){k=ii===0?'home':'isl';break;}if(npcs.some(n=>n.g===p)){k='npc';break;}if(p===villager){k='player';break;}p=p.parent;}
        k=k||('scene:'+(o.name||o.type)+':'+(o.material&&o.material.type));out[k]=(out[k]||0)+1;});return Object.entries(out).sort((a,b)=>b[1]-a[1]).slice(0,20).map(x=>x.join(' '));},tris:()=>{const out={};const tag=o=>{let p=o;while(p){if(p.userData&&p.userData.tag)return p.userData.tag;if(islands.some(i=>i.group===p))return 'isl'+islands.findIndex(i=>i.group===p)+':'+(o.isInstancedMesh?'inst':'mesh');if(p===scene)break;p=p.parent;}return (o.isInstancedMesh?'inst:':'mesh:')+(o.material&&o.material.type)+(o.parent===scene?'@scene':'');};
      scene.traverseVisible(o=>{if(!(o.isMesh||o.isInstancedMesh||o.isPoints))return;const g=o.geometry;if(!g)return;const n=(g.index?g.index.count:g.attributes.position.count)/3*(o.isInstancedMesh?o.count:1);const k=tag(o);out[k]=out[k]||{tris:0,n:0,shadow:0};out[k].tris+=n;out[k].n++;if(o.castShadow)out[k].shadow+=n;});
      return Object.entries(out).sort((a,b)=>b[1].tris-a[1].tris).slice(0,25).map(([k,v])=>k+' '+Math.round(v.tris)+' ('+v.n+' objs, shadow '+Math.round(v.shadow)+')');},perf:()=>({...FRAME_STAT,shadowCasters:(()=>{let n=0;scene.traverseVisible(o=>{if((o.isMesh||o.isInstancedMesh)&&o.castShadow)n++;});return n;})()}),zoom:d=>{cam.dist=d;},collectAll:()=>{for(const k in FISH)S.alm['f:'+k]=1;for(const k in BUGS)S.alm['b:'+k]=1;refreshMuseumShow();},enterMuseum:()=>enterHouse('museum',TOWN.bld.find(b=>b.t==='museum'),null),museumDoor:()=>{const b=TOWN.bld.find(q=>q.t==='museum');return b.door;},roomGo:(x,z)=>{inside.tx=x;inside.tz=z;},look:(sp,fur,shirt)=>{setLook(Object.assign({sp},fur?{fur}:{},shirt?{shirt}:{}));return S.look;},beach:id=>{const i=islands[id],s=i.sand.filter(([x,z])=>{const c=SAND_CH.get(K(x,z));return c&&Math.min(...c)<0.1;});return s[Math.floor(s.length/3)]||i.sand[0];},tool:k=>{equip(k);return S.tool;},tile:(x,z)=>S.tiles[K(x,z)]||null,vil:()=>({x:vil.x,z:vil.z}),
    boat:()=>({x:S.boat.x,z:S.boat.z,onLand:seaBlocked(Math.round(S.boat.x),Math.round(S.boat.z)),sailing:!!sail}),
  };
  console.info('Driftseed debug API ready: window.DS');
}
