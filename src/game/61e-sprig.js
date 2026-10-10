/* =========================================================
   Sprig: a little gardener-explorer under a big hat, sculpted and rigged in code
   ========================================================= */
// A tiny storybook creature: a pale round head whose whole face is two tall black eyes (with faint blush), a bell of
// a smock with a ruffled hem, little tapering arms, short legs in boots, and a hat that's most of the silhouette. Built
// like Pip (dressRig, 61d): one smooth body painted per look (skin, smock, boots), Pip's clips on the same bones, and
// the hat its own mesh on the head bone (headMesh, 61b), one of four (SPRIG_HATS): a gardener's straw hat, a spotted
// mushroom cap, a floppy wizard's hat, an explorer's pith helmet. Each hat has its colour (the Hat tab) and a fixed
// accent (its band, or the mushroom's spots), and the mushroom a pale underside.
const SPRIG_BONES=[['Hips',null,0,0.2,0],['Spine','Hips',0,0.3,0],['Head','Spine',0,0.44,0],
  ['ArmL','Spine',-0.068,0.39,0],['ArmR','Spine',0.068,0.39,0],['LegL','Hips',-0.048,0.21,0],['LegR','Hips',0.048,0.21,0],['EyeL','Head',0,0,0],['EyeR','Head',0,0,0],['Hat','Head',0,0.74,0]];/* (the hat rides its own bone, so it can lag, bounce and hop) */
const SPRIG_DRESS={labels:['skin','top','shoe','trim'],own:{skin:0xf4ead8,top:0x8fae5a,shoe:0x8a5a3a,trim:0xf6efdc},
  cols:{trim:[0xf6efdc,0xf2c14e,0xe98aa0,0x8fc0e8,0xc8e0a0,0xd9524a,0x6c62b8,0x5a4a44],top:[0x8fae5a,0xe98aa0,0x74a9de,0xf2c14e,0xbfa3e3,0xe4683f,0x3f5a85,0xf2ede4,0x5a8a6a,0xc89a62]}};
const SPRIG_HATS=[{name:'Straw',own:0xdcae62,band:0x8a5a34},{name:'Mushroom',own:0xd9524a,band:0xfff6ea},{name:'Wizard',own:0x6c62b8,band:0xf2c14e},{name:'Explorer',own:0xe4d2a2,band:0x6b4a32},
  {name:'Sprout',own:0x7cbc5a,band:0x5a8a3a},{name:'Acorn',own:0x8a5a34,band:0xc89a62},{name:'Leaf',own:0x6aa84a,band:0x4a7a34},{name:'Beanie',own:0xe07a5a,band:0xc85a44,gill:0xfff6ea},
  {name:'Frog',own:0x7cc05a,band:0x2a2230,gill:0xfffdf6},{name:'Flowers',own:0xf28ab0,band:0xf6d04a,gill:0x6aa84a}];
const SPRIG_HAT_COLS=[0xdcae62,0xd9524a,0x6c62b8,0xe4d2a2,0x7caa5c,0x4f7fb8,0xe98aa0,0x5a4a44,0xf6efdc,0x8a5a34];
const SPRIG_OUTFITS=['Smock','Overalls','Cloak'],SPRIG_EYES=['Beans','Sparkly','Sleepy','Dots','Lashes'],SPRIG_MOUTHS=['None','Smile','Oh','Cat'];
// extras: worn on the body (Spine) or head, in a colour of yours (acc) with a fixed accent (abit)
const SPRIG_ACC=[{name:'None'},{name:'Satchel',bone:'Spine',own:0xa8743a,bit:0xe8c070},{name:'Scarf',bone:'Spine',own:0xd9524a,bit:0xf6efdc},{name:'Backpack',bone:'Spine',own:0x5a8ac0,bit:0xf2c14e},{name:'Flower',bone:'Head',own:0xf6a0c0,bit:0xf6d04a}];
const SPRIG_ACC_COLS=[0xa8743a,0xd9524a,0x5a8ac0,0xf2c14e,0x7caa5c,0xe98aa0,0x6c62b8,0xf6efdc];
const sdE=(c,r)=>(x,y,z)=>{const px=(x-c.x)/r.x,py=(y-c.y)/r.y,pz=(z-c.z)/r.z,k0=Math.hypot(px,py,pz),k1=Math.hypot(px/r.x,py/r.y,pz/r.z);return k1?k0*(k0-1)/k1:-Math.min(r.x,r.y,r.z);};
const sdC=(a,b,r0,r1)=>(x,y,z)=>{const bx=b.x-a.x,by=b.y-a.y,bz=b.z-a.z,px=x-a.x,py=y-a.y,pz=z-a.z,t=clamp((px*bx+py*by+pz*bz)/(bx*bx+by*by+bz*bz),0,1);return Math.hypot(px-bx*t,py-by*t,pz-bz*t)-(r0+(r1-r0)*t);};
const sdRing=(y0,R,r)=>(x,y,z)=>Math.hypot(Math.hypot(x,z)-R,y-y0)-r;/* (a torus round the y axis) */
const sdMax=(a,b,k)=>-smin(-a,-b,k);
// a brim: a flat disc of radius R and even thickness, its rim rounded, its edge drooping by `droop` (a squashed
// ellipsoid would thin to nothing at the edge, and mesh raggedly there)
const sdBrim=(y0,R,t,droop=0,sz=1)=>(x,y,z)=>{const r=Math.hypot(x,z/sz),yy=y-(y0-droop*(Math.min(r,R)/R)**2);return Math.hypot(Math.max(r-R,0),yy)-t;};
function sprigParts(outfit=0){const V=(x,y,z)=>new T.Vector3(x,y,z),ss=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
  // the smock: a bell from the shoulders to a ruffled hem
  const bell=(x,y,z)=>{const t=clamp((0.43-y)/0.23,0,1),r=0.066+0.094*Math.pow(t,1.3)+0.008*Math.sin(Math.atan2(x,z)*8)*ss(0.27,0.2,y);return sdMax(sdMax(Math.hypot(x,z/0.92)-r,y-0.43,0.03),0.2-y,0.025);};
  const ringAt=(cx,cz,y0,R,r)=>(x,y,z)=>Math.hypot(Math.hypot(x-cx,z-cz)-R,y-y0)-r;
  const P=[{d:sdE(V(0,0.6,0),V(0.2,0.19,0.19)),bone:'Head',k:0,col:'skin'}];
  // a petal collar round the neck (trim), on every outfit
  for(let i=0;i<7;i++){const a=i/7*6.283;P.push({d:sdE(V(Math.sin(a)*0.064,0.425,Math.cos(a)*0.06),V(0.038,0.014,0.038)),bone:'Spine',k:0.008,col:'trim'});}
  if(outfit===1){// overalls: a shirt in the trim colour, a bib and short legs in the outfit colour, two straps and buttons
    P.push({d:sdC(V(0,0.43,0),V(0,0.27,0),0.07,0.088),bone:'Spine',k:0.03,col:'trim'},{d:sdE(V(0,0.33,0.052),V(0.062,0.07,0.04)),bone:'Spine',k:0.02,col:'top'},
      {d:sdC(V(0,0.28,0),V(0,0.21,0),0.094,0.1),bone:'Hips',k:0.02,col:'top'});
    for(const s of [-1,1])P.push({d:sdC(V(s*0.048,0.4,0.06),V(s*0.05,0.43,-0.02),0.011,0.011),bone:'Spine',k:0.006,col:'top'},{d:sdE(V(s*0.035,0.38,0.088),V(0.011,0.011,0.006)),bone:'Spine',k:0.004,col:'shoe'},
      {d:sdC(V(s*0.05,0.22,0),V(s*0.05,0.15,0),0.046,0.042),bone:'Leg'+(s<0?'L':'R'),k:0.02,col:'top'});}
  else{P.push({d:bell,bone:'Spine',k:0.04,col:'top'},{d:sdE(V(0.045,0.29,0.118),V(0.034,0.03,0.012)),bone:'Spine',k:0.006,col:'trim'},/* a pocket */
      {d:(x,y,z)=>{const t=clamp((0.43-0.212)/0.23,0,1),R=0.066+0.094*Math.pow(t,1.3);return Math.hypot(Math.hypot(x,z/0.92)-R,y-0.212)-0.011;},bone:'Spine',k:0.01,col:'trim'});/* a band round the hem */
    if(outfit===2)P.push({d:(x,y,z)=>sdMax(sdE(V(0,0.33,-0.05),V(0.17,0.16,0.11))(x,y,z),-0.02-z,0.02),bone:'Spine',k:0.02,col:'trim'},/* a cloak down the back */
      {d:sdE(V(0,0.47,-0.1),V(0.15,0.075,0.075)),bone:'Spine',k:0.03,col:'trim'});}/* its hood, folded down */
  for(const s of [-1,1]){const S=s<0?'L':'R';
    P.push({d:sdC(V(s*0.066,0.405,0),V(s*0.112,0.335,0.008),0.032,0.029),bone:'Arm'+S,k:0.025,col:outfit===1?'trim':'top'},{d:sdC(V(s*0.112,0.335,0.008),V(s*0.146,0.276,0.016),0.025,0.016),bone:'Arm'+S,k:0.015,col:'skin'},{d:sdE(V(s*0.152,0.262,0.018),V(0.024,0.024,0.024)),bone:'Arm'+S,k:0.012,col:'skin'},/* round little mitten hands */
      {d:sdC(V(s*0.048,0.22,0),V(s*0.048,0.07,0),0.03,0.028),bone:'Leg'+S,k:0.02,col:'skin'},{d:sdE(V(s*0.05,0.044,0.022),V(0.05,0.046,0.07)),bone:'Leg'+S,k:0.02,col:'shoe'},
      {d:ringAt(s*0.048,0.004,0.085,0.03,0.011),bone:'Leg'+S,k:0.01,col:'shoe'});}/* boot cuffs */
  return P;}
// the faces: the base (blush, and where the eyes go) and the alternatives, each its own mesh (sdfRig o.faces)
const sprigEye=(hit,s)=>hit(s*0.31,-0.12,1);
const SPRIG_FACES={
  e0:(hit,put,S)=>{for(const s of [-1,1]){const E=s<0?'EyeL':'EyeR',e=sprigEye(hit,s);put(S,0x1d1820,e.p.clone().addScaledVector(e.n,0.002),e.n,0.024,0.044,0.012,0,E);
    put(S,0xffffff,e.p.clone().addScaledVector(e.n,0.012).add(new T.Vector3(s*-0.006,0.018,0)),e.n,0.006,0.008,0.003,0,E);}},
  e1:(hit,put,S)=>{for(const s of [-1,1]){const E=s<0?'EyeL':'EyeR',e=sprigEye(hit,s),o=(dz,dx,dy)=>e.p.clone().addScaledVector(e.n,dz).add(new T.Vector3(dx,dy,0));
    put(S,0x1d1820,o(0.002,0,0),e.n,0.034,0.042,0.012,0,E);put(S,0x5a3a8a,o(0.008,0,-0.016),e.n,0.026,0.018,0.006,0,E);
    put(S,0xffffff,o(0.016,s*-0.01,0.014),e.n,0.012,0.013,0.004,0,E);put(S,0xffffff,o(0.016,s*0.009,-0.01),e.n,0.006,0.006,0.003,0,E);}},
  e2:(hit,put,S)=>{const arc=new T.TorusGeometry(0.026,0.0055,6,16,Math.PI);for(const s of [-1,1]){const E=s<0?'EyeL':'EyeR',e=sprigEye(hit,s);put(arc,0x1d1820,e.p.clone().addScaledVector(e.n,0.004).add(new T.Vector3(0,-0.01,0)),e.n,1,1.1,1,0,E);}},
  e3:(hit,put,S)=>{for(const s of [-1,1]){const E=s<0?'EyeL':'EyeR',e=sprigEye(hit,s);put(S,0x1d1820,e.p.clone().addScaledVector(e.n,0.002),e.n,0.017,0.019,0.008,0,E);
    put(S,0xffffff,e.p.clone().addScaledVector(e.n,0.009).add(new T.Vector3(s*-0.005,0.006,0)),e.n,0.005,0.005,0.003,0,E);}},
  e4:(hit,put,S)=>{SPRIG_FACES.e0(hit,put,S);const lash=new T.TorusGeometry(0.03,0.0045,6,16,Math.PI*0.75);
    for(const s of [-1,1]){const E=s<0?'EyeL':'EyeR',e=sprigEye(hit,s);put(lash,0x1d1820,e.p.clone().addScaledVector(e.n,0.004).add(new T.Vector3(0,0.012,0)),e.n,1,1.15,1,s<0?0.62:0.15,E);}},
  m1:(hit,put,S)=>{const m=hit(0,-0.42,1);put(new T.TorusGeometry(0.016,0.0045,6,16,Math.PI),0x6a3236,m.p.clone().addScaledVector(m.n,0.003).add(new T.Vector3(0,0.008,0)),m.n,1,1,1,Math.PI);},
  m2:(hit,put,S)=>{const m=hit(0,-0.44,1);put(S,0x5a2a30,m.p.clone().addScaledVector(m.n,0.001),m.n,0.012,0.015,0.006);},
  m3:(hit,put,S)=>{const m=hit(0,-0.42,1),arc=new T.TorusGeometry(0.009,0.0035,6,12,Math.PI);for(const s of [-1,1])put(arc,0x6a3236,m.p.clone().addScaledVector(m.n,0.003).add(new T.Vector3(s*0.009,0.006,0)),m.n,1,1,1,Math.PI);}};
const _sprigBody={};let _sprigClips=null;
/* two meshes of every Sprig shape: fine (a 1 cm grid) for the wardrobe's close-up, and coarser for everywhere else, where
   Sprig is a few dozen pixels tall: the body and hat at about a third of the triangles. The surface's normals come from the
   shape itself, so the shading stays just as smooth; only the outline is a little less round, which no one can see at that size */
const SPRIG_H={body:[0.02,0.01],hat:[0.017,0.01]};
function sprigScene(outfit=0,fine=false){const key=outfit+(fine?'f':'');if(_sprigBody[key])return _sprigBody[key];
  return _sprigBody[key]=dressRig({bones:SPRIG_BONES,parts:sprigParts(outfit),dress:SPRIG_DRESS,lo:[-0.26,-0.02,-0.26],hi:[0.26,0.82,0.24],h:SPRIG_H.body[fine?1:0],c:new T.Vector3(0,0.6,0),name:'Sprig',
    face:(hit,put,S)=>{const eyes={};// where the eyes sit (their bones) and a hint of blush; the eyes and mouth themselves are SPRIG_FACES
      for(const s of [-1,1]){eyes[s]=sprigEye(hit,s).p;const b=hit(s*0.56,-0.36,0.78);put(S,0xf2b4ae,b.p.clone().addScaledVector(b.n,-0.003),b.n,0.03,0.016,0.01);}
      return eyes;},faces:SPRIG_FACES});}
// the hat's own motion on top of Pip's clips: it lags the head and sways in the idle, bobs and tilts a beat behind each
// step, and in a twirl or a cheer it pops up off the head and drops back on
function sprigHatTracks(clips){const {rest,R,V3}=rigKit(SPRIG_BONES),H0=rest('Hat');
  for(const c of clips){const d=c.duration,n=c.name;let rot,pos;
    if(n==='Idle'){rot=a=>[Math.sin(a+1.2)*0.035,0,Math.sin(a+1.7)*0.05];pos=()=>H0;}
    else if(n==='Walk'){rot=a=>[-0.07*Math.cos(2*a+0.9),0,Math.sin(a-0.7)*0.12];pos=a=>[H0[0],H0[1]+0.012*Math.max(0,Math.sin(2*a-0.9)),H0[2]];}
    else if(n==='Run'){rot=a=>[-0.16-0.08*Math.cos(2*a+0.9),0,Math.sin(a-0.7)*0.16];pos=a=>[H0[0],H0[1]+0.02*Math.max(0,Math.sin(2*a-0.9)),H0[2]];}
    else{const pop=t=>Math.max(0,Math.sin(Math.PI*clamp((t-0.25)/0.55,0,1)));rot=(a,t)=>[-0.3*pop(t),Math.sin(t*Math.PI*2)*0.6*pop(t),0];pos=(a,t)=>[H0[0],H0[1]+0.14*pop(t),H0[2]];}
    c.tracks.push(R('Hat',d,rot),V3('Hat','position',d,pos));}
  return clips;}
function sprigRig(){if(!_sprigClips)_sprigClips=sprigHatTracks(pipClips(SPRIG_BONES));
  const [idle,walk,run,spin,flip]=_sprigClips;return{scene:T.SkeletonUtils.clone(sprigScene(0)),clips:[idle,walk,run],emotes:{spin,flip},speeds:[0.55,3.2]};}
// dressing a Sprig: its outfit's body (charModel picks it), its eyes and mouth shown, its hat and any extra
function sprigDress(m,look,fine=false){const ey='SprigFace_e'+(look.eyes|0),mo='SprigFace_m'+(look.mouth|0);
  m.traverse(o=>{if(o.isMesh&&o.name.startsWith('SprigFace_'))o.visible=o.name===ey||o.name===mo;});
  const st=look.style|0;headMesh(m,dressGeo(sprigHat(st,fine),look,sprigHatDress(st)),null,'Hat');
  const x=look.extra|0;if(x>0&&SPRIG_ACC[x])headMesh(m,dressGeo(sprigAcc(x),look,sprigAccDress(x)),null,SPRIG_ACC[x].bone);}
// the hats, each built once: a smooth shape painted in its colour (hair: the Hat tab), its accent (band) and a third
// (gill: the mushroom's gills, a pompom, frog eyes, a vine)
const _sprigHats={},SPRIG_HAT_LABELS=['hair','band','gill'];
function sprigHatDress(st){const H=SPRIG_HATS[st];return{labels:SPRIG_HAT_LABELS,own:{hair:H.own,band:H.band,gill:H.gill||0xf2e4cc},cols:{hair:SPRIG_HAT_COLS}};}
// a shape turned about the z axis (round a centre), for leaves at an angle
const sdRotZ=(f,a,c)=>{const ca=Math.cos(a),sa=Math.sin(a);return(x,y,z)=>{const dx=x-c.x,dy=y-c.y;return f(c.x+dx*ca+dy*sa,c.y-dx*sa+dy*ca,z);};};
function sprigHat(st,fine=false){const key=st+(fine?'f':'');if(_sprigHats[key])return _sprigHats[key];const V=(x,y,z)=>new T.Vector3(x,y,z),P=[];let k=0.03;
  if(st===0){/* the straw hat: a wide brim drooping at its edge, a tall crown leaning back to a soft point, a band */
    P.push({d:sdBrim(0.735,0.35,0.016,0.05),col:'hair'},
      {d:sdC(V(0,0.73,0),V(0,0.9,-0.025),0.168,0.105),col:'hair'},{d:sdC(V(0,0.9,-0.025),V(0.01,1.04,-0.1),0.105,0.014),col:'hair'},{d:sdRing(0.775,0.158,0.024),col:'band'});}
  else if(st===1){/* the mushroom: a broad dome with white spots, its rim curling under onto pale gills */
    const cap=sdE(V(0,0.78,0),V(0.36,0.21,0.36));P.push({d:(x,y,z)=>{const r=Math.hypot(x,z);return sdMax(cap(x,y,z),(0.735-0.07*(r/0.36)**2)-y,0.03);},col:'hair'},{d:sdE(V(0,0.722,0),V(0.31,0.03,0.31)),col:'gill'});
    for(const [az,el,r] of [[20,62,0.05],[-60,38,0.04],[95,30,0.042],[160,52,0.045],[-140,30,0.038],[-15,22,0.032],[55,24,0.03],[220,70,0.036]]){const a=az*Math.PI/180,e=el*Math.PI/180,p=V(Math.sin(a)*Math.cos(e)*0.36,0.78+Math.sin(e)*0.21,Math.cos(a)*Math.cos(e)*0.36);
      p.sub(V(0,0.78,0)).multiplyScalar(0.94).add(V(0,0.78,0));P.push({d:sdE(p,V(r,r*0.8,r)),col:'band'});}k=0.015;}
  else if(st===2){/* the wizard's hat: a small brim and a tall floppy cone that bends over at the tip, a gold band */
    P.push({d:sdBrim(0.735,0.25,0.015,0.02),col:'hair'},{d:sdC(V(0,0.73,0),V(0.015,0.92,-0.02),0.158,0.1),col:'hair'},{d:sdC(V(0.015,0.92,-0.02),V(0.08,1.06,-0.05),0.1,0.055),col:'hair'},
      {d:sdC(V(0.08,1.06,-0.05),V(0.2,1.05,-0.08),0.055,0.02),col:'hair'},{d:sdC(V(0.2,1.05,-0.08),V(0.25,0.99,-0.09),0.02,0.008),col:'hair'},{d:sdRing(0.77,0.15,0.022),col:'band'});k=0.04;}
  else if(st===4){/* a sprout: no hat, just a little two-leaf seedling growing from the top of the head */
    P.push({d:sdC(V(0,0.77,0),V(0.008,0.875,0),0.013,0.01),col:'band'},{d:sdRotZ(sdE(V(-0.062,0.885,0),V(0.062,0.017,0.034)),-0.45,V(0,0.875,0)),col:'hair'},{d:sdRotZ(sdE(V(0.07,0.89,0),V(0.07,0.018,0.036)),0.5,V(0,0.875,0)),col:'hair'});k=0.012;}
  else if(st===5){/* an acorn cap: a dome with a scaly rim and a stalk */
    const dome=sdE(V(0,0.765,0),V(0.226,0.15,0.226));P.push({d:(x,y,z)=>sdMax(dome(x,y,z),0.725-y,0.02),col:'hair'},{d:sdRing(0.735,0.205,0.03),col:'band'},{d:sdC(V(0,0.9,0),V(0.025,0.965,0.01),0.024,0.016),col:'hair'});
    for(let i=0;i<12;i++){const a=i/12*6.283;P.push({d:sdE(V(Math.sin(a)*0.16,0.82,Math.cos(a)*0.16),V(0.03,0.018,0.03)),col:'band'});}k=0.012;}
  else if(st===6){/* a big leaf draped over the head, its tip drooping at the back, its stalk curling up at the front */
    P.push({d:(x,y,z)=>sdBrim(0.8,0.23,0.022,0.15,1.35)(x,y,z+0.02),col:'hair'},{d:sdC(V(0,0.795,0.27),V(0.035,0.83,0.33),0.013,0.009),col:'band'});k=0.012;}
  else if(st===7){/* a knitted beanie: a snug dome, a turned-up cuff and a pompom */
    const dome=sdE(V(0,0.725,0),V(0.218,0.21,0.218));P.push({d:(x,y,z)=>sdMax(dome(x,y,z),0.67-y,0.02),col:'hair'},{d:sdRing(0.69,0.207,0.034),col:'band'},{d:sdE(V(0,0.95,0),V(0.062,0.06,0.062)),col:'gill'});k=0.015;}
  else if(st===8){/* a frog hat: a green dome with two big froggy eyes on top */
    const dome=sdE(V(0,0.73,0),V(0.222,0.2,0.222));P.push({d:(x,y,z)=>sdMax(dome(x,y,z),0.68-y,0.02),col:'hair'});
    for(const s of [-1,1])P.push({d:sdE(V(s*0.095,0.9,0.06),V(0.062,0.058,0.058)),col:'hair'},{d:sdE(V(s*0.098,0.905,0.098),V(0.045,0.045,0.03)),col:'gill'},{d:sdE(V(s*0.098,0.905,0.124),V(0.022,0.026,0.012)),col:'band'});k=0.012;}
  else if(st===9){/* a flower crown: a vine round the head and seven blooms on it */
    P.push({d:sdRing(0.722,0.158,0.012),col:'gill'});
    for(let i=0;i<7;i++){const a=i/7*6.283+0.2,cx=Math.sin(a)*0.165,cz=Math.cos(a)*0.165;
      for(let j=0;j<5;j++){const b=j/5*6.283;P.push({d:sdE(V(cx+Math.sin(a)*0.012+Math.cos(b)*0.022*Math.cos(a),0.742+Math.sin(b)*0.022,cz+Math.cos(a)*0.012-Math.cos(b)*0.022*Math.sin(a)),V(0.016,0.016,0.016)),col:'hair'});}
      P.push({d:sdE(V(cx*1.08,0.742,cz*1.08),V(0.013,0.013,0.013)),col:'band'});}k=0.008;}
  else{/* the pith helmet: a high dome over a short all-round brim, a band and a button on top */
    const dome=sdE(V(0,0.74,0),V(0.232,0.19,0.25));P.push({d:(x,y,z)=>sdMax(dome(x,y,z),0.72-y,0.02),col:'hair'},{d:(x,y,z)=>sdBrim(0.722,0.29,0.015,0.015,1.08)(x,y,z-0.012),col:'hair'},
      {d:sdRing(0.758,0.226,0.02),col:'band'},{d:sdE(V(0,0.928,0),V(0.024,0.016,0.024)),col:'band'});k=0.02;}
  const f=(x,y,z)=>{let d=1e9;for(const p of P)d=smin(d,p.d(x,y,z),k);return d;};
  return _sprigHats[key]=dressWeights(mochiSurface(f,[-0.42,0.6,-0.42],[0.42,1.12,0.42],SPRIG_H.hat[fine?1:0]),P,SPRIG_HAT_LABELS);}

// the extras, each built once: a smooth shape in your colour (acc) with a fixed accent (abit)
const _sprigAcc={},SPRIG_ACC_LABELS=['acc','abit'];
function sprigAccDress(x){const A=SPRIG_ACC[x];return{labels:SPRIG_ACC_LABELS,own:{acc:A.own,abit:A.bit},cols:{acc:SPRIG_ACC_COLS}};}
function sprigAcc(x){if(_sprigAcc[x])return _sprigAcc[x];const V=(x,y,z)=>new T.Vector3(x,y,z),P=[];let lo=[-0.26,0.12,-0.26],hi=[0.26,0.52,0.26],k=0.01;
  if(x===1){/* a satchel: a strap over the left shoulder and across, a bag at the right hip with a flap and a button */
    P.push({d:sdC(V(-0.05,0.435,0.045),V(0.15,0.27,0.105),0.011,0.011),col:'abit'},{d:sdC(V(-0.05,0.435,-0.045),V(0.15,0.27,-0.075),0.011,0.011),col:'abit'},{d:sdC(V(-0.05,0.435,0.045),V(-0.05,0.435,-0.045),0.011,0.011),col:'abit'},
      {d:sdE(V(0.175,0.245,0.015),V(0.034,0.056,0.07)),col:'acc'},{d:sdE(V(0.188,0.268,0.015),V(0.028,0.032,0.072)),col:'acc'},{d:sdE(V(0.214,0.255,0.015),V(0.006,0.012,0.012)),col:'abit'});}
  else if(x===2){/* a scarf: wrapped round the neck, one end hanging down the front */
    P.push({d:sdRing(0.445,0.07,0.026),col:'acc'},{d:sdC(V(0.04,0.43,0.075),V(0.065,0.31,0.115),0.024,0.02),col:'acc'},{d:(x,y,z)=>Math.hypot(Math.hypot(x-0.063,z-0.112)-0.02,y-0.33)-0.008,col:'abit'});}
  else if(x===3){/* a backpack: a rounded pack with a flap and a pocket, and two straps over the shoulders */
    P.push({d:sdE(V(0,0.325,-0.14),V(0.09,0.095,0.05)),col:'acc'},{d:sdE(V(0,0.385,-0.15),V(0.088,0.035,0.052)),col:'abit'},{d:sdE(V(0,0.29,-0.18),V(0.05,0.035,0.02)),col:'acc'});
    for(const s of [-1,1])P.push({d:sdC(V(s*0.045,0.43,-0.07),V(s*0.05,0.44,0.0),0.011,0.011),col:'abit'},{d:sdC(V(s*0.05,0.44,0.0),V(s*0.06,0.31,0.1),0.011,0.011),col:'abit'});}
  else if(x===4){/* a flower tucked over the ear */
    lo=[-0.3,0.6,-0.1];hi=[-0.1,0.8,0.15];const c=V(-0.19,0.69,0.03);
    for(let j=0;j<5;j++){const b=j/5*6.283;P.push({d:sdE(V(c.x,c.y+Math.sin(b)*0.026,c.z+Math.cos(b)*0.026),V(0.014,0.019,0.019)),col:'acc'});}
    P.push({d:sdE(V(c.x-0.01,c.y,c.z),V(0.014,0.014,0.014)),col:'abit'});k=0.006;}
  const f=(x,y,z)=>{let d=1e9;for(const p of P)d=smin(d,p.d(x,y,z),k);return d;};
  return _sprigAcc[x]=dressWeights(mochiSurface(f,lo,hi,0.008),P,SPRIG_ACC_LABELS);}
// Sprig is everyone's first character now: an old save still in the original default (the white bunny, never
// changed) becomes a Sprig, with the bunny kept for "Be an animal"
if(S&&S.look&&S.look.sp==='bunny'&&S.look.fur===0xf6f3ee&&S.look.shirt===0xd8453a&&!S.look.h&&!S.look.sprig){S.look.prev='bunny';S.look.sp='human';S.look.h={c:'sprig',skin:-1,style:0};S.look.sprig=1;}
