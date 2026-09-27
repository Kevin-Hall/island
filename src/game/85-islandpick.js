/* =========================================================
   New game: choose your island. Three procedural islands wash up on the chart, each with its own coastline (bays and
   coves carved by S.home.shape), cliffs and farm (from the world seed) and a style (HOME_STYLES palette and trees).
   The player picks one (or asks for three more), names it, and the game boots on it (bootGame in 90-main).
   ========================================================= */
function islandCandidate(){const r=Math.random,style=Object.keys(HOME_STYLES)[Math.floor(r()*4)];
  // one or two carved coves (kept off the west, where the farm bridge lands), and how far north the cliffs start
  const coves=[];for(let i=0,n=1+(r()<0.5);i<n;i++){let a;do a=r()*6.283;while(Math.abs(Math.atan2(Math.sin(a-Math.PI),Math.cos(a-Math.PI)))<0.6);coves.push([a,0.16+r()*0.2,0.18+r()*0.22]);}
  return{seed:Math.floor(r()*1e9),style,shape:[0.02+r()*0.12,r()*0.1,r()*0.06,r()*6.283,r()*6.283,r()*6.283,2.8+r()*2.2],coves,cliff:[0.12+r()*0.32,r()<0.6?1:0],
    name:TOWN_NAMES[0][Math.floor(r()*TOWN_NAMES[0].length)]+TOWN_NAMES[1][Math.floor(r()*TOWN_NAMES[1].length)]};}
const homeOf=c=>({style:c.style,shape:c.shape,coves:c.coves,cliff:c.cliff});
function pickTrio(){const out=[],styles=shuffle(Object.keys(HOME_STYLES),Math.random).slice(0,3);for(const st of styles){const c=islandCandidate();c.style=st;out.push(c);}return out;}
// paint a candidate's map (and describe it) by running the same tile rules the world builder uses, under its seed
function islandPreview(c,cv){const ws=S.worldSeed,hm=S.home;S.worldSeed=c.seed;S.home=homeOf(c);
  const st=HOME_STYLES[c.style],isl={home:true,biome:'home'},X0=-52,X1=26,Z0=-22,Z1=22,px=4,g=cv.getContext('2d');
  cv.width=(X1-X0+1)*px;cv.height=(Z1-Z0+1)*px;g.fillStyle='#4f8fdc';g.fillRect(0,0,cv.width,cv.height);
  const hex=n=>'#'+n.toString(16).padStart(6,'0'),lv=new Map();let grass=0,high=0;
  for(let z=Z0;z<=Z1;z++)for(let x=X0;x<=X1;x++){const t=tileTypeI(isl,x,z);if(!t)continue;let col;
    if(t==='grass'){const l=levelOf(isl,x,z);lv.set(K(x,z),l);grass++;if(l)high++;col=lerpHex(st.grass[(x+z)&1?0:1],0xffffff,l*0.1);}
    else col=t==='sand'?st.sand[0]:t==='s1'?0x8ec8ee:0x6aa8e8;
    g.fillStyle=hex(col);g.fillRect((x-X0)*px,(z-Z0)*px,px,px);}
  // cliff faces: a dark band on the south edge of each raised tile
  g.fillStyle='rgba(90,60,40,.55)';for(const [k,l] of lv){if(!l)continue;const [x,z]=k.split(',').map(Number);if((lv.get(K(x,z+1))||0)<l)g.fillRect((x-X0)*px,(z-Z0)*px+px-2,px,2);}
  const dirs=['east','south-east','south','south-west','west','north-west','north','north-east'],dir=a=>dirs[Math.round(((a+6.283)%6.283)/0.785)%8];
  const cv2=c.coves.slice().sort((a,b)=>b[1]-a[1])[0];
  S.worldSeed=ws;S.home=hm;
  const traits=[grass>1090?'roomy':grass>1040?'cosy':'snug',c.cliff[1]&&high>250?'two tiers of cliffs':high>340?'a wide cliff-top meadow':high>200?'a low cliff to the north':'gentle and flat',
    cv2[1]>0.27?`a deep bay to the ${dir(cv2[0])}`:`a cove to the ${dir(cv2[0])}`];
  return traits;}

function showIslandPicker(){let trio=pickTrio(),chosen=null;
  const el=document.createElement('div');el.id='pick';document.body.appendChild(el);
  const cards=()=>{el.innerHTML=`<div class="pk"><h1>Choose your island</h1><p class="sub">Three islands have washed up on your chart. One of them will be home: everything on it, you'll build yourself.</p>
    <div class="pkcards">${trio.map((c,i)=>`<button class="pkc" data-i="${i}"><canvas></canvas><span class="pkt"><b>${HOME_STYLES[c.style].name} island</b><small class="pktr"></small><small>${HOME_STYLES[c.style].blurb}</small></span></button>`).join('')}</div>
    <button class="pbtn" id="pkMore">Show me three more</button></div>`;
    el.querySelectorAll('.pkc').forEach((b,i)=>{const tr=islandPreview(trio[i],b.querySelector('canvas'));b.querySelector('.pktr').textContent=tr.join(' · ');});
    el.querySelector('#pkMore').onclick=()=>{trio=pickTrio();cards();};
    el.querySelectorAll('.pkc').forEach(b=>b.onclick=()=>{chosen=trio[+b.dataset.i];naming();});};
  const naming=()=>{el.innerHTML=`<div class="pk"><h1>Name your island</h1><canvas class="pkbig"></canvas>
    <label class="pkname"><span>Island name</span><input id="pkName" maxlength="16" value="${chosen.name}" autocomplete="off"></label>
    <p class="sub">You arrive with a tent, a shovel and a little sapling in the square. Grow it into an <b>Island Heart</b> by farming, fishing, catching bugs and decorating, and your island grows with it.</p>
    <div class="pkrow"><button class="pbtn" id="pkBack">Back</button><button class="pbtn go" id="pkGo">Settle here</button></div></div>`;
    islandPreview(chosen,el.querySelector('canvas'));
    el.querySelector('#pkBack').onclick=cards;
    el.querySelector('#pkGo').onclick=()=>{const nm=(el.querySelector('#pkName').value||'').trim().slice(0,16)||chosen.name;
      S.worldSeed=chosen.seed;S.home=homeOf(chosen);S.islandName=nm;S.scratch=1;el.remove();bootGame();};};
  cards();}
