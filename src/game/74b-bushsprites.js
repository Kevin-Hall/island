/* =========================================================
   Pixel-art bushes. The wild island's bushes are drawn, not modelled: each variety is painted pixel by pixel onto a small
   canvas (a leafy silhouette with a jagged fringe, clusters of little pointed leaves, a lit top-left, a dark underside and
   a dark outline, like hand-made 16-bit shrubs), then stood in the world as a camera-facing sprite. Sprites sway in the
   wind, take on the light of the time of day, get a crisp outline from the pixel pass, and flip left/right at random.
   Varieties (the bush's v): 0 a spiky, fluffy shrub; 1 a round dome of drooping leaves, flowering in spring and summer;
   2 a berry bush. Each season has its own palette (and snow in winter).
   ========================================================= */
const BUSH_PAL={spring:['#1e3a24','#2f6234','#48903e','#6cb44c','#a6dc6a'],summer:['#1a3424','#2a5a32','#3e8238','#5ea846','#8fcc5c'],
  autumn:['#3a2418','#7a3e1e','#b4602a','#dc8e38','#f4c05a'],winter:['#1e3030','#2e4e48','#46705e','#6a9478','#9cbc9c']};
const BS_W=42,BS_H=40;
function bushCanvas(v,season){const cv=document.createElement('canvas');cv.width=BS_W;cv.height=BS_H;const cx=cv.getContext('2d'),img=cx.createImageData(BS_W,BS_H),D=img.data;
  const R=mulberry(hi(v,season.length,41)),pal=(season==='autumn'&&v===0?['#1e3424','#4a5e24','#7a8a2e','#a8ae3a','#d4c85a']:BUSH_PAL[season]).map(h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]);
  const idx=new Int8Array(BS_W*BS_H).fill(-1),at=(x,y)=>x<0||y<0||x>=BS_W||y>=BS_H?-1:idx[y*BS_W+x];
  const cxm=BS_W/2-0.5,cym=BS_H*0.52,rx=BS_W*0.45,ry=BS_H*0.45;
  // the silhouette: a dome, flat-ish at the bottom; the spiky variety gets a fringe of pointed leaf tips all round
  const teeth=[];for(let i=0;i<40;i++)teeth.push(0.7+R()*0.6);
  const inside=(x,y)=>{const dx=(x-cxm)/rx,dy=(y-cym)/ry;if(dy>0.9)return false;const a=Math.atan2(dy,dx),r=Math.hypot(dx,dy);
    let lim=1;if(v===0){const t=(a+Math.PI)/(2*Math.PI)*40,i=Math.floor(t),f=t-i;lim=0.84+0.22*teeth[i%40]*(1-Math.abs(f-0.5)*2);}
    else lim=0.97+0.03*Math.sin(a*9+v);return r<=lim;};
  const tone=(x,y)=>{const dx=(x-cxm)/rx,dy=(y-cym)/ry;return 0.5-dy*0.6-dx*0.3-(dy>0.5?0.2:0);}; // light from the upper left, dark underneath
  const q=b=>Math.max(1,Math.min(4,Math.round(1+b*3)));
  // a dark leafy mass first...
  for(let y=0;y<BS_H;y++)for(let x=0;x<BS_W;x++)if(inside(x,y))idx[y*BS_W+x]=Math.max(1,q(tone(x,y))-1);
  // ...then leaves stamped over it from the top down, so each row overlaps the one above: every leaf is lit along its top
  // edge, mid-toned in its body and darkest at its tip. The fluffy variety uses long, narrow, pointed leaves
  const LEAF=v===0?['..2..','.212.','.212.','21112','.111.','.101.','..0..']:['...2...','..212..','.21112.','2111112','.11111.','..111..','..101..','...0...'];
  const lw=LEAF[0].length,lh=LEAF.length,stepX=v===0?4:6,stepY=v===0?4:5;
  for(let y=-2,r=0;y<BS_H;y+=stepY,r++)for(let x=-2+(r%2)*Math.floor(stepX/2);x<BS_W;x+=stepX){const jx=x+(v===0?Math.floor(R()*2):0),jy=y,base=q(tone(jx+Math.floor(lw/2),jy+2));
    for(let a=0;a<lh;a++)for(let c=0;c<lw;c++){const ch=LEAF[a][c];if(ch==='.')continue;const px=jx+c,py=jy+a;if(at(px,py)<0)continue;
      idx[py*BS_W+px]=Math.max(1,Math.min(4,base+(ch==='2'?1:ch==='0'?-1:0)));}}
  if(v===0)for(let k=0;k<5;k++){const x=Math.floor(R()*BS_W),y=Math.floor(R()*BS_H*0.6);if(at(x,y)>0&&at(x,y+1)>0){idx[y*BS_W+x]=4;idx[(y+1)*BS_W+x]=3;}} // bright stray leaf tips
  // outline: any leaf pixel touching the outside goes darkest
  const out=[];for(let y=0;y<BS_H;y++)for(let x=0;x<BS_W;x++)if(at(x,y)>=0&&[[1,0],[-1,0],[0,1],[0,-1]].some(([a,c])=>at(x+a,y+c)<0))out.push(y*BS_W+x);for(const i of out)idx[i]=0;
  for(let i=0;i<idx.length;i++){if(idx[i]<0)continue;const c=pal[idx[i]];D[i*4]=c[0];D[i*4+1]=c[1];D[i*4+2]=c[2];D[i*4+3]=255;}
  const dot=(x,y,col,s=2)=>{for(let a=0;a<s;a++)for(let c=0;c<s;c++){const px=x+a,py=y+c;if(at(px,py)<1)continue;const i=(py*BS_W+px)*4;D[i]=col[0];D[i+1]=col[1];D[i+2]=col[2];}};
  const spots=(n,cols,s,yMax=0.6)=>{for(let k=0;k<n;k++){for(let t=0;t<20;t++){const x=Math.floor(R()*BS_W),y=Math.floor(R()*BS_H);if(at(x,y)<2||at(x+1,y+1)<1||(y-cym)/ry>yMax)continue;dot(x,y,cols[k%cols.length],s);break;}}};
  if(season==='winter')for(let y=0;y<BS_H;y++)for(let x=0;x<BS_W;x++){const i=y*BS_W+x;if(idx[i]<1)continue;if(at(x,y-2)<0||at(x,y-1)<0||(at(x,y-3)<0&&R()<0.5)){D[i*4]=240;D[i*4+1]=246;D[i*4+2]=250;}}
  else if(v===1&&season==='spring')spots(8,[[250,176,204],[255,255,255],[246,150,190]],2);
  else if(v===1&&season==='summer')spots(6,[[140,170,245],[180,150,235],[120,190,245]],3);
  else if(v===2&&season!=='autumn')spots(9,[[220,52,64],[180,36,52]],2);
  else if(v===2)spots(8,[[110,60,150],[80,40,120]],2);
  cx.putImageData(img,0,0);return cv;}
// one quad per bush, standing on the ground; the shader turns it to face the camera
const BUSH_QUAD=new T.PlaneGeometry(1,BS_H/BS_W).translate(0,BS_H/BS_W/2,0);
const bushSpriteU={uT:leafU.uT,uWind:leafU.uWind,uTint:{value:new T.Color(1,1,1)}},bushSpriteMats={};
function bushSpriteMat(v){const k=season()+v;if(bushSpriteMats[k])return bushSpriteMats[k];
  const tex=new T.CanvasTexture(bushCanvas(v,season()));tex.magFilter=tex.minFilter=T.NearestFilter;tex.generateMipmaps=false;
  const m=new T.ShaderMaterial({uniforms:Object.assign({map:{value:tex}},bushSpriteU),
    vertexShader:`uniform float uT;uniform float uWind;varying vec2 vUv;
      void main(){vUv=uv;mat4 im=modelMatrix*instanceMatrix;vec4 c=im*vec4(0.,0.,0.,1.);float s=length(im[0].xyz)*1.2;
        vec2 d=c.xz-cameraPosition.xz;c.y-=dot(d,d)*${CURVE.toFixed(6)};
        float flip=fract(sin(dot(c.xz,vec2(12.9898,78.233)))*43758.5453)<.5?-1.:1.;
        vec4 mv=viewMatrix*c;vec2 q=position.xy;q.x*=flip;q.x+=sin(uT*1.7+c.x*.8+c.z*.5)*.035*q.y*uWind;
        mv.xy+=q*s;gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`uniform sampler2D map;uniform vec3 uTint;varying vec2 vUv;void main(){vec4 t=texture2D(map,vUv);if(t.a<.5)discard;gl_FragColor=vec4(t.rgb*uTint,1.);}`});
  return bushSpriteMats[k]=m;}
function bushSpritesReset(){for(const k in bushSpriteMats){bushSpriteMats[k].uniforms.map.value.dispose();bushSpriteMats[k].dispose();delete bushSpriteMats[k];}}
// the sprites take on the light: a blend of the sky and sun colours and strengths (applyTime calls this)
function bushSpriteLight(){const t=bushSpriteU.uTint.value;t.copy(hemi.color).multiplyScalar(hemi.intensity*0.72);_c.copy(sun.color).multiplyScalar(sun.intensity*0.56);t.add(_c);t.r=Math.min(1.08,t.r);t.g=Math.min(1.08,t.g);t.b=Math.min(1.08,t.b);}
