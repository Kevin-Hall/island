/* =========================================================
   Pip: a very simple little person, sculpted and rigged in code
   ========================================================= */
// A kawaii chibi: a head half its height, hair in a style of your choosing (pipHair) and a sprout on top, a small
// slim body, thin arms with round hands, and tiny legs on rounded shoes, all melted into one smooth shape like Mochi (sdfRig, 61c). Each part is skin, top, bottoms or
// shoes, and the editor colours each of them (dressGeo paints the body's vertices, so every look shares one mesh). The
// face sits low: big eyes with whites, a brown iris and two glints under a lash line (they blink), blush and a tiny smile. Clips: an idle that breathes, sways
// and looks about; a bouncy walk with swinging arms; a leaning run; and two emotes, a twirl and a cheer.
const PIP_BONES=[['Hips',null,0,0.2,0],['Spine','Hips',0,0.28,0],['Head','Spine',0,0.43,0],
  ['ArmL','Spine',-0.088,0.37,0],['ArmR','Spine',0.088,0.37,0],['LegL','Hips',-0.052,0.19,0],['LegR','Hips',0.052,0.19,0],['EyeL','Head',0,0,0],['EyeR','Head',0,0,0]];
const PIP_PARTS=['skin','hair','top','bot','shoe','leaf'],PIP_OWN={skin:0xf8d8c0,hair:0x6a4430,top:0xf4a0a8,bot:0x5f86c4,shoe:0xfff8f0,leaf:0x7cc46a};
function pipParts(){const V=(x,y,z)=>new T.Vector3(x,y,z),ss=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
  const ell=(c,r)=>(x,y,z)=>{const px=(x-c.x)/r.x,py=(y-c.y)/r.y,pz=(z-c.z)/r.z,k0=Math.hypot(px,py,pz),k1=Math.hypot(px/r.x,py/r.y,pz/r.z);return k1?k0*(k0-1)/k1:-Math.min(r.x,r.y,r.z);};
  const cap=(a,b,r0,r1,flat=1)=>(x,y,z)=>{const zz=a.z+(z-a.z)/flat,bx=b.x-a.x,by=b.y-a.y,bz=b.z-a.z,px=x-a.x,py=y-a.y,pz=zz-a.z,t=clamp((px*bx+py*by+pz*bz)/(bx*bx+by*by+bz*bz),0,1);
    return(Math.hypot(px-bx*t,py-by*t,pz-bz*t)-(r0+(r1-r0)*t))*Math.min(1,flat);};
  // (the hair is its own mesh, in the style picked: pipHair) and a tiny sprout of two leaves on top
  const P=[{d:ell(V(0,0.675,0),V(0.258,0.238,0.248)),bone:'Head',k:0,col:'skin'},
    {d:cap(V(0,0.93,-0.03),V(0.008,1.02,-0.02),0.011,0.008),bone:'Head',k:0.012,col:'leaf'},{d:cap(V(0.004,1.015,-0.02),V(-0.062,1.055,-0.02),0.019,0.006,0.5),bone:'Head',k:0.012,col:'leaf'},{d:cap(V(0.006,1.015,-0.02),V(0.07,1.065,-0.02),0.021,0.006,0.5),bone:'Head',k:0.012,col:'leaf'},
    {d:ell(V(0,0.235,0),V(0.112,0.085,0.098)),bone:'Hips',k:0.04,col:'top'},{d:cap(V(0,0.26,0),V(0,0.4,0),0.1,0.07,0.9),bone:'Spine',k:0.05,col:'top'}];
  for(const s of [-1,1]){const S=s<0?'L':'R';
    P.push({d:cap(V(s*0.085,0.375,0),V(s*0.135,0.27,0.01),0.03,0.026),bone:'Arm'+S,k:0.025,col:'top'},{d:ell(V(s*0.145,0.24,0.014),V(0.036,0.038,0.034)),bone:'Arm'+S,k:0.015,col:'skin'},
      {d:cap(V(s*0.052,0.2,0),V(s*0.052,0.065,0),0.04,0.036),bone:'Leg'+S,k:0.03,col:'bot'},{d:ell(V(s*0.054,0.036,0.022),V(0.048,0.038,0.07)),bone:'Leg'+S,k:0.02,col:'shoe'});}
  return P;}
let _pip=null;
// a code-built character whose body is painted per look: each vertex holds its share of each colour in `labels`
// (its nearest parts, blended over a few millimetres, so the edges between colours are clean and smooth)
function dressWeights(g,parts,labels){const P=g.attributes.position,n=P.count,L=labels.length,w=new Float32Array(n*L),ds=new Array(parts.length),lab=parts.map(p=>labels.indexOf(p.col));
  for(let i=0;i<n;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i);let mn=1e9;for(let p=0;p<parts.length;p++){ds[p]=parts[p].d(x,y,z);mn=Math.min(mn,ds[p]);}
    let t=0;for(let p=0;p<parts.length;p++){const v=Math.exp(-(ds[p]-mn)/0.005);w[i*L+lab[p]]+=v;t+=v;}for(let k=0;k<L;k++)w[i*L+k]/=t;}
  g.setAttribute('part',new T.BufferAttribute(w,L));g.setAttribute('color',new T.BufferAttribute(new Float32Array(n*3),3));return g;}
function dressRig(o){const scene=sdfRig(Object.assign({},o,{body:g=>(dressWeights(g,o.parts,o.dress.labels),toon({vertexColors:true,skinning:true}))}));
  scene.getObjectByName(o.name+'Body').userData.dress=o.dress;return scene;}
// a colour for one part of a dressed character's look: the picked swatch, or its own colour
function dressCol(dress,look,p){const i=look[p];return i>=0?(p==='skin'?HSKIN:(dress.cols&&dress.cols[p])||OUTFIT[p].cols)[i]:dress.own[p];}
const PIP_DRESS={labels:PIP_PARTS,own:PIP_OWN};
function pipRig(){if(!_pip){const parts=pipParts();
  const scene=dressRig({bones:PIP_BONES,parts,dress:PIP_DRESS,lo:[-0.32,-0.02,-0.32],hi:[0.32,1.1,0.3],h:0.012,c:new T.Vector3(0,0.675,0),name:'Pip',
    face:(hit,put,S)=>{const eyes={};
      // big eyes set low and wide: a white, a warm brown iris and a dark pupil, two glints, and a dark lash line arched
      // over the top (all on the eye's bone, so a blink closes them to a line); blush just under and outside; a tiny smile
      const lash=new T.TorusGeometry(0.041,0.0052,6,20,Math.PI);
      for(const s of [-1,1]){const E=s<0?'EyeL':'EyeR',e=hit(s*0.4,-0.2,1),o=(dz,dx,dy)=>e.p.clone().addScaledVector(e.n,dz).add(new T.Vector3(dx,dy,0));eyes[s]=e.p;
        put(S,0xffffff,o(0.002,0,0),e.n,0.04,0.05,0.016,0,E);put(S,0x6b4232,o(0.009,s*-0.002,-0.006),e.n,0.029,0.037,0.012,0,E);put(S,0x1e1418,o(0.015,s*-0.002,-0.008),e.n,0.016,0.021,0.008,0,E);
        put(S,0xffffff,o(0.021,s*-0.009,0.01),e.n,0.009,0.01,0.005,0,E);put(S,0xffffff,o(0.021,s*0.007,-0.019),e.n,0.005,0.005,0.004,0,E);
        put(lash,0x2a1c20,o(0.008,0,-0.004),e.n,1,1.24,1,0,E);
        const b=hit(s*0.62,-0.4,0.68);put(S,0xf6a3ac,b.p.clone().addScaledVector(b.n,-0.004),b.n,0.046,0.026,0.014);}
      const m=hit(0,-0.4,1);put(new T.TorusGeometry(0.014,0.0042,6,16,Math.PI),0x6a3236,m.p.clone().addScaledVector(m.n,0.002).add(new T.Vector3(0,0.008,0)),m.n,1,1,1,Math.PI);
      return eyes;}});
  _pip={scene,clips:pipClips()};}
  const [idle,walk,run,spin,flip]=_pip.clips;return{scene:T.SkeletonUtils.clone(_pip.scene),clips:[idle,walk,run],emotes:{spin,flip},speeds:[0.55,3.2]};}
// a look on a dressed mesh: a copy of its geometry sharing all but its colours, each vertex its parts' colours blended
const dressGeos={};
function dressGeo(g,look,dress){const k=g.uuid+'|'+dress.labels.map(p=>look[p]).join('|');if(dressGeos[k])return dressGeos[k];const n=new T.BufferGeometry();
  for(const a in g.attributes)n.setAttribute(a,g.attributes[a]);n.setIndex(g.index);
  const col=dress.labels.map(p=>new T.Color(dressCol(dress,look,p))),L=col.length,w=g.attributes.part.array,nv=w.length/L,ca=new Float32Array(nv*3);
  for(let i=0;i<nv;i++)for(let k=0;k<L;k++){const f=w[i*L+k];if(!f)continue;ca[i*3]+=col[k].r*f;ca[i*3+1]+=col[k].g*f;ca[i*3+2]+=col[k].b*f;}n.setAttribute('color',new T.BufferAttribute(ca,3));return dressGeos[k]=n;}
function pipClips(BONES=PIP_BONES){const {rest,R,V3,bump}=rigKit(BONES),H=rest('Hips'),LL=rest('LegL'),LR=rest('LegR'),still=(d,names)=>names.map(n=>R(n,d,()=>[0,0,0]));
  const eyes=(d,fn=()=>[1,1,1])=>[V3('EyeL','scale',d,fn),V3('EyeR','scale',d,fn)],legsAt=d=>[V3('LegL','position',d,()=>LL),V3('LegR','position',d,()=>LR)];
  const idle=new T.AnimationClip('Idle',3.2,[V3('Hips','position',3.2,()=>H),R('Hips',3.2,a=>[0,Math.sin(a)*0.04,0]),
    V3('Spine','scale',3.2,a=>[1-Math.sin(a)*0.01,1+Math.sin(a)*0.025,1-Math.sin(a)*0.01]),R('Spine',3.2,a=>[Math.sin(a)*0.02,0,Math.sin(a+1)*0.02]),
    R('Head',3.2,a=>[Math.sin(2*a+1)*0.03,Math.sin(a)*0.12,Math.sin(a+0.5)*0.06]),
    R('ArmL',3.2,a=>[Math.sin(a)*0.06,0,-0.08-Math.sin(a)*0.03]),R('ArmR',3.2,a=>[Math.sin(a)*0.06,0,0.08+Math.sin(a)*0.03]),
    ...still(3.2,['LegL','LegR']),...legsAt(3.2),...eyes(3.2,(a,t)=>[1,1-0.92*bump(t,0.55,0.02),1])]);
  // the walk: legs swing from the hip, arms against them, a bounce on each step and a little sway
  const walk=new T.AnimationClip('Walk',0.6,[V3('Hips','position',0.6,a=>[0,H[1]+0.02*(1-Math.cos(2*a))*0.5+0.008,0]),R('Hips',0.6,a=>[0,Math.sin(a)*0.1,0]),
    V3('Spine','scale',0.6,()=>[1,1,1]),R('Spine',0.6,a=>[0.04,-Math.sin(a)*0.08,Math.sin(a)*0.05]),R('Head',0.6,a=>[0.02*Math.cos(2*a),Math.sin(a)*0.06,-Math.sin(a)*0.05]),
    R('ArmL',0.6,a=>[-Math.sin(a)*0.65,0,-0.1]),R('ArmR',0.6,a=>[Math.sin(a)*0.65,0,0.1]),
    R('LegL',0.6,a=>[Math.sin(a)*0.55,0,0]),R('LegR',0.6,a=>[-Math.sin(a)*0.55,0,0]),...legsAt(0.6),...eyes(0.6)]);
  const run=new T.AnimationClip('Run',0.5,[V3('Hips','position',0.5,a=>[0,H[1]+0.035*Math.abs(Math.sin(a)),0]),R('Hips',0.5,a=>[0,Math.sin(a)*0.14,0]),
    V3('Spine','scale',0.5,()=>[1,1,1]),R('Spine',0.5,a=>[0.2,-Math.sin(a)*0.12,0]),R('Head',0.5,a=>[-0.12+0.03*Math.cos(2*a),Math.sin(a)*0.08,0]),
    R('ArmL',0.5,a=>[-Math.sin(a)*1.0,0,-0.2]),R('ArmR',0.5,a=>[Math.sin(a)*1.0,0,0.2]),
    R('LegL',0.5,a=>[Math.sin(a)*0.85-0.05,0,0]),R('LegR',0.5,a=>[-Math.sin(a)*0.85-0.05,0,0]),...legsAt(0.5),...eyes(0.5)]);
  // a happy twirl: crouch, spring up spinning once round, arms flung out, land with a squash
  const up=t=>Math.max(0,Math.sin(Math.PI*clamp((t-0.15)/0.6,0,1))),turn=t=>{const u=clamp((t-0.15)/0.6,0,1);return u*u*(3-2*u)*Math.PI*2;},sq=t=>bump(t,0.08,0.06)+bump(t,0.82,0.06);
  const spin=new T.AnimationClip('spin',1.1,[V3('Hips','position',1.1,(a,t)=>[0,H[1]+0.2*up(t)-0.03*sq(t),0]),R('Hips',1.1,(a,t)=>[0,turn(t),0]),
    V3('Spine','scale',1.1,(a,t)=>{const y=1-0.12*sq(t)+0.06*up(t),xz=1/Math.sqrt(y);return[xz,y,xz];}),R('Spine',1.1,()=>[0,0,0]),R('Head',1.1,(a,t)=>[-0.15*up(t),0,0]),
    R('ArmL',1.1,(a,t)=>[0,0,-0.1-1.6*up(t)]),R('ArmR',1.1,(a,t)=>[0,0,0.1+1.6*up(t)]),R('LegL',1.1,(a,t)=>[-0.4*up(t),0,0]),R('LegR',1.1,(a,t)=>[0.3*up(t),0,0]),
    ...legsAt(1.1),...eyes(1.1,(a,t)=>[1,1-0.8*up(t)*up(t),1])]);
  // a cheer: two bounces with both arms up and waving
  const hop=t=>Math.max(0,Math.sin(Math.PI*2*clamp(t/0.8,0,1)*2))*(t<0.8?1:0),raise=t=>Math.sin(Math.PI*clamp(t/0.95,0,1));
  const flip=new T.AnimationClip('flip',1.2,[V3('Hips','position',1.2,(a,t)=>[0,H[1]+0.09*hop(t),0]),R('Hips',1.2,()=>[0,0,0]),V3('Spine','scale',1.2,()=>[1,1,1]),
    R('Spine',1.2,(a,t)=>[-0.1*raise(t),0,0]),R('Head',1.2,(a,t)=>[-0.2*raise(t),0,Math.sin(a*3)*0.08*raise(t)]),
    R('ArmL',1.2,(a,t)=>[0,0,-(0.1+2.5*raise(t))+Math.sin(a*6)*0.25*raise(t)]),R('ArmR',1.2,(a,t)=>[0,0,0.1+2.5*raise(t)+Math.sin(a*6+1)*0.25*raise(t)]),
    ...still(1.2,['LegL','LegR']),...legsAt(1.2),...eyes(1.2,(a,t)=>[1,1-0.85*raise(t)*raise(t),1])]);
  return[idle,walk,run,spin,flip];}
// Pip's hair, its own mesh skinned to the head (so a style is a swap, and the body is shared): a cap close over the
// scalp with a soft hairline, and locks that grow out of it, each a curved, tapering clump ending in a point, arcing
// up off the scalp before falling, so the hair has tufts and a silhouette rather than a smooth bowl
const _pipHair={};/* (the styles' names: CHARS, 61b) */
function pipHair(style){if(_pipHair[style])return _pipHair[style];const V=(x,y,z)=>new T.Vector3(x,y,z),C=V(0,0.675,0),RX=0.258,RY=0.238,RZ=0.248,D=Math.PI/180;
  const ss=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);},smax=(a,b,k)=>-smin(-a,-b,k);
  const ell=(c,r)=>(x,y,z)=>{const px=(x-c.x)/r.x,py=(y-c.y)/r.y,pz=(z-c.z)/r.z,k0=Math.hypot(px,py,pz),k1=Math.hypot(px/r.x,py/r.y,pz/r.z);return k1?k0*(k0-1)/k1:-Math.min(r.x,r.y,r.z);};
  const seg=(a,b,r0,r1)=>(x,y,z)=>{const bx=b.x-a.x,by=b.y-a.y,bz=b.z-a.z,px=x-a.x,py=y-a.y,pz=z-a.z,t=clamp((px*bx+py*by+pz*bz)/(bx*bx+by*by+bz*bz),0,1);return Math.hypot(px-bx*t,py-by*t,pz-bz*t)-(r0+(r1-r0)*t);};
  const rbox=(c,b,r)=>(x,y,z)=>{const dx=Math.abs(x-c.x)-b.x+r,dy=Math.abs(y-c.y)-b.y+r,dz=Math.abs(z-c.z)-b.z+r;return Math.hypot(Math.max(dx,0),Math.max(dy,0),Math.max(dz,0))+Math.min(Math.max(dx,dy,dz),0)-r;};
  // a point on the scalp (az round from the front, el up from the brow line), lifted off it by `off`
  const S=(az,el,off=0)=>{const d=V(Math.sin(az*D)*Math.cos(el*D),Math.sin(el*D),Math.cos(az*D)*Math.cos(el*D)),R=1/Math.hypot(d.x/RX,d.y/RY,d.z/RZ);return C.clone().addScaledVector(d,R+off);};
  const lock=(a,m,b,r)=>{const f1=seg(a,m,r,r*0.78),f2=seg(m,b,r*0.78,0.004);return(x,y,z)=>smin(f1(x,y,z),f2(x,y,z),0.012);};
  const L=(az0,el0,az1,el1,off,r,bulge=0.012)=>lock(S(az0,el0,0.004),S((az0+az1)/2,(el0+el1)/2,bulge+off*0.5),S(az1,el1,off),r);
  // the cap, down to a hairline at `front` over the brow, lower at the sides and back, with fine combed grooves
  const capOf=(off,front,side,back)=>{const sh=ell(C,V(RX+off,RY+off,RZ+off));return(x,y,z)=>{const line=front-(front-back)*ss(0.06,-0.2,z-C.z)-(front-side)*ss(0.14,0.25,Math.abs(x))*ss(-0.2,0.05,z-C.z),a=sh(x,y,z)+0.0015*Math.sin(Math.atan2(x,z)*22),b=line-y;return smax(a,b,0.02);};};
  const fringe=(sweep,r=0.052)=>[-46,-23,0,23,46].map((az,i)=>L(az,52,az+sweep,10+Math.abs(az)*0.12,0.022,r*(1-Math.abs(i-2)*0.06)));
  const temples=(drop=-18,r=0.044)=>[-1,1].map(s=>L(s*72,32,s*84,drop,0.018,r));
  const parts=[];let k=0.035;
  if(style===0){parts.push(capOf(0.028,0.76,0.7,0.58),...fringe(16),...temples(),/* (crown locks lie back, full and swept, rather than standing up) */
      L(150,84,160,36,0.03,0.06),L(210,84,200,36,0.03,0.06),L(180,70,180,24,0.034,0.062),L(118,58,126,18,0.026,0.054),L(242,58,234,18,0.026,0.054),L(30,88,70,62,0.05,0.05,0.02),
      ...[150,180,210].map(az=>L(az,-2,az+(az-180)*0.3,-34,0.022,0.05)));}
  else if(style===1){const vol=ell(V(0,0.665,-0.012),V(0.302,0.296,0.3)),face=rbox(V(0,0.6,0.3),V(0.185,0.21,0.3),0.07);
    parts.push((x,y,z)=>{const az=Math.atan2(x,z)/D;let d=smax(vol(x,y,z)+0.003*Math.sin(az*D*30)*ss(0.75,0.55,y),-face(x,y,z),0.03);
        d+=0.012*Math.exp(-(((az+28)/7)**2))*ss(0.8,0.9,y)*ss(-0.05,0.08,z);/* (a side parting) */return smax(d,0.505-y,0.03);},
      ...[-20,6,32,56].map((az,i)=>L(az,50,az+22,14+i*2,0.026,0.056,0)));}
  else if(style===2){parts.push(capOf(0.028,0.76,0.7,0.6),...fringe(-14),...temples(-24),
      ...[-1,1].map(s=>{const b=S(s*52,58,0.085);return(x,y,z)=>ell(b,V(0.1,0.095,0.095))(x,y,z)+0.003*Math.sin(Math.atan2(x-b.x,z-b.z)*9+y*40);}),
      ...[160,200].map(az=>L(az,-4,az+(az-180)*0.4,-30,0.02,0.046)));}
  else{const curtain=rbox(V(0,0.56,-0.15),V(0.22,0.17,0.11),0.09);parts.push(capOf(0.02,0.84,0.72,0.58),...fringe(16),
      ...[-1,1].map(s=>lock(S(s*74,30,0.004),V(s*0.26,0.6,0.07),V(s*0.22,0.44,0.07),0.046)),(x,y,z)=>curtain(x,y,z)+0.003*Math.sin(x*60),
      ...[-0.13,0,0.13].map(x0=>lock(V(x0,0.5,-0.2),V(x0*1.1,0.44,-0.22),V(x0*1.15,0.4,-0.2),0.06)));k=0.05;}
  const f=(x,y,z)=>{let d=1e9;for(const p of parts)d=smin(d,p(x,y,z),k);return d;};
  return _pipHair[style]=mochiSurface(f,[-0.4,0.34,-0.42],[0.4,1.0,0.38],0.009);}
