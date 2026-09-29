/* =========================================================
   The island's heartbeat: the tide as an event (a countdown, a sweep across the screen when it turns, tide pools that
   open with rare finds only then), a morning report of what changed while you were away, tomorrow's forecast for the
   diary, and the chance rewards: golden fish shadows, shiny forage. Also `buzz`, a tiny haptic tap where supported.
   ========================================================= */
function buzz(ms=8){try{if(navigator.vibrate)navigator.vibrate(ms);}catch(e){}}

// ---- tides: when's the next turn? (the tide runs on absolute hours, so it shifts about 50 minutes a day) ----
const LOW_Y=-0.055;
const tideLowT=t=>tideAt(t)<LOW_Y;
// minutes until the tide next turns, stepping forward five minutes at a time
function tideNext(){const t0=tideNow(),low=tideLowT(t0);for(let i=1;i<=170;i++)if(tideLowT(t0+i*5/60)!==low)return{low,min:i*5};return{low,min:0};}
function fmtMin(m){return m<60?`${m}m`:`${Math.floor(m/60)}h ${String(m%60).padStart(2,'0')}m`;}
// when low tide starts on a given day (0 today, 1 tomorrow), as clock hours
function lowTimes(dd){const mid=tideNow()-S.hour+dd*24,out=[];let prev=tideLowT(mid);for(let m=10;m<24*60;m+=10){const l=tideLowT(mid+m/60);if(l&&!prev)out.push(m/60);prev=l;}return out;}
let tideWarned=false,tideSig='';
const WAVE_SVG='<svg viewBox="0 0 24 24"><path d="M2 14c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 19c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
function tideHUD(){const el=$('tideTxt');if(!el)return;if(S.sea||inside||!S.home&&!S.scratch){el.hidden=true;return;}const t=tideNext();
  const txt=t.low?`Low tide · ${fmtMin(t.min)} left`:`Low tide in ${fmtMin(t.min)}`,soon=!t.low&&t.min<=10;
  const sig=txt+soon+t.low;if(sig!==tideSig){tideSig=sig;el.innerHTML=WAVE_SVG+`<span>${txt}</span>`;el.classList.toggle('low',t.low);el.classList.toggle('soon',soon);}el.hidden=false;
  if(soon&&!tideWarned){tideWarned=true;say('The tide is going out soon… the pools will open up.');}if(!soon)tideWarned=false;}
// the moment it turns: a wave sweeps across the screen, and at low tide the pools open with creatures that only show up now
function tideTurn(low,isl,boot){
  if(low&&isl){const edge=isl.sand.filter(([x,z])=>{const c=SAND_CH.get(K(x,z));return c&&Math.min(...c)<0.1&&freeTile(x,z);});
    const n=boot?3:4+Math.floor(Math.random()*2);for(let i=0;i<n&&edge.length;i++){const [x,z]=edge.splice(Math.floor(Math.random()*edge.length),1)[0];const r=Math.random();
      S.finds.push({k:r<0.12?'seahorse':r<0.2?'pearl':pickR(['hermit','anemone','star']),x,z,tide:1});}syncLife();}
  if(boot)return;
  tideSweep(low);if(low)say(isl?'The tide is out! The pools are full of life… for now.':'The tide is out.');else say('The tide is coming back in.');
  buzz(15);noise(1.2,0.06,500,0.5);setTimeout(()=>noise(0.9,0.04,900,0.6),300);}
function tideSweep(low){const el=document.createElement('div');el.className='tidesweep'+(low?' out':' in');el.innerHTML=`<b>${low?'Low tide':'High tide'}</b>`;document.body.appendChild(el);setTimeout(()=>el.remove(),2600);}

// ---- overnight: the sea leaves gifts on your beach, and the morning report says what changed ----
function seaGifts(){const isl=islands[0];if(!isl||!S.scratch&&!S.wild)return 0;const c=isl.sand.filter(([x,z])=>freeTile(x,z));let n=0;
  for(let i=0;i<3&&c.length;i++){const [x,z]=c.splice(Math.floor(Math.random()*c.length),1)[0];const r=Math.random();S.finds.push({k:r<0.08?'bottle':r<0.3?'glass':r<0.55?'dollar':r<0.8?'shell':'drift',x,z,gift:1});n++;}
  S.giftN=(S.giftN||0)+n;return n;}
function tomorrowLines(){const lt=lowTimes(1).map(h=>clockStr(h)),cr=Object.values(S.tiles).filter(t=>t.crop).length,out=[];
  if(lt.length)out.push(`Low tide at ${lt.join(' and ')}`);if(cr)out.push(`${cr} crop${cr>1?'s':''} growing in the dark`);out.push('Something may wash up on the beach');if(S.heartAt)out.push('The driftseed is stirring…');return out;}
function morningCard(out,away){if(document.body.classList.contains('titling')){setTimeout(()=>morningCard(out,away),700);return;}const gifts=S.giftN||0;S.giftN=0;const lines=[];
  if(out&&out.length)lines.push(`${out.length} crop${out.length>1?'s':''} ripened`);if(gifts)lines.push(`The sea left ${gifts} gift${gifts>1?'s':''} on the beach`);
  const lt=lowTimes(0).filter(h=>h>S.hour).map(h=>clockStr(h));if(lt.length)lines.push(`Low tide today at ${lt[0]}`);if(S.rain)lines.push('Rain today: the fish are biting');
  const wd=new Date(typeof gameNow==='function'?gameNow():Date.now()).toLocaleDateString(undefined,{weekday:'long'});
  const el=document.createElement('div');el.className='morning';el.innerHTML=`<div class="sun"></div><div class="mc"><small>${away?'While you were away':'Good morning'}</small><b>Day ${S.day} · ${wd}</b>${lines.map(l=>`<span>${l}</span>`).join('')}</div>`;
  document.body.appendChild(el);SFX.discover();buzz(12);const go=()=>{el.classList.add('out');setTimeout(()=>el.remove(),500);};el.onclick=go;setTimeout(go,4200);}

// ---- chance rewards: gleaming finds and golden fish ----
const goldShadowMat=new T.MeshBasicMaterial({color:0xffc83a,transparent:true,opacity:0.55,depthWrite:false,blending:T.AdditiveBlending});
function shineLife(dt,tt){goldShadowMat.opacity=0.4+0.25*Math.sin(tt*5);
  for(const f of S.finds){if(!(f.shiny||f.tide||f.gift))continue;if(Math.abs(f.x-vil.x)>12||Math.abs(f.z-vil.z)>12)continue;
    if(Math.random()<dt*(f.shiny?2.2:0.5))sparkle(f.x,(topY(f.x,f.z)||0.2)+0.15,f.z,f.shiny?0xfff0a0:0xe8fbff);}
  for(const s of shadows)if(s.gold&&!s.out&&Math.random()<dt*3)sparkle(s.x,(s.wy||tideY)+0.05,s.z,0xffe27a);}
// a golden shadow: a rare fish that shimmers, with a short bite window, worth a bonus
function goldFish(region,deep,river){return pickW(FISH,k=>{const F=FISH[k];if(F.junk||F.w>=6||!dexOk(F,S.sea?null:curIsl()))return false;if(F.hab==='river'?!river:river)return false;return F.bio.includes('any')||F.bio.includes(region);},(k,F)=>F.w);}
