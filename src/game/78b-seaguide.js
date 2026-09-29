/* =========================================================
   Finding your way at sea: markers at the edge of the screen for the islands around you (named once charted, a
   question mark for rumours), each tappable to set course; gulls wheeling over the nearest uncharted island.
   ========================================================= */
let markT=0;const marks=new Map();
function seaMarks(){const box=$('seamarks');if(!box)return;if(!S.sea||inside||sheet){box.hidden=true;return;}box.hidden=false;
  const W=innerWidth,H=innerHeight,top=150,bot=H-175,pad=40;
  // the nearest few islands, charted or not, within sight of a long voyage
  const near=islands.filter(i=>!i.home||Math.hypot(i.cx-vil.x,i.cz-vil.z)>14).map(i=>[i,Math.hypot(i.cx-vil.x,i.cz-vil.z)]).filter(([,d])=>d<190).sort((a,b)=>a[1]-b[1]).slice(0,5);
  const keep=new Set();
  for(const [isl,d] of near){keep.add(isl.id);let el=marks.get(isl.id);
    if(!el){el=document.createElement('button');el.className='smark';el.onclick=e=>{e.stopPropagation();SFX.ui();buzz(8);sailToIsland(isl);say(S.disc[isl.id]?`Setting course for <b>${isl.name}</b>.`:'Setting course for… somewhere new.');};box.appendChild(el);marks.set(isl.id,el);}
    const known=!!S.disc[isl.id]||isl.home,label=known?(isl.home?'Home':isl.name):'???',lg=Math.round(d);
    const h=`<i></i><b>${label}</b><small>${lg} lg</small>`;if(el.dataset.h!==h){el.innerHTML=h;el.dataset.h=h;}el.classList.toggle('unk',!known);
    const [sx,sy,sz]=toScreen(isl.cx,1.5,isl.cz);let x=sx,y=sy,on=sz<1&&sx>pad&&sx<W-pad&&sy>top&&sy<bot;
    if(!on){// clamp to the edge along the direction from the middle of the screen
      let dx=sx-W/2,dy=sy-H/2;if(sz>=1){dx=-dx;dy=-dy;}const k=Math.min((W/2-pad)/Math.abs(dx||1e-6),((dy<0?H/2-top:bot-H/2))/Math.abs(dy||1e-6));x=W/2+dx*k;y=H/2+dy*k;}
    const ang=Math.atan2(sy-y,sx-x);el.style.transform=`translate(${Math.round(x)}px,${Math.round(y)}px) translate(-50%,-50%)`;el.classList.toggle('edge',!on);
    el.querySelector('i').style.transform=`rotate(${ang}rad) translateX(${Math.max(28,el.offsetWidth/2+6)}px)`;}
  for(const [id,el] of marks)if(!keep.has(id)){el.remove();marks.delete(id);}}
// seabirds circle over land long before you can see it
let gullIsl=null;
function updateSeaGuide(dt,tt){markT-=dt;if(markT<=0){markT=0.12;seaMarks();}
  if(!S.sea){gullIsl=null;return;}
  const und=islands.filter(i=>!S.disc[i.id]).map(i=>[i,Math.hypot(i.cx-vil.x,i.cz-vil.z)]).sort((a,b)=>a[1]-b[1])[0];
  if(und&&und[1]<120&&gullIsl!==und[0]){gullIsl=und[0];if(und[1]>40)say('Gulls on the horizon… there must be land that way.');}}
