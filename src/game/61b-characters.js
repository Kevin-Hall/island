/* =========================================================
   Player characters (artist-made), and the character editor
   ========================================================= */
// A human player (S.look.sp 'human', its choice in S.look.h {c, skin}) is one of the preset characters in CHARS:
// rigged, animated low-poly people by Quaternius (CC0), shipped as assets/characters/<id>.glb beside the page. Each
// file loads once, the first time it's needed (charLoad), and every use (you, your copy in a room, the editor's model,
// thumbnails) is a clone of it (charModel) at one shared scale (CHAR_SCALE), painted with the game's toon shading from
// the artist's own colour atlas. A skin tone recolours the atlas's skin texel, nothing else (charMat). CharacterAnimator
// plays the artist's Idle, Walk and Run clips. The editor (openCharEd) picks a character and a skin tone.
const CHARS=[{id:'anne',name:'Anne',skin:[4,9]},{id:'henry',name:'Henry',skin:[4,11]}];/* skin: the atlas texel (column, row) their skin is painted from */
const CHAR_SCALE=0.68;/* the artists' ~1.6-unit people, brought to the player's height (~1.1, the same as before) */
const HSKIN=[0xfde3cf,0xf6d2b4,0xeec09a,0xd9a27a,0xc08660,0xa06a48,0x7a4e34,0x5a3826];
const charSrc={};/* id → {ok, scene, clips, atlas, wait} */
function charLoad(id,cb){let s=charSrc[id];if(s&&s.ok){cb&&cb(s);return;}if(s&&s.failed){return;}
  if(s){if(cb)s.wait.push(cb);return;}s=charSrc[id]={ok:false,wait:cb?[cb]:[]};
  new T.GLTFLoader().load('assets/characters/'+id+'.glb',g=>{
    let atlas=null;const drop=[];g.scene.traverse(o=>{if(o.name.startsWith('Weapon_'))drop.push(o);else if(o.isMesh&&o.material.map)atlas=o.material.map.image;});
    for(const o of drop)o.parent.remove(o);/* (each comes holding a prop: an axe, a lute…) */
    Object.assign(s,{ok:true,scene:g.scene,clips:g.animations,atlas});for(const f of s.wait)f(s);s.wait=[];},undefined,
    e=>{s.failed=true;s.wait=[];console.warn('character '+id+' failed to load',e);toast('Your character couldn’t load. Check your connection and reopen the game.');});}
// the material for a character in a skin tone: the toon ramp the whole island uses, over the artist's atlas with its
// skin texel repainted (-1: as drawn). Flat-coloured texels, sampled crisply
const charMats={};
function charMat(id,skin){const k=id+'|'+skin;if(charMats[k])return charMats[k];const s=charSrc[id],C=CHARS.find(c=>c.id===id),cv=document.createElement('canvas');
  cv.width=s.atlas.width;cv.height=s.atlas.height;const x=cv.getContext('2d');x.drawImage(s.atlas,0,0);
  if(skin>=0&&C){const [u,v]=C.skin,sw=cv.width/32,sh=cv.height/32;x.fillStyle=hexCss(HSKIN[skin]);x.fillRect(u*sw,v*sh,sw,sh);}
  const t=new T.CanvasTexture(cv);t.flipY=false;t.magFilter=t.minFilter=T.NearestFilter;t.generateMipmaps=false;
  return charMats[k]=toon({map:t,skinning:true});}
// a character, ready to place: a group holding a clone of the loaded model (empty until it has loaded), already in its
// idle pose (never a T-pose); its CharacterAnimator is userData.anim
function charModel(h){const g=new T.Group(),id=(CHARS.find(c=>c.id===h.c)||CHARS[0]).id,skin=h.skin??-1;g.userData.char={c:id,skin};
  charLoad(id,s=>{const m=T.SkeletonUtils.clone(s.scene);m.scale.setScalar(CHAR_SCALE);
    m.traverse(o=>{if(o.isMesh){o.material=charMat(id,skin);o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;}});
    g.add(m);g.userData.anim=new CharacterAnimator(m,s.clips);});
  return g;}
// idle when standing; when moving, walk blending into run with speed, each played at the rate that keeps its feet planted
// (WALK_V, RUN_V: how fast the clips carry a character across the ground, at CHAR_SCALE). Swimming keeps the idle clip;
// the lean and bob come from swimPose (76c-swim)
const WALK_V=1.35*CHAR_SCALE,RUN_V=2.4*CHAR_SCALE;
class CharacterAnimator{
  constructor(root,clips){this.mx=new T.AnimationMixer(root);this.a=['Idle','Walk','Run'].map((n,i)=>{const a=this.mx.clipAction(clips.find(c=>c.name===n));a.play();a.setEffectiveWeight(i?0:1);return a;});this.w=[1,0,0];this.mx.update(0);}
  update(dt,speed,swim){const m=swim?0:smooth(0.05,0.5,speed),r=smooth(WALK_V,RUN_V,speed),tw=[1-m,m*(1-r),m*r],k=Math.min(1,dt*10);
    for(let i=0;i<3;i++){this.w[i]+=(tw[i]-this.w[i])*k;this.a[i].setEffectiveWeight(this.w[i]);}
    this.a[1].timeScale=clamp(speed/WALK_V,0.6,3);this.a[2].timeScale=clamp(speed/RUN_V,0.6,3);this.mx.update(dt);}}
// the player's body copied for a room (56-interiors): a character is re-cloned with its own rig, anything else copied
function cloneBody(b){return b.userData.char?charModel(b.userData.char):b.clone();}
/* ---- the editor ---- */
let charEd=null;
function curHuman(){const h=S.look.h||(S.look.h={});if(!h.c){h.c=h.g==='girl'?'anne':'henry';if(!(h.skin>=-1&&h.skin<HSKIN.length))h.skin=-1;for(const k in h)if(k!=='c'&&k!=='skin')delete h[k];}/* (saves from the old sculpted humans keep their skin tone) */return h;}
// the editor's own little studio: a soft backdrop and a round stage, so you can dress up anywhere (indoors, at sea…)
const edScene=new T.Scene(),edCam=new T.PerspectiveCamera(30,1,0.05,60);
{edScene.add(new T.HemisphereLight(0xfff2e6,0x8a7a8a,0.42));const d=new T.DirectionalLight(0xffe6c8,0.52);d.position.set(2.2,3.4,3);edScene.add(d);/* a warm key light, high on the right */const d2=new T.DirectionalLight(0xb8d0ff,0.3);d2.position.set(-2.5,2,-3);edScene.add(d2);/* a cool rim from behind */const d3=new T.DirectionalLight(0xfff0e6,0.16);d3.position.set(-1.5,0.8,5);edScene.add(d3);/* a soft fill from the front, so the face is evenly lit */
  const bg=new T.SphereGeometry(20,24,16),c=[],a=bg.attributes.position;for(let i=0;i<a.count;i++){const t=clamp((a.getY(i)+6)/22,0,1);const q=new T.Color(0xe8d4c4).lerp(new T.Color(0x9cc4dc),t);c.push(q.r,q.g,q.b);}
  bg.setAttribute('color',new T.Float32BufferAttribute(c,3));edScene.add(new T.Mesh(bg,new T.MeshBasicMaterial({vertexColors:true,side:T.BackSide,fog:false})));
  const st=M([P(CYL12,0xe8dcc8,0,-0.05,0,0,0,0,1.5,0.1,1.5),P(CYL12,0xc8b498,0,-0.12,0,0,0,0,1.56,0.06,1.56),P(CYL12,0xe0b8a0,0,0.002,0,0,0,0,1.1,0.004,1.1)]);st.castShadow=false;edScene.add(st);
  for(let i=0;i<14;i++){const an=i/14*6.283,r=2.2+Math.random()*1.5;const m=M([P(SPH_LO,[0xf8c8d8,0xfff0b0,0xc8e8ff,0xd8f0c8][i%4],0,0,0,0,0,0,0.12,0.12,0.12)],lumMat);m.position.set(Math.cos(an)*r,0.3+Math.random()*1.6,Math.sin(an)*r-1.5);m.userData.ph=Math.random()*6;edScene.add(m);}}
let edModel=null;
function edRebuild(){if(edModel)edScene.remove(edModel);edModel=charModel(curHuman());edScene.add(edModel);}
function openCharEd(){closeSheet&&closeSheet();if(chat)chatEnd();if(deco)decoClose();
  for(const c of CHARS)charLoad(c.id,()=>{if(charEd)renderCharEd();});/* every preset, so picking one swaps at once */
  if(S.look.sp!=='human'){S.look.prev=S.look.sp;S.look.sp='human';curHuman();applyLook();}
  charEd={spin:0,t:0};vil.tx=vil.x;vil.tz=vil.z;vil.path=null;edRebuild();
  document.body.classList.add('chatting','chared');$('charEd').hidden=false;renderCharEd();SFX.ui();}
function closeCharEd(){if(!charEd)return;charEd=null;edCam.clearViewOffset();if(inside&&inside.me){inside.me.clear();inside.me.add(cloneBody(villager.children[0]));}/* you, in the room you're in */$('charEd').hidden=true;document.body.classList.remove('chatting','chared');save();ctxSig='';updateCtx();updateHUD();hearts(vil.x,1.2,vil.z);SFX.level();}
function setH(ch){Object.assign(curHuman(),ch);applyLook();if(charEd){edRebuild();charEd.hop=0.3;}renderCharEd();SFX.pop();}
function shuffleH(){setH({c:CHARS[Math.floor(Math.random()*CHARS.length)].id,skin:Math.floor(Math.random()*(HSKIN.length+1))-1});}
// a character's portrait (blank until its model has loaded; the editor and the look sheet redraw when it arrives)
const hThumbs={};
function hThumb(ch){const h=Object.assign({},curHuman(),ch),k=h.c+'|'+h.skin;if(hThumbs[k])return hThumbs[k];
  if(!(charSrc[h.c]&&charSrc[h.c].ok)){charLoad(h.c,()=>{if(charEd)renderCharEd();else if(sheet)renderSheet();});return'data:image/gif;base64,R0lGODlhAQABAAAAACw=';}
  return hThumbs[k]=snapThumb(charModel(h),96);}
function renderCharEd(){if(!charEd)return;const h=curHuman();
  const tiles=`<div class="htiles">${CHARS.map(c=>`<button class="ht ${h.c===c.id?'on':''}" data-hc="${c.id}"><img src="${hThumb({c:c.id})}" alt=""><span>${c.name}</span></button>`).join('')}</div>`;
  const sw=`<div class="hsw"><button class="sw own ${h.skin<0?'on':''}" data-hv="-1" title="As drawn" style="--sw:#d8c0a8"></button>${HSKIN.map((c,i)=>`<button class="sw ${h.skin===i?'on':''}" data-hv="${i}" style="--sw:${hexCss(c)}"></button>`).join('')}</div>`;
  $('charEd').innerHTML=`<div class="htop"><b>Your character</b><button class="hbtn" data-ha="shuffle">🎲 Shuffle</button>${S.look.prev&&S.look.prev!=='human'?`<button class="hbtn" data-ha="animal">Be an animal</button>`:''}<button class="pbtn go" data-ha="done">Done</button></div>
    <div class="hbody">${tiles}<h4>Skin</h4>${sw}</div>`;
  requestAnimationFrame(()=>{if(charEd){const W=window.innerWidth,H=window.innerHeight,px=$('charEd').offsetHeight;charEd.px=px;edCam.setViewOffset(W,H,0,px*0.5,W,H);}});}
$('charEd').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!charEd)return;const d=b.dataset;
  if(d.ha==='done'){closeCharEd();return;}if(d.ha==='shuffle'){shuffleH();return;}if(d.ha==='animal'){S.look.sp=S.look.prev||'bunny';applyLook();closeCharEd();return;}
  if(d.hc){setH({c:d.hc});return;}if(d.hv!==undefined){setH({skin:+d.hv});return;}});
// the studio camera: framed on you in the space above the tray; you idle, turn slowly, and hop when something changes
function updateCharEd(dt,tt){if(!charEd||!edModel)return;charEd.t+=dt;const W=window.innerWidth,H=window.innerHeight,asp=W/H,f=1-(charEd.px||H*0.45)/H,tv=Math.tan(15*Math.PI/180);
  edCam.aspect=asp;const d=Math.max(0.64/(tv*f),0.5/(tv*asp))*1.05;edCam.position.set(0,0.6+d*0.1,d);edCam.lookAt(0,0.52,0);edCam.updateProjectionMatrix();
  charEd.hop=Math.max(0,(charEd.hop||0)-dt);edModel.position.y=Math.sin(Math.min(1,(0.3-charEd.hop)/0.3)*Math.PI)*(charEd.hop>0?0.08:0);
  edModel.rotation.y=charEd.spin+Math.sin(tt*0.6)*0.25;if(edModel.userData.anim)edModel.userData.anim.update(dt,0,false);
  for(const m of edScene.children)if(m.userData.ph!==undefined)m.position.y+=Math.sin(tt+m.userData.ph)*dt*0.1;}
const charEdFocus=()=>chatFocus();
