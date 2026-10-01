/* =========================================================
   Buddies: small, round animal characters built in code, with a real rig and clips
   ========================================================= */
// In the spirit of A Short Hike's bird and bold, simple animal faces: a soft egg of a body under a big round head, big
// eyes, stubby feet and little wings or paws. Every buddy shares one tiny skeleton (Hips → Body → Head and two
// Wings, Hips → two Feet); each part is bound whole to one bone, so the shapes stay round as they move. Their clips
// (Idle, Walk, Run) are keyframed here and played by CharacterAnimator (61b) like any artist's model. The body (the
// meshes marked userData.skin) takes the colour picked in the editor; eyes, beaks, jackets and feet keep their own.
const BONES=[['Hips',null,0,0.17,0],['Body','Hips',0,0.22,0],['Head','Body',0,0.64,0],['WingL','Body',-0.27,0.5,0],['WingR','Body',0.27,0.5,0],['FootL','Hips',-0.12,0.17,0],['FootR','Hips',0.12,0.17,0]];
// parts per buddy: [bone, body colour?, P(...)] (body-coloured parts ignore their colour: the material sets it)
function buddyParts(kind){const B=0,o=[],add=(bone,body,...ps)=>{for(const p of ps)o.push([bone,body,p]);};
  const eyes=(y,z,w,h,pupil,white=true)=>{for(const s of [-1,1]){if(white)add('Head',0,P(SPH,0xfbf8f2,s*0.13,y,z,0,s*0.38,0,w,h,0.07));
      add('Head',0,P(SPH,0x14101a,s*0.135,y-0.01,z+(white?0.025:0),0,s*0.38,0,pupil,pupil*1.2,0.05),P(SPH_XS,0xffffff,s*0.12,y+0.025,z+(white?0.05:0.025),0,0,0,0.028,0.028,0.02));}};
  const feet=c=>{for(const [b,s] of [['FootL',-1],['FootR',1]])add(b,0,P(CYL6,c,s*0.12,0.1,0,0,0,0,0.05,0.14,0.05),P(SPH,c,s*0.12,0.035,0.05,0,0,0,0.13,0.06,0.19));};
  const blob=()=>add('Body',1,P(SPH,B,0,0.4,0,0,0,0,0.66,0.62,0.6)),head=(r=1)=>add('Head',1,P(SPH,B,0,0.8,0.02,0,0,0,0.62*r,0.58*r,0.58*r));
  switch(kind){
    case'bird':blob();head();// a little hooded bird in a red jacket
      add('Body',0,P(SPH,0xd8453a,0,0.34,0,0,0,0,0.7,0.42,0.64));
      add('Head',1,P(CONE6,B,0.02,1.1,-0.04,-0.4,0,0.3,0.1,0.18,0.08),P(CONE6,B,-0.05,1.08,-0.06,-0.5,0,-0.4,0.08,0.14,0.07));
      add('Head',0,P(CONE6,0xf2a23a,0,0.76,0.33,Math.PI/2,0,0,0.12,0.2,0.09));eyes(0.86,0.24,0.17,0.2,0.08);
      for(const [b,s] of [['WingL',-1],['WingR',1]])add(b,1,P(SPH,B,s*0.34,0.4,0,0,0,s*-0.35,0.12,0.3,0.22));feet(0xf2a23a);break;
    case'penguin':blob();head();// a round penguin, white-bellied, like the ones you dressed up online
      add('Body',0,P(SPH,0xfbf8f2,0,0.42,0.13,0,0,0,0.5,0.56,0.42));add('Head',0,P(SPH,0xfbf8f2,0,0.76,0.17,0,0,0,0.44,0.36,0.38));
      add('Head',0,P(CONE6,0xf2a23a,0,0.76,0.34,Math.PI/2,0,0,0.11,0.16,0.08));eyes(0.88,0.26,0.13,0.16,0.07);
      for(const [b,s] of [['WingL',-1],['WingR',1]])add(b,1,P(SPH,B,s*0.35,0.36,0,0,0,s*-0.25,0.1,0.36,0.2));feet(0xf2a23a);break;
    case'bunny':blob();head();// a soft bunny with long ears and a scarf
      for(const s of [-1,1])add('Head',1,P(SPH,B,s*0.12,1.2,-0.02,0,0,s*-0.12,0.13,0.44,0.09));
      for(const s of [-1,1])add('Head',0,P(SPH,0xf4b8c4,s*0.12,1.2,0.025,0,0,s*-0.12,0.07,0.32,0.03));
      add('Head',0,P(SPH,0xf08aa0,0,0.76,0.3,0,0,0,0.07,0.05,0.05));eyes(0.84,0.26,0,0,0.07,false);
      add('Body',0,P(CYL12,0x3ab8a8,0,0.6,0,0,0,0,0.52,0.07,0.5),P(SPH,0x3ab8a8,0.14,0.52,0.22,0.3,0.3,0,0.12,0.2,0.06));
      for(const [b,s] of [['WingL',-1],['WingR',1]])add(b,1,P(SPH,B,s*0.33,0.38,0.06,0,0,0,0.13,0.18,0.13));feet(0xf6f0ea);break;
    case'cat':blob();head();// a little black cat with big eyes
      for(const s of [-1,1])add('Head',1,P(CONE6,B,s*0.17,1.07,0,0,0,s*-0.25,0.17,0.2,0.1));
      add('Head',0,P(SPH,0xfbf8f2,0,0.73,0.24,0,0,0,0.22,0.13,0.12),P(SPH,0xf08aa0,0,0.77,0.3,0,0,0,0.05,0.035,0.04));eyes(0.86,0.22,0.17,0.2,0.09);
      add('Body',1,P(CYL6,B,0,0.32,-0.36,-0.9,0,0,0.06,0.3,0.06),P(SPH,B,0,0.46,-0.46,0,0,0,0.08,0.08,0.08));
      for(const [b,s] of [['WingL',-1],['WingR',1]])add(b,1,P(SPH,B,s*0.33,0.38,0.06,0,0,0,0.13,0.18,0.13));feet(0x2a2630);break;}
  return o;}
// the rig and its clips, built once per buddy: two skinned meshes (body colour, everything else) on one skeleton
function buddyRig(kind){const bones={},list=[];
  for(const [n,par,x,y,z] of BONES){const b=new T.Bone();b.name=n;const p=par?BONES.find(q=>q[0]===par):null;b.position.set(x-(p?p[2]:0),y-(p?p[3]:0),z-(p?p[4]:0));if(par)bones[par].add(b);bones[n]=b;list.push(b);}
  const scene=new T.Group(),parts=buddyParts(kind);scene.add(bones.Hips);scene.updateMatrixWorld(true);
  for(const body of [1,0]){const gs=[],idx=[];for(const name of Object.keys(bones)){const ps=parts.filter(q=>q[0]===name&&q[1]===body).map(q=>q[2]);if(!ps.length)continue;gs.push(merge(ps));idx.push(list.indexOf(bones[name]));}
    if(!gs.length)continue;const g=new T.BufferGeometry(),n=gs.reduce((t,q)=>t+q.attributes.position.count,0),si=new Uint16Array(n*4),sw=new Float32Array(n*4);let o=0;
    for(const a of ['position','normal','color']){const arr=new Float32Array(n*3);let k=0;for(const q of gs){arr.set(q.attributes[a].array,k);k+=q.attributes[a].array.length;}g.setAttribute(a,new T.BufferAttribute(arr,3));}
    gs.forEach((q,i)=>{for(let v=0;v<q.attributes.position.count;v++){si[(o+v)*4]=idx[i];sw[(o+v)*4]=1;}o+=q.attributes.position.count;});
    g.setAttribute('skinIndex',new T.BufferAttribute(si,4));g.setAttribute('skinWeight',new T.BufferAttribute(sw,4));g.computeBoundingSphere();
    const m=new T.SkinnedMesh(g,toon({vertexColors:true,skinning:true}));m.name=body?'BuddyBody':'BuddyBits';m.userData.skin=!!body;scene.add(m);m.bind(new T.Skeleton(list));}
  return{scene,clips:buddyClips(),speeds:[0.52,1.1]};}
// keyframed clips, sampled from little functions of the cycle's phase t (0..1). Walk and run swing the feet from the hip
// (a step of about 0.15 units at walk), bob the body twice a cycle, rock it side to side and flap the wings; idle breathes
let _buddyClips=null;
function buddyClips(){if(_buddyClips)return _buddyClips;const N=24,TAU=Math.PI*2,q=new T.Quaternion(),e=new T.Euler();
  const rot=(bone,dur,f)=>{const ts=[],vs=[];for(let i=0;i<=N;i++){const t=i/N;ts.push(t*dur);const [x,y,z]=f(t);q.setFromEuler(e.set(x,y,z));vs.push(q.x,q.y,q.z,q.w);}return new T.QuaternionKeyframeTrack(bone+'.quaternion',ts,vs);};
  const vec=(bone,prop,dur,f)=>{const ts=[],vs=[];for(let i=0;i<=N;i++){const t=i/N;ts.push(t*dur);vs.push(...f(t));}return new T.VectorKeyframeTrack(bone+'.'+prop,ts,vs);};
  const gait=(name,dur,amp,bob,lean,flap)=>new T.AnimationClip(name,dur,[
    rot('FootL',dur,t=>[Math.sin(t*TAU)*amp,0,0]),rot('FootR',dur,t=>[-Math.sin(t*TAU)*amp,0,0]),
    vec('Hips','position',dur,t=>[0,0.17+Math.abs(Math.sin(t*TAU))*bob,0]),
    rot('Body',dur,t=>[lean,Math.sin(t*TAU)*0.08,Math.sin(t*TAU)*0.09]),rot('Head',dur,t=>[-lean*0.5,0,-Math.sin(t*TAU)*0.06]),
    rot('WingL',dur,t=>[0,0,-(flap+Math.sin(t*TAU*2)*flap*0.6)]),rot('WingR',dur,t=>[0,0,flap+Math.sin(t*TAU*2)*flap*0.6])]);
  const idle=new T.AnimationClip('Idle',2.4,[vec('Body','scale',2.4,t=>[1-Math.sin(t*TAU)*0.012,1+Math.sin(t*TAU)*0.025,1-Math.sin(t*TAU)*0.012]),
    rot('Head',2.4,t=>[Math.sin(t*TAU)*0.04,Math.sin(t*TAU*0.5)*0.12,Math.sin(t*TAU*0.5+1)*0.07]),
    rot('WingL',2.4,t=>[0,0,-0.06-Math.sin(t*TAU)*0.05]),rot('WingR',2.4,t=>[0,0,0.06+Math.sin(t*TAU)*0.05]),
    rot('FootL',2.4,()=>[0,0,0]),rot('FootR',2.4,()=>[0,0,0]),vec('Hips','position',2.4,()=>[0,0.17,0])]);
  return _buddyClips=[idle,gait('Walk',0.56,0.6,0.035,0.05,0.22),gait('Run',0.38,0.95,0.06,0.2,0.55)];}
