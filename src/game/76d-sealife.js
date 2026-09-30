/* =========================================================
   Sea life on the reef (76c-swim): creatures you can see swimming, crawling and drifting, not shadows or icons.
   Each is a little 3D model on its own looping path; swim close and tap to catch it (the same catch display and card
   as fishing), and it goes into the Islandex's Sea Life page. Rarity shows in the water: rare ones are bigger and
   glow faintly, legendary ones bigger still, in their own colours, with a glow and a trail of sparkles.
   When: `tide` low/high, `hr` [from,to), `time` day/night, `rain`/`dry`, `sea` seasons (as the fish use, 11-dex).
   Legendaries need a combination (e.g. low tide + rain + night).
   ========================================================= */
const SEA_TIERS={common:{n:'Common',w:40,sc:1},uncommon:{n:'Uncommon',w:16,sc:1.1},rare:{n:'Rare',w:5,sc:1.45,glow:0.35},legendary:{n:'Legendary',w:1.6,sc:1.85,glow:0.7}};
// model: fish (the fish modeller, 76b) with `spr`, or crab/octo/jelly/ray/eel/star/turtle/seahorse/snail/nautilus. zone: floor (on the sand) or water
const SEA={
  chromis:{name:'Blue Chromis',price:40,tier:'common',size:1,model:'fish',col:'#5a9ae0',dk:'#2a4a8a',fin:'#8ac0f0',zone:'water'},
  reefgoby:{name:'Sand Goby',price:35,tier:'common',size:1,model:'fish',col:'#d8c090',dk:'#8a7050',fin:'#e8d8b0',zone:'floor',id:'goby'},
  sandcrab:{name:'Sand Crab',price:45,tier:'common',size:1,model:'crab',col:'#e89a6a',dk:'#a85a3a',zone:'floor'},
  wrasse2:{name:'Cuckoo Wrasse',price:60,tier:'common',size:2,model:'fish',col:'#f0905a',dk:'#4a6ad0',fin:'#6ab0f0',zone:'water',time:'day'},
  periwinkle:{name:'Periwinkle',price:30,tier:'common',size:1,model:'snail',col:'#8a6a5a',dk:'#4a3a30',zone:'floor'},
  brittlestar:{name:'Brittle Star',price:70,tier:'uncommon',size:1,model:'star',col:'#c87ab0',dk:'#8a4a78',zone:'floor'},
  reefoctopus:{name:'Reef Octopus',price:180,tier:'uncommon',size:2,model:'octo',col:'#d86a4a',dk:'#8a3a2a',zone:'floor'},
  spottedray:{name:'Spotted Ray',price:160,tier:'uncommon',size:3,model:'ray',col:'#b0986a',dk:'#5a4a30',zone:'water'},
  comb:{name:'Comb Jelly',price:140,tier:'uncommon',size:1,model:'jelly',col:'#d8f0ff',dk:'#8ac8f0',zone:'water',time:'night'},
  tidecrab:{name:'Shore Crab',price:90,tier:'uncommon',size:1,model:'crab',col:'#6a8a4a',dk:'#3a5a2a',zone:'floor',tide:'low'},
  seadragon:{name:'Leafy Seadragon',price:620,tier:'rare',size:2,model:'seahorse',col:'#d8c050',dk:'#8a9a3a',zone:'water',tide:'low'},
  turtle:{name:'Green Sea Turtle',price:900,tier:'rare',size:4,model:'turtle',col:'#7a9a5a',dk:'#4a5a34',zone:'water',tide:'high'},
  blueringed:{name:'Blue-ringed Octopus',price:780,tier:'rare',size:1,model:'octo',col:'#e8c860',dk:'#3a6ae0',zone:'floor',time:'day'},
  moray:{name:'Moray Eel',price:540,tier:'rare',size:3,model:'eel',col:'#6a7a3a',dk:'#3a4a1e',zone:'floor',time:'night'},
  anglerfish:{name:'Lantern Angler',price:4200,tier:'legendary',size:3,model:'fish',col:'#3a3a5a',dk:'#1a1a2e',fin:'#8ab0ff',zone:'water',tide:'low',rain:1,time:'night',id:'lanternfish',halo:0x9ad0ff},
  goldturtle:{name:'Golden Turtle',price:5200,tier:'legendary',size:4,model:'turtle',col:'#f6c83a',dk:'#b8862a',zone:'water',tide:'high',dry:1,hr:[5,9],halo:0xffe07a},
  nautilus:{name:'Rainbow Nautilus',price:3800,tier:'legendary',size:2,model:'nautilus',col:'#f4e8d8',dk:'#e86a4a',zone:'water',rain:1,time:'day',tide:'high',halo:0xffb0e0},
  spiritray:{name:'Spirit Ray',price:4600,tier:'legendary',size:4,model:'ray',col:'#b8d8ff',dk:'#5a7ab8',zone:'water',time:'night',tide:'high',dry:1,halo:0xc8e8ff},
};
for(const k in SEA){const E=SEA[k];E.w=SEA_TIERS[E.tier].w;E.bio=['home'];}
DEX_CATS.splice(1,0,['sea','Sea Life','s:',SEA]);
function seaOk(E){const low=tideK()<0.4,high=tideK()>0.6;if(E.tide==='low'&&!low)return false;if(E.tide==='high'&&!high)return false;
  const night=isNight();if(E.time==='night'&&!night)return false;if(E.time==='day'&&night)return false;return dexOk(E,islands[0]);}
function seaWhere(E){const w=['the reef'];if(E.zone==='floor')w.push('on the seabed');if(E.tide)w.push(E.tide+' tide');if(E.time)w.push(E.time);if(E.rain)w.push('rain');if(E.dry)w.push('clear skies');
  if(E.hr)w.push(clockStr(E.hr[0])+'–'+clockStr(E.hr[1]));return w.join(' · ');}

// ---- the models (built facing +z) ----
const SEA_GEO=new Map();
function seaModel(k){const E=SEA[k],g=new T.Group();let c=SEA_GEO.get(k);
  if(!c){const col=new T.Color(E.col).getHex(),dk=new T.Color(E.dk).getHex(),p=[];let mat=vcMat;
    switch(E.model){
      case'fish':case'ray':case'jelly':case'eel':case'octo':case'crab':{const F=Object.assign({},E,{spr:E.model==='fish'?undefined:E.model==='crab'?'octo':E.model});
        const m=fishModel(F,'sea:'+(E.id||(E.model==='crab'?'crab_'+k:k)));m.traverse(o=>{if(o.isMesh)o.castShadow=false;});c=m;break;}
      case'star':for(let i=0;i<5;i++){const a=i/5*6.283;p.push(PG(CONE5,col,dk,Math.sin(a)*0.16,0.03,Math.cos(a)*0.16,Math.PI/2,a,0,0.07,0.34,0.04));}p.push(PG(SPH_LO,col,dk,0,0.04,0,0,0,0,0.14,0.07,0.14));break;
      case'snail':p.push(PG(SPH_LO,col,dk,0,0.09,-0.02,0,0,0,0.2,0.18,0.22),PG(SPH_XS,lerpHex(col,0xffffff,0.3),col,0,0.13,-0.03,0,0,0,0.1,0.1,0.12),P(SPH_LO,0xc8b8a0,0,0.03,0.06,0,0,0,0.12,0.05,0.22));break;
      case'seahorse':p.push(PG(SPH_LO,col,dk,0,0.3,0,0.2,0,0,0.13,0.26,0.12),PG(SPH_LO,col,dk,0,0.5,0.05,0,0,0,0.12,0.12,0.13),P(CYL5,col,0,0.51,0.14,1.4,0,0,0.035,0.12,0.035),P(CONE5,dk,0,0.14,-0.06,-0.5,0,0,0.06,0.18,0.05),
          P(SPH_XS,0x2a2230,0.05,0.53,0.08,0,0,0,0.03,0.03,0.03),P(SPH_XS,0x2a2230,-0.05,0.53,0.08,0,0,0,0.03,0.03,0.03));
        for(let i=0;i<6;i++){const y=0.18+i*0.07,s=i%2?1:-1;p.push(P(LEAF0,lerpHex(col,0x6a9a3a,0.4),s*0.1,y,-0.02,0,s*0.6,s*0.9,0.05,0.012,0.16));}break;
      case'turtle':p.push(PG(SPH,col,dk,0,0.12,0,0,0,0,0.62,0.26,0.72),PG(SPH_LO,lerpHex(col,0xf6e8c0,0.5),col,0,0.06,0,0,0,0,0.56,0.1,0.64),PG(SPH_LO,lerpHex(col,0xc8b890,0.4),dk,0,0.12,0.42,0,0,0,0.18,0.15,0.2),
          P(SPH_XS,0x2a2230,0.06,0.16,0.5,0,0,0,0.03,0.03,0.03),P(SPH_XS,0x2a2230,-0.06,0.16,0.5,0,0,0,0.03,0.03,0.03));
        for(let i=0;i<7;i++){const a=i/7*6.283;p.push(P(SPH_XS,dk,Math.sin(a)*0.16,0.24,Math.cos(a)*0.2,0,0,0,0.14,0.04,0.14));}p.push(P(SPH_XS,dk,0,0.26,0,0,0,0,0.16,0.05,0.16));break;
      case'nautilus':p.push(PG(SPH,col,dk,0,0.2,-0.05,0,0,Math.PI/2,0.34,0.4,0.4));for(let i=0;i<6;i++){const a=i/6*3.4-0.4;p.push(P(BOX,E.dk?new T.Color(E.dk).getHex():dk,0,0.2+Math.cos(a)*0.2,-0.05+Math.sin(a)*0.2,a,0,0,0.345,0.03,0.05));}
        for(let i=0;i<8;i++)p.push(P(CYL5,0xe8c8b0,(i%4-1.5)*0.05,0.12+(i>3?0.06:0),0.16,1.3,0,0,0.02,0.16,0.02));p.push(P(SPH_XS,0x2a2230,0.09,0.24,0.12,0,0,0,0.04,0.04,0.04),P(SPH_XS,0x2a2230,-0.09,0.24,0.12,0,0,0,0.04,0.04,0.04));break;}
    if(!c){const m=new T.Mesh(merge(p),mat);c=new T.Group();c.add(m);}
    SEA_GEO.set(k,c);}
  const src=c;src.children.forEach(o=>{const m=new T.Mesh(o.geometry,o.material);m.frustumCulled=false;g.add(m);});
  // rarity you can see: a faint halo round rare ones, a stronger one (in their own colour) round legendaries
  const T0=SEA_TIERS[E.tier];if(T0.glow){const h=new T.Mesh(ICO2,new T.MeshBasicMaterial({color:E.halo||0xfff2b0,transparent:true,opacity:T0.glow*0.35,depthWrite:false,blending:T.AdditiveBlending,fog:false}));h.scale.setScalar(0.9+E.size*0.12);h.position.y=0.12;h.userData.halo=1;g.add(h);}
  return g;}
// a painted icon for the book: the model's own portrait
for(const k in SEA)Object.defineProperty(ICON,'s:'+k,{configurable:true,enumerable:true,get(){const w=new T.Group(),m=seaModel(k);m.children.forEach(o=>{if(o.userData.halo)o.visible=false;});m.rotation.y=-0.9;w.add(m);const v=snapThumb(w,48);Object.defineProperty(ICON,'s:'+k,{value:v,writable:true,configurable:true,enumerable:true});return v;}});

// ---- the creatures in the water ----
const seaLife=[];let seaT=0;
function seaPick(){const ks=Object.keys(SEA).filter(k=>seaOk(SEA[k]));if(!ks.length)return null;let t=0;for(const k of ks)t+=SEA[k].w;let r=Math.random()*t;for(const k of ks){r-=SEA[k].w;if(r<=0)return k;}return ks[0];}
function spawnSeaLife(){const k=seaPick();if(!k)return;const E=SEA[k],floor=E.zone==='floor';
  for(let it=0;it<14;it++){const a=Math.random()*6.283,r=4+Math.random()*8,x=vil.x+Math.cos(a)*r,z=vil.z+Math.sin(a)*r,d=reefD(x,z);
    if(d<1.3||d>reefR()-0.6||isLand(Math.round(x),Math.round(z)))continue;const wd=waterDepth(x,z);if(wd<(floor?0.5:1.1))continue;
    const sb=seabedY(x,z),g=seaModel(k),T0=SEA_TIERS[E.tier],sc=T0.sc*(0.85+Math.random()*0.3)*(E.model==='turtle'?1:0.9);g.scale.setScalar(0.01);scene.add(g);
    const y=floor?sb+0.04:lerp(sb+0.45,tideY-0.45,0.25+Math.random()*0.6);
    seaLife.push({k,E,g,cx:x,cz:z,x,z,y,y0:y,sc,rad:floor?0.6+Math.random()*1:1.2+Math.random()*2.2,ang:Math.random()*6.28,dir:Math.random()<0.5?1:-1,sp:(floor?0.12:0.28)*(E.tier==='legendary'?1.3:E.tier==='rare'?1.15:1)*(0.8+Math.random()*0.4),ph:Math.random()*6.28,t:0,out:0,life:70+Math.random()*60});return;}}
function updateReefLife(dt,tt){
  if(!swim.on){if(seaLife.length&&!swim.on){for(const c of seaLife)scene.remove(c.g);seaLife.length=0;}return;}
  seaT-=dt;if(seaT<=0){seaT=0.8;const want=8+Math.round(tideK()*5);/* more room on the reef at high tide, more life */if(seaLife.length<want)spawnSeaLife();}
  for(let i=seaLife.length-1;i>=0;i--){const c=seaLife[i],E=c.E,g=c.g;c.t+=dt;
    const far=Math.hypot(c.x-vil.x,c.z-vil.z);if(far>18||c.t>c.life)c.out+=dt*2;
    if(c.out>=1||reefD(c.cx,c.cz)>reefR()+0.5&&c.t>2){scene.remove(g);seaLife.splice(i,1);continue;}
    // a loop round its home: a wobbly circle (figure-eight for fish), bobbing gently; startled ones dart a little way off
    const near=Math.hypot(c.x-vil.x,c.z-vil.z)<1.6&&Math.abs(c.y-vil.y)<1.4&&swim.depth>0.3;const spd=c.sp*(near&&E.tier!=='common'?2.2:1);
    c.ang+=dt*spd/c.rad*c.dir;const fig=E.zone==='water'?Math.sin(c.ang*2)*0.35:0;
    const nx=c.cx+Math.cos(c.ang)*c.rad*(1+fig),nz=c.cz+Math.sin(c.ang)*c.rad,sb=seabedY(nx,nz);
    const ny=E.zone==='floor'?sb+0.04:clamp(c.y0+Math.sin(c.t*0.6+c.ph)*0.25,sb+0.35,tideY-0.35);
    const hx=nx-c.x,hz=nz-c.z;if(Math.hypot(hx,hz)>1e-4)g.rotation.y=Math.atan2(hx,hz)+(E.model==='crab'?Math.PI/2:0);c.x=nx;c.z=nz;c.y=lerp(c.y,ny,Math.min(1,dt*3));
    const vis=Math.min(1,c.t*1.5)*(1-c.out);g.scale.setScalar(Math.max(0.01,c.sc*vis));
    g.position.set(c.x,c.y+(E.model==='jelly'?Math.sin(tt*1.5+c.ph)*0.12:0),c.z);
    if(E.model==='fish'||E.model==='eel')g.rotation.z=Math.sin(tt*6+c.ph)*0.08;
    if(E.model==='jelly'){const p=1+Math.sin(tt*2.4+c.ph)*0.12;g.scale.set(c.sc*vis*p,c.sc*vis/p,c.sc*vis*p);}
    if(E.model==='turtle'||E.model==='ray')g.rotation.z=Math.sin(tt*1.4+c.ph)*0.12;
    for(const o of g.children)if(o.userData.halo)o.material.opacity=SEA_TIERS[E.tier].glow*(0.25+0.12*Math.sin(tt*2.5+c.ph))*vis;
    if(E.tier==='legendary'&&Math.random()<dt*5)sparkle(c.x+(Math.random()-0.5)*0.4,c.y+0.2,c.z+(Math.random()-0.5)*0.4,E.halo||0xfff0a0);
    if(E.tier==='rare'&&Math.random()<dt*1.2)sparkle(c.x,c.y+0.2,c.z,0xfff6d0);}}
// tap a creature: swim over and catch it with your hands
function seaLifeTap(cx,cy){let best=null,bd=54;for(const c of seaLife){if(c.out>0)continue;const s=toScreen(c.x,c.y+0.1,c.z);if(s[2]>1)continue;const d=Math.hypot(s[0]-cx,s[1]-cy);if(d<bd){bd=d;best=c;}}
  if(!best)return false;const c=best,dist=()=>Math.hypot(c.x-vil.x,c.z-vil.z);
  const grab=()=>{if(!seaLife.includes(c))return;if(dist()>1.5||Math.abs(c.y-vil.y)>1.6){say(c.E.tier==='common'?'Almost! Get a little closer.':'It slipped away! Try again.');return;}catchSeaLife(c);};
  if(dist()<1.4){villager.rotation.y=Math.atan2(c.x-vil.x,c.z-vil.z);swingTool(grab);return true;}
  // swim to it (and down to its depth), then reach
  const dx=c.x-vil.x,dz=c.z-vil.z,d=Math.hypot(dx,dz)||1;swimTo(c.x-dx/d*0.8,c.z-dz/d*0.8);vil.cb=()=>{villager.rotation.y=Math.atan2(c.x-vil.x,c.z-vil.z);swingTool(grab);};
  if(swim.under)swim.chase=c;return true;}
function catchSeaLife(c){const E=c.E,key='s:'+c.k,first=gain(key);buzz(25);scene.remove(c.g);seaLife.splice(seaLife.indexOf(c),1);
  bubble(c.x,c.y,c.z,0.1);for(let i=0;i<6;i++)bubble(c.x+(Math.random()-0.5)*0.3,c.y+Math.random()*0.2,c.z+(Math.random()-0.5)*0.3,0.03+Math.random()*0.04);
  if(caught){scene.remove(caught.g);catchCard(null);}const g=seaModel(c.k);g.children.forEach(o=>{if(o.userData.halo)o.visible=false;});scene.add(g);
  caught={g,t:0,fx:c.x,fz:c.z,msg:'',sc:Math.min(1.5,0.9+E.size*0.1),roll:/ray|crab|octo|star|snail|turtle/.test(E.model)?0.9:0};
  const T0=SEA_TIERS[E.tier];addXP(Math.round(E.price/12)+2);if(E.tier==='rare'||E.tier==='legendary'){SFX.rare();for(let i=0;i<14;i++)sparkle(vil.x,vil.y+1.4,vil.z,E.halo||0xfff0a0);}else SFX.catch();
  const art=/^[aeiou]/i.test(E.name)?'An':'A';caught.card={art,name:E.name,quip:SEA_QUIP[c.k]||'What a find!',kg:0,rar:T0.n,first,junk:false,sea:1};}
const SEA_QUIP={turtle:'It gave me a very patient look.',goldturtle:'It glitters like morning sun on the water!',anglerfish:'Its little lantern lit up the whole reef!',nautilus:'Every colour of the rainbow, curled up tight.',
  spiritray:'It glides like a ghost in the moonlight.',seadragon:'It looks just like a drifting bit of seaweed!',blueringed:'Pretty… and best admired from a distance.',moray:'It was hiding in the rocks, grinning.',
  sandcrab:'Sideways, as ever.',periwinkle:'Slow and steady.',chromis:'A flash of blue!',brittlestar:'So wriggly!',comb:'It shimmers with little rainbows.'};
