/* =========================================================
   Human characters, and the character editor
   ========================================================= */
// A human player (S.look.sp 'human', its choices in S.look.h) is built by humanModel: chibi proportions to stand
// with the villagers (a big round head, a small body), with the same named limb pivots (armL/armR/footL/footR) and
// face meshes (open/blink/happy, smile/talk) as npcModel, so walking, swimming, blinking and rooms all just work.
// The editor (openCharEd) zooms in on you in the world with a tray of choices: boy/girl, skin, hair style and colour,
// eyes, face details, top, bottoms, shoes and something to wear on your head. Drag to turn round, Shuffle for a surprise.
const HSKIN=[0xfde3cf,0xf6d2b4,0xeec09a,0xd9a27a,0xc08660,0xa06a48,0x7a4e34,0x5a3826];
const HHAIR=[0x2a2026,0x4a2e22,0x7a4a2a,0xb07a40,0xe0b860,0xf0dca0,0xc8502a,0xe8e4dc,0x8a8a98,0xf08ab0,0x6a9ae8,0x7ac87a,0xa87ad8];
const HEYES=[0x3a2a22,0x6a4a2a,0x3a6a9a,0x4a8a5a,0x7a7a8a,0x8a5ab8];
const HCLOTH=[0xd8453a,0xf08a3a,0xf6d04a,0x6ab84a,0x3ab8a8,0x5a8ae0,0x3a4a7a,0x9a6ad0,0xf39ab0,0xf4f0ea,0x8a8a98,0x3a3440,0x8a5a3a];
const HSTYLE={
  hair:[['short','Short'],['side','Side part'],['spiky','Spiky'],['buzz','Buzz'],['curly','Curly'],['mohawk','Mohawk'],['bob','Bob'],['long','Long'],['ponytail','Ponytail'],['pigtails','Pigtails'],['bun','Top bun'],['afro','Afro']],
  top:[['tee','T-shirt'],['stripe','Stripy tee'],['hoodie','Hoodie'],['sweater','Sweater'],['tank','Vest top'],['overalls','Overalls'],['dress','Dress'],['jacket','Jacket']],
  bot:[['shorts','Shorts'],['trousers','Trousers'],['skirt','Skirt']],
  hat:[['none','Nothing'],['cap','Cap'],['beanie','Beanie'],['sunhat','Sun hat'],['bow','Bow'],['flower','Flower'],['headband','Headband'],['band','Bandana']]};
const HDEF={boy:{g:'boy',skin:2,hair:'short',hairC:1,eye:0,top:'tee',topC:0x5a8ae0,bot:'shorts',botC:0x3a4a7a,shoe:0xf4f0ea,hat:'none',glasses:0,blush:1,freckles:0},
  girl:{g:'girl',skin:1,hair:'ponytail',hairC:2,eye:1,top:'dress',topC:0xf39ab0,bot:'skirt',botC:0x5a8ae0,shoe:0xd8453a,hat:'bow',glasses:0,blush:1,freckles:0}};
function humanModel(h0){const h=Object.assign({},HDEF.boy,h0),g=new T.Group(),p=[],sk=HSKIN[h.skin]??HSKIN[2],hc=HHAIR[h.hairC]??HHAIR[1],ec=HEYES[h.eye]??HEYES[0],tc=h.topC,bc=h.botC,girl=h.g==='girl';
  const dk=(c,t)=>lerpHex(c,0x1a1420,t),lt=(c,t)=>lerpHex(c,0xffffff,t),hp=[];
  const dress=h.top==='dress',hipY=0.27,tw=girl?0.27:0.3,chestY=0.42,shY=0.52,headY=0.8,HR=0.25;
  // body
  p.push(P(ICO2,h.top==='overalls'?bc:tc,0,chestY,0,0,0,0,tw,0.32,0.22));
  if(h.top==='stripe')for(let i=0;i<3;i++)p.push(P(CYL12,0xf8f6f0,0,0.33+i*0.08,0,0,0,0,tw*0.98*(1-Math.abs(i-1)*0.06),0.035,0.215));
  if(h.top==='overalls'){p.push(P(ICO2,tc,0,0.5,0.02,0,0,0,tw*0.9,0.16,0.2));for(const s of [-1,1])p.push(P(BOX,bc,s*0.07,0.5,0.1,0,0,0,0.035,0.16,0.03),P(ICO2,0xe0b050,s*0.07,0.44,0.11,0,0,0,0.03,0.03,0.02));p.push(P(BOX,lt(bc,0.15),0,0.38,0.105,0,0,0,0.12,0.08,0.02));}
  if(h.top==='hoodie'){p.push(P(ICO2,dk(tc,0.12),0,0.57,-0.09,0,0,0,0.24,0.12,0.12),P(BOX,dk(tc,0.1),0,0.34,0.105,0,0,0,0.15,0.07,0.02));for(const s of [-1,1])p.push(P(CYL8,0xf4f0ea,s*0.035,0.47,0.105,0,0,0,0.012,0.09,0.012));}
  if(h.top==='sweater')p.push(P(CYL12,dk(tc,0.12),0,0.56,0,0,0,0,0.17,0.05,0.15),P(CYL12,dk(tc,0.12),0,0.27,0,0,0,0,tw*0.92,0.04,0.2));
  if(h.top==='jacket'){p.push(P(BOX,0xf4f0ea,0,0.42,0.095,0,0,0,0.09,0.24,0.03));for(const s of [-1,1])p.push(P(BOX,dk(tc,0.15),s*0.055,0.5,0.1,0,0,s*0.35,0.04,0.12,0.03));}
  if(h.top==='tank')p.push(P(CYL12,sk,0,0.55,0,0,0,0,0.16,0.04,0.14));
  // bottoms: a dress flares out from the waist; otherwise shorts, trousers or a skirt
  if(dress){p.push(P(CONE12,tc,0,0.22,0,0,0,0,0.42,0.3,0.36),P(CYL12,lt(tc,0.3),0,0.08,0,0,0,0,0.42,0.025,0.36));}
  else if(h.bot==='skirt')p.push(P(CONE12,bc,0,0.24,0,0,0,0,0.38,0.2,0.32),P(CYL12,dk(bc,0.12),0,0.32,0,0,0,0,tw*0.9,0.04,0.2));
  else p.push(P(ICO2,bc,0,0.29,0,0,0,0,tw*0.92,0.1,0.21),P(CYL12,dk(bc,0.25),0,0.33,0,0,0,0,tw*0.9,0.025,0.2));
  // head
  p.push(P(CYL12,sk,0,0.57,0,0,0,0,0.09,0.06,0.09));
  p.push(P(SPH,sk,0,headY,0,0,0,0,HR*2,HR*1.92,HR*1.86));
  for(const s of [-1,1])p.push(P(SPH_LO,sk,s*HR*0.98,headY-0.02,0,0,0,0,0.07,0.09,0.06),P(SPH_LO,dk(sk,0.12),s*HR*1.0,headY-0.02,0.01,0,0,0,0.035,0.05,0.03));
  p.push(P(SPH_LO,dk(sk,0.08),0,headY-0.045,HR*0.93,0,0,0,0.045,0.035,0.035));
  if(h.blush)for(const s of [-1,1])p.push(P(SPH_LO,0xf4a0a8,s*0.13,headY-0.055,HR*0.8,0,0,0,0.07,0.035,0.02));
  if(h.freckles)for(const s of [-1,1])for(let i=0;i<3;i++)p.push(P(SPH_XS,dk(sk,0.35),s*(0.08+i*0.025),headY-0.03-(i%2)*0.018,HR*0.87,0,0,0,0.012,0.012,0.008));
  // brows
  for(const s of [-1,1])p.push(P(BOX,dk(hc,0.15),s*0.085,headY+0.065,HR*0.9,0,0,s*-0.12,0.065,0.014,0.01));
  // hair
  const cap=(sx=1,sy=1,yo=0,zo=0)=>hp.push(P(SPH,hc,0,headY+0.04+yo,-0.025+zo,0,0,0,HR*2.12*sx,HR*1.98*sy,HR*2.04));
  const fringe=(n=4,y=0.13,side=0)=>{for(let i=0;i<n;i++){const t=(i/(n-1))-0.5;hp.push(P(SPH_LO,hc,t*0.34+side,headY+y-Math.abs(t)*0.06,HR*0.8,0.3,0,-t*0.6,0.13,0.11,0.08));}};
  switch(h.hair){
    case'short':cap();fringe(4);break;
    case'side':cap();for(let i=0;i<4;i++)hp.push(P(SPH_LO,hc,-0.12+i*0.09,headY+0.15-i*0.022,HR*0.78,0.4,0,-0.45,0.17,0.1,0.08));break;
    case'buzz':hp.push(P(SPH,hc,0,headY+0.03,-0.015,0,0,0,HR*2.06,HR*1.9,HR*1.96));break;
    case'spiky':cap(1,0.96);for(let i=0;i<8;i++){const a=i/8*6.283;hp.push(P(CONE8,hc,Math.cos(a)*0.12,headY+0.2,Math.sin(a)*0.1-0.04,Math.sin(a)*0.6,0,-Math.cos(a)*0.6,0.1,0.18,0.1));}fringe(4,0.14);break;
    case'curly':cap();for(let i=0;i<16;i++){const a=i/16*6.283,e=0.4+(i%3)*0.35;hp.push(P(SPH_LO,hc,Math.cos(a)*Math.sin(e)*HR*1.1,headY+0.05+Math.cos(e)*HR*1.0,Math.sin(a)*Math.sin(e)*HR*1.05-0.03,0,0,0,0.11,0.11,0.11));}fringe(5,0.13);break;
    case'mohawk':hp.push(P(SPH,dk(hc,0.4),0,headY+0.02,-0.015,0,0,0,HR*2.04,HR*1.88,HR*1.94));for(let i=0;i<6;i++)hp.push(P(CONE8,hc,0,headY+0.24-Math.abs(i-2)*0.012,0.14-i*0.07,-0.5+i*0.25,0,0,0.07,0.2,0.12));break;
    case'bob':cap(1.04,1.02);for(const s of [-1,1])hp.push(P(SPH,hc,s*HR*0.86,headY-0.06,-0.02,0,0,0,0.18,0.32,0.36));hp.push(P(SPH,hc,0,headY-0.04,-0.12,0,0,0,0.5,0.34,0.24));fringe(5,0.12);break;
    case'long':cap(1.04,1.02);for(const s of [-1,1])hp.push(P(SPH,hc,s*HR*0.85,headY-0.14,-0.03,0,0,0,0.16,0.48,0.3));hp.push(P(SPH,hc,0,headY-0.2,-0.13,0.15,0,0,0.48,0.62,0.2));fringe(5,0.12);break;
    case'ponytail':cap();fringe(4);hp.push(P(SPH_LO,lt(hc,0.0),0,headY+0.1,-0.24,0,0,0,0.09,0.09,0.08),P(SPH,hc,0,headY-0.04,-0.31,0.45,0,0,0.16,0.34,0.14),P(SPH_LO,0xd8453a,0,headY+0.1,-0.27,0,0,0,0.07,0.07,0.05));break;
    case'pigtails':cap();fringe(4);for(const s of [-1,1])hp.push(P(SPH_LO,0xf39ab0,s*0.22,headY+0.04,-0.05,0,0,0,0.06,0.06,0.06),P(SPH,hc,s*0.29,headY-0.1,-0.06,0,0,s*0.25,0.14,0.3,0.14));break;
    case'bun':cap(1,1);fringe(4,0.12);hp.push(P(SPH,hc,0,headY+0.27,-0.06,0,0,0,0.2,0.18,0.2));break;
    case'afro':hp.push(P(SPH,hc,0,headY+0.1,-0.11,0,0,0,HR*2.7,HR*2.5,HR*2.3));for(let i=0;i<10;i++){const a=Math.PI*0.05+i/9*Math.PI*0.9+Math.PI;hp.push(P(SPH_LO,lt(hc,0.06),Math.cos(a)*HR*1.2,headY+0.16+Math.sin(i)*0.05,Math.sin(a)*HR*1.05-0.08,0,0,0,0.17,0.17,0.17));}
      for(let i=0;i<5;i++)hp.push(P(SPH_LO,hc,-0.16+i*0.08,headY+0.2-Math.abs(i-2)*0.02,HR*0.62,0,0,0,0.14,0.12,0.1));break;}
  if(girl&&h.hair!=='buzz')for(const s of [-1,1])hp.push(P(BOX,0x2a2026,s*0.12,headY+0.005,HR*0.88,0,0,s*0.5,0.03,0.008,0.01));/* lashes */
  // something on your head
  const hy=headY+(h.hair==='afro'?0.2:h.hair==='bun'?0.06:0)+0.13;
  switch(h.hat){
    case'cap':hp.push(P(SPH,tc,0,hy+0.04,-0.01,0,0,0,0.54,0.34,0.52),P(CYL12,tc,0,hy-0.02,0.2,0.12,0,0,0.36,0.02,0.26),P(SPH_XS,lt(tc,0.4),0,hy+0.2,0,0,0,0,0.05,0.04,0.05));break;
    case'beanie':hp.push(P(SPH,bc,0,hy+0.02,-0.01,0,0,0,0.56,0.4,0.54),P(CYL12,dk(bc,0.18),0,hy-0.08,0,0,0,0,0.55,0.08,0.52),P(SPH_LO,lt(bc,0.5),0,hy+0.22,0,0,0,0,0.12,0.12,0.12));break;
    case'sunhat':hp.push(P(CYL12,0xe8d090,0,hy-0.04,0,0,0,0,0.9,0.025,0.86),P(SPH,0xe8d090,0,hy+0.02,-0.01,0,0,0,0.5,0.3,0.48),P(CYL12,tc,0,hy-0.01,-0.01,0,0,0,0.47,0.04,0.45));break;
    case'bow':for(const s of [-1,1])hp.push(P(ICO2,tc,s*0.075,hy+0.04,-0.06,0,s*0.3,s*0.4,0.12,0.09,0.05));hp.push(P(ICO2,dk(tc,0.15),0,hy+0.04,-0.05,0,0,0,0.05,0.05,0.05));break;
    case'flower':for(let i=0;i<5;i++){const a=i/5*6.283;hp.push(P(SPH_LO,0xffffff,0.15+Math.cos(a)*0.04,hy-0.02+Math.sin(a)*0.04,0.1,0,0,a,0.06,0.04,0.03));}hp.push(P(SPH_LO,0xf6d04a,0.15,hy-0.02,0.11,0,0,0,0.035,0.035,0.03));break;
    case'headband':hp.push(P(CYL12,tc,0,hy-0.06,-0.02,-0.25,0,0,0.53,0.04,0.5));break;
    case'band':hp.push(P(CYL12,tc,0,hy-0.04,-0.02,-0.15,0,0,0.535,0.07,0.51),P(ICO2,tc,0.05,hy-0.04,-0.27,0.4,0,0.6,0.07,0.12,0.03),P(ICO2,tc,-0.04,hy-0.06,-0.27,0.3,0,-0.5,0.06,0.11,0.03));break;}
  if(h.glasses)for(const s of [-1,1])hp.push(P(CYL12,0x2a2026,s*0.085,headY-0.005,HR*0.95,Math.PI/2,0,0,0.11,0.012,0.1),P(BOX,0x2a2026,0,headY,HR*0.97,0,0,0,0.05,0.01,0.01),P(BOX,0x2a2026,s*0.17,headY+0.005,HR*0.6,0,0,0,0.012,0.012,0.18));
  g.add(M(p));if(hp.length)g.add(M(hp));
  // face: big round eyes with a coloured iris and a glint; blink and happy versions; a little mouth
  const fp={open:[],blink:[],happy:[],smile:[],talk:[]},eY=headY-0.005,eZ=HR*0.9;
  for(const s of [-1,1]){const x=s*0.085;fp.open.push(P(ICO2,0x1e1620,x,eY,eZ,0,0,0,0.075,0.095,0.03),P(ICO2,ec,x,eY-0.012,eZ+0.008,0,0,0,0.05,0.06,0.02),P(ICO2,0xffffff,x+s*-0.012+0.01,eY+0.022,eZ+0.016,0,0,0,0.026,0.03,0.01));
    fp.blink.push(P(BOX,0x1e1620,x,eY-0.01,eZ+0.005,0,0,0,0.075,0.014,0.02));
    fp.happy.push(P(BOX,0x1e1620,x-0.017,eY,eZ+0.006,0,0,0.6,0.045,0.014,0.02),P(BOX,0x1e1620,x+0.017,eY,eZ+0.006,0,0,-0.6,0.045,0.014,0.02));}
  fp.smile.push(P(ICO2,0x9a3a40,0,headY-0.1,HR*0.86,0,0,0,0.05,0.016,0.018));fp.talk.push(P(ICO2,0x6a2030,0,headY-0.105,HR*0.86,0,0,0,0.05,0.045,0.02),P(ICO2,0xf39ab0,0,headY-0.12,HR*0.88,0,0,0,0.03,0.016,0.012));
  const face={};for(const k in fp){const m=M(fp[k]);m.castShadow=false;m.visible=k==='open'||k==='smile';g.add(m);face[k]=m;}g.userData.face=face;
  // arms and legs on pivots, so they swing as you walk
  const slv=h.top==='tank'?sk:h.top==='overalls'?tc:h.top==='dress'?tc:tc,longS=['hoodie','sweater','jacket'].includes(h.top);
  for(const [nm,s] of [['armL',-1],['armR',1]]){const pv=new T.Group();pv.name=nm;pv.position.set(s*(tw/2+0.015),shY,0.01);pv.rotation.z=s*0.18;
    pv.add(M([P(ICO2,h.top==='tank'?sk:slv,0,-0.06,0,0,0,0,0.1,0.14,0.1),P(ICO2,longS?slv:sk,0,-0.15,0,0,0,0,0.085,0.12,0.085),P(SPH_LO,sk,0,-0.22,0.005,0,0,0,0.075,0.075,0.075)]));g.add(pv);}
  const legC=dress||h.bot==='skirt'||h.bot==='shorts'?sk:bc;
  for(const [nm,s] of [['footL',-1],['footR',1]]){const pv=new T.Group();pv.name=nm;pv.position.set(s*0.075,hipY,0.0);
    pv.add(M([P(CYL8,legC,0,-0.12,0,0,0,0,0.09,0.22,0.09),P(ICO2,h.shoe,0,-0.235,0.03,0,0,0,0.12,0.075,0.17),P(CYL12,lt(h.shoe,0.5),0,-0.265,0.03,0,0,0,0.12,0.012,0.16)]));g.add(pv);}
  return g;}

/* ---- the editor ---- */
let charEd=null;
const H_TABS=[['look','Look'],['hair','Hair'],['face','Face'],['top','Top'],['bot','Bottoms'],['hat','Hats']];
function curHuman(){if(!S.look.h)S.look.h=Object.assign({},HDEF.boy);return S.look.h;}
function openCharEd(){closeSheet&&closeSheet();if(inside||S.sea)return toast('Step outside onto dry land to change your look.');
  if(S.look.sp!=='human'){S.look.prev=S.look.sp;S.look.sp='human';curHuman();applyLook();}
  introCam=null;charEd={tab:'look',spin:0,saved:{dist:cam.dist,pitch:cam.pitch,yaw:cam.yaw}};vil.tx=vil.x;vil.tz=vil.z;vil.path=null;
  document.body.classList.add('chatting','chared');$('charEd').hidden=false;renderCharEd();SFX.ui();}
function closeCharEd(){if(!charEd)return;chatBack={...charEd.saved,t:0};charEd=null;camera.clearViewOffset();$('charEd').hidden=true;document.body.classList.remove('chatting','chared');save();ctxSig='';updateCtx();updateHUD();hearts(vil.x,1.2,vil.z);SFX.level();}
function setH(ch){Object.assign(curHuman(),ch);applyLook();renderCharEd();SFX.pop();}
function shuffleH(){const R=Math.random,pk=a=>a[Math.floor(R()*a.length)],g=R()<0.5?'boy':'girl';
  setH({g,skin:Math.floor(R()*HSKIN.length),hair:pk(HSTYLE.hair)[0],hairC:Math.floor(R()*HHAIR.length),eye:Math.floor(R()*HEYES.length),top:pk(HSTYLE.top)[0],topC:pk(HCLOTH),bot:pk(HSTYLE.bot)[0],botC:pk(HCLOTH),shoe:pk(HCLOTH),hat:R()<0.5?'none':pk(HSTYLE.hat)[0],glasses:R()<0.2?1:0,blush:R()<0.6?1:0,freckles:R()<0.25?1:0});}
const hThumbs={};
function hThumb(ch){const h=Object.assign({},curHuman(),ch),k=JSON.stringify(h);if(hThumbs[k])return hThumbs[k];return hThumbs[k]=snapThumb(humanModel(h),96);}
function renderCharEd(){if(!charEd)return;const h=curHuman(),t=charEd.tab;const sw=(arr,key,cur,idx)=>`<div class="hsw">${arr.map((c,i)=>`<button class="sw ${(idx?i:c)===cur?'on':''}" data-hk="${key}" data-hv="${idx?i:c}" style="--sw:${hexCss(c)}"></button>`).join('')}</div>`;
  const tiles=(list,key)=>`<div class="htiles">${list.map(([id,n])=>`<button class="ht ${h[key]===id?'on':''}" data-hk="${key}" data-hs="${id}"><img src="${hThumb({[key]:id})}" alt=""><span>${n}</span></button>`).join('')}</div>`;
  let b='';
  if(t==='look')b=`<div class="hseg"><button class="${h.g==='boy'?'on':''}" data-hg="boy">Boy</button><button class="${h.g==='girl'?'on':''}" data-hg="girl">Girl</button></div><h4>Skin</h4>${sw(HSKIN,'skin',h.skin,1)}<h4>Eyes</h4>${sw(HEYES,'eye',h.eye,1)}<h4>Shoes</h4>${sw(HCLOTH,'shoe',h.shoe)}`;
  if(t==='hair')b=`${tiles(HSTYLE.hair,'hair')}<h4>Colour</h4>${sw(HHAIR,'hairC',h.hairC,1)}`;
  if(t==='face')b=`<div class="htog">${[['blush','Rosy cheeks'],['freckles','Freckles'],['glasses','Glasses']].map(([k,n])=>`<button class="${h[k]?'on':''}" data-ht="${k}">${n}</button>`).join('')}</div>`;
  if(t==='top')b=`${tiles(HSTYLE.top,'top')}<h4>Colour</h4>${sw(HCLOTH,'topC',h.topC)}`;
  if(t==='bot')b=h.top==='dress'?`<p class="hnote">You’re wearing a dress. Pick another top to choose bottoms.</p>`:`${tiles(HSTYLE.bot,'bot')}<h4>Colour</h4>${sw(HCLOTH,'botC',h.botC)}`;
  if(t==='hat')b=`${tiles(HSTYLE.hat,'hat')}<p class="hnote">Caps, bows and headbands take your top’s colour; beanies your bottoms’.</p>`;
  $('charEd').innerHTML=`<div class="htop"><b>Your character</b><button class="hbtn" data-ha="shuffle">🎲 Shuffle</button>${S.look.prev&&S.look.prev!=='human'?`<button class="hbtn" data-ha="animal">Be an animal</button>`:''}<button class="pbtn go" data-ha="done">Done</button></div>
    <div class="dtabs">${H_TABS.map(([k,n])=>`<button class="${t===k?'on':''}" data-htab="${k}">${n}</button>`).join('')}</div><div class="hbody">${b}</div>`;
  requestAnimationFrame(()=>{if(charEd){const W=window.innerWidth,H=window.innerHeight,px=$('charEd').offsetHeight;camera.setViewOffset(W,H,0,px*0.32,W,H);}});}
$('charEd').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!charEd)return;const d=b.dataset;
  if(d.ha==='done'){closeCharEd();return;}if(d.ha==='shuffle'){shuffleH();return;}if(d.ha==='animal'){S.look.sp=S.look.prev||'bunny';applyLook();closeCharEd();return;}
  if(d.htab){charEd.tab=d.htab;SFX.ui();renderCharEd();return;}
  if(d.hg){const keep=curHuman();if(keep.g!==d.hg){const D=HDEF[d.hg];setH({g:d.hg,hair:D.hair,top:D.top,bot:D.bot,hat:D.hat,topC:D.topC});}return;}
  if(d.hs){setH({[d.hk]:d.hs});return;}if(d.hv!==undefined){setH({[d.hk]:+d.hv});return;}if(d.ht){setH({[d.ht]:curHuman()[d.ht]?0:1});return;}});
// the camera: close and level, facing you; drag sideways to turn round
function updateCharEd(dt,tt){if(!charEd)return;const s=charEd.saved,k=Math.min(1,dt*3);
  camera.fov+=(CHAT_FOV-camera.fov)*k;camera.updateProjectionMatrix();
  const dist=(camera.aspect<0.8?7.2:5.4)*Math.tan(FOV0*Math.PI/360)/Math.tan(CHAT_FOV*Math.PI/360);cam.dist+=(dist-cam.dist)*k;cam.pitch+=(0.26-cam.pitch)*k;
  villager.rotation.y=cam.yaw+charEd.spin+Math.sin(tt*0.8)*0.06;if(Math.random()<dt*0.3)vil.hop=0.25;}
const charEdFocus=()=>[vil.x-Math.sin(cam.yaw)*0.2,vil.z-Math.cos(cam.yaw)*0.2];
