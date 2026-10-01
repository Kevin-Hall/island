/* =========================================================
   Player characters (artist-made), and the character editor
   ========================================================= */
// A human player (S.look.sp 'human', its choice in S.look.h {c, skin}) is one of the preset characters in CHARS,
// artist-made models shipped as assets/characters/<id>.glb beside the page (or inlined by build --embed-chars). Each
// file loads once, the first time it's needed (charLoad), and every use (you, your copy in a room, the editor's model,
// thumbnails) is a clone of it (charModel), fitted to the player's height (CHAR_H) and painted with the game's toon
// shading. Three kinds:
//  - painted (an AI-made model from a picture: the Campfire Kid): one mesh over a painted texture, no rig; a skin tone
//    recolours the texture's skin-coloured pixels, keeping their painted shading (skin: 'paint'); it bobs and squashes
//    as it walks, like the animals (90-main)
//  - rigged and animated (e.g. Quaternius, or a picture rigged in Mixamo): one skinned mesh over a colour atlas; a skin
//    tone repaints the atlas's skin texel (skin: [column,row]); CharacterAnimator plays its Idle, Walk and Run clips
//  - static pieces with flat colours (zUp: modelled lying down): baked into two meshes, the skin (the material named in
//    skin) and the rest coloured from their materials
const CHARS=[{id:'kid',name:'Campfire Kid',skin:'paint'}];
const CHAR_H=1.07;/* every character stands the player's height, whatever units its artist used */
const HSKIN=[0xfde3cf,0xf6d2b4,0xeec09a,0xd9a27a,0xc08660,0xa06a48,0x7a4e34,0x5a3826];
const charSrc={};/* id → {ok, scene, clips, atlas, scale, wait} */
function charLoad(id,cb){let s=charSrc[id];if(s&&s.ok){cb&&cb(s);return;}if(s&&s.failed){return;}
  if(s){if(cb)s.wait.push(cb);return;}s=charSrc[id]={ok:false,wait:cb?[cb]:[]};const C=CHARS.find(c=>c.id===id);
  const L=new T.GLTFLoader(),emb=window.CHAR_EMBED&&CHAR_EMBED[id];L.register(p=>({name:'charImages',loadTexture:i=>charTex(p,i)}));
  const done=g=>{let atlas=null;const drop=[];g.scene.traverse(o=>{if(o.name.startsWith('Weapon_'))drop.push(o);else if(o.isMesh&&o.material.map)atlas=o.material.map.image;});
      for(const o of drop)o.parent.remove(o);/* (some packs' characters come holding a prop) */
      const sc=g.animations.length||atlas?g.scene:charStatic(g.scene,C),bx=new T.Box3().setFromObject(sc),scene=new T.Group();
      sc.position.y-=bx.min.y;scene.add(sc);/* feet on the ground, wherever the artist put the origin */
      Object.assign(s,{ok:true,scene,clips:g.animations,atlas,scale:CHAR_H/(bx.max.y-bx.min.y)});for(const f of s.wait)f(s);s.wait=[];},
    fail=e=>{s.failed=true;s.wait=[];console.warn('character '+id+' failed to load',e);toast('Your character couldn’t load. Check your connection and reopen the game.');};
  if(emb){const b=atob(emb.slice(emb.indexOf(',')+1)),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);L.parse(u.buffer,'',done,fail);}
  else L.load('assets/characters/'+id+'.glb',done,undefined,fail);}
// a model's texture, decoded straight from its bytes: the loader's own way goes through a blob: URL, which a strict
// page (claude.ai artifacts) refuses to fetch, and then the whole character fails
function charTex(p,i){const J=p.json,src=J.images[J.textures[i].source];if(src.bufferView===undefined)return null;
  return p.getDependency('bufferView',src.bufferView).then(bv=>{const blob=new Blob([bv],{type:src.mimeType});
    return window.createImageBitmap?createImageBitmap(blob):new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>ok(im);im.onerror=no;im.src=r.result;};r.readAsDataURL(blob);});})
    .then(img=>{const t=new T.Texture(img);t.flipY=false;t.needsUpdate=true;return t;});}
// a model without a rig: stood upright (zUp: modelled lying down, facing -y) and baked into two meshes, its skin and the
// rest, coloured from each piece's material and smooth-shaded per piece
function charStatic(scene,C){scene.updateMatrixWorld(true);const up=new T.Matrix4().makeRotationX(C.zUp?-Math.PI/2:0),m=new T.Matrix4(),parts={skin:[],rest:[]};
  scene.traverse(o=>{if(!o.isMesh)return;let g=o.geometry.clone();g.deleteAttribute('normal');g.computeVertexNormals();g.applyMatrix4(m.multiplyMatrices(up,o.matrixWorld));if(g.index)g=g.toNonIndexed();
    const c=o.material.color,n=g.attributes.position.count,col=new Float32Array(n*3);for(let i=0;i<n;i++){col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}g.setAttribute('color',new T.BufferAttribute(col,3));
    (o.material.name===C.skin?parts.skin:parts.rest).push(g);});
  const out=new T.Group();for(const k of ['rest','skin']){const gs=parts[k];if(!gs.length)continue;const g=new T.BufferGeometry();
    for(const a of ['position','normal','color']){const arr=new Float32Array(gs.reduce((t,q)=>t+q.attributes[a].array.length,0));let o=0;for(const q of gs){arr.set(q.attributes[a].array,o);o+=q.attributes[a].array.length;}g.setAttribute(a,new T.BufferAttribute(arr,3));}
    const me=new T.Mesh(g,toon({vertexColors:true}));me.userData.skin=k==='skin';out.add(me);}
  return out;}
// the material for a character's skin in a tone (-1: as drawn): a rigged one's atlas with its skin texel repainted
// (flat-coloured texels, sampled crisply); a static one's skin pieces in that colour
const charMats={};
function charMat(id,skin){const k=id+'|'+skin;if(charMats[k])return charMats[k];const s=charSrc[id],C=CHARS.find(c=>c.id===id);
  if(!s.atlas)return charMats[k]=toon(skin>=0?{color:HSKIN[skin]}:{vertexColors:true});
  const cv=document.createElement('canvas');cv.width=s.atlas.width;cv.height=s.atlas.height;const x=cv.getContext('2d');x.drawImage(s.atlas,0,0);
  if(skin>=0&&C.skin==='paint')paintSkin(x,cv.width,cv.height,HSKIN[skin]);
  else if(skin>=0){const [u,v]=C.skin,sw=cv.width/32,sh=cv.height/32;x.fillStyle=hexCss(HSKIN[skin]);x.fillRect(u*sw,v*sh,sw,sh);}
  const t=new T.CanvasTexture(cv);t.flipY=false;if(C.skin!=='paint'){t.magFilter=t.minFilter=T.NearestFilter;t.generateMipmaps=false;}/* (an atlas of flat texels stays crisp; a painting is smoothed) */
  return charMats[k]=toon({map:t,skinning:true});}
// a skin tone on a painted texture: pixels the colour of skin (warm, fairly light, not grey) take the new tone, scaled
// by how light each was against the skin's middle tone, so the painted shading and blush stay
function paintSkin(x,w,h,to){const im=x.getImageData(0,0,w,h),d=im.data,hsl={},c=new T.Color(),hit=[];let ls=[];
  for(let i=0;i<d.length;i+=4){c.setRGB(d[i]/255,d[i+1]/255,d[i+2]/255).getHSL(hsl);const hd=hsl.h*360;if(hd>4&&hd<38&&hsl.s>0.3&&hsl.l>0.42&&hsl.l<0.9){hit.push(i);ls.push(hsl.l);}}
  if(!hit.length)return;ls.sort((a,b)=>a-b);const mid=ls[ls.length>>1],T0=new T.Color(to);
  for(const i of hit){c.setRGB(d[i]/255,d[i+1]/255,d[i+2]/255).getHSL(hsl);const k=hsl.l/mid;d[i]=clamp(T0.r*k*255,0,255);d[i+1]=clamp(T0.g*k*255,0,255);d[i+2]=clamp(T0.b*k*255,0,255);}
  x.putImageData(im,0,0);}
// a character, ready to place: a group holding a clone of the loaded model (empty until it has loaded); a rigged one is
// already in its idle pose (never a T-pose), with its CharacterAnimator in userData.anim
function charModel(h){const g=new T.Group(),id=(CHARS.find(c=>c.id===h.c)||CHARS[0]).id,skin=h.skin??-1;g.userData.char={c:id,skin};
  charLoad(id,s=>{const m=T.SkeletonUtils.clone(s.scene);m.scale.setScalar(s.scale);
    m.traverse(o=>{if(o.isMesh){if(s.atlas||o.userData.skin)o.material=charMat(id,skin);o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;}});
    g.add(m);if(s.clips.length)g.userData.anim=new CharacterAnimator(m,s.clips,s.scale);});
  return g;}
// idle when standing; when moving, walk blending into run with speed, each played at the rate that keeps its feet planted
// (the clips carry a Quaternius character 1.35 and 2.4 of its own units a second). Swimming keeps the idle clip; the lean
// and bob come from swimPose (76c-swim)
class CharacterAnimator{
  constructor(root,clips,scale){this.wv=1.35*scale;this.rv=2.4*scale;this.mx=new T.AnimationMixer(root);this.a=['Idle','Walk','Run'].map((n,i)=>{const a=this.mx.clipAction(clips.find(c=>c.name===n));a.play();a.setEffectiveWeight(i?0:1);return a;});this.w=[1,0,0];this.mx.update(0);}
  update(dt,speed,swim){const m=swim?0:smooth(0.05,0.5,speed),r=smooth(this.wv,this.rv,speed),tw=[1-m,m*(1-r),m*r],k=Math.min(1,dt*10);
    for(let i=0;i<3;i++){this.w[i]+=(tw[i]-this.w[i])*k;this.a[i].setEffectiveWeight(this.w[i]);}
    this.a[1].timeScale=clamp(speed/this.wv,0.6,3);this.a[2].timeScale=clamp(speed/this.rv,0.6,3);this.mx.update(dt);}}
// the player's body copied for a room (56-interiors): a character is re-cloned with its own rig, anything else copied
function cloneBody(b){return b.userData.char?charModel(b.userData.char):b.clone();}
/* ---- the editor ---- */
let charEd=null;
function curHuman(){const h=S.look.h||(S.look.h={});if(!CHARS.some(c=>c.id===h.c)){h.c=CHARS[0].id;if(!(h.skin>=-1&&h.skin<HSKIN.length))h.skin=-1;for(const k in h)if(k!=='c'&&k!=='skin')delete h[k];}/* (saves from earlier characters keep their skin tone) */return h;}
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
