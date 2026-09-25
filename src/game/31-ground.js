/* =========================================================
   Ground textures — Animal Crossing-style patterns instead of geometry:
   triangle-flecked grass, pebbly dirt paths, speckled sand and layered cliff rock.
   Textures are near-white patterns that multiply each tile's colour, and they are sampled
   in world space (top-down on flat faces, side-on on cliffs) so they flow across tiles seamlessly.
   ========================================================= */
function patternTex(size,draw){const cv=document.createElement('canvas');cv.width=cv.height=size;const g=cv.getContext('2d');draw(g,size,mulberry(size*7+draw.length));
  const t=new T.CanvasTexture(cv);t.wrapS=t.wrapT=T.RepeatWrapping;t.magFilter=T.NearestFilter;t.minFilter=T.LinearMipmapLinearFilter;return t;}
const shade=v=>`rgb(${v},${v},${v})`;
const GRASS_TEX=patternTex(64,(g,n,R)=>{g.fillStyle=shade(236);g.fillRect(0,0,n,n);
  for(let cy=0;cy<8;cy++)for(let cx=0;cx<8;cx++){if(R()<0.18)continue;const x=cx*8+2+R()*4,y=cy*8+2+R()*4,s=2.2+R()*1.6,up=R()<0.5?1:-1;
    g.fillStyle=R()<0.78?shade(196):shade(255);g.beginPath();g.moveTo(x,y-s*up);g.lineTo(x-s,y+s*0.8*up);g.lineTo(x+s,y+s*0.8*up);g.closePath();g.fill();}});
const PATH_TEX=patternTex(64,(g,n,R)=>{g.fillStyle=shade(238);g.fillRect(0,0,n,n);
  for(let i=0;i<70;i++){const x=R()*n,y=R()*n,r=1+R()*3.2;g.fillStyle=R()<0.55?shade(214):shade(250);g.beginPath();g.arc(x,y,r,0,6.283);g.fill();if(x<r*2||y<r*2){g.beginPath();g.arc(x+n,y+n,r,0,6.283);g.fill();}}});
const SAND_TEX=patternTex(64,(g,n,R)=>{g.fillStyle=shade(244);g.fillRect(0,0,n,n);for(let i=0;i<140;i++){g.fillStyle=R()<0.7?shade(222):shade(255);g.fillRect(Math.floor(R()*n),Math.floor(R()*n),1+(R()<0.2),1);}});
const CLIFF_TEX=patternTex(64,(g,n,R)=>{g.fillStyle=shade(238);g.fillRect(0,0,n,n);
  for(let y=0;y<n;y+=8){g.fillStyle=shade(206);g.fillRect(0,y,n,1);let x=R()*10;while(x<n){g.fillRect(Math.floor(x),y,1,8);x+=10+R()*14;}}
  for(let i=0;i<40;i++){g.fillStyle=shade(222);g.fillRect(Math.floor(R()*n),Math.floor(R()*n),2,1);}});
// a toon material whose map is sampled by world position (triplanar-lite: top-down or side-on by face normal)
function worldMat(tex,scale){const m=toon({color:0xffffff,map:tex});
  m.onBeforeCompile=sh=>{sh.uniforms.uWS={value:scale};
    sh.vertexShader='varying vec3 vWP;varying vec3 vWN;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
    vec4 wp_=vec4(transformed,1.);vec3 wn_=objectNormal;
    #ifdef USE_INSTANCING
    wp_=instanceMatrix*wp_;wn_=mat3(instanceMatrix)*wn_;
    #endif
    vWP=(modelMatrix*wp_).xyz;vWN=normalize(mat3(modelMatrix)*wn_);`);
    sh.fragmentShader='uniform float uWS;varying vec3 vWP;varying vec3 vWN;\n'+sh.fragmentShader.replace('#include <map_fragment>',
      'vec3 an_=abs(vWN);vec2 wuv_=an_.y>0.6?vWP.xz:(an_.x>an_.z?vec2(vWP.z,vWP.y):vWP.xy);vec4 texelColor=texture2D(map,wuv_*uWS);diffuseColor*=texelColor;');};
  return m;}
/* ---- dirt paths, painted into the grass ----
   The path tiles are rasterised into a soft mask (PATH_RES texels per tile, then blurred) that the grass shader samples
   with a gentle wobble and noise. Edges curve and fray like worn trails, and corners round off, instead of
   following tile squares. Gameplay still treats paths as whole tiles (TOWN.path). */
const PATH_RES=4;
const NOISE_TEX=(()=>{const n=32,R=mulberry(91),d=new Uint8Array(n*n*4);for(let i=0;i<n*n;i++){const v=Math.floor(R()*256);d[i*4]=d[i*4+1]=d[i*4+2]=v;d[i*4+3]=255;}
  const t=new T.DataTexture(d,n,n,T.RGBAFormat);t.wrapS=t.wrapT=T.RepeatWrapping;t.magFilter=t.minFilter=T.LinearFilter;t.needsUpdate=true;return t;})();
const EMPTY_MASK=(()=>{const t=new T.DataTexture(new Uint8Array(4),1,1,T.RGBAFormat);t.needsUpdate=true;return t;})();
const pathU={uPM:{value:EMPTY_MASK},uPMo:{value:new T.Vector4(0,0,1,1)},uPTex:{value:PATH_TEX},uNoise:{value:NOISE_TEX}};
function boxBlur(a,W,H,r){const t=new Float32Array(a.length),n=r*2+1;
  for(let y=0;y<H;y++){let s=0;for(let x=-r;x<=r;x++)s+=a[y*W+clamp(x,0,W-1)];for(let x=0;x<W;x++){t[y*W+x]=s/n;s+=a[y*W+Math.min(W-1,x+r+1)]-a[y*W+Math.max(0,x-r)];}}
  for(let x=0;x<W;x++){let s=0;for(let y=-r;y<=r;y++)s+=t[clamp(y,0,H-1)*W+x];for(let y=0;y<H;y++){a[y*W+x]=s/n;s+=t[Math.min(H-1,y+r+1)*W+x]-t[Math.max(0,y-r)*W+x];}}}
function setPathMask(tiles){
  if(pathU.uPM.value!==EMPTY_MASK)pathU.uPM.value.dispose();pathU.uPM.value=EMPTY_MASK;if(!tiles.size)return;
  let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;const list=[];for(const [k,v] of tiles){const [x,z]=k.split(',').map(Number);list.push([x,z,v]);x0=Math.min(x0,x);z0=Math.min(z0,z);x1=Math.max(x1,x);z1=Math.max(z1,z);}
  const pad=2;x0-=pad;z0-=pad;x1+=pad;z1+=pad;const W=(x1-x0+1)*PATH_RES,H=(z1-z0+1)*PATH_RES,a=new Float32Array(W*H),b=new Float32Array(W*H);
  for(const [x,z,v] of list)for(let j=0;j<PATH_RES;j++)for(let i=0;i<PATH_RES;i++){const o=((z-z0)*PATH_RES+j)*W+(x-x0)*PATH_RES+i;a[o]=1;if(v===2)b[o]=1;}
  boxBlur(a,W,H,2);boxBlur(a,W,H,1);boxBlur(b,W,H,2);
  const d=new Uint8Array(W*H*4);for(let i=0;i<W*H;i++){d[i*4]=Math.round(a[i]*255);d[i*4+1]=Math.round(b[i]*255);d[i*4+3]=255;}
  const t=new T.DataTexture(d,W,H,T.RGBAFormat);t.magFilter=t.minFilter=T.LinearFilter;t.needsUpdate=true;
  pathU.uPM.value=t;pathU.uPMo.value.set(x0-0.5,z0-0.5,1/(x1-x0+1),1/(z1-z0+1));}
function pathGrassMat(){const m=worldMat(GRASS_TEX,0.36),base=m.onBeforeCompile;
  m.onBeforeCompile=function(sh){base(sh);Object.assign(sh.uniforms,pathU);
    sh.fragmentShader='uniform sampler2D uPM;uniform vec4 uPMo;uniform sampler2D uPTex;uniform sampler2D uNoise;\n'+sh.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    if(an_.y>0.6){vec2 q_=vWP.xz;vec2 wob_=vec2(sin(q_.y*1.3+sin(q_.x*0.7)*1.6),sin(q_.x*1.1+cos(q_.y*0.6)*1.6))*0.13;
      vec4 pm_=texture2D(uPM,(q_+wob_-uPMo.xy)*uPMo.zw);
      if(pm_.r>0.004){float m_=pm_.r+(texture2D(uNoise,q_*0.6).r-0.5)*0.24;float e_=step(0.46,m_);
        vec3 pc_=mix(vec3(0.80,0.643,0.416),vec3(0.847,0.714,0.502),clamp(pm_.g/max(pm_.r,0.01),0.,1.))*texture2D(uPTex,q_*0.42).rgb;
        float rim_=smoothstep(0.3,0.46,m_)*(1.-e_);diffuseColor.rgb=mix(diffuseColor.rgb*(1.-rim_*0.16),pc_,e_);}}`);};
  return m;}
// sand whose top follows per-instance corner heights (aCH, world y) instead of the flat tile top
function beachMat(){const m=worldMat(SAND_TEX,0.5),base=m.onBeforeCompile;
  m.onBeforeCompile=function(sh){base(sh);sh.vertexShader='attribute vec4 aCH;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
    #ifdef USE_INSTANCING
    if(transformed.y>0.99&&aCH.x+aCH.y+aCH.z+aCH.w>0.){float u_=clamp(transformed.x+0.5,0.,1.),v_=clamp(transformed.z+0.5,0.,1.);
      transformed.y=(mix(mix(aCH.x,aCH.y,u_),mix(aCH.w,aCH.z,u_),v_)+0.6)/instanceMatrix[1][1];}
    #endif`);};
  return m;}
const grassTopMat=pathGrassMat(),sandMat=beachMat(),cliffMat=worldMat(CLIFF_TEX,0.55);
