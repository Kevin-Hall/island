/* =========================================================
   Decorate mode (the Decorate app, or Shop → "Decorate"; S.mode 'edit'): arrange everything you've placed outdoors,
   and place more from your bag, without leaving the island.
     - tap a piece to select it (a glowing ring marks it; tap again to reach the floor under it). Then:
         Move     lift it and tap or drag to where it goes (Cancel puts it back)
         Rotate   a quarter turn, where it stands
         Paint    recolour its main colour (o.tint: OD_TINTS), or put it back to its own colours
         Copy     place another of the same, turned and painted the same (if you have one in your bag)
         Fill     what a crate, basket or sack holds (58c)
         Store    back into your bag
     - press on the selected piece and drag to move it straight away
     - the tray along the bottom: everything in your bag, by kind (furniture, garden, lights, floors, fences, farm);
       tap one to place it (72-farming startPlace), and decorating carries on when you're done
     - Floor eraser: tap or drag over paving and decking to lift it back into your bag
     - Undo: every change in decorate mode can be taken back, one at a time
   (od* = outdoor decorating; the indoor room decorator is 56c's deco*)
   ========================================================= */
const dec={sel:null,mv:null,erase:false,paint:false,undo:[],cat:'all'};
// recolours: the piece's main colour family takes the new hue (neutrals and wood are left alone); white/charcoal
// take the colour out; o.tint is the index here (0 = its own colours)
const OD_TINTS=[null,{h:0.01,n:'Red',c:0xd8483e},{h:0.05,n:'Coral',c:0xf08a5a},{h:0.12,n:'Mustard',c:0xe8b840},{h:0.27,n:'Sage',c:0x8ab46a},{h:0.36,n:'Green',c:0x4f9a4a},
  {h:0.47,n:'Teal',c:0x3aa89a},{h:0.58,n:'Blue',c:0x4a7ad0},{h:0.7,n:'Lilac',c:0x9a7ad8},{h:0.9,n:'Pink',c:0xf06aa0},{n:'White',c:0xf4f0e8,l:0.9},{n:'Charcoal',c:0x3a3a40,l:0.24},{h:0.07,n:'Walnut',c:0x7a5034,s:0.42,l:0.32}];
const DEC_CATS=[['all','All'],['furn','Furniture'],['garden','Garden'],['light','Lights'],['floor','Floors'],['fence','Fences'],['farm','Farm'],['isle','Islands']];
const DC_FENCE=new Set(['fence','picket','gate','hedge','topiary','arbor','railfence','stonewall']),DC_LIGHT=new Set(['lantern','lamppost','stonelantern','firepit','bunting','chime']),
  DC_FARM=new Set(['scarecrow','sprinkler','beehive','haybale','windmill','well','pcrate','pbasket','psack','barrow','stall','pumpkins','feeder','coop','barn','trough','watertrough','doghouse','catbed','petbowl','churns','nestbox','haystack','farmcart','tractor','farmsign','duckpond','mayomaker','cheesepress','loom','oilmaker','presjar','keg','compost']),
  DC_GARDEN=new Set(['flowers','cattail','clover','planter','flowerpot','pine','oak','palm','urn','boatplanter','birdbath','birdhouse','sundial','fountain','gnome','koipond','toadstool','flowercart','snowman']);
function decCat(k){if(isFloor(k))return'floor';if(ISLE_DECOR.has(k))return'isle';if(DC_FENCE.has(k))return'fence';if(DC_LIGHT.has(k))return'light';if(DC_FARM.has(k))return'farm';if(DC_GARDEN.has(k)||BUILD[k].plant)return'garden';return'furn';}

// paint: find the piece's main colour family (the most common saturated hue) and move it to the new colour
const _tc=new T.Color(),_hsl={};
function tintGroup(g,ti){const P=OD_TINTS[ti];if(!P)return;const meshes=[];g.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.attributes.color&&!o.userData.noThumb)meshes.push(o);});
  const bins=new Float32Array(24);
  for(const m of meshes){const a=m.geometry.attributes.color.array;for(let i=0;i<a.length;i+=3){_tc.setRGB(a[i],a[i+1],a[i+2]).getHSL(_hsl);if(_hsl.s>0.22&&_hsl.l>0.14&&_hsl.l<0.9)bins[Math.floor(_hsl.h*24)%24]+=_hsl.s;}}
  let b0=0;for(let i=1;i<24;i++)if(bins[i]>bins[b0])b0=i;if(bins[b0]<=0)return;const h0=(b0+0.5)/24;
  for(const m of meshes){m.geometry=m.geometry.clone();const at=m.geometry.attributes.color,a=at.array;
    for(let i=0;i<a.length;i+=3){_tc.setRGB(a[i],a[i+1],a[i+2]).getHSL(_hsl);if(_hsl.s<0.18)continue;let dh=Math.abs(_hsl.h-h0);dh=Math.min(dh,1-dh);if(dh>0.075)continue;
      if(P.h===undefined){_tc.setHSL(0,_hsl.s*0.08,P.l+(_hsl.l-0.5)*0.35);}else _tc.setHSL(P.h,P.s!==undefined?P.s:Math.max(0.35,_hsl.s),P.l!==undefined?P.l+(_hsl.l-0.5)*0.5:_hsl.l);
      a[i]=_tc.r;a[i+1]=_tc.g;a[i+2]=_tc.b;}at.needsUpdate=true;}}

// the selection marker: a soft pulsing ring on the tile and a little arrow bobbing over the piece
const decRing=new T.Mesh(new T.RingGeometry(0.42,0.52,28).rotateX(-Math.PI/2),new T.MeshBasicMaterial({color:0xffe08a,transparent:true,opacity:0.9,depthWrite:false}));
const decArrow=new T.Mesh(new T.ConeGeometry(0.12,0.22,4).rotateX(Math.PI),new T.MeshBasicMaterial({color:0xffd060}));
decRing.visible=decArrow.visible=false;decRing.renderOrder=4;scene.add(decRing,decArrow);
function decMark(){const o=dec.mv?dec.mv:dec.sel;if(S.mode!=='edit'||!o||placing){decRing.visible=decArrow.visible=false;return;}
  const y=topY(o.x,o.z);decRing.position.set(o.x,y+0.04,o.z);decArrow.position.set(o.x,y+(isFloor(o.k)?0.5:(OBJ_H[o.k]||0.8)+0.45),o.z);decArrow.userData.y=decArrow.position.y;decRing.visible=decArrow.visible=true;
  if(dec.mv)decRing.material.color.set(canPlace(o.x,o.z,o.k)?0xffe08a:0xff6a5a);else decRing.material.color.set(0xffe08a);}
function updateDecorate(dt,tt){if(!decRing.visible)return;const s=1+Math.sin(tt*5)*0.06;decRing.scale.set(s,1,s);decRing.material.opacity=0.65+Math.sin(tt*5)*0.25;decArrow.position.y=(decArrow.userData.y||0)+Math.sin(tt*4)*0.06;decArrow.rotation.y=tt*1.5;}

// ---- entering and leaving
function odStart(){if(S.visit){visitNo();return;}if(S.sea||inside){toast('Step ashore to decorate.');return;}closeSheet();clearAction();if(placing)endPlace();S.mode='edit';dec.sel=null;dec.mv=null;dec.erase=false;dec.paint=false;dec.undo=[];SFX.ui();renderDecoBar();updateCtx();}
function odEnd(){if(dec.mv)odCancelMove();S.mode='farm';dec.sel=null;dec.erase=false;dec.paint=false;decMark();renderDecoBar();updateCtx();save();}
// ---- undo: a snapshot of the decor and the bag before each change
function decSnap(){dec.undo.push({objs:S.objs.map(o=>Object.assign({},o)),store:Object.assign({},S.store)});if(dec.undo.length>40)dec.undo.shift();}
function decUndo(){const u=dec.undo.pop();if(!u)return;if(dec.mv){dec.mv=null;decGhostOff();}S.objs=u.objs;S.store=u.store;dec.sel=null;syncObjs();SFX.place();save();decMark();renderDecoBar();}
// ---- selecting (a tap in decorate mode)
function odTap(x,z){if(!onLandAny(x,z))return;
  if(dec.mv){odMoveTo(x,z);return;}
  if(dec.erase){odEraseAt(x,z);return;}
  const f=fixedAt(x,z);if(f&&f!=='mark'){toast(f==='house'?'Your home stays put — upgrade it in Shop → Island.':f==='bin'?'The shipping bin stays by your home.':'The town’s buildings stay where they are.');return;}
  const top=objAt(x,z),fl=floorAt(x,z);
  let o=top||fl;if(dec.sel&&top&&dec.sel===top&&fl)o=fl;/* tap again to reach the floor underneath */
  if(o){dec.sel=o;dec.paint=false;SFX.ui();decMark();renderDecoBar();return;}
  dec.sel=null;decMark();renderDecoBar();
  const k=K(x,z),t=S.tiles[k];if(t&&t.crop){const C=CROPS[t.crop.t];setAction(`Dig up this ${C.name}? The seed will be lost.`,[{label:'Dig up',cls:'warn',fn:()=>{t.crop=null;syncCrop(k);SFX.till();burst(x,0.6,z,0x8a5a3a,8);clearAction();}},{label:'Keep',fn:clearAction}]);}}
// ---- the selected piece's actions
function odRotate(){const o=dec.sel;if(!o)return;decSnap();o.r=((o.r||0)+Math.PI/2)%(Math.PI*2);syncObjs();SFX.place();burst(o.x,topY(o.x,o.z)+0.3,o.z,0xf6eedb,5,0.8,0.05);save();renderDecoBar();}
function odStore(){const o=dec.sel;if(!o)return;decSnap();S.objs=S.objs.filter(q=>q!==o);if(o.fill){S.inv[o.fill]=(S.inv[o.fill]||0)+1;}S.store[o.k]=(S.store[o.k]||0)+1;dec.sel=null;syncObjs();SFX.place();
  burst(o.x,topY(o.x,o.z)+0.3,o.z,0xf6eedb,8,1,0.06);save();decMark();renderDecoBar();toast(`${BUILD[o.k].name} put in your bag.`,'',THUMB[o.k]);}
function odPaint(ti){const o=dec.sel;if(!o||isFloor(o.k))return;decSnap();if(ti)o.tint=ti;else delete o.tint;syncObjs();SFX.coin();sparkle(o.x,topY(o.x,o.z)+0.5,o.z,OD_TINTS[ti]?OD_TINTS[ti].c:0xffffff);save();renderDecoBar();}
function odCopy(){const o=dec.sel;if(!o||!(S.store[o.k]>0))return;decSnap();startPlace(o.k,true,o.r||0);if(placing)placing.tint=o.tint;}
function odFill(){const o=dec.sel;if(o&&BUILD[o.k]&&/^p(crate|basket|sack)$/.test(o.k))displayTap(o);}
// ---- moving: the piece lifts out (a ghost follows your taps or finger) and drops where you leave it
function decGhostOff(){if(dec.ghost){scene.remove(dec.ghost);dec.ghost=null;}}
function odLift(){const o=dec.sel;if(!o)return;decSnap();dec.mv={o,k:o.k,x:o.x,z:o.z,r:o.r||0};S.objs=S.objs.filter(q=>q!==o);syncObjs();
  const g=objGroup(o.k,o.id,o.r||0);if(o.tint)tintGroup(g,o.tint);g.traverse(c=>{if(!c.isMesh)return;if(c.userData.noThumb){c.visible=false;return;}c.castShadow=false;if(c.material){c.material=c.material.clone();c.material.transparent=true;c.material.opacity=0.8;}});
  dec.ghost=g;scene.add(g);decGhostAt(o.x,o.z);SFX.ui();renderDecoBar();}
function decGhostAt(x,z){const m=dec.mv;if(!m)return;m.x=x;m.z=z;if(dec.ghost){dec.ghost.position.set(x,topY(x,z)+0.12,z);dec.ghost.rotation.y=m.r;}decMark();}
function odMoveTo(x,z){const m=dec.mv;if(!m)return;if(m.x===x&&m.z===z&&decFree(x,z,m.k)){odDrop();return;}decGhostAt(x,z);renderDecoBar();}
function decFree(x,z,k){return canPlace(x,z,k);}
function odDrop(){const m=dec.mv;if(!m)return;if(!decFree(m.x,m.z,m.k)){SFX.no();toast('That spot is taken.');return;}
  const o=m.o;o.x=m.x;o.z=m.z;o.r=m.r;S.objs.push(o);dec.mv=null;decGhostOff();dec.sel=o;syncObjs();SFX.place();burst(o.x,topY(o.x,o.z)+0.2,o.z,0xf6eedb,10,1.2,0.07);save();decMark();renderDecoBar();}
function odCancelMove(){const m=dec.mv;if(!m)return;const o=m.o;S.objs.push(o);dec.undo.pop();dec.mv=null;decGhostOff();dec.sel=o;syncObjs();decMark();renderDecoBar();}
function odTurnGhost(){const m=dec.mv;if(!m)return;m.r=(m.r+Math.PI/2)%(Math.PI*2);decGhostAt(m.x,m.z);}
// press on the selected piece and drag it (84-input calls these)
function odPress(cx,cy){if(S.mode!=='edit'||placing)return false;const hit=pick(cx,cy);if(!hit)return false;
  if(dec.erase){dec.erasing=true;return true;}
  if(dec.mv)return true;const o=dec.sel;if(!o||hit.x!==o.x||hit.z!==o.z)return false;dec.press={o};return true;}
function odDragMove(cx,cy){const hit=pick(cx,cy);if(!hit)return;if(dec.erasing){odEraseAt(hit.x,hit.z);return;}
  if(dec.press&&!dec.mv){if(hit.x===dec.press.o.x&&hit.z===dec.press.o.z)return;odLift();}
  if(dec.mv&&(hit.x!==dec.mv.x||hit.z!==dec.mv.z)){decGhostAt(hit.x,hit.z);tone(660+((hit.x+hit.z)&3)*60,0.03,'triangle',0.015);}}
function odRelease(moved){const was=dec.press;dec.press=null;if(dec.erasing){dec.erasing=false;dec.eraseOn=false;renderDecoBar();return;}if(moved&&dec.mv&&was){if(decFree(dec.mv.x,dec.mv.z,dec.mv.k))odDrop();else{SFX.no();renderDecoBar();}}}
// ---- the floor eraser (one undo step for each stroke)
function odEraseAt(x,z){const f=floorAt(x,z);if(!f)return;if(!(dec.erasing&&dec.eraseOn)){decSnap();dec.eraseOn=!!dec.erasing;}
  S.objs=S.objs.filter(q=>q!==f);S.store[f.k]=(S.store[f.k]||0)+1;syncObjs();burst(x,topY(x,z)+0.1,z,0xd8c8a8,5,0.8,0.05);tone(520,0.04,'triangle',0.02);save();if(!dec.erasing)renderDecoBar();}

// ---- the bar: header (undo, eraser, done), the selected piece and its actions, and the tray of your bag
function renderDecoBar(){let el=$('decoBar');
  const on=S.mode==='edit'&&!placing&&!inside&&!S.sea;document.body.classList.toggle('decorating',S.mode==='edit'&&!inside&&!S.sea);
  if(!on){if(el)el.hidden=true;decMark();return;}
  if(!el){el=document.createElement('div');el.id='decoBar';document.body.appendChild(el);
    el.addEventListener('pointerdown',e=>e.stopPropagation());
    el.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;const d=b.dataset;SFX.ui();
      if(d.dd==='done')odEnd();else if(d.dd==='undo')decUndo();else if(d.dd==='erase'){dec.erase=!dec.erase;dec.sel=null;decMark();renderDecoBar();}
      else if(d.dd==='move')odLift();else if(d.dd==='rot')dec.mv?odTurnGhost():odRotate();else if(d.dd==='paint'){dec.paint=!dec.paint;renderDecoBar();}
      else if(d.dd==='copy')odCopy();else if(d.dd==='fill')odFill();else if(d.dd==='store')odStore();else if(d.dd==='drop')odDrop();else if(d.dd==='cancel')odCancelMove();
      else if(d.dd==='desel'){dec.sel=null;decMark();renderDecoBar();}
      if(d.tint!==undefined)odPaint(+d.tint);if(d.cat){dec.cat=d.cat;renderDecoBar();}if(d.put){decSnap();startPlace(d.put,true);}});}
  el.hidden=false;let h=`<div class="dhead"><b>Decorate</b><span class="grow"></span><button class="dchip" data-dd="undo" ${dec.undo.length?'':'disabled'}>↶ Undo</button><button class="dchip ${dec.erase?'on':''}" data-dd="erase">Eraser</button><button class="dchip go" data-dd="done">Done</button></div>`;
  if(dec.mv){const B=BUILD[dec.mv.k],ok=decFree(dec.mv.x,dec.mv.z,dec.mv.k);
    h+=`<div class="dsel"><img src="${THUMB[dec.mv.k]||''}" alt=""><div class="grow"><div class="nm">Moving ${B.name}</div><div class="sub">${ok?'Tap or drag to where it goes, then Place':'That spot is taken — try another'}</div></div></div>
      <div class="dacts"><button data-dd="rot">⟳ Turn</button><button class="go" data-dd="drop" ${ok?'':'disabled'}>Place here</button><button data-dd="cancel">Cancel</button></div>`;}
  else if(dec.erase)h+=`<p class="dhint">Tap or drag over paths and decking to lift them into your bag.</p>`;
  else if(dec.sel){const o=dec.sel,B=BUILD[o.k],fl=isFloor(o.k),disp=/^p(crate|basket|sack)$/.test(o.k),have=S.store[o.k]||0;
    h+=`<div class="dsel"><img src="${THUMB[o.k]||''}" alt=""><div class="grow"><div class="nm">${B.name}${o.tint?` <span class="tg">${OD_TINTS[o.tint].n}</span>`:''}</div><div class="sub">${fl?'A floor · tap the tile again for what stands on it':'Drag it to move it, or pick an action'}${have?` · ${have} more in your bag`:''}</div></div><button class="x" data-dd="desel">×</button></div>
      <div class="dacts"><button class="go" data-dd="move">Move</button>${fl?'':'<button data-dd="rot">⟳ Rotate</button>'}${fl?'':`<button class="${dec.paint?'on':''}" data-dd="paint">Paint</button>`}${have?'<button data-dd="copy">Copy</button>':''}${disp?'<button data-dd="fill">Fill</button>':''}<button data-dd="store">Store</button></div>`;
    if(dec.paint&&!fl)h+=`<div class="dswatch">${OD_TINTS.map((t,i)=>`<button class="${(o.tint||0)===i?'on':''}" data-tint="${i}" title="${t?t.n:'Original'}">${t?`<i style="background:#${t.c.toString(16).padStart(6,'0')}"></i>`:'<i class="orig"></i>'}</button>`).join('')}</div>`;}
  else h+=`<p class="dhint">Tap a piece to edit it · drag a selected piece to move it · or place something from your bag</p>`;
  if(!dec.mv){const ks=Object.keys(S.store).filter(k=>BUILD[k]&&S.store[k]>0),cats=DEC_CATS.filter(([c])=>c==='all'||ks.some(k=>decCat(k)===c));if(!cats.some(([c])=>c===dec.cat))dec.cat='all';
    const list=ks.filter(k=>dec.cat==='all'||decCat(k)===dec.cat).sort((a,b)=>BUILD[a].name.localeCompare(BUILD[b].name));
    h+=`<div class="dcats">${cats.map(([c,n])=>`<button class="${dec.cat===c?'on':''}" data-cat="${c}">${n}</button>`).join('')}</div>`;
    h+=list.length?`<div class="dtray">${list.map(k=>`<button data-put="${k}"><img src="${THUMB[k]||''}" alt=""><span>${BUILD[k].name}</span><em>×${S.store[k]}</em></button>`).join('')}</div>`:`<p class="dhint">Your bag has no decor. ${S.scratch?'Buy some from Marlo’s boat or Hazel’s store, or craft it.':'Buy some in the Shop, or craft it.'}</p>`;}
  el.innerHTML=h;decMark();}
