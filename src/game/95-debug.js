/* =========================================================
   Debug / test API — only when the page is opened with ?debug
   Used by tools/smoke.mjs; handy from the browser console too (window.DS).
   ========================================================= */
if(/[?&]debug\b/.test(location.search)){
  const tileKeys=()=>islands[0].grass.map(([x,z])=>[x,z]);
  window.DS={
    state:()=>({day:S.day,hour:S.hour,shells:S.shells,sea:S.sea,loc:locName(),tiles:Object.keys(S.tiles).length,inv:{...S.inv},store:{...S.store},
      islands:islands.length,town:TOWN.name,buildings:TOWN.bld.map(b=>b.t),npcs:npcs.map(n=>n.name+' ('+n.pers+' '+n.sp+', '+n.state+')'),px:PX,perfPx:PERF.px,inside:inside?inside.title:null}),
    hour:h=>{S.hour=h;applyTime();},
    tp:(x,z)=>{S.sea=false;vil.x=vil.tx=x;vil.z=vil.tz=z;vil.path=null;cam.tx=x;cam.tz=z;},
    visit:id=>{const i=islands[id];S.disc[id]=1;const sp=(i.spots&&i.spots[1])||i.grass[0];DS.tp(sp[0]+0.6,sp[1]+0.6);},
    islands:()=>islands.map(i=>({id:i.id,biome:i.biome,name:i.name,x:i.cx,z:i.cz,r:Math.round(islR(i)),grand:!!i.grand,river:(i.rtiles||[]).length})),
    screen:(x,z)=>toScreen(x,topY(x,z),z),
    npcScreen:i=>{const n=npcs[i];return toScreen(n.x,n.y+0.5,n.z);},
    freeRow:(len=5)=>{for(const [x,z] of tileKeys()){let ok=true;for(let i=0;i<len&&ok;i++){const k=K(x+i,z);ok=landMap.get(k)==='grass'&&freeTile(x+i,z)&&!fixedAt(x+i,z)&&farmQ(x+i,z)>1.3&&(lvlMap.get(k)||0)===(lvlMap.get(K(x,z))||0);}if(ok)return[x,z];}return null;},
    give:(items)=>{Object.assign(S.inv,items||{'m:wood':14,'m:stone':11,'m:fiber':9,'g:shell':4,'f:sardine':2,'tomato|normal':3,'tomato|golden':1});updateHUD();},
    craft:i=>craft(i),sheet:(k,tab)=>openSheet(k,tab),closeSheet:()=>closeSheet(),
    enterHome:()=>enterHouse('home'),enterNpc:i=>{const n=npcs[i];enterHouse('vh',n.b,n);},leave:()=>leaveHouse(),
    ripen:()=>{for(const k in S.tiles){const t=S.tiles[k];if(t.crop)t.crop.p=1;}syncAllCrops();},
    fish:()=>{const isl=curIsl();if(!isl)return false;const [x,z]=isl.sand[0];DS.tp(x,z);startFishing(x+3,z+3);return !!fishing;},
    fastTravel:id=>fastTravel(islands[id]),
    npcRouteOnLand:()=>{updateNpcBoat(0,0);const R=npcRoute;if(!R.pts)return -1;let n=0;for(let d=0;d<R.total;d+=0.25){R.d=d;updateNpcBoat(0,0);if(seaBlocked(Math.round(npcBoat.position.x),Math.round(npcBoat.position.z)))n++;}return n;},
    sailTo:id=>{const isl=islands[id];if(!S.sea){S.sea=true;const b=S.boat;vil.x=b.x;vil.z=b.z;}sailToIsland(isl);return !!sail;},
    boat:()=>({x:S.boat.x,z:S.boat.z,onLand:seaBlocked(Math.round(S.boat.x),Math.round(S.boat.z)),sailing:!!sail}),
  };
  console.info('Driftseed debug API ready: window.DS');
}
