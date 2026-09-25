/* =========================================================
   New game setup
   ========================================================= */
function ensureBoat(force){const isl=islands[0],dock={x:DOCK.x+1.05,z:isl.dockZ+2.4,r:0.12};
  if(!S.boat)S.boat=dock;else if(force&&!S.sea&&isLand(Math.round(S.boat.x),Math.round(S.boat.z)))S.boat=dock;}
function setupNew(){
  S.objs=[];const add=(k,x,z,r=0)=>{if(isLand(x,z)&&!fixedAt(x,z)&&!objAt(x,z)&&!S.tiles[K(x,z)])S.objs.push({id:S.nextId++,k,x,z,r});};
  const plot=TOWN.plot||[];plot.forEach(([x,z])=>S.tiles[K(x,z)]={w:1,crop:null});
  if(plot[0])S.tiles[K(...plot[0])].crop={t:'turnip',p:0.55,v:null,m:0};if(plot[1])S.tiles[K(...plot[1])].crop={t:'turnip',p:0.2,v:null,m:0};
  add('flowers',HOUSE_AT.x-1,HOUSE_AT.z+1);
  S.hour=7.2;S.demand='carrot';S.rain=false;
  S.finds=[];S.weeds=[];for(let i=0;i<3;i++)spawnFind(true,islands[0]);for(let i=0;i<2;i++)spawnWeed(true);makeOrders();
  const near=islands.slice(1).sort((a,b)=>Math.hypot(a.cx,a.cz)-Math.hypot(b.cx,b.cz))[0];if(near)S.disc[near.id]=1;
}

