/* =========================================================
   Renderer, camera, post-process (pixelate + outline + dither)
   ========================================================= */
const canvas=$('c');
const renderer=new T.WebGLRenderer({canvas,antialias:false,powerPreference:'high-performance'});
renderer.setPixelRatio(1);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap; // soft-edged little shadows
const scene=new T.Scene();const skyHz=new T.Color(0xbfe0ff),skyZen=new T.Color(0x3c8ce8),skyGlow=new T.Color(0xffffff);let skyGA=0;
scene.fog=new T.Fog(0xbfe0ff,40,150);
const NEAR=1.5,FAR=640;
const camera=new T.PerspectiveCamera(2*Math.atan(Math.tan(18*Math.PI/180)/LENS)*180/Math.PI,1,NEAR,FAR);
const camD=()=>cam.dist*LENS; // how far the camera really is from what it looks at (cam.dist is the zoom)
let W=1,H=1,PX=2,rt=null;
const post={scene:new T.Scene(),cam:new T.OrthographicCamera(-1,1,1,-1,0,1)};
const postMat=new T.ShaderMaterial({
  uniforms:{tC:{value:null},tD:{value:null},res:{value:new T.Vector2(1,1)},levels:{value:22},cn:{value:NEAR},cf:{value:FAR},gw:{value:1}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader:`
    uniform sampler2D tC;uniform sampler2D tD;uniform vec2 res;uniform float levels;uniform float cn;uniform float cf;uniform float gw;varying vec2 vUv;
    float b2(vec2 a){a=floor(a);return fract(a.x*.5+a.y*a.y*.75);}
    float bayer(vec2 a){return b2(.5*a)*.25+b2(a);}
    float lin(vec2 uv){float d=texture2D(tD,uv).r*2.-1.;return 2.*cn*cf/(cf+cn-d*(cf-cn));}
    void main(){
      vec3 c=texture2D(tC,vUv).rgb;
      float d=lin(vUv);
      vec2 px=1./res;
      float fz=cf*.45;/* neighbours out in the sky don't count: no outline along the horizon */
      float n1=lin(vUv+vec2(px.x,0.)),n2=lin(vUv-vec2(px.x,0.)),n3=lin(vUv+vec2(0.,px.y)),n4=lin(vUv-vec2(0.,px.y));
      float dn=max(max(n1>fz?d:n1,n2>fz?d:n2),max(n3>fz?d:n3,n4>fz?d:n4));
      float e=step(max(.35,d*.018),dn-d)*step(d,cf*.6);
      c=mix(c,c*vec3(.36,.32,.46),e*.9*(1.-smoothstep(140.,260.,d))); // outlines fade out on the far islands
      // lighting: bright things (sand, foam, sunlit leaves, clouds) bloom softly into their neighbours
      vec3 gl=vec3(0.);for(int i=0;i<4;i++){vec2 o=vec2(i<2?-2.:2.,mod(float(i),2.)<1.?-2.:2.)*px;gl+=max(texture2D(tC,vUv+o).rgb-.8,0.);}
      c+=gl*vec3(.09,.08,.06)*gw; // just a whisper of glow off the sand and surf
      // a sunny grade: a touch more colour, warm highlights, cool shadows, and a warm haze out towards the horizon
      float l=dot(c,vec3(.299,.587,.114));c=mix(vec3(l),c,1.+.04*gw);c=mix(c,(c-.5)*1.08+.48,gw); // a little more contrast
      c*=mix(vec3(1.),mix(vec3(.96,.98,1.05),vec3(1.04,1.,.95),smoothstep(.25,.85,l)),gw);
      c=mix(c,c*vec3(1.04,1.,.95)+vec3(.03,.02,.0),smoothstep(110.,300.,d)*step(d,cf*.6)*.45*gw);
      vec2 vg=vUv-.5;c*=1.-dot(vg,vg)*.14;
      float b=bayer(gl_FragCoord.xy)-.5;
      c=floor(c*levels+b+.5)/levels;
      gl_FragColor=vec4(c,1.);
    }`,
  depthTest:false,depthWrite:false
});
post.scene.add(new T.Mesh(new T.PlaneGeometry(2,2),postMat));
const skyMat=new T.ShaderMaterial({depthTest:false,depthWrite:false,
  uniforms:{zen:{value:new T.Color()},hz:{value:new T.Color()},glowC:{value:new T.Color()},hy:{value:0.6},ga:{value:0},sunP:{value:new T.Vector2(0.5,0.7)},aspect:{value:0.5},disc:{value:0},night:{value:0}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader:`uniform vec3 zen;uniform vec3 hz;uniform vec3 glowC;uniform float hy;uniform float ga;uniform vec2 sunP;uniform float aspect;uniform float disc;uniform float night;varying vec2 vUv;
    void main(){
      float t=clamp((vUv.y-hy)/max(.001,1.-hy),0.,1.);
      vec3 c=mix(hz,zen,pow(t,.65));
      c=mix(c,glowC,ga*.6*exp(-t*5.));                           // warm band hugging the horizon
      vec2 d=(vUv-sunP)*vec2(aspect,1.);float r=length(d);
      c+=glowC*ga*(.55*exp(-r*r*40.)+.25*exp(-r*r*6.));          // soft halo around the sun or moon
      c=mix(c,mix(vec3(1.,.93,.75),vec3(1.,.97,.9),night),disc*smoothstep(.045,.038,r)); // low sun disc
      gl_FragColor=vec4(c,1.);}`});
const skyScene=new T.Scene();skyScene.add(new T.Mesh(new T.PlaneGeometry(2,2),skyMat));
const _sp=new T.Vector3();
function updateSkyDome(){const u=skyMat.uniforms;u.zen.value.copy(skyZen);u.hz.value.copy(skyHz);u.glowC.value.copy(skyGlow);u.ga.value=skyGA;u.aspect.value=camera.aspect;u.night.value=nightF;
  const fwd=cam.yaw+Math.PI;skyPos(fwd,0,150,_sp,false).project(camera);u.hy.value=clamp((_sp.y+1)/2,0,1);
  // the sun rides low along the horizon at dawn and dusk; the moon glows at night
  let az,f=0.3;if(nightF>0.5){az=fwd+0.28;f=0.55;}else{const dx=sun.position.x-cam.tx,dz=sun.position.z-cam.tz;az=Math.atan2(dx,dz);}
  skyPos(az,f,150,_sp,false);const ok=_sp.clone().sub(camera.position).dot(camera.getWorldDirection(new T.Vector3()))>0;_sp.project(camera);
  u.sunP.value.set((_sp.x+1)/2,(_sp.y+1)/2);if(!ok)u.ga.value*=0.25;
  u.disc.value=nightF>0.5?0:(ok?clamp((skyGA-0.5)*2.5,0,1)*(1-rainMix):0);}

const PERF={px:0}; // reserved for future auto-quality; automatic pixel scaling is off (it compounded after the app was backgrounded)
function resize(){
  const cw=window.innerWidth,ch=window.innerHeight;
  const base=clamp(Math.round(Math.min(cw,ch)/130)/2,1.5,5); // fine pixels (a phone draws about 260 across), in half steps
  PX=clamp(base+S.pxAdj*0.5+PERF.px,1,9);
  W=Math.max(1,Math.ceil(cw/PX));H=Math.max(1,Math.ceil(ch/PX));
  renderer.setSize(W,H,false);
  if(rt){rt.depthTexture.dispose();rt.dispose();}
  rt=new T.WebGLRenderTarget(W,H,{minFilter:T.NearestFilter,magFilter:T.NearestFilter});
  rt.depthTexture=new T.DepthTexture(W,H);rt.depthTexture.type=T.UnsignedIntType;
  rt.depthTexture.minFilter=rt.depthTexture.magFilter=T.NearestFilter;
  postMat.uniforms.tC.value=rt.texture;postMat.uniforms.tD.value=rt.depthTexture;postMat.uniforms.res.value.set(W,H);
  camera.aspect=cw/ch;camera.updateProjectionMatrix();applyCam();
}
const cam={yaw:Math.PI*0.27,pitch:0.5,dist:30,tx:0,tz:0.3};
function fitZoom(){const a=window.innerWidth/window.innerHeight;cam.dist=clamp(25/Math.max(0.55,a),22,46);}
function applyCam(){
  // the view leads a little ahead of you, so you stand in the lower half of the screen with the island opening out beyond
  const hd=camD()*Math.cos(cam.pitch),lead=cam.dist*0.1,tx=cam.tx-Math.sin(cam.yaw)*lead,tz=cam.tz-Math.cos(cam.yaw)*lead;
  camera.position.set(tx+Math.sin(cam.yaw)*hd,Math.sin(cam.pitch)*camD(),tz+Math.cos(cam.yaw)*hd);
  camera.lookAt(tx,0.4-hd*hd*CURVE,tz);
  camera.updateMatrixWorld();
}
const _pv=new T.Vector3();
// how far the curved world has dropped at (x,z) as a given camera sees it (mirrors project_vertex in 00-core)
function curveDropFor(cm,x,z){const dx=x-cm.position.x,dz=z-cm.position.z;return(dx*dx+dz*dz)*CURVE;}
function curveY(x,z){return-curveDropFor(camera,x,z);}
// the angle below level at which the sea meets the sky (the flattest line of sight that still grazes the curved world)
function horizonA(){return Math.atan(2*Math.sqrt(Math.max(0.05,camera.position.y)*CURVE));}
function toScreen(x,y,z){_pv.set(x,y+curveY(x,z),z).project(camera);return[(_pv.x+1)/2*window.innerWidth,(1-_pv.y)/2*window.innerHeight,_pv.z];}

/* =========================================================
   Geometry helpers — merge many little boxes into one mesh
   ========================================================= */
const BOX=new T.BoxGeometry(1,1,1),ICO=new T.IcosahedronGeometry(0.5,1),CONE6=new T.ConeGeometry(0.5,1,9),
  CONE4=new T.ConeGeometry(0.5,1,4),CONE8=new T.ConeGeometry(0.5,1,12),CYL8=new T.CylinderGeometry(0.5,0.5,1,12),CYL6=new T.CylinderGeometry(0.5,0.5,1,6),
  OCT=new T.OctahedronGeometry(0.5),TOWER=new T.CylinderGeometry(0.32,0.5,1,12),TRUNK=new T.CylinderGeometry(0.34,0.5,1,9),
  PRISM=new T.CylinderGeometry(1,1,1,3).rotateX(-Math.PI/2),ICO2=new T.IcosahedronGeometry(0.5,2),CONE12=new T.ConeGeometry(0.5,1,14),CYL12=new T.CylinderGeometry(0.5,0.5,1,14);
const _m=new T.Matrix4(),_q=new T.Quaternion(),_e=new T.Euler(),_v=new T.Vector3(),_s=new T.Vector3(),_c=new T.Color();
/* level of detail for small parts: an eye, a berry or a petal only covers a few pixels, so merge() swaps in a lighter
   version of the same shape (a 180-triangle sphere becomes 20 or 80 triangles, a 14-sided stem becomes 6-sided).
   This keeps flowers, crops and critters cheap enough to scatter by the thousand. */
const ICO0=new T.IcosahedronGeometry(0.5,0),CYL5=new T.CylinderGeometry(0.5,0.5,1,5),CONE5=new T.ConeGeometry(0.5,1,5);
/* smooth-shaded shapes (their own rounded normals are kept, so the toon ramp paints soft bands across them instead of
   facets): the rounded crowns, bushes, pebbles and critters that give the island its soft, cosy look */
const smoothG=g=>{g.userData.smooth=true;return g;};
const SPH=smoothG(new T.SphereGeometry(0.5,14,10)),SPH_LO=smoothG(new T.SphereGeometry(0.5,8,6)),SPH_XS=smoothG(new T.SphereGeometry(0.5,6,4)),
  SCONE=smoothG(new T.ConeGeometry(0.5,1,16,1,true)),SCONE_LO=smoothG(new T.ConeGeometry(0.5,1,8,1,true)),STRUNK=smoothG(new T.CylinderGeometry(0.36,0.5,1,10,1,true)),SCYL=smoothG(new T.CylinderGeometry(0.5,0.5,1,10));
function lodGeo(p){const g=p.geo,big=Math.max(p.sx,p.sy,p.sz),rad=Math.max(p.sx,p.sz);
  if(g===SPH)return big<0.12?SPH_XS:big<0.35?SPH_LO:g;if(g===SPH_LO)return big<0.12?SPH_XS:g;
  if(g===ICO2)return big<0.13?ICO0:big<0.4?ICO:g;
  if(g===ICO)return big<0.13?ICO0:g;
  if(g===CYL12||g===CYL8)return rad<0.07?CYL5:rad<0.2?CYL6:g;
  if(g===CYL6)return rad<0.07?CYL5:g;
  if(g===CONE12||g===CONE8||g===CONE6)return rad<0.2?CONE5:g;
  return g;}
function P(geo,color,x=0,y=0,z=0,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1){return{geo,color,x,y,z,rx,ry,rz,sx,sy,sz};}
// like P, but shaded from cBot (local bottom) to cTop (local top) — used for leaf cards
function PG(geo,cTop,cBot,...rest){return Object.assign(P(geo,cTop,...rest),{c2:cBot});}
function shift(parts,x,y,z,ry=0){const c=Math.cos(ry),s=Math.sin(ry);return parts.map(p=>Object.assign({},p,{x:x+p.x*c+p.z*s,y:y+p.y,z:z-p.x*s+p.z*c,ry:p.ry+ry}));}
function merge(parts){
  const gs=[];let total=0;
  for(const p of parts){
    const g0=lodGeo(p),g=g0.index?g0.toNonIndexed():g0.clone();
    if(!g0.userData.smooth)g.computeVertexNormals();
    let ys=null;if(p.c2!==undefined){const a=g.attributes.position.array;ys=new Float32Array(a.length/3);let y0=1e9,y1=-1e9;for(let i=0;i<ys.length;i++){ys[i]=a[i*3+1];y0=Math.min(y0,ys[i]);y1=Math.max(y1,ys[i]);}for(let i=0;i<ys.length;i++)ys[i]=(ys[i]-y0)/((y1-y0)||1);}
    _e.set(p.rx,p.ry,p.rz,'YXZ');_q.setFromEuler(_e);_v.set(p.x,p.y,p.z);_s.set(p.sx,p.sy,p.sz);_m.compose(_v,_q,_s);
    g.applyMatrix4(_m);gs.push([g,p.color,ys,p.c2]);total+=g.attributes.position.count;
  }
  const pos=new Float32Array(total*3),nor=new Float32Array(total*3),col=new Float32Array(total*3);let o=0;
  const cB=new T.Color();
  for(const [g,color,ys,c2] of gs){
    pos.set(g.attributes.position.array,o*3);nor.set(g.attributes.normal.array,o*3);_c.set(color);if(ys)cB.set(c2);
    const n=g.attributes.position.count;for(let i=0;i<n;i++){if(ys){const t=ys[i];col[(o+i)*3]=cB.r+(_c.r-cB.r)*t;col[(o+i)*3+1]=cB.g+(_c.g-cB.g)*t;col[(o+i)*3+2]=cB.b+(_c.b-cB.b)*t;}else{col[(o+i)*3]=_c.r;col[(o+i)*3+1]=_c.g;col[(o+i)*3+2]=_c.b;}}
    o+=n;g.dispose();
  }
  const out=new T.BufferGeometry();
  out.setAttribute('position',new T.BufferAttribute(pos,3));out.setAttribute('normal',new T.BufferAttribute(nor,3));
  out.setAttribute('color',new T.BufferAttribute(col,3));out.computeBoundingSphere();out.computeBoundingBox();return out;
}
const grad=(()=>{const d=new Uint8Array([88,88,88,255,160,160,160,255,222,222,222,255,255,255,255,255]);
  const t=new T.DataTexture(d,4,1,T.RGBAFormat);t.minFilter=t.magFilter=T.NearestFilter;t.needsUpdate=true;return t;})();
const toon=o=>new T.MeshToonMaterial(Object.assign({gradientMap:grad},o));
const vcMat=toon({vertexColors:true});
const vcMatFlat=toon({color:0xffffff});
// foliage: the same toon look, speckled with little light and dark leaf clusters fixed in world space (two sizes of blotch),
// so after the pixel pass a crown reads as a mass of painted leaves rather than a plain ball
const leafGrad=(()=>{const d=new Uint8Array([72,72,72,255,140,140,140,255,208,208,208,255,255,255,255,255]);const t=new T.DataTexture(d,4,1,T.RGBAFormat);t.minFilter=t.magFilter=T.NearestFilter;t.needsUpdate=true;return t;})();
const leafMat=new T.MeshToonMaterial({gradientMap:leafGrad,vertexColors:true});
const leafU={uT:{value:0},uWind:{value:1}};
leafMat.onBeforeCompile=sh=>{sh.uniforms.uT=leafU.uT;sh.uniforms.uWind=leafU.uWind;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vLeafP;uniform float uT;uniform float uWind;')
    .replace('#include <begin_vertex>','#include <begin_vertex>\n{vec4 lp=vec4(transformed,1.);\n#ifdef USE_INSTANCING\nlp=instanceMatrix*lp;\n#endif\nvLeafP=(modelMatrix*lp).xyz;\nfloat hh=max(0.,transformed.y-.45),gu=.6+.4*sin(uT*.35+vLeafP.x*.08+vLeafP.z*.05);\ntransformed.x+=sin(uT*1.6+vLeafP.x*.7+vLeafP.z*.4)*.028*hh*gu*uWind;transformed.z+=cos(uT*1.3+vLeafP.z*.6)*.022*hh*gu*uWind;}');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vLeafP;\nfloat lh(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}')
    .replace('#include <color_fragment>','#include <color_fragment>\n{float ln=lh(floor(vLeafP*7.))*.55+lh(floor(vLeafP*3.))*.45;diffuseColor.rgb*=.8+.36*ln;}');};
// bushes, painted like pixel-art shrubs: a round dome covered in little pointed leaves (dark ones hanging down the sides, light
// ones on the sunlit top), laid out in world space on the dome's surface, with the same gentle wind sway as the trees
const bushMat=new T.MeshToonMaterial({gradientMap:leafGrad,vertexColors:true});
bushMat.onBeforeCompile=sh=>{sh.uniforms.uT=leafU.uT;sh.uniforms.uWind=leafU.uWind;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vBP;varying vec3 vBN;varying vec3 vBL;uniform float uT;uniform float uWind;')
    .replace('#include <begin_vertex>','#include <begin_vertex>\n{vec4 lp=vec4(transformed,1.);vec4 ln=vec4(objectNormal,0.);\n#ifdef USE_INSTANCING\nlp=instanceMatrix*lp;ln=instanceMatrix*ln;\n#endif\nvBL=transformed;vBP=(modelMatrix*lp).xyz;vBN=normalize((modelMatrix*ln).xyz);\nfloat hh=max(0.,transformed.y-.2);transformed.x+=sin(uT*1.7+vBP.x*.8+vBP.z*.5)*.03*hh*uWind;transformed.z+=cos(uT*1.4+vBP.z*.7)*.024*hh*uWind;}');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vBP;varying vec3 vBN;varying vec3 vBL;\nfloat bh(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}')
    .replace('#include <color_fragment>',`#include <color_fragment>
    {vec3 n=normalize(vBN);float up=clamp(n.y,0.,1.);
     // surface coordinates: around-and-down on the sides, straight across on the top
     // (in the bush's own space: rings of leaves round the dome, rows going up it)
     vec2 uv=vec2(atan(vBL.z,vBL.x)*1.75,vBL.y*6.);if(up>.8)uv=vBL.xz*5.;
     float row=floor(uv.y);uv.x+=mod(row,2.)*.5;vec2 c=floor(uv),f=fract(uv);float h=bh(c);
     // a leaf: a pointed shape hanging tip-down from the top of its cell
     float leaf=step(abs(f.x-.5)*2.,1.-f.y*.95+.05);float edge=leaf*(1.-step(abs(f.x-.5)*2.+.28,1.-f.y));
     float tone=mix(.7,1.02,leaf)*(.93+.12*h);tone=mix(tone,tone*.84,edge);
     tone*=mix(.8,1.08,smoothstep(-.3,.8,n.y));      // dark underneath, bright on top
     diffuseColor.rgb*=tone;}`);};
const glowMat=toon({vertexColors:true,emissive:0xffc460,emissiveIntensity:0});
const lumMat=toon({vertexColors:true,emissive:0x444444,emissiveIntensity:1});
const goldMat=toon({color:0xf5c542,emissive:0x6a4200,emissiveIntensity:.7});
const crystalMat=toon({color:0xb0f4ff,emissive:0x2a88aa,emissiveIntensity:.7,transparent:true,opacity:.85});
const moonMat=toon({color:0xd6e2ff,emissive:0x5a7aff,emissiveIntensity:.4});
const rainbowMat=toon({color:0xff0000,emissive:0x220000,emissiveIntensity:1});
const VMAT={golden:goldMat,crystal:crystalMat,moonlit:moonMat,rainbow:rainbowMat};
function M(parts,mat){const m=new T.Mesh(merge(parts),mat||vcMat);m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;return m;}

const glowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=32;const x=c.getContext('2d');
  const g=x.createRadialGradient(16,16,0,16,16,16);g.addColorStop(0,'rgba(255,220,140,1)');g.addColorStop(.5,'rgba(255,190,100,.45)');g.addColorStop(1,'rgba(255,170,80,0)');
  x.fillStyle=g;x.fillRect(0,0,32,32);const t=new T.CanvasTexture(c);t.minFilter=t.magFilter=T.NearestFilter;return t;})();
const poolMat=new T.MeshBasicMaterial({map:glowTex,transparent:true,blending:T.AdditiveBlending,depthWrite:false,opacity:0});
const POOL_GEO=new T.PlaneGeometry(2.6,2.6).rotateX(-Math.PI/2);
function pool(y=0.03,s=1){const m=new T.Mesh(POOL_GEO,poolMat);m.position.y=y;m.scale.setScalar(s);m.userData.noThumb=true;m.renderOrder=2;m.frustumCulled=false;return m;}

/* =========================================================
   Lights, sea, sky
   ========================================================= */
const hemi=new T.HemisphereLight(0xffffff,0x445544,.6);scene.add(hemi);
const sun=new T.DirectionalLight(0xffffff,1);sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-28,right:28,top:28,bottom:-28,near:1,far:110});
sun.shadow.bias=-0.0015;sun.shadow.normalBias=0.02;scene.add(sun,sun.target);

const waterMat=new T.MeshBasicMaterial({color:0x3565cc});
const s1Mat=new T.MeshBasicMaterial({color:0x7ea6e8}),s2Mat=new T.MeshBasicMaterial({color:0x5584da});
// the open sea isn't flat colour: soft darker and lighter patches, and bright ripple streaks that drift with the swell
// (the pixel pass turns them into little painted wave marks)
// how far each patch of sea is from the nearest shore, one texel per tile (built from landMap by buildDepthTex): the
// water shader uses it to fade from pale aqua at the sand, through turquoise, to deep blue, with a ragged pixel edge
const DEPTH_N=400,DEPTH_X0=-200;let depthDirty=true;
const depthTex=new T.DataTexture(new Uint8Array([255,255,255,255]),1,1,T.RGBAFormat);depthTex.needsUpdate=true;
const waterU={uCam:{value:new T.Vector3()},uSky:{value:skyHz},uZen:{value:skyZen},uSunD:{value:new T.Vector3(0,1,0)},uGl:{value:1},uT:{value:0},uYaw:{value:0},uDepth:{value:depthTex},uDB:{value:new T.Vector3(DEPTH_X0,DEPTH_X0,1)},uS1:{value:s1Mat.color},uS2:{value:s2Mat.color}};
function buildDepthTex(){depthDirty=false;const N=DEPTH_N,d=new Float32Array(N*N).fill(99);
  for(const [k,t] of landMap){if(t!=='grass'&&t!=='sand'&&t!=='river'&&t!=='bridge')continue;const [x,z]=k.split(',').map(Number),i=x-DEPTH_X0,j=z-DEPTH_X0;if(i>=0&&j>=0&&i<N&&j<N)d[j*N+i]=0;}
  // two-pass chamfer distance (rounder than steps along the grid)
  const D=1.414;for(let j=0;j<N;j++)for(let i=0;i<N;i++){let v=d[j*N+i];if(i)v=Math.min(v,d[j*N+i-1]+1);if(j){v=Math.min(v,d[(j-1)*N+i]+1);if(i)v=Math.min(v,d[(j-1)*N+i-1]+D);if(i<N-1)v=Math.min(v,d[(j-1)*N+i+1]+D);}d[j*N+i]=v;}
  for(let j=N-1;j>=0;j--)for(let i=N-1;i>=0;i--){let v=d[j*N+i];if(i<N-1)v=Math.min(v,d[j*N+i+1]+1);if(j<N-1){v=Math.min(v,d[(j+1)*N+i]+1);if(i<N-1)v=Math.min(v,d[(j+1)*N+i+1]+D);if(i)v=Math.min(v,d[(j+1)*N+i-1]+D);}d[j*N+i]=v;}
  const px=new Uint8Array(N*N*4);for(let i=0;i<N*N;i++){const v=Math.min(255,Math.round(d[i]*40));px[i*4]=px[i*4+1]=px[i*4+2]=v;px[i*4+3]=255;}
  const t=new T.DataTexture(px,N,N,T.RGBAFormat);t.magFilter=t.minFilter=T.LinearFilter;t.needsUpdate=true;
  if(waterU.uDepth.value!==depthTex)waterU.uDepth.value.dispose();waterU.uDepth.value=t;waterU.uDB.value.set(DEPTH_X0,DEPTH_X0,N);}
waterMat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,waterU);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWp;').replace('#include <begin_vertex>','#include <begin_vertex>\nvWp=(modelMatrix*vec4(transformed,1.)).xyz;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWp;uniform float uT;uniform vec3 uCam;uniform vec3 uSky;uniform vec3 uZen;uniform vec3 uSunD;uniform float uGl;uniform sampler2D uDepth;uniform vec3 uDB;uniform vec3 uS1;uniform vec3 uS2;')
    .replace('#include <color_fragment>',`#include <color_fragment>
      {vec2 q=vWp.xz;float n=fract(sin(dot(floor(q*.45),vec2(12.9898,78.233)))*43758.5453)*.5+fract(sin(dot(floor(q*1.3),vec2(39.3,11.7)))*43758.5453)*.5;
       diffuseColor.rgb*=.95+.08*n;
       // soft swells: broad lighter and darker bands rolling slowly (world-fixed, so they don't swim as you turn)
       float sw=sin(q.x*.35+q.y*.22+uT*.4)*sin(q.y*.3-q.x*.12-uT*.3);diffuseColor.rgb*=.94+.1*sw;
       // shallows: pale aqua at the sand, turquoise, then the deep blue, with a ragged pixel edge between them
       float dd=texture2D(uDepth,(q-uDB.xy+.5)/uDB.z).r*6.375-.5;
       dd+=(fract(sin(dot(floor(q*2.5),vec2(12.9898,78.233)))*43758.5453)-.5)*.45+sin(q.x*.9+uT*.6)*sin(q.y*.8-uT*.5)*.18;
       vec3 sh=mix(uS1*1.06,uS2,smoothstep(.5,2.,dd));
       diffuseColor.rgb=mix(sh,diffuseColor.rgb,smoothstep(1.8,4.4,dd));
       // reflections: the sky in the water, stronger at a glancing angle (towards the horizon), and the sun glittering
       // on the ripples. Ripple normals are world-fixed, so the glitter sparkles in place rather than swimming
       vec3 vd=normalize(vWp-uCam);/* (a basic material isn't given cameraPosition) */vec2 rq=floor(q*3.);float rh=fract(sin(dot(rq,vec2(12.9898,78.233)))*43758.5453);
       vec3 nn=normalize(vec3(sin(q.x*1.7+uT*1.1+rh*6.)*.09+sin(q.y*2.3-uT*.8)*.06,1.,cos(q.y*1.9+uT*.9+rh*5.)*.09+sin(q.x*2.9+uT)*.05));
       vec3 rf=reflect(vd,nn);float fr=pow(1.-clamp(-vd.y,0.,1.),4.);
       vec3 skyR=mix(uSky,uZen,clamp(rf.y*1.6,0.,1.));diffuseColor.rgb=mix(diffuseColor.rgb,skyR,fr*.4*smoothstep(1.5,3.5,dd));
       float sp=pow(max(dot(rf,uSunD),0.),600.)*uGl;float gl=step(.8,rh)*step(.2,pow(max(dot(rf,uSunD),0.),160.)*uGl);
       diffuseColor.rgb+=vec3(1.,.96,.86)*(sp*.25+gl*.65)*smoothstep(1.,2.5,dd);}`);};
const water=new T.Mesh(new T.PlaneGeometry(520,520,52,52).rotateX(-Math.PI/2),waterMat);water.frustumCulled=false;scene.add(water);
const TILE_PLANE=new T.PlaneGeometry(1,1).rotateX(-Math.PI/2);

const STARN=900,starGeo=new T.BufferGeometry(),sp=new Float32Array(STARN*3),ss=new Float32Array(STARN);
for(let i=0;i<STARN;i++){const a=Math.random()*6.283,e=0.08+Math.random()*1.3;sp[i*3]=Math.cos(a)*Math.cos(e)*190;sp[i*3+1]=Math.sin(e)*190;sp[i*3+2]=Math.sin(a)*Math.cos(e)*190;ss[i]=Math.random()<0.15?2:1;}
starGeo.setAttribute('position',new T.BufferAttribute(sp,3));starGeo.setAttribute('sz',new T.BufferAttribute(ss,1));
const starMat=new T.ShaderMaterial({uniforms:{op:{value:0}},transparent:true,depthWrite:false,
  vertexShader:'attribute float sz;void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=sz;}',
  fragmentShader:'uniform float op;void main(){gl_FragColor=vec4(1.,.98,.9,op);}'});
const stars=new T.Points(starGeo,starMat);stars.frustumCulled=false;scene.add(stars);

