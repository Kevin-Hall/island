/* =========================================================
   State + save
   ========================================================= */
const SAVE_KEY='driftseed-town-v1'; // the town branch keeps its own save so it never touches the main game's
function freshState(){
  return {v:1,shells:150,xp:0,day:1,hour:7.2,land:0,house:0,tiles:{},objs:[],store:{},inv:{},alm:{},almR:{},
    seed:'turnip',rain:false,demand:'carrot',sound:true,pxAdj:0,nextId:1,t:Date.now(),mode:'farm',log:[],buff:{},look:{sp:'bunny',fur:0xf6f3ee,shirt:0xd8453a},tool:'hand',tipTools:0,tipSeed:0,tut:0,harvested:0,earned:0,
    finds:[],weeds:[],free:{},orders:[],ordBonus:0,rod:0,can:0,rec:{},npc:{},shook:{},wv:0,farmInit:0,debris:[],farmClear:0,tipPaint:0,
    worldSeed:Math.floor(Math.random()*1e9),sea:false,px:0.3,pz:2.1,boat:null,disc:{0:1},picked:{},dexR:{},boatTip:0};
}
function load(){try{const s=JSON.parse(localStorage.getItem(SAVE_KEY));if(s&&s.v===1){const f=freshState();for(const k in f)if(s[k]===undefined)s[k]=f[k];return s;}}catch(e){}return null;}
let resetting=false;
function save(){if(resetting)return;S.t=Date.now();S.px=vil.x;S.pz=vil.z;try{localStorage.setItem(SAVE_KEY,JSON.stringify(S));}catch(e){}}
let S=load(); const isNew=!S; if(!S) S=freshState();
if(S.mode==='edit')S.mode='farm';

function level(){let l=1;while(l<LV.length&&S.xp>=LV[l])l++;return l;}
function isNight(h=S.hour){return h>=19.5||h<5.5;}

