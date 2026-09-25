/* =========================================================
   Renderer, camera, post-process (pixelate + outline + dither)
   ========================================================= */
const canvas=$('c');
const renderer=new T.WebGLRenderer({canvas,antialias:false,powerPreference:'high-performance'});
renderer.setPixelRatio(1);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.BasicShadowMap;
const scene=new T.Scene();const skyHz=new T.Color(0xbfe0ff),skyZen=new T.Color(0x3c8ce8),skyGlow=new T.Color(0xffffff);let skyGA=0;
scene.fog=new T.Fog(0xbfe0ff,40,150);
const NEAR=0.5,FAR=420;
const camera=new T.PerspectiveCamera(36,1,NEAR,FAR);
let W=1,H=1,PX=2,rt=null;
const post={scene:new T.Scene(),cam:new T.OrthographicCamera(-1,1,1,-1,0,1)};
const postMat=new T.ShaderMaterial({
  uniforms:{tC:{value:null},tD:{value:null},res:{value:new T.Vector2(1,1)},levels:{value:22},cn:{value:NEAR},cf:{value:FAR}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader:`
    uniform sampler2D tC;uniform sampler2D tD;uniform vec2 res;uniform float levels;uniform float cn;uniform float cf;varying vec2 vUv;
    float b2(vec2 a){a=floor(a);return fract(a.x*.5+a.y*a.y*.75);}
    float bayer(vec2 a){return b2(.5*a)*.25+b2(a);}
    float lin(vec2 uv){float d=texture2D(tD,uv).r*2.-1.;return 2.*cn*cf/(cf+cn-d*(cf-cn));}
    void main(){
      vec3 c=texture2D(tC,vUv).rgb;
      float d=lin(vUv);
      vec2 px=1./res;
      float dn=max(max(lin(vUv+vec2(px.x,0.)),lin(vUv-vec2(px.x,0.))),max(lin(vUv+vec2(0.,px.y)),lin(vUv-vec2(0.,px.y))));
      float e=step(max(.45,d*.035),dn-d)*step(d,cf*.6);
      c=mix(c,c*vec3(.36,.32,.46),e*.9);
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
  const base=clamp(Math.round(Math.min(cw,ch)/190),2,6);
  PX=clamp(base+S.pxAdj+PERF.px,1,9);
  W=Math.max(1,Math.ceil(cw/PX));H=Math.max(1,Math.ceil(ch/PX));
  renderer.setSize(W,H,false);
  if(rt){rt.depthTexture.dispose();rt.dispose();}
  rt=new T.WebGLRenderTarget(W,H,{minFilter:T.NearestFilter,magFilter:T.NearestFilter});
  rt.depthTexture=new T.DepthTexture(W,H);rt.depthTexture.type=T.UnsignedIntType;
  rt.depthTexture.minFilter=rt.depthTexture.magFilter=T.NearestFilter;
  postMat.uniforms.tC.value=rt.texture;postMat.uniforms.tD.value=rt.depthTexture;postMat.uniforms.res.value.set(W,H);
  camera.aspect=cw/ch;camera.updateProjectionMatrix();applyCam();
}
const cam={yaw:Math.PI*0.27,pitch:0.58,dist:30,tx:0,tz:0.3};
function fitZoom(){const a=window.innerWidth/window.innerHeight;cam.dist=clamp(20/Math.max(0.55,a),18,40);}
function applyCam(){
  const hd=cam.dist*Math.cos(cam.pitch);
  camera.position.set(cam.tx+Math.sin(cam.yaw)*hd,Math.sin(cam.pitch)*cam.dist,cam.tz+Math.cos(cam.yaw)*hd);
  camera.lookAt(cam.tx,0.4-hd*hd*CURVE,cam.tz);
  camera.updateMatrixWorld();
}
const _pv=new T.Vector3();
function curveY(x,z){const dx=x-camera.position.x,dz=z-camera.position.z;return-(dx*dx+dz*dz)*CURVE;}
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
function lodGeo(p){const g=p.geo,big=Math.max(p.sx,p.sy,p.sz),rad=Math.max(p.sx,p.sz);
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
    g.computeVertexNormals();
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
sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-18,right:18,top:18,bottom:-18,near:1,far:90});
sun.shadow.bias=-0.0015;sun.shadow.normalBias=0.02;scene.add(sun,sun.target);

const waterMat=new T.MeshBasicMaterial({color:0x3565cc});
const water=new T.Mesh(new T.PlaneGeometry(520,520,52,52).rotateX(-Math.PI/2),waterMat);water.frustumCulled=false;scene.add(water);
const s1Mat=new T.MeshBasicMaterial({color:0x7ea6e8}),s2Mat=new T.MeshBasicMaterial({color:0x5584da});
const TILE_PLANE=new T.PlaneGeometry(1,1).rotateX(-Math.PI/2);

const STARN=900,starGeo=new T.BufferGeometry(),sp=new Float32Array(STARN*3),ss=new Float32Array(STARN);
for(let i=0;i<STARN;i++){const a=Math.random()*6.283,e=0.08+Math.random()*1.3;sp[i*3]=Math.cos(a)*Math.cos(e)*190;sp[i*3+1]=Math.sin(e)*190;sp[i*3+2]=Math.sin(a)*Math.cos(e)*190;ss[i]=Math.random()<0.15?2:1;}
starGeo.setAttribute('position',new T.BufferAttribute(sp,3));starGeo.setAttribute('sz',new T.BufferAttribute(ss,1));
const starMat=new T.ShaderMaterial({uniforms:{op:{value:0}},transparent:true,depthWrite:false,
  vertexShader:'attribute float sz;void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=sz;}',
  fragmentShader:'uniform float op;void main(){gl_FragColor=vec4(1.,.98,.9,op);}'});
const stars=new T.Points(starGeo,starMat);stars.frustumCulled=false;scene.add(stars);

