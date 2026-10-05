/* =========================================================
   The shop, reworked for a phone held upright, and worth the walk into town.
   The catalogue is a two-column grid of tiles (big picture, name, a price pill, badges for deals and what you already
   have in storage); tapping a tile shows it in a panel that stays pinned at the top while you scroll, with its
   description and the buy buttons. Marlo's boat uses the same tiles.
   Shopping from anywhere (the Shop button) gets you the catalogue at list price, delivered to the spot you pick. Walking
   into Hazel's store gets you more:
   - Seeds: every crop you've unlocked, in packs of 1, 5 or 10 (elsewhere only Marlo's two random packs a day).
   - Today's deals: three pieces of decor or plants and one seed at 25% off, different every day.
   - Hazel pays 10% more for your produce and forage when you sell to her (70-ui `sell`).
   - A loyalty card: a stamp for every 500 shells spent in the store, and a free gift from Hazel when it's full (5).
   What you buy in the store goes straight into your Bag (Decor), ready to place when you're home.
   ========================================================= */
const inStore=()=>!!(inside&&inside.kind==='shop');
const STAMP_EVERY=500,STAMP_FULL=5,DEAL_OFF=0.25;
function shopDeals(){const lv=level(),R=mulberry(hi(S.day|0,401,S.worldSeed|0));
  const pool=Object.keys(BUILD).filter(k=>!BUILD[k].craft&&BUILD[k].lvl<=lv&&BUILD[k].cost>0),out=[];
  for(let i=0;i<3&&pool.length;i++)out.push('b:'+pool.splice(Math.floor(R()*pool.length),1)[0]);
  const seeds=CROP_IDS.filter(id=>CROPS[id].lvl<=lv);if(seeds.length)out.push('s:'+seeds[Math.floor(R()*seeds.length)]);return out;}
const isDeal=k=>inStore()&&shopDeals().includes(k);
function shopItem(key){const lv=level(),t=key.slice(0,2),id=key.slice(2);
  if(t==='b:'){const B=BUILD[id];if(!B)return null;const base=B.cost,price=Math.round(base*(isDeal(key)?1-DEAL_OFF:1));
    return{key,name:B.name,icon:THUMB[id]||'',base,price,lock:B.lvl>lv,lockTxt:'Unlocks at Lv '+B.lvl,desc:B.desc,have:S.store[id]||0,seed:false};}
  if(t==='s:'){const C=CROPS[id];if(!C)return null;const base=C.seed,price=Math.max(1,Math.round(base*(isDeal(key)?1-DEAL_OFF:1)));
    return{key,name:C.name+' seeds',icon:seedIcon(id),base,price,lock:C.lvl>lv,lockTxt:'Unlocks at Lv '+C.lvl,desc:`Grows into ${/s$/.test(C.name)?'':'a '}${C.name.toLowerCase()} in about ${Math.round(C.grow/60*10)/10} hours. Sells for ${fmt(C.price)} shells.`,have:S.free[id]||0,seed:true};}
  return null;}
function shopList(tab){
  if(tab==='deals')return shopDeals();
  if(tab==='seeds')return CROP_IDS.map(id=>'s:'+id);
  const pl=tab==='plants';return Object.keys(BUILD).filter(k=>!BUILD[k].craft&&!!BUILD[k].plant===pl).map(k=>'b:'+k);}
// the shop's body for the catalogue tabs
function shopHTML(lv){const tab=sheet.tab,keys=shopList(tab),items=keys.map(shopItem).filter(Boolean);let h='';
  // the strip along the top: your purse, and in the store the loyalty card; elsewhere, a nudge to visit
  if(inStore()){const st=S.stamps||0,sp=S.stampSpend||0;
    h+=`<div class="shophead"><span class="purse">${shellHTML}<b>${fmt(S.shells)}</b></span><span class="card-l"><span class="lbl">Hazel’s loyalty card</span><span class="stamps">${[...Array(STAMP_FULL)].map((_,i)=>`<i class="${i<st?'on':''}">${i<st?'★':''}</i>`).join('')}</span><span class="lbl sm">${fmt(STAMP_EVERY-sp)} more shells to the next stamp · a gift when it’s full</span></span></div>`;}
  else h+=`<div class="shophead visit"><span class="purse">${shellHTML}<b>${fmt(S.shells)}</b></span><span class="lbl">Pop into <b>Hazel’s store</b> in town for <b>seeds</b>, <b>daily deals</b>, a <b>loyalty card</b> and <b>+10%</b> for your produce.</span></div>`;
  if(!inStore()&&tab==='decor')h+=`<div class="sellall"><button class="pbtn" data-edit="1">Decorate: move, paint or store your decor</button></div>`;
  if(tab==='deals')h+=`<p class="note">Today’s deals, ${Math.round(DEAL_OFF*100)}% off. New ones every morning.</p>`;
  if(!items.length)return h+`<p class="note">Nothing here yet.</p>`;
  // the pinned panel: the chosen thing, and how to buy it
  const sel=items.find(i=>i.key===sheet.ssel&&!i.lock)||items.find(i=>!i.lock)||items[0];
  {const I=sel,afford=n=>S.shells>=I.price*n;let acts='';
    if(I.lock)acts=`<span class="chip">${I.lockTxt}</span>`;
    else if(I.seed)acts=[1,5,10].map(n=>`<button class="pbtn ${n===5?'go':''}" data-sbuy="${I.key}" data-n="${n}" ${afford(n)?'':'disabled'}>×${n} · ${fmt(I.price*n)}</button>`).join('');
    else if(inStore())acts=`<button class="pbtn go" data-sbuy="${I.key}" data-n="1" ${afford(1)?'':'disabled'}>Buy · ${fmt(I.price)}</button>`;
    else acts=I.have?`<button class="pbtn go" data-buy="${I.key.slice(2)}">Place one</button><button class="pbtn" data-sbuy="${I.key}" data-n="1" ${afford(1)?'':'disabled'}>Buy another · ${fmt(I.price)}</button>`:`<button class="pbtn go" data-buy="${I.key.slice(2)}" ${afford(1)?'':'disabled'}>Buy &amp; place · ${fmt(I.price)}</button>`;
    h+=`<div class="detail pin"><img src="${I.icon}" alt=""><div class="grow"><div class="nm">${I.name}${I.have?` <span class="have-t">${I.seed?I.have+' seeds':'×'+I.have+' in your bag'}</span>`:''}</div><div class="sub">${I.desc}</div>
      <div class="pp-row">${I.price<I.base?`<s>${fmt(I.base*(I.seed?1:1))}</s> `:''}<span class="pp">${shellHTML}${fmt(I.price)}${I.seed?' each':''}</span>${I.price<I.base?' <span class="pp hot">Deal</span>':''}</div><div class="acts">${acts}</div></div></div>`;}
  h+=`<div class="tiles">`;
  for(const I of items){const deal=I.price<I.base;
    h+=`<button class="tile ${I.key===sel.key?'sel':''} ${I.lock?'lock':''}" data-ssel="${I.key}">${deal?'<span class="badge">−25%</span>':''}${I.have?`<span class="have">${I.seed?I.have:'×'+I.have}</span>`:''}<img src="${I.icon}" alt=""><span class="nm">${I.name}</span><span class="pr">${I.lock?I.lockTxt:`${deal?`<s>${fmt(I.base)}</s>`:''}${fmt(I.price)}`}</span></button>`;}
  return h+'</div>';}
// buy in the store (into your bag) or another of something from anywhere
function shopBuy(key,n){const I=shopItem(key);if(!I||I.lock)return;const cost=I.price*n;if(S.shells<cost){SFX.no();toast(`That’s ${fmt(cost)} shells.`);return;}
  S.shells-=cost;const id=key.slice(2);
  if(I.seed)S.free[id]=(S.free[id]||0)+n;else S.store[id]=(S.store[id]||0)+n;
  SFX.coin();toast(`Bought ${n>1?n+'× ':''}<b>${I.name}</b>${I.seed?'. They’re in your seed bag.':'. It’s in your Bag, ready to place.'}`,'',I.icon);
  if(inStore())stampFor(cost);save();updateHUD();}
function stampFor(spent){S.stampSpend=(S.stampSpend||0)+spent;S.stamps=S.stamps||0;
  while(S.stampSpend>=STAMP_EVERY){S.stampSpend-=STAMP_EVERY;S.stamps++;
    if(S.stamps>=STAMP_FULL){S.stamps=0;const pool=Object.keys(BUILD).filter(k=>!BUILD[k].craft&&BUILD[k].lvl<=level()&&BUILD[k].cost>=150&&BUILD[k].cost<=1500),k=pickR(pool.length?pool:['lantern']);
      S.store[k]=(S.store[k]||0)+1;SFX.rare();setTimeout(()=>toast(`Your loyalty card is full! Hazel gives you a <b>${BUILD[k].name}</b>, on the house.`,'rare',THUMB[k]),500);}
    else setTimeout(()=>{tone(1175,0.08,'triangle',0.03);toast(`A stamp on your loyalty card (${S.stamps}/${STAMP_FULL}).`,'',ICON.star);},400);}}
