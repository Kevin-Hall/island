/* =========================================================
   Thumbnails of 3D models for the shop
   ========================================================= */
const THUMB={};
function makeThumbs(){
  const ts=new T.Scene();ts.add(new T.HemisphereLight(0xfff4e0,0x6a6a8a,0.8));const dl=new T.DirectionalLight(0xffffff,0.8);dl.position.set(3,6,5);ts.add(dl);
  const tc=new T.OrthographicCamera(-1,1,1,-1,0.1,60);const size=48;const trt=new T.WebGLRenderTarget(size,size,{minFilter:T.NearestFilter,magFilter:T.NearestFilter});
  const buf=new Uint8Array(size*size*4);const cv=document.createElement('canvas');cv.width=cv.height=size;const cx=cv.getContext('2d');const img=cx.createImageData(size,size);
  const snap=(g)=>{g.traverse(o=>{if(o.userData.noThumb)o.visible=false;});ts.add(g);const box=new T.Box3().setFromObject(g);const c=box.getCenter(new T.Vector3());const s=box.getSize(new T.Vector3());
    const r=Math.max(s.x,s.y,s.z)*0.62;tc.left=-r;tc.right=r;tc.top=r;tc.bottom=-r;tc.position.set(c.x+2.2,c.y+1.55,c.z+2.2);/* close in, so the world-curve shader doesn't bend small items out of frame */tc.lookAt(c);tc.updateProjectionMatrix();tc.updateMatrixWorld();
    const old=glowMat.emissiveIntensity;glowMat.emissiveIntensity=0.4;renderer.setRenderTarget(trt);renderer.setClearColor(0x000000,0);renderer.clear();renderer.render(ts,tc);
    renderer.readRenderTargetPixels(trt,0,0,size,size,buf);renderer.setRenderTarget(null);glowMat.emissiveIntensity=old;ts.remove(g);
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){const si=((size-1-y)*size+x)*4,di=(y*size+x)*4;img.data[di]=buf[si];img.data[di+1]=buf[si+1];img.data[di+2]=buf[si+2];img.data[di+3]=buf[si+3];}
    cx.putImageData(img,0,0);return cv.toDataURL();};
  for(const k in BUILD)THUMB[k]=snap(objGroup(k,3,0));
  for(let i=0;i<4;i++)THUMB['house'+i]=snap(houseGroup(i));
  const isl=new T.Group();for(let x=-3;x<=3;x++)for(let z=-3;z<=3;z++){const d=Math.hypot(x*0.9,z);if(d<3.4){const m=new T.Mesh(BOX,toon({color:d<2.2?0x6aa843:0xe9d3a4}));m.scale.set(1,d<2.2?1:0.8,1);m.position.set(x,0,z);isl.add(m);}}
  isl.add(objGroup('pine',2).translateX(-0.5).translateY(0.5));THUMB.land=snap(isl);
  trt.dispose();renderer.setClearColor(0x000000,1);
}

/* =========================================================
   Sheets
   ========================================================= */
let sheet=null;
function openSheet(kind,tab){if(caught){scene.remove(caught.g);caught=null;}SFX.ui();if(fishing)endFishing();clearAction();if(placing)endPlace();sheet={kind,tab};renderSheet();$('sheet').hidden=false;updateCtx();}
function closeSheet(){$('sheet').hidden=true;sheet=null;updateCtx();}
function tabs(list){$('sheetTabs').innerHTML=list.map(([id,l])=>`<button class="tab ${sheet.tab===id?'on':''}" data-tab="${id}">${l}</button>`).join('');}
const sh=n=>`<span class="shl">${shellHTML}${fmt(n)}</span>`;
function whereStr(I,key){const bios=I.bio||[];let w=bios.map(bioLabel).filter((v,i,a)=>a.indexOf(v)===i).join(' / ');
  if(key.startsWith('f:'))w+=' · '+(I.hab==='deep'?'deep water':I.hab==='shore'?'near shore':'any water');
  if(I.time)w+=' · '+I.time;if(I.rain)w+=' · rain only';if(key==='g:feather')w='shoo a crow at home';if(key==='g:starfrag')w='wish on a shooting star, then check your beach';return w;}
function renderSheet(){
  if(!sheet)return;const body=$('sheetBody');const lv=level();let h='';
  if(sheet.kind==='seeds'){$('sheetTitle').textContent='Seeds';tabs([]);
    h+=`<p class="note">Pick a seed, then tap tilled soil on your home island. You pay when you plant.</p><div class="grid">`;
    for(const id of [...CROP_IDS,'mystery']){const C=id==='mystery'?MYSTERY:CROPS[id],lock=C.lvl>lv;
      const sub=id==='mystery'?'Any crop, even locked ones. 3× rare chance.':`Sells ${fmt(C.price)} · ~${Math.round(C.grow/60*10)/10} min watered${C.night?' · night only':''}${C.day?' · loves sun':''}`;
      h+=`<button class="card ${S.seed===id?'sel':''} ${lock?'lock':''}" data-seed="${id}" ${lock?'disabled':''}><img class="px" src="${seedIcon(id)}" alt=""><span class="grow"><span class="nm">${C.name}</span><br><span class="sub">${lock?'Unlocks at Lv '+C.lvl:sub}</span></span><span class="price">${S.free[id]?`<span class="done">${S.free[id]} free</span>`:sh(C.seed)}</span></button>`;}
    h+='</div>';}
  else if(sheet.kind==='bag'){$('sheetTitle').textContent='Pockets';tabs([['all','All'],['crops','Crops'],['catch','Catch'],['nature','Nature'],['mats','Mats'],['store','Stored'],['craft','Craft']]);
    const T0=sheet.tab||'all';
    if(T0==='craft'){h+=`<p class="note">Craft decor and handy items from what you gather. Crafted decor goes to <b>Storage</b>, ready to place.</p><div class="list">`;
      RECIPES.forEach((r,i)=>{const lock=r.lvl>lv;const ing=Object.entries(r.in).map(([k,n])=>{const hv=haveOf(k);return `<span class="chip ${hv<n?'miss':''}"><img src="${iconOf(k)}" alt="">${nameOf(k).replace(/^(.{14}).+$/,'$1…')} ${Math.min(hv,99)}/${n}</span>`;}).join('');
        h+=`<div class="recipe ${lock?'lock':''}"><img src="${recipeIcon(r)}" alt=""><span class="grow"><span class="nm">${recipeName(r)}${r.out[2]>1?' ×'+r.out[2]:''}</span><div class="ing">${lock?`<span class="chip">Unlocks at Lv ${r.lvl}</span>`:ing}</div></span><button class="pbtn go" data-craft="${i}" ${canCraft(r)?'':'disabled'}>Craft</button></div>`;});
      h+='</div>';}
    else if(T0==='store'){const ks=Object.keys(S.store).filter(k=>S.store[k]>0);
      if(!ks.length)h+=`<p class="note">Storage is empty. Crafted decor, villager gifts and decor you put away all end up here.</p>`;
      else{const sel=ks.includes(sheet.sel)?sheet.sel:ks[0];const B=BUILD[sel];
        h+=`<div class="detail"><img src="${THUMB[sel]||''}" alt=""><div class="grow"><div class="nm">${B.name} ×${S.store[sel]}</div><div class="sub">${B.desc}</div><div class="acts"><button class="pbtn go" data-place="${sel}">Place it</button></div></div></div><div class="inv">`;
        for(const k of ks)h+=`<button class="cell ${k===sel?'sel':''}" data-pick="${k}"><img src="${THUMB[k]||''}" alt=""><span class="n">${S.store[k]}</span></button>`;h+='</div>';}}
    else{const cat=k=>k.startsWith('m:')||k.startsWith('x:')?'mats':k.startsWith('f:')||k.startsWith('b:')?'catch':k.startsWith('p:')||k.startsWith('g:')?'nature':'crops';
      const ks=Object.keys(S.inv).filter(k=>S.inv[k]>0&&(T0==='all'||cat(k)===T0)).sort((a,b)=>cat(a).localeCompare(cat(b))||priceOf(b)-priceOf(a));
      const sellable=Object.keys(S.inv).filter(k=>!k.startsWith('m:')&&!k.startsWith('x:')),total=sellable.reduce((t,k)=>t+priceOf(k)*S.inv[k],0);
      h+=`<div class="invtop"><span class="tot">Worth <b>${fmt(total)}</b> shells · market wants <b>${CROPS[S.demand].name}</b></span><button class="pbtn go" data-sellall="1" ${total?'':'disabled'}>Sell all</button></div>`;
      if(!ks.length)h+=`<p class="note">${T0==='all'?'Your pockets are empty. Harvest, fish, catch bugs, forage and gather to fill them.':'Nothing here yet.'}</p>`;
      else{const sel=ks.includes(sheet.sel)?sheet.sel:ks[0],I=itemInfo(sel),t=sel.split('|')[0],mat=sel.startsWith('m:')||sel.startsWith('x:');
        const inOrder=S.orders.some(o=>!o.done&&(o.k===sel||o.k==='c:'+t));const wish=npcs.find(n=>{const d=S.npc[n.i];return d&&d.wish&&!d.wish.done&&d.wish.day===S.day&&invFor(d.wish.k)===sel;});
        const desc=(I&&I.desc)||(sel.includes('|')?(VAR[varOf(sel)].name?`A rare ${VAR[varOf(sel)].name.toLowerCase()} harvest!`:'Fresh from your farm.'):I&&I.bio?'Found around '+I.bio.map(b=>bioLabel(b)).join(', ')+'.':'');
        h+=`<div class="detail"><img class="v-${varOf(sel)}" src="${iconOf(sel)}" alt=""><div class="grow"><div class="nm">${nameOf(sel)} ×${S.inv[sel]}</div><div class="sub">${desc}<br>${fmt(priceOf(sel))} shells each${S.demand===t?' · in demand today':''}${inOrder?' · wanted for an order':''}${wish?' · '+wish.name+' wants this!':''}</div>
          <div class="acts">${sel.startsWith('x:')?`<button class="pbtn go" data-use="${sel}">Use</button>`:''}<button class="pbtn" data-sell="${sel}">Sell 1</button>${S.inv[sel]>1?`<button class="pbtn" data-sellk="${sel}">Sell all ×${S.inv[sel]}</button>`:''}</div></div></div><div class="inv">`;
        for(const k of ks){const v=varOf(k);h+=`<button class="cell ${k===sel?'sel':''}" data-pick="${k}"><img class="v-${v}" src="${iconOf(k)}" alt="">${v!=='normal'?`<span class="dot" style="background:${{giant:'#6ab84a',moonlit:'#9ab8ff',golden:'#f5c542',crystal:'#7ad8f0',rainbow:'#f39ab0'}[v]}"></span>`:''}<span class="n">${S.inv[k]}</span></button>`;}
        const pad=Math.max(0,20-ks.length);for(let i=0;i<pad;i++)h+=`<div class="cell empty"></div>`;h+='</div>';}}}
  else if(sheet.kind==='shop'){$('sheetTitle').textContent='Shop';tabs([['decor','Decor'],['island','Island']]);
    if(sheet.tab==='decor'){h+=`<p class="note">Buy something, then tap where it should go on your home island.</p><div class="sellall"><button class="pbtn" data-edit="1">Move or store existing decor</button></div><div class="grid">`;
      for(const k in BUILD){const B=BUILD[k],lock=B.lvl>lv,n=S.store[k]||0;if(B.craft)continue;
        h+=`<button class="card ${lock?'lock':''}" data-buy="${k}" ${lock?'disabled':''}><img class="px" src="${THUMB[k]||''}" alt=""><span class="grow"><span class="nm">${B.name}</span><br><span class="sub">${lock?'Unlocks at Lv '+B.lvl:(n?`${n} in storage — tap to place`:B.desc)}</span></span><span class="price">${n?'':sh(B.cost)}</span></button>`;}
      h+='</div>';}
    else{const L=null,HU=HOUSE_UP[S.house];
      h+=`<p class="note">Grow your island from a tent on a sandbar to a hilltop villa.</p><div class="grid">`;
      h+=L?`<div class="card wide"><img class="px" src="${THUMB.land}" alt=""><span class="grow"><span class="nm">Expand the island</span><br><span class="sub">Stage ${S.land+1} → ${S.land+2}. More grass, more room.${L.lvl>lv?' Needs Lv '+L.lvl+'.':''}</span></span><button class="pbtn go" data-land="1" ${L.lvl>lv||S.shells<L.cost?'disabled':''}>${fmt(L.cost)}</button></div>`
        :`<div class="card wide"><img class="px" src="${THUMB.land}" alt=""><span class="grow"><span class="nm">${TOWN.name}</span><br><span class="sub">Your town. Clear the farm field to the west for more room.</span></span></div>`;
      h+=HU?`<div class="card wide"><img class="px" src="${THUMB['house'+(S.house+1)]}" alt=""><span class="grow"><span class="nm">Build a ${HOUSES[S.house+1]}</span><br><span class="sub">Replaces your ${HOUSES[S.house].toLowerCase()}.${HU.lvl>lv?' Needs Lv '+HU.lvl+'.':''}</span></span><button class="pbtn go" data-house="1" ${HU.lvl>lv||S.shells<HU.cost?'disabled':''}>${fmt(HU.cost)}</button></div>`
        :`<div class="card wide"><img class="px" src="${THUMB.house3}" alt=""><span class="grow"><span class="nm">The Villa is finished</span><br><span class="sub">Now fill every page of the Islandex.</span></span></div>`;
      const RN=RODS[S.rod+1],CN=CANS[S.can+1];
      h+=RN?`<div class="card wide"><img class="px" src="${ICON.rod}" alt=""><span class="grow"><span class="nm">${RN.name}</span><br><span class="sub">Longer bite window, rarer fish, fewer boots.${RN.lvl>lv?' Needs Lv '+RN.lvl+'.':''}</span></span><button class="pbtn go" data-rod="1" ${RN.lvl>lv||S.shells<RN.cost?'disabled':''}>${fmt(RN.cost)}</button></div>`
        :`<div class="card wide"><img class="px" src="${ICON.rod}" alt=""><span class="grow"><span class="nm">Golden Rod</span><br><span class="sub">The best rod on any island.</span></span></div>`;
      h+=CN?`<div class="card wide"><img class="px" src="${ICON.can}" alt=""><span class="grow"><span class="nm">${CN.name}</span><br><span class="sub">Waters a 3×3 patch in one tap.${CN.lvl>lv?' Needs Lv '+CN.lvl+'.':''}</span></span><button class="pbtn go" data-can="1" ${CN.lvl>lv||S.shells<CN.cost?'disabled':''}>${fmt(CN.cost)}</button></div>`
        :`<div class="card wide"><img class="px" src="${ICON.can}" alt=""><span class="grow"><span class="nm">Copper Can</span><br><span class="sub">Waters a 3×3 patch in one tap.</span></span></div>`;
      h+='</div>';}}
  else if(sheet.kind==='orders'){$('sheetTitle').textContent='Orders';tabs([]);
    h+=`<p class="note">Islanders across the water send new orders every morning. Finish all three for a bonus and a free <b>Mystery Seed</b>.</p><div class="list">`;
    S.orders.forEach((o,i)=>{const have=orderHave(o),ok=have>=o.n;
      h+=`<div class="card"><img class="px" src="${iconOf(o.k)}" alt=""><span class="grow"><span class="nm">${o.n} × ${nameOf(o.k)}</span><br><span class="sub">${o.done?'<span class="done">Delivered</span>':`You have ${Math.min(have,o.n)}/${o.n} · pays ${fmt(o.reward)} shells${o.k.includes(':')&&!o.k.startsWith('c:')?' · '+whereStr(itemInfo(o.k),o.k):''}`}</span></span>${o.done?'':`<button class="pbtn ${ok?'go':''}" data-deliver="${i}" ${ok?'':'disabled'}>Deliver</button>`}</div>`;});
    h+='</div>';if(S.ordBonus)h+=`<p class="note" style="margin-top:10px">All done for today. New orders arrive at dawn.</p>`;}
  else if(sheet.kind==='dex'){$('sheetTitle').textContent='Islandex';tabs([['fish','Fish'],['bugs','Bugs'],['plants','Plants'],['finds','Finds'],['crops','Crops']]);
    const [g,t]=dexCount();
    h+=`<div class="stat"><span><b>${g}</b>/${t} recorded</span><span>${Object.keys(S.disc).length}/${islands.length} islands charted</span></div><div class="meter"><b style="width:${g/t*100}%"></b></div>`;
    if(sheet.tab==='crops'){const total=CROP_IDS.length*VARIANTS.length,found=Object.keys(S.alm).filter(k=>!k.includes(':')).length;
      h+=`<p class="note">Your own crops can ripen as rare variants: <b>${found}/${total}</b> found. Moonlit ones only appear when a crop ripens at night.</p>`;
      h+=`<div class="alm"><div class="ahead"><span></span>${['Normal','Giant','Moon','Gold','Crystal','Prism'].map(n=>`<span>${n}</span>`).join('')}</div>`;
      for(const id of CROP_IDS){const C=CROPS[id];h+=`<div class="arow"><span class="an">${C.lvl>lv&&!VARIANTS.some(v=>S.alm[id+'|'+v.id])?'???':C.name}<small>${S.almR[id]?'complete':VARIANTS.filter(v=>S.alm[id+'|'+v.id]).length+'/6 found'}</small></span>`;
        for(const v of VARIANTS){const n=S.alm[id+'|'+v.id]||0;h+=`<span class="acell ${n?'done':'no'}"><img class="px ${n?'v-'+v.id:''}" src="${seedIcon(id)}" alt="${v.name} ${C.name}">${n?`<i>${n}</i>`:''}</span>`;}
        h+='</div>';}
      h+='</div>';}
    else{const cat=DEX_CATS.find(c=>c[0]===sheet.tab),[,label,pre,tab]=cat;const keys=Object.keys(tab);const got=keys.filter(k=>S.alm[pre+k]).length;
      const tips={fish:'Each island\'s waters, the shallows, the deep and the open sea all hold different fish. Cast from your boat out at sea.',bugs:'Every island has its own bugs. Butterflies fly by day, moths and glowing things by night, and beetles crawl in the grass.',plants:'Wild berries, flowers and mushrooms grow on the other islands. They regrow every morning and evening, and some only bloom at night.',finds:'The tide leaves treasures on every beach. Crates and bottles drift on the open sea.'};
      h+=`<p class="note"><b>${got}/${keys.length}</b> ${label.toLowerCase()} recorded. ${tips[sheet.tab]}</p><div class="grid">`;
      const sorted=keys.slice().sort((a,b)=>(tab[b].w||0)-(tab[a].w||0));
      for(const id of sorted){const I=tab[id],key=pre+id,n=S.alm[key]||0;
        h+=`<div class="card"><img class="px ${n?'':'sil'}" src="${ICON[key]}" alt=""><span class="grow"><span class="nm">${n?I.name:'???'}</span><br><span class="sub">${I.w?rarity(I.w)+' · ':''}${whereStr(I,key)}${n&&I.price?' · '+fmt(I.price)+' shells':''}${pre==='f:'&&S.rec[id]?` · best ${S.rec[id]} kg`:''}</span></span>${n?`<span class="price">×${n}</span>`:''}</div>`;}
      h+='</div>';}}
  else if(sheet.kind==='chart'){$('sheetTitle').textContent='Sea Chart';tabs([]);
    const disc=islands.filter(i=>S.disc[i.id]);
    h+=`<canvas id="chart" width="320" height="320"></canvas><p class="note">Tap an island you've found to travel there instantly. To discover new ones, sail out and tap the sea. Question marks are rumours of islands you haven't found yet.</p><div class="isles">`;
    for(const isl of disc){const d=Math.round(Math.hypot(isl.cx-vil.x,isl.cz-vil.z));const bio=isl.biome;
      let got=0,tot=0;if(!isl.home){for(const k in PLANTS)if(PLANTS[k].bio.includes(bio)){tot++;if(S.alm['p:'+k])got++;}for(const k in BUGS)if(BUGS[k].bio.includes(bio)){tot++;if(S.alm['b:'+k])got++;}}
      h+=`<button class="card" data-isle="${isl.id}"><img class="px" src="${isl.home?ICON.sprout:ICON.chart}" alt=""><span class="grow"><span class="nm">${isl.name}</span><br><span class="sub">${isl.home?'Your island':BIOMES[bio].name+' island'} · ${d<4?'you are here':d+' leagues away'}${tot?` · ${got}/${tot} local plants & bugs`:''}</span></span></button>`;}
    h+='</div>';}
  else if(sheet.kind==='settings'){$('sheetTitle').textContent='Island';tabs([]);const b=LV[lv];
    h+=`<div class="stat"><span>Level <b>${lv}</b></span><span>${b?`<b>${fmt(b-S.xp)}</b> XP to next`:'max level'}</span><span>Day <b>${S.day}</b></span><span><b>${fmt(S.earned)}</b> shells earned</span></div>`;
    h+=`<div class="setrow"><span>Sound</span><span class="seg"><button data-snd="1" class="${S.sound?'on':''}">On</button><button data-snd="0" class="${S.sound?'':'on'}">Off</button></span></div>`;
    h+=`<div class="setrow"><span>Music</span><span class="seg"><button data-mus="1" class="${S.music!==false?'on':''}">On</button><button data-mus="0" class="${S.music===false?'on':''}">Off</button></span></div>`;
    h+=`<div class="setrow"><span>Pixels</span><span class="seg">${[[1,'Chunky'],[0,'Classic'],[-1,'Fine']].map(([v,l])=>`<button data-px="${v}" class="${S.pxAdj===v?'on':''}">${l}</button>`).join('')}</span></div>`;
    h+=`<div class="setrow"><span class="note" style="margin:0">Drag to spin the camera, pinch to zoom. Your island and world save on this device.</span></div>`;
    h+=`<h3 class="sech">Dev tools</h3>`;
    h+=`<div class="setrow col"><div class="rowtop"><span>Time of day</span><b id="devHourLbl">${clockStr(S.hour)}</b></div><input type="range" id="devHour" min="0" max="23.9" step="0.05" value="${S.hour.toFixed(2)}" aria-label="Time of day"></div>`;
    h+=`<div class="setrow"><span>Time speed</span><span class="seg">${[[0,'Pause'],[1,'1×'],[10,'10×'],[60,'60×']].map(([v,l])=>`<button data-spd="${v}" class="${devSpeed===v?'on':''}">${l}</button>`).join('')}</span></div>`;
    h+=`<div class="setrow"><span>Weather</span><span class="seg"><button data-wx="clear" class="${S.rain?'':'on'}">Clear</button><button data-wx="rain" class="${S.rain?'on':''}">Rain</button></span></div>`;
    h+=`<div class="setrow"><span>Night sky</span><span class="seg"><button data-dev="star">Shooting star</button><button data-dev="meteor" class="${S.meteor?'on':''}">Meteor shower</button></span></div>`;
    h+=`<div class="setrow"><span>Skip ahead</span><span class="seg"><button data-dev="morning">Next morning</button><button data-dev="shells">+1,000 shells</button></span></div>`;
    h+=`<div class="setrow"><span>Start over</span><button class="pbtn warn" data-reset="1">Reset world</button></div>`;}
  body.innerHTML=h;
  if(sheet.kind==='chart')drawChart();
}
function drawChart(){const cv=$('chart');if(!cv)return;const g=cv.getContext('2d'),N=320;g.imageSmoothingEnabled=false;
  const disc=islands.filter(i=>S.disc[i.id]);let E=40;for(const i of disc)E=Math.max(E,Math.hypot(i.cx,i.cz)+14);E=Math.max(E,Math.hypot(vil.x,vil.z)+14);
  const und=islands.filter(i=>!S.disc[i.id]).sort((a,b)=>Math.hypot(a.cx-vil.x,a.cz-vil.z)-Math.hypot(b.cx-vil.x,b.cz-vil.z)).slice(0,2);
  for(const i of und)E=Math.max(E,Math.hypot(i.cx,i.cz)+14);
  const sc=(N/2-10)/E;const X=x=>N/2+x*sc,Y=z=>N/2+z*sc;
  g.fillStyle='#3565cc';g.fillRect(0,0,N,N);g.fillStyle='rgba(255,255,255,.12)';for(let x=0;x<N;x+=20)for(let y=0;y<N;y+=20)g.fillRect(x,y,2,2);
  const px=2,hex=c=>'#'+c.toString(16).padStart(6,'0');
  for(const isl of disc){const R=islR(isl)/0.62+2.2;const B=BIOMES[isl.biome];
    for(let wx=isl.home?Math.min(-R,FARM.x-11):-R;wx<=R;wx+=px/sc)for(let wz=-R;wz<=R;wz+=px/sc){const t=tileTypeI(isl,Math.round(isl.cx+wx),Math.round(isl.cz+wz));if(!t)continue;
      g.fillStyle=t==='grass'?hex(B.grass[0]):t==='sand'?hex(B.sand[0]):t==='s1'?'#7ea6e8':'#5584da';
      g.fillRect(Math.round(X(isl.cx+wx)/px)*px,Math.round(Y(isl.cz+wz)/px)*px,px,px);}}
  for(const isl of disc)if(isl.rtiles){g.fillStyle=isl.lava?'#e0582a':'#5a9ae8';for(const q of isl.rtiles)g.fillRect(Math.round(X(q.x-0.5)),Math.round(Y(q.z-0.5)),Math.max(2,Math.ceil(sc)),Math.max(2,Math.ceil(sc)));}
  g.fillStyle='#a27a50';for(const [x,z] of islands[0].bridge||[])g.fillRect(Math.round(X(x-0.5)),Math.round(Y(z-0.5)),Math.max(2,Math.ceil(sc)),Math.max(2,Math.ceil(sc)));
  g.font='12px "Fredoka", sans-serif';g.textAlign='center';
  for(const isl of disc){const R=islR(isl)/0.7;const y=Math.max(12,Y(isl.cz)-R*sc-5);g.fillStyle='#2b1e2e';g.fillText(isl.name,X(isl.cx)+1,y+1);g.fillStyle='#fff6e2';g.fillText(isl.name,X(isl.cx),y);}
  g.font='bold 16px "Fredoka", sans-serif';for(const i of und){const jx=(hash(i.id,1)-0.5)*16,jz=(hash(1,i.id)-0.5)*16;g.fillStyle='#2b1e2e';g.fillText('?',X(i.cx+jx)+1,Y(i.cz+jz)+6);g.fillStyle='#fff3c4';g.fillText('?',X(i.cx+jx),Y(i.cz+jz)+5);}
  g.fillStyle='#2b1e2e';g.fillRect(Math.round(X(vil.x))-4,Math.round(Y(vil.z))-4,8,8);g.fillStyle=S.sea?'#f6d04a':'#d8453a';g.fillRect(Math.round(X(vil.x))-2,Math.round(Y(vil.z))-2,4,4);
  cv.onclick=e=>{const r=cv.getBoundingClientRect();const wx=((e.clientX-r.left)/r.width*N-N/2)/sc,wz=((e.clientY-r.top)/r.height*N-N/2)/sc;
    let best=null,bd=1e9;for(const isl of disc){const d=Math.hypot(isl.cx-wx,isl.cz-wz);if(d<bd){bd=d;best=isl;}}if(best&&bd<18/sc+islR(best)){chartGo(best);}};}
function chartGo(isl){const here=curIsl();if(here&&here.id===isl.id){toast(`You're already on ${isl.name}.`);return;}closeSheet();fastTravel(isl);}
$('sheetBody').addEventListener('input',e=>{if(e.target.id==='devHour'){const prev=S.hour;S.hour=Number(e.target.value);if(prev<6&&S.hour>=6&&S.hour-prev<3)dawn(false);$('devHourLbl').textContent=clockStr(S.hour);applyTime();updateHUD();}});
$('sheetTabs').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(!b)return;sheet.tab=b.dataset.tab;SFX.ui();renderSheet();});
$('sheetBody').addEventListener('click',e=>{
  const el=e.target.closest('button');if(!el||el.disabled)return;const d=el.dataset;
  if(d.seed){S.seed=d.seed;SFX.ui();updateHUD();closeSheet();return;}
  if(d.pick){sheet.sel=d.pick;SFX.ui();renderSheet();return;}
  if(d.craft!==undefined){craft(Number(d.craft));renderSheet();return;}
  if(d.place){startPlace(d.place,true);return;}
  if(d.use){useItem(d.use);renderSheet();return;}
  if(d.sellk){const g=sell(d.sellk,S.inv[d.sellk]||0);if(g){SFX.coin();toast(`Sold for ${fmt(g)} shells.`,'',ICON.shell);}renderSheet();return;}
  if(d.sell){const g=sell(d.sell,1);if(g){SFX.coin();floatText(vil.x,1.2,vil.z,'+'+fmt(g),'gold');}renderSheet();return;}
  if(d.sellall){let g=0;for(const k of Object.keys(S.inv))if(!k.startsWith('m:')&&!k.startsWith('x:'))g+=sell(k,S.inv[k]);if(g){SFX.coin();setTimeout(SFX.coin,120);toast(`Sold everything for ${fmt(g)} shells.`,'',ICON.shell);}renderSheet();return;}
  if(d.buy){const k=d.buy;if(S.store[k]){startPlace(k,true);return;}if(S.shells<BUILD[k].cost){toast(`${BUILD[k].name} costs ${fmt(BUILD[k].cost)} shells.`);SFX.no();return;}startPlace(k,false);return;}
  if(d.edit){S.mode='edit';closeSheet();toast('Edit mode: tap decor to move or store it, tap empty soil to clear it.','',ICON.hammer);return;}
  if(d.isle){chartGo(islands[Number(d.isle)]);return;}
  if(d.deliver!==undefined){deliver(Number(d.deliver));renderSheet();updateHUD();return;}
  if(d.rod){const R=RODS[S.rod+1];if(!R||S.shells<R.cost)return;S.shells-=R.cost;S.rod++;setRod();SFX.level();toast(`You got the ${R.name}!`,'rare',ICON.rod);renderSheet();return;}
  if(d.can){const R=CANS[S.can+1];if(!R||S.shells<R.cost)return;S.shells-=R.cost;S.can++;SFX.level();toast(`You got the ${R.name}! It waters a 3×3 patch.`,'rare',ICON.can);renderSheet();return;}
  if(d.land){const L=LAND_UP[S.land];if(!L||S.shells<L.cost)return;S.shells-=L.cost;S.land++;buildIsland(islands[0]);rebuildSeaGrid();syncObjs();rebuildSoil();syncAllCrops();syncLife();ensureBoat(true);SFX.level();
    toast('The tide pulls back — your island has grown!','rare',ICON.star);for(let i=0;i<30;i++)sparkle((Math.random()-0.5)*14,0.6,(Math.random()-0.5)*12,0xfff6e2);renderSheet();return;}
  if(d.house){const HU=HOUSE_UP[S.house];if(!HU||S.shells<HU.cost)return;S.shells-=HU.cost;S.house++;syncObjs();SFX.level();burst(HOUSE_AT.x+0.5,1.5,HOUSE_AT.z+0.5,0xf6eedb,30,2.4,0.1);
    toast(S.house===3?'Your Villa is complete!':`Your new ${HOUSES[S.house]} is ready!`,'rare',THUMB['house'+S.house]);renderSheet();return;}
  if(d.mus!==undefined){S.music=d.mus==='1';renderSheet();return;}
  if(d.spd!==undefined){devSpeed=Number(d.spd);renderSheet();return;}
  if(d.wx){if(d.wx==='rain'){S.rain=true;S.rainUntil=0;for(const k in S.tiles)S.tiles[k].w=1;rebuildSoil();}else if(S.rain)stopRain();renderSheet();return;}
  if(d.dev==='star'){if(nightF<0.5){S.hour=22;applyTime();}spawnShootingStar();closeSheet();return;}
  if(d.dev==='meteor'){S.meteor=!S.meteor;if(S.meteor&&nightF<0.5){S.hour=21.5;applyTime();}renderSheet();return;}
  if(d.dev==='morning'){closeSheet();sleep();return;}
  if(d.dev==='shells'){S.shells+=1000;SFX.coin();return;}
  if(d.snd!==undefined){S.sound=d.snd==='1';setWaveVol();if(S.sound)startWaves();renderSheet();return;}
  if(d.px!==undefined){S.pxAdj=Number(d.px);resize();renderSheet();return;}
  if(d.reset){el.textContent='Tap again to erase';el.dataset.reset='';el.dataset.really='1';return;}
  if(d.really){resetting=true;try{localStorage.removeItem(SAVE_KEY);}catch(e){}location.reload();return;}
});
$('sheetX').onclick=()=>{SFX.ui();closeSheet();};
$('bSeed').onclick=()=>openSheet('seeds');
$('bBag').onclick=()=>openSheet('bag');
$('bShop').onclick=()=>openSheet('shop',sheet&&sheet.kind==='shop'?sheet.tab:'decor');
$('bTask').onclick=()=>openSheet('orders');
$('bChart').onclick=()=>openSheet('chart');
$('bDex').onclick=()=>openSheet('dex',sheet&&sheet.kind==='dex'?sheet.tab:'fish');
$('lvlChip').onclick=()=>openSheet('settings');

