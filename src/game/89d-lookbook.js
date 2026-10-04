/* =========================================================
   Dev: the Lookbook, a tiny flat test island laid out like a specimen garden, for choosing how the game looks.
     - the crop beds: every crop in a row: three growth stages, then grown, then each of its rare forms
       (rainbow, crystal, golden, moonlit, giant)
     - the arboretum: every tree species in both its shapes, in two rows, and the three kinds of bush
     - a flower border and a little lawn to judge the grass by
   A bar along the top switches, live: the colour style (every Visual style, including the ambient ones in 30b-fx),
   the grass palette (GRASS_PALS, 40-world) and the season. Whatever you pick stays when you go home.
   Temporary like the other dev islands: "Restore my save" in Settings brings your own island back.
   ========================================================= */
const LOOKBOOK={seed:5150,scale:0.9,shape:[0.02,0.02,0.01,1,2,3,3.2],dockX:-4,home:[-14,-6],heart:[13,-6],fire:[0,12]};
function loadLookbook(){
  try{if(!S.showcase)localStorage.setItem(REAL_KEY,JSON.stringify(S));}catch(e){toast('Could not back up your save, so the Lookbook was not loaded.');return;}
  const D=LOOKBOOK;S.showcase=1;S.worldSeed=D.seed;
  S.home={style:'meadow',shape:D.shape,coves:[],cliff:[2,0],riv:0,wild:0.1,scale:D.scale,dockX:D.dockX,fire:D.fire};
  S.scratch=1;S.wild=1;S.islandName='Lookbook Isle';S.homeAt={x:D.home[0],z:D.home[1]};S.house=3;
  S.heartAt={x:D.heart[0],z:D.heart[1]};S.heart={planted:1,revived:1};S.builds=[];S.moved={};S.kits={};
  S.debris=[];S.weeds=[];S.finds=[];S.objs=[];S.tiles={};S.paths={};S.farmInit=0;S.tidy=1;S.day=Math.max(S.day||1,2);
  S.boat=null;S.sea=false;S.tut=2;S.tipTools=1;S.tipSeed=1;S.tipPaint=1;S.boatTip=1;S.rain=false;
  vil.x=vil.tx=0.5;vil.z=vil.tz=4.5;S.lookLay=1;S.lookNew=1;S.lookbook=1;
  save();resetting=true;location.reload();}
function layLookbook(){dreamProgress();const occ=new Set();let id=S.nextId||1;const k2=K;
  const grass=(x,z)=>landMap.get(K(x,z))==='grass'&&islMap.get(K(x,z))===0&&!(lvlMap.get(K(x,z))||0);
  const D=LOOKBOOK;for(const [x,z] of [D.home,D.heart])for(let a=-1;a<=2;a++)for(let b=-1;b<=2;b++)occ.add(k2(x+a,z+b));
  const obj=(k,x,z,r=0)=>{if(!BUILD[k]||!grass(x,z)||occ.has(k2(x,z)))return false;S.objs.push({id:id++,k,x,z,r});occ.add(k2(x,z));return true;};
  const crop=(t,x,z,p,v)=>{if(!grass(x,z)||occ.has(k2(x,z)))return;S.tiles[k2(x,z)]={w:1,crop:{t,p,v,m:0}};occ.add(k2(x,z));};
  const deb=(k,x,z,v)=>{if(!grass(x,z)||occ.has(k2(x,z)))return;S.debris.push({x,z,k,v,r:0.4,hp:DEBRIS[k].hp});occ.add(k2(x,z));};
  S.debris=[];S.weeds=[];S.finds=[];
  // the crop beds: two blocks side by side, a crop to a row; stepping stones between the blocks
  const forms=[[0.2,'normal'],[0.45,'normal'],[0.72,'normal'],[1,'normal'],[1,'rainbow'],[1,'crystal'],[1,'golden'],[1,'moonlit'],[1,'giant']];
  const half=Math.ceil(CROP_IDS.length/2),X0=-10,Z0=-2;
  CROP_IDS.forEach((t,i)=>{const bx=X0+(i<half?0:10),z=Z0+(i%half);forms.forEach(([p,v],j)=>crop(t,bx+j,z,p,v));});
  for(let z=Z0-1;z<=Z0+half;z++)obj('stonepath',X0+9,z);
  // the arboretum north of the beds: each species in both shapes, then the bushes and a flower border
  for(let s=0;s<TREE_NS;s++){deb('tree',-10+s*2,Z0-7,s);deb('tree',-10+s*2,Z0-4,s+TREE_NS);}
  for(let v=0;v<3;v++){deb('bush',10+v,Z0-7,v);deb('bush',10+v,Z0-4,v);}
  for(let x=-11;x<=11;x++)obj('stonepath',x,Z0-2);
  for(let x=-10;x<=10;x+=2)obj('flowers',x,Z0+half+1);obj('bench',0,Z0+half+3,Math.PI);obj('lamppost',-2,Z0+half+3);obj('lamppost',2,Z0+half+3);
  S.nextId=id;rebuildHome();}
if(S.lookNew){delete S.lookNew;setTimeout(()=>toast('Welcome to the <b>Lookbook</b>: every crop, tree and bush in one garden. Use the bar along the top to try colour styles, grass and seasons. Settings → <b>Restore my save</b> takes you home.','rare',ICON.star),1600);}

// ---- the picker bar (only on the Lookbook island)
function lookbar(){let el=$('lookbar');if(!S.lookbook||!S.showcase){if(el)el.remove();return;}
  if(!el){el=document.createElement('div');el.id='lookbar';document.body.appendChild(el);
    el.addEventListener('pointerdown',e=>e.stopPropagation());
    el.addEventListener('click',e=>{e.stopPropagation();const b=e.target.closest('button');if(!b)return;const d=b.dataset;SFX.ui();
      if(d.lfx)setFx(d.lfx);
      if(d.lgr!==undefined){S.grassPal=d.lgr||null;seasonCheck(true);save();}
      if(d.lse!==undefined){S.seasonOv=d.lse||null;seasonCheck(true);save();}
      if(d.lmin)S.lbMin=!S.lbMin;renderLookbar();});}
  renderLookbar();}
function renderLookbar(){const el=$('lookbar');if(!el)return;const fx=S.fx||'island',gp=S.grassPal||'',se=S.seasonOv||'';
  const row=(lbl,items)=>`<div class="lbrow"><span class="lbl">${lbl}</span><div class="chips">${items}</div></div>`;
  el.className=S.lbMin?'min':'';
  el.innerHTML=`<button class="lbtog" data-lmin="1">${S.lbMin?'Lookbook ▾':'Lookbook ▴'}</button>`+(S.lbMin?'':
    row('Colour',Object.entries(FXS).map(([k,f])=>`<button class="${fx===k?'on':''}" data-lfx="${k}">${f.name}</button>`).join(''))+
    row('Grass',[['','Lush'],...Object.entries(GRASS_PALS).map(([k,g])=>[k,g.name])].map(([k,n])=>`<button class="${gp===k?'on':''}" data-lgr="${k}"><i style="background:#${(k?GRASS_PALS[k].c[0]:SEASON_GRASS.summer[0]).toString(16).padStart(6,'0')}"></i>${n}</button>`).join(''))+
    row('Season',[['','Now'],['spring','Spring'],['summer','Summer'],['autumn','Autumn'],['winter','Winter']].map(([k,n])=>`<button class="${se===k?'on':''}" data-lse="${k}">${n}</button>`).join('')));}
setTimeout(lookbar,900);
