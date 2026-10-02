/* =========================================================
   Player characters (artist-made), and the character editor
   ========================================================= */
// A human player (S.look.sp 'human', its choice in S.look.h {c, skin}) is one of the preset characters in CHARS,
// artist-made models shipped as assets/characters/<id>.glb beside the page (or inlined by build --embed-chars). Each
// file loads once, the first time it's needed (charLoad), and every use (you, your copy in a room, the editor's model,
// thumbnails) is a clone of it (charModel), fitted to the player's height (CHAR_H) and painted with the game's toon
// shading. Four kinds:
//  - Mochi (61c): a bunny sculpted and rigged in code, with smooth clips (build); the colour row recolours its body
//    (colors)
//  - painted (an AI-made model from a picture, e.g. Sprite: made in Meshy, rigged and animated in Mixamo): one mesh over
//    a painted texture; a skin tone recolours the texture's skin-coloured pixels, keeping their painted shading
//    (skin: 'paint'); its clips are renamed by clips, given an idle if it has none (idleFrom), and its stunts become
//    emotes; without a rig it would bob and squash as it walks, like the animals (90-main)
//  - rigged and animated (e.g. Quaternius, or a picture rigged in Mixamo): one skinned mesh over a colour atlas; a skin
//    tone repaints the atlas's skin texel (skin: [column,row]); CharacterAnimator plays its Idle, Walk and Run clips
//  - static pieces with flat colours (zUp: modelled lying down): baked into two meshes, the skin (the material named in
//    skin) and the rest coloured from their materials
const CHARS=[{id:'sprite',name:'Sprite',skin:'paint',clips:{Walk:'Walking',Run:'Running'},emotes:{spin:'360_Power_Spin_Jump',flip:'Backflip_Sweep_Kick'},speeds:[0.95,4.8],hand:{bone:'mixamorigLeftHand',off:[0,0.06,0.01]}},
  {id:'willow',name:'Willow',base:'sprite',hair:'long',outfit:{top:0,bot:6,hair:-1}},/* Sprite's body with long hair and a bow */
  {id:'pip',name:'Pip',build:'pip',dress:true,hand:{bone:'ArmR',off:[0.057,-0.13,0.016],arm:1},styles:['Tousled','Bob','Buns','Long'],ownCol:(h,t)=>PIP_OWN[t]},
  {id:'sprig',name:'Sprig',build:'sprig',dress:true,hand:{bone:'ArmR',off:[0.072,-0.1,0.014],arm:1},scale:1.06,styles:['Straw','Mushroom','Wizard','Explorer'],tabs:['skin','hair','top','shoe'],tabNames:{hair:'Hat',top:'Smock',shoe:'Boots'},
    cols:{hair:[0xdcae62,0xd9524a,0x6c62b8,0xe4d2a2,0x7caa5c,0x4f7fb8,0xe98aa0,0x5a4a44]},ownCol:(h,t)=>t==='hair'?SPRIG_HATS[h.style|0].own:SPRIG_DRESS.own[t]},/* a little gardener-explorer under a big hat (61e) *//* a very simple little person, in your colours (61d) */
  {id:'mochi',name:'Mochi',build:'mochi',hand:{bone:'ArmR',off:[0.03,-0.12,0.08],arm:1},colors:[0xfaf8f4,0xf3e3c8,0xf6cfd6,0xd8d0ec,0xc8dcef,0xcfe6d2,0xcac6c2,0xe8c8a8]},
];
// a character's whole entry: one made from another (base) shares its model, clips and texture, adding its own hair and outfit
const charDef=id=>{const C=CHARS.find(c=>c.id===id)||CHARS[0];return C.base?Object.assign({},CHARS.find(c=>c.id===C.base),C):C;};
// clothes for a painted character: each part of its texture (found by colour and by how high it sits on the body) in a
// colour of yours, keeping its painted shading; -1 keeps it as drawn (own: the swatch for that)
const OUTFIT={hair:{name:'Hair',own:0x6b3a1f,cols:[0x2a1c14,0x161417,0xb5652a,0xe2bd72,0x8e3f2c,0xd8d2ca,0xee9fc0,0x86a8dc]},
  top:{name:'Top',own:0x2f9e5a,cols:[0xe98aa0,0xf3c35a,0x74a9de,0xbfa3e3,0xf2ede4,0xe4683f,0x3f5a85,0xf08c5a]},
  bot:{name:'Bottoms',own:0x7a4a2c,cols:[0x3c5d8f,0x2e3440,0xcaa87e,0x6f8f5c,0xeaa2b6,0xefe9df,0x8fa9cf,0x7a62a8]},
  shoe:{name:'Shoes',own:0xf2f0ec,cols:[0xe25a4a,0xf2c14e,0x5b8fd6,0xf0a6c0,0x3a3a3a,0x6fbf8a]}};
const dressable=C=>C.skin==='paint'||!!C.dress;
const charLook=(C,o={})=>Object.assign({c:C.id,skin:-1},dressable(C)?{hair:-1,top:-1,bot:-1,shoe:-1}:{},C.styles?{style:0}:{},C.outfit,o);
const CHAR_H=1.07;/* every character stands the player's height, whatever units its artist used */
const HSKIN=[0xfde3cf,0xf6d2b4,0xeec09a,0xd9a27a,0xc08660,0xa06a48,0x7a4e34,0x5a3826];
const charSrc={};/* id → {ok, scene, clips, atlas, scale, wait} */
function charLoad(id,cb){let s=charSrc[id];if(s&&s.ok){cb&&cb(s);return;}if(s&&s.failed){return;}
  const C=charDef(id);if(C.base){charLoad(C.base,b=>{charSrc[id]=b;cb&&cb(b);});return;}/* (the same model as its base) */
  if(s){if(cb)s.wait.push(cb);return;}s=charSrc[id]={ok:false,wait:cb?[cb]:[]};
  if(C.build){const R=C.build==='pip'?pipRig():C.build==='sprig'?sprigRig():mochiRig(),bx=new T.Box3().setFromObject(R.scene);Object.assign(s,R,{ok:true,atlas:null,scale:C.scale||(C.build==='pip'?CHAR_H/(bx.max.y-bx.min.y):0.92)});/* (Mochi: ears and all, a little taller than the others) */for(const f of s.wait)f(s);s.wait=[];return;}/* (built in code, at the player's size: 61c) */
  const L=new T.GLTFLoader(),emb=window.CHAR_EMBED&&CHAR_EMBED[id];L.register(p=>({name:'charImages',loadTexture:i=>charTex(p,i)}));
  const done=g=>{let atlas=null;const drop=[];g.scene.traverse(o=>{if(o.name.startsWith('Weapon_'))drop.push(o);else if(o.isMesh&&o.material.map)atlas=o.material.map.image;});
      for(const o of drop)o.parent.remove(o);/* (some packs' characters come holding a prop) */
      const sc=g.animations.length||atlas?g.scene:charStatic(g.scene,C),bx=new T.Box3().setFromObject(sc),scene=new T.Group();
      sc.position.y-=bx.min.y;scene.add(sc);/* feet on the ground, wherever the artist put the origin */
      let clips=g.animations;const em={};if(C.clips)for(const c of clips){for(const k in C.clips)if(c.name===C.clips[k])c.name=k;for(const k in C.emotes||{})if(c.name===C.emotes[k])em[k]=c;}
      if(clips.length&&!clips.some(c=>c.name==='Idle'))clips=[idleFrom(clips.find(c=>c.name==='Walk'),sc),...clips];
      Object.assign(s,{ok:true,scene,clips,emotes:em,speeds:C.speeds,atlas,scale:CHAR_H/(bx.max.y-bx.min.y)});for(const f of s.wait)f(s);s.wait=[];},
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
// the material for a character in a look (skin tone, and clothes for a painted one; -1: as drawn): a rigged one's atlas
// with its skin texel repainted (flat-coloured texels, sampled crisply); a painted one's texture repainted (paintChar); a
// static one's skin pieces in that colour
const charMats={};
function charMat(id,h){const C=charDef(id),skin=h.skin??-1,k=[id,skin,h.hair,h.top,h.bot,h.shoe].join('|');if(charMats[k])return charMats[k];const s=charSrc[id];
  if(C.colors)return charMats[k]=toon({color:C.colors[Math.max(0,skin)],skinning:true});/* Mochi's body colour */
  if(!s.atlas)return charMats[k]=toon(skin>=0?{color:HSKIN[skin]}:{vertexColors:true});
  const cv=document.createElement('canvas');cv.width=s.atlas.width;cv.height=s.atlas.height;const x=cv.getContext('2d');x.drawImage(s.atlas,0,0);
  if(C.skin==='paint')paintChar(x,cv.width,cv.height,s,h);
  else if(skin>=0){const [u,v]=C.skin,sw=cv.width/32,sh=cv.height/32;x.fillStyle=hexCss(HSKIN[skin]);x.fillRect(u*sw,v*sh,sw,sh);}
  const t=new T.CanvasTexture(cv);t.flipY=false;if(C.skin!=='paint'){t.magFilter=t.minFilter=T.NearestFilter;t.generateMipmaps=false;}/* (an atlas of flat texels stays crisp; a painting is smoothed) */
  return charMats[k]=toon({map:t,skinning:true});}
// how high on the body each texel of a painted texture sits (0 the soles, 255 the top of the head): its triangles drawn
// at their UVs, shaded by their height in the rest pose (a little wider than themselves, to cover the seams)
function paintHeights(s,w,h){if(s.hmap)return s.hmap;let m0=null;s.scene.traverse(o=>{if(o.isSkinnedMesh&&!m0)m0=o;});
  const g=m0.geometry,P=g.attributes.position,U=g.attributes.uv,I=g.index,cv=document.createElement('canvas');cv.width=w;cv.height=h;const x=cv.getContext('2d');
  g.computeBoundingBox();const y0=g.boundingBox.min.y,yh=g.boundingBox.max.y-y0;x.lineWidth=2;x.lineJoin='round';
  for(let t=0;t<I.count;t+=3){const a=I.getX(t),b=I.getX(t+1),c=I.getX(t+2),v=Math.round(clamp(((P.getY(a)+P.getY(b)+P.getY(c))/3-y0)/yh,0,1)*255);
    x.fillStyle=x.strokeStyle=`rgb(${v},${v},${v})`;x.beginPath();x.moveTo(U.getX(a)*w,U.getY(a)*h);x.lineTo(U.getX(b)*w,U.getY(b)*h);x.lineTo(U.getX(c)*w,U.getY(c)*h);x.closePath();x.fill();x.stroke();}
  const d=x.getImageData(0,0,w,h).data,m=new Uint8Array(w*h);for(let i=0;i<m.length;i++)m[i]=d[i*4];return s.hmap=m;}
// a look on a painted texture: each texel sorted once by its own colour and height (skin: warm, fairly light; hair:
// brown above the collar; bottoms: brown below it; top: green below the face; shoes: white or grey at the feet), then
// each sort taking its new colour scaled by how light the texel was against that sort's middle tone, so the painted
// shading, knit and blush stay
function paintChar(x,w,h,s,look){const want={skin:look.skin>=0?HSKIN[look.skin]:null};for(const k in OUTFIT)want[k]=look[k]>=0?OUTFIT[k].cols[look[k]]:null;
  if(!Object.values(want).some(v=>v!==null))return;const im=x.getImageData(0,0,w,h),d=im.data,S=paintSorts(s);
  for(const k in want){const S0=S[k];if(want[k]===null||!S0.i.length)continue;const T0=new T.Color(want[k]);
    S0.i.forEach((i,j)=>{const f=S0.l[j]/S0.mid;d[i]=clamp(T0.r*f*255,0,255);d[i+1]=clamp(T0.g*f*255,0,255);d[i+2]=clamp(T0.b*f*255,0,255);});}
  x.putImageData(im,0,0);}
// the sorting, done once per model (with the painted hair's middle colour, for hair added to it)
function paintSorts(s){if(s.sorts)return s.sorts;const w=s.atlas.width,h=s.atlas.height,cv=document.createElement('canvas');cv.width=w;cv.height=h;const x=cv.getContext('2d');x.drawImage(s.atlas,0,0);
  const d=x.getImageData(0,0,w,h).data,hm=paintHeights(s,w,h),hsl={},c=new T.Color(),S={skin:{i:[],l:[]}};for(const k in OUTFIT)S[k]={i:[],l:[]};
  for(let p=0,i=0;i<d.length;p++,i+=4){c.setRGB(d[i]/255,d[i+1]/255,d[i+2]/255).getHSL(hsl);const hd=hsl.h*360,y=hm[p]/255,ch=(Math.max(d[i],d[i+1],d[i+2])-Math.min(d[i],d[i+1],d[i+2]))/255;let k=null;
    if(y<0.14&&ch<0.12&&hsl.l>0.5)k='shoe';/* (near white, HSL's saturation means little: go by the spread of the channels) */
    else if(hd>4&&hd<38&&hsl.s>0.3&&hsl.l>0.42&&hsl.l<0.9)k='skin';
    else if(hd<45&&hsl.s>0.12&&hsl.l>0.04&&hsl.l<0.45)k=y>0.6?'hair':'bot';
    else if(hd>80&&hd<180&&hsl.s>0.15&&y<0.66)k='top';
    if(k){S[k].i.push(i);S[k].l.push(hsl.l);}}
  for(const k in S){const ls=S[k].l.slice().sort((a,b)=>a-b);S[k].mid=ls[ls.length>>1]||1;}
  const H=S.hair,t=[0,0,0];let n=0;H.i.forEach((i,j)=>{if(Math.abs(H.l[j]-H.mid)<0.04){t[0]+=d[i];t[1]+=d[i+1];t[2]+=d[i+2];n++;}});
  s.hairTone=n?new T.Color(t[0]/n/255,t[1]/n/255,t[2]/n/255).getHex():OUTFIT.hair.own;return s.sorts=S;}
// long hair for a character made from a base (Willow): a smooth shell from the crown to below the shoulders, behind the
// face, with combed ridges, and a bow; skinned wholly to the head bone, so it turns and nods with it
let _hairG=null;
function hairGeos(){if(_hairG)return _hairG;const V=(x,y,z)=>new T.Vector3(x,y,z),q=new T.Vector3();
  const ell=(p,c,r)=>{q.subVectors(p,c);const k=Math.hypot(q.x/r.x,q.y/r.y,q.z/r.z);return(k-1)*Math.min(r.x,r.y,r.z);},
    rbox=(p,c,b,r)=>{const dx=Math.abs(p.x-c.x)-b.x+r,dy=Math.abs(p.y-c.y)-b.y+r,dz=Math.abs(p.z-c.z)-b.z+r;return Math.hypot(Math.max(dx,0),Math.max(dy,0),Math.max(dz,0))+Math.min(Math.max(dx,dy,dz),0)-r;},
    smax=(a,b,k)=>-smin(-a,-b,k),p=V(0,0,0);
  const hair=(x,y,z)=>{p.set(x,y,z);let d=smin(ell(p,V(0,1.31,-0.03),V(0.335,0.37,0.31)),rbox(p,V(0,1.05,-0.12),V(0.26,0.2,0.11),0.09),0.14);
    d=smax(d,z-0.03+Math.max(0,y-1.5)*0.6,0.05);/* (open in front, for the face) */const lo=clamp((1.42-y)/0.25,0,1);return d+0.007*lo*Math.sin(Math.atan2(x,-z)*26);},
    bow=(x,y,z)=>{p.set(x,y,z);return smin(Math.min(ell(p,V(-0.075,1.47,-0.33),V(0.075,0.055,0.035)),ell(p,V(0.075,1.47,-0.33),V(0.075,0.055,0.035))),ell(p,V(0,1.47,-0.345),V(0.032,0.034,0.03)),0.02);};
  return _hairG={hair:mochiSurface(hair,[-0.45,0.78,-0.44],[0.45,1.76,0.12],0.014),bow:mochiSurface(bow,[-0.17,1.39,-0.4],[0.17,1.55,-0.27],0.008)};}
function addHair(m,look,s){const hc=look.hair>=0?OUTFIT.hair.cols[look.hair]:(paintSorts(s),s.hairTone),G=hairGeos();headMesh(m,G.hair,hc);headMesh(m,G.bow,0xf27b93);}
// a mesh (in the model's rest pose) worn on a character's head: skinned wholly to the head bone, so it turns and nods
function headMesh(m,g,col){/* (col null: the mesh's own vertex colours) */let b=null;m.traverse(o=>{if(o.isSkinnedMesh&&!b)b=o;});if(!b)return;const hi=b.skeleton.bones.findIndex(o=>o.name==='mixamorigHead'||o.name==='Head');if(hi<0)return;
  if(!g.attributes.skinIndex){const n=g.attributes.position.count,si=new Uint16Array(n*4),sw=new Float32Array(n*4);for(let i=0;i<n;i++){si[i*4]=hi;sw[i*4]=1;}g.setAttribute('skinIndex',new T.BufferAttribute(si,4));g.setAttribute('skinWeight',new T.BufferAttribute(sw,4));}
  const k='hair|'+col,me=new T.SkinnedMesh(g,charMats[k]||(charMats[k]=toon(col===null?{vertexColors:true,skinning:true}:{color:col,skinning:true})));me.bind(b.skeleton,b.bindMatrix);me.castShadow=true;me.receiveShadow=true;me.frustumCulled=false;b.parent.add(me);}
// a character, ready to place: a group holding a clone of the loaded model (empty until it has loaded); a rigged one is
// already in its idle pose (never a T-pose), with its CharacterAnimator in userData.anim
function charModel(h){const g=new T.Group(),C=charDef(h.c),id=C.id,look=charLook(C,h);g.userData.char=look;
  charLoad(id,s=>{const m=T.SkeletonUtils.clone(s.scene);m.scale.setScalar(s.scale);
    m.traverse(o=>{if(o.isMesh){if(o.userData.dress)o.geometry=dressGeo(o.geometry,look,o.userData.dress);else if(s.atlas||o.userData.skin)o.material=charMat(id,look);o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;}});
    if(C.hair)addHair(m,look,s);if(C.build==='pip')headMesh(m,pipHair(look.style|0),look.hair>=0?OUTFIT.hair.cols[look.hair]:PIP_OWN.hair);
    if(C.build==='sprig'){const st=look.style|0;headMesh(m,dressGeo(sprigHat(st),look,sprigHatDress(st)),null);}g.add(m);if(s.clips.length)g.userData.anim=new CharacterAnimator(m,s.clips,s.scale,s.speeds,s.emotes);});
  return g;}
// idle when standing; when moving, walk blending into run with speed, each played at the rate that keeps its feet planted
// (speeds: how far the walk and run clips carry it a second, in its own units; the Quaternius ones' by default). Swimming
// keeps the idle clip; the lean
// and bob come from swimPose (76c-swim)
// a model with walk and run but no idle (a Mixamo export): stood upright in its rest pose (straight legs, level hips and
// back) with its arms where they hang on average through the walk, then breathing and slowly looking about, so it
// neither stands in a T-pose nor looks caught mid-stride
function idleFrom(walk,root){const rest={};root.traverse(o=>{if(o.isBone)rest[o.name]={quaternion:o.quaternion.toArray(),position:o.position.toArray()};});
  const arm=/Shoulder|Arm|Hand/,D=4,N=48,TAU=Math.PI*2,q=new T.Quaternion(),r=new T.Quaternion(),e=new T.Euler();
  const sway={Spine1:a=>[Math.sin(a)*0.02,0,0],Spine2:a=>[Math.sin(a)*0.025,0,0],Neck:a=>[Math.sin(a+0.6)*0.015,Math.sin(a*0.5)*0.05,0],Head:a=>[Math.sin(2*a)*0.02,Math.sin(a*0.5+0.4)*0.09,Math.sin(a*0.5)*0.03],LeftArm:a=>[0,0,Math.sin(a)*0.03],RightArm:a=>[0,0,-Math.sin(a)*0.03]};
  const tracks=walk.tracks.map(tr=>{const [node,prop]=tr.name.split('.'),bone=node.replace(/^mixamorig/,''),R=rest[node];let v0;
    if(arm.test(bone)&&prop==='quaternion'){const it=tr.createInterpolant(),s=[0,0,0,0];let f;/* the swing's average: the arm hanging */
      for(let i=0;i<60;i++){const v=it.evaluate(walk.duration*i/60);f=f||Array.from(v);const sg=v[0]*f[0]+v[1]*f[1]+v[2]*f[2]+v[3]*f[3]<0?-1:1;for(let k=0;k<4;k++)s[k]+=v[k]*sg;}
      v0=q.fromArray(s).normalize().toArray();}
    else v0=R&&R[prop]?R[prop]:Array.from(tr.createInterpolant().evaluate(0));
    const f=prop==='quaternion'&&sway[bone];if(!f)return new tr.constructor(tr.name,[0,D],[...v0,...v0]);const ts=[],vs=[];
    for(let i=0;i<=N;i++){const a=i/N*TAU;ts.push(i/N*D);q.fromArray(v0).multiply(r.setFromEuler(e.set(...f(a))));vs.push(q.x,q.y,q.z,q.w);}return new T.QuaternionKeyframeTrack(tr.name,ts,vs);});
  return new T.AnimationClip('Idle',D,tracks);}
class CharacterAnimator{
  constructor(root,clips,scale,speeds=[1.35,2.4],emotes={}){this.em=emotes;this.e=null;this.wv=speeds[0]*scale;this.rv=speeds[1]*scale;this.mx=new T.AnimationMixer(root);this.a=['Idle','Walk','Run'].map((n,i)=>{const a=this.mx.clipAction(clips.find(c=>c.name===n));a.play();a.setEffectiveWeight(i?0:1);return a;});this.w=[1,0,0];this.mx.update(0);}
  // a one-off flourish (a spin jump, a backflip) over whatever it's doing; moving off or swimming cuts it short
  emote(name){const c=this.em[name];if(!c)return;if(this.e)this.e.a.stop();const a=this.mx.clipAction(c);a.reset();a.setLoop(T.LoopOnce,1);a.clampWhenFinished=true;a.setEffectiveWeight(0);a.play();this.e={a,w:0,t:0,d:c.duration};}
  update(dt,speed,swim){const m=swim?0:smooth(0.05,0.5,speed),r=smooth(this.wv,this.rv,speed),tw=[1-m,m*(1-r),m*r],k=Math.min(1,dt*10);
    let ew=0;if(this.e){const E=this.e;E.t+=dt;const want=speed>0.3||swim||E.t>E.d-0.25?0:1;E.w+=(want-E.w)*Math.min(1,dt*8);E.a.setEffectiveWeight(E.w);ew=E.w;if(!want&&E.w<0.02&&E.t>0.2){E.a.stop();this.e=null;ew=0;}}
    for(let i=0;i<3;i++){this.w[i]+=(tw[i]-this.w[i])*k;this.a[i].setEffectiveWeight(this.w[i]*(1-ew));}
    this.a[1].timeScale=clamp(speed/this.wv,0.6,4);this.a[2].timeScale=clamp(speed/this.rv,0.6,4);this.mx.update(dt);}}
// a flourish from you (level-ups), if your character has one
function playerEmote(name){const b=villager.children[0],an=b&&b.userData.anim;if(an)an.emote(name);}
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
const rnd=n=>Math.floor(Math.random()*(n+1))-1;/* (-1: as drawn) */
function shuffleH(){const C=charDef(CHARS[Math.floor(Math.random()*CHARS.length)].id),o={skin:rnd((C.colors||HSKIN).length)};
  if(dressable(C))for(const k in OUTFIT)o[k]=rnd(OUTFIT[k].cols.length);if(C.styles)o.style=Math.floor(Math.random()*C.styles.length);setH(charLook(C,o));}
// a character's portrait (blank until its model has loaded; the editor and the look sheet redraw when it arrives)
const hThumbs={};
function hThumb(ch){const h=charLook(charDef((ch&&ch.c)||curHuman().c),Object.assign({},ch&&ch.c?{}:curHuman(),ch)),k=[h.c,h.skin,h.hair,h.top,h.bot,h.shoe,h.style].join('|');if(hThumbs[k])return hThumbs[k];
  if(!(charSrc[h.c]&&charSrc[h.c].ok)){charLoad(h.c,()=>{if(charEd)renderCharEd();else if(sheet)renderSheet();});return'data:image/gif;base64,R0lGODlhAQABAAAAACw=';}
  return hThumbs[k]=snapThumb(charModel(h),96);}
function renderCharEd(){if(!charEd)return;const h=curHuman();
  const tiles=`<div class="htiles">${CHARS.map(c=>`<button class="ht ${h.c===c.id?'on':''}" data-hc="${c.id}"><img src="${hThumb({c:c.id})}" alt="" style="background:#ddd3c6;border-radius:10px"><span>${c.name}</span></button>`).join('')}</div>`;
  const C=charDef(h.c),parts=dressable(C)?C.tabs||['skin',...Object.keys(OUTFIT)]:[],tab=parts.includes(charEd.tab)?charEd.tab:'skin',cur=tab==='skin'?h.skin:h[tab]??-1;
  const sw=C.colors?`<div class="hsw">${C.colors.map((c,i)=>`<button class="sw ${Math.max(0,h.skin)===i?'on':''}" data-hv="${i}" style="--sw:${hexCss(c)}"></button>`).join('')}</div>`/* (Mochi: its body colours) */
    :`<div class="hsw"><button class="sw own ${cur<0?'on':''}" data-hv="-1" title="As drawn" style="--sw:${hexCss(C.ownCol?C.ownCol(h,tab):tab==='skin'?0xd8c0a8:OUTFIT[tab].own)}"></button>${(tab==='skin'?HSKIN:(C.cols&&C.cols[tab])||OUTFIT[tab].cols).map((c,i)=>`<button class="sw ${cur===i?'on':''}" data-hv="${i}" style="--sw:${hexCss(c)}"></button>`).join('')}</div>`;
  const head=parts.length?`<div class="htabs">${parts.map(k=>`<button class="htab ${k===tab?'on':''}" data-ht="${k}">${(C.tabNames&&C.tabNames[k])||(k==='skin'?'Skin':OUTFIT[k].name)}</button>`).join('')}</div>`:`<h4>${C.colors?'Colour':'Skin'}</h4>`;
  $('charEd').innerHTML=`<div class="htop"><b>Your character</b><button class="hbtn" data-ha="shuffle">🎲 Shuffle</button>${S.look.prev&&S.look.prev!=='human'?`<button class="hbtn" data-ha="animal">Be an animal</button>`:''}<button class="pbtn go" data-ha="done">Done</button></div>
    <div class="hbody">${tiles}${head}${tab==='hair'&&C.styles?`<div class="htabs hstyle">${C.styles.map((n,i)=>`<button class="${(h.style|0)===i?'on':''}" data-hs="${i}">${n}</button>`).join('')}</div>`:''}${sw}</div>`;
  requestAnimationFrame(()=>{if(charEd){const W=window.innerWidth,H=window.innerHeight,px=$('charEd').offsetHeight;charEd.px=px;edCam.setViewOffset(W,H,0,px*0.5,W,H);}});}
$('charEd').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!charEd)return;const d=b.dataset;
  if(d.ha==='done'){closeCharEd();return;}if(d.ha==='shuffle'){shuffleH();return;}if(d.ha==='animal'){S.look.sp=S.look.prev||'bunny';applyLook();closeCharEd();return;}
  if(d.ht){charEd.tab=d.ht;renderCharEd();SFX.ui();return;}if(d.hs!==undefined){setH({style:+d.hs});return;}
  if(d.hc){if(d.hc!==curHuman().c){const h=curHuman();for(const k in h)if(k!=='c'&&k!=='skin')delete h[k];setH(charLook(charDef(d.hc),{skin:h.skin}));const an=edModel&&edModel.userData.anim;if(an)an.emote('spin');}return;}if(d.hv!==undefined){const t=charEd.tab&&dressable(charDef(curHuman().c))?charEd.tab:'skin';setH({[t]:+d.hv});return;}});
// the studio camera: framed on you in the space above the tray; you idle, turn slowly, and hop when something changes
function updateCharEd(dt,tt){if(!charEd||!edModel)return;charEd.t+=dt;const W=window.innerWidth,H=window.innerHeight,asp=W/H,f=1-(charEd.px||H*0.45)/H,tv=Math.tan(15*Math.PI/180);
  edCam.aspect=asp;const d=Math.max(0.64/(tv*f),0.5/(tv*asp))*1.05;edCam.position.set(0,0.6+d*0.1,d);edCam.lookAt(0,0.52,0);edCam.updateProjectionMatrix();
  charEd.hop=Math.max(0,(charEd.hop||0)-dt);edModel.position.y=Math.sin(Math.min(1,(0.3-charEd.hop)/0.3)*Math.PI)*(charEd.hop>0?0.08:0);
  edModel.rotation.y=charEd.spin+Math.sin(tt*0.6)*0.25;if(edModel.userData.anim)edModel.userData.anim.update(dt,0,false);
  for(const m of edScene.children)if(m.userData.ph!==undefined)m.position.y+=Math.sin(tt+m.userData.ph)*dt*0.1;}
const charEdFocus=()=>chatFocus();
