/* =========================================================
   Renderer, camera, post-process (pixelate + outline + dither)
   ========================================================= */
const canvas=$('c');
const renderer=new T.WebGLRenderer({canvas,antialias:false,powerPreference:'high-performance'});
renderer.setPixelRatio(1);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap; // soft-edged little shadows
renderer.shadowMap.autoUpdate=false;let shadowFrame=0;/* the shadow map is redrawn every other frame (90-main): the sun barely moves, and it halves the cost of the shadow pass */
const scene=new T.Scene();const skyHz=new T.Color(0xbfe0ff),skyZen=new T.Color(0x3c8ce8),skyGlow=new T.Color(0xffffff);let skyGA=0;
scene.fog=new T.Fog(0xbfe0ff,40,150);
const NEAR=1.5,FAR=640;
const camera=new T.PerspectiveCamera(2*Math.atan(Math.tan(18*Math.PI/180)/LENS)*180/Math.PI,1,NEAR,FAR);
const camD=()=>cam.dist*LENS; // how far the camera really is from what it looks at (cam.dist is the zoom)
let W=1,H=1,PX=2,rt=null;
const post={scene:new T.Scene(),cam:new T.OrthographicCamera(-1,1,1,-1,0,1)};
const postMat=new T.ShaderMaterial({
  uniforms:{tC:{value:null},tD:{value:null},tB:{value:null},bloomC:{value:new T.Vector3(.3,.26,.2)},res:{value:new T.Vector2(1,1)},levels:{value:22},cn:{value:NEAR},cf:{value:FAR},gw:{value:1},atmo:{value:new T.Vector4(.06,.5,60,.1)},hzC:{value:new T.Color(0xbfe0ff)},hzT:{value:new T.Vector3(1.02,1,.98)},tm:{value:0},
    // the visual style (applyFx): colour grade, outlines, glow, film texture and palette
    fxA:{value:new T.Vector4(1,1,1,0)}/* saturation, contrast, brightness, faded blacks */,tS:{value:new T.Vector3(1,1,1)},tH:{value:new T.Vector3(1,1,1)},
    edgeK:{value:1},edgeC:{value:new T.Vector3(.36,.32,.46)},dith:{value:1},grain:{value:0},vig:{value:.14},bloomK:{value:1},gradeK:{value:1},pal:{value:0},tilt:{value:0},scan:{value:0},paper:{value:0},rays:{value:0},uw:{value:0},rip:{value:0},uwC:{value:new T.Color(0x2a8cc0)},uwL:{value:1}/* under water (76c-swim): how far under, and the ripple as you pass through the surface */},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader:`
    uniform sampler2D tC;uniform sampler2D tD;uniform sampler2D tB;uniform vec3 bloomC;uniform vec2 res;uniform float levels;uniform float cn;uniform float cf;uniform float gw;uniform vec4 atmo;uniform vec3 hzC;uniform vec3 hzT;uniform float tm;varying vec2 vUv;
    uniform vec4 fxA;uniform vec3 tS;uniform vec3 tH;uniform float edgeK;uniform vec3 edgeC;uniform float dith;uniform float grain;uniform float vig;uniform float bloomK;uniform float gradeK;uniform float pal;uniform float tilt;uniform float scan;uniform float paper;uniform float rays;uniform float uw;uniform float rip;uniform vec3 uwC;uniform float uwL;
    float b2(vec2 a){a=floor(a);return fract(a.x*.5+a.y*a.y*.75);}
    float bayer(vec2 a){return b2(.5*a)*.25+b2(a);}
    float lin(vec2 uv){float d=texture2D(tD,uv).r*2.-1.;return 2.*cn*cf/(cf+cn-d*(cf-cn));}
    float h21(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
    float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
    void main(){
      vec2 px=1./res;
      vec2 uv=vUv;
      // under water the picture wavers gently; passing through the surface sends a ripple down the screen
      if(uw>0.)uv+=vec2(sin(vUv.y*38.+tm*2.1),cos(vUv.x*31.+tm*1.7))*.0016*uw;
      if(rip>0.){float w=sin(vUv.y*22.-(1.-rip)*26.)*rip*.014;uv+=vec2(w,w*.4);}
      vec3 c=texture2D(tC,uv).rgb;
      // tilt-shift: the top and bottom of the view melt into a soft blur, like a photo of a model
      if(tilt>0.){float f=smoothstep(.1,.42,abs(vUv.y-.55))*tilt*2.2;if(f>.01){vec3 a=c;for(int i=1;i<=3;i++){float o=float(i)*f;a+=texture2D(tC,vUv+vec2(o*px.x,0.)).rgb+texture2D(tC,vUv-vec2(o*px.x,0.)).rgb+texture2D(tC,vUv+vec2(0.,o*px.y)).rgb+texture2D(tC,vUv-vec2(0.,o*px.y)).rgb;}c=a/13.;}}
      if(scan>0.){c.r=mix(c.r,texture2D(tC,vUv+vec2(px.x,0.)).r,.7*scan);c.b=mix(c.b,texture2D(tC,vUv-vec2(px.x,0.)).b,.7*scan);}
      float d=lin(vUv);
      float fz=cf*.45;/* neighbours out in the sky don't count: no outline along the horizon */
      float n1=lin(vUv+vec2(px.x,0.)),n2=lin(vUv-vec2(px.x,0.)),n3=lin(vUv+vec2(0.,px.y)),n4=lin(vUv-vec2(0.,px.y));
      float dn=max(max(n1>fz?d:n1,n2>fz?d:n2),max(n3>fz?d:n3,n4>fz?d:n4));
      float e=step(max(.35,d*.018),dn-d)*step(d,cf*.6);
      c=mix(c,c*edgeC,clamp(e*.9*edgeK,0.,1.)*(1.-smoothstep(140.,260.,d))); // outlines fade out on the far islands
      // lighting: bright things (sand, foam, sunlit leaves, clouds) bloom softly into their neighbours
      // (bloomPass: the brightest parts, blurred at a quarter of the size; warm, and stronger at night round lamps and fires)
      if(bloomK>0.)c+=texture2D(tB,vUv).rgb*bloomC*bloomK;
      // the island's own sunny grade: a touch more colour, warm highlights, cool shadows, a warm haze towards the horizon
      float g=gw*gradeK;float l=dot(c,vec3(.299,.587,.114));c=mix(vec3(l),c,1.+.04*g);c=mix(c,(c-.5)*1.08+.48,g);
      c*=mix(vec3(1.),mix(vec3(.96,.98,1.05),vec3(1.04,1.,.95),smoothstep(.25,.85,l)),g);
      c=mix(c,c*vec3(1.04,1.,.95)+vec3(.03,.02,.0),smoothstep(110.,300.,d)*step(d,cf*.6)*.45*g);
      // atmosphere: the loudest colours roll off softly (limes and yellows most), and the land melts into a soft
      // sky-coloured haze with distance, so the near things read and the far ones settle back
      if(pal<0.5){float mx=max(c.r,max(c.g,c.b)),mn=min(c.r,min(c.g,c.b)),ch=mx-mn,lm=dot(c,vec3(.299,.587,.114));
        float yl=smoothstep(.0,.25,min(c.r,c.g)-c.b)*smoothstep(.35,.0,abs(c.r-c.g));
        c=mix(vec3(lm),c,1./(1.+ch*atmo.x+yl*ch*atmo.y));
        float hz=smoothstep(atmo.z,atmo.z*2.6,d)*step(d,cf*.6)*atmo.w*(1.-uw);c=mix(c,hzC*hzT,hz);}
      // the style's grade: saturation, contrast, brightness, lifted blacks and split-toning
      l=dot(c,vec3(.299,.587,.114));c=mix(vec3(l),c,fxA.x);c=(c-.5)*fxA.y+.5;c*=fxA.z;c=fxA.w+c*(1.-fxA.w);
      c*=mix(tS,tH,smoothstep(.15,.85,l));
      // palettes: 1 four greens (Game Boy), 2 black and white, 3 sepia
      if(pal>0.5){float m=clamp(dot(c,vec3(.299,.587,.114)),0.,1.);
        if(pal<1.5){m=smoothstep(.12,.92,m);float q=floor(m*3.99+(bayer(gl_FragCoord.xy)-.5)*.35);c=q<.5?vec3(.06,.22,.06):q<1.5?vec3(.19,.38,.19):q<2.5?vec3(.55,.67,.06):vec3(.61,.74,.06);}
        else if(pal<2.5)c=vec3(m);else c=vec3(m)*vec3(1.08,.93,.74);}
      // watercolour paper: soft blotches of pigment and a fibrous grain
      if(paper>0.){vec2 p=gl_FragCoord.xy;float w=vn(p*.08)*.6+vn(p*.3)*.3+h21(p)*.1;c*=1.-paper*(.1*w-.04);c=mix(c,c*c*1.1+.02,paper*.25*vn(p*.02+3.));}
      if(grain>0.)c+=(h21(gl_FragCoord.xy+fract(tm)*97.)-.5)*grain;
      if(scan>0.)c*=1.-scan*.16*step(.5,fract(gl_FragCoord.y*.5));
      if(uw>0.){
        // under water: light is soaked up with distance (reds first), everything far melts into the sea's own colour,
        // shafts of sunlight slant down from the surface, and a shimmer of caustic light plays over the near things
        float fd=1.-exp(-d*.05);c*=mix(vec3(1.),vec3(.6,.88,1.02),uw);c=mix(c,uwC,clamp(fd*.85,0.,1.)*uw);
        float sx=vUv.x+vUv.y*.35;float ry=pow(max(0.,sin(sx*13.+tm*.32)*sin(sx*6.1-tm*.19+1.3)),3.)+.5*pow(max(0.,sin(sx*23.-tm*.5+2.)),6.);
        c+=vec3(.55,.85,.95)*ry*smoothstep(.2,1.,vUv.y)*(1.-fd*.5)*.2*uw*uwL;
        vec2 cp=gl_FragCoord.xy*.035;float cs=sin(cp.x+sin(cp.y*1.3+tm*.9)*1.4+tm*.7)*sin(cp.y*1.1+sin(cp.x*.8-tm)*1.2-tm*.5);
        c+=vec3(.3,.5,.55)*smoothstep(.6,.95,abs(cs))*(1.-fd)*.14*uw*uwL;
        vec2 q=vUv-.5;c*=1.-dot(q,q)*1.3*uw;c=mix(c,c*c*1.25+.02,.18*uw);}
      if(rip>0.)c=mix(c,vec3(.85,.97,1.),rip*rip*.35);
      vec2 vg=vUv-.5;c*=1.-dot(vg,vg)*vig;
      float b=bayer(gl_FragCoord.xy)-.5;
      if(rays>0.){float r=vUv.x*.9+vUv.y*.5,l=0.;for(int i=0;i<3;i++){float p=fract(.18+float(i)*.31+tm*.003)*1.5-.05;l+=smoothstep(.004,0.,abs(r-p))*(.6+.4*float(i==1));}c+=vec3(1.,.93,.62)*l*.16*rays;}/* (the Hike look's soft sun rays) */
      if(pal<0.5)c=floor(c*levels+b*dith+.5)/levels;
      gl_FragColor=vec4(c,1.);
    }`,
  depthTest:false,depthWrite:false
});
post.scene.add(new T.Mesh(new T.PlaneGeometry(2,2),postMat));
/* glow: the frame's brightest parts (sunlit sand and foam, lamps, lit windows and fires at night) are soaked into a copy a
   quarter of the size each way, blurred across and down, and laid back over the picture (postMat) as a soft halo:
   three tiny passes, about 1/16 of the pixels each */
const bloomRT=[null,null],bloomScene=new T.Scene(),bloomQ=new T.Mesh(new T.PlaneGeometry(2,2));bloomQ.frustumCulled=false;bloomScene.add(bloomQ);
const _qv='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
const brightMat=new T.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{tC:{value:null},px:{value:new T.Vector2(1,1)},th:{value:.78},nb:{value:0}},vertexShader:_qv,
  fragmentShader:`uniform sampler2D tC;uniform vec2 px;uniform float th;uniform float nb;varying vec2 vUv;
    // by day anything bright glows a little; at night (nb) only the light sources do (marked in alpha: GLOW_A)
    vec3 b(vec2 o){vec4 c=texture2D(tC,vUv+o*px);return c.rgb*smoothstep(th,th+.22,max(max(c.r,c.g),c.b))*max(1.-nb,1.-c.a);}
    void main(){gl_FragColor=vec4((b(vec2(-1.,-1.))+b(vec2(1.,-1.))+b(vec2(-1.,1.))+b(vec2(1.,1.)))*.25,1.);}`});
const blurMat=new T.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{tB:{value:null},dir:{value:new T.Vector2()}},vertexShader:_qv,
  fragmentShader:`uniform sampler2D tB;uniform vec2 dir;varying vec2 vUv;
    void main(){vec3 c=texture2D(tB,vUv).rgb*.227+(texture2D(tB,vUv+dir*1.385).rgb+texture2D(tB,vUv-dir*1.385).rgb)*.316+(texture2D(tB,vUv+dir*3.231).rgb+texture2D(tB,vUv-dir*3.231).rgb)*.07;gl_FragColor=vec4(c,1.);}`});
function bloomPass(){if(!(postMat.uniforms.bloomK.value>0)||!bloomRT[0])return;const [a,b]=bloomRT,ac=renderer.autoClear;renderer.autoClear=false;
  bloomQ.material=brightMat;brightMat.uniforms.tC.value=rt.texture;renderer.setRenderTarget(a);renderer.render(bloomScene,post.cam);
  bloomQ.material=blurMat;blurMat.uniforms.tB.value=a.texture;blurMat.uniforms.dir.value.set(1/a.width,0);renderer.setRenderTarget(b);renderer.render(bloomScene,post.cam);
  blurMat.uniforms.tB.value=b.texture;blurMat.uniforms.dir.value.set(0,1/a.height);renderer.setRenderTarget(a);renderer.render(bloomScene,post.cam);renderer.autoClear=ac;}
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
  PX=clamp(base+S.pxAdj*0.5+PERF.px+fxPx(),1,9);
  W=Math.max(1,Math.ceil(cw/PX));H=Math.max(1,Math.ceil(ch/PX));
  renderer.setSize(W,H,false);
  if(rt){rt.depthTexture.dispose();rt.dispose();}
  rt=new T.WebGLRenderTarget(W,H,{minFilter:T.NearestFilter,magFilter:T.NearestFilter});
  rt.depthTexture=new T.DepthTexture(W,H);rt.depthTexture.type=T.UnsignedIntType;
  rt.depthTexture.minFilter=rt.depthTexture.magFilter=T.NearestFilter;
  postMat.uniforms.tC.value=rt.texture;postMat.uniforms.tD.value=rt.depthTexture;postMat.uniforms.res.value.set(W,H);
  for(let i=0;i<2;i++){if(bloomRT[i])bloomRT[i].dispose();bloomRT[i]=new T.WebGLRenderTarget(Math.ceil(W/4),Math.ceil(H/4),{minFilter:T.LinearFilter,magFilter:T.LinearFilter,depthBuffer:false});}
  postMat.uniforms.tB.value=bloomRT[0].texture;brightMat.uniforms.px.value.set(1/W,1/H);
  camera.aspect=cw/ch;camera.updateProjectionMatrix();applyCam();
}
const cam={yaw:Math.PI*0.27,pitch:0.5,dist:30,tx:0,tz:0.3};
function fitZoom(){const a=window.innerWidth/window.innerHeight;cam.dist=clamp(25/Math.max(0.55,a),22,46);}
let camShake=0;/* a little jolt for heavy blows (a tree hitting the ground); decays in updateTool */
function applyCam(){
  // the view leads a little ahead of you, so you stand in the lower half of the screen with the island opening out beyond
  const hd=camD()*Math.cos(cam.pitch),lead=cam.dist*0.1,tx=cam.tx-Math.sin(cam.yaw)*lead,tz=cam.tz-Math.cos(cam.yaw)*lead;
  const ty=cam.ty||0;/* the height it looks at: 0 on land, your depth under water (76c-swim) */
  let cy=ty+Math.sin(cam.pitch)*camD();if(cam.yMax!==undefined&&cy>cam.yMax)cy=cam.yMax;/* diving: the lens stays under the surface (76c-swim) */
  camera.position.set(tx+Math.sin(cam.yaw)*hd,cy,tz+Math.cos(cam.yaw)*hd);
  camera.lookAt(tx,ty+0.4-hd*hd*CURVE,tz);
  if(camShake>0){const k=camShake*0.25;camera.position.x+=(Math.random()-0.5)*k;camera.position.y+=(Math.random()-0.5)*k;camera.position.z+=(Math.random()-0.5)*k;}
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
const SPH=smoothG(new T.SphereGeometry(0.5,12,8)),SPH_LO=smoothG(new T.SphereGeometry(0.5,8,6)),SPH_XS=smoothG(new T.SphereGeometry(0.5,6,4)),
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
// each source shape is prepared once (flattened to plain triangles, normals worked out, heights for gradient parts), then
// every part is transformed straight into the output arrays: no per-part geometry clones
const _mergePrep=new WeakMap(),_nm3=new T.Matrix3();
function mergePrep(g0){let r=_mergePrep.get(g0);if(r)return r;const g=g0.index?g0.toNonIndexed():g0.clone();if(!g0.userData.smooth)g.computeVertexNormals();
  const pos=g.attributes.position.array,n=pos.length/3,ys=new Float32Array(n);let y0=1e9,y1=-1e9;for(let i=0;i<n;i++){const y=pos[i*3+1];ys[i]=y;if(y<y0)y0=y;if(y>y1)y1=y;}for(let i=0;i<n;i++)ys[i]=(ys[i]-y0)/((y1-y0)||1);
  r={pos:Float32Array.from(pos),nor:Float32Array.from(g.attributes.normal.array),ys,n};g.dispose();_mergePrep.set(g0,r);return r;}
function merge(parts){
  const preps=new Array(parts.length);let total=0;
  for(let k=0;k<parts.length;k++){const r=mergePrep(lodGeo(parts[k]));preps[k]=r;total+=r.n;}
  const pos=new Float32Array(total*3),nor=new Float32Array(total*3),col=new Float32Array(total*3);let o=0;
  const cB=new T.Color();
  for(let k=0;k<parts.length;k++){const p=parts[k],r=preps[k],n=r.n,P0=r.pos,N0=r.nor;
    _e.set(p.rx,p.ry,p.rz,'YXZ');_q.setFromEuler(_e);_v.set(p.x,p.y,p.z);_s.set(p.sx,p.sy,p.sz);_m.compose(_v,_q,_s);_nm3.getNormalMatrix(_m);
    const e=_m.elements,q=_nm3.elements;_c.set(p.color);const grad=p.c2!==undefined;if(grad)cB.set(p.c2);
    for(let i=0;i<n;i++){const i3=i*3,x=P0[i3],y=P0[i3+1],z=P0[i3+2],j=(o+i)*3;
      pos[j]=e[0]*x+e[4]*y+e[8]*z+e[12];pos[j+1]=e[1]*x+e[5]*y+e[9]*z+e[13];pos[j+2]=e[2]*x+e[6]*y+e[10]*z+e[14];
      const nx=N0[i3],ny=N0[i3+1],nz=N0[i3+2];let a=q[0]*nx+q[3]*ny+q[6]*nz,b=q[1]*nx+q[4]*ny+q[7]*nz,c=q[2]*nx+q[5]*ny+q[8]*nz;const l=Math.hypot(a,b,c)||1;
      nor[j]=a/l;nor[j+1]=b/l;nor[j+2]=c/l;
      if(grad){const t=r.ys[i];col[j]=cB.r+(_c.r-cB.r)*t;col[j+1]=cB.g+(_c.g-cB.g)*t;col[j+2]=cB.b+(_c.b-cB.b)*t;}else{col[j]=_c.r;col[j+1]=_c.g;col[j+2]=_c.b;}}
    o+=n;}
  const out=new T.BufferGeometry();
  out.setAttribute('position',new T.BufferAttribute(pos,3));out.setAttribute('normal',new T.BufferAttribute(nor,3));
  out.setAttribute('color',new T.BufferAttribute(col,3));out.computeBoundingSphere();out.computeBoundingBox();return out;
}
/* the toon ramps: how much of a light reaches a surface, by how squarely it faces it (left: facing away, right: facing
   straight at it). 64 steps, filtered, so the bands of light and shade can melt softly into each other; applyFx (30b-fx)
   paints them for the visual style: the bands' brightness, how soft their edges are, a warm glow where light gives way
   to shade and cooler shadows */
const RAMP_N=64,rampTex=()=>{const t=new T.DataTexture(new Uint8Array(RAMP_N*4).fill(255),RAMP_N,1,T.RGBAFormat);t.minFilter=t.magFilter=T.LinearFilter;t.needsUpdate=true;return t;};
const grad=rampTex();
/* rim light: a soft edge of sky light round the silhouettes of rounded things (trees, people, rocks, walls), warmer on
   the side facing the sun. Floors and roofs don't get it. One uniform (RIM: strength, sun warmth) is shared by every
   toon material, set each frame by applyTime (62-time): a few instructions per pixel, no extra pass */
const RIM=new Float32Array([0.3,0.4,0]);
T.ShaderLib.toon.uniforms.rimP={value:RIM};/* (a typed array is shared, not copied, when each material clones its uniforms) */
T.ShaderLib.toon.fragmentShader=T.ShaderLib.toon.fragmentShader.replace('uniform float opacity;','uniform float opacity;\nuniform vec3 rimP;')
  .replace('#include <aomap_fragment>',`#include <aomap_fragment>
  {vec3 rn=geometry.normal;float nv=1.-clamp(dot(rn,geometry.viewDir),0.,1.);vec3 upV=(viewMatrix*vec4(0.,1.,0.,0.)).xyz;
   float rim=smoothstep(.45,.95,nv)*(1.-abs(dot(rn,upV)))*rimP.x;vec3 rc=vec3(.55,.6,.7);
   #if NUM_HEMI_LIGHTS>0
   rc=hemisphereLights[0].skyColor;
   #endif
   #if NUM_DIR_LIGHTS>0
   rc=mix(rc,directionalLights[0].color,rimP.y*clamp(dot(rn,directionalLights[0].direction)*.7+.5,0.,1.));
   #endif
   reflectedLight.indirectDiffuse+=rim*rc*(diffuseColor.rgb*.75+.25);}`);
const toon=o=>new T.MeshToonMaterial(Object.assign({gradientMap:grad},o));
const vcMat=toon({vertexColors:true});
const vcMatFlat=toon({color:0xffffff});
// foliage: the same toon look, speckled with little light and dark leaf clusters fixed in world space (two sizes of blotch),
// so after the pixel pass a crown reads as a mass of painted leaves rather than a plain ball
const leafGrad=rampTex();/* foliage's own, slightly deeper ramp (applyFx) */
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
/* light sources (lamps and lit windows here, fires in 55-town) mark themselves in the frame's alpha, 0 for a full glow, so
   the glow pass can tell a lamp from a moonlit white wall at night. GLOW_A.value=0 turns the mark off (thumbnails, whose
   alpha is their cut-out) */
const GLOW_A={value:1};
glowMat.onBeforeCompile=sh=>{sh.uniforms.glowA=GLOW_A;sh.fragmentShader='uniform float glowA;\n'+sh.fragmentShader.replace('#include <dithering_fragment>','#include <dithering_fragment>\ngl_FragColor.a=1.-clamp(dot(totalEmissiveRadiance,vec3(.5)),0.,1.)*glowA;');};
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
sun.shadow.mapSize.set(1024,1024);/* plenty at the game's pixel resolution */Object.assign(sun.shadow.camera,{left:-28,right:28,top:28,bottom:-28,near:1,far:110});
sun.shadow.bias=-0.0015;sun.shadow.normalBias=0.02;scene.add(sun,sun.target);

const waterMat=new T.MeshBasicMaterial({color:0x3565cc});
const s1Mat=new T.MeshBasicMaterial({color:0x7ea6e8}),s2Mat=new T.MeshBasicMaterial({color:0x5584da});
// the open sea isn't flat colour: soft darker and lighter patches, and bright ripple streaks that drift with the swell
// (the pixel pass turns them into little painted wave marks)
// how far each patch of sea is from the nearest shore, one texel per tile (built from landMap by buildDepthTex): the
// water shader uses it to fade from pale aqua at the sand, through turquoise, to deep blue, with a ragged pixel edge
const DEPTH_N=400,DEPTH_X0=-200;let depthDirty=true,depthX0=DEPTH_X0,depthZ0=DEPTH_X0;/* the window follows you out to the frontier (depthFollow) */
const depthTex=new T.DataTexture(new Uint8Array([255,255,255,255]),1,1,T.RGBAFormat);depthTex.needsUpdate=true;
const waterU={uCam:{value:new T.Vector3()},uSky:{value:skyHz},uZen:{value:skyZen},uSunD:{value:new T.Vector3(0,1,0)},uGl:{value:1},uT:{value:0},uYaw:{value:0},uDepth:{value:depthTex},uDB:{value:new T.Vector3(DEPTH_X0,DEPTH_X0,1)},uS1:{value:s1Mat.color},uS2:{value:s2Mat.color},uSt:{value:IDENT.sea||0}};
function buildDepthTex(){depthDirty=false;const N=DEPTH_N,d=new Float32Array(N*N).fill(99);
  for(const L of [landList,riverList])for(const q of L){const i=q[0]-depthX0,j=q[1]-depthZ0;if(i>=0&&j>=0&&i<N&&j<N)d[j*N+i]=0;}/* (land and rivers, 40-world) */
  // two-pass chamfer distance (rounder than steps along the grid)
  const D=1.414;for(let j=0;j<N;j++)for(let i=0;i<N;i++){let v=d[j*N+i];if(i)v=Math.min(v,d[j*N+i-1]+1);if(j){v=Math.min(v,d[(j-1)*N+i]+1);if(i)v=Math.min(v,d[(j-1)*N+i-1]+D);if(i<N-1)v=Math.min(v,d[(j-1)*N+i+1]+D);}d[j*N+i]=v;}
  for(let j=N-1;j>=0;j--)for(let i=N-1;i>=0;i--){let v=d[j*N+i];if(i<N-1)v=Math.min(v,d[j*N+i+1]+1);if(j<N-1){v=Math.min(v,d[(j+1)*N+i]+1);if(i<N-1)v=Math.min(v,d[(j+1)*N+i+1]+D);if(i)v=Math.min(v,d[(j+1)*N+i-1]+D);}d[j*N+i]=v;}
  const px=new Uint8Array(N*N*4);for(let i=0;i<N*N;i++){const v=Math.min(255,Math.round(d[i]*40));px[i*4]=px[i*4+1]=px[i*4+2]=v;px[i*4+3]=255;}
  const t=new T.DataTexture(px,N,N,T.RGBAFormat);t.magFilter=t.minFilter=T.LinearFilter;t.needsUpdate=true;
  if(waterU.uDepth.value!==depthTex)waterU.uDepth.value.dispose();waterU.uDepth.value=t;waterU.uDB.value.set(depthX0,depthZ0,N);}
function depthFollow(){const cx=depthX0+DEPTH_N/2,cz=depthZ0+DEPTH_N/2;if(Math.abs(cam.tx-cx)<110&&Math.abs(cam.tz-cz)<110)return;
  depthX0=Math.round(cam.tx/40)*40-DEPTH_N/2;depthZ0=Math.round(cam.tz/40)*40-DEPTH_N/2;if(Math.abs(depthX0-DEPTH_X0)<60&&Math.abs(depthZ0-DEPTH_X0)<60)depthX0=depthZ0=DEPTH_X0;depthDirty=true;}
waterMat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,waterU);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWp;').replace('#include <begin_vertex>','#include <begin_vertex>\nvWp=(modelMatrix*vec4(transformed,1.)).xyz;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWp;uniform float uT;uniform vec3 uCam;uniform vec3 uSky;uniform vec3 uZen;uniform vec3 uSunD;uniform float uGl;uniform sampler2D uDepth;uniform vec3 uDB;uniform vec3 uS1;uniform vec3 uS2;uniform float uSt;\nfloat h21(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}')
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
       diffuseColor.rgb+=vec3(1.,.96,.86)*(sp*.25+gl*.65)*smoothstep(1.,2.5,dd);
       // the visual identity's own seas (20b-ident): Clean, flat turquoise bands with little white wave marks; Hike, deep
       // blue drawn in slow wavy lighter lines; both with a crisp white edge of foam at the shore
       if(uSt>.5){float d2=texture2D(uDepth,(q-uDB.xy+.5)/uDB.z).r*6.375-.5+(vn(q*1.3)-.5)*.3;vec3 c;
         if(uSt<1.5){c=mix(vec3(.56,.9,.86),vec3(.15,.74,.8),smoothstep(.2,1.4,d2));c=mix(c,vec3(.07,.6,.72),smoothstep(2.5,9.,d2));
           c*=.96+.06*step(.62,vn(q*.12+vec2(uT*.01,0.)));/* big soft darker patches */
           vec2 cl=floor(q/3.5),f=fract(q/3.5)-.5;float h=h21(cl);vec2 p=f-vec2(h-.5,fract(h*7.)-.5)*.5;p.y+=sin(uT*.8+h*6.)*.02;
           float tri=step(-.05,p.y)*step(abs(p.x),.08-(p.y+.05)*.8)*step(p.y,.05);c=mix(c,vec3(.88,.97,.98),tri*step(.74,h)*smoothstep(1.5,2.5,d2));}
         else{c=mix(vec3(.26,.62,.78),vec3(.13,.34,.6),smoothstep(.3,2.8,d2));
           vec2 qa=vec2(q.x*.09+q.y*.03,q.y*.24-q.x*.05);float nn=vn(qa+vec2(uT*.015,0.))+vn(qa*2.1-vec2(0.,uT*.02))*.4;float ln=abs(fract(nn*3.4)-.5);
           c=mix(c,c*1.28+vec3(.05,.08,.1),smoothstep(.045,.02,ln)*smoothstep(.8,1.8,d2)*.8);/* (long, thin, stretched like brush strokes) */}
         c=mix(c,vec3(.95,.99,1.),smoothstep(.32,.08,d2));diffuseColor.rgb=c;}}`);};
const water=new T.Mesh(new T.PlaneGeometry(520,520,52,52).rotateX(-Math.PI/2),waterMat);water.frustumCulled=false;scene.add(water);
const TILE_PLANE=new T.PlaneGeometry(1,1).rotateX(-Math.PI/2);

const STARN=900,starGeo=new T.BufferGeometry(),sp=new Float32Array(STARN*3),ss=new Float32Array(STARN);
for(let i=0;i<STARN;i++){const a=Math.random()*6.283,e=0.08+Math.random()*1.3;sp[i*3]=Math.cos(a)*Math.cos(e)*190;sp[i*3+1]=Math.sin(e)*190;sp[i*3+2]=Math.sin(a)*Math.cos(e)*190;ss[i]=Math.random()<0.15?2:1;}
starGeo.setAttribute('position',new T.BufferAttribute(sp,3));starGeo.setAttribute('sz',new T.BufferAttribute(ss,1));
const starMat=new T.ShaderMaterial({uniforms:{op:{value:0}},transparent:true,depthWrite:false,
  vertexShader:'attribute float sz;void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=sz;}',
  fragmentShader:'uniform float op;void main(){gl_FragColor=vec4(1.,.98,.9,op);}'});
const stars=new T.Points(starGeo,starMat);stars.frustumCulled=false;scene.add(stars);

