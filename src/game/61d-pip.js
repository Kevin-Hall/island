/* =========================================================
   Pip: a very simple little person, sculpted and rigged in code
   ========================================================= */
// A kawaii chibi: a head half its height, a fluffy cap of hair with a side-swept fringe and a sprout on top, a small
// slim body, thin arms with round hands, and tiny legs on rounded shoes, all melted into one smooth shape like Mochi (sdfRig, 61c). Each part is skin, hair, top, bottoms or
// shoes, and the editor colours each of them (pipLook paints the body's vertices, so every look shares one mesh). The
// face sits low: big glossy eyes with two glints (they blink), blush and a tiny smile. Clips: an idle that breathes, sways
// and looks about; a bouncy walk with swinging arms; a leaning run; and two emotes, a twirl and a cheer.
const PIP_BONES=[['Hips',null,0,0.2,0],['Spine','Hips',0,0.28,0],['Head','Spine',0,0.43,0],
  ['ArmL','Spine',-0.088,0.37,0],['ArmR','Spine',0.088,0.37,0],['LegL','Hips',-0.052,0.19,0],['LegR','Hips',0.052,0.19,0],['EyeL','Head',0,0,0],['EyeR','Head',0,0,0]];
const PIP_PARTS=['skin','hair','top','bot','shoe','leaf'],PIP_OWN={skin:0xf8d8c0,hair:0x6a4430,top:0xf4a0a8,bot:0x5f86c4,shoe:0xfff8f0,leaf:0x7cc46a};
function pipParts(){const V=(x,y,z)=>new T.Vector3(x,y,z),ss=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
  const ell=(c,r)=>(x,y,z)=>{const px=(x-c.x)/r.x,py=(y-c.y)/r.y,pz=(z-c.z)/r.z,k0=Math.hypot(px,py,pz),k1=Math.hypot(px/r.x,py/r.y,pz/r.z);return k1?k0*(k0-1)/k1:-Math.min(r.x,r.y,r.z);};
  const cap=(a,b,r0,r1,flat=1)=>(x,y,z)=>{const zz=a.z+(z-a.z)/flat,bx=b.x-a.x,by=b.y-a.y,bz=b.z-a.z,px=x-a.x,py=y-a.y,pz=zz-a.z,t=clamp((px*bx+py*by+pz*bz)/(bx*bx+by*by+bz*bz),0,1);
    return(Math.hypot(px-bx*t,py-by*t,pz-bz*t)-(r0+(r1-r0)*t))*Math.min(1,flat);};
  // hair: a cap a little bigger than the head, down to a hairline that sits high on the brow, scalloped into a soft
  // fringe, and falls lower over the ears and the back
  // hair: a fluffy cap a little bigger than the head, with a fringe swept to one side in soft scallops, falling over
  // the ears and lower at the back; and a tiny sprout of two leaves on top
  const hd=ell(V(0,0.69,-0.016),V(0.29,0.272,0.284)),hair=(x,y,z)=>{const line=0.74+0.05*clamp(x/0.24,-1,1)-0.014*Math.abs(Math.sin(x*20+0.6))-0.2*ss(0.08,-0.17,z)-0.13*ss(0.12,0.25,Math.abs(x));const a=hd(x,y,z),b=line-y,h=Math.max(0.018-Math.abs(a-b),0)/0.018;return Math.max(a,b)+h*h*0.0045;};/* (a softly rounded edge: a hard one shades in specks) */
  const P=[{d:ell(V(0,0.675,0),V(0.258,0.238,0.248)),bone:'Head',k:0,col:'skin'},{d:hair,bone:'Head',k:0.02,col:'hair'},
    {d:cap(V(0,0.95,-0.01),V(0.008,1.0,-0.01),0.011,0.008),bone:'Head',k:0.012,col:'leaf'},{d:cap(V(0.004,0.995,-0.01),V(-0.062,1.035,-0.01),0.019,0.006,0.5),bone:'Head',k:0.012,col:'leaf'},{d:cap(V(0.006,0.995,-0.01),V(0.07,1.045,-0.01),0.021,0.006,0.5),bone:'Head',k:0.012,col:'leaf'},
    {d:ell(V(0,0.235,0),V(0.112,0.085,0.098)),bone:'Hips',k:0.04,col:'top'},{d:cap(V(0,0.26,0),V(0,0.4,0),0.1,0.07,0.9),bone:'Spine',k:0.05,col:'top'}];
  for(const s of [-1,1]){const S=s<0?'L':'R';
    P.push({d:cap(V(s*0.085,0.375,0),V(s*0.135,0.27,0.01),0.03,0.026),bone:'Arm'+S,k:0.025,col:'top'},{d:ell(V(s*0.145,0.24,0.014),V(0.036,0.038,0.034)),bone:'Arm'+S,k:0.015,col:'skin'},
      {d:cap(V(s*0.052,0.2,0),V(s*0.052,0.065,0),0.04,0.036),bone:'Leg'+S,k:0.03,col:'bot'},{d:ell(V(s*0.054,0.036,0.022),V(0.048,0.038,0.07)),bone:'Leg'+S,k:0.02,col:'shoe'});}
  return P;}
let _pip=null;
function pipRig(){if(!_pip){const parts=pipParts();
  const scene=sdfRig({bones:PIP_BONES,parts,lo:[-0.32,-0.02,-0.32],hi:[0.32,1.08,0.3],h:0.012,c:new T.Vector3(0,0.675,0),name:'Pip',
    body:g=>{/* each vertex's share of each colour: its nearest parts, blended over a few millimetres, so the edges between colours are clean and smooth */
      const P=g.attributes.position,n=P.count,L=PIP_PARTS.length,w=new Float32Array(n*L),ds=new Array(parts.length),lab=parts.map(p=>PIP_PARTS.indexOf(p.col));
      for(let i=0;i<n;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i);let mn=1e9;for(let p=0;p<parts.length;p++){ds[p]=parts[p].d(x,y,z);mn=Math.min(mn,ds[p]);}
        let t=0;for(let p=0;p<parts.length;p++){const v=Math.exp(-(ds[p]-mn)/0.005);w[i*L+lab[p]]+=v;t+=v;}for(let k=0;k<L;k++)w[i*L+k]/=t;}
      g.setAttribute('part',new T.BufferAttribute(w,L));g.setAttribute('color',new T.BufferAttribute(new Float32Array(n*3),3));return toon({vertexColors:true,skinning:true});},
    face:(hit,put,S)=>{const eyes={};
      // big glossy eyes set low and wide, each with two glints; blush just under and outside them; a tiny smile
      for(const s of [-1,1]){const E=s<0?'EyeL':'EyeR',e=hit(s*0.4,-0.2,1);eyes[s]=e.p;put(S,0x2a1e24,e.p.clone().addScaledVector(e.n,0.003),e.n,0.034,0.047,0.018,0,E);
        put(S,0xffffff,e.p.clone().addScaledVector(e.n,0.019).add(new T.Vector3(s*-0.01,0.017,0)),e.n,0.012,0.013,0.006,0,E);
        put(S,0xffffff,e.p.clone().addScaledVector(e.n,0.019).add(new T.Vector3(s*0.009,-0.016,0)),e.n,0.006,0.006,0.004,0,E);
        const b=hit(s*0.62,-0.4,0.68);put(S,0xf6a3ac,b.p.clone().addScaledVector(b.n,-0.004),b.n,0.046,0.026,0.014);}
      const m=hit(0,-0.4,1);put(new T.TorusGeometry(0.014,0.0042,6,16,Math.PI),0x6a3236,m.p.clone().addScaledVector(m.n,0.002).add(new T.Vector3(0,0.008,0)),m.n,1,1,1,Math.PI);
      return eyes;}});
  scene.getObjectByName('PipBody').userData.dress=true;_pip={scene,clips:pipClips()};}
  const [idle,walk,run,spin,flip]=_pip.clips;return{scene:T.SkeletonUtils.clone(_pip.scene),clips:[idle,walk,run],emotes:{spin,flip},speeds:[0.55,3.2]};}
// a look on Pip's body: a copy of the mesh's geometry sharing all but its colours, each vertex its part's colour
const pipGeos={};
function pipLook(g,look){const k=PIP_PARTS.map(p=>look[p]).join('|');if(pipGeos[k])return pipGeos[k];const n=new T.BufferGeometry();
  for(const a in g.attributes)n.setAttribute(a,g.attributes[a]);n.setIndex(g.index);
  const col=PIP_PARTS.map(p=>new T.Color(look[p]>=0?(p==='skin'?HSKIN:OUTFIT[p].cols)[look[p]]:PIP_OWN[p])),L=col.length,w=g.attributes.part.array,nv=w.length/L,ca=new Float32Array(nv*3);
  for(let i=0;i<nv;i++)for(let k=0;k<L;k++){const f=w[i*L+k];if(!f)continue;ca[i*3]+=col[k].r*f;ca[i*3+1]+=col[k].g*f;ca[i*3+2]+=col[k].b*f;}n.setAttribute('color',new T.BufferAttribute(ca,3));return pipGeos[k]=n;}
function pipClips(){const {rest,R,V3,bump}=rigKit(PIP_BONES),H=rest('Hips'),LL=rest('LegL'),LR=rest('LegR'),still=(d,names)=>names.map(n=>R(n,d,()=>[0,0,0]));
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
