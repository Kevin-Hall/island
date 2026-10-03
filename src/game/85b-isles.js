/* =========================================================
   What makes each island your own: its character and its landmarks
   ========================================================= */
// Every home island shares the temperate world and its real seasons, but each has a character (ISLE_KINDS): which
// trees grow there and how thickly (wildSpecies, genWild in 53-wild), a tint to its grass, the shape of its coast, the
// sort of name it suggests, and the landmarks it holds. Landmarks (S.home.marks) are real places on the land, chosen
// on arrival where they suit it (stones on the high ground, a wreck on a far beach, a tower inland): you glimpse them
// from the raft, find them on foot (checkMarks: a discovery, a little reward and a line in your journal), and they
// stay on the island, solid, for good (addMarks, from buildIsland). isleChart draws the island as a hand-drawn chart
// for the arrival card.
const ISLE_KINDS={
  pinewood:{name:'Pinewood isle',line:'Tall dark pines, cool shade and the smell of resin.',mixA:[8,8,1,1,8,1],mixB:[7,1,8,0,8],grand:[8,1,8],wild:[0.68,0.86],tint:[0.03,-0.1,-0.07],
    shapes:['ragged','bay'],marks:['stones','cairn','ruin'],names:['Pinehollow','Resin Point','Spruce Rock','Needle Isle','Darkwood'],hints:['deer moving quietly between the pines','squirrels chattering in the spruce']},
  orchard:{name:'Orchard isle',line:'Old fruit trees gone wild: apples, pears and peaches for the shaking.',mixA:[4,5,6,4,5,3],mixB:[0,4,5,7,2],grand:[4,5,4],wild:[0.32,0.5],tint:[-0.015,0.08,0.02],
    shapes:['round','bay'],marks:['wreck','ruin','stones'],names:['Applegarth','Pearhaven','Old Orchard','Bramblecove','Honeyfield'],hints:['bees drifting between the fruit trees','rabbits nibbling windfalls']},
  birch:{name:'Silver birch isle',line:'Pale birch and poplar, light falling through the leaves.',mixA:[7,7,9,7,9],mixB:[7,0,9,1],grand:[7,9,7],wild:[0.45,0.64],tint:[0.01,-0.06,0.06],
    shapes:['pinched','round'],marks:['ruin','stones','wreck'],names:['Silverwood','Birchlight','Whitebark','Paleglen','Poplar Bay'],hints:['birds singing in the birches','rabbits in the long grass']},
  maple:{name:'Maple isle',line:'Broad maples and old oaks, fire-bright when autumn comes.',mixA:[2,2,0,2,0],mixB:[0,0,2,9,7],grand:[12,10,2],wild:[0.5,0.7],tint:[-0.025,0.05,-0.02],
    shapes:['ragged','round'],marks:['lonetree','ruin','cairn'],names:['Maplehurst','Emberwood','Oakenshaw','Redleaf','Copperglen'],hints:['squirrels burying acorns','a deer in the woods at dawn']},
  blossom:{name:'Cherry isle',line:'Cherry trees everywhere: a cloud of pink in spring.',mixA:[3,3,3,0,3],mixB:[3,0,7,4,1],grand:[3,3,10],wild:[0.38,0.56],tint:[0.015,0.06,0.04],
    shapes:['bay','pinched'],marks:['stones','wreck','lonetree'],names:['Sakura Point','Petalbay','Blossomholm','Pinkwater','Cherrybrook'],hints:['bees in the blossom','frogs singing by the water']},
  meadow:{name:'Meadow isle',line:'Rolling grass and wildflowers, and a lone tree on the rise.',mixA:[0,9,2,0],mixB:[0,7,4],grand:[10,12,10],wild:[0.12,0.28],tint:[-0.02,0.1,0.04],
    shapes:['round','ragged','bay'],marks:['lonetree','cairn','wreck'],names:['Windmere','Longmeadow','Clover Isle','Fairfield','Skylark Hill'],hints:['butterflies over the flowers','rabbits on the open grass']}};
const MARKS={stones:{name:'The Standing Stones',say:'standing stones',r:2,where:'on the high ground'},cairn:{name:'The Old Cairn',say:'an old cairn',r:1,where:'up on the cliffs'},
  ruin:{name:'The Old Tower',say:'a ruined tower',r:2,where:'among the trees'},wreck:{name:'A Wrecked Boat',say:'a wrecked boat',r:1,where:'on the shore'},lonetree:{name:'The Lone Tree',say:'a great lone tree',r:3,where:'on a rise'}};
const DIRS8=['east','south-east','south','south-west','west','north-west','north','north-east'];
// a candidate's coast for its character: a round island, one with a great bay, a ragged one, or one pinched at the waist
function isleShape(kind,r){const t=kind.shapes[Math.floor(r()*kind.shapes.length)],coves=[];
  const cove=(a,d,w)=>coves.push([a,d,w]),notWest=()=>{let a;do a=r()*6.283;while(Math.abs(Math.atan2(Math.sin(a-Math.PI),Math.cos(a-Math.PI)))<0.7);return a;};/* (the farm lies west) */
  let shape;
  if(t==='round'){shape=[0.02+r()*0.04,r()*0.03,r()*0.02,r()*6.283,r()*6.283,r()*6.283,2.3+r()*0.5];for(let i=0;i<1+Math.floor(r()*2);i++)cove(notWest(),0.12+r()*0.08,0.16+r()*0.1);}
  else if(t==='bay'){shape=[0.03+r()*0.05,r()*0.05,r()*0.03,r()*6.283,r()*6.283,r()*6.283,3+r()*1.2];cove(notWest(),0.38+r()*0.06,0.5+r()*0.15);cove(notWest(),0.12+r()*0.08,0.15+r()*0.1);}
  else if(t==='ragged'){shape=[0.08+r()*0.06,0.06+r()*0.05,0.04+r()*0.04,r()*6.283,r()*6.283,r()*6.283,3.4+r()*1.4];for(let i=0;i<4+Math.floor(r()*2);i++)cove(notWest(),0.14+r()*0.16,0.12+r()*0.14);}
  else{shape=[0.02+r()*0.04,r()*0.04,r()*0.03,r()*6.283,r()*6.283,r()*6.283,3+r()*1.5];const a=Math.PI/2+(r()-0.5)*0.5;cove(a,0.36+r()*0.06,0.32+r()*0.08);cove(a+Math.PI,0.34+r()*0.06,0.3+r()*0.08);}
  return{t,shape,coves};}
const isleKind=()=>S.home&&ISLE_KINDS[S.home.kind]||null;
// the grass, nudged toward the island's character (hue, saturation, lightness shifts) whatever the season
function isleTint(cols){const k=isleKind();if(!k)return cols;const c=new T.Color();return cols.map(h=>c.setHex(h).offsetHSL(...k.tint).getHex());}

/* ---- landmarks ---- */
// choose where each of the island's landmarks stands (after its wild growth), clearing the ground around it
function placeMarks(kind){const isl=islands[0],R=mulberry((S.worldSeed|0)^0x77a1),out=[],want=kind.marks.slice(0,2);
  const land=(x,z,t)=>{const v=landMap.get(K(x,z));return t?v===t:v==='grass';},lv=(x,z)=>lvlMap.get(K(x,z))||0;
  const room=(x,z,r,t)=>{for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){if(dx*dx+dz*dz>r*r+1)continue;const a=x+dx,b=z+dz;if(!land(a,b,t)||islMap.get(K(a,b))!==0||lv(a,b)!==lv(x,z)||riverSurf.has(K(a,b)))return false;}return true;};
  const apart=(x,z)=>out.every(m=>Math.hypot(m.x-x,m.z-z)>12),fromDock=(x,z)=>Math.hypot(x-DOCK.x,z-DOCK.z);
  const seaNext=(x,z)=>[[1,0],[-1,0],[0,1],[0,-1],[2,0],[-2,0],[0,2],[0,-2]].some(([a,b])=>!isLandT(landMap.get(K(x+a,z+b)))&&!riverSurf.has(K(x+a,z+b)));
  for(const k of want){const M0=MARKS[k];let best=null,bs=-1e9;
    for(const [x,z] of k==='wreck'?isl.sand:isl.grass){if(farmQ(x,z)<1.3||fromDock(x,z)<(k==='wreck'?12:10)||!apart(x,z))continue;
      if(k==='wreck'&&!seaNext(x,z))continue;if(!room(x,z,M0.r,k==='wreck'?'sand':null))continue;
      const s=(k==='stones'||k==='lonetree'?lv(x,z)*6:k==='cairn'?lv(x,z)*9:0)+(k==='ruin'?Math.min(fromDock(x,z),26)*0.4:fromDock(x,z)*0.15)+R()*4;
      if(s>bs){bs=s;best=[x,z];}}
    if(!best)continue;const [x,z]=best;out.push({k,x,z,name:M0.name});
    S.debris=S.debris.filter(d=>Math.hypot(d.x-x,d.z-z)>M0.r+1.5);
    if(k==='lonetree'){const d=newDebris(x,z,'tree');d.v=kind.grand[0];d.r=R()*6.28;d.sc=2.05;d.grand=1;d.mark=1;S.debris.push(d);}}
  return out;}
// where a landmark is, said the way you'd say it from the raft
function markWhere(m){const isl=islands[0];let cx=0,cz=0;for(const [x,z] of isl.grass){cx+=x;cz+=z;}cx/=isl.grass.length||1;cz/=isl.grass.length||1;
  const a=Math.atan2(m.z-cz,m.x-cx);return MARKS[m.k].where+' to the '+DIRS8[Math.round(((a+6.283)%6.283)/0.785)%8];}
// the landmarks' models (stone, timber), set on the ground and made solid (TOWN.fixed 'mark'); the lone tree is a tree
function addMarks(isl){const ms=S.home&&S.home.marks;if(!ms||!ms.length)return;const p=[];
  for(const m of ms){const {x,z}=m,y=topY(x,z),h=hash(x,z)*6.28;
    if(m.k==='stones'){for(let i=0;i<7;i++){const a=h+i/7*6.283,r=1.55,s=0.85+hash(i,x)*0.5;p.push(P(BOX,i%3?0x9c9a90:0x8c9284,x+Math.cos(a)*r,y+0.42*s,z+Math.sin(a)*r,(hash(z,i)-0.5)*0.18,-a,(hash(i,z)-0.5)*0.16,0.34,0.95*s,0.24));
        if(i%2)p.push(P(ICO2,0x7c9a5a,x+Math.cos(a)*r,y+0.92*s,z+Math.sin(a)*r,0,a,0,0.26,0.07,0.2));}/* (moss on the tops) */
      p.push(P(BOX,0xa6a296,x,y+0.14,z,0,h,0,0.9,0.22,0.55));}
    else if(m.k==='cairn'){let yy=y;for(let i=0;i<5;i++){const s=0.62-i*0.1;p.push(P(ICO2,i%2?0xa8a49a:0x948f86,x+(hash(i,z)-0.5)*0.08,yy+s*0.28,z+(hash(z,i)-0.5)*0.08,0,h+i,0,s,s*0.55,s*0.9));yy+=s*0.5;}
      for(let i=0;i<5;i++){const a=h+i*1.3;p.push(P(ICO2,0x8a867c,x+Math.cos(a)*0.62,y+0.07,z+Math.sin(a)*0.62,0,a,0,0.22,0.14,0.2));}}
    else if(m.k==='ruin'){p.push(P(TOWER,0xb0a99c,x,y+0.95,z,0,h,0,1.7,1.9,1.7));
      for(let i=0;i<5;i++){const a=h+i*1.256,hh=0.25+hash(i,x)*0.45;p.push(P(BOX,i%2?0xa49d90:0xbab3a6,x+Math.cos(a)*0.62,y+1.9+hh/2,z+Math.sin(a)*0.62,0,-a,0,0.42,hh,0.3));}
      p.push(P(BOX,0x4a4038,x+Math.cos(h)*0.84,y+0.45,z+Math.sin(h)*0.84,0,-h,0,0.12,0.8,0.48));/* (the doorway) */
      for(let i=0;i<7;i++){const a=h+i*0.9+0.4,d=1.25+hash(i,z)*0.6;p.push(P(BOX,0xa49d90,x+Math.cos(a)*d,y+0.1,z+Math.sin(a)*d,hash(a,i),a,hash(i,a),0.3,0.2,0.24));}
      for(let i=0;i<4;i++){const a=h+i*1.6;p.push(P(ICO2,0x6e9a4c,x+Math.cos(a)*0.95,y+0.5+i*0.3,z+Math.sin(a)*0.95,0,0,0,0.3,0.4,0.3));}}/* (ivy) */
    else if(m.k==='wreck'){const g=[];/* a small boat on its side, ribs showing, its mast snapped */
      for(let i=0;i<5;i++){const t=(i-2)*0.42;g.push(P(BOX,i%2?0x7a5634:0x6a4a2e,t,0.32,0,0,0,0.5,0.4,0.08,1.0),P(BOX,0x5a3c24,t,0.18,0.42,0.3,0,0.5,0.08,0.5,0.08));}
      g.push(P(BOX,0x6a4a2e,0,0.06,0,0,0,0.5,2.2,0.1,0.95),P(CYL8,0x8a6844,0.3,0.55,-0.6,1.1,0,0.4,0.1,1.3,0.1),P(BOX,0xe8dcc0,-0.6,0.12,0.7,-1.4,0.4,0,0.7,0.02,0.5),P(BOX,0x5a3c24,1.1,0.25,0,0,0,0.9,0.12,0.6,0.5));
      for(const q of g){const c=Math.cos(h),s=Math.sin(h),qx=q.x,qz=q.z;q.x=x+qx*c-qz*s;q.z=z+qx*s+qz*c;q.y+=y;q.ry+=-h;p.push(q);}}}
  if(p.length){const me=M(p);me.castShadow=true;me.receiveShadow=true;isl.group.add(me);}
  for(const m of ms){if(m.k==='lonetree')continue;const r=m.k==='stones'||m.k==='ruin'?1:0;for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++)TOWN.fixed.set(K(m.x+dx,m.z+dz),'mark');}}
const markAt=(x,z)=>(S.home&&S.home.marks||[]).find(m=>Math.hypot(m.x-x,m.z-z)<=MARKS[m.k].r+0.6);
// walking up to a landmark for the first time: a discovery, a small reward, and a line in your journal
const MARK_GIFT={stones:['stone',3,40],cairn:['stone',2,30],ruin:['stone',4,60],wreck:['wood',4,90],lonetree:['wood',3,30]};
function checkMarks(){const ms=S.home&&S.home.marks;if(!ms||S.sea||inside)return;
  for(const m of ms){if(m.found||Math.hypot(vil.x-m.x,vil.z-m.z)>3.4)continue;m.found=S.day||1;const [mat,n,sh]=MARK_GIFT[m.k];
    gain('m:'+mat,n);S.shells+=sh;addXP(12);logEvent('landmark',{name:m.name});SFX.level&&SFX.level();
    toast(`<b>Discovered: ${m.name}</b><br>${{stones:'Old stones in a ring. Someone stood here long ago.',cairn:'A pile of stones left by someone who climbed this far.',ruin:'A tower, long fallen in. Ivy holds it together now.',wreck:'A little boat, broken on the rocks. There\'s still something in it.',lonetree:'The oldest tree on the island, alone on its rise.'}[m.k]}<br><small>+${n} ${MATS[mat].name}, +${sh} shells</small>`,'rare',ICON.star);
    hearts(m.x,1.4,m.z);updateHUD();save();}}
// the island as a little hand-drawn chart: sea, sand, grass shaded by height, rivers, woods and the landmarks
function isleChart(w,h){const isl=islands[0],cv=document.createElement('canvas'),dpr=2;cv.width=w*dpr;cv.height=h*dpr;const x=cv.getContext('2d');
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const k of isl.keys){const [a,b]=k.split(',').map(Number);if(!isLandT(landMap.get(k))&&!riverSurf.has(k))continue;x0=Math.min(x0,a);x1=Math.max(x1,a);z0=Math.min(z0,b);z1=Math.max(z1,b);}
  const s=Math.min(cv.width/(x1-x0+4),cv.height/(z1-z0+4)),ox=(cv.width-(x1-x0+1)*s)/2,oz=(cv.height-(z1-z0+1)*s)/2,X=a=>ox+(a-x0)*s,Z=b=>oz+(b-z0)*s;
  x.fillStyle='#b8d4d2';x.fillRect(0,0,cv.width,cv.height);
  for(const k of isl.keys){const t=landMap.get(k),[a,b]=k.split(',').map(Number),l=lvlMap.get(k)||0;
    x.fillStyle=riverSurf.has(k)||t==='river'?'#6fa4bf':t==='sand'?'#ead7a8':t==='grass'?['#a7c47a','#8fb466','#7aa255','#68904a'][Math.min(3,l)]:null;if(!x.fillStyle||!t&&!riverSurf.has(k))continue;x.fillRect(X(a),Z(b),s+0.6,s+0.6);}
  x.fillStyle='rgba(60,96,50,0.85)';for(const d of S.debris)if(d.k==='tree'){x.beginPath();x.arc(X(d.x)+s/2,Z(d.z)+s/2,s*(d.grand?0.95:0.6),0,6.283);x.fill();}
  x.fillStyle='#8a6040';x.fillRect(X(DOCK.x)+s*0.3,Z(DOCK.z),s*0.4,s*3);
  for(const m of S.home.marks||[]){const cx=X(m.x)+s/2,cz=Z(m.z)+s/2,r=Math.max(5,s*1.2);x.strokeStyle='#b0402e';x.lineWidth=dpr*1.6;x.beginPath();x.moveTo(cx-r,cz-r);x.lineTo(cx+r,cz+r);x.moveTo(cx+r,cz-r);x.lineTo(cx-r,cz+r);x.stroke();}
  x.strokeStyle='rgba(90,70,50,0.35)';x.lineWidth=dpr;x.strokeRect(dpr,dpr,cv.width-2*dpr,cv.height-2*dpr);
  return cv;}
