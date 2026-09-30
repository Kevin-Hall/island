/* =========================================================
   Weather: every morning picks the day's weather at random, weighted by the (real) season: summers are mostly clear
   with the odd thunderstorm, springs showery, autumns cloudy and foggy, winters grey with snow. There's a 30% chance
   the weather simply carries on from yesterday, so you get runs of fine days and wet spells rather than noise.
   Tomorrow's weather is rolled a day ahead (S.wxNext), so the diary's forecast is true.
   What each one does: rain and storms water every crop (storms add lightning and thunder), clouds and fog grey the sky,
   fog thickens the haze, snow falls on the island in winter, and breezy days send leaves and petals flying.
   ========================================================= */
const WX={clear:{name:'Clear',grey:0},windy:{name:'Breezy',grey:0.12},cloudy:{name:'Cloudy',grey:0.55},fog:{name:'Foggy',grey:0.45,fog:1},
  rain:{name:'Rain',grey:1,rain:1},storm:{name:'Storm',grey:1,rain:1,storm:1},snow:{name:'Snow',grey:0.7,snow:1}};
const WX_SEASON={spring:{clear:34,windy:8,cloudy:20,fog:8,rain:26,storm:4},summer:{clear:54,windy:8,cloudy:12,fog:3,rain:12,storm:11},
  autumn:{clear:28,windy:10,cloudy:22,fog:14,rain:20,storm:6},winter:{clear:26,windy:4,cloudy:24,fog:11,rain:5,storm:2,snow:28}};
function rollWx(prev){const W=WX_SEASON[season()]||WX_SEASON.spring;if(prev&&W[prev]&&Math.random()<0.3)return prev;
  let t=0;for(const k in W)t+=W[k];let r=Math.random()*t;for(const k in W){r-=W[k];if(r<=0)return k;}return'clear';}
const wxNow=()=>S.wx&&WX[S.wx]?S.wx:(S.rain?'rain':'clear');
function wxGrey(){return WX[wxNow()].grey;}
// set the weather (the morning roll, or the dev switch)
function setWx(k){S.wx=k;S.rain=!!WX[k].rain;S.rainUntil=0;if(S.rain){for(const q in S.tiles)S.tiles[q].w=1;if(typeof rebuildSoil==='function'&&soilIM)rebuildSoil();}}
function dawnWeather(){const k=S.wxNext&&WX[S.wxNext]?S.wxNext:rollWx(S.wx);S.wx=k;S.wxNext=rollWx(k);S.rain=!!WX[k].rain;
  S.rainUntil=S.rain&&k!=='storm'&&Math.random()<0.55?11+Math.random()*5:0;}
// storms: now and then a flash of lightning, and the thunder a moment later
let boltT=4,fogW=0;
function updateWeather(dt){if(wxNow()!=='storm'||inside){return;}boltT-=dt;if(boltT>0)return;boltT=6+Math.random()*14;
  let f=$('bolt');if(!f){f=document.createElement('div');f.id='bolt';document.body.appendChild(f);}f.classList.remove('on');void f.offsetWidth;f.classList.add('on');
  setTimeout(()=>{noise(1.8,0.22,70,0.95);tone(48,1.2,'sine',0.05,30);},500+Math.random()*1500);}
