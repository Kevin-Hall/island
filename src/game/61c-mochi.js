/* =========================================================
   Mochi: the player's bunny, sculpted and rigged in code
   ========================================================= */
// One soft, seamless shape, drawn the way a cartoonist would: a little pear of a body under a big round head, two long
// ears, stubby paws and feet and a puff of a tail, all melted together (a signed distance field, each part blended into
// the next with smin). mochiSurface meshes it once (surface nets, every vertex settled onto the surface and shaded by
// its true normal), so there are no seams or facets. Each vertex is weighted to the bones of the parts it's nearest,
// blending across the joints, so the ears bend and the body squashes like rubber rather than moving in rigid chunks.
// The face is a few small shapes on the head: dot eyes with a glint (on their own bones, so they blink), a pink nose,
// a little ω mouth, blush and pink inner ears. Its clips (mochiClips): an idle that breathes, sways and twitches its
// ears and blinks; a waddling walk with ears that lag behind; and a run that's a bunny hop, squashing as it lands.
// CharacterAnimator (61b) plays them like an artist's clips; the body takes the colour picked in the editor.
const MOCHI_BONES=[['Hips',null,0,0.2,0],['Spine','Hips',0,0.36,0],['Head','Spine',0,0.55,0],
  ['EarL1','Head',-0.09,0.86,-0.03],['EarL2','EarL1',-0.11,1.02,-0.04],['EarR1','Head',0.09,0.86,-0.03],['EarR2','EarR1',0.11,1.02,-0.04],
  ['ArmL','Spine',-0.19,0.46,0.03],['ArmR','Spine',0.19,0.46,0.03],['FootL','Hips',-0.1,0.13,0.02],['FootR','Hips',0.1,0.13,0.02],['EyeL','Head',0,0,0],['EyeR','Head',0,0,0]];
// the parts: a distance (negative inside), the bone that carries it, and how softly it melts into the rest
function mochiParts(){const V=(x,y,z)=>new T.Vector3(x,y,z);
  const ell=(c,r)=>(x,y,z)=>{const px=(x-c.x)/r.x,py=(y-c.y)/r.y,pz=(z-c.z)/r.z,k0=Math.hypot(px,py,pz),k1=Math.hypot(px/r.x,py/r.y,pz/r.z);return k1?k0*(k0-1)/k1:-Math.min(r.x,r.y,r.z);};
  const cap=(a,b,r0,r1,flat=1)=>(x,y,z)=>{const zz=a.z+(z-a.z)/flat,bx=b.x-a.x,by=b.y-a.y,bz=b.z-a.z,px=x-a.x,py=y-a.y,pz=zz-a.z,t=clamp((px*bx+py*by+pz*bz)/(bx*bx+by*by+bz*bz),0,1);
    return(Math.hypot(px-bx*t,py-by*t,pz-bz*t)-(r0+(r1-r0)*t))*Math.min(1,flat);};
  const ears=[];for(const s of [-1,1]){const S=s<0?'L':'R';ears.push({d:cap(V(s*0.085,0.8,-0.03),V(s*0.11,1.01,-0.04),0.062,0.066,0.55),bone:'Ear'+S+'1',k:0.05},{d:cap(V(s*0.11,1.01,-0.04),V(s*0.13,1.2,-0.05),0.066,0.05,0.55),bone:'Ear'+S+'2',k:0.03});}
  return[{d:ell(V(0,0.27,0.01),V(0.27,0.22,0.24)),bone:'Hips',k:0},{d:ell(V(0,0.42,0),V(0.22,0.18,0.2)),bone:'Spine',k:0.08},
    {d:ell(V(0,0.71,0.02),V(0.29,0.245,0.255)),bone:'Head',k:0.09},...ears,
    {d:cap(V(-0.18,0.47,0.04),V(-0.22,0.34,0.11),0.05,0.048),bone:'ArmL',k:0.04},{d:cap(V(0.18,0.47,0.04),V(0.22,0.34,0.11),0.05,0.048),bone:'ArmR',k:0.04},
    {d:ell(V(-0.1,0.045,0.06),V(0.078,0.05,0.115)),bone:'FootL',k:0.05},{d:ell(V(0.1,0.045,0.06),V(0.078,0.05,0.115)),bone:'FootR',k:0.05},
    {d:ell(V(0,0.25,-0.25),V(0.075,0.075,0.07)),bone:'Hips',k:0.03}];}
const smin=(a,b,k)=>{if(!k)return Math.min(a,b);const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*0.25;};
// mesh the surface f=0 inside the box (surface nets): one vertex per cell the surface passes through, joined into quads
// across every grid edge it crosses, then each vertex pulled onto the surface and given the field's gradient as normal
function mochiSurface(f,lo,hi,h){const n=[0,1,2].map(a=>Math.ceil((hi[a]-lo[a])/h)+1),[nx,ny,nz]=n,F=new Float32Array(nx*ny*nz),id=(i,j,k)=>i+nx*(j+ny*k);
  for(let k=0;k<nz;k++)for(let j=0;j<ny;j++)for(let i=0;i<nx;i++)F[id(i,j,k)]=f(lo[0]+i*h,lo[1]+j*h,lo[2]+k*h);
  const C=new Int32Array((nx-1)*(ny-1)*(nz-1)).fill(-1),cid=(i,j,k)=>i+(nx-1)*(j+(ny-1)*k),pos=[],idx=[];
  const CO=[[0,0,0],[1,0,0],[0,1,0],[1,1,0],[0,0,1],[1,0,1],[0,1,1],[1,1,1]],ED=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]],v=new Float32Array(8);
  for(let k=0;k<nz-1;k++)for(let j=0;j<ny-1;j++)for(let i=0;i<nx-1;i++){let m=0;for(let c=0;c<8;c++){v[c]=F[id(i+CO[c][0],j+CO[c][1],k+CO[c][2])];if(v[c]<0)m|=1<<c;}if(m===0||m===255)continue;
    let sx=0,sy=0,sz=0,cnt=0;for(const [a,b] of ED){if((v[a]<0)===(v[b]<0))continue;const t=v[a]/(v[a]-v[b]);sx+=CO[a][0]+(CO[b][0]-CO[a][0])*t;sy+=CO[a][1]+(CO[b][1]-CO[a][1])*t;sz+=CO[a][2]+(CO[b][2]-CO[a][2])*t;cnt++;}
    C[cid(i,j,k)]=pos.length/3;pos.push(lo[0]+(i+sx/cnt)*h,lo[1]+(j+sy/cnt)*h,lo[2]+(k+sz/cnt)*h);}
  const quad=(a,b,c,d)=>{if(a<0||b<0||c<0||d<0)return;idx.push(a,b,c,a,c,d);};
  for(let k=1;k<nz-1;k++)for(let j=1;j<ny-1;j++)for(let i=1;i<nx-1;i++){const p=F[id(i,j,k)]<0;
    if(i<nx-1&&p!==(F[id(i+1,j,k)]<0))quad(C[cid(i,j-1,k-1)],C[cid(i,j,k-1)],C[cid(i,j,k)],C[cid(i,j-1,k)]);
    if(j<ny-1&&p!==(F[id(i,j+1,k)]<0))quad(C[cid(i-1,j,k-1)],C[cid(i-1,j,k)],C[cid(i,j,k)],C[cid(i,j,k-1)]);
    if(k<nz-1&&p!==(F[id(i,j,k+1)]<0))quad(C[cid(i-1,j-1,k)],C[cid(i,j-1,k)],C[cid(i,j,k)],C[cid(i-1,j,k)]);}
  const e=h*0.25,grad=(x,y,z,o)=>{o[0]=f(x+e,y,z)-f(x-e,y,z);o[1]=f(x,y+e,z)-f(x,y-e,z);o[2]=f(x,y,z+e)-f(x,y,z-e);const l=Math.hypot(o[0],o[1],o[2])||1;o[0]/=l;o[1]/=l;o[2]/=l;return o;},g=[0,0,0],nor=new Float32Array(pos.length);
  for(let i=0;i<pos.length;i+=3){for(let it=0;it<3;it++){const d=f(pos[i],pos[i+1],pos[i+2]);grad(pos[i],pos[i+1],pos[i+2],g);pos[i]-=g[0]*d;pos[i+1]-=g[1]*d;pos[i+2]-=g[2]*d;}grad(pos[i],pos[i+1],pos[i+2],g);nor[i]=g[0];nor[i+1]=g[1];nor[i+2]=g[2];}
  for(let t=0;t<idx.length;t+=3){const a=idx[t]*3,b=idx[t+1]*3,c=idx[t+2]*3,ux=pos[b]-pos[a],uy=pos[b+1]-pos[a+1],uz=pos[b+2]-pos[a+2],wx=pos[c]-pos[a],wy=pos[c+1]-pos[a+1],wz=pos[c+2]-pos[a+2];
    if((uy*wz-uz*wy)*nor[a]+(uz*wx-ux*wz)*nor[a+1]+(ux*wy-uy*wx)*nor[a+2]<0){const s=idx[t+1];idx[t+1]=idx[t+2];idx[t+2]=s;}}/* (each triangle faces outwards) */
  const g2=new T.BufferGeometry();g2.setAttribute('position',new T.Float32BufferAttribute(pos,3));g2.setAttribute('normal',new T.BufferAttribute(nor,3));g2.setIndex(idx);return g2;}
// the rig: built once (the surface takes a moment), then cloned for every use like any loaded model
let _mochi=null;
function mochiRig(){if(_mochi)return{scene:T.SkeletonUtils.clone(_mochi.scene),clips:_mochi.clips,speeds:_mochi.speeds};
  const scene=sdfRig({bones:MOCHI_BONES,parts:mochiParts(),lo:[-0.42,-0.02,-0.38],hi:[0.42,1.3,0.36],h:0.016,c:new T.Vector3(0,0.71,0.02),
    body:()=>{const m=toon({color:0xfaf8f4,skinning:true});return m;},name:'Mochi',
    face:(hit,put,S)=>{const eyes={};
      for(const s of [-1,1]){const e=hit(s*0.4,0.03,1);eyes[s]=e.p;put(S,0x1c1622,e.p.clone().addScaledVector(e.n,0.004),e.n,0.03,0.046,0.02,0,s<0?'EyeL':'EyeR');
        put(S,0xffffff,e.p.clone().addScaledVector(e.n,0.019).add(new T.Vector3(s*-0.008,0.016,0)),e.n,0.011,0.012,0.006,0,s<0?'EyeL':'EyeR');
        const b=hit(s*0.66,-0.2,0.72);put(S,0xf6b4bf,b.p.clone().addScaledVector(b.n,-0.004),b.n,0.052,0.03,0.016);
        put(S,0xf3b8c4,new T.Vector3(s*0.115,1.02,0.0),new T.Vector3(s*0.08,0,1).normalize(),0.03,0.13,0.022,s*0.12);}
      {const e=hit(0,-0.12,1);put(S,0xf08aa0,e.p.clone().addScaledVector(e.n,0.003),e.n,0.022,0.015,0.012);
        const m=hit(0,-0.27,1),arc=new T.TorusGeometry(0.016,0.0042,6,14,Math.PI);for(const s of [-1,1])put(arc,0x3a2430,m.p.clone().addScaledVector(m.n,0.002).add(new T.Vector3(s*0.016,0.004,0)),m.n,1,1,1,Math.PI);}
      return eyes;}});
  scene.getObjectByName('MochiBody').userData.skin=true;
  _mochi={scene,clips:mochiClips(),speeds:[0.4,2.6]};return{scene:T.SkeletonUtils.clone(scene),clips:_mochi.clips,speeds:_mochi.speeds};}
// a character sculpted in code (Mochi, Pip): its parts melted into one surface (the body, with each vertex's nearest
// part in its 'part' attribute), weighted to the parts' bones, and a face of small shapes set on the surface by
// marching out from inside the head (c); bones are [name, parent, x, y, z] in the rest pose, EyeL/EyeR placed on the eyes
function sdfRig(o){const parts=o.parts,f=(x,y,z)=>{let d=1e9;for(const p of parts)d=smin(d,p.d(x,y,z),p.k);return d;};
  const body=mochiSurface(f,o.lo,o.hi,o.h),c=o.c;
  const hit=(dx,dy,dz)=>{const d=new T.Vector3(dx,dy,dz).normalize();let a=0,b=0.5;for(let i=0;i<30;i++){const m=(a+b)/2,p=c.clone().addScaledVector(d,m);if(f(p.x,p.y,p.z)<0)a=m;else b=m;}
      const p=c.clone().addScaledVector(d,a),n=new T.Vector3(f(p.x+1e-3,p.y,p.z)-f(p.x-1e-3,p.y,p.z),f(p.x,p.y+1e-3,p.z)-f(p.x,p.y-1e-3,p.z),f(p.x,p.y,p.z+1e-3)-f(p.x,p.y,p.z-1e-3)).normalize();return{p,n};};
  const bits=[],put=(geo,col,p,n,sx,sy,sz,spin=0,bone)=>{const g=geo.clone(),q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),n),m=new T.Matrix4().compose(p,q.multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),spin)),new T.Vector3(sx,sy,sz));
      g.applyMatrix4(m);const k=g.attributes.position.count,cc=new T.Color(col),ca=new Float32Array(k*3);for(let i=0;i<k;i++)ca.set([cc.r,cc.g,cc.b],i*3);g.setAttribute('color',new T.BufferAttribute(ca,3));const out=g.index?g.toNonIndexed():g;out.userData.bone=bone;bits.push(out);};
  const eyes=o.face(hit,put,new T.SphereGeometry(1,16,12));
  const bones={},list=[];for(const [nm,par,x,y,z] of o.bones){const b=new T.Bone();b.name=nm;let w=new T.Vector3(x,y,z);if(nm==='EyeL')w=eyes[-1].clone();if(nm==='EyeR')w=eyes[1].clone();b.userData.w=w;
    const pw=par?bones[par].userData.w:new T.Vector3();b.position.copy(w).sub(pw);if(par)bones[par].add(b);bones[nm]=b;list.push(b);}
  const bi=nm=>list.indexOf(bones[nm]),weigh=(g,only)=>{const P=g.attributes.position,n=P.count,si=new Uint16Array(n*4),sw=new Float32Array(n*4),pa=new Uint8Array(n),ds=new Array(parts.length);
    for(let i=0;i<n;i++){if(only){si[i*4]=bi(only);sw[i*4]=1;continue;}const x=P.getX(i),y=P.getY(i),z=P.getZ(i);let mn=1e9;for(let p=0;p<parts.length;p++){ds[p]=parts[p].d(x,y,z);if(ds[p]<mn){mn=ds[p];pa[i]=p;}}
      const acc=new Map();for(let p=0;p<parts.length;p++){const w=Math.exp(-(ds[p]-mn)/0.022);if(w<0.02)continue;acc.set(parts[p].bone,(acc.get(parts[p].bone)||0)+w);}
      const top=[...acc].sort((a,b)=>b[1]-a[1]).slice(0,4),tot=top.reduce((a,q)=>a+q[1],0);top.forEach(([b,w],k)=>{si[i*4+k]=bi(b);sw[i*4+k]=w/tot;});}
    g.setAttribute('skinIndex',new T.BufferAttribute(si,4));g.setAttribute('skinWeight',new T.BufferAttribute(sw,4));if(!only)g.setAttribute('part',new T.BufferAttribute(pa,1));return g;};
  const scene=new T.Group();scene.add(bones[o.bones[0][0]]);scene.updateMatrixWorld(true);const skel=new T.Skeleton(list);
  const bg=weigh(body),bm=new T.SkinnedMesh(bg,o.body(bg));bm.name=o.name+'Body';scene.add(bm);bm.bind(skel);
  const merged=new T.BufferGeometry(),parts2=bits.map(g=>weigh(g,g.userData.bone));for(const a of ['position','normal','color','skinIndex','skinWeight']){const C=a==='skinIndex'?Uint16Array:Float32Array,sz=parts2[0].attributes[a].itemSize,arr=new C(parts2.reduce((t,g)=>t+g.attributes[a].array.length,0));let k=0;for(const g of parts2){arr.set(g.attributes[a].array,k);k+=g.attributes[a].array.length;}merged.setAttribute(a,new T.BufferAttribute(arr,sz));}
  const fm=new T.SkinnedMesh(merged,toon({vertexColors:true,skinning:true}));fm.name=o.name+'Face';scene.add(fm);fm.bind(skel);return scene;}
// the clips, sampled densely from smooth functions of each cycle's phase (whole turns only, so every loop is seamless);
// the ears always trail the body a little (follow-through), the head counters the body's sway
// tracks sampled from smooth functions of a clip's phase a (0..2π) and t (0..1), for a code-built rig's bones
function rigKit(BONES,N=60){const TAU=Math.PI*2,q=new T.Quaternion(),e=new T.Euler(),B={};for(const b of BONES)B[b[0]]=b;
  return{rest:n=>{const b=B[n],p=b[1]?B[b[1]]:null;return[b[2]-(p?p[2]:0),b[3]-(p?p[3]:0),b[4]-(p?p[4]:0)];},
    R:(n,dur,fn)=>{const ts=[],vs=[];for(let i=0;i<=N;i++){const t=i/N;ts.push(t*dur);q.setFromEuler(e.set(...fn(t*TAU,t)));vs.push(q.x,q.y,q.z,q.w);}return new T.QuaternionKeyframeTrack(n+'.quaternion',ts,vs);},
    V3:(n,prop,dur,fn)=>{const ts=[],vs=[];for(let i=0;i<=N;i++){const t=i/N;ts.push(t*dur);vs.push(...fn(t*TAU,t));}return new T.VectorKeyframeTrack(n+'.'+prop,ts,vs);},
    bump:(t,at,w)=>{let d=Math.abs(t-at);d=Math.min(d,1-d);return Math.exp(-(d/w)*(d/w));}};}
function mochiClips(){const {rest,R,V3,bump}=rigKit(MOCHI_BONES);
  const H=rest('Hips'),FL=rest('FootL'),FR=rest('FootR');
  const ears=(dur,fn)=>['L','R'].flatMap((s,i)=>{const sg=i?1:-1;return[R('Ear'+s+'1',dur,(a,t)=>fn(a,t,sg,1)),R('Ear'+s+'2',dur,(a,t)=>fn(a,t,sg,2))];});
  const idle=new T.AnimationClip('Idle',3.6,[
    V3('Hips','position',3.6,()=>H),V3('Spine','scale',3.6,a=>[1-Math.sin(a)*0.012,1+Math.sin(a)*0.022,1-Math.sin(a)*0.012]),R('Spine',3.6,a=>[Math.sin(a)*0.02,0,0]),
    R('Head',3.6,a=>[Math.sin(2*a+1)*0.03,Math.sin(a)*0.08,Math.sin(a+0.5)*0.05]),
    ...ears(3.6,(a,t,s,k)=>k===1?[Math.sin(a-0.7)*0.05-0.04,0,s*(0.07+Math.sin(a-0.8)*0.04)]:[Math.sin(a-1.3)*0.08+(s>0?bump(t,0.62,0.025):0)*0.45,0,0]),
    R('ArmL',3.6,a=>[Math.sin(a)*0.05,0,-0.05]),R('ArmR',3.6,a=>[Math.sin(a)*0.05,0,0.05]),R('FootL',3.6,()=>[0,0,0]),R('FootR',3.6,()=>[0,0,0]),
    V3('FootL','position',3.6,()=>FL),V3('FootR','position',3.6,()=>FR),
    V3('EyeL','scale',3.6,(a,t)=>[1,1-0.92*bump(t,0.42,0.018),1]),V3('EyeR','scale',3.6,(a,t)=>[1,1-0.92*bump(t,0.42,0.018),1])]);
  const walk=new T.AnimationClip('Walk',0.8,[
    V3('Hips','position',0.8,a=>[0,H[1]+0.012*(1-Math.cos(2*a)),0]),V3('Spine','scale',0.8,()=>[1,1,1]),R('Spine',0.8,a=>[0.03,Math.sin(a)*0.06,Math.sin(a)*0.07]),
    R('Head',0.8,a=>[0.02*Math.cos(2*a),-Math.sin(a-0.3)*0.04,-Math.sin(a-0.4)*0.06]),
    ...ears(0.8,(a,t,s,k)=>k===1?[-0.1-0.07*Math.sin(2*a-1),0,s*0.06+Math.sin(a-0.9)*0.06]:[-0.1*Math.sin(2*a-1.6),0,0]),
    R('ArmL',0.8,a=>[-Math.sin(a)*0.4,0,-0.08]),R('ArmR',0.8,a=>[Math.sin(a)*0.4,0,0.08]),
    R('FootL',0.8,a=>[Math.sin(a)*0.45,0,0]),R('FootR',0.8,a=>[-Math.sin(a)*0.45,0,0]),
    V3('FootL','position',0.8,a=>[FL[0],FL[1]+Math.max(0,Math.cos(a))*0.035,FL[2]]),V3('FootR','position',0.8,a=>[FR[0],FR[1]+Math.max(0,-Math.cos(a))*0.035,FR[2]]),
    V3('EyeL','scale',0.8,()=>[1,1,1]),V3('EyeR','scale',0.8,()=>[1,1,1])]);
  // the hop: up and over in the air, a squash as it lands and a stretch on the way up; ears flop back, then forward
  const land=t=>bump(t,0,0.07),air=t=>Math.sin(Math.PI*t);
  const run=new T.AnimationClip('Run',0.56,[
    V3('Hips','position',0.56,(a,t)=>[0,H[1]+0.2*air(t)-0.035*land(t),0]),V3('Spine','scale',0.56,(a,t)=>{const y=1-0.14*land(t)+0.07*air(t),xz=1/Math.sqrt(y);return[xz,y,xz];}),
    R('Spine',0.56,(a,t)=>[0.16-0.1*land(t),0,0]),R('Head',0.56,a=>[-0.08*Math.cos(a),0,0]),
    ...ears(0.56,(a,t,s,k)=>k===1?[-0.25+0.3*Math.cos(a-0.8),0,s*0.1]:[-0.22*Math.cos(a-1.4),0,0]),
    R('ArmL',0.56,a=>[-0.3,0,-0.4-0.2*Math.sin(a)]),R('ArmR',0.56,a=>[-0.3,0,0.4+0.2*Math.sin(a)]),
    R('FootL',0.56,(a,t)=>[-0.55*air(t)+0.2*land(t),0,0]),R('FootR',0.56,(a,t)=>[-0.55*air(t)+0.2*land(t),0,0]),
    V3('FootL','position',0.56,()=>FL),V3('FootR','position',0.56,()=>FR),V3('EyeL','scale',0.56,()=>[1,1,1]),V3('EyeR','scale',0.56,()=>[1,1,1])]);
  return[idle,walk,run];}
