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
  ['ArmL','Spine',-0.068,0.39,0],['ArmR','Spine',0.068,0.39,0],['LegL','Hips',-0.048,0.21,0],['LegR','Hips',0.048,0.21,0],['EyeL','Head',0,0,0],['EyeR','Head',0,0,0]];
const SPRIG_DRESS={labels:['skin','top','shoe'],own:{skin:0xf4ead8,top:0x8fae5a,shoe:0x8a5a3a}};
const SPRIG_HATS=[{name:'Straw',own:0xdcae62,band:0x8a5a34},{name:'Mushroom',own:0xd9524a,band:0xfff6ea},{name:'Wizard',own:0x6c62b8,band:0xf2c14e},{name:'Explorer',own:0xe4d2a2,band:0x6b4a32}];
const SPRIG_HAT_COLS=[0xdcae62,0xd9524a,0x6c62b8,0xe4d2a2,0x7caa5c,0x4f7fb8,0xe98aa0,0x5a4a44];
const sdE=(c,r)=>(x,y,z)=>{const px=(x-c.x)/r.x,py=(y-c.y)/r.y,pz=(z-c.z)/r.z,k0=Math.hypot(px,py,pz),k1=Math.hypot(px/r.x,py/r.y,pz/r.z);return k1?k0*(k0-1)/k1:-Math.min(r.x,r.y,r.z);};
const sdC=(a,b,r0,r1)=>(x,y,z)=>{const bx=b.x-a.x,by=b.y-a.y,bz=b.z-a.z,px=x-a.x,py=y-a.y,pz=z-a.z,t=clamp((px*bx+py*by+pz*bz)/(bx*bx+by*by+bz*bz),0,1);return Math.hypot(px-bx*t,py-by*t,pz-bz*t)-(r0+(r1-r0)*t);};
const sdRing=(y0,R,r)=>(x,y,z)=>Math.hypot(Math.hypot(x,z)-R,y-y0)-r;/* (a torus round the y axis) */
const sdMax=(a,b,k)=>-smin(-a,-b,k);
// a brim: a flat disc of radius R and even thickness, its rim rounded, its edge drooping by `droop` (a squashed
// ellipsoid would thin to nothing at the edge, and mesh raggedly there)
const sdBrim=(y0,R,t,droop=0,sz=1)=>(x,y,z)=>{const r=Math.hypot(x,z/sz),yy=y-(y0-droop*(Math.min(r,R)/R)**2);return Math.hypot(Math.max(r-R,0),yy)-t;};
function sprigParts(){const V=(x,y,z)=>new T.Vector3(x,y,z),ss=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
  // the smock: a bell from the shoulders to a ruffled hem
  const bell=(x,y,z)=>{const t=clamp((0.43-y)/0.23,0,1),r=0.066+0.094*Math.pow(t,1.3)+0.008*Math.sin(Math.atan2(x,z)*8)*ss(0.27,0.2,y);return sdMax(sdMax(Math.hypot(x,z/0.92)-r,y-0.43,0.03),0.2-y,0.025);};
  const P=[{d:sdE(V(0,0.6,0),V(0.2,0.19,0.19)),bone:'Head',k:0,col:'skin'},{d:bell,bone:'Spine',k:0.04,col:'top'}];
  for(const s of [-1,1]){const S=s<0?'L':'R';
    P.push({d:sdC(V(s*0.066,0.405,0),V(s*0.112,0.335,0.008),0.032,0.029),bone:'Arm'+S,k:0.025,col:'top'},{d:sdC(V(s*0.112,0.335,0.008),V(s*0.148,0.272,0.016),0.025,0.012),bone:'Arm'+S,k:0.015,col:'skin'},
      {d:sdC(V(s*0.048,0.22,0),V(s*0.048,0.07,0),0.03,0.028),bone:'Leg'+S,k:0.02,col:'skin'},{d:sdE(V(s*0.05,0.042,0.018),V(0.044,0.042,0.062)),bone:'Leg'+S,k:0.02,col:'shoe'});}
  return P;}
let _sprig=null;
function sprigRig(){if(!_sprig){const scene=dressRig({bones:SPRIG_BONES,parts:sprigParts(),dress:SPRIG_DRESS,lo:[-0.26,-0.02,-0.24],hi:[0.26,0.82,0.24],h:0.01,c:new T.Vector3(0,0.6,0),name:'Sprig',
    face:(hit,put,S)=>{const eyes={};
      // the whole face: two tall black eyes, set wide and a little low, each with a faint glint; a hint of blush
      for(const s of [-1,1]){const E=s<0?'EyeL':'EyeR',e=hit(s*0.31,-0.12,1);eyes[s]=e.p;put(S,0x1d1820,e.p.clone().addScaledVector(e.n,0.002),e.n,0.024,0.044,0.012,0,E);
        put(S,0xffffff,e.p.clone().addScaledVector(e.n,0.012).add(new T.Vector3(s*-0.006,0.018,0)),e.n,0.006,0.008,0.003,0,E);
        const b=hit(s*0.56,-0.36,0.78);put(S,0xf2b4ae,b.p.clone().addScaledVector(b.n,-0.003),b.n,0.03,0.016,0.01);}
      return eyes;}});
  _sprig={scene,clips:pipClips(SPRIG_BONES)};}
  const [idle,walk,run,spin,flip]=_sprig.clips;return{scene:T.SkeletonUtils.clone(_sprig.scene),clips:[idle,walk,run],emotes:{spin,flip},speeds:[0.55,3.2]};}
// the hats, each built once: a smooth shape painted in its colour (hair: the Hat tab), its accent (band) and, for the
// mushroom, its pale gills (gill)
const _sprigHats={},SPRIG_HAT_LABELS=['hair','band','gill'];
function sprigHatDress(st){const H=SPRIG_HATS[st];return{labels:SPRIG_HAT_LABELS,own:{hair:H.own,band:H.band,gill:0xf2e4cc},cols:{hair:SPRIG_HAT_COLS}};}
function sprigHat(st){if(_sprigHats[st])return _sprigHats[st];const V=(x,y,z)=>new T.Vector3(x,y,z),P=[];let k=0.03;
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
  else{/* the pith helmet: a high dome over a short all-round brim, a band and a button on top */
    const dome=sdE(V(0,0.74,0),V(0.232,0.19,0.25));P.push({d:(x,y,z)=>sdMax(dome(x,y,z),0.72-y,0.02),col:'hair'},{d:(x,y,z)=>sdBrim(0.722,0.29,0.015,0.015,1.08)(x,y,z-0.012),col:'hair'},
      {d:sdRing(0.758,0.226,0.02),col:'band'},{d:sdE(V(0,0.928,0),V(0.024,0.016,0.024)),col:'band'});k=0.02;}
  const f=(x,y,z)=>{let d=1e9;for(const p of P)d=smin(d,p.d(x,y,z),k);return d;};
  return _sprigHats[st]=dressWeights(mochiSurface(f,[-0.42,0.6,-0.42],[0.42,1.12,0.42],0.01),P,SPRIG_HAT_LABELS);}
