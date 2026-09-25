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
const grassTopMat=worldMat(GRASS_TEX,0.36),pathMat=worldMat(PATH_TEX,0.42),sandMat=worldMat(SAND_TEX,0.5),cliffMat=worldMat(CLIFF_TEX,0.55);
